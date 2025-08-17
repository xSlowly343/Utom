// Characters Module
class CharactersModule {
    constructor() {
        this.characters = [];
        this.init();
    }

    init() {
        this.initEventListeners();
        this.loadCharacters();
    }

    initEventListeners() {
        // Add character button
        const addCharacterBtn = document.getElementById('addCharacterBtn');
        if (addCharacterBtn) {
            addCharacterBtn.addEventListener('click', () => this.showAddCharacterModal());
        }
    }

    async loadCharacters() {
        try {
            this.characters = await this.getCharactersFromStorage();
            this.renderCharacters();
        } catch (error) {
            console.error('Failed to load characters:', error);
        }
    }

    async getCharactersFromStorage() {
        // Mock data for now
        return [
            {
                id: 1,
                name: 'BerserkerMain',
                class: 'Berserker',
                level: 60,
                ilvl: 1580,
                server: 'Азуна',
                guild: 'EpicGuild',
                engravings: ['Mayhem', 'Master\'s Tenacity'],
                stats: {
                    strength: 1850,
                    crit: 1650,
                    swiftness: 1200,
                    domination: 800
                },
                gear: {
                    weapon: 1580,
                    helmet: 1580,
                    shoulders: 1580,
                    chest: 1580,
                    gloves: 1580,
                    pants: 1580,
                    boots: 1580
                }
            },
            {
                id: 2,
                name: 'BardSupport',
                class: 'Bard',
                level: 60,
                ilvl: 1575,
                server: 'Азуна',
                guild: 'EpicGuild',
                engravings: ['Desperate Salvation', 'Heavy Armor'],
                stats: {
                    intelligence: 1800,
                    crit: 1400,
                    swiftness: 1600,
                    specialization: 1000
                },
                gear: {
                    weapon: 1575,
                    helmet: 1575,
                    shoulders: 1575,
                    chest: 1575,
                    gloves: 1575,
                    pants: 1575,
                    boots: 1575
                }
            }
        ];
    }

    renderCharacters() {
        const charactersGrid = document.getElementById('charactersGrid');
        if (!charactersGrid) return;

        charactersGrid.innerHTML = '';

        if (this.characters.length === 0) {
            charactersGrid.innerHTML = `
                <div class="no-characters">
                    <i class="fas fa-user-slash"></i>
                    <h3>Персонажи не найдены</h3>
                    <p>Добавьте своего первого персонажа для начала работы</p>
                    <button class="btn btn-primary" onclick="charactersModule.showAddCharacterModal()">
                        <i class="fas fa-plus"></i>
                        Добавить персонажа
                    </button>
                </div>
            `;
            return;
        }

        this.characters.forEach(character => {
            const characterElement = this.createCharacterElement(character);
            charactersGrid.appendChild(characterElement);
        });
    }

    createCharacterElement(character) {
        const characterElement = document.createElement('div');
        characterElement.className = 'character-card';
        characterElement.dataset.characterId = character.id;

        const avgGear = this.calculateAverageGear(character.gear);
        const mainStat = this.getMainStat(character.class);

        characterElement.innerHTML = `
            <div class="character-avatar">
                <i class="fas fa-user-shield"></i>
            </div>
            
            <div class="character-name">${character.name}</div>
            <div class="character-class">${character.class}</div>
            
            <div class="character-stats">
                <div class="character-stat">
                    <div class="character-stat-value">${character.ilvl}</div>
                    <div class="character-stat-label">Уровень предметов</div>
                </div>
                <div class="character-stat">
                    <div class="character-stat-value">${character.level}</div>
                    <div class="character-stat-label">Уровень</div>
                </div>
            </div>
            
            <div class="character-details">
                <div class="detail-item">
                    <span class="detail-label">Сервер:</span>
                    <span class="detail-value">${character.server}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Гильдия:</span>
                    <span class="detail-value">${character.guild}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Главная характеристика:</span>
                    <span class="detail-value">${mainStat}</span>
                </div>
            </div>
            
            <div class="character-engravings">
                <h4>Гравировки:</h4>
                <div class="engravings-list">
                    ${character.engravings.map(engraving => `
                        <span class="engraving-tag">${engraving}</span>
                    `).join('')}
                </div>
            </div>
            
            <div class="character-actions">
                <button class="btn btn-secondary" onclick="charactersModule.editCharacter(${character.id})">
                    <i class="fas fa-edit"></i>
                    Редактировать
                </button>
                <button class="btn btn-primary" onclick="charactersModule.viewDetails(${character.id})">
                    <i class="fas fa-eye"></i>
                    Детали
                </button>
                <button class="btn btn-danger" onclick="charactersModule.deleteCharacter(${character.id})">
                    <i class="fas fa-trash"></i>
                    Удалить
                </button>
            </div>
        `;

        return characterElement;
    }

