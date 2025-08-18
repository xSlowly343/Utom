/**
 * Module Health Checker
 * Проверяет доступность и работоспособность всех модулей приложения
 */

class ModuleHealthChecker {
    constructor() {
        this.requiredModules = {
            critical: ['app', 'navigation', 'stateManager'],
            important: ['databaseManager', 'authManager', 'websocketClient'],
            optional: ['analytics', 'performanceManager', 'testManager']
        };
        
        this.moduleStatus = new Map();
        this.healthChecks = new Map();
        this.recoveryAttempts = new Map();
        this.maxRecoveryAttempts = 3;
        
        this.init();
    }

    init() {
        this.setupHealthChecks();
        this.startPeriodicChecks();
        console.log('ModuleHealthChecker: Инициализирован');
    }

    setupHealthChecks() {
        // Проверки для критических модулей
        this.healthChecks.set('app', () => this.checkAppModule());
        this.healthChecks.set('navigation', () => this.checkNavigationModule());
        this.healthChecks.set('stateManager', () => this.checkStateManagerModule());
        
        // Проверки для важных модулей
        this.healthChecks.set('databaseManager', () => this.checkDatabaseModule());
        this.healthChecks.set('authManager', () => this.checkAuthModule());
        this.healthChecks.set('websocketClient', () => this.checkWebSocketModule());
        
        // Проверки для опциональных модулей
        this.healthChecks.set('analytics', () => this.checkAnalyticsModule());
        this.healthChecks.set('performanceManager', () => this.checkPerformanceModule());
        this.healthChecks.set('testManager', () => this.checkTestManagerModule());
    }

    startPeriodicChecks() {
        // Первая проверка через 5 секунд после загрузки
        setTimeout(() => {
            this.runHealthCheck();
        }, 5000);
        
        // Периодические проверки каждые 30 секунд
        setInterval(() => {
            this.runHealthCheck();
        }, 30000);
    }

    async runHealthCheck() {
        console.log('ModuleHealthChecker: Запуск проверки здоровья модулей...');
        
        const results = {
            timestamp: new Date().toISOString(),
            critical: {},
            important: {},
            optional: {},
            overall: { healthy: true, issues: [] }
        };

        // Проверяем критические модули
        for (const moduleName of this.requiredModules.critical) {
            const status = await this.checkModule(moduleName);
            results.critical[moduleName] = status;
            
            if (!status.healthy) {
                results.overall.healthy = false;
                results.overall.issues.push(`Критический модуль ${moduleName}: ${status.error}`);
            }
        }

        // Проверяем важные модули
        for (const moduleName of this.requiredModules.important) {
            const status = await this.checkModule(moduleName);
            results.important[moduleName] = status;
            
            if (!status.healthy) {
                results.overall.issues.push(`Важный модуль ${moduleName}: ${status.error}`);
            }
        }

        // Проверяем опциональные модули
        for (const moduleName of this.requiredModules.optional) {
            const status = await this.checkModule(moduleName);
            results.optional[moduleName] = status;
        }

        // Обновляем статус
        this.updateModuleStatus(results);
        
        // Пытаемся восстановить проблемные модули
        await this.attemptRecovery(results);
        
        // Уведомляем пользователя о проблемах
        this.notifyUserAboutIssues(results);
        
        console.log('ModuleHealthChecker: Проверка завершена:', results);
        return results;
    }

    async checkModule(moduleName) {
        const healthCheck = this.healthChecks.get(moduleName);
        if (!healthCheck) {
            return { healthy: false, error: 'Health check не найден' };
        }

        try {
            const result = await healthCheck();
            this.moduleStatus.set(moduleName, result);
            return result;
        } catch (error) {
            const result = { healthy: false, error: error.message };
            this.moduleStatus.set(moduleName, result);
            return result;
        }
    }

    // Проверки для конкретных модулей
    async checkAppModule() {
        if (!window.app) {
            return { healthy: false, error: 'Модуль не найден' };
        }

        try {
            // Проверяем основные методы
            if (typeof window.app.getCurrentPage !== 'function') {
                return { healthy: false, error: 'Отсутствует метод getCurrentPage' };
            }

            if (typeof window.app.showPage !== 'function') {
                return { healthy: false, error: 'Отсутствует метод showPage' };
            }

            // Проверяем состояние
            const currentPage = window.app.getCurrentPage();
            if (!currentPage) {
                return { healthy: false, error: 'Не удается получить текущую страницу' };
            }

            return { 
                healthy: true, 
                currentPage: currentPage,
                methods: ['getCurrentPage', 'showPage', 'loadSettings']
            };
        } catch (error) {
            return { healthy: false, error: error.message };
        }
    }

