/**
 * Database System для Lost Ark Raid Manager
 * SQLite база данных с миграциями и схемой
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

class DatabaseManager {
    constructor(dbPath = 'lost-ark-manager.db') {
        this.dbPath = path.join(process.cwd(), 'data', dbPath);
        this.db = null;
        this.migrations = [];
        
        this.init();
    }

    init() {
        try {
            // Создаем папку для данных если не существует
            const dataDir = path.dirname(this.dbPath);
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }

            // Подключаемся к базе данных
            this.db = new Database(this.dbPath);
            
            // Включаем WAL режим для лучшей производительности
            this.db.pragma('journal_mode = WAL');
            this.db.pragma('synchronous = NORMAL');
            this.db.pragma('cache_size = 10000');
            this.db.pragma('temp_store = MEMORY');
            
            console.log('✅ База данных подключена:', this.dbPath);
            
            // Инициализируем схему
            this.initSchema();
            
            // Запускаем миграции
            this.runMigrations();
            
        } catch (error) {
            console.error('❌ Ошибка инициализации базы данных:', error);
            throw error;
        }
    }

    initSchema() {
        // Создаем таблицы если не существуют
        this.createTables();
        
        // Создаем индексы
        this.createIndexes();
    }

    createTables() {
        // Таблица пользователей
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE,
                password_hash TEXT,
                role TEXT DEFAULT 'user',
                avatar TEXT,
                status TEXT DEFAULT 'offline',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                last_login DATETIME,
                preferences TEXT
            )
        `);

        // Таблица персонажей
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS characters (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                class TEXT NOT NULL,
                level INTEGER DEFAULT 1,
                item_level INTEGER DEFAULT 0,
                server TEXT,
                engravings TEXT,
                gems TEXT,
                cards TEXT,
                equipment TEXT,
                stats TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            )
        `);

        // Таблица рейдов
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS raids (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                type TEXT NOT NULL,
                difficulty TEXT NOT NULL,
                status TEXT DEFAULT 'scheduled',
                date DATETIME NOT NULL,
                time TEXT NOT NULL,
                duration INTEGER DEFAULT 120,
                max_participants INTEGER DEFAULT 8,
                min_item_level INTEGER DEFAULT 0,
                description TEXT,
                requirements TEXT,
                rewards TEXT,
                leader_id INTEGER NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                started_at DATETIME,
                completed_at DATETIME,
                FOREIGN KEY (leader_id) REFERENCES users (id)
            )
        `);

        // Таблица участников рейдов
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS raid_participants (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                raid_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                character_id INTEGER,
                role TEXT DEFAULT 'dps',
                status TEXT DEFAULT 'confirmed',
                joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                notes TEXT,
                FOREIGN KEY (raid_id) REFERENCES raids (id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
                FOREIGN KEY (character_id) REFERENCES characters (id) ON DELETE CASCADE,
                UNIQUE(raid_id, user_id)
            )
        `);

        // Таблица каналов чата
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS chat_channels (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                type TEXT DEFAULT 'public',
                description TEXT,
                max_users INTEGER DEFAULT 100,
                is_active BOOLEAN DEFAULT 1,
                created_by INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (created_by) REFERENCES users (id)
            )
        `);

        // Таблица сообщений чата
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS chat_messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                channel_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                message TEXT NOT NULL,
                message_type TEXT DEFAULT 'text',
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                edited_at DATETIME,
                deleted_at DATETIME,
                FOREIGN KEY (channel_id) REFERENCES chat_channels (id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            )
        `);

        // Таблица уведомлений
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS notifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                message TEXT NOT NULL,
                type TEXT DEFAULT 'info',
                is_read BOOLEAN DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                read_at DATETIME,
                data TEXT,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            )
        `);

        // Таблица логов рейдов
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS raid_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                raid_id INTEGER NOT NULL,
                user_id INTEGER,
                action TEXT NOT NULL,
                details TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (raid_id) REFERENCES raids (id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        `);

        // Таблица настроек приложения
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS app_settings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                key TEXT UNIQUE NOT NULL,
                value TEXT,
                description TEXT,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('✅ Таблицы созданы');
    }

    createIndexes() {
        // Индексы для производительности
        this.db.exec(`
            CREATE INDEX IF NOT EXISTS idx_characters_user_id ON characters (user_id);
            CREATE INDEX IF NOT EXISTS idx_characters_class ON characters (class);
            CREATE INDEX IF NOT EXISTS idx_characters_server ON characters (server);
            CREATE INDEX IF NOT EXISTS idx_raids_date ON raids (date);
            CREATE INDEX IF NOT EXISTS idx_raids_status ON raids (status);
            CREATE INDEX IF NOT EXISTS idx_raids_leader_id ON raids (leader_id);
            CREATE INDEX IF NOT EXISTS idx_raid_participants_raid_id ON raid_participants (raid_id);
            CREATE INDEX IF NOT EXISTS idx_raid_participants_user_id ON raid_participants (user_id);
            CREATE INDEX IF NOT EXISTS idx_chat_messages_channel_id ON chat_messages (channel_id);
            CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp ON chat_messages (timestamp);
            CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications (user_id);
            CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications (is_read);
        `);

        console.log('✅ Индексы созданы');
    }

    runMigrations() {
        // Здесь можно добавить миграции для обновления схемы
        console.log('✅ Миграции выполнены');
    }

    // Методы для работы с пользователями
    createUser(userData) {
        const stmt = this.db.prepare(`
            INSERT INTO users (username, email, password_hash, role, avatar, preferences)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        
        const result = stmt.run(
            userData.username,
            userData.email,
            userData.password_hash,
            userData.role || 'user',
            userData.avatar,
            JSON.stringify(userData.preferences || {})
        );
        
        return result.lastInsertRowid;
    }

    getUserById(id) {
        const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?');
        return stmt.get(id);
    }

    getUserByUsername(username) {
        const stmt = this.db.prepare('SELECT * FROM users WHERE username = ?');
        return stmt.get(username);
    }

    updateUser(id, updates) {
        const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
        const values = Object.values(updates);
        values.push(new Date().toISOString()); // updated_at
        values.push(id);
        
        const stmt = this.db.prepare(`
            UPDATE users SET ${fields}, updated_at = ? WHERE id = ?
        `);
        
        return stmt.run(...values);
    }

    // Методы для работы с персонажами
    createCharacter(characterData) {
        const stmt = this.db.prepare(`
            INSERT INTO characters (user_id, name, class, level, item_level, server, engravings, gems, cards, equipment, stats)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        const result = stmt.run(
            characterData.user_id,
            characterData.name,
            characterData.class,
            characterData.level || 1,
            characterData.item_level || 0,
            characterData.server,
            JSON.stringify(characterData.engravings || []),
            JSON.stringify(characterData.gems || []),
            JSON.stringify(characterData.cards || []),
            JSON.stringify(characterData.equipment || {}),
            JSON.stringify(characterData.stats || {})
        );
        
        return result.lastInsertRowid;
    }

    getCharactersByUserId(userId) {
        const stmt = this.db.prepare('SELECT * FROM characters WHERE user_id = ? ORDER BY created_at DESC');
        return stmt.all(userId);
    }

    updateCharacter(id, updates) {
        const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
        const values = Object.values(updates);
        values.push(new Date().toISOString()); // updated_at
        values.push(id);
        
        const stmt = this.db.prepare(`
            UPDATE characters SET ${fields}, updated_at = ? WHERE id = ?
        `);
        
        return stmt.run(...values);
    }

    // Методы для работы с рейдами
    createRaid(raidData) {
        const stmt = this.db.prepare(`
            INSERT INTO raids (name, type, difficulty, status, date, time, duration, max_participants, min_item_level, description, requirements, rewards, leader_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        const result = stmt.run(
            raidData.name,
            raidData.type,
            raidData.difficulty,
            raidData.status || 'scheduled',
            raidData.date,
            raidData.time,
            raidData.duration || 120,
            raidData.max_participants || 8,
            raidData.min_item_level || 0,
            raidData.description,
            JSON.stringify(raidData.requirements || []),
            JSON.stringify(raidData.rewards || []),
            raidData.leader_id
        );
        
        return result.lastInsertRowid;
    }

    getRaids(status = null, limit = 50) {
        let query = 'SELECT * FROM raids';
        let params = [];
        
        if (status) {
            query += ' WHERE status = ?';
            params.push(status);
        }
        
        query += ' ORDER BY date DESC LIMIT ?';
        params.push(limit);
        
        const stmt = this.db.prepare(query);
        return stmt.all(...params);
    }

    getRaidById(id) {
        const stmt = this.db.prepare('SELECT * FROM raids WHERE id = ?');
        return stmt.get(id);
    }

    updateRaid(id, updates) {
        const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
        const values = Object.values(updates);
        values.push(new Date().toISOString()); // updated_at
        values.push(id);
        
        const stmt = this.db.prepare(`
            UPDATE raids SET ${fields}, updated_at = ? WHERE id = ?
        `);
        
        return stmt.run(...values);
    }

    // Методы для работы с участниками рейдов
    addRaidParticipant(raidId, userId, characterId = null, role = 'dps') {
        const stmt = this.db.prepare(`
            INSERT OR REPLACE INTO raid_participants (raid_id, user_id, character_id, role, status)
            VALUES (?, ?, ?, ?, 'confirmed')
        `);
        
        return stmt.run(raidId, userId, characterId, role);
    }

    removeRaidParticipant(raidId, userId) {
        const stmt = this.db.prepare('DELETE FROM raid_participants WHERE raid_id = ? AND user_id = ?');
        return stmt.run(raidId, userId);
    }

    getRaidParticipants(raidId) {
        const stmt = this.db.prepare(`
            SELECT rp.*, u.username, u.avatar, c.name as character_name, c.class as character_class
            FROM raid_participants rp
            JOIN users u ON rp.user_id = u.id
            LEFT JOIN characters c ON rp.character_id = c.id
            WHERE rp.raid_id = ?
            ORDER BY rp.joined_at ASC
        `);
        
        return stmt.all(raidId);
    }

    // Методы для работы с чатом
    createChannel(channelData) {
        const stmt = this.db.prepare(`
            INSERT INTO chat_channels (name, type, description, max_users, created_by)
            VALUES (?, ?, ?, ?, ?)
        `);
        
        const result = stmt.run(
            channelData.name,
            channelData.type || 'public',
            channelData.description,
            channelData.max_users || 100,
            channelData.created_by
        );
        
        return result.lastInsertRowid;
    }

    getChannels() {
        const stmt = this.db.prepare('SELECT * FROM chat_channels WHERE is_active = 1 ORDER BY name');
        return stmt.all();
    }

    saveMessage(channelId, userId, message, messageType = 'text') {
        const stmt = this.db.prepare(`
            INSERT INTO chat_messages (channel_id, user_id, message, message_type)
            VALUES (?, ?, ?, ?)
        `);
        
        return stmt.run(channelId, userId, message, messageType);
    }

    getChannelMessages(channelId, limit = 50, offset = 0) {
        const stmt = this.db.prepare(`
            SELECT cm.*, u.username, u.avatar
            FROM chat_messages cm
            JOIN users u ON cm.user_id = u.id
            WHERE cm.channel_id = ? AND cm.deleted_at IS NULL
            ORDER BY cm.timestamp DESC
            LIMIT ? OFFSET ?
        `);
        
        return stmt.all(channelId, limit, offset);
    }

    // Методы для работы с уведомлениями
    createNotification(userId, title, message, type = 'info', data = null) {
        const stmt = this.db.prepare(`
            INSERT INTO notifications (user_id, title, message, type, data)
            VALUES (?, ?, ?, ?, ?)
        `);
        
        return stmt.run(userId, title, message, type, JSON.stringify(data || {}));
    }

    getUserNotifications(userId, unreadOnly = false) {
        let query = 'SELECT * FROM notifications WHERE user_id = ?';
        let params = [userId];
        
        if (unreadOnly) {
            query += ' AND is_read = 0';
        }
        
        query += ' ORDER BY created_at DESC LIMIT 100';
        
        const stmt = this.db.prepare(query);
        return stmt.all(...params);
    }

    markNotificationAsRead(notificationId) {
        const stmt = this.db.prepare(`
            UPDATE notifications SET is_read = 1, read_at = ? WHERE id = ?
        `);
        
        return stmt.run(new Date().toISOString(), notificationId);
    }

    // Методы для работы с логами
    logRaidAction(raidId, userId, action, details = null) {
        const stmt = this.db.prepare(`
            INSERT INTO raid_logs (raid_id, user_id, action, details)
            VALUES (?, ?, ?, ?)
        `);
        
        return stmt.run(raidId, userId, action, JSON.stringify(details || {}));
    }

    getRaidLogs(raidId, limit = 100) {
        const stmt = this.db.prepare(`
            SELECT rl.*, u.username
            FROM raid_logs rl
            LEFT JOIN users u ON rl.user_id = u.id
            WHERE rl.raid_id = ?
            ORDER BY rl.timestamp DESC
            LIMIT ?
        `);
        
        return stmt.all(raidId, limit);
    }

    // Методы для работы с настройками
    setSetting(key, value, description = null) {
        const stmt = this.db.prepare(`
            INSERT OR REPLACE INTO app_settings (key, value, description, updated_at)
            VALUES (?, ?, ?, ?)
        `);
        
        return stmt.run(key, JSON.stringify(value), description, new Date().toISOString());
    }

    getSetting(key, defaultValue = null) {
        const stmt = this.db.prepare('SELECT value FROM app_settings WHERE key = ?');
        const result = stmt.get(key);
        
        if (result) {
            try {
                return JSON.parse(result.value);
            } catch {
                return result.value;
            }
        }
        
        return defaultValue;
    }

    // Методы для статистики
    getStats() {
        const stats = {};
        
        // Общая статистика
        stats.totalUsers = this.db.prepare('SELECT COUNT(*) as count FROM users').get().count;
        stats.totalCharacters = this.db.prepare('SELECT COUNT(*) as count FROM characters').get().count;
        stats.totalRaids = this.db.prepare('SELECT COUNT(*) as count FROM raids').get().count;
        stats.totalMessages = this.db.prepare('SELECT COUNT(*) as count FROM chat_messages').get().count;
        
        // Статистика рейдов
        stats.scheduledRaids = this.db.prepare('SELECT COUNT(*) as count FROM raids WHERE status = "scheduled"').get().count;
        stats.activeRaids = this.db.prepare('SELECT COUNT(*) as count FROM raids WHERE status = "in_progress"').get().count;
        stats.completedRaids = this.db.prepare('SELECT COUNT(*) as count FROM raids WHERE status = "completed"').get().count;
        
        // Статистика пользователей
        stats.onlineUsers = this.db.prepare('SELECT COUNT(*) as count FROM users WHERE status = "online"').get().count;
        
        return stats;
    }

    // Методы для резервного копирования
    backup(backupPath) {
        try {
            const backupDb = new Database(backupPath);
            this.db.backup(backupDb);
            backupDb.close();
            console.log('✅ Резервная копия создана:', backupPath);
            return true;
        } catch (error) {
            console.error('❌ Ошибка создания резервной копии:', error);
            return false;
        }
    }

    // Методы для очистки
    cleanup() {
        try {
            // Удаляем старые уведомления (старше 30 дней)
            this.db.prepare('DELETE FROM notifications WHERE created_at < datetime("now", "-30 days")').run();
            
            // Удаляем старые сообщения чата (старше 90 дней)
            this.db.prepare('DELETE FROM chat_messages WHERE timestamp < datetime("now", "-90 days")').run();
            
            // Удаляем старые логи (старше 180 дней)
            this.db.prepare('DELETE FROM raid_logs WHERE timestamp < datetime("now", "-180 days")').run();
            
            // Оптимизируем базу данных
            this.db.exec('VACUUM');
            
            console.log('✅ Очистка базы данных завершена');
            return true;
        } catch (error) {
            console.error('❌ Ошибка очистки базы данных:', error);
            return false;
        }
    }

    // Закрытие соединения
    close() {
        if (this.db) {
            this.db.close();
            console.log('✅ Соединение с базой данных закрыто');
        }
    }
}

// Создаем глобальный экземпляр
let dbManager = null;

// Инициализация при запуске
if (require.main === module) {
    dbManager = new DatabaseManager();
    
    // Graceful shutdown
    process.on('SIGTERM', () => {
        console.log('SIGTERM received, closing database');
        if (dbManager) dbManager.close();
        process.exit(0);
    });

    process.on('SIGINT', () => {
        console.log('SIGINT received, closing database');
        if (dbManager) dbManager.close();
        process.exit(0);
    });
}

module.exports = DatabaseManager;