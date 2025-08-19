/**
 * Accessibility Manager
 * Управляет доступностью приложения для всех пользователей
 */

class AccessibilityManager {
    constructor() {
        this.settings = {
            enableAccessibility: true,
            enableScreenReader: true,
            enableKeyboardNavigation: true,
            enableHighContrast: false,
            enableReducedMotion: false,
            enableLargeText: false,
            enableFocusIndicators: true,
            enableARIALabels: true,
            enableSkipLinks: true,
            enableLiveRegions: true
        };
        
        this.currentFocus = null;
        this.focusHistory = [];
        this.liveRegions = new Map();
        this.skipLinks = [];
        this.keyboardShortcuts = new Map();
        
        this.init();
    }

    init() {
        this.loadSettings();
        this.setupAccessibilityFeatures();
        this.setupEventListeners();
        this.createSkipLinks();
        this.setupLiveRegions();
        this.setupKeyboardShortcuts();
        console.log('AccessibilityManager: Инициализирован');
    }

    loadSettings() {
        try {
            const savedSettings = localStorage.getItem('accessibilitySettings');
            if (savedSettings) {
                this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
            }
        } catch (error) {
            console.warn('AccessibilityManager: Ошибка загрузки настроек:', error);
        }
    }

    saveSettings() {
        try {
            localStorage.setItem('accessibilitySettings', JSON.stringify(this.settings));
        } catch (error) {
            console.warn('AccessibilityManager: Ошибка сохранения настроек:', error);
        }
    }

    setupAccessibilityFeatures() {
        // Применяем настройки доступности
        this.applyHighContrast();
        this.applyReducedMotion();
        this.applyLargeText();
        this.applyFocusIndicators();
        
        // Устанавливаем ARIA атрибуты
        if (this.settings.enableARIALabels) {
            this.setupARIALabels();
        }
        
        // Устанавливаем focus management
        if (this.settings.enableKeyboardNavigation) {
            this.setupFocusManagement();
        }
    }

    setupEventListeners() {
        // Глобальные события доступности
        window.addEventListener('accessibility:update', (event) => {
            const { setting, value } = event.detail;
            this.updateSetting(setting, value);
        });

        window.addEventListener('accessibility:toggle', (event) => {
            const { feature } = event.detail;
            this.toggleFeature(feature);
        });

        // Keyboard события
        if (this.settings.enableKeyboardNavigation) {
            this.setupKeyboardEvents();
        }

        // Focus события
        if (this.settings.enableFocusIndicators) {
            this.setupFocusEvents();
        }

        // Screen reader события
        if (this.settings.enableScreenReader) {
            this.setupScreenReaderEvents();
        }
    }

