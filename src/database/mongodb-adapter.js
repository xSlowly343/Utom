/**
 * MongoDB Database Adapter
 * Адаптер для работы с MongoDB
 */

const { MongoClient, ObjectId } = require('mongodb');

class MongoDBDatabaseAdapter {
    constructor(config) {
        this.config = {
            url: config.url || 'mongodb://localhost:27017',
            database: config.database || 'lost_ark_manager',
            ...config
        };
        
        this.client = null;
        this.db = null;
        this.init();
    }

    async init() {
        try {
            this.client = new MongoClient(this.config.url);
            await this.client.connect();
            
            this.db = this.client.db(this.config.database);
            console.log('MongoDB: Подключение установлено');
            
            // Создаем индексы
            await this.createIndexes();
        } catch (error) {
            console.error('MongoDB: Ошибка подключения:', error);
            throw error;
        }
    }

    async createIndexes() {
        try {
            // Индексы для пользователей
            await this.db.collection('users').createIndex({ username: 1 }, { unique: true });
            await this.db.collection('users').createIndex({ email: 1 }, { unique: true });
            
            // Индексы для персонажей
            await this.db.collection('characters').createIndex({ userId: 1 });
            await this.db.collection('characters').createIndex({ name: 1 });
            
            // Индексы для рейдов
            await this.db.collection('raids').createIndex({ status: 1 });
            await this.db.collection('raids').createIndex({ date: 1 });
            await this.db.collection('raids').createIndex({ leader: 1 });
            
            // Индексы для чата
            await this.db.collection('chat_messages').createIndex({ channelId: 1, createdAt: -1 });
            await this.db.collection('chat_messages').createIndex({ userId: 1 });
            
            // Индексы для уведомлений
            await this.db.collection('notifications').createIndex({ userId: 1, readAt: 1 });
            
            console.log('MongoDB: Индексы созданы');
        } catch (error) {
            console.error('MongoDB: Ошибка создания индексов:', error);
        }
    }