    calculateAverageGear(gear) {
        const values = Object.values(gear);
        return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
    }

    getMainStat(characterClass) {
        const statMap = {
            'Berserker': 'Сила',
            'Gunlancer': 'Сила',
            'Destroyer': 'Сила',
            'Bard': 'Интеллект',
            'Sorceress': 'Интеллект',
            'Arcanist': 'Интеллект',
            'Deathblade': 'Ловкость',
            'Shadowhunter': 'Ловкость',
            'Reaper': 'Ловкость',
            'Artillerist': 'Ловкость',
            'Deadeye': 'Ловкость',
            'Sharpshooter': 'Ловкость',
            'Machinist': 'Ловкость',
            'Gunslinger': 'Ловкость',
            'Paladin': 'Сила',
            'Artist': 'Интеллект',
            'Aeromancer': 'Интеллект',
            'Slayer': 'Сила'
        };
        
        return statMap[characterClass] || 'Неизвестно';
    }

    showAddCharacterModal() {
        // Implementation for add character modal
        console.log('Show add character modal');
        this.createAddCharacterModal();
    }

    createAddCharacterModal() {
        // Create modal HTML
        const modalHTML = `
            <div class="modal" id="addCharacterModal">
                <div class="modal-header">
                    <h3>Добавить персонажа</h3>
                    <button class="modal-close" id="closeAddCharacterModal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="addCharacterForm">
                        <div class="form-group">
                            <label>Имя персонажа</label>
                            <input type="text" id="characterNameInput" required>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>Класс</label>
                                <select id="characterClassInput" required>
                                    <option value="">Выберите класс</option>
                                    <option value="Berserker">Berserker</option>
                                    <option value="Gunlancer">Gunlancer</option>
                                    <option value="Destroyer">Destroyer</option>
                                    <option value="Bard">Bard</option>
                                    <option value="Sorceress">Sorceress</option>
                                    <option value="Arcanist">Arcanist</option>
                                    <option value="Deathblade">Deathblade</option>
                                    <option value="Shadowhunter">Shadowhunter</option>
                                    <option value="Reaper">Reaper</option>
                                    <option value="Artillerist">Artillerist</option>
                                    <option value="Deadeye">Deadeye</option>
                                    <option value="Sharpshooter">Sharpshooter</option>
                                    <option value="Machinist">Machinist</option>
                                    <option value="Gunslinger">Gunslinger</option>
                                    <option value="Paladin">Paladin</option>
                                    <option value="Artist">Artist</option>
                                    <option value="Aeromancer">Aeromancer</option>
                                    <option value="Slayer">Slayer</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label>Уровень предметов</label>
                                <input type="number" id="characterIlvlInput" min="1300" max="2000" value="1300" required>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>Сервер</label>
                            <input type="text" id="characterServerInput" placeholder="Введите название сервера" required>
                        </div>
                        
                        <div class="form-group">
                            <label>Гильдия</label>
                            <input type="text" id="characterGuildInput" placeholder="Введите название гильдии">
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="cancelAddCharacterBtn">Отмена</button>
                    <button class="btn btn-primary" id="createCharacterBtn">Добавить</button>
                </div>
            </div>
        `;

        // Add modal to page
        const modalOverlay = document.getElementById('modalOverlay');
        if (modalOverlay) {
            modalOverlay.innerHTML += modalHTML;
            modalOverlay.classList.add('active');
            
            // Add event listeners
            this.initAddCharacterModalEvents();
        }
    }

