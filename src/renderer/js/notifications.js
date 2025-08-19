/**
 * Notifications Module - Система уведомлений
 */

class NotificationsModule {
    constructor() {
        this.notifications = [];
        this.settings = {
            enabled: true,
            sound: true,
            desktop: true,
            duration: 5000,
            position: 'top-right',
            maxNotifications: 5
        };
        
        this.init();
    }

    init() {
        this.loadSettings();
        this.createNotificationContainer();
        this.setupEventListeners();
        console.log('NotificationsModule: Инициализирован');
    }

    loadSettings() {
        try {
            const savedSettings = localStorage.getItem('notificationSettings');
            if (savedSettings) {
                this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
            }
        } catch (error) {
            console.error('NotificationsModule: Ошибка загрузки настроек:', error);
        }
    }

    saveSettings() {
        try {
            localStorage.setItem('notificationSettings', JSON.stringify(this.settings));
        } catch (error) {
            console.error('NotificationsModule: Ошибка сохранения настроек:', error);
        }
    }

    createNotificationContainer() {
        // Удаляем существующий контейнер если есть
        const existingContainer = document.getElementById('notifications-container');
        if (existingContainer) {
            existingContainer.remove();
        }

        // Создаем новый контейнер
        const container = document.createElement('div');
        container.id = 'notifications-container';
        container.className = `notifications-container ${this.settings.position}`;
        
        document.body.appendChild(container);
        
        // Добавляем стили
        this.addNotificationStyles();
    }

    setupEventListeners() {
        // События для показа уведомлений
        window.addEventListener('showNotification', (event) => {
            const { message, type, duration } = event.detail;
            this.show(message, type, duration);
        });

        // События для скрытия уведомлений
        window.addEventListener('hideNotification', (event) => {
            const { id } = event.detail;
            this.hide(id);
        });

        // События для очистки всех уведомлений
        window.addEventListener('clearNotifications', () => {
            this.clearAll();
        });

        // Запрос разрешения на desktop уведомления
        if (this.settings.desktop && 'Notification' in window) {
            if (Notification.permission === 'default') {
                Notification.requestPermission();
            }
        }
    }

    // Показ уведомления
    show(message, type = 'info', duration = null) {
        if (!this.settings.enabled) return;

        const notification = this.createNotification(message, type);
        const container = document.getElementById('notifications-container');
        
        if (container) {
            container.appendChild(notification);
            
            // Ограничиваем количество уведомлений
            this.limitNotifications();
            
            // Показываем анимацию
            setTimeout(() => {
                notification.classList.add('show');
            }, 100);
            
            // Автоматически скрываем
            const autoHideDuration = duration || this.settings.duration;
            if (autoHideDuration > 0) {
                setTimeout(() => {
                    this.hide(notification.id);
                }, autoHideDuration);
            }
            
            // Воспроизводим звук
            if (this.settings.sound) {
                this.playNotificationSound(type);
            }
            
            // Показываем desktop уведомление
            if (this.settings.desktop && 'Notification' in window && Notification.permission === 'granted') {
                this.showDesktopNotification(message, type);
            }
            
            // Сохраняем в истории
            this.addToHistory(message, type);
            
            return notification.id;
        }
    }

