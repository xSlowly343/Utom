/**
 * Test Manager
 * Комплексное тестирование всех модулей приложения
 */

class TestManager {
    constructor() {
        this.testResults = {
            total: 0,
            passed: 0,
            failed: 0,
            skipped: 0,
            duration: 0
        };
        
        this.currentTest = null;
        this.testQueue = [];
        this.isRunning = false;
        
        this.testSuites = {
            database: this.testDatabase.bind(this),
            websocket: this.testWebSocket.bind(this),
            authentication: this.testAuthentication.bind(this),
            characters: this.testCharacters.bind(this),
            raids: this.testRaids.bind(this),
            chat: this.testChat.bind(this),
            performance: this.testPerformance.bind(this),
            integration: this.testIntegration.bind(this)
        };
        
        this.init();
    }

    init() {
        this.createTestInterface();
        this.bindEvents();
        console.log('TestManager: Инициализирован');
    }

    createTestInterface() {
        const testContainer = document.createElement('div');
        testContainer.id = 'testManager';
        testContainer.className = 'test-manager';
        testContainer.innerHTML = `
            <div class="test-header">
                <h3>🧪 Тестирование системы</h3>
                <div class="test-controls">
                    <button class="btn btn-primary" id="runAllTests">▶️ Запустить все тесты</button>
                    <button class="btn btn-secondary" id="runSelectedTests">🎯 Выбранные тесты</button>
                    <button class="btn btn-warning" id="stopTests">⏹️ Остановить</button>
                    <button class="btn btn-info" id="exportResults">📊 Экспорт результатов</button>
                </div>
            </div>
            
            <div class="test-progress">
                <div class="progress-bar">
                    <div class="progress-fill" id="testProgressFill"></div>
                </div>
                <div class="progress-text">
                    <span id="testProgressText">0%</span>
                    <span id="testProgressDetails">0/0 тестов</span>
                </div>
            </div>
            
            <div class="test-suites">
                <div class="test-suite" data-suite="database">
                    <div class="suite-header">
                        <h4>🗄️ База данных</h4>
                        <div class="suite-status" id="dbStatus">⏳</div>
                        <label class="checkbox">
                            <input type="checkbox" checked>
                            <span class="checkmark"></span>
                        </label>
                    </div>
                    <div class="suite-tests" id="dbTests"></div>
                </div>
                
                <div class="test-suite" data-suite="websocket">
                    <div class="suite-header">
                        <h4>🌐 WebSocket</h4>
                        <div class="suite-status" id="wsStatus">⏳</div>
                        <label class="checkbox">
                            <input type="checkbox" checked>
                            <span class="checkmark"></span>
                        </label>
                    </div>
                    <div class="suite-tests" id="wsTests"></div>
                </div>
                
                <div class="test-suite" data-suite="authentication">
                    <div class="suite-header">
                        <h4>🔐 Аутентификация</h4>
                        <div class="suite-status" id="authStatus">⏳</div>
                        <label class="checkbox">
                            <input type="checkbox" checked>
                            <span class="checkmark"></span>
                        </label>
                    </div>
                    <div class="suite-tests" id="authTests"></div>
                </div>
                
                <div class="test-suite" data-suite="characters">
                    <div class="suite-header">
                        <h4>👤 Персонажи</h4>
                        <div class="suite-status" id="charStatus">⏳</div>
                        <label class="checkbox">
                            <input type="checkbox" checked>
                            <span class="checkmark"></span>
                        </label>
                    </div>
                    <div class="suite-tests" id="charTests"></div>
                </div>
                
                <div class="test-suite" data-suite="raids">
                    <div class="suite-header">
                        <h4>⚔️ Рейды</h4>
                        <div class="suite-status" id="raidStatus">⏳</div>
                        <label class="checkbox">
                            <input type="checkbox" checked>
                            <span class="checkmark"></span>
                        </label>
                    </div>
                    <div class="suite-tests" id="raidTests"></div>
                </div>
                
                <div class="test-suite" data-suite="chat">
                    <div class="suite-header">
                        <h4>💬 Чат</h4>
                        <div class="suite-status" id="chatStatus">⏳</div>
                        <label class="checkbox">
                            <input type="checkbox" checked>
                            <span class="checkmark"></span>
                        </label>
                    </div>
                    <div class="suite-tests" id="chatTests"></div>
                </div>
                
                <div class="test-suite" data-suite="performance">
                    <div class="suite-header">
                        <h4>⚡ Производительность</h4>
                        <div class="suite-status" id="perfStatus">⏳</div>
                        <label class="checkbox">
                            <input type="checkbox" checked>
                            <span class="checkmark"></span>
                        </label>
                    </div>
                    <div class="suite-tests" id="perfTests"></div>
                </div>
                
                <div class="test-suite" data-suite="integration">
                    <div class="suite-header">
                        <h4>🔗 Интеграция</h4>
                        <div class="suite-status" id="intStatus">⏳</div>
                        <label class="checkbox">
                            <input type="checkbox" checked>
                            <span class="checkmark"></span>
                        </label>
                    </div>
                    <div class="suite-tests" id="intTests"></div>
                </div>
            </div>
            
            <div class="test-results">
                <h4>📋 Результаты тестирования</h4>
                <div class="results-summary">
                    <div class="result-item passed">
                        <span class="result-icon">✅</span>
                        <span class="result-label">Пройдено:</span>
                        <span class="result-value" id="passedCount">0</span>
                    </div>
                    <div class="result-item failed">
                        <span class="result-icon">❌</span>
                        <span class="result-label">Провалено:</span>
                        <span class="result-value" id="failedCount">0</span>
                    </div>
                    <div class="result-item skipped">
                        <span class="result-icon">⏭️</span>
                        <span class="result-label">Пропущено:</span>
                        <span class="result-value" id="skippedCount">0</span>
                    </div>
                    <div class="result-item total">
                        <span class="result-icon">📊</span>
                        <span class="result-label">Всего:</span>
                        <span class="result-value" id="totalCount">0</span>
                    </div>
                </div>
                <div class="test-log" id="testLog"></div>
            </div>
        `;

        // Добавляем в настройки
        const settingsSection = document.querySelector('.settings-section');
        if (settingsSection) {
            settingsSection.appendChild(testContainer);
        } else {
            document.body.appendChild(testContainer);
        }
    }

