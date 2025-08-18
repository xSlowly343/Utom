/**
 * Analytics Module
 * Handles data analysis, statistics, and reporting for Lost Ark activities
 */
class AnalyticsModule {
    constructor() {
        this.analyticsData = {};
        this.charts = {};
        this.currentPeriod = 'week';
        this.currentView = 'overview';
        this.filters = {
            dateRange: 'week',
            server: 'all',
            character: 'all',
            raidType: 'all'
        };
        
        this.periods = [
            { value: 'day', label: 'День', icon: 'fas fa-calendar-day' },
            { value: 'week', label: 'Неделя', icon: 'fas fa-calendar-week' },
            { value: 'month', label: 'Месяц', icon: 'fas fa-calendar-alt' },
            { value: 'quarter', label: 'Квартал', icon: 'fas fa-calendar' },
            { value: 'year', label: 'Год', icon: 'fas fa-calendar-year' }
        ];
        
        this.views = [
            { value: 'overview', label: 'Обзор', icon: 'fas fa-chart-pie' },
            { value: 'raids', label: 'Рейды', icon: 'fas fa-users' },
            { value: 'characters', label: 'Персонажи', icon: 'fas fa-user' },
            { value: 'economy', label: 'Экономика', icon: 'fas fa-coins' },
            { value: 'performance', label: 'Производительность', icon: 'fas fa-chart-line' }
        ];
        
        this.init();
    }
    
    init() {
        this.loadAnalyticsData();
        this.setupEventListeners();
        this.renderAnalytics();
        this.setupCharts();
    }
    
