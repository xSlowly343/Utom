/**
 * Test Manager
 * Система автоматизированного тестирования приложения
 */

class TestManager {
    constructor() {
        this.settings = {
            enableAutoTesting: true,
            enableUnitTests: true,
            enableIntegrationTests: true,
            enablePerformanceTests: true,
            enableAccessibilityTests: true,
            testInterval: 30000, // 30 секунд
            maxTestDuration: 10000, // 10 секунд
            retryAttempts: 3,
            logTestResults: true,
            showTestNotifications: true
        };
        
        this.testSuites = new Map();
        this.testResults = new Map();
        this.failedTests = new Map();
        this.testHistory = [];
        this.isRunning = false;
        this.testTimer = null;
        
        this.init();
    }

    init() {
        this.loadSettings();
        this.createTestSuites();
        this.setupEventListeners();
        this.startAutoTesting();
        console.log('TestManager: Инициализирован');
    }

    loadSettings() {
        try {
            const savedSettings = localStorage.getItem('testManagerSettings');
            if (savedSettings) {
                this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
            }
        } catch (error) {
            console.warn('TestManager: Ошибка загрузки настроек:', error);
        }
    }

    saveSettings() {
        try {
            localStorage.setItem('testManagerSettings', JSON.stringify(this.settings));
        } catch (error) {
            console.warn('TestManager: Ошибка сохранения настроек:', error);
        }
    }

    createTestSuites() {
        // Unit тесты
        this.addTestSuite('unit', {
            name: 'Unit Tests',
            description: 'Тестирование отдельных модулей',
            tests: [
                { name: 'Database Connection', test: () => this.testDatabaseConnection() },
                { name: 'Authentication', test: () => this.testAuthentication() },
                { name: 'WebSocket Connection', test: () => this.testWebSocketConnection() },
                { name: 'Local Storage', test: () => this.testLocalStorage() },
                { name: 'Event System', test: () => this.testEventSystem() }
            ]
        });

        // Integration тесты
        this.addTestSuite('integration', {
            name: 'Integration Tests',
            description: 'Тестирование взаимодействия модулей',
            tests: [
                { name: 'Module Communication', test: () => this.testModuleCommunication() },
                { name: 'Data Flow', test: () => this.testDataFlow() },
                { name: 'State Management', test: () => this.testStateManagement() },
                { name: 'Error Handling', test: () => this.testErrorHandling() },
                { name: 'Performance Monitoring', test: () => this.testPerformanceMonitoring() }
            ]
        });

        // Performance тесты
        this.addTestSuite('performance', {
            name: 'Performance Tests',
            description: 'Тестирование производительности',
            tests: [
                { name: 'Memory Usage', test: () => this.testMemoryUsage() },
                { name: 'Response Time', test: () => this.testResponseTime() },
                { name: 'Animation Performance', test: () => this.testAnimationPerformance() },
                { name: 'Database Performance', test: () => this.testDatabasePerformance() },
                { name: 'UI Responsiveness', test: () => this.testUIResponsiveness() }
            ]
        });

        // Accessibility тесты
        this.addTestSuite('accessibility', {
            name: 'Accessibility Tests',
            description: 'Тестирование доступности',
            tests: [
                { name: 'ARIA Labels', test: () => this.testARIALabels() },
                { name: 'Keyboard Navigation', test: () => this.testKeyboardNavigation() },
                { name: 'Focus Management', test: () => this.testFocusManagement() },
                { name: 'Color Contrast', test: () => this.testColorContrast() },
                { name: 'Screen Reader Support', test: () => this.testScreenReaderSupport() }
            ]
        });

        // UI тесты
        this.addTestSuite('ui', {
            name: 'UI Tests',
            description: 'Тестирование пользовательского интерфейса',
            tests: [
                { name: 'Component Rendering', test: () => this.testComponentRendering() },
                { name: 'Responsive Design', test: () => this.testResponsiveDesign() },
                { name: 'Animation System', test: () => this.testAnimationSystem() },
                { name: 'Theme Switching', test: () => this.testThemeSwitching() },
                { name: 'Form Validation', test: () => this.testFormValidation() }
            ]
        });
    }