    // Методы для работы с пользователями
    async createUser(userData) {
        try {
            const result = await this.db.collection('users').insertOne({
                ...userData,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            return result.insertedId.toString();
        } catch (error) {
            console.error('MongoDB: Ошибка создания пользователя:', error);
            throw error;
        }
    }

    async getUserById(id) {
        try {
            const user = await this.db.collection('users').findOne({ _id: new ObjectId(id) });
            return user ? { ...user, id: user._id.toString() } : null;
        } catch (error) {
            console.error('MongoDB: Ошибка получения пользователя:', error);
            throw error;
        }
    }

    async getUserByUsername(username) {
        try {
            const user = await this.db.collection('users').findOne({ username });
            return user ? { ...user, id: user._id.toString() } : null;
        } catch (error) {
            console.error('MongoDB: Ошибка получения пользователя по имени:', error);
            throw error;
        }
    }

    // Методы для работы с персонажами
    async createCharacter(characterData) {
        try {
            const result = await this.db.collection('characters').insertOne({
                ...characterData,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            return result.insertedId.toString();
        } catch (error) {
            console.error('MongoDB: Ошибка создания персонажа:', error);
            throw error;
        }
    }

    async getCharactersByUserId(userId) {
        try {
            const characters = await this.db.collection('characters')
                .find({ userId: parseInt(userId) })
                .sort({ createdAt: -1 })
                .toArray();
            
            return characters.map(char => ({
                ...char,
                id: char._id.toString()
            }));
        } catch (error) {
            console.error('MongoDB: Ошибка получения персонажей:', error);
            throw error;
        }
    }

    async updateCharacter(id, updates) {
        try {
            const result = await this.db.collection('characters').updateOne(
                { _id: new ObjectId(id) },
                { 
                    $set: { 
                        ...updates, 
                        updatedAt: new Date() 
                    } 
                }
            );
            return result.modifiedCount > 0;
        } catch (error) {
            console.error('MongoDB: Ошибка обновления персонажа:', error);
            throw error;
        }
    }

    async deleteCharacter(id) {
        try {
            const result = await this.db.collection('characters').deleteOne({ _id: new ObjectId(id) });
            return result.deletedCount > 0;
        } catch (error) {
            console.error('MongoDB: Ошибка удаления персонажа:', error);
            throw error;
        }
    }

    // Методы для работы с рейдами
    async createRaid(raidData) {
        try {
            const result = await this.db.collection('raids').insertOne({
                ...raidData,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            return result.insertedId.toString();
        } catch (error) {
            console.error('MongoDB: Ошибка создания рейда:', error);
            throw error;
        }
    }

    async getAllRaids() {
        try {
            const raids = await this.db.collection('raids')
                .find({})
                .sort({ createdAt: -1 })
                .toArray();
            
            return raids.map(raid => ({
                ...raid,
                id: raid._id.toString()
            }));
        } catch (error) {
            console.error('MongoDB: Ошибка получения рейдов:', error);
            throw error;
        }
    }

    async updateRaid(id, updates) {
        try {
            const result = await this.db.collection('raids').updateOne(
                { _id: new ObjectId(id) },
                { 
                    $set: { 
                        ...updates, 
                        updatedAt: new Date() 
                    } 
                }
            );
            return result.modifiedCount > 0;
        } catch (error) {
            console.error('MongoDB: Ошибка обновления рейда:', error);
            throw error;
        }
    }

    // Методы для работы с чатом
    async createChannel(channelData) {
        try {
            const result = await this.db.collection('chat_channels').insertOne({
                ...channelData,
                createdAt: new Date()
            });
            return result.insertedId.toString();
        } catch (error) {
            console.error('MongoDB: Ошибка создания канала:', error);
            throw error;
        }
    }

    async saveMessage(messageData) {
        try {
            const result = await this.db.collection('chat_messages').insertOne({
                ...messageData,
                createdAt: new Date()
            });
            return result.insertedId.toString();
        } catch (error) {
            console.error('MongoDB: Ошибка сохранения сообщения:', error);
            throw error;
        }
    }

    async getChannelMessages(channelId, limit = 100) {
        try {
            const messages = await this.db.collection('chat_messages')
                .aggregate([
                    { $match: { channelId: parseInt(channelId) } },
                    { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
                    { $unwind: '$user' },
                    { $sort: { createdAt: -1 } },
                    { $limit: limit },
                    { $project: {
                        _id: 1,
                        message: 1,
                        messageType: 1,
                        createdAt: 1,
                        'user.username': 1,
                        'user.avatar': 1
                    }}
                ])
                .toArray();
            
            return messages.reverse().map(msg => ({
                ...msg,
                id: msg._id.toString()
            }));
        } catch (error) {
            console.error('MongoDB: Ошибка получения сообщений:', error);
            throw error;
        }
    }

    // Методы для работы с настройками
    async setSetting(userId, key, value) {
        try {
            await this.db.collection('user_settings').updateOne(
                { userId: parseInt(userId), settingKey: key },
                { 
                    $set: { 
                        settingValue: value,
                        updatedAt: new Date()
                    } 
                },
                { upsert: true }
            );
            return true;
        } catch (error) {
            console.error('MongoDB: Ошибка сохранения настройки:', error);
            throw error;
        }
    }

    async getSetting(userId, key) {
        try {
            const setting = await this.db.collection('user_settings').findOne({
                userId: parseInt(userId),
                settingKey: key
            });
            return setting?.settingValue || null;
        } catch (error) {
            console.error('MongoDB: Ошибка получения настройки:', error);
            throw error;
        }
    }

    // Методы для логирования
    async logRaidAction(raidId, userId, action, details = {}) {
        try {
            await this.db.collection('raid_logs').insertOne({
                raidId: parseInt(raidId),
                userId: parseInt(userId),
                action,
                details,
                createdAt: new Date()
            });
            return true;
        } catch (error) {
            console.error('MongoDB: Ошибка логирования действия:', error);
            throw error;
        }
    }

    // Методы для уведомлений
    async createNotification(userId, title, message, type = 'info') {
        try {
            const result = await this.db.collection('notifications').insertOne({
                userId: parseInt(userId),
                title,
                message,
                type,
                readAt: null,
                createdAt: new Date()
            });
            return result.insertedId.toString();
        } catch (error) {
            console.error('MongoDB: Ошибка создания уведомления:', error);
            throw error;
        }
    }

    // Методы для статистики
    async getStats() {
        try {
            const [userCount, characterCount, raidCount, messageCount] = await Promise.all([
                this.db.collection('users').countDocuments(),
                this.db.collection('characters').countDocuments(),
                this.db.collection('raids').countDocuments(),
                this.db.collection('chat_messages').countDocuments()
            ]);
            
            return {
                users: userCount,
                characters: characterCount,
                raids: raidCount,
                messages: messageCount
            };
        } catch (error) {
            console.error('MongoDB: Ошибка получения статистики:', error);
            throw error;
        }
    }

    // Методы для резервного копирования
    async backup() {
        try {
            // MongoDB имеет встроенные инструменты для бэкапа
            // mongodump --db lost_ark_manager --out ./backup
            console.log('MongoDB: Используйте mongodump для резервного копирования');
            return true;
        } catch (error) {
            console.error('MongoDB: Ошибка резервного копирования:', error);
            throw error;
        }
    }

    // Методы для очистки
    async cleanup() {
        try {
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
            
            // Удаляем старые уведомления
            await this.db.collection('notifications').deleteMany({
                createdAt: { $lt: thirtyDaysAgo }
            });
            
            // Удаляем старые логи
            await this.db.collection('raid_logs').deleteMany({
                createdAt: { $lt: ninetyDaysAgo }
            });
            
            console.log('MongoDB: Очистка завершена');
            return true;
        } catch (error) {
            console.error('MongoDB: Ошибка очистки:', error);
            throw error;
        }
    }

    // Закрытие соединения
    async close() {
        if (this.client) {
            await this.client.close();
            console.log('MongoDB: Соединение закрыто');
        }
    }
}

module.exports = MongoDBDatabaseAdapter;