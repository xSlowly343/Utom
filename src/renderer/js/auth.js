/**
 * Authentication Module для Lost Ark Raid Manager
 * Вход, регистрация, управление профилем
 */

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.authToken = localStorage.getItem('authToken');
        this.refreshToken = localStorage.getItem('refreshToken');
        
        this.init();
    }

    init() {
        this.checkAuthStatus();
        this.bindEvents();
        this.render();
    }

    bindEvents() {
        // Обработчики форм
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'loginForm') {
                e.preventDefault();
                this.handleLogin(e);
            } else if (e.target.id === 'registerForm') {
                e.preventDefault();
                this.handleRegister(e);
            }
        });

        // Переключение между формами
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('switch-form')) {
                e.preventDefault();
                this.switchForm();
            }
        });

        // Выход
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('logout-btn')) {
                e.preventDefault();
                this.logout();
            }
        });
    }

    async checkAuthStatus() {
        if (this.authToken) {
            try {
                // Проверяем токен
                const user = await this.validateToken(this.authToken);
                if (user) {
                    this.currentUser = user;
                    this.isAuthenticated = true;
                    console.log('Пользователь аутентифицирован:', user.username);
                } else {
                    // Токен недействителен, пробуем обновить
                    await this.refreshAuthToken();
                }
            } catch (error) {
                console.error('Ошибка проверки токена:', error);
                this.clearAuth();
            }
        }
    }

    async validateToken(token) {
        try {
            // В реальном приложении здесь будет запрос к API
            // Для демо используем заглушку
            const response = await fetch('/api/auth/validate', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                return await response.json();
            }
            return null;
        } catch (error) {
            console.error('Ошибка валидации токена:', error);
            return null;
        }
    }

    async refreshAuthToken() {
        if (!this.refreshToken) return false;

        try {
            const response = await fetch('/api/auth/refresh', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ refreshToken: this.refreshToken })
            });

            if (response.ok) {
                const data = await response.json();
                this.authToken = data.accessToken;
                this.refreshToken = data.refreshToken;
                
                localStorage.setItem('authToken', this.authToken);
                localStorage.setItem('refreshToken', this.refreshToken);
                
                return true;
            }
            return false;
        } catch (error) {
            console.error('Ошибка обновления токена:', error);
            return false;
        }
    }

    async handleLogin(e) {
        const formData = new FormData(e.target);
        const credentials = {
            username: formData.get('username'),
            password: formData.get('password')
        };

        try {
            this.showLoading(true);
            
            const result = await this.login(credentials);
            if (result.success) {
                this.currentUser = result.user;
                this.authToken = result.accessToken;
                this.refreshToken = result.refreshToken;
                this.isAuthenticated = true;

                // Сохраняем токены
                localStorage.setItem('authToken', this.authToken);
                localStorage.setItem('refreshToken', this.refreshToken);

                // Уведомляем об успешном входе
                if (window.notifications) {
                    window.notifications.show(`Добро пожаловать, ${result.user.username}!`, 'success');
                }

                // Обновляем UI
                this.render();
                this.onAuthSuccess();
            }
        } catch (error) {
            if (window.notifications) {
                window.notifications.show(error.message, 'error');
            }
        } finally {
            this.showLoading(false);
        }
    }

    async handleRegister(e) {
        const formData = new FormData(e.target);
        const userData = {
            username: formData.get('username'),
            email: formData.get('email'),
            password: formData.get('password'),
            confirmPassword: formData.get('confirmPassword')
        };

        // Валидация
        if (userData.password !== userData.confirmPassword) {
            if (window.notifications) {
                window.notifications.show('Пароли не совпадают', 'error');
            }
            return;
        }

        try {
            this.showLoading(true);
            
            const result = await this.register(userData);
            if (result.success) {
                // Автоматически входим после регистрации
                this.currentUser = result.user;
                this.authToken = result.accessToken;
                this.refreshToken = result.refreshToken;
                this.isAuthenticated = true;

                localStorage.setItem('authToken', this.authToken);
                localStorage.setItem('refreshToken', this.refreshToken);

                if (window.notifications) {
                    window.notifications.show(`Регистрация успешна! Добро пожаловать, ${result.user.username}!`, 'success');
                }

                this.render();
                this.onAuthSuccess();
            }
        } catch (error) {
            if (window.notifications) {
                window.notifications.show(error.message, 'error');
            }
        } finally {
            this.showLoading(false);
        }
    }

    async login(credentials) {
        try {
            // В реальном приложении здесь будет запрос к API
            // Для демо используем заглушку
            if (credentials.username === 'admin' && credentials.password === 'admin123') {
                return {
                    success: true,
                    user: {
                        id: 1,
                        username: 'admin',
                        email: 'admin@example.com',
                        role: 'admin',
                        avatar: 'fas fa-crown'
                    },
                    accessToken: 'demo_access_token',
                    refreshToken: 'demo_refresh_token'
                };
            }

            if (credentials.username === 'user' && credentials.password === 'user123') {
                return {
                    success: true,
                    user: {
                        id: 2,
                        username: 'user',
                        email: 'user@example.com',
                        role: 'user',
                        avatar: 'fas fa-user'
                    },
                    accessToken: 'demo_access_token_2',
                    refreshToken: 'demo_refresh_token_2'
                };
            }

            throw new Error('Неверные учетные данные');
        } catch (error) {
            throw new Error('Ошибка входа: ' + error.message);
        }
    }

    async register(userData) {
        try {
            // В реальном приложении здесь будет запрос к API
            // Для демо используем заглушку
            return {
                success: true,
                user: {
                    id: Date.now(),
                    username: userData.username,
                    email: userData.email,
                    role: 'user',
                    avatar: 'fas fa-user'
                },
                accessToken: 'demo_access_token_new',
                refreshToken: 'demo_refresh_token_new'
            };
        } catch (error) {
            throw new Error('Ошибка регистрации: ' + error.message);
        }
    }

    logout() {
        this.clearAuth();
        
        if (window.notifications) {
            window.notifications.show('Вы вышли из системы', 'info');
        }

        this.render();
        this.onAuthLogout();
    }

    clearAuth() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.authToken = null;
        this.refreshToken = null;
        
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
    }

    switchForm() {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const switchBtn = document.querySelector('.switch-form');

        if (loginForm.style.display === 'none') {
            // Показываем форму входа
            loginForm.style.display = 'block';
            registerForm.style.display = 'none';
            switchBtn.textContent = 'Создать аккаунт';
        } else {
            // Показываем форму регистрации
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
            switchBtn.textContent = 'Уже есть аккаунт?';
        }
    }

    showLoading(show) {
        const submitBtns = document.querySelectorAll('button[type="submit"]');
        submitBtns.forEach(btn => {
            if (show) {
                btn.disabled = true;
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Загрузка...';
            } else {
                btn.disabled = false;
                btn.innerHTML = btn.dataset.originalText || 'Войти';
            }
        });
    }

    onAuthSuccess() {
        // Уведомляем другие модули об успешной аутентификации
        if (window.chatSystem) {
            window.chatSystem.onUserAuthenticated(this.currentUser);
        }
        
        if (window.raidsManager) {
            window.raidsManager.onUserAuthenticated(this.currentUser);
        }
        
        if (window.charactersManager) {
            window.charactersManager.onUserAuthenticated(this.currentUser);
        }

        // Обновляем WebSocket соединение с новым пользователем
        if (window.wsClient) {
            window.wsClient.updateUser(this.currentUser);
        }
    }

    onAuthLogout() {
        // Уведомляем другие модули о выходе
        if (window.chatSystem) {
            window.chatSystem.onUserLogout();
        }
        
        if (window.raidsManager) {
            window.raidsManager.onUserLogout();
        }
        
        if (window.charactersManager) {
            window.charactersManager.onUserLogout();
        }

        // Закрываем WebSocket соединение
        if (window.wsClient) {
            window.wsClient.disconnect();
        }
    }

    render() {
        const container = document.getElementById('authContainer');
        if (!container) return;

        if (this.isAuthenticated) {
            // Показываем профиль пользователя
            container.innerHTML = `
                <div class="auth-profile">
                    <div class="profile-header">
                        <div class="profile-avatar">
                            <i class="${this.currentUser.avatar}"></i>
                        </div>
                        <div class="profile-info">
                            <h3>${this.currentUser.username}</h3>
                            <span class="profile-role">${this.getRoleDisplayName(this.currentUser.role)}</span>
                            <span class="profile-email">${this.currentUser.email}</span>
                        </div>
                    </div>
                    <div class="profile-actions">
                        <button class="btn btn-secondary" onclick="authManager.editProfile()">
                            <i class="fas fa-edit"></i> Редактировать профиль
                        </button>
                        <button class="btn btn-danger logout-btn">
                            <i class="fas fa-sign-out-alt"></i> Выйти
                        </button>
                    </div>
                </div>
            `;
        } else {
            // Показываем формы входа/регистрации
            container.innerHTML = `
                <div class="auth-forms">
                    <div class="auth-tabs">
                        <button class="tab-btn active" data-tab="login">Вход</button>
                        <button class="tab-btn" data-tab="register">Регистрация</button>
                    </div>
                    
                    <div class="auth-content">
                        <form id="loginForm" class="auth-form">
                            <h3>Вход в систему</h3>
                            <div class="form-group">
                                <label for="loginUsername">Имя пользователя</label>
                                <input type="text" id="loginUsername" name="username" required>
                            </div>
                            <div class="form-group">
                                <label for="loginPassword">Пароль</label>
                                <input type="password" id="loginPassword" name="password" required>
                            </div>
                            <button type="submit" class="btn btn-primary btn-block">
                                Войти
                            </button>
                            <p class="form-hint">
                                Демо аккаунты: admin/admin123, user/user123
                            </p>
                        </form>
                        
                        <form id="registerForm" class="auth-form" style="display: none;">
                            <h3>Регистрация</h3>
                            <div class="form-group">
                                <label for="registerUsername">Имя пользователя</label>
                                <input type="text" id="registerUsername" name="username" required>
                            </div>
                            <div class="form-group">
                                <label for="registerEmail">Email</label>
                                <input type="email" id="registerEmail" name="email" required>
                            </div>
                            <div class="form-group">
                                <label for="registerPassword">Пароль</label>
                                <input type="password" id="registerPassword" name="password" required>
                            </div>
                            <div class="form-group">
                                <label for="confirmPassword">Подтвердите пароль</label>
                                <input type="password" id="confirmPassword" name="confirmPassword" required>
                            </div>
                            <button type="submit" class="btn btn-primary btn-block">
                                Зарегистрироваться
                            </button>
                        </form>
                    </div>
                </div>
            `;

            // Настраиваем переключение между формами
            this.setupTabSwitching();
        }
    }

    setupTabSwitching() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const forms = document.querySelectorAll('.auth-form');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.dataset.tab;
                
                // Обновляем активную вкладку
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Показываем соответствующую форму
                forms.forEach(form => {
                    if (form.id === `${targetTab}Form`) {
                        form.style.display = 'block';
                    } else {
                        form.style.display = 'none';
                    }
                });
            });
        });
    }

    getRoleDisplayName(role) {
        const roles = {
            'admin': 'Администратор',
            'moderator': 'Модератор',
            'user': 'Пользователь'
        };
        return roles[role] || role;
    }

    editProfile() {
        // TODO: Реализовать редактирование профиля
        if (window.notifications) {
            window.notifications.show('Редактирование профиля в разработке', 'info');
        }
    }

    // Геттеры для других модулей
    getCurrentUser() {
        return this.currentUser;
    }

    isUserAuthenticated() {
        return this.isAuthenticated;
    }

    getUserRole() {
        return this.currentUser?.role || 'guest';
    }

    hasPermission(requiredRole) {
        if (!this.isAuthenticated) return false;
        
        const userRole = this.getUserRole();
        if (requiredRole === 'admin') return userRole === 'admin';
        if (requiredRole === 'moderator') return ['admin', 'moderator'].includes(userRole);
        
        return true;
    }
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
});

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthManager;
}