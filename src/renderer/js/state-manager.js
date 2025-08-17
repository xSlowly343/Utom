/**
 * State Manager Module - Manages application state and data persistence
 */
class StateManager {
    constructor() {
        this.state = {
            app: {
                currentPage: 'dashboard',
                theme: 'auto',
                language: 'en',
                sidebarCollapsed: false,
                loading: false,
                error: null
            },
            user: {
                id: null,
                name: 'Guest',
                preferences: {},
                lastLogin: null
            },
            raids: {
                items: [],
                filters: {},
                sortBy: 'date',
                sortOrder: 'desc',
                selectedRaid: null,
                loading: false,
                error: null
            },
            characters: {
                items: [],
                filters: {},
                sortBy: 'itemLevel',
                sortOrder: 'desc',
                selectedCharacter: null,
                loading: false,
                error: null
            },
            schedule: {
                items: [],
                viewMode: 'month',
                selectedDate: new Date(),
                filters: {},
                loading: false,
                error: null
            },
            chat: {
                currentChannel: 'general',
                messages: {},
                onlineUsers: [],
                typing: {},
                loading: false,
                error: null
            },
            notifications: {
                items: [],
                unreadCount: 0,
                settings: {},
                loading: false,
                error: null
            },
            settings: {
                general: {},
                notifications: {},
                appearance: {},
                integrations: {},
                advanced: {}
            }
        };

        this.subscribers = new Map();
        this.persistentKeys = new Set([
            'app.theme',
            'app.language',
            'app.sidebarCollapsed',
            'user.preferences',
            'raids.filters',
            'raids.sortBy',
            'raids.sortOrder',
            'characters.filters',
            'characters.sortBy',
            'characters.sortOrder',
            'schedule.viewMode',
            'schedule.filters',
            'chat.currentChannel',
            'notifications.settings',
            'settings'
        ]);

        this.init();
    }

    init() {
        this.loadPersistentState();
        this.setupAutoSave();
        this.setupStateValidation();
    }

    // State management methods
    getState(path = null) {
        if (!path) return this.deepClone(this.state);
        
        return this.getNestedValue(this.state, path);
    }

    setState(path, value) {
        const oldValue = this.getNestedValue(this.state, path);
        
        if (this.isEqual(oldValue, value)) {
            return false; // No change
        }

        this.setNestedValue(this.state, path, value);
        
        // Check if this path should be persisted
        if (this.shouldPersist(path)) {
            this.savePersistentState(path, value);
        }

        // Notify subscribers
        this.notifySubscribers(path, value, oldValue);
        
        return true; // State changed
    }

    updateState(path, updates) {
        const currentValue = this.getNestedValue(this.state, path);
        
        if (typeof currentValue === 'object' && currentValue !== null) {
            const newValue = { ...currentValue, ...updates };
            return this.setState(path, newValue);
        }
        
        return false;
    }

    // Subscription methods
    subscribe(path, callback, options = {}) {
        const subscription = {
            id: this.generateId(),
            path: path,
            callback: callback,
            options: {
                immediate: options.immediate || false,
                once: options.once || false
            }
        };

        if (!this.subscribers.has(path)) {
            this.subscribers.set(path, new Set());
        }
        
        this.subscribers.get(path).add(subscription);

        // Call immediately if requested
        if (subscription.options.immediate) {
            const currentValue = this.getNestedValue(this.state, path);
            callback(currentValue, currentValue, path);
        }

        return subscription.id;
    }

    unsubscribe(subscriptionId) {
        for (const [path, subscriptions] of this.subscribers) {
            for (const subscription of subscriptions) {
                if (subscription.id === subscriptionId) {
                    subscriptions.delete(subscription);
                    
                    // Remove empty path entries
                    if (subscriptions.size === 0) {
                        this.subscribers.delete(path);
                    }
                    
                    return true;
                }
            }
        }
        return false;
    }

