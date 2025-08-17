/**
 * OCR Module - Handles text recognition from screenshots and images
 */
class OCRModule {
    constructor() {
        this.worker = null;
        this.isInitialized = false;
        this.recognitionHistory = [];
        this.settings = {
            language: 'eng',
            confidence: 0.7,
            autoProcess: true,
            saveResults: true,
            maxHistory: 100
        };
        this.init();
    }

    async init() {
        try {
            await this.initializeTesseract();
            this.loadSettings();
            this.isInitialized = true;
            console.log('OCR module initialized successfully');
        } catch (error) {
            console.error('Failed to initialize OCR module:', error);
            this.isInitialized = false;
        }
    }

    async initializeTesseract() {
        try {
            // Initialize Tesseract.js worker
            this.worker = await Tesseract.createWorker({
                logger: m => {
                    if (m.status === 'recognizing text') {
                        this.updateProgress(m.progress);
                    }
                }
            });

            // Load language data
            await this.worker.loadLanguage(this.settings.language);
            await this.worker.initialize(this.settings.language);

            // Set worker parameters
            await this.worker.setParameters({
                tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.,:;!?()[]{}"\'-_=+<>@#$%^&*~`|\\/ ',
                tessedit_pageseg_mode: Tesseract.PSM.AUTO,
                preserve_interword_spaces: '1'
            });

        } catch (error) {
            console.error('Error initializing Tesseract:', error);
            throw error;
        }
    }

    loadSettings() {
        const stored = localStorage.getItem('ocrSettings');
        if (stored) {
            this.settings = { ...this.settings, ...JSON.parse(stored) };
        }
    }

    saveSettings() {
        localStorage.setItem('ocrSettings', JSON.stringify(this.settings));
    }

    // Main OCR methods
    async recognizeText(imageData, options = {}) {
        if (!this.isInitialized || !this.worker) {
            throw new Error('OCR module not initialized');
        }

        const startTime = Date.now();
        const recognitionOptions = { ...this.settings, ...options };

        try {
            // Preprocess image if needed
            const processedImage = await this.preprocessImage(imageData, recognitionOptions);

            // Perform OCR
            const result = await this.worker.recognize(processedImage);

            // Process results
            const processedResult = this.processOCRResult(result, recognitionOptions);

            // Save to history
            if (this.settings.saveResults) {
                this.saveToHistory(processedResult, imageData);
            }

            // Calculate processing time
            const processingTime = Date.now() - startTime;
            processedResult.processingTime = processingTime;

            return processedResult;

        } catch (error) {
            console.error('OCR recognition failed:', error);
            throw new Error(`OCR recognition failed: ${error.message}`);
        }
    }

    async recognizeFromScreenshot() {
        try {
            // Capture screenshot using Electron's desktopCapturer
            const sources = await window.electronAPI.captureScreen();
            
            if (!sources || sources.length === 0) {
                throw new Error('No screen sources available');
            }

            // Use the primary display
            const source = sources[0];
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: false,
                video: {
                    mandatory: {
                        chromeMediaSource: 'desktop',
                        chromeMediaSourceId: source.id,
                        minWidth: 1920,
                        maxWidth: 1920,
                        minHeight: 1080,
                        maxHeight: 1080
                    }
                }
            });

            // Create video element to capture frame
            const video = document.createElement('video');
            video.srcObject = stream;
            
