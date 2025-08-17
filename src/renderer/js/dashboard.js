// Dashboard Module
class DashboardModule {
    constructor() {
        this.stats = {};
        this.recentActivity = [];
        this.init();
    }

    init() {
        this.initEventListeners();
        this.loadDashboardData();
    }

    initEventListeners() {
        // Quick action buttons
        const createRaidBtn = document.getElementById('createRaidBtn');
        const addCharacterBtn = document.getElementById('addCharacterBtn');
        const scheduleRaidBtn = document.getElementById('scheduleRaidBtn');

        if (createRaidBtn) {
            createRaidBtn.addEventListener('click', () => this.quickCreateRaid());
        }

        if (addCharacterBtn) {
            addCharacterBtn.addEventListener('click', () => this.quickAddCharacter());
        }

        if (scheduleRaidBtn) {
            scheduleRaidBtn.addEventListener('click', () => this.quickScheduleRaid());
        }
    }

    async loadDashboardData() {
        try {
            // Load statistics
            await this.loadStats();
            
            // Load recent activity
            await this.loadRecentActivity();
            
            // Update display
            this.updateDashboard();
            
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        }
    }

    async loadStats() {
        try {
            // In real app, this would come from database or API
            this.stats = {
                activeRaids: 3,
                characters: 8,
                scheduledRaids: 5,
                completedRaids: 12,
                totalMembers: 25,
                weeklyProgress: 75,
                monthlyProgress: 60
            };
        } catch (error) {
            console.error('Failed to load stats:', error);
            this.stats = {
                activeRaids: 0,
                characters: 0,
                scheduledRaids: 0,
                completedRaids: 0,
                totalMembers: 0,
                weeklyProgress: 0,
                monthlyProgress: 0
            };
        }
    }

    async loadRecentActivity() {
        try {
            // In real app, this would come from database or API
            this.recentActivity = [
                {
                    id: 1,
                    type: 'raid_created',
                    message: 'Создан новый рейд "Вальтан"',
                    timestamp: new Date(Date.now() - 300000), // 5 minutes ago
                    icon: 'fas fa-users',
                    color: 'success'
                },
                {
                    id: 2,
                    type: 'raid_completed',
                    message: 'Рейд "Биал" успешно завершен',
                    timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
                    icon: 'fas fa-trophy',
                    color: 'success'
                },
                {
                    id: 3,
                    type: 'character_added',
                    message: 'Добавлен новый персонаж "BerserkerMain"',
                    timestamp: new Date(Date.now() - 3600000), // 1 hour ago
                    icon: 'fas fa-user-plus',
                    color: 'info'
                },
                {
                    id: 4,
                    type: 'raid_scheduled',
                    message: 'Запланирован рейд "Кукул-Сейтон" на завтра',
                    timestamp: new Date(Date.now() - 7200000), // 2 hours ago
                    icon: 'fas fa-calendar-plus',
                    color: 'warning'
                }
            ];
        } catch (error) {
            console.error('Failed to load recent activity:', error);
            this.recentActivity = [];
        }
    }

    updateDashboard() {
        this.updateStats();
        this.updateRecentActivity();
        this.updateQuickActions();
    }

    updateStats() {
        // Update stat cards
        const activeRaidsCount = document.getElementById('activeRaidsCount');
        const charactersCount = document.getElementById('charactersCount');
        const scheduledRaidsCount = document.getElementById('scheduledRaidsCount');
        const completedRaidsCount = document.getElementById('completedRaidsCount');

        if (activeRaidsCount) activeRaidsCount.textContent = this.stats.activeRaids;
        if (charactersCount) charactersCount.textContent = this.stats.characters;
        if (scheduledRaidsCount) scheduledRaidsCount.textContent = this.stats.scheduledRaids;
        if (completedRaidsCount) completedRaidsCount.textContent = this.stats.completedRaids;
    }

    updateRecentActivity() {
        const recentActivity = document.getElementById('recentActivity');
        if (!recentActivity) return;

        // Clear existing activities
        recentActivity.innerHTML = '';

        if (this.recentActivity.length === 0) {
            recentActivity.innerHTML = `
                <div class="activity-item">
                    <div class="activity-icon">
                        <i class="fas fa-info-circle"></i>
                    </div>
                    <div class="activity-content">
                        <p>Нет активности для отображения</p>
                        <span class="activity-time">Сейчас</span>
                    </div>
                </div>
            `;
            return;
        }

        // Add new activities
        this.recentActivity.forEach(activity => {
            const activityElement = this.createActivityElement(activity);
            recentActivity.appendChild(activityElement);
        });
    }

    createActivityElement(activity) {
        const activityElement = document.createElement('div');
        activityElement.className = 'activity-item';
        activityElement.dataset.activityId = activity.id;

        const timeString = this.formatRelativeTime(activity.timestamp);
        const iconClass = activity.icon || 'fas fa-info-circle';
        const colorClass = activity.color || 'info';

        activityElement.innerHTML = `
            <div class="activity-icon ${colorClass}">
                <i class="${iconClass}"></i>
            </div>
            <div class="activity-content">
                <p>${activity.message}</p>
                <span class="activity-time">${timeString}</span>
            </div>
        `;

        return activityElement;
    }