    initAddCharacterModalEvents() {
        const modal = document.getElementById('addCharacterModal');
        if (!modal) return;

        const closeBtn = document.getElementById('closeAddCharacterModal');
        const cancelBtn = document.getElementById('cancelAddCharacterBtn');
        const createBtn = document.getElementById('createCharacterBtn');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideAddCharacterModal());
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.hideAddCharacterModal());
        }

        if (createBtn) {
            createBtn.addEventListener('click', () => this.createCharacter());
        }
    }

    hideAddCharacterModal() {
        const modal = document.getElementById('addCharacterModal');
        const overlay = document.getElementById('modalOverlay');
        
        if (modal && overlay) {
            modal.remove();
            overlay.classList.remove('active');
        }
    }

    async createCharacter() {
        try {
            const name = document.getElementById('characterNameInput')?.value;
            const characterClass = document.getElementById('characterClassInput')?.value;
            const ilvl = parseInt(document.getElementById('characterIlvlInput')?.value || '1300');
            const server = document.getElementById('characterServerInput')?.value;
            const guild = document.getElementById('characterGuildInput')?.value;

            if (!name || !characterClass || !server) {
                this.showError('Пожалуйста, заполните все обязательные поля');
                return;
            }

            const newCharacter = {
                id: Date.now(),
                name,
                class: characterClass,
                level: 60,
                ilvl,
                server,
                guild: guild || 'Без гильдии',
                engravings: [],
                stats: this.getDefaultStats(characterClass),
                gear: this.getDefaultGear(ilvl),
                createdAt: new Date().toISOString()
            };

            this.characters.push(newCharacter);
            await this.saveCharactersToStorage();
            this.renderCharacters();
            this.hideAddCharacterModal();
            this.showSuccess('Персонаж успешно добавлен!');

        } catch (error) {
            console.error('Failed to create character:', error);
            this.showError('Ошибка создания персонажа');
        }
    }

    getDefaultStats(characterClass) {
        const isStrength = ['Berserker', 'Gunlancer', 'Destroyer', 'Paladin', 'Slayer'].includes(characterClass);
        const isIntelligence = ['Bard', 'Sorceress', 'Arcanist', 'Artist', 'Aeromancer'].includes(characterClass);
        const isAgility = ['Deathblade', 'Shadowhunter', 'Reaper', 'Artillerist', 'Deadeye', 'Sharpshooter', 'Machinist', 'Gunslinger'].includes(characterClass);

        if (isStrength) {
            return { strength: 1500, crit: 1200, swiftness: 800, domination: 600 };
        } else if (isIntelligence) {
            return { intelligence: 1500, crit: 1200, swiftness: 800, specialization: 600 };
        } else if (isAgility) {
            return { agility: 1500, crit: 1200, swiftness: 800, domination: 600 };
        }

        return { strength: 1000, crit: 1000, swiftness: 1000, domination: 1000 };
    }

    getDefaultGear(ilvl) {
        return {
            weapon: ilvl,
            helmet: ilvl,
            shoulders: ilvl,
            chest: ilvl,
            gloves: ilvl,
            pants: ilvl,
            boots: ilvl
        };
    }

    async editCharacter(characterId) {
        try {
            const character = this.characters.find(c => c.id === characterId);
            if (!character) {
                this.showError('Персонаж не найден');
                return;
            }

            console.log('Edit character:', character);
            // Implementation for edit modal

        } catch (error) {
            console.error('Failed to edit character:', error);
            this.showError('Ошибка редактирования персонажа');
        }
    }

    async viewDetails(characterId) {
        try {
            const character = this.characters.find(c => c.id === characterId);
            if (!character) {
                this.showError('Персонаж не найден');
                return;
            }

            console.log('View character details:', character);
            // Implementation for details view

        } catch (error) {
            console.error('Failed to view character details:', error);
            this.showError('Ошибка просмотра деталей персонажа');
        }
    }

    async deleteCharacter(characterId) {
        try {
            const character = this.characters.find(c => c.id === characterId);
            if (!character) {
                this.showError('Персонаж не найден');
                return;
            }

            if (!confirm(`Вы уверены, что хотите удалить персонажа "${character.name}"?`)) {
                return;
            }

            this.characters = this.characters.filter(c => c.id !== characterId);
            await this.saveCharactersToStorage();
            this.renderCharacters();
            this.showSuccess('Персонаж успешно удален!');

        } catch (error) {
            console.error('Failed to delete character:', error);
            this.showError('Ошибка удаления персонажа');
        }
    }

    async saveCharactersToStorage() {
        try {
            localStorage.setItem('lostArkCharacters', JSON.stringify(this.characters));
        } catch (error) {
            console.error('Failed to save characters:', error);
        }
    }

    showError(message) {
        console.error(message);
        this.createNotification(message, 'error');
    }

    showSuccess(message) {
        console.log(message);
        this.createNotification(message, 'success');
    }

    createNotification(message, type) {
        console.log(`${type} notification:`, message);
    }

    // Public methods
    getCharacters() {
        return this.characters;
    }

    getCharacterById(id) {
        return this.characters.find(c => c.id === id);
    }

    addCharacter(character) {
        this.characters.push(character);
        this.renderCharacters();
    }

    updateCharacter(characterId, updates) {
        const characterIndex = this.characters.findIndex(c => c.id === characterId);
        if (characterIndex !== -1) {
            this.characters[characterIndex] = { ...this.characters[characterIndex], ...updates };
            this.renderCharacters();
        }
    }

    removeCharacter(characterId) {
        this.characters = this.characters.filter(c => c.id !== characterId);
        this.renderCharacters();
    }
}

// Initialize characters module when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.charactersModule = new CharactersModule();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CharactersModule;
}