# 🗄️ Настройка PostgreSQL с единой аутентификацией

## 🎯 **Что мы получим:**

- **PostgreSQL** как основная БД (лучше SQLite для продакшена)
- **Единая аутентификация** с основным сайтом
- **Автоматическая синхронизация** пользователей
- **Отдельная схема** для Lost Ark Manager
- **Масштабируемость** и производительность

## 🚀 **Быстрый старт**

### 1. Установка PostgreSQL

#### **Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### **CentOS/RHEL:**
```bash
sudo yum install postgresql postgresql-server postgresql-contrib
sudo postgresql-setup initdb
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### **macOS:**
```bash
brew install postgresql
brew services start postgresql
```

#### **Windows:**
Скачайте установщик с [официального сайта](https://www.postgresql.org/download/windows/)

### 2. Создание базы данных

```bash
# Подключаемся к PostgreSQL
sudo -u postgres psql

# Создаем базу данных
CREATE DATABASE lost_ark_manager;

# Создаем пользователя
CREATE USER lost_ark_user WITH PASSWORD 'your_secure_password';

# Даем права на базу данных
GRANT ALL PRIVILEGES ON DATABASE lost_ark_manager TO lost_ark_user;

# Выходим
\q
```

### 3. Настройка переменных окружения

```bash
# Тип базы данных
export DB_TYPE=postgresql

# Подключение к PostgreSQL
export POSTGRES_HOST=localhost
export POSTGRES_PORT=5432
export POSTGRES_USER=lost_ark_user
export POSTGRES_PASSWORD=your_secure_password
export POSTGRES_DATABASE=lost_ark_manager
export POSTGRES_SCHEMA=lost_ark_manager

# Интеграция с основным сайтом
export SITE_API_URL=https://your-site.com/api
export SITE_API_KEY=your_api_key
export SITE_AUTH_ENDPOINT=/auth/verify
export SITE_USER_ENDPOINT=/user/profile
export SITE_AUTO_SYNC=true
export SITE_SYNC_INTERVAL=300000
```

### 4. Запуск приложения

```bash
# Устанавливаем зависимости
npm install

# Запускаем
npm start
```

## 🔧 **Детальная настройка**

### **Создание файла .env**

```bash
# .env
DB_TYPE=postgresql
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=lost_ark_user
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DATABASE=lost_ark_manager
POSTGRES_SCHEMA=lost_ark_manager

# Настройки сайта
SITE_API_URL=https://your-site.com/api
SITE_API_KEY=your_api_key
SITE_AUTO_SYNC=true
SITE_SYNC_INTERVAL=300000

# Дополнительные настройки
DB_POOL_SIZE=20
DB_TIMEOUT=30000
DB_MAX_RETRIES=3
```

### **Настройка PostgreSQL для продакшена**

```bash
# Редактируем postgresql.conf
sudo nano /etc/postgresql/14/main/postgresql.conf

# Основные настройки
max_connections = 200
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 4MB
min_wal_size = 1GB
max_wal_size = 4GB

# Редактируем pg_hba.conf для безопасности
sudo nano /etc/postgresql/14/main/pg_hba.conf

# Разрешаем подключения только с определенных IP
host    lost_ark_manager    lost_ark_user    127.0.0.1/32            md5
host    lost_ark_manager    lost_ark_user    192.168.1.0/24          md5
```

### **Создание индексов для производительности**

```sql
-- Подключаемся к базе
\c lost_ark_manager

-- Создаем дополнительные индексы
CREATE INDEX CONCURRENTLY idx_characters_user_class ON lost_ark_manager.characters(user_id, class);
CREATE INDEX CONCURRENTLY idx_raids_status_date ON lost_ark_manager.raids(status, date);
CREATE INDEX CONCURRENTLY idx_chat_messages_channel_time ON lost_ark_manager.chat_messages(channel_id, created_at DESC);

-- Создаем частичные индексы
CREATE INDEX CONCURRENTLY idx_active_raids ON lost_ark_manager.raids(status, date) 
WHERE status IN ('Scheduled', 'In Progress');

CREATE INDEX CONCURRENTLY idx_unread_notifications ON lost_ark_manager.notifications(user_id, created_at) 
WHERE read_at IS NULL;
```

## 🔄 **Интеграция с основным сайтом**

### **1. API эндпоинты на основном сайте**

#### **Верификация токена:**
```php
// /api/auth/verify
<?php
header('Content-Type: application/json');

