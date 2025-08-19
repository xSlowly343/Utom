/**
 * UI Demo - Демонстрация новых UI функций
 * Показывает возможности Toast, Empty States, Loading и других компонентов
 */

class UIDemo {
    constructor() {
        this.isRunning = false;
        this.demoInterval = null;
        this.init();
    }

    init() {
        this.createDemoInterface();
        this.bindEvents();
        console.log('UIDemo: Инициализирован');
    }

    createDemoInterface() {
        const demoContainer = document.createElement('div');
        demoContainer.id = 'uiDemo';
        demoContainer.className = 'ui-demo';
        demoContainer.innerHTML = `
            <div class="demo-header">
                <h3>🎨 Демонстрация UI компонентов</h3>
                <div class="demo-controls">
                    <button class="btn btn-primary" id="startDemo">▶️ Запустить демо</button>
                    <button class="btn btn-secondary" id="stopDemo">⏹️ Остановить</button>
                    <button class="btn btn-info" id="showAll">👁️ Показать все</button>
                </div>
            </div>
            
            <div class="demo-sections">
                <div class="demo-section">
                    <h4>🔔 Toast уведомления</h4>
                    <div class="demo-buttons">
                        <button class="btn btn-success btn-sm" onclick="window.uiDemo.showSuccessToast()">✅ Успех</button>
                        <button class="btn btn-danger btn-sm" onclick="window.uiDemo.showErrorToast()">❌ Ошибка</button>
                        <button class="btn btn-warning btn-sm" onclick="window.uiDemo.showWarningToast()">⚠️ Предупреждение</button>
                        <button class="btn btn-info btn-sm" onclick="window.uiDemo.showInfoToast()">ℹ️ Информация</button>
                        <button class="btn btn-primary btn-sm" onclick="window.uiDemo.showProgressToast()">⏳ Прогресс</button>
                        <button class="btn btn-secondary btn-sm" onclick="window.uiDemo.showConfirmToast()">❓ Подтверждение</button>
                    </div>
                </div>
                
                <div class="demo-section">
                    <h4>📭 Пустые состояния</h4>
                    <div class="demo-buttons">
                        <button class="btn btn-outline btn-sm" onclick="window.uiDemo.showDashboardEmpty()">📊 Дашборд</button>
                        <button class="btn btn-outline btn-sm" onclick="window.uiDemo.showRaidsEmpty()">⚔️ Рейды</button>
                        <button class="btn btn-outline btn-sm" onclick="window.uiDemo.showCharactersEmpty()">👤 Персонажи</button>
                        <button class="btn btn-outline btn-sm" onclick="window.uiDemo.showChatEmpty()">💬 Чат</button>
                        <button class="btn btn-outline btn-sm" onclick="window.uiDemo.hideAllEmpty()">🚫 Скрыть все</button>
                    </div>
                </div>
                
                <div class="demo-section">
                    <h4>⏳ Состояния загрузки</h4>
                    <div class="demo-buttons">
                        <button class="btn btn-outline btn-sm" onclick="window.uiDemo.showGlobalLoading()">🌐 Глобальная</button>
                        <button class="btn btn-outline btn-sm" onclick="window.uiDemo.showModuleLoading()">📦 Модуль</button>
                        <button class="btn btn-outline btn-sm" onclick="window.uiDemo.showPageLoading()">📄 Страница</button>
                        <button class="btn btn-outline btn-sm" onclick="window.uiDemo.showFormLoading()">📝 Форма</button>
                        <button class="btn btn-outline btn-sm" onclick="window.uiDemo.hideAllLoading()">🚫 Скрыть все</button>
                    </div>
                </div>
                
                <div class="demo-section">
                    <h4>🎯 Onboarding</h4>
                    <div class="demo-buttons">
                        <button class="btn btn-outline btn-sm" onclick="window.uiDemo.showFirstTimeOnboarding()">🎉 Первый раз</button>
                        <button class="btn btn-outline btn-sm" onclick="window.uiDemo.showCharacterOnboarding()">👤 Настройка персонажей</button>
                        <button class="btn btn-outline btn-sm" onclick="window.uiDemo.hideAllOnboarding()">🚫 Скрыть все</button>
                    </div>
                </div>
                
                <div class="demo-section">
                    <h4>🎭 Анимации и эффекты</h4>
                    <div class="demo-buttons">
                        <button class="btn btn-outline btn-sm" onclick="window.uiDemo.showSkeleton()">💀 Skeleton</button>
                        <button class="btn btn-outline btn-sm" onclick="window.uiDemo.showFadeIn()">✨ Fade In</button>
                        <button class="btn btn-outline btn-sm" onclick="window.uiDemo.showSlideIn()">📱 Slide In</button>
                        <button class="btn btn-outline btn-sm" onclick="window.uiDemo.clearAnimations()">🚫 Очистить</button>
                    </div>
                </div>
                
                <div class="demo-section">
                    <h4>📱 Адаптивность</h4>
                    <div class="demo-buttons">
                        <button class="btn btn-outline btn-sm" onclick="window.uiDemo.testResponsive()">🔄 Тест адаптивности</button>
                        <button class="btn btn-outline btn-sm" onclick="window.uiDemo.toggleMobileMenu()">☰ Мобильное меню</button>
                        <button class="btn btn-outline btn-sm" onclick="window.uiDemo.testTouchGestures()">👆 Touch жесты</button>
                        <button class="btn btn-outline btn-sm" onclick="window.uiDemo.showDeviceInfo()">📊 Информация об устройстве</button>
                    </div>
                </div>
                
                <div class="demo-section">
                    <h4>♿ Доступность</h4>
                    <div class="demo-buttons">
                        <button class="btn btn-outline btn-sm" onclick="window.uiDemo.testAccessibility()">♿ Тест доступности</button>
                        <button class="btn btn-outline btn-sm" onclick="window.uiDemo.toggleHighContrast()">🎨 Высокий контраст</button>
                        <button class="btn btn-outline btn-sm" onclick="window.uiDemo.toggleLargeText()">📝 Большой текст</button>
                        <button class="btn btn-outline btn-sm" onclick="window.uiDemo.showKeyboardShortcuts()">⌨️ Горячие клавиши</button>
                    </div>
                </div>
                
                <div class="demo-section">
                    <h4>🎭 Анимации</h4>
                    <div class="demo-buttons">
                        <button class="btn btn-outline btn-sm" onclick="window.uiDemo.testAnimations()">🎬 Тест анимаций</button>
                        <button class="btn btn-outline btn-sm" onclick="window.uiDemo.toggleAnimations()">🔄 Переключить анимации</button>
                        <button class="btn btn-outline btn-sm" onclick="window.uiDemo.showAnimationGallery()">🎨 Галерея анимаций</button>
                        <button class="btn btn-outline btn-sm" onclick="window.uiDemo.testPageTransitions()">📱 Переходы страниц</button>
                    </div>
                </div>
                
                <div class="demo-section">
                    <h4>🧪 Тестирование</h4>
                    <div class="demo-buttons">
                        <button class="btn btn-outline btn-sm" onclick="window.uiDemo.showTestRunner()">🧪 Test Runner</button>
                        <button class="btn btn-outline btn-sm" onclick="window.uiDemo.runAllTests()">🚀 Все тесты</button>
                        <button class="btn btn-outline btn-sm" onclick="window.uiDemo.runUnitTests()">⚡ Unit тесты</button>
                        <button class="btn btn-outline btn-sm" onclick="window.uiDemo.runIntegrationTests()">🔗 Integration тесты</button>
                        <button class="btn btn-outline btn-sm" onclick="window.uiDemo.runPerformanceTests()">⚡ Performance тесты</button>
                        <button class="btn btn-outline btn-sm" onclick="window.uiDemo.runAccessibilityTests()">♿ Accessibility тесты</button>
                        <button class="btn btn-outline btn-sm" onclick="window.uiDemo.runUITests()">🎨 UI тесты</button>
                    </div>
                </div>
                
                <div class="demo-section">
                    <h4>⚠️ Обработка ошибок</h4>
                    <div class="demo-buttons">
                        <button class="btn btn-outline btn-sm" onclick="window.uiDemo.testErrorBoundary()">🚨 Тест ErrorBoundary</button>
                        <button class="btn btn-outline btn-sm" onclick="window.uiDemo.showErrorHelp()">❓ Помощь по ошибкам</button>
                        <button class="btn btn-outline btn-sm" onclick="window.uiDemo.showErrorReport()">📤 Отчет об ошибках</button>
                        <button class="btn btn-outline btn-sm" onclick="window.uiDemo.clearErrors()">🧹 Очистить ошибки</button>
                    </div>
                </div>
            </div>
            
            <div class="demo-status">
                <div class="status-item">
                    <span class="status-label">Статус:</span>
                    <span class="status-value" id="demoStatus">Остановлено</span>
                </div>
                <div class="status-item">
                    <span class="status-label">Счетчик:</span>
                    <span class="status-value" id="demoCounter">0</span>
                </div>
            </div>
        `;

        // Добавляем в настройки
        const settingsSection = document.querySelector('.settings-section');
        if (settingsSection) {
            settingsSection.appendChild(demoContainer);
        } else {
            document.body.appendChild(demoContainer);
        }
    }

