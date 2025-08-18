/**
 * Chat System Module
 * Система чата для Lost Ark Raid Manager
 * Включает: каналы, приватные сообщения, уведомления, модерацию
 */

class ChatSystem {
    constructor() {
        this.channels = [];
        this.privateChats = [];
        this.currentChannel = null;
        this.currentPrivateChat = null;
        this.messages = {};
        this.users = [];
        this.currentUser = null;
        this.socket = null;
        this.isConnected = false;
        this.messageQueue = [];
        this.typingUsers = new Set();
        this.init();
    }

    init() {
        this.loadChannels();
        this.loadUsers();
        this.setupCurrentUser();
        this.bindEvents();
        this.initializeWebSocket();
        this.render();
        this.startAutoSave();
    }

    setupCurrentUser() {
        // Get user from localStorage or create default
        const savedUser = localStorage.getItem('chatUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
        } else {
            this.currentUser = {
                id: Date.now(),
                name: 'Player' + Math.floor(Math.random() * 1000),
                avatar: this.getRandomAvatar(),
                status: 'online',
                role: 'user',
                joinDate: new Date().toISOString()
            };
            localStorage.setItem('chatUser', JSON.stringify(this.currentUser));
        }
    }

    getRandomAvatar() {
        const avatars = [
            'fas fa-user',
            'fas fa-user-tie',
            'fas fa-user-graduate',
            'fas fa-user-ninja',
            'fas fa-user-astronaut',
            'fas fa-user-cowboy',
            'fas fa-user-helmet-safety',
            'fas fa-user-shield'
        ];
        return avatars[Math.floor(Math.random() * avatars.length)];
    }

    loadChannels() {
        try {
            const saved = localStorage.getItem('chatChannels');
            this.channels = saved ? JSON.parse(saved) : this.getDefaultChannels();
        } catch (error) {
            console.error('Error loading channels:', error);
            this.channels = this.getDefaultChannels();
        }
    }

    getDefaultChannels() {
        return [
            {
                id: 1,
                name: 'Общий',
                type: 'public',
                description: 'Общий канал для всех игроков',
                maxUsers: 100,
                isActive: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                name: 'Рейды',
                type: 'public',
                description: 'Обсуждение рейдов и стратегий',
                maxUsers: 50,
                isActive: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 3,
                name: 'Торговля',
                type: 'public',
                description: 'Торговля предметами и услугами',
                maxUsers: 75,
                isActive: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 4,
                name: 'Помощь',
                type: 'public',
                description: 'Вопросы и ответы для новичков',
                maxUsers: 100,
                isActive: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 5,
                name: 'Гильдия',
                type: 'private',
                description: 'Внутренний канал гильдии',
                maxUsers: 30,
                isActive: true,
                createdAt: new Date().toISOString()
            }
        ];
    }

    loadUsers() {
        try {
            const saved = localStorage.getItem('chatUsers');
            this.users = saved ? JSON.parse(saved) : this.getDefaultUsers();
        } catch (error) {
            console.error('Error loading users:', error);
            this.users = this.getDefaultUsers();
        }
    }

    getDefaultUsers() {
        return [
            {
                id: 1,
                name: 'Admin',
                avatar: 'fas fa-crown',
                status: 'online',
                role: 'admin',
                joinDate: new Date().toISOString()
            },
            {
                id: 2,
                name: 'Moderator',
                avatar: 'fas fa-shield-alt',
                status: 'online',
                role: 'moderator',
                joinDate: new Date().toISOString()
            }
        ];
    }

    initializeWebSocket() {
        try {
            // Simulate WebSocket connection for demo
            this.socket = {
                send: (data) => {
                    console.log('WebSocket send:', data);
                    // Simulate message delivery
                    setTimeout(() => {
                        this.handleIncomingMessage(JSON.parse(data));
                    }, 100);
                },
                close: () => {
                    this.isConnected = false;
                    console.log('WebSocket disconnected');
                }
            };
            this.isConnected = true;
            console.log('WebSocket connected (simulated)');
        } catch (error) {
            console.error('WebSocket connection failed:', error);
            this.isConnected = false;
        }
    }

