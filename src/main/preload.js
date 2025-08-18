/**
 * Preload Script
 * Safely exposes Electron APIs to the renderer process
 * Updated for Electron 37.x compatibility
 */

const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    // App information
    getAppVersion: () => ipcRenderer.invoke('get-app-version'),
    getAppPath: () => ipcRenderer.invoke('get-app-path'),
    
    // Dialog operations
    showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),
    showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
    
    // Event listeners with proper cleanup
    on: (channel, callback) => {
        // Whitelist channels
        const validChannels = [
            'take-screenshot',
            'show-raid-notification',
            'new-raid',
            'import-characters',
            'open-settings',
            'open-screenshot-tool',
            'open-text-recognition',
            'open-raid-scheduler'
        ];
        
        if (validChannels.includes(channel)) {
            ipcRenderer.on(channel, (event, ...args) => callback(...args));
        } else {
            console.warn(`Attempted to listen to invalid channel: ${channel}`);
        }
    },
    
    // Remove event listeners
    removeAllListeners: (channel) => {
        const validChannels = [
            'take-screenshot',
            'show-raid-notification',
            'new-raid',
            'import-characters',
            'open-settings',
            'open-screenshot-tool',
            'open-text-recognition',
            'open-raid-scheduler'
        ];
        
        if (validChannels.includes(channel)) {
            ipcRenderer.removeAllListeners(channel);
        }
    }
});

// Expose utility functions
contextBridge.exposeInMainWorld('electronUtils', {
    // Platform detection
    isWindows: process.platform === 'win32',
    isMac: process.platform === 'darwin',
    isLinux: process.platform === 'linux',
    
    // Environment detection
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    
    // Process utilities
    getProcessMemory: () => {
        try {
            return process.memoryUsage();
        } catch (error) {
            console.warn('Could not get process memory:', error);
            return { rss: 0, heapTotal: 0, heapUsed: 0, external: 0 };
        }
    },
    
    getProcessCPU: () => {
        try {
            return process.cpuUsage();
        } catch (error) {
            console.warn('Could not get process CPU usage:', error);
            return { user: 0, system: 0 };
        }
    }
});

// Expose configuration
contextBridge.exposeInMainWorld('appConfig', {
    name: 'Lost Ark Raid Manager',
    version: '1.0.0',
    description: 'Приложение для управления рейдами и персонажами в Lost Ark',
    features: {
        raids: true,
        characters: true,
        chat: true,
        tools: true,
        analytics: true
    }
});

// Handle window events
window.addEventListener('DOMContentLoaded', () => {
    // Set up global error handling
    window.addEventListener('error', (event) => {
        console.error('Global error:', event.error);
    });
    
    window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled promise rejection:', event.reason);
    });
});

// Expose safe console methods
contextBridge.exposeInMainWorld('safeConsole', {
    log: (...args) => {
        console.log(...args);
    },
    info: (...args) => {
        console.info(...args);
    },
    warn: (...args) => {
        console.warn(...args);
    },
    error: (...args) => {
        console.error(...args);
    }
});

// Expose performance monitoring
contextBridge.exposeInMainWorld('performanceMonitor', {
    mark: (name) => {
        try {
            performance.mark(name);
        } catch (error) {
            console.warn('Could not create performance mark:', error);
        }
    },
    measure: (name, startMark, endMark) => {
        try {
            return performance.measure(name, startMark, endMark);
        } catch (error) {
            console.warn('Could not create performance measure:', error);
            return null;
        }
    },
    getEntries: () => {
        try {
            return performance.getEntries();
        } catch (error) {
            console.warn('Could not get performance entries:', error);
            return [];
        }
    },
    getEntriesByName: (name) => {
        try {
            return performance.getEntriesByName(name);
        } catch (error) {
            console.warn('Could not get performance entries by name:', error);
            return [];
        }
    },
    getEntriesByType: (type) => {
        try {
            return performance.getEntriesByType(type);
        } catch (error) {
            console.warn('Could not get performance entries by type:', error);
            return [];
        }
    },
    clearMarks: () => {
        try {
            performance.clearMarks();
        } catch (error) {
            console.warn('Could not clear performance marks:', error);
        }
    },
    clearMeasures: () => {
        try {
            performance.clearMeasures();
        } catch (error) {
            console.warn('Could not clear performance measures:', error);
        }
    },
    now: () => {
        try {
            return performance.now();
        } catch (error) {
            console.warn('Could not get performance now:', error);
            return Date.now();
        }
    }
});

