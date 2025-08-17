/**
 * Notifications Module - Handles desktop and in-app notifications
 */
class NotificationsModule {
    constructor() {
        this.notifications = [];
        this.settings = {
            desktop: true,
            sound: true,
            duration: 5000,
            position: 'top-right',
            maxVisible: 5
        };
        this.sound = null;
        this.init();
    }

    init() {
        this.loadSettings();
        this.initSound();
        this.createNotificationContainer();
        this.initEventListeners();
        this.checkPermission();
    }

    loadSettings() {
        const stored = localStorage.getItem('notificationSettings');
        if (stored) {
            this.settings = { ...this.settings, ...JSON.parse(stored) };
        }
    }

    saveSettings() {
        localStorage.setItem('notificationSettings', JSON.stringify(this.settings));
    }

    initSound() {
        if (this.settings.sound) {
            this.sound = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
        }
    }

    createNotificationContainer() {
        if (document.getElementById('notificationContainer')) return;

        const container = document.createElement('div');
        container.id = 'notificationContainer';
        container.className = `notification-container ${this.settings.position}`;
        document.body.appendChild(container);
    }

    initEventListeners() {
        // Listen for notification permission changes
        if ('Notification' in window) {
            Notification.requestPermission().then(permission => {
                this.updatePermissionStatus(permission);
            });
        }

        // Listen for settings changes
        document.addEventListener('notificationSettingsChanged', (e) => {
            this.updateSettings(e.detail);
        });
    }

    checkPermission() {
        if ('Notification' in window) {
            const permission = Notification.permission;
            this.updatePermissionStatus(permission);
        }
    }

    updatePermissionStatus(permission) {
        const statusElement = document.getElementById('notificationPermissionStatus');
        if (statusElement) {
            statusElement.textContent = permission;
            statusElement.className = `permission-status ${permission}`;
        }
    }

    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.saveSettings();
        
        if (newSettings.sound !== undefined) {
            this.initSound();
        }
        
