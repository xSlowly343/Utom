/**
 * Preload Script
 * Safely exposes Electron APIs to the renderer process
 */

const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    // App information
    getAppVersion: () => ipcRenderer.invoke('get-app-version'),
    getAppPath: () => ipcRenderer.invoke('get-app-path'),
    getUserDataPath: () => ipcRenderer.invoke('get-user-data-path'),
    
    // Dialog operations
    showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),
    showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
    showMessageBox: (options) => ipcRenderer.invoke('show-message-box', options),
    
    // File operations
    readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
    writeFile: (filePath, content) => ipcRenderer.invoke('write-file', filePath, content),
    readDirectory: (dirPath) => ipcRenderer.invoke('read-directory', dirPath),
    
    // Screen capture
    captureScreen: () => ipcRenderer.invoke('capture-screen'),
    
    // System information
    getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
    
    // App control
    restartApp: () => ipcRenderer.invoke('restart-app'),
    quitApp: () => ipcRenderer.invoke('quit-app'),
    
    // Event listeners
    on: (channel, callback) => {
        // Whitelist channels
        const validChannels = [
            'global-shortcut',
            'menu-action',
            'window-maximized',
            'window-unmaximized',
            'window-minimized',
            'window-restored',
            'check-unsaved-changes',
            'save-changes',
            'app-shutting-down'
        ];
        
        if (validChannels.includes(channel)) {
            ipcRenderer.on(channel, (event, ...args) => callback(...args));
        }
    },
    
    // Remove event listeners
    removeAllListeners: (channel) => {
        const validChannels = [
            'global-shortcut',
            'menu-action',
            'window-maximized',
            'window-unmaximized',
            'window-minimized',
            'window-restored',
            'check-unsaved-changes',
            'save-changes',
            'app-shutting-down'
        ];
        
        if (validChannels.includes(channel)) {
            ipcRenderer.removeAllListeners(channel);
        }
    },
    
    // Send messages to main process
    send: (channel, data) => {
        // Whitelist channels
        const validChannels = [
            'unsaved-changes-response',
            'save-changes-complete',
            'error-occurred',
            'log-message'
        ];
        
        if (validChannels.includes(channel)) {
            ipcRenderer.send(channel, data);
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
    
    // File path utilities
    joinPath: (...paths) => require('path').join(...paths),
    resolvePath: (path) => require('path').resolve(path),
    getFileName: (path) => require('path').basename(path),
    getDirectory: (path) => require('path').dirname(path),
    
    // File system utilities
    exists: (path) => require('fs').existsSync(path),
    isDirectory: (path) => require('fs').statSync(path).isDirectory(),
    isFile: (path) => require('fs').statSync(path).isFile(),
    
    // Process utilities
    getProcessMemory: () => process.memoryUsage(),
    getProcessCPU: () => process.cpuUsage(),
    
    // Clipboard operations
    readText: () => require('electron').clipboard.readText(),
    writeText: (text) => require('electron').clipboard.writeText(text),
    
    // Shell operations
    openExternal: (url) => require('electron').shell.openExternal(url),
    showItemInFolder: (path) => require('electron').shell.showItemInFolder(path),
    
    // Native dialog
    showErrorBox: (title, content) => require('electron').dialog.showErrorBox(title, content),
    showInfoBox: (title, content) => require('electron').dialog.showMessageBox({
        type: 'info',
        title: title,
        message: content
    }),
    
    // Notification
    showNotification: (title, body) => {
        if (process.platform === 'darwin') {
            require('electron').Notification.show({
                title: title,
                body: body
            });
        } else {
            new Notification(title, { body: body });
        }
    }
});

// Expose configuration
contextBridge.exposeInMainWorld('appConfig', {
    name: 'Lost Ark Raid Manager',
    version: require('../config/app.config.js').app.version,
    description: require('../config/app.config.js').app.description,
    features: require('../config/app.config.js').features
});

// Handle window events
window.addEventListener('DOMContentLoaded', () => {
    // Notify main process that renderer is ready
    ipcRenderer.send('renderer-ready');
    
    // Set up global error handling
    window.addEventListener('error', (event) => {
        console.error('Global error:', event.error);
        ipcRenderer.send('error-occurred', {
            type: 'renderer-error',
            error: event.error.message,
            stack: event.error.stack
        });
    });
    
    window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled promise rejection:', event.reason);
        ipcRenderer.send('error-occurred', {
            type: 'unhandled-rejection',
            reason: event.reason
        });
    });
});

// Expose safe console methods
contextBridge.exposeInMainWorld('safeConsole', {
    log: (...args) => {
        console.log(...args);
        ipcRenderer.send('log-message', { level: 'log', args });
    },
    info: (...args) => {
        console.info(...args);
        ipcRenderer.send('log-message', { level: 'info', args });
    },
    warn: (...args) => {
        console.warn(...args);
        ipcRenderer.send('log-message', { level: 'warn', args });
    },
    error: (...args) => {
        console.error(...args);
        ipcRenderer.send('log-message', { level: 'error', args });
    }
});

// Expose performance monitoring
contextBridge.exposeInMainWorld('performanceMonitor', {
    mark: (name) => performance.mark(name),
    measure: (name, startMark, endMark) => performance.measure(name, startMark, endMark),
    getEntries: () => performance.getEntries(),
    getEntriesByName: (name) => performance.getEntriesByName(name),
    getEntriesByType: (type) => performance.getEntriesByType(type),
    clearMarks: () => performance.clearMarks(),
    clearMeasures: () => performance.clearMeasures(),
    now: () => performance.now()
});

