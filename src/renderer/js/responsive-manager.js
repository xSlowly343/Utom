/**
 * Responsive Layout Manager
 * Управляет адаптивным дизайном и мобильной версией приложения
 */

class ResponsiveManager {
    constructor() {
        this.breakpoints = {
            mobile: 480,
            tablet: 768,
            desktop: 1024,
            wide: 1440
        };
        
        this.currentBreakpoint = 'desktop';
        this.isMobile = false;
        this.isTablet = false;
        this.isDesktop = true;
        this.isWide = false;
        
        this.orientation = 'landscape';
        this.isPortrait = false;
        
        this.settings = {
            enableResponsive: true,
            enableMobileOptimization: true,
            enableTouchGestures: true,
            enableSwipeNavigation: true,
            mobileMenuBehavior: 'slide', // slide, overlay, push
            tabletLayout: 'adaptive', // adaptive, mobile, desktop
            enableHighDPI: true,
            enableReducedMotion: false
        };
        
        this.mobileMenu = null;
        this.touchGestures = new Map();
        this.resizeObserver = null;
        
        this.init();
    }

    init() {
        this.loadSettings();
        this.detectDevice();
        this.setupEventListeners();
        this.createMobileMenu();
        this.setupTouchGestures();
        this.applyResponsiveClasses();
        this.optimizeForDevice();
        console.log('ResponsiveManager: Инициализирован');
    }

    loadSettings() {
        try {
            const savedSettings = localStorage.getItem('responsiveSettings');
            if (savedSettings) {
                this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
            }
        } catch (error) {
            console.warn('ResponsiveManager: Ошибка загрузки настроек:', error);
        }
    }

    saveSettings() {
        try {
            localStorage.setItem('responsiveSettings', JSON.stringify(this.settings));
        } catch (error) {
            console.warn('ResponsiveManager: Ошибка сохранения настроек:', error);
        }
    }

    detectDevice() {
        // Определяем размер экрана
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        // Определяем breakpoint
        if (width < this.breakpoints.mobile) {
            this.currentBreakpoint = 'mobile';
            this.isMobile = true;
            this.isTablet = false;
            this.isDesktop = false;
            this.isWide = false;
        } else if (width < this.breakpoints.tablet) {
            this.currentBreakpoint = 'tablet';
            this.isMobile = false;
            this.isTablet = true;
            this.isDesktop = false;
            this.isWide = false;
        } else if (width < this.breakpoints.desktop) {
            this.currentBreakpoint = 'desktop';
            this.isMobile = false;
            this.isTablet = false;
            this.isDesktop = true;
            this.isWide = false;
        } else {
            this.currentBreakpoint = 'wide';
            this.isMobile = false;
            this.isTablet = false;
            this.isDesktop = false;
            this.isWide = true;
        }
        
        // Определяем ориентацию
        this.orientation = width > height ? 'landscape' : 'portrait';
        this.isPortrait = this.orientation === 'portrait';
        
        // Определяем тип устройства
        this.deviceType = this.detectDeviceType();
        
        console.log(`ResponsiveManager: ${this.currentBreakpoint} (${width}x${height}), ${this.orientation}, ${this.deviceType}`);
    }

    detectDeviceType() {
        const userAgent = navigator.userAgent.toLowerCase();
        
        if (/android/.test(userAgent)) {
            return 'android';
        } else if (/iphone|ipad|ipod/.test(userAgent)) {
            return 'ios';
        } else if (/windows/.test(userAgent)) {
            return 'windows';
        } else if (/macintosh|mac os x/.test(userAgent)) {
            return 'mac';
        } else if (/linux/.test(userAgent)) {
            return 'linux';
        } else {
            return 'unknown';
        }
    }

