/**
 * Tools Module
 * Инструменты для Lost Ark Raid Manager
 */

class ToolsManager {
    constructor() {
        this.tools = [];
        this.currentTool = null;
        this.init();
    }

    init() {
        this.loadTools();
        this.bindEvents();
        this.render();
    }

    loadTools() {
        this.tools = [
            {
                id: 1,
                name: 'DPS Calculator',
                type: 'calculator',
                description: 'Калькулятор урона персонажа',
                icon: 'fas fa-calculator',
                isActive: true
            },
            {
                id: 2,
                name: 'Gear Optimizer',
                type: 'optimizer',
                description: 'Оптимизатор экипировки',
                icon: 'fas fa-cogs',
                isActive: true
            },
            {
                id: 3,
                name: 'Engraving Calculator',
                type: 'calculator',
                description: 'Калькулятор энгравингов',
                icon: 'fas fa-gem',
                isActive: true
            }
        ];
    }

    bindEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.tool-item')) {
                const toolId = parseInt(e.target.closest('.tool-item').dataset.id);
                this.openTool(toolId);
            }
        });
    }

    openTool(toolId) {
        const tool = this.tools.find(t => t.id === toolId);
        if (!tool) return;

        this.currentTool = tool;
        this.renderTool(tool);
    }

    renderTool(tool) {
        const container = document.getElementById('toolContainer');
        if (!container) return;

        switch (tool.type) {
            case 'calculator':
                this.renderCalculator(tool, container);
                break;
            case 'optimizer':
                this.renderOptimizer(tool, container);
                break;
            default:
                container.innerHTML = `<p>Инструмент ${tool.name} в разработке</p>`;
        }
    }

    renderCalculator(tool, container) {
        container.innerHTML = `
            <div class="tool-header">
                <h2><i class="${tool.icon}"></i> ${tool.name}</h2>
                <p>${tool.description}</p>
            </div>
            <div class="tool-content">
                <div class="calculator-form">
                    <h3>Параметры персонажа</h3>
                    <div class="form-group">
                        <label>Класс:</label>
                        <select id="characterClass">
                            <option value="berserker">Berserker</option>
                            <option value="paladin">Paladin</option>
                            <option value="sorceress">Sorceress</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Предметный уровень:</label>
                        <input type="number" id="itemLevel" value="1490" min="1300" max="1600">
                    </div>
                    <button class="btn btn-primary" onclick="toolsManager.calculateDPS()">
                        Рассчитать DPS
                    </button>
                </div>
                <div class="calculator-result" id="calculatorResult"></div>
            </div>
        `;
    }

    renderOptimizer(tool, container) {
        container.innerHTML = `
            <div class="tool-header">
                <h2><i class="${tool.icon}"></i> ${tool.name}</h2>
                <p>${tool.description}</p>
            </div>
            <div class="tool-content">
                <div class="optimizer-form">
                    <h3>Оптимизация экипировки</h3>
                    <div class="form-group">
                        <label>Тип оптимизации:</label>
                        <select id="optimizationType">
                            <option value="dps">Максимальный DPS</option>
                            <option value="survival">Выживаемость</option>
                            <option value="balance">Баланс</option>
                        </select>
                    </div>
                    <button class="btn btn-primary" onclick="toolsManager.optimizeGear()">
                        Оптимизировать
                    </button>
                </div>
                <div class="optimizer-result" id="optimizerResult"></div>
            </div>
        `;
    }

    calculateDPS() {
        const characterClass = document.getElementById('characterClass').value;
        const itemLevel = parseInt(document.getElementById('itemLevel').value);
        
        let baseDPS = 1000;
        let multiplier = 1;
        
        switch (characterClass) {
            case 'berserker':
                multiplier = 1.2;
                break;
            case 'paladin':
                multiplier = 0.8;
                break;
            case 'sorceress':
                multiplier = 1.1;
                break;
        }
        
        const dps = Math.floor(baseDPS * multiplier * (itemLevel / 1000));
        
        const result = document.getElementById('calculatorResult');
        if (result) {
            result.innerHTML = `
                <div class="result-card">
                    <h4>Результат расчета:</h4>
                    <p><strong>DPS:</strong> ${dps.toLocaleString()}</p>
                    <p><strong>Класс:</strong> ${characterClass}</p>
                    <p><strong>Предметный уровень:</strong> ${itemLevel}</p>
                </div>
            `;
        }
    }

    optimizeGear() {
        const optimizationType = document.getElementById('optimizationType').value;
        
        let recommendations = [];
        
        switch (optimizationType) {
            case 'dps':
                recommendations = [
                    'Используйте энгравинги: Grudge, Cursed Doll',
                    'Приоритет на критические удары',
                    'Максимальный урон навыков'
                ];
                break;
            case 'survival':
                recommendations = [
                    'Используйте энгравинги: Heavy Armor, Vital Point Hit',
                    'Приоритет на здоровье и защиту',
                    'Навыки выживания'
                ];
                break;
            case 'balance':
                recommendations = [
                    'Сбалансированные энгравинги',
                    'Равномерное распределение характеристик',
                    'Универсальность'
                ];
                break;
        }
        
        const result = document.getElementById('optimizerResult');
        if (result) {
            result.innerHTML = `
                <div class="result-card">
                    <h4>Рекомендации по оптимизации:</h4>
                    <ul>
                        ${recommendations.map(rec => `<li>${rec}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
    }

    render() {
        const container = document.getElementById('toolsContainer');
        if (!container) return;

        container.innerHTML = `
            <div class="tools-header">
                <h2>Инструменты</h2>
                <p>Полезные инструменты для оптимизации персонажа</p>
            </div>
            
            <div class="tools-grid">
                ${this.tools.map(tool => `
                    <div class="tool-item" data-id="${tool.id}">
                        <div class="tool-icon">
                            <i class="${tool.icon}"></i>
                        </div>
                        <div class="tool-info">
                            <h3>${tool.name}</h3>
                            <p>${tool.description}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="tool-container" id="toolContainer">
                <!-- Tool content will be rendered here -->
            </div>
        `;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.toolsManager = new ToolsManager();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ToolsManager;
}