// Expose storage utilities
contextBridge.exposeInMainWorld('storage', {
    // Local storage
    localStorage: {
        getItem: (key) => localStorage.getItem(key),
        setItem: (key, value) => localStorage.setItem(key, value),
        removeItem: (key) => localStorage.removeItem(key),
        clear: () => localStorage.clear(),
        key: (index) => localStorage.key(index),
        get length() { return localStorage.length; }
    },
    
    // Session storage
    sessionStorage: {
        getItem: (key) => sessionStorage.getItem(key),
        setItem: (key, value) => sessionStorage.setItem(key, value),
        removeItem: (key) => sessionStorage.removeItem(key),
        clear: () => sessionStorage.clear(),
        key: (index) => sessionStorage.key(index),
        get length() { return sessionStorage.length; }
    },
    
    // File-based storage
    fileStorage: {
        read: (filePath) => ipcRenderer.invoke('read-file', filePath),
        write: (filePath, content) => ipcRenderer.invoke('write-file', filePath, content),
        exists: (filePath) => ipcRenderer.invoke('file-exists', filePath),
        delete: (filePath) => ipcRenderer.invoke('delete-file', filePath)
    }
});

// Expose crypto utilities (if needed)
contextBridge.exposeInMainWorld('crypto', {
    randomUUID: () => crypto.randomUUID(),
    getRandomValues: (array) => crypto.getRandomValues(array),
    subtle: crypto.subtle
});

// Expose date utilities
contextBridge.exposeInMainWorld('dateUtils', {
    now: () => new Date(),
    format: (date, format) => {
        // Simple date formatting
        const d = new Date(date);
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
    },
    parse: (dateString) => new Date(dateString),
    isValid: (date) => !isNaN(new Date(date).getTime())
});

// Expose validation utilities
contextBridge.exposeInMainWorld('validation', {
    isEmail: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    isUrl: (url) => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    },
    isNumber: (value) => !isNaN(value) && !isNaN(parseFloat(value)),
    isInteger: (value) => Number.isInteger(Number(value)),
    isPositive: (value) => Number(value) > 0,
    isInRange: (value, min, max) => Number(value) >= min && Number(value) <= max,
    hasLength: (value, min, max) => {
        const length = String(value).length;
        return length >= min && (max === undefined || length <= max);
    }
});

// Expose math utilities
contextBridge.exposeInMainWorld('mathUtils', {
    round: (value, decimals = 0) => {
        const factor = Math.pow(10, decimals);
        return Math.round(value * factor) / factor;
    },
    clamp: (value, min, max) => Math.min(Math.max(value, min), max),
    lerp: (start, end, factor) => start + (end - start) * factor,
    map: (value, inMin, inMax, outMin, outMax) => {
        return outMin + (outMax - outMin) * ((value - inMin) / (inMax - inMin));
    },
    random: (min, max) => Math.random() * (max - min) + min,
    randomInt: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
});

// Expose string utilities
contextBridge.exposeInMainWorld('stringUtils', {
    capitalize: (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase(),
    truncate: (str, length, suffix = '...') => {
        return str.length > length ? str.substring(0, length) + suffix : str;
    },
    slugify: (str) => {
        return str.toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    },
    escapeHtml: (str) => {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },
    unescapeHtml: (str) => {
        const div = document.createElement('div');
        div.innerHTML = str;
        return div.textContent;
    }
});

// Expose array utilities
contextBridge.exposeInMainWorld('arrayUtils', {
    chunk: (array, size) => {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    },
    shuffle: (array) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    },
    unique: (array) => [...new Set(array)],
    groupBy: (array, key) => {
        return array.reduce((groups, item) => {
            const group = item[key];
            groups[group] = groups[group] || [];
            groups[group].push(item);
            return groups;
        }, {});
    },
    sortBy: (array, key, order = 'asc') => {
        return [...array].sort((a, b) => {
            let aVal = a[key];
            let bVal = b[key];
            
            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }
            
            if (aVal < bVal) return order === 'asc' ? -1 : 1;
            if (aVal > bVal) return order === 'asc' ? 1 : -1;
            return 0;
        });
    }
});

// Expose object utilities
contextBridge.exposeInMainWorld('objectUtils', {
    deepClone: (obj) => {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        
        const cloned = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                cloned[key] = this.deepClone(obj[key]);
            }
        }
        return cloned;
    },
    merge: (target, ...sources) => {
        return sources.reduce((result, source) => {
            for (const key in source) {
                if (source.hasOwnProperty(key)) {
                    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                        result[key] = this.merge(result[key] || {}, source[key]);
                    } else {
                        result[key] = source[key];
                    }
                }
            }
            return result;
        }, target);
    },
    pick: (obj, keys) => {
        const picked = {};
        keys.forEach(key => {
            if (obj.hasOwnProperty(key)) {
                picked[key] = obj[key];
            }
        });
        return picked;
    },
    omit: (obj, keys) => {
        const omitted = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key) && !keys.includes(key)) {
                omitted[key] = obj[key];
            }
        }
        return omitted;
    }
});

console.log('Preload script loaded successfully');