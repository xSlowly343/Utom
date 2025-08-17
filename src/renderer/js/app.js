// Main Application File
class LostArkRaidManager {
    constructor() {
        this.currentPage = 'dashboard';
        this.settings = {};
        this.theme = 'auto';
        this.notifications = [];
        this.init();
    }

    async init() {
        try {
            // Initialize settings
            await this.loadSettings();
            
            // Initialize theme
            this.initTheme();
            
            // Initialize event listeners
            this.initEventListeners();
            
            // Initialize services
            await this.initServices();
            
            // Load initial data
            await this.loadInitialData();
            
            // Show dashboard
            this.showPage('dashboard');
            
            console.log('Lost Ark Raid Manager initialized successfully');
        } catch (error) {
            console.error('Failed to initialize application:', error);
            this.showError('Ошибка инициализации приложения');
        }
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
            
            this.theme = this.settings.theme;
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    }

    saveSettings() {
        try {
            localStorage.setItem('lostArkSettings', JSON.stringify(this.settings));
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    }

    initTheme() {
        // Set initial theme
        document.documentElement.setAttribute('data-theme', this.theme);
        
        // Update theme toggle button
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            if (icon) {
                icon.className = this.getThemeIcon();
            }
        }
    }

    getThemeIcon() {
        switch (this.theme) {
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

    toggleTheme() {
        const themes = ['auto', 'light', 'dark'];
        const currentIndex = themes.indexOf(this.theme);
        const nextIndex = (currentIndex + 1) % themes.length;
        this.theme = themes[nextIndex];
        
        // Update settings
        this.settings.theme = this.theme;
        this.saveSettings();
        
        // Apply theme
        document.documentElement.setAttribute('data-theme', this.theme);
        
        // Update theme toggle button
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            if (icon) {
                icon.className = this.getThemeIcon();
            }
        }
    }

    initEventListeners() {
        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Sidebar toggle
        const sidebarToggle = document.getElementById('sidebarToggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => this.toggleSidebar());
        }

        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }

        // Quick actions
        const quickActionsBtn = document.getElementById('quickActionsBtn');
        if (quickActionsBtn) {
            quickActionsBtn.addEventListener('click', () => this.showQuickActions());
        }

        // Notifications
        const notificationsBtn = document.getElementById('notificationsBtn');
        if (notificationsBtn) {
            notificationsBtn.addEventListener('click', () => this.showNotifications());
        }

        // Global shortcuts
        document.addEventListener('keydown', (e) => this.handleGlobalShortcuts(e));

        // Window events
        window.addEventListener('resize', () => this.handleResize());
        window.addEventListener('beforeunload', () => this.handleBeforeUnload());
    }

    async initServices() {
        try {
            // Initialize database
            await this.initDatabase();
            
            // Initialize notification service
            await this.initNotificationService();
            
            // Initialize screenshot service
            await this.initScreenshotService();
            
            // Initialize text recognition service
            await this.initTextRecognitionService();
            
            // Initialize chat service
            await this.initChatService();
            
        } catch (error) {
            console.error('Failed to initialize services:', error);
        }
    }

    async initDatabase() {
        // Initialize SQLite database
        try {
            // This will be implemented in a separate service file
            console.log('Database service initialized');
        } catch (error) {
            console.error('Failed to initialize database:', error);
        }
    }

    async initNotificationService() {
        try {
            // Initialize notification service
            console.log('Notification service initialized');
        } catch (error) {
            console.error('Failed to initialize notification service:', error);
        }
    }

    async initScreenshotService() {
        try {
            // Initialize screenshot service
            console.log('Screenshot service initialized');
        } catch (error) {
            console.error('Failed to initialize screenshot service:', error);
        }
    }

    async initTextRecognitionService() {
        try {
            // Initialize text recognition service
            console.log('Text recognition service initialized');
        } catch (error) {
            console.error('Failed to initialize text recognition service:', error);
        }
    }

    async initChatService() {
        try {
            // Initialize chat service
            console.log('Chat service initialized');
        } catch (error) {
            console.error('Failed to initialize chat service:', error);
        }
    }

    async loadInitialData() {
        try {
            // Load dashboard data
            await this.loadDashboardData();
            
            // Load notifications
            await this.loadNotifications();
            
        } catch (error) {
            console.error('Failed to load initial data:', error);
        }
    }

    async loadDashboardData() {
        try {
            // Load statistics
            const stats = await this.getDashboardStats();
            this.updateDashboardStats(stats);
            
            // Load recent activity
            const activity = await this.getRecentActivity();
            this.updateRecentActivity(activity);
            
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        }
    }

