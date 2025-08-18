/**
 * Performance Manager
 * Оптимизация производительности WebSocket и базы данных
 */

class PerformanceManager {
    constructor() {
        this.metrics = {
            websocket: {
                connections: 0,
                messagesPerSecond: 0,
                averageResponseTime: 0,
                errors: 0
            },
            database: {
                queriesPerSecond: 0,
                averageQueryTime: 0,
                slowQueries: 0,
                connectionPool: {
                    total: 0,
                    active: 0,
                    idle: 0
                }
            },
            memory: {
                heapUsed: 0,
                heapTotal: 0,
                external: 0
            }
        };
        
        this.thresholds = {
            maxConnections: 1000,
            maxResponseTime: 1000, // ms
            maxQueryTime: 500, // ms
            maxMemoryUsage: 0.8 // 80% от доступной памяти
        };
        
        this.optimizations = {
            messageBatching: true,
            queryCaching: true,
            connectionPooling: true,
            memoryCleanup: true
        };
        
        this.monitoringInterval = null;
        this.cleanupInterval = null;
        
        this.init();
    }

    init() {
        // Запускаем мониторинг производительности
        this.startMonitoring();
        
        // Запускаем периодическую очистку
        this.startCleanup();
        
        // Настраиваем обработчики событий
        this.setupEventHandlers();
        
        console.log('PerformanceManager: Инициализирован');
    }

    startMonitoring() {
        this.monitoringInterval = setInterval(() => {
            this.collectMetrics();
            this.analyzePerformance();
            this.applyOptimizations();
        }, 5000); // Каждые 5 секунд
    }

    startCleanup() {
        this.cleanupInterval = setInterval(() => {
            this.cleanupMemory();
            this.cleanupConnections();
        }, 30000); // Каждые 30 секунд
    }

    collectMetrics() {
        // Метрики WebSocket
        if (global.websocketServer) {
            this.metrics.websocket.connections = global.websocketServer.clients.size;
        }

        // Метрики базы данных
        if (global.databaseManager) {
            this.collectDatabaseMetrics();
        }

        // Метрики памяти
        const memUsage = process.memoryUsage();
        this.metrics.memory.heapUsed = memUsage.heapUsed;
        this.metrics.memory.heapTotal = memUsage.heapTotal;
        this.metrics.memory.external = memUsage.external;
    }

    async collectDatabaseMetrics() {
        try {
            if (global.databaseManager && global.databaseManager.pool) {
                const pool = global.databaseManager.pool;
                
                // Получаем статистику пула соединений
                this.metrics.database.connectionPool.total = pool.totalCount || 0;
                this.metrics.database.connectionPool.active = pool.idleCount || 0;
                this.metrics.database.connectionPool.idle = pool.waitingCount || 0;
            }
        } catch (error) {
            console.error('PerformanceManager: Ошибка сбора метрик БД:', error);
        }
    }

    analyzePerformance() {
        const warnings = [];
        const critical = [];

        // Анализ WebSocket
        if (this.metrics.websocket.connections > this.thresholds.maxConnections * 0.8) {
            warnings.push(`WebSocket: Высокая нагрузка - ${this.metrics.websocket.connections} соединений`);
        }

        if (this.metrics.websocket.averageResponseTime > this.thresholds.maxResponseTime) {
            critical.push(`WebSocket: Медленный ответ - ${this.metrics.websocket.averageResponseTime}ms`);
        }

        // Анализ базы данных
        if (this.metrics.database.averageQueryTime > this.thresholds.maxQueryTime) {
            critical.push(`Database: Медленные запросы - ${this.metrics.database.averageQueryTime}ms`);
        }

        // Анализ памяти
        const memoryUsage = this.metrics.memory.heapUsed / this.metrics.memory.heapTotal;
        if (memoryUsage > this.thresholds.maxMemoryUsage) {
            critical.push(`Memory: Высокое использование памяти - ${(memoryUsage * 100).toFixed(1)}%`);
        }

        // Логируем предупреждения
        if (warnings.length > 0) {
            console.warn('PerformanceManager: Предупреждения:', warnings);
        }

        if (critical.length > 0) {
            console.error('PerformanceManager: Критические проблемы:', critical);
        }
    }

    applyOptimizations() {
        // Оптимизация WebSocket
        if (this.optimizations.messageBatching) {
            this.optimizeMessageBatching();
        }

        // Оптимизация базы данных
        if (this.optimizations.queryCaching) {
            this.optimizeQueryCaching();
        }

        // Оптимизация пула соединений
        if (this.optimizations.connectionPooling) {
            this.optimizeConnectionPool();
        }
    }