    bindEvents() {
        const startBtn = document.getElementById('startDemo');
        const stopBtn = document.getElementById('stopDemo');
        const showAllBtn = document.getElementById('showAll');

        if (startBtn) {
            startBtn.addEventListener('click', () => this.startDemo());
        }

        if (stopBtn) {
            stopBtn.addEventListener('click', () => this.stopDemo());
        }

        if (showAllBtn) {
            showAllBtn.addEventListener('click', () => this.showAllComponents());
        }
    }

    // Toast демонстрации
    showSuccessToast() {
        if (window.toastManager) {
            window.toastManager.success(
                'Операция выполнена успешно!',
                'Персонаж был создан и добавлен в список.',
                5000,
                [
                    { text: 'Просмотреть', action: 'view', class: 'btn-primary', icon: '👁️' },
                    { text: 'Редактировать', action: 'edit', class: 'btn-secondary', icon: '✏️' }
                ]
            );
        }
    }

    showErrorToast() {
        if (window.toastManager) {
            window.toastManager.error(
                'Произошла ошибка!',
                'Не удалось подключиться к серверу. Проверьте интернет соединение.',
                8000,
                [
                    { text: 'Повторить', action: 'retry', class: 'btn-primary', icon: '🔄' },
                    { text: 'Подробности', action: 'details', class: 'btn-secondary', icon: '📋' }
                ]
            );
        }
    }