    async getDashboardStats() {
        // Mock data for now - will be replaced with real data from database
        return {
            activeRaids: 3,
            characters: 8,
            scheduledRaids: 5,
            completedRaids: 12
        };
    }

    updateDashboardStats(stats) {
        const activeRaidsCount = document.getElementById('activeRaidsCount');
        const charactersCount = document.getElementById('charactersCount');
        const scheduledRaidsCount = document.getElementById('scheduledRaidsCount');
        const completedRaidsCount = document.getElementById('completedRaidsCount');

        if (activeRaidsCount) activeRaidsCount.textContent = stats.activeRaids;
        if (charactersCount) charactersCount.textContent = stats.characters;
        if (scheduledRaidsCount) scheduledRaidsCount.textContent = stats.scheduledRaids;
        if (completedRaidsCount) completedRaidsCount.textContent = stats.completedRaids;
    }

    async getRecentActivity() {
        // Mock data for now
        return [
            {
                type: 'info',
                message: 'Добро пожаловать в Lost Ark Raid Manager!',
                time: 'Сейчас'
            },
            {
                type: 'success',
                message: 'Рейд "Вальтан" успешно завершен',
                time: '2 минуты назад'
            },
            {
                type: 'warning',
                message: 'Напоминание: рейд "Биал" через 1 час',
                time: '15 минут назад'
            }
        ];
    }

    updateRecentActivity(activities) {
        const recentActivity = document.getElementById('recentActivity');
        if (!recentActivity) return;

        // Clear existing activities
        recentActivity.innerHTML = '';

        // Add new activities
        activities.forEach(activity => {
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';
            
            const iconClass = this.getActivityIconClass(activity.type);
            
            activityItem.innerHTML = `
                <div class="activity-icon">
                    <i class="${iconClass}"></i>
                </div>
                <div class="activity-content">
                    <p>${activity.message}</p>
                    <span class="activity-time">${activity.time}</span>
                </div>
            `;
            
            recentActivity.appendChild(activityItem);
        });
    }

    getActivityIconClass(type) {
        switch (type) {
            case 'success':
                return 'fas fa-check-circle';
            case 'warning':
                return 'fas fa-exclamation-triangle';
            case 'error':
                return 'fas fa-times-circle';
            case 'info':
            default:
                return 'fas fa-info-circle';
        }
    }

    async loadNotifications() {
        try {
            // Load notifications from database or API
            this.notifications = await this.getNotifications();
            this.updateNotificationBadge();
        } catch (error) {
            console.error('Failed to load notifications:', error);
        }
    }

    async getNotifications() {
        // Mock data for now
        return [
            {
                id: 1,
                type: 'raid',
                message: 'Новый рейд "Вальтан" создан',
                time: new Date(),
                read: false
            },
            {
                id: 2,
                type: 'reminder',
                message: 'Напоминание: рейд "Биал" через 1 час',
                time: new Date(),
                read: false
            }
        ];
    }