    setupKeyboardEvents() {
        // Tab navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                this.handleTabNavigation(e);
            }
        });

        // Enter и Space для активации элементов
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                this.handleActivationKey(e);
            }
        });

        // Escape для закрытия модальных окон
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.handleEscapeKey(e);
            }
        });

        // Arrow keys для навигации
        document.addEventListener('keydown', (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                this.handleArrowKeys(e);
            }
        });
    }

    setupFocusEvents() {
        // Отслеживание focus
        document.addEventListener('focusin', (e) => {
            this.handleFocusIn(e);
        });

        document.addEventListener('focusout', (e) => {
            this.handleFocusOut(e);
        });

        // Focus visible для keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
    }

    setupScreenReaderEvents() {
        // Live regions для screen readers
        document.addEventListener('DOMContentLoaded', () => {
            this.announceToScreenReader('Приложение загружено и готово к использованию');
        });

        // Уведомления о важных событиях
        window.addEventListener('toast:shown', (event) => {
            const { type, title, message } = event.detail;
            this.announceToScreenReader(`${title}: ${message}`);
        });

        window.addEventListener('navigation:changed', (event) => {
            const { page } = event.detail;
            this.announceToScreenReader(`Переход на страницу: ${page}`);
        });
    }

    setupARIALabels() {
        // Добавляем ARIA labels к элементам без текста
        const elementsWithoutText = document.querySelectorAll('button:not([aria-label]):empty, a:not([aria-label]):empty');
        
        elementsWithoutText.forEach(element => {
            if (element.tagName === 'BUTTON') {
                element.setAttribute('aria-label', 'Кнопка');
            } else if (element.tagName === 'A') {
                element.setAttribute('aria-label', 'Ссылка');
            }
        });

        // Добавляем ARIA labels к иконкам
        const iconElements = document.querySelectorAll('.icon, [class*="icon"], [class*="Icon"]');
        iconElements.forEach(icon => {
            if (!icon.getAttribute('aria-label') && !icon.getAttribute('aria-hidden')) {
                const iconText = icon.textContent || icon.alt || 'Иконка';
                icon.setAttribute('aria-label', iconText);
            }
        });

        // Добавляем ARIA labels к формам
        const formElements = document.querySelectorAll('input, select, textarea');
        formElements.forEach(input => {
            if (!input.getAttribute('aria-label') && !input.getAttribute('aria-labelledby')) {
                const label = input.previousElementSibling;
                if (label && label.tagName === 'LABEL') {
                    input.setAttribute('aria-labelledby', label.id || this.generateId(label));
                }
            }
        });
    }

    setupFocusManagement() {
        // Trap focus в модальных окнах
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                this.handleFocusTrap(e);
            }
        });

        // Сохранение и восстановление focus
        document.addEventListener('focusin', (e) => {
            this.saveFocus(e.target);
        });

        // Автоматический focus на важные элементы
        this.setupAutoFocus();
    }

    setupAutoFocus() {
        // Focus на первый интерактивный элемент при загрузке страницы
        document.addEventListener('DOMContentLoaded', () => {
            const firstFocusable = this.getFirstFocusableElement();
            if (firstFocusable) {
                firstFocusable.focus();
            }
        });

        // Focus на основной контент при навигации
        window.addEventListener('navigation:changed', () => {
            const mainContent = document.querySelector('main, .main-content, #mainContent');
            if (mainContent) {
                mainContent.focus();
            }
        });
    }

    createSkipLinks() {
        if (!this.settings.enableSkipLinks) return;

        const skipLinksContainer = document.createElement('div');
        skipLinksContainer.className = 'skip-links';
        skipLinksContainer.setAttribute('role', 'navigation');
        skipLinksContainer.setAttribute('aria-label', 'Пропустить навигацию');
        
        const skipLinks = [
            { href: '#mainContent', text: 'Перейти к основному содержимому' },
            { href: '#navigation', text: 'Перейти к навигации' },
            { href: '#search', text: 'Перейти к поиску' }
        ];

        skipLinks.forEach(link => {
            const skipLink = document.createElement('a');
            skipLink.href = link.href;
            skipLink.textContent = link.text;
            skipLink.className = 'skip-link';
            skipLink.setAttribute('tabindex', '0');
            
            skipLinksContainer.appendChild(skipLink);
            this.skipLinks.push(skipLink);
        });

        document.body.insertBefore(skipLinksContainer, document.body.firstChild);
    }

    setupLiveRegions() {
        if (!this.settings.enableLiveRegions) return;

        // Создаем live regions для разных типов уведомлений
        const liveRegions = [
            { id: 'status', type: 'status', label: 'Статус' },
            { id: 'alert', type: 'alert', label: 'Уведомления' },
            { id: 'log', type: 'log', label: 'Лог событий' },
            { id: 'polite', type: 'polite', label: 'Информация' }
        ];

        liveRegions.forEach(region => {
            const liveRegion = document.createElement('div');
            liveRegion.id = region.id;
            liveRegion.setAttribute('aria-live', region.type);
            liveRegion.setAttribute('aria-label', region.label);
            liveRegion.className = 'live-region';
            liveRegion.style.cssText = 'position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;';
            
            document.body.appendChild(liveRegion);
            this.liveRegions.set(region.id, liveRegion);
        });
    }

    setupKeyboardShortcuts() {
        // Основные keyboard shortcuts
        const shortcuts = [
            { key: 'h', description: 'Перейти на главную', action: () => this.navigateTo('dashboard') },
            { key: 'c', description: 'Перейти к персонажам', action: () => this.navigateTo('characters') },
            { key: 'r', description: 'Перейти к рейдам', action: () => this.navigateTo('raids') },
            { key: 't', description: 'Перейти к инструментам', action: () => this.navigateTo('tools') },
            { key: 's', description: 'Перейти к настройкам', action: () => this.navigateTo('settings') },
            { key: '?', description: 'Показать справку', action: () => this.showHelp() },
            { key: 'm', description: 'Переключить тему', action: () => this.toggleTheme() }
        ];

        shortcuts.forEach(shortcut => {
            this.keyboardShortcuts.set(shortcut.key, shortcut);
        });

        // Обработчик keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) return; // Игнорируем Ctrl/Cmd комбинации
            
            const shortcut = this.keyboardShortcuts.get(e.key);
            if (shortcut) {
                e.preventDefault();
                shortcut.action();
                this.announceToScreenReader(`Клавиша ${e.key}: ${shortcut.description}`);
            }
        });
    }

    // Обработчики событий
    handleTabNavigation(e) {
        const focusableElements = this.getFocusableElements();
        const currentIndex = focusableElements.indexOf(document.activeElement);
        
        if (e.shiftKey) {
            // Shift + Tab - назад
            const prevIndex = currentIndex > 0 ? currentIndex - 1 : focusableElements.length - 1;
            focusableElements[prevIndex].focus();
        } else {
            // Tab - вперед
            const nextIndex = currentIndex < focusableElements.length - 1 ? currentIndex + 1 : 0;
            focusableElements[nextIndex].focus();
        }
    }

    handleActivationKey(e) {
        const target = e.target;
        
        if (target.tagName === 'BUTTON' || target.tagName === 'A' || target.role === 'button') {
            e.preventDefault();
            target.click();
        }
    }

    handleEscapeKey(e) {
        // Закрываем модальные окна
        const modals = document.querySelectorAll('.modal, .dialog, .popup');
        modals.forEach(modal => {
            if (modal.style.display !== 'none') {
                const closeButton = modal.querySelector('.close, .modal-close, [data-close]');
                if (closeButton) {
                    closeButton.click();
                }
            }
        });

        // Закрываем мобильное меню
        if (window.responsiveManager) {
            window.responsiveManager.closeMobileMenu();
        }
    }

    handleArrowKeys(e) {
        const target = e.target;
        
        // Навигация по спискам
        if (target.role === 'listbox' || target.role === 'grid' || target.role === 'tree') {
            this.handleListNavigation(e);
        }
        
        // Навигация по меню
        if (target.role === 'menuitem') {
            this.handleMenuNavigation(e);
        }
    }

    handleListNavigation(e) {
        const list = e.target.closest('[role="listbox"], [role="grid"], [role="tree"]');
        if (!list) return;

        const items = Array.from(list.querySelectorAll('[role="option"], [role="gridcell"], [role="treeitem"]'));
        const currentIndex = items.indexOf(e.target);
        
        let nextIndex = currentIndex;
        
        switch (e.key) {
            case 'ArrowUp':
                nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
                break;
            case 'ArrowDown':
                nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
                break;
            case 'ArrowLeft':
                // Для tree - сворачиваем
                if (e.target.role === 'treeitem') {
                    this.toggleTreeItem(e.target);
                }
                break;
            case 'ArrowRight':
                // Для tree - разворачиваем
                if (e.target.role === 'treeitem') {
                    this.expandTreeItem(e.target);
                }
                break;
        }
        
        if (nextIndex !== currentIndex) {
            items[nextIndex].focus();
        }
    }

    handleMenuNavigation(e) {
        const menu = e.target.closest('[role="menu"]');
        if (!menu) return;

        const items = Array.from(menu.querySelectorAll('[role="menuitem"]'));
        const currentIndex = items.indexOf(e.target);
        
        let nextIndex = currentIndex;
        
        switch (e.key) {
            case 'ArrowUp':
                nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
                break;
            case 'ArrowDown':
                nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
                break;
        }
        
        if (nextIndex !== currentIndex) {
            items[nextIndex].focus();
        }
    }

    handleFocusIn(e) {
        this.currentFocus = e.target;
        this.saveFocus(e.target);
        
        // Добавляем focus indicator
        if (this.settings.enableFocusIndicators) {
            e.target.classList.add('focus-visible');
        }
        
        // Обновляем ARIA attributes
        this.updateARIAOnFocus(e.target);
    }

    handleFocusOut(e) {
        // Убираем focus indicator
        if (this.settings.enableFocusIndicators) {
            e.target.classList.remove('focus-visible');
        }
    }

    handleFocusTrap(e) {
        // Trap focus в модальных окнах
        const modal = document.querySelector('.modal:not([style*="display: none"]), .dialog:not([style*="display: none"])');
        if (!modal) return;

        const focusableElements = this.getFocusableElements(modal);
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
            // Shift + Tab на первом элементе
            e.preventDefault();
            lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
            // Tab на последнем элементе
            e.preventDefault();
            firstElement.focus();
        }
    }

    // Утилиты
    getFocusableElements(container = document) {
        const focusableSelectors = [
            'button:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            'a[href]',
            '[tabindex]:not([tabindex="-1"])',
            '[contenteditable="true"]',
            '[role="button"]',
            '[role="link"]',
            '[role="menuitem"]',
            '[role="option"]',
            '[role="tab"]'
        ];

        return Array.from(container.querySelectorAll(focusableSelectors.join(', ')));
    }

    getFirstFocusableElement(container = document) {
        const focusableElements = this.getFocusableElements(container);
        return focusableElements[0] || null;
    }

    saveFocus(element) {
        this.focusHistory.push(element);
        if (this.focusHistory.length > 10) {
            this.focusHistory.shift();
        }
    }

    restoreFocus() {
        const previousFocus = this.focusHistory.pop();
        if (previousFocus && previousFocus.focus) {
            previousFocus.focus();
        }
    }

    updateARIAOnFocus(element) {
        // Обновляем ARIA attributes при focus
        if (element.role === 'button' && !element.getAttribute('aria-pressed')) {
            element.setAttribute('aria-pressed', 'false');
        }
        
        if (element.role === 'tab' && !element.getAttribute('aria-selected')) {
            element.setAttribute('aria-selected', 'false');
        }
    }

    toggleTreeItem(item) {
        const expanded = item.getAttribute('aria-expanded') === 'true';
        item.setAttribute('aria-expanded', !expanded);
        
        // Показываем/скрываем дочерние элементы
        const children = item.querySelector('[role="group"]');
        if (children) {
            children.style.display = expanded ? 'none' : 'block';
        }
    }

    expandTreeItem(item) {
        item.setAttribute('aria-expanded', 'true');
        
        // Показываем дочерние элементы
        const children = item.querySelector('[role="group"]');
        if (children) {
            children.style.display = 'block';
        }
    }

    // Применение настроек доступности
    applyHighContrast() {
        if (this.settings.enableHighContrast) {
            document.body.classList.add('high-contrast');
        } else {
            document.body.classList.remove('high-contrast');
        }
    }

    applyReducedMotion() {
        if (this.settings.enableReducedMotion) {
            document.body.classList.add('reduced-motion');
        } else {
            document.body.classList.remove('reduced-motion');
        }
    }

    applyLargeText() {
        if (this.settings.enableLargeText) {
            document.body.classList.add('large-text');
        } else {
            document.body.classList.remove('large-text');
        }
    }

    applyFocusIndicators() {
        if (this.settings.enableFocusIndicators) {
            document.body.classList.add('focus-indicators');
        } else {
            document.body.classList.remove('focus-indicators');
        }
    }

    // Screen reader announcements
    announceToScreenReader(message, priority = 'polite') {
        if (!this.settings.enableScreenReader) return;

        const liveRegion = this.liveRegions.get(priority) || this.liveRegions.get('polite');
        if (liveRegion) {
            liveRegion.textContent = message;
            
            // Очищаем через некоторое время
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 1000);
        }
    }

    // Навигация
    navigateTo(page) {
        if (window.navigation && typeof window.navigation.navigateTo === 'function') {
            window.navigation.navigateTo(page);
        } else if (window.location) {
            window.location.hash = `#${page}`;
        }
    }

    // Показ справки
    showHelp() {
        const helpContent = `
            <div class="accessibility-help">
                <h2>Клавиатурные сокращения</h2>
                <ul>
                    <li><kbd>H</kbd> - Главная страница</li>
                    <li><kbd>C</kbd> - Персонажи</li>
                    <li><kbd>R</kbd> - Рейды</li>
                    <li><kbd>T</kbd> - Инструменты</li>
                    <li><kbd>S</kbd> - Настройки</li>
                    <li><kbd>?</kbd> - Справка</li>
                    <li><kbd>M</kbd> - Переключить тему</li>
                </ul>
                <h2>Навигация</h2>
                <ul>
                    <li><kbd>Tab</kbd> - Следующий элемент</li>
                    <li><kbd>Shift + Tab</kbd> - Предыдущий элемент</li>
                    <li><kbd>Enter</kbd> или <kbd>Space</kbd> - Активировать</li>
                    <li><kbd>Escape</kbd> - Закрыть/Отменить</li>
                    <li><kbd>Стрелки</kbd> - Навигация по спискам</li>
                </ul>
            </div>
        `;

        // Показываем справку в toast или модальном окне
        if (window.toastManager) {
            window.toastManager.info('Справка по доступности', helpContent, 0);
        }
    }

    // Переключение темы
    toggleTheme() {
        if (window.app && typeof window.app.toggleTheme === 'function') {
            window.app.toggleTheme();
        }
    }

    // Обновление настроек
    updateSetting(setting, value) {
        if (this.settings.hasOwnProperty(setting)) {
            this.settings[setting] = value;
            this.saveSettings();
            
            // Применяем изменения
            switch (setting) {
                case 'enableHighContrast':
                    this.applyHighContrast();
                    break;
                case 'enableReducedMotion':
                    this.applyReducedMotion();
                    break;
                case 'enableLargeText':
                    this.applyLargeText();
                    break;
                case 'enableFocusIndicators':
                    this.applyFocusIndicators();
                    break;
            }
        }
    }

    // Переключение функций
    toggleFeature(feature) {
        if (this.settings.hasOwnProperty(feature)) {
            this.settings[feature] = !this.settings[feature];
            this.updateSetting(feature, this.settings[feature]);
        }
    }

    // Генерация ID
    generateId(element) {
        if (element.id) return element.id;
        
        const id = `accessibility-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        element.id = id;
        return id;
    }

    // Получение информации о доступности
    getAccessibilityInfo() {
        return {
            settings: this.settings,
            focusableElements: this.getFocusableElements().length,
            liveRegions: this.liveRegions.size,
            skipLinks: this.skipLinks.length,
            keyboardShortcuts: this.keyboardShortcuts.size,
            currentFocus: this.currentFocus,
            focusHistory: this.focusHistory.length
        };
    }

    // Остановка модуля
    stop() {
        // Убираем все созданные элементы
        this.skipLinks.forEach(link => link.remove());
        this.liveRegions.forEach(region => region.remove());
        
        console.log('AccessibilityManager: Остановлен');
    }

    // Перезапуск модуля
    restart() {
        this.stop();
        this.init();
        console.log('AccessibilityManager: Перезапущен');
    }
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    window.accessibilityManager = new AccessibilityManager();
});

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AccessibilityManager;
}