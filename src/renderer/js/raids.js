/**
 * Raids Management Module
 * Управление рейдами в Lost Ark Raid Manager
 * Включает: создание, планирование, участники, логи, награды
 */

class RaidsManager {
    constructor() {
        this.raids = [];
        this.currentRaid = null;
        this.raidTemplates = [];
        this.participants = [];
        this.raidLogs = [];
        this.rewards = [];
        this.init();
    }

    init() {
        this.loadRaids();
        this.loadRaidTemplates();
        this.loadParticipants();
        this.loadRewards();
        this.bindEvents();
        this.render();
        this.startAutoSave();
        this.loadRaidLogs();
    }

    loadRaids() {
        try {
            const saved = localStorage.getItem('raids');
            this.raids = saved ? JSON.parse(saved) : this.getDefaultRaids();
        } catch (error) {
            console.error('Error loading raids:', error);
            this.raids = this.getDefaultRaids();
        }
    }

    getDefaultRaids() {
        return [
            {
                id: 1,
                name: 'Вальтас',
                type: 'Legion Raid',
                difficulty: 'Normal',
                status: 'Scheduled',
                date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
                time: '20:00',
                duration: 120,
                maxParticipants: 8,
                minItemLevel: 1490,
                description: 'Рейд на Вальтаса - первого легиона',
                requirements: ['Предметный уровень 1490+', 'Энгравинги 3+3', 'Карты Lostwind Cliff'],
                rewards: ['Энгравинги', 'Материалы для улучшения', 'Доступ к следующему рейду'],
                participants: [],
                leader: 'Admin',
                notes: 'Приходите за 15 минут до начала',
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                name: 'Вьякис',
                type: 'Legion Raid',
                difficulty: 'Hard',
                status: 'Completed',
                date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
                time: '19:00',
                duration: 150,
                maxParticipants: 8,
                minItemLevel: 1520,
                description: 'Рейд на Вьякиса - второго легиона',
                requirements: ['Предметный уровень 1520+', 'Энгравинги 4+3', 'Карты Lostwind Cliff'],
                rewards: ['Энгравинги', 'Материалы для улучшения', 'Доступ к следующему рейду'],
                participants: ['Admin', 'Moderator', 'Player1', 'Player2'],
                leader: 'Admin',
                notes: 'Успешно завершен',
                createdAt: new Date(Date.now() - 172800000).toISOString()
            }
        ];
    }

    loadRaidTemplates() {
        try {
            const saved = localStorage.getItem('raidTemplates');
            this.raidTemplates = saved ? JSON.parse(saved) : this.getDefaultTemplates();
        } catch (error) {
            console.error('Error loading raid templates:', error);
            this.raidTemplates = this.getDefaultTemplates();
        }
    }

    getDefaultTemplates() {
        return [
            {
                id: 1,
                name: 'Вальтас Normal',
                type: 'Legion Raid',
                difficulty: 'Normal',
                maxParticipants: 8,
                minItemLevel: 1490,
                duration: 120,
                requirements: ['Предметный уровень 1490+', 'Энгравинги 3+3'],
                rewards: ['Энгравинги', 'Материалы для улучшения'],
                description: 'Стандартный рейд на Вальтаса'
            },
            {
                id: 2,
                name: 'Вьякис Hard',
                type: 'Legion Raid',
                difficulty: 'Hard',
                maxParticipants: 8,
                minItemLevel: 1520,
                duration: 150,
                requirements: ['Предметный уровень 1520+', 'Энгравинги 4+3'],
                rewards: ['Энгравинги', 'Материалы для улучшения'],
                description: 'Сложный рейд на Вьякиса'
            },
            {
                id: 3,
                name: 'Кукул-Сейтон',
                type: 'Legion Raid',
                difficulty: 'Normal',
                maxParticipants: 8,
                minItemLevel: 1540,
                duration: 180,
                requirements: ['Предметный уровень 1540+', 'Энгравинги 4+3'],
                rewards: ['Энгравинги', 'Материалы для улучшения'],
                description: 'Рейд на Кукул-Сейтона'
            }
        ];
    }

    loadParticipants() {
        try {
            const saved = localStorage.getItem('raidParticipants');
            this.participants = saved ? JSON.parse(saved) : this.getDefaultParticipants();
        } catch (error) {
            console.error('Error loading participants:', error);
            this.participants = this.getDefaultParticipants();
        }
    }

