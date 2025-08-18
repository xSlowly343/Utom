/**
 * PostgreSQL Database Adapter
 * Адаптер для работы с PostgreSQL и интеграции с существующим сайтом
 */

const { Pool } = require('pg');

class PostgreSQLDatabaseAdapter {
    constructor(config) {
        this.config = {
            host: config.host || 'localhost',
            port: config.port || 5432,
            user: config.user || 'postgres',
            password: config.password || '',
            database: config.database || 'lost_ark_manager',
            schema: config.schema || 'public',
            ssl: config.ssl || false,
            max: config.max || 20,
            idleTimeoutMillis: config.idleTimeoutMillis || 30000,
            connectionTimeoutMillis: config.connectionTimeoutMillis || 2000,
            ...config
        };
        
        this.pool = null;
        this.init();
    }

    async init() {
        try {
            this.pool = new Pool(this.config);
            
            // Проверяем подключение
            const client = await this.pool.connect();
            client.release();
            
            console.log('PostgreSQL: Подключение установлено');
            
            // Создаем схему и таблицы если их нет
            await this.createSchema();
            await this.createTables();
            
        } catch (error) {
            console.error('PostgreSQL: Ошибка подключения:', error);
            throw error;
        }
    }

    async createSchema() {
        try {
            // Создаем схему для Lost Ark Manager если её нет
            await this.pool.query(`
                CREATE SCHEMA IF NOT EXISTS lost_ark_manager
                AUTHORIZATION CURRENT_USER;
            `);
            
            // Устанавливаем схему по умолчанию
            await this.pool.query(`
                SET search_path TO lost_ark_manager, public;
            `);
            
            console.log('PostgreSQL: Схема создана/проверена');
        } catch (error) {
            console.error('PostgreSQL: Ошибка создания схемы:', error);
        }
    }