// Expose storage utilities
contextBridge.exposeInMainWorld('storage', {
    // Local storage
    localStorage: {
        getItem: (key) => {
            try {
                return localStorage.getItem(key);
            } catch (error) {
                console.warn('Could not get localStorage item:', error);
                return null;
            }
        },
        setItem: (key, value) => {
            try {
                localStorage.setItem(key, value);
                return true;
            } catch (error) {
                console.warn('Could not set localStorage item:', error);
                return false;
            }
        },
        removeItem: (key) => {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (error) {
                console.warn('Could not remove localStorage item:', error);
                return false;
            }
        },
        clear: () => {
            try {
                localStorage.clear();
                return true;
            } catch (error) {
                console.warn('Could not clear localStorage:', error);
                return false;
            }
        },
        key: (index) => {
            try {
                return localStorage.key(index);
            } catch (error) {
                console.warn('Could not get localStorage key:', error);
                return null;
            }
        },
        get length() { 
            try {
                return localStorage.length;
            } catch (error) {
                console.warn('Could not get localStorage length:', error);
                return 0;
            }
        }
    },
    
    // Session storage
    sessionStorage: {
        getItem: (key) => {
            try {
                return sessionStorage.getItem(key);
            } catch (error) {
                console.warn('Could not get sessionStorage item:', error);
                return null;
            }
        },
        setItem: (key, value) => {
            try {
                sessionStorage.setItem(key, value);
                return true;
            } catch (error) {
                console.warn('Could not set sessionStorage item:', error);
                return false;
            }
        },
        removeItem: (key) => {
            try {
                sessionStorage.removeItem(key);
                return true;
            } catch (error) {
                console.warn('Could not remove sessionStorage item:', error);
                return false;
            }
        },
        clear: () => {
            try {
                sessionStorage.clear();
                return true;
            } catch (error) {
                console.warn('Could not clear sessionStorage:', error);
                return false;
            }
        },
        key: (index) => {
            try {
                return sessionStorage.key(index);
            } catch (error) {
                console.warn('Could not get sessionStorage key:', error);
                return null;
            }
        },
        get length() { 
            try {
                return sessionStorage.length;
            } catch (error) {
                console.warn('Could not get sessionStorage length:', error);
                return 0;
            }
        }
    }
});

// Expose crypto utilities (if available)
contextBridge.exposeInMainWorld('crypto', {
    randomUUID: () => {
        try {
            if (crypto.randomUUID) {
                return crypto.randomUUID();
            } else {
                // Fallback for older browsers
                return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                    const r = Math.random() * 16 | 0;
                    const v = c == 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                });
            }
        } catch (error) {
            console.warn('Could not generate UUID:', error);
            return 'fallback-uuid-' + Date.now();
        }
    },
    getRandomValues: (array) => {
        try {
            return crypto.getRandomValues(array);
        } catch (error) {
            console.warn('Could not get random values:', error);
            // Fallback to Math.random
            for (let i = 0; i < array.length; i++) {
                array[i] = Math.floor(Math.random() * 256);
            }
            return array;
        }
    }
});

// Expose date utilities
contextBridge.exposeInMainWorld('dateUtils', {
    now: () => new Date(),
    format: (date, format) => {
        try {
            // Simple date formatting
            const d = new Date(date);
            if (isNaN(d.getTime())) {
                throw new Error('Invalid date');
            }
            
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const hours = String(d.getHours()).padStart(2, '0');
            const minutes = String(d.getMinutes()).padStart(2, '0');
            const seconds = String(d.getSeconds()).padStart(2, '0');
            
            return format
                .replace('YYYY', year)
                .replace('MM', month)
                .replace('DD', day)
                .replace('HH', hours)
                .replace('mm', minutes)
                .replace('ss', seconds);
        } catch (error) {
            console.warn('Could not format date:', error);
            return 'Invalid Date';
        }
    },
    parse: (dateString) => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                throw new Error('Invalid date string');
            }
            return date;
        } catch (error) {
            console.warn('Could not parse date:', error);
            return new Date();
        }
    },
    isValid: (date) => {
        try {
            return !isNaN(new Date(date).getTime());
        } catch (error) {
            return false;
        }
    }
});

