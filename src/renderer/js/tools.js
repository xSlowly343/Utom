// Tools Module
class ToolsModule {
    constructor() {
        this.tools = {};
        this.init();
    }

    init() {
        this.initEventListeners();
        this.loadTools();
    }

    initEventListeners() {
        // Screenshot tool
        const screenshotToolBtn = document.getElementById('screenshotToolBtn');
        if (screenshotToolBtn) {
            screenshotToolBtn.addEventListener('click', () => this.openScreenshotTool());
        }

        // AI Assistant
        const aiAssistantBtn = document.getElementById('aiAssistantBtn');
        if (aiAssistantBtn) {
            aiAssistantBtn.addEventListener('click', () => this.openAIAssistant());
        }

        // Analytics
        const analyticsBtn = document.getElementById('analyticsBtn');
        if (analyticsBtn) {
            analyticsBtn.addEventListener('click', () => this.openAnalytics());
        }

        // Export data
        const exportDataBtn = document.getElementById('exportDataBtn');
        if (exportDataBtn) {
            exportDataBtn.addEventListener('click', () => this.openExportData());
        }
    }

    async loadTools() {
        try {
            // Initialize tools
            this.tools = {
                screenshot: new ScreenshotTool(),
                aiAssistant: new AIAssistant(),
                analytics: new AnalyticsTool(),
                exportData: new ExportDataTool()
            };
        } catch (error) {
            console.error('Failed to load tools:', error);
        }
    }

    openScreenshotTool() {
        try {
            console.log('Opening screenshot tool...');
            this.tools.screenshot.open();
        } catch (error) {
            console.error('Failed to open screenshot tool:', error);
            this.showError('Ошибка открытия инструмента скриншотов');
        }
    }

    openAIAssistant() {
        try {
            console.log('Opening AI assistant...');
            this.tools.aiAssistant.open();
        } catch (error) {
            console.error('Failed to open AI assistant:', error);
            this.showError('Ошибка открытия AI ассистента');
        }
    }

    openAnalytics() {
        try {
            console.log('Opening analytics...');
            this.tools.analytics.open();
        } catch (error) {
            console.error('Failed to open analytics:', error);
            this.showError('Ошибка открытия аналитики');
        }
    }

    openExportData() {
        try {
            console.log('Opening export data tool...');
            this.tools.exportData.open();
        } catch (error) {
            console.error('Failed to open export data tool:', error);
            this.showError('Ошибка открытия инструмента экспорта');
        }
    }

    showError(message) {
        console.error(message);
        // Implementation for error notifications
    }
}

// Screenshot Tool
class ScreenshotTool {
    constructor() {
        this.isActive = false;
        this.screenshots = [];
    }

    open() {
        this.isActive = true;
        this.createScreenshotModal();
    }

