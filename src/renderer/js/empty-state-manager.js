/**
 * Empty State Manager
 * Управляет отображением пустых состояний и onboarding экранов
 */

class EmptyStateManager {
    constructor() {
        this.emptyStates = new Map();
        this.onboardingStates = new Map();
        this.defaultStates = new Map();
        this.settings = {
            showOnboarding: true,
            showEmptyStates: true,
            animation: true,
            autoHide: true
        };
        
        this.init();
    }

    init() {
        this.loadSettings();
        this.createDefaultStates();
        this.setupEventListeners();
        console.log('EmptyStateManager: Инициализирован');
    }

    loadSettings() {
        try {
            const savedSettings = localStorage.getItem('emptyStateSettings');
            if (savedSettings) {
                this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
            }
        } catch (error) {
            console.warn('EmptyStateManager: Ошибка загрузки настроек:', error);
        }
    }

    saveSettings() {
        try {
            localStorage.setItem('emptyStateSettings', JSON.stringify(this.settings));
        } catch (error) {
            console.warn('EmptyStateManager: Ошибка сохранения настроек:', error);
        }
    }

    createDefaultStates() {
        // Пустые состояния для основных разделов
        this.defaultStates.set('dashboard', {
            icon: '📊',
            title: 'Добро пожаловать в Lost Ark Raid Manager!',
            message: 'Начните с создания персонажа или присоединитесь к рейду.',
            actions: [
                { text: 'Создать персонажа', action: 'createCharacter', class: 'btn-primary' },
                { text: 'Найти рейд', action: 'findRaid', class: 'btn-secondary' },
                { text: 'Настройки', action: 'settings', class: 'btn-outline' }
            ],
            illustration: 'dashboard-empty'
        });

        this.defaultStates.set('raids', {
            icon: '⚔️',
            title: 'Рейды не найдены',
            message: 'Создайте свой первый рейд или присоединитесь к существующему.',
            actions: [
                { text: 'Создать рейд', action: 'createRaid', class: 'btn-primary' },
                { text: 'Поиск рейдов', action: 'searchRaids', class: 'btn-secondary' },
                { text: 'Настройки уведомлений', action: 'raidSettings', class: 'btn-outline' }
            ],
            illustration: 'raids-empty'
        });

        this.defaultStates.set('characters', {
            icon: '👤',
            title: 'Персонажи не найдены',
            message: 'Создайте своего первого персонажа для начала игры.',
            actions: [
                { text: 'Создать персонажа', action: 'createCharacter', class: 'btn-primary' },
                { text: 'Импорт данных', action: 'importData', class: 'btn-secondary' },
                { text: 'Шаблоны', action: 'templates', class: 'btn-outline' }
            ],
            illustration: 'characters-empty'
        });

        this.defaultStates.set('chat', {
            icon: '💬',
            title: 'Чат пуст',
            message: 'Начните общение с участниками гильдии.',
            actions: [
                { text: 'Создать канал', action: 'createChannel', class: 'btn-primary' },
                { text: 'Пригласить друзей', action: 'inviteFriends', class: 'btn-secondary' },
                { text: 'Настройки чата', action: 'chatSettings', class: 'btn-outline' }
            ],
            illustration: 'chat-empty'
        });

        this.defaultStates.set('tools', {
            icon: '🛠️',
            title: 'Инструменты готовы к использованию',
            message: 'Выберите нужный инструмент для оптимизации персонажа.',
            actions: [
                { text: 'DPS калькулятор', action: 'dpsCalculator', class: 'btn-primary' },
                { text: 'Оптимизатор экипировки', action: 'gearOptimizer', class: 'btn-secondary' },
                { text: 'Планировщик апгрейдов', action: 'upgradePlanner', class: 'btn-outline' }
            ],
            illustration: 'tools-empty'
        });

        this.defaultStates.set('schedule', {
            icon: '📅',
            title: 'Расписание пусто',
            message: 'Создайте расписание рейдов и событий.',
            actions: [
                { text: 'Создать событие', action: 'createEvent', class: 'btn-primary' },
                { text: 'Импорт календаря', action: 'importCalendar', class: 'btn-secondary' },
                { text: 'Настройки расписания', action: 'scheduleSettings', class: 'btn-outline' }
            ],
            illustration: 'schedule-empty'
        });

        // Onboarding состояния
        this.onboardingStates.set('firstTime', {
            icon: '🎉',
            title: 'Добро пожаловать!',
            message: 'Давайте настроим ваше приложение для максимальной эффективности.',
            steps: [
                { title: 'Создание персонажа', description: 'Добавьте своих персонажей', completed: false },
                { title: 'Настройка уведомлений', description: 'Настройте уведомления о рейдах', completed: false },
                { title: 'Подключение к гильдии', description: 'Присоединитесь к гильдии', completed: false },
                { title: 'Импорт данных', description: 'Перенесите данные из других источников', completed: false }
            ],
            actions: [
                { text: 'Начать настройку', action: 'startOnboarding', class: 'btn-primary' },
                { text: 'Пропустить', action: 'skipOnboarding', class: 'btn-outline' }
            ]
        });

        this.onboardingStates.set('characterSetup', {
            icon: '👤',
            title: 'Настройка персонажей',
            message: 'Создайте профили для всех ваших персонажей.',
            steps: [
                { title: 'Основная информация', description: 'Имя, класс, уровень', completed: false },
                { title: 'Экипировка', description: 'Предметы и характеристики', completed: false },
                { title: 'Навыки', description: 'Скиллы и билды', completed: false },
                { title: 'Прогресс', description: 'Достижения и цели', completed: false }
            ],
            actions: [
                { text: 'Создать персонажа', action: 'createCharacter', class: 'btn-primary' },
                { text: 'Импорт данных', action: 'importCharacter', class: 'btn-secondary' }
            ]
        });
    }