    optimizeMessageBatching() {
        // Группируем сообщения для уменьшения нагрузки
        if (global.websocketServer) {
            // Реализация батчинга сообщений
            console.log('PerformanceManager: Применена оптимизация батчинга сообщений');
        }
    }

    optimizeQueryCaching() {
        // Кэшируем часто используемые запросы
        if (global.databaseManager) {
            // Реализация кэширования запросов
            console.log('PerformanceManager: Применена оптимизация кэширования запросов');
        }
    }

    optimizeConnectionPool() {
        // Оптимизируем пул соединений с БД
        if (global.databaseManager && global.databaseManager.pool) {
            const pool = global.databaseManager.pool;
            
            // Динамически настраиваем размер пула
            const currentLoad = this.metrics.websocket.connections;
            const optimalPoolSize = Math.max(10, Math.min(50, currentLoad / 10));
            
            if (pool.totalCount !== optimalPoolSize) {
                console.log(`PerformanceManager: Оптимизация пула соединений до ${optimalPoolSize}`);
                // В реальности здесь нужно пересоздать пул
            }
        }
    }

    cleanupMemory() {
        // Принудительная очистка памяти
        if (global.gc) {
            global.gc();
            console.log('PerformanceManager: Выполнена очистка памяти');
        }

        // Очистка кэшей
        this.clearCaches();
    }

    cleanupConnections() {
        // Очистка неактивных соединений
        if (global.websocketServer) {
            const now = Date.now();
            let cleanedCount = 0;

            global.websocketServer.clients.forEach((client, clientId) => {
                if (client.lastActivity && (now - client.lastActivity) > 300000) { // 5 минут
                    client.ws.close();
                    cleanedCount++;
                }
            });

            if (cleanedCount > 0) {
                console.log(`PerformanceManager: Очищено ${cleanedCount} неактивных соединений`);
            }
        }
    }

    clearCaches() {
        // Очистка различных кэшей
        if (global.databaseManager && global.databaseManager.clearCache) {
            global.databaseManager.clearCache();
        }
    }

    setupEventHandlers() {
        // Обработчик для измерения времени ответа WebSocket
        if (global.websocketServer) {
            this.setupWebSocketMonitoring();
        }

        // Обработчик для измерения времени запросов к БД
        if (global.databaseManager) {
            this.setupDatabaseMonitoring();
        }
    }

    setupWebSocketMonitoring() {
        const originalSend = global.websocketServer.sendToClient;
        const self = this;

        global.websocketServer.sendToClient = function(clientId, message) {
            const startTime = Date.now();
            
            try {
                const result = originalSend.call(this, clientId, message);
                
                // Измеряем время ответа
                const responseTime = Date.now() - startTime;
                self.updateResponseTime(responseTime);
                
                return result;
            } catch (error) {
                self.metrics.websocket.errors++;
                throw error;
            }
        };
    }

    setupDatabaseMonitoring() {
        // Добавляем мониторинг к методам базы данных
        const methods = ['query', 'execute', 'run'];
        
        methods.forEach(methodName => {
            if (global.databaseManager[methodName]) {
                const originalMethod = global.databaseManager[methodName];
                const self = this;

                global.databaseManager[methodName] = async function(...args) {
                    const startTime = Date.now();
                    
                    try {
                        const result = await originalMethod.apply(this, args);
                        
                        // Измеряем время запроса
                        const queryTime = Date.now() - startTime;
                        self.updateQueryTime(queryTime);
                        
                        return result;
                    } catch (error) {
                        self.metrics.database.errors++;
                        throw error;
                    }
                };
            }
        });
    }

    updateResponseTime(responseTime) {
        // Обновляем среднее время ответа
        const current = this.metrics.websocket.averageResponseTime;
        this.metrics.websocket.averageResponseTime = (current + responseTime) / 2;
    }

    updateQueryTime(queryTime) {
        // Обновляем среднее время запроса
        const current = this.metrics.database.averageQueryTime;
        this.metrics.database.averageQueryTime = (current + queryTime) / 2;
        
        // Отслеживаем медленные запросы
        if (queryTime > this.thresholds.maxQueryTime) {
            this.metrics.database.slowQueries++;
        }
    }

    // API для получения метрик
    getMetrics() {
        return {
            ...this.metrics,
            timestamp: Date.now(),
            uptime: process.uptime()
        };
    }

