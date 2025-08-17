/**
 * Schedule Module - Manages raid scheduling and calendar functionality
 */
class ScheduleModule {
    constructor() {
        this.scheduledRaids = [];
        this.recurringRaids = [];
        this.calendarView = 'month'; // month, week, day
        this.currentDate = new Date();
        this.selectedDate = null;
        this.filters = {
            raidType: 'all',
            status: 'all',
            server: 'all'
        };
        
        this.init();
    }

    init() {
        this.loadScheduledRaids();
        this.initEventListeners();
        this.renderCalendar();
        this.renderScheduledRaids();
    }

    initEventListeners() {
        // Calendar navigation
        document.addEventListener('click', (e) => {
            if (e.target.matches('.calendar-nav-btn')) {
                this.handleCalendarNavigation(e.target.dataset.action);
            }
            if (e.target.matches('.calendar-view-btn')) {
                this.switchCalendarView(e.target.dataset.view);
            }
            if (e.target.matches('.calendar-day')) {
                this.selectDate(new Date(e.target.dataset.date));
            }
            if (e.target.matches('.schedule-raid-btn')) {
                this.showScheduleRaidModal();
            }
            if (e.target.matches('.recurring-raid-btn')) {
                this.showRecurringRaidModal();
            }
        });

        // Form submissions
        document.addEventListener('submit', (e) => {
            if (e.target.matches('#scheduleRaidForm')) {
                e.preventDefault();
                this.scheduleRaid();
            }
            if (e.target.matches('#recurringRaidForm')) {
                e.preventDefault();
                this.createRecurringRaid();
            }
        });

        // Filter changes
        document.addEventListener('change', (e) => {
            if (e.target.matches('.schedule-filter')) {
                this.applyFilters();
            }
        });
    }

    loadScheduledRaids() {
        // Load from localStorage (placeholder for database)
        const stored = localStorage.getItem('scheduledRaids');
        this.scheduledRaids = stored ? JSON.parse(stored) : this.getMockScheduledRaids();
        
        const recurringStored = localStorage.getItem('recurringRaids');
        this.recurringRaids = recurringStored ? JSON.parse(recurringStored) : this.getMockRecurringRaids();
    }

    getMockScheduledRaids() {
        const now = new Date();
        return [
            {
                id: 'sched_1',
                raidId: 'raid_1',
                title: 'Valtan Normal',
                date: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Tomorrow
                time: '20:00',
                duration: 120,
                maxParticipants: 8,
                currentParticipants: 6,
                status: 'scheduled',
                server: 'EU Central',
                type: 'Legion Raid',
                description: 'Weekly Valtan clear'
            },
            {
                id: 'sched_2',
                raidId: 'raid_2',
                title: 'Vykas Hard',
                date: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
                time: '19:30',
                duration: 150,
                maxParticipants: 8,
                currentParticipants: 8,
                status: 'full',
                server: 'EU Central',
                type: 'Legion Raid',
                description: 'Hard mode progression'
            }
        ];
    }

    getMockRecurringRaids() {
        return [
            {
                id: 'recur_1',
                title: 'Weekly Guardians',
                days: ['monday', 'wednesday', 'friday'],
                time: '18:00',
                duration: 60,
                maxParticipants: 4,
                type: 'Guardian Raid',
                server: 'EU Central',
                description: 'Daily guardian raids',
                isActive: true
            }
        ];
    }

