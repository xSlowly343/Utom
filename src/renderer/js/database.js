/**
 * Database Module - Handles SQLite database operations
 */
class DatabaseModule {
    constructor() {
        this.db = null;
        this.isInitialized = false;
        this.init();
    }

    async init() {
        try {
            await this.initializeDatabase();
            this.isInitialized = true;
            console.log('Database initialized successfully');
        } catch (error) {
            console.error('Failed to initialize database:', error);
            // Fallback to localStorage
            this.useLocalStorage = true;
        }
    }

    async initializeDatabase() {
        // In a real Electron app, this would use better-sqlite3
        // For now, we'll simulate database operations with localStorage
        this.useLocalStorage = true;
        
        // Initialize tables structure
        this.tables = {
            raids: 'raids',
            characters: 'characters',
            scheduled_raids: 'scheduled_raids',
            raid_participants: 'raid_participants',
            chat_messages: 'chat_messages',
            user_settings: 'user_settings',
            notifications: 'notifications'
        };

        // Create tables if they don't exist
        await this.createTables();
    }

    async createTables() {
        if (this.useLocalStorage) {
            // Initialize localStorage with table structure
            Object.values(this.tables).forEach(table => {
                if (!localStorage.getItem(table)) {
                    localStorage.setItem(table, JSON.stringify([]));
                }
            });
            return;
        }

        // SQL table creation (for future use with actual SQLite)
        const createTableQueries = {
            raids: `
                CREATE TABLE IF NOT EXISTS raids (
                    id TEXT PRIMARY KEY,
                    title TEXT NOT NULL,
                    type TEXT NOT NULL,
                    difficulty TEXT,
                    min_item_level INTEGER,
                    max_participants INTEGER,
                    description TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `,
            characters: `
                CREATE TABLE IF NOT EXISTS characters (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    class TEXT NOT NULL,
                    level INTEGER NOT NULL,
                    item_level REAL,
                    server TEXT,
                    guild TEXT,
                    engravings TEXT,
                    stats TEXT,
                    gear TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `,
            scheduled_raids: `
                CREATE TABLE IF NOT EXISTS scheduled_raids (
                    id TEXT PRIMARY KEY,
                    raid_id TEXT NOT NULL,
                    scheduled_date DATE NOT NULL,
                    scheduled_time TIME NOT NULL,
                    duration INTEGER,
                    status TEXT DEFAULT 'scheduled',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (raid_id) REFERENCES raids (id)
                )
            `,
            raid_participants: `
                CREATE TABLE IF NOT EXISTS raid_participants (
                    id TEXT PRIMARY KEY,
                    raid_id TEXT NOT NULL,
                    character_id TEXT NOT NULL,
                    role TEXT,
                    status TEXT DEFAULT 'confirmed',
                    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (raid_id) REFERENCES raids (id),
                    FOREIGN KEY (character_id) REFERENCES characters (id)
                )
            `,
            chat_messages: `
                CREATE TABLE IF NOT EXISTS chat_messages (
                    id TEXT PRIMARY KEY,
                    channel TEXT NOT NULL,
                    sender TEXT NOT NULL,
                    message TEXT NOT NULL,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                    type TEXT DEFAULT 'text'
                )
            `,
            user_settings: `
                CREATE TABLE IF NOT EXISTS user_settings (
                    key TEXT PRIMARY KEY,
                    value TEXT NOT NULL,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `,
            notifications: `
                CREATE TABLE IF NOT EXISTS notifications (
                    id TEXT PRIMARY KEY,
                    type TEXT NOT NULL,
                    title TEXT NOT NULL,
                    message TEXT,
                    read BOOLEAN DEFAULT FALSE,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `
        };

        // Execute create table queries
        for (const [table, query] of Object.entries(createTableQueries)) {
            try {
                await this.executeQuery(query);
            } catch (error) {
                console.error(`Error creating table ${table}:`, error);
            }
        }
    }

    // Generic query execution
    async executeQuery(query, params = []) {
        if (this.useLocalStorage) {
            // Simulate query execution for localStorage
            return this.simulateQuery(query, params);
        }

        // Future: Execute actual SQLite query
        // return this.db.prepare(query).all(params);
    }

    simulateQuery(query, params) {
        // Simple query simulation for localStorage
        const queryLower = query.toLowerCase();
        
        if (queryLower.includes('insert into')) {
            return this.handleInsert(query, params);
        } else if (queryLower.includes('select')) {
            return this.handleSelect(query, params);
        } else if (queryLower.includes('update')) {
            return this.handleUpdate(query, params);
        } else if (queryLower.includes('delete')) {
            return this.handleDelete(query, params);
        }
        
        return { success: true };
    }

