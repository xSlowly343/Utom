// Navigation Module
class Navigation {
    constructor() {
        this.currentPage = 'dashboard';
        this.history = [];
        this.maxHistory = 10;
        this.init();
    }

    init() {
        // Initialize navigation event listeners
        this.initNavigationListeners();
        
        // Initialize browser history
        this.initBrowserHistory();
        
        // Set initial page
        this.setCurrentPage('dashboard');
    }

    initNavigationListeners() {
        // Add click listeners to all navigation items
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const pageName = item.getAttribute('data-page');
                if (pageName) {
                    this.navigateTo(pageName);
                }
            });
        });

        // Handle browser back/forward buttons
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.page) {
                this.showPage(e.state.page, false);
            }
        });

        // Handle keyboard navigation
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardNavigation(e);
        });
    }

    initBrowserHistory() {
        // Initialize browser history with current page
        const currentPage = this.getCurrentPageFromURL() || 'dashboard';
        this.setCurrentPage(currentPage);
        
        // Update browser history
        this.updateBrowserHistory(currentPage);
    }

    getCurrentPageFromURL() {
        // Get page from URL hash
        const hash = window.location.hash;
        if (hash) {
            return hash.substring(1);
        }
        return null;
    }

    updateBrowserHistory(pageName, pushState = true) {
        const url = `#${pageName}`;
        
        if (pushState) {
            window.history.pushState({ page: pageName }, '', url);
        } else {
            window.history.replaceState({ page: pageName }, '', url);
        }
    }

    navigateTo(pageName) {
        try {
            if (pageName === this.currentPage) {
                return; // Already on this page
            }

            // Validate page name
            if (!this.isValidPage(pageName)) {
                console.error(`Navigation: Неизвестная страница: ${pageName}`);
                this.showPageNotFound(pageName);
                return;
            }

            // Add to history
            this.addToHistory(this.currentPage);
            
            // Navigate to new page
            this.setCurrentPage(pageName);
            
            // Update browser history
            this.updateBrowserHistory(pageName);
            
            // Show the page
            this.showPage(pageName);
            
            // Trigger navigation event
            this.triggerNavigationEvent(pageName);
            
        } catch (error) {
            console.error('Navigation: Ошибка навигации:', error);
            this.handleNavigationError(error, pageName);
        }
    }

    setCurrentPage(pageName) {
        this.currentPage = pageName;
        
        // Update active navigation item
        this.updateActiveNavigation(pageName);
        
        // Update page title and breadcrumb
        this.updatePageInfo(pageName);
    }

    showPage(pageName, updateHistory = true) {
        // Hide all pages
        const pages = document.querySelectorAll('.page');
        pages.forEach(page => page.classList.remove('active'));
        
        // Show selected page
        const selectedPage = document.getElementById(pageName);
        if (selectedPage) {
            selectedPage.classList.add('active');
            
            // Add fade-in animation
            selectedPage.classList.add('fade-in');
            
            // Remove animation class after animation completes
            setTimeout(() => {
                selectedPage.classList.remove('fade-in');
            }, 300);
        }
        
        // Update navigation
        this.updateActiveNavigation(pageName);
        
        // Update page info
        this.updatePageInfo(pageName);
        
        // Update history if needed
        if (updateHistory) {
            this.updateBrowserHistory(pageName, false);
        }
        
        // Store current page
        this.currentPage = pageName;
        
        // Load page-specific data
        this.loadPageData(pageName);
    }

    updateActiveNavigation(pageName) {
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
            raids: 'Управление рейдами',
            characters: 'Мои персонажи',
            schedule: 'Расписание рейдов',
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

    loadPageData(pageName) {
        // Load page-specific data based on page name
        switch (pageName) {
            case 'dashboard':
                this.loadDashboardData();
                break;
            case 'raids':
                this.loadRaidsData();
                break;
            case 'characters':
                this.loadCharactersData();
                break;
            case 'schedule':
                this.loadScheduleData();
                break;
            case 'chat':
                this.loadChatData();
                break;
            case 'tools':
                this.loadToolsData();
                break;
            case 'settings':
                this.loadSettingsData();
                break;
        }
    }

    async loadDashboardData() {
        try {
            // Load dashboard statistics and recent activity
            if (window.app && typeof window.app.loadDashboardData === 'function') {
                await window.app.loadDashboardData();
            }
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        }
    }

    async loadRaidsData() {
        try {
            // Load raids data
            if (window.raidsModule && typeof window.raidsModule.loadRaids === 'function') {
                await window.raidsModule.loadRaids();
            }
        } catch (error) {
            console.error('Failed to load raids data:', error);
        }
    }

    async loadCharactersData() {
        try {
            // Load characters data
            if (window.charactersModule && typeof window.charactersModule.loadCharacters === 'function') {
                await window.charactersModule.loadCharacters();
            }
        } catch (error) {
            console.error('Failed to load characters data:', error);
        }
    }

    async loadScheduleData() {
        try {
            // Load schedule data
            if (window.scheduleModule && typeof window.scheduleModule.loadSchedule === 'function') {
                await window.scheduleModule.loadSchedule();
            }
        } catch (error) {
            console.error('Failed to load schedule data:', error);
        }
    }

    async loadChatData() {
        try {
            // Load chat data
            if (window.chatModule && typeof window.chatModule.loadChat === 'function') {
                await window.chatModule.loadChat();
            }
        } catch (error) {
            console.error('Failed to load chat data:', error);
        }
    }

    async loadToolsData() {
        try {
            // Load tools data
            if (window.toolsModule && typeof window.toolsModule.loadTools === 'function') {
                await window.toolsModule.loadTools();
            }
        } catch (error) {
            console.error('Failed to load tools data:', error);
        }
    }

    async loadSettingsData() {
        try {
            // Load settings data
            if (window.settingsModule && typeof window.settingsModule.loadSettings === 'function') {
                await window.settingsModule.loadSettings();
            }
        } catch (error) {
            console.error('Failed to load settings data:', error);
        }
    }

    addToHistory(pageName) {
        if (pageName && pageName !== this.currentPage) {
            this.history.push(pageName);
            
            // Keep history size manageable
            if (this.history.length > this.maxHistory) {
                this.history.shift();
            }
        }
    }

    goBack() {
        if (this.history.length > 0) {
            const previousPage = this.history.pop();
            this.navigateTo(previousPage);
        }
    }

    goToPage(pageName) {
        this.navigateTo(pageName);
    }

    getCurrentPage() {
        return this.currentPage;
    }

    getHistory() {
        return [...this.history];
    }

    clearHistory() {
        this.history = [];
    }

    handleKeyboardNavigation(e) {
        // Handle keyboard shortcuts for navigation
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case '1':
                    e.preventDefault();
                    this.navigateTo('dashboard');
                    break;
                case '2':
                    e.preventDefault();
                    this.navigateTo('raids');
                    break;
                case '3':
                    e.preventDefault();
                    this.navigateTo('characters');
                    break;
                case '4':
                    e.preventDefault();
                    this.navigateTo('schedule');
                    break;
                case '5':
                    e.preventDefault();
                    this.navigateTo('chat');
                    break;
                case '6':
                    e.preventDefault();
                    this.navigateTo('tools');
                    break;
                case '7':
                    e.preventDefault();
                    this.navigateTo('settings');
                    break;
            }
        }
        
        // Handle arrow key navigation
        if (e.altKey) {
            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.goBack();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.goForward();
                    break;
            }
        }
    }

    goForward() {
        // Implementation for forward navigation
        // This would require maintaining a forward history stack
        console.log('Forward navigation not implemented yet');
    }

    triggerNavigationEvent(pageName) {
        // Create and dispatch custom navigation event
        const event = new CustomEvent('pageChanged', {
            detail: {
                page: pageName,
                previousPage: this.history[this.history.length - 1],
                timestamp: new Date()
            }
        });
        
        document.dispatchEvent(event);
    }

    // Public methods for external use
    refreshCurrentPage() {
        this.loadPageData(this.currentPage);
    }

    isPageActive(pageName) {
        return this.currentPage === pageName;
    }

    getPageElement(pageName) {
        return document.getElementById(pageName);
    }

    showLoadingState(pageName) {
        const pageElement = this.getPageElement(pageName);
        if (pageElement) {
            pageElement.classList.add('loading');
        }
    }

    hideLoadingState(pageName) {
        const pageElement = this.getPageElement(pageName);
        if (pageElement) {
            pageElement.classList.remove('loading');
        }
    }

    // Error handling
    showNavigationError(message) {
        console.error('Navigation error:', message);
        
        // Create error notification
        this.createErrorNotification(message);
    }

    createErrorNotification(message) {
        // Implementation for error notification
        console.log('Error notification created:', message);
    }

    // Обработка ошибок навигации
    handleNavigationError(error, pageName) {
        console.error(`Navigation: Ошибка при переходе на страницу ${pageName}:`, error);
        
        // Показываем fallback страницу
        this.showNavigationErrorPage(pageName, error.message);
        
        // Уведомляем ErrorBoundary если доступен
        if (window.errorBoundary) {
            window.errorBoundary.handleError(error, `navigation.navigateTo.${pageName}`);
        }
    }

    // Показать страницу ошибки навигации
    showNavigationErrorPage(pageName, errorMessage) {
        const mainContent = document.getElementById('mainContent');
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="fallback-container">
                    <div class="fallback-content">
                        <div class="fallback-icon">⚠️</div>
                        <h2>Ошибка навигации</h2>
                        <p>Не удалось загрузить страницу "${pageName}".</p>
                        <p class="error-details">${errorMessage}</p>
                        <div class="fallback-actions">
                            <button class="btn btn-primary" onclick="window.navigation.navigateTo('dashboard')">
                                🏠 На главную
                            </button>
                            <button class="btn btn-secondary" onclick="window.history.back()">
                                ⬅️ Назад
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    // Показать страницу "не найдено"
    showPageNotFound(pageName) {
        const mainContent = document.getElementById('mainContent');
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="fallback-container">
                    <div class="fallback-content">
                        <div class="fallback-icon">❓</div>
                        <h2>Страница не найдена</h2>
                        <p>Страница "${pageName}" не существует или была удалена.</p>
                        <div class="fallback-actions">
                            <button class="btn btn-primary" onclick="window.navigation.navigateTo('dashboard')">
                                🏠 На главную
                            </button>
                            <button class="btn btn-secondary" onclick="window.history.back()">
                                ⬅️ Назад
                            </button>
                            <button class="btn btn-info" onclick="window.errorBoundary?.showErrorReport()">
                                📋 Отправить отчет
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    // Utility methods
    isValidPage(pageName) {
        const validPages = [
            'dashboard', 'raids', 'characters', 
            'schedule', 'chat', 'tools', 'settings'
        ];
        
        return validPages.includes(pageName);
    }

    getPageMetadata(pageName) {
        const metadata = {
            dashboard: {
                title: 'Дашборд',
                description: 'Обзор активности и статистики',
                icon: 'fas fa-tachometer-alt'
            },
            raids: {
                title: 'Рейды',
                description: 'Управление рейдами и участниками',
                icon: 'fas fa-users'
            },
            characters: {
                title: 'Персонажи',
                description: 'Управление персонажами и прогрессом',
                icon: 'fas fa-user-shield'
            },
            schedule: {
                title: 'Расписание',
                description: 'Планирование и календарь рейдов',
                icon: 'fas fa-calendar-alt'
            },
            chat: {
                title: 'Чат',
                description: 'Общение с участниками гильдии',
                icon: 'fas fa-comments'
            },
            tools: {
                title: 'Инструменты',
                description: 'Дополнительные инструменты и утилиты',
                icon: 'fas fa-tools'
            },
            settings: {
                title: 'Настройки',
                description: 'Настройки приложения и профиля',
                icon: 'fas fa-cog'
            }
        };
        
        return metadata[pageName] || {
            title: 'Страница',
            description: 'Описание недоступно',
            icon: 'fas fa-file'
        };
    }
}

// Initialize navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.navigation = new Navigation();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Navigation;
}