    async checkNavigationModule() {
        if (!window.navigation) {
            return { healthy: false, error: 'Модуль не найден' };
        }

        try {
            if (typeof window.navigation.navigateTo !== 'function') {
                return { healthy: false, error: 'Отсутствует метод navigateTo' };
            }

            if (typeof window.navigation.getCurrentPage !== 'function') {
                return { healthy: false, error: 'Отсутствует метод getCurrentPage' };
            }

            const currentPage = window.navigation.getCurrentPage();
            if (!currentPage) {
                return { healthy: false, error: 'Не удается получить текущую страницу' };
            }

            return { 
                healthy: true, 
                currentPage: currentPage,
                methods: ['navigateTo', 'getCurrentPage', 'setCurrentPage']
            };
        } catch (error) {
            return { healthy: false, error: error.message };
        }
    }

    async checkStateManagerModule() {
        if (!window.stateManager) {
            return { healthy: false, error: 'Модуль не найден' };
        }

        try {
            if (typeof window.stateManager.getState !== 'function') {
                return { healthy: false, error: 'Отсутствует метод getState' };
            }

            if (typeof window.stateManager.setState !== 'function') {
                return { healthy: false, error: 'Отсутствует метод setState' };
            }

            const state = window.stateManager.getState();
            if (!state || !state.app) {
                return { healthy: false, error: 'Не удается получить состояние приложения' };
            }

            return { 
                healthy: true, 
                stateKeys: Object.keys(state),
                methods: ['getState', 'setState', 'subscribe']
            };
        } catch (error) {
            return { healthy: false, error: error.message };
        }
    }

    async checkDatabaseModule() {
        if (!window.databaseManager) {
            return { healthy: false, error: 'Модуль не найден' };
        }

        try {
            if (typeof window.databaseManager.getStats !== 'function') {
                return { healthy: false, error: 'Отсутствует метод getStats' };
            }

            // Пытаемся получить статистику БД
            const stats = await window.databaseManager.getStats();
            if (!stats) {
                return { healthy: false, error: 'Не удается получить статистику БД' };
            }

            return { 
                healthy: true, 
                stats: stats,
                methods: ['getStats', 'createUser', 'getUserById']
            };
        } catch (error) {
            return { healthy: false, error: error.message };
        }
    }

    async checkAuthModule() {
        if (!window.authManager) {
            return { healthy: false, error: 'Модуль не найден' };
        }

        try {
            if (typeof window.authManager.isUserAuthenticated !== 'function') {
                return { healthy: false, error: 'Отсутствует метод isUserAuthenticated' };
            }

            if (typeof window.authManager.getCurrentUser !== 'function') {
                return { healthy: false, error: 'Отсутствует метод getCurrentUser' };
            }

            const isAuth = window.authManager.isUserAuthenticated();
            const currentUser = window.authManager.getCurrentUser();

            return { 
                healthy: true, 
                isAuthenticated: isAuth,
                currentUser: currentUser,
                methods: ['isUserAuthenticated', 'getCurrentUser', 'login', 'logout']
            };
        } catch (error) {
            return { healthy: false, error: error.message };
        }
    }

    async checkWebSocketModule() {
        if (!window.websocketClient) {
            return { healthy: false, error: 'Модуль не найден' };
        }

        try {
            if (typeof window.websocketClient.isConnected !== 'boolean') {
                return { healthy: false, error: 'Отсутствует свойство isConnected' };
            }

            if (typeof window.websocketClient.connect !== 'function') {
                return { healthy: false, error: 'Отсутствует метод connect' };
            }

            return { 
                healthy: true, 
                isConnected: window.websocketClient.isConnected,
                methods: ['connect', 'disconnect', 'sendMessage']
            };
        } catch (error) {
            return { healthy: false, error: error.message };
        }
    }

    async checkAnalyticsModule() {
        if (!window.analytics) {
            return { healthy: false, error: 'Модуль не найден' };
        }

        try {
            if (typeof window.analytics.track !== 'function') {
                return { healthy: false, error: 'Отсутствует метод track' };
            }

            return { 
                healthy: true, 
                methods: ['track', 'identify', 'page']
            };
        } catch (error) {
            return { healthy: false, error: error.message };
        }
    }