    // CRUD Operations for Raids
    async createRaid(raidData) {
        const raid = {
            id: this.generateId(),
            ...raidData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        if (this.useLocalStorage) {
            const raids = JSON.parse(localStorage.getItem(this.tables.raids) || '[]');
            raids.push(raid);
            localStorage.setItem(this.tables.raids, JSON.stringify(raids));
            return raid;
        }

        const query = `
            INSERT INTO raids (id, title, type, difficulty, min_item_level, max_participants, description, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        await this.executeQuery(query, [
            raid.id, raid.title, raid.type, raid.difficulty, 
            raid.min_item_level, raid.max_participants, raid.description,
            raid.created_at, raid.updated_at
        ]);

        return raid;
    }

    async getRaids(filters = {}) {
        if (this.useLocalStorage) {
            let raids = JSON.parse(localStorage.getItem(this.tables.raids) || '[]');
            
            // Apply filters
            if (filters.type) {
                raids = raids.filter(raid => raid.type === filters.type);
            }
            if (filters.difficulty) {
                raids = raids.filter(raid => raid.difficulty === filters.difficulty);
            }
            if (filters.minItemLevel) {
                raids = raids.filter(raid => raid.min_item_level >= filters.minItemLevel);
            }
            
            return raids;
        }

        let query = 'SELECT * FROM raids WHERE 1=1';
        const params = [];
        
        if (filters.type) {
            query += ' AND type = ?';
            params.push(filters.type);
        }
        if (filters.difficulty) {
            query += ' AND difficulty = ?';
            params.push(filters.difficulty);
        }
        if (filters.minItemLevel) {
            query += ' AND min_item_level >= ?';
            params.push(filters.minItemLevel);
        }
        
        query += ' ORDER BY created_at DESC';
        
        return await this.executeQuery(query, params);
    }

    async getRaidById(id) {
        if (this.useLocalStorage) {
            const raids = JSON.parse(localStorage.getItem(this.tables.raids) || '[]');
            return raids.find(raid => raid.id === id) || null;
        }

        const query = 'SELECT * FROM raids WHERE id = ?';
        const result = await this.executeQuery(query, [id]);
        return result[0] || null;
    }

    async updateRaid(id, updateData) {
        if (this.useLocalStorage) {
            const raids = JSON.parse(localStorage.getItem(this.tables.raids) || '[]');
            const index = raids.findIndex(raid => raid.id === id);
            if (index !== -1) {
                raids[index] = { ...raids[index], ...updateData, updated_at: new Date().toISOString() };
                localStorage.setItem(this.tables.raids, JSON.stringify(raids));
                return raids[index];
            }
            return null;
        }

        const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
        const values = Object.values(updateData);
        values.push(new Date().toISOString(), id);
        
        const query = `UPDATE raids SET ${fields}, updated_at = ? WHERE id = ?`;
        await this.executeQuery(query, values);
        
        return await this.getRaidById(id);
    }

    async deleteRaid(id) {
        if (this.useLocalStorage) {
            const raids = JSON.parse(localStorage.getItem(this.tables.raids) || '[]');
            const filteredRaids = raids.filter(raid => raid.id !== id);
            localStorage.setItem(this.tables.raids, JSON.stringify(filteredRaids));
            return true;
        }

        const query = 'DELETE FROM raids WHERE id = ?';
        await this.executeQuery(query, [id]);
        return true;
    }

    // CRUD Operations for Characters
    async createCharacter(characterData) {
        const character = {
            id: this.generateId(),
            ...characterData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        if (this.useLocalStorage) {
            const characters = JSON.parse(localStorage.getItem(this.tables.characters) || '[]');
            characters.push(character);
            localStorage.setItem(this.tables.characters, JSON.stringify(characters));
            return character;
        }

        const query = `
            INSERT INTO characters (id, name, class, level, item_level, server, guild, engravings, stats, gear, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        await this.executeQuery(query, [
            character.id, character.name, character.class, character.level,
            character.item_level, character.server, character.guild,
            JSON.stringify(character.engravings), JSON.stringify(character.stats),
            JSON.stringify(character.gear), character.created_at, character.updated_at
        ]);

        return character;
    }

    async getCharacters(filters = {}) {
        if (this.useLocalStorage) {
            let characters = JSON.parse(localStorage.getItem(this.tables.characters) || '[]');
            
            // Apply filters
            if (filters.class) {
                characters = characters.filter(char => char.class === filters.class);
            }
            if (filters.server) {
                characters = characters.filter(char => char.server === filters.server);
            }
            if (filters.minLevel) {
                characters = characters.filter(char => char.level >= filters.minLevel);
            }
            if (filters.minItemLevel) {
                characters = characters.filter(char => char.item_level >= filters.minItemLevel);
            }
            
            return characters;
        }

        let query = 'SELECT * FROM characters WHERE 1=1';
        const params = [];
        
        if (filters.class) {
            query += ' AND class = ?';
            params.push(filters.class);
        }
        if (filters.server) {
            query += ' AND server = ?';
            params.push(filters.server);
        }
        if (filters.minLevel) {
            query += ' AND level >= ?';
            params.push(filters.minLevel);
        }
        if (filters.minItemLevel) {
            query += ' AND item_level >= ?';
            params.push(filters.minItemLevel);
        }
        
        query += ' ORDER BY level DESC, item_level DESC';
        
        return await this.executeQuery(query, params);
    }

    async getCharacterById(id) {
        if (this.useLocalStorage) {
            const characters = JSON.parse(localStorage.getItem(this.tables.characters) || '[]');
            return characters.find(char => char.id === id) || null;
        }

        const query = 'SELECT * FROM characters WHERE id = ?';
        const result = await this.executeQuery(query, [id]);
        return result[0] || null;
    }

    async updateCharacter(id, updateData) {
        if (this.useLocalStorage) {
            const characters = JSON.parse(localStorage.getItem(this.tables.characters) || '[]');
            const index = characters.findIndex(char => char.id === id);
            if (index !== -1) {
                characters[index] = { ...characters[index], ...updateData, updated_at: new Date().toISOString() };
                localStorage.setItem(this.tables.characters, JSON.stringify(characters));
                return characters[index];
            }
            return null;
        }

        const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
        const values = Object.values(updateData);
        values.push(new Date().toISOString(), id);
        
        const query = `UPDATE characters SET ${fields}, updated_at = ? WHERE id = ?`;
        await this.executeQuery(query, values);
        
        return await this.getCharacterById(id);
    }

    async deleteCharacter(id) {
        if (this.useLocalStorage) {
            const characters = JSON.parse(localStorage.getItem(this.tables.characters) || '[]');
            const filteredCharacters = characters.filter(char => char.id !== id);
            localStorage.setItem(this.tables.characters, JSON.stringify(filteredCharacters));
            return true;
        }

        const query = 'DELETE FROM characters WHERE id = ?';
        await this.executeQuery(query, [id]);
        return true;
    }

    // Scheduled Raids Operations
    async createScheduledRaid(scheduledRaidData) {
        const scheduledRaid = {
            id: this.generateId(),
            ...scheduledRaidData,
            created_at: new Date().toISOString()
        };

        if (this.useLocalStorage) {
            const scheduledRaids = JSON.parse(localStorage.getItem(this.tables.scheduled_raids) || '[]');
            scheduledRaids.push(scheduledRaid);
            localStorage.setItem(this.tables.scheduled_raids, JSON.stringify(scheduledRaids));
            return scheduledRaid;
        }

        const query = `
            INSERT INTO scheduled_raids (id, raid_id, scheduled_date, scheduled_time, duration, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        
        await this.executeQuery(query, [
            scheduledRaid.id, scheduledRaid.raid_id, scheduledRaid.scheduled_date,
            scheduledRaid.scheduled_time, scheduledRaid.duration, scheduledRaid.status,
            scheduledRaid.created_at
        ]);

        return scheduledRaid;
    }

    async getScheduledRaids(filters = {}) {
        if (this.useLocalStorage) {
            let scheduledRaids = JSON.parse(localStorage.getItem(this.tables.scheduled_raids) || '[]');
            
            // Apply filters
            if (filters.status) {
                scheduledRaids = scheduledRaids.filter(sr => sr.status === filters.status);
            }
            if (filters.date) {
                scheduledRaids = scheduledRaids.filter(sr => sr.scheduled_date === filters.date);
            }
            if (filters.raidId) {
                scheduledRaids = scheduledRaids.filter(sr => sr.raid_id === filters.raidId);
            }
            
            return scheduledRaids;
        }

        let query = 'SELECT * FROM scheduled_raids WHERE 1=1';
        const params = [];
        
        if (filters.status) {
            query += ' AND status = ?';
            params.push(filters.status);
        }
        if (filters.date) {
            query += ' AND scheduled_date = ?';
            params.push(filters.date);
        }
        if (filters.raidId) {
            query += ' AND raid_id = ?';
            params.push(filters.raidId);
        }
        
        query += ' ORDER BY scheduled_date ASC, scheduled_time ASC';
        
        return await this.executeQuery(query, params);
    }

    // Chat Operations
    async saveChatMessage(messageData) {
        const message = {
            id: this.generateId(),
            ...messageData,
            timestamp: new Date().toISOString()
        };

        if (this.useLocalStorage) {
            const messages = JSON.parse(localStorage.getItem(this.tables.chat_messages) || '[]');
            messages.push(message);
            localStorage.setItem(this.tables.chat_messages, JSON.stringify(messages));
            return message;
        }

        const query = `
            INSERT INTO chat_messages (id, channel, sender, message, timestamp, type)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        await this.executeQuery(query, [
            message.id, message.channel, message.sender,
            message.message, message.timestamp, message.type
        ]);

        return message;
    }

    async getChatMessages(channel, limit = 50) {
        if (this.useLocalStorage) {
            const messages = JSON.parse(localStorage.getItem(this.tables.chat_messages) || '[]');
            return messages
                .filter(msg => msg.channel === channel)
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .slice(0, limit);
        }

        const query = `
            SELECT * FROM chat_messages 
            WHERE channel = ? 
            ORDER BY timestamp DESC 
            LIMIT ?
        `;
        
        return await this.executeQuery(query, [channel, limit]);
    }

    // Settings Operations
    async getSetting(key, defaultValue = null) {
        if (this.useLocalStorage) {
            const settings = JSON.parse(localStorage.getItem(this.tables.user_settings) || '{}');
            return settings[key] !== undefined ? settings[key] : defaultValue;
        }

        const query = 'SELECT value FROM user_settings WHERE key = ?';
        const result = await this.executeQuery(query, [key]);
        return result[0] ? result[0].value : defaultValue;
    }

    async setSetting(key, value) {
        if (this.useLocalStorage) {
            const settings = JSON.parse(localStorage.getItem(this.tables.user_settings) || '{}');
            settings[key] = value;
            localStorage.setItem(this.tables.user_settings, JSON.stringify(settings));
            return true;
        }

        const query = `
            INSERT OR REPLACE INTO user_settings (key, value, updated_at)
            VALUES (?, ?, ?)
        `;
        
        await this.executeQuery(query, [key, value, new Date().toISOString()]);
        return true;
    }

    // Utility methods
    generateId() {
        return 'db_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Backup and restore
    async exportData() {
        const data = {};
        
        for (const [tableName, tableKey] of Object.entries(this.tables)) {
            if (this.useLocalStorage) {
                data[tableName] = JSON.parse(localStorage.getItem(tableKey) || '[]');
            } else {
                data[tableName] = await this.executeQuery(`SELECT * FROM ${tableKey}`);
            }
        }
        
        return {
            exportDate: new Date().toISOString(),
            version: '1.0.0',
            data
        };
    }

    async importData(importData) {
        try {
            for (const [tableName, tableData] of Object.entries(importData.data)) {
                if (this.useLocalStorage) {
                    localStorage.setItem(this.tables[tableName], JSON.stringify(tableData));
                } else {
                    // Clear existing data and insert new
                    await this.executeQuery(`DELETE FROM ${this.tables[tableName]}`);
                    
                    if (Array.isArray(tableData) && tableData.length > 0) {
                        const columns = Object.keys(tableData[0]);
                        const placeholders = columns.map(() => '?').join(', ');
                        const query = `INSERT INTO ${this.tables[tableName]} (${columns.join(', ')}) VALUES (${placeholders})`;
                        
                        for (const row of tableData) {
                            await this.executeQuery(query, Object.values(row));
                        }
                    }
                }
            }
            
            return { success: true, message: 'Data imported successfully' };
        } catch (error) {
            return { success: false, message: 'Error importing data: ' + error.message };
        }
    }

    // Database maintenance
    async optimize() {
        if (this.useLocalStorage) {
            // Clean up old data
            const tables = Object.values(this.tables);
            for (const table of tables) {
                const data = JSON.parse(localStorage.getItem(table) || '[]');
                if (data.length > 1000) {
                    // Keep only last 1000 items
                    const cleanedData = data.slice(-1000);
                    localStorage.setItem(table, JSON.stringify(cleanedData));
                }
            }
            return { success: true, message: 'LocalStorage optimized' };
        }

        // Future: SQLite optimization
        // await this.executeQuery('VACUUM');
        // await this.executeQuery('ANALYZE');
        return { success: true, message: 'Database optimized' };
    }

    // Statistics
    async getDatabaseStats() {
        const stats = {};
        
        for (const [tableName, tableKey] of Object.entries(this.tables)) {
            if (this.useLocalStorage) {
                const data = JSON.parse(localStorage.getItem(tableKey) || '[]');
                stats[tableName] = {
                    count: data.length,
                    size: JSON.stringify(data).length
                };
            } else {
                const result = await this.executeQuery(`SELECT COUNT(*) as count FROM ${tableKey}`);
                stats[tableName] = {
                    count: result[0].count,
                    size: 'N/A' // SQLite doesn't provide table size easily
                };
            }
        }
        
        return stats;
    }

    // Public methods
    isReady() {
        return this.isInitialized;
    }

    getDatabaseType() {
        return this.useLocalStorage ? 'localStorage' : 'SQLite';
    }

    async close() {
        if (!this.useLocalStorage && this.db) {
            // Close SQLite connection
            // this.db.close();
        }
    }
}

// Initialize the database module
const databaseModule = new DatabaseModule();