/**
 * Data Migration Module
 * Миграция данных из localStorage в SQLite базу данных
 */

class DataMigrationManager {
    constructor() {
        this.migrationStatus = {
            characters: false,
            raids: false,
            chat: false,
            settings: false,
            completed: false
        };
        
        this.init();
    }

    init() {
        this.checkMigrationStatus();
        this.bindEvents();
    }

    bindEvents() {
        // Кнопка запуска миграции
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('start-migration-btn')) {
                e.preventDefault();
                this.startMigration();
            }
        });
    }

    checkMigrationStatus() {
        try {
            const saved = localStorage.getItem('migrationStatus');
            if (saved) {
                this.migrationStatus = JSON.parse(saved);
            }
        } catch (error) {
            console.error('Error loading migration status:', error);
        }
    }

    saveMigrationStatus() {
        try {
            localStorage.setItem('migrationStatus', JSON.stringify(this.migrationStatus));
        } catch (error) {
            console.error('Error saving migration status:', error);
        }
    }

    async startMigration() {
        if (!window.databaseManager) {
            if (window.notifications) {
                window.notifications.show('База данных недоступна', 'error');
            }
            return;
        }

        try {
            if (window.notifications) {
                window.notifications.show('Начинаем миграцию данных...', 'info');
            }

            console.log('DataMigration: Начинаем миграцию данных');

            // Мигрируем персонажей
            if (!this.migrationStatus.characters) {
                await this.migrateCharacters();
                this.migrationStatus.characters = true;
                this.saveMigrationStatus();
            }

            // Мигрируем рейды
            if (!this.migrationStatus.raids) {
                await this.migrateRaids();
                this.migrationStatus.raids = true;
                this.saveMigrationStatus();
            }

            // Мигрируем чат
            if (!this.migrationStatus.chat) {
                await this.migrateChat();
                this.migrationStatus.chat = true;
                this.saveMigrationStatus();
            }

            // Мигрируем настройки
            if (!this.migrationStatus.settings) {
                await this.migrateSettings();
                this.migrationStatus.settings = true;
                this.saveMigrationStatus();
            }

            this.migrationStatus.completed = true;
            this.saveMigrationStatus();

            if (window.notifications) {
                window.notifications.show('Миграция данных завершена!', 'success');
            }

            console.log('DataMigration: Миграция завершена успешно');

            // Обновляем UI
            this.renderMigrationStatus();

        } catch (error) {
            console.error('DataMigration: Ошибка миграции:', error);
            if (window.notifications) {
                window.notifications.show('Ошибка миграции данных', 'error');
            }
        }
    }

    async migrateCharacters() {
        try {
            console.log('DataMigration: Мигрируем персонажей...');
            
            const savedCharacters = localStorage.getItem('characters');
            if (!savedCharacters) {
                console.log('DataMigration: Персонажи не найдены в localStorage');
                return;
            }

            const characters = JSON.parse(savedCharacters);
            const userId = window.authManager?.getCurrentUser()?.id || 1;

            for (const character of characters) {
                try {
                    // Проверяем, не существует ли уже персонаж
                    const existing = await window.databaseManager.getCharacterById(character.id);
                    if (!existing) {
                        await window.databaseManager.createCharacter({
                            ...character,
                            userId: userId
                        });
                        console.log(`DataMigration: Персонаж ${character.name} мигрирован`);
                    }
                } catch (error) {
                    console.error(`DataMigration: Ошибка миграции персонажа ${character.name}:`, error);
                }
            }

            console.log(`DataMigration: Мигрировано ${characters.length} персонажей`);

        } catch (error) {
            console.error('DataMigration: Ошибка миграции персонажей:', error);
            throw error;
        }
    }

    async migrateRaids() {
        try {
            console.log('DataMigration: Мигрируем рейды...');
            
            const savedRaids = localStorage.getItem('raids');
            if (!savedRaids) {
                console.log('DataMigration: Рейды не найдены в localStorage');
                return;
            }

            const raids = JSON.parse(savedRaids);

            for (const raid of raids) {
                try {
                    // Проверяем, не существует ли уже рейд
                    const existing = await window.databaseManager.getRaidById(raid.id);
                    if (!existing) {
                        await window.databaseManager.createRaid(raid);
                        console.log(`DataMigration: Рейд ${raid.name} мигрирован`);
                    }
                } catch (error) {
                    console.error(`DataMigration: Ошибка миграции рейда ${raid.name}:`, error);
                }
            }

            console.log(`DataMigration: Мигрировано ${raids.length} рейдов`);

        } catch (error) {
            console.error('DataMigration: Ошибка миграции рейдов:', error);
            throw error;
        }
    }

    async migrateChat() {
        try {
            console.log('DataMigration: Мигрируем чат...');
            
            const savedMessages = localStorage.getItem('chatMessages');
            if (!savedMessages) {
                console.log('DataMigration: Сообщения чата не найдены в localStorage');
                return;
            }

            const messages = JSON.parse(savedMessages);
            const userId = window.authManager?.getCurrentUser()?.id || 1;

            for (const [channelId, channelMessages] of Object.entries(messages)) {
                try {
                    // Создаем канал если не существует
                    const channel = await window.databaseManager.getChannelById(channelId);
                    if (!channel) {
                        await window.databaseManager.createChannel({
                            id: channelId,
                            name: `Channel ${channelId}`,
                            type: 'public',
                            createdBy: userId
                        });
                    }

                    // Мигрируем сообщения
                    for (const message of channelMessages) {
                        await window.databaseManager.saveMessage({
                            ...message,
                            channelId: channelId,
                            userId: userId
                        });
                    }

                    console.log(`DataMigration: Канал ${channelId} мигрирован с ${channelMessages.length} сообщениями`);
                } catch (error) {
                    console.error(`DataMigration: Ошибка миграции канала ${channelId}:`, error);
                }
            }

        } catch (error) {
            console.error('DataMigration: Ошибка миграции чата:', error);
            throw error;
        }
    }

    async migrateSettings() {
        try {
            console.log('DataMigration: Мигрируем настройки...');
            
            const savedSettings = localStorage.getItem('settings');
            if (!savedSettings) {
                console.log('DataMigration: Настройки не найдены в localStorage');
                return;
            }

            const settings = JSON.parse(savedSettings);
            const userId = window.authManager?.getCurrentUser()?.id || 1;

            for (const [key, value] of Object.entries(settings)) {
                try {
                    await window.databaseManager.setSetting(userId, key, JSON.stringify(value));
                    console.log(`DataMigration: Настройка ${key} мигрирована`);
                } catch (error) {
                    console.error(`DataMigration: Ошибка миграции настройки ${key}:`, error);
                }
            }

        } catch (error) {
            console.error('DataMigration: Ошибка миграции настроек:', error);
            throw error;
        }
    }

    renderMigrationStatus() {
        const container = document.getElementById('migrationStatusContainer');
        if (!container) return;

        if (this.migrationStatus.completed) {
            container.innerHTML = `
                <div class="migration-complete">
                    <i class="fas fa-check-circle"></i>
                    <h4>Миграция завершена</h4>
                    <p>Все данные успешно перенесены в базу данных</p>
                </div>
            `;
        } else {
            const completedCount = Object.values(this.migrationStatus).filter(Boolean).length;
            const totalCount = Object.keys(this.migrationStatus).length - 1; // Исключаем completed

            container.innerHTML = `
                <div class="migration-status">
                    <h4>Статус миграции</h4>
                    <div class="migration-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${(completedCount / totalCount) * 100}%"></div>
                        </div>
                        <span class="progress-text">${completedCount}/${totalCount}</span>
                    </div>
                    
                    <div class="migration-items">
                        <div class="migration-item ${this.migrationStatus.characters ? 'completed' : ''}">
                            <i class="fas ${this.migrationStatus.characters ? 'fa-check' : 'fa-clock'}"></i>
                            <span>Персонажи</span>
                        </div>
                        <div class="migration-item ${this.migrationStatus.raids ? 'completed' : ''}">
                            <i class="fas ${this.migrationStatus.raids ? 'fa-check' : 'fa-clock'}"></i>
                            <span>Рейды</span>
                        </div>
                        <div class="migration-item ${this.migrationStatus.chat ? 'completed' : ''}">
                            <i class="fas ${this.migrationStatus.chat ? 'fa-check' : 'fa-clock'}"></i>
                            <span>Чат</span>
                        </div>
                        <div class="migration-item ${this.migrationStatus.settings ? 'completed' : ''}">
                            <i class="fas ${this.migrationStatus.settings ? 'fa-check' : 'fa-clock'}"></i>
                            <span>Настройки</span>
                        </div>
                    </div>
                    
                    ${!this.migrationStatus.completed ? `
                        <button class="btn btn-primary start-migration-btn">
                            <i class="fas fa-sync"></i> Запустить миграцию
                        </button>
                    ` : ''}
                </div>
            `;
        }
    }

    // Методы для проверки необходимости миграции
    needsMigration() {
        return !this.migrationStatus.completed;
    }

    hasLocalData() {
        return !!(localStorage.getItem('characters') || 
                 localStorage.getItem('raids') || 
                 localStorage.getItem('chatMessages') || 
                 localStorage.getItem('settings'));
    }

    // Метод для очистки localStorage после успешной миграции
    async cleanupLocalStorage() {
        if (this.migrationStatus.completed) {
            try {
                localStorage.removeItem('characters');
                localStorage.removeItem('raids');
                localStorage.removeItem('chatMessages');
                localStorage.removeItem('settings');
                
                console.log('DataMigration: localStorage очищен');
                
                if (window.notifications) {
                    window.notifications.show('Локальные данные очищены', 'info');
                }
            } catch (error) {
                console.error('DataMigration: Ошибка очистки localStorage:', error);
            }
        }
    }

    // Метод для принудительного сброса статуса миграции
    resetMigrationStatus() {
        this.migrationStatus = {
            characters: false,
            raids: false,
            chat: false,
            settings: false,
            completed: false
        };
        this.saveMigrationStatus();
        console.log('DataMigration: Статус миграции сброшен');
    }
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    window.dataMigrationManager = new DataMigrationManager();
});

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataMigrationManager;
}