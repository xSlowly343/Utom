/**
 * Touch Gesture Manager
 * Управляет touch жестами и жестами для мобильных устройств
 */

class TouchGestureManager {
    constructor() {
        this.gestures = new Map();
        this.activeGestures = new Map();
        this.settings = {
            enableGestures: true,
            enableSwipe: true,
            enablePinch: true,
            enableRotate: true,
            enableLongPress: true,
            enableDoubleTap: true,
            swipeThreshold: 50,
            pinchThreshold: 0.1,
            rotateThreshold: 15,
            longPressDelay: 500,
            doubleTapDelay: 300
        };
        
        this.touchStartTime = 0;
        this.lastTapTime = 0;
        this.longPressTimer = null;
        this.gestureElement = null;
        
        this.init();
    }

    init() {
        this.loadSettings();
        this.setupDefaultGestures();
        this.setupEventListeners();
        console.log('TouchGestureManager: Инициализирован');
    }

    loadSettings() {
        try {
            const savedSettings = localStorage.getItem('touchGestureSettings');
            if (savedSettings) {
                this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
            }
        } catch (error) {
            console.warn('TouchGestureManager: Ошибка загрузки настроек:', error);
        }
    }

    saveSettings() {
        try {
            localStorage.setItem('touchGestureSettings', JSON.stringify(this.settings));
        } catch (error) {
            console.warn('TouchGestureManager: Ошибка сохранения настроек:', error);
        }
    }

    setupDefaultGestures() {
        // Swipe жесты
        this.addGesture('swipeLeft', {
            type: 'swipe',
            direction: 'left',
            threshold: this.settings.swipeThreshold,
            handler: (data) => this.handleSwipeLeft(data)
        });

        this.addGesture('swipeRight', {
            type: 'swipe',
            direction: 'right',
            threshold: this.settings.swipeThreshold,
            handler: (data) => this.handleSwipeRight(data)
        });

        this.addGesture('swipeUp', {
            type: 'swipe',
            direction: 'up',
            threshold: this.settings.swipeThreshold,
            handler: (data) => this.handleSwipeUp(data)
        });

        this.addGesture('swipeDown', {
            type: 'swipe',
            direction: 'down',
            threshold: this.settings.swipeThreshold,
            handler: (data) => this.handleSwipeDown(data)
        });

        // Pinch жесты
        this.addGesture('pinchIn', {
            type: 'pinch',
            direction: 'in',
            threshold: this.settings.pinchThreshold,
            handler: (data) => this.handlePinchIn(data)
        });

        this.addGesture('pinchOut', {
            type: 'pinch',
            direction: 'out',
            threshold: this.settings.pinchThreshold,
            handler: (data) => this.handlePinchOut(data)
        });

        // Rotate жесты
        this.addGesture('rotateClockwise', {
            type: 'rotate',
            direction: 'clockwise',
            threshold: this.settings.rotateThreshold,
            handler: (data) => this.handleRotateClockwise(data)
        });

        this.addGesture('rotateCounterclockwise', {
            type: 'rotate',
            direction: 'counterclockwise',
            threshold: this.settings.rotateThreshold,
            handler: (data) => this.handleRotateCounterclockwise(data)
        });

        // Long press
        this.addGesture('longPress', {
            type: 'longPress',
            delay: this.settings.longPressDelay,
            handler: (data) => this.handleLongPress(data)
        });

        // Double tap
        this.addGesture('doubleTap', {
            type: 'doubleTap',
            delay: this.settings.doubleTapDelay,
            handler: (data) => this.handleDoubleTap(data)
        });
    }

