# 🗄️ Настройка базы данных для Lost Ark Raid Manager

## 📋 Поддерживаемые базы данных

- **SQLite** (по умолчанию) - для локальной разработки и небольших проектов
- **MySQL/MariaDB** - для продакшена и высоких нагрузок
- **MongoDB** - для NoSQL подходов и гибкой схемы

## 🚀 Быстрый старт

### 1. SQLite (по умолчанию)

```bash
# Ничего настраивать не нужно, работает из коробки
npm start
```

### 2. MySQL

```bash
# Установка зависимостей
npm install mysql2

# Создание базы данных
mysql -u root -p
CREATE DATABASE lost_ark_manager CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Настройка переменных окружения
export DB_TYPE=mysql
export MYSQL_HOST=localhost
export MYSQL_PORT=3306
export MYSQL_USER=root
export MYSQL_PASSWORD=your_password
export MYSQL_DATABASE=lost_ark_manager

# Запуск
npm start
```

### 3. MongoDB

```bash
# Установка зависимостей
npm install mongodb

# Запуск MongoDB (если локально)
mongod --dbpath ./data

# Настройка переменных окружения
export DB_TYPE=mongodb
export MONGODB_URL=mongodb://localhost:27017
export MONGODB_DATABASE=lost_ark_manager

# Запуск
npm start
```

## ⚙️ Конфигурация через переменные окружения

### Основные настройки

```bash
# Тип базы данных
DB_TYPE=mysql

# Общие настройки
DB_TIMEOUT=30000
DB_MAX_RETRIES=3
DB_POOL_SIZE=10
DB_AUTO_CREATE_TABLES=true
DB_LOG_QUERIES=true
```

### MySQL настройки

```bash
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=lost_ark_manager
MYSQL_CHARSET=utf8mb4
MYSQL_TIMEZONE=local
MYSQL_CONNECTION_LIMIT=10
MYSQL_ACQUIRE_TIMEOUT=60000
MYSQL_TIMEOUT=60000
```

### MongoDB настройки

```bash
MONGODB_URL=mongodb://localhost:27017
MONGODB_DATABASE=lost_ark_manager
MONGODB_MAX_POOL_SIZE=10
MONGODB_SERVER_SELECTION_TIMEOUT=5000
MONGODB_SOCKET_TIMEOUT=45000
```

## 🔄 Миграция между базами данных

### Из SQLite в MySQL

```javascript
const DatabaseFactory = require('./src/database/database-factory');

async function migrateToMySQL() {
    try {
        // Конфигурация исходной БД (SQLite)
        const sourceConfig = {
            databasePath: './data/lost_ark_manager.db'
        };
        
        // Конфигурация целевой БД (MySQL)
        const targetConfig = {
            host: 'localhost',
            port: 3306,
            user: 'root',
            password: 'your_password',
            database: 'lost_ark_manager'
        };
        
        // Запуск миграции
        const result = await DatabaseFactory.migrateData(
            'sqlite', sourceConfig,
            'mysql', targetConfig
        );
        
        console.log('Миграция завершена:', result);
        
    } catch (error) {
        console.error('Ошибка миграции:', error);
    }
}

migrateToMySQL();
```

### Из MySQL в MongoDB

```javascript
const DatabaseFactory = require('./src/database/database-factory');

async function migrateToMongoDB() {
    try {
        // Конфигурация исходной БД (MySQL)
        const sourceConfig = {
            host: 'localhost',
            port: 3306,
            user: 'root',
            password: 'your_password',
            database: 'lost_ark_manager'
        };
        
        // Конфигурация целевой БД (MongoDB)
        const targetConfig = {
            url: 'mongodb://localhost:27017',
            database: 'lost_ark_manager'
        };
        
        // Запуск миграции
        const result = await DatabaseFactory.migrateData(
            'mysql', sourceConfig,
            'mongodb', targetConfig
        );
        
        console.log('Миграция завершена:', result);
        
    } catch (error) {
        console.error('Ошибка миграции:', error);
    }
}

migrateToMongoDB();
```

## 🐳 Docker примеры

### MySQL в Docker

```yaml
# docker-compose.yml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: your_password
      MYSQL_DATABASE: lost_ark_manager
      MYSQL_USER: lost_ark_user
      MYSQL_PASSWORD: user_password
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    command: --default-authentication-plugin=mysql_native_password

volumes:
  mysql_data:
```

```bash
# Запуск
docker-compose up -d

# Настройка переменных окружения
export DB_TYPE=mysql
export MYSQL_HOST=localhost
export MYSQL_PORT=3306
export MYSQL_USER=lost_ark_user
export MYSQL_PASSWORD=user_password
export MYSQL_DATABASE=lost_ark_manager
```

### MongoDB в Docker

```yaml
# docker-compose.yml
version: '3.8'
services:
  mongodb:
    image: mongo:6.0
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: admin_password
      MONGO_INITDB_DATABASE: lost_ark_manager
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

volumes:
  mongodb_data:
```

```bash
# Запуск
docker-compose up -d

# Настройка переменных окружения
export DB_TYPE=mongodb
export MONGODB_URL=mongodb://admin:admin_password@localhost:27017
export MONGODB_DATABASE=lost_ark_manager
```

## 🔧 Продакшен настройки

### MySQL для продакшена