$token = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
$token = str_replace('Bearer ', '', $token);

if (empty($token)) {
    http_response_code(401);
    echo json_encode(['error' => 'Token required']);
    exit;
}

// Проверяем токен
$user = verifyToken($token);
if ($user) {
    echo json_encode([
        'id' => $user['id'],
        'username' => $user['username'],
        'email' => $user['email'],
        'role' => $user['role']
    ]);
} else {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid token']);
}
?>
```

#### **Получение профиля пользователя:**
```php
// /api/user/profile/{id}
<?php
header('Content-Type: application/json');

$userId = $_GET['id'] ?? null;
$apiKey = $_SERVER['HTTP_X_API_KEY'] ?? '';

if (!verifyApiKey($apiKey)) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid API key']);
    exit;
}

$user = getUserById($userId);
if ($user) {
    echo json_encode([
        'id' => $user['id'],
        'username' => $user['username'],
        'email' => $user['email'],
        'role' => $user['role'],
        'avatar' => $user['avatar']
    ]);
} else {
    http_response_code(404);
    echo json_encode(['error' => 'User not found']);
}
?>
```

### **2. Настройка CORS на основном сайте**

```php
// Добавляем в .htaccess или PHP
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-API-Key');
```

### **3. Создание API ключа**

```sql
-- В базе основного сайта
CREATE TABLE api_keys (
    id SERIAL PRIMARY KEY,
    key_name VARCHAR(100) NOT NULL,
    api_key VARCHAR(255) NOT NULL UNIQUE,
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL
);

-- Создаем ключ для Lost Ark Manager
INSERT INTO api_keys (key_name, api_key, permissions) VALUES (
    'Lost Ark Manager',
    'lam_' . md5(uniqid() . time()),
    '{"auth": true, "user_read": true, "notifications": true}'
);
```

## 🐳 **Docker развертывание**

### **docker-compose.yml**

```yaml
version: '3.8'

services:
  postgresql:
    image: postgres:15
    environment:
      POSTGRES_DB: lost_ark_manager
      POSTGRES_USER: lost_ark_user
      POSTGRES_PASSWORD: your_secure_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-scripts:/docker-entrypoint-initdb.d
    networks:
      - lost_ark_network

  lost_ark_manager:
    build: .
    environment:
      DB_TYPE: postgresql
      POSTGRES_HOST: postgresql
      POSTGRES_PORT: 5432
      POSTGRES_USER: lost_ark_user
      POSTGRES_PASSWORD: your_secure_password
      POSTGRES_DATABASE: lost_ark_manager
      SITE_API_URL: https://your-site.com/api
      SITE_API_KEY: your_api_key
    ports:
      - "3000:3000"
    depends_on:
      - postgresql
    networks:
      - lost_ark_network

volumes:
  postgres_data:

networks:
  lost_ark_network:
    driver: bridge
```

### **Dockerfile**

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Копируем package.json и устанавливаем зависимости
COPY package*.json ./
RUN npm ci --only=production

# Копируем исходный код
COPY . .

# Создаем пользователя для безопасности
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Меняем владельца файлов
RUN chown -R nodejs:nodejs /app
USER nodejs

# Открываем порт
EXPOSE 3000

# Запускаем приложение
CMD ["npm", "start"]
```

## 📊 **Мониторинг и производительность**

### **Настройка мониторинга**

```bash
# Включаем мониторинг
export DB_MONITORING_ENABLED=true
export DB_MONITORING_INTERVAL=60000
export DB_SLOW_QUERY_THRESHOLD=1000

# Логирование запросов
export DB_LOG_QUERIES=true
export DB_CONNECTION_ERROR_ALERTS=true
```

### **Автоматическое резервное копирование**

```bash
# Создаем скрипт бэкапа
#!/bin/bash
# backup.sh

BACKUP_DIR="/backups/lost_ark_manager"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="lost_ark_manager"
DB_USER="lost_ark_user"

# Создаем директорию для бэкапов
mkdir -p $BACKUP_DIR

# Создаем бэкап
pg_dump -h localhost -U $DB_USER -d $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# Сжимаем бэкап
gzip $BACKUP_DIR/backup_$DATE.sql

# Удаляем старые бэкапы (оставляем последние 7)
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete

echo "Backup completed: backup_$DATE.sql.gz"
```

```bash
# Добавляем в cron
chmod +x backup.sh
crontab -e

# Бэкап каждый день в 2:00
0 2 * * * /path/to/backup.sh
```

