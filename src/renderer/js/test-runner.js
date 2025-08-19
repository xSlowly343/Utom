/**
 * Test Runner
 * Система выполнения тестов с детальной отчетностью
 */

class TestRunner {
    constructor() {
        this.currentRun = null;
        this.testQueue = [];
        this.isRunning = false;
        this.reportContainer = null;
        this.progressBar = null;
        this.resultsDisplay = null;
        
        this.init();
    }

    init() {
        this.createReportContainer();
        this.setupEventListeners();
        console.log('TestRunner: Инициализирован');
    }

    createReportContainer() {
        // Создаем контейнер для отчетов
        this.reportContainer = document.createElement('div');
        this.reportContainer.className = 'test-runner-container';
        this.reportContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 400px;
            max-height: 80vh;
            background: var(--bg-primary);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-xl);
            z-index: 10000;
            overflow: hidden;
            display: none;
        `;

        this.reportContainer.innerHTML = `
            <div class="test-runner-header">
                <h3>🧪 Test Runner</h3>
                <button class="test-runner-close" onclick="window.testRunner.hideReport()">×</button>
            </div>
            <div class="test-runner-content">
                <div class="test-progress">
                    <div class="progress-bar">
                        <div class="progress-fill"></div>
                    </div>
                    <div class="progress-text">Готов к запуску</div>
                </div>
                <div class="test-results"></div>
                <div class="test-actions">
                    <button class="btn btn-primary btn-sm" onclick="window.testRunner.runAllTests()">Запустить все</button>
                    <button class="btn btn-outline btn-sm" onclick="window.testRunner.runUnitTests()">Unit тесты</button>
                    <button class="btn btn-outline btn-sm" onclick="window.testRunner.runIntegrationTests()">Integration тесты</button>
                    <button class="btn btn-outline btn-sm" onclick="window.testRunner.runPerformanceTests()">Performance тесты</button>
                    <button class="btn btn-outline btn-sm" onclick="window.testRunner.runAccessibilityTests()">Accessibility тесты</button>
                    <button class="btn btn-outline btn-sm" onclick="window.testRunner.runUITests()">UI тесты</button>
                </div>
            </div>
        `;

        document.body.appendChild(this.reportContainer);
        
        // Сохраняем ссылки на элементы
        this.progressBar = this.reportContainer.querySelector('.progress-fill');
        this.progressText = this.reportContainer.querySelector('.progress-text');
        this.resultsDisplay = this.reportContainer.querySelector('.test-results');
    }

    setupEventListeners() {
        // События для запуска тестов
        window.addEventListener('test:runSuite', (event) => {
            const { suiteId } = event.detail;
            this.runTestSuite(suiteId);
        });

        window.addEventListener('test:runAll', () => {
            this.runAllTests();
        });

        // События для отображения отчетов
        window.addEventListener('test:results', (event) => {
            const { results } = event.detail;
            this.displayResults(results);
        });
    }

    // Показ/скрытие отчета
    showReport() {
        this.reportContainer.style.display = 'block';
    }

    hideReport() {
        this.reportContainer.style.display = 'none';
    }

    // Запуск всех тестов
    async runAllTests() {
        if (this.isRunning) {
            console.warn('TestRunner: Тесты уже запущены');
            return;
        }

        this.showReport();
        this.isRunning = true;
        this.currentRun = {
            id: Date.now(),
            startTime: Date.now(),
            totalTests: 0,
            completedTests: 0,
            passedTests: 0,
            failedTests: 0,
            suites: []
        };

        console.log('TestRunner: Запуск всех тестов...');
        
        // Получаем все test suites
        const testSuites = window.testManager?.getTestSuites() || [];
        this.currentRun.totalTests = testSuites.reduce((total, suite) => total + suite.tests.length, 0);

        this.updateProgress(0, 'Запуск тестов...');

        try {
            const results = await window.testManager.runAllTests();
            this.currentRun.suites = results.suites;
            this.currentRun.passedTests = results.passed;
            this.currentRun.failedTests = results.failed;
            
            this.displayResults(results);
            this.updateProgress(100, 'Тесты завершены');
            
            // Уведомляем о завершении
            window.dispatchEvent(new CustomEvent('test:results', { detail: { results } }));
            
        } catch (error) {
            console.error('TestRunner: Ошибка выполнения тестов:', error);
            this.updateProgress(100, 'Ошибка выполнения тестов');
            this.displayError(error);
        } finally {
            this.isRunning = false;
        }
    }

    // Запуск конкретного suite
    async runTestSuite(suiteId) {
        if (this.isRunning) {
            console.warn('TestRunner: Тесты уже запущены');
            return;
        }

        this.showReport();
        this.isRunning = true;
        
        const suite = window.testManager?.testSuites.get(suiteId);
        if (!suite) {
            throw new Error(`Test suite ${suiteId} не найден`);
        }

        this.currentRun = {
            id: Date.now(),
            startTime: Date.now(),
            totalTests: suite.tests.length,
            completedTests: 0,
            passedTests: 0,
            failedTests: 0,
            suites: []
        };

        this.updateProgress(0, `Запуск ${suite.name}...`);

        try {
            const results = await window.testManager.runTestSuite(suiteId);
            this.currentRun.suites = [results];
            this.currentRun.passedTests = results.passed;
            this.currentRun.failedTests = results.failed;
            
            this.displayResults({ suites: [results] });
            this.updateProgress(100, `${suite.name} завершен`);
            
        } catch (error) {
            console.error(`TestRunner: Ошибка выполнения ${suite.name}:`, error);
            this.updateProgress(100, `Ошибка выполнения ${suite.name}`);
            this.displayError(error);
        } finally {
            this.isRunning = false;
        }
    }

    // Запуск Unit тестов
    async runUnitTests() {
        await this.runTestSuite('unit');
    }

    // Запуск Integration тестов
    async runIntegrationTests() {
        await this.runTestSuite('integration');
    }

    // Запуск Performance тестов
    async runPerformanceTests() {
        await this.runTestSuite('performance');
    }

    // Запуск Accessibility тестов
    async runAccessibilityTests() {
        await this.runTestSuite('accessibility');
    }

    // Запуск UI тестов
    async runUITests() {
        await this.runTestSuite('ui');
    }

    // Обновление прогресса
    updateProgress(percentage, text) {
        if (this.progressBar) {
            this.progressBar.style.width = `${percentage}%`;
        }
        
        if (this.progressText) {
            this.progressText.textContent = text;
        }
    }

    // Отображение результатов
    displayResults(results) {
        if (!this.resultsDisplay) return;

        let html = '<div class="test-results-summary">';
        
        // Общая статистика
        const total = results.suites.reduce((sum, suite) => sum + suite.total, 0);
        const passed = results.suites.reduce((sum, suite) => sum + suite.passed, 0);
        const failed = results.suites.reduce((sum, suite) => sum + suite.failed, 0);
        const duration = results.duration || 0;

        html += `
            <div class="test-summary">
                <h4>📊 Результаты тестирования</h4>
                <div class="test-stats">
                    <div class="stat-item">
                        <span class="stat-label">Всего:</span>
                        <span class="stat-value">${total}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Пройдено:</span>
                        <span class="stat-value passed">${passed}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Провалено:</span>
                        <span class="stat-value failed">${failed}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Время:</span>
                        <span class="stat-value">${duration}ms</span>
                    </div>
                </div>
            </div>
        `;

        // Детальные результаты по suite
        for (const suite of results.suites) {
            html += `
                <div class="test-suite-results">
                    <h5>${suite.suiteName}</h5>
                    <div class="suite-stats">
                        <span class="suite-stat passed">${suite.passed} ✓</span>
                        <span class="suite-stat failed">${suite.failed} ✗</span>
                        <span class="suite-stat duration">${suite.duration}ms</span>
                    </div>
                    <div class="test-details">
            `;

            for (const test of suite.tests) {
                const statusClass = test.status === 'passed' ? 'passed' : 'failed';
                const statusIcon = test.status === 'passed' ? '✓' : '✗';
                
                html += `
                    <div class="test-item ${statusClass}">
                        <span class="test-name">${test.name}</span>
                        <span class="test-status">${statusIcon}</span>
                        <span class="test-duration">${test.duration}ms</span>
                    </div>
                `;

                if (test.status === 'failed' && test.error) {
                    html += `
                        <div class="test-error">
                            <span class="error-message">${test.error}</span>
                        </div>
                    `;
                }
            }

            html += `
                    </div>
                </div>
            `;
        }

        html += '</div>';
        this.resultsDisplay.innerHTML = html;

        // Добавляем стили для результатов
        this.addResultStyles();
    }

    // Отображение ошибки
    displayError(error) {
        if (!this.resultsDisplay) return;

        this.resultsDisplay.innerHTML = `
            <div class="test-error-display">
                <h4>❌ Ошибка выполнения тестов</h4>
                <div class="error-details">
                    <p><strong>Сообщение:</strong> ${error.message}</p>
                    <p><strong>Стек:</strong></p>
                    <pre class="error-stack">${error.stack || 'Недоступно'}</pre>
                </div>
            </div>
        `;
    }

    // Добавление стилей для результатов
    addResultStyles() {
        if (!document.getElementById('test-runner-styles')) {
            const style = document.createElement('style');
            style.id = 'test-runner-styles';
            style.textContent = `
                .test-runner-container {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }
                