    async checkPerformanceModule() {
        if (!window.performanceManager) {
            return { healthy: false, error: 'Модуль не найден' };
        }

        try {
            if (typeof window.performanceManager.getMetrics !== 'function') {
                return { healthy: false, error: 'Отсутствует метод getMetrics' };
            }

            const metrics = window.performanceManager.getMetrics();
            if (!metrics) {
                return { healthy: false, error: 'Не удается получить метрики' };
            }

            return { 
                healthy: true, 
                metrics: metrics,
                methods: ['getMetrics', 'generateReport']
            };
        } catch (error) {
            return { healthy: false, error: error.message };
        }
    }

    async checkTestManagerModule() {
        if (!window.testManager) {
            return { healthy: false, error: 'Модуль не найден' };
        }

        try {
            if (typeof window.testManager.runAllTests !== 'function') {
                return { healthy: false, error: 'Отсутствует метод runAllTests' };
            }

            return { 
                healthy: true, 
                methods: ['runAllTests', 'runSelectedTests', 'exportResults']
            };
        } catch (error) {
            return { healthy: false, error: error.message };
        }
    }

    updateModuleStatus(results) {
        // Обновляем статус всех модулей
        Object.entries(results).forEach(([category, modules]) => {
            if (typeof modules === 'object' && !Array.isArray(modules)) {
                Object.entries(modules).forEach(([moduleName, status]) => {
                    this.moduleStatus.set(moduleName, status);
                });
            }
        });
    }

    async attemptRecovery(results) {
        const problematicModules = [];
        
        // Собираем проблемные модули
        Object.entries(results).forEach(([category, modules]) => {
            if (typeof modules === 'object' && !Array.isArray(modules)) {
                Object.entries(modules).forEach(([moduleName, status]) => {
                    if (!status.healthy) {
                        problematicModules.push({ name: moduleName, category, status });
                    }
                });
            }
        });

        // Пытаемся восстановить каждый проблемный модуль
        for (const module of problematicModules) {
            await this.recoverModule(module);
        }
    }

    async recoverModule(moduleInfo) {
        const { name, category, status } = moduleInfo;
        
        // Проверяем количество попыток восстановления
        const attempts = this.recoveryAttempts.get(name) || 0;
        if (attempts >= this.maxRecoveryAttempts) {
            console.warn(`ModuleHealthChecker: Превышено количество попыток восстановления для ${name}`);
            return false;
        }

        console.log(`ModuleHealthChecker: Попытка восстановления модуля ${name} (попытка ${attempts + 1})`);
        
        try {
            let recovered = false;
            
            switch (name) {
                case 'app':
                    recovered = await this.recoverAppModule();
                    break;
                case 'navigation':
                    recovered = await this.recoverNavigationModule();
                    break;
                case 'stateManager':
                    recovered = await this.recoverStateManagerModule();
                    break;
                case 'databaseManager':
                    recovered = await this.recoverDatabaseModule();
                    break;
                case 'authManager':
                    recovered = await this.recoverAuthModule();
                    break;
                case 'websocketClient':
                    recovered = await this.recoverWebSocketModule();
                    break;
                default:
                    console.warn(`ModuleHealthChecker: Неизвестный модуль для восстановления: ${name}`);
                    return false;
            }

            if (recovered) {
                console.log(`ModuleHealthChecker: Модуль ${name} успешно восстановлен`);
                this.recoveryAttempts.delete(name);
                return true;
            } else {
                this.recoveryAttempts.set(name, attempts + 1);
                console.warn(`ModuleHealthChecker: Не удалось восстановить модуль ${name}`);
                return false;
            }
            
        } catch (error) {
            console.error(`ModuleHealthChecker: Ошибка восстановления модуля ${name}:`, error);
            this.recoveryAttempts.set(name, attempts + 1);
            return false;
        }
    }

    // Методы восстановления для конкретных модулей
    async recoverAppModule() {
        try {
            // Пытаемся переинициализировать основное приложение
            if (window.app && typeof window.app.init === 'function') {
                await window.app.init();
                return true;
            }
            return false;
        } catch (error) {
            console.error('ModuleHealthChecker: Ошибка восстановления app модуля:', error);
            return false;
        }
    }

    async recoverNavigationModule() {
        try {
            if (window.navigation && typeof window.navigation.init === 'function') {
                window.navigation.init();
                return true;
            }
            return false;
        } catch (error) {
            console.error('ModuleHealthChecker: Ошибка восстановления navigation модуля:', error);
            return false;
        }
    }

    async recoverStateManagerModule() {
        try {
            if (window.stateManager && typeof window.stateManager.init === 'function') {
                window.stateManager.init();
                return true;
            }
            return false;
        } catch (error) {
            console.error('ModuleHealthChecker: Ошибка восстановления stateManager модуля:', error);
            return false;
        }
    }

