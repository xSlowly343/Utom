// Raids Module
class RaidsModule {
    constructor() {
        this.raids = [];
        this.filters = {
            status: 'all',
            type: 'all'
        };
        this.init();
    }

    init() {
        this.initEventListeners();
        this.loadRaids();
    }

    initEventListeners() {
        // New raid button
        const newRaidBtn = document.getElementById('newRaidBtn');
        if (newRaidBtn) {
            newRaidBtn.addEventListener('click', () => this.showNewRaidModal());
        }

        // Filter change events
        const statusFilter = document.getElementById('raidStatusFilter');
        const typeFilter = document.getElementById('raidTypeFilter');
        
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.filters.status = e.target.value;
                this.applyFilters();
            });
        }
        
        if (typeFilter) {
            typeFilter.addEventListener('change', (e) => {
                this.filters.type = e.target.value;
                this.applyFilters();
            });
        }

        // Modal events
        this.initModalEvents();
    }

    initModalEvents() {
        // New raid modal
        const modal = document.getElementById('newRaidModal');
        if (modal) {
            const closeBtn = document.getElementById('closeNewRaidModal');
            const cancelBtn = document.getElementById('cancelNewRaidBtn');
            const createBtn = document.getElementById('createRaidBtn');
            const form = document.getElementById('newRaidForm');

            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.hideNewRaidModal());
            }

            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => this.hideNewRaidModal());
            }

            if (createBtn) {
                createBtn.addEventListener('click', () => this.createRaid());
            }

            if (form) {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.createRaid();
                });
            }
        }
    }

    async loadRaids() {
        try {
            // Load raids from database or local storage
            this.raids = await this.getRaidsFromStorage();
            this.renderRaids();
        } catch (error) {
            console.error('Failed to load raids:', error);
            this.showError('Ошибка загрузки рейдов');
        }
    }

    async getRaidsFromStorage() {
        // Mock data for now - will be replaced with database calls
        return [
            {
                id: 1,
                name: 'Вальтан',
                type: 'legion',
                status: 'active',
                date: '2024-01-20T20:00:00',
                maxPlayers: 8,
                currentPlayers: 6,
                description: 'Легион рейд Вальтан',
                participants: [
                    { id: 1, name: 'Player1', class: 'Berserker', ilvl: 1580 },
                    { id: 2, name: 'Player2', class: 'Gunlancer', ilvl: 1575 },
                    { id: 3, name: 'Player3', class: 'Bard', ilvl: 1585 },
                    { id: 4, name: 'Player4', class: 'Sorceress', ilvl: 1580 },
                    { id: 5, name: 'Player5', class: 'Deathblade', ilvl: 1570 },
                    { id: 6, name: 'Player6', class: 'Shadowhunter', ilvl: 1580 }
                ]
            },
            {
                id: 2,
                name: 'Биал',
                type: 'legion',
                status: 'scheduled',
                date: '2024-01-22T19:00:00',
                maxPlayers: 8,
                currentPlayers: 3,
                description: 'Легион рейд Биал',
                participants: [
                    { id: 1, name: 'Player1', class: 'Berserker', ilvl: 1580 },
                    { id: 2, name: 'Player2', class: 'Gunlancer', ilvl: 1575 },
                    { id: 3, name: 'Player3', class: 'Bard', ilvl: 1585 }
                ]
            },
            {
                id: 3,
                name: 'Кукул-Сейтон',
                type: 'legion',
                status: 'completed',
                date: '2024-01-18T21:00:00',
                maxPlayers: 8,
                currentPlayers: 8,
                description: 'Легион рейд Кукул-Сейтон',
                participants: [
                    { id: 1, name: 'Player1', class: 'Berserker', ilvl: 1580 },
                    { id: 2, name: 'Player2', class: 'Gunlancer', ilvl: 1575 },
                    { id: 3, name: 'Player3', class: 'Bard', ilvl: 1585 },
                    { id: 4, name: 'Player4', class: 'Sorceress', ilvl: 1580 },
                    { id: 5, name: 'Player5', class: 'Deathblade', ilvl: 1570 },
                    { id: 6, name: 'Player6', class: 'Shadowhunter', ilvl: 1580 },
                    { id: 7, name: 'Player7', class: 'Artillerist', ilvl: 1585 },
                    { id: 8, name: 'Player8', class: 'Paladin', ilvl: 1580 }
                ]
            }
        ];
    }

    renderRaids() {
        const raidsList = document.getElementById('raidsList');
        if (!raidsList) return;

        // Clear existing raids
        raidsList.innerHTML = '';

        // Filter raids based on current filters
        const filteredRaids = this.getFilteredRaids();

        if (filteredRaids.length === 0) {
            raidsList.innerHTML = `
                <div class="no-raids">
                    <i class="fas fa-users-slash"></i>
                    <h3>Рейды не найдены</h3>
                    <p>Попробуйте изменить фильтры или создать новый рейд</p>
                </div>
            `;
            return;
        }

        // Render each raid
        filteredRaids.forEach(raid => {
            const raidElement = this.createRaidElement(raid);
            raidsList.appendChild(raidElement);
        });
    }

    getFilteredRaids() {
        return this.raids.filter(raid => {
            const statusMatch = this.filters.status === 'all' || raid.status === this.filters.status;
            const typeMatch = this.filters.type === 'all' || raid.type === this.filters.type;
            return statusMatch && typeMatch;
        });
    }

    createRaidElement(raid) {
        const raidElement = document.createElement('div');
        raidElement.className = 'raid-card';
        raidElement.dataset.raidId = raid.id;

        const statusClass = this.getStatusClass(raid.status);
        const statusText = this.getStatusText(raid.status);
        const typeText = this.getTypeText(raid.type);
        const date = new Date(raid.date).toLocaleString('ru-RU');

        raidElement.innerHTML = `
            <div class="raid-header">
                <h3 class="raid-title">${raid.name}</h3>
                <span class="raid-status ${statusClass}">${statusText}</span>
            </div>
            
            <div class="raid-info">
                <div class="raid-info-item">
                    <span class="raid-info-label">Тип</span>
                    <span class="raid-info-value">${typeText}</span>
                </div>
                <div class="raid-info-item">
                    <span class="raid-info-label">Дата</span>
                    <span class="raid-info-value">${date}</span>
                </div>
                <div class="raid-info-item">
                    <span class="raid-info-label">Участники</span>
                    <span class="raid-info-value">${raid.currentPlayers}/${raid.maxPlayers}</span>
                </div>
            </div>
            
            <div class="raid-participants">
                ${raid.participants.map(participant => `
                    <div class="participant-avatar" title="${participant.name} - ${participant.class} (${participant.ilvl})">
                        ${participant.name.charAt(0).toUpperCase()}
                    </div>
                `).join('')}
            </div>
            
            <div class="raid-actions">
                <button class="btn btn-secondary" onclick="raidsModule.editRaid(${raid.id})">
                    <i class="fas fa-edit"></i>
                    Редактировать
                </button>
                <button class="btn btn-primary" onclick="raidsModule.joinRaid(${raid.id})">
                    <i class="fas fa-sign-in-alt"></i>
                    Присоединиться
                </button>
                <button class="btn btn-danger" onclick="raidsModule.deleteRaid(${raid.id})">
                    <i class="fas fa-trash"></i>
                    Удалить
                </button>
            </div>
        `;

        return raidElement;
    }

    getStatusClass(status) {
        switch (status) {
            case 'active':
                return 'active';
            case 'scheduled':
                return 'scheduled';
            case 'completed':
                return 'completed';
            default:
                return '';
        }
    }

    getStatusText(status) {
        switch (status) {
            case 'active':
                return 'Активный';
            case 'scheduled':
                return 'Запланирован';
            case 'completed':
                return 'Завершен';
            default:
                return 'Неизвестно';
        }
    }

    getTypeText(type) {
        switch (type) {
            case 'legion':
                return 'Легион';
            case 'abyss':
                return 'Бездна';
            case 'guardian':
                return 'Страж';
            default:
                return 'Неизвестно';
        }
    }

    showNewRaidModal() {
        const modal = document.getElementById('newRaidModal');
        const overlay = document.getElementById('modalOverlay');
        
        if (modal && overlay) {
            overlay.classList.add('active');
            modal.style.display = 'block';
            
            // Set default date to tomorrow
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(20, 0, 0, 0);
            
            const dateInput = document.getElementById('raidDateTimeInput');
            if (dateInput) {
                dateInput.value = tomorrow.toISOString().slice(0, 16);
            }
        }
    }

    hideNewRaidModal() {
        const modal = document.getElementById('newRaidModal');
        const overlay = document.getElementById('modalOverlay');
        
        if (modal && overlay) {
            overlay.classList.remove('active');
            modal.style.display = 'none';
            
            // Reset form
            const form = document.getElementById('newRaidForm');
            if (form) {
                form.reset();
            }
        }
    }

    async createRaid() {
        try {
            const form = document.getElementById('newRaidForm');
            if (!form) return;

            const formData = new FormData(form);
            const raidData = {
                name: formData.get('raidNameInput') || document.getElementById('raidNameInput')?.value,
                type: formData.get('raidTypeInput') || document.getElementById('raidTypeInput')?.value,
                date: formData.get('raidDateTimeInput') || document.getElementById('raidDateTimeInput')?.value,
                description: formData.get('raidDescriptionInput') || document.getElementById('raidDescriptionInput')?.value,
                maxPlayers: parseInt(formData.get('raidMaxPlayersInput') || document.getElementById('raidMaxPlayersInput')?.value || '8')
            };

            // Validate required fields
            if (!raidData.name || !raidData.type || !raidData.date) {
                this.showError('Пожалуйста, заполните все обязательные поля');
                return;
            }

            // Create new raid
            const newRaid = {
                id: Date.now(),
                ...raidData,
                status: 'scheduled',
                currentPlayers: 0,
                participants: [],
                createdAt: new Date().toISOString()
            };

            // Add to raids array
            this.raids.push(newRaid);

            // Save to storage
            await this.saveRaidsToStorage();

            // Refresh display
            this.renderRaids();

            // Hide modal
            this.hideNewRaidModal();

            // Show success message
            this.showSuccess('Рейд успешно создан!');

            // Trigger notification
            if (window.app) {
                window.app.addNotification({
                    id: Date.now(),
                    type: 'success',
                    message: `Создан новый рейд: ${newRaid.name}`,
                    time: new Date(),
                    read: false
                });
            }

        } catch (error) {
            console.error('Failed to create raid:', error);
            this.showError('Ошибка создания рейда');
        }
    }

    async editRaid(raidId) {
        try {
            const raid = this.raids.find(r => r.id === raidId);
            if (!raid) {
                this.showError('Рейд не найден');
                return;
            }

            // Show edit modal (implementation needed)
            console.log('Edit raid:', raid);
            this.showEditRaidModal(raid);

        } catch (error) {
            console.error('Failed to edit raid:', error);
            this.showError('Ошибка редактирования рейда');
        }
    }

    async joinRaid(raidId) {
        try {
            const raid = this.raids.find(r => r.id === raidId);
            if (!raid) {
                this.showError('Рейд не найден');
                return;
            }

            if (raid.currentPlayers >= raid.maxPlayers) {
                this.showError('Рейд уже заполнен');
                return;
            }

            // Mock player data - in real app this would come from user profile
            const player = {
                id: Date.now(),
                name: 'CurrentPlayer',
                class: 'Berserker',
                ilvl: 1580
            };

            // Add player to raid
            raid.participants.push(player);
            raid.currentPlayers = raid.participants.length;

            // Save to storage
            await this.saveRaidsToStorage();

            // Refresh display
            this.renderRaids();

            // Show success message
            this.showSuccess('Вы успешно присоединились к рейду!');

        } catch (error) {
            console.error('Failed to join raid:', error);
            this.showError('Ошибка присоединения к рейду');
        }
    }

    async deleteRaid(raidId) {
        try {
            const raid = this.raids.find(r => r.id === raidId);
            if (!raid) {
                this.showError('Рейд не найден');
                return;
            }

            // Confirm deletion
            if (!confirm(`Вы уверены, что хотите удалить рейд "${raid.name}"?`)) {
                return;
            }

            // Remove raid from array
            this.raids = this.raids.filter(r => r.id !== raidId);

            // Save to storage
            await this.saveRaidsToStorage();

            // Refresh display
            this.renderRaids();

            // Show success message
            this.showSuccess('Рейд успешно удален!');

        } catch (error) {
            console.error('Failed to delete raid:', error);
            this.showError('Ошибка удаления рейда');
        }
    }

    applyFilters() {
        this.renderRaids();
    }

    async saveRaidsToStorage() {
        try {
            // Save to localStorage for now - will be replaced with database
            localStorage.setItem('lostArkRaids', JSON.stringify(this.raids));
        } catch (error) {
            console.error('Failed to save raids:', error);
        }
    }

    showEditRaidModal(raid) {
        // Implementation for edit modal
        console.log('Show edit modal for raid:', raid);
    }

    showError(message) {
        console.error(message);
        // Create error notification
        this.createNotification(message, 'error');
    }

    showSuccess(message) {
        console.log(message);
        // Create success notification
        this.createNotification(message, 'success');
    }

    createNotification(message, type) {
        // Implementation for notifications
        console.log(`${type} notification:`, message);
    }

    // Public methods
    getRaids() {
        return this.raids;
    }

    getRaidById(id) {
        return this.raids.find(r => r.id === id);
    }

    addRaid(raid) {
        this.raids.push(raid);
        this.renderRaids();
    }

    updateRaid(raidId, updates) {
        const raidIndex = this.raids.findIndex(r => r.id === raidId);
        if (raidIndex !== -1) {
            this.raids[raidIndex] = { ...this.raids[raidIndex], ...updates };
            this.renderRaids();
        }
    }

    removeRaid(raidId) {
        this.raids = this.raids.filter(r => r.id !== raidId);
        this.renderRaids();
    }
}

// Initialize raids module when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.raidsModule = new RaidsModule();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RaidsModule;
}