                .test-runner-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 15px 20px;
                    background: var(--bg-secondary);
                    border-bottom: 1px solid var(--border-color);
                }
                
                .test-runner-header h3 {
                    margin: 0;
                    color: var(--text-primary);
                    font-size: 16px;
                }
                
                .test-runner-close {
                    background: none;
                    border: none;
                    font-size: 20px;
                    color: var(--text-muted);
                    cursor: pointer;
                    padding: 0;
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .test-runner-close:hover {
                    color: var(--text-primary);
                }
                
                .test-runner-content {
                    padding: 20px;
                    max-height: 60vh;
                    overflow-y: auto;
                }
                
                .test-progress {
                    margin-bottom: 20px;
                }
                
                .progress-bar {
                    width: 100%;
                    height: 8px;
                    background: var(--bg-secondary);
                    border-radius: 4px;
                    overflow: hidden;
                    margin-bottom: 10px;
                }
                
                .progress-fill {
                    height: 100%;
                    background: var(--primary-color);
                    transition: width 0.3s ease;
                }
                
                .progress-text {
                    text-align: center;
                    color: var(--text-secondary);
                    font-size: 14px;
                }
                
                .test-results {
                    margin-bottom: 20px;
                }
                
                .test-results-summary {
                    font-size: 14px;
                }
                
                .test-summary {
                    margin-bottom: 20px;
                    padding: 15px;
                    background: var(--bg-secondary);
                    border-radius: var(--radius-md);
                }
                
                .test-summary h4 {
                    margin: 0 0 15px 0;
                    color: var(--text-primary);
                    font-size: 16px;
                }
                
                .test-stats {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                }
                
                .stat-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .stat-label {
                    color: var(--text-secondary);
                }
                
                .stat-value {
                    font-weight: 600;
                    color: var(--text-primary);
                }
                
                .stat-value.passed {
                    color: var(--success-color);
                }
                
                .stat-value.failed {
                    color: var(--danger-color);
                }
                
                .test-suite-results {
                    margin-bottom: 20px;
                    padding: 15px;
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-md);
                }
                
                .test-suite-results h5 {
                    margin: 0 0 10px 0;
                    color: var(--text-primary);
                    font-size: 14px;
                }
                
                .suite-stats {
                    display: flex;
                    gap: 15px;
                    margin-bottom: 15px;
                }
                
                .suite-stat {
                    font-size: 12px;
                    padding: 4px 8px;
                    border-radius: var(--radius-sm);
                }
                
                .suite-stat.passed {
                    background: var(--success-color);
                    color: white;
                }
                
                .suite-stat.failed {
                    background: var(--danger-color);
                    color: white;
                }
                
                .suite-stat.duration {
                    background: var(--bg-tertiary);
                    color: var(--text-secondary);
                }
                
                .test-details {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                }
                
                .test-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 8px 12px;
                    border-radius: var(--radius-sm);
                    font-size: 12px;
                }
                
                .test-item.passed {
                    background: rgba(34, 197, 94, 0.1);
                    border: 1px solid rgba(34, 197, 94, 0.2);
                }
                
                .test-item.failed {
                    background: rgba(239, 68, 68, 0.1);
                    border: 1px solid rgba(239, 68, 68, 0.2);
                }
                
                .test-name {
                    flex: 1;
                    color: var(--text-primary);
                }
                
                .test-status {
                    margin: 0 10px;
                    font-weight: bold;
                }
                
                .test-duration {
                    color: var(--text-muted);
                    font-size: 11px;
                }
                
                .test-error {
                    margin-left: 20px;
                    padding: 8px 12px;
                    background: rgba(239, 68, 68, 0.1);
                    border-left: 3px solid var(--danger-color);
                    font-size: 11px;
                    color: var(--danger-color);
                }
                
                .test-actions {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                }
                
                .test-actions .btn {
                    font-size: 12px;
                    padding: 6px 12px;
                }
                
                .test-error-display {
                    padding: 15px;
                    background: rgba(239, 68, 68, 0.1);
                    border: 1px solid rgba(239, 68, 68, 0.2);
                    border-radius: var(--radius-md);
                }
                
                .test-error-display h4 {
                    margin: 0 0 15px 0;
                    color: var(--danger-color);
                }
                
                .error-details p {
                    margin: 0 0 10px 0;
                    color: var(--text-primary);
                }
                
                .error-stack {
                    background: var(--bg-secondary);
                    padding: 10px;
                    border-radius: var(--radius-sm);
                    font-size: 11px;
                    color: var(--text-secondary);
                    overflow-x: auto;
                    white-space: pre-wrap;
                }
            `;
            
            document.head.appendChild(style);
        }
    }

    // Публичные методы
    getCurrentRun() {
        return this.currentRun;
    }

    isTestRunning() {
        return this.isRunning;
    }

    // Остановка модуля
    stop() {
        this.isRunning = false;
        this.hideReport();
        console.log('TestRunner: Остановлен');
    }

    // Перезапуск модуля
    restart() {
        this.stop();
        this.init();
        console.log('TestRunner: Перезапущен');
    }
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    window.testRunner = new TestRunner();
});

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TestRunner;
}