    setupEventListeners() {
        // Глобальные события для показа пустых состояний
        window.addEventListener('showEmptyState', (event) => {
            const { section, customState, showOnboarding } = event.detail;
            this.showEmptyState(section, customState, showOnboarding);
        });

        window.addEventListener('hideEmptyState', (event) => {
            const { section } = event.detail;
            this.hideEmptyState(section);
        });

        window.addEventListener('showOnboarding', (event) => {
            const { type, customOnboarding } = event.detail;
            this.showOnboarding(type, customOnboarding);
        });

        window.addEventListener('hideOnboarding', (event) => {
            const { type } = event.detail;
            this.hideOnboarding(type);
        });
    }

    // Показать пустое состояние
    showEmptyState(section, customState = null, showOnboarding = false) {
        if (!this.settings.showEmptyStates) return;

        const container = this.getContainer(section);
        if (!container) return;

        const state = customState || this.defaultStates.get(section);
        if (!state) return;

        // Скрываем существующий контент
        this.hideExistingContent(container);

        // Создаем элемент пустого состояния
        const emptyStateElement = this.createEmptyStateElement(state, section);
        container.appendChild(emptyStateElement);

        // Сохраняем ссылку
        this.emptyStates.set(section, emptyStateElement);

        // Показываем onboarding если нужно
        if (showOnboarding && this.settings.showOnboarding) {
            this.showOnboarding('firstTime');
        }

        // Анимация появления
        if (this.settings.animation) {
            requestAnimationFrame(() => {
                emptyStateElement.classList.add('show');
            });
        }

        // Уведомляем другие модули
        this.notifyModules('emptyStateShown', { section, state });
    }

    // Скрыть пустое состояние
    hideEmptyState(section) {
        const emptyStateElement = this.emptyStates.get(section);
        if (emptyStateElement) {
            if (this.settings.animation) {
                emptyStateElement.classList.add('hiding');
                setTimeout(() => {
                    this.removeEmptyStateElement(section);
                }, 300);
            } else {
                this.removeEmptyStateElement(section);
            }
        }
    }

    // Показать onboarding
    showOnboarding(type, customOnboarding = null) {
        if (!this.settings.showOnboarding) return;

        const onboarding = customOnboarding || this.onboardingStates.get(type);
        if (!onboarding) return;

        // Создаем модальное окно для onboarding
        const modalElement = this.createOnboardingModal(onboarding, type);
        document.body.appendChild(modalElement);

        // Сохраняем ссылку
        this.onboardingStates.set(type, modalElement);

        // Анимация появления
        if (this.settings.animation) {
            requestAnimationFrame(() => {
                modalElement.classList.add('show');
            });
        }

        // Уведомляем другие модули
        this.notifyModules('onboardingShown', { type, onboarding });
    }

