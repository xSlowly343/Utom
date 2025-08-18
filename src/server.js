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

// Middleware для безопасности
app.use(helmet({
    contentSecurityPolicy: false,
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

// Парсинг JSON
app.use(express.json({ limit: '10mb' }));

// Парсинг URL-encoded данных
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API роутер
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

// Characters API
apiRouter.get('/characters', (req, res) => {
    try {
        const characters = [
            {
                id: 1,
                name: 'TestCharacter',
                class: 'Berserker',
                level: 50,
                itemLevel: 1490,
                server: 'Test Server'
            }
        ];
        
        res.json({
            success: true,
            data: characters,
            count: characters.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
});

// Chat API
apiRouter.get('/chat/channels', (req, res) => {
    try {
        const channels = [
            { id: 1, name: 'Общий', type: 'public' },
            { id: 2, name: 'Рейды', type: 'public' },
            { id: 3, name: 'Торговля', type: 'public' },
            { id: 4, name: 'Помощь', type: 'public' }
        ];
        
        res.json({
            success: true,
            data: channels,
            count: channels.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
});

// Tools API
apiRouter.get('/tools/calculators', (req, res) => {
    try {
        const calculators = [
            { id: 1, name: 'DPS Calculator', type: 'damage' },
            { id: 2, name: 'Gear Optimizer', type: 'equipment' },
            { id: 3, name: 'Engraving Calculator', type: 'engraving' }
        ];
        
        res.json({
            success: true,
            data: calculators,
            count: calculators.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
});

// Analytics API
apiRouter.get('/analytics/overview', (req, res) => {
    try {
        const overview = {
            totalRaids: 25,
            completedRaids: 20,
            totalCharacters: 8,
            activeUsers: 15,
            weeklyProgress: 85
        };
        
        res.json({
            success: true,
            data: overview
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
});

// Подключаем API роутер
app.use('/api', apiRouter);

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
        path: req.originalUrl,
        method: req.method
    });
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('Global error handler:', error);
    
    const statusCode = error.statusCode || error.status || 500;
    const message = error.message || 'Internal server error';
    
    res.status(statusCode).json({
        success: false,
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
});

// Запуск сервера
const server = app.listen(PORT, () => {
    console.log(`🚀 Express 5.x Server запущен на порту ${PORT}`);
    console.log(`📊 API доступен по адресу: http://localhost:${PORT}/api`);
    console.log(`🔒 Режим безопасности: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
        process.exit(0);
    });
});

// Экспорт для тестирования
module.exports = { app, server };