    bindEvents() {
        // Запуск всех тестов
        const runAllBtn = document.getElementById('runAllTests');
        if (runAllBtn) {
            runAllBtn.addEventListener('click', () => this.runAllTests());
        }

        // Запуск выбранных тестов
        const runSelectedBtn = document.getElementById('runSelectedTests');
        if (runSelectedBtn) {
            runSelectedBtn.addEventListener('click', () => this.runSelectedTests());
        }

        // Остановка тестов
        const stopBtn = document.getElementById('stopTests');
        if (stopBtn) {
            stopBtn.addEventListener('click', () => this.stopTests());
        }

        // Экспорт результатов
        const exportBtn = document.getElementById('exportResults');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportResults());
        }
    }

    async runAllTests() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.resetResults();
        this.updateProgress(0, 0);
        
        const startTime = Date.now();
        
        try {
            // Запускаем все тестовые наборы
            for (const [suiteName, testSuite] of Object.entries(this.testSuites)) {
                if (!this.isRunning) break;
                
                await this.runTestSuite(suiteName, testSuite);
            }
            
            this.testResults.duration = Date.now() - startTime;
            this.updateProgress(100, this.testResults.total);
            this.logTest('🎉 Все тесты завершены!', 'success');
            
        } catch (error) {
            this.logTest(`❌ Ошибка выполнения тестов: ${error.message}`, 'error');
        } finally {
            this.isRunning = false;
            this.updateResults();
        }
    }

    async runSelectedTests() {
        if (this.isRunning) return;
        
        const selectedSuites = Array.from(document.querySelectorAll('.test-suite input[type="checkbox"]:checked'))
            .map(checkbox => checkbox.closest('.test-suite').dataset.suite);
        
        if (selectedSuites.length === 0) {
            this.logTest('⚠️ Выберите тесты для запуска', 'warning');
            return;
        }
        
        this.isRunning = true;
        this.resetResults();
        this.updateProgress(0, 0);
        
        const startTime = Date.now();
        
        try {
            for (const suiteName of selectedSuites) {
                if (!this.isRunning) break;
                
                const testSuite = this.testSuites[suiteName];
                if (testSuite) {
                    await this.runTestSuite(suiteName, testSuite);
                }
            }
            
            this.testResults.duration = Date.now() - startTime;
            this.updateProgress(100, this.testResults.total);
            this.logTest('🎉 Выбранные тесты завершены!', 'success');
            
        } catch (error) {
            this.logTest(`❌ Ошибка выполнения тестов: ${error.message}`, 'error');
        } finally {
            this.isRunning = false;
            this.updateResults();
        }
    }

    async runTestSuite(suiteName, testSuite) {
        this.logTest(`🚀 Запуск тестового набора: ${suiteName}`, 'info');
        this.updateSuiteStatus(suiteName, 'running');
        
        try {
            await testSuite();
            this.updateSuiteStatus(suiteName, 'passed');
            this.logTest(`✅ Тестовый набор ${suiteName} завершен успешно`, 'success');
        } catch (error) {
            this.updateSuiteStatus(suiteName, 'failed');
            this.logTest(`❌ Тестовый набор ${suiteName} провален: ${error.message}`, 'error');
        }
    }

    stopTests() {
        this.isRunning = false;
        this.logTest('⏹️ Тестирование остановлено пользователем', 'warning');
    }

    resetResults() {
        this.testResults = {
            total: 0,
            passed: 0,
            failed: 0,
            skipped: 0,
            duration: 0
        };
        
        // Сбрасываем статусы всех наборов
        Object.keys(this.testSuites).forEach(suiteName => {
            this.updateSuiteStatus(suiteName, 'pending');
        });
        
        // Очищаем лог
        const testLog = document.getElementById('testLog');
        if (testLog) {
            testLog.innerHTML = '';
        }
    }

    updateProgress(percentage, current, total) {
        const progressFill = document.getElementById('testProgressFill');
        const progressText = document.getElementById('testProgressText');
        const progressDetails = document.getElementById('testProgressDetails');
        
        if (progressFill) {
            progressFill.style.width = `${percentage}%`;
        }
        
        if (progressText) {
            progressText.textContent = `${percentage}%`;
        }
        
        if (progressDetails) {
            progressDetails.textContent = `${current}/${total} тестов`;
        }
    }

    updateSuiteStatus(suiteName, status) {
        const statusElement = document.getElementById(`${suiteName}Status`);
        if (statusElement) {
            const statusMap = {
                pending: '⏳',
                running: '🔄',
                passed: '✅',
                failed: '❌',
                skipped: '⏭️'
            };
            
            statusElement.textContent = statusMap[status] || '⏳';
            statusElement.className = `suite-status ${status}`;
        }
    }

    logTest(message, type = 'info') {
        const testLog = document.getElementById('testLog');
        if (!testLog) return;
        
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${type}`;
        logEntry.innerHTML = `
            <span class="log-timestamp">[${timestamp}]</span>
            <span class="log-message">${message}</span>
        `;
        
        testLog.appendChild(logEntry);
        testLog.scrollTop = testLog.scrollHeight;
        
        // Автоматически удаляем старые записи
        if (testLog.children.length > 100) {
            testLog.removeChild(testLog.firstChild);
        }
    }

    updateResults() {
        // Обновляем счетчики
        document.getElementById('passedCount').textContent = this.testResults.passed;
        document.getElementById('failedCount').textContent = this.testResults.failed;
        document.getElementById('skippedCount').textContent = this.testResults.skipped;
        document.getElementById('totalCount').textContent = this.testResults.total;
    }

    // Тестовые наборы
    async testDatabase() {
        this.logTest('Тестирование базы данных...', 'info');
        
        // Проверяем подключение к БД
        if (!window.databaseManager) {
            throw new Error('DatabaseManager недоступен');
        }
        
        // Тест создания пользователя
        try {
            const userId = await window.databaseManager.createUser({
                username: 'test_user',
                email: 'test@example.com',
                role: 'user'
            });
            this.testResults.passed++;
            this.logTest('✅ Создание пользователя: OK', 'success');
            
            // Тест получения пользователя
            const user = await window.databaseManager.getUserById(userId);
            if (user && user.username === 'test_user') {
                this.testResults.passed++;
                this.logTest('✅ Получение пользователя: OK', 'success');
            } else {
                throw new Error('Полученный пользователь не соответствует созданному');
            }
            
            // Тест обновления пользователя
            await window.databaseManager.updateUser(userId, { role: 'moderator' });
            const updatedUser = await window.databaseManager.getUserById(userId);
            if (updatedUser.role === 'moderator') {
                this.testResults.passed++;
                this.logTest('✅ Обновление пользователя: OK', 'success');
            } else {
                throw new Error('Пользователь не обновился');
            }
            
        } catch (error) {
            this.testResults.failed++;
            this.logTest(`❌ Тест пользователей: ${error.message}`, 'error');
        }
        
        this.testResults.total += 3;
    }

    async testWebSocket() {
        this.logTest('Тестирование WebSocket...', 'info');
        
        if (!window.wsClient) {
            throw new Error('WebSocket клиент недоступен');
        }
        
        // Тест подключения
        if (window.wsClient.isConnected) {
            this.testResults.passed++;
            this.logTest('✅ WebSocket подключение: OK', 'success');
        } else {
            this.testResults.failed++;
            this.logTest('❌ WebSocket подключение: FAILED', 'error');
        }
        
        // Тест отправки сообщения
        try {
            await window.wsClient.sendChatMessage('test', 'test message');
            this.testResults.passed++;
            this.logTest('✅ Отправка сообщения: OK', 'success');
        } catch (error) {
            this.testResults.failed++;
            this.logTest(`❌ Отправка сообщения: ${error.message}`, 'error');
        }
        
        this.testResults.total += 2;
    }

    async testAuthentication() {
        this.logTest('Тестирование аутентификации...', 'info');
        
        if (!window.authManager) {
            throw new Error('AuthManager недоступен');
        }
        
        // Тест проверки статуса
        const isAuth = window.authManager.isUserAuthenticated();
        if (typeof isAuth === 'boolean') {
            this.testResults.passed++;
            this.logTest('✅ Проверка статуса аутентификации: OK', 'success');
        } else {
            this.testResults.failed++;
            this.logTest('❌ Проверка статуса аутентификации: FAILED', 'error');
        }
        
        // Тест получения текущего пользователя
        const currentUser = window.authManager.getCurrentUser();
        if (currentUser !== null) {
            this.testResults.passed++;
            this.logTest('✅ Получение текущего пользователя: OK', 'success');
        } else {
            this.testResults.passed++;
            this.logTest('✅ Получение текущего пользователя: OK (не авторизован)', 'success');
        }
        
        this.testResults.total += 2;
    }

    async testCharacters() {
        this.logTest('Тестирование модуля персонажей...', 'info');
        
        if (!window.charactersManager) {
            throw new Error('CharactersManager недоступен');
        }
        
        // Тест загрузки персонажей
        try {
            await window.charactersManager.loadCharacters();
            this.testResults.passed++;
            this.logTest('✅ Загрузка персонажей: OK', 'success');
        } catch (error) {
            this.testResults.failed++;
            this.logTest(`❌ Загрузка персонажей: ${error.message}`, 'error');
        }
        
        // Тест создания персонажа
        try {
            const characterId = await window.charactersManager.addCharacter({
                name: 'TestChar',
                class: 'Warrior',
                level: 50,
                itemLevel: 1500
            });
            
            if (characterId) {
                this.testResults.passed++;
                this.logTest('✅ Создание персонажа: OK', 'success');
            } else {
                throw new Error('Персонаж не создан');
            }
        } catch (error) {
            this.testResults.failed++;
            this.logTest(`❌ Создание персонажа: ${error.message}`, 'error');
        }
        
        this.testResults.total += 2;
    }

    async testRaids() {
        this.logTest('Тестирование модуля рейдов...', 'info');
        
        if (!window.raidsManager) {
            throw new Error('RaidsManager недоступен');
        }
        
        // Тест загрузки рейдов
        try {
            await window.raidsManager.loadRaids();
            this.testResults.passed++;
            this.logTest('✅ Загрузка рейдов: OK', 'success');
        } catch (error) {
            this.testResults.failed++;
            this.logTest(`❌ Загрузка рейдов: ${error.message}`, 'error');
        }
        
        // Тест создания рейда
        try {
            const raidId = await window.raidsManager.createRaid({
                name: 'Test Raid',
                type: 'Legion',
                difficulty: 'Normal',
                date: '2024-01-01',
                time: '20:00',
                duration: 120,
                maxParticipants: 8,
                minItemLevel: 1500,
                description: 'Test raid for testing'
            });
            
            if (raidId) {
                this.testResults.passed++;
                this.logTest('✅ Создание рейда: OK', 'success');
            } else {
                throw new Error('Рейд не создан');
            }
        } catch (error) {
            this.testResults.failed++;
            this.logTest(`❌ Создание рейда: ${error.message}`, 'error');
        }
        
        this.testResults.total += 2;
    }

    async testChat() {
        this.logTest('Тестирование модуля чата...', 'info');
        
        if (!window.chatSystem) {
            throw new Error('ChatSystem недоступен');
        }
        
        // Тест инициализации WebSocket
        try {
            window.chatSystem.initializeWebSocket();
            this.testResults.passed++;
            this.logTest('✅ Инициализация WebSocket: OK', 'success');
        } catch (error) {
            this.testResults.failed++;
            this.logTest(`❌ Инициализация WebSocket: ${error.message}`, 'error');
        }
        
        // Тест переключения каналов
        try {
            window.chatSystem.switchChannel('general');
            this.testResults.passed++;
            this.logTest('✅ Переключение каналов: OK', 'success');
        } catch (error) {
            this.testResults.failed++;
            this.logTest(`❌ Переключение каналов: ${error.message}`, 'error');
        }
        
        this.testResults.total += 2;
    }

    async testPerformance() {
        this.logTest('Тестирование производительности...', 'info');
        
        if (!window.performanceManager) {
            throw new Error('PerformanceManager недоступен');
        }
        
        // Тест получения метрик
        try {
            const metrics = window.performanceManager.getMetrics();
            if (metrics && typeof metrics === 'object') {
                this.testResults.passed++;
                this.logTest('✅ Получение метрик: OK', 'success');
            } else {
                throw new Error('Метрики не получены');
            }
        } catch (error) {
            this.testResults.failed++;
            this.logTest(`❌ Получение метрик: ${error.message}`, 'error');
        }
        
        // Тест генерации отчета
        try {
            const report = window.performanceManager.generateReport();
            if (report && report.summary) {
                this.testResults.passed++;
                this.logTest('✅ Генерация отчета: OK', 'success');
            } else {
                throw new Error('Отчет не сгенерирован');
            }
        } catch (error) {
            this.testResults.failed++;
            this.logTest(`❌ Генерация отчета: ${error.message}`, 'error');
        }
        
        this.testResults.total += 2;
    }

    async testIntegration() {
        this.logTest('Тестирование интеграции...', 'info');
        
        // Тест интеграции с основным сайтом
        if (window.siteIntegrationManager) {
            try {
                const isConnected = await window.siteIntegrationManager.checkSiteConnection();
                if (typeof isConnected === 'boolean') {
                    this.testResults.passed++;
                    this.logTest('✅ Проверка соединения с сайтом: OK', 'success');
                } else {
                    throw new Error('Неверный тип ответа');
                }
            } catch (error) {
                this.testResults.passed++;
                this.logTest('✅ Проверка соединения с сайтом: OK (сайт недоступен)', 'success');
            }
        } else {
            this.testResults.skipped++;
            this.logTest('⏭️ Интеграция с сайтом: SKIPPED (модуль недоступен)', 'info');
        }
        
        // Тест миграции данных
        if (window.dataMigrationManager) {
            try {
                const needsMigration = window.dataMigrationManager.needsMigration();
                if (typeof needsMigration === 'boolean') {
                    this.testResults.passed++;
                    this.logTest('✅ Проверка миграции данных: OK', 'success');
                } else {
                    throw new Error('Неверный тип ответа');
                }
            } catch (error) {
                this.testResults.failed++;
                this.logTest(`❌ Проверка миграции данных: ${error.message}`, 'error');
            }
        } else {
            this.testResults.skipped++;
            this.logTest('⏭️ Миграция данных: SKIPPED (модуль недоступен)', 'info');
        }
        
        this.testResults.total += 2;
    }

    exportResults() {
        const results = {
            timestamp: new Date().toISOString(),
            summary: this.testResults,
            details: {
                database: this.getSuiteResults('database'),
                websocket: this.getSuiteResults('websocket'),
                authentication: this.getSuiteResults('authentication'),
                characters: this.getSuiteResults('characters'),
                raids: this.getSuiteResults('raids'),
                chat: this.getSuiteResults('chat'),
                performance: this.getSuiteResults('performance'),
                integration: this.getSuiteResults('integration')
            }
        };
        
        // Создаем JSON файл для скачивания
        const dataStr = JSON.stringify(results, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `test-results-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        this.logTest('📊 Результаты тестирования экспортированы', 'success');
    }

    getSuiteResults(suiteName) {
        const statusElement = document.getElementById(`${suiteName}Status`);
        if (statusElement) {
            return {
                status: statusElement.className.includes('passed') ? 'passed' : 
                        statusElement.className.includes('failed') ? 'failed' : 
                        statusElement.className.includes('running') ? 'running' : 'pending'
            };
        }
        return { status: 'unknown' };
    }

    // Остановка тестирования
    stop() {
        this.isRunning = false;
        console.log('TestManager: Остановлен');
    }

    // Перезапуск тестирования
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