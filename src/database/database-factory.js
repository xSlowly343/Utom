/**
 * Database Factory
 * Фабрика для создания адаптеров разных баз данных
 */

const SQLiteDatabaseAdapter = require('./database');
const MySQLDatabaseAdapter = require('./mysql-adapter');
const MongoDBDatabaseAdapter = require('./mongodb-adapter');

class DatabaseFactory {
    static async createDatabase(type, config) {
        try {
            let adapter;
            
            switch (type.toLowerCase()) {
                case 'sqlite':
                case 'sqlite3':
                    console.log('DatabaseFactory: Создаем SQLite адаптер');
                    adapter = new SQLiteDatabaseAdapter(config);
                    break;
                    
                case 'mysql':
                case 'mariadb':
                    console.log('DatabaseFactory: Создаем MySQL адаптер');
                    adapter = new MySQLDatabaseAdapter(config);
                    break;
                    
                case 'mongodb':
                case 'mongo':
                    console.log('DatabaseFactory: Создаем MongoDB адаптер');
                    adapter = new MongoDBDatabaseAdapter(config);
                    break;
                    
                default:
                    throw new Error(`Неподдерживаемый тип базы данных: ${type}`);
            }
            
            // Ждем инициализации
            await adapter.init?.();
            
            console.log(`DatabaseFactory: Адаптер ${type} создан успешно`);
            return adapter;
            
        } catch (error) {
            console.error(`DatabaseFactory: Ошибка создания адаптера ${type}:`, error);
            throw error;
        }
    }
    
    static getSupportedTypes() {
        return ['sqlite', 'mysql', 'mongodb'];
    }
    
    static getDefaultConfig(type) {
        switch (type.toLowerCase()) {
            case 'sqlite':
                return {
                    databasePath: './data/lost_ark_manager.db'
                };
                
            case 'mysql':
                return {
                    host: 'localhost',
                    port: 3306,
                    user: 'root',
                    password: '',
                    database: 'lost_ark_manager'
                };
                
            case 'mongodb':
                return {
                    url: 'mongodb://localhost:27017',
                    database: 'lost_ark_manager'
                };
                
            default:
                return {};
        }
    }
    
    static async testConnection(type, config) {
        try {
            const adapter = await this.createDatabase(type, config);
            const stats = await adapter.getStats();
            await adapter.close();
            
            console.log(`DatabaseFactory: Тест подключения к ${type} успешен:`, stats);
            return { success: true, stats };
            
        } catch (error) {
            console.error(`DatabaseFactory: Тест подключения к ${type} провален:`, error);
            return { success: false, error: error.message };
        }
    }
    
    static async migrateData(sourceType, sourceConfig, targetType, targetConfig) {
        try {
            console.log(`DatabaseFactory: Начинаем миграцию с ${sourceType} на ${targetType}`);
            
            // Создаем исходный и целевой адаптеры
            const sourceAdapter = await this.createDatabase(sourceType, sourceConfig);
            const targetAdapter = await this.createDatabase(targetType, targetConfig);
            
            // Мигрируем данные
            const migrationResult = await this.performMigration(sourceAdapter, targetAdapter);
            
            // Закрываем соединения
            await sourceAdapter.close();
            await targetAdapter.close();
            
            console.log('DatabaseFactory: Миграция завершена успешно');
            return migrationResult;
            
        } catch (error) {
            console.error('DatabaseFactory: Ошибка миграции:', error);
            throw error;
        }
    }
    
    static async performMigration(source, target) {
        const result = {
            users: 0,
            characters: 0,
            raids: 0,
            messages: 0,
            settings: 0,
            errors: []
        };
        
        try {
            // Мигрируем пользователей
            console.log('DatabaseFactory: Мигрируем пользователей...');
            const users = await source.getAllUsers?.() || [];
            for (const user of users) {
                try {
                    await target.createUser(user);
                    result.users++;
                } catch (error) {
                    result.errors.push(`Пользователь ${user.username}: ${error.message}`);
                }
            }
            
            // Мигрируем персонажей
            console.log('DatabaseFactory: Мигрируем персонажей...');
            const characters = await source.getAllCharacters?.() || [];
            for (const character of characters) {
                try {
                    await target.createCharacter(character);
                    result.characters++;
                } catch (error) {
                    result.errors.push(`Персонаж ${character.name}: ${error.message}`);
                }
            }
            
            // Мигрируем рейды
            console.log('DatabaseFactory: Мигрируем рейды...');
            const raids = await source.getAllRaids?.() || [];
            for (const raid of raids) {
                try {
                    await target.createRaid(raid);
                    result.raids++;
                } catch (error) {
                    result.errors.push(`Рейд ${raid.name}: ${error.message}`);
                }
            }
            
            // Мигрируем сообщения чата
            console.log('DatabaseFactory: Мигрируем сообщения чата...');
            const messages = await source.getAllMessages?.() || [];
            for (const message of messages) {
                try {
                    await target.saveMessage(message);
                    result.messages++;
                } catch (error) {
                    result.errors.push(`Сообщение ${message.id}: ${error.message}`);
                }
            }
            
            // Мигрируем настройки
            console.log('DatabaseFactory: Мигрируем настройки...');
            const settings = await source.getAllSettings?.() || [];
            for (const setting of settings) {
                try {
                    await target.setSetting(setting.userId, setting.key, setting.value);
                    result.settings++;
                } catch (error) {
                    result.errors.push(`Настройка ${setting.key}: ${error.message}`);
                }
            }
            
        } catch (error) {
            result.errors.push(`Общая ошибка миграции: ${error.message}`);
        }
        
        return result;
    }
}

module.exports = DatabaseFactory;