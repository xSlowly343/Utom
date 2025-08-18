/**
 * Performance Monitor Interface
 * Интерфейс для мониторинга производительности
 */

class PerformanceMonitor {
    constructor() {
        this.metrics = null;
        this.updateInterval = null;
        this.charts = {};
        
        this.init();
    }

    init() {
        this.createMonitorInterface();
        this.startMonitoring();
        this.bindEvents();
        
        console.log('PerformanceMonitor: Инициализирован');
    }

    createMonitorInterface() {
        // Создаем контейнер для мониторинга
        const monitorContainer = document.createElement('div');
        monitorContainer.id = 'performanceMonitor';
        monitorContainer.className = 'performance-monitor';
        monitorContainer.innerHTML = `
            <div class="monitor-header">
                <h3>📊 Мониторинг производительности</h3>
                <div class="monitor-controls">
                    <button class="btn btn-sm" id="refreshMetrics">🔄 Обновить</button>
                    <button class="btn btn-sm" id="exportReport">📄 Отчет</button>
                    <button class="btn btn-sm" id="toggleMonitor">⏸️ Пауза</button>
                </div>
            </div>
            
            <div class="monitor-grid">
                <!-- WebSocket метрики -->
                <div class="metric-card websocket">
                    <div class="metric-header">
                        <h4>🌐 WebSocket</h4>
                        <span class="status-indicator" id="wsStatus">●</span>
                    </div>
                    <div class="metric-content">
                        <div class="metric-item">
                            <span class="label">Соединения:</span>
                            <span class="value" id="wsConnections">0</span>
                        </div>
                        <div class="metric-item">
                            <span class="label">Время ответа:</span>
                            <span class="value" id="wsResponseTime">0ms</span>
                        </div>
                        <div class="metric-item">
                            <span class="label">Ошибки:</span>
                            <span class="value" id="wsErrors">0</span>
                        </div>
                    </div>
                </div>
                
                <!-- База данных метрики -->
                <div class="metric-card database">
                    <div class="metric-header">
                        <h4>🗄️ База данных</h4>
                        <span class="status-indicator" id="dbStatus">●</span>
                    </div>
                    <div class="metric-content">
                        <div class="metric-item">
                            <span class="label">Запросы/сек:</span>
                            <span class="value" id="dbQueriesPerSec">0</span>
                        </div>
                        <div class="metric-item">
                            <span class="label">Время запроса:</span>
                            <span class="value" id="dbQueryTime">0ms</span>
                        </div>
                        <div class="metric-item">
                            <span class="label">Медленные запросы:</span>
                            <span class="value" id="dbSlowQueries">0</span>
                        </div>
                        <div class="metric-item">
                            <span class="label">Пул соединений:</span>
                            <span class="value" id="dbPoolSize">0/0/0</span>
                        </div>
                    </div>
                </div>
                
                <!-- Память метрики -->
                <div class="metric-card memory">
                    <div class="metric-header">
                        <h4>💾 Память</h4>
                        <span class="status-indicator" id="memStatus">●</span>
                    </div>
                    <div class="metric-content">
                        <div class="metric-item">
                            <span class="label">Использовано:</span>
                            <span class="value" id="memUsed">0 MB</span>
                        </div>
                        <div class="metric-item">
                            <span class="label">Всего:</span>
                            <span class="value" id="memTotal">0 MB</span>
                        </div>
                        <div class="metric-item">
                            <span class="label">Использование:</span>
                            <span class="value" id="memUsage">0%</span>
                        </div>
                    </div>
                </div>
                
                <!-- Общая производительность -->
                <div class="metric-card performance">
                    <div class="metric-header">
                        <h4>⚡ Производительность</h4>
                        <span class="status-indicator" id="perfStatus">●</span>
                    </div>
                    <div class="metric-content">
                        <div class="metric-item">
                            <span class="label">Оценка:</span>
                            <span class="value" id="perfScore">0/100</span>
                        </div>
                        <div class="metric-item">
                            <span class="label">Статус:</span>
                            <span class="value" id="perfStatusText">OK</span>
                        </div>
                        <div class="metric-item">
                            <span class="label">Время работы:</span>
                            <span class="value" id="uptime">0s</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Графики производительности -->
            <div class="charts-section">
                <h4>📈 Графики</h4>
                <div class="charts-grid">
                    <div class="chart-container">
                        <canvas id="responseTimeChart"></canvas>
                        <p>Время ответа WebSocket</p>
                    </div>
                    <div class="chart-container">
                        <canvas id="queryTimeChart"></canvas>
                        <p>Время запросов к БД</p>
                    </div>
                    <div class="chart-container">
                        <canvas id="memoryChart"></canvas>
                        <p>Использование памяти</p>
                    </div>
                </div>
            </div>
            
            <!-- Рекомендации -->
            <div class="recommendations-section">
                <h4>💡 Рекомендации</h4>
                <div id="recommendationsList" class="recommendations-list">
                    <!-- Рекомендации будут добавлены динамически -->
                </div>
            </div>
        `;

        // Добавляем в настройки
        const settingsSection = document.querySelector('.settings-section');
        if (settingsSection) {
            settingsSection.appendChild(monitorContainer);
        } else {
            // Если настройки не найдены, добавляем в body
            document.body.appendChild(monitorContainer);
        }
    }

    startMonitoring() {
        // Обновляем метрики каждые 5 секунд
        this.updateInterval = setInterval(() => {
            this.updateMetrics();
        }, 5000);
        
        // Первоначальное обновление
        this.updateMetrics();
    }

