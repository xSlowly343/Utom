// Settings Module
class SettingsModule {
    constructor() {
        this.settings = {};
        this.init();
    }

    init() {
        this.loadSettings();
        this.initEventListeners();
        this.renderSettings();
    }

    async loadSettings() {
        try {
            // Load settings from localStorage or default values
            const savedSettings = localStorage.getItem('lostArkSettings');
            if (savedSettings) {
                this.settings = JSON.parse(savedSettings);
            } else {
                // Default settings
                this.settings = {
                    theme: 'auto',
                    language: 'ru',
                    notifications: true,
                    autoUpdate: true,
                    server: '',
                    discordWebhook: '',
                    telegramBot: '',
                    shortcuts: {
                        screenshot: 'Ctrl+Shift+S',
                        raidNotification: 'Ctrl+Shift+R'
                    }
                };
                this.saveSettings();
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    }

    initEventListeners() {
        // Language selection
        const languageSelect = document.getElementById('languageSelect');
        if (languageSelect) {
            languageSelect.value = this.settings.language;
            languageSelect.addEventListener('change', (e) => {
                this.updateSetting('language', e.target.value);
            });
        }

        // Theme selection
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) {
            themeSelect.value = this.settings.theme;
            themeSelect.addEventListener('change', (e) => {
                this.updateSetting('theme', e.target.value);
                this.applyTheme(e.target.value);
            });
        }

        // Notifications toggle
        const notificationsToggle = document.getElementById('notificationsToggle');
        if (notificationsToggle) {
            notificationsToggle.checked = this.settings.notifications;
            notificationsToggle.addEventListener('change', (e) => {
                this.updateSetting('notifications', e.target.checked);
            });
        }

        // Auto update toggle
        const autoUpdateToggle = document.getElementById('autoUpdateToggle');
        if (autoUpdateToggle) {
            autoUpdateToggle.checked = this.settings.autoUpdate;
            autoUpdateToggle.addEventListener('change', (e) => {
                this.updateSetting('autoUpdate', e.target.checked);
            });
        }

        // Server input
        const serverInput = document.getElementById('serverInput');
        if (serverInput) {
            serverInput.value = this.settings.server;
            serverInput.addEventListener('input', (e) => {
                this.updateSetting('server', e.target.value);
            });
        }

        // Discord webhook
        const discordWebhookInput = document.getElementById('discordWebhookInput');
        if (discordWebhookInput) {
            discordWebhookInput.value = this.settings.discordWebhook;
            discordWebhookInput.addEventListener('input', (e) => {
                this.updateSetting('discordWebhook', e.target.value);
            });
        }

        // Telegram bot
        const telegramBotInput = document.getElementById('telegramBotInput');
        if (telegramBotInput) {
            telegramBotInput.value = this.settings.telegramBot;
            telegramBotInput.addEventListener('input', (e) => {
                this.updateSetting('telegramBot', e.target.value);
            });
        }

        // Save settings button
        const saveSettingsBtn = document.getElementById('saveSettingsBtn');
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', () => this.saveSettings());
        }

        // Reset settings button
        const resetSettingsBtn = document.getElementById('resetSettingsBtn');
        if (resetSettingsBtn) {
            resetSettingsBtn.addEventListener('click', () => this.resetSettings());
        }
    }

    renderSettings() {
        // Settings are already rendered in HTML, just update values
        this.updateSettingsDisplay();
    }

    updateSettingsDisplay() {
        // Update form values to match current settings
        const languageSelect = document.getElementById('languageSelect');
        const themeSelect = document.getElementById('themeSelect');
        const notificationsToggle = document.getElementById('notificationsToggle');
        const autoUpdateToggle = document.getElementById('autoUpdateToggle');
        const serverInput = document.getElementById('serverInput');
        const discordWebhookInput = document.getElementById('discordWebhookInput');
        const telegramBotInput = document.getElementById('telegramBotInput');

        if (languageSelect) languageSelect.value = this.settings.language;
        if (themeSelect) themeSelect.value = this.settings.theme;
        if (notificationsToggle) notificationsToggle.checked = this.settings.notifications;
        if (autoUpdateToggle) autoUpdateToggle.checked = this.settings.autoUpdate;
        if (serverInput) serverInput.value = this.settings.server;
        if (discordWebhookInput) discordWebhookInput.value = this.settings.discordWebhook;
        if (telegramBotInput) telegramBotInput.value = this.settings.telegramBot;
    }

    updateSetting(key, value) {
        this.settings[key] = value;
        this.saveSettings();
        
        // Apply specific setting changes
        if (key === 'theme') {
            this.applyTheme(value);
        } else if (key === 'language') {
            this.applyLanguage(value);
        } else if (key === 'notifications') {
            this.applyNotifications(value);
        }
    }

    applyTheme(theme) {
        // Update document theme attribute
        document.documentElement.setAttribute('data-theme', theme);
        
        // Update theme toggle button icon
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            if (icon) {
                icon.className = this.getThemeIcon(theme);
            }
        }
        