    showWarningToast() {
        if (window.toastManager) {
            window.toastManager.warning(
                'Внимание!',
                'У вас осталось мало места в инвентаре. Рекомендуется очистить его.',
                6000,
                [
                    { text: 'Очистить', action: 'cleanup', class: 'btn-warning', icon: '🧹' },
                    { text: 'Позже', action: 'later', class: 'btn-secondary', icon: '⏰' }
                ]
            );
        }
    }

    showInfoToast() {
        if (window.toastManager) {
            window.toastManager.info(
                'Новое обновление!',
                'Доступна новая версия приложения с улучшениями производительности.',
                7000,
                [
                    { text: 'Обновить', action: 'update', class: 'btn-primary', icon: '⬆️' },
                    { text: 'Что нового', action: 'changelog', class: 'btn-secondary', icon: '📋' }
                ]
            );
        }
    }

    showProgressToast() {
        if (window.toastManager) {
            const toast = window.toastManager.showProgress(
                'Загрузка данных...',
                'Подключение к серверу...',
                0
            );

            // Имитируем прогресс
            let progress = 0;
            const interval = setInterval(() => {
                progress += 10;
                if (toast && toast.updateProgress) {
                    toast.updateProgress(progress);
                }
                
                if (progress >= 100) {
                    clearInterval(interval);
                    if (toast && toast.removeToast) {
                        toast.removeToast();
                    }
                    // Показываем уведомление об успехе
                    this.showSuccessToast();
                }
            }, 200);
        }
    }

    showConfirmToast() {
        if (window.toastManager) {
            window.toastManager.showConfirm(
                'Подтверждение действия',
                'Вы уверены, что хотите удалить этого персонажа? Это действие нельзя отменить.',
                [
                    { text: 'Удалить', action: 'delete', class: 'btn-danger', icon: '🗑️' },
                    { text: 'Отмена', action: 'cancel', class: 'btn-secondary', icon: '❌' }
                ]
            );
        }
    }

    // Empty States демонстрации
    showDashboardEmpty() {
        if (window.emptyStateManager) {
            window.emptyStateManager.showEmptyState('dashboard', null, true);
        }
    }

    showRaidsEmpty() {
        if (window.emptyStateManager) {
            window.emptyStateManager.showEmptyState('raids');
        }
    }

    showCharactersEmpty() {
        if (window.emptyStateManager) {
            window.emptyStateManager.showEmptyState('characters');
        }
    }

    showChatEmpty() {
        if (window.emptyStateManager) {
            window.emptyStateManager.showEmptyState('chat');
        }
    }

