/**
 * WebSocket Server для Lost Ark Raid Manager
 * Реальное время для чата, уведомлений и синхронизации
 */

const WebSocket = require('ws');
const http = require('http');
const url = require('url');
const jwt = require('jsonwebtoken');
const DatabaseFactory = require('./database/database-factory');
const config = require('./config/database.config');

class WebSocketServer {
    constructor(port = 8080) {
        this.port = port;
        this.clients = new Map(); // clientId -> { ws, user, rooms }
        this.rooms = new Map(); // roomId -> Set of clientIds
        this.messageHistory = new Map(); // roomId -> Array of messages
        this.server = null;
        this.wss = null;
        this.database = null;
        
        this.init();
    }

    async init() {
        try {
            // Инициализируем базу данных
            this.database = await DatabaseFactory.createDatabase(config.type, config.getConfig());
            console.log('WebSocket: База данных инициализирована');
            
            // Загружаем существующие каналы и сообщения
            await this.loadExistingData();
            
        } catch (error) {
            console.error('WebSocket: Ошибка инициализации БД:', error);
            console.log('WebSocket: Работаем без базы данных');
        }

        // Создаем HTTP сервер
        this.server = http.createServer();
        
        // Создаем WebSocket сервер
        this.wss = new WebSocket.Server({ 
            server: this.server,
            verifyClient: this.verifyClient.bind(this)
        });

        this.setupEventHandlers();
        this.start();
    }

    async loadExistingData() {
        try {
            if (!this.database) return;

            // Загружаем существующие каналы
            const channels = await this.database.getAllChannels();
            for (const channel of channels) {
                this.rooms.set(channel.id.toString(), new Set());
                this.messageHistory.set(channel.id.toString(), []);
                console.log(`WebSocket: Загружен канал: ${channel.name}`);
            }

            // Загружаем последние сообщения для каждого канала
            for (const channelId of this.rooms.keys()) {
                const messages = await this.database.getChannelMessages(parseInt(channelId), 50);
                this.messageHistory.set(channelId, messages);
            }

            console.log('WebSocket: Существующие данные загружены');
        } catch (error) {
            console.error('WebSocket: Ошибка загрузки данных:', error);
        }
    }

    verifyClient(info) {
        // Простая верификация (в продакшене использовать JWT)
        const token = url.parse(info.req.url, true).query.token;
        if (!token) {
            console.log('Client rejected: No token');
            return false;
        }
        
        try {
            // В продакшене проверять JWT
            const user = this.decodeToken(token);
            info.req.user = user;
            return true;
        } catch (error) {
            console.log('Client rejected: Invalid token');
            return false;
        }
    }

    decodeToken(token) {
        // Простая декодировка для демо
        // В продакшене использовать JWT.verify
        try {
            const decoded = Buffer.from(token, 'base64').toString();
            return JSON.parse(decoded);
        } catch {
            return { id: 'anonymous', name: 'Anonymous' };
        }
    }

    setupEventHandlers() {
        this.wss.on('connection', (ws, req) => {
            this.handleConnection(ws, req);
        });
    }

    handleConnection(ws, req) {
        const user = req.user;
        const clientId = this.generateClientId();
        
        // Сохраняем информацию о клиенте
        this.clients.set(clientId, {
            ws,
            user,
            rooms: new Set(),
            lastActivity: Date.now()
        });

        console.log(`Client connected: ${user.name} (${clientId})`);

        // Отправляем приветственное сообщение
        this.sendToClient(clientId, {
            type: 'welcome',
            data: {
                message: `Добро пожаловать, ${user.name}!`,
                userId: user.id,
                clientId: clientId
            }
        });

        // Обработка сообщений от клиента
        ws.on('message', (data) => {
            try {
                const message = JSON.parse(data);
                this.handleMessage(clientId, message);
            } catch (error) {
                console.error('Error parsing message:', error);
                this.sendToClient(clientId, {
                    type: 'error',
                    data: { message: 'Invalid message format' }
                });
            }
        });

        // Обработка отключения клиента
        ws.on('close', () => {
            this.handleDisconnection(clientId);
        });

        // Обработка ошибок
        ws.on('error', (error) => {
            console.error(`WebSocket error for client ${clientId}:`, error);
            this.handleDisconnection(clientId);
        });

        // Ping/Pong для поддержания соединения
        ws.on('pong', () => {
            const client = this.clients.get(clientId);
            if (client) {
                client.lastActivity = Date.now();
            }
        });
    }

