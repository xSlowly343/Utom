// Utils Module
class Utils {
    constructor() {
        this.init();
    }

    init() {
        // Initialize utility functions
        this.setupGlobalUtils();
    }

    setupGlobalUtils() {
        // Make utility functions globally available
        window.utils = this;
    }

    // Date and Time Utilities
    formatDate(date, format = 'ru-RU') {
        if (!date) return '';
        
        try {
            const dateObj = new Date(date);
            return dateObj.toLocaleDateString(format);
        } catch (error) {
            console.error('Error formatting date:', error);
            return '';
        }
    }

    formatDateTime(date, format = 'ru-RU') {
        if (!date) return '';
        
        try {
            const dateObj = new Date(date);
            return dateObj.toLocaleString(format);
        } catch (error) {
            console.error('Error formatting date time:', error);
            return '';
        }
    }

    formatRelativeTime(date) {
        if (!date) return '';
        
        try {
            const now = new Date();
            const dateObj = new Date(date);
            const diffMs = now - dateObj;
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
                return this.formatDate(date);
            }
        } catch (error) {
            console.error('Error formatting relative time:', error);
            return '';
        }
    }

    getTimeUntil(date) {
        if (!date) return '';
        
        try {
            const now = new Date();
            const targetDate = new Date(date);
            const diffMs = targetDate - now;
            
            if (diffMs <= 0) {
                return 'Время истекло';
            }
            
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);

            if (diffMins < 60) {
                return `Через ${diffMins} мин`;
            } else if (diffHours < 24) {
                return `Через ${diffHours} ч`;
            } else {
                return `Через ${diffDays} дн`;
            }
        } catch (error) {
            console.error('Error calculating time until:', error);
            return '';
        }
    }

    // String Utilities
    capitalizeFirst(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    truncateString(str, maxLength = 50, suffix = '...') {
        if (!str || str.length <= maxLength) return str;
        return str.substring(0, maxLength) + suffix;
    }

    generateSlug(str) {
        if (!str) return '';
        
        return str
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    }

    // Number Utilities
    formatNumber(num, decimals = 0) {
        if (isNaN(num)) return '0';
        
        try {
            return Number(num).toLocaleString('ru-RU', {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals
            });
        } catch (error) {
            console.error('Error formatting number:', error);
            return num.toString();
        }
    }

    formatCurrency(amount, currency = 'RUB') {
        if (isNaN(amount)) return '0 ₽';
        
        try {
            return new Intl.NumberFormat('ru-RU', {
                style: 'currency',
                currency: currency
            }).format(amount);
        } catch (error) {
            console.error('Error formatting currency:', error);
            return `${amount} ₽`;
        }
    }

    // Array Utilities
    chunkArray(array, size) {
        if (!Array.isArray(array) || size <= 0) return [];
        
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }

    shuffleArray(array) {
        if (!Array.isArray(array)) return [];
        
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    removeDuplicates(array, key = null) {
        if (!Array.isArray(array)) return [];
        
        if (key) {
            const seen = new Set();
            return array.filter(item => {
                const value = item[key];
                if (seen.has(value)) {
                    return false;
                }
                seen.add(value);
                return true;
            });
        } else {
            return [...new Set(array)];
        }
    }

    // Object Utilities
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        if (typeof obj === 'object') {
            const cloned = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    cloned[key] = this.deepClone(obj[key]);
                }
            }
            return cloned;
        }
        return obj;
    }

    mergeObjects(target, ...sources) {
        if (!target || typeof target !== 'object') return target;
        
        sources.forEach(source => {
            if (source && typeof source === 'object') {
                Object.keys(source).forEach(key => {
                    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                        target[key] = this.mergeObjects(target[key] || {}, source[key]);
                    } else {
                        target[key] = source[key];
                    }
                });
            }
        });
        
        return target;
    }

    // Validation Utilities
    isValidEmail(email) {
        if (!email || typeof email !== 'string') return false;
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidUrl(url) {
        if (!url || typeof url !== 'string') return false;
        
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    isValidPhone(phone) {
        if (!phone || typeof phone !== 'string') return false;
        
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
        return phoneRegex.test(phone);
    }

    // Storage Utilities
    setLocalStorage(key, value) {
        try {
            const serializedValue = JSON.stringify(value);
            localStorage.setItem(key, serializedValue);
            return true;
        } catch (error) {
            console.error('Error setting localStorage:', error);
            return false;
        }
    }

    getLocalStorage(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            if (item === null) return defaultValue;
            return JSON.parse(item);
        } catch (error) {
            console.error('Error getting localStorage:', error);
            return defaultValue;
        }
    }

    removeLocalStorage(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing localStorage:', error);
            return false;
        }
    }

    clearLocalStorage() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    }

    // DOM Utilities
    createElement(tag, className = '', innerHTML = '') {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (innerHTML) element.innerHTML = innerHTML;
        return element;
    }

    addEventListeners(element, events) {
        if (!element || !events) return;
        
        Object.keys(events).forEach(eventType => {
            element.addEventListener(eventType, events[eventType]);
        });
    }

    removeEventListeners(element, events) {
        if (!element || !events) return;
        
        Object.keys(events).forEach(eventType => {
            element.removeEventListener(eventType, events[eventType]);
        });
    }

    // Animation Utilities
    fadeIn(element, duration = 300) {
        if (!element) return;
        
        element.style.opacity = '0';
        element.style.display = 'block';
        
        let start = null;
        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const opacity = Math.min(progress / duration, 1);
            
            element.style.opacity = opacity;
            
            if (progress < duration) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    fadeOut(element, duration = 300) {
        if (!element) return;
        
        let start = null;
        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const opacity = Math.max(1 - (progress / duration), 0);
            
            element.style.opacity = opacity;
            
            if (progress < duration) {
                requestAnimationFrame(animate);
            } else {
                element.style.display = 'none';
            }
        };
        
        requestAnimationFrame(animate);
    }

    // Notification Utilities
    showNotification(message, type = 'info', duration = 5000) {
        // Create notification element
        const notification = this.createElement('div', `notification notification-${type}`);
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Add event listeners
        const closeBtn = notification.querySelector('.notification-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.removeNotification(notification));
        }

        // Auto remove after duration
        setTimeout(() => {
            this.removeNotification(notification);
        }, duration);

        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        return notification;
    }

    removeNotification(notification) {
        if (!notification) return;
        
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'times-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    // File Utilities
    downloadFile(data, filename, type = 'text/plain') {
        try {
            const blob = new Blob([data], { type });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            URL.revokeObjectURL(url);
            return true;
        } catch (error) {
            console.error('Error downloading file:', error);
            return false;
        }
    }

    readFile(file) {
        return new Promise((resolve, reject) => {
            if (!file) {
                reject(new Error('No file provided'));
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsText(file);
        });
    }

    // Color Utilities
    generateRandomColor() {
        return '#' + Math.floor(Math.random() * 16777215).toString(16);
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }

    // Debounce and Throttle
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // UUID Generation
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    generateShortId(length = 8) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    // Error Handling
    handleError(error, context = '') {
        console.error(`Error in ${context}:`, error);
        
        // In production, you might want to send this to an error tracking service
        // For now, we'll just log it
        
        return {
            message: error.message || 'An unknown error occurred',
            stack: error.stack,
            context: context,
            timestamp: new Date().toISOString()
        };
    }

    // Performance Utilities
    measurePerformance(name, fn) {
        const start = performance.now();
        const result = fn();
        const end = performance.now();
        
        console.log(`${name} took ${(end - start).toFixed(2)}ms`);
        return result;
    }

    async measureAsyncPerformance(name, fn) {
        const start = performance.now();
        const result = await fn();
        const end = performance.now();
        
        console.log(`${name} took ${(end - start).toFixed(2)}ms`);
        return result;
    }
}

// Initialize utils when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.utils = new Utils();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}