    getDefaultParticipants() {
        return [
            {
                id: 1,
                name: 'Admin',
                class: 'Berserker',
                itemLevel: 1550,
                role: 'DPS',
                status: 'Available',
                experience: 'Expert',
                joinDate: new Date().toISOString()
            },
            {
                id: 2,
                name: 'Moderator',
                class: 'Paladin',
                itemLevel: 1540,
                role: 'Support',
                status: 'Available',
                experience: 'Expert',
                joinDate: new Date().toISOString()
            },
            {
                id: 3,
                name: 'Player1',
                class: 'Sorceress',
                itemLevel: 1510,
                role: 'DPS',
                status: 'Available',
                experience: 'Intermediate',
                joinDate: new Date().toISOString()
            }
        ];
    }

    loadRewards() {
        try {
            const saved = localStorage.getItem('raidRewards');
            this.rewards = saved ? JSON.parse(saved) : this.getDefaultRewards();
        } catch (error) {
            console.error('Error loading rewards:', error);
            this.rewards = this.getDefaultRewards();
        }
    }

    getDefaultRewards() {
        return [
            {
                id: 1,
                name: 'Энгравинги',
                type: 'Engraving',
                rarity: 'Legendary',
                dropRate: 0.15,
                value: 50000
            },
            {
                id: 2,
                name: 'Материалы для улучшения',
                type: 'Material',
                rarity: 'Epic',
                dropRate: 0.8,
                value: 10000
            },
            {
                id: 3,
                name: 'Карты',
                type: 'Card',
                rarity: 'Rare',
                dropRate: 0.3,
                value: 25000
            }
        ];
    }

    loadRaidLogs() {
        try {
            const saved = localStorage.getItem('raidLogs');
            this.raidLogs = saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error loading raid logs:', error);
            this.raidLogs = [];
        }
    }

