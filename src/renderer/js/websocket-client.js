/**
 * WebSocket Client для Lost Ark Raid Manager
 * Интеграция с WebSocket сервером для реального времени
 */

class WebSocketClient {
    constructor(serverUrl = 'ws://localhost:8080') {
        this.serverUrl = serverUrl;
        this.ws = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.messageQueue = [];
        this.eventHandlers = new Map();
        this.rooms = new Set();
        this.user = null;
        this.clientId = null;
        
        this.init();
    }

    init() {
        this.setupDefaultHandlers();
        this.connect();
    }

    setupDefaultHandlers() {
        // Обработчик приветствия
        this.on('welcome', (data) => {
            this.clientId = data.clientId;
            this.user = { id: data.userId, name: data.userName };
            console.log('WebSocket: Приветствие получено:', data.message);
            
            // Уведомляем другие модули
            this.notifyModules('welcome', data);
        });

        // Обработчик сообщений чата
        this.on('chat_message', (message) => {
            console.log('WebSocket: Новое сообщение:', message);
            this.notifyModules('chat_message', message);
        });

        // Обработчик истории комнаты
        this.on('room_history', (data) => {
            console.log('WebSocket: История комнаты загружена:', data.messages.length, 'сообщений');
            this.notifyModules('room_history', data);
        });

        // Обработчик присоединения пользователя
        this.on('user_joined', (data) => {
            console.log('WebSocket: Пользователь присоединился:', data.user.name);
            this.notifyModules('user_joined', data);
        });

        // Обработчик выхода пользователя
        this.on('user_left', (data) => {
            console.log('WebSocket: Пользователь покинул:', data.user.name);
            this.notifyModules('user_left', data);
        });

        // Обработчик начала печати
        this.on('typing_start', (data) => {
            this.notifyModules('typing_start', data);
        });

        // Обработчик окончания печати
        this.on('typing_stop', (data) => {
            this.notifyModules('typing_stop', data);
        });

        // Обработчик обновлений рейдов
        this.on('raid_update', (data) => {
            console.log('WebSocket: Обновление рейда:', data.action);
            this.notifyModules('raid_update', data);
        });

        // Обработчик уведомлений
        this.on('notification', (notification) => {
            console.log('WebSocket: Уведомление:', notification.message);
            this.notifyModules('notification', notification);
        });

        // Обработчик ошибок
        this.on('error', (error) => {
            console.error('WebSocket: Ошибка:', error.message);
            this.notifyModules('error', error);
        });

        // Обработчик pong
        this.on('pong', (data) => {
            // Обновляем время последней активности
            this.lastPong = Date.now();
        });
    }

    connect() {
        try {
            // Создаем токен для аутентификации
            const token = this.createAuthToken();
            const url = `${this.serverUrl}?token=${token}`;
            
            this.ws = new WebSocket(url);
            
            this.ws.onopen = () => {
                console.log('WebSocket: Соединение установлено');
                this.isConnected = true;
                this.reconnectAttempts = 0;
                
                // Отправляем очередь сообщений
                this.processMessageQueue();
                
                // Запускаем ping для поддержания соединения
                this.startPing();
                
                this.notifyModules('connected', {});
            };

            this.ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    this.handleMessage(message);
                } catch (error) {
                    console.error('WebSocket: Ошибка парсинга сообщения:', error);
                }
            };

            this.ws.onclose = (event) => {
                console.log('WebSocket: Соединение закрыто:', event.code, event.reason);
                this.isConnected = false;
                this.stopPing();
                
                this.notifyModules('disconnected', { code: event.code, reason: event.reason });
                
                // Попытка переподключения
                if (this.reconnectAttempts < this.maxReconnectAttempts) {
                    this.scheduleReconnect();
                }
            };

