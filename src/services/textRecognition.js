/**
 * Text Recognition Service - Handles OCR and text recognition from screenshots
 */
const TextRecognitionService = {
    worker: null,
    isInitialized: false,
    supportedLanguages: ['eng', 'rus', 'kor'],
    currentLanguage: 'eng',

    /**
     * Initialize the text recognition service
     */
    async init() {
        try {
            if (typeof Tesseract === 'undefined') {
                console.warn('Tesseract.js not available, using fallback text recognition');
                this.isInitialized = true;
                return true;
            }

            // Initialize Tesseract worker
            this.worker = await Tesseract.createWorker({
                logger: m => console.log('Tesseract:', m)
            });

            // Load language data
            await this.worker.loadLanguage(this.currentLanguage);
            await this.worker.initialize(this.currentLanguage);

            this.isInitialized = true;
            console.log('Text recognition service initialized');
            return true;
        } catch (error) {
            console.error('Failed to initialize text recognition service:', error);
            // Fallback to basic text recognition
            this.isInitialized = true;
            return true;
        }
    },

    /**
     * Recognize text from image
     */
    async recognizeText(imageData, options = {}) {
        try {
            if (!this.isInitialized) {
                await this.init();
            }

            const defaultOptions = {
                language: this.currentLanguage,
                confidence: 0.6,
                preprocess: true,
                ...options
            };

            if (this.worker && typeof Tesseract !== 'undefined') {
                return await this.recognizeWithTesseract(imageData, defaultOptions);
            } else {
                return await this.recognizeWithFallback(imageData, defaultOptions);
            }
        } catch (error) {
            console.error('Text recognition failed:', error);
            return {
                text: '',
                confidence: 0,
                error: error.message
            };
        }
    },

    /**
     * Recognize text using Tesseract.js
     */
    async recognizeWithTesseract(imageData, options) {
        try {
            // Set language if different from current
            if (options.language !== this.currentLanguage) {
                await this.worker.loadLanguage(options.language);
                await this.worker.initialize(options.language);
                this.currentLanguage = options.language;
            }

            // Apply preprocessing if requested
            let processedImage = imageData;
            if (options.preprocess) {
                processedImage = await this.preprocessImage(imageData);
            }

            // Recognize text
            const result = await this.worker.recognize(processedImage);
            
            return {
                text: result.data.text,
                confidence: result.data.confidence / 100,
                words: result.data.words,
                lines: result.data.lines,
                blocks: result.data.blocks,
                language: options.language,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Tesseract recognition failed:', error);
            throw error;
        }
    },

    /**
     * Fallback text recognition using basic image analysis
     */
    async recognizeWithFallback(imageData, options) {
        try {
            // This is a placeholder for basic text recognition
            // In a real implementation, you might use other libraries or APIs
            
            const mockResult = {
                text: 'Sample recognized text from image',
                confidence: 0.5,
                words: ['Sample', 'recognized', 'text', 'from', 'image'],
                lines: ['Sample recognized text from image'],
                blocks: [],
                language: options.language,
                timestamp: new Date().toISOString(),
                isFallback: true
            };

            return mockResult;
        } catch (error) {
            console.error('Fallback recognition failed:', error);
            throw error;
        }
    },

    /**
     * Preprocess image for better OCR results
     */
    async preprocessImage(imageData) {
        try {
            // Create canvas for image processing
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Load image
            const img = new Image();
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                img.src = imageData;
            });

            canvas.width = img.width;
            canvas.height = img.height;

            // Draw original image
            ctx.drawImage(img, 0, 0);

            // Apply preprocessing filters
            const imageData2D = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const processedData = this.applyImageFilters(imageData2D);
            
            ctx.putImageData(processedData, 0, 0);

            return canvas.toDataURL('image/png');
        } catch (error) {
            console.error('Image preprocessing failed:', error);
            return imageData; // Return original if preprocessing fails
        }
    },

    /**
     * Apply various image filters for better OCR
     */
    applyImageFilters(imageData) {
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;

        // Convert to grayscale
        for (let i = 0; i < data.length; i += 4) {
            const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
            data[i] = gray;     // Red
            data[i + 1] = gray; // Green
            data[i + 2] = gray; // Blue
            // Alpha channel remains unchanged
        }

        // Apply contrast enhancement
        const contrast = 1.5;
        const brightness = 0;
        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, Math.max(0, (data[i] - 128) * contrast + 128 + brightness));
            data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * contrast + 128 + brightness));
            data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * contrast + 128 + brightness));
        }

        // Apply simple noise reduction (3x3 median filter)
        const filteredData = new Uint8ClampedArray(data);
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const idx = (y * width + x) * 4;
                const neighbors = [];
                
                // Collect 3x3 neighborhood
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        const nIdx = ((y + dy) * width + (x + dx)) * 4;
                        neighbors.push(data[nIdx]);
                    }
                }
                
                // Sort and take median
                neighbors.sort((a, b) => a - b);
                const median = neighbors[4]; // Middle value of 9 elements
                
                filteredData[idx] = median;
                filteredData[idx + 1] = median;
                filteredData[idx + 2] = median;
            }
        }

        return new ImageData(filteredData, width, height);
    },

    /**
     * Recognize specific game elements
     */
    async recognizeGameElements(imageData) {
        try {
            const result = await this.recognizeText(imageData, {
                language: this.currentLanguage,
                confidence: 0.7
            });

            // Parse recognized text for game-specific elements
            const elements = {
                characterName: this.extractCharacterName(result.text),
                itemLevel: this.extractItemLevel(result.text),
                class: this.extractClass(result.text),
                server: this.extractServer(result.text),
                guild: this.extractGuild(result.text),
                engravings: this.extractEngravings(result.text),
                stats: this.extractStats(result.text),
                gold: this.extractGold(result.text),
                materials: this.extractMaterials(result.text)
            };

            return {
                ...result,
                gameElements: elements,
                hasGameData: Object.values(elements).some(el => el !== null)
            };
        } catch (error) {
            console.error('Game element recognition failed:', error);
            return {
                text: '',
                confidence: 0,
                gameElements: {},
                hasGameData: false,
                error: error.message
            };
        }
    },

    /**
     * Extract character name from recognized text
     */
    extractCharacterName(text) {
        // Look for patterns that might indicate character names
        const patterns = [
            /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g,
            /([А-Я][а-я]+(?:\s+[А-Я][а-я]+)*)/g,
            /([가-힣]+)/g
        ];

        for (const pattern of patterns) {
            const matches = text.match(pattern);
            if (matches && matches.length > 0) {
                // Filter out common words that aren't names
                const filtered = matches.filter(match => 
                    match.length > 2 && 
                    !this.isCommonWord(match) &&
                    !this.isNumber(match)
                );
                if (filtered.length > 0) {
                    return filtered[0];
                }
            }
        }

        return null;
    },

    /**
     * Extract item level from recognized text
     */
    extractItemLevel(text) {
        const patterns = [
            /Item Level[:\s]*(\d+(?:\.\d+)?)/i,
            /IL[:\s]*(\d+(?:\.\d+)?)/i,
            /(\d{3,4}(?:\.\d+)?)/g
        ];

        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) {
                const value = parseFloat(match[1] || match[0]);
                if (value >= 100 && value <= 2000) {
                    return value;
                }
            }
        }

        return null;
    },

    /**
     * Extract character class from recognized text
     */
    extractClass(text) {
        const classes = [
            'Berserker', 'Destroyer', 'Gunlancer', 'Paladin',
            'Arcanist', 'Bard', 'Sorceress', 'Summoner',
            'Deathblade', 'Shadowhunter', 'Souleater',
            'Artillerist', 'Deadeye', 'Gunslinger', 'Machinist',
            'Scouter', 'Sharpshooter'
        ];

        const lowerText = text.toLowerCase();
        for (const className of classes) {
            if (lowerText.includes(className.toLowerCase())) {
                return className;
            }
        }

        return null;
    },

    /**
     * Extract server name from recognized text
     */
    extractServer(text) {
        // This would need to be customized based on actual server names
        const serverPatterns = [
            /Server[:\s]*([A-Za-z0-9\s\-]+)/i,
            /([A-Za-z0-9\s\-]+)\s*Server/i
        ];

        for (const pattern of serverPatterns) {
            const match = text.match(pattern);
            if (match) {
                return match[1].trim();
            }
        }

        return null;
    },

    /**
     * Extract guild information from recognized text
     */
    extractGuild(text) {
        const guildPatterns = [
            /Guild[:\s]*([A-Za-z0-9\s\-]+)/i,
            /([A-Za-z0-9\s\-]+)\s*Guild/i
        ];

        for (const pattern of guildPatterns) {
            const match = text.match(pattern);
            if (match) {
                return match[1].trim();
            }
        }

        return null;
    },

    /**
     * Extract engravings from recognized text
     */
    extractEngravings(text) {
        const engravings = [
            'Grudge', 'Cursed Doll', 'Keen Blunt Weapon', 'Hit Master',
            'Adrenaline', 'All-Out Attack', 'Ambush Master', 'Awakening',
            'Barricade', 'Broken Bone', 'Crisis Evasion', 'Disrespect',
            'Divine Protection', 'Drops of Ether', 'Emergency Rescue',
            'Enhanced Shield', 'Ether Predator', 'Expert', 'Explosive Expert',
            'Fast Speed', 'Flame Enhancement', 'Fortitude', 'Heavy Armor',
            'Increased Mass', 'Indomitable Will', 'Insight', 'Lightning Fury',
            'Magick Stream', 'Master Brawler', 'Master of Escape', 'Max MP Increase',
            'MP Efficiency Increase', 'Necromancy', 'Precise Dagger', 'Propulsion',
            'Raid Captain', 'Shield Piercing', 'Sight Focus', 'Spirit Absorption',
            'Stabilized Status', 'Strong Will', 'Super Charge', 'Vital Point Hit'
        ];

        const found = [];
        const lowerText = text.toLowerCase();
        
        for (const engraving of engravings) {
            if (lowerText.includes(engraving.toLowerCase())) {
                found.push(engraving);
            }
        }

        return found.length > 0 ? found : null;
    },

    /**
     * Extract stats from recognized text
     */
    extractStats(text) {
        const stats = {};
        const statPatterns = [
            { name: 'strength', pattern: /Strength[:\s]*(\d+)/i },
            { name: 'dexterity', pattern: /Dexterity[:\s]*(\d+)/i },
            { name: 'intelligence', pattern: /Intelligence[:\s]*(\d+)/i },
            { name: 'vitality', pattern: /Vitality[:\s]*(\d+)/i },
            { name: 'crit', pattern: /Crit[:\s]*(\d+)/i },
            { name: 'specialization', pattern: /Specialization[:\s]*(\d+)/i },
            { name: 'domination', pattern: /Domination[:\s]*(\d+)/i },
            { name: 'swiftness', pattern: /Swiftness[:\s]*(\d+)/i },
            { name: 'endurance', pattern: /Endurance[:\s]*(\d+)/i },
            { name: 'expertise', pattern: /Expertise[:\s]*(\d+)/i }
        ];

        for (const stat of statPatterns) {
            const match = text.match(stat.pattern);
            if (match) {
                stats[stat.name] = parseInt(match[1]);
            }
        }

        return Object.keys(stats).length > 0 ? stats : null;
    },

    /**
     * Extract gold amount from recognized text
     */
    extractGold(text) {
        const goldPatterns = [
            /Gold[:\s]*([\d,]+)/i,
            /([\d,]+)\s*Gold/i,
            /G[:\s]*([\d,]+)/i
        ];

        for (const pattern of goldPatterns) {
            const match = text.match(pattern);
            if (match) {
                return parseInt(match[1].replace(/,/g, ''));
            }
        }

        return null;
    },

    /**
     * Extract materials from recognized text
     */
    extractMaterials(text) {
        const materials = [
            'Destruction Stone', 'Guardian Stone', 'Harmony Shard',
            'Life Shard', 'Honor Shard', 'Great Honor Leapstone',
            'Honor Leapstone', 'Solar Grace', 'Solar Blessing',
            'Solar Protection', 'Caldarr Fusion Material',
            'Oreha Fusion Material', 'Simple Oreha Fusion Material'
        ];

        const found = [];
        const lowerText = text.toLowerCase();
        
        for (const material of materials) {
            if (lowerText.includes(material.toLowerCase())) {
                found.push(material);
            }
        }

        return found.length > 0 ? found : null;
    },

    /**
     * Check if text is a common word
     */
    isCommonWord(text) {
        const commonWords = [
            'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
            'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through',
            'during', 'before', 'after', 'above', 'below', 'between',
            'among', 'within', 'without', 'against', 'toward', 'towards'
        ];
        
        return commonWords.includes(text.toLowerCase());
    },

    /**
     * Check if text is a number
     */
    isNumber(text) {
        return /^\d+(\.\d+)?$/.test(text);
    },

    /**
     * Change recognition language
     */
    async changeLanguage(language) {
        try {
            if (!this.worker || !this.supportedLanguages.includes(language)) {
                return false;
            }

            await this.worker.loadLanguage(language);
            await this.worker.initialize(language);
            this.currentLanguage = language;
            
            return true;
        } catch (error) {
            console.error('Failed to change language:', error);
            return false;
        }
    },

    /**
     * Get supported languages
     */
    getSupportedLanguages() {
        return this.supportedLanguages;
    },

    /**
     * Get current language
     */
    getCurrentLanguage() {
        return this.currentLanguage;
    },

    /**
     * Terminate the service
     */
    async terminate() {
        try {
            if (this.worker) {
                await this.worker.terminate();
                this.worker = null;
            }
            this.isInitialized = false;
            console.log('Text recognition service terminated');
        } catch (error) {
            console.error('Failed to terminate text recognition service:', error);
        }
    },

    /**
     * Get service status
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            hasWorker: !!this.worker,
            currentLanguage: this.currentLanguage,
            supportedLanguages: this.supportedLanguages
        };
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TextRecognitionService;
} else {
    window.TextRecognitionService = TextRecognitionService;
}