/**
 * AI Assistant Module - Provides AI-powered assistance for Lost Ark
 */
class AIAssistantModule {
    constructor() {
        this.conversationHistory = [];
        this.settings = {
            enabled: true,
            model: 'gpt-3.5-turbo', // Placeholder for future API integration
            maxHistory: 50,
            autoSuggestions: true,
            contextAware: true,
            language: 'en'
        };
        this.knowledgeBase = this.initializeKnowledgeBase();
        this.init();
    }

    init() {
        this.loadSettings();
        this.loadConversationHistory();
        this.initEventListeners();
    }

    loadSettings() {
        const stored = localStorage.getItem('aiAssistantSettings');
        if (stored) {
            this.settings = { ...this.settings, ...JSON.parse(stored) };
        }
    }

    saveSettings() {
        localStorage.setItem('aiAssistantSettings', JSON.stringify(this.settings));
    }

    loadConversationHistory() {
        const stored = localStorage.getItem('aiConversationHistory');
        if (stored) {
            this.conversationHistory = JSON.parse(stored);
        }
    }

    saveConversationHistory() {
        localStorage.setItem('aiConversationHistory', JSON.stringify(this.conversationHistory));
    }

    initEventListeners() {
        // Listen for AI assistant requests
        document.addEventListener('aiAssistantRequest', (e) => {
            this.handleRequest(e.detail);
        });

        // Listen for settings changes
        document.addEventListener('aiSettingsChanged', (e) => {
            this.updateSettings(e.detail);
        });
    }

    initializeKnowledgeBase() {
        return {
            raids: {
                'Vykas': {
                    difficulty: 'Hard',
                    minItemLevel: 1490,
                    mechanics: ['Gates', 'Pizza', 'Tentacles', 'Orbs'],
                    tips: ['Stay together during pizza phase', 'Use purify for tentacles', 'Coordinate orb collection'],
                    rewards: ['Gold', 'Materials', 'Accessories']
                },
                'Kakul-Saydon': {
                    difficulty: 'Hard',
                    minItemLevel: 1475,
                    mechanics: ['Clown phases', 'Maze', 'Cards', 'Bombs'],
                    tips: ['Learn card patterns', 'Use bombs strategically', 'Stay in safe zones'],
                    rewards: ['Gold', 'Materials', 'Accessories']
                },
                'Valtan': {
                    difficulty: 'Normal',
                    minItemLevel: 1415,
                    mechanics: ['Gates', 'Counter', 'Pizza', 'Orbs'],
                    tips: ['Counter at right time', 'Stay in safe zones', 'Coordinate with team'],
                    rewards: ['Gold', 'Materials', 'Accessories']
                }
            },
            classes: {
                'Berserker': {
                    role: 'DPS',
                    mainStat: 'Crit',
                    subStat: 'Specialization',
                    engravings: ['Mayhem', 'Berserker\'s Technique'],
                    tips: ['Manage Fury meter', 'Use Mayhem for burst damage', 'Position for back attacks']
                },
                'Sorceress': {
                    role: 'DPS',
                    mainStat: 'Intelligence',
                    subStat: 'Specialization',
                    engravings: ['Igniter', 'Reflux'],
                    tips: ['Manage Igniter buff', 'Position for maximum damage', 'Use mobility skills wisely']
                },
                'Bard': {
                    role: 'Support',
                    mainStat: 'Specialization',
                    subStat: 'Swiftness',
                    engravings: ['True Courage', 'Desperate Salvation'],
                    tips: ['Manage Serenade meter', 'Time buffs with team', 'Position for maximum coverage']
                }
            },
            mechanics: {
                'Counter': 'Attack when boss has blue aura for massive damage',
                'Pizza': 'Stay in safe slice of the pizza pattern',
                'Orbs': 'Collect orbs to avoid wipe mechanics',
                'Gates': 'Coordinate with team to clear gates simultaneously'
            },
            optimization: {
                'Item Level': 'Focus on weapon upgrades first, then armor',
                'Engravings': 'Aim for 3x3 or 4x3 engraving setup',
                'Gems': 'Prioritize damage gems over cooldown gems',
                'Cards': 'Use Lostwind Cliff set for most DPS classes'
            }
        };
    }