    formatRelativeTime(timestamp) {
        const now = new Date();
        const activityTime = new Date(timestamp);
        const diffMs = now - activityTime;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) {
            return 'Сейчас';
        } else if (diffMins < 60) {
            return `${diffMins} мин назад`;
        } else if (diffHours < 24) {
            return `${diffHours} ч назад`;
        } else if (diffDays < 7) {
            return `${diffDays} дн назад`;
        } else {
            return activityTime.toLocaleDateString('ru-RU');
        }
    }

    updateQuickActions() {
        // Update quick action buttons based on current state
        const createRaidBtn = document.getElementById('createRaidBtn');
        const addCharacterBtn = document.getElementById('addCharacterBtn');
        const scheduleRaidBtn = document.getElementById('scheduleRaidBtn');

        // Add tooltips or disable buttons based on conditions
        if (createRaidBtn) {
            createRaidBtn.title = 'Создать новый рейд';
        }

        if (addCharacterBtn) {
            addCharacterBtn.title = 'Добавить нового персонажа';
        }

        if (scheduleRaidBtn) {
            scheduleRaidBtn.title = 'Запланировать рейд';
        }
    }

    quickCreateRaid() {
        try {
            // Navigate to raids page and open create modal
            if (window.navigation) {
                window.navigation.navigateTo('raids');
                
                // Wait for page to load, then open create modal
                setTimeout(() => {
                    if (window.raidsModule) {
                        window.raidsModule.showNewRaidModal();
                    }
                }, 100);
            }
        } catch (error) {
            console.error('Failed to quick create raid:', error);
        }
    }

    quickAddCharacter() {
        try {
            // Navigate to characters page and open add modal
            if (window.navigation) {
                window.navigation.navigateTo('characters');
                
                // Wait for page to load, then open add modal
                setTimeout(() => {
                    if (window.charactersModule) {
                        window.charactersModule.showAddCharacterModal();
                    }
                }, 100);
            }
        } catch (error) {
            console.error('Failed to quick add character:', error);
        }
    }

    quickScheduleRaid() {
        try {
            // Navigate to schedule page
            if (window.navigation) {
                window.navigation.navigateTo('schedule');
            }
        } catch (error) {
            console.error('Failed to quick schedule raid:', error);
        }
    }

    // Public methods
    refreshDashboard() {
        this.loadDashboardData();
    }

    addActivity(activity) {
        // Add new activity to the beginning of the list
        this.recentActivity.unshift(activity);
        
        // Keep only last 10 activities
        if (this.recentActivity.length > 10) {
            this.recentActivity = this.recentActivity.slice(0, 10);
        }
        
        // Update display
        this.updateRecentActivity();
    }

    updateStat(key, value) {
        this.stats[key] = value;
        this.updateStats();
    }

    getStats() {
        return { ...this.stats };
    }

    getRecentActivity() {
        return [...this.recentActivity];
    }

    // Dashboard analytics
    calculateWeeklyProgress() {
        // Calculate weekly progress based on completed raids
        const weeklyGoal = 10; // Example goal
        const weeklyCompleted = this.stats.completedRaids; // This would be weekly-specific in real app
        
        return Math.min(Math.round((weeklyCompleted / weeklyGoal) * 100), 100);
    }

    calculateMonthlyProgress() {
        // Calculate monthly progress
        const monthlyGoal = 40; // Example goal
        const monthlyCompleted = this.stats.completedRaids; // This would be monthly-specific in real app
        
        return Math.min(Math.round((monthlyCompleted / monthlyGoal) * 100), 100);
    }

    // Dashboard notifications
    showDashboardNotification(message, type = 'info') {
        if (window.utils && typeof window.utils.showNotification === 'function') {
            window.utils.showNotification(message, type);
        } else {
            console.log(`${type} notification:`, message);
        }
    }

    // Dashboard shortcuts
    setupDashboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Only handle shortcuts when dashboard is active
            if (window.navigation && window.navigation.getCurrentPage() === 'dashboard') {
                this.handleDashboardShortcuts(e);
            }
        });
    }

    handleDashboardShortcuts(e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'n':
                    e.preventDefault();
                    this.quickCreateRaid();
                    break;
                case 'c':
                    e.preventDefault();
                    this.quickAddCharacter();
                    break;
                case 's':
                    e.preventDefault();
                    this.quickScheduleRaid();
                    break;
                case 'r':
                    e.preventDefault();
                    this.refreshDashboard();
                    break;
            }
        }
    }

    // Dashboard widgets
    createDashboardWidget(type, data) {
        const widget = document.createElement('div');
        widget.className = 'dashboard-widget';
        widget.dataset.widgetType = type;

        switch (type) {
            case 'progress':
                widget.innerHTML = this.createProgressWidget(data);
                break;
            case 'chart':
                widget.innerHTML = this.createChartWidget(data);
                break;
            case 'list':
                widget.innerHTML = this.createListWidget(data);
                break;
            default:
                widget.innerHTML = '<p>Неизвестный тип виджета</p>';
        }

        return widget;
    }

    createProgressWidget(data) {
        return `
            <div class="widget-header">
                <h4>${data.title}</h4>
                <span class="widget-value">${data.value}%</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${data.value}%"></div>
            </div>
        `;
    }

    createChartWidget(data) {
        return `
            <div class="widget-header">
                <h4>${data.title}</h4>
            </div>
            <div class="chart-placeholder">
                <i class="fas fa-chart-line"></i>
                <p>График: ${data.description}</p>
            </div>
        `;
    }

    createListWidget(data) {
        const listItems = data.items.map(item => `
            <li class="list-item">
                <span class="item-text">${item.text}</span>
                <span class="item-value">${item.value}</span>
            </li>
        `).join('');

        return `
            <div class="widget-header">
                <h4>${data.title}</h4>
            </div>
            <ul class="widget-list">
                ${listItems}
            </ul>
        `;
    }
}

// Initialize dashboard module when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardModule = new DashboardModule();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DashboardModule;
}