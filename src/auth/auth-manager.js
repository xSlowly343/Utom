/**
 * Authentication Manager для Lost Ark Raid Manager
 * JWT токены, хеширование паролей, управление сессиями
 */

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

class AuthManager {
    constructor(secretKey = null) {
        this.secretKey = secretKey || this.generateSecretKey();
        this.tokenExpiry = '24h';
        this.refreshTokenExpiry = '7d';
        this.activeTokens = new Map(); // token -> { userId, expiresAt }
        this.refreshTokens = new Map(); // refreshToken -> { userId, expiresAt }
        
        this.init();
    }

    init() {
        // Очистка истекших токенов каждые час
        setInterval(() => {
            this.cleanupExpiredTokens();
        }, 60 * 60 * 1000);
        
        console.log('✅ Auth Manager инициализирован');
    }

    generateSecretKey() {
        return crypto.randomBytes(64).toString('hex');
    }

    // Хеширование паролей
    async hashPassword(password) {
        try {
            const saltRounds = 12;
            return await bcrypt.hash(password, saltRounds);
        } catch (error) {
            console.error('Ошибка хеширования пароля:', error);
            throw new Error('Не удалось хешировать пароль');
        }
    }

    async verifyPassword(password, hash) {
        try {
            return await bcrypt.compare(password, hash);
        } catch (error) {
            console.error('Ошибка проверки пароля:', error);
            return false;
        }
    }

    // Создание JWT токенов
    createAccessToken(userData) {
        const payload = {
            userId: userData.id,
            username: userData.username,
            role: userData.role,
            type: 'access'
        };

        const token = jwt.sign(payload, this.secretKey, {
            expiresIn: this.tokenExpiry,
            issuer: 'lost-ark-manager',
            audience: 'lost-ark-users'
        });

        // Сохраняем активный токен
        this.activeTokens.set(token, {
            userId: userData.id,
            expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 часа
        });

        return token;
    }

    createRefreshToken(userData) {
        const payload = {
            userId: userData.id,
            type: 'refresh'
        };

        const refreshToken = jwt.sign(payload, this.secretKey, {
            expiresIn: this.refreshTokenExpiry,
            issuer: 'lost-ark-manager',
            audience: 'lost-ark-users'
        });

        // Сохраняем refresh токен
        this.refreshTokens.set(refreshToken, {
            userId: userData.id,
            expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 дней
        });

        return refreshToken;
    }

