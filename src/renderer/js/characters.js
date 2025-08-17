/**
 * Characters Management Module
 * Управление персонажами в Lost Ark Raid Manager
 */

class CharactersManager {
    constructor() {
        this.characters = [];
        this.currentCharacter = null;
        this.init();
    }

    init() {
        this.loadCharacters();
        this.bindEvents();
        this.render();
    }

    bindEvents() {
        // Add character button
        const addBtn = document.getElementById('addCharacterBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showAddCharacterModal());
        }

        // Character form submission
        const form = document.getElementById('characterForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleCharacterSubmit(e));
        }

        // Character deletion
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-character')) {
                const characterId = e.target.dataset.id;
                this.deleteCharacter(characterId);
            }
        });
    }

    loadCharacters() {
        try {
            const saved = localStorage.getItem('characters');
            this.characters = saved ? JSON.parse(saved) : this.getDefaultCharacters();
        } catch (error) {
            console.error('Error loading characters:', error);
            this.characters = this.getDefaultCharacters();
        }
    }

    getDefaultCharacters() {
        return [
            {
                id: 1,
                name: 'TestCharacter',
                class: 'Berserker',
                level: 50,
                itemLevel: 1490,
                server: 'Test Server',
                engravings: ['Berserker\'s Technique', 'Grudge'],
                gems: ['Level 7 Damage Gem', 'Level 7 Cooldown Gem'],
                cards: ['Lostwind Cliff Set']
            }
        ];
    }

    saveCharacters() {
        try {
            localStorage.setItem('characters', JSON.stringify(this.characters));
        } catch (error) {
            console.error('Error saving characters:', error);
        }
    }

    addCharacter(characterData) {
        const newCharacter = {
            id: Date.now(),
            ...characterData,
            createdAt: new Date().toISOString()
        };

        this.characters.push(newCharacter);
        this.saveCharacters();
        this.render();
        
        // Show notification
        if (window.notifications) {
            window.notifications.show('Персонаж добавлен', 'success');
        }
    }

    updateCharacter(id, updates) {
        const index = this.characters.findIndex(c => c.id === parseInt(id));
        if (index !== -1) {
            this.characters[index] = { ...this.characters[index], ...updates };
            this.saveCharacters();
            this.render();
            
            if (window.notifications) {
                window.notifications.show('Персонаж обновлен', 'success');
            }
        }
    }

    deleteCharacter(id) {
        if (confirm('Вы уверены, что хотите удалить этого персонажа?')) {
            this.characters = this.characters.filter(c => c.id !== parseInt(id));
            this.saveCharacters();
            this.render();
            
            if (window.notifications) {
                window.notifications.show('Персонаж удален', 'info');
            }
        }
    }

    showAddCharacterModal() {
        const modal = document.getElementById('addCharacterModal');
        if (modal) {
            modal.style.display = 'block';
        }
    }

    hideAddCharacterModal() {
        const modal = document.getElementById('addCharacterModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    handleCharacterSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const characterData = {
            name: formData.get('name'),
            class: formData.get('class'),
            level: parseInt(formData.get('level')),
            itemLevel: parseInt(formData.get('itemLevel')),
            server: formData.get('server')
        };

        this.addCharacter(characterData);
        this.hideAddCharacterModal();
        e.target.reset();
    }

    render() {
        const container = document.getElementById('charactersContainer');
        if (!container) return;

        if (this.characters.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-user-plus"></i>
                    <h3>Нет персонажей</h3>
                    <p>Добавьте своего первого персонажа для начала работы</p>
                    <button class="btn btn-primary" onclick="charactersManager.showAddCharacterModal()">
                        Добавить персонажа
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = this.characters.map(character => `
            <div class="character-card" data-id="${character.id}">
                <div class="character-header">
                    <h3>${character.name}</h3>
                    <div class="character-class">${character.class}</div>
                </div>
                <div class="character-stats">
                    <div class="stat">
                        <span class="label">Уровень:</span>
                        <span class="value">${character.level}</span>
                    </div>
                    <div class="stat">
                        <span class="label">Предметный уровень:</span>
                        <span class="value">${character.itemLevel}</span>
                    </div>
                    <div class="stat">
                        <span class="label">Сервер:</span>
                        <span class="value">${character.server}</span>
                    </div>
                </div>
                <div class="character-actions">
                    <button class="btn btn-secondary btn-sm" onclick="charactersManager.editCharacter(${character.id})">
                        <i class="fas fa-edit"></i> Редактировать
                    </button>
                    <button class="btn btn-danger btn-sm delete-character" data-id="${character.id}">
                        <i class="fas fa-trash"></i> Удалить
                    </button>
                </div>
            </div>
        `).join('');
    }

    editCharacter(id) {
        const character = this.characters.find(c => c.id === parseInt(id));
        if (!character) return;

        // Populate form with character data
        const form = document.getElementById('characterForm');
        if (form) {
            form.querySelector('[name="name"]').value = character.name;
            form.querySelector('[name="class"]').value = character.class;
            form.querySelector('[name="level"]').value = character.level;
            form.querySelector('[name="itemLevel"]').value = character.itemLevel;
            form.querySelector('[name="server"]').value = character.server;
        }

        this.showAddCharacterModal();
    }

    getCharacterById(id) {
        return this.characters.find(c => c.id === parseInt(id));
    }

    getCharactersByClass(className) {
        return this.characters.filter(c => c.class === className);
    }

    getCharactersByServer(server) {
        return this.characters.filter(c => c.server === server);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.charactersManager = new CharactersManager();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CharactersManager;
}