    // Скрыть onboarding
    hideOnboarding(type) {
        const modalElement = this.onboardingStates.get(type);
        if (modalElement) {
            if (this.settings.animation) {
                modalElement.classList.add('hiding');
                setTimeout(() => {
                    this.removeOnboardingElement(type);
                }, 300);
            } else {
                this.removeOnboardingElement(type);
            }
        }
    }

    // Создание элемента пустого состояния
    createEmptyStateElement(state, section) {
        const element = document.createElement('div');
        element.className = 'empty-state';
        element.dataset.section = section;
        
        element.innerHTML = `
            <div class="empty-state-content">
                <div class="empty-state-icon">${state.icon}</div>
                <h2 class="empty-state-title">${state.title}</h2>
                <p class="empty-state-message">${state.message}</p>
                ${state.illustration ? `<div class="empty-state-illustration ${state.illustration}"></div>` : ''}
                ${state.actions ? `
                    <div class="empty-state-actions">
                        ${state.actions.map(action => `
                            <button class="btn ${action.class}" onclick="window.emptyStateManager.handleAction('${action.action}', '${section}')">
                                ${action.text}
                            </button>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;

        return element;
    }

    // Создание модального окна onboarding
    createOnboardingModal(onboarding, type) {
        const element = document.createElement('div');
        element.className = 'onboarding-modal';
        element.dataset.type = type;
        
        element.innerHTML = `
            <div class="onboarding-overlay"></div>
            <div class="onboarding-content">
                <div class="onboarding-header">
                    <div class="onboarding-icon">${onboarding.icon}</div>
                    <h2 class="onboarding-title">${onboarding.title}</h2>
                    <button class="onboarding-close" onclick="window.emptyStateManager.hideOnboarding('${type}')">×</button>
                </div>
                <div class="onboarding-body">
                    <p class="onboarding-message">${onboarding.message}</p>
                    ${onboarding.steps ? `
                        <div class="onboarding-steps">
                            ${onboarding.steps.map((step, index) => `
                                <div class="onboarding-step ${step.completed ? 'completed' : ''}" data-step="${index}">
                                    <div class="step-number">${index + 1}</div>
                                    <div class="step-content">
                                        <h4 class="step-title">${step.title}</h4>
                                        <p class="step-description">${step.description}</p>
                                    </div>
                                    <div class="step-status">
                                        ${step.completed ? '✅' : '⏳'}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
                ${onboarding.actions ? `
                    <div class="onboarding-actions">
                        ${onboarding.actions.map(action => `
                            <button class="btn ${action.class}" onclick="window.emptyStateManager.handleAction('${action.action}', '${type}')">
                                ${action.text}
                            </button>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;

        return element;
    }

    // Получение контейнера для секции
    getContainer(section) {
        const selectors = [
            `#${section}`,
            `[data-section="${section}"]`,
            `.${section}-container`,
            `.${section}-content`
        ];

        for (const selector of selectors) {
            const container = document.querySelector(selector);
            if (container) return container;
        }

        return null;
    }

    // Скрытие существующего контента
    hideExistingContent(container) {
        const existingContent = container.querySelector('.content, .main-content, .page-content');
        if (existingContent) {
            existingContent.style.display = 'none';
        }
    }

    // Показ существующего контента
    showExistingContent(container) {
        const existingContent = container.querySelector('.content, .main-content, .page-content');
        if (existingContent) {
            existingContent.style.display = 'block';
        }
    }

    // Удаление элемента пустого состояния
    removeEmptyStateElement(section) {
        const element = this.emptyStates.get(section);
        if (element && element.parentElement) {
            element.remove();
            this.emptyStates.delete(section);
        }

        // Показываем существующий контент
        const container = this.getContainer(section);
        if (container) {
            this.showExistingContent(container);
        }

        // Уведомляем другие модули
        this.notifyModules('emptyStateHidden', { section });
    }

    // Удаление элемента onboarding
    removeOnboardingElement(type) {
        const element = this.onboardingStates.get(type);
        if (element && element.parentElement) {
            element.remove();
            this.onboardingStates.delete(type);
        }

        // Уведомляем другие модули
        this.notifyModules('onboardingHidden', { type });
    }

    // Обработка действий
    handleAction(action, context) {
        console.log(`EmptyStateManager: Действие ${action} в контексте ${context}`);

        // Уведомляем другие модули о действии
        this.notifyModules('emptyStateAction', { action, context });

        // Выполняем действие в зависимости от контекста
        switch (action) {
            case 'createCharacter':
                this.navigateToSection('characters');
                break;
            case 'createRaid':
                this.navigateToSection('raids');
                break;
            case 'findRaid':
                this.navigateToSection('raids');
                break;
            case 'settings':
                this.navigateToSection('settings');
                break;
            case 'startOnboarding':
                this.startOnboardingFlow();
                break;
            case 'skipOnboarding':
                this.skipOnboarding();
                break;
            default:
                // Пользовательские действия
                this.executeCustomAction(action, context);
        }
    }

    // Навигация к секции
    navigateToSection(section) {
        if (window.navigation && typeof window.navigation.navigateTo === 'function') {
            window.navigation.navigateTo(section);
        } else if (window.location) {
            window.location.hash = `#${section}`;
        }
    }

    // Запуск onboarding
    startOnboardingFlow() {
        console.log('EmptyStateManager: Запуск onboarding');
        // Здесь можно добавить логику пошагового onboarding
        this.notifyModules('onboardingStarted', {});
    }

    // Пропуск onboarding
    skipOnboarding() {
        console.log('EmptyStateManager: Onboarding пропущен');
        this.settings.showOnboarding = false;
        this.saveSettings();
        this.notifyModules('onboardingSkipped', {});
    }

    // Выполнение пользовательских действий
    executeCustomAction(action, context) {
        // Уведомляем другие модули о пользовательском действии
        const customEvent = new CustomEvent('emptyState:customAction', {
            detail: { action, context }
        });
        window.dispatchEvent(customEvent);
    }

    // Уведомление модулей
    notifyModules(event, data) {
        const customEvent = new CustomEvent(`emptyState:${event}`, { detail: data });
        window.dispatchEvent(customEvent);
    }

    // Создание пользовательского пустого состояния
    createCustomEmptyState(section, config) {
        const customState = {
            icon: config.icon || '📋',
            title: config.title || 'Пустое состояние',
            message: config.message || 'Данные не найдены',
            actions: config.actions || [],
            illustration: config.illustration || null
        };

        this.showEmptyState(section, customState);
    }

    // Создание пользовательского onboarding
    createCustomOnboarding(type, config) {
        const customOnboarding = {
            icon: config.icon || '🎯',
            title: config.title || 'Onboarding',
            message: config.message || 'Давайте настроим приложение',
            steps: config.steps || [],
            actions: config.actions || []
        };

        this.showOnboarding(type, customOnboarding);
    }

    // Проверка необходимости показа пустого состояния
    shouldShowEmptyState(section, data) {
        if (!this.settings.showEmptyStates) return false;

        // Проверяем, есть ли данные
        if (data && Array.isArray(data) && data.length > 0) return false;
        if (data && typeof data === 'object' && Object.keys(data).length > 0) return false;

        return true;
    }

    // Автоматическое управление пустыми состояниями
    autoManageEmptyState(section, data, showOnboarding = false) {
        if (this.shouldShowEmptyState(section, data)) {
            this.showEmptyState(section, null, showOnboarding);
        } else {
            this.hideEmptyState(section);
        }
    }

    // Обновление настроек
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.saveSettings();
    }

    // Получение статистики
    getStats() {
        return {
            emptyStates: this.emptyStates.size,
            onboardingStates: this.onboardingStates.size,
            settings: this.settings
        };
    }

    // Очистка всех состояний
    clearAll() {
        this.emptyStates.forEach((element, section) => {
            this.hideEmptyState(section);
        });

        this.onboardingStates.forEach((element, type) => {
            this.hideOnboarding(type);
        });
    }

    // Остановка модуля
    stop() {
        this.clearAll();
        console.log('EmptyStateManager: Остановлен');
    }

    // Перезапуск модуля
    restart() {
        this.stop();
        this.init();
        console.log('EmptyStateManager: Перезапущен');
    }
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    window.emptyStateManager = new EmptyStateManager();
});

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EmptyStateManager;
}