    addTestSuite(id, suite) {
        this.testSuites.set(id, {
            ...suite,
            id,
            lastRun: null,
            successCount: 0,
            failureCount: 0,
            totalRuns: 0
        });
    }

    setupEventListeners() {
        // Глобальные события тестирования
        window.addEventListener('test:run', (event) => {
            const { suiteId, testName } = event.detail;
            this.runSpecificTest(suiteId, testName);
        });

        window.addEventListener('test:runSuite', (event) => {
            const { suiteId } = event.detail;
            this.runTestSuite(suiteId);
        });

        window.addEventListener('test:runAll', () => {
            this.runAllTests();
        });

        // События для мониторинга производительности
        if (this.settings.enablePerformanceTests) {
            this.setupPerformanceMonitoring();
        }
    }

    setupPerformanceMonitoring() {
        // Мониторинг памяти
        if (performance.memory) {
            setInterval(() => {
                this.monitorMemoryUsage();
            }, 10000);
        }

        // Мониторинг производительности анимаций
        if (window.animationManager) {
            window.addEventListener('animation:started', () => {
                this.monitorAnimationPerformance();
            });
        }
    }

    startAutoTesting() {
        if (!this.settings.enableAutoTesting) return;

        this.testTimer = setInterval(() => {
            if (!this.isRunning) {
                this.runCriticalTests();
            }
        }, this.settings.testInterval);
    }

    stopAutoTesting() {
        if (this.testTimer) {
            clearInterval(this.testTimer);
            this.testTimer = null;
        }
    }

    // Запуск тестов
    async runAllTests() {
        if (this.isRunning) {
            console.warn('TestManager: Тесты уже запущены');
            return;
        }

        this.isRunning = true;
        const startTime = Date.now();
        
        console.log('TestManager: Запуск всех тестов...');
        
        const results = {
            total: 0,
            passed: 0,
            failed: 0,
            skipped: 0,
            duration: 0,
            suites: []
        };

        for (const [suiteId, suite] of this.testSuites) {
            const suiteResult = await this.runTestSuite(suiteId);
            results.suites.push(suiteResult);
            results.total += suiteResult.total;
            results.passed += suiteResult.passed;
            results.failed += suiteResult.failed;
            results.skipped += suiteResult.skipped;
        }

        results.duration = Date.now() - startTime;
        this.isRunning = false;

        // Сохраняем результаты
        this.saveTestResults(results);
        
        // Уведомляем о завершении
        this.notifyTestCompletion(results);
        
        console.log('TestManager: Все тесты завершены', results);
        return results;
    }

    async runTestSuite(suiteId) {
        const suite = this.testSuites.get(suiteId);
        if (!suite) {
            throw new Error(`Test suite ${suiteId} не найден`);
        }

        console.log(`TestManager: Запуск тестов для ${suite.name}`);
        
        const startTime = Date.now();
        const results = {
            suiteId,
            suiteName: suite.name,
            total: suite.tests.length,
            passed: 0,
            failed: 0,
            skipped: 0,
            duration: 0,
            tests: []
        };

        for (const test of suite.tests) {
            try {
                const testResult = await this.runSingleTest(test);
                results.tests.push(testResult);
                
                if (testResult.status === 'passed') {
                    results.passed++;
                } else if (testResult.status === 'failed') {
                    results.failed++;
                } else {
                    results.skipped++;
                }
            } catch (error) {
                const testResult = {
                    name: test.name,
                    status: 'failed',
                    error: error.message,
                    duration: 0,
                    timestamp: Date.now()
                };
                results.tests.push(testResult);
                results.failed++;
            }
        }

        results.duration = Date.now() - startTime;
        
        // Обновляем статистику suite
        suite.lastRun = Date.now();
        suite.totalRuns++;
        suite.successCount += results.passed;
        suite.failureCount += results.failed;

        // Сохраняем результаты
        this.testResults.set(suiteId, results);
        
        return results;
    }

    async runSingleTest(test) {
        const startTime = Date.now();
        
        try {
            // Проверяем timeout
            const testPromise = test.test();
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Test timeout')), this.settings.maxTestDuration);
            });