    async handleMessage(clientId, message) {
        const client = this.clients.get(clientId);
        if (!client) return;

        console.log(`Message from ${client.user.name}:`, message.type);

        try {
            switch (message.type) {
                case 'join_room':
                    await this.handleJoinRoom(clientId, message.data);
                    break;
                case 'leave_room':
                    await this.handleLeaveRoom(clientId, message.data);
                    break;
                case 'chat_message':
                    await this.handleChatMessage(clientId, message.data);
                    break;
                case 'typing_start':
                    await this.handleTypingStart(clientId, message.data);
                    break;
                case 'typing_stop':
                    await this.handleTypingStop(clientId, message.data);
                    break;
                case 'raid_update':
                    await this.handleRaidUpdate(clientId, message.data);
                    break;
                case 'notification':
                    await this.handleNotification(clientId, message.data);
                    break;
                case 'ping':
                    this.sendToClient(clientId, { type: 'pong', data: { timestamp: Date.now() } });
                    break;
                default:
                    console.log(`Unknown message type: ${message.type}`);
            }
        } catch (error) {
            console.error('WebSocket: Ошибка обработки сообщения:', error);
            this.sendToClient(clientId, message.type, {
                type: 'error',
                data: { message: 'Ошибка обработки сообщения' }
            });
        }
    }

    async handleJoinRoom(clientId, data) {
        const { roomId, roomType } = data;
        const client = this.clients.get(clientId);
        
        if (!client) return;

        // Создаем комнату если не существует
        if (!this.rooms.has(roomId)) {
            this.rooms.set(roomId, new Set());
            this.messageHistory.set(roomId, []);
            
            // Создаем канал в базе данных
            if (this.database) {
                try {
                    await this.database.createChannel({
                        name: `Канал ${roomId}`,
                        type: roomType || 'public',
                        createdBy: parseInt(client.user.id)
                    });
                    console.log(`WebSocket: Канал создан в БД: ${roomId}`);
                } catch (error) {
                    console.error('WebSocket: Ошибка создания канала в БД:', error);
                }
            }
        }

        // Добавляем клиента в комнату
        this.rooms.get(roomId).add(clientId);
        client.rooms.add(roomId);

        // Отправляем историю сообщений
        const history = this.messageHistory.get(roomId) || [];
        this.sendToClient(clientId, {
            type: 'room_history',
            data: { roomId, messages: history.slice(-50) } // Последние 50 сообщений
        });

        // Уведомляем других участников
        this.broadcastToRoom(roomId, {
            type: 'user_joined',
            data: {
                roomId,
                user: client.user,
                timestamp: Date.now()
            }
        }, [clientId]);

        console.log(`${client.user.name} joined room ${roomId}`);
    }

    handleLeaveRoom(clientId, data) {
        const { roomId } = data;
        const client = this.clients.get(clientId);
        
        if (!client) return;

        // Удаляем клиента из комнаты
        if (this.rooms.has(roomId)) {
            this.rooms.get(roomId).delete(clientId);
            client.rooms.delete(roomId);

            // Уведомляем других участников
            this.broadcastToRoom(roomId, {
                type: 'user_left',
                data: {
                    roomId,
                    user: client.user,
                    timestamp: Date.now()
                }
            }, [clientId]);

            console.log(`${client.user.name} left room ${roomId}`);
        }
    }