    createScreenshotModal() {
        const modalHTML = `
            <div class="modal" id="screenshotModal">
                <div class="modal-header">
                    <h3>Инструмент скриншотов</h3>
                    <button class="modal-close" id="closeScreenshotModal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="screenshot-tool-content">
                        <div class="tool-section">
                            <h4>Создание скриншота</h4>
                            <div class="screenshot-actions">
                                <button class="btn btn-primary" id="takeScreenshotBtn">
                                    <i class="fas fa-camera"></i>
                                    Сделать скриншот
                                </button>
                                <button class="btn btn-secondary" id="uploadScreenshotBtn">
                                    <i class="fas fa-upload"></i>
                                    Загрузить изображение
                                </button>
                            </div>
                        </div>
                        
                        <div class="tool-section">
                            <h4>Анализ изображения</h4>
                            <div class="image-analysis">
                                <div class="image-preview" id="imagePreview">
                                    <i class="fas fa-image"></i>
                                    <p>Предварительный просмотр изображения</p>
                                </div>
                                <div class="analysis-options">
                                    <label>
                                        <input type="checkbox" id="ocrEnabled" checked>
                                        OCR распознавание текста
                                    </label>
                                    <label>
                                        <input type="checkbox" id="itemRecognitionEnabled" checked>
                                        Распознавание предметов
                                    </label>
                                    <label>
                                        <input type="checkbox" id="characterRecognitionEnabled">
                                        Распознавание персонажей
                                    </label>
                                </div>
                                <button class="btn btn-primary" id="analyzeImageBtn" disabled>
                                    <i class="fas fa-search"></i>
                                    Анализировать
                                </button>
                            </div>
                        </div>
                        
                        <div class="tool-section">
                            <h4>Результаты анализа</h4>
                            <div class="analysis-results" id="analysisResults">
                                <p class="no-results">Результаты анализа появятся здесь</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="closeScreenshotToolBtn">Закрыть</button>
                    <button class="btn btn-primary" id="saveResultsBtn" disabled>Сохранить результаты</button>
                </div>
            </div>
        `;

        // Add modal to page
        const modalOverlay = document.getElementById('modalOverlay');
        if (modalOverlay) {
            modalOverlay.innerHTML += modalHTML;
            modalOverlay.classList.add('active');
            
            // Add event listeners
            this.initScreenshotModalEvents();
        }
    }

    initScreenshotModalEvents() {
        const modal = document.getElementById('screenshotModal');
        if (!modal) return;

        const closeBtn = document.getElementById('closeScreenshotModal');
        const closeToolBtn = document.getElementById('closeScreenshotToolBtn');
        const takeScreenshotBtn = document.getElementById('takeScreenshotBtn');
        const uploadScreenshotBtn = document.getElementById('uploadScreenshotBtn');
        const analyzeBtn = document.getElementById('analyzeImageBtn');
        const saveResultsBtn = document.getElementById('saveResultsBtn');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }

        if (closeToolBtn) {
            closeToolBtn.addEventListener('click', () => this.close());
        }

        if (takeScreenshotBtn) {
            takeScreenshotBtn.addEventListener('click', () => this.takeScreenshot());
        }