            return new Promise((resolve, reject) => {
                video.onloadedmetadata = () => {
                    video.play();
                    
                    setTimeout(() => {
                        // Create canvas to capture frame
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        canvas.width = video.videoWidth;
                        canvas.height = video.videoHeight;
                        
                        ctx.drawImage(video, 0, 0);
                        
                        // Stop stream
                        stream.getTracks().forEach(track => track.stop());
                        
                        // Convert to blob
                        canvas.toBlob(blob => {
                            resolve(blob);
                        }, 'image/png');
                    }, 100);
                };
                
                video.onerror = reject;
            });

        } catch (error) {
            console.error('Screenshot capture failed:', error);
            throw new Error(`Screenshot capture failed: ${error.message}`);
        }
    }

    async recognizeFromFile(file) {
        try {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                throw new Error('File must be an image');
            }

            // Convert file to blob
            const blob = new Blob([file], { type: file.type });
            
            // Perform OCR
            return await this.recognizeText(blob, { source: 'file' });

        } catch (error) {
            console.error('File recognition failed:', error);
            throw new Error(`File recognition failed: ${error.message}`);
        }
    }

    async recognizeFromURL(url) {
        try {
            // Fetch image from URL
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch image: ${response.statusText}`);
            }

            const blob = await response.blob();
            
            // Perform OCR
            return await this.recognizeText(blob, { source: 'url' });

        } catch (error) {
            console.error('URL recognition failed:', error);
            throw new Error(`URL recognition failed: ${error.message}`);
        }
    }

    // Image preprocessing
    async preprocessImage(imageData, options = {}) {
        try {
            // Create canvas for image processing
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Create image element
            const img = new Image();
            
            return new Promise((resolve, reject) => {
                img.onload = () => {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    
                    // Draw original image
                    ctx.drawImage(img, 0, 0);
                    
                    // Apply preprocessing filters
                    if (options.enhanceContrast) {
                        this.enhanceContrast(ctx, canvas.width, canvas.height);
                    }
                    
                    if (options.removeNoise) {
                        this.removeNoise(ctx, canvas.width, canvas.height);
                    }
                    
                    if (options.sharpen) {
                        this.sharpen(ctx, canvas.width, canvas.height);
                    }
                    
                    // Convert to blob
                    canvas.toBlob(blob => {
                        resolve(blob);
                    }, 'image/png');
                };
                
                img.onerror = reject;
                
                // Load image from blob
                if (imageData instanceof Blob) {
                    img.src = URL.createObjectURL(imageData);
                } else {
                    img.src = imageData;
                }
            });

        } catch (error) {
            console.error('Image preprocessing failed:', error);
            // Return original image if preprocessing fails
            return imageData;
        }
    }

    enhanceContrast(ctx, width, height) {
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        
        // Find min and max values
        let min = 255, max = 0;
        for (let i = 0; i < data.length; i += 4) {
            const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
            min = Math.min(min, gray);
            max = Math.max(max, gray);
        }
        
        // Apply contrast enhancement
        const range = max - min;
        if (range > 0) {
            for (let i = 0; i < data.length; i += 4) {
                const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
                const enhanced = ((gray - min) / range) * 255;
                data[i] = data[i + 1] = data[i + 2] = enhanced;
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
    }

    removeNoise(ctx, width, height) {
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        const newData = new Uint8ClampedArray(data);
        
        // Simple median filter
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const idx = (y * width + x) * 4;
                const values = [];
                
                // Collect neighboring pixel values
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        const nIdx = ((y + dy) * width + (x + dx)) * 4;
                        values.push((data[nIdx] + data[nIdx + 1] + data[nIdx + 2]) / 3);
                    }
                }
                
                // Sort and get median
                values.sort((a, b) => a - b);
                const median = values[Math.floor(values.length / 2)];
                
                newData[idx] = newData[idx + 1] = newData[idx + 2] = median;
            }
        }
        
        ctx.putImageData(new ImageData(newData, width, height), 0, 0);
    }

    sharpen(ctx, width, height) {
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        const newData = new Uint8ClampedArray(data);
        
        // Sharpening kernel
        const kernel = [
            [0, -1, 0],
            [-1, 5, -1],
            [0, -1, 0]
        ];
        
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const idx = (y * width + x) * 4;
                let r = 0, g = 0, b = 0;
                
                // Apply kernel
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        const nIdx = ((y + dy) * width + (x + dx)) * 4;
                        const weight = kernel[dy + 1][dx + 1];
                        r += data[nIdx] * weight;
                        g += data[nIdx + 1] * weight;
                        b += data[nIdx + 2] * weight;
                    }
                }
                
                newData[idx] = Math.max(0, Math.min(255, r));
                newData[idx + 1] = Math.max(0, Math.min(255, g));
                newData[idx + 2] = Math.max(0, Math.min(255, b));
            }
        }
        
        ctx.putImageData(new ImageData(newData, width, height), 0, 0);
    }

    // Result processing
    processOCRResult(result, options) {
        const processedResult = {
            text: result.data.text,
            confidence: result.data.confidence,
            words: result.data.words,
            lines: result.data.lines,
            blocks: result.data.blocks,
            paragraphs: result.data.paragraphs,
            timestamp: new Date().toISOString(),
            source: options.source || 'unknown',
            language: options.language || this.settings.language
        };

        // Filter results by confidence
        if (options.confidence && options.confidence > 0) {
            processedResult.words = processedResult.words.filter(word => 
                word.confidence >= options.confidence
            );
            processedResult.lines = processedResult.lines.filter(line => 
                line.confidence >= options.confidence
            );
        }

        // Extract specific information
        processedResult.extractedData = this.extractGameData(processedResult.text);

        return processedResult;
    }

    extractGameData(text) {
        const extracted = {
            itemLevel: null,
            characterName: null,
            class: null,
            level: null,
            gold: null,
            silver: null,
            copper: null,
            engravings: [],
            stats: {},
            items: []
        };

        // Extract item level (e.g., "1490.5", "1520")
        const itemLevelMatch = text.match(/(\d{3,4}(?:\.\d)?)/);
        if (itemLevelMatch) {
            const level = parseFloat(itemLevelMatch[1]);
            if (level >= 1300 && level <= 2000) {
                extracted.itemLevel = level;
            }
        }

        // Extract character name (usually in quotes or after "Name:")
        const nameMatch = text.match(/(?:Name:?\s*["']?([^"\n\r]+)["']?|["']([^"\n\r]+)["'])/);
        if (nameMatch) {
            extracted.characterName = nameMatch[1] || nameMatch[2];
        }

        // Extract class (common Lost Ark classes)
        const classes = [
            'Berserker', 'Destroyer', 'Gunlancer', 'Paladin', 'Slayer',
            'Arcanist', 'Bard', 'Sorceress', 'Summoner',
            'Artillerist', 'Deadeye', 'Gunslinger', 'Machinist', 'Sharpshooter',
            'Deathblade', 'Shadowhunter', 'Souleater',
            'Glaivier', 'Lance Master', 'Striker', 'Wardancer',
            'Scrapper', 'Soulfist', 'Breaker'
        ];
        
        for (const className of classes) {
            if (text.includes(className)) {
                extracted.class = className;
                break;
            }
        }

        // Extract level (e.g., "Level 60", "Lv. 60")
        const levelMatch = text.match(/(?:Level|Lv\.?)\s*(\d+)/i);
        if (levelMatch) {
            extracted.level = parseInt(levelMatch[1]);
        }

        // Extract currency
        const goldMatch = text.match(/(\d+)\s*Gold/i);
        const silverMatch = text.match(/(\d+)\s*Silver/i);
        const copperMatch = text.match(/(\d+)\s*Copper/i);
        
        if (goldMatch) extracted.gold = parseInt(goldMatch[1]);
        if (silverMatch) extracted.silver = parseInt(silverMatch[1]);
        if (copperMatch) extracted.copper = parseInt(copperMatch[1]);

        // Extract engravings
        const engravingMatch = text.match(/(\w+)\s*(\d+)/g);
        if (engravingMatch) {
            extracted.engravings = engravingMatch
                .map(match => {
                    const [name, level] = match.split(/\s+/);
                    return { name, level: parseInt(level) };
                })
                .filter(eng => eng.level >= 1 && eng.level <= 3);
        }

        // Extract stats
        const statMatch = text.match(/(\w+)\s*(\d+)/g);
        if (statMatch) {
            const stats = ['Crit', 'Specialization', 'Domination', 'Swiftness', 'Endurance', 'Expertise'];
            statMatch.forEach(match => {
                const [name, value] = match.split(/\s+/);
                if (stats.includes(name)) {
                    extracted.stats[name] = parseInt(value);
                }
            });
        }

        return extracted;
    }

    // History management
    saveToHistory(result, imageData) {
        const historyItem = {
            id: this.generateId(),
            result: result,
            timestamp: new Date().toISOString(),
            imageSize: imageData instanceof Blob ? imageData.size : 'unknown'
        };

        this.recognitionHistory.unshift(historyItem);
        
        // Limit history size
        if (this.recognitionHistory.length > this.settings.maxHistory) {
            this.recognitionHistory = this.recognitionHistory.slice(0, this.settings.maxHistory);
        }

        // Save to localStorage
        localStorage.setItem('ocrHistory', JSON.stringify(this.recognitionHistory));
    }

    getHistory() {
        return this.recognitionHistory;
    }

    clearHistory() {
        this.recognitionHistory = [];
        localStorage.removeItem('ocrHistory');
    }

    // Progress tracking
    updateProgress(progress) {
        // Emit progress event
        const event = new CustomEvent('ocrProgress', {
            detail: { progress: progress }
        });
        document.dispatchEvent(event);
    }

    // Utility methods
    generateId() {
        return 'ocr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Settings management
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.saveSettings();
        
        // Reinitialize if language changed
        if (newSettings.language && newSettings.language !== this.settings.language) {
            this.reinitializeWithLanguage(newSettings.language);
        }
    }

    async reinitializeWithLanguage(language) {
        if (this.worker) {
            try {
                await this.worker.loadLanguage(language);
                await this.worker.initialize(language);
                this.settings.language = language;
                this.saveSettings();
            } catch (error) {
                console.error('Failed to change language:', error);
            }
        }
    }

    // Batch processing
    async processBatch(images, options = {}) {
        const results = [];
        const total = images.length;
        
        for (let i = 0; i < total; i++) {
            try {
                // Update progress
                this.updateProgress(i / total);
                
                // Process image
                const result = await this.recognizeText(images[i], options);
                results.push({
                    index: i,
                    success: true,
                    result: result
                });
                
            } catch (error) {
                results.push({
                    index: i,
                    success: false,
                    error: error.message
                });
            }
        }
        
        // Final progress update
        this.updateProgress(1);
        
        return results;
    }

    // Export results
    exportResults(results, format = 'json') {
        switch (format.toLowerCase()) {
            case 'json':
                return JSON.stringify(results, null, 2);
            
            case 'csv':
                return this.convertToCSV(results);
            
            case 'txt':
                return this.convertToText(results);
            
            default:
                return JSON.stringify(results, null, 2);
        }
    }

    convertToCSV(results) {
        if (!Array.isArray(results) || results.length === 0) return '';
        
        const headers = ['Timestamp', 'Text', 'Confidence', 'Source', 'Language'];
        let csv = headers.join(',') + '\n';
        
        results.forEach(result => {
            const row = [
                result.timestamp,
                `"${result.text.replace(/"/g, '""')}"`,
                result.confidence,
                result.source,
                result.language
            ];
            csv += row.join(',') + '\n';
        });
        
        return csv;
    }

    convertToText(results) {
        if (!Array.isArray(results) || results.length === 0) return '';
        
        let text = '';
        results.forEach((result, index) => {
            text += `--- Result ${index + 1} ---\n`;
            text += `Timestamp: ${result.timestamp}\n`;
            text += `Text: ${result.text}\n`;
            text += `Confidence: ${result.confidence}\n`;
            text += `Source: ${result.source}\n`;
            text += `Language: ${result.language}\n\n`;
        });
        
        return text;
    }

    // Cleanup
    async terminate() {
        if (this.worker) {
            await this.worker.terminate();
            this.worker = null;
        }
        this.isInitialized = false;
    }

    // Public methods
    isReady() {
        return this.isInitialized;
    }

    getSupportedLanguages() {
        return [
            { code: 'eng', name: 'English' },
            { code: 'rus', name: 'Russian' },
            { code: 'kor', name: 'Korean' },
            { code: 'jpn', name: 'Japanese' },
            { code: 'chi_sim', name: 'Chinese Simplified' },
            { code: 'chi_tra', name: 'Chinese Traditional' }
        ];
    }

    getSettings() {
        return { ...this.settings };
    }
}

// Initialize the OCR module
const ocrModule = new OCRModule();