    async handleChatMessage(clientId, data) {
        const { roomId, text, messageType = 'text' } = data;
        const client = this.clients.get(clientId);
        
        if (!client || !this.rooms.has(roomId)) return;

        const message = {
            id: this.generateMessageId(),
            roomId,
            userId: client.user.id,
            userName: client.user.name,
            text,
            type: messageType,
            timestamp: Date.now()
        };

        // Сохраняем сообщение в базе данных
        if (this.database) {
            try {
                await this.database.saveMessage({
                    channelId: parseInt(roomId),
                    userId: parseInt(client.user.id),
                    message: text,
                    messageType: messageType,
                    metadata: {
                        userName: client.user.name,
                        timestamp: message.timestamp
                    }
                });
                console.log(`WebSocket: Сообщение сохранено в БД`);
            } catch (error) {
                console.error('WebSocket: Ошибка сохранения сообщения в БД:', error);
            }
        }

        // Сохраняем сообщение в истории
        if (!this.messageHistory.has(roomId)) {
            this.messageHistory.set(roomId, []);
        }
        this.messageHistory.get(roomId).push(message);

        // Ограничиваем историю (максимум 1000 сообщений)
        if (this.messageHistory.get(roomId).length > 1000) {
            this.messageHistory.get(roomId).shift();
        }

        // Отправляем сообщение всем участникам комнаты
        this.broadcastToRoom(roomId, {
            type: 'chat_message',
            data: message
        });

        console.log(`Message in room ${roomId}: ${client.user.name}: ${text}`);
    }

    handleTypingStart(clientId, data) {
        const { roomId } = data;
        const client = this.clients.get(clientId);
        
        if (!client || !this.rooms.has(roomId)) return;

        this.broadcastToRoom(roomId, {
            type: 'typing_start',
            data: {
                roomId,
                user: client.user,
                timestamp: Date.now()
            }
        }, [clientId]);
    }

    handleTypingStop(clientId, data) {
        const { roomId } = data;
        const client = this.clients.get(clientId);
        
        if (!client || !this.rooms.has(roomId)) return;

        this.broadcastToRoom(roomId, {
            type: 'typing_stop',
            data: {
                roomId,
                user: client.user,
                timestamp: Date.now()
            }
        }, [clientId]);
    }

    async handleRaidUpdate(clientId, data) {
        const { raidId, action, raidData } = data;
        const client = this.clients.get(clientId);
        
        if (!client) return;

        // Логируем действие в базе данных
        if (this.database) {
            try {
                await this.database.logRaidAction(
                    parseInt(raidId),
                    parseInt(client.user.id),
                    action,
                    {
                        raidData,
                        timestamp: Date.now()
                    }
                );
                console.log(`WebSocket: Действие с рейдом залогировано в БД`);
            } catch (error) {
                console.error('WebSocket: Ошибка логирования действия с рейдом:', error);
            }
        }

        // Отправляем обновление всем клиентам
        this.broadcastToAll({
            type: 'raid_update',
            data: {
                raidId,
                action,
                raidData,
                user: client.user,
                timestamp: Date.now()
            }
        });

        console.log(`Raid update: ${action} by ${client.user.name}`);
    }

    async handleNotification(clientId, data) {
        const { targetUsers, message, type = 'info' } = data;
        const client = this.clients.get(clientId);
        
        if (!client) return;

        const notification = {
            id: this.generateMessageId(),
            message,
            type,
            from: client.user,
            timestamp: Date.now()
        };

        // Сохраняем уведомление в базе данных
        if (this.database && targetUsers && targetUsers.length > 0) {
            try {
                for (const userId of targetUsers) {
                    await this.database.createNotification(
                        parseInt(userId),
                        'Уведомление',
                        message,
                        type,
                        {
                            from: client.user.name,
                            timestamp: notification.timestamp
                        }
                    );
                }
                console.log(`WebSocket: Уведомления сохранены в БД`);
            } catch (error) {
                console.error('WebSocket: Ошибка сохранения уведомлений в БД:', error);
            }
        }

        if (targetUsers && targetUsers.length > 0) {
            // Отправляем конкретным пользователям
            targetUsers.forEach(userId => {
                const targetClient = this.findClientByUserId(userId);
                if (targetClient) {
                    this.sendToClient(targetClient.clientId, {
                        type: 'notification',
                        data: notification
                    });
                }
            });
        } else {
            // Отправляем всем
            this.broadcastToAll({
                type: 'notification',
                data: notification
            });
        }

        console.log(`Notification sent: ${message}`);
    }