    setupEventListeners() {
        if (!this.settings.enableGestures) return;

        // Touch события
        document.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        document.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        document.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
        document.addEventListener('touchcancel', (e) => this.handleTouchCancel(e), { passive: false });

        // Mouse события для эмуляции touch на десктопе
        document.addEventListener('mousedown', (e) => this.handleMouseDown(e), { passive: false });
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e), { passive: false });
        document.addEventListener('mouseup', (e) => this.handleMouseUp(e), { passive: false });

        // Глобальные события
        window.addEventListener('touchGesture:add', (event) => {
            const { name, config } = event.detail;
            this.addGesture(name, config);
        });

        window.addEventListener('touchGesture:remove', (event) => {
            const { name } = event.detail;
            this.removeGesture(name);
        });

        window.addEventListener('touchGesture:enable', (event) => {
            const { name } = event.detail;
            this.enableGesture(name);
        });

        window.addEventListener('touchGesture:disable', (event) => {
            const { name } = event.detail;
            this.disableGesture(name);
        });
    }

    // Добавление жеста
    addGesture(name, config) {
        if (this.gestures.has(name)) {
            console.warn(`TouchGestureManager: Жест ${name} уже существует`);
            return false;
        }

        const gesture = {
            ...config,
            enabled: true,
            element: config.element || document,
            preventDefault: config.preventDefault !== false
        };

        this.gestures.set(name, gesture);
        console.log(`TouchGestureManager: Добавлен жест ${name}`);
        return true;
    }

    // Удаление жеста
    removeGesture(name) {
        if (!this.gestures.has(name)) {
            console.warn(`TouchGestureManager: Жест ${name} не найден`);
            return false;
        }

        this.gestures.delete(name);
        console.log(`TouchGestureManager: Удален жест ${name}`);
        return true;
    }

    // Включение жеста
    enableGesture(name) {
        const gesture = this.gestures.get(name);
        if (gesture) {
            gesture.enabled = true;
            console.log(`TouchGestureManager: Жест ${name} включен`);
        }
    }

    // Отключение жеста
    disableGesture(name) {
        const gesture = this.gestures.get(name);
        if (gesture) {
            gesture.enabled = false;
            console.log(`TouchGestureManager: Жест ${name} отключен`);
        }
    }

    // Обработка touch start
    handleTouchStart(e) {
        if (!this.settings.enableGestures) return;

        const touches = Array.from(e.touches);
        this.touchStartTime = Date.now();
        
        // Сбрасываем активные жесты
        this.activeGestures.clear();
        
        // Инициализируем жесты для каждого touch
        touches.forEach((touch, index) => {
            this.activeGestures.set(index, {
                startX: touch.clientX,
                startY: touch.clientY,
                startTime: this.touchStartTime,
                element: document.elementFromPoint(touch.clientX, touch.clientY)
            });
        });

        // Запускаем таймер для long press
        if (this.settings.enableLongPress) {
            this.startLongPressTimer(e);
        }

        // Предотвращаем стандартное поведение если нужно
        if (this.shouldPreventDefault(e)) {
            e.preventDefault();
        }
    }

    // Обработка touch move
    handleTouchMove(e) {
        if (!this.settings.enableGestures) return;

        const touches = Array.from(e.touches);
        
        touches.forEach((touch, index) => {
            const activeGesture = this.activeGestures.get(index);
            if (!activeGesture) return;

            const currentX = touch.clientX;
            const currentY = touch.clientY;
            
            // Обновляем данные жеста
            activeGesture.currentX = currentX;
            activeGesture.currentY = currentY;
            activeGesture.deltaX = currentX - activeGesture.startX;
            activeGesture.deltaY = currentY - activeGesture.startY;
            activeGesture.distance = Math.sqrt(
                Math.pow(activeGesture.deltaX, 2) + 
                Math.pow(activeGesture.deltaY, 2)
            );

            // Обрабатываем жесты в реальном времени
            this.processRealTimeGestures(activeGesture, index);
        });

        // Предотвращаем стандартное поведение если нужно
        if (this.shouldPreventDefault(e)) {
            e.preventDefault();
        }
    }

    // Обработка touch end
    handleTouchEnd(e) {
        if (!this.settings.enableGestures) return;

        const touches = Array.from(e.changedTouches);
        
        touches.forEach((touch, index) => {
            const activeGesture = this.activeGestures.get(index);
            if (!activeGesture) return;

            // Завершаем обработку жестов
            this.finalizeGestures(activeGesture, index);
            
            // Удаляем активный жест
            this.activeGestures.delete(index);
        });

        // Останавливаем таймер long press
        this.stopLongPressTimer();

        // Проверяем double tap
        if (this.settings.enableDoubleTap) {
            this.checkDoubleTap(e);
        }

        // Предотвращаем стандартное поведение если нужно
        if (this.shouldPreventDefault(e)) {
            e.preventDefault();
        }
    }

    // Обработка touch cancel
    handleTouchCancel(e) {
        if (!this.settings.enableGestures) return;

        // Сбрасываем все активные жесты
        this.activeGestures.clear();
        this.stopLongPressTimer();
    }

    // Обработка mouse событий для эмуляции touch
    handleMouseDown(e) {
        if (!this.settings.enableGestures) return;

        // Эмулируем touch start
        const touchEvent = new TouchEvent('touchstart', {
            touches: [{
                clientX: e.clientX,
                clientY: e.clientY,
                identifier: 0
            }]
        });

        this.handleTouchStart(touchEvent);
    }

    handleMouseMove(e) {
        if (!this.settings.enableGestures) return;

        // Эмулируем touch move
        const touchEvent = new TouchEvent('touchmove', {
            touches: [{
                clientX: e.clientX,
                clientY: e.clientY,
                identifier: 0
            }]
        });

        this.handleTouchMove(touchEvent);
    }

    handleMouseUp(e) {
        if (!this.settings.enableGestures) return;

        // Эмулируем touch end
        const touchEvent = new TouchEvent('touchend', {
            changedTouches: [{
                clientX: e.clientX,
                clientY: e.clientY,
                identifier: 0
            }]
        });

        this.handleTouchEnd(touchEvent);
    }

    // Обработка жестов в реальном времени
    processRealTimeGestures(activeGesture, index) {
        // Обрабатываем жесты которые можно определить во время движения
        if (this.settings.enablePinch && this.activeGestures.size === 2) {
            this.processPinchGesture();
        }

        if (this.settings.enableRotate && this.activeGestures.size === 2) {
            this.processRotateGesture();
        }
    }

    // Завершение обработки жестов
    finalizeGestures(activeGesture, index) {
        // Обрабатываем swipe жесты
        if (this.settings.enableSwipe) {
            this.processSwipeGesture(activeGesture);
        }

        // Обрабатываем long press
        if (this.settings.enableLongPress && activeGesture.isLongPress) {
            this.triggerGesture('longPress', activeGesture);
        }
    }

    // Обработка swipe жеста
    processSwipeGesture(activeGesture) {
        const { deltaX, deltaY, distance } = activeGesture;
        
        if (distance < this.settings.swipeThreshold) return;

        // Определяем направление
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // Горизонтальный swipe
            if (deltaX > 0) {
                this.triggerGesture('swipeRight', activeGesture);
            } else {
                this.triggerGesture('swipeLeft', activeGesture);
            }
        } else {
            // Вертикальный swipe
            if (deltaY > 0) {
                this.triggerGesture('swipeDown', activeGesture);
            } else {
                this.triggerGesture('swipeUp', activeGesture);
            }
        }
    }

    // Обработка pinch жеста
    processPinchGesture() {
        const touches = Array.from(this.activeGestures.values());
        if (touches.length !== 2) return;

        const [touch1, touch2] = touches;
        const currentDistance = this.getDistance(touch1, touch2);
        const startDistance = this.getDistance(
            { currentX: touch1.startX, currentY: touch1.startY },
            { currentX: touch2.startX, currentY: touch2.startY }
        );

        const scale = currentDistance / startDistance;
        const deltaScale = scale - 1;

        if (Math.abs(deltaScale) > this.settings.pinchThreshold) {
            if (deltaScale > 0) {
                this.triggerGesture('pinchOut', { scale, deltaScale, touches });
            } else {
                this.triggerGesture('pinchIn', { scale, deltaScale, touches });
            }
        }
    }

    // Обработка rotate жеста
    processRotateGesture() {
        const touches = Array.from(this.activeGestures.values());
        if (touches.length !== 2) return;

        const [touch1, touch2] = touches;
        const currentAngle = this.getAngle(touch1, touch2);
        const startAngle = this.getAngle(
            { currentX: touch1.startX, currentY: touch1.startY },
            { currentX: touch2.startX, currentY: touch2.startY }
        );

        const deltaAngle = currentAngle - startAngle;

        if (Math.abs(deltaAngle) > this.settings.rotateThreshold) {
            if (deltaAngle > 0) {
                this.triggerGesture('rotateClockwise', { angle: deltaAngle, touches });
            } else {
                this.triggerGesture('rotateCounterclockwise', { angle: Math.abs(deltaAngle), touches });
            }
        }
    }

    // Запуск таймера long press
    startLongPressTimer(e) {
        this.longPressTimer = setTimeout(() => {
            const touch = e.touches[0];
            const element = document.elementFromPoint(touch.clientX, touch.clientY);
            
            // Находим активный жест для этого элемента
            for (const [index, gesture] of this.activeGestures) {
                if (gesture.element === element) {
                    gesture.isLongPress = true;
                    break;
                }
            }
        }, this.settings.longPressDelay);
    }

    // Остановка таймера long press
    stopLongPressTimer() {
        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = null;
        }
    }

    // Проверка double tap
    checkDoubleTap(e) {
        const currentTime = Date.now();
        const timeSinceLastTap = currentTime - this.lastTapTime;

        if (timeSinceLastTap < this.settings.doubleTapDelay) {
            // Double tap обнаружен
            const touch = e.changedTouches[0];
            const element = document.elementFromPoint(touch.clientX, touch.clientY);
            
            this.triggerGesture('doubleTap', {
                element,
                x: touch.clientX,
                y: touch.clientY,
                time: currentTime
            });

            this.lastTapTime = 0; // Сбрасываем для следующей серии
        } else {
            this.lastTapTime = currentTime;
        }
    }

    // Запуск жеста
    triggerGesture(name, data) {
        const gesture = this.gestures.get(name);
        if (!gesture || !gesture.enabled) return;

        try {
            if (gesture.handler && typeof gesture.handler === 'function') {
                gesture.handler(data);
            }

            // Уведомляем другие модули
            this.notifyModules('gestureTriggered', { name, data, gesture });
            
            console.log(`TouchGestureManager: Жест ${name} выполнен`, data);
        } catch (error) {
            console.error(`TouchGestureManager: Ошибка выполнения жеста ${name}:`, error);
        }
    }

    // Утилиты
    getDistance(point1, point2) {
        const dx = point1.currentX - point2.currentX;
        const dy = point1.currentY - point2.currentY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    getAngle(point1, point2) {
        return Math.atan2(
            point2.currentY - point1.currentY,
            point2.currentX - point1.currentX
        ) * 180 / Math.PI;
    }

    shouldPreventDefault(e) {
        // Определяем нужно ли предотвратить стандартное поведение
        const target = e.target;
        
        // Предотвращаем для элементов с жестами
        if (target.hasAttribute('data-gesture')) {
            return true;
        }
        
        // Предотвращаем для определенных элементов
        const preventElements = ['button', 'input', 'select', 'textarea'];
        if (preventElements.includes(target.tagName.toLowerCase())) {
            return false;
        }
        
        return false;
    }

    // Обработчики по умолчанию
    handleSwipeLeft(data) {
        // Свайп влево - закрываем мобильное меню
        if (window.responsiveManager && window.responsiveManager.isMobileDevice()) {
            window.responsiveManager.closeMobileMenu();
        }
    }

    handleSwipeRight(data) {
        // Свайп вправо - открываем мобильное меню
        if (window.responsiveManager && window.responsiveManager.isMobileDevice()) {
            window.responsiveManager.openMobileMenu();
        }
    }

    handleSwipeUp(data) {
        // Свайп вверх - скролл вверх
        window.scrollBy(0, -100);
    }

    handleSwipeDown(data) {
        // Свайп вниз - скролл вниз
        window.scrollBy(0, 100);
    }

    handlePinchIn(data) {
        // Уменьшение масштаба
        const { scale } = data;
        this.applyZoom(scale);
    }

    handlePinchOut(data) {
        // Увеличение масштаба
        const { scale } = data;
        this.applyZoom(scale);
    }

    handleRotateClockwise(data) {
        // Поворот по часовой стрелке
        const { angle } = data;
        this.applyRotation(angle);
    }

    handleRotateCounterclockwise(data) {
        // Поворот против часовой стрелки
        const { angle } = data;
        this.applyRotation(-angle);
    }

    handleLongPress(data) {
        // Долгое нажатие - контекстное меню
        this.showContextMenu(data);
    }

    handleDoubleTap(data) {
        // Двойное нажатие - увеличение/уменьшение
        this.toggleZoom();
    }

    // Применение эффектов
    applyZoom(scale) {
        const content = document.querySelector('.main-content') || document.body;
        const currentScale = parseFloat(content.style.transform.replace('scale(', '').replace(')', '')) || 1;
        const newScale = Math.max(0.5, Math.min(3, currentScale * scale));
        
        content.style.transform = `scale(${newScale})`;
        content.style.transformOrigin = 'center top';
    }

    applyRotation(angle) {
        const content = document.querySelector('.main-content') || document.body;
        const currentRotation = parseFloat(content.style.transform.replace('rotate(', '').replace('deg)', '')) || 0;
        const newRotation = currentRotation + angle;
        
        content.style.transform = `rotate(${newRotation}deg)`;
    }

    toggleZoom() {
        const content = document.querySelector('.main-content') || document.body;
        const currentScale = parseFloat(content.style.transform.replace('scale(', '').replace(')', '')) || 1;
        
        if (currentScale > 1) {
            content.style.transform = 'scale(1)';
        } else {
            content.style.transform = 'scale(1.5)';
        }
    }

    showContextMenu(data) {
        // Показываем контекстное меню
        const { element, x, y } = data;
        
        // Создаем контекстное меню
        const contextMenu = document.createElement('div');
        contextMenu.className = 'context-menu';
        contextMenu.style.position = 'fixed';
        contextMenu.style.left = `${x}px`;
        contextMenu.style.top = `${y}px`;
        contextMenu.style.zIndex = '10000';
        contextMenu.innerHTML = `
            <div class="context-menu-item">Копировать</div>
            <div class="context-menu-item">Вставить</div>
            <div class="context-menu-item">Вырезать</div>
        `;
        
        document.body.appendChild(contextMenu);
        
        // Убираем через 3 секунды
        setTimeout(() => {
            if (contextMenu.parentElement) {
                contextMenu.remove();
            }
        }, 3000);
    }

    // Уведомление модулей
    notifyModules(event, data) {
        const customEvent = new CustomEvent(`touchGesture:${event}`, { detail: data });
        window.dispatchEvent(customEvent);
    }

    // Публичные методы
    getGesture(name) {
        return this.gestures.get(name);
    }

    getAllGestures() {
        return Array.from(this.gestures.keys());
    }

    getActiveGestures() {
        return Array.from(this.activeGestures.keys());
    }

    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.saveSettings();
        
        // Обновляем настройки жестов
        if (newSettings.enableGestures !== undefined) {
            if (newSettings.enableGestures) {
                this.setupEventListeners();
            }
        }
    }

    // Остановка модуля
    stop() {
        this.activeGestures.clear();
        this.stopLongPressTimer();
        console.log('TouchGestureManager: Остановлен');
    }

    // Перезапуск модуля
    restart() {
        this.stop();
        this.init();
        console.log('TouchGestureManager: Перезапущен');
    }
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    window.touchGestureManager = new TouchGestureManager();
});

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TouchGestureManager;
}