        // Update main app theme if available
        if (window.app && typeof window.app.updateSetting === 'function') {
            window.app.updateSetting('theme', theme);
        }
    }

    getThemeIcon(theme) {
        switch (theme) {
            case 'light':
                return 'fas fa-sun';
            case 'dark':
                return 'fas fa-moon';
            case 'auto':
                return 'fas fa-adjust';
            default:
                return 'fas fa-adjust';
        }
    }

    applyLanguage(language) {
        // In real app, this would change the UI language
        console.log('Applying language:', language);
        
        // Update main app language if available
        if (window.app && typeof window.app.updateSetting === 'function') {
            window.app.updateSetting('language', language);
        }
    }

    applyNotifications(enabled) {
        // In real app, this would enable/disable notification system
        console.log('Notifications enabled:', enabled);
        
        // Update main app notifications if available
        if (window.app && typeof window.app.updateSetting === 'function') {
            window.app.updateSetting('notifications', enabled);
        }
    }

    async saveSettings() {
        try {
            // Save to localStorage
            localStorage.setItem('lostArkSettings', JSON.stringify(this.settings));
            
            // Show success message
            this.showSuccess('Настройки сохранены!');
            
            // Update main app settings if available
            if (window.app && typeof window.app.updateSetting === 'function') {
                Object.keys(this.settings).forEach(key => {
                    window.app.updateSetting(key, this.settings[key]);
                });
            }
            
        } catch (error) {
            console.error('Failed to save settings:', error);
            this.showError('Ошибка сохранения настроек');
        }
    }

    async resetSettings() {
        try {
            // Confirm reset
            if (!confirm('Вы уверены, что хотите сбросить все настройки? Это действие нельзя отменить.')) {
                return;
            }

            // Reset to default settings
            this.settings = {
                theme: 'auto',
                language: 'ru',
                notifications: true,
                autoUpdate: true,
                server: '',
                discordWebhook: '',
                telegramBot: '',
                shortcuts: {
                    screenshot: 'Ctrl+Shift+S',
                    raidNotification: 'Ctrl+Shift+R'
                }
            };

            // Save default settings
            this.saveSettings();
            
            // Update display
            this.updateSettingsDisplay();
            
            // Apply default theme
            this.applyTheme('auto');
            
            // Show success message
            this.showSuccess('Настройки сброшены к значениям по умолчанию!');
            
        } catch (error) {
            console.error('Failed to reset settings:', error);
            this.showError('Ошибка сброса настроек');
        }
    }

    showSuccess(message) {
        console.log('Success:', message);
        // Create success notification
        this.createNotification(message, 'success');
    }

    showError(message) {
        console.error('Error:', message);
        // Create error notification
        this.createNotification(message, 'error');
    }

    createNotification(message, type) {
        // Implementation for notifications
        console.log(`${type} notification:`, message);
        
        // In real app, this would show a toast notification
        // For now, we'll use a simple alert
        if (type === 'error') {
            alert(`Ошибка: ${message}`);
        } else {
            alert(message);
        }
    }

    // Public methods
    getSettings() {
        return { ...this.settings };
    }

    getSetting(key) {
        return this.settings[key];
    }

    setSetting(key, value) {
        this.settings[key] = value;
        this.saveSettings();
    }

    // Utility methods
    validateSettings() {
        const errors = [];
        
        // Validate server name
        if (this.settings.server && this.settings.server.length < 2) {
            errors.push('Название сервера должно содержать минимум 2 символа');
        }
        
        // Validate Discord webhook URL
        if (this.settings.discordWebhook && !this.isValidUrl(this.settings.discordWebhook)) {
            errors.push('Неверный формат Discord webhook URL');
        }
        
        // Validate Telegram bot token
        if (this.settings.telegramBot && this.settings.telegramBot.length < 10) {
            errors.push('Неверный формат Telegram bot token');
        }
        
        return errors;
    }

    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    // Export settings
    exportSettings() {
        try {
            const settingsData = JSON.stringify(this.settings, null, 2);
            const blob = new Blob([settingsData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = 'lost-ark-settings.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showSuccess('Настройки экспортированы!');
            
        } catch (error) {
            console.error('Failed to export settings:', error);
            this.showError('Ошибка экспорта настроек');
        }
    }

    // Import settings
    async importSettings(file) {
        try {
            const text = await file.text();
            const importedSettings = JSON.parse(text);
            
            // Validate imported settings
            if (!this.validateImportedSettings(importedSettings)) {
                throw new Error('Неверный формат файла настроек');
            }
            
            // Merge with current settings
            this.settings = { ...this.settings, ...importedSettings };
            
            // Save and apply
            this.saveSettings();
            this.updateSettingsDisplay();
            
            // Apply theme if changed
            if (importedSettings.theme) {
                this.applyTheme(importedSettings.theme);
            }
            
            this.showSuccess('Настройки импортированы!');
            
        } catch (error) {
            console.error('Failed to import settings:', error);
            this.showError('Ошибка импорта настроек');
        }
    }

    validateImportedSettings(settings) {
        // Basic validation of imported settings structure
        const requiredKeys = ['theme', 'language', 'notifications'];
        
        return requiredKeys.every(key => settings.hasOwnProperty(key)) &&
               typeof settings.theme === 'string' &&
               typeof settings.language === 'string' &&
               typeof settings.notifications === 'boolean';
    }

    // Reset specific settings
    resetTheme() {
        this.updateSetting('theme', 'auto');
    }

    resetLanguage() {
        this.updateSetting('language', 'ru');
    }

    resetNotifications() {
        this.updateSetting('notifications', true);
    }

    // Get settings summary
    getSettingsSummary() {
        return {
            totalSettings: Object.keys(this.settings).length,
            theme: this.settings.theme,
            language: this.settings.language,
            notificationsEnabled: this.settings.notifications,
            autoUpdateEnabled: this.settings.autoUpdate,
            hasServer: !!this.settings.server,
            hasDiscordIntegration: !!this.settings.discordWebhook,
            hasTelegramIntegration: !!this.settings.telegramBot
        };
    }
}

// Initialize settings module when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.settingsModule = new SettingsModule();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SettingsModule;
}