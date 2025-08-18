const express = require('express');
const app = express();
const PORT = 3001;

// Простой тест
app.get('/test', (req, res) => {
    res.json({ message: 'Test endpoint works!' });
});

// API роутер
const apiRouter = express.Router();

apiRouter.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        message: 'Health check works!'
    });
});

// Подключаем API роутер
app.use('/api', apiRouter);

// Запуск сервера
app.listen(PORT, () => {
    console.log(`🚀 Test Server запущен на порту ${PORT}`);
    console.log(`📊 API доступен по адресу: http://localhost:${PORT}/api`);
});

// Обработка ошибок
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.originalUrl,
        method: req.method
    });
});