    // Data management methods
    addItem(collectionPath, item, options = {}) {
        const collection = this.getNestedValue(this.state, collectionPath);
        
        if (!Array.isArray(collection)) {
            throw new Error(`Path ${collectionPath} does not contain an array`);
        }

        const newItem = {
            id: options.id || this.generateId(),
            ...item,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const newCollection = [...collection, newItem];
        this.setState(collectionPath, newCollection);

        return newItem;
    }

    updateItem(collectionPath, itemId, updates) {
        const collection = this.getNestedValue(this.state, collectionPath);
        
        if (!Array.isArray(collection)) {
            throw new Error(`Path ${collectionPath} does not contain an array`);
        }

        const itemIndex = collection.findIndex(item => item.id === itemId);
        
        if (itemIndex === -1) {
            throw new Error(`Item with id ${itemId} not found in ${collectionPath}`);
        }

        const updatedItem = {
            ...collection[itemIndex],
            ...updates,
            updatedAt: new Date().toISOString()
        };

        const newCollection = [...collection];
        newCollection[itemIndex] = updatedItem;
        
        this.setState(collectionPath, newCollection);

        return updatedItem;
    }

    removeItem(collectionPath, itemId) {
        const collection = this.getNestedValue(this.state, collectionPath);
        
        if (!Array.isArray(collection)) {
            throw new Error(`Path ${collectionPath} does not contain an array`);
        }

        const newCollection = collection.filter(item => item.id !== itemId);
        this.setState(collectionPath, newCollection);

        return true;
    }

    findItem(collectionPath, predicate) {
        const collection = this.getNestedValue(this.state, collectionPath);
        
        if (!Array.isArray(collection)) {
            return null;
        }

        return collection.find(predicate) || null;
    }

    filterItems(collectionPath, predicate) {
        const collection = this.getNestedValue(this.state, collectionPath);
        
        if (!Array.isArray(collection)) {
            return [];
        }

        return collection.filter(predicate);
    }

    // Collection operations
    sortCollection(collectionPath, sortBy, sortOrder = 'asc') {
        const collection = this.getNestedValue(this.state, collectionPath);
        
        if (!Array.isArray(collection)) {
            return;
        }

        const sortedCollection = [...collection].sort((a, b) => {
            let aValue = this.getNestedValue(a, sortBy);
            let bValue = this.getNestedValue(b, sortBy);

            // Handle different data types
            if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }

            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        this.setState(collectionPath, sortedCollection);
    }

    filterCollection(collectionPath, filters) {
        const collection = this.getNestedValue(this.state, collectionPath);
        
        if (!Array.isArray(collection)) {
            return;
        }

        let filteredCollection = collection;

        // Apply filters
        Object.entries(filters).forEach(([key, filterValue]) => {
            if (filterValue !== null && filterValue !== undefined && filterValue !== '') {
                filteredCollection = filteredCollection.filter(item => {
                    const itemValue = this.getNestedValue(item, key);
                    
                    if (typeof filterValue === 'string') {
                        return itemValue.toLowerCase().includes(filterValue.toLowerCase());
                    } else if (typeof filterValue === 'number') {
                        return itemValue === filterValue;
                    } else if (Array.isArray(filterValue)) {
                        return filterValue.includes(itemValue);
                    } else if (typeof filterValue === 'function') {
                        return filterValue(itemValue, item);
                    }
                    
                    return itemValue === filterValue;
                });
            }
        });

        // Update filtered state
        const filterPath = collectionPath.replace('.items', '.filtered');
        this.setState(filterPath, filteredCollection);
    }

    // State persistence
    loadPersistentState() {
        try {
            const stored = localStorage.getItem('appState');
            if (stored) {
                const parsedState = JSON.parse(stored);
                this.mergePersistentState(parsedState);
            }
        } catch (error) {
            console.error('Failed to load persistent state:', error);
        }
    }

    savePersistentState(path, value) {
        try {
            const stored = localStorage.getItem('appState') || '{}';
            const currentState = JSON.parse(stored);
            
            this.setNestedValue(currentState, path, value);
            
            localStorage.setItem('appState', JSON.stringify(currentState));
        } catch (error) {
            console.error('Failed to save persistent state:', error);
        }
    }

    mergePersistentState(persistentState) {
        Object.entries(persistentState).forEach(([path, value]) => {
            if (this.shouldPersist(path)) {
                this.setNestedValue(this.state, path, value);
            }
        });
    }

    shouldPersist(path) {
        return this.persistentKeys.has(path);
    }

    // Auto-save functionality
    setupAutoSave() {
        // Auto-save every 30 seconds
        setInterval(() => {
            this.saveAllPersistentState();
        }, 30000);

        // Save on page unload
        window.addEventListener('beforeunload', () => {
            this.saveAllPersistentState();
        });
    }

    saveAllPersistentState() {
        const persistentState = {};
        
        this.persistentKeys.forEach(path => {
            const value = this.getNestedValue(this.state, path);
            if (value !== undefined) {
                this.setNestedValue(persistentState, path, value);
            }
        });

        try {
            localStorage.setItem('appState', JSON.stringify(persistentState));
        } catch (error) {
            console.error('Failed to save all persistent state:', error);
        }
    }

    // State validation
    setupStateValidation() {
        // Validate state structure on initialization
        this.validateState(this.state);
    }

    validateState(state, path = '') {
        if (typeof state !== 'object' || state === null) {
            return;
        }

        Object.entries(state).forEach(([key, value]) => {
            const currentPath = path ? `${path}.${key}` : key;
            
            // Check for circular references
            if (typeof value === 'object' && value !== null) {
                if (this.hasCircularReference(value)) {
                    console.warn(`Circular reference detected at ${currentPath}`);
                    return;
                }
                
                this.validateState(value, currentPath);
            }
        });
    }

    hasCircularReference(obj, visited = new WeakSet()) {
        if (obj === null || typeof obj !== 'object') {
            return false;
        }

        if (visited.has(obj)) {
            return true;
        }

        visited.add(obj);

        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (this.hasCircularReference(obj[key], visited)) {
                    return true;
                }
            }
        }

        return false;
    }

