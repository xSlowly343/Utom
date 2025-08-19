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