    bindEvents() {
        // Create raid button
        const createRaidBtn = document.getElementById('createRaidBtn');
        if (createRaidBtn) {
            createRaidBtn.addEventListener('click', () => this.showCreateRaidModal());
        }

        // WebSocket обработчики для обновлений рейдов
        this.setupWebSocketHandlers();

        // Raid form submission
        const raidForm = document.getElementById('raidForm');
        if (raidForm) {
            raidForm.addEventListener('submit', (e) => this.handleRaidSubmit(e));
        }

        // Raid actions
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('join-raid')) {
                const raidId = parseInt(e.target.dataset.raidId);
                this.joinRaid(raidId);
            } else if (e.target.classList.contains('leave-raid')) {
                const raidId = parseInt(e.target.dataset.raidId);
                this.leaveRaid(raidId);
            } else if (e.target.classList.contains('start-raid')) {
                const raidId = parseInt(e.target.dataset.raidId);
                this.startRaid(raidId);
            } else if (e.target.classList.contains('complete-raid')) {
                const raidId = parseInt(e.target.dataset.raidId);
                this.completeRaid(raidId);
            } else if (e.target.classList.contains('cancel-raid')) {
                const raidId = parseInt(e.target.dataset.raidId);
                this.cancelRaid(raidId);
            } else if (e.target.classList.contains('edit-raid')) {
                const raidId = parseInt(e.target.dataset.raidId);
                this.editRaid(raidId);
            } else if (e.target.classList.contains('delete-raid')) {
                const raidId = parseInt(e.target.dataset.raidId);
                this.deleteRaid(raidId);
            }
        });

        // Filter and search
        const searchInput = document.getElementById('raidSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.filterRaids(e.target.value));
        }

        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => this.filterByStatus(e.target.value));
        }

        const difficultyFilter = document.getElementById('difficultyFilter');
        if (difficultyFilter) {
            difficultyFilter.addEventListener('change', (e) => this.filterByDifficulty(e.target.value));
        }
    }

    showCreateRaidModal() {
        const modal = document.getElementById('createRaidModal');
        if (modal) {
            modal.style.display = 'block';
            this.populateTemplateSelector();
        }
    }

    hideCreateRaidModal() {
        const modal = document.getElementById('createRaidModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    populateTemplateSelector() {
        const templateSelect = document.getElementById('raidTemplate');
        if (templateSelect) {
            templateSelect.innerHTML = '<option value="">Выберите шаблон...</option>' +
                this.raidTemplates.map(template => 
                    `<option value="${template.id}">${template.name}</option>`
                ).join('');
        }
    }

    handleRaidSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const raidData = {
            name: formData.get('name'),
            type: formData.get('type'),
            difficulty: formData.get('difficulty'),
            date: formData.get('date'),
            time: formData.get('time'),
            duration: parseInt(formData.get('duration')),
            maxParticipants: parseInt(formData.get('maxParticipants')),
            minItemLevel: parseInt(formData.get('minItemLevel')),
            description: formData.get('description'),
            requirements: formData.get('requirements').split('\n').filter(r => r.trim()),
            rewards: formData.get('rewards').split('\n').filter(r => r.trim()),
            leader: formData.get('leader')
        };

        this.createRaid(raidData);
        this.hideCreateRaidModal();
        e.target.reset();
    }

    createRaid(raidData) {
        const newRaid = {
            id: Date.now(),
            ...raidData,
            status: 'Scheduled',
            participants: [],
            notes: '',
            createdAt: new Date().toISOString()
        };

        this.raids.push(newRaid);
        this.saveRaids();
        this.render();
        
        if (window.notifications) {
            window.notifications.show('Рейд создан', 'success');
        }

        // Log the action
        this.logRaidAction('create', newRaid);

        // Отправляем обновление через WebSocket
        if (window.wsClient && window.wsClient.isConnected) {
            window.wsClient.sendRaidUpdate(newRaid.id, 'create', newRaid);
            console.log('WebSocket: Отправлено обновление рейда');
        }
    }

    joinRaid(raidId) {
        const raid = this.raids.find(r => r.id === raidId);
        if (!raid) return;

        const currentUser = this.getCurrentUser();
        if (!currentUser) {
            if (window.notifications) {
                window.notifications.show('Необходимо войти в систему', 'error');
            }
            return;
        }

        if (raid.participants.length >= raid.maxParticipants) {
            if (window.notifications) {
                window.notifications.show('Рейд заполнен', 'warning');
            }
            return;
        }

        if (raid.participants.includes(currentUser.name)) {
            if (window.notifications) {
                window.notifications.show('Вы уже в рейде', 'info');
            }
            return;
        }

        raid.participants.push(currentUser.name);
        this.saveRaids();
        this.render();
        
        if (window.notifications) {
            window.notifications.show('Вы присоединились к рейду', 'success');
        }

        this.logRaidAction('join', raid, currentUser.name);
    }

    leaveRaid(raidId) {
        const raid = this.raids.find(r => r.id === raidId);
        if (!raid) return;

        const currentUser = this.getCurrentUser();
        if (!currentUser) return;

        const index = raid.participants.indexOf(currentUser.name);
        if (index !== -1) {
            raid.participants.splice(index, 1);
            this.saveRaids();
            this.render();
            
            if (window.notifications) {
                window.notifications.show('Вы покинули рейд', 'info');
            }

            this.logRaidAction('leave', raid, currentUser.name);
        }
    }

    startRaid(raidId) {
        const raid = this.raids.find(r => r.id === raidId);
        if (!raid) return;

        if (raid.status !== 'Scheduled') {
            if (window.notifications) {
                window.notifications.show('Рейд уже начат или завершен', 'warning');
            }
            return;
        }

        raid.status = 'In Progress';
        raid.startedAt = new Date().toISOString();
        this.saveRaids();
        this.render();
        
        if (window.notifications) {
            window.notifications.show('Рейд начался!', 'success');
        }

        this.logRaidAction('start', raid);
    }

    completeRaid(raidId) {
        const raid = this.raids.find(r => r.id === raidId);
        if (!raid) return;

        if (raid.status !== 'In Progress') {
            if (window.notifications) {
                window.notifications.show('Рейд не начат', 'warning');
            }
            return;
        }

        raid.status = 'Completed';
        raid.completedAt = new Date().toISOString();
        this.saveRaids();
        this.render();
        
        if (window.notifications) {
            window.notifications.show('Рейд завершен!', 'success');
        }

        this.logRaidAction('complete', raid);
        this.distributeRewards(raid);
    }

    cancelRaid(raidId) {
        const raid = this.raids.find(r => r.id === raidId);
        if (!raid) return;

        if (raid.status !== 'Scheduled') {
            if (window.notifications) {
                window.notifications.show('Нельзя отменить начатый рейд', 'warning');
            }
            return;
        }

        raid.status = 'Cancelled';
        raid.cancelledAt = new Date().toISOString();
        this.saveRaids();
        this.render();
        
        if (window.notifications) {
            window.notifications.show('Рейд отменен', 'info');
        }

        this.logRaidAction('cancel', raid);
    }

    editRaid(raidId) {
        const raid = this.raids.find(r => r.id === raidId);
        if (!raid) return;

        // Populate form with raid data
        const form = document.getElementById('raidForm');
        if (form) {
            form.querySelector('[name="name"]').value = raid.name;
            form.querySelector('[name="type"]').value = raid.type;
            form.querySelector('[name="difficulty"]').value = raid.difficulty;
            form.querySelector('[name="date"]').value = raid.date.split('T')[0];
            form.querySelector('[name="time"]').value = raid.time;
            form.querySelector('[name="duration"]').value = raid.duration;
            form.querySelector('[name="maxParticipants"]').value = raid.maxParticipants;
            form.querySelector('[name="minItemLevel"]').value = raid.minItemLevel;
            form.querySelector('[name="description"]').value = raid.description;
            form.querySelector('[name="requirements"]').value = raid.requirements.join('\n');
            form.querySelector('[name="rewards"]').value = raid.rewards.join('\n');
            form.querySelector('[name="leader"]').value = raid.leader;
        }

        this.showCreateRaidModal();
    }

    deleteRaid(raidId) {
        const raid = this.raids.find(r => r.id === raidId);
        if (!raid) return;

        if (confirm(`Вы уверены, что хотите удалить рейд "${raid.name}"?`)) {
            this.raids = this.raids.filter(r => r.id !== raidId);
            this.saveRaids();
            this.render();
            
            if (window.notifications) {
                window.notifications.show('Рейд удален', 'info');
            }

            this.logRaidAction('delete', raid);
        }
    }

    filterRaids(searchTerm) {
        const filteredRaids = this.raids.filter(raid => 
            raid.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            raid.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            raid.leader.toLowerCase().includes(searchTerm.toLowerCase())
        );
        this.renderRaidsList(filteredRaids);
    }

    filterByStatus(status) {
        if (status === 'all') {
            this.renderRaidsList(this.raids);
        } else {
            const filteredRaids = this.raids.filter(raid => raid.status === status);
            this.renderRaidsList(filteredRaids);
        }
    }

    filterByDifficulty(difficulty) {
        if (difficulty === 'all') {
            this.renderRaidsList(this.raids);
        } else {
            const filteredRaids = this.raids.filter(raid => raid.difficulty === difficulty);
            this.renderRaidsList(filteredRaids);
        }
    }

    getCurrentUser() {
        // Get current user from chat system or create default
        if (window.chatSystem && window.chatSystem.currentUser) {
            return window.chatSystem.currentUser;
        }
        
        return {
            name: 'Player' + Math.floor(Math.random() * 1000),
            class: 'Unknown',
            itemLevel: 0
        };
    }

    distributeRewards(raid) {
        // Simulate reward distribution
        raid.participants.forEach(participant => {
            const reward = this.calculateReward(raid.difficulty);
            this.logRaidAction('reward', raid, participant, reward);
        });
    }

    calculateReward(difficulty) {
        const baseReward = 10000;
        const multipliers = {
            'Normal': 1,
            'Hard': 1.5,
            'Hell': 2
        };
        
        return Math.floor(baseReward * (multipliers[difficulty] || 1));
    }

    logRaidAction(action, raid, user = null, details = null) {
        const logEntry = {
            id: Date.now(),
            action: action,
            raidId: raid.id,
            raidName: raid.name,
            user: user || 'System',
            timestamp: new Date().toISOString(),
            details: details
        };

        this.raidLogs.push(logEntry);
        this.saveRaidLogs();
    }

    saveRaids() {
        try {
            localStorage.setItem('raids', JSON.stringify(this.raids));
        } catch (error) {
            console.error('Error saving raids:', error);
        }
    }

    saveRaidLogs() {
        try {
            localStorage.setItem('raidLogs', JSON.stringify(this.raidLogs));
        } catch (error) {
            console.error('Error saving raid logs:', error);
        }
    }

    startAutoSave() {
        setInterval(() => {
            this.saveRaids();
            this.saveRaidLogs();
        }, 30000); // Save every 30 seconds
    }

    render() {
        const container = document.getElementById('raidsContainer');
        if (!container) return;

        container.innerHTML = `
            <div class="raids-header">
                <div class="raids-controls">
                    <button class="btn btn-primary" id="createRaidBtn">
                        <i class="fas fa-plus"></i> Создать рейд
                    </button>
                    <div class="raids-filters">
                        <input type="text" id="raidSearchInput" placeholder="Поиск рейдов..." class="form-control">
                        <select id="statusFilter" class="form-control">
                            <option value="all">Все статусы</option>
                            <option value="Scheduled">Запланирован</option>
                            <option value="In Progress">В процессе</option>
                            <option value="Completed">Завершен</option>
                            <option value="Cancelled">Отменен</option>
                        </select>
                        <select id="difficultyFilter" class="form-control">
                            <option value="all">Все сложности</option>
                            <option value="Normal">Обычная</option>
                            <option value="Hard">Сложная</option>
                            <option value="Hell">Адская</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <div class="raids-content">
                <div class="raids-list" id="raidsList">
                    <!-- Raids will be populated here -->
                </div>
            </div>
        `;

        this.renderRaidsList(this.raids);
    }

    renderRaidsList(raids) {
        const raidsList = document.getElementById('raidsList');
        if (!raidsList) return;

        if (raids.length === 0) {
            raidsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users"></i>
                    <h3>Нет рейдов</h3>
                    <p>Создайте свой первый рейд для начала работы</p>
                    <button class="btn btn-primary" onclick="raidsManager.showCreateRaidModal()">
                        Создать рейд
                    </button>
                </div>
            `;
            return;
        }

        raidsList.innerHTML = raids.map(raid => `
            <div class="raid-card ${raid.status.toLowerCase().replace(' ', '-')}" data-id="${raid.id}">
                <div class="raid-header">
                    <div class="raid-title">
                        <h3>${raid.name}</h3>
                        <span class="raid-type ${raid.type.toLowerCase().replace(' ', '-')}">${raid.type}</span>
                        <span class="raid-difficulty ${raid.difficulty.toLowerCase()}">${raid.difficulty}</span>
                    </div>
                    <div class="raid-status ${raid.status.toLowerCase().replace(' ', '-')}">
                        ${this.getStatusDisplayName(raid.status)}
                    </div>
                </div>
                
                <div class="raid-info">
                    <div class="raid-details">
                        <div class="detail">
                            <i class="fas fa-calendar"></i>
                            <span>${this.formatDate(raid.date)} в ${raid.time}</span>
                        </div>
                        <div class="detail">
                            <i class="fas fa-clock"></i>
                            <span>${raid.duration} мин</span>
                        </div>
                        <div class="detail">
                            <i class="fas fa-users"></i>
                            <span>${raid.participants.length}/${raid.maxParticipants}</span>
                        </div>
                        <div class="detail">
                            <i class="fas fa-shield-alt"></i>
                            <span>IL ${raid.minItemLevel}+</span>
                        </div>
                    </div>
                    
                    <div class="raid-description">
                        <p>${raid.description}</p>
                    </div>
                    
                    <div class="raid-requirements">
                        <h4>Требования:</h4>
                        <ul>
                            ${raid.requirements.map(req => `<li>${req}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div class="raid-rewards">
                        <h4>Награды:</h4>
                        <ul>
                            ${raid.rewards.map(reward => `<li>${reward}</li>`).join('')}
                        </ul>
                    </div>
                </div>
                
                <div class="raid-participants">
                    <h4>Участники:</h4>
                    <div class="participants-list">
                        ${raid.participants.length > 0 ? 
                            raid.participants.map(participant => 
                                `<span class="participant">${participant}</span>`
                            ).join('') : 
                            '<span class="no-participants">Нет участников</span>'
                        }
                    </div>
                </div>
                
                <div class="raid-actions">
                    ${this.getRaidActions(raid)}
                </div>
            </div>
        `).join('');
    }

    getStatusDisplayName(status) {
        const statuses = {
            'Scheduled': 'Запланирован',
            'In Progress': 'В процессе',
            'Completed': 'Завершен',
            'Cancelled': 'Отменен'
        };
        return statuses[status] || status;
    }

    getRaidActions(raid) {
        const currentUser = this.getCurrentUser();
        const isParticipant = raid.participants.includes(currentUser.name);
        const isLeader = raid.leader === currentUser.name;
        const canJoin = raid.status === 'Scheduled' && !isParticipant && raid.participants.length < raid.maxParticipants;
        const canLeave = raid.status === 'Scheduled' && isParticipant;
        const canStart = raid.status === 'Scheduled' && isLeader;
        const canComplete = raid.status === 'In Progress' && isLeader;
        const canCancel = raid.status === 'Scheduled' && isLeader;
        const canEdit = raid.status === 'Scheduled' && isLeader;
        const canDelete = raid.status === 'Scheduled' && isLeader;

        let actions = '';

        if (canJoin) {
            actions += `<button class="btn btn-success btn-sm join-raid" data-raid-id="${raid.id}">
                <i class="fas fa-plus"></i> Присоединиться
            </button>`;
        }

        if (canLeave) {
            actions += `<button class="btn btn-warning btn-sm leave-raid" data-raid-id="${raid.id}">
                <i class="fas fa-minus"></i> Покинуть
            </button>`;
        }

        if (canStart) {
            actions += `<button class="btn btn-primary btn-sm start-raid" data-raid-id="${raid.id}">
                <i class="fas fa-play"></i> Начать
            </button>`;
        }

        if (canComplete) {
            actions += `<button class="btn btn-success btn-sm complete-raid" data-raid-id="${raid.id}">
                <i class="fas fa-check"></i> Завершить
            </button>`;
        }

        if (canCancel) {
            actions += `<button class="btn btn-danger btn-sm cancel-raid" data-raid-id="${raid.id}">
                <i class="fas fa-times"></i> Отменить
            </button>`;
        }

        if (canEdit) {
            actions += `<button class="btn btn-secondary btn-sm edit-raid" data-raid-id="${raid.id}">
                <i class="fas fa-edit"></i> Редактировать
            </button>`;
        }

        if (canDelete) {
            actions += `<button class="btn btn-danger btn-sm delete-raid" data-raid-id="${raid.id}">
                <i class="fas fa-trash"></i> Удалить
            </button>`;
        }

        return actions;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    getRaidById(id) {
        return this.raids.find(r => r.id === parseInt(id));
    }

    getRaidsByStatus(status) {
        return this.raids.filter(r => r.status === status);
    }

    getRaidsByDifficulty(difficulty) {
        return this.raids.filter(r => r.difficulty === difficulty);
    }

    getUpcomingRaids() {
        const now = new Date();
        return this.raids.filter(r => 
            r.status === 'Scheduled' && new Date(r.date) > now
        ).sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    getCompletedRaids() {
        return this.raids.filter(r => r.status === 'Completed');
    }

    getRaidStatistics() {
        const total = this.raids.length;
        const completed = this.getCompletedRaids().length;
        const scheduled = this.getRaidsByStatus('Scheduled').length;
        const inProgress = this.getRaidsByStatus('In Progress').length;
        const cancelled = this.getRaidsByStatus('Cancelled').length;

        return {
            total,
            completed,
            scheduled,
            inProgress,
            cancelled,
            completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
        };
    }

    setupWebSocketHandlers() {
        if (!window.wsClient) return;

        // Обработчик обновлений рейдов
        window.wsClient.on('raid_update', (data) => {
            this.handleRaidUpdate(data);
        });

        console.log('Raids: WebSocket обработчики настроены');
    }

    handleRaidUpdate(data) {
        const { raidId, action, raidData, user } = data;
        
        console.log(`WebSocket: Обновление рейда ${action}`, raidData);

        switch (action) {
            case 'create':
                // Новый рейд создан другим пользователем
                if (!this.raids.find(r => r.id === raidId)) {
                    this.raids.unshift(raidData);
                    this.saveRaids();
                    this.render();
                    
                    if (window.notifications) {
                        window.notifications.show(`Новый рейд: ${raidData.name}`, 'info');
                    }
                }
                break;
                
            case 'update':
                // Рейд обновлен
                const raidIndex = this.raids.findIndex(r => r.id === raidId);
                if (raidIndex !== -1) {
                    this.raids[raidIndex] = { ...this.raids[raidIndex], ...raidData };
                    this.saveRaids();
                    this.render();
                    
                    if (window.notifications) {
                        window.notifications.show(`Рейд обновлен: ${raidData.name || 'Неизвестно'}`, 'info');
                    }
                }
                break;
                
            case 'delete':
                // Рейд удален
                this.raids = this.raids.filter(r => r.id !== raidId);
                this.saveRaids();
                this.render();
                
                if (window.notifications) {
                    window.notifications.show('Рейд удален', 'warning');
                }
                break;
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.raidsManager = new RaidsManager();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RaidsManager;
}