    renderCalendar() {
        const calendarContainer = document.getElementById('scheduleCalendar');
        if (!calendarContainer) return;

        const currentMonth = this.currentDate.getMonth();
        const currentYear = this.currentDate.getFullYear();
        
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        let calendarHTML = `
            <div class="calendar-header">
                <button class="calendar-nav-btn" data-action="prev">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <h3>${this.getMonthName(currentMonth)} ${currentYear}</h3>
                <button class="calendar-nav-btn" data-action="next">
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
            <div class="calendar-view-controls">
                <button class="calendar-view-btn ${this.calendarView === 'month' ? 'active' : ''}" data-view="month">Month</button>
                <button class="calendar-view-btn ${this.calendarView === 'week' ? 'active' : ''}" data-view="week">Week</button>
                <button class="calendar-view-btn ${this.calendarView === 'day' ? 'active' : ''}" data-view="day">Day</button>
            </div>
            <div class="calendar-grid">
                <div class="calendar-weekdays">
                    <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
                </div>
                <div class="calendar-days">
        `;

        const endDate = new Date(lastDay);
        endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));

        for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
            const isCurrentMonth = date.getMonth() === currentMonth;
            const isToday = this.isSameDay(date, new Date());
            const isSelected = this.selectedDate && this.isSameDay(date, this.selectedDate);
            const hasRaids = this.getRaidsForDate(date).length > 0;
            
            const dateStr = date.toISOString().split('T')[0];
            
            calendarHTML += `
                <div class="calendar-day ${isCurrentMonth ? '' : 'other-month'} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${hasRaids ? 'has-raids' : ''}" 
                     data-date="${dateStr}">
                    <span class="day-number">${date.getDate()}</span>
                    ${hasRaids ? '<div class="raid-indicator"></div>' : ''}
                </div>
            `;
        }

        calendarHTML += `
                </div>
            </div>
        `;

        calendarContainer.innerHTML = calendarHTML;
    }

    renderScheduledRaids() {
        const container = document.getElementById('scheduledRaidsList');
        if (!container) return;

        const filteredRaids = this.getFilteredRaids();
        
        if (filteredRaids.length === 0) {
            container.innerHTML = `
                <div class="no-raids-message">
                    <i class="fas fa-calendar-times"></i>
                    <p>No scheduled raids found</p>
                    <button class="btn btn-primary schedule-raid-btn">
                        <i class="fas fa-plus"></i> Schedule a Raid
                    </button>
                </div>
            `;
            return;
        }

        const raidsHTML = filteredRaids.map(raid => this.createScheduledRaidElement(raid)).join('');
        container.innerHTML = raidsHTML;
    }

    createScheduledRaidElement(raid) {
        const date = new Date(raid.date);
        const timeUntil = this.getTimeUntil(date, raid.time);
        const statusClass = this.getStatusClass(raid.status);
        
        return `
            <div class="scheduled-raid-card ${statusClass}" data-raid-id="${raid.id}">
                <div class="raid-header">
                    <h4>${raid.title}</h4>
                    <span class="raid-status ${statusClass}">${raid.status}</span>
                </div>
                <div class="raid-details">
                    <div class="raid-date-time">
                        <i class="fas fa-calendar"></i>
                        <span>${this.formatDate(date)} at ${raid.time}</span>
                    </div>
                    <div class="raid-duration">
                        <i class="fas fa-clock"></i>
                        <span>${raid.duration} minutes</span>
                    </div>
                    <div class="raid-participants">
                        <i class="fas fa-users"></i>
                        <span>${raid.currentParticipants}/${raid.maxParticipants}</span>
                    </div>
                    <div class="raid-server">
                        <i class="fas fa-server"></i>
                        <span>${raid.server}</span>
                    </div>
                </div>
                <div class="raid-description">
                    <p>${raid.description}</p>
                </div>
                <div class="raid-actions">
                    <button class="btn btn-sm btn-outline" onclick="scheduleModule.joinScheduledRaid('${raid.id}')">
                        <i class="fas fa-sign-in-alt"></i> Join
                    </button>
                    <button class="btn btn-sm btn-outline" onclick="scheduleModule.editScheduledRaid('${raid.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="scheduleModule.cancelScheduledRaid('${raid.id}')">
                        <i class="fas fa-times"></i> Cancel
                    </button>
                </div>
                ${timeUntil ? `<div class="time-until">${timeUntil}</div>` : ''}
            </div>
        `;
    }

    showScheduleRaidModal() {
        const modal = this.createScheduleRaidModal();
        document.body.appendChild(modal);
        
        // Initialize date picker
        const dateInput = modal.querySelector('#raidDate');
        dateInput.min = new Date().toISOString().split('T')[0];
        
        // Initialize time picker
        const timeInput = modal.querySelector('#raidTime');
        const now = new Date();
        timeInput.value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    }

    createScheduleRaidModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3>Schedule New Raid</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="scheduleRaidForm">
                        <div class="form-group">
                            <label for="raidTitle">Raid Title</label>
                            <input type="text" id="raidTitle" name="title" required placeholder="Enter raid title">
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="raidDate">Date</label>
                                <input type="date" id="raidDate" name="date" required>
                            </div>
                            <div class="form-group">
                                <label for="raidTime">Time</label>
                                <input type="time" id="raidTime" name="time" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="raidDuration">Duration (minutes)</label>
                                <input type="number" id="raidDuration" name="duration" min="30" max="300" value="120" required>
                            </div>
                            <div class="form-group">
                                <label for="raidMaxParticipants">Max Participants</label>
                                <input type="number" id="raidMaxParticipants" name="maxParticipants" min="1" max="20" value="8" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="raidType">Raid Type</label>
                            <select id="raidType" name="type" required>
                                <option value="">Select raid type</option>
                                <option value="Legion Raid">Legion Raid</option>
                                <option value="Guardian Raid">Guardian Raid</option>
                                <option value="Abyss Raid">Abyss Raid</option>
                                <option value="Abyss Dungeon">Abyss Dungeon</option>
                                <option value="Chaos Dungeon">Chaos Dungeon</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="raidServer">Server</label>
                            <select id="raidServer" name="server" required>
                                <option value="">Select server</option>
                                <option value="EU Central">EU Central</option>
                                <option value="EU West">EU West</option>
                                <option value="US East">US East</option>
                                <option value="US West">US West</option>
                                <option value="SA">SA</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="raidDescription">Description</label>
                            <textarea id="raidDescription" name="description" rows="3" placeholder="Enter raid description"></textarea>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                            <button type="submit" class="btn btn-primary">Schedule Raid</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        return modal;
    }

    scheduleRaid() {
        const form = document.getElementById('scheduleRaidForm');
        const formData = new FormData(form);
        
        const raidData = {
            id: `sched_${Date.now()}`,
            raidId: `raid_${Date.now()}`,
            title: formData.get('title'),
            date: new Date(formData.get('date')),
            time: formData.get('time'),
            duration: parseInt(formData.get('duration')),
            maxParticipants: parseInt(formData.get('maxParticipants')),
            currentParticipants: 0,
            status: 'scheduled',
            server: formData.get('server'),
            type: formData.get('type'),
            description: formData.get('description')
        };

        // Validate date and time
        const raidDateTime = new Date(raidData.date);
        const [hours, minutes] = raidData.time.split(':');
        raidDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        if (raidDateTime <= new Date()) {
            this.showError('Cannot schedule raids in the past');
            return;
        }

        // Check for scheduling conflicts
        if (this.hasSchedulingConflict(raidData)) {
            this.showError('Scheduling conflict detected. Please choose a different time.');
            return;
        }

        this.scheduledRaids.push(raidData);
        this.saveScheduledRaids();
        this.renderCalendar();
        this.renderScheduledRaids();
        
        // Close modal
        form.closest('.modal-overlay').remove();
        
        this.showSuccess('Raid scheduled successfully!');
        
        // Trigger notification
        this.scheduleNotification(raidData);
    }

    hasSchedulingConflict(newRaid) {
        const newDateTime = new Date(newRaid.date);
        const [hours, minutes] = newRaid.time.split(':');
        newDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        const newEndTime = new Date(newDateTime.getTime() + newRaid.duration * 60 * 1000);
        
        return this.scheduledRaids.some(existingRaid => {
            if (existingRaid.status === 'cancelled') return false;
            
            const existingDateTime = new Date(existingRaid.date);
            const [existingHours, existingMinutes] = existingRaid.time.split(':');
            existingDateTime.setHours(parseInt(existingHours), parseInt(existingMinutes), 0, 0);
            
            const existingEndTime = new Date(existingDateTime.getTime() + existingRaid.duration * 60 * 1000);
            
            // Check for overlap
            return (newDateTime < existingEndTime && newEndTime > existingDateTime);
        });
    }

    scheduleNotification(raid) {
        const raidDateTime = new Date(raid.date);
        const [hours, minutes] = raid.time.split(':');
        raidDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        // Schedule notification 30 minutes before raid
        const notificationTime = new Date(raidDateTime.getTime() - 30 * 60 * 1000);
        const timeUntilNotification = notificationTime.getTime() - Date.now();
        
        if (timeUntilNotification > 0) {
            setTimeout(() => {
                this.showRaidReminder(raid);
            }, timeUntilNotification);
        }
    }

    showRaidReminder(raid) {
        if (window.utils && window.utils.showNotification) {
            window.utils.showNotification(
                `Raid Reminder: ${raid.title}`,
                `Your raid starts in 30 minutes!`,
                'info'
            );
        }
    }

    showRecurringRaidModal() {
        const modal = this.createRecurringRaidModal();
        document.body.appendChild(modal);
    }

    createRecurringRaidModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3>Create Recurring Raid</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="recurringRaidForm">
                        <div class="form-group">
                            <label for="recurringTitle">Raid Title</label>
                            <input type="text" id="recurringTitle" name="title" required placeholder="Enter raid title">
                        </div>
                        <div class="form-group">
                            <label>Recurring Days</label>
                            <div class="checkbox-group">
                                <label><input type="checkbox" name="days" value="monday"> Monday</label>
                                <label><input type="checkbox" name="days" value="tuesday"> Tuesday</label>
                                <label><input type="checkbox" name="days" value="wednesday"> Wednesday</label>
                                <label><input type="checkbox" name="days" value="thursday"> Thursday</label>
                                <label><input type="checkbox" name="days" value="friday"> Friday</label>
                                <label><input type="checkbox" name="days" value="saturday"> Saturday</label>
                                <label><input type="checkbox" name="days" value="sunday"> Sunday</label>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="recurringTime">Time</label>
                                <input type="time" id="recurringTime" name="time" required>
                            </div>
                            <div class="form-group">
                                <label for="recurringDuration">Duration (minutes)</label>
                                <input type="number" id="recurringDuration" name="duration" min="30" max="300" value="60" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="recurringMaxParticipants">Max Participants</label>
                            <input type="number" id="recurringMaxParticipants" name="maxParticipants" min="1" max="20" value="4" required>
                        </div>
                        <div class="form-group">
                            <label for="recurringType">Raid Type</label>
                            <select id="recurringType" name="type" required>
                                <option value="">Select raid type</option>
                                <option value="Guardian Raid">Guardian Raid</option>
                                <option value="Chaos Dungeon">Chaos Dungeon</option>
                                <option value="Abyss Dungeon">Abyss Dungeon</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="recurringServer">Server</label>
                            <select id="recurringServer" name="server" required>
                                <option value="">Select server</option>
                                <option value="EU Central">EU Central</option>
                                <option value="EU West">EU West</option>
                                <option value="US East">US East</option>
                                <option value="US West">US West</option>
                                <option value="SA">SA</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="recurringDescription">Description</label>
                            <textarea id="recurringDescription" name="description" rows="3" placeholder="Enter raid description"></textarea>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                            <button type="submit" class="btn btn-primary">Create Recurring Raid</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        return modal;
    }

    createRecurringRaid() {
        const form = document.getElementById('recurringRaidForm');
        const formData = new FormData(form);
        
        const selectedDays = formData.getAll('days');
        if (selectedDays.length === 0) {
            this.showError('Please select at least one recurring day');
            return;
        }

        const recurringRaid = {
            id: `recur_${Date.now()}`,
            title: formData.get('title'),
            days: selectedDays,
            time: formData.get('time'),
            duration: parseInt(formData.get('duration')),
            maxParticipants: parseInt(formData.get('maxParticipants')),
            type: formData.get('type'),
            server: formData.get('server'),
            description: formData.get('description'),
            isActive: true
        };

        this.recurringRaids.push(recurringRaid);
        this.saveRecurringRaids();
        this.renderScheduledRaids();
        
        // Close modal
        form.closest('.modal-overlay').remove();
        
        this.showSuccess('Recurring raid created successfully!');
    }

    handleCalendarNavigation(action) {
        switch (action) {
            case 'prev':
                if (this.calendarView === 'month') {
                    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
                } else if (this.calendarView === 'week') {
                    this.currentDate.setDate(this.currentDate.getDate() - 7);
                } else {
                    this.currentDate.setDate(this.currentDate.getDate() - 1);
                }
                break;
            case 'next':
                if (this.calendarView === 'month') {
                    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
                } else if (this.calendarView === 'week') {
                    this.currentDate.setDate(this.currentDate.getDate() + 7);
                } else {
                    this.currentDate.setDate(this.currentDate.getDate() + 1);
                }
                break;
        }
        this.renderCalendar();
    }

    switchCalendarView(view) {
        this.calendarView = view;
        this.renderCalendar();
    }

    selectDate(date) {
        this.selectedDate = date;
        this.renderCalendar();
        this.showDateDetails(date);
    }

    showDateDetails(date) {
        const raids = this.getRaidsForDate(date);
        const container = document.getElementById('dateDetails');
        if (!container) return;

        if (raids.length === 0) {
            container.innerHTML = `
                <div class="no-raids-message">
                    <p>No raids scheduled for ${this.formatDate(date)}</p>
                    <button class="btn btn-primary schedule-raid-btn" data-date="${date.toISOString().split('T')[0]}">
                        <i class="fas fa-plus"></i> Schedule Raid
                    </button>
                </div>
            `;
            return;
        }

        const raidsHTML = raids.map(raid => `
            <div class="date-raid-item">
                <div class="raid-time">${raid.time}</div>
                <div class="raid-info">
                    <div class="raid-title">${raid.title}</div>
                    <div class="raid-participants">${raid.currentParticipants}/${raid.maxParticipants}</div>
                </div>
                <div class="raid-status ${raid.status}">${raid.status}</div>
            </div>
        `).join('');

        container.innerHTML = `
            <h4>Raids for ${this.formatDate(date)}</h4>
            <div class="date-raids-list">
                ${raidsHTML}
            </div>
        `;
    }

    getRaidsForDate(date) {
        return this.scheduledRaids.filter(raid => {
            const raidDate = new Date(raid.date);
            return this.isSameDay(raidDate, date);
        });
    }

    getFilteredRaids() {
        return this.scheduledRaids.filter(raid => {
            if (this.filters.raidType !== 'all' && raid.type !== this.filters.raidType) return false;
            if (this.filters.status !== 'all' && raid.status !== this.filters.status) return false;
            if (this.filters.server !== 'all' && raid.server !== this.filters.server) return false;
            return true;
        });
    }

    applyFilters() {
        const raidTypeFilter = document.querySelector('#raidTypeFilter');
        const statusFilter = document.querySelector('#statusFilter');
        const serverFilter = document.querySelector('#serverFilter');

        if (raidTypeFilter) this.filters.raidType = raidTypeFilter.value;
        if (statusFilter) this.filters.status = statusFilter.value;
        if (serverFilter) this.filters.server = serverFilter.value;

        this.renderScheduledRaids();
    }

    joinScheduledRaid(raidId) {
        const raid = this.scheduledRaids.find(r => r.id === raidId);
        if (!raid) return;

        if (raid.currentParticipants >= raid.maxParticipants) {
            this.showError('This raid is already full');
            return;
        }

        raid.currentParticipants++;
        if (raid.currentParticipants >= raid.maxParticipants) {
            raid.status = 'full';
        }

        this.saveScheduledRaids();
        this.renderScheduledRaids();
        this.showSuccess('Successfully joined the raid!');
    }

    editScheduledRaid(raidId) {
        // Placeholder for edit functionality
        this.showError('Edit functionality coming soon');
    }

    cancelScheduledRaid(raidId) {
        const raid = this.scheduledRaids.find(r => r.id === raidId);
        if (!raid) return;

        if (confirm(`Are you sure you want to cancel "${raid.title}"?`)) {
            raid.status = 'cancelled';
            this.saveScheduledRaids();
            this.renderScheduledRaids();
            this.showSuccess('Raid cancelled successfully');
        }
    }

    saveScheduledRaids() {
        localStorage.setItem('scheduledRaids', JSON.stringify(this.scheduledRaids));
    }

    saveRecurringRaids() {
        localStorage.setItem('recurringRaids', JSON.stringify(this.recurringRaids));
    }

    // Utility methods
    getMonthName(month) {
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
        return months[month];
    }

    isSameDay(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }

    formatDate(date) {
        return date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }

    getTimeUntil(date, time) {
        const raidDateTime = new Date(date);
        const [hours, minutes] = time.split(':');
        raidDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        const now = new Date();
        const diff = raidDateTime.getTime() - now.getTime();
        
        if (diff <= 0) return null;
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (days > 0) return `${days}d ${hours}h ${minutes}m`;
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    }

    getStatusClass(status) {
        const statusClasses = {
            'scheduled': 'status-scheduled',
            'full': 'status-full',
            'in-progress': 'status-progress',
            'completed': 'status-completed',
            'cancelled': 'status-cancelled'
        };
        return statusClasses[status] || 'status-default';
    }

    showSuccess(message) {
        if (window.utils && window.utils.showNotification) {
            window.utils.showNotification('Success', message, 'success');
        } else {
            alert(message);
        }
    }

    showError(message) {
        if (window.utils && window.utils.showNotification) {
            window.utils.showNotification('Error', message, 'error');
        } else {
            alert(message);
        }
    }

    // Public methods for external access
    refreshSchedule() {
        this.loadScheduledRaids();
        this.renderCalendar();
        this.renderScheduledRaids();
    }

    getUpcomingRaids(limit = 5) {
        const now = new Date();
        return this.scheduledRaids
            .filter(raid => {
                const raidDateTime = new Date(raid.date);
                const [hours, minutes] = raid.time.split(':');
                raidDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                return raidDateTime > now && raid.status !== 'cancelled';
            })
            .sort((a, b) => {
                const dateA = new Date(a.date + 'T' + a.time);
                const dateB = new Date(b.date + 'T' + b.time);
                return dateA - dateB;
            })
            .slice(0, limit);
    }

    getTodayRaids() {
        const today = new Date();
        return this.getRaidsForDate(today);
    }

    getWeeklySchedule() {
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        
        const weeklyRaids = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(weekStart);
            date.setDate(weekStart.getDate() + i);
            const dayRaids = this.getRaidsForDate(date);
            weeklyRaids.push({
                date: date,
                raids: dayRaids
            });
        }
        return weeklyRaids;
    }
}

// Initialize the schedule module
const scheduleModule = new ScheduleModule();