    bindEvents() {
        // Channel switching
        document.addEventListener('click', (e) => {
            if (e.target.closest('.channel-item')) {
                const channelId = parseInt(e.target.closest('.channel-item').dataset.id);
                this.switchChannel(channelId);
            }
        });

        // Message sending
        const messageForm = document.getElementById('messageForm');
        if (messageForm) {
            messageForm.addEventListener('submit', (e) => this.handleMessageSubmit(e));
        }

        // Message input events
        const messageInput = document.getElementById('messageInput');
        if (messageInput) {
            messageInput.addEventListener('input', (e) => this.handleTyping(e));
            messageInput.addEventListener('keydown', (e) => this.handleKeyDown(e));
        }

        // Private chat events
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('start-private-chat')) {
                const userId = parseInt(e.target.dataset.userId);
                this.startPrivateChat(userId);
            }
        });

        // User status changes
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('user-status-toggle')) {
                this.toggleUserStatus();
            }
        });

        // Channel creation
        const createChannelBtn = document.getElementById('createChannelBtn');
        if (createChannelBtn) {
            createChannelBtn.addEventListener('click', () => this.showCreateChannelModal());
        }

        // Channel form submission
        const channelForm = document.getElementById('channelForm');
        if (channelForm) {
            channelForm.addEventListener('submit', (e) => this.handleChannelSubmit(e));
        }
    }

    switchChannel(channelId) {
        const channel = this.channels.find(c => c.id === channelId);
        if (!channel) return;

        this.currentChannel = channel;
        this.currentPrivateChat = null;

        // Load channel messages
        if (!this.messages[channelId]) {
            this.messages[channelId] = [];
        }

        // Update UI
        this.updateChannelUI();
        this.renderMessages();
        this.updateUserList();

        // Save current channel
        localStorage.setItem('currentChannel', channelId.toString());
    }

    startPrivateChat(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user || user.id === this.currentUser.id) return;

        this.currentPrivateChat = user;
        this.currentChannel = null;

        const chatId = `private_${Math.min(this.currentUser.id, userId)}_${Math.max(this.currentUser.id, userId)}`;
        
        if (!this.messages[chatId]) {
            this.messages[chatId] = [];
        }

        this.updateChannelUI();
        this.renderMessages();
    }

    handleMessageSubmit(e) {
        e.preventDefault();
        
        const messageInput = document.getElementById('messageInput');
        const message = messageInput.value.trim();
        
        if (!message) return;

        const messageData = {
            id: Date.now(),
            text: message,
            userId: this.currentUser.id,
            userName: this.currentUser.name,
            userAvatar: this.currentUser.avatar,
            timestamp: new Date().toISOString(),
            type: 'message'
        };

        if (this.currentChannel) {
            // Send to channel
            this.sendChannelMessage(messageData);
        } else if (this.currentPrivateChat) {
            // Send private message
            this.sendPrivateMessage(messageData);
        }

        messageInput.value = '';
        this.stopTyping();
    }

    sendChannelMessage(messageData) {
        const channelId = this.currentChannel.id;
        
        if (!this.messages[channelId]) {
            this.messages[channelId] = [];
        }

        this.messages[channelId].push(messageData);
        
        // Send via WebSocket
        if (this.socket && this.isConnected) {
            this.socket.send(JSON.stringify({
                type: 'channel_message',
                channelId: channelId,
                message: messageData
            }));
        }

        this.renderMessages();
        this.saveMessages();
    }

    sendPrivateMessage(messageData) {
        const chatId = `private_${Math.min(this.currentUser.id, this.currentPrivateChat.id)}_${Math.max(this.currentUser.id, this.currentPrivateChat.id)}`;
        
        if (!this.messages[chatId]) {
            this.messages[chatId] = [];
        }

        this.messages[chatId].push(messageData);
        
        // Send via WebSocket
        if (this.socket && this.isConnected) {
            this.socket.send(JSON.stringify({
                type: 'private_message',
                recipientId: this.currentPrivateChat.id,
                message: messageData
            }));
        }

        this.renderMessages();
        this.saveMessages();
    }

    handleIncomingMessage(data) {
        switch (data.type) {
            case 'channel_message':
                this.receiveChannelMessage(data.channelId, data.message);
                break;
            case 'private_message':
                this.receivePrivateMessage(data.senderId, data.message);
                break;
            case 'user_joined':
                this.handleUserJoined(data.user);
                break;
            case 'user_left':
                this.handleUserLeft(data.userId);
                break;
            case 'typing_start':
                this.handleTypingStart(data.userId);
                break;
            case 'typing_stop':
                this.handleTypingStop(data.userId);
                break;
        }
    }

    receiveChannelMessage(channelId, message) {
        if (!this.messages[channelId]) {
            this.messages[channelId] = [];
        }

        this.messages[channelId].push(message);
        
        if (this.currentChannel && this.currentChannel.id === channelId) {
            this.renderMessages();
        }

        this.saveMessages();
        this.showNotification(message);
    }

    receivePrivateMessage(senderId, message) {
        const chatId = `private_${Math.min(this.currentUser.id, senderId)}_${Math.max(this.currentUser.id, senderId)}`;
        
        if (!this.messages[chatId]) {
            this.messages[chatId] = [];
        }

        this.messages[chatId].push(message);
        
        if (this.currentPrivateChat && this.currentPrivateChat.id === senderId) {
            this.renderMessages();
        }

        this.saveMessages();
        this.showNotification(message, true);
    }

    handleTyping(e) {
        if (e.target.value.length > 0) {
            this.startTyping();
        } else {
            this.stopTyping();
        }
    }

    startTyping() {
        if (this.socket && this.isConnected) {
            this.socket.send(JSON.stringify({
                type: 'typing_start',
                channelId: this.currentChannel?.id,
                recipientId: this.currentPrivateChat?.id
            }));
        }
    }

    stopTyping() {
        if (this.socket && this.isConnected) {
            this.socket.send(JSON.stringify({
                type: 'typing_stop',
                channelId: this.currentChannel?.id,
                recipientId: this.currentPrivateChat?.id
            }));
        }
    }

    handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.handleMessageSubmit(e);
        }
    }

    handleUserJoined(user) {
        if (!this.users.find(u => u.id === user.id)) {
            this.users.push(user);
            this.updateUserList();
        }
    }

    handleUserLeft(userId) {
        const user = this.users.find(u => u.id === userId);
        if (user) {
            user.status = 'offline';
            this.updateUserList();
        }
    }

    handleTypingStart(userId) {
        this.typingUsers.add(userId);
        this.renderTypingIndicator();
    }

    handleTypingStop(userId) {
        this.typingUsers.delete(userId);
        this.renderTypingIndicator();
    }

    showCreateChannelModal() {
        const modal = document.getElementById('createChannelModal');
        if (modal) {
            modal.style.display = 'block';
        }
    }

    hideCreateChannelModal() {
        const modal = document.getElementById('createChannelModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    handleChannelSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const channelData = {
            name: formData.get('name'),
            description: formData.get('description'),
            type: formData.get('type'),
            maxUsers: parseInt(formData.get('maxUsers'))
        };

        this.createChannel(channelData);
        this.hideCreateChannelModal();
        e.target.reset();
    }

    createChannel(channelData) {
        const newChannel = {
            id: Date.now(),
            ...channelData,
            isActive: true,
            createdAt: new Date().toISOString()
        };

        this.channels.push(newChannel);
        this.saveChannels();
        this.render();
        
        if (window.notifications) {
            window.notifications.show('Канал создан', 'success');
        }
    }

    updateChannelUI() {
        const channelTitle = document.getElementById('channelTitle');
        const channelInfo = document.getElementById('channelInfo');
        
        if (this.currentChannel) {
            if (channelTitle) channelTitle.textContent = `# ${this.currentChannel.name}`;
            if (channelInfo) channelInfo.textContent = this.currentChannel.description;
        } else if (this.currentPrivateChat) {
            if (channelTitle) channelTitle.textContent = `@ ${this.currentPrivateChat.name}`;
            if (channelInfo) channelInfo.textContent = 'Приватный чат';
        }
    }

    renderMessages() {
        const messagesContainer = document.getElementById('messagesContainer');
        if (!messagesContainer) return;

        let messages = [];
        let chatId = null;

        if (this.currentChannel) {
            chatId = this.currentChannel.id;
            messages = this.messages[chatId] || [];
        } else if (this.currentPrivateChat) {
            chatId = `private_${Math.min(this.currentUser.id, this.currentPrivateChat.id)}_${Math.max(this.currentUser.id, this.currentPrivateChat.id)}`;
            messages = this.messages[chatId] || [];
        }

        if (messages.length === 0) {
            messagesContainer.innerHTML = `
                <div class="empty-messages">
                    <i class="fas fa-comments"></i>
                    <p>Нет сообщений</p>
                    <small>Начните разговор!</small>
                </div>
            `;
            return;
        }

        messagesContainer.innerHTML = messages.map(message => `
            <div class="message ${message.userId === this.currentUser.id ? 'own-message' : ''}" data-id="${message.id}">
                <div class="message-avatar">
                    <i class="${message.userAvatar}"></i>
                </div>
                <div class="message-content">
                    <div class="message-header">
                        <span class="message-author">${message.userName}</span>
                        <span class="message-time">${this.formatTime(message.timestamp)}</span>
                    </div>
                    <div class="message-text">${this.escapeHtml(message.text)}</div>
                </div>
            </div>
        `).join('');

        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    renderTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (!typingIndicator) return;

        if (this.typingUsers.size > 0) {
            const typingUsers = Array.from(this.typingUsers)
                .map(id => this.users.find(u => u.id === id)?.name || 'Unknown')
                .filter(Boolean);

            typingIndicator.innerHTML = `
                <div class="typing-indicator">
                    <i class="fas fa-circle"></i>
                    <span>${typingUsers.join(', ')} печатает...</span>
                </div>
            `;
            typingIndicator.style.display = 'block';
        } else {
            typingIndicator.style.display = 'none';
        }
    }

    updateUserList() {
        const userList = document.getElementById('userList');
        if (!userList) return;

        userList.innerHTML = this.users.map(user => `
            <div class="user-item ${user.status}" data-user-id="${user.id}">
                <div class="user-avatar">
                    <i class="${user.avatar}"></i>
                    <span class="status-indicator ${user.status}"></span>
                </div>
                <div class="user-info">
                    <span class="user-name">${user.name}</span>
                    <span class="user-role">${this.getRoleDisplayName(user.role)}</span>
                </div>
                <div class="user-actions">
                    <button class="btn btn-sm btn-secondary start-private-chat" data-user-id="${user.id}" title="Начать приватный чат">
                        <i class="fas fa-comment"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    getRoleDisplayName(role) {
        const roles = {
            'admin': 'Администратор',
            'moderator': 'Модератор',
            'user': 'Пользователь'
        };
        return roles[role] || role;
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) { // Less than 1 minute
            return 'Только что';
        } else if (diff < 3600000) { // Less than 1 hour
            const minutes = Math.floor(diff / 60000);
            return `${minutes} мин назад`;
        } else if (diff < 86400000) { // Less than 1 day
            return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        } else {
            return date.toLocaleDateString('ru-RU');
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showNotification(message, isPrivate = false) {
        if (window.notifications) {
            const title = isPrivate ? `Приватное сообщение от ${message.userName}` : `Новое сообщение в #${this.currentChannel?.name}`;
            window.notifications.show(title, 'info');
        }
    }

    toggleUserStatus() {
        const statuses = ['online', 'away', 'busy', 'offline'];
        const currentIndex = statuses.indexOf(this.currentUser.status);
        const nextIndex = (currentIndex + 1) % statuses.length;
        
        this.currentUser.status = statuses[nextIndex];
        localStorage.setItem('chatUser', JSON.stringify(this.currentUser));
        
        // Update UI
        this.updateUserList();
        
        if (window.notifications) {
            window.notifications.show(`Статус изменен на: ${this.getStatusDisplayName(this.currentUser.status)}`, 'info');
        }
    }

    getStatusDisplayName(status) {
        const statuses = {
            'online': 'Онлайн',
            'away': 'Отошел',
            'busy': 'Занят',
            'offline': 'Оффлайн'
        };
        return statuses[status] || status;
    }

    saveMessages() {
        try {
            localStorage.setItem('chatMessages', JSON.stringify(this.messages));
        } catch (error) {
            console.error('Error saving messages:', error);
        }
    }

    saveChannels() {
        try {
            localStorage.setItem('chatChannels', JSON.stringify(this.channels));
        } catch (error) {
            console.error('Error saving channels:', error);
        }
    }

    startAutoSave() {
        setInterval(() => {
            this.saveMessages();
            this.saveChannels();
        }, 30000); // Save every 30 seconds
    }

    render() {
        const container = document.getElementById('chatContainer');
        if (!container) return;

        container.innerHTML = `
            <div class="chat-layout">
                <div class="chat-sidebar">
                    <div class="channels-section">
                        <div class="section-header">
                            <h3>Каналы</h3>
                            <button class="btn btn-sm btn-primary" id="createChannelBtn">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                        <div class="channels-list">
                            ${this.channels.map(channel => `
                                <div class="channel-item ${this.currentChannel?.id === channel.id ? 'active' : ''}" data-id="${channel.id}">
                                    <i class="fas fa-hashtag"></i>
                                    <span>${channel.name}</span>
                                    <span class="channel-type ${channel.type}">${channel.type}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="users-section">
                        <div class="section-header">
                            <h3>Пользователи</h3>
                            <button class="btn btn-sm btn-secondary user-status-toggle">
                                <i class="fas fa-circle"></i>
                            </button>
                        </div>
                        <div class="users-list" id="userList">
                            <!-- Users will be populated here -->
                        </div>
                    </div>
                </div>
                
                <div class="chat-main">
                    <div class="chat-header">
                        <div class="chat-info">
                            <h2 id="channelTitle"># Общий</h2>
                            <p id="channelInfo">Общий канал для всех игроков</p>
                        </div>
                        <div class="chat-actions">
                            <button class="btn btn-secondary">
                                <i class="fas fa-cog"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="chat-messages" id="messagesContainer">
                        <!-- Messages will be populated here -->
                    </div>
                    
                    <div class="typing-indicator" id="typingIndicator" style="display: none;">
                        <!-- Typing indicator will be shown here -->
                    </div>
                    
                    <form class="chat-input-form" id="messageForm">
                        <div class="input-wrapper">
                            <textarea 
                                id="messageInput" 
                                placeholder="Введите сообщение..." 
                                rows="1"
                                maxlength="1000"
                            ></textarea>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-paper-plane"></i>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        // Update UI after rendering
        this.updateChannelUI();
        this.updateUserList();
        this.renderMessages();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.chatSystem = new ChatSystem();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChatSystem;
}