/**
 * Schedule Module - Управление расписанием рейдов
 */

class ScheduleModule {
    constructor() {
        this.scheduledRaids = [];
        this.scheduleSettings = {
            timezone: 'local',
            reminderTime: 30, // минуты до начала
            autoNotifications: true,
            syncWithCalendar: false
        };
        
        this.init();
    }

    init() {
        this.loadSchedule();
        this.loadSettings();
        this.setupEventListeners();
        console.log('ScheduleModule: Инициализирован');
    }

    loadSchedule() {
        try {
            const savedSchedule = localStorage.getItem('raidSchedule');
            if (savedSchedule) {
                this.scheduledRaids = JSON.parse(savedSchedule);
            }
        } catch (error) {
            console.error('ScheduleModule: Ошибка загрузки расписания:', error);
            this.scheduledRaids = [];
        }
    }

    saveSchedule() {
        try {
            localStorage.setItem('raidSchedule', JSON.stringify(this.scheduledRaids));
        } catch (error) {
            console.error('ScheduleModule: Ошибка сохранения расписания:', error);
        }
    }

    loadSettings() {
        try {
            const savedSettings = localStorage.getItem('scheduleSettings');
            if (savedSettings) {
                this.scheduleSettings = { ...this.scheduleSettings, ...JSON.parse(savedSettings) };
            }
        } catch (error) {
            console.error('ScheduleModule: Ошибка загрузки настроек:', error);
        }
    }

    saveSettings() {
        try {
            localStorage.setItem('scheduleSettings', JSON.stringify(this.scheduleSettings));
        } catch (error) {
            console.error('ScheduleModule: Ошибка сохранения настроек:', error);
        }
    }

    setupEventListeners() {
        // События для обновления расписания
        window.addEventListener('schedule:update', () => {
            this.loadSchedule();
        });

        // События для добавления рейда
        window.addEventListener('schedule:addRaid', (event) => {
            const { raid } = event.detail;
            this.addScheduledRaid(raid);
        });

        // События для удаления рейда
        window.addEventListener('schedule:removeRaid', (event) => {
            const { raidId } = event.detail;
            this.removeScheduledRaid(raidId);
        });
    }

    // Добавление рейда в расписание
    addScheduledRaid(raid) {
        const scheduledRaid = {
            id: Date.now(),
            raidId: raid.id,
            name: raid.name,
            type: raid.type,
            dateTime: raid.dateTime,
            maxPlayers: raid.maxPlayers,
            currentPlayers: raid.currentPlayers || 0,
            status: 'scheduled',
            createdAt: new Date().toISOString(),
            reminderSent: false
        };

        this.scheduledRaids.push(scheduledRaid);
        this.saveSchedule();
        
        // Планируем уведомление
        this.scheduleReminder(scheduledRaid);
        
        // Уведомляем о добавлении
        if (window.toastManager) {
            window.toastManager.success(
                'Рейд добавлен в расписание',
                `${raid.name} запланирован на ${new Date(raid.dateTime).toLocaleString()}`,
                5000
            );
        }

        return scheduledRaid;
    }

    // Удаление рейда из расписания
    removeScheduledRaid(raidId) {
        const index = this.scheduledRaids.findIndex(raid => raid.id === raidId);
        if (index !== -1) {
            const removedRaid = this.scheduledRaids.splice(index, 1)[0];
            this.saveSchedule();
            
            // Уведомляем об удалении
            if (window.toastManager) {
                window.toastManager.info(
                    'Рейд удален из расписания',
                    `${removedRaid.name} удален из расписания`,
                    3000
                );
            }
            
            return removedRaid;
        }
        return null;
    }

    // Обновление статуса рейда
    updateRaidStatus(raidId, status) {
        const raid = this.scheduledRaids.find(r => r.id === raidId);
        if (raid) {
            raid.status = status;
            raid.updatedAt = new Date().toISOString();
            this.saveSchedule();
            
            // Уведомляем об обновлении
            if (window.toastManager) {
                window.toastManager.info(
                    'Статус рейда обновлен',
                    `${raid.name}: ${this.getStatusText(status)}`,
                    3000
                );
            }
        }
    }

