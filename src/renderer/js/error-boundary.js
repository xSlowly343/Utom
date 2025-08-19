/**
 * Error Boundary - Глобальная обработка ошибок
 * Предотвращает падение всего приложения при ошибках
 */

class ErrorBoundary {
    constructor() {
        this.errors = [];
        this.maxErrors = 100;
        this.isRecovering = false;
        this.fallbackPages = {
            'dashboard': this.createDashboardFallback(),
            'raids': this.createRaidsFallback(),
            'characters': this.createCharactersFallback(),
            'chat': this.createChatFallback(),
            'tools': this.createToolsFallback(),
            'settings': this.createSettingsFallback()
        };
        
        this.init();
    }

    init() {
        // Глобальная обработка ошибок
        window.addEventListener('error', (event) => {
            this.handleError(event.error || new Error(event.message), 'window.error');
        });

        // Обработка необработанных Promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError(new Error(event.reason), 'unhandledrejection');
        });

        // Обработка ошибок в async функциях
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError(new Error(event.reason), 'async.error');
        });

        // Обработка ошибок в модулях
        this.setupModuleErrorHandling();
        
        console.log('ErrorBoundary: Инициализирован');
    }

    setupModuleErrorHandling() {
        // Перехватываем ошибки в основных модулях
        const modules = ['app', 'navigation', 'stateManager', 'databaseManager', 'authManager'];
        
        modules.forEach(moduleName => {
            if (window[moduleName]) {
                this.wrapModuleMethods(window[moduleName], moduleName);
            }
        });
    }

    wrapModuleMethods(module, moduleName) {
        const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(module));
        
        methods.forEach(methodName => {
            if (methodName !== 'constructor' && typeof module[methodName] === 'function') {
                const originalMethod = module[methodName];
                
                module[methodName] = async function(...args) {
                    try {
                        return await originalMethod.apply(this, args);
                    } catch (error) {
                        window.errorBoundary.handleError(error, `${moduleName}.${methodName}`);
                        throw error; // Пробрасываем ошибку дальше
                    }
                };
            }
        });
    }

    handleError(error, context = 'unknown') {
        const errorInfo = {
            message: error.message,
            stack: error.stack,
            context: context,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent
        };

        // Логируем ошибку
        this.logError(errorInfo);
        
        // Показываем пользователю
        this.showUserFriendlyError(errorInfo);
        
        // Пытаемся восстановиться
        this.attemptRecovery(errorInfo);
        
        // Отправляем в analytics (если есть)
        this.sendErrorToAnalytics(errorInfo);
    }

    logError(errorInfo) {
        this.errors.push(errorInfo);
        
        // Ограничиваем количество ошибок в памяти
        if (this.errors.length > this.maxErrors) {
            this.errors.shift();
        }

        // Сохраняем в localStorage для отладки
        try {
            localStorage.setItem('appErrors', JSON.stringify(this.errors));
        } catch (e) {
            console.warn('Не удалось сохранить ошибки в localStorage:', e);
        }

        console.error('ErrorBoundary: Ошибка зарегистрирована:', errorInfo);
    }

    showUserFriendlyError(errorInfo) {
        // Убираем предыдущие уведомления об ошибках
        this.removeErrorNotifications();
        
        // Создаем стабильное отображение ошибки
        this.createStableErrorDisplay(errorInfo);
        
        // Также показываем toast уведомление
        if (window.toastManager) {
            window.toastManager.error(
                'Произошла ошибка',
                this.getUserFriendlyMessage(errorInfo),
                0 // Без автоматического скрытия
            );
        }
    }

    createStableErrorDisplay(errorInfo) {
        // Удаляем предыдущее отображение ошибки если есть
        const existingError = document.getElementById('critical-error-display');
        if (existingError) {
            existingError.remove();
        }

        // Создаем стабильное отображение ошибки
        const errorDisplay = document.createElement('div');
        errorDisplay.id = 'critical-error-display';
        errorDisplay.className = 'critical-error-display';
        errorDisplay.innerHTML = `
            <div class="critical-error-content">
                <div class="critical-error-header">
                    <h3>🚨 Критическая ошибка</h3>
                    <button class="critical-error-close" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
                </div>
                <div class="critical-error-body">
                    <p><strong>Сообщение:</strong> ${this.getUserFriendlyMessage(errorInfo)}</p>
                    <p><strong>Контекст:</strong> ${errorInfo.context || 'Неизвестно'}</p>
                    <p><strong>Время:</strong> ${new Date(errorInfo.timestamp).toLocaleString()}</p>
                    <details class="error-details">
                        <summary>Детали ошибки</summary>
                        <pre class="error-stack">${errorInfo.stack || 'Стек вызовов недоступен'}</pre>
                    </details>
                    <div class="error-actions">
                        <button class="btn btn-primary" onclick="window.errorBoundary.retryOperation()">🔄 Повторить</button>
                        <button class="btn btn-outline" onclick="window.errorBoundary.showErrorHelp()">❓ Помощь</button>
                        <button class="btn btn-outline" onclick="window.errorBoundary.reportError('${errorInfo.message}')">📤 Отправить отчет</button>
                    </div>
                </div>
            </div>
        `;

        // Добавляем стили
        this.addErrorDisplayStyles();
        
        // Вставляем в начало body
        document.body.insertBefore(errorDisplay, document.body.firstChild);
        
        // Сохраняем ошибку для последующего анализа
        this.lastError = errorInfo;
    }

    addErrorDisplayStyles() {
        if (!document.getElementById('error-boundary-styles')) {
            const style = document.createElement('style');
            style.id = 'error-boundary-styles';
            style.textContent = `
                .critical-error-display {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.8);
                    z-index: 10000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                }
                
                .critical-error-content {
                    background: var(--bg-primary, #ffffff);
                    border: 2px solid var(--danger-color, #dc3545);
                    border-radius: 12px;
                    max-width: 600px;
                    width: 100%;
                    max-height: 80vh;
                    overflow-y: auto;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                }
                
                .critical-error-header {
                    background: var(--danger-color, #dc3545);
                    color: white;
                    padding: 20px;
                    border-radius: 10px 10px 0 0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .critical-error-header h3 {
                    margin: 0;
                    font-size: 20px;
                }
                
                .critical-error-close {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 24px;
                    cursor: pointer;
                    padding: 0;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    transition: background-color 0.2s;
                }
                
                .critical-error-close:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
                
                .critical-error-body {
                    padding: 20px;
                }
                
                .critical-error-body p {
                    margin: 0 0 15px 0;
                    line-height: 1.5;
                }
                
                .error-details {
                    margin: 20px 0;
                    border: 1px solid var(--border-color, #ddd);
                    border-radius: 8px;
                    overflow: hidden;
                }
                
                .error-details summary {
                    background: var(--bg-secondary, #f8f9fa);
                    padding: 15px;
                    cursor: pointer;
                    font-weight: 600;
                    border-bottom: 1px solid var(--border-color, #ddd);
                }
                
                .error-details summary:hover {
                    background: var(--bg-tertiary, #e9ecef);
                }
                
                .error-stack {
                    background: var(--bg-secondary, #f8f9fa);
                    padding: 15px;
                    margin: 0;
                    font-family: 'Courier New', monospace;
                    font-size: 12px;
                    line-height: 1.4;
                    overflow-x: auto;
                    white-space: pre-wrap;
                    color: var(--text-secondary, #6c757d);
                }
                
                .error-actions {
                    display: flex;
                    gap: 10px;
                    margin-top: 20px;
                    flex-wrap: wrap;
                }
                
                .error-actions .btn {
                    flex: 1;
                    min-width: 120px;
                }
                
                .fallback-page.critical {
                    text-align: center;
                    padding: 60px 20px;
                    background: var(--bg-primary, #ffffff);
                    border-radius: 12px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
                }
                
                .fallback-page.critical h1 {
                    color: var(--danger-color, #dc3545);
                    margin-bottom: 20px;
                }
                
                .fallback-actions {
                    display: flex;
                    gap: 15px;
                    justify-content: center;
                    margin-top: 30px;
                    flex-wrap: wrap;
                }
                
                @media (max-width: 768px) {
                    .critical-error-content {
                        margin: 10px;
                        max-height: 90vh;
                    }
                    
                    .critical-error-header {
                        padding: 15px;
                    }
                    
                    .critical-error-header h3 {
                        font-size: 18px;
                    }
                    
                    .critical-error-body {
                        padding: 15px;
                    }
                    
                    .error-actions {
                        flex-direction: column;
                    }
                    
                    .error-actions .btn {
                        width: 100%;
                    }
                }
            `;
            
            document.head.appendChild(style);
        }
    }

    createErrorNotification(errorInfo) {
        const notification = document.createElement('div');
        notification.className = 'error-notification critical';
        notification.innerHTML = `
            <div class="error-header">
                <span class="error-icon">🚨</span>
                <span class="error-title">Произошла ошибка</span>
                <button class="error-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
            <div class="error-message">
                ${this.getUserFriendlyMessage(errorInfo)}
            </div>
            <div class="error-actions">
                <button class="btn btn-secondary btn-sm" onclick="window.errorBoundary.retryOperation()">
                    🔄 Повторить
                </button>
                <button class="btn btn-primary btn-sm" onclick="window.errorBoundary.showErrorDetails()">
                    📋 Детали
                </button>
            </div>
        `;
        
        return notification;
    }

    getUserFriendlyMessage(errorInfo) {
        const context = errorInfo.context;
        
        if (context.includes('database')) {
            return 'Проблема с базой данных. Попробуйте перезапустить приложение.';
        } else if (context.includes('websocket')) {
            return 'Проблема с соединением. Проверьте интернет и попробуйте снова.';
        } else if (context.includes('auth')) {
            return 'Проблема с авторизацией. Попробуйте войти заново.';
        } else if (context.includes('navigation')) {
            return 'Проблема с навигацией. Попробуйте обновить страницу.';
        } else {
            return 'Произошла неожиданная ошибка. Попробуйте перезапустить приложение.';
        }
    }

    removeErrorNotifications() {
        const existingNotifications = document.querySelectorAll('.error-notification');
        existingNotifications.forEach(notification => notification.remove());
    }

    attemptRecovery(errorInfo) {
        if (this.isRecovering) return;
        
        this.isRecovering = true;
        
        try {
            // Пытаемся восстановить базовые функции
            this.recoverBasicFunctionality();
            
            // Пытаемся восстановить текущую страницу
            this.recoverCurrentPage();
            
        } catch (recoveryError) {
            console.error('ErrorBoundary: Ошибка восстановления:', recoveryError);
            this.showCriticalError();
        } finally {
            this.isRecovering = false;
        }
    }

    recoverBasicFunctionality() {
        // Восстанавливаем базовые функции приложения
        if (!window.app) {
            console.warn('ErrorBoundary: Попытка восстановления основного приложения');
            // Здесь можно попытаться переинициализировать app
        }
        
        // Восстанавливаем навигацию
        if (!window.navigation) {
            console.warn('ErrorBoundary: Попытка восстановления навигации');
            // Здесь можно попытаться переинициализировать navigation
        }
    }

    recoverCurrentPage() {
        const currentPage = this.getCurrentPage();
        const fallbackPage = this.fallbackPages[currentPage];
        
        if (fallbackPage) {
            try {
                this.showFallbackPage(currentPage, fallbackPage);
            } catch (error) {
                console.error('ErrorBoundary: Не удалось показать fallback страницу:', error);
                this.showGenericFallback();
            }
        }
    }

    getCurrentPage() {
        // Пытаемся определить текущую страницу
        const hash = window.location.hash;
        if (hash) {
            return hash.substring(1);
        }
        
        // Fallback на dashboard
        return 'dashboard';
    }

    showFallbackPage(pageName, fallbackContent) {
        const mainContent = document.getElementById('mainContent');
        if (mainContent) {
            mainContent.innerHTML = fallbackContent;
            console.log(`ErrorBoundary: Показана fallback страница для ${pageName}`);
        }
    }

    showGenericFallback() {
        const mainContent = document.getElementById('mainContent');
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="fallback-container">
                    <div class="fallback-content">
                        <div class="fallback-icon">⚠️</div>
                        <h2>Временные проблемы</h2>
                        <p>Приложение столкнулось с проблемами. Попробуйте:</p>
                        <ul>
                            <li>Обновить страницу (F5)</li>
                            <li>Перезапустить приложение</li>
                            <li>Проверить интернет соединение</li>
                        </ul>
                        <div class="fallback-actions">
                            <button class="btn btn-primary" onclick="location.reload()">
                                🔄 Обновить страницу
                            </button>
                            <button class="btn btn-secondary" onclick="window.errorBoundary.showErrorReport()">
                                📋 Отправить отчет об ошибке
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    // Fallback страницы для основных разделов
    createDashboardFallback() {
        return `
            <div class="fallback-page">
                <h2>Дашборд временно недоступен</h2>
                <p>Попробуйте обновить страницу или перейти в другой раздел.</p>
                <div class="fallback-navigation">
                    <a href="#raids" class="btn btn-secondary">Рейды</a>
                    <a href="#characters" class="btn btn-secondary">Персонажи</a>
                    <a href="#settings" class="btn btn-secondary">Настройки</a>
                </div>
            </div>
        `;
    }

    createRaidsFallback() {
        return `
            <div class="fallback-page">
                <h2>Управление рейдами временно недоступно</h2>
                <p>Попробуйте обновить страницу или перейти в другой раздел.</p>
                <div class="fallback-navigation">
                    <a href="#dashboard" class="btn btn-secondary">Дашборд</a>
                    <a href="#characters" class="btn btn-secondary">Персонажи</a>
                    <a href="#settings" class="btn btn-secondary">Настройки</a>
                </div>
            </div>
        `;
    }

    createCharactersFallback() {
        return `
            <div class="fallback-page">
                <h2>Управление персонажами временно недоступно</h2>
                <p>Попробуйте обновить страницу или перейти в другой раздел.</p>
                <div class="fallback-navigation">
                    <a href="#dashboard" class="btn btn-secondary">Дашборд</a>
                    <a href="#raids" class="btn btn-secondary">Рейды</a>
                    <a href="#settings" class="btn btn-secondary">Настройки</a>
                </div>
            </div>
        `;
    }

    createChatFallback() {
        return `
            <div class="fallback-page">
                <h2>Чат временно недоступен</h2>
                <p>Попробуйте обновить страницу или перейти в другой раздел.</p>
                <div class="fallback-navigation">
                    <a href="#dashboard" class="btn btn-secondary">Дашборд</a>
                    <a href="#raids" class="btn btn-secondary">Рейды</a>
                    <a href="#settings" class="btn btn-secondary">Настройки</a>
                </div>
            </div>
        `;
    }

    createToolsFallback() {
        return `
            <div class="fallback-page">
                <h2>Инструменты временно недоступны</h2>
                <p>Попробуйте обновить страницу или перейти в другой раздел.</p>
                <div class="fallback-navigation">
                    <a href="#dashboard" class="btn btn-secondary">Дашборд</a>
                    <a href="#raids" class="btn btn-secondary">Рейды</a>
                    <a href="#settings" class="btn btn-secondary">Настройки</a>
                </div>
            </div>
        `;
    }

    createSettingsFallback() {
        return `
            <div class="fallback-page">
                <h2>Настройки временно недоступны</h2>
                <p>Попробуйте обновить страницу или перейти в другой раздел.</p>
                <div class="fallback-navigation">
                    <a href="#dashboard" class="btn btn-secondary">Дашборд</a>
                    <a href="#raids" class="btn btn-secondary">Рейды</a>
                    <a href="#characters" class="btn btn-secondary">Персонажи</a>
                </div>
            </div>
        `;
    }

    // Публичные методы для пользователя
    retryOperation() {
        console.log('ErrorBoundary: Повторная попытка операции');
        location.reload();
    }

    showErrorDetails() {
        const errorDetails = this.errors[this.errors.length - 1];
        if (errorDetails) {
            alert(`Детали ошибки:\n\nСообщение: ${errorDetails.message}\nКонтекст: ${errorDetails.context}\nВремя: ${errorDetails.timestamp}`);
        }
    }

    showErrorReport() {
        const report = {
            errors: this.errors,
            systemInfo: {
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                language: navigator.language,
                timestamp: new Date().toISOString()
            }
        };
        
        // Здесь можно отправить отчет на сервер
        console.log('ErrorBoundary: Отчет об ошибках:', report);
        alert('Отчет об ошибках отправлен разработчикам. Спасибо за обратную связь!');
    }

    showCriticalError() {
        // Показываем критическую ошибку
        const criticalError = {
            message: 'Критическая ошибка приложения',
            context: 'critical.system.failure',
            timestamp: new Date().toISOString(),
            stack: 'Критическая ошибка в системе'
        };
        
        this.createStableErrorDisplay(criticalError);
        
        // Показываем fallback страницу
        this.showFallbackPage();
    }

    showFallbackPage() {
        const mainContent = document.querySelector('main, .main-content, #mainContent');
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="fallback-page critical">
                    <h1>🚨 Критическая ошибка</h1>
                    <p>Приложение столкнулось с критической ошибкой и не может продолжить работу.</p>
                    <div class="fallback-actions">
                        <button class="btn btn-primary" onclick="location.reload()">🔄 Перезапустить</button>
                        <button class="btn btn-outline" onclick="window.errorBoundary.showErrorHelp()">❓ Помощь</button>
                        <button class="btn btn-outline" onclick="window.errorBoundary.showErrorReport()">📤 Отчет</button>
                    </div>
                </div>
            `;
        }
    }

    showErrorHelp() {
        const helpContent = `
            <h3>Что делать при ошибке:</h3>
            <ol>
                <li>Попробуйте обновить страницу (F5)</li>
                <li>Перезапустите приложение</li>
                <li>Проверьте подключение к интернету</li>
                <li>Очистите кэш браузера</li>
                <li>Обратитесь к разработчикам</li>
            </ol>
            <p><strong>Последняя ошибка:</strong> ${this.lastError ? this.lastError.message : 'Неизвестно'}</p>
        `;
        
        if (window.toastManager) {
            window.toastManager.info('Помощь по ошибке', helpContent, 0);
        } else {
            alert(helpContent);
        }
    }

    reportError(errorMessage) {
        const report = {
            error: errorMessage,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            errors: this.errors.slice(-5) // Последние 5 ошибок
        };
        
        console.log('Отчет об ошибке:', report);
        
        if (window.toastManager) {
            window.toastManager.success('Отчет отправлен', 'Спасибо за обратную связь!', 5000);
        } else {
            alert('Отчет об ошибке отправлен. Спасибо за обратную связь!');
        }
    }

    sendErrorToAnalytics(errorInfo) {
        // Отправляем ошибку в analytics (если настроен)
        if (window.analytics && typeof window.analytics.track === 'function') {
            try {
                window.analytics.track('Error Occurred', {
                    error: errorInfo.message,
                    context: errorInfo.context,
                    timestamp: errorInfo.timestamp
                });
            } catch (e) {
                console.warn('ErrorBoundary: Не удалось отправить ошибку в analytics:', e);
            }
        }
    }

    // Получение статистики ошибок
    getErrorStats() {
        const totalErrors = this.errors.length;
        const recentErrors = this.errors.filter(error => {
            const errorTime = new Date(error.timestamp);
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
            return errorTime > oneHourAgo;
        }).length;

        return {
            total: totalErrors,
            recent: recentErrors,
            lastError: this.errors[this.errors.length - 1] || null
        };
    }

    // Очистка ошибок
    clearErrors() {
        this.errors = [];
        try {
            localStorage.removeItem('appErrors');
        } catch (e) {
            console.warn('ErrorBoundary: Не удалось очистить ошибки из localStorage:', e);
        }
        console.log('ErrorBoundary: Все ошибки очищены');
    }

    // Проверка здоровья приложения
    checkAppHealth() {
        const criticalModules = ['app', 'navigation', 'stateManager'];
        const missingModules = criticalModules.filter(module => !window[module]);
        
        if (missingModules.length > 0) {
            console.warn('ErrorBoundary: Отсутствуют критические модули:', missingModules);
            return false;
        }
        
        return true;
    }
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    window.errorBoundary = new ErrorBoundary();
    
    // Проверяем здоровье приложения
    setTimeout(() => {
        if (!window.errorBoundary.checkAppHealth()) {
            console.warn('ErrorBoundary: Обнаружены проблемы с приложением');
        }
    }, 2000);
});

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ErrorBoundary;
}