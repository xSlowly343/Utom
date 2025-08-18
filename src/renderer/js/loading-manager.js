/**
 * Loading Manager
 * Управляет состоянием загрузки для всех модулей приложения
 */

class LoadingManager {
    constructor() {
        this.loadingStates = new Map();
        this.loadingOverlays = new Map();
        this.loadingSpinners = new Map();
        this.defaultLoadingText = 'Загрузка...';
        
        this.init();
    }

    init() {
        this.setupGlobalLoading();
        this.createLoadingStyles();
        console.log('LoadingManager: Инициализирован');
    }

    setupGlobalLoading() {
        // Глобальный индикатор загрузки для всего приложения
        this.createGlobalLoadingOverlay();
        
        // Обработчик для показа/скрытия глобальной загрузки
        window.addEventListener('showGlobalLoading', (event) => {
            this.showGlobalLoading(event.detail?.text || this.defaultLoadingText);
        });
        
        window.addEventListener('hideGlobalLoading', () => {
            this.hideGlobalLoading();
        });
    }

    createGlobalLoadingOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'globalLoadingOverlay';
        overlay.className = 'loading-overlay global-loading';
        overlay.style.display = 'none';
        
        overlay.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner large"></div>
                <div class="loading-text" id="globalLoadingText">${this.defaultLoadingText}</div>
                <div class="loading-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" id="globalLoadingProgress"></div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        this.loadingOverlays.set('global', overlay);
    }

    createLoadingStyles() {
        // Добавляем дополнительные стили для загрузки
        const style = document.createElement('style');
        style.textContent = `
            .global-loading .loading-content {
                text-align: center;
                background: rgba(0, 0, 0, 0.8);
                padding: 2rem;
                border-radius: 1rem;
                backdrop-filter: blur(10px);
            }
            
            .global-loading .loading-spinner.large {
                width: 80px;
                height: 80px;
                border-width: 6px;
                margin: 0 auto 1rem;
            }
            
            .global-loading .loading-progress {
                margin-top: 1rem;
                width: 300px;
            }
            
            .global-loading .progress-bar {
                width: 100%;
                height: 8px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 4px;
                overflow: hidden;
            }
            
            .global-loading .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, var(--primary-color), var(--accent-color));
                border-radius: 4px;
                transition: width 0.3s ease;
                width: 0%;
            }
        `;
        
        document.head.appendChild(style);
    }

    // Глобальная загрузка
    showGlobalLoading(text = this.defaultLoadingText, progress = 0) {
        const overlay = this.loadingOverlays.get('global');
        if (overlay) {
            const textElement = overlay.querySelector('#globalLoadingText');
            const progressElement = overlay.querySelector('#globalLoadingProgress');
            
            if (textElement) textElement.textContent = text;
            if (progressElement) progressElement.style.width = `${progress}%`;
            
            overlay.style.display = 'flex';
            overlay.classList.add('active');
        }
    }

    hideGlobalLoading() {
        const overlay = this.loadingOverlays.get('global');
        if (overlay) {
            overlay.classList.remove('active');
            setTimeout(() => {
                overlay.style.display = 'none';
            }, 300);
        }
    }

    updateGlobalLoadingProgress(progress) {
        const overlay = this.loadingOverlays.get('global');
        if (overlay) {
            const progressElement = overlay.querySelector('#globalLoadingProgress');
            if (progressElement) {
                progressElement.style.width = `${Math.min(100, Math.max(0, progress))}%`;
            }
        }
    }

    // Загрузка для конкретных модулей
    showModuleLoading(moduleName, text = 'Загрузка...', options = {}) {
        const {
            showOverlay = false,
            showSpinner = true,
            showProgress = false,
            progress = 0,
            duration = null
        } = options;

        const loadingState = {
            module: moduleName,
            text: text,
            progress: progress,
            startTime: Date.now(),
            duration: duration,
            active: true
        };

        this.loadingStates.set(moduleName, loadingState);

        // Показываем спиннер в заголовке модуля
        if (showSpinner) {
            this.showModuleSpinner(moduleName, text);
        }

        // Показываем оверлей если нужно
        if (showOverlay) {
            this.showModuleOverlay(moduleName, text, options);
        }

        // Автоматически скрываем через duration если указан
        if (duration) {
            setTimeout(() => {
                this.hideModuleLoading(moduleName);
            }, duration);
        }

        return loadingState;
    }

    hideModuleLoading(moduleName) {
        const loadingState = this.loadingStates.get(moduleName);
        if (loadingState) {
            loadingState.active = false;
            this.loadingStates.delete(moduleName);
        }

        // Скрываем спиннер
        this.hideModuleSpinner(moduleName);

        // Скрываем оверлей
        this.hideModuleOverlay(moduleName);
    }

    updateModuleLoading(moduleName, updates) {
        const loadingState = this.loadingStates.get(moduleName);
        if (loadingState) {
            Object.assign(loadingState, updates);
            
            // Обновляем UI
            if (updates.text) {
                this.updateModuleSpinnerText(moduleName, updates.text);
            }
            
            if (updates.progress !== undefined) {
                this.updateModuleProgress(moduleName, updates.progress);
            }
        }
    }

    // Спиннеры для модулей
    showModuleSpinner(moduleName, text) {
        const moduleElement = document.querySelector(`[data-module="${moduleName}"]`) || 
                             document.getElementById(moduleName) ||
                             document.querySelector(`.${moduleName}-container`);
        
        if (moduleElement) {
            // Создаем спиннер
            const spinner = document.createElement('div');
            spinner.className = 'module-loading-spinner';
            spinner.innerHTML = `
                <div class="spinner-content">
                    <div class="spinner-icon">⏳</div>
                    <div class="spinner-text">${text}</div>
                </div>
            `;
            
            // Добавляем в модуль
            moduleElement.appendChild(spinner);
            this.loadingSpinners.set(moduleName, spinner);
            
            // Добавляем класс загрузки
            moduleElement.classList.add('loading');
        }
    }

    hideModuleSpinner(moduleName) {
        const spinner = this.loadingSpinners.get(moduleName);
        if (spinner) {
            spinner.remove();
            this.loadingSpinners.delete(moduleName);
        }

        // Убираем класс загрузки
        const moduleElement = document.querySelector(`[data-module="${moduleName}"]`) || 
                             document.getElementById(moduleName) ||
                             document.querySelector(`.${moduleName}-container`);
        
        if (moduleElement) {
            moduleElement.classList.remove('loading');
        }
    }

    updateModuleSpinnerText(moduleName, text) {
        const spinner = this.loadingSpinners.get(moduleName);
        if (spinner) {
            const textElement = spinner.querySelector('.spinner-text');
            if (textElement) {
                textElement.textContent = text;
            }
        }
    }

    // Оверлеи для модулей
    showModuleOverlay(moduleName, text, options = {}) {
        const moduleElement = document.querySelector(`[data-module="${moduleName}"]`) || 
                             document.getElementById(moduleName) ||
                             document.querySelector(`.${moduleName}-container`);
        
        if (moduleElement) {
            const overlay = document.createElement('div');
            overlay.className = 'module-loading-overlay';
            overlay.innerHTML = `
                <div class="overlay-content">
                    <div class="overlay-spinner"></div>
                    <div class="overlay-text">${text}</div>
                    ${options.showProgress ? '<div class="overlay-progress"><div class="progress-fill"></div></div>' : ''}
                </div>
            `;
            
            moduleElement.appendChild(overlay);
            this.loadingOverlays.set(moduleName, overlay);
        }
    }

    hideModuleOverlay(moduleName) {
        const overlay = this.loadingOverlays.get(moduleName);
        if (overlay) {
            overlay.remove();
            this.loadingOverlays.delete(moduleName);
        }
    }

    updateModuleProgress(moduleName, progress) {
        const overlay = this.loadingOverlays.get(moduleName);
        if (overlay) {
            const progressElement = overlay.querySelector('.progress-fill');
            if (progressElement) {
                progressElement.style.width = `${Math.min(100, Math.max(0, progress))}%`;
            }
        }
    }

    // Загрузка для страниц
    showPageLoading(pageName, text = 'Загрузка страницы...') {
        const pageElement = document.getElementById(pageName);
        if (pageElement) {
            // Показываем спиннер загрузки страницы
            const loadingElement = document.createElement('div');
            loadingElement.className = 'page-loading';
            loadingElement.innerHTML = `
                <div class="page-loading-content">
                    <div class="page-loading-spinner"></div>
                    <div class="page-loading-text">${text}</div>
                </div>
            `;
            
            pageElement.appendChild(loadingElement);
            
            // Добавляем класс загрузки
            pageElement.classList.add('loading');
            
            return loadingElement;
        }
        return null;
    }

    hidePageLoading(pageName) {
        const pageElement = document.getElementById(pageName);
        if (pageElement) {
            // Убираем спиннер загрузки
            const loadingElement = pageElement.querySelector('.page-loading');
            if (loadingElement) {
                loadingElement.remove();
            }
            
            // Убираем класс загрузки
            pageElement.classList.remove('loading');
        }
    }

    // Загрузка для форм
    showFormLoading(formElement, text = 'Отправка...') {
        if (formElement) {
            // Добавляем спиннер к кнопке отправки
            const submitButton = formElement.querySelector('button[type="submit"]') || 
                                formElement.querySelector('.btn-primary') ||
                                formElement.querySelector('.submit-btn');
            
            if (submitButton) {
                const originalText = submitButton.textContent;
                submitButton.disabled = true;
                submitButton.innerHTML = `
                    <span class="spinner-inline"></span>
                    ${text}
                `;
                
                // Сохраняем оригинальный текст для восстановления
                submitButton.dataset.originalText = originalText;
                
                return () => {
                    submitButton.disabled = false;
                    submitButton.textContent = originalText;
                };
            }
        }
        return null;
    }

    hideFormLoading(formElement) {
        if (formElement) {
            const submitButton = formElement.querySelector('button[type="submit"]') || 
                                formElement.querySelector('.btn-primary') ||
                                formElement.querySelector('.submit-btn');
            
            if (submitButton && submitButton.dataset.originalText) {
                submitButton.disabled = false;
                submitButton.textContent = submitButton.dataset.originalText;
                delete submitButton.dataset.originalText;
            }
        }
    }

    // Загрузка для кнопок
    showButtonLoading(buttonElement, text = 'Загрузка...') {
        if (buttonElement) {
            const originalText = buttonElement.textContent;
            buttonElement.disabled = true;
            buttonElement.innerHTML = `
                <span class="spinner-inline"></span>
                ${text}
            `;
            
            buttonElement.dataset.originalText = originalText;
            
            return () => {
                buttonElement.disabled = false;
                buttonElement.textContent = originalText;
            };
        }
        return null;
    }

    hideButtonLoading(buttonElement) {
        if (buttonElement && buttonElement.dataset.originalText) {
            buttonElement.disabled = false;
            buttonElement.textContent = buttonElement.dataset.originalText;
            delete buttonElement.dataset.originalText;
        }
    }

    // Загрузка для таблиц
    showTableLoading(tableElement, text = 'Загрузка данных...') {
        if (tableElement) {
            const loadingRow = document.createElement('tr');
            loadingRow.className = 'table-loading-row';
            loadingRow.innerHTML = `
                <td colspan="100%" class="table-loading-cell">
                    <div class="table-loading-content">
                        <div class="table-loading-spinner"></div>
                        <div class="table-loading-text">${text}</div>
                    </div>
                </td>
            `;
            
            const tbody = tableElement.querySelector('tbody');
            if (tbody) {
                tbody.appendChild(loadingRow);
            }
            
            return loadingRow;
        }
        return null;
    }

    hideTableLoading(tableElement) {
        if (tableElement) {
            const loadingRow = tableElement.querySelector('.table-loading-row');
            if (loadingRow) {
                loadingRow.remove();
            }
        }
    }

    // Утилиты
    isLoading(moduleName) {
        const loadingState = this.loadingStates.get(moduleName);
        return loadingState ? loadingState.active : false;
    }

    getLoadingState(moduleName) {
        return this.loadingStates.get(moduleName);
    }

    getAllLoadingStates() {
        const states = {};
        this.loadingStates.forEach((state, moduleName) => {
            states[moduleName] = state;
        });
        return states;
    }

    // Очистка всех состояний загрузки
    clearAllLoading() {
        this.loadingStates.clear();
        
        // Скрываем все спиннеры
        this.loadingSpinners.forEach((spinner, moduleName) => {
            this.hideModuleSpinner(moduleName);
        });
        
        // Скрываем все оверлеи
        this.loadingOverlays.forEach((overlay, moduleName) => {
            if (moduleName !== 'global') {
                this.hideModuleOverlay(moduleName);
            }
        });
        
        // Скрываем глобальную загрузку
        this.hideGlobalLoading();
    }

    // Создание skeleton экранов
    createSkeleton(container, skeletonType = 'default', count = 1) {
        const skeletons = [];
        
        for (let i = 0; i < count; i++) {
            const skeleton = document.createElement('div');
            skeleton.className = `skeleton skeleton-${skeletonType}`;
            
            switch (skeletonType) {
                case 'card':
                    skeleton.innerHTML = `
                        <div class="skeleton-header"></div>
                        <div class="skeleton-content">
                            <div class="skeleton-line"></div>
                            <div class="skeleton-line"></div>
                            <div class="skeleton-line short"></div>
                        </div>
                    `;
                    break;
                case 'table':
                    skeleton.innerHTML = `
                        <div class="skeleton-row">
                            <div class="skeleton-cell"></div>
                            <div class="skeleton-cell"></div>
                            <div class="skeleton-cell"></div>
                        </div>
                    `;
                    break;
                case 'list':
                    skeleton.innerHTML = `
                        <div class="skeleton-item">
                            <div class="skeleton-avatar"></div>
                            <div class="skeleton-content">
                                <div class="skeleton-line"></div>
                                <div class="skeleton-line short"></div>
                            </div>
                        </div>
                    `;
                    break;
                default:
                    skeleton.innerHTML = `
                        <div class="skeleton-line"></div>
                        <div class="skeleton-line"></div>
                        <div class="skeleton-line short"></div>
                    `;
            }
            
            container.appendChild(skeleton);
            skeletons.push(skeleton);
        }
        
        return skeletons;
    }

    removeSkeletons(container) {
        const skeletons = container.querySelectorAll('.skeleton');
        skeletons.forEach(skeleton => skeleton.remove());
    }

    // Остановка модуля
    stop() {
        this.clearAllLoading();
        console.log('LoadingManager: Остановлен');
    }

    // Перезапуск модуля
    restart() {
        this.stop();
        this.init();
        console.log('LoadingManager: Перезапущен');
    }
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    window.loadingManager = new LoadingManager();
});

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LoadingManager;
}