    hideAllEmpty() {
        if (window.emptyStateManager) {
            const sections = ['dashboard', 'raids', 'characters', 'chat', 'tools', 'schedule'];
            sections.forEach(section => {
                window.emptyStateManager.hideEmptyState(section);
            });
        }
    }

    // Loading демонстрации
    showGlobalLoading() {
        if (window.loadingManager) {
            window.loadingManager.showGlobalLoading('Загрузка приложения...', 0);
            
            // Имитируем прогресс
            let progress = 0;
            const interval = setInterval(() => {
                progress += 5;
                window.loadingManager.updateGlobalLoadingProgress(progress);
                
                if (progress >= 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                        window.loadingManager.hideGlobalLoading();
                    }, 500);
                }
            }, 100);
        }
    }

    showModuleLoading() {
        if (window.loadingManager) {
            window.loadingManager.showModuleLoading('demo', 'Загрузка модуля...', {
                showOverlay: true,
                showProgress: true,
                progress: 0
            });
            
            // Имитируем прогресс
            let progress = 0;
            const interval = setInterval(() => {
                progress += 10;
                window.loadingManager.updateModuleLoading('demo', { progress });
                
                if (progress >= 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                        window.loadingManager.hideModuleLoading('demo');
                    }, 500);
                }
            }, 200);
        }
    }

    showPageLoading() {
        if (window.loadingManager) {
            const loadingElement = window.loadingManager.showPageLoading('dashboard', 'Загрузка страницы...');
            
            setTimeout(() => {
                if (loadingElement) {
                    window.loadingManager.hidePageLoading('dashboard');
                }
            }, 3000);
        }
    }

    showFormLoading() {
        if (window.loadingManager) {
            const form = document.querySelector('form') || document.createElement('form');
            const hideLoading = window.loadingManager.showFormLoading(form, 'Отправка...');
            
            setTimeout(() => {
                if (hideLoading) {
                    hideLoading();
                }
            }, 3000);
        }
    }

    hideAllLoading() {
        if (window.loadingManager) {
            window.loadingManager.clearAllLoading();
        }
    }

    // Onboarding демонстрации
    showFirstTimeOnboarding() {
        if (window.emptyStateManager) {
            window.emptyStateManager.showOnboarding('firstTime');
        }
    }

    showCharacterOnboarding() {
        if (window.emptyStateManager) {
            window.emptyStateManager.showOnboarding('characterSetup');
        }
    }

    hideAllOnboarding() {
        if (window.emptyStateManager) {
            const types = ['firstTime', 'characterSetup'];
            types.forEach(type => {
                window.emptyStateManager.hideOnboarding(type);
            });
        }
    }

    // Анимации демонстрации
    showSkeleton() {
        const container = document.querySelector('#uiDemo') || document.body;
        if (window.loadingManager) {
            window.loadingManager.createSkeleton(container, 'card', 3);
        }
    }

    showFadeIn() {
        const container = document.querySelector('#uiDemo') || document.body;
        const element = document.createElement('div');
        element.className = 'demo-animation fade-in';
        element.innerHTML = '<h4>✨ Fade In анимация</h4><p>Этот элемент появился с эффектом fade in</p>';
        container.appendChild(element);
        
        setTimeout(() => {
            element.remove();
        }, 5000);
    }

    showSlideIn() {
        const container = document.querySelector('#uiDemo') || document.body;
        const element = document.createElement('div');
        element.className = 'demo-animation slide-in-left';
        element.innerHTML = '<h4>📱 Slide In анимация</h4><p>Этот элемент появился с эффектом slide in</p>';
        container.appendChild(element);
        
        setTimeout(() => {
            element.remove();
        }, 5000);
    }

    clearAnimations() {
        const container = document.querySelector('#uiDemo') || document.body;
        
        // Убираем skeleton
        if (window.loadingManager) {
            window.loadingManager.removeSkeletons(container);
        }
        
        // Убираем анимации
        const animations = container.querySelectorAll('.demo-animation');
        animations.forEach(animation => animation.remove());
    }

    // Демонстрация всех компонентов
    showAllComponents() {
        // Показываем все типы toast
        this.showSuccessToast();
        setTimeout(() => this.showErrorToast(), 1000);
        setTimeout(() => this.showWarningToast(), 2000);
        setTimeout(() => this.showInfoToast(), 3000);
        
        // Показываем loading
        setTimeout(() => this.showGlobalLoading(), 4000);
        
        // Показываем empty states
        setTimeout(() => this.showDashboardEmpty(), 6000);
        setTimeout(() => this.showRaidsEmpty(), 7000);
        
        // Показываем onboarding
        setTimeout(() => this.showFirstTimeOnboarding(), 8000);
    }

    // Запуск автоматической демонстрации
    startDemo() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.updateStatus('Запущено');
        
        let counter = 0;
        this.demoInterval = setInterval(() => {
            counter++;
            this.updateCounter(counter);
            
            // Показываем разные компоненты по очереди
            const actions = [
                () => this.showSuccessToast(),
                () => this.showInfoToast(),
                () => this.showModuleLoading(),
                () => this.showDashboardEmpty(),
                () => this.showWarningToast(),
                () => this.showProgressToast()
            ];
            
            const action = actions[counter % actions.length];
            if (action) {
                action();
            }
            
            // Останавливаем через 30 действий
            if (counter >= 30) {
                this.stopDemo();
            }
        }, 3000);
    }

    stopDemo() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        this.updateStatus('Остановлено');
        
        if (this.demoInterval) {
            clearInterval(this.demoInterval);
            this.demoInterval = null;
        }
        
        // Очищаем все компоненты
        this.hideAllEmpty();
        this.hideAllLoading();
        this.hideAllOnboarding();
        this.clearAnimations();
        
        if (window.toastManager) {
            window.toastManager.clearAll();
        }
    }

    updateStatus(status) {
        const statusElement = document.getElementById('demoStatus');
        if (statusElement) {
            statusElement.textContent = status;
        }
    }

    updateCounter(count) {
        const counterElement = document.getElementById('demoCounter');
        if (counterElement) {
            counterElement.textContent = count;
        }
    }

    // Тестирование адаптивности
    testResponsive() {
        if (window.responsiveManager) {
            const breakpoint = window.responsiveManager.getCurrentBreakpoint();
            const deviceType = window.responsiveManager.getDeviceType();
            const orientation = window.responsiveManager.getOrientation();
            
            window.toastManager?.info(
                'Информация об адаптивности',
                `Breakpoint: ${breakpoint}<br>Устройство: ${deviceType}<br>Ориентация: ${orientation}`,
                5000
            );
            
            // Показываем текущие CSS классы
            const bodyClasses = document.body.className;
            const htmlClasses = document.documentElement.className;
            
            console.log('Responsive Classes:', {
                body: bodyClasses,
                html: htmlClasses,
                breakpoint,
                deviceType,
                orientation
            });
        }
    }

    toggleMobileMenu() {
        if (window.responsiveManager) {
            window.responsiveManager.toggleMobileMenu();
        }
    }

    testTouchGestures() {
        if (window.touchGestureManager) {
            const gestures = window.touchGestureManager.getAllGestures();
            const activeGestures = window.touchGestureManager.getActiveGestures();
            
            window.toastManager?.info(
                'Touch жесты',
                `Доступно жестов: ${gestures.length}<br>Активных: ${activeGestures.length}`,
                5000
            );
            
            // Показываем инструкции по жестам
            this.showTouchInstructions();
        }
    }

    showTouchInstructions() {
        const instructions = document.createElement('div');
        instructions.className = 'touch-instructions';
        instructions.innerHTML = `
            <div class="instructions-content">
                <h4>👆 Touch жесты</h4>
                <ul>
                    <li>Свайп влево/вправо - навигация</li>
                    <li>Свайп вверх/вниз - скролл</li>
                    <li>Pinch - масштабирование</li>
                    <li>Долгое нажатие - контекстное меню</li>
                    <li>Двойное нажатие - увеличение</li>
                </ul>
                <button class="btn btn-primary" onclick="this.parentElement.parentElement.remove()">Понятно</button>
            </div>
        `;
        
        instructions.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--bg-primary);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-lg);
            padding: var(--spacing-lg);
            z-index: 10001;
            box-shadow: var(--shadow-xl);
            max-width: 400px;
            width: 90%;
        `;
        
        document.body.appendChild(instructions);
        
        // Автоматически убираем через 10 секунд
        setTimeout(() => {
            if (instructions.parentElement) {
                instructions.remove();
            }
        }, 10000);
    }

    showDeviceInfo() {
        if (window.responsiveManager) {
            const info = {
                breakpoint: window.responsiveManager.getCurrentBreakpoint(),
                deviceType: window.responsiveManager.getDeviceType(),
                orientation: window.responsiveManager.getOrientation(),
                isMobile: window.responsiveManager.isMobileDevice(),
                isTablet: window.responsiveManager.isTabletDevice(),
                isDesktop: window.responsiveManager.isDesktopDevice(),
                screenWidth: window.innerWidth,
                screenHeight: window.innerHeight,
                userAgent: navigator.userAgent
            };
            
            const infoText = Object.entries(info)
                .map(([key, value]) => `${key}: ${value}`)
                .join('<br>');
            
            window.toastManager?.info(
                'Информация об устройстве',
                infoText,
                8000
            );
            
            console.log('Device Info:', info);
        }
    }

    // Тестирование доступности
    testAccessibility() {
        if (window.accessibilityManager) {
            const info = window.accessibilityManager.getAccessibilityInfo();
            
            window.toastManager?.info(
                'Информация о доступности',
                `Настройки: ${Object.keys(info.settings).length}<br>Фокусируемых элементов: ${info.focusableElements}<br>Live regions: ${info.liveRegions}<br>Skip links: ${info.skipLinks}<br>Горячих клавиш: ${info.keyboardShortcuts}`,
                8000
            );
            
            // Запускаем тест доступности
            this.runAccessibilityTests();
        }
    }

    toggleHighContrast() {
        if (window.accessibilityManager) {
            const currentSetting = window.accessibilityManager.settings.enableHighContrast;
            window.accessibilityManager.updateSetting('enableHighContrast', !currentSetting);
            
            const status = !currentSetting ? 'включен' : 'отключен';
            window.toastManager?.info(
                'Высокий контраст',
                `Режим высокого контраста ${status}`,
                3000
            );
        }
    }

    toggleLargeText() {
        if (window.accessibilityManager) {
            const currentSetting = window.accessibilityManager.settings.enableLargeText;
            window.accessibilityManager.updateSetting('enableLargeText', !currentSetting);
            
            const status = !currentSetting ? 'включен' : 'отключен';
            window.toastManager?.info(
                'Большой текст',
                `Режим большого текста ${status}`,
                3000
            );
        }
    }

    showKeyboardShortcuts() {
        if (window.accessibilityManager) {
            window.accessibilityManager.showHelp();
        }
    }

    runAccessibilityTests() {
        const tests = [
            { name: 'ARIA Labels', test: () => this.testARIALabels() },
            { name: 'Focus Management', test: () => this.testFocusManagement() },
            { name: 'Keyboard Navigation', test: () => this.testKeyboardNavigation() },
            { name: 'Color Contrast', test: () => this.testColorContrast() },
            { name: 'Screen Reader', test: () => this.testScreenReader() }
        ];

        let passed = 0;
        let failed = 0;
        let warnings = 0;

        tests.forEach((test, index) => {
            setTimeout(() => {
                try {
                    const result = test.test();
                    if (result === 'pass') passed++;
                    else if (result === 'fail') failed++;
                    else if (result === 'warning') warnings++;
                    
                    // Показываем результат
                    this.showAccessibilityTestResult(test.name, result);
                    
                    // Обновляем общий результат
                    if (index === tests.length - 1) {
                        this.showAccessibilitySummary(passed, failed, warnings);
                    }
                } catch (error) {
                    console.error(`Accessibility test failed: ${test.name}`, error);
                    failed++;
                }
            }, index * 1000);
        });
    }

    testARIALabels() {
        const elementsWithoutLabels = document.querySelectorAll('button:not([aria-label]):empty, a:not([aria-label]):empty, img:not([alt])');
        const hasIssues = elementsWithoutLabels.length > 0;
        
        if (hasIssues) {
            console.warn('ARIA Labels test: Found elements without proper labels', elementsWithoutLabels);
            return 'warning';
        }
        
        return 'pass';
    }

    testFocusManagement() {
        const focusableElements = document.querySelectorAll('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const hasFocusableElements = focusableElements.length > 0;
        
        if (!hasFocusableElements) {
            return 'fail';
        }
        
        return 'pass';
    }

    testKeyboardNavigation() {
        // Проверяем наличие keyboard shortcuts
        if (window.accessibilityManager && window.accessibilityManager.keyboardShortcuts.size > 0) {
            return 'pass';
        }
        
        return 'warning';
    }

    testColorContrast() {
        // Простая проверка цветов
        const hasHighContrast = document.body.classList.contains('high-contrast');
        
        if (hasHighContrast) {
            return 'pass';
        }
        
        return 'warning';
    }

    testScreenReader() {
        // Проверяем наличие live regions
        const liveRegions = document.querySelectorAll('[aria-live]');
        
        if (liveRegions.length > 0) {
            return 'pass';
        }
        
        return 'warning';
    }

    showAccessibilityTestResult(testName, result) {
        const status = result === 'pass' ? '✅' : result === 'fail' ? '❌' : '⚠️';
        const message = `${status} ${testName}: ${result}`;
        
        window.toastManager?.info(
            'Тест доступности',
            message,
            3000
        );
        
        console.log(`Accessibility Test: ${testName} - ${result}`);
    }

    showAccessibilitySummary(passed, failed, warnings) {
        const total = passed + failed + warnings;
        const message = `Результаты тестирования:<br>✅ Пройдено: ${passed}<br>❌ Провалено: ${failed}<br>⚠️ Предупреждения: ${warnings}<br>📊 Всего: ${total}`;
        
        window.toastManager?.info(
            'Результаты тестирования доступности',
            message,
            8000
        );
        
        // Показываем рекомендации
        if (failed > 0) {
            this.showAccessibilityRecommendations();
        }
    }

    showAccessibilityRecommendations() {
        const recommendations = [
            'Добавьте ARIA labels к элементам без текста',
            'Проверьте контрастность цветов',
            'Убедитесь, что все элементы доступны с клавиатуры',
            'Добавьте alt атрибуты к изображениям',
            'Проверьте focus management в модальных окнах'
        ];
        
        const recommendationsText = recommendations.map(rec => `• ${rec}`).join('<br>');
        
        window.toastManager?.warning(
            'Рекомендации по улучшению доступности',
            recommendationsText,
            10000
        );
    }

    // Тестирование анимаций
    testAnimations() {
        if (window.animationManager) {
            const animations = window.animationManager.getAllAnimations();
            
            window.toastManager?.info(
                'Информация об анимациях',
                `Доступно анимаций: ${animations.length}<br>Активных: ${window.animationManager.getActiveAnimations().length}`,
                5000
            );
            
            // Запускаем демо анимаций
            this.runAnimationDemo();
        }
    }

    toggleAnimations() {
        if (window.animationManager) {
            const currentSetting = window.animationManager.settings.enableAnimations;
            window.animationManager.updateSettings({ enableAnimations: !currentSetting });
            
            const status = !currentSetting ? 'включены' : 'отключены';
            window.toastManager?.info(
                'Анимации',
                `Анимации ${status}`,
                3000
            );
        }
    }

    showAnimationGallery() {
        const gallery = document.createElement('div');
        gallery.className = 'animation-gallery';
        gallery.innerHTML = `
            <div class="gallery-content">
                <h3>🎨 Галерея анимаций</h3>
                <div class="animation-grid">
                    <div class="animation-item" data-animation="fadeIn">Fade In</div>
                    <div class="animation-item" data-animation="slideInUp">Slide Up</div>
                    <div class="animation-item" data-animation="scaleIn">Scale In</div>
                    <div class="animation-item" data-animation="bounceIn">Bounce In</div>
                    <div class="animation-item" data-animation="rotateIn">Rotate In</div>
                    <div class="animation-item" data-animation="flipInX">Flip X</div>
                    <div class="animation-item" data-animation="zoomIn">Zoom In</div>
                    <div class="animation-item" data-animation="lightSpeedIn">Light Speed</div>
                </div>
                <button class="btn btn-primary" onclick="this.parentElement.parentElement.remove()">Закрыть</button>
            </div>
        `;
        
        gallery.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--bg-primary);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-lg);
            padding: var(--spacing-xl);
            z-index: 10001;
            box-shadow: var(--shadow-xl);
            max-width: 600px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
        `;
        
        document.body.appendChild(gallery);
        
        // Добавляем обработчики для анимаций
        const animationItems = gallery.querySelectorAll('.animation-item');
        animationItems.forEach(item => {
            item.addEventListener('click', () => {
                const animationName = item.dataset.animation;
                if (window.animationManager) {
                    window.animationManager.playAnimation(animationName, item);
                }
            });
        });
        
        // Автоматически убираем через 15 секунд
        setTimeout(() => {
            if (gallery.parentElement) {
                gallery.remove();
            }
        }, 15000);
    }

    testPageTransitions() {
        if (window.animationManager) {
            // Показываем анимацию перехода
            const mainContent = document.querySelector('main, .main-content, #mainContent');
            if (mainContent) {
                window.animationManager.playAnimation('pageTransitionOut', mainContent);
                
                setTimeout(() => {
                    window.animationManager.playAnimation('pageTransitionIn', mainContent);
                }, 300);
            }
            
            window.toastManager?.info(
                'Переходы страниц',
                'Анимация перехода страницы выполнена',
                3000
            );
        }
    }

    runAnimationDemo() {
        const demoElements = document.querySelectorAll('.card, .btn, .form-group');
        
        demoElements.forEach((element, index) => {
            setTimeout(() => {
                if (window.animationManager) {
                    const animations = ['fadeIn', 'slideInUp', 'scaleIn', 'bounceIn'];
                    const randomAnimation = animations[Math.floor(Math.random() * animations.length)];
                    window.animationManager.playAnimation(randomAnimation, element);
                }
            }, index * 200);
        });
    }

    // Тестирование
    showTestRunner() {
        if (window.testRunner) {
            window.testRunner.showReport();
            window.toastManager?.info(
                'Test Runner',
                'Открыт интерфейс тестирования',
                3000
            );
        } else {
            window.toastManager?.error(
                'Ошибка',
                'TestRunner не доступен',
                5000
            );
        }
    }

    runAllTests() {
        if (window.testRunner) {
            window.testRunner.runAllTests();
            window.toastManager?.info(
                'Тестирование',
                'Запущены все тесты',
                3000
            );
        } else {
            window.toastManager?.error(
                'Ошибка',
                'TestRunner не доступен',
                5000
            );
        }
    }

    runUnitTests() {
        if (window.testRunner) {
            window.testRunner.runUnitTests();
            window.toastManager?.info(
                'Unit тесты',
                'Запущены Unit тесты',
                3000
            );
        }
    }

    runIntegrationTests() {
        if (window.testRunner) {
            window.testRunner.runIntegrationTests();
            window.toastManager?.info(
                'Integration тесты',
                'Запущены Integration тесты',
                3000
            );
        }
    }

    runPerformanceTests() {
        if (window.testRunner) {
            window.testRunner.runPerformanceTests();
            window.toastManager?.info(
                'Performance тесты',
                'Запущены Performance тесты',
                3000
            );
        }
    }

    runAccessibilityTests() {
        if (window.testRunner) {
            window.testRunner.runAccessibilityTests();
            window.toastManager?.info(
                'Accessibility тесты',
                'Запущены Accessibility тесты',
                3000
            );
        }
    }

    runUITests() {
        if (window.testRunner) {
            window.testRunner.runUITests();
            window.toastManager?.info(
                'UI тесты',
                'Запущены UI тесты',
                3000
            );
        }
    }

    // Тестирование ErrorBoundary
    testErrorBoundary() {
        if (window.errorBoundary) {
            // Создаем тестовую ошибку
            const testError = new Error('Тестовая ошибка для проверки ErrorBoundary');
            testError.stack = 'Error: Тестовая ошибка\n    at testErrorBoundary (ui-demo.js:123)\n    at HTMLButtonElement.onclick (index.html:45)';
            
            // Показываем ошибку через ErrorBoundary
            window.errorBoundary.handleError(testError, 'ui-demo.test');
            
            window.toastManager?.info(
                'Тест ErrorBoundary',
                'Тестовая ошибка создана. Проверьте отображение.',
                5000
            );
        } else {
            window.toastManager?.error(
                'Ошибка',
                'ErrorBoundary не доступен',
                5000
            );
        }
    }

    showErrorHelp() {
        if (window.errorBoundary) {
            window.errorBoundary.showErrorHelp();
        } else {
            window.toastManager?.error(
                'Ошибка',
                'ErrorBoundary не доступен',
                5000
            );
        }
    }

    showErrorReport() {
        if (window.errorBoundary) {
            window.errorBoundary.showErrorReport();
        } else {
            window.toastManager?.error(
                'Ошибка',
                'ErrorBoundary не доступен',
                5000
            );
        }
    }

    clearErrors() {
        if (window.errorBoundary) {
            window.errorBoundary.clearErrors();
            window.toastManager?.success(
                'Очистка ошибок',
                'Все ошибки очищены',
                3000
            );
        } else {
            window.toastManager?.error(
                'Ошибка',
                'ErrorBoundary не доступен',
                5000
            );
        }
    }

    // Остановка модуля
    stop() {
        this.stopDemo();
        console.log('UIDemo: Остановлен');
    }

    // Перезапуск модуля
    restart() {
        this.stop();
        this.init();
        console.log('UIDemo: Перезапущен');
    }
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    window.uiDemo = new UIDemo();
});

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIDemo;
}