        if (newSettings.position) {
            this.updateNotificationPosition();
        }
    }

    updateNotificationPosition() {
        const container = document.getElementById('notificationContainer');
        if (container) {
            container.className = `notification-container ${this.settings.position}`;
        }
    }

    // Main notification methods
    show(options) {
        const notification = {
            id: this.generateId(),
            type: options.type || 'info',
            title: options.title || 'Notification',
            message: options.message || '',
            duration: options.duration || this.settings.duration,
            actions: options.actions || [],
            timestamp: new Date(),
            read: false
        };

        // Add to notifications array
        this.notifications.unshift(notification);
        this.notifications = this.notifications.slice(0, 100); // Keep only last 100

        // Show desktop notification if enabled
        if (this.settings.desktop && 'Notification' in window && Notification.permission === 'granted') {
            this.showDesktopNotification(notification);
        }

        // Show in-app notification
        this.showInAppNotification(notification);

        // Play sound if enabled
        if (this.settings.sound && this.sound) {
            this.playNotificationSound();
        }

        // Auto-remove after duration
        if (notification.duration > 0) {
            setTimeout(() => {
                this.removeNotification(notification.id);
            }, notification.duration);
        }

        // Update notification count
        this.updateNotificationCount();

        return notification.id;
    }

    showDesktopNotification(notification) {
        const desktopNotification = new Notification(notification.title, {
            body: notification.message,
            icon: this.getNotificationIcon(notification.type),
            badge: this.getNotificationIcon(notification.type),
            tag: notification.id,
            requireInteraction: false,
            silent: !this.settings.sound
        });

        // Handle click events
        desktopNotification.onclick = () => {
            window.focus();
            this.markAsRead(notification.id);
            desktopNotification.close();
        };

        // Handle action buttons if present
        if (notification.actions.length > 0) {
            notification.actions.forEach(action => {
                desktopNotification.actions.push({
                    action: action.id,
                    title: action.title,
                    icon: action.icon
                });
            });
        }
    }

    showInAppNotification(notification) {
        const container = document.getElementById('notificationContainer');
        if (!container) return;

        const notificationElement = this.createNotificationElement(notification);
        container.appendChild(notificationElement);

        // Animate in
        setTimeout(() => {
            notificationElement.classList.add('show');
        }, 10);

        // Limit visible notifications
        const visibleNotifications = container.querySelectorAll('.notification.show');
        if (visibleNotifications.length > this.settings.maxVisible) {
            visibleNotifications[visibleNotifications.length - 1].classList.remove('show');
        }
    }

    createNotificationElement(notification) {
        const element = document.createElement('div');
        element.className = `notification notification-${notification.type}`;
        element.dataset.id = notification.id;

        let actionsHtml = '';
        if (notification.actions.length > 0) {
            actionsHtml = `
                <div class="notification-actions">
                    ${notification.actions.map(action => `
                        <button class="notification-action" data-action="${action.id}">
                            ${action.icon ? `<i class="${action.icon}"></i>` : ''}
                            ${action.title}
                        </button>
                    `).join('')}
                </div>
            `;
        }

        element.innerHTML = `
            <div class="notification-header">
                <div class="notification-title">
                    <i class="${this.getNotificationIcon(notification.type)}"></i>
                    ${notification.title}
                </div>
                <button class="notification-close" onclick="notificationsModule.removeNotification('${notification.id}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="notification-message">${notification.message}</div>
            ${actionsHtml}
            <div class="notification-timestamp">${this.formatTimestamp(notification.timestamp)}</div>
        `;

        // Add action event listeners
        if (notification.actions.length > 0) {
            element.querySelectorAll('.notification-action').forEach(button => {
                button.addEventListener('click', (e) => {
                    const actionId = e.currentTarget.dataset.action;
                    this.handleNotificationAction(notification.id, actionId);
                });
            });
        }

        return element;
    }

    removeNotification(id) {
        // Remove from array
        this.notifications = this.notifications.filter(n => n.id !== id);

        // Remove from DOM
        const element = document.querySelector(`[data-id="${id}"]`);
        if (element) {
            element.classList.remove('show');
            setTimeout(() => {
                if (element.parentNode) {
                    element.parentNode.removeChild(element);
                }
            }, 300);
        }

        // Update notification count
        this.updateNotificationCount();
    }

    markAsRead(id) {
        const notification = this.notifications.find(n => n.id === id);
        if (notification) {
            notification.read = true;
        }
    }

    markAllAsRead() {
        this.notifications.forEach(n => n.read = true);
        this.updateNotificationCount();
    }

    clearAll() {
        this.notifications = [];
        const container = document.getElementById('notificationContainer');
        if (container) {
            container.innerHTML = '';
        }
        this.updateNotificationCount();
    }

    // Specific notification types
    showSuccess(title, message, options = {}) {
        return this.show({
            type: 'success',
            title,
            message,
            ...options
        });
    }

    showError(title, message, options = {}) {
        return this.show({
            type: 'error',
            title,
            message,
            duration: 0, // Don't auto-remove errors
            ...options
        });
    }

    showWarning(title, message, options = {}) {
        return this.show({
            type: 'warning',
            title,
            message,
            ...options
        });
    }

    showInfo(title, message, options = {}) {
        return this.show({
            type: 'info',
            title,
            message,
            ...options
        });
    }

    // Raid-specific notifications
    showRaidCreated(raid) {
        return this.show({
            type: 'success',
            title: 'Raid Created',
            message: `"${raid.title}" has been scheduled for ${this.formatDate(raid.date)} at ${raid.time}`,
            actions: [
                {
                    id: 'view',
                    title: 'View Raid',
                    icon: 'fas fa-eye'
                },
                {
                    id: 'join',
                    title: 'Join Raid',
                    icon: 'fas fa-user-plus'
                }
            ]
        });
    }

    showRaidReminder(raid) {
        return this.show({
            type: 'info',
            title: 'Raid Reminder',
            message: `"${raid.title}" starts in 30 minutes`,
            actions: [
                {
                    id: 'view',
                    title: 'View Details',
                    icon: 'fas fa-eye'
                },
                {
                    id: 'dismiss',
                    title: 'Dismiss',
                    icon: 'fas fa-times'
                }
            ]
        });
    }

    showRaidStarting(raid) {
        return this.show({
            type: 'warning',
            title: 'Raid Starting',
            message: `"${raid.title}" is starting now!`,
            duration: 0,
            actions: [
                {
                    id: 'join',
                    title: 'Join Now',
                    icon: 'fas fa-play'
                },
                {
                    id: 'dismiss',
                    title: 'Dismiss',
                    icon: 'fas fa-times'
                }
            ]
        });
    }

    // Character-specific notifications
    showCharacterAdded(character) {
        return this.show({
            type: 'success',
            title: 'Character Added',
            message: `${character.name} (${character.class}) has been added to your roster`,
            actions: [
                {
                    id: 'view',
                    title: 'View Character',
                    icon: 'fas fa-user'
                },
                {
                    id: 'edit',
                    title: 'Edit',
                    icon: 'fas fa-edit'
                }
            ]
        });
    }

    showLevelUp(character, oldLevel, newLevel) {
        return this.show({
            type: 'success',
            title: 'Level Up!',
            message: `${character.name} has reached level ${newLevel}!`,
            actions: [
                {
                    id: 'view',
                    title: 'View Progress',
                    icon: 'fas fa-chart-line'
                }
            ]
        });
    }

    // System notifications
    showUpdateAvailable(version) {
        return this.show({
            type: 'info',
            title: 'Update Available',
            message: `Version ${version} is available for download`,
            actions: [
                {
                    id: 'download',
                    title: 'Download Now',
                    icon: 'fas fa-download'
                },
                {
                    id: 'later',
                    title: 'Later',
                    icon: 'fas fa-clock'
                }
            ]
        });
    }

    showBackupComplete() {
        return this.show({
            type: 'success',
            title: 'Backup Complete',
            message: 'Your data has been successfully backed up',
            actions: [
                {
                    id: 'view',
                    title: 'View Backup',
                    icon: 'fas fa-folder-open'
                }
            ]
        });
    }

    // Action handling
    handleNotificationAction(notificationId, actionId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (!notification) return;

        // Emit custom event for action handling
        const event = new CustomEvent('notificationAction', {
            detail: {
                notificationId,
                actionId,
                notification
            }
        });
        document.dispatchEvent(event);

        // Remove notification after action
        this.removeNotification(notificationId);
    }

    // Utility methods
    generateId() {
        return 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    formatTimestamp(timestamp) {
        const now = new Date();
        const diff = now - timestamp;
        
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return timestamp.toLocaleDateString();
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    }

    updateNotificationCount() {
        const unreadCount = this.notifications.filter(n => !n.read).length;
        
        // Update badge in UI
        const badgeElement = document.getElementById('notificationBadge');
        if (badgeElement) {
            if (unreadCount > 0) {
                badgeElement.textContent = unreadCount > 99 ? '99+' : unreadCount;
                badgeElement.style.display = 'block';
            } else {
                badgeElement.style.display = 'none';
            }
        }

        // Update document title if there are unread notifications
        if (unreadCount > 0) {
            document.title = `(${unreadCount}) Lost Ark Raid Manager`;
        } else {
            document.title = 'Lost Ark Raid Manager';
        }
    }

    playNotificationSound() {
        if (this.sound) {
            this.sound.currentTime = 0;
            this.sound.play().catch(() => {
                // Ignore audio play errors
            });
        }
    }

    // Settings methods
    toggleDesktopNotifications() {
        this.settings.desktop = !this.settings.desktop;
        this.saveSettings();
        
        if (this.settings.desktop && 'Notification' in window) {
            Notification.requestPermission();
        }
    }

    toggleSound() {
        this.settings.sound = !this.settings.sound;
        this.saveSettings();
        this.initSound();
    }

    setDuration(duration) {
        this.settings.duration = duration;
        this.saveSettings();
    }

    setPosition(position) {
        this.settings.position = position;
        this.saveSettings();
        this.updateNotificationPosition();
    }

    // Public methods
    getNotifications() {
        return this.notifications;
    }

    getUnreadCount() {
        return this.notifications.filter(n => !n.read).length;
    }

    getSettings() {
        return { ...this.settings };
    }

    refresh() {
        this.updateNotificationCount();
    }
}

// Initialize the notifications module
const notificationsModule = new NotificationsModule();