/**
 * Toast Notification Manager
 * Система уведомлений для обратной связи с пользователем
 */

class ToastManager {
    constructor() {
        this.toasts = [];
        this.maxToasts = 5;
        this.defaultDuration = 5000;
        this.container = null;
        this.settings = {
            position: 'top-right',
            duration: 5000,
            sound: true,
            animation: true,
            maxVisible: 5
        };
        
        this.init();
    }

    init() {
        this.loadSettings();
        this.createContainer();
        this.setupEventListeners();
        console.log('ToastManager: Инициализирован');
    }

    loadSettings() {
        try {
            const savedSettings = localStorage.getItem('toastSettings');
            if (savedSettings) {
                this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
            }
        } catch (error) {
            console.warn('ToastManager: Ошибка загрузки настроек:', error);
        }
    }

    saveSettings() {
        try {
            localStorage.setItem('toastSettings', JSON.stringify(this.settings));
        } catch (error) {
            console.warn('ToastManager: Ошибка сохранения настроек:', error);
        }
    }

    createContainer() {
        this.container = document.createElement('div');
        this.container.id = 'toastContainer';
        this.container.className = `toast-container toast-${this.settings.position}`;
        document.body.appendChild(this.container);
    }

    setupEventListeners() {
        // Глобальные события для показа уведомлений
        window.addEventListener('showToast', (event) => {
            const { type, title, message, duration, actions } = event.detail;
            this.show(type, title, message, duration, actions);
        });

        window.addEventListener('showSuccess', (event) => {
            const { title, message, duration, actions } = event.detail;
            this.success(title, message, duration, actions);
        });

        window.addEventListener('showError', (event) => {
            const { title, message, duration, actions } = event.detail;
            this.error(title, message, duration, actions);
        });

        window.addEventListener('showWarning', (event) => {
            const { title, message, duration, actions } = event.detail;
            this.warning(title, message, duration, actions);
        });

        window.addEventListener('showInfo', (event) => {
            const { title, message, duration, actions } = event.detail;
            this.info(title, message, duration, actions);
        });
    }

    // Основные методы показа уведомлений
    show(type = 'info', title, message, duration = null, actions = []) {
        const toast = this.createToast(type, title, message, duration, actions);
        this.addToast(toast);
        return toast;
    }

    success(title, message, duration = null, actions = []) {
        return this.show('success', title, message, duration, actions);
    }

    error(title, message, duration = null, actions = []) {
        return this.show('error', title, message, duration, actions);
    }

    warning(title, message, duration = null, actions = []) {
        return this.show('warning', title, message, duration, actions);
    }

    info(title, message, duration = null, actions = []) {
        return this.show('info', title, message, duration, actions);
    }

    createToast(type, title, message, duration, actions) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.dataset.type = type;
        toast.dataset.timestamp = Date.now();
        
        const durationMs = duration || this.settings.duration;
        
        toast.innerHTML = `
            <div class="toast-header">
                <div class="toast-icon">
                    ${this.getTypeIcon(type)}
                </div>
                <div class="toast-content">
                    ${title ? `<div class="toast-title">${title}</div>` : ''}
                    ${message ? `<div class="toast-message">${message}</div>` : ''}
                </div>
                <button class="toast-close" aria-label="Закрыть уведомление">×</button>
            </div>
            ${actions.length > 0 ? `
                <div class="toast-actions">
                    ${actions.map(action => `
                        <button class="btn btn-sm ${action.class || 'btn-secondary'}" 
                                onclick="this.closest('.toast').toastAction('${action.name}')">
                            ${action.icon || ''} ${action.text}
                        </button>
                    `).join('')}
                </div>
            ` : ''}
            ${durationMs > 0 ? `
                <div class="toast-progress">
                    <div class="progress-bar">
                        <div class="progress-fill"></div>
                    </div>
                </div>
            ` : ''}
        `;

        // Добавляем обработчики событий
        this.setupToastEventListeners(toast, durationMs);
        
