/**
 * Site Integration Module
 * Интеграция с основным сайтом для единой аутентификации
 */

class SiteIntegrationManager {
    constructor() {
        this.siteConfig = {
            apiUrl: process.env.SITE_API_URL || 'https://your-site.com/api',
            apiKey: process.env.SITE_API_KEY || '',
            authEndpoint: process.env.SITE_AUTH_ENDPOINT || '/auth/verify',
            userEndpoint: process.env.SITE_USER_ENDPOINT || '/user/profile',
            syncInterval: parseInt(process.env.SITE_SYNC_INTERVAL) || 300000, // 5 минут
            autoSync: process.env.SITE_AUTO_SYNC === 'true'
        };
        
        this.currentUser = null;
        this.syncTimer = null;
        
        this.init();
    }

    init() {
        this.checkSiteConnection();
        if (this.siteConfig.autoSync) {
            this.startAutoSync();
        }
    }

    async checkSiteConnection() {
        try {
            const response = await fetch(`${this.siteConfig.apiUrl}/health`);
            if (response.ok) {
                console.log('SiteIntegration: Соединение с основным сайтом установлено');
                return true;
            } else {
                console.warn('SiteIntegration: Основной сайт недоступен');
                return false;
            }
        } catch (error) {
            console.warn('SiteIntegration: Не удается подключиться к основному сайту:', error.message);
            return false;
        }
    }