    sendToClient(clientId, message) {
        const client = this.clients.get(clientId);
        if (!client || client.ws.readyState !== WebSocket.OPEN) return;

        try {
            client.ws.send(JSON.stringify(message));
        } catch (error) {
            console.error(`Error sending message to client ${clientId}:`, error);
        }
    }

    broadcastToRoom(roomId, message, excludeClientIds = []) {
        if (!this.rooms.has(roomId)) return;

        this.rooms.get(roomId).forEach(clientId => {
            if (!excludeClientIds.includes(clientId)) {
                this.sendToClient(clientId, message);
            }
        });
    }

    broadcastToAll(message, excludeClientIds = []) {
        this.clients.forEach((client, clientId) => {
            if (!excludeClientIds.includes(clientId)) {
                this.sendToClient(clientId, message);
            }
        });
    }

    findClientByUserId(userId) {
        for (const [clientId, client] of this.clients) {
            if (client.user.id === userId) {
                return { clientId, ...client };
            }
        }
        return null;
    }

    generateClientId() {
        return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    generateMessageId() {
        return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    handleDisconnection(clientId) {
        const client = this.clients.get(clientId);
        if (!client) return;

        console.log(`Client disconnected: ${client.user.name} (${clientId})`);

        // Удаляем клиента из всех комнат
        client.rooms.forEach(roomId => {
            if (this.rooms.has(roomId)) {
                this.rooms.get(roomId).delete(clientId);
                
                // Уведомляем других участников
                this.broadcastToRoom(roomId, {
                    type: 'user_left',
                    data: {
                        roomId,
                        user: client.user,
                        timestamp: Date.now()
                    }
                });
            }
        });

        // Удаляем клиента
        this.clients.delete(clientId);
    }

    start() {
        this.server.listen(this.port, () => {
            console.log(`🚀 WebSocket Server запущен на порту ${this.port}`);
            console.log(`📡 Готов к WebSocket соединениям`);
        });
    }

    stop() {
        if (this.wss) {
            this.wss.close();
        }
        if (this.server) {
            this.server.close();
        }
        console.log('WebSocket Server остановлен');
    }

    getStats() {
        return {
            totalClients: this.clients.size,
            totalRooms: this.rooms.size,
            uptime: process.uptime(),
            memory: process.memoryUsage()
        };
    }

    // Очистка неактивных соединений
    cleanupInactiveConnections() {
        const now = Date.now();
        const timeout = 5 * 60 * 1000; // 5 минут

        this.clients.forEach((client, clientId) => {
            if (now - client.lastActivity > timeout) {
                console.log(`Cleaning up inactive client: ${client.user.name}`);
                client.ws.close();
            }
        });
    }
}

// Запуск сервера
if (require.main === module) {
    const port = process.env.WS_PORT || 8080;
    const wsServer = new WebSocketServer(port);

    // Graceful shutdown
    process.on('SIGTERM', () => {
        console.log('SIGTERM received, shutting down WebSocket server');
        wsServer.stop();
        process.exit(0);
    });

    process.on('SIGINT', () => {
        console.log('SIGINT received, shutting down WebSocket server');
        wsServer.stop();
        process.exit(0);
    });

    // Очистка каждые 5 минут
    setInterval(() => {
        wsServer.cleanupInactiveConnections();
    }, 5 * 60 * 1000);
}

module.exports = WebSocketServer;