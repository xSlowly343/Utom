/**
 * Auto Tester
 * Автоматическое тестирование системы в фоновом режиме
 */

class AutoTester {
    constructor() {
        this.config = {
            enabled: true,
            interval: 300000, // 5 минут
            criticalTests: ['database', 'websocket', 'authentication'],
            warningThreshold: 0.8, // 80% тестов должны проходить
            criticalThreshold: 0.6, // 60% критических тестов должны проходить
            maxRetries: 3,
            retryDelay: 60000 // 1 минута
        };
        
        this.testHistory = [];
        this.currentStatus = 'unknown';
        this.lastTestTime = null;
        this.testTimer = null;
        this.retryCount = 0;
        
        this.notifications = {
            enabled: true,
            sound: true,
            desktop: true
        };
        
        this.init();
    }

    init() {
        this.loadConfig();
        this.startAutoTesting();
        this.setupNotifications();
        console.log('AutoTester: Инициализирован');
    }

    loadConfig() {
        try {
            const savedConfig = localStorage.getItem('autoTesterConfig');
            if (savedConfig) {
                this.config = { ...this.config, ...JSON.parse(savedConfig) };
            }
        } catch (error) {
            console.error('AutoTester: Ошибка загрузки конфигурации:', error);
        }
    }

    saveConfig() {
        try {
            localStorage.setItem('autoTesterConfig', JSON.stringify(this.config));
        } catch (error) {
            console.error('AutoTester: Ошибка сохранения конфигурации:', error);
        }
    }

    startAutoTesting() {
        if (!this.config.enabled) return;
        
        // Первый тест через 30 секунд после запуска
        setTimeout(() => {
            this.runAutoTest();
        }, 30000);
        
        // Устанавливаем интервал для автоматического тестирования
        this.testTimer = setInterval(() => {
            this.runAutoTest();
        }, this.config.interval);
        
        console.log(`AutoTester: Автоматическое тестирование запущено (интервал: ${this.config.interval / 1000}с)`);
    }

    stopAutoTesting() {
        if (this.testTimer) {
            clearInterval(this.testTimer);
            this.testTimer = null;
            console.log('AutoTester: Автоматическое тестирование остановлено');
        }
    }

    async runAutoTest() {
        if (!window.testManager) {
            console.warn('AutoTester: TestManager недоступен');
            return;
        }

        try {
            console.log('AutoTester: Запуск автоматического теста...');
            
            // Запускаем только критические тесты
            const results = await this.runCriticalTests();
            
            // Анализируем результаты
            this.analyzeResults(results);
            
            // Сохраняем в историю
            this.saveTestHistory(results);
            
            // Обновляем статус
            this.updateStatus(results);
            
            // Проверяем необходимость уведомлений
            this.checkNotifications(results);
            
            // Сбрасываем счетчик попыток при успехе
            if (results.overall.success) {
                this.retryCount = 0;
            }
            
            this.lastTestTime = Date.now();
            
        } catch (error) {
            console.error('AutoTester: Ошибка автоматического теста:', error);
            this.handleTestError(error);
        }
    }

    async runCriticalTests() {
        const results = {
            timestamp: Date.now(),
            tests: {},
            overall: {
                total: 0,
                passed: 0,
                failed: 0,
                success: false,
                score: 0
            }
        };

        // Запускаем критические тесты
        for (const testName of this.config.criticalTests) {
            try {
                const testResult = await this.runSingleTest(testName);
                results.tests[testName] = testResult;
                results.overall.total++;
                
                if (testResult.success) {
                    results.overall.passed++;
                } else {
                    results.overall.failed++;
                }
                
            } catch (error) {
                results.tests[testName] = {
                    success: false,
                    error: error.message,
                    duration: 0
                };
                results.overall.total++;
                results.overall.failed++;
            }
        }

        // Вычисляем общий результат
        results.overall.score = results.overall.total > 0 ? 
            results.overall.passed / results.overall.total : 0;
        results.overall.success = results.overall.score >= this.config.criticalThreshold;

        return results;
    }

    async runSingleTest(testName) {
        const startTime = Date.now();
        
        try {
            switch (testName) {
                case 'database':
                    return await this.testDatabase();
                case 'websocket':
                    return await this.testWebSocket();
                case 'authentication':
                    return await this.testAuthentication();
                default:
                    throw new Error(`Неизвестный тест: ${testName}`);
            }
        } finally {
            const duration = Date.now() - startTime;
            return { duration, ...result };
        }
    }

    async testDatabase() {
        if (!window.databaseManager) {
            throw new Error('DatabaseManager недоступен');
        }

        try {
            // Простой тест подключения
            const stats = await window.databaseManager.getStats();
            return {
                success: true,
                data: stats,
                message: 'База данных работает нормально'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Ошибка подключения к базе данных'
            };
        }
    }

