// Chat Module
class ChatModule {
    constructor() {
        this.currentChannel = 'general';
        this.messages = {};
        this.onlineUsers = [];
        this.socket = null;
        this.init();
    }

    init() {
        this.initEventListeners();
        this.loadChatData();
        this.initSocketConnection();
    }

    initEventListeners() {
        // Channel switching
        const channelList = document.getElementById('channelList');
        if (channelList) {
            channelList.addEventListener('click', (e) => {
                const channelItem = e.target.closest('.channel');
                if (channelItem) {
                    const channelName = channelItem.dataset.channel;
                    this.switchChannel(channelName);
                }
            });
        }

        // Message input
        const messageInput = document.getElementById('messageInput');
        if (messageInput) {
            messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage();
                }
            });
        }

        // Send button
        const sendButton = document.getElementById('sendMessageBtn');
        if (sendButton) {
            sendButton.addEventListener('click', () => this.sendMessage());
        }

        // Chat settings
        const chatSettingsBtn = document.getElementById('chatSettingsBtn');
        if (chatSettingsBtn) {
            chatSettingsBtn.addEventListener('click', () => this.showChatSettings());
        }
    }

    async loadChatData() {
        try {
            // Load messages from storage
            this.messages = await this.getMessagesFromStorage();
            
            // Load online users
            this.onlineUsers = await this.getOnlineUsers();
            
            // Render initial data
            this.renderMessages();
            this.renderOnlineUsers();
            
        } catch (error) {
            console.error('Failed to load chat data:', error);
        }
    }

    async getMessagesFromStorage() {
        // Mock data for now
        return {
            general: [
                {
                    id: 1,
                    author: 'System',
                    message: 'Добро пожаловать в чат Lost Ark Raid Manager!',
                    timestamp: new Date(Date.now() - 60000),
                    type: 'system'
                },
                {
                    id: 2,
                    author: 'Player1',
                    message: 'Привет всем! Кто готов к рейду Вальтан?',
                    timestamp: new Date(Date.now() - 30000),
                    type: 'user'
                },
                {
                    id: 3,
                    author: 'Player2',
                    message: 'Я готов! У меня есть 2 слота',
                    timestamp: new Date(Date.now() - 15000),
                    type: 'user'
                }
            ],
            raids: [
                {
                    id: 1,
                    author: 'System',
                    message: 'Канал для обсуждения рейдов',
                    timestamp: new Date(Date.now() - 120000),
                    type: 'system'
                }
            ],
            trading: [
                {
                    id: 1,
                    author: 'System',
                    message: 'Канал для торговли и обмена',
                    timestamp: new Date(Date.now() - 180000),
                    type: 'system'
                }
            ]
        };
    }

    async getOnlineUsers() {
        // Mock data for now
        return [
            { id: 1, name: 'Player1', status: 'online', class: 'Berserker' },
            { id: 2, name: 'Player2', status: 'online', class: 'Gunlancer' },
            { id: 3, name: 'Player3', status: 'away', class: 'Bard' },
            { id: 4, name: 'Player4', status: 'online', class: 'Sorceress' }
        ];
    }

    switchChannel(channelName) {
        if (this.currentChannel === channelName) return;

        // Update active channel
        this.currentChannel = channelName;

        // Update UI
        this.updateChannelUI(channelName);

        // Load channel messages
        this.renderMessages();

        // Update channel name in header
        const channelNameElement = document.getElementById('currentChannelName');
        if (channelNameElement) {
            channelNameElement.textContent = this.getChannelDisplayName(channelName);
        }
    }

    updateChannelUI(channelName) {
        // Remove active class from all channels
        const channels = document.querySelectorAll('.channel');
        channels.forEach(channel => channel.classList.remove('active'));

        // Add active class to current channel
        const currentChannel = document.querySelector(`[data-channel="${channelName}"]`);
        if (currentChannel) {
            currentChannel.classList.add('active');
        }
    }

    getChannelDisplayName(channelName) {
        const names = {
            general: 'Общий',
            raids: 'Рейды',
            trading: 'Торговля'
        };
        return names[channelName] || channelName;
    }

    renderMessages() {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;

        const channelMessages = this.messages[this.currentChannel] || [];

        // Clear existing messages
        chatMessages.innerHTML = '';

        if (channelMessages.length === 0) {
            chatMessages.innerHTML = `
                <div class="no-messages">
                    <i class="fas fa-comments"></i>
                    <p>В этом канале пока нет сообщений</p>
                    <p>Начните общение первым!</p>
                </div>
            `;
            return;
        }

        // Render each message
        channelMessages.forEach(message => {
            const messageElement = this.createMessageElement(message);
            chatMessages.appendChild(messageElement);
        });

        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    createMessageElement(message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message';
        messageElement.dataset.messageId = message.id;

        const timeString = this.formatTime(message.timestamp);
        const messageClass = message.type === 'system' ? 'system-message' : '';

        messageElement.innerHTML = `
            <div class="message-avatar">
                ${message.author.charAt(0).toUpperCase()}
            </div>
            <div class="message-content ${messageClass}">
                <div class="message-header">
                    <span class="message-author">${message.author}</span>
                    <span class="message-time">${timeString}</span>
                </div>
                <div class="message-text">${message.message}</div>
            </div>
        `;

        return messageElement;
    }

    formatTime(timestamp) {
        const now = new Date();
        const messageTime = new Date(timestamp);
        const diffMs = now - messageTime;
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
            return messageTime.toLocaleDateString('ru-RU');
        }
    }

    renderOnlineUsers() {
        const onlineUsersList = document.getElementById('onlineUsersList');
        if (!onlineUsersList) return;

        onlineUsersList.innerHTML = '';

        this.onlineUsers.forEach(user => {
            const userElement = this.createUserElement(user);
            onlineUsersList.appendChild(userElement);
        });
    }

    createUserElement(user) {
        const userElement = document.createElement('li');
        userElement.className = 'user-item';
        userElement.dataset.userId = user.id;

        const statusClass = this.getStatusClass(user.status);

        userElement.innerHTML = `
            <div class="user-avatar">
                ${user.name.charAt(0).toUpperCase()}
            </div>
            <div class="user-info">
                <span class="user-name">${user.name}</span>
                <span class="user-class">${user.class}</span>
            </div>
            <span class="user-status ${statusClass}"></span>
        `;

        return userElement;
    }

    getStatusClass(status) {
        switch (status) {
            case 'online':
                return 'online';
            case 'away':
                return 'away';
            case 'offline':
                return 'offline';
            default:
                return 'unknown';
        }
    }

    async sendMessage() {
        const messageInput = document.getElementById('messageInput');
        if (!messageInput) return;

        const messageText = messageInput.value.trim();
        if (!messageText) return;

        try {
            // Create message object
            const message = {
                id: Date.now(),
                author: 'CurrentPlayer', // In real app, this would come from user profile
                message: messageText,
                timestamp: new Date(),
                type: 'user'
            };

            // Add message to current channel
            if (!this.messages[this.currentChannel]) {
                this.messages[this.currentChannel] = [];
            }
            this.messages[this.currentChannel].push(message);

            // Save to storage
            await this.saveMessagesToStorage();

            // Render messages
            this.renderMessages();

            // Clear input
            messageInput.value = '';

            // Send via socket if connected
            if (this.socket) {
                this.socket.emit('message', {
                    channel: this.currentChannel,
                    message: message
                });
            }

        } catch (error) {
            console.error('Failed to send message:', error);
            this.showError('Ошибка отправки сообщения');
        }
    }

    async saveMessagesToStorage() {
        try {
            localStorage.setItem('lostArkChatMessages', JSON.stringify(this.messages));
        } catch (error) {
            console.error('Failed to save messages:', error);
        }
    }

    initSocketConnection() {
        try {
            // Initialize socket connection (mock for now)
            console.log('Initializing socket connection...');
            
            // In real app, this would connect to a WebSocket server
            // this.socket = io('ws://localhost:3000');
            
            // Mock socket events
            this.mockSocketEvents();
            
        } catch (error) {
            console.error('Failed to initialize socket connection:', error);
        }
    }

    mockSocketEvents() {
        // Simulate receiving messages
        setInterval(() => {
            if (Math.random() < 0.1) { // 10% chance every interval
                this.receiveMockMessage();
            }
        }, 30000); // Every 30 seconds
    }

    receiveMockMessage() {
        const mockMessages = [
            'Кто готов к рейду сегодня?',
            'У кого есть лишние материалы?',
            'Отличный рейд был вчера!',
            'Кто знает, где фармить золото?',
            'Привет всем! Как дела?'
        ];

        const randomMessage = mockMessages[Math.floor(Math.random() * mockMessages.length)];
        const mockUsers = ['Player5', 'Player6', 'Player7', 'Player8'];

        const message = {
            id: Date.now(),
            author: mockUsers[Math.floor(Math.random() * mockUsers.length)],
            message: randomMessage,
            timestamp: new Date(),
            type: 'user'
        };

        // Add to general channel
        if (!this.messages.general) {
            this.messages.general = [];
        }
        this.messages.general.push(message);

        // Save and render if on general channel
        this.saveMessagesToStorage();
        if (this.currentChannel === 'general') {
            this.renderMessages();
        }

        // Show notification
        this.showNotification(`Новое сообщение от ${message.author}`);
    }

    showChatSettings() {
        console.log('Show chat settings');
        // Implementation for chat settings modal
    }

    showNotification(message) {
        console.log('Notification:', message);
        // Implementation for desktop notifications
    }

    showError(message) {
        console.error(message);
        // Implementation for error notifications
    }

    // Public methods
    getCurrentChannel() {
        return this.currentChannel;
    }

    getMessages(channel = null) {
        const targetChannel = channel || this.currentChannel;
        return this.messages[targetChannel] || [];
    }

    addMessage(channel, message) {
        if (!this.messages[channel]) {
            this.messages[channel] = [];
        }
        this.messages[channel].push(message);
        this.saveMessagesToStorage();
        
        if (channel === this.currentChannel) {
            this.renderMessages();
        }
    }

    getOnlineUsers() {
        return this.onlineUsers;
    }

    updateUserStatus(userId, status) {
        const user = this.onlineUsers.find(u => u.id === userId);
        if (user) {
            user.status = status;
            this.renderOnlineUsers();
        }
    }

    // Utility methods
    clearChannel(channelName) {
        if (this.messages[channelName]) {
            this.messages[channelName] = [];
            this.saveMessagesToStorage();
            if (channelName === this.currentChannel) {
                this.renderMessages();
            }
        }
    }

    searchMessages(query) {
        const results = [];
        
        Object.keys(this.messages).forEach(channel => {
            this.messages[channel].forEach(message => {
                if (message.message.toLowerCase().includes(query.toLowerCase()) ||
                    message.author.toLowerCase().includes(query.toLowerCase())) {
                    results.push({
                        ...message,
                        channel
                    });
                }
            });
        });
        
        return results;
    }
}

// Initialize chat module when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.chatModule = new ChatModule();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChatModule;
}