```bash
# Создание пользователя только для чтения
CREATE USER 'lost_ark_readonly'@'%' IDENTIFIED BY 'readonly_password';
GRANT SELECT ON lost_ark_manager.* TO 'lost_ark_readonly'@'%';

# Создание пользователя для записи
CREATE USER 'lost_ark_writer'@'%' IDENTIFIED BY 'writer_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON lost_ark_manager.* TO 'lost_ark_writer'@'%';

# Настройка переменных окружения
export DB_TYPE=mysql
export MYSQL_HOST=your_mysql_server.com
export MYSQL_PORT=3306
export MYSQL_USER=lost_ark_writer
export MYSQL_PASSWORD=writer_password
export MYSQL_DATABASE=lost_ark_manager
export MYSQL_CONNECTION_LIMIT=50
export MYSQL_ACQUIRE_TIMEOUT=120000
export DB_POOL_SIZE=20
```

### MongoDB для продакшена

```bash
# Настройка аутентификации
use admin
db.createUser({
  user: "lost_ark_admin",
  pwd: "admin_password",
  roles: [
    { role: "readWrite", db: "lost_ark_manager" },
    { role: "dbAdmin", db: "lost_ark_manager" }
  ]
})

# Настройка переменных окружения
export DB_TYPE=mongodb
export MONGODB_URL=mongodb://lost_ark_admin:admin_password@your_mongo_server.com:27017
export MONGODB_DATABASE=lost_ark_manager
export MONGODB_MAX_POOL_SIZE=50
export DB_POOL_SIZE=20
```

## 📊 Мониторинг и производительность

### Включение мониторинга

```bash
export DB_MONITORING_ENABLED=true
export DB_MONITORING_INTERVAL=30000
export DB_SLOW_QUERY_THRESHOLD=1000
export DB_CONNECTION_ERROR_ALERTS=true
```

### Автоматическое резервное копирование

```bash
export DB_AUTO_BACKUP=true
export DB_BACKUP_SCHEDULE="0 2 * * *"  # Каждый день в 2:00
export DB_KEEP_BACKUPS=7
export DB_BACKUP_COMPRESS=true
```

### Автоматическая очистка

```bash
export DB_AUTO_CLEANUP=true
export DB_CLEANUP_SCHEDULE="0 3 * * *"  # Каждый день в 3:00
export DB_CLEANUP_NOTIFICATIONS_DAYS=30
export DB_CLEANUP_LOGS_DAYS=90
```

## 🚨 Устранение неполадок

### Проблемы с подключением

```bash
# Проверка подключения
npm run test-db

# Логи подключения
export DB_LOG_QUERIES=true
export DB_CONNECTION_ERROR_ALERTS=true
```

### Медленные запросы

```bash
# Включение мониторинга
export DB_MONITORING_ENABLED=true
export DB_SLOW_QUERY_THRESHOLD=500

# Логирование всех запросов
export DB_LOG_QUERIES=true
```

### Проблемы с памятью

```bash
# Уменьшение размера пула
export DB_POOL_SIZE=5
export MYSQL_CONNECTION_LIMIT=5
export MONGODB_MAX_POOL_SIZE=5

# Увеличение таймаутов
export DB_TIMEOUT=60000
export MYSQL_TIMEOUT=60000
```

## 📝 Примеры кода

### Программное создание базы данных

```javascript
const DatabaseFactory = require('./src/database/database-factory');
const dbConfig = require('./src/config/database.config');

async function initializeDatabase() {
    try {
        // Создаем адаптер для выбранной БД
        const database = await DatabaseFactory.createDatabase(
            dbConfig.type,
            dbConfig.getConfig()
        );
        
        // Проверяем подключение
        const stats = await database.getStats();
        console.log('База данных готова:', stats);
        
        // Сохраняем глобально
        global.databaseManager = database;
        
    } catch (error) {
        console.error('Ошибка инициализации БД:', error);
        process.exit(1);
    }
}

// Инициализируем при запуске
initializeDatabase();
```

### Переключение между базами данных

```javascript
const DatabaseFactory = require('./src/database/database-factory');

async function switchDatabase(newType, newConfig) {
    try {
        // Закрываем текущее соединение
        if (global.databaseManager) {
            await global.databaseManager.close();
        }
        
        // Создаем новое соединение
        const newDatabase = await DatabaseFactory.createDatabase(newType, newConfig);
        
        // Обновляем глобальную переменную
        global.databaseManager = newDatabase;
        
        console.log(`Переключились на ${newType}`);
        
    } catch (error) {
        console.error('Ошибка переключения БД:', error);
    }
}

// Пример использования
switchDatabase('mysql', {
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'lost_ark_manager'
});
```

## 🎯 Рекомендации

### Для разработки
- **SQLite** - быстро, просто, не требует сервера

### Для тестирования
- **MySQL** - близко к продакшену, хорошая производительность

### Для продакшена
- **MySQL** - стабильность, ACID, SQL
- **MongoDB** - масштабируемость, гибкость схемы

### Для высоких нагрузок
- **MySQL** с репликацией
- **MongoDB** с шардингом
- Кэширование (Redis)

## 📚 Дополнительные ресурсы

- [MySQL Documentation](https://dev.mysql.com/doc/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [Node.js Database Drivers](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)