    async testWebSocket() {
        if (!window.wsClient) {
            throw new Error('WebSocket клиент недоступен');
        }

        try {
            // Проверяем подключение
            if (window.wsClient.isConnected) {
                return {
                    success: true,
                    message: 'WebSocket подключение активно'
                };
            } else {
                // Пытаемся переподключиться
                await window.wsClient.connect();
                
                if (window.wsClient.isConnected) {
                    return {
                        success: true,
                        message: 'WebSocket переподключен успешно'
                    };
                } else {
                    return {
                        success: false,
                        message: 'WebSocket не удается подключить'
                    };
                }
            }
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Ошибка WebSocket'
            };
        }
    }

    async testAuthentication() {
        if (!window.authManager) {
            throw new Error('AuthManager недоступен');
        }

        try {
            // Проверяем базовую функциональность
            const isAuth = window.authManager.isUserAuthenticated();
            const currentUser = window.authManager.getCurrentUser();
            
            return {
                success: true,
                data: { isAuthenticated: isAuth, currentUser },
                message: 'Система аутентификации работает'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Ошибка системы аутентификации'
            };
        }
    }

    analyzeResults(results) {
        const { overall, tests } = results;
        
        console.log(`AutoTester: Результаты теста - Общий счет: ${(overall.score * 100).toFixed(1)}%`);
        
        // Логируем детали по каждому тесту
        for (const [testName, testResult] of Object.entries(tests)) {
            const status = testResult.success ? '✅' : '❌';
            const message = testResult.message || 'Тест завершен';
            console.log(`AutoTester: ${testName} ${status} - ${message}`);
        }

        // Проверяем критические проблемы
        if (overall.score < this.config.criticalThreshold) {
            console.error(`AutoTester: КРИТИЧЕСКАЯ ПРОБЛЕМА! Счет: ${(overall.score * 100).toFixed(1)}%`);
        } else if (overall.score < this.config.warningThreshold) {
            console.warn(`AutoTester: ПРЕДУПРЕЖДЕНИЕ! Счет: ${(overall.score * 100).toFixed(1)}%`);
        } else {
            console.log(`AutoTester: Все тесты прошли успешно! Счет: ${(overall.score * 100).toFixed(1)}%`);
        }
    }

    saveTestHistory(results) {
        this.testHistory.push(results);
        
        // Ограничиваем историю последними 100 тестами
        if (this.testHistory.length > 100) {
            this.testHistory.shift();
        }

        // Сохраняем в localStorage
        try {
            localStorage.setItem('autoTesterHistory', JSON.stringify(this.testHistory));
        } catch (error) {
            console.error('AutoTester: Ошибка сохранения истории:', error);
        }
    }

    updateStatus(results) {
        const { overall } = results;
        
        if (overall.score >= this.config.warningThreshold) {
            this.currentStatus = 'healthy';
        } else if (overall.score >= this.config.criticalThreshold) {
            this.currentStatus = 'warning';
        } else {
            this.currentStatus = 'critical';
        }

        // Обновляем UI если доступен
        this.updateStatusUI();
    }

    updateStatusUI() {
        // Ищем элемент статуса в интерфейсе
        const statusElement = document.getElementById('autoTesterStatus');
        if (statusElement) {
            const statusMap = {
                healthy: { icon: '✅', text: 'Здоров', class: 'healthy' },
                warning: { icon: '⚠️', text: 'Предупреждение', class: 'warning' },
                critical: { icon: '🚨', text: 'Критично', class: 'critical' },
                unknown: { icon: '❓', text: 'Неизвестно', class: 'unknown' }
            };

            const status = statusMap[this.currentStatus];
            statusElement.innerHTML = `${status.icon} ${status.text}`;
            statusElement.className = `status-indicator ${status.class}`;
        }
    }

    checkNotifications(results) {
        if (!this.notifications.enabled) return;

        const { overall } = results;
        
        // Уведомление о критических проблемах
        if (overall.score < this.config.criticalThreshold) {
            this.showNotification('🚨 Критическая проблема!', 
                `Система работает нестабильно. Счет: ${(overall.score * 100).toFixed(1)}%`, 
                'critical');
        }
        // Уведомление о предупреждениях
        else if (overall.score < this.config.warningThreshold) {
            this.showNotification('⚠️ Предупреждение!', 
                `Обнаружены проблемы в системе. Счет: ${(overall.score * 100).toFixed(1)}%`, 
                'warning');
        }
        // Уведомление о восстановлении
        else if (this.currentStatus === 'healthy' && this.testHistory.length > 1) {
            const previousStatus = this.testHistory[this.testHistory.length - 2]?.overall?.score || 0;
            if (previousStatus < this.config.warningThreshold) {
                this.showNotification('✅ Система восстановлена!', 
                    `Все проблемы решены. Счет: ${(overall.score * 100).toFixed(1)}%`, 
                    'success');
            }
        }
    }

    showNotification(title, message, type = 'info') {
        // Звуковое уведомление
        if (this.notifications.sound) {
            this.playNotificationSound(type);
        }

        // Desktop уведомление
        if (this.notifications.desktop && 'Notification' in window) {
            if (Notification.permission === 'granted') {
                new Notification(title, {
                    body: message,
                    icon: '/assets/icons/icon.png',
                    tag: 'auto-tester'
                });
            }
        }

        // Встроенное уведомление в UI
        this.showInAppNotification(title, message, type);
    }

    playNotificationSound(type) {
        try {
            const audio = new Audio();
            
            switch (type) {
                case 'critical':
                    audio.src = '/assets/sounds/critical.mp3';
                    break;
                case 'warning':
                    audio.src = '/assets/sounds/warning.mp3';
                    break;
                case 'success':
                    audio.src = '/assets/sounds/success.mp3';
                    break;
                default:
                    audio.src = '/assets/sounds/notification.mp3';
            }
            
            audio.play().catch(error => {
                console.warn('AutoTester: Не удается воспроизвести звук:', error);
            });
        } catch (error) {
            console.warn('AutoTester: Ошибка воспроизведения звука:', error);
        }
    }

    showInAppNotification(title, message, type) {
        const notification = document.createElement('div');
        notification.className = `auto-tester-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-header">
                <span class="notification-title">${title}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
            <div class="notification-message">${message}</div>
        `;

        // Добавляем в контейнер уведомлений
        const container = document.getElementById('notificationsContainer') || document.body;
        container.appendChild(notification);

        // Автоматически удаляем через 10 секунд
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 10000);
    }

    handleTestError(error) {
        console.error('AutoTester: Ошибка тестирования:', error);
        
        // Увеличиваем счетчик попыток
        this.retryCount++;
        
        if (this.retryCount <= this.config.maxRetries) {
            console.log(`AutoTester: Повторная попытка ${this.retryCount}/${this.config.maxRetries} через ${this.config.retryDelay / 1000}с`);
            
            setTimeout(() => {
                this.runAutoTest();
            }, this.config.retryDelay);
        } else {
            console.error('AutoTester: Превышено максимальное количество попыток');
            this.showNotification('🚨 Критическая ошибка!', 
                'Автоматическое тестирование не может быть выполнено', 'critical');
        }
    }

    setupNotifications() {
        // Запрашиваем разрешение на уведомления
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }

    // API для управления
    enable() {
        this.config.enabled = true;
        this.saveConfig();
        this.startAutoTesting();
        console.log('AutoTester: Включен');
    }

    disable() {
        this.config.enabled = false;
        this.saveConfig();
        this.stopAutoTesting();
        console.log('AutoTester: Отключен');
    }

    setInterval(interval) {
        this.config.interval = interval;
        this.saveConfig();
        
        if (this.config.enabled) {
            this.stopAutoTesting();
            this.startAutoTesting();
        }
        
        console.log(`AutoTester: Интервал установлен в ${interval / 1000}с`);
    }

    getStatus() {
        return {
            enabled: this.config.enabled,
            currentStatus: this.currentStatus,
            lastTestTime: this.lastTestTime,
            testHistory: this.testHistory,
            config: this.config
        };
    }

    getTestHistory(limit = 50) {
        return this.testHistory.slice(-limit);
    }

    getStatistics() {
        if (this.testHistory.length === 0) {
            return {
                totalTests: 0,
                averageScore: 0,
                successRate: 0,
                last24Hours: 0
            };
        }

        const now = Date.now();
        const last24Hours = this.testHistory.filter(test => 
            now - test.timestamp < 24 * 60 * 60 * 1000
        );

        const totalTests = this.testHistory.length;
        const averageScore = this.testHistory.reduce((sum, test) => 
            sum + test.overall.score, 0) / totalTests;
        const successRate = this.testHistory.filter(test => 
            test.overall.success).length / totalTests;

        return {
            totalTests,
            averageScore: averageScore * 100,
            successRate: successRate * 100,
            last24Hours: last24Hours.length
        };
    }

    // Остановка модуля
    stop() {
        this.stopAutoTesting();
        console.log('AutoTester: Остановлен');
    }

    // Перезапуск модуля
    restart() {
        this.stop();
        this.init();
        console.log('AutoTester: Перезапущен');
    }
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    window.autoTester = new AutoTester();
});

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AutoTester;
}