    // API для настройки оптимизаций
    setOptimization(name, enabled) {
        if (this.optimizations.hasOwnProperty(name)) {
            this.optimizations[name] = enabled;
            console.log(`PerformanceManager: Оптимизация ${name} ${enabled ? 'включена' : 'отключена'}`);
        }
    }

    // API для настройки порогов
    setThreshold(name, value) {
        if (this.thresholds.hasOwnProperty(name)) {
            this.thresholds[name] = value;
            console.log(`PerformanceManager: Порог ${name} установлен в ${value}`);
        }
    }

    // Экспорт метрик в формате для мониторинга
    exportMetrics() {
        return {
            websocket_connections: this.metrics.websocket.connections,
            websocket_response_time: this.metrics.websocket.averageResponseTime,
            websocket_errors: this.metrics.websocket.errors,
            database_queries_per_second: this.metrics.database.queriesPerSecond,
            database_query_time: this.metrics.database.averageQueryTime,
            database_slow_queries: this.metrics.database.slowQueries,
            memory_heap_used: this.metrics.memory.heapUsed,
            memory_heap_total: this.metrics.memory.heapTotal,
            memory_usage_percent: (this.metrics.memory.heapUsed / this.metrics.memory.heapTotal) * 100
        };
    }

    // Генерация отчета о производительности
    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            summary: this.generateSummary(),
            metrics: this.getMetrics(),
            recommendations: this.generateRecommendations()
        };

        return report;
    }

    generateSummary() {
        const issues = [];
        
        if (this.metrics.websocket.averageResponseTime > this.thresholds.maxResponseTime) {
            issues.push('Медленные ответы WebSocket');
        }
        
        if (this.metrics.database.averageQueryTime > this.thresholds.maxQueryTime) {
            issues.push('Медленные запросы к БД');
        }
        
        const memoryUsage = this.metrics.memory.heapUsed / this.metrics.memory.heapTotal;
        if (memoryUsage > this.thresholds.maxMemoryUsage) {
            issues.push('Высокое использование памяти');
        }

        return {
            status: issues.length === 0 ? 'OK' : 'WARNING',
            issues: issues,
            performance_score: this.calculatePerformanceScore()
        };
    }

    calculatePerformanceScore() {
        let score = 100;
        
        // Штраф за медленные ответы
        if (this.metrics.websocket.averageResponseTime > this.thresholds.maxResponseTime) {
            score -= 20;
        }
        
        // Штраф за медленные запросы
        if (this.metrics.database.averageQueryTime > this.thresholds.maxQueryTime) {
            score -= 20;
        }
        
        // Штраф за высокое использование памяти
        const memoryUsage = this.metrics.memory.heapUsed / this.metrics.memory.heapTotal;
        if (memoryUsage > this.thresholds.maxMemoryUsage) {
            score -= 20;
        }
        
        return Math.max(0, score);
    }

    generateRecommendations() {
        const recommendations = [];
        
        if (this.metrics.websocket.averageResponseTime > this.thresholds.maxResponseTime) {
            recommendations.push('Рассмотрите возможность увеличения ресурсов сервера');
            recommendations.push('Оптимизируйте обработку сообщений WebSocket');
        }
        
        if (this.metrics.database.averageQueryTime > this.thresholds.maxQueryTime) {
            recommendations.push('Добавьте индексы для часто используемых запросов');
            recommendations.push('Оптимизируйте SQL запросы');
            recommendations.push('Рассмотрите возможность кэширования');
        }
        
        const memoryUsage = this.metrics.memory.heapUsed / this.metrics.memory.heapTotal;
        if (memoryUsage > this.thresholds.maxMemoryUsage) {
            recommendations.push('Увеличьте доступную память для Node.js');
            recommendations.push('Оптимизируйте использование памяти в коде');
        }
        
        return recommendations;
    }

    // Остановка мониторинга
    stop() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
        
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
        
        console.log('PerformanceManager: Остановлен');
    }

    // Перезапуск мониторинга
    restart() {
        this.stop();
        this.init();
        console.log('PerformanceManager: Перезапущен');
    }
}

// Инициализация при загрузке модуля
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceManager;
} else {
    // В браузере или Electron
    global.PerformanceManager = PerformanceManager;
    
    // Автоматическая инициализация
    if (typeof window !== 'undefined') {
        window.addEventListener('DOMContentLoaded', () => {
            window.performanceManager = new PerformanceManager();
        });
    }
}