    async updateMetrics() {
        try {
            // Получаем метрики через IPC
            this.metrics = await window.electronAPI.getPerformanceMetrics();
            
            if (this.metrics) {
                this.updateDisplay();
                this.updateCharts();
                this.updateStatusIndicators();
            }
        } catch (error) {
            console.error('PerformanceMonitor: Ошибка обновления метрик:', error);
        }
    }

    updateDisplay() {
        if (!this.metrics) return;

        // WebSocket метрики
        this.updateElement('wsConnections', this.metrics.websocket_connections);
        this.updateElement('wsResponseTime', `${this.metrics.websocket_response_time.toFixed(1)}ms`);
        this.updateElement('wsErrors', this.metrics.websocket_errors);

        // База данных метрики
        this.updateElement('dbQueriesPerSec', this.metrics.database_queries_per_second.toFixed(1));
        this.updateElement('dbQueryTime', `${this.metrics.database_query_time.toFixed(1)}ms`);
        this.updateElement('dbSlowQueries', this.metrics.database_slow_queries);
        
        // Пул соединений
        const pool = this.metrics.database_connectionPool || { total: 0, active: 0, idle: 0 };
        this.updateElement('dbPoolSize', `${pool.active}/${pool.idle}/${pool.total}`);

        // Память
        const memUsedMB = (this.metrics.memory_heap_used / 1024 / 1024).toFixed(1);
        const memTotalMB = (this.metrics.memory_heap_total / 1024 / 1024).toFixed(1);
        this.updateElement('memUsed', `${memUsedMB} MB`);
        this.updateElement('memTotal', `${memTotalMB} MB`);
        this.updateElement('memUsage', `${this.metrics.memory_usage_percent.toFixed(1)}%`);

        // Общая производительность
        this.updateElement('perfScore', `${this.calculatePerformanceScore()}/100`);
        this.updateElement('uptime', this.formatUptime(this.metrics.uptime || 0));
    }

    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    updateStatusIndicators() {
        if (!this.metrics) return;

        // WebSocket статус
        this.updateStatusIndicator('wsStatus', this.metrics.websocket_response_time < 1000);
        
        // База данных статус
        this.updateStatusIndicator('dbStatus', this.metrics.database_query_time < 500);
        
        // Память статус
        this.updateStatusIndicator('memStatus', this.metrics.memory_usage_percent < 80);
        
        // Общая производительность
        const score = this.calculatePerformanceScore();
        this.updateStatusIndicator('perfStatus', score > 70);
        this.updateElement('perfStatusText', score > 70 ? 'OK' : 'WARNING');
    }

    updateStatusIndicator(id, isHealthy) {
        const indicator = document.getElementById(id);
        if (indicator) {
            indicator.className = `status-indicator ${isHealthy ? 'healthy' : 'warning'}`;
            indicator.textContent = isHealthy ? '●' : '⚠️';
        }
    }

    calculatePerformanceScore() {
        if (!this.metrics) return 0;
        
        let score = 100;
        
        // Штраф за медленные ответы WebSocket
        if (this.metrics.websocket_response_time > 1000) {
            score -= 20;
        }
        
        // Штраф за медленные запросы к БД
        if (this.metrics.database_query_time > 500) {
            score -= 20;
        }
        
        // Штраф за высокое использование памяти
        if (this.metrics.memory_usage_percent > 80) {
            score -= 20;
        }
        
        return Math.max(0, score);
    }

    formatUptime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes}m ${secs}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    }

    updateCharts() {
        // Здесь можно добавить обновление графиков
        // Для простоты пока оставляем заглушку
    }

    bindEvents() {
        // Обновление метрик
        const refreshBtn = document.getElementById('refreshMetrics');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.updateMetrics();
            });
        }

        // Экспорт отчета
        const exportBtn = document.getElementById('exportReport');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportReport();
            });
        }

        // Пауза/возобновление мониторинга
        const toggleBtn = document.getElementById('toggleMonitor');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                this.toggleMonitoring();
            });
        }
    }

    async exportReport() {
        try {
            const report = await window.electronAPI.getPerformanceReport();
            
            if (report) {
                // Создаем JSON файл для скачивания
                const dataStr = JSON.stringify(report, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                
                const link = document.createElement('a');
                link.href = URL.createObjectURL(dataBlob);
                link.download = `performance-report-${new Date().toISOString().split('T')[0]}.json`;
                link.click();
                
                console.log('PerformanceMonitor: Отчет экспортирован');
            }
        } catch (error) {
            console.error('PerformanceMonitor: Ошибка экспорта отчета:', error);
        }
    }

    toggleMonitoring() {
        const toggleBtn = document.getElementById('toggleMonitor');
        
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
            toggleBtn.textContent = '▶️ Возобновить';
            console.log('PerformanceMonitor: Мониторинг приостановлен');
        } else {
            this.startMonitoring();
            toggleBtn.textContent = '⏸️ Пауза';
            console.log('PerformanceMonitor: Мониторинг возобновлен');
        }
    }

    // Остановка мониторинга
    stop() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        console.log('PerformanceMonitor: Остановлен');
    }

    // Перезапуск мониторинга
    restart() {
        this.stop();
        this.startMonitoring();
        console.log('PerformanceMonitor: Перезапущен');
    }
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    window.performanceMonitor = new PerformanceMonitor();
});

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceMonitor;
}