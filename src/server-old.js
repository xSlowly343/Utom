/**
 * Express 5.x Server
 * API сервер для Lost Ark Raid Manager
 * Обновлен для совместимости с Express 5.x
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

// Инициализация приложения
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware для безопасности (Express 5.x совместимый)
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"]
        }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS настройки
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://yourdomain.com'] 
        : ['http://localhost:3000', 'http://localhost:8080'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Сжатие ответов
app.use(compression());

// Логирование
if (process.env.NODE_ENV !== 'test') {
    const logDir = path.join(__dirname, '..', 'logs');
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }
    
    const accessLogStream = fs.createWriteStream(
        path.join(logDir, 'access.log'),
        { flags: 'a' }
    );
    
    app.use(morgan('combined', { stream: accessLogStream }));
    app.use(morgan('dev'));
}

// Парсинг JSON (Express 5.x)
app.use(express.json({ 
    limit: '10mb',
    verify: (req, res, buf) => {
        try {
            JSON.parse(buf);
        } catch (e) {
            res.status(400).json({ error: 'Invalid JSON' });
            throw new Error('Invalid JSON');
        }
    }
}));

// Парсинг URL-encoded данных
app.use(express.urlencoded({ 
    extended: true, 
    limit: '10mb' 
}));

// Статические файлы
app.use('/static', express.static(path.join(__dirname, 'renderer')));
app.use('/assets', express.static(path.join(__dirname, '..', 'assets')));

// API Routes
const apiRouter = express.Router();

// Health check
apiRouter.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: require('../package.json').version,
        environment: process.env.NODE_ENV || 'development'
    });
});

// Raids API
apiRouter.get('/raids', (req, res) => {
    try {
        const raids = [
            {
                id: 1,
                name: 'Вальтас',
                type: 'Legion Raid',
                difficulty: 'Normal',
                status: 'Scheduled',
                date: new Date().toISOString(),
                participants: []
            }
        ];
        
        res.json({
            success: true,
            data: raids,
            count: raids.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
});

// Запуск сервера
const server = app.listen(PORT, () => {
    console.log(`🚀 Express 5.x Server запущен на порту ${PORT}`);
    console.log(`📊 API доступен по адресу: http://localhost:${PORT}/api`);
    console.log(`🔒 Режим безопасности: ${process.env.NODE_ENV || 'development'}`);
});

// Экспорт для тестирования
module.exports = { app, server };