    setupEventListeners() {
        // Period selector
        const periodSelector = document.getElementById('periodSelector');
        if (periodSelector) {
            periodSelector.addEventListener('change', (e) => {
                this.currentPeriod = e.target.value;
                this.updateAnalytics();
            });
        }
        
        // View selector
        const viewSelector = document.getElementById('viewSelector');
        if (viewSelector) {
            viewSelector.addEventListener('change', (e) => {
                this.currentView = e.target.value;
                this.renderAnalytics();
            });
        }
        
        // Filter changes
        const serverFilter = document.getElementById('analyticsServerFilter');
        if (serverFilter) {
            serverFilter.addEventListener('change', (e) => {
                this.filters.server = e.target.value;
                this.updateAnalytics();
            });
        }
        
        const characterFilter = document.getElementById('analyticsCharacterFilter');
        if (characterFilter) {
            characterFilter.addEventListener('change', (e) => {
                this.filters.character = e.target.value;
                this.updateAnalytics();
            });
        }
        
        const raidTypeFilter = document.getElementById('analyticsRaidTypeFilter');
        if (raidTypeFilter) {
            raidTypeFilter.addEventListener('change', (e) => {
                this.filters.raidType = e.target.value;
                this.updateAnalytics();
            });
        }
        
        // Export button
        const exportBtn = document.getElementById('exportAnalytics');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportAnalytics();
            });
        }
    }
    
    async loadAnalyticsData() {
        try {
            // Mock analytics data
            this.analyticsData = {
                overview: {
                    totalRaids: 156,
                    totalCharacters: 8,
                    totalGold: 1250000,
                    totalMaterials: 89,
                    completionRate: 87.5,
                    averageRaidTime: '45m',
                    weeklyProgress: 75.2
                },
                raids: {
                    byType: {
                        'abyss': 45,
                        'legion': 78,
                        'guardian': 33
                    },
                    byStatus: {
                        'completed': 137,
                        'failed': 12,
                        'in_progress': 7
                    },
                    byServer: {
                        'eu-west': 67,
                        'eu-central': 54,
                        'us-east': 35
                    },
                    weeklyTrend: [12, 15, 18, 14, 16, 19, 22],
                    monthlyTrend: [45, 52, 48, 61, 58, 67, 72, 69, 75, 78, 81, 89]
                },
                characters: {
                    byClass: {
                        'berserker': 2,
                        'bard': 1,
                        'gunlancer': 1,
                        'sorceress': 1,
                        'deathblade': 1,
                        'shadowhunter': 1,
                        'artillerist': 1
                    },
                    byIlvl: {
                        '1400-1499': 1,
                        '1500-1599': 2,
                        '1600-1699': 3,
                        '1700+': 2
                    },
                    progression: {
                        'level_60': 8,
                        'engravings_max': 5,
                        'gems_max': 3,
                        'accessories_max': 2
                    }
                },
                economy: {
                    goldSources: {
                        'raids': 850000,
                        'daily_quests': 250000,
                        'trading': 150000
                    },
                    goldSpending: {
                        'upgrades': 600000,
                        'materials': 300000,
                        'cosmetics': 200000,
                        'other': 150000
                    },
                    materialInventory: {
                        'epic': 45,
                        'legendary': 23,
                        'rare': 21
                    }
                },
                performance: {
                    dps: {
                        'berserker': 1850000,
                        'deathblade': 1720000,
                        'shadowhunter': 1680000,
                        'artillerist': 1650000
                    },
                    survival: {
                        'gunlancer': 95.2,
                        'bard': 92.8,
                        'paladin': 90.5
                    },
                    efficiency: {
                        'raid_completion': 87.5,
                        'time_optimization': 82.3,
                        'resource_usage': 89.1
                    }
                }
            };
            
        } catch (error) {
            console.error('Failed to load analytics data:', error);
            this.analyticsData = {};
        }
    }
    
    renderAnalytics() {
        this.renderOverview();
        this.renderCurrentView();
        this.updateCharts();
    }
    
    renderOverview() {
        const overviewContainer = document.getElementById('analyticsOverview');
        if (!overviewContainer) return;
        
        const overview = this.analyticsData.overview || {};
        
        overviewContainer.innerHTML = `
            <div class="overview-grid">
                <div class="overview-card">
                    <div class="overview-icon">
                        <i class="fas fa-users"></i>
                    </div>
                    <div class="overview-content">
                        <div class="overview-value">${overview.totalRaids || 0}</div>
                        <div class="overview-label">Всего рейдов</div>
                    </div>
                </div>
                
                <div class="overview-card">
                    <div class="overview-icon">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="overview-content">
                        <div class="overview-value">${overview.totalCharacters || 0}</div>
                        <div class="overview-label">Персонажей</div>
                    </div>
                </div>
                
                <div class="overview-card">
                    <div class="overview-icon">
                        <i class="fas fa-coins"></i>
                    </div>
                    <div class="overview-content">
                        <div class="overview-value">${this.formatGold(overview.totalGold || 0)}</div>
                        <div class="overview-label">Золота</div>
                    </div>
                </div>
                
                <div class="overview-card">
                    <div class="overview-icon">
                        <i class="fas fa-gem"></i>
                    </div>
                    <div class="overview-content">
                        <div class="overview-value">${overview.totalMaterials || 0}</div>
                        <div class="overview-label">Материалов</div>
                    </div>
                </div>
                
                <div class="overview-card">
                    <div class="overview-icon">
                        <i class="fas fa-trophy"></i>
                    </div>
                    <div class="overview-content">
                        <div class="overview-value">${overview.completionRate || 0}%</div>
                        <div class="overview-label">Успешность</div>
                    </div>
                </div>
                
                <div class="overview-card">
                    <div class="overview-icon">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div class="overview-content">
                        <div class="overview-value">${overview.averageRaidTime || '0m'}</div>
                        <div class="overview-label">Среднее время</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderCurrentView() {
        const viewContainer = document.getElementById('analyticsView');
        if (!viewContainer) return;
        
        switch (this.currentView) {
            case 'raids':
                this.renderRaidsView();
                break;
            case 'characters':
                this.renderCharactersView();
                break;
            case 'economy':
                this.renderEconomyView();
                break;
            case 'performance':
                this.renderPerformanceView();
                break;
            default:
                this.renderOverviewView();
        }
    }
    
    renderOverviewView() {
        const viewContainer = document.getElementById('analyticsView');
        if (!viewContainer) return;
        
        viewContainer.innerHTML = `
            <div class="view-header">
                <h3>Общий обзор</h3>
                <p>Ключевые метрики и тренды</p>
            </div>
            
            <div class="view-content">
                <div class="chart-container">
                    <h4>Тренд рейдов по неделям</h4>
                    <canvas id="weeklyTrendChart"></canvas>
                </div>
                
                <div class="chart-container">
                    <h4>Распределение по типам рейдов</h4>
                    <canvas id="raidTypeChart"></canvas>
                </div>
                
                <div class="metrics-grid">
                    <div class="metric-item">
                        <div class="metric-label">Недельный прогресс</div>
                        <div class="metric-value">${this.analyticsData.overview?.weeklyProgress || 0}%</div>
                        <div class="metric-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${this.analyticsData.overview?.weeklyProgress || 0}%"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="metric-item">
                        <div class="metric-label">Эффективность времени</div>
                        <div class="metric-value">${this.analyticsData.performance?.efficiency?.time_optimization || 0}%</div>
                        <div class="metric-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${this.analyticsData.performance?.efficiency?.time_optimization || 0}%"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderRaidsView() {
        const viewContainer = document.getElementById('analyticsView');
        if (!viewContainer) return;
        
        const raidsData = this.analyticsData.raids || {};
        
        viewContainer.innerHTML = `
            <div class="view-header">
                <h3>Анализ рейдов</h3>
                <p>Детальная статистика по рейдам</p>
            </div>
            
            <div class="view-content">
                <div class="stats-grid">
                    <div class="stat-section">
                        <h4>По типам</h4>
                        <div class="stat-list">
                            ${Object.entries(raidsData.byType || {}).map(([type, count]) => `
                                <div class="stat-item">
                                    <span class="stat-label">${this.getRaidTypeLabel(type)}</span>
                                    <span class="stat-value">${count}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="stat-section">
                        <h4>По статусам</h4>
                        <div class="stat-list">
                            ${Object.entries(raidsData.byStatus || {}).map(([status, count]) => `
                                <div class="stat-item">
                                    <span class="stat-label">${this.getRaidStatusLabel(status)}</span>
                                    <span class="stat-value">${count}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="stat-section">
                        <h4>По серверам</h4>
                        <div class="stat-list">
                            ${Object.entries(raidsData.byServer || {}).map(([server, count]) => `
                                <div class="stat-item">
                                    <span class="stat-label">${this.getServerLabel(server)}</span>
                                    <span class="stat-value">${count}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
                
                <div class="chart-container">
                    <h4>Месячный тренд рейдов</h4>
                    <canvas id="monthlyTrendChart"></canvas>
                </div>
            </div>
        `;
    }
    
    renderCharactersView() {
        const viewContainer = document.getElementById('analyticsView');
        if (!viewContainer) return;
        
        const charactersData = this.analyticsData.characters || {};
        
        viewContainer.innerHTML = `
            <div class="view-header">
                <h3>Анализ персонажей</h3>
                <p>Статистика по персонажам и прогрессу</p>
            </div>
            
            <div class="view-content">
                <div class="stats-grid">
                    <div class="stat-section">
                        <h4>По классам</h4>
                        <div class="stat-list">
                            ${Object.entries(charactersData.byClass || {}).map(([charClass, count]) => `
                                <div class="stat-item">
                                    <span class="stat-label">${this.getCharacterClassLabel(charClass)}</span>
                                    <span class="stat-value">${count}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="stat-section">
                        <h4>По уровню предметов</h4>
                        <div class="stat-list">
                            ${Object.entries(charactersData.byIlvl || {}).map(([range, count]) => `
                                <div class="stat-item">
                                    <span class="stat-label">${range}</span>
                                    <span class="stat-value">${count}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="stat-section">
                        <h4>Прогресс</h4>
                        <div class="stat-list">
                            ${Object.entries(charactersData.progression || {}).map(([prog, count]) => `
                                <div class="stat-item">
                                    <span class="stat-label">${this.getProgressionLabel(prog)}</span>
                                    <span class="stat-value">${count}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
                
                <div class="chart-container">
                    <h4>Распределение по классам</h4>
                    <canvas id="characterClassChart"></canvas>
                </div>
            </div>
        `;
    }
    
    renderEconomyView() {
        const viewContainer = document.getElementById('analyticsView');
        if (!viewContainer) return;
        
        const economyData = this.analyticsData.economy || {};
        
        viewContainer.innerHTML = `
            <div class="view-header">
                <h3>Экономический анализ</h3>
                <p>Анализ доходов, расходов и ресурсов</p>
            </div>
            
            <div class="view-content">
                <div class="stats-grid">
                    <div class="stat-section">
                        <h4>Источники золота</h4>
                        <div class="stat-list">
                            ${Object.entries(economyData.goldSources || {}).map(([source, amount]) => `
                                <div class="stat-item">
                                    <span class="stat-label">${this.getGoldSourceLabel(source)}</span>
                                    <span class="stat-value">${this.formatGold(amount)}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="stat-section">
                        <h4>Расходы золота</h4>
                        <div class="stat-list">
                            ${Object.entries(economyData.goldSpending || {}).map(([source, amount]) => `
                                <div class="stat-item">
                                    <span class="stat-label">${this.getGoldExpenseLabel(source)}</span>
                                    <span class="stat-value">${this.formatGold(amount)}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="stat-section">
                        <h4>Инвентарь материалов</h4>
                        <div class="stat-list">
                            ${Object.entries(economyData.materialInventory || {}).map(([quality, count]) => `
                                <div class="stat-item">
                                    <span class="stat-label">${this.getMaterialQualityLabel(quality)}</span>
                                    <span class="stat-value">${count}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
                
                <div class="chart-container">
                    <h4>Распределение доходов и расходов</h4>
                    <canvas id="economyChart"></canvas>
                </div>
            </div>
        `;
    }
    
    renderPerformanceView() {
        const viewContainer = document.getElementById('analyticsView');
        if (!viewContainer) return;
        
        const performanceData = this.analyticsData.performance || {};
        
        viewContainer.innerHTML = `
            <div class="view-header">
                <h3>Анализ производительности</h3>
                <p>Метрики DPS, выживаемости и эффективности</p>
            </div>
            
            <div class="view-content">
                <div class="stats-grid">
                    <div class="stat-section">
                        <h4>DPS по классам</h4>
                        <div class="stat-list">
                            ${Object.entries(performanceData.dps || {}).map(([charClass, dps]) => `
                                <div class="stat-item">
                                    <span class="stat-label">${this.getCharacterClassLabel(charClass)}</span>
                                    <span class="stat-value">${this.formatDPS(dps)}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="stat-section">
                        <h4>Выживаемость</h4>
                        <div class="stat-list">
                            ${Object.entries(performanceData.survival || {}).map(([charClass, survival]) => `
                                <div class="stat-item">
                                    <span class="stat-label">${this.getCharacterClassLabel(charClass)}</span>
                                    <span class="stat-value">${survival}%</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="stat-section">
                        <h4>Эффективность</h4>
                        <div class="stat-list">
                            ${Object.entries(performanceData.efficiency || {}).map(([metric, value]) => `
                                <div class="stat-item">
                                    <span class="stat-label">${this.getEfficiencyLabel(metric)}</span>
                                    <span class="stat-value">${value}%</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
                
                <div class="chart-container">
                    <h4>Сравнение DPS по классам</h4>
                    <canvas id="dpsComparisonChart"></canvas>
                </div>
            </div>
        `;
    }
    
    setupCharts() {
        // Initialize charts when they're rendered
        this.updateCharts();
    }
    
    updateCharts() {
        // Update charts based on current view
        setTimeout(() => {
            this.renderCharts();
        }, 100);
    }
    
    renderCharts() {
        // Render charts based on current view
        switch (this.currentView) {
            case 'overview':
                this.renderWeeklyTrendChart();
                this.renderRaidTypeChart();
                break;
            case 'raids':
                this.renderMonthlyTrendChart();
                break;
            case 'characters':
                this.renderCharacterClassChart();
                break;
            case 'economy':
                this.renderEconomyChart();
                break;
            case 'performance':
                this.renderDPSComparisonChart();
                break;
        }
    }
    
    renderWeeklyTrendChart() {
        const canvas = document.getElementById('weeklyTrendChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const weeklyData = this.analyticsData.raids?.weeklyTrend || [];
        
        // Simple chart rendering (in real app, use Chart.js or similar)
        this.renderSimpleLineChart(ctx, weeklyData, 'Недельный тренд рейдов');
    }
    
    renderRaidTypeChart() {
        const canvas = document.getElementById('raidTypeChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const raidTypeData = this.analyticsData.raids?.byType || {};
        
        // Simple chart rendering
        this.renderSimplePieChart(ctx, raidTypeData, 'Типы рейдов');
    }
    
    renderMonthlyTrendChart() {
        const canvas = document.getElementById('monthlyTrendChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const monthlyData = this.analyticsData.raids?.monthlyTrend || [];
        
        this.renderSimpleLineChart(ctx, monthlyData, 'Месячный тренд рейдов');
    }
    
    renderCharacterClassChart() {
        const canvas = document.getElementById('characterClassChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const classData = this.analyticsData.characters?.byClass || {};
        
        this.renderSimplePieChart(ctx, classData, 'Распределение по классам');
    }
    
    renderEconomyChart() {
        const canvas = document.getElementById('economyChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const economyData = this.analyticsData.economy || {};
        
        // Combine sources and spending for comparison
        const combinedData = {
            ...economyData.goldSources,
            ...economyData.goldSpending
        };
        
        this.renderSimplePieChart(ctx, combinedData, 'Доходы и расходы');
    }
    
    renderDPSComparisonChart() {
        const canvas = document.getElementById('dpsComparisonChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const dpsData = this.analyticsData.performance?.dps || {};
        
        this.renderSimpleBarChart(ctx, dpsData, 'DPS по классам');
    }
    
    renderSimpleLineChart(ctx, data, title) {
        // Simple line chart implementation
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        const maxValue = Math.max(...data);
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        const padding = 40;
        
        ctx.strokeStyle = '#3B82F6';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        data.forEach((value, index) => {
            const x = padding + (index / (data.length - 1)) * (width - 2 * padding);
            const y = height - padding - (value / maxValue) * (height - 2 * padding);
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
    }
    
    renderSimplePieChart(ctx, data, title) {
        // Simple pie chart implementation
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        const total = Object.values(data).reduce((sum, value) => sum + value, 0);
        const centerX = ctx.canvas.width / 2;
        const centerY = ctx.canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 40;
        
        let currentAngle = 0;
        const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];
        
        Object.entries(data).forEach(([label, value], index) => {
            const sliceAngle = (value / total) * 2 * Math.PI;
            
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.closePath();
            
            ctx.fillStyle = colors[index % colors.length];
            ctx.fill();
            
            currentAngle += sliceAngle;
        });
    }
    
    renderSimpleBarChart(ctx, data, title) {
        // Simple bar chart implementation
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        const maxValue = Math.max(...Object.values(data));
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        const padding = 60;
        const barWidth = (width - 2 * padding) / Object.keys(data).length;
        
        ctx.fillStyle = '#3B82F6';
        
        Object.entries(data).forEach(([label, value], index) => {
            const barHeight = (value / maxValue) * (height - 2 * padding);
            const x = padding + index * barWidth;
            const y = height - padding - barHeight;
            
            ctx.fillRect(x, y, barWidth - 10, barHeight);
        });
    }
    
    updateAnalytics() {
        // Update analytics based on current filters and period
        this.renderAnalytics();
    }
    
    // Utility methods
    formatGold(amount) {
        if (amount >= 1000000) {
            return (amount / 1000000).toFixed(1) + 'M';
        } else if (amount >= 1000) {
            return (amount / 1000).toFixed(1) + 'K';
        }
        return amount.toString();
    }
    
    formatDPS(dps) {
        if (dps >= 1000000) {
            return (dps / 1000000).toFixed(1) + 'M';
        } else if (dps >= 1000) {
            return (dps / 1000).toFixed(1) + 'K';
        }
        return dps.toString();
    }
    
    getRaidTypeLabel(type) {
        const labels = {
            'abyss': 'Абиссал',
            'legion': 'Легион',
            'guardian': 'Страж'
        };
        return labels[type] || type;
    }
    
    getRaidStatusLabel(status) {
        const labels = {
            'completed': 'Завершен',
            'failed': 'Провален',
            'in_progress': 'В процессе'
        };
        return labels[status] || status;
    }
    
    getServerLabel(server) {
        const labels = {
            'eu-west': 'EU West',
            'eu-central': 'EU Central',
            'us-east': 'US East'
        };
        return labels[server] || server;
    }
    
    getCharacterClassLabel(charClass) {
        const labels = {
            'berserker': 'Берсерк',
            'bard': 'Бард',
            'gunlancer': 'Ганлансер',
            'sorceress': 'Чародейка',
            'deathblade': 'Клинок Смерти',
            'shadowhunter': 'Охотник Теней',
            'artillerist': 'Артиллерист'
        };
        return labels[charClass] || charClass;
    }
    
    getProgressionLabel(prog) {
        const labels = {
            'level_60': 'Уровень 60',
            'engravings_max': 'Макс. гравировки',
            'gems_max': 'Макс. камни',
            'accessories_max': 'Макс. аксессуары'
        };
        return labels[prog] || prog;
    }
    
    getGoldSourceLabel(source) {
        const labels = {
            'raids': 'Рейды',
            'daily_quests': 'Ежедневные задания',
            'trading': 'Торговля'
        };
        return labels[source] || source;
    }
    
    getGoldExpenseLabel(expense) {
        const labels = {
            'upgrades': 'Апгрейды',
            'materials': 'Материалы',
            'cosmetics': 'Косметика',
            'other': 'Прочее'
        };
        return labels[expense] || expense;
    }
    
    getMaterialQualityLabel(quality) {
        const labels = {
            'epic': 'Эпические',
            'legendary': 'Легендарные',
            'rare': 'Редкие'
        };
        return labels[quality] || quality;
    }
    
    getEfficiencyLabel(metric) {
        const labels = {
            'raid_completion': 'Завершение рейдов',
            'time_optimization': 'Оптимизация времени',
            'resource_usage': 'Использование ресурсов'
        };
        return labels[metric] || metric;
    }
    
    // Export functionality
    exportAnalytics() {
        const data = {
            analytics: this.analyticsData,
            filters: this.filters,
            period: this.currentPeriod,
            view: this.currentView,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-export-${this.currentView}-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showSuccess('Аналитика успешно экспортирована');
    }
    
    // Public methods
    getAnalyticsData() {
        return { ...this.analyticsData };
    }
    
    getCurrentPeriod() {
        return this.currentPeriod;
    }
    
    getCurrentView() {
        return this.currentView;
    }
    
    getFilters() {
        return { ...this.filters };
    }
    
    // Statistics
    getAnalyticsStats() {
        const stats = {
            totalDataPoints: Object.keys(this.analyticsData).length,
            currentPeriod: this.currentPeriod,
            currentView: this.currentView,
            filters: this.filters,
            lastUpdated: new Date().toISOString()
            };
            
        return stats;
    }
    
    // Cleanup
    destroy() {
        // Clean up charts and event listeners
        this.charts = {};
    }
}

// Initialize analytics module when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.analyticsModule = new AnalyticsModule();
    
    // Example usage:
    // window.analyticsModule.onAnalyticsUpdate((data) => {
    //     console.log('Analytics updated:', data);
    // });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnalyticsModule;
}