        if (uploadScreenshotBtn) {
            uploadScreenshotBtn.addEventListener('click', () => this.uploadScreenshot());
        }

        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', () => this.analyzeImage());
        }

        if (saveResultsBtn) {
            saveResultsBtn.addEventListener('click', () => this.saveResults());
        }
    }

    async takeScreenshot() {
        try {
            console.log('Taking screenshot...');
            
            // In real app, this would use Electron's desktopCapturer
            // For now, we'll simulate taking a screenshot
            
            // Simulate screenshot capture
            await this.simulateScreenshot();
            
        } catch (error) {
            console.error('Failed to take screenshot:', error);
        }
    }

    async simulateScreenshot() {
        // Simulate screenshot process
        const imagePreview = document.getElementById('imagePreview');
        const analyzeBtn = document.getElementById('analyzeImageBtn');
        
        if (imagePreview && analyzeBtn) {
            // Show loading state
            imagePreview.innerHTML = `
                <div class="loading">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Создание скриншота...</p>
                </div>
            `;
            
            // Simulate delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Show mock screenshot
            imagePreview.innerHTML = `
                <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+U2NyZWVuc2hvdCBzaW11bGF0aW9uPC90ZXh0Pgo8L3N2Zz4K" alt="Screenshot" style="max-width: 100%; height: auto;">
                <p>Скриншот создан</p>
            `;
            
            // Enable analyze button
            analyzeBtn.disabled = false;
        }
    }

    async uploadScreenshot() {
        try {
            // Create file input
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    this.handleImageUpload(file);
                }
            };
            
            input.click();
            
        } catch (error) {
            console.error('Failed to upload screenshot:', error);
        }
    }

    async handleImageUpload(file) {
        try {
            const imagePreview = document.getElementById('imagePreview');
            const analyzeBtn = document.getElementById('analyzeImageBtn');
            
            if (imagePreview && analyzeBtn) {
                // Show uploaded image
                const reader = new FileReader();
                reader.onload = (e) => {
                    imagePreview.innerHTML = `
                        <img src="${e.target.result}" alt="Uploaded image" style="max-width: 100%; height: auto;">
                        <p>Изображение загружено</p>
                    `;
                    
                    // Enable analyze button
                    analyzeBtn.disabled = false;
                };
                reader.readAsDataURL(file);
            }
            
        } catch (error) {
            console.error('Failed to handle image upload:', error);
        }
    }

    async analyzeImage() {
        try {
            console.log('Analyzing image...');
            
            const analysisResults = document.getElementById('analysisResults');
            const saveResultsBtn = document.getElementById('saveResultsBtn');
            
            if (analysisResults && saveResultsBtn) {
                // Show loading state
                analysisResults.innerHTML = `
                    <div class="loading">
                        <i class="fas fa-spinner fa-spin"></i>
                        <p>Анализ изображения...</p>
                    </div>
                `;
                
                // Simulate analysis delay
                await new Promise(resolve => setTimeout(resolve, 3000));
                
                // Show mock results
                analysisResults.innerHTML = `
                    <div class="analysis-result">
                        <h5>Распознанный текст:</h5>
                        <div class="text-content">
                            <p>• Уровень предметов: 1580</p>
                            <p>• Класс: Berserker</p>
                            <p>• Имя: PlayerName</p>
                            <p>• Сервер: Азуна</p>
                        </div>
                    </div>
                    <div class="analysis-result">
                        <h5>Распознанные предметы:</h5>
                        <div class="items-content">
                            <p>• Оружие: +20</p>
                            <p>• Шлем: +19</p>
                            <p>• Наплечники: +19</p>
                        </div>
                    </div>
                    <div class="analysis-result">
                        <h5>Достоверность:</h5>
                        <div class="confidence">
                            <p>Общая достоверность: 87%</p>
                        </div>
                    </div>
                `;
                
                // Enable save button
                saveResultsBtn.disabled = false;
            }
            
        } catch (error) {
            console.error('Failed to analyze image:', error);
        }
    }

    async saveResults() {
        try {
            console.log('Saving analysis results...');
            
            // In real app, this would save results to database or file
            // For now, we'll just show a success message
            
            alert('Результаты анализа сохранены!');
            
        } catch (error) {
            console.error('Failed to save results:', error);
        }
    }

    close() {
        const modal = document.getElementById('screenshotModal');
        const overlay = document.getElementById('modalOverlay');
        
        if (modal && overlay) {
            modal.remove();
            overlay.classList.remove('active');
        }
        
        this.isActive = false;
    }
}

// AI Assistant Tool
class AIAssistant {
    constructor() {
        this.isActive = false;
        this.conversation = [];
    }

    open() {
        this.isActive = true;
        this.createAIModal();
    }

