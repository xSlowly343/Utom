/**
 * Animation Manager
 * Управляет анимациями и визуальными эффектами приложения
 */

class AnimationManager {
    constructor() {
        this.settings = {
            enableAnimations: true,
            enableTransitions: true,
            enableKeyframes: true,
            enableParallax: true,
            enableScrollAnimations: true,
            enableHoverEffects: true,
            enableLoadingAnimations: true,
            enablePageTransitions: true,
            animationDuration: 'normal', // fast, normal, slow
            animationEasing: 'ease-out', // ease, ease-in, ease-out, ease-in-out
            reducedMotion: false
        };
        
        this.animations = new Map();
        this.activeAnimations = new Map();
        this.intersectionObserver = null;
        this.scrollAnimations = new Map();
        this.parallaxElements = new Map();
        
        this.init();
    }

    init() {
        this.loadSettings();
        this.setupAnimationSystem();
        this.setupEventListeners();
        this.createDefaultAnimations();
        this.setupIntersectionObserver();
        this.setupScrollAnimations();
        console.log('AnimationManager: Инициализирован');
    }

    loadSettings() {
        try {
            const savedSettings = localStorage.getItem('animationSettings');
            if (savedSettings) {
                this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
            }
        } catch (error) {
            console.warn('AnimationManager: Ошибка загрузки настроек:', error);
        }
    }

    saveSettings() {
        try {
            localStorage.setItem('animationSettings', JSON.stringify(this.settings));
        } catch (error) {
            console.warn('AnimationManager: Ошибка сохранения настроек:', error);
        }
    }

    setupAnimationSystem() {
        // Применяем настройки анимаций
        this.applyAnimationSettings();
        
        // Создаем CSS переменные для анимаций
        this.createAnimationCSSVariables();
        
        // Проверяем поддержку reduced motion
        this.checkReducedMotionSupport();
    }

    setupEventListeners() {
        // Глобальные события анимаций
        window.addEventListener('animation:play', (event) => {
            const { name, element, options } = event.detail;
            this.playAnimation(name, element, options);
        });

        window.addEventListener('animation:stop', (event) => {
            const { name, element } = event.detail;
            this.stopAnimation(name, element);
        });

        window.addEventListener('animation:toggle', (event) => {
            const { name, element } = event.detail;
            this.toggleAnimation(name, element);
        });

        // События для page transitions
        if (this.settings.enablePageTransitions) {
            this.setupPageTransitionEvents();
        }

        // События для hover эффектов
        if (this.settings.enableHoverEffects) {
            this.setupHoverEvents();
        }

        // События для loading анимаций
        if (this.settings.enableLoadingAnimations) {
            this.setupLoadingEvents();
        }
    }

    setupPageTransitionEvents() {
        // Начало навигации
        window.addEventListener('navigation:start', () => {
            this.playPageTransition('out');
        });

        // Завершение навигации
        window.addEventListener('navigation:complete', () => {
            this.playPageTransition('in');
        });

        // Ошибка навигации
        window.addEventListener('navigation:error', () => {
            this.playPageTransition('error');
        });
    }

    setupHoverEvents() {
        // Hover эффекты для карточек
        document.addEventListener('mouseenter', (e) => {
            if (e.target.classList.contains('card')) {
                this.playHoverAnimation(e.target, 'enter');
            }
        }, true);

        document.addEventListener('mouseleave', (e) => {
            if (e.target.classList.contains('card')) {
                this.playHoverAnimation(e.target, 'leave');
            }
        }, true);

        // Hover эффекты для кнопок
        document.addEventListener('mouseenter', (e) => {
            if (e.target.classList.contains('btn')) {
                this.playButtonHover(e.target, 'enter');
            }
        }, true);

        document.addEventListener('mouseleave', (e) => {
            if (e.target.classList.contains('btn')) {
                this.playButtonHover(e.target, 'leave');
            }
        }, true);
    }