    // Создание элемента уведомления
    createNotification(message, type) {
        const notification = document.createElement('div');
        const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        notification.id = id;
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">
                    ${this.getNotificationIcon(type)}
                </div>
                <div class="notification-message">
                    ${this.escapeHtml(message)}
                </div>
                <button class="notification-close" onclick="window.notificationsModule.hide('${id}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="notification-progress"></div>
        `;
        
        return notification;
    }

    // Получение иконки для типа уведомления
    getNotificationIcon(type) {
        const icons = {
            'success': '<i class="fas fa-check-circle"></i>',
            'error': '<i class="fas fa-exclamation-circle"></i>',
            'warning': '<i class="fas fa-exclamation-triangle"></i>',
            'info': '<i class="fas fa-info-circle"></i>',
            'loading': '<i class="fas fa-spinner fa-spin"></i>'
        };
        return icons[type] || icons['info'];
    }

    // Экранирование HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Скрытие уведомления
    hide(id) {
        const notification = document.getElementById(id);
        if (notification) {
            notification.classList.remove('show');
            notification.classList.add('hide');
            
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }
    }

    // Ограничение количества уведомлений
    limitNotifications() {
        const container = document.getElementById('notifications-container');
        if (container) {
            const notifications = container.querySelectorAll('.notification');
            if (notifications.length > this.settings.maxNotifications) {
                const oldestNotification = notifications[0];
                this.hide(oldestNotification.id);
            }
        }
    }

    // Воспроизведение звука
    playNotificationSound(type) {
        try {
            // Создаем простой звук уведомления
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // Настраиваем звук в зависимости от типа
            const frequencies = {
                'success': 800,
                'error': 400,
                'warning': 600,
                'info': 700,
                'loading': 500
            };
            
            oscillator.frequency.setValueAtTime(frequencies[type] || 700, audioContext.currentTime);
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (error) {
            console.warn('NotificationsModule: Не удалось воспроизвести звук:', error);
        }
    }

    // Desktop уведомления
    showDesktopNotification(message, type) {
        try {
            const title = this.getNotificationTitle(type);
            const icon = this.getNotificationIcon(type);
            
            new Notification(title, {
                body: message,
                icon: '/assets/icon.png',
                tag: `notification-${type}`,
                requireInteraction: type === 'error' || type === 'warning'
            });
        } catch (error) {
            console.warn('NotificationsModule: Не удалось показать desktop уведомление:', error);
        }
    }

    // Получение заголовка уведомления
    getNotificationTitle(type) {
        const titles = {
            'success': 'Успешно',
            'error': 'Ошибка',
            'warning': 'Предупреждение',
            'info': 'Информация',
            'loading': 'Загрузка'
        };
        return titles[type] || 'Уведомление';
    }

    // Добавление в историю
    addToHistory(message, type) {
        const notificationRecord = {
            id: Date.now(),
            message,
            type,
            timestamp: new Date().toISOString()
        };
        
        this.notifications.push(notificationRecord);
        
        // Ограничиваем историю
        if (this.notifications.length > 100) {
            this.notifications.shift();
        }
        
        // Сохраняем в localStorage
        try {
            localStorage.setItem('notificationHistory', JSON.stringify(this.notifications));
        } catch (error) {
            console.warn('NotificationsModule: Не удалось сохранить историю:', error);
        }
    }

    // Получение истории уведомлений
    getHistory(limit = 50) {
        return this.notifications.slice(-limit);
    }

    // Очистка истории
    clearHistory() {
        this.notifications = [];
        try {
            localStorage.removeItem('notificationHistory');
        } catch (error) {
            console.warn('NotificationsModule: Не удалось очистить историю:', error);
        }
    }

    // Очистка всех уведомлений
    clearAll() {
        const container = document.getElementById('notifications-container');
        if (container) {
            const notifications = container.querySelectorAll('.notification');
            notifications.forEach(notification => {
                this.hide(notification.id);
            });
        }
    }

    // Обновление настроек
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.saveSettings();
        
        // Обновляем контейнер при изменении позиции
        if (newSettings.position && newSettings.position !== this.settings.position) {
            this.createNotificationContainer();
        }
        
        // Запрашиваем разрешение на desktop уведомления
        if (newSettings.desktop && 'Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }

    // Получение настроек
    getSettings() {
        return { ...this.settings };
    }

    // Добавление стилей
    addNotificationStyles() {
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                .notifications-container {
                    position: fixed;
                    z-index: 10000;
                    pointer-events: none;
                }
                
                .notifications-container.top-right {
                    top: 20px;
                    right: 20px;
                }
                
                .notifications-container.top-left {
                    top: 20px;
                    left: 20px;
                }
                
                .notifications-container.bottom-right {
                    bottom: 20px;
                    right: 20px;
                }
                
                .notifications-container.bottom-left {
                    bottom: 20px;
                    left: 20px;
                }
                
                .notifications-container.center {
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                }
                
                .notification {
                    background: var(--bg-primary, #ffffff);
                    border: 1px solid var(--border-color, #ddd);
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    margin-bottom: 10px;
                    max-width: 400px;
                    min-width: 300px;
                    opacity: 0;
                    transform: translateX(100%);
                    transition: all 0.3s ease;
                    pointer-events: auto;
                }
                
                .notification.show {
                    opacity: 1;
                    transform: translateX(0);
                }
                
                .notification.hide {
                    opacity: 0;
                    transform: translateX(100%);
                }
                
                .notification-content {
                    display: flex;
                    align-items: flex-start;
                    padding: 15px;
                    gap: 12px;
                }
                
                .notification-icon {
                    font-size: 20px;
                    flex-shrink: 0;
                    margin-top: 2px;
                }
                
                .notification-icon i {
                    width: 20px;
                    text-align: center;
                }
                
                .notification-message {
                    flex: 1;
                    line-height: 1.4;
                    word-wrap: break-word;
                }
                
                .notification-close {
                    background: none;
                    border: none;
                    color: var(--text-muted, #6c757d);
                    cursor: pointer;
                    font-size: 16px;
                    padding: 0;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    transition: all 0.2s ease;
                    flex-shrink: 0;
                }
                
                .notification-close:hover {
                    background: var(--bg-secondary, #f8f9fa);
                    color: var(--text-primary, #212529);
                }
                
                .notification-progress {
                    height: 3px;
                    background: var(--primary-color, #007bff);
                    border-radius: 0 0 8px 8px;
                    animation: notification-progress 5s linear;
                }
                
                @keyframes notification-progress {
                    from { width: 100%; }
                    to { width: 0%; }
                }
                
                .notification-success {
                    border-left: 4px solid var(--success-color, #28a745);
                }
                
                .notification-success .notification-icon {
                    color: var(--success-color, #28a745);
                }
                
                .notification-error {
                    border-left: 4px solid var(--danger-color, #dc3545);
                }
                
                .notification-error .notification-icon {
                    color: var(--danger-color, #dc3545);
                }
                
                .notification-warning {
                    border-left: 4px solid var(--warning-color, #ffc107);
                }
                
                .notification-warning .notification-icon {
                    color: var(--warning-color, #ffc107);
                }
                
                .notification-info {
                    border-left: 4px solid var(--info-color, #17a2b8);
                }
                
                .notification-info .notification-icon {
                    color: var(--info-color, #17a2b8);
                }
                
                .notification-loading {
                    border-left: 4px solid var(--primary-color, #007bff);
                }
                
                .notification-loading .notification-icon {
                    color: var(--primary-color, #007bff);
                }
                
                @media (max-width: 768px) {
                    .notifications-container {
                        left: 10px;
                        right: 10px;
                        top: 10px;
                        bottom: auto;
                    }
                    
                    .notification {
                        max-width: none;
                        min-width: auto;
                    }
                }
            `;
            
            document.head.appendChild(style);
        }
    }

    // Остановка модуля
    stop() {
        this.clearAll();
        console.log('NotificationsModule: Остановлен');
    }

    // Перезапуск модуля
    restart() {
        this.stop();
        this.init();
        console.log('NotificationsModule: Перезапущен');
    }
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    window.notificationsModule = new NotificationsModule();
});

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotificationsModule;
}