        // Добавляем методы к элементу
        toast.toastAction = (actionName) => this.handleToastAction(toast, actionName);
        toast.updateProgress = (progress) => this.updateToastProgress(toast, progress);
        toast.extend = (additionalTime) => this.extendToast(toast, additionalTime);

        return toast;
    }

    getTypeIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️',
            loading: '⏳'
        };
        return icons[type] || icons.info;
    }

    setupToastEventListeners(toast, duration) {
        // Кнопка закрытия
        const closeBtn = toast.querySelector('.toast-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.removeToast(toast));
        }

        // Автоматическое скрытие
        if (duration > 0) {
            this.startToastTimer(toast, duration);
        }

        // Пауза при наведении
        toast.addEventListener('mouseenter', () => this.pauseToastTimer(toast));
        toast.addEventListener('mouseleave', () => this.resumeToastTimer(toast));

        // Клик по уведомлению (если нет действий)
        const actions = toast.querySelector('.toast-actions');
        if (!actions) {
            toast.addEventListener('click', () => this.removeToast(toast));
        }
    }

    startToastTimer(toast, duration) {
        const progressBar = toast.querySelector('.progress-fill');
        if (progressBar) {
            const startTime = Date.now();
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(100, (elapsed / duration) * 100);
                
                progressBar.style.width = `${100 - progress}%`;
                
                if (progress < 100 && !toast.dataset.paused) {
                    toast.timerId = requestAnimationFrame(animate);
                }
            };
            
            toast.timerId = requestAnimationFrame(animate);
        }

        // Таймер для скрытия
        toast.hideTimerId = setTimeout(() => {
            this.removeToast(toast);
        }, duration);
    }

    pauseToastTimer(toast) {
        if (toast.timerId) {
            cancelAnimationFrame(toast.timerId);
            toast.dataset.paused = 'true';
        }
        if (toast.hideTimerId) {
            clearTimeout(toast.hideTimerId);
        }
    }

    resumeToastTimer(toast) {
        if (toast.dataset.paused) {
            delete toast.dataset.paused;
            const remainingTime = this.getRemainingTime(toast);
            if (remainingTime > 0) {
                this.startToastTimer(toast, remainingTime);
            }
        }
    }

    getRemainingTime(toast) {
        const progressBar = toast.querySelector('.progress-fill');
        if (progressBar) {
            const progress = parseFloat(progressBar.style.width) || 100;
            return (progress / 100) * this.settings.duration;
        }
        return 0;
    }

    addToast(toast) {
        // Ограничиваем количество видимых уведомлений
        if (this.toasts.length >= this.settings.maxVisible) {
            this.removeToast(this.toasts[0]);
        }

        this.toasts.push(toast);
        this.container.appendChild(toast);

        // Анимация появления
        if (this.settings.animation) {
            requestAnimationFrame(() => {
                toast.classList.add('show');
            });
        }

        // Звуковое уведомление
        if (this.settings.sound) {
            this.playNotificationSound(toast.dataset.type);
        }

        // Уведомляем другие модули
        this.notifyModules('toastShown', { toast, type: toast.dataset.type });
    }

    removeToast(toast) {
        if (toast.timerId) {
            cancelAnimationFrame(toast.timerId);
        }
        if (toast.hideTimerId) {
            clearTimeout(toast.hideTimerId);
        }

        // Анимация исчезновения
        if (this.settings.animation) {
            toast.classList.add('hiding');
            setTimeout(() => {
                this.removeToastElement(toast);
            }, 300);
        } else {
            this.removeToastElement(toast);
        }
    }

    removeToastElement(toast) {
        const index = this.toasts.indexOf(toast);
        if (index > -1) {
            this.toasts.splice(index, 1);
        }
        
        if (toast.parentElement) {
            toast.remove();
        }

        // Уведомляем другие модули
        this.notifyModules('toastHidden', { toast, type: toast.dataset.type });
    }

    // Дополнительные методы для уведомлений
    handleToastAction(toast, actionName) {
        // Уведомляем другие модули о действии
        this.notifyModules('toastAction', { toast, action: actionName });
        
        // Закрываем уведомление после действия
        this.removeToast(toast);
    }

    updateToastProgress(toast, progress) {
        const progressBar = toast.querySelector('.progress-fill');
        if (progressBar) {
            progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
        }
    }

    extendToast(toast, additionalTime) {
        if (toast.hideTimerId) {
            clearTimeout(toast.hideTimerId);
            toast.hideTimerId = setTimeout(() => {
                this.removeToast(toast);
            }, additionalTime);
        }
    }

    // Утилиты
    playNotificationSound(type) {
        try {
            const audio = new Audio();
            
            const sounds = {
                success: '/assets/sounds/success.mp3',
                error: '/assets/sounds/error.mp3',
                warning: '/assets/sounds/warning.mp3',
                info: '/assets/sounds/info.mp3'
            };
            
            audio.src = sounds[type] || sounds.info;
            audio.volume = 0.3;
            audio.play().catch(error => {
                console.warn('ToastManager: Не удается воспроизвести звук:', error);
            });
        } catch (error) {
            console.warn('ToastManager: Ошибка воспроизведения звука:', error);
        }
    }

    notifyModules(event, data) {
        // Уведомляем другие модули о событиях
        const customEvent = new CustomEvent(`toast:${event}`, { detail: data });
        window.dispatchEvent(customEvent);
    }

    // Управление настройками
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.saveSettings();
        
        // Обновляем позицию контейнера
        if (newSettings.position) {
            this.container.className = `toast-container toast-${this.settings.position}`;
        }
    }

    // Методы для массового управления
    clearAll() {
        this.toasts.forEach(toast => this.removeToast(toast));
    }

    clearByType(type) {
        this.toasts.filter(toast => toast.dataset.type === type)
                  .forEach(toast => this.removeToast(toast));
    }

    // Получение статистики
    getStats() {
        const stats = {
            total: this.toasts.length,
            byType: {},
            settings: this.settings
        };

        this.toasts.forEach(toast => {
            const type = toast.dataset.type;
            stats.byType[type] = (stats.byType[type] || 0) + 1;
        });

        return stats;
    }

    // Создание уведомлений с прогрессом
    showProgress(title, message, progress = 0, actions = []) {
        const toast = this.createToast('loading', title, message, 0, actions);
        toast.dataset.type = 'progress';
        
        this.addToast(toast);
        
        // Обновляем прогресс
        if (progress > 0) {
            this.updateToastProgress(toast, progress);
        }
        
        return toast;
    }

    // Создание уведомлений с действиями
    showConfirm(title, message, actions = []) {
        return this.show('info', title, message, 0, actions);
    }

    // Создание уведомлений с автоматическим обновлением
    showAutoUpdate(title, message, updateCallback, duration = 10000) {
        const toast = this.createToast('info', title, message, duration);
        this.addToast(toast);
        
        // Запускаем автоматическое обновление
        const updateInterval = setInterval(() => {
            if (updateCallback && typeof updateCallback === 'function') {
                const result = updateCallback();
                if (result && result.message) {
                    const messageElement = toast.querySelector('.toast-message');
                    if (messageElement) {
                        messageElement.textContent = result.message;
                    }
                }
                if (result && result.complete) {
                    clearInterval(updateInterval);
                    this.removeToast(toast);
                }
            }
        }, 1000);
        
        return toast;
    }

    // Остановка модуля
    stop() {
        this.clearAll();
        if (this.container && this.container.parentElement) {
            this.container.remove();
        }
        console.log('ToastManager: Остановлен');
    }

    // Перезапуск модуля
    restart() {
        this.stop();
        this.init();
        console.log('ToastManager: Перезапущен');
    }
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    window.toastManager = new ToastManager();
});

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ToastManager;
}