    async createTables() {
        const tables = [
            // Таблица пользователей (интеграция с основным сайтом)
            `CREATE TABLE IF NOT EXISTS lost_ark_manager.users (
                id SERIAL PRIMARY KEY,
                site_user_id INTEGER UNIQUE, -- ID пользователя с основного сайта
                username VARCHAR(50) NOT NULL,
                email VARCHAR(100) NOT NULL,
                role VARCHAR(20) DEFAULT 'user',
                avatar VARCHAR(100),
                preferences JSONB DEFAULT '{}',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
            
            // Таблица персонажей
            `CREATE TABLE IF NOT EXISTS lost_ark_manager.characters (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES lost_ark_manager.users(id) ON DELETE CASCADE,
                name VARCHAR(50) NOT NULL,
                class VARCHAR(50) NOT NULL,
                level INTEGER NOT NULL,
                item_level INTEGER NOT NULL,
                server VARCHAR(100),
                engravings JSONB DEFAULT '[]',
                gems JSONB DEFAULT '[]',
                cards JSONB DEFAULT '[]',
                equipment JSONB DEFAULT '{}',
                stats JSONB DEFAULT '{}',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
            
            // Таблица рейдов
            `CREATE TABLE IF NOT EXISTS lost_ark_manager.raids (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                type VARCHAR(50) NOT NULL,
                difficulty VARCHAR(20) NOT NULL,
                status VARCHAR(20) DEFAULT 'Scheduled',
                date DATE NOT NULL,
                time TIME NOT NULL,
                duration INTEGER NOT NULL,
                max_participants INTEGER NOT NULL,
                min_item_level INTEGER NOT NULL,
                description TEXT,
                requirements JSONB DEFAULT '[]',
                rewards JSONB DEFAULT '[]',
                leader_id INTEGER NOT NULL REFERENCES lost_ark_manager.users(id),
                leader_name VARCHAR(50) NOT NULL,
                notes TEXT,
                settings JSONB DEFAULT '{}',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
            
            // Таблица участников рейдов
            `CREATE TABLE IF NOT EXISTS lost_ark_manager.raid_participants (
                id SERIAL PRIMARY KEY,
                raid_id INTEGER NOT NULL REFERENCES lost_ark_manager.raids(id) ON DELETE CASCADE,
                user_id INTEGER NOT NULL REFERENCES lost_ark_manager.users(id) ON DELETE CASCADE,
                character_id INTEGER REFERENCES lost_ark_manager.characters(id) ON DELETE SET NULL,
                role VARCHAR(50),
                status VARCHAR(20) DEFAULT 'confirmed',
                joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                notes TEXT
            )`,
            
            // Таблица каналов чата
            `CREATE TABLE IF NOT EXISTS lost_ark_manager.chat_channels (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                type VARCHAR(20) DEFAULT 'public',
                created_by INTEGER NOT NULL REFERENCES lost_ark_manager.users(id),
                settings JSONB DEFAULT '{}',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
            
            // Таблица сообщений чата
            `CREATE TABLE IF NOT EXISTS lost_ark_manager.chat_messages (
                id SERIAL PRIMARY KEY,
                channel_id INTEGER NOT NULL REFERENCES lost_ark_manager.chat_channels(id) ON DELETE CASCADE,
                user_id INTEGER NOT NULL REFERENCES lost_ark_manager.users(id) ON DELETE CASCADE,
                message TEXT NOT NULL,
                message_type VARCHAR(20) DEFAULT 'text',
                metadata JSONB DEFAULT '{}',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
            
            // Таблица уведомлений
            `CREATE TABLE IF NOT EXISTS lost_ark_manager.notifications (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES lost_ark_manager.users(id) ON DELETE CASCADE,
                title VARCHAR(200) NOT NULL,
                message TEXT NOT NULL,
                type VARCHAR(20) DEFAULT 'info',
                read_at TIMESTAMP NULL,
                metadata JSONB DEFAULT '{}',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
            
            // Таблица логов рейдов
            `CREATE TABLE IF NOT EXISTS lost_ark_manager.raid_logs (
                id SERIAL PRIMARY KEY,
                raid_id INTEGER NOT NULL REFERENCES lost_ark_manager.raids(id) ON DELETE CASCADE,
                user_id INTEGER NOT NULL REFERENCES lost_ark_manager.users(id) ON DELETE CASCADE,
                action VARCHAR(50) NOT NULL,
                details JSONB DEFAULT '{}',
                ip_address INET,
                user_agent TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
            
            // Таблица настроек пользователей
            `CREATE TABLE IF NOT EXISTS lost_ark_manager.user_settings (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES lost_ark_manager.users(id) ON DELETE CASCADE,
                setting_key VARCHAR(100) NOT NULL,
                setting_value TEXT,
                setting_type VARCHAR(20) DEFAULT 'string',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, setting_key)
            )`,
            
            // Таблица гильдий
            `CREATE TABLE IF NOT EXISTS lost_ark_manager.guilds (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL UNIQUE,
                tag VARCHAR(10) UNIQUE,
                description TEXT,
                leader_id INTEGER NOT NULL REFERENCES lost_ark_manager.users(id),
                officers JSONB DEFAULT '[]',
                members JSONB DEFAULT '[]',
                settings JSONB DEFAULT '{}',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
            
            // Таблица событий гильдии
            `CREATE TABLE IF NOT EXISTS lost_ark_manager.guild_events (
                id SERIAL PRIMARY KEY,
                guild_id INTEGER NOT NULL REFERENCES lost_ark_manager.guilds(id) ON DELETE CASCADE,
                name VARCHAR(100) NOT NULL,
                description TEXT,
                event_type VARCHAR(50) NOT NULL,
                start_time TIMESTAMP NOT NULL,
                end_time TIMESTAMP,
                max_participants INTEGER,
                participants JSONB DEFAULT '[]',
                settings JSONB DEFAULT '{}',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`
        ];

        for (const table of tables) {
            try {
                await this.pool.query(table);
            } catch (error) {
                console.error('PostgreSQL: Ошибка создания таблицы:', error);
            }
        }

        // Создаем индексы для производительности
        await this.createIndexes();
        
        console.log('PostgreSQL: Таблицы созданы/проверены');
    }

    async createIndexes() {
        const indexes = [
            // Индексы для пользователей
            'CREATE INDEX IF NOT EXISTS idx_users_site_user_id ON lost_ark_manager.users(site_user_id)',
            'CREATE INDEX IF NOT EXISTS idx_users_username ON lost_ark_manager.users(username)',
            'CREATE INDEX IF NOT EXISTS idx_users_email ON lost_ark_manager.users(email)',
            
            // Индексы для персонажей
            'CREATE INDEX IF NOT EXISTS idx_characters_user_id ON lost_ark_manager.characters(user_id)',
            'CREATE INDEX IF NOT EXISTS idx_characters_name ON lost_ark_manager.characters(name)',
            'CREATE INDEX IF NOT EXISTS idx_characters_class ON lost_ark_manager.characters(class)',
            'CREATE INDEX IF NOT EXISTS idx_characters_item_level ON lost_ark_manager.characters(item_level)',
            
            // Индексы для рейдов
            'CREATE INDEX IF NOT EXISTS idx_raids_status ON lost_ark_manager.raids(status)',
            'CREATE INDEX IF NOT EXISTS idx_raids_date ON lost_ark_manager.raids(date)',
            'CREATE INDEX IF NOT EXISTS idx_raids_leader_id ON lost_ark_manager.raids(leader_id)',
            'CREATE INDEX IF NOT EXISTS idx_raids_type ON lost_ark_manager.raids(type)',
            
            // Индексы для участников
            'CREATE INDEX IF NOT EXISTS idx_raid_participants_raid_id ON lost_ark_manager.raid_participants(raid_id)',
            'CREATE INDEX IF NOT EXISTS idx_raid_participants_user_id ON lost_ark_manager.raid_participants(user_id)',
            
            // Индексы для чата
            'CREATE INDEX IF NOT EXISTS idx_chat_messages_channel_id ON lost_ark_manager.chat_messages(channel_id)',
            'CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON lost_ark_manager.chat_messages(user_id)',
            'CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON lost_ark_manager.chat_messages(created_at)',
            
            // Индексы для уведомлений
            'CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON lost_ark_manager.notifications(user_id)',
            'CREATE INDEX IF NOT EXISTS idx_notifications_read_at ON lost_ark_manager.notifications(read_at)',
            
            // Индексы для логов
            'CREATE INDEX IF NOT EXISTS idx_raid_logs_raid_id ON lost_ark_manager.raid_logs(raid_id)',
            'CREATE INDEX IF NOT EXISTS idx_raid_logs_user_id ON lost_ark_manager.raid_logs(user_id)',
            'CREATE INDEX IF NOT EXISTS idx_raid_logs_created_at ON lost_ark_manager.raid_logs(created_at)',
            
            // Индексы для настроек
            'CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON lost_ark_manager.user_settings(user_id)',
            'CREATE INDEX IF NOT EXISTS idx_user_settings_key ON lost_ark_manager.user_settings(setting_key)',
            
            // Индексы для гильдий
            'CREATE INDEX IF NOT EXISTS idx_guilds_leader_id ON lost_ark_manager.guilds(leader_id)',
            'CREATE INDEX IF NOT EXISTS idx_guilds_name ON lost_ark_manager.guilds(name)',
            
            // Индексы для событий гильдии
            'CREATE INDEX IF NOT EXISTS idx_guild_events_guild_id ON lost_ark_manager.guild_events(guild_id)',
            'CREATE INDEX IF NOT EXISTS idx_guild_events_start_time ON lost_ark_manager.guild_events(start_time)'
        ];

        for (const index of indexes) {
            try {
                await this.pool.query(index);
            } catch (error) {
                console.error('PostgreSQL: Ошибка создания индекса:', error);
            }
        }

        console.log('PostgreSQL: Индексы созданы');
    }

    // Методы для интеграции с основным сайтом
    async syncUserWithSite(siteUserId, userData) {
        try {
            // Проверяем, есть ли уже пользователь
            const existingUser = await this.getUserBySiteId(siteUserId);
            
            if (existingUser) {
                // Обновляем существующего пользователя
                await this.pool.query(`
                    UPDATE lost_ark_manager.users 
                    SET username = $1, email = $2, updated_at = CURRENT_TIMESTAMP
                    WHERE site_user_id = $3
                `, [userData.username, userData.email, siteUserId]);
                
                console.log(`PostgreSQL: Пользователь ${userData.username} обновлен`);
                return existingUser.id;
            } else {
                // Создаем нового пользователя
                const result = await this.pool.query(`
                    INSERT INTO lost_ark_manager.users (site_user_id, username, email, role, avatar)
                    VALUES ($1, $2, $3, $4, $5)
                    RETURNING id
                `, [siteUserId, userData.username, userData.email, userData.role || 'user', userData.avatar]);
                
                const newUserId = result.rows[0].id;
                console.log(`PostgreSQL: Пользователь ${userData.username} создан с ID ${newUserId}`);
                return newUserId;
            }
        } catch (error) {
            console.error('PostgreSQL: Ошибка синхронизации пользователя:', error);
            throw error;
        }
    }

    async getUserBySiteId(siteUserId) {
        try {
            const result = await this.pool.query(`
                SELECT * FROM lost_ark_manager.users WHERE site_user_id = $1
            `, [siteUserId]);
            
            return result.rows[0] || null;
        } catch (error) {
            console.error('PostgreSQL: Ошибка получения пользователя по site_user_id:', error);
            throw error;
        }
    }

    // Методы для работы с пользователями
    async createUser(userData) {
        try {
            const result = await this.pool.query(`
                INSERT INTO lost_ark_manager.users (site_user_id, username, email, role, avatar, preferences)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING id
            `, [
                userData.siteUserId || null,
                userData.username,
                userData.email,
                userData.role || 'user',
                userData.avatar,
                JSON.stringify(userData.preferences || {})
            ]);
            
            return result.rows[0].id;
        } catch (error) {
            console.error('PostgreSQL: Ошибка создания пользователя:', error);
            throw error;
        }
    }

    async getUserById(id) {
        try {
            const result = await this.pool.query(`
                SELECT * FROM lost_ark_manager.users WHERE id = $1
            `, [id]);
            
            return result.rows[0] || null;
        } catch (error) {
            console.error('PostgreSQL: Ошибка получения пользователя:', error);
            throw error;
        }
    }

    async getUserByUsername(username) {
        try {
            const result = await this.pool.query(`
                SELECT * FROM lost_ark_manager.users WHERE username = $1
            `, [username]);
            
            return result.rows[0] || null;
        } catch (error) {
            console.error('PostgreSQL: Ошибка получения пользователя по имени:', error);
            throw error;
        }
    }

    async updateUser(id, updates) {
        try {
            const fields = [];
            const values = [];
            let paramIndex = 1;
            
            for (const [key, value] of Object.entries(updates)) {
                if (key === 'preferences') {
                    fields.push(`${key} = $${paramIndex}`);
                    values.push(JSON.stringify(value));
                } else {
                    fields.push(`${key} = $${paramIndex}`);
                    values.push(value);
                }
                paramIndex++;
            }
            
            fields.push('updated_at = CURRENT_TIMESTAMP');
            values.push(id);
            
            await this.pool.query(`
                UPDATE lost_ark_manager.users 
                SET ${fields.join(', ')} 
                WHERE id = $${paramIndex}
            `, values);
            
            return true;
        } catch (error) {
            console.error('PostgreSQL: Ошибка обновления пользователя:', error);
            throw error;
        }
    }

    // Методы для работы с персонажами
    async createCharacter(characterData) {
        try {
            const result = await this.pool.query(`
                INSERT INTO lost_ark_manager.characters 
                (user_id, name, class, level, item_level, server, engravings, gems, cards, equipment, stats)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                RETURNING id
            `, [
                characterData.userId,
                characterData.name,
                characterData.class,
                characterData.level,
                characterData.itemLevel,
                characterData.server,
                JSON.stringify(characterData.engravings || []),
                JSON.stringify(characterData.gems || []),
                JSON.stringify(characterData.cards || []),
                JSON.stringify(characterData.equipment || {}),
                JSON.stringify(characterData.stats || {})
            ]);
            
            return result.rows[0].id;
        } catch (error) {
            console.error('PostgreSQL: Ошибка создания персонажа:', error);
            throw error;
        }
    }

    async getCharactersByUserId(userId) {
        try {
            const result = await this.pool.query(`
                SELECT * FROM lost_ark_manager.characters 
                WHERE user_id = $1 
                ORDER BY created_at DESC
            `, [userId]);
            
            return result.rows.map(row => ({
                ...row,
                engravings: row.engravings || [],
                gems: row.gems || [],
                cards: row.cards || [],
                equipment: row.equipment || {},
                stats: row.stats || {}
            }));
        } catch (error) {
            console.error('PostgreSQL: Ошибка получения персонажей:', error);
            throw error;
        }
    }

    async updateCharacter(id, updates) {
        try {
            const fields = [];
            const values = [];
            let paramIndex = 1;
            
            for (const [key, value] of Object.entries(updates)) {
                if (key === 'engravings' || key === 'gems' || key === 'cards' || 
                    key === 'equipment' || key === 'stats') {
                    fields.push(`${key} = $${paramIndex}`);
                    values.push(JSON.stringify(value));
                } else if (key === 'itemLevel') {
                    fields.push('item_level = $' + paramIndex);
                    values.push(value);
                } else {
                    fields.push(`${key} = $${paramIndex}`);
                    values.push(value);
                }
                paramIndex++;
            }
            
            fields.push('updated_at = CURRENT_TIMESTAMP');
            values.push(id);
            
            await this.pool.query(`
                UPDATE lost_ark_manager.characters 
                SET ${fields.join(', ')} 
                WHERE id = $${paramIndex}
            `, values);
            
            return true;
        } catch (error) {
            console.error('PostgreSQL: Ошибка обновления персонажа:', error);
            throw error;
        }
    }

    async deleteCharacter(id) {
        try {
            await this.pool.query(`
                DELETE FROM lost_ark_manager.characters WHERE id = $1
            `, [id]);
            
            return true;
        } catch (error) {
            console.error('PostgreSQL: Ошибка удаления персонажа:', error);
            throw error;
        }
    }

    // Методы для работы с рейдами
    async createRaid(raidData) {
        try {
            const result = await this.pool.query(`
                INSERT INTO lost_ark_manager.raids 
                (name, type, difficulty, status, date, time, duration, max_participants, 
                 min_item_level, description, requirements, rewards, leader_id, leader_name, notes, settings)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
                RETURNING id
            `, [
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
                raidData.leaderId,
                raidData.leaderName,
                raidData.notes,
                JSON.stringify(raidData.settings || {})
            ]);
            
            return result.rows[0].id;
        } catch (error) {
            console.error('PostgreSQL: Ошибка создания рейда:', error);
            throw error;
        }
    }

    async getAllRaids() {
        try {
            const result = await this.pool.query(`
                SELECT r.*, u.username as leader_username
                FROM lost_ark_manager.raids r
                LEFT JOIN lost_ark_manager.users u ON r.leader_id = u.id
                ORDER BY r.created_at DESC
            `);
            
            return result.rows.map(row => ({
                ...row,
                requirements: row.requirements || [],
                rewards: row.rewards || [],
                settings: row.settings || {},
                maxParticipants: row.max_participants,
                minItemLevel: row.min_item_level
            }));
        } catch (error) {
            console.error('PostgreSQL: Ошибка получения рейдов:', error);
            throw error;
        }
    }

    async updateRaid(id, updates) {
        try {
            const fields = [];
            const values = [];
            let paramIndex = 1;
            
            for (const [key, value] of Object.entries(updates)) {
                if (key === 'requirements' || key === 'rewards' || key === 'settings') {
                    fields.push(`${key} = $${paramIndex}`);
                    values.push(JSON.stringify(value));
                } else if (key === 'maxParticipants') {
                    fields.push('max_participants = $' + paramIndex);
                    values.push(value);
                } else if (key === 'minItemLevel') {
                    fields.push('min_item_level = $' + paramIndex);
                    values.push(value);
                } else {
                    fields.push(`${key} = $${paramIndex}`);
                    values.push(value);
                }
                paramIndex++;
            }
            
            fields.push('updated_at = CURRENT_TIMESTAMP');
            values.push(id);
            
            await this.pool.query(`
                UPDATE lost_ark_manager.raids 
                SET ${fields.join(', ')} 
                WHERE id = $${paramIndex}
            `, values);
            
            return true;
        } catch (error) {
            console.error('PostgreSQL: Ошибка обновления рейда:', error);
            throw error;
        }
    }

    // Методы для работы с чатом
    async createChannel(channelData) {
        try {
            const result = await this.pool.query(`
                INSERT INTO lost_ark_manager.chat_channels (name, type, created_by, settings)
                VALUES ($1, $2, $3, $4)
                RETURNING id
            `, [
                channelData.name,
                channelData.type,
                channelData.createdBy,
                JSON.stringify(channelData.settings || {})
            ]);
            
            return result.rows[0].id;
        } catch (error) {
            console.error('PostgreSQL: Ошибка создания канала:', error);
            throw error;
        }
    }

    async getAllChannels() {
        try {
            const result = await this.pool.query(`
                SELECT * FROM lost_ark_manager.chat_channels
                ORDER BY created_at DESC
            `);
            
            return result.rows.map(row => ({
                ...row,
                settings: row.settings || {}
            }));
        } catch (error) {
            console.error('PostgreSQL: Ошибка получения каналов:', error);
            throw error;
        }
    }

    async saveMessage(messageData) {
        try {
            const result = await this.pool.query(`
                INSERT INTO lost_ark_manager.chat_messages (channel_id, user_id, message, message_type, metadata)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id
            `, [
                messageData.channelId,
                messageData.userId,
                messageData.message,
                messageData.messageType || 'text',
                JSON.stringify(messageData.metadata || {})
            ]);
            
            return result.rows[0].id;
        } catch (error) {
            console.error('PostgreSQL: Ошибка сохранения сообщения:', error);
            throw error;
        }
    }

    async getChannelMessages(channelId, limit = 100) {
        try {
            const result = await this.pool.query(`
                SELECT m.*, u.username, u.avatar
                FROM lost_ark_manager.chat_messages m
                JOIN lost_ark_manager.users u ON m.user_id = u.id
                WHERE m.channel_id = $1
                ORDER BY m.created_at DESC
                LIMIT $2
            `, [channelId, limit]);
            
            return result.rows.reverse().map(row => ({
                ...row,
                metadata: row.metadata || {}
            }));
        } catch (error) {
            console.error('PostgreSQL: Ошибка получения сообщений:', error);
            throw error;
        }
    }

    // Методы для работы с настройками
    async setSetting(userId, key, value) {
        try {
            await this.pool.query(`
                INSERT INTO lost_ark_manager.user_settings (user_id, setting_key, setting_value)
                VALUES ($1, $2, $3)
                ON CONFLICT (user_id, setting_key) 
                DO UPDATE SET setting_value = EXCLUDED.setting_value, updated_at = CURRENT_TIMESTAMP
            `, [userId, key, value]);
            
            return true;
        } catch (error) {
            console.error('PostgreSQL: Ошибка сохранения настройки:', error);
            throw error;
        }
    }

    async getSetting(userId, key) {
        try {
            const result = await this.pool.query(`
                SELECT setting_value FROM lost_ark_manager.user_settings 
                WHERE user_id = $1 AND setting_key = $2
            `, [userId, key]);
            
            return result.rows[0]?.setting_value || null;
        } catch (error) {
            console.error('PostgreSQL: Ошибка получения настройки:', error);
            throw error;
        }
    }

    // Методы для логирования
    async logRaidAction(raidId, userId, action, details = {}) {
        try {
            await this.pool.query(`
                INSERT INTO lost_ark_manager.raid_logs (raid_id, user_id, action, details)
                VALUES ($1, $2, $3, $4)
            `, [raidId, userId, action, JSON.stringify(details)]);
            
            return true;
        } catch (error) {
            console.error('PostgreSQL: Ошибка логирования действия:', error);
            throw error;
        }
    }

    // Методы для уведомлений
    async createNotification(userId, title, message, type = 'info', metadata = {}) {
        try {
            const result = await this.pool.query(`
                INSERT INTO lost_ark_manager.notifications (user_id, title, message, type, metadata)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id
            `, [userId, title, message, type, JSON.stringify(metadata)]);
            
            return result.rows[0].id;
        } catch (error) {
            console.error('PostgreSQL: Ошибка создания уведомления:', error);
            throw error;
        }
    }

    // Методы для статистики
    async getStats() {
        try {
            const [userCount, characterCount, raidCount, messageCount] = await Promise.all([
                this.pool.query('SELECT COUNT(*) as count FROM lost_ark_manager.users'),
                this.pool.query('SELECT COUNT(*) as count FROM lost_ark_manager.characters'),
                this.pool.query('SELECT COUNT(*) as count FROM lost_ark_manager.raids'),
                this.pool.query('SELECT COUNT(*) as count FROM lost_ark_manager.chat_messages')
            ]);
            
            return {
                users: parseInt(userCount.rows[0].count),
                characters: parseInt(characterCount.rows[0].count),
                raids: parseInt(raidCount.rows[0].count),
                messages: parseInt(messageCount.rows[0].count)
            };
        } catch (error) {
            console.error('PostgreSQL: Ошибка получения статистики:', error);
            throw error;
        }
    }

    // Методы для резервного копирования
    async backup() {
        try {
            // PostgreSQL имеет встроенные инструменты для бэкапа
            // pg_dump -h localhost -U username -d database_name > backup.sql
            console.log('PostgreSQL: Используйте pg_dump для резервного копирования');
            return true;
        } catch (error) {
            console.error('PostgreSQL: Ошибка резервного копирования:', error);
            throw error;
        }
    }

    // Методы для очистки
    async cleanup() {
        try {
            // Удаляем старые уведомления (старше 30 дней)
            await this.pool.query(`
                DELETE FROM lost_ark_manager.notifications 
                WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '30 days'
            `);
            
            // Удаляем старые логи (старше 90 дней)
            await this.pool.query(`
                DELETE FROM lost_ark_manager.raid_logs 
                WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '90 days'
            `);
            
            console.log('PostgreSQL: Очистка завершена');
            return true;
        } catch (error) {
            console.error('PostgreSQL: Ошибка очистки:', error);
            throw error;
        }
    }

    // Закрытие соединения
    async close() {
        if (this.pool) {
            await this.pool.end();
            console.log('PostgreSQL: Соединение закрыто');
        }
    }
}

module.exports = PostgreSQLDatabaseAdapter;