    createAIModal() {
        const modalHTML = `
            <div class="modal" id="aiAssistantModal">
                <div class="modal-header">
                    <h3>AI Ассистент</h3>
                    <button class="modal-close" id="closeAIModal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="ai-assistant-content">
                        <div class="ai-chat">
                            <div class="chat-messages" id="aiChatMessages">
                                <div class="ai-message">
                                    <div class="ai-avatar">
                                        <i class="fas fa-robot"></i>
                                    </div>
                                    <div class="ai-content">
                                        <p>Привет! Я ваш AI ассистент для Lost Ark. Я могу помочь с планированием рейдов, анализом персонажей и многим другим. Что вас интересует?</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="ai-input">
                                <input type="text" id="aiMessageInput" placeholder="Задайте вопрос AI ассистенту...">
                                <button class="btn btn-primary" id="sendAIMessageBtn">
                                    <i class="fas fa-paper-plane"></i>
                                </button>
                            </div>
                        </div>
                        
                        <div class="ai-suggestions">
                            <h4>Быстрые вопросы:</h4>
                            <div class="suggestion-buttons">
                                <button class="btn btn-outline" onclick="aiAssistant.askQuestion('Как оптимизировать статы для Berserker?')">
                                    Оптимизация статов
                                </button>
                                <button class="btn btn-outline" onclick="aiAssistant.askQuestion('Какие гравировки лучше для Gunlancer?')">
                                    Выбор гравировок
                                </button>
                                <button class="btn btn-outline" onclick="aiAssistant.askQuestion('Как составить команду для рейда Вальтан?')">
                                    Состав команды
                                </button>
                                <button class="btn btn-outline" onclick="aiAssistant.askQuestion('Где лучше фармить материалы?')">
                                    Фарм материалов
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="closeAIAssistantBtn">Закрыть</button>
                    <button class="btn btn-primary" id="exportConversationBtn">Экспорт чата</button>
                </div>
            </div>
        `;

        // Add modal to page
        const modalOverlay = document.getElementById('modalOverlay');
        if (modalOverlay) {
            modalOverlay.innerHTML += modalHTML;
            modalOverlay.classList.add('active');
            
            // Add event listeners
            this.initAIModalEvents();
        }
    }

    initAIModalEvents() {
        const modal = document.getElementById('aiAssistantModal');
        if (!modal) return;

        const closeBtn = document.getElementById('closeAIModal');
        const closeToolBtn = document.getElementById('closeAIAssistantBtn');
        const sendBtn = document.getElementById('sendAIMessageBtn');
        const input = document.getElementById('aiMessageInput');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }

        if (closeToolBtn) {
            closeToolBtn.addEventListener('click', () => this.close());
        }

        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());
        }

        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage();
                }
            });
        }
    }

    askQuestion(question) {
        const input = document.getElementById('aiMessageInput');
        if (input) {
            input.value = question;
            this.sendMessage();
        }
    }

    async sendMessage() {
        const input = document.getElementById('aiMessageInput');
        if (!input) return;

        const message = input.value.trim();
        if (!message) return;

        // Add user message to chat
        this.addMessageToChat('user', message);
        
        // Clear input
        input.value = '';

        // Simulate AI response
        await this.generateAIResponse(message);
    }

    addMessageToChat(sender, message) {
        const chatMessages = document.getElementById('aiChatMessages');
        if (!chatMessages) return;

        const messageElement = document.createElement('div');
        messageElement.className = sender === 'user' ? 'user-message' : 'ai-message';

        const avatar = sender === 'user' ? 
            '<div class="user-avatar"><i class="fas fa-user"></i></div>' :
            '<div class="ai-avatar"><i class="fas fa-robot"></i></div>';

        messageElement.innerHTML = `
            ${avatar}
            <div class="message-content">
                <p>${message}</p>
            </div>
        `;

        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Store in conversation
        this.conversation.push({ sender, message, timestamp: new Date() });
    }

    async generateAIResponse(userMessage) {
        // Simulate AI processing delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Generate mock AI response based on user message
        const response = this.generateMockResponse(userMessage);
        
        // Add AI response to chat
        this.addMessageToChat('ai', response);
    }

    generateMockResponse(userMessage) {
        const lowerMessage = userMessage.toLowerCase();
        
        if (lowerMessage.includes('berserker') && lowerMessage.includes('стат')) {
            return 'Для Berserker рекомендуется: Сила (основная), Крит (вторичная), Быстрота (третичная). Оптимальное соотношение: 70% Сила, 20% Крит, 10% Быстрота.';
        } else if (lowerMessage.includes('gunlancer') && lowerMessage.includes('гравировка')) {
            return 'Лучшие гравировки для Gunlancer: Combat Readiness (основная), Barricade, Stabilized Status. Это обеспечит максимальную защиту и поддержку команды.';
        } else if (lowerMessage.includes('вальтан') && lowerMessage.includes('команда')) {
            return 'Для рейда Вальтан рекомендуется: 2 DPS (Berserker, Deathblade), 1 Tank (Gunlancer), 1 Support (Bard), 4 DPS. Общий ilvl команды должен быть не менее 1580.';
        } else if (lowerMessage.includes('материал') && lowerMessage.includes('фарм')) {
            return 'Лучшие места для фарма материалов: Chaos Dungeons, Guardian Raids, Abyss Dungeons. Также используйте Life Skills: Mining, Herbalism, Logging.';
        } else {
            return 'Я понимаю ваш вопрос. В Lost Ark много нюансов, и я готов помочь с конкретными деталями. Можете уточнить, что именно вас интересует?';
        }
    }

    close() {
        const modal = document.getElementById('aiAssistantModal');
        const overlay = document.getElementById('modalOverlay');
        
        if (modal && overlay) {
            modal.remove();
            overlay.classList.remove('active');
        }
        
        this.isActive = false;
    }
}