    // Валидация токенов
    verifyToken(token) {
        try {
            const decoded = jwt.verify(token, this.secretKey, {
                issuer: 'lost-ark-manager',
                audience: 'lost-ark-users'
            });

            // Проверяем, что токен активен
            if (!this.activeTokens.has(token)) {
                throw new Error('Токен не активен');
            }

            return decoded;
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                // Удаляем истекший токен
                this.activeTokens.delete(token);
            }
            throw error;
        }
    }

    verifyRefreshToken(refreshToken) {
        try {
            const decoded = jwt.verify(refreshToken, this.secretKey, {
                issuer: 'lost-ark-manager',
                audience: 'lost-ark-users'
            });

            // Проверяем, что refresh токен активен
            if (!this.refreshTokens.has(refreshToken)) {
                throw new Error('Refresh токен не активен');
            }

            return decoded;
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                // Удаляем истекший refresh токен
                this.refreshTokens.delete(refreshToken);
            }
            throw error;
        }
    }

    // Обновление токенов
    refreshAccessToken(refreshToken) {
        try {
            const decoded = this.verifyRefreshToken(refreshToken);
            
            // Получаем данные пользователя (в реальном приложении из БД)
            const userData = {
                id: decoded.userId,
                username: 'user_' + decoded.userId, // Временно
                role: 'user' // Временно
            };

            // Создаем новый access токен
            const newAccessToken = this.createAccessToken(userData);

            return {
                accessToken: newAccessToken,
                refreshToken: refreshToken, // Оставляем тот же refresh токен
                expiresIn: 24 * 60 * 60 // 24 часа в секундах
            };
        } catch (error) {
            throw new Error('Не удалось обновить токен: ' + error.message);
        }
    }

    // Регистрация пользователя
    async registerUser(userData) {
        try {
            // Проверяем обязательные поля
            if (!userData.username || !userData.password || !userData.email) {
                throw new Error('Не все обязательные поля заполнены');
            }

            // Хешируем пароль
            const hashedPassword = await this.hashPassword(userData.password);

            // Создаем пользователя (в реальном приложении сохраняем в БД)
            const newUser = {
                id: Date.now(),
                username: userData.username,
                email: userData.email,
                password_hash: hashedPassword,
                role: userData.role || 'user',
                avatar: userData.avatar || 'fas fa-user',
                created_at: new Date().toISOString()
            };

            // Создаем токены
            const accessToken = this.createAccessToken(newUser);
            const refreshToken = this.createRefreshToken(newUser);

            return {
                user: {
                    id: newUser.id,
                    username: newUser.username,
                    email: newUser.email,
                    role: newUser.role,
                    avatar: newUser.avatar
                },
                accessToken,
                refreshToken,
                expiresIn: 24 * 60 * 60
            };
        } catch (error) {
            throw new Error('Ошибка регистрации: ' + error.message);
        }
    }

    // Вход пользователя
    async loginUser(credentials) {
        try {
            // Проверяем обязательные поля
            if (!credentials.username || !credentials.password) {
                throw new Error('Не все обязательные поля заполнены');
            }

            // В реальном приложении получаем пользователя из БД
            // Здесь используем заглушку для демо
            const user = await this.getUserByCredentials(credentials);

            if (!user) {
                throw new Error('Неверные учетные данные');
            }

            // Проверяем пароль
            const isValidPassword = await this.verifyPassword(credentials.password, user.password_hash);
            if (!isValidPassword) {
                throw new Error('Неверные учетные данные');
            }

            // Создаем токены
            const accessToken = this.createAccessToken(user);
            const refreshToken = this.createRefreshToken(user);

            // Обновляем время последнего входа
            user.last_login = new Date().toISOString();

            return {
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    avatar: user.avatar,
                    last_login: user.last_login
                },
                accessToken,
                refreshToken,
                expiresIn: 24 * 60 * 60
            };
        } catch (error) {
            throw new Error('Ошибка входа: ' + error.message);
        }
    }

    // Выход пользователя
    logoutUser(token) {
        try {
            // Удаляем access токен
            this.activeTokens.delete(token);
            
            return { success: true, message: 'Выход выполнен успешно' };
        } catch (error) {
            throw new Error('Ошибка выхода: ' + error.message);
        }
    }

    // Полный выход (включая refresh токен)
    logoutUserCompletely(refreshToken) {
        try {
            // Удаляем refresh токен
            this.refreshTokens.delete(refreshToken);
            
            return { success: true, message: 'Полный выход выполнен успешно' };
        } catch (error) {
            throw new Error('Ошибка полного выхода: ' + error.message);
        }
    }

    // Получение пользователя по учетным данным (заглушка для демо)
    async getUserByCredentials(credentials) {
        // В реальном приложении здесь будет запрос к БД
        // Для демо используем заглушку
        if (credentials.username === 'admin' && credentials.password === 'admin123') {
            return {
                id: 1,
                username: 'admin',
                email: 'admin@example.com',
                password_hash: await this.hashPassword('admin123'),
                role: 'admin',
                avatar: 'fas fa-crown',
                created_at: new Date().toISOString()
            };
        }

        if (credentials.username === 'user' && credentials.password === 'user123') {
            return {
                id: 2,
                username: 'user',
                email: 'user@example.com',
                password_hash: await this.hashPassword('user123'),
                role: 'user',
                avatar: 'fas fa-user',
                created_at: new Date().toISOString()
            };
        }

        return null;
    }

    // Проверка прав доступа
    checkPermission(token, requiredRole) {
        try {
            const decoded = this.verifyToken(token);
            
            if (requiredRole === 'admin' && decoded.role !== 'admin') {
                return false;
            }
            
            if (requiredRole === 'moderator' && !['admin', 'moderator'].includes(decoded.role)) {
                return false;
            }
            
            return true;
        } catch (error) {
            return false;
        }
    }

    // Получение информации о пользователе из токена
    getUserFromToken(token) {
        try {
            return this.verifyToken(token);
        } catch (error) {
            return null;
        }
    }

    // Очистка истекших токенов
    cleanupExpiredTokens() {
        const now = Date.now();
        
        // Очистка access токенов
        for (const [token, data] of this.activeTokens.entries()) {
            if (data.expiresAt < now) {
                this.activeTokens.delete(token);
            }
        }
        
        // Очистка refresh токенов
        for (const [refreshToken, data] of this.refreshTokens.entries()) {
            if (data.expiresAt < now) {
                this.refreshTokens.delete(refreshToken);
            }
        }
        
        console.log('🧹 Очистка истекших токенов завершена');
    }

    // Статистика активных токенов
    getTokenStats() {
        return {
            activeTokens: this.activeTokens.size,
            refreshTokens: this.refreshTokens.size,
            totalTokens: this.activeTokens.size + this.refreshTokens.size
        };
    }

    // Сброс всех токенов (для администратора)
    resetAllTokens() {
        this.activeTokens.clear();
        this.refreshTokens.clear();
        console.log('🔄 Все токены сброшены');
        return { success: true, message: 'Все токены сброшены' };
    }

    // Изменение пароля
    async changePassword(userId, oldPassword, newPassword) {
        try {
            // В реальном приложении получаем пользователя из БД
            const user = await this.getUserByCredentials({ username: 'admin', password: oldPassword });
            
            if (!user || user.id !== userId) {
                throw new Error('Неверный старый пароль');
            }

            // Хешируем новый пароль
            const newHashedPassword = await this.hashPassword(newPassword);
            
            // В реальном приложении обновляем в БД
            user.password_hash = newHashedPassword;
            
            // Инвалидируем все токены пользователя
            this.invalidateUserTokens(userId);
            
            return { success: true, message: 'Пароль изменен успешно' };
        } catch (error) {
            throw new Error('Ошибка изменения пароля: ' + error.message);
        }
    }

    // Инвалидация всех токенов пользователя
    invalidateUserTokens(userId) {
        // Удаляем access токены
        for (const [token, data] of this.activeTokens.entries()) {
            if (data.userId === userId) {
                this.activeTokens.delete(token);
            }
        }
        
        // Удаляем refresh токены
        for (const [refreshToken, data] of this.refreshTokens.entries()) {
            if (data.userId === userId) {
                this.refreshTokens.delete(refreshToken);
            }
        }
        
        console.log(`🔄 Токены пользователя ${userId} инвалидированы`);
    }

    // Middleware для Express
    authenticateToken(req, res, next) {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({ error: 'Токен доступа не предоставлен' });
        }

        try {
            const decoded = this.verifyToken(token);
            req.user = decoded;
            next();
        } catch (error) {
            return res.status(403).json({ error: 'Недействительный токен' });
        }
    }

    // Middleware для проверки ролей
    requireRole(requiredRole) {
        return (req, res, next) => {
            if (!req.user) {
                return res.status(401).json({ error: 'Пользователь не аутентифицирован' });
            }

            if (!this.checkPermission(req.headers['authorization']?.split(' ')[1], requiredRole)) {
                return res.status(403).json({ error: 'Недостаточно прав' });
            }

            next();
        };
    }
}

// Создаем глобальный экземпляр
let authManager = null;

// Инициализация при запуске
if (require.main === module) {
    authManager = new AuthManager();
    
    // Graceful shutdown
    process.on('SIGTERM', () => {
        console.log('SIGTERM received, cleaning up auth manager');
        if (authManager) {
            authManager.cleanupExpiredTokens();
        }
        process.exit(0);
    });

    process.on('SIGINT', () => {
        console.log('SIGINT received, cleaning up auth manager');
        if (authManager) {
            authManager.cleanupExpiredTokens();
        }
        process.exit(0);
    });
}

module.exports = AuthManager;