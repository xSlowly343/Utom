/**
 * MySQL/PostgreSQL Database Adapter
 * Адаптер для работы с реляционными базами данных
 */

const mysql = require('mysql2/promise'); // или 'pg' для PostgreSQL

class MySQLDatabaseAdapter {
    constructor(config) {
        this.config = {
            host: config.host || 'localhost',
            port: config.port || 3306,
            user: config.user || 'root',
            password: config.password || '',
            database: config.database || 'lost_ark_manager',
            ...config
        };
        
        this.connection = null;
        this.init();
    }

    async init() {
        try {
            this.connection = await mysql.createConnection(this.config);
            console.log('MySQL: Подключение установлено');
            
            // Создаем таблицы если их нет
            await this.createTables();
        } catch (error) {
            console.error('MySQL: Ошибка подключения:', error);
            throw error;
        }
    }

    async createTables() {
        const tables = [
            // Таблица пользователей
            `CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                role ENUM('user', 'moderator', 'admin') DEFAULT 'user',
                avatar VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )`,
            
            // Таблица персонажей
            `CREATE TABLE IF NOT EXISTS characters (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                name VARCHAR(50) NOT NULL,
                class VARCHAR(50) NOT NULL,
                level INT NOT NULL,
                item_level INT NOT NULL,
                server VARCHAR(100),
                engravings JSON,
                gems JSON,
                cards JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )`,
            
            // Таблица рейдов
            `CREATE TABLE IF NOT EXISTS raids (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                type VARCHAR(50) NOT NULL,
                difficulty VARCHAR(20) NOT NULL,
                status ENUM('Scheduled', 'In Progress', 'Completed', 'Cancelled') DEFAULT 'Scheduled',
                date DATE NOT NULL,
                time TIME NOT NULL,
                duration INT NOT NULL,
                max_participants INT NOT NULL,
                min_item_level INT NOT NULL,
                description TEXT,
                requirements JSON,
                rewards JSON,
                leader VARCHAR(50) NOT NULL,
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )`,
            
            // Таблица участников рейдов
            `CREATE TABLE IF NOT EXISTS raid_participants (
                id INT AUTO_INCREMENT PRIMARY KEY,
                raid_id INT NOT NULL,
                user_id INT NOT NULL,
                character_id INT,
                role VARCHAR(50),
                joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (raid_id) REFERENCES raids(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE SET NULL
            )`,
            
            // Таблица каналов чата
            `CREATE TABLE IF NOT EXISTS chat_channels (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                type ENUM('public', 'private', 'guild') DEFAULT 'public',
                created_by INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
            )`,
            
            // Таблица сообщений чата
            `CREATE TABLE IF NOT EXISTS chat_messages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                channel_id INT NOT NULL,
                user_id INT NOT NULL,
                message TEXT NOT NULL,
                message_type ENUM('text', 'image', 'file') DEFAULT 'text',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (channel_id) REFERENCES chat_channels(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )`,
            
            // Таблица уведомлений
            `CREATE TABLE IF NOT EXISTS notifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                title VARCHAR(200) NOT NULL,
                message TEXT NOT NULL,
                type ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
                read_at TIMESTAMP NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )`,
            
            // Таблица логов рейдов
            `CREATE TABLE IF NOT EXISTS raid_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                raid_id INT NOT NULL,
                user_id INT NOT NULL,
                action VARCHAR(50) NOT NULL,
                details JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (raid_id) REFERENCES raids(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )`,
            
            // Таблица настроек
            `CREATE TABLE IF NOT EXISTS user_settings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                setting_key VARCHAR(100) NOT NULL,
                setting_value TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE KEY unique_user_setting (user_id, setting_key)
            )`
        ];

        for (const table of tables) {
            try {
                await this.connection.execute(table);
            } catch (error) {
                console.error('MySQL: Ошибка создания таблицы:', error);
            }
        }

        console.log('MySQL: Таблицы созданы/проверены');
    }

    // Методы для работы с пользователями
    async createUser(userData) {
        try {
            const [result] = await this.connection.execute(
                'INSERT INTO users (username, email, password_hash, role, avatar) VALUES (?, ?, ?, ?, ?)',
                [userData.username, userData.email, userData.password_hash, userData.role || 'user', userData.avatar]
            );
            return result.insertId;
        } catch (error) {
            console.error('MySQL: Ошибка создания пользователя:', error);
            throw error;
        }
    }

    async getUserById(id) {
        try {
            const [rows] = await this.connection.execute(
                'SELECT * FROM users WHERE id = ?',
                [id]
            );
            return rows[0] || null;
        } catch (error) {
            console.error('MySQL: Ошибка получения пользователя:', error);
            throw error;
        }
    }