// Analytics Tool
class AnalyticsTool {
    constructor() {
        this.isActive = false;
    }

    open() {
        this.isActive = true;
        this.createAnalyticsModal();
    }

    createAnalyticsModal() {
        const modalHTML = `
            <div class="modal" id="analyticsModal">
                <div class="modal-header">
                    <h3>Аналитика и статистика</h3>
                    <button class="modal-close" id="closeAnalyticsModal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="analytics-content">
                        <div class="analytics-section">
                            <h4>Статистика рейдов</h4>
                            <div class="stats-grid">
                                <div class="stat-item">
                                    <span class="stat-label">Всего рейдов</span>
                                    <span class="stat-value">15</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Успешных</span>
                                    <span class="stat-value">12</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Успешность</span>
                                    <span class="stat-value">80%</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="analytics-section">
                            <h4>Прогресс персонажей</h4>
                            <div class="progress-chart">
                                <div class="chart-placeholder">
                                    <i class="fas fa-chart-line"></i>
                                    <p>График прогресса персонажей</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="analytics-section">
                            <h4>Временная активность</h4>
                            <div class="activity-chart">
                                <div class="chart-placeholder">
                                    <i class="fas fa-clock"></i>
                                    <p>График активности по времени</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="closeAnalyticsBtn">Закрыть</button>
                    <button class="btn btn-primary" id="exportAnalyticsBtn">Экспорт данных</button>
                </div>
            </div>
        `;

        // Add modal to page
        const modalOverlay = document.getElementById('modalOverlay');
        if (modalOverlay) {
            modalOverlay.innerHTML += modalHTML;
            modalOverlay.classList.add('active');
            
            // Add event listeners
            this.initAnalyticsModalEvents();
        }
    }

    initAnalyticsModalEvents() {
        const modal = document.getElementById('analyticsModal');
        if (!modal) return;

        const closeBtn = document.getElementById('closeAnalyticsModal');
        const closeToolBtn = document.getElementById('closeAnalyticsBtn');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }

        if (closeToolBtn) {
            closeToolBtn.addEventListener('click', () => this.close());
        }
    }

    close() {
        const modal = document.getElementById('analyticsModal');
        const overlay = document.getElementById('modalOverlay');
        
        if (modal && overlay) {
            modal.remove();
            overlay.classList.remove('active');
        }
        
        this.isActive = false;
    }
}

// Export Data Tool
class ExportDataTool {
    constructor() {
        this.isActive = false;
    }

    open() {
        this.isActive = true;
        this.createExportModal();
    }