    updateNotificationBadge() {
        const badge = document.getElementById('notificationBadge');
        if (badge) {
            const unreadCount = this.notifications.filter(n => !n.read).length;
            badge.textContent = unreadCount;
            badge.style.display = unreadCount > 0 ? 'block' : 'none';
        }
    }

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.toggle('collapsed');
        }
    }

    handleSearch(query) {
        if (query.length < 2) return;
        
        // Implement search functionality
        console.log('Searching for:', query);
        
        // Search across raids, characters, etc.
        this.performSearch(query);
    }

    async performSearch(query) {
        try {
            // Search in different categories
            const results = await Promise.all([
                this.searchRaids(query),
                this.searchCharacters(query),
                this.searchSchedule(query)
            ]);
            
            // Display search results
            this.displaySearchResults(results);
            
        } catch (error) {
            console.error('Search failed:', error);
        }
    }

    async searchRaids(query) {
        // Mock search implementation
        return [];
    }

    async searchCharacters(query) {
        // Mock search implementation
        return [];
    }

    async searchSchedule(query) {
        // Mock search implementation
        return [];
    }

    displaySearchResults(results) {
        // Implement search results display
        console.log('Search results:', results);
    }

    showQuickActions() {
        // Show quick actions menu
        console.log('Showing quick actions');
        
        // Create and show quick actions modal
        this.createQuickActionsModal();
    }

    createQuickActionsModal() {
        // Implementation for quick actions modal
        console.log('Quick actions modal created');
    }

    showNotifications() {
        // Show notifications panel
        console.log('Showing notifications');
        
        // Create and show notifications panel
        this.createNotificationsPanel();
    }

    createNotificationsPanel() {
        // Implementation for notifications panel
        console.log('Notifications panel created');
    }

    handleGlobalShortcuts(e) {
        // Handle global keyboard shortcuts
        if (e.ctrlKey && e.shiftKey) {
            switch (e.key) {
                case 'S':
                    e.preventDefault();
                    this.takeScreenshot();
                    break;
                case 'R':
                    e.preventDefault();
                    this.showRaidNotification();
                    break;
            }
        }
    }

    async takeScreenshot() {
        try {
            console.log('Taking screenshot...');
            // Implement screenshot functionality
            // This will be handled by the screenshot service
        } catch (error) {
            console.error('Screenshot failed:', error);
        }
    }

    showRaidNotification() {
        try {
            console.log('Showing raid notification...');
            // Implement raid notification
        } catch (error) {
            console.error('Raid notification failed:', error);
        }
    }

    handleResize() {
        // Handle window resize events
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile) {
            // Apply mobile-specific adjustments
            this.applyMobileLayout();
        } else {
            // Apply desktop-specific adjustments
            this.applyDesktopLayout();
        }
    }

    applyMobileLayout() {
        // Apply mobile-specific layout changes
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.add('mobile');
        }
    }

    applyDesktopLayout() {
        // Apply desktop-specific layout changes
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.remove('mobile');
        }
    }

    handleBeforeUnload() {
        // Handle application cleanup before unload
        try {
            // Save any unsaved data
            this.saveSettings();
            
            // Cleanup resources
            this.cleanup();
            
        } catch (error) {
            console.error('Cleanup failed:', error);
        }
    }

    cleanup() {
        // Cleanup resources
        console.log('Cleaning up application resources');
    }

    showPage(pageName) {
        // Hide all pages
        const pages = document.querySelectorAll('.page');
        pages.forEach(page => page.classList.remove('active'));
        
        // Show selected page
        const selectedPage = document.getElementById(pageName);
        if (selectedPage) {
            selectedPage.classList.add('active');
        }
        
        // Update navigation
        this.updateNavigation(pageName);
        
        // Update page title and breadcrumb
        this.updatePageInfo(pageName);
        
        // Store current page
        this.currentPage = pageName;
    }

    updateNavigation(pageName) {
        // Remove active class from all nav items
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => item.classList.remove('active'));
        
        // Add active class to current nav item
        const currentNavItem = document.querySelector(`[data-page="${pageName}"]`);
        if (currentNavItem) {
            currentNavItem.classList.add('active');
        }
    }

    updatePageInfo(pageName) {
        const pageTitle = document.getElementById('pageTitle');
        const breadcrumb = document.getElementById('breadcrumb');
        
        if (pageTitle) {
            pageTitle.textContent = this.getPageTitle(pageName);
        }
        
        if (breadcrumb) {
            breadcrumb.innerHTML = this.getBreadcrumb(pageName);
        }
    }

    getPageTitle(pageName) {
        const titles = {
            dashboard: 'Дашборд',
            raids: 'Рейды',
            characters: 'Персонажи',
            schedule: 'Расписание',
            chat: 'Чат',
            tools: 'Инструменты',
            settings: 'Настройки'
        };
        
        return titles[pageName] || 'Страница';
    }

    getBreadcrumb(pageName) {
        const breadcrumbs = {
            dashboard: '<span>Главная</span>',
            raids: '<span>Главная</span> / <span>Рейды</span>',
            characters: '<span>Главная</span> / <span>Персонажи</span>',
            schedule: '<span>Главная</span> / <span>Расписание</span>',
            chat: '<span>Главная</span> / <span>Чат</span>',
            tools: '<span>Главная</span> / <span>Инструменты</span>',
            settings: '<span>Главная</span> / <span>Настройки</span>'
        };
        
        return breadcrumbs[pageName] || '<span>Главная</span>';
    }

    showError(message) {
        // Show error message to user
        console.error(message);
        
        // Create and show error notification
        this.createErrorNotification(message);
    }

    createErrorNotification(message) {
        // Implementation for error notification
        console.log('Error notification created:', message);
    }

    // Public methods for other modules
    getSettings() {
        return this.settings;
    }

    updateSetting(key, value) {
        this.settings[key] = value;
        this.saveSettings();
    }

    getCurrentPage() {
        return this.currentPage;
    }

    addNotification(notification) {
        this.notifications.unshift(notification);
        this.updateNotificationBadge();
    }

    markNotificationAsRead(id) {
        const notification = this.notifications.find(n => n.id === id);
        if (notification) {
            notification.read = true;
            this.updateNotificationBadge();
        }
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new LostArkRaidManager();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LostArkRaidManager;
}