    // Получение текста статуса
    getStatusText(status) {
        const statuses = {
            'scheduled': 'Запланирован',
            'in-progress': 'В процессе',
            'completed': 'Завершен',
            'cancelled': 'Отменен',
            'postponed': 'Отложен'
        };
        return statuses[status] || status;
    }

    // Планирование напоминания
    scheduleReminder(scheduledRaid) {
        if (!this.scheduleSettings.autoNotifications) return;
        
        const raidTime = new Date(scheduledRaid.dateTime);
        const reminderTime = new Date(raidTime.getTime() - (this.scheduleSettings.reminderTime * 60 * 1000));
        const now = new Date();
        
        if (reminderTime > now) {
            const delay = reminderTime.getTime() - now.getTime();
            
            setTimeout(() => {
                this.sendReminder(scheduledRaid);
            }, delay);
        }
    }

    // Отправка напоминания
    sendReminder(scheduledRaid) {
        if (scheduledRaid.reminderSent) return;
        
        // Отправляем уведомление
        if (window.toastManager) {
            window.toastManager.warning(
                'Напоминание о рейде',
                `Рейд "${scheduledRaid.name}" начнется через ${this.scheduleSettings.reminderTime} минут!`,
                0 // Без автоматического скрытия
            );
        }
        
        // Отправляем системное уведомление
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Напоминание о рейде', {
                body: `Рейд "${scheduledRaid.name}" начнется через ${this.scheduleSettings.reminderTime} минут!`,
                icon: '/assets/icon.png',
                tag: `raid-${scheduledRaid.id}`
            });
        }
        
        scheduledRaid.reminderSent = true;
        this.saveSchedule();
    }

    // Получение расписания
    getSchedule(filters = {}) {
        let filteredSchedule = [...this.scheduledRaids];
        
        // Фильтр по статусу
        if (filters.status) {
            filteredSchedule = filteredSchedule.filter(raid => raid.status === filters.status);
        }
        
        // Фильтр по дате
        if (filters.date) {
            const filterDate = new Date(filters.date);
            filteredSchedule = filteredSchedule.filter(raid => {
                const raidDate = new Date(raid.dateTime);
                return raidDate.toDateString() === filterDate.toDateString();
            });
        }
        
        // Фильтр по типу
        if (filters.type) {
            filteredSchedule = filteredSchedule.filter(raid => raid.type === filters.type);
        }
        
        // Сортировка по дате
        filteredSchedule.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
        
        return filteredSchedule;
    }

    // Получение ближайших рейдов
    getUpcomingRaids(limit = 5) {
        const now = new Date();
        const upcoming = this.scheduledRaids
            .filter(raid => new Date(raid.dateTime) > now && raid.status === 'scheduled')
            .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))
            .slice(0, limit);
        
        return upcoming;
    }

    // Получение статистики
    getScheduleStats() {
        const now = new Date();
        const total = this.scheduledRaids.length;
        const upcoming = this.scheduledRaids.filter(raid => new Date(raid.dateTime) > now).length;
        const completed = this.scheduledRaids.filter(raid => raid.status === 'completed').length;
        const cancelled = this.scheduledRaids.filter(raid => raid.status === 'cancelled').length;
        
        return {
            total,
            upcoming,
            completed,
            cancelled,
            completionRate: total > 0 ? (completed / total * 100).toFixed(1) : 0
        };
    }

    // Экспорт расписания
    exportSchedule(format = 'json') {
        switch (format) {
            case 'json':
                return JSON.stringify(this.scheduledRaids, null, 2);
            case 'csv':
                return this.convertToCSV();
            case 'ical':
                return this.convertToICal();
            default:
                throw new Error(`Неподдерживаемый формат: ${format}`);
        }
    }

    // Конвертация в CSV
    convertToCSV() {
        const headers = ['ID', 'Название', 'Тип', 'Дата и время', 'Максимум игроков', 'Статус'];
        const rows = this.scheduledRaids.map(raid => [
            raid.id,
            raid.name,
            raid.type,
            new Date(raid.dateTime).toLocaleString(),
            raid.maxPlayers,
            this.getStatusText(raid.status)
        ]);
        
        return [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');
    }

    // Конвертация в iCal
    convertToICal() {
        let ical = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Lost Ark Raid Manager//RU\n';
        
        this.scheduledRaids.forEach(raid => {
            const startDate = new Date(raid.dateTime);
            const endDate = new Date(startDate.getTime() + (2 * 60 * 60 * 1000)); // +2 часа
            
            ical += `BEGIN:VEVENT\n`;
            ical += `UID:raid-${raid.id}@lostark.com\n`;
            ical += `DTSTART:${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z\n`;
            ical += `DTEND:${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z\n`;
            ical += `SUMMARY:${raid.name}\n`;
            ical += `DESCRIPTION:Рейд ${raid.type} - ${raid.currentPlayers}/${raid.maxPlayers} игроков\n`;
            ical += `END:VEVENT\n`;
        });
        
        ical += 'END:VCALENDAR';
        return ical;
    }

    // Импорт расписания
    importSchedule(data, format = 'json') {
        try {
            let importedRaids = [];
            
            switch (format) {
                case 'json':
                    importedRaids = JSON.parse(data);
                    break;
                case 'csv':
                    importedRaids = this.parseCSV(data);
                    break;
                default:
                    throw new Error(`Неподдерживаемый формат: ${format}`);
            }
            
            // Валидация данных
            const validRaids = importedRaids.filter(raid => 
                raid.name && raid.dateTime && raid.type
            );
            
            // Добавляем импортированные рейды
            validRaids.forEach(raid => {
                this.addScheduledRaid(raid);
            });
            
            if (window.toastManager) {
                window.toastManager.success(
                    'Расписание импортировано',
                    `Добавлено ${validRaids.length} рейдов`,
                    5000
                );
            }
            
            return validRaids.length;
        } catch (error) {
            console.error('ScheduleModule: Ошибка импорта:', error);
            
            if (window.toastManager) {
                window.toastManager.error(
                    'Ошибка импорта',
                    'Не удалось импортировать расписание',
                    5000
                );
            }
            
            throw error;
        }
    }

    // Парсинг CSV
    parseCSV(csvData) {
        const lines = csvData.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.replace(/"/g, ''));
        const raids = [];
        
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.replace(/"/g, ''));
            const raid = {};
            
            headers.forEach((header, index) => {
                raid[header] = values[index];
            });
            
            raids.push(raid);
        }
        
        return raids;
    }

    // Обновление настроек
    updateSettings(newSettings) {
        this.scheduleSettings = { ...this.scheduleSettings, ...newSettings };
        this.saveSettings();
        
        if (window.toastManager) {
            window.toastManager.success(
                'Настройки обновлены',
                'Настройки расписания сохранены',
                3000
            );
        }
    }

    // Получение настроек
    getSettings() {
        return { ...this.scheduleSettings };
    }

    // Очистка старых рейдов
    cleanupOldRaids() {
        const now = new Date();
        const oneMonthAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
        
        const oldRaids = this.scheduledRaids.filter(raid => 
            new Date(raid.dateTime) < oneMonthAgo && raid.status === 'completed'
        );
        
        oldRaids.forEach(raid => {
            this.removeScheduledRaid(raid.id);
        });
        
        return oldRaids.length;
    }

    // Остановка модуля
    stop() {
        console.log('ScheduleModule: Остановлен');
    }

    // Перезапуск модуля
    restart() {
        this.stop();
        this.init();
        console.log('ScheduleModule: Перезапущен');
    }
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    window.scheduleModule = new ScheduleModule();
});

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScheduleModule;
}