    createExportModal() {
        const modalHTML = `
            <div class="modal" id="exportDataModal">
                <div class="modal-header">
                    <h3>Экспорт данных</h3>
                    <button class="modal-close" id="closeExportModal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="export-content">
                        <div class="export-section">
                            <h4>Выберите данные для экспорта</h4>
                            <div class="export-options">
                                <label>
                                    <input type="checkbox" id="exportRaids" checked>
                                    Рейды
                                </label>
                                <label>
                                    <input type="checkbox" id="exportCharacters" checked>
                                    Персонажи
                                </label>
                                <label>
                                    <input type="checkbox" id="exportChat" checked>
                                    История чата
                                </label>
                                <label>
                                    <input type="checkbox" id="exportAnalytics">
                                    Аналитика
                                </label>
                            </div>
                        </div>
                        
                        <div class="export-section">
                            <h4>Формат экспорта</h4>
                            <div class="format-options">
                                <label>
                                    <input type="radio" name="exportFormat" value="json" checked>
                                    JSON
                                </label>
                                <label>
                                    <input type="radio" name="exportFormat" value="csv">
                                    CSV
                                </label>
                                <label>
                                    <input type="radio" name="exportFormat" value="excel">
                                    Excel
                                </label>
                            </div>
                        </div>
                        
                        <div class="export-section">
                            <h4>Настройки</h4>
                            <div class="export-settings">
                                <label>
                                    <input type="checkbox" id="includeMetadata" checked>
                                    Включить метаданные
                                </label>
                                <label>
                                    <input type="checkbox" id="compressData">
                                    Сжать данные
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="closeExportDataBtn">Отмена</button>
                    <button class="btn btn-primary" id="startExportBtn">Начать экспорт</button>
                </div>
            </div>
        `;

        // Add modal to page
        const modalOverlay = document.getElementById('modalOverlay');
        if (modalOverlay) {
            modalOverlay.innerHTML += modalHTML;
            modalOverlay.classList.add('active');
            
            // Add event listeners
            this.initExportModalEvents();
        }
    }

    initExportModalEvents() {
        const modal = document.getElementById('exportDataModal');
        if (!modal) return;

        const closeBtn = document.getElementById('closeExportModal');
        const closeToolBtn = document.getElementById('closeExportDataBtn');
        const startExportBtn = document.getElementById('startExportBtn');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }

        if (closeToolBtn) {
            closeToolBtn.addEventListener('click', () => this.close());
        }

        if (startExportBtn) {
            startExportBtn.addEventListener('click', () => this.startExport());
        }
    }

    async startExport() {
        try {
            console.log('Starting data export...');
            
            // Get export options
            const options = this.getExportOptions();
            
            // Simulate export process
            await this.simulateExport(options);
            
        } catch (error) {
            console.error('Failed to start export:', error);
        }
    }

    getExportOptions() {
        return {
            raids: document.getElementById('exportRaids')?.checked || false,
            characters: document.getElementById('exportCharacters')?.checked || false,
            chat: document.getElementById('exportChat')?.checked || false,
            analytics: document.getElementById('exportAnalytics')?.checked || false,
            format: document.querySelector('input[name="exportFormat"]:checked')?.value || 'json',
            includeMetadata: document.getElementById('includeMetadata')?.checked || false,
            compressData: document.getElementById('compressData')?.checked || false
        };
    }

    async simulateExport(options) {
        const startExportBtn = document.getElementById('startExportBtn');
        if (startExportBtn) {
            startExportBtn.disabled = true;
            startExportBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Экспорт...';
        }

        // Simulate export delay
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Show success message
        alert(`Экспорт завершен! Данные сохранены в формате ${options.format.toUpperCase()}`);

        // Reset button
        if (startExportBtn) {
            startExportBtn.disabled = false;
            startExportBtn.innerHTML = 'Начать экспорт';
        }

        // Close modal
        this.close();
    }

    close() {
        const modal = document.getElementById('exportDataModal');
        const overlay = document.getElementById('modalOverlay');
        
        if (modal && overlay) {
            modal.remove();
            overlay.classList.remove('active');
        }
        
        this.isActive = false;
    }
}

// Initialize tools module when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.toolsModule = new ToolsModule();
    window.aiAssistant = new AIAssistant();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ToolsModule;
}