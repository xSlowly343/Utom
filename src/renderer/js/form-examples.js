/**
 * Form Examples
 * Примеры форм с новыми стилями
 */

class FormExamples {
    constructor() {
        this.init();
    }

    init() {
        this.createFormExamples();
        this.bindEvents();
        console.log('FormExamples: Инициализирован');
    }

    createFormExamples() {
        const examplesContainer = document.createElement('div');
        examplesContainer.id = 'formExamples';
        examplesContainer.className = 'form-examples';
        examplesContainer.innerHTML = `
            <div class="form-section">
                <h3 class="form-section-title">🎨 Примеры форм с новыми стилями</h3>
                
                <!-- Character Creation Form -->
                <div class="form-section">
                    <h4>👤 Создание персонажа</h4>
                    <form class="character-form">
                        <div class="form-group">
                            <label for="charName">Имя персонажа</label>
                            <input type="text" id="charName" placeholder="Введите имя персонажа" required>
                            <div class="help-text">Минимум 2 символа, максимум 20</div>
                        </div>
                        
                        <div class="form-group">
                            <label for="charClass">Класс</label>
                            <select id="charClass" required>
                                <option value="">Выберите класс</option>
                                <option value="warrior">Воин</option>
                                <option value="mage">Маг</option>
                                <option value="archer">Лучник</option>
                                <option value="assassin">Убийца</option>
                                <option value="priest">Жрец</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="charLevel">Уровень</label>
                            <input type="number" id="charLevel" min="1" max="100" value="1" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="charItemLevel">Уровень предметов</label>
                            <input type="number" id="charItemLevel" min="0" max="2000" value="0" required>
                        </div>
                        
                        <div class="form-group full-width">
                            <label for="charServer">Сервер</label>
                            <select id="charServer" required>
                                <option value="">Выберите сервер</option>
                                <option value="eu-west">EU West</option>
                                <option value="eu-east">EU East</option>
                                <option value="na-west">NA West</option>
                                <option value="na-east">NA East</option>
                            </select>
                        </div>
                        
                        <div class="form-group full-width">
                            <label for="charDescription">Описание</label>
                            <textarea id="charDescription" rows="3" placeholder="Расскажите о своем персонаже..."></textarea>
                        </div>
                        
                        <div class="form-group">
                            <label for="charColor">Цвет персонажа</label>
                            <div class="color-picker">
                                <input type="color" id="charColor" value="#6366f1">
                                <span>Выберите основной цвет</span>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>Настройки</label>
                            <div class="settings-section">
                                <div class="form-group inline">
                                    <label for="charNotifications">Уведомления</label>
                                    <label class="toggle-switch">
                                        <input type="checkbox" id="charNotifications" checked>
                                        <span class="toggle-slider"></span>
                                    </label>
                                </div>
                                
                                <div class="form-group inline">
                                    <label for="charAutoSave">Автосохранение</label>
                                    <label class="toggle-switch">
                                        <input type="checkbox" id="charAutoSave" checked>
                                        <span class="toggle-slider"></span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary">Отмена</button>
                            <button type="submit" class="btn btn-primary">Создать персонажа</button>
                        </div>
                    </form>
                </div>
                
                <!-- Raid Creation Form -->
                <div class="form-section">
                    <h4>⚔️ Создание рейда</h4>
                    <form class="raid-form">
                        <div class="raid-details">
                            <div class="form-group">
                                <label for="raidName">Название рейда</label>
                                <input type="text" id="raidName" placeholder="Введите название рейда" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="raidType">Тип рейда</label>
                                <select id="raidType" required>
                                    <option value="">Выберите тип</option>
                                    <option value="legion">Легион</option>
                                    <option value="guardian">Страж</option>
                                    <option value="abyss">Бездна</option>
                                    <option value="chaos">Хаос</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="raidDifficulty">Сложность</label>
                                <select id="raidDifficulty" required>
                                    <option value="">Выберите сложность</option>
                                    <option value="normal">Обычная</option>
                                    <option value="hard">Сложная</option>
                                    <option value="hell">Адская</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="raidDate">Дата</label>
                                <input type="date" id="raidDate" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="raidTime">Время</label>
                                <input type="time" id="raidTime" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="raidDuration">Продолжительность (минуты)</label>
                                <input type="range" id="raidDuration" min="30" max="300" value="120" step="30">
                                <div class="slider-container">
                                    <span>30 мин</span>
                                    <span class="slider-value">120 мин</span>
                                    <span>300 мин</span>
                                </div>
                            </div>
                            
                            <div class="form-group full-width">
                                <label for="raidDescription">Описание</label>
                                <textarea id="raidDescription" rows="4" placeholder="Опишите детали рейда..."></textarea>
                            </div>
                        </div>
                        
                        <div class="raid-settings">
                            <h5>Настройки рейда</h5>
                            
                            <div class="form-group">
                                <label for="raidMaxParticipants">Максимум участников</label>
                                <input type="number" id="raidMaxParticipants" min="4" max="20" value="8" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="raidMinItemLevel">Минимальный уровень предметов</label>
                                <input type="number" id="raidMinItemLevel" min="0" max="2000" value="1500" required>
                            </div>
                            
                            <div class="form-group">
                                <label>Требования</label>
                                <div class="multi-select">
                                    <div class="selected-items">
                                        <div class="selected-item">
                                            Discord <span class="remove">×</span>
                                        </div>
                                        <div class="selected-item">
                                            Голосовой чат <span class="remove">×</span>
                                        </div>
                                    </div>
                                    <div class="dropdown" style="display: none;">
                                        <div class="dropdown-item">Discord</div>
                                        <div class="dropdown-item">Голосовой чат</div>
                                        <div class="dropdown-item">Микрофон</div>
                                        <div class="dropdown-item">Опыт прохождения</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label>Рейтинг сложности</label>
                                <div class="rating">
                                    <input type="radio" name="difficulty" id="star1" value="1">
                                    <label for="star1">⭐</label>
                                    <input type="radio" name="difficulty" id="star2" value="2">
                                    <label for="star2">⭐</label>
                                    <input type="radio" name="difficulty" id="star3" value="3" checked>
                                    <label for="star3">⭐</label>
                                    <input type="radio" name="difficulty" id="star4" value="4">
                                    <label for="star4">⭐</label>
                                    <input type="radio" name="difficulty" id="star5" value="5">
                                    <label for="star5">⭐</label>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary">Отмена</button>
                            <button type="submit" class="btn btn-primary">Создать рейд</button>
                        </div>
                    </form>
                </div>
                
                <!-- Settings Form -->
                <div class="form-section">
                    <h4>⚙️ Настройки приложения</h4>
                    <form class="settings-form">
                        <div class="settings-section">
                            <h5>Внешний вид</h5>
                            
                            <div class="form-group">
                                <label for="themeSelect">Тема</label>
                                <select id="themeSelect">
                                    <option value="auto">Автоматически</option>
                                    <option value="light">Светлая</option>
                                    <option value="dark">Темная</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="accentColor">Акцентный цвет</label>
                                <div class="color-picker">
                                    <input type="color" id="accentColor" value="#6366f1">
                                    <span>Выберите цвет интерфейса</span>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="fontSize">Размер шрифта</label>
                                <input type="range" id="fontSize" min="12" max="20" value="14" step="1">
                                <div class="slider-container">
                                    <span>12px</span>
                                    <span class="slider-value">14px</span>
                                    <span>20px</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="settings-section">
                            <h5>Уведомления</h5>
                            
                            <div class="form-group inline">
                                <label for="notifSound">Звуковые уведомления</label>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="notifSound" checked>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                            
                            <div class="form-group inline">
                                <label for="notifDesktop">Desktop уведомления</label>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="notifDesktop" checked>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                            
                            <div class="form-group inline">
                                <label for="notifEmail">Email уведомления</label>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="notifEmail">
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="settings-section">
                            <h5>Производительность</h5>
                            
                            <div class="form-group">
                                <label for="autoSaveInterval">Интервал автосохранения (секунды)</label>
                                <input type="number" id="autoSaveInterval" min="30" max="300" value="60" step="30">
                            </div>
                            
                            <div class="form-group">
                                <label for="maxHistoryItems">Максимум элементов истории</label>
                                <input type="number" id="maxHistoryItems" min="100" max="10000" value="1000" step="100">
                            </div>
                            
                            <div class="form-group inline">
                                <label for="enableAnimations">Анимации интерфейса</label>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="enableAnimations" checked>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary">Сбросить</button>
                            <button type="submit" class="btn btn-primary">Сохранить настройки</button>
                        </div>
                    </form>
                </div>
                
                <!-- File Upload Example -->
                <div class="form-section">
                    <h4>📁 Загрузка файлов</h4>
                    
                    <div class="form-group">
                        <label>Загрузка скриншота персонажа</label>
                        <div class="file-upload" id="fileUpload">
                            <div class="file-upload-icon">📷</div>
                            <div class="file-upload-text">
                                Перетащите файл сюда или кликните для выбора<br>
                                <small>Поддерживаются: PNG, JPG, GIF (макс. 5MB)</small>
                            </div>
                            <input type="file" accept="image/*" multiple>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Загрузка логов рейда</label>
                        <div class="file-upload" id="logUpload">
                            <div class="file-upload-icon">📄</div>
                            <div class="file-upload-text">
                                Перетащите файл сюда или кликните для выбора<br>
                                <small>Поддерживаются: TXT, LOG, CSV (макс. 10MB)</small>
                            </div>
                            <input type="file" accept=".txt,.log,.csv" multiple>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Добавляем в настройки
        const settingsSection = document.querySelector('.settings-section');
        if (settingsSection) {
            settingsSection.appendChild(examplesContainer);
        } else {
            document.body.appendChild(examplesContainer);
        }
    }

    bindEvents() {
        // Обработка форм
        this.bindFormEvents();
        
        // Обработка файлов
        this.bindFileEvents();
        
        // Обработка слайдеров
        this.bindSliderEvents();
        
        // Обработка рейтинга
        this.bindRatingEvents();
        
        // Обработка мульти-селекта
        this.bindMultiSelectEvents();
    }

    bindFormEvents() {
        // Character form
        const characterForm = document.querySelector('.character-form');
        if (characterForm) {
            characterForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.showSuccess('Персонаж создан успешно!');
            });
        }

        // Raid form
        const raidForm = document.querySelector('.raid-form');
        if (raidForm) {
            raidForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.showSuccess('Рейд создан успешно!');
            });
        }

        // Settings form
        const settingsForm = document.querySelector('.settings-form');
        if (settingsForm) {
            settingsForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.showSuccess('Настройки сохранены!');
            });
        }
    }

    bindFileEvents() {
        const fileUploads = document.querySelectorAll('.file-upload');
        
        fileUploads.forEach(upload => {
            const input = upload.querySelector('input[type="file"]');
            
            // Клик для выбора файла
            upload.addEventListener('click', () => {
                input.click();
            });
            
            // Drag and drop
            upload.addEventListener('dragover', (e) => {
                e.preventDefault();
                upload.classList.add('dragover');
            });
            
            upload.addEventListener('dragleave', () => {
                upload.classList.remove('dragover');
            });
            
            upload.addEventListener('drop', (e) => {
                e.preventDefault();
                upload.classList.remove('dragover');
                
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    this.handleFileUpload(files, upload);
                }
            });
            
            // Выбор файла
            input.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    this.handleFileUpload(e.target.files, upload);
                }
            });
        });
    }

    bindSliderEvents() {
        const sliders = document.querySelectorAll('input[type="range"]');
        
        sliders.forEach(slider => {
            const valueDisplay = slider.parentElement.querySelector('.slider-value');
            
            slider.addEventListener('input', (e) => {
                if (valueDisplay) {
                    valueDisplay.textContent = e.target.value + (slider.id === 'raidDuration' ? ' мин' : 'px');
                }
            });
        });
    }

    bindRatingEvents() {
        const ratingInputs = document.querySelectorAll('.rating input[type="radio"]');
        
        ratingInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                console.log('Выбран рейтинг:', e.target.value);
            });
        });
    }

    bindMultiSelectEvents() {
        const multiSelects = document.querySelectorAll('.multi-select');
        
        multiSelects.forEach(select => {
            const selectedItems = select.querySelector('.selected-items');
            const dropdown = select.querySelector('.dropdown');
            const dropdownItems = select.querySelectorAll('.dropdown-item');
            
            // Показать/скрыть dropdown
            selectedItems.addEventListener('click', () => {
                dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
            });
            
            // Выбор элемента
            dropdownItems.forEach(item => {
                item.addEventListener('click', () => {
                    const text = item.textContent;
                    const selectedItem = document.createElement('div');
                    selectedItem.className = 'selected-item';
                    selectedItem.innerHTML = `${text} <span class="remove">×</span>`;
                    
                    selectedItems.appendChild(selectedItem);
                    dropdown.style.display = 'none';
                    
                    // Удаление элемента
                    selectedItem.querySelector('.remove').addEventListener('click', () => {
                        selectedItem.remove();
                    });
                });
            });
            
            // Скрыть dropdown при клике вне
            document.addEventListener('click', (e) => {
                if (!select.contains(e.target)) {
                    dropdown.style.display = 'none';
                }
            });
        });
    }

    handleFileUpload(files, uploadElement) {
        const file = files[0];
        const text = uploadElement.querySelector('.file-upload-text');
        
        if (file) {
            text.innerHTML = `
                <strong>${file.name}</strong><br>
                <small>Размер: ${(file.size / 1024 / 1024).toFixed(2)} MB</small>
            `;
            
            this.showSuccess(`Файл "${file.name}" загружен успешно!`);
        }
    }

    showSuccess(message) {
        const alert = document.createElement('div');
        alert.className = 'alert alert-success';
        alert.innerHTML = `✅ ${message}`;
        
        document.body.appendChild(alert);
        
        setTimeout(() => {
            alert.remove();
        }, 3000);
    }

    showError(message) {
        const alert = document.createElement('div');
        alert.className = 'alert alert-danger';
        alert.innerHTML = `❌ ${message}`;
        
        document.body.appendChild(alert);
        
        setTimeout(() => {
            alert.remove();
        }, 3000);
    }
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    window.formExamples = new FormExamples();
});

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FormExamples;
}