    async getUserByUsername(username) {
        try {
            const [rows] = await this.connection.execute(
                'SELECT * FROM users WHERE username = ?',
                [username]
            );
            return rows[0] || null;
        } catch (error) {
            console.error('MySQL: Ошибка получения пользователя по имени:', error);
            throw error;
        }
    }

    // Методы для работы с персонажами
    async createCharacter(characterData) {
        try {
            const [result] = await this.connection.execute(
                `INSERT INTO characters (user_id, name, class, level, item_level, server, engravings, gems, cards) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    characterData.userId,
                    characterData.name,
                    characterData.class,
                    characterData.level,
                    characterData.itemLevel,
                    characterData.server,
                    JSON.stringify(characterData.engravings || []),
                    JSON.stringify(characterData.gems || []),
                    JSON.stringify(characterData.cards || [])
                ]
            );
            return result.insertId;
        } catch (error) {
            console.error('MySQL: Ошибка создания персонажа:', error);
            throw error;
        }
    }

    async getCharactersByUserId(userId) {
        try {
            const [rows] = await this.connection.execute(
                'SELECT * FROM characters WHERE user_id = ? ORDER BY created_at DESC',
                [userId]
            );
            
            // Преобразуем JSON поля обратно в объекты
            return rows.map(row => ({
                ...row,
                engravings: JSON.parse(row.engravings || '[]'),
                gems: JSON.parse(row.gems || '[]'),
                cards: JSON.parse(row.cards || '[]')
            }));
        } catch (error) {
            console.error('MySQL: Ошибка получения персонажей:', error);
            throw error;
        }
    }

    async updateCharacter(id, updates) {
        try {
            const fields = [];
            const values = [];
            
            for (const [key, value] of Object.entries(updates)) {
                if (key === 'engravings' || key === 'gems' || key === 'cards') {
                    fields.push(`${key} = ?`);
                    values.push(JSON.stringify(value));
                } else if (key === 'itemLevel') {
                    fields.push('item_level = ?');
                    values.push(value);
                } else {
                    fields.push(`${key} = ?`);
                    values.push(value);
                }
            }
            
            values.push(id);
            
            await this.connection.execute(
                `UPDATE characters SET ${fields.join(', ')} WHERE id = ?`,
                values
            );
            
            return true;
        } catch (error) {
            console.error('MySQL: Ошибка обновления персонажа:', error);
            throw error;
        }
    }

    async deleteCharacter(id) {
        try {
            await this.connection.execute(
                'DELETE FROM characters WHERE id = ?',
                [id]
            );
            return true;
        } catch (error) {
            console.error('MySQL: Ошибка удаления персонажа:', error);
            throw error;
        }
    }

    // Методы для работы с рейдами
    async createRaid(raidData) {
        try {
            const [result] = await this.connection.execute(
                `INSERT INTO raids (name, type, difficulty, status, date, time, duration, max_participants, 
                                  min_item_level, description, requirements, rewards, leader, notes) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    raidData.name,
                    raidData.type,
                    raidData.difficulty,
                    raidData.status || 'Scheduled',
                    raidData.date,
                    raidData.time,
                    raidData.duration,
                    raidData.maxParticipants,
                    raidData.minItemLevel,
                    raidData.description,
                    JSON.stringify(raidData.requirements || []),
                    JSON.stringify(raidData.rewards || []),
                    raidData.leader,
                    raidData.notes
                ]
            );
            return result.insertId;
        } catch (error) {
            console.error('MySQL: Ошибка создания рейда:', error);
            throw error;
        }
    }

    async getAllRaids() {
        try {
            const [rows] = await this.connection.execute(
                'SELECT * FROM raids ORDER BY created_at DESC'
            );
            
            // Преобразуем JSON поля
            return rows.map(row => ({
                ...row,
                requirements: JSON.parse(row.requirements || '[]'),
                rewards: JSON.parse(row.rewards || '[]'),
                maxParticipants: row.max_participants,
                minItemLevel: row.min_item_level
            }));
        } catch (error) {
            console.error('MySQL: Ошибка получения рейдов:', error);
            throw error;
        }
    }

    async updateRaid(id, updates) {
        try {
            const fields = [];
            const values = [];
            
            for (const [key, value] of Object.entries(updates)) {
                if (key === 'requirements' || key === 'rewards') {
                    fields.push(`${key} = ?`);
                    values.push(JSON.stringify(value));
                } else if (key === 'maxParticipants') {
                    fields.push('max_participants = ?');
                    values.push(value);
                } else if (key === 'minItemLevel') {
                    fields.push('min_item_level = ?');
                    values.push(value);
                } else {
                    fields.push(`${key} = ?`);
                    values.push(value);
                }
            }
            
            values.push(id);
            
            await this.connection.execute(
                `UPDATE raids SET ${fields.join(', ')} WHERE id = ?`,
                values
            );
            
            return true;
        } catch (error) {
            console.error('MySQL: Ошибка обновления рейда:', error);
            throw error;
        }
    }

    // Методы для работы с чатом
    async createChannel(channelData) {
        try {
            const [result] = await this.connection.execute(
                'INSERT INTO chat_channels (name, type, created_by) VALUES (?, ?, ?)',
                [channelData.name, channelData.type, channelData.createdBy]
            );
            return result.insertId;
        } catch (error) {
            console.error('MySQL: Ошибка создания канала:', error);
            throw error;
        }
    }

    async saveMessage(messageData) {
        try {
            const [result] = await this.connection.execute(
                'INSERT INTO chat_messages (channel_id, user_id, message, message_type) VALUES (?, ?, ?, ?)',
                [messageData.channelId, messageData.userId, messageData.message, messageData.messageType || 'text']
            );
            return result.insertId;
        } catch (error) {
            console.error('MySQL: Ошибка сохранения сообщения:', error);
            throw error;
        }
    }

    async getChannelMessages(channelId, limit = 100) {
        try {
            const [rows] = await this.connection.execute(
                `SELECT m.*, u.username, u.avatar 
                 FROM chat_messages m 
                 JOIN users u ON m.user_id = u.id 
                 WHERE m.channel_id = ? 
                 ORDER BY m.created_at DESC 
                 LIMIT ?`,
                [channelId, limit]
            );
            return rows.reverse(); // Возвращаем в хронологическом порядке
        } catch (error) {
            console.error('MySQL: Ошибка получения сообщений:', error);
            throw error;
        }
    }

    // Методы для работы с настройками
    async setSetting(userId, key, value) {
        try {
            await this.connection.execute(
                `INSERT INTO user_settings (user_id, setting_key, setting_value) 
                 VALUES (?, ?, ?) 
                 ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
                [userId, key, value]
            );
            return true;
        } catch (error) {
            console.error('MySQL: Ошибка сохранения настройки:', error);
            throw error;
        }
    }

    async getSetting(userId, key) {
        try {
            const [rows] = await this.connection.execute(
                'SELECT setting_value FROM user_settings WHERE user_id = ? AND setting_key = ?',
                [userId, key]
            );
            return rows[0]?.setting_value || null;
        } catch (error) {
            console.error('MySQL: Ошибка получения настройки:', error);
            throw error;
        }
    }

    // Методы для логирования
    async logRaidAction(raidId, userId, action, details = {}) {
        try {
            await this.connection.execute(
                'INSERT INTO raid_logs (raid_id, user_id, action, details) VALUES (?, ?, ?, ?)',
                [raidId, userId, action, JSON.stringify(details)]
            );
            return true;
        } catch (error) {
            console.error('MySQL: Ошибка логирования действия:', error);
            throw error;
        }
    }

    // Методы для уведомлений
    async createNotification(userId, title, message, type = 'info') {
        try {
            const [result] = await this.connection.execute(
                'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
                [userId, title, message, type]
            );
            return result.insertId;
        } catch (error) {
            console.error('MySQL: Ошибка создания уведомления:', error);
            throw error;
        }
    }

    // Методы для статистики
    async getStats() {
        try {
            const [userCount] = await this.connection.execute('SELECT COUNT(*) as count FROM users');
            const [characterCount] = await this.connection.execute('SELECT COUNT(*) as count FROM characters');
            const [raidCount] = await this.connection.execute('SELECT COUNT(*) as count FROM raids');
            const [messageCount] = await this.connection.execute('SELECT COUNT(*) as count FROM chat_messages');
            
            return {
                users: userCount[0].count,
                characters: characterCount[0].count,
                raids: raidCount[0].count,
                messages: messageCount[0].count
            };
        } catch (error) {
            console.error('MySQL: Ошибка получения статистики:', error);
            throw error;
        }
    }

    // Методы для резервного копирования
    async backup() {
        try {
            // Здесь можно реализовать логику резервного копирования
            // Например, экспорт в SQL файл или создание дампа
            console.log('MySQL: Резервное копирование не реализовано для MySQL');
            return true;
        } catch (error) {
            console.error('MySQL: Ошибка резервного копирования:', error);
            throw error;
        }
    }

    // Методы для очистки
    async cleanup() {
        try {
            // Удаляем старые уведомления (старше 30 дней)
            await this.connection.execute(
                'DELETE FROM notifications WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)'
            );
            
            // Удаляем старые логи (старше 90 дней)
            await this.connection.execute(
                'DELETE FROM raid_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY)'
            );
            
            console.log('MySQL: Очистка завершена');
            return true;
        } catch (error) {
            console.error('MySQL: Ошибка очистки:', error);
            throw error;
        }
    }

    // Закрытие соединения
    async close() {
        if (this.connection) {
            await this.connection.end();
            console.log('MySQL: Соединение закрыто');
        }
    }
}

module.exports = MySQLDatabaseAdapter;