    // Utility methods
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : undefined;
        }, obj);
    }

    setNestedValue(obj, path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((current, key) => {
            if (!current[key] || typeof current[key] !== 'object') {
                current[key] = {};
            }
            return current[key];
        }, obj);
        
        target[lastKey] = value;
    }

    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }

        if (obj instanceof Date) {
            return new Date(obj.getTime());
        }

        if (obj instanceof Array) {
            return obj.map(item => this.deepClone(item));
        }

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

    isEqual(a, b) {
        if (a === b) return true;
        if (a == null || b == null) return false;
        if (typeof a !== typeof b) return false;

        if (typeof a === 'object') {
            if (a instanceof Date && b instanceof Date) {
                return a.getTime() === b.getTime();
            }

            if (Array.isArray(a) && Array.isArray(b)) {
                if (a.length !== b.length) return false;
                for (let i = 0; i < a.length; i++) {
                    if (!this.isEqual(a[i], b[i])) return false;
                }
                return true;
            }

            const keysA = Object.keys(a);
            const keysB = Object.keys(b);
            if (keysA.length !== keysB.length) return false;

            for (const key of keysA) {
                if (!keysB.includes(key)) return false;
                if (!this.isEqual(a[key], b[key])) return false;
            }
            return true;
        }

        return false;
    }

    generateId() {
        return 'state_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Notification methods
    notifySubscribers(path, newValue, oldValue) {
        const subscriptions = this.subscribers.get(path);
        if (!subscriptions) return;

        subscriptions.forEach(subscription => {
            try {
                subscription.callback(newValue, oldValue, path);
                
                // Remove one-time subscriptions
                if (subscription.options.once) {
                    subscriptions.delete(subscription);
                }
            } catch (error) {
                console.error('Error in state subscription callback:', error);
            }
        });

        // Remove empty path entries
        if (subscriptions.size === 0) {
            this.subscribers.delete(path);
        }
    }

    // State debugging
    getStateSnapshot() {
        return {
            timestamp: new Date().toISOString(),
            state: this.deepClone(this.state),
            subscribers: Array.from(this.subscribers.entries()).map(([path, subscriptions]) => ({
                path,
                count: subscriptions.size
            })),
            persistentKeys: Array.from(this.persistentKeys)
        };
    }

    // Reset methods
    resetState(path = null) {
        if (!path) {
            this.state = this.getInitialState();
        } else {
            const initialValue = this.getNestedValue(this.getInitialState(), path);
            this.setNestedValue(this.state, path, initialValue);
        }
    }

    getInitialState() {
        // Return a fresh copy of the initial state
        return this.deepClone({
            app: {
                currentPage: 'dashboard',
                theme: 'auto',
                language: 'en',
                sidebarCollapsed: false,
                loading: false,
                error: null
            },
            user: {
                id: null,
                name: 'Guest',
                preferences: {},
                lastLogin: null
            },
            raids: {
                items: [],
                filters: {},
                sortBy: 'date',
                sortOrder: 'desc',
                selectedRaid: null,
                loading: false,
                error: null
            },
            characters: {
                items: [],
                filters: {},
                sortBy: 'itemLevel',
                sortOrder: 'desc',
                selectedCharacter: null,
                loading: false,
                error: null
            },
            schedule: {
                items: [],
                viewMode: 'month',
                selectedDate: new Date(),
                filters: {},
                loading: false,
                error: null
            },
            chat: {
                currentChannel: 'general',
                messages: {},
                onlineUsers: [],
                typing: {},
                loading: false,
                error: null
            },
            notifications: {
                items: [],
                unreadCount: 0,
                settings: {},
                loading: false,
                error: null
            },
            settings: {
                general: {},
                notifications: {},
                appearance: {},
                integrations: {},
                advanced: {}
            }
        });
    }

    // Public methods
    getAppState() {
        return this.state.app;
    }

    getUserState() {
        return this.state.user;
    }

    getRaidsState() {
        return this.state.raids;
    }

    getCharactersState() {
        return this.state.characters;
    }

    getScheduleState() {
        return this.state.schedule;
    }

    getChatState() {
        return this.state.chat;
    }

    getNotificationsState() {
        return this.state.notifications;
    }

    getSettingsState() {
        return this.state.settings;
    }

    // Convenience methods for common operations
    setLoading(path, loading) {
        this.setState(`${path}.loading`, loading);
    }

    setError(path, error) {
        this.setState(`${path}.error`, error);
    }

    clearError(path) {
        this.setState(`${path}.error`, null);
    }

    setSelectedItem(collectionPath, itemId) {
        const selectedPath = collectionPath.replace('.items', '.selected');
        this.setState(selectedPath, itemId);
    }

    getSelectedItem(collectionPath) {
        const selectedId = this.getNestedValue(this.state, collectionPath.replace('.items', '.selected'));
        if (!selectedId) return null;
        
        const collection = this.getNestedValue(this.state, collectionPath);
        return collection.find(item => item.id === selectedId) || null;
    }
}

// Initialize the state manager
const stateManager = new StateManager();

// Make it globally available
window.stateManager = stateManager;