// Expose validation utilities
contextBridge.exposeInMainWorld('validation', {
    isEmail: (email) => {
        try {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        } catch (error) {
            console.warn('Could not validate email:', error);
            return false;
        }
    },
    isUrl: (url) => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    },
    isNumber: (value) => {
        try {
            return !isNaN(value) && !isNaN(parseFloat(value));
        } catch (error) {
            return false;
        }
    },
    isInteger: (value) => {
        try {
            return Number.isInteger(Number(value));
        } catch (error) {
            return false;
        }
    },
    isPositive: (value) => {
        try {
            return Number(value) > 0;
        } catch (error) {
            return false;
        }
    },
    isInRange: (value, min, max) => {
        try {
            const numValue = Number(value);
            return numValue >= min && numValue <= max;
        } catch (error) {
            return false;
        }
    },
    hasLength: (value, min, max) => {
        try {
            const length = String(value).length;
            return length >= min && (max === undefined || length <= max);
        } catch (error) {
            return false;
        }
    }
});

// Expose math utilities
contextBridge.exposeInMainWorld('mathUtils', {
    round: (value, decimals = 0) => {
        try {
            const factor = Math.pow(10, decimals);
            return Math.round(value * factor) / factor;
        } catch (error) {
            console.warn('Could not round value:', error);
            return value;
        }
    },
    clamp: (value, min, max) => {
        try {
            return Math.min(Math.max(value, min), max);
        } catch (error) {
            console.warn('Could not clamp value:', error);
            return value;
        }
    },
    lerp: (start, end, factor) => {
        try {
            return start + (end - start) * factor;
        } catch (error) {
            console.warn('Could not lerp values:', error);
            return start;
        }
    },
    map: (value, inMin, inMax, outMin, outMax) => {
        try {
            return outMin + (outMax - outMin) * ((value - inMin) / (inMax - inMin));
        } catch (error) {
            console.warn('Could not map value:', error);
            return value;
        }
    },
    random: (min, max) => {
        try {
            return Math.random() * (max - min) + min;
        } catch (error) {
            console.warn('Could not generate random value:', error);
            return min;
        }
    },
    randomInt: (min, max) => {
        try {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        } catch (error) {
            console.warn('Could not generate random integer:', error);
            return min;
        }
    }
});

// Expose string utilities
contextBridge.exposeInMainWorld('stringUtils', {
    capitalize: (str) => {
        try {
            if (typeof str !== 'string') return str;
            return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
        } catch (error) {
            console.warn('Could not capitalize string:', error);
            return str;
        }
    },
    truncate: (str, length, suffix = '...') => {
        try {
            if (typeof str !== 'string') return str;
            return str.length > length ? str.substring(0, length) + suffix : str;
        } catch (error) {
            console.warn('Could not truncate string:', error);
            return str;
        }
    },
    slugify: (str) => {
        try {
            if (typeof str !== 'string') return str;
            return str.toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/[\s_-]+/g, '-')
                .replace(/^-+|-+$/g, '');
        } catch (error) {
            console.warn('Could not slugify string:', error);
            return str;
        }
    },
    escapeHtml: (str) => {
        try {
            if (typeof str !== 'string') return str;
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        } catch (error) {
            console.warn('Could not escape HTML:', error);
            return str;
        }
    },
    unescapeHtml: (str) => {
        try {
            if (typeof str !== 'string') return str;
            const div = document.createElement('div');
            div.innerHTML = str;
            return div.textContent;
        } catch (error) {
            console.warn('Could not unescape HTML:', error);
            return str;
        }
    }
});

console.log('Preload script loaded successfully');
