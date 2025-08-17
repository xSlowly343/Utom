/**
 * Database Service - Handles SQLite database operations
 */
const DatabaseService = {
    db: null,
    isInitialized: false,

    /**
     * Initialize the database
     */
    async init() {
        try {
            // In Electron, we'll use better-sqlite3
            // For now, we'll simulate database operations with localStorage
            this.isInitialized = true;
            console.log('Database service initialized');
            return true;
        } catch (error) {
            console.error('Failed to initialize database:', error);
            return false;
        }
    },

    /**
     * Get database connection
     */
    getConnection() {
        if (!this.isInitialized) {
            throw new Error('Database not initialized');
        }
        return this.db;
    },

    /**
     * Initialize database tables
     */
    async initTables() {
        try {
            // Create tables if they don't exist
            const tables = [
                this.createRaidsTable(),
                this.createCharactersTable(),
                this.createScheduledRaidsTable(),
                this.createChatMessagesTable(),
                this.createUserSettingsTable(),
                this.createRaidHistoryTable()
            ];

            await Promise.all(tables);
            console.log('Database tables initialized');
            return true;
        } catch (error) {
            console.error('Failed to initialize tables:', error);
            return false;
        }
    },

    /**
     * Create raids table
     */
    async createRaidsTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS raids (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT,
                type TEXT NOT NULL,
                difficulty TEXT,
                min_item_level INTEGER,
                max_participants INTEGER,
                status TEXT DEFAULT 'active',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `;
        
        try {
            // Simulate table creation
            console.log('Raids table created/verified');
            return true;
        } catch (error) {
            console.error('Failed to create raids table:', error);
            return false;
        }
    },

    /**
     * Create characters table
     */
    async createCharactersTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS characters (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                class TEXT NOT NULL,
                level INTEGER DEFAULT 50,
                item_level REAL DEFAULT 0,
                server TEXT,
                guild TEXT,
                engravings TEXT,
                stats TEXT,
                gear TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `;
        
        try {
            console.log('Characters table created/verified');
            return true;
        } catch (error) {
            console.error('Failed to create characters table:', error);
            return false;
        }
    },

    /**
     * Create scheduled raids table
     */
    async createScheduledRaidsTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS scheduled_raids (
                id TEXT PRIMARY KEY,
                raid_id TEXT NOT NULL,
                scheduled_date DATE NOT NULL,
                scheduled_time TIME NOT NULL,
                duration INTEGER DEFAULT 120,
                participants TEXT,
                status TEXT DEFAULT 'scheduled',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (raid_id) REFERENCES raids (id)
            )
        `;
        
        try {
            console.log('Scheduled raids table created/verified');
            return true;
        } catch (error) {
            console.error('Failed to create scheduled raids table:', error);
            return false;
        }
    },

    /**
     * Create chat messages table
     */
    async createChatMessagesTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS chat_messages (
                id TEXT PRIMARY KEY,
                channel TEXT NOT NULL,
                sender TEXT NOT NULL,
                message TEXT NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                type TEXT DEFAULT 'text'
            )
        `;
        
        try {
            console.log('Chat messages table created/verified');
            return true;
        } catch (error) {
            console.error('Failed to create chat messages table:', error);
            return false;
        }
    },

    /**
     * Create user settings table
     */
    async createUserSettingsTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS user_settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `;
        
        try {
            console.log('User settings table created/verified');
            return true;
        } catch (error) {
            console.error('Failed to create user settings table:', error);
            return false;
        }
    },

    /**
     * Create raid history table
     */
    async createRaidHistoryTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS raid_history (
                id TEXT PRIMARY KEY,
                raid_id TEXT NOT NULL,
                scheduled_raid_id TEXT,
                completion_date DATETIME,
                participants TEXT,
                boss_kills TEXT,
                rewards TEXT,
                notes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (raid_id) REFERENCES raids (id),
                FOREIGN KEY (scheduled_raid_id) REFERENCES scheduled_raids (id)
            )
        `;
        
        try {
            console.log('Raid history table created/verified');
            return true;
        } catch (error) {
            console.error('Failed to create raid history table:', error);
            return false;
        }
    },

    // RAID OPERATIONS

    /**
     * Create a new raid
     */
    async createRaid(raidData) {
        try {
            const raid = {
                id: this.generateId(),
                ...raidData,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            // Store in localStorage for now
            const raids = this.getRaids();
            raids.push(raid);
            localStorage.setItem('raids', JSON.stringify(raids));

            return raid;
        } catch (error) {
            console.error('Failed to create raid:', error);
            throw error;
        }
    },

    /**
     * Get all raids
     */
    async getRaids(filters = {}) {
        try {
            let raids = this.getRaidsFromStorage();
            
            // Apply filters
            if (filters.status) {
                raids = raids.filter(raid => raid.status === filters.status);
            }
            if (filters.type) {
                raids = raids.filter(raid => raid.type === filters.type);
            }
            if (filters.difficulty) {
                raids = raids.filter(raid => raid.difficulty === filters.difficulty);
            }

            return raids;
        } catch (error) {
            console.error('Failed to get raids:', error);
            return [];
        }
    },

    /**
     * Get raid by ID
     */
    async getRaidById(raidId) {
        try {
            const raids = this.getRaidsFromStorage();
            return raids.find(raid => raid.id === raidId);
        } catch (error) {
            console.error('Failed to get raid by ID:', error);
            return null;
        }
    },

    /**
     * Update raid
     */
    async updateRaid(raidId, updateData) {
        try {
            const raids = this.getRaidsFromStorage();
            const raidIndex = raids.findIndex(raid => raid.id === raidId);
            
            if (raidIndex === -1) {
                throw new Error('Raid not found');
            }

            raids[raidIndex] = {
                ...raids[raidIndex],
                ...updateData,
                updated_at: new Date().toISOString()
            };

            localStorage.setItem('raids', JSON.stringify(raids));
            return raids[raidIndex];
        } catch (error) {
            console.error('Failed to update raid:', error);
            throw error;
        }
    },

    /**
     * Delete raid
     */
    async deleteRaid(raidId) {
        try {
            const raids = this.getRaidsFromStorage();
            const filteredRaids = raids.filter(raid => raid.id !== raidId);
            localStorage.setItem('raids', JSON.stringify(filteredRaids));
            return true;
        } catch (error) {
            console.error('Failed to delete raid:', error);
            return false;
        }
    },

    // CHARACTER OPERATIONS

    /**
     * Create a new character
     */
    async createCharacter(characterData) {
        try {
            const character = {
                id: this.generateId(),
                ...characterData,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const characters = this.getCharactersFromStorage();
            characters.push(character);
            localStorage.setItem('characters', JSON.stringify(characters));

            return character;
        } catch (error) {
            console.error('Failed to create character:', error);
            throw error;
        }
    },

    /**
     * Get all characters
     */
    async getCharacters(filters = {}) {
        try {
            let characters = this.getCharactersFromStorage();
            
            // Apply filters
            if (filters.class) {
                characters = characters.filter(char => char.class === filters.class);
            }
            if (filters.server) {
                characters = characters.filter(char => char.server === filters.server);
            }
            if (filters.minItemLevel) {
                characters = characters.filter(char => char.item_level >= filters.minItemLevel);
            }

            return characters;
        } catch (error) {
            console.error('Failed to get characters:', error);
            return [];
        }
    },

    /**
     * Get character by ID
     */
    async getCharacterById(characterId) {
        try {
            const characters = this.getCharactersFromStorage();
            return characters.find(char => char.id === characterId);
        } catch (error) {
            console.error('Failed to get character by ID:', error);
            return null;
        }
    },

    /**
     * Update character
     */
    async updateCharacter(characterId, updateData) {
        try {
            const characters = this.getCharactersFromStorage();
            const charIndex = characters.findIndex(char => char.id === characterId);
            
            if (charIndex === -1) {
                throw new Error('Character not found');
            }

            characters[charIndex] = {
                ...characters[charIndex],
                ...updateData,
                updated_at: new Date().toISOString()
            };

            localStorage.setItem('characters', JSON.stringify(characters));
            return characters[charIndex];
        } catch (error) {
            console.error('Failed to update character:', error);
            throw error;
        }
    },

    /**
     * Delete character
     */
    async deleteCharacter(characterId) {
        try {
            const characters = this.getCharactersFromStorage();
            const filteredCharacters = characters.filter(char => char.id !== characterId);
            localStorage.setItem('characters', JSON.stringify(filteredCharacters));
            return true;
        } catch (error) {
            console.error('Failed to delete character:', error);
            return false;
        }
    },

    // SCHEDULED RAID OPERATIONS

    /**
     * Create scheduled raid
     */
    async createScheduledRaid(scheduledRaidData) {
        try {
            const scheduledRaid = {
                id: this.generateId(),
                ...scheduledRaidData,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const scheduledRaids = this.getScheduledRaidsFromStorage();
            scheduledRaids.push(scheduledRaid);
            localStorage.setItem('scheduledRaids', JSON.stringify(scheduledRaids));

            return scheduledRaid;
        } catch (error) {
            console.error('Failed to create scheduled raid:', error);
            throw error;
        }
    },

    /**
     * Get scheduled raids
     */
    async getScheduledRaids(filters = {}) {
        try {
            let scheduledRaids = this.getScheduledRaidsFromStorage();
            
            // Apply filters
            if (filters.status) {
                scheduledRaids = scheduledRaids.filter(sr => sr.status === filters.status);
            }
            if (filters.date) {
                scheduledRaids = scheduledRaids.filter(sr => sr.scheduled_date === filters.date);
            }

            return scheduledRaids;
        } catch (error) {
            console.error('Failed to get scheduled raids:', error);
            return [];
        }
    },

    /**
     * Update scheduled raid
     */
    async updateScheduledRaid(scheduledRaidId, updateData) {
        try {
            const scheduledRaids = this.getScheduledRaidsFromStorage();
            const srIndex = scheduledRaids.findIndex(sr => sr.id === scheduledRaidId);
            
            if (srIndex === -1) {
                throw new Error('Scheduled raid not found');
            }

            scheduledRaids[srIndex] = {
                ...scheduledRaids[srIndex],
                ...updateData,
                updated_at: new Date().toISOString()
            };

            localStorage.setItem('scheduledRaids', JSON.stringify(scheduledRaids));
            return scheduledRaids[srIndex];
        } catch (error) {
            console.error('Failed to update scheduled raid:', error);
            throw error;
        }
    },

    // CHAT OPERATIONS

    /**
     * Save chat message
     */
    async saveChatMessage(messageData) {
        try {
            const message = {
                id: this.generateId(),
                ...messageData,
                timestamp: new Date().toISOString()
            };

            const messages = this.getChatMessagesFromStorage();
            messages.push(message);
            localStorage.setItem('chatMessages', JSON.stringify(messages));

            return message;
        } catch (error) {
            console.error('Failed to save chat message:', error);
            throw error;
        }
    },

    /**
     * Get chat messages
     */
    async getChatMessages(channel, limit = 100) {
        try {
            const messages = this.getChatMessagesFromStorage();
            const channelMessages = messages
                .filter(msg => msg.channel === channel)
                .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
                .slice(-limit);

            return channelMessages;
        } catch (error) {
            console.error('Failed to get chat messages:', error);
            return [];
        }
    },

    // SETTINGS OPERATIONS

    /**
     * Save user setting
     */
    async saveSetting(key, value) {
        try {
            const settings = this.getSettingsFromStorage();
            settings[key] = {
                value: value,
                updated_at: new Date().toISOString()
            };
            localStorage.setItem('userSettings', JSON.stringify(settings));
            return true;
        } catch (error) {
            console.error('Failed to save setting:', error);
            return false;
        }
    },

    /**
     * Get user setting
     */
    async getSetting(key, defaultValue = null) {
        try {
            const settings = this.getSettingsFromStorage();
            return settings[key]?.value ?? defaultValue;
        } catch (error) {
            console.error('Failed to get setting:', error);
            return defaultValue;
        }
    },

    /**
     * Get all settings
     */
    async getAllSettings() {
        try {
            return this.getSettingsFromStorage();
        } catch (error) {
            console.error('Failed to get all settings:', error);
            return {};
        }
    },

    // RAID HISTORY OPERATIONS

    /**
     * Save raid completion
     */
    async saveRaidCompletion(completionData) {
        try {
            const completion = {
                id: this.generateId(),
                ...completionData,
                created_at: new Date().toISOString()
            };

            const history = this.getRaidHistoryFromStorage();
            history.push(completion);
            localStorage.setItem('raidHistory', JSON.stringify(history));

            return completion;
        } catch (error) {
            console.error('Failed to save raid completion:', error);
            throw error;
        }
    },

    /**
     * Get raid history
     */
    async getRaidHistory(filters = {}) {
        try {
            let history = this.getRaidHistoryFromStorage();
            
            // Apply filters
            if (filters.raidId) {
                history = history.filter(h => h.raid_id === filters.raidId);
            }
            if (filters.dateFrom) {
                history = history.filter(h => new Date(h.completion_date) >= new Date(filters.dateFrom));
            }
            if (filters.dateTo) {
                history = history.filter(h => new Date(h.completion_date) <= new Date(filters.dateTo));
            }

            return history.sort((a, b) => new Date(b.completion_date) - new Date(a.completion_date));
        } catch (error) {
            console.error('Failed to get raid history:', error);
            return [];
        }
    },

    // UTILITY METHODS

    /**
     * Generate unique ID
     */
    generateId() {
        return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    /**
     * Backup database
     */
    async backupDatabase() {
        try {
            const backup = {
                raids: this.getRaidsFromStorage(),
                characters: this.getCharactersFromStorage(),
                scheduledRaids: this.getScheduledRaidsFromStorage(),
                chatMessages: this.getChatMessagesFromStorage(),
                userSettings: this.getSettingsFromStorage(),
                raidHistory: this.getRaidHistoryFromStorage(),
                backupDate: new Date().toISOString()
            };

            const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `lost-ark-backup-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);

            return true;
        } catch (error) {
            console.error('Failed to backup database:', error);
            return false;
        }
    },

    /**
     * Restore database from backup
     */
    async restoreDatabase(backupData) {
        try {
            if (backupData.raids) {
                localStorage.setItem('raids', JSON.stringify(backupData.raids));
            }
            if (backupData.characters) {
                localStorage.setItem('characters', JSON.stringify(backupData.characters));
            }
            if (backupData.scheduledRaids) {
                localStorage.setItem('scheduledRaids', JSON.stringify(backupData.scheduledRaids));
            }
            if (backupData.chatMessages) {
                localStorage.setItem('chatMessages', JSON.stringify(backupData.chatMessages));
            }
            if (backupData.userSettings) {
                localStorage.setItem('userSettings', JSON.stringify(backupData.userSettings));
            }
            if (backupData.raidHistory) {
                localStorage.setItem('raidHistory', JSON.stringify(backupData.raidHistory));
            }

            return true;
        } catch (error) {
            console.error('Failed to restore database:', error);
            return false;
        }
    },

    /**
     * Clear all data
     */
    async clearAllData() {
        try {
            localStorage.removeItem('raids');
            localStorage.removeItem('characters');
            localStorage.removeItem('scheduledRaids');
            localStorage.removeItem('chatMessages');
            localStorage.removeItem('userSettings');
            localStorage.removeItem('raidHistory');
            return true;
        } catch (error) {
            console.error('Failed to clear all data:', error);
            return false;
        }
    },

    // STORAGE HELPERS (temporary until real database is implemented)

    getRaidsFromStorage() {
        const stored = localStorage.getItem('raids');
        return stored ? JSON.parse(stored) : [];
    },

    getCharactersFromStorage() {
        const stored = localStorage.getItem('characters');
        return stored ? JSON.parse(stored) : [];
    },

    getScheduledRaidsFromStorage() {
        const stored = localStorage.getItem('scheduledRaids');
        return stored ? JSON.parse(stored) : [];
    },

    getChatMessagesFromStorage() {
        const stored = localStorage.getItem('chatMessages');
        return stored ? JSON.parse(stored) : [];
    },

    getSettingsFromStorage() {
        const stored = localStorage.getItem('userSettings');
        return stored ? JSON.parse(stored) : {};
    },

    getRaidHistoryFromStorage() {
        const stored = localStorage.getItem('raidHistory');
        return stored ? JSON.parse(stored) : [];
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DatabaseService;
} else {
    window.DatabaseService = DatabaseService;
}