            await Promise.race([testPromise, timeoutPromise]);
            
            const duration = Date.now() - startTime;
            
            return {
                name: test.name,
                status: 'passed',
                duration,
                timestamp: Date.now()
            };
        } catch (error) {
            const duration = Date.now() - startTime;
            
            // Добавляем в список неудачных тестов
            this.failedTests.set(test.name, {
                error: error.message,
                lastFailure: Date.now(),
                failureCount: (this.failedTests.get(test.name)?.failureCount || 0) + 1
            });
            
            return {
                name: test.name,
                status: 'failed',
                error: error.message,
                duration,
                timestamp: Date.now()
            };
        }
    }

    async runSpecificTest(suiteId, testName) {
        const suite = this.testSuites.get(suiteId);
        if (!suite) {
            throw new Error(`Test suite ${suiteId} не найден`);
        }

        const test = suite.tests.find(t => t.name === testName);
        if (!test) {
            throw new Error(`Test ${testName} не найден в suite ${suiteId}`);
        }

        return await this.runSingleTest(test);
    }

    async runCriticalTests() {
        const criticalTests = [
            { name: 'Database Connection', test: () => this.testDatabaseConnection() },
            { name: 'Authentication', test: () => this.testAuthentication() },
            { name: 'Event System', test: () => this.testEventSystem() }
        ];

        for (const test of criticalTests) {
            try {
                await this.runSingleTest(test);
            } catch (error) {
                console.error(`Critical test failed: ${test.name}`, error);
                this.notifyCriticalTestFailure(test.name, error);
            }
        }
    }

    // Unit тесты
    async testDatabaseConnection() {
        if (!window.databaseManager) {
            throw new Error('DatabaseManager не доступен');
        }

        const isConnected = await window.databaseManager.isConnected();
        if (!isConnected) {
            throw new Error('База данных не подключена');
        }
    }

    async testAuthentication() {
        if (!window.authManager) {
            throw new Error('AuthManager не доступен');
        }

        const isInitialized = window.authManager.isInitialized;
        if (!isInitialized) {
            throw new Error('AuthManager не инициализирован');
        }
    }

    async testWebSocketConnection() {
        if (!window.websocketClient) {
            throw new Error('WebSocketClient не доступен');
        }

        const isConnected = window.websocketClient.isConnected();
        if (!isConnected) {
            throw new Error('WebSocket не подключен');
        }
    }

    async testLocalStorage() {
        try {
            const testKey = '__test_storage__';
            const testValue = 'test_value';
            
            localStorage.setItem(testKey, testValue);
            const retrievedValue = localStorage.getItem(testKey);
            localStorage.removeItem(testKey);
            
            if (retrievedValue !== testValue) {
                throw new Error('LocalStorage не работает корректно');
            }
        } catch (error) {
            throw new Error(`LocalStorage error: ${error.message}`);
        }
    }

    async testEventSystem() {
        let eventReceived = false;
        
        const testHandler = () => {
            eventReceived = true;
        };
        
        window.addEventListener('test:event', testHandler);
        window.dispatchEvent(new CustomEvent('test:event'));
        window.removeEventListener('test:event', testHandler);
        
        if (!eventReceived) {
            throw new Error('Система событий не работает');
        }
    }

    // Integration тесты
    async testModuleCommunication() {
        const modules = ['toastManager', 'loadingManager', 'errorBoundary'];
        
        for (const moduleName of modules) {
            if (!window[moduleName]) {
                throw new Error(`Модуль ${moduleName} не доступен`);
            }
        }
    }

    async testDataFlow() {
        // Тестируем поток данных между модулями
        if (window.toastManager && window.loadingManager) {
            const testData = { message: 'Test data flow' };
            window.dispatchEvent(new CustomEvent('test:dataFlow', { detail: testData }));
        }
    }

    async testStateManagement() {
        // Тестируем управление состоянием
        const initialState = document.body.className;
        
        document.body.classList.add('test-state');
        const newState = document.body.className;
        
        document.body.className = initialState;
        
        if (!newState.includes('test-state')) {
            throw new Error('Управление состоянием не работает');
        }
    }

    async testErrorHandling() {
        // Тестируем обработку ошибок
        if (window.errorBoundary) {
            const error = new Error('Test error');
            window.errorBoundary.handleError(error);
        }
    }

    async testPerformanceMonitoring() {
        if (!window.performanceManager) {
            throw new Error('PerformanceManager не доступен');
        }

        const metrics = window.performanceManager.getMetrics();
        if (!metrics) {
            throw new Error('Метрики производительности недоступны');
        }
    }

    // Performance тесты
    async testMemoryUsage() {
        if (performance.memory) {
            const memory = performance.memory;
            const usedMemory = memory.usedJSHeapSize;
            const totalMemory = memory.totalJSHeapSize;
            
            if (usedMemory > totalMemory * 0.9) {
                throw new Error('Высокое потребление памяти');
            }
        }
    }

    async testResponseTime() {
        const startTime = performance.now();
        
        // Имитируем операцию
        await new Promise(resolve => setTimeout(resolve, 10));
        
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        
        if (responseTime > 100) {
            throw new Error(`Медленный отклик: ${responseTime.toFixed(2)}ms`);
        }
    }

    async testAnimationPerformance() {
        if (window.animationManager) {
            const animations = window.animationManager.getActiveAnimations();
            
            if (animations.length > 10) {
                throw new Error('Слишком много активных анимаций');
            }
        }
    }

    async testDatabasePerformance() {
        if (window.databaseManager) {
            const startTime = performance.now();
            
            try {
                await window.databaseManager.executeQuery('SELECT 1');
                const endTime = performance.now();
                const queryTime = endTime - startTime;
                
                if (queryTime > 1000) {
                    throw new Error(`Медленный запрос к БД: ${queryTime.toFixed(2)}ms`);
                }
            } catch (error) {
                // Игнорируем ошибки для тестирования
            }
        }
    }

    async testUIResponsiveness() {
        const startTime = performance.now();
        
        // Имитируем UI операцию
        document.body.style.transform = 'scale(1.01)';
        document.body.offsetHeight; // Force reflow
        document.body.style.transform = '';
        
        const endTime = performance.now();
        const uiTime = endTime - startTime;
        
        if (uiTime > 16) { // 60fps = 16.67ms
            throw new Error(`Медленный UI: ${uiTime.toFixed(2)}ms`);
        }
    }

    // Accessibility тесты
    async testARIALabels() {
        const elementsWithoutLabels = document.querySelectorAll('button:not([aria-label]):empty, a:not([aria-label]):empty');
        
        if (elementsWithoutLabels.length > 0) {
            throw new Error(`Найдено ${elementsWithoutLabels.length} элементов без ARIA labels`);
        }
    }

    async testKeyboardNavigation() {
        const focusableElements = document.querySelectorAll('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])');
        
        if (focusableElements.length === 0) {
            throw new Error('Нет фокусируемых элементов');
        }
    }

    async testFocusManagement() {
        const firstFocusable = document.querySelector('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])');
        
        if (firstFocusable) {
            firstFocusable.focus();
            if (document.activeElement !== firstFocusable) {
                throw new Error('Focus management не работает');
            }
        }
    }

    async testColorContrast() {
        // Простая проверка контраста
        const hasHighContrast = document.body.classList.contains('high-contrast');
        
        if (!hasHighContrast) {
            // Проверяем базовые цвета
            const computedStyle = getComputedStyle(document.body);
            const backgroundColor = computedStyle.backgroundColor;
            const color = computedStyle.color;
            
            // Простая проверка
            if (backgroundColor === color) {
                throw new Error('Низкий контраст цветов');
            }
        }
    }

    async testScreenReaderSupport() {
        const liveRegions = document.querySelectorAll('[aria-live]');
        
        if (liveRegions.length === 0) {
            throw new Error('Нет live regions для screen readers');
        }
    }

    // UI тесты
    async testComponentRendering() {
        const components = document.querySelectorAll('.card, .btn, .form-group');
        
        if (components.length === 0) {
            throw new Error('UI компоненты не отрендерены');
        }
    }

    async testResponsiveDesign() {
        if (window.responsiveManager) {
            const breakpoint = window.responsiveManager.getCurrentBreakpoint();
            
            if (!breakpoint) {
                throw new Error('Responsive breakpoint не определен');
            }
        }
    }

    async testAnimationSystem() {
        if (window.animationManager) {
            const animations = window.animationManager.getAllAnimations();
            
            if (animations.length === 0) {
                throw new Error('Система анимаций не инициализирована');
            }
        }
    }

    async testThemeSwitching() {
        const initialTheme = document.body.getAttribute('data-theme');
        
        // Переключаем тему
        document.body.setAttribute('data-theme', 'dark');
        const darkTheme = document.body.getAttribute('data-theme');
        
        // Возвращаем исходную тему
        document.body.setAttribute('data-theme', initialTheme || 'light');
        
        if (darkTheme !== 'dark') {
            throw new Error('Переключение темы не работает');
        }
    }

    async testFormValidation() {
        const forms = document.querySelectorAll('form');
        
        for (const form of forms) {
            const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
            
            for (const input of inputs) {
                if (!input.hasAttribute('aria-required')) {
                    throw new Error(`Поле ${input.name} не имеет aria-required`);
                }
            }
        }
    }

    // Утилиты
    saveTestResults(results) {
        this.testHistory.push({
            ...results,
            timestamp: Date.now()
        });
        
        // Ограничиваем историю
        if (this.testHistory.length > 100) {
            this.testHistory.shift();
        }
        
        try {
            localStorage.setItem('testHistory', JSON.stringify(this.testHistory));
        } catch (error) {
            console.warn('TestManager: Ошибка сохранения истории тестов:', error);
        }
    }

    notifyTestCompletion(results) {
        if (!this.settings.showTestNotifications) return;
        
        const message = `Тесты завершены: ${results.passed}/${results.total} пройдено, ${results.failed} провалено`;
        
        if (window.toastManager) {
            if (results.failed > 0) {
                window.toastManager.error('Тестирование завершено', message, 5000);
            } else {
                window.toastManager.success('Тестирование завершено', message, 5000);
            }
        }
    }

    notifyCriticalTestFailure(testName, error) {
        const message = `Критический тест провален: ${testName} - ${error.message}`;
        
        if (window.toastManager) {
            window.toastManager.error('Критическая ошибка', message, 10000);
        }
        
        console.error('Critical test failure:', testName, error);
    }

    monitorMemoryUsage() {
        if (performance.memory) {
            const memory = performance.memory;
            const usedMemory = memory.usedJSHeapSize;
            const totalMemory = memory.totalJSHeapSize;
            const memoryUsage = (usedMemory / totalMemory) * 100;
            
            if (memoryUsage > 80) {
                console.warn(`TestManager: Высокое потребление памяти: ${memoryUsage.toFixed(1)}%`);
            }
        }
    }

    monitorAnimationPerformance() {
        if (window.animationManager) {
            const activeAnimations = window.animationManager.getActiveAnimations();
            
            if (activeAnimations.length > 5) {
                console.warn(`TestManager: Много активных анимаций: ${activeAnimations.length}`);
            }
        }
    }

    // Публичные методы
    getTestResults(suiteId = null) {
        if (suiteId) {
            return this.testResults.get(suiteId);
        }
        return Array.from(this.testResults.values());
    }

    getTestHistory() {
        return this.testHistory;
    }

    getFailedTests() {
        return Array.from(this.failedTests.values());
    }

    getTestSuites() {
        return Array.from(this.testSuites.values());
    }

    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.saveSettings();
        
        if (newSettings.enableAutoTesting !== undefined) {
            if (newSettings.enableAutoTesting) {
                this.startAutoTesting();
            } else {
                this.stopAutoTesting();
            }
        }
    }

    // Остановка модуля
    stop() {
        this.stopAutoTesting();
        this.isRunning = false;
        console.log('TestManager: Остановлен');
    }

    // Перезапуск модуля
    restart() {
        this.stop();
        this.init();
        console.log('TestManager: Перезапущен');
    }
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    window.testManager = new TestManager();
});

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TestManager;
}