    setupEventListeners() {
        // Изменение размера окна
        window.addEventListener('resize', this.debounce(() => {
            this.handleResize();
        }, 250));
        
        // Изменение ориентации
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleOrientationChange();
            }, 100);
        });
        
        // Touch события
        if (this.settings.enableTouchGestures) {
            this.setupTouchEvents();
        }
        
        // Resize Observer для отслеживания изменений элементов
        if (window.ResizeObserver) {
            this.setupResizeObserver();
        }
        
        // Глобальные события
        window.addEventListener('responsive:update', () => {
            this.updateResponsiveState();
        });
        
        window.addEventListener('responsive:toggleMobileMenu', () => {
            this.toggleMobileMenu();
        });
    }

    handleResize() {
        const oldBreakpoint = this.currentBreakpoint;
        this.detectDevice();
        
        if (oldBreakpoint !== this.currentBreakpoint) {
            this.handleBreakpointChange(oldBreakpoint, this.currentBreakpoint);
        }
        
        this.applyResponsiveClasses();
        this.optimizeForDevice();
        this.updateMobileMenu();
        
        // Уведомляем другие модули
        this.notifyModules('breakpointChanged', {
            old: oldBreakpoint,
            new: this.currentBreakpoint,
            width: window.innerWidth,
            height: window.innerHeight
        });
    }

    handleOrientationChange() {
        const oldOrientation = this.orientation;
        this.detectDevice();
        
        if (oldOrientation !== this.orientation) {
            this.handleOrientationChange(oldOrientation, this.orientation);
        }
        
        this.applyResponsiveClasses();
        this.updateMobileMenu();
        
        // Уведомляем другие модули
        this.notifyModules('orientationChanged', {
            old: oldOrientation,
            new: this.orientation
        });
    }

    handleBreakpointChange(oldBreakpoint, newBreakpoint) {
        console.log(`ResponsiveManager: Breakpoint изменился с ${oldBreakpoint} на ${newBreakpoint}`);
        
        // Специальная логика для разных переходов
        if (oldBreakpoint === 'desktop' && newBreakpoint === 'tablet') {
            this.handleDesktopToTablet();
        } else if (oldBreakpoint === 'tablet' && newBreakpoint === 'mobile') {
            this.handleTabletToMobile();
        } else if (oldBreakpoint === 'mobile' && newBreakpoint === 'tablet') {
            this.handleMobileToTablet();
        } else if (oldBreakpoint === 'tablet' && newBreakpoint === 'desktop') {
            this.handleTabletToDesktop();
        }
    }

    handleOrientationChange(oldOrientation, newOrientation) {
        console.log(`ResponsiveManager: Ориентация изменилась с ${oldOrientation} на ${newOrientation}`);
        
        if (newOrientation === 'portrait' && this.isMobile) {
            this.optimizeForPortrait();
        } else if (newOrientation === 'landscape' && this.isMobile) {
            this.optimizeForLandscape();
        }
    }

    // Специальная обработка переходов между breakpoints
    handleDesktopToTablet() {
        // Адаптируем layout для планшета
        this.adaptLayoutForTablet();
    }

    handleTabletToMobile() {
        // Переключаемся на мобильный layout
        this.switchToMobileLayout();
    }

    handleMobileToTablet() {
        // Возвращаемся к планшетному layout
        this.switchToTabletLayout();
    }

    handleTabletToDesktop() {
        // Возвращаемся к десктопному layout
        this.switchToDesktopLayout();
    }

    createMobileMenu() {
        if (!this.settings.enableMobileOptimization) return;
        
        this.mobileMenu = document.createElement('div');
        this.mobileMenu.className = 'mobile-menu';
        this.mobileMenu.innerHTML = `
            <div class="mobile-menu-overlay"></div>
            <div class="mobile-menu-content">
                <div class="mobile-menu-header">
                    <h3>Меню</h3>
                    <button class="mobile-menu-close" onclick="window.responsiveManager.toggleMobileMenu()">×</button>
                </div>
                <nav class="mobile-menu-nav">
                    <a href="#dashboard" class="mobile-menu-item" onclick="window.responsiveManager.navigateAndClose('dashboard')">
                        <span class="menu-icon">📊</span>
                        <span class="menu-text">Дашборд</span>
                    </a>
                    <a href="#characters" class="mobile-menu-item" onclick="window.responsiveManager.navigateAndClose('characters')">
                        <span class="menu-icon">👤</span>
                        <span class="menu-text">Персонажи</span>
                    </a>
                    <a href="#raids" class="mobile-menu-item" onclick="window.responsiveManager.navigateAndClose('raids')">
                        <span class="menu-icon">⚔️</span>
                        <span class="menu-text">Рейды</span>
                    </a>
                    <a href="#chat" class="mobile-menu-item" onclick="window.responsiveManager.navigateAndClose('chat')">
                        <span class="menu-icon">💬</span>
                        <span class="menu-text">Чат</span>
                    </a>
                    <a href="#tools" class="mobile-menu-item" onclick="window.responsiveManager.navigateAndClose('tools')">
                        <span class="menu-icon">🛠️</span>
                        <span class="menu-text">Инструменты</span>
                    </a>
                    <a href="#settings" class="mobile-menu-item" onclick="window.responsiveManager.navigateAndClose('settings')">
                        <span class="menu-icon">⚙️</span>
                        <span class="menu-text">Настройки</span>
                    </a>
                </nav>
                <div class="mobile-menu-footer">
                    <div class="mobile-menu-user">
                        <div class="user-avatar">👤</div>
                        <div class="user-info">
                            <div class="user-name">Пользователь</div>
                            <div class="user-status">Онлайн</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.mobileMenu);
        
        // Добавляем кнопку мобильного меню в header
        this.createMobileMenuButton();
    }

    createMobileMenuButton() {
        const header = document.querySelector('header') || document.querySelector('.header');
        if (header) {
            const menuButton = document.createElement('button');
            menuButton.className = 'mobile-menu-toggle';
            menuButton.innerHTML = '☰';
            menuButton.onclick = () => this.toggleMobileMenu();
            
            header.insertBefore(menuButton, header.firstChild);
        }
    }

    toggleMobileMenu() {
        if (!this.mobileMenu) return;
        
        const isOpen = this.mobileMenu.classList.contains('open');
        
        if (isOpen) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }

    openMobileMenu() {
        if (!this.mobileMenu) return;
        
        this.mobileMenu.classList.add('open');
        document.body.classList.add('mobile-menu-open');
        
        // Анимация открытия
        if (this.settings.enableReducedMotion) {
            this.mobileMenu.style.transform = 'translateX(0)';
        } else {
            this.mobileMenu.style.transform = 'translateX(0)';
        }
        
        // Уведомляем другие модули
        this.notifyModules('mobileMenuOpened', {});
    }

    closeMobileMenu() {
        if (!this.mobileMenu) return;
        
        this.mobileMenu.classList.remove('open');
        document.body.classList.remove('mobile-menu-open');
        
        // Анимация закрытия
        if (this.settings.enableReducedMotion) {
            this.mobileMenu.style.transform = 'translateX(-100%)';
        } else {
            this.mobileMenu.style.transform = 'translateX(-100%)';
        }
        
        // Уведомляем другие модули
        this.notifyModules('mobileMenuClosed', {});
    }

    navigateAndClose(page) {
        // Закрываем мобильное меню
        this.closeMobileMenu();
        
        // Навигация
        if (window.navigation && typeof window.navigation.navigateTo === 'function') {
            window.navigation.navigateTo(page);
        } else if (window.location) {
            window.location.hash = `#${page}`;
        }
    }

    setupTouchGestures() {
        if (!this.settings.enableTouchGestures) return;
        
        // Swipe для навигации
        if (this.settings.enableSwipeNavigation) {
            this.setupSwipeNavigation();
        }
        
        // Touch для мобильного меню
        this.setupTouchMenu();
        
        // Pinch to zoom (если нужно)
        this.setupPinchZoom();
    }

    setupSwipeNavigation() {
        let startX = 0;
        let startY = 0;
        let endX = 0;
        let endY = 0;
        
        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, { passive: true });
        
        document.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            endY = e.changedTouches[0].clientY;
            
            this.handleSwipe(startX, startY, endX, endY);
        }, { passive: true });
    }

    handleSwipe(startX, startY, endX, endY) {
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        const minSwipeDistance = 50;
        
        // Определяем направление свайпа
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
            if (deltaX > 0) {
                // Свайп вправо - открываем мобильное меню
                if (this.isMobile && this.mobileMenu) {
                    this.openMobileMenu();
                }
            } else {
                // Свайп влево - закрываем мобильное меню
                if (this.isMobile && this.mobileMenu) {
                    this.closeMobileMenu();
                }
            }
        }
    }

    setupTouchMenu() {
        if (!this.mobileMenu) return;
        
        let startX = 0;
        let currentX = 0;
        
        this.mobileMenu.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        }, { passive: true });
        
        this.mobileMenu.addEventListener('touchmove', (e) => {
            currentX = e.touches[0].clientX;
            const deltaX = currentX - startX;
            
            // Ограничиваем движение
            if (deltaX < 0) {
                this.mobileMenu.style.transform = `translateX(${deltaX}px)`;
            }
        }, { passive: true });
        
        this.mobileMenu.addEventListener('touchend', () => {
            const deltaX = currentX - startX;
            
            if (deltaX < -100) {
                // Закрываем меню если свайп достаточно длинный
                this.closeMobileMenu();
            } else {
                // Возвращаем в исходное положение
                this.mobileMenu.style.transform = 'translateX(0)';
            }
        }, { passive: true });
    }

    setupPinchZoom() {
        // Базовая поддержка pinch to zoom
        let initialDistance = 0;
        let currentScale = 1;
        
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                initialDistance = this.getDistance(e.touches[0], e.touches[1]);
            }
        }, { passive: true });
        
        document.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2) {
                const currentDistance = this.getDistance(e.touches[0], e.touches[1]);
                const scale = currentDistance / initialDistance;
                
                if (scale > 0.5 && scale < 3) {
                    currentScale = scale;
                    this.applyPinchZoom(currentScale);
                }
            }
        }, { passive: true });
    }

    getDistance(touch1, touch2) {
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    applyPinchZoom(scale) {
        // Применяем масштабирование к контенту
        const content = document.querySelector('.main-content') || document.body;
        content.style.transform = `scale(${scale})`;
        content.style.transformOrigin = 'center top';
    }

    setupResizeObserver() {
        this.resizeObserver = new ResizeObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.target.classList.contains('responsive-element')) {
                    this.handleElementResize(entry);
                }
            });
        });
        
        // Наблюдаем за элементами с классом responsive-element
        const responsiveElements = document.querySelectorAll('.responsive-element');
        responsiveElements.forEach(element => {
            this.resizeObserver.observe(element);
        });
    }

    handleElementResize(entry) {
        const element = entry.target;
        const { width, height } = entry.contentRect;
        
        // Адаптируем элемент под новый размер
        this.adaptElement(element, width, height);
    }

    adaptElement(element, width, height) {
        // Адаптация элементов под размер
        if (width < this.breakpoints.mobile) {
            element.classList.add('mobile-layout');
            element.classList.remove('tablet-layout', 'desktop-layout');
        } else if (width < this.breakpoints.tablet) {
            element.classList.add('tablet-layout');
            element.classList.remove('mobile-layout', 'desktop-layout');
        } else {
            element.classList.add('desktop-layout');
            element.classList.remove('mobile-layout', 'tablet-layout');
        }
    }

    applyResponsiveClasses() {
        // Применяем CSS классы для текущего breakpoint
        document.documentElement.className = document.documentElement.className
            .replace(/breakpoint-\w+/g, '')
            .replace(/device-\w+/g, '')
            .replace(/orientation-\w+/g, '');
        
        document.documentElement.classList.add(
            `breakpoint-${this.currentBreakpoint}`,
            `device-${this.deviceType}`,
            `orientation-${this.orientation}`
        );
        
        // Применяем классы к body
        document.body.className = document.body.className
            .replace(/is-mobile|is-tablet|is-desktop|is-wide/g, '')
            .replace(/is-portrait|is-landscape/g, '');
        
        document.body.classList.add(
            `is-${this.currentBreakpoint}`,
            this.isPortrait ? 'is-portrait' : 'is-landscape'
        );
    }

    optimizeForDevice() {
        if (this.isMobile) {
            this.optimizeForMobile();
        } else if (this.isTablet) {
            this.optimizeForTablet();
        } else if (this.isDesktop) {
            this.optimizeForDesktop();
        } else if (this.isWide) {
            this.optimizeForWide();
        }
    }

    optimizeForMobile() {
        // Оптимизации для мобильных устройств
        this.enableTouchOptimizations();
        this.optimizeImages();
        this.optimizeAnimations();
        this.optimizeLayout();
    }

    optimizeForTablet() {
        // Оптимизации для планшетов
        if (this.settings.tabletLayout === 'mobile') {
            this.optimizeForMobile();
        } else if (this.settings.tabletLayout === 'desktop') {
            this.optimizeForDesktop();
        } else {
            // Адаптивный режим
            this.adaptLayoutForTablet();
        }
    }

    optimizeForDesktop() {
        // Оптимизации для десктопа
        this.disableTouchOptimizations();
        this.enableHoverEffects();
        this.optimizeForLargeScreens();
    }

    optimizeForWide() {
        // Оптимизации для широких экранов
        this.optimizeForDesktop();
        this.enableWideLayout();
    }

    enableTouchOptimizations() {
        // Включаем touch-оптимизации
        document.body.classList.add('touch-optimized');
        
        // Увеличиваем размер touch-целей
        const touchTargets = document.querySelectorAll('button, a, input, select');
        touchTargets.forEach(target => {
            target.classList.add('touch-target');
        });
    }

    disableTouchOptimizations() {
        // Отключаем touch-оптимизации
        document.body.classList.remove('touch-optimized');
        
        // Возвращаем нормальный размер элементов
        const touchTargets = document.querySelectorAll('.touch-target');
        touchTargets.forEach(target => {
            target.classList.remove('touch-target');
        });
    }

    enableHoverEffects() {
        // Включаем hover-эффекты для десктопа
        document.body.classList.add('hover-enabled');
    }

    optimizeImages() {
        // Оптимизация изображений для мобильных устройств
        if (this.isMobile && this.settings.enableHighDPI) {
            const images = document.querySelectorAll('img');
            images.forEach(img => {
                if (img.dataset.mobileSrc) {
                    img.src = img.dataset.mobileSrc;
                }
            });
        }
    }

    optimizeAnimations() {
        // Оптимизация анимаций для мобильных устройств
        if (this.isMobile && this.settings.enableReducedMotion) {
            document.body.classList.add('reduced-motion');
        } else {
            document.body.classList.remove('reduced-motion');
        }
    }

    optimizeLayout() {
        // Оптимизация layout для мобильных устройств
        const containers = document.querySelectorAll('.container, .content-wrapper');
        containers.forEach(container => {
            container.classList.add('mobile-optimized');
        });
    }

    adaptLayoutForTablet() {
        // Адаптация layout для планшетов
        const containers = document.querySelectorAll('.container, .content-wrapper');
        containers.forEach(container => {
            container.classList.add('tablet-optimized');
        });
    }

    switchToMobileLayout() {
        // Переключение на мобильный layout
        document.body.classList.add('mobile-layout');
        document.body.classList.remove('tablet-layout', 'desktop-layout');
        
        // Адаптируем навигацию
        this.adaptNavigationForMobile();
    }

    switchToTabletLayout() {
        // Переключение на планшетный layout
        document.body.classList.add('tablet-layout');
        document.body.classList.remove('mobile-layout', 'desktop-layout');
        
        // Адаптируем навигацию
        this.adaptNavigationForTablet();
    }

    switchToDesktopLayout() {
        // Переключение на десктопный layout
        document.body.classList.add('desktop-layout');
        document.body.classList.remove('mobile-layout', 'tablet-layout');
        
        // Возвращаем десктопную навигацию
        this.restoreDesktopNavigation();
    }

    adaptNavigationForMobile() {
        // Адаптация навигации для мобильных устройств
        const nav = document.querySelector('nav') || document.querySelector('.navigation');
        if (nav) {
            nav.classList.add('mobile-nav');
            nav.classList.remove('desktop-nav', 'tablet-nav');
        }
    }

    adaptNavigationForTablet() {
        // Адаптация навигации для планшетов
        const nav = document.querySelector('nav') || document.querySelector('.navigation');
        if (nav) {
            nav.classList.add('tablet-nav');
            nav.classList.remove('mobile-nav', 'desktop-nav');
        }
    }

    restoreDesktopNavigation() {
        // Восстановление десктопной навигации
        const nav = document.querySelector('nav') || document.querySelector('.navigation');
        if (nav) {
            nav.classList.add('desktop-nav');
            nav.classList.remove('mobile-nav', 'tablet-nav');
        }
    }

    updateMobileMenu() {
        if (!this.mobileMenu) return;
        
        // Обновляем позицию и размер мобильного меню
        if (this.isMobile) {
            this.mobileMenu.style.display = 'block';
        } else {
            this.mobileMenu.style.display = 'none';
        }
    }

    updateResponsiveState() {
        // Обновляем состояние responsive
        this.detectDevice();
        this.applyResponsiveClasses();
        this.optimizeForDevice();
        this.updateMobileMenu();
    }

    // Утилиты
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    notifyModules(event, data) {
        const customEvent = new CustomEvent(`responsive:${event}`, { detail: data });
        window.dispatchEvent(customEvent);
    }

    // Публичные методы
    getCurrentBreakpoint() {
        return this.currentBreakpoint;
    }

    isBreakpoint(breakpoint) {
        return this.currentBreakpoint === breakpoint;
    }

    isMobileDevice() {
        return this.isMobile;
    }

    isTabletDevice() {
        return this.isTablet;
    }

    isDesktopDevice() {
        return this.isDesktop;
    }

    getDeviceType() {
        return this.deviceType;
    }

    getOrientation() {
        return this.orientation;
    }

    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.saveSettings();
        
        // Применяем новые настройки
        if (newSettings.enableTouchGestures !== undefined) {
            if (newSettings.enableTouchGestures) {
                this.setupTouchGestures();
            }
        }
        
        if (newSettings.enableMobileOptimization !== undefined) {
            this.optimizeForDevice();
        }
    }

    // Остановка модуля
    stop() {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
        
        if (this.mobileMenu && this.mobileMenu.parentElement) {
            this.mobileMenu.remove();
        }
        
        console.log('ResponsiveManager: Остановлен');
    }

    // Перезапуск модуля
    restart() {
        this.stop();
        this.init();
        console.log('ResponsiveManager: Перезапущен');
    }
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    window.responsiveManager = new ResponsiveManager();
});

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResponsiveManager;
}