    async recoverDatabaseModule() {
        try {
            if (window.databaseManager && typeof window.databaseManager.init === 'function') {
                await window.databaseManager.init();
                return true;
            }
            return false;
        } catch (error) {
            console.error('ModuleHealthChecker: Ошибка восстановления databaseManager модуля:', error);
            return false;
        }
    }

    async recoverAuthModule() {
        try {
            if (window.authManager && typeof window.authManager.init === 'function') {
                window.authManager.init();
                return true;
            }
            return false;
        } catch (error) {
            console.error('ModuleHealthChecker: Ошибка восстановления authManager модуля:', error);
            return false;
        }
    }

    async recoverWebSocketModule() {
        try {
            if (window.websocketClient && typeof window.websocketClient.connect === 'function') {
                await window.websocketClient.connect();
                return true;
            }
            return false;
        } catch (error) {
            console.error('ModuleHealthChecker: Ошибка восстановления websocketClient модуля:', error);
            return false;
        }
    }

    notifyUserAboutIssues(results) {
        if (!results.overall.healthy) {
            // Показываем уведомление о проблемах
            this.showHealthIssuesNotification(results.overall.issues);
        }
    }

    showHealthIssuesNotification(issues) {
        const notification = document.createElement('div');
        notification.className = 'health-issues-notification warning';
        notification.innerHTML = `
            <div class="notification-header">
                <span class="notification-icon">⚠️</span>
                <span class="notification-title">Проблемы с модулями</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
            <div class="notification-message">
                Обнаружены проблемы с некоторыми модулями приложения.
                <button class="btn btn-sm btn-secondary" onclick="window.moduleHealthChecker.showDetailedReport()">
                    📋 Подробности
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Автоматически убираем через 15 секунд
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 15000);
    }

    // Публичные методы
    getModuleStatus(moduleName) {
        return this.moduleStatus.get(moduleName);
    }

    getAllModuleStatuses() {
        const statuses = {};
        this.moduleStatus.forEach((status, moduleName) => {
            statuses[moduleName] = status;
        });
        return statuses;
    }

    isModuleHealthy(moduleName) {
        const status = this.moduleStatus.get(moduleName);
        return status ? status.healthy : false;
    }

    getCriticalModulesHealth() {
        const criticalHealth = {};
        this.requiredModules.critical.forEach(moduleName => {
            criticalHealth[moduleName] = this.isModuleHealthy(moduleName);
        });
        return criticalHealth;
    }

    showDetailedReport() {
        const report = this.generateDetailedReport();
        alert(`Отчет о здоровье модулей:\n\n${report}`);
    }

    generateDetailedReport() {
        let report = 'Статус модулей приложения:\n\n';
        
        // Критические модули
        report += '🔴 КРИТИЧЕСКИЕ МОДУЛИ:\n';
        this.requiredModules.critical.forEach(moduleName => {
            const status = this.moduleStatus.get(moduleName);
            const icon = status?.healthy ? '✅' : '❌';
            const error = status?.error || 'OK';
            report += `${icon} ${moduleName}: ${error}\n`;
        });
        
        // Важные модули
        report += '\n🟡 ВАЖНЫЕ МОДУЛИ:\n';
        this.requiredModules.important.forEach(moduleName => {
            const status = this.moduleStatus.get(moduleName);
            const icon = status?.healthy ? '✅' : '❌';
            const error = status?.error || 'OK';
            report += `${icon} ${moduleName}: ${error}\n`;
        });
        
        // Опциональные модули
        report += '\n🟢 ОПЦИОНАЛЬНЫЕ МОДУЛИ:\n';
        this.requiredModules.optional.forEach(moduleName => {
            const status = this.moduleStatus.get(moduleName);
            const icon = status?.healthy ? '✅' : '❌';
            const error = status?.error || 'OK';
            report += `${icon} ${moduleName}: ${error}\n`;
        });
        
        return report;
    }

    forceHealthCheck() {
        console.log('ModuleHealthChecker: Принудительная проверка здоровья');
        return this.runHealthCheck();
    }

    // Остановка модуля
    stop() {
        console.log('ModuleHealthChecker: Остановлен');
    }

    // Перезапуск модуля
    restart() {
        this.stop();
        this.init();
        console.log('ModuleHealthChecker: Перезапущен');
    }
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    window.moduleHealthChecker = new ModuleHealthChecker();
});

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ModuleHealthChecker;
}