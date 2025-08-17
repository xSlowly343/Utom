/**
 * Application Configuration
 * Centralized configuration for the Lost Ark Raid Manager
 */

const AppConfig = {
    // Application metadata
    app: {
        name: 'Lost Ark Raid Manager',
        version: '1.0.0',
        description: 'Comprehensive raid management tool for Lost Ark',
        author: 'Lost Ark Raid Manager Team',
        homepage: 'https://github.com/lost-ark-raid-manager'
    },

    // Electron configuration
    electron: {
        window: {
            width: 1400,
            height: 900,
            minWidth: 1000,
            minHeight: 700,
            show: false,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                enableRemoteModule: true
            }
        },
        devTools: process.env.NODE_ENV === 'development'
    },

    // Database configuration
    database: {
        type: 'sqlite', // 'sqlite' or 'localStorage'
        path: 'database/lost-ark-raid-manager.db',
        backup: {
            enabled: true,
            interval: 24 * 60 * 60 * 1000, // 24 hours
            maxBackups: 7,
            path: 'database/backups/'
        }
    },

    // OCR configuration
    ocr: {
        engine: 'tesseract',
        languages: ['eng', 'rus', 'kor', 'jpn', 'chi_sim'],
        defaultLanguage: 'eng',
        confidence: {
            min: 0.6,
            recommended: 0.8
        },
        imageProcessing: {
            enhanceContrast: true,
            removeNoise: true,
            sharpen: false
        }
    },

    // AI Assistant configuration
    ai: {
        enabled: true,
        provider: 'local', // 'local', 'openai', 'azure', etc.
        model: 'gpt-3.5-turbo',
        maxTokens: 1000,
        temperature: 0.7,
        contextWindow: 10
    },

    // Notifications configuration
    notifications: {
        desktop: true,
        sound: true,
        duration: 5000,
        position: 'top-right',
        maxVisible: 5,
        types: {
            raid: { priority: 'high', sound: 'raid-notification.wav' },
            character: { priority: 'medium', sound: 'character-notification.wav' },
            system: { priority: 'low', sound: 'system-notification.wav' }
        }
    },

    // Game configuration
    game: {
        servers: {
            'NA West': 'NA-West',
            'NA East': 'NA-East',
            'EU Central': 'EU-Central',
            'EU West': 'EU-West',
            'SA': 'SA',
            'KR': 'KR',
            'RU': 'RU'
        },
        raids: {
            'Vykas': {
                difficulties: ['Normal', 'Hard'],
                minItemLevels: { 'Normal': 1430, 'Hard': 1490 },
                maxParticipants: 8,
                estimatedDuration: 120
            },
            'Kakul-Saydon': {
                difficulties: ['Normal', 'Hard'],
                minItemLevels: { 'Normal': 1385, 'Hard': 1475 },
                maxParticipants: 4,
                estimatedDuration: 90
            },
            'Valtan': {
                difficulties: ['Normal', 'Hard'],
                minItemLevels: { 'Normal': 1415, 'Hard': 1445 },
                maxParticipants: 8,
                estimatedDuration: 60
            },
            'Brelshaza': {
                difficulties: ['Normal', 'Hard'],
                minItemLevels: { 'Normal': 1490, 'Hard': 1540 },
                maxParticipants: 8,
                estimatedDuration: 180
            }
        },
        classes: {
            'Warrior': ['Berserker', 'Destroyer', 'Gunlancer', 'Paladin', 'Slayer'],
            'Mage': ['Arcanist', 'Bard', 'Sorceress', 'Summoner'],
            'Gunner': ['Artillerist', 'Deadeye', 'Gunslinger', 'Machinist', 'Sharpshooter'],
            'Assassin': ['Deathblade', 'Shadowhunter', 'Souleater'],
            'Martial Artist': ['Glaivier', 'Lance Master', 'Striker', 'Wardancer'],
            'Specialist': ['Scrapper', 'Soulfist', 'Breaker', 'Artist']
        }
    },

    // UI configuration
    ui: {
        theme: {
            default: 'auto',
            options: ['light', 'dark', 'auto'],
            colors: {
                light: {
                    primary: '#3b82f6',
                    secondary: '#64748b',
                    success: '#10b981',
                    warning: '#f59e0b',
                    error: '#ef4444',
                    background: '#ffffff',
                    surface: '#f8fafc',
                    text: '#1e293b',
                    border: '#e2e8f0'
                },
                dark: {
                    primary: '#60a5fa',
                    secondary: '#94a3b8',
                    success: '#34d399',
                    warning: '#fbbf24',
                    error: '#f87171',
                    background: '#0f172a',
                    surface: '#1e293b',
                    text: '#f1f5f9',
                    border: '#334155'
                }
            }
        },
        language: {
            default: 'en',
            supported: ['en', 'ru', 'ko', 'ja', 'zh-cn', 'zh-tw'],
            fallback: 'en'
        },
        layout: {
            sidebar: {
                width: 280,
                collapsedWidth: 80,
                collapsible: true
            },
            header: {
                height: 64,
                sticky: true
            }
        }
    },

    // Features configuration
    features: {
        raidManagement: {
            enabled: true,
            maxRaids: 100,
            recurringRaids: true,
            participantManagement: true,
            lootDistribution: false
        },
        characterManagement: {
            enabled: true,
            maxCharacters: 50,
            gearTracking: true,
            progressTracking: true,
            statistics: true
        },
        scheduling: {
            enabled: true,
            calendar: true,
            reminders: true,
            recurringEvents: true,
            timezoneSupport: true
        },
        chat: {
            enabled: true,
            channels: ['general', 'raids', 'trading', 'help'],
            maxMessages: 1000,
            fileSharing: false,
            voiceChat: false
        },
        ocr: {
            enabled: true,
            screenshotCapture: true,
            imageUpload: true,
            textRecognition: true,
            gameDataExtraction: true
        },
        aiAssistant: {
            enabled: true,
            contextAware: true,
            autoSuggestions: true,
            knowledgeBase: true
        },
        analytics: {
            enabled: true,
            raidStatistics: true,
            characterProgress: true,
            timeTracking: true,
            exportCapabilities: true
        }
    },

    // Security configuration
    security: {
        encryption: {
            enabled: false,
            algorithm: 'AES-256-GCM'
        },
        authentication: {
            enabled: false,
            method: 'local', // 'local', 'oauth', 'sso'
            sessionTimeout: 24 * 60 * 60 * 1000 // 24 hours
        },
        dataProtection: {
            backupEncryption: false,
            exportEncryption: false,
            clipboardProtection: false
        }
    },

    // Performance configuration
    performance: {
        cache: {
            enabled: true,
            maxSize: 100 * 1024 * 1024, // 100 MB
            ttl: 60 * 60 * 1000 // 1 hour
        },
        optimization: {
            imageCompression: true,
            lazyLoading: true,
            debounceDelay: 300,
            throttleDelay: 100
        },
        monitoring: {
            enabled: true,
            metrics: ['memory', 'cpu', 'responseTime'],
            alertThreshold: 0.8
        }
    },

    // Integration configuration
    integrations: {
        discord: {
            enabled: false,
            webhookUrl: '',
            botToken: '',
            serverId: '',
            channels: []
        },
        telegram: {
            enabled: false,
            botToken: '',
            chatId: '',
            notifications: true
        },
        website: {
            enabled: false,
            apiUrl: '',
            syncEnabled: false,
            autoSync: false
        },
        gameClient: {
            enabled: false,
            autoDetect: true,
            processName: 'LostArk.exe',
            memoryReading: false
        }
    },

    // Development configuration
    development: {
        debug: process.env.NODE_ENV === 'development',
        logging: {
            level: 'info', // 'error', 'warn', 'info', 'debug'
            file: 'logs/app.log',
            maxSize: 10 * 1024 * 1024, // 10 MB
            maxFiles: 5
        },
        hotReload: process.env.NODE_ENV === 'development',
        devTools: process.env.NODE_ENV === 'development'
    },

    // Update configuration
    updates: {
        autoCheck: true,
        checkInterval: 24 * 60 * 60 * 1000, // 24 hours
        autoDownload: false,
        channel: 'stable', // 'stable', 'beta', 'alpha'
        repository: 'https://api.github.com/repos/lost-ark-raid-manager/releases'
    },

    // Backup and recovery
    backup: {
        autoBackup: true,
        backupInterval: 24 * 60 * 60 * 1000, // 24 hours
        maxBackups: 7,
        compression: true,
        encryption: false,
        cloudSync: false
    },

    // Error handling
    errorHandling: {
        reportErrors: false,
        errorReportingUrl: '',
        maxErrorLogs: 100,
        showUserFriendlyErrors: true
    }
};

// Environment-specific overrides
if (process.env.NODE_ENV === 'development') {
    AppConfig.development.debug = true;
    AppConfig.development.logging.level = 'debug';
    AppConfig.electron.devTools = true;
}

if (process.env.NODE_ENV === 'production') {
    AppConfig.development.debug = false;
    AppConfig.development.logging.level = 'warn';
    AppConfig.electron.devTools = false;
}

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AppConfig;
} else if (typeof window !== 'undefined') {
    window.AppConfig = AppConfig;
}