    async verifySiteToken(token) {
        try {
            const response = await fetch(`${this.siteConfig.apiUrl}${this.siteConfig.authEndpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'X-API-Key': this.siteConfig.apiKey
                }
            });

            if (response.ok) {
                const userData = await response.json();
                console.log('SiteIntegration: Токен верифицирован, пользователь:', userData.username);
                return userData;
            } else {
                console.warn('SiteIntegration: Токен недействителен');
                return null;
            }
        } catch (error) {
            console.error('SiteIntegration: Ошибка верификации токена:', error);
            return null;
        }
    }

    async getUserProfile(siteUserId) {
        try {
            const response = await fetch(`${this.siteConfig.apiUrl}${this.siteConfig.userEndpoint}/${siteUserId}`, {
                headers: {
                    'X-API-Key': this.siteConfig.apiKey
                }
            });

            if (response.ok) {
                const profile = await response.json();
                console.log('SiteIntegration: Профиль пользователя получен:', profile.username);
                return profile;
            } else {
                console.warn('SiteIntegration: Не удается получить профиль пользователя');
                return null;
            }
        } catch (error) {
            console.error('SiteIntegration: Ошибка получения профиля:', error);
            return null;
        }
    }

    async syncUserWithSite(siteUserId) {
        try {
            if (!window.databaseManager) {
                console.warn('SiteIntegration: База данных недоступна');
                return null;
            }

            // Получаем профиль с основного сайта
            const siteProfile = await this.getUserProfile(siteUserId);
            if (!siteProfile) {
                console.warn('SiteIntegration: Профиль с сайта не получен');
                return null;
            }

            // Синхронизируем с локальной БД
            if (window.databaseManager.syncUserWithSite) {
                const localUserId = await window.databaseManager.syncUserWithSite(siteUserId, {
                    username: siteProfile.username,
                    email: siteProfile.email,
                    role: siteProfile.role || 'user',
                    avatar: siteProfile.avatar
                });

                console.log('SiteIntegration: Пользователь синхронизирован, локальный ID:', localUserId);
                return localUserId;
            } else {
                console.warn('SiteIntegration: Метод syncUserWithSite недоступен в БД');
                return null;
            }
        } catch (error) {
            console.error('SiteIntegration: Ошибка синхронизации пользователя:', error);
            return null;
        }
    }

    async loginWithSiteToken(token) {
        try {
            // Верифицируем токен с основным сайтом
            const siteUser = await this.verifySiteToken(token);
            if (!siteUser) {
                throw new Error('Токен недействителен');
            }

            // Синхронизируем пользователя
            const localUserId = await this.syncUserWithSite(siteUser.id);
            if (!localUserId) {
                throw new Error('Не удается синхронизировать пользователя');
            }

            // Получаем полный профиль из локальной БД
            const localUser = await window.databaseManager.getUserById(localUserId);
            if (!localUser) {
                throw new Error('Пользователь не найден в локальной БД');
            }

            // Обновляем текущего пользователя
            this.currentUser = {
                ...localUser,
                siteUserId: siteUser.id,
                siteToken: token
            };

            // Сохраняем в localStorage
            localStorage.setItem('siteAuthToken', token);
            localStorage.setItem('siteUserId', siteUser.id.toString());
            localStorage.setItem('localUserId', localUserId.toString());

            console.log('SiteIntegration: Вход выполнен успешно:', localUser.username);
            
            // Уведомляем другие модули
            this.notifyModules('userAuthenticated', this.currentUser);
            
            return this.currentUser;

        } catch (error) {
            console.error('SiteIntegration: Ошибка входа с токеном сайта:', error);
            throw error;
        }
    }

    async logoutFromSite() {
        try {
            // Очищаем локальные данные
            this.currentUser = null;
            localStorage.removeItem('siteAuthToken');
            localStorage.removeItem('siteUserId');
            localStorage.removeItem('localUserId');

            console.log('SiteIntegration: Выход выполнен');
            
            // Уведомляем другие модули
            this.notifyModules('userLogout');
            
        } catch (error) {
            console.error('SiteIntegration: Ошибка выхода:', error);
        }
    }

    async refreshUserData() {
        try {
            if (!this.currentUser?.siteUserId) {
                console.warn('SiteIntegration: Нет активного пользователя для обновления');
                return false;
            }

            // Обновляем данные с основного сайта
            const siteProfile = await this.getUserProfile(this.currentUser.siteUserId);
            if (!siteProfile) {
                console.warn('SiteIntegration: Не удается обновить профиль');
                return false;
            }

            // Обновляем локальные данные
            if (window.databaseManager && window.databaseManager.updateUser) {
                await window.databaseManager.updateUser(this.currentUser.id, {
                    username: siteProfile.username,
                    email: siteProfile.email,
                    role: siteProfile.role || this.currentUser.role,
                    avatar: siteProfile.avatar
                });

                // Обновляем текущего пользователя
                this.currentUser = {
                    ...this.currentUser,
                    username: siteProfile.username,
                    email: siteProfile.email,
                    role: siteProfile.role || this.currentUser.role,
                    avatar: siteProfile.avatar
                };

                console.log('SiteIntegration: Данные пользователя обновлены');
                return true;
            }

            return false;
        } catch (error) {
            console.error('SiteIntegration: Ошибка обновления данных:', error);
            return false;
        }
    }

    startAutoSync() {
        if (this.syncTimer) {
            clearInterval(this.syncTimer);
        }

        this.syncTimer = setInterval(async () => {
            if (this.currentUser) {
                await this.refreshUserData();
            }
        }, this.siteConfig.syncInterval);

        console.log(`SiteIntegration: Автосинхронизация запущена (${this.siteConfig.syncInterval}ms)`);
    }

    stopAutoSync() {
        if (this.syncTimer) {
            clearInterval(this.syncTimer);
            this.syncTimer = null;
            console.log('SiteIntegration: Автосинхронизация остановлена');
        }
    }

    notifyModules(event, data) {
        // Уведомляем модуль аутентификации
        if (window.authManager) {
            if (event === 'userAuthenticated') {
                window.authManager.onSiteUserAuthenticated?.(data);
            } else if (event === 'userLogout') {
                window.authManager.onSiteUserLogout?.();
            }
        }

        // Уведомляем другие модули
        const modules = ['chatSystem', 'raidsManager', 'charactersManager'];
        modules.forEach(moduleName => {
            if (window[moduleName]) {
                if (event === 'userAuthenticated') {
                    window[moduleName].onSiteUserAuthenticated?.(data);
                } else if (event === 'userLogout') {
                    window[moduleName].onSiteUserLogout?.();
                }
            }
        });
    }

    // Проверка статуса аутентификации
    isAuthenticated() {
        return !!this.currentUser;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    // Получение токена для API запросов
    getAuthToken() {
        return this.currentUser?.siteToken || localStorage.getItem('siteAuthToken');
    }

    // Проверка роли пользователя
    hasRole(requiredRole) {
        if (!this.currentUser) return false;
        
        const userRole = this.currentUser.role;
        if (requiredRole === 'admin') return userRole === 'admin';
        if (requiredRole === 'moderator') return ['admin', 'moderator'].includes(userRole);
        
        return true;
    }

    // Восстановление сессии при перезагрузке
    async restoreSession() {
        try {
            const siteToken = localStorage.getItem('siteAuthToken');
            const siteUserId = localStorage.getItem('siteUserId');
            const localUserId = localStorage.getItem('localUserId');

            if (siteToken && siteUserId && localUserId) {
                // Проверяем валидность токена
                const isValid = await this.verifySiteToken(siteToken);
                if (isValid) {
                    // Восстанавливаем пользователя
                    const localUser = await window.databaseManager?.getUserById(parseInt(localUserId));
                    if (localUser) {
                        this.currentUser = {
                            ...localUser,
                            siteUserId: parseInt(siteUserId),
                            siteToken: siteToken
                        };
                        
                        console.log('SiteIntegration: Сессия восстановлена:', localUser.username);
                        this.notifyModules('userAuthenticated', this.currentUser);
                        return true;
                    }
                }
            }

            // Очищаем невалидные данные
            this.logoutFromSite();
            return false;

        } catch (error) {
            console.error('SiteIntegration: Ошибка восстановления сессии:', error);
            this.logoutFromSite();
            return false;
        }
    }

    // Методы для интеграции с основным сайтом
    async sendNotificationToSite(userId, notification) {
        try {
            const response = await fetch(`${this.siteConfig.apiUrl}/notifications`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': this.siteConfig.apiKey
                },
                body: JSON.stringify({
                    userId: userId,
                    title: notification.title,
                    message: notification.message,
                    type: notification.type,
                    source: 'lost_ark_manager'
                })
            });

            if (response.ok) {
                console.log('SiteIntegration: Уведомление отправлено на сайт');
                return true;
            } else {
                console.warn('SiteIntegration: Не удается отправить уведомление на сайт');
                return false;
            }
        } catch (error) {
            console.error('SiteIntegration: Ошибка отправки уведомления:', error);
            return false;
        }
    }

    async getSiteSettings() {
        try {
            const response = await fetch(`${this.siteConfig.apiUrl}/settings`, {
                headers: {
                    'X-API-Key': this.siteConfig.apiKey
                }
            });

            if (response.ok) {
                const settings = await response.json();
                console.log('SiteIntegration: Настройки сайта получены');
                return settings;
            } else {
                console.warn('SiteIntegration: Не удается получить настройки сайта');
                return null;
            }
        } catch (error) {
            console.error('SiteIntegration: Ошибка получения настроек:', error);
            return null;
        }
    }

    // Закрытие модуля
    destroy() {
        this.stopAutoSync();
        this.currentUser = null;
        console.log('SiteIntegration: Модуль уничтожен');
    }
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    window.siteIntegrationManager = new SiteIntegrationManager();
});

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SiteIntegrationManager;
}