    setupLoadingEvents() {
        // Loading состояния для форм
        document.addEventListener('submit', (e) => {
            if (e.target.tagName === 'FORM') {
                this.playFormLoading(e.target);
            }
        });

        // Loading состояния для кнопок
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn') && e.target.type === 'submit') {
                this.playButtonLoading(e.target);
            }
        });
    }

    createDefaultAnimations() {
        // Fade анимации
        this.addAnimation('fadeIn', {
            keyframes: [
                { opacity: 0, transform: 'translateY(20px)' },
                { opacity: 1, transform: 'translateY(0)' }
            ],
            options: {
                duration: this.getAnimationDuration(),
                easing: this.settings.animationEasing,
                fill: 'forwards'
            }
        });

        this.addAnimation('fadeOut', {
            keyframes: [
                { opacity: 1, transform: 'translateY(0)' },
                { opacity: 0, transform: 'translateY(-20px)' }
            ],
            options: {
                duration: this.getAnimationDuration(),
                easing: this.settings.animationEasing,
                fill: 'forwards'
            }
        });

        // Slide анимации
        this.addAnimation('slideInLeft', {
            keyframes: [
                { transform: 'translateX(-100%)' },
                { transform: 'translateX(0)' }
            ],
            options: {
                duration: this.getAnimationDuration(),
                easing: this.settings.animationEasing,
                fill: 'forwards'
            }
        });

        this.addAnimation('slideInRight', {
            keyframes: [
                { transform: 'translateX(100%)' },
                { transform: 'translateX(0)' }
            ],
            options: {
                duration: this.getAnimationDuration(),
                easing: this.settings.animationEasing,
                fill: 'forwards'
            }
        });

        this.addAnimation('slideInUp', {
            keyframes: [
                { transform: 'translateY(100%)' },
                { transform: 'translateY(0)' }
            ],
            options: {
                duration: this.getAnimationDuration(),
                easing: this.settings.animationEasing,
                fill: 'forwards'
            }
        });

        this.addAnimation('slideInDown', {
            keyframes: [
                { transform: 'translateY(-100%)' },
                { transform: 'translateY(0)' }
            ],
            options: {
                duration: this.getAnimationDuration(),
                easing: this.settings.animationEasing,
                fill: 'forwards'
            }
        });

        // Scale анимации
        this.addAnimation('scaleIn', {
            keyframes: [
                { transform: 'scale(0)' },
                { transform: 'scale(1)' }
            ],
            options: {
                duration: this.getAnimationDuration(),
                easing: this.settings.animationEasing,
                fill: 'forwards'
            }
        });

        this.addAnimation('scaleOut', {
            keyframes: [
                { transform: 'scale(1)' },
                { transform: 'scale(0)' }
            ],
            options: {
                duration: this.getAnimationDuration(),
                easing: this.settings.animationEasing,
                fill: 'forwards'
            }
        });

        // Bounce анимации
        this.addAnimation('bounceIn', {
            keyframes: [
                { transform: 'scale(0.3)', opacity: 0 },
                { transform: 'scale(1.05)' },
                { transform: 'scale(0.9)' },
                { transform: 'scale(1.1)' },
                { transform: 'scale(1)', opacity: 1 }
            ],
            options: {
                duration: this.getAnimationDuration() * 1.5,
                easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                fill: 'forwards'
            }
        });

        // Rotate анимации
        this.addAnimation('rotateIn', {
            keyframes: [
                { transform: 'rotate(-200deg)', opacity: 0 },
                { transform: 'rotate(0deg)', opacity: 1 }
            ],
            options: {
                duration: this.getAnimationDuration(),
                easing: this.settings.animationEasing,
                fill: 'forwards'
            }
        });

        // Flip анимации
        this.addAnimation('flipInX', {
            keyframes: [
                { transform: 'perspective(400px) rotateX(90deg)', opacity: 0 },
                { transform: 'perspective(400px) rotateX(-20deg)' },
                { transform: 'perspective(400px) rotateX(10deg)' },
                { transform: 'perspective(400px) rotateX(-5deg)' },
                { transform: 'perspective(400px) rotateX(0deg)', opacity: 1 }
            ],
            options: {
                duration: this.getAnimationDuration() * 1.2,
                easing: 'ease-out',
                fill: 'forwards'
            }
        });

        // Page transition анимации
        this.addAnimation('pageTransitionOut', {
            keyframes: [
                { opacity: 1, transform: 'translateX(0)' },
                { opacity: 0, transform: 'translateX(-100%)' }
            ],
            options: {
                duration: 300,
                easing: 'ease-in-out',
                fill: 'forwards'
            }
        });

        this.addAnimation('pageTransitionIn', {
            keyframes: [
                { opacity: 0, transform: 'translateX(100%)' },
                { opacity: 1, transform: 'translateX(0)' }
            ],
            options: {
                duration: 300,
                easing: 'ease-in-out',
                fill: 'forwards'
            }
        });

        // Hover анимации
        this.addAnimation('cardHover', {
            keyframes: [
                { transform: 'translateY(0) scale(1)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
                { transform: 'translateY(-5px) scale(1.02)', boxShadow: '0 8px 25px rgba(0,0,0,0.15)' }
            ],
            options: {
                duration: 200,
                easing: 'ease-out',
                fill: 'forwards'
            }
        });

        this.addAnimation('buttonHover', {
            keyframes: [
                { transform: 'scale(1)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
                { transform: 'scale(1.05)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }
            ],
            options: {
                duration: 150,
                easing: 'ease-out',
                fill: 'forwards'
            }
        });

        // Loading анимации
        this.addAnimation('loadingSpin', {
            keyframes: [
                { transform: 'rotate(0deg)' },
                { transform: 'rotate(360deg)' }
            ],
            options: {
                duration: 1000,
                easing: 'linear',
                iterations: Infinity
            }
        });

        this.addAnimation('loadingPulse', {
            keyframes: [
                { opacity: 1, transform: 'scale(1)' },
                { opacity: 0.5, transform: 'scale(1.1)' },
                { opacity: 1, transform: 'scale(1)' }
            ],
            options: {
                duration: 1500,
                easing: 'ease-in-out',
                iterations: Infinity
            }
        });

        // Parallax анимации
        this.addAnimation('parallax', {
            keyframes: [
                { transform: 'translateY(0)' },
                { transform: 'translateY(-20px)' }
            ],
            options: {
                duration: 1000,
                easing: 'ease-out',
                fill: 'forwards'
            }
        });
    }

    setupIntersectionObserver() {
        if (!this.settings.enableScrollAnimations) return;

        this.intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.playScrollAnimation(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        // Наблюдаем за элементами с data-animate
        const animatedElements = document.querySelectorAll('[data-animate]');
        animatedElements.forEach(element => {
            this.intersectionObserver.observe(element);
        });
    }

    setupScrollAnimations() {
        if (!this.settings.enableScrollAnimations) return;

        // Parallax эффекты
        if (this.settings.enableParallax) {
            this.setupParallaxEffects();
        }

        // Scroll-triggered анимации
        this.setupScrollTriggeredAnimations();
    }

    setupParallaxEffects() {
        const parallaxElements = document.querySelectorAll('[data-parallax]');
        
        parallaxElements.forEach(element => {
            const speed = parseFloat(element.dataset.parallax) || 0.5;
            this.parallaxElements.set(element, { speed, originalY: 0 });
        });

        // Обработчик scroll для parallax
        window.addEventListener('scroll', () => {
            this.updateParallaxEffects();
        });
    }

    setupScrollTriggeredAnimations() {
        const scrollElements = document.querySelectorAll('[data-scroll-animate]');
        
        scrollElements.forEach(element => {
            const animation = element.dataset.scrollAnimate;
            const threshold = parseFloat(element.dataset.scrollThreshold) || 0.5;
            
            this.scrollAnimations.set(element, { animation, threshold });
        });
    }

    // Добавление анимации
    addAnimation(name, config) {
        if (this.animations.has(name)) {
            console.warn(`AnimationManager: Анимация ${name} уже существует`);
            return false;
        }

        this.animations.set(name, config);
        console.log(`AnimationManager: Добавлена анимация ${name}`);
        return true;
    }

    // Воспроизведение анимации
    playAnimation(name, element, options = {}) {
        if (!this.settings.enableAnimations) return;

        const animation = this.animations.get(name);
        if (!animation) {
            console.warn(`AnimationManager: Анимация ${name} не найдена`);
            return null;
        }

        // Проверяем reduced motion
        if (this.settings.reducedMotion) {
            return this.playReducedMotionAnimation(name, element, options);
        }

        // Создаем анимацию
        const animationInstance = element.animate(
            animation.keyframes,
            { ...animation.options, ...options }
        );

        // Сохраняем активную анимацию
        const animationId = `${name}-${Date.now()}`;
        this.activeAnimations.set(animationId, {
            name,
            element,
            instance: animationInstance
        });

        // Обработчик завершения
        animationInstance.onfinish = () => {
            this.activeAnimations.delete(animationId);
            
            // Уведомляем о завершении
            this.notifyModules('animationFinished', { name, element, options });
        };

        // Уведомляем о начале
        this.notifyModules('animationStarted', { name, element, options });

        return animationInstance;
    }

    // Воспроизведение анимации с reduced motion
    playReducedMotionAnimation(name, element, options = {}) {
        // Для reduced motion используем простые переходы
        const duration = 100; // Быстрая анимация
        
        element.style.transition = `opacity ${duration}ms ease-out`;
        
        if (name.includes('In')) {
            element.style.opacity = '0';
            setTimeout(() => {
                element.style.opacity = '1';
            }, 10);
        } else if (name.includes('Out')) {
            element.style.opacity = '1';
            setTimeout(() => {
                element.style.opacity = '0';
            }, 10);
        }

        // Очищаем transition после завершения
        setTimeout(() => {
            element.style.transition = '';
        }, duration + 50);

        return null;
    }

    // Остановка анимации
    stopAnimation(name, element) {
        const animationId = Array.from(this.activeAnimations.keys()).find(id => {
            const anim = this.activeAnimations.get(id);
            return anim.name === name && anim.element === element;
        });

        if (animationId) {
            const animation = this.activeAnimations.get(animationId);
            animation.instance.cancel();
            this.activeAnimations.delete(animationId);
            
            // Уведомляем об остановке
            this.notifyModules('animationStopped', { name, element });
        }
    }

    // Переключение анимации
    toggleAnimation(name, element) {
        const isPlaying = Array.from(this.activeAnimations.values()).some(anim => 
            anim.name === name && anim.element === element
        );

        if (isPlaying) {
            this.stopAnimation(name, element);
        } else {
            this.playAnimation(name, element);
        }
    }

    // Page transition анимации
    playPageTransition(type) {
        const mainContent = document.querySelector('main, .main-content, #mainContent');
        if (!mainContent) return;

        if (type === 'out') {
            this.playAnimation('pageTransitionOut', mainContent);
        } else if (type === 'in') {
            this.playAnimation('pageTransitionIn', mainContent);
        } else if (type === 'error') {
            // Анимация ошибки
            mainContent.style.animation = 'shake 0.5s ease-in-out';
            setTimeout(() => {
                mainContent.style.animation = '';
            }, 500);
        }
    }

    // Hover анимации
    playHoverAnimation(element, type) {
        if (type === 'enter') {
            this.playAnimation('cardHover', element);
        } else if (type === 'leave') {
            // Возвращаем к исходному состоянию
            element.style.transform = '';
            element.style.boxShadow = '';
        }
    }

    playButtonHover(element, type) {
        if (type === 'enter') {
            this.playAnimation('buttonHover', element);
        } else if (type === 'leave') {
            // Возвращаем к исходному состоянию
            element.style.transform = '';
            element.style.boxShadow = '';
        }
    }

    // Loading анимации
    playFormLoading(form) {
        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) {
            this.playButtonLoading(submitButton);
        }
    }

    playButtonLoading(button) {
        const originalText = button.textContent;
        const loadingText = button.dataset.loadingText || 'Загрузка...';
        
        // Добавляем loading класс
        button.classList.add('loading');
        button.disabled = true;
        
        // Меняем текст
        button.textContent = loadingText;
        
        // Добавляем spinner
        const spinner = document.createElement('span');
        spinner.className = 'loading-spinner';
        button.appendChild(spinner);
        
        // Воспроизводим анимацию
        this.playAnimation('loadingSpin', spinner);
        
        // Сохраняем состояние для восстановления
        button.dataset.originalText = originalText;
    }

    stopButtonLoading(button) {
        button.classList.remove('loading');
        button.disabled = false;
        button.textContent = button.dataset.originalText || button.textContent;
        
        const spinner = button.querySelector('.loading-spinner');
        if (spinner) {
            this.stopAnimation('loadingSpin', spinner);
            spinner.remove();
        }
    }

    // Scroll анимации
    playScrollAnimation(element) {
        const animationName = element.dataset.animate;
        if (!animationName) return;

        this.playAnimation(animationName, element);
        
        // Убираем data-animate после воспроизведения
        element.removeAttribute('data-animate');
        
        // Прекращаем наблюдение
        if (this.intersectionObserver) {
            this.intersectionObserver.unobserve(element);
        }
    }

    // Parallax эффекты
    updateParallaxEffects() {
        const scrollY = window.pageYOffset;
        
        this.parallaxElements.forEach((config, element) => {
            const { speed, originalY } = config;
            const newY = scrollY * speed;
            
            element.style.transform = `translateY(${newY}px)`;
        });
    }

    // Применение настроек анимаций
    applyAnimationSettings() {
        if (!this.settings.enableAnimations) {
            document.body.classList.add('no-animations');
        } else {
            document.body.classList.remove('no-animations');
        }

        if (this.settings.reducedMotion) {
            document.body.classList.add('reduced-motion');
        } else {
            document.body.classList.remove('reduced-motion');
        }
    }

    // Создание CSS переменных для анимаций
    createAnimationCSSVariables() {
        const root = document.documentElement;
        
        root.style.setProperty('--animation-duration-fast', '150ms');
        root.style.setProperty('--animation-duration-normal', '300ms');
        root.style.setProperty('--animation-duration-slow', '500ms');
        
        root.style.setProperty('--animation-easing-ease', 'ease');
        root.style.setProperty('--animation-easing-ease-in', 'ease-in');
        root.style.setProperty('--animation-easing-ease-out', 'ease-out');
        root.style.setProperty('--animation-easing-ease-in-out', 'ease-in-out');
    }

    // Проверка поддержки reduced motion
    checkReducedMotionSupport() {
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            
            if (mediaQuery.matches) {
                this.settings.reducedMotion = true;
                this.applyAnimationSettings();
            }
            
            mediaQuery.addEventListener('change', (e) => {
                this.settings.reducedMotion = e.matches;
                this.applyAnimationSettings();
            });
        }
    }

    // Получение длительности анимации
    getAnimationDuration() {
        switch (this.settings.animationDuration) {
            case 'fast': return 150;
            case 'slow': return 500;
            default: return 300;
        }
    }

    // Уведомление модулей
    notifyModules(event, data) {
        const customEvent = new CustomEvent(`animation:${event}`, { detail: data });
        window.dispatchEvent(customEvent);
    }

    // Публичные методы
    getAnimation(name) {
        return this.animations.get(name);
    }

    getAllAnimations() {
        return Array.from(this.animations.keys());
    }

    getActiveAnimations() {
        return Array.from(this.activeAnimations.values());
    }

    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.saveSettings();
        
        // Применяем новые настройки
        this.applyAnimationSettings();
        
        // Обновляем систему анимаций
        if (newSettings.enableScrollAnimations !== undefined) {
            if (newSettings.enableScrollAnimations) {
                this.setupIntersectionObserver();
                this.setupScrollAnimations();
            }
        }
    }

    // Остановка модуля
    stop() {
        // Останавливаем все активные анимации
        this.activeAnimations.forEach(animation => {
            animation.instance.cancel();
        });
        this.activeAnimations.clear();
        
        // Отключаем observers
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
        }
        
        console.log('AnimationManager: Остановлен');
    }

    // Перезапуск модуля
    restart() {
        this.stop();
        this.init();
        console.log('AnimationManager: Перезапущен');
    }
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    window.animationManager = new AnimationManager();
});

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnimationManager;
}