### **Автоматическая очистка**

```sql
-- Создаем функцию для очистки
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
BEGIN
    -- Удаляем старые уведомления
    DELETE FROM lost_ark_manager.notifications 
    WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '30 days';
    
    -- Удаляем старые логи
    DELETE FROM lost_ark_manager.raid_logs 
    WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '90 days';
    
    -- Удаляем старые сообщения чата
    DELETE FROM lost_ark_manager.chat_messages 
    WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '60 days';
    
    RAISE NOTICE 'Cleanup completed at %', CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Создаем задачу для автоматической очистки
SELECT cron.schedule('cleanup-old-data', '0 3 * * *', 'SELECT cleanup_old_data();');
```

## 🔒 **Безопасность**

### **Настройка SSL**

```bash
# Генерируем SSL сертификаты
sudo -u postgres openssl req -new -x509 -days 365 -nodes -text -out server.crt -keyout server.key -subj "/CN=localhost"

# Перемещаем в правильную директорию
sudo mv server.crt /etc/ssl/certs/
sudo mv server.key /etc/ssl/private/

# Настраиваем postgresql.conf
ssl = on
ssl_cert_file = '/etc/ssl/certs/server.crt'
ssl_key_file = '/etc/ssl/private/server.key'
```

### **Ограничение доступа**

```bash
# pg_hba.conf - только локальные подключения
local   all             postgres                                peer
local   lost_ark_manager lost_ark_user                          md5
host    lost_ark_manager lost_ark_user     127.0.0.1/32        md5
host    lost_ark_manager lost_ark_user     ::1/128             md5
```

### **Firewall настройки**

```bash
# UFW (Ubuntu)
sudo ufw allow from 192.168.1.0/24 to any port 5432
sudo ufw deny 5432

# iptables
sudo iptables -A INPUT -p tcp --dport 5432 -s 192.168.1.0/24 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 5432 -j DROP
```

## 🚨 **Устранение неполадок**

### **Проблемы с подключением**

```bash
# Проверяем статус PostgreSQL
sudo systemctl status postgresql

# Проверяем логи
sudo tail -f /var/log/postgresql/postgresql-14-main.log

# Проверяем подключение
psql -h localhost -U lost_ark_user -d lost_ark_manager

# Проверяем права пользователя
\du lost_ark_user
```

### **Проблемы с производительностью**

```sql
-- Проверяем медленные запросы
SELECT query, mean_time, calls, total_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Проверяем размер таблиц
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'lost_ark_manager'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Проверяем индексы
SELECT schemaname, tablename, indexname, pg_size_pretty(pg_relation_size(indexname::regclass)) as size
FROM pg_indexes
WHERE schemaname = 'lost_ark_manager';
```

### **Проблемы с интеграцией**

```bash
# Проверяем API сайта
curl -H "X-API-Key: your_api_key" https://your-site.com/api/health

# Проверяем токен
curl -H "Authorization: Bearer your_token" https://your-site.com/api/auth/verify

# Логи интеграции
export SITE_DEBUG=true
npm start
```

## 📈 **Масштабирование**

### **Репликация**

```bash
# Настройка master-slave репликации
# В postgresql.conf на master
wal_level = replica
max_wal_senders = 3
max_replication_slots = 3

# На slave
hot_standby = on
```

### **Шардинг**

```sql
-- Создаем партиции для больших таблиц
CREATE TABLE lost_ark_manager.chat_messages_partitioned (
    LIKE lost_ark_manager.chat_messages INCLUDING ALL
) PARTITION BY RANGE (created_at);

-- Создаем партиции по месяцам
CREATE TABLE chat_messages_2024_01 PARTITION OF chat_messages_partitioned
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE chat_messages_2024_02 PARTITION OF chat_messages_partitioned
FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
```

## 🎯 **Преимущества PostgreSQL**

1. **ACID совместимость** - надежность транзакций
2. **JSONB поддержка** - гибкость схемы
3. **Продвинутые индексы** - высокая производительность
4. **Репликация** - масштабируемость
5. **Расширения** - дополнительная функциональность
6. **Сообщество** - активная поддержка

## 📚 **Дополнительные ресурсы**

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [PostgreSQL Performance Tuning](https://www.postgresql.org/docs/current/runtime-config-query.html)
- [PostgreSQL Security](https://www.postgresql.org/docs/current/auth-pg-hba-conf.html)
- [Node.js PostgreSQL Driver](https://node-postgres.com/)