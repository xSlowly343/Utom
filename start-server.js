#!/usr/bin/env node

/**
 * Server Startup Script
 * Скрипт для запуска Express сервера
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

function startServer() {
    console.log('🚀 Запуск Express сервера...');
    
    const serverPath = path.join(__dirname, 'src', 'server.js');
    
    if (!fs.existsSync(serverPath)) {
        console.error('❌ Файл сервера не найден:', serverPath);
        process.exit(1);
    }
    
    const server = spawn('node', [serverPath], {
        stdio: 'inherit',
        shell: true,
        env: {
            ...process.env,
            NODE_ENV: process.env.NODE_ENV || 'development'
        }
    });
    
    server.on('error', (error) => {
        console.error('❌ Ошибка запуска сервера:', error);
        process.exit(1);
    });
    
    console.log('✅ Сервер запущен');
    console.log('📊 API доступен по адресу: http://localhost:3000/api');
    console.log('🔒 Режим: ' + (process.env.NODE_ENV || 'development'));
    console.log('⏹️  Для остановки нажмите Ctrl+C');
}

startServer();
