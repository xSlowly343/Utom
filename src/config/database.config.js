/**
 * Database Configuration
 * Конфигурация для выбора и настройки базы данных
 */

module.exports = {
    // Тип базы данных (sqlite, mysql, mongodb)
    type: process.env.DB_TYPE || 'sqlite',
    
    // Конфигурация для SQLite
    sqlite: {
        databasePath: process.env.SQLITE_PATH || './data/lost_ark_manager.db',
        verbose: process.env.SQLITE_VERBOSE === 'true',
        readonly: process.env.SQLITE_READONLY === 'true'
    },
    
    // Конфигурация для MySQL
    mysql: {
        host: process.env.MYSQL_HOST || 'localhost',
        port: parseInt(process.env.MYSQL_PORT) || 3306,
        user: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || '',
        database: process.env.MYSQL_DATABASE || 'lost_ark_manager',
        charset: process.env.MYSQL_CHARSET || 'utf8mb4',
        timezone: process.env.MYSQL_TIMEZONE || 'local',
        connectionLimit: parseInt(process.env.MYSQL_CONNECTION_LIMIT) || 10,
        acquireTimeout: parseInt(process.env.MYSQL_ACQUIRE_TIMEOUT) || 60000,
        timeout: parseInt(process.env.MYSQL_TIMEOUT) || 60000
    },
    
    // Конфигурация для MongoDB
    mongodb: {
        url: process.env.MONGODB_URL || 'mongodb://localhost:27017',
        database: process.env.MONGODB_DATABASE || 'lost_ark_manager',
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            maxPoolSize: parseInt(process.env.MONGODB_MAX_POOL_SIZE) || 10,
            serverSelectionTimeoutMS: parseInt(process.env.MONGODB_SERVER_SELECTION_TIMEOUT) || 5000,
            socketTimeoutMS: parseInt(process.env.MONGODB_SOCKET_TIMEOUT) || 45000,
            bufferMaxEntries: 0,
            bufferCommands: false
        }
    },
    
    // Общие настройки
    common: {
        // Автоматическое создание таблиц/коллекций
        autoCreateTables: process.env.DB_AUTO_CREATE_TABLES !== 'false',
        
        // Автоматическое создание индексов
        autoCreateIndexes: process.env.DB_AUTO_CREATE_INDEXES !== 'false',
        
        // Логирование SQL запросов
        logQueries: process.env.DB_LOG_QUERIES === 'true',
        
        // Таймаут для операций (в миллисекундах)
        timeout: parseInt(process.env.DB_TIMEOUT) || 30000,
        
        // Максимальное количество попыток подключения
        maxRetries: parseInt(process.env.DB_MAX_RETRIES) || 3,
        
        // Интервал между попытками подключения (в миллисекундах)
        retryInterval: parseInt(process.env.DB_RETRY_INTERVAL) || 1000,
        
        // Размер пула соединений
        poolSize: parseInt(process.env.DB_POOL_SIZE) || 5
    },
    
    // Настройки миграции
    migration: {
        // Автоматический запуск миграции при старте
        autoRun: process.env.DB_AUTO_MIGRATE === 'true',
        
        // Путь к файлам миграций
        migrationsPath: process.env.DB_MIGRATIONS_PATH || './migrations',
        
        // Версия схемы базы данных
        schemaVersion: process.env.DB_SCHEMA_VERSION || '1.0.0',
        
        // Создание резервной копии перед миграцией
        backupBeforeMigration: process.env.DB_BACKUP_BEFORE_MIGRATE === 'true',
        
        // Путь для резервных копий
        backupPath: process.env.DB_BACKUP_PATH || './backups'
    },
    
    // Настройки резервного копирования
    backup: {
        // Автоматическое резервное копирование
        autoBackup: process.env.DB_AUTO_BACKUP === 'true',
        
        // Расписание резервного копирования (cron формат)
        schedule: process.env.DB_BACKUP_SCHEDULE || '0 2 * * *', // Каждый день в 2:00
        
        // Количество хранимых резервных копий
        keepBackups: parseInt(process.env.DB_KEEP_BACKUPS) || 7,
        
        // Сжатие резервных копий
        compress: process.env.DB_BACKUP_COMPRESS !== 'false',
        
        // Путь для резервных копий
        path: process.env.DB_BACKUP_PATH || './backups'
    },
    
    // Настройки очистки
    cleanup: {
        // Автоматическая очистка старых данных
        autoCleanup: process.env.DB_AUTO_CLEANUP === 'true',
        
        // Расписание очистки (cron формат)
        schedule: process.env.DB_CLEANUP_SCHEDULE || '0 3 * * *', // Каждый день в 3:00
        
        // Удалять уведомления старше N дней
        notificationsOlderThan: parseInt(process.env.DB_CLEANUP_NOTIFICATIONS_DAYS) || 30,
        
        // Удалять логи старше N дней
        logsOlderThan: parseInt(process.env.DB_CLEANUP_LOGS_DAYS) || 90,
        
        // Удалять временные файлы старше N дней
        tempFilesOlderThan: parseInt(process.env.DB_CLEANUP_TEMP_DAYS) || 7
    },
    
    // Настройки мониторинга
    monitoring: {
        // Включить мониторинг производительности
        enabled: process.env.DB_MONITORING_ENABLED === 'true',
        
        // Интервал сбора метрик (в миллисекундах)
        interval: parseInt(process.env.DB_MONITORING_INTERVAL) || 60000,
        
        // Максимальное количество хранимых метрик
        maxMetrics: parseInt(process.env.DB_MONITORING_MAX_METRICS) || 1000,
        
        // Алерты при медленных запросах (в миллисекундах)
        slowQueryThreshold: parseInt(process.env.DB_SLOW_QUERY_THRESHOLD) || 1000,
        
        // Алерты при ошибках подключения
        connectionErrorAlerts: process.env.DB_CONNECTION_ERROR_ALERTS !== 'false'
    },
    
    // Получить конфигурацию для конкретного типа БД
    getConfig(type = null) {
        const dbType = type || this.type;
        
        switch (dbType.toLowerCase()) {
            case 'sqlite':
            case 'sqlite3':
                return {
                    type: 'sqlite',
                    ...this.sqlite,
                    ...this.common
                };
                
            case 'mysql':
            case 'mariadb':
                return {
                    type: 'mysql',
                    ...this.mysql,
                    ...this.common
                };
                
            case 'mongodb':
            case 'mongo':
                return {
                    type: 'mongodb',
                    ...this.mongodb,
                    ...this.common
                };
                
            default:
                throw new Error(`Неподдерживаемый тип базы данных: ${dbType}`);
        }
    },
    
    // Проверить валидность конфигурации
    validate() {
        const config = this.getConfig();
        const errors = [];
        
        // Проверяем обязательные поля для MySQL
        if (config.type === 'mysql') {
            if (!config.host) errors.push('MYSQL_HOST обязателен');
            if (!config.user) errors.push('MYSQL_USER обязателен');
            if (!config.database) errors.push('MYSQL_DATABASE обязателен');
        }
        
        // Проверяем обязательные поля для MongoDB
        if (config.type === 'mongodb') {
            if (!config.url) errors.push('MONGODB_URL обязателен');
            if (!config.database) errors.push('MONGODB_DATABASE обязателен');
        }
        
        // Проверяем общие настройки
        if (config.timeout <= 0) errors.push('DB_TIMEOUT должен быть больше 0');
        if (config.maxRetries < 0) errors.push('DB_MAX_RETRIES должен быть >= 0');
        if (config.poolSize <= 0) errors.push('DB_POOL_SIZE должен быть больше 0');
        
        if (errors.length > 0) {
            throw new Error(`Ошибки конфигурации базы данных:\n${errors.join('\n')}`);
        }
        
        return true;
    },
    
    // Получить строку подключения для отладки
    getConnectionString(type = null) {
        const config = this.getConfig(type);
        
        switch (config.type) {
            case 'sqlite':
                return `sqlite://${config.databasePath}`;
                
            case 'mysql':
                return `mysql://${config.user}@${config.host}:${config.port}/${config.database}`;
                
            case 'mongodb':
                return `${config.url}/${config.database}`;
                
            default:
                return 'unknown';
        }
    }
};