            this.ws.onerror = (error) => {
                console.error('WebSocket: Ошибка соединения:', error);
                this.notifyModules('error', { message: 'Connection error' });
            };

        } catch (error) {
            console.error('WebSocket: Ошибка создания соединения:', error);
        }
    }

    createAuthToken() {
        // Создаем простой токен для демо
        // В продакшене использовать JWT
        const userData = {
            id: 'user_' + Date.now(),
            name: 'Player' + Math.floor(Math.random() * 1000)
        };
        
        return Buffer.from(JSON.stringify(userData)).toString('base64');
    }

    handleMessage(message) {
        const { type, data } = message;
        
        if (this.eventHandlers.has(type)) {
            this.eventHandlers.get(type).forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    console.error(`WebSocket: Ошибка в обработчике ${type}:`, error);
                }
            });
        }
    }

    send(type, data) {
        const message = { type, data };
        
        if (this.isConnected && this.ws.readyState === WebSocket.OPEN) {
            try {
                this.ws.send(JSON.stringify(message));
            } catch (error) {
                console.error('WebSocket: Ошибка отправки:', error);
                this.messageQueue.push(message);
            }
        } else {
            // Добавляем в очередь если не подключены
            this.messageQueue.push(message);
        }
    }

    processMessageQueue() {
        while (this.messageQueue.length > 0) {
            const message = this.messageQueue.shift();
            try {
                this.ws.send(JSON.stringify(message));
            } catch (error) {
                console.error('WebSocket: Ошибка отправки из очереди:', error);
                this.messageQueue.unshift(message); // Возвращаем в начало очереди
                break;
            }
        }
    }

    joinRoom(roomId, roomType = 'chat') {
        this.send('join_room', { roomId, roomType });
        this.rooms.add(roomId);
    }

    leaveRoom(roomId) {
        this.send('leave_room', { roomId });
        this.rooms.delete(roomId);
    }

    sendChatMessage(roomId, text, messageType = 'text') {
        this.send('chat_message', { roomId, text, messageType });
    }

    startTyping(roomId) {
        this.send('typing_start', { roomId });
    }

    stopTyping(roomId) {
        this.send('typing_stop', { roomId });
    }

    sendRaidUpdate(raidId, action, raidData) {
        this.send('raid_update', { raidId, action, raidData });
    }

    sendNotification(targetUsers, message, type = 'info') {
        this.send('notification', { targetUsers, message, type });
    }

    on(event, handler) {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, []);
        }
        this.eventHandlers.get(event).push(handler);
    }

    off(event, handler) {
        if (this.eventHandlers.has(event)) {
            const handlers = this.eventHandlers.get(event);
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
    }

    notifyModules(event, data) {
        // Уведомляем другие модули о событиях WebSocket
        if (window.chatSystem) {
            window.chatSystem.handleWebSocketEvent(event, data);
        }
        
        if (window.raidsManager) {
            window.raidsManager.handleWebSocketEvent(event, data);
        }
        
        if (window.charactersManager) {
            window.charactersManager.handleWebSocketEvent(event, data);
        }
        
        if (window.notifications) {
            if (event === 'notification') {
                window.notifications.show(data.message, data.type);
            }
        }
    }

    startPing() {
        this.pingInterval = setInterval(() => {
            if (this.isConnected) {
                this.send('ping', { timestamp: Date.now() });
            }
        }, 30000); // Ping каждые 30 секунд
    }

    stopPing() {
        if (this.pingInterval) {
            clearInterval(this.pingInterval);
            this.pingInterval = null;
        }
    }

    scheduleReconnect() {
        this.reconnectAttempts++;
        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
        
        console.log(`WebSocket: Попытка переподключения ${this.reconnectAttempts} через ${delay}ms`);
        
        setTimeout(() => {
            this.connect();
        }, delay);
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
        }
        this.isConnected = false;
        this.stopPing();
    }

    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            reconnectAttempts: this.reconnectAttempts,
            rooms: Array.from(this.rooms),
            user: this.user,
            clientId: this.clientId
        };
    }

    // Методы для интеграции с существующими модулями
    
    // Интеграция с чатом
    integrateWithChat(chatSystem) {
        if (chatSystem) {
            // Переопределяем методы чата для использования WebSocket
            const originalSendMessage = chatSystem.sendChannelMessage;
            const originalSendPrivateMessage = chatSystem.sendPrivateMessage;
            
            chatSystem.sendChannelMessage = (messageData) => {
                // Отправляем через WebSocket
                this.sendChatMessage(messageData.channelId || 'general', messageData.text);
                
                // Вызываем оригинальный метод для локального обновления
                if (originalSendMessage) {
                    originalSendMessage.call(chatSystem, messageData);
                }
            };
            
            chatSystem.sendPrivateMessage = (messageData) => {
                // Отправляем через WebSocket
                this.sendChatMessage(`private_${messageData.recipientId}`, messageData.text);
                
                // Вызываем оригинальный метод для локального обновления
                if (originalSendPrivateMessage) {
                    originalSendPrivateMessage.call(chatSystem, messageData);
                }
            };
        }
    }

    // Интеграция с рейдами
    integrateWithRaids(raidsManager) {
        if (raidsManager) {
            // Переопределяем методы рейдов для использования WebSocket
            const originalCreateRaid = raidsManager.createRaid;
            const originalUpdateRaid = raidsManager.updateRaid;
            
            raidsManager.createRaid = (raidData) => {
                // Отправляем обновление через WebSocket
                this.sendRaidUpdate(raidData.id || 'new', 'create', raidData);
                
                // Вызываем оригинальный метод
                if (originalCreateRaid) {
                    return originalCreateRaid.call(raidsManager, raidData);
                }
            };
            
            raidsManager.updateRaid = (id, updates) => {
                // Отправляем обновление через WebSocket
                this.sendRaidUpdate(id, 'update', updates);
                
                // Вызываем оригинальный метод
                if (originalUpdateRaid) {
                    return originalUpdateRaid.call(raidsManager, id, updates);
                }
            };
        }
    }
}

// Инициализация WebSocket клиента
let wsClient = null;

document.addEventListener('DOMContentLoaded', () => {
    // Создаем WebSocket клиент
    wsClient = new WebSocketClient();
    
    // Делаем доступным глобально
    window.wsClient = wsClient;
    
    // Интегрируем с существующими модулями
    setTimeout(() => {
        if (window.chatSystem) {
            wsClient.integrateWithChat(window.chatSystem);
        }
        
        if (window.raidsManager) {
            wsClient.integrateWithRaids(window.raidsManager);
        }
    }, 1000);
});

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WebSocketClient;
}