    // Main AI methods
    async processQuery(query, context = {}) {
        try {
            // Add user query to history
            this.addToHistory('user', query);

            // Analyze query intent
            const intent = this.analyzeIntent(query);
            
            // Generate response based on intent and context
            const response = await this.generateResponse(query, intent, context);
            
            // Add AI response to history
            this.addToHistory('assistant', response);

            // Save conversation
            this.saveConversationHistory();

            return {
                success: true,
                response: response,
                intent: intent,
                context: context
            };

        } catch (error) {
            console.error('AI query processing failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    analyzeIntent(query) {
        const lowerQuery = query.toLowerCase();
        
        // Intent classification
        if (lowerQuery.includes('raid') || lowerQuery.includes('boss') || lowerQuery.includes('mechanic')) {
            return 'raid_help';
        } else if (lowerQuery.includes('class') || lowerQuery.includes('build') || lowerQuery.includes('optimize')) {
            return 'character_optimization';
        } else if (lowerQuery.includes('item') || lowerQuery.includes('gear') || lowerQuery.includes('upgrade')) {
            return 'gear_advice';
        } else if (lowerQuery.includes('engraving') || lowerQuery.includes('gem') || lowerQuery.includes('card')) {
            return 'build_advice';
        } else if (lowerQuery.includes('schedule') || lowerQuery.includes('time') || lowerQuery.includes('when')) {
            return 'scheduling';
        } else if (lowerQuery.includes('team') || lowerQuery.includes('party') || lowerQuery.includes('group')) {
            return 'team_composition';
        } else if (lowerQuery.includes('economy') || lowerQuery.includes('gold') || lowerQuery.includes('market')) {
            return 'economy_advice';
        } else {
            return 'general_help';
        }
    }

    async generateResponse(query, intent, context) {
        // For now, use rule-based responses
        // In the future, this could integrate with actual AI APIs
        
        switch (intent) {
            case 'raid_help':
                return this.generateRaidResponse(query, context);
            case 'character_optimization':
                return this.generateCharacterResponse(query, context);
            case 'gear_advice':
                return this.generateGearResponse(query, context);
            case 'build_advice':
                return this.generateBuildResponse(query, context);
            case 'scheduling':
                return this.generateSchedulingResponse(query, context);
            case 'team_composition':
                return this.generateTeamResponse(query, context);
            case 'economy_advice':
                return this.generateEconomyResponse(query, context);
            default:
                return this.generateGeneralResponse(query, context);
        }
    }

    generateRaidResponse(query, context) {
        const lowerQuery = query.toLowerCase();
        
        // Check for specific raid mentions
        for (const [raidName, raidInfo] of Object.entries(this.knowledgeBase.raids)) {
            if (lowerQuery.includes(raidName.toLowerCase())) {
                return this.formatRaidInfo(raidName, raidInfo);
            }
        }

        // Check for mechanic mentions
        for (const [mechanic, description] of Object.entries(this.knowledgeBase.mechanics)) {
            if (lowerQuery.includes(mechanic.toLowerCase())) {
                return `**${mechanic}**: ${description}`;
            }
        }

        // General raid advice
        return `I can help you with raid information! Here are some popular raids:
        
**Vykas Hard Mode** - Item Level 1490+, complex mechanics
**Kakul-Saydon** - Item Level 1475+, card-based mechanics  
**Valtan Normal** - Item Level 1415+, good for beginners

What specific raid or mechanic would you like to know more about?`;
    }

    generateCharacterResponse(query, context) {
        const lowerQuery = query.toLowerCase();
        
        // Check for specific class mentions
        for (const [className, classInfo] of Object.entries(this.knowledgeBase.classes)) {
            if (lowerQuery.includes(className.toLowerCase())) {
                return this.formatClassInfo(className, classInfo);
            }
        }

        // General character optimization advice
        return `Here are some general character optimization tips:

**Priority Order:**
1. **Item Level** - Focus on weapon upgrades first
2. **Engravings** - Aim for 3x3 or 4x3 setup
3. **Gems** - Prioritize damage gems over cooldown
4. **Cards** - Use appropriate card sets for your class

What specific class or aspect would you like me to help you optimize?`;
    }

    generateGearResponse(query, context) {
        return `**Gear Optimization Guide:**

**Weapon Priority:**
- Upgrade weapon first (highest damage increase)
- Aim for +20 or higher for endgame content

**Armor Priority:**
- Chest and pants (highest defense)
- Gloves and shoulders (moderate defense)
- Helmet and boots (lower priority)

**Accessories:**
- Focus on correct stats for your class
- Quality matters more than item level
- Use proper engravings

Would you like specific advice for your class or current gear level?`;
    }

    generateBuildResponse(query, context) {
        return `**Build Optimization Tips:**

**Engravings:**
- **DPS Classes**: Aim for 3x3 or 4x3 setup
- **Support Classes**: Focus on utility engravings
- **Tank Classes**: Balance damage and survivability

**Gems:**
- **Damage Gems**: Prioritize for main damage skills
- **Cooldown Gems**: Use for important utility skills
- **Level 7+ gems** provide significant benefits

**Cards:**
- **Lostwind Cliff**: Best for most DPS classes
- **Wei**: Good alternative for some builds
- **Forest of Giants**: Useful for support classes

What specific build aspect would you like me to help with?`;
    }

    generateSchedulingResponse(query, context) {
        return `**Raid Scheduling Tips:**

**Weekly Reset:**
- Valtan, Vykas, Kakul-Saydon reset every Wednesday
- Plan your week around reset day

**Optimal Schedule:**
- **Monday-Tuesday**: Clear weekly raids
- **Wednesday**: New week begins, clear again
- **Weekend**: Focus on learning new content

**Time Management:**
- Each raid takes 1-2 hours
- Plan for 4-6 hours total per week
- Consider your team's availability

Would you like help creating a specific schedule or finding raid times?`;
    }

    generateTeamResponse(query, context) {
        return `**Team Composition Guide:**

**Balanced Team (8 players):**
- 2-3 Support classes (Bard, Paladin)
- 5-6 DPS classes
- Mix of melee and ranged

**Support Classes:**
- **Bard**: Great healing and damage buffs
- **Paladin**: Strong shields and utility
- **Artist**: Good healing and mobility

**DPS Classes:**
- **Melee**: Berserker, Deathblade, Striker
- **Ranged**: Sorceress, Gunslinger, Artillerist
- **Hybrid**: Shadowhunter, Scrapper

**Tips:**
- Ensure you have at least 2 support classes
- Balance melee and ranged DPS
- Consider class synergies

What specific team composition question do you have?`;
    }

    generateEconomyResponse(query, context) {
        return `**Economy Management Tips:**

**Gold Sources:**
- Weekly raids (main source)
- Daily chaos dungeons
- Guardian raids
- Market trading

**Gold Spending Priority:**
1. **Character progression** (upgrades, materials)
2. **Build optimization** (engravings, gems)
3. **Market investments** (buy low, sell high)
4. **Cosmetics** (optional)

**Market Tips:**
- Monitor material prices
- Buy materials during events
- Sell high-value items during peak times
- Use market alerts for price changes

**Daily Income:**
- Chaos dungeons: ~500-1000 gold
- Guardian raids: ~200-500 gold
- Weekly raids: ~5000-15000 gold

Would you like specific advice on gold management or market strategies?`;
    }

    generateGeneralResponse(query, context) {
        return `I'm here to help you with Lost Ark! I can assist with:

**Raid Information** - Mechanics, strategies, requirements
**Character Optimization** - Builds, gear, engravings
**Team Composition** - Class synergies, party building
**Scheduling** - Weekly planning, time management
**Economy** - Gold management, market strategies

Just ask me about any of these topics or something specific you need help with!`;
    }

    formatRaidInfo(raidName, raidInfo) {
        return `**${raidName} - ${raidInfo.difficulty} Mode**

**Requirements:**
- Minimum Item Level: ${raidInfo.minItemLevel}
- Difficulty: ${raidInfo.difficulty}

**Key Mechanics:**
${raidInfo.mechanics.map(mech => `- ${mech}`).join('\n')}

**Pro Tips:**
${raidInfo.tips.map(tip => `- ${tip}`).join('\n')}

**Rewards:**
${raidInfo.rewards.map(reward => `- ${reward}`).join('\n')}

Need help with specific mechanics or strategies?`;
    }

    formatClassInfo(className, classInfo) {
        return `**${className} - ${classInfo.role}**

**Primary Stats:**
- Main Stat: ${classInfo.mainStat}
- Secondary Stat: ${classInfo.subStat}

**Recommended Engravings:**
${classInfo.engravings.map(eng => `- ${eng}`).join('\n')}

**Key Tips:**
${classInfo.tips.map(tip => `- ${tip}`).join('\n')}

**Build Focus:**
- Focus on ${classInfo.mainStat} for maximum effectiveness
- Balance ${classInfo.subStat} for utility
- Use proper engravings for your playstyle

Would you like specific build advice or gear recommendations?`;
    }

    // Context-aware responses
    generateContextAwareResponse(query, context) {
        if (!this.settings.contextAware) {
            return this.generateResponse(query, 'general_help', context);
        }

        // Analyze current application context
        const appContext = this.analyzeAppContext();
        
        // Combine with user context
        const fullContext = { ...context, ...appContext };
        
        // Generate personalized response
        return this.generatePersonalizedResponse(query, fullContext);
    }

    analyzeAppContext() {
        const context = {};
        
        // Check current page
        if (window.navigation && window.navigation.currentPage) {
            context.currentPage = window.navigation.currentPage;
        }
        
        // Check current raids
        if (window.raidsModule) {
            context.currentRaids = window.raidsModule.raids;
        }
        
        // Check current characters
        if (window.charactersModule) {
            context.currentCharacters = window.charactersModule.characters;
        }
        
        // Check current schedule
        if (window.scheduleModule) {
            context.currentSchedule = window.scheduleModule.scheduledRaids;
        }
        
        return context;
    }

    generatePersonalizedResponse(query, context) {
        let response = this.generateResponse(query, this.analyzeIntent(query), context);
        
        // Add personalized context if available
        if (context.currentPage === 'raids' && context.currentRaids) {
            response += `\n\n**Your Current Raids:** You have ${context.currentRaids.length} raids planned.`;
        }
        
        if (context.currentPage === 'characters' && context.currentCharacters) {
            response += `\n\n**Your Characters:** You have ${context.currentCharacters.length} characters in your roster.`;
        }
        
        if (context.currentPage === 'schedule' && context.currentSchedule) {
            response += `\n\n**Your Schedule:** You have ${context.currentSchedule.length} scheduled raids this week.`;
        }
        
        return response;
    }

    // Auto-suggestions
    generateSuggestions(context = {}) {
        if (!this.settings.autoSuggestions) return [];
        
        const suggestions = [];
        
        // Context-based suggestions
        if (context.currentPage === 'raids') {
            suggestions.push(
                'How do I create a new raid?',
                'What are the requirements for Vykas Hard Mode?',
                'How do I manage raid participants?'
            );
        }
        
        if (context.currentPage === 'characters') {
            suggestions.push(
                'How do I optimize my character build?',
                'What engravings should I use?',
                'How do I increase my item level?'
            );
        }
        
        if (context.currentPage === 'schedule') {
            suggestions.push(
                'How do I schedule a recurring raid?',
                'What\'s the best time to schedule raids?',
                'How do I manage raid reminders?'
            );
        }
        
        // General suggestions
        suggestions.push(
            'What raids are available this week?',
            'How do I optimize my gold income?',
            'What\'s the best team composition?'
        );
        
        return suggestions.slice(0, 6); // Limit to 6 suggestions
    }

    // Conversation management
    addToHistory(role, content) {
        const message = {
            id: this.generateId(),
            role: role,
            content: content,
            timestamp: new Date().toISOString()
        };
        
        this.conversationHistory.push(message);
        
        // Limit history size
        if (this.conversationHistory.length > this.settings.maxHistory) {
            this.conversationHistory = this.conversationHistory.slice(-this.settings.maxHistory);
        }
    }

    getConversationHistory(limit = 20) {
        return this.conversationHistory.slice(-limit);
    }

    clearConversationHistory() {
        this.conversationHistory = [];
        this.saveConversationHistory();
    }

    // Settings management
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.saveSettings();
    }

    // Utility methods
    generateId() {
        return 'ai_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Public methods
    isEnabled() {
        return this.settings.enabled;
    }

    getSettings() {
        return { ...this.settings };
    }

    getKnowledgeBase() {
        return this.knowledgeBase;
    }

    // Quick help methods
    getQuickHelp(topic) {
        const quickHelp = {
            'raids': 'I can help you with raid mechanics, requirements, and strategies. Just ask about specific raids like Vykas, Kakul-Saydon, or Valtan.',
            'characters': 'I can help optimize your character builds, choose engravings, and improve your gear. Tell me your class and I\'ll give specific advice.',
            'schedule': 'I can help you plan your weekly raid schedule and manage your time effectively. Ask about optimal scheduling or recurring raids.',
            'economy': 'I can help you manage your gold, optimize income, and make smart market decisions. Ask about gold sources or spending priorities.'
        };
        
        return quickHelp[topic] || 'I can help with raids, characters, scheduling, and economy. What would you like to know?';
    }

    // Export conversation
    exportConversation(format = 'json') {
        switch (format.toLowerCase()) {
            case 'json':
                return JSON.stringify(this.conversationHistory, null, 2);
            
            case 'txt':
                return this.convertToText(this.conversationHistory);
            
            case 'csv':
                return this.convertToCSV(this.conversationHistory);
            
            default:
                return JSON.stringify(this.conversationHistory, null, 2);
        }
    }

    convertToText(conversation) {
        let text = 'AI Assistant Conversation History\n';
        text += '=====================================\n\n';
        
        conversation.forEach((message, index) => {
            text += `${index + 1}. ${message.role.toUpperCase()} (${new Date(message.timestamp).toLocaleString()})\n`;
            text += `${message.content}\n\n`;
        });
        
        return text;
    }

    convertToCSV(conversation) {
        let csv = 'Role,Timestamp,Content\n';
        
        conversation.forEach(message => {
            const content = `"${message.content.replace(/"/g, '""')}"`;
            csv += `${message.role},${message.timestamp},${content}\n`;
        });
        
        return csv;
    }
}

// Initialize the AI Assistant module
const aiAssistant = new AIAssistantModule();