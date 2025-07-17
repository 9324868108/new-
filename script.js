// ========================================
// GLOBAL VARIABLES AND CONFIGURATION
// ========================================

const CONFIG = {
    animationDuration: 300,
    scrollThreshold: 100,
    counterSpeed: 2000,
    parallaxFactor: 0.5,
    debounceDelay: 100,
    lazyLoadMargin: '50px',
    breakpoints: {
        mobile: 480,
        tablet: 768,
        desktop: 1024,
        large: 1200
    }
};

// ========================================
// UTILITY FUNCTIONS
// ========================================

// Debounce function for performance optimization
function debounce(func, wait) {
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

// Throttle function for scroll events
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Get viewport dimensions
function getViewportDimensions() {
    return {
        width: window.innerWidth,
        height: window.innerHeight
    };
}

// Check if element is in viewport
function isInViewport(element, threshold = 0) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= -threshold &&
        rect.left >= -threshold &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + threshold &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth) + threshold
    );
}

// Smooth scroll to element
function smoothScrollTo(element, offset = 0) {
    const targetPosition = element.offsetTop - offset;
    window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
    });
}

// ========================================
// PRELOADER
// ========================================

class Preloader {
    constructor() {
        this.preloader = document.getElementById('preloader');
        this.loadingProgress = document.querySelector('.loading-progress');
        this.init();
    }

    init() {
        this.simulateLoading();
        this.setupEventListeners();
    }

    simulateLoading() {
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                setTimeout(() => this.hidePreloader(), 500);
            }
            this.updateProgress(progress);
        }, 200);
    }

    updateProgress(progress) {
        if (this.loadingProgress) {
            this.loadingProgress.style.width = `${progress}%`;
        }
    }

    hidePreloader() {
        if (this.preloader) {
            this.preloader.style.opacity = '0';
            setTimeout(() => {
                this.preloader.style.display = 'none';
                document.body.style.overflow = 'auto';
                this.triggerPageAnimations();
            }, 300);
        }
    }

    triggerPageAnimations() {
        // Initialize other animations after preloader
        AOS.init({
            duration: 800,
            easing: 'ease-out',
            once: true,
            offset: 100
        });
        
        // Trigger hero animations
        this.animateHeroElements();
    }

    animateHeroElements() {
        const heroTitle = document.querySelector('.hero-title');
        const heroSubtitle = document.querySelector('.hero-subtitle');
        const heroButtons = document.querySelector('.hero-cta');
        
        if (heroTitle) {
            gsap.from(heroTitle.children, {
                duration: 1,
                y: 50,
                opacity: 0,
                stagger: 0.2,
                ease: "power2.out"
            });
        }
        
        if (heroSubtitle) {
            gsap.from(heroSubtitle, {
                duration: 1,
                y: 30,
                opacity: 0,
                delay: 0.8,
                ease: "power2.out"
            });
        }
        
        if (heroButtons) {
            gsap.from(heroButtons.children, {
                duration: 1,
                y: 30,
                opacity: 0,
                stagger: 0.1,
                delay: 1,
                ease: "power2.out"
            });
        }
    }
}

// ========================================
// NAVIGATION
// ========================================

class Navigation {
    constructor() {
        this.navbar = document.getElementById('navbar');
        this.hamburger = document.getElementById('hamburger');
        this.navMenu = document.getElementById('nav-menu');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.lastScrollY = window.scrollY;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.handleScroll();
    }

    setupEventListeners() {
        // Hamburger menu toggle
        if (this.hamburger) {
            this.hamburger.addEventListener('click', () => this.toggleMobileMenu());
        }

        // Navigation links
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleNavClick(e));
        });

        // Scroll events
        window.addEventListener('scroll', throttle(() => this.handleScroll(), 16));
        window.addEventListener('resize', debounce(() => this.handleResize(), 100));
    }

    toggleMobileMenu() {
        this.hamburger.classList.toggle('active');
        this.navMenu.classList.toggle('active');
        
        // Prevent body scroll when menu is open
        if (this.navMenu.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    }

    handleNavClick(e) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            smoothScrollTo(targetElement, 80);
            this.closeMobileMenu();
        }
    }

    closeMobileMenu() {
        this.hamburger.classList.remove('active');
        this.navMenu.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    handleScroll() {
        const currentScrollY = window.scrollY;
        
        // Add/remove scrolled class
        if (currentScrollY > 50) {
            this.navbar.classList.add('scrolled');
        } else {
            this.navbar.classList.remove('scrolled');
        }
        
        // Hide/show navbar on scroll
        if (currentScrollY > this.lastScrollY && currentScrollY > 100) {
            this.navbar.style.transform = 'translateY(-100%)';
        } else {
            this.navbar.style.transform = 'translateY(0)';
        }
        
        this.lastScrollY = currentScrollY;
        this.updateActiveNavLink();
    }

    updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.scrollY + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                this.navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    handleResize() {
        if (window.innerWidth > CONFIG.breakpoints.tablet) {
            this.closeMobileMenu();
        }
    }
}

// ========================================
// HERO SECTION ANIMATIONS
// ========================================

class HeroAnimations {
    constructor() {
        this.heroSection = document.querySelector('.hero');
        this.floatingElements = document.querySelectorAll('.float-element');
        this.heroCards = document.querySelectorAll('.hero-card');
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.animateFloatingElements();
        this.setupParallax();
    }

    setupEventListeners() {
        window.addEventListener('scroll', throttle(() => this.handleScroll(), 16));
        window.addEventListener('mousemove', throttle((e) => this.handleMouseMove(e), 16));
    }

    animateFloatingElements() {
        this.floatingElements.forEach((element, index) => {
            gsap.to(element, {
                duration: 4 + index,
                y: "random(-20, 20)",
                rotation: "random(-15, 15)",
                repeat: -1,
                yoyo: true,
                ease: "power2.inOut",
                delay: index * 0.5
            });
        });
    }

    setupParallax() {
        if (window.innerWidth > CONFIG.breakpoints.tablet) {
            gsap.registerPlugin(ScrollTrigger);
            
            gsap.to('.hero-background', {
                scrollTrigger: {
                    trigger: '.hero',
                    start: 'top top',
                    end: 'bottom top',
                    scrub: true
                },
                y: '50%',
                ease: 'none'
            });
        }
    }

    handleScroll() {
        const scrollY = window.scrollY;
        
        // Parallax effect for hero cards
        this.heroCards.forEach((card, index) => {
            const speed = 0.5 + (index * 0.2);
            const yPos = scrollY * speed;
            card.style.transform = `translateY(${yPos}px)`;
        });
    }

    handleMouseMove(e) {
        if (window.innerWidth > CONFIG.breakpoints.tablet) {
            const mouseX = e.clientX / window.innerWidth;
            const mouseY = e.clientY / window.innerHeight;
            
            this.floatingElements.forEach((element, index) => {
                const speed = 0.1 + (index * 0.05);
                const x = (mouseX - 0.5) * speed * 100;
                const y = (mouseY - 0.5) * speed * 100;
                
                gsap.to(element, {
                    duration: 2,
                    x: x,
                    y: y,
                    ease: "power2.out"
                });
            });
        }
    }
}

// ========================================
// COUNTER ANIMATIONS
// ========================================

class CounterAnimations {
    constructor() {
        this.counters = document.querySelectorAll('[data-count]');
        this.init();
    }

    init() {
        this.setupIntersectionObserver();
    }

    setupIntersectionObserver() {
        const options = {
            threshold: 0.5,
            rootMargin: '0px 0px -100px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, options);

        this.counters.forEach(counter => {
            observer.observe(counter);
        });
    }

    animateCounter(element) {
        const target = parseInt(element.getAttribute('data-count'));
        const duration = CONFIG.counterSpeed;
        const startTime = performance.now();

        const updateCounter = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const currentValue = Math.floor(progress * target);
            element.textContent = currentValue;
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target;
            }
        };

        requestAnimationFrame(updateCounter);
    }
}

// ========================================
// SCROLL ANIMATIONS
// ========================================

class ScrollAnimations {
    constructor() {
        this.init();
    }

    init() {
        this.setupGSAPScrollTriggers();
        this.setupIntersectionObserver();
    }

    setupGSAPScrollTriggers() {
        if (typeof gsap !== 'undefined' && gsap.registerPlugin) {
            gsap.registerPlugin(ScrollTrigger);
            
            // Feature cards animation
            gsap.utils.toArray('.feature-card').forEach((card, index) => {
                gsap.from(card, {
                    scrollTrigger: {
                        trigger: card,
                        start: 'top 80%',
                        end: 'bottom 20%',
                        toggleActions: 'play none none reverse'
                    },
                    duration: 0.8,
                    y: 50,
                    opacity: 0,
                    delay: index * 0.1,
                    ease: "power2.out"
                });
            });
            
            // Pricing cards animation
            gsap.utils.toArray('.pricing-card').forEach((card, index) => {
                gsap.from(card, {
                    scrollTrigger: {
                        trigger: card,
                        start: 'top 80%',
                        end: 'bottom 20%',
                        toggleActions: 'play none none reverse'
                    },
                    duration: 0.8,
                    y: 50,
                    opacity: 0,
                    scale: 0.9,
                    delay: index * 0.1,
                    ease: "power2.out"
                });
            });
            
            // Steps animation
            gsap.utils.toArray('.step').forEach((step, index) => {
                const direction = index % 2 === 0 ? -100 : 100;
                
                gsap.from(step, {
                    scrollTrigger: {
                        trigger: step,
                        start: 'top 80%',
                        end: 'bottom 20%',
                        toggleActions: 'play none none reverse'
                    },
                    duration: 1,
                    x: direction,
                    opacity: 0,
                    ease: "power2.out"
                });
            });
        }
    }

    setupIntersectionObserver() {
        const options = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fadeInUp');
                }
            });
        }, options);

        // Observe elements that don't have GSAP animations
        const elementsToObserve = document.querySelectorAll('.section-title, .section-subtitle');
        elementsToObserve.forEach(element => {
            observer.observe(element);
        });
    }
}

// ========================================
// FAQ FUNCTIONALITY
// ========================================

class FAQ {
    constructor() {
        this.faqItems = document.querySelectorAll('.faq-item');
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            if (question) {
                question.addEventListener('click', () => this.toggleFAQ(item));
            }
        });
    }
    toggleFAQ(item) {
        const isActive = item.classList.contains('active');
        
        // Close all other FAQ items
        this.faqItems.forEach(faqItem => {
            if (faqItem !== item) {
                faqItem.classList.remove('active');
            }
        });
        
        // Toggle current item
        if (isActive) {
            item.classList.remove('active');
        } else {
            item.classList.add('active');
        }
    }
}

// ========================================
// MODAL FUNCTIONALITY
// ========================================

class Modal {
    constructor() {
        this.modals = document.querySelectorAll('.modal');
        this.modalTriggers = document.querySelectorAll('[data-modal]');
        this.modalCloses = document.querySelectorAll('.modal-close');
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Modal triggers
        this.modalTriggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                const modalId = trigger.getAttribute('data-modal');
                this.openModal(modalId);
            });
        });

        // Close buttons
        this.modalCloses.forEach(close => {
            close.addEventListener('click', () => {
                this.closeModal(close.closest('.modal'));
            });
        });

        // Click outside to close
        this.modals.forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal);
                }
            });
        });

        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Focus trap
            const focusableElements = modal.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            if (focusableElements.length > 0) {
                focusableElements[0].focus();
            }
        }
    }

    closeModal(modal) {
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    }

    closeAllModals() {
        this.modals.forEach(modal => this.closeModal(modal));
    }
}

// ========================================
// FORM HANDLING
// ========================================

class FormHandler {
    constructor() {
        this.forms = document.querySelectorAll('.contact-form, .newsletter-form');
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.forms.forEach(form => {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
            
            // Real-time validation
            const inputs = form.querySelectorAll('input, textarea');
            inputs.forEach(input => {
                input.addEventListener('blur', () => this.validateField(input));
                input.addEventListener('input', () => this.clearErrors(input));
            });
        });
    }

    handleSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        
        // Validate all fields
        const isValid = this.validateForm(form);
        
        if (isValid) {
            this.submitForm(form, formData);
        }
    }

    validateForm(form) {
        const inputs = form.querySelectorAll('input[required], textarea[required]');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });
        
        return isValid;
    }

    validateField(input) {
        const value = input.value.trim();
        const type = input.type;
        let isValid = true;
        let errorMessage = '';
        
        // Required field validation
        if (input.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'This field is required';
        }
        
        // Email validation
        if (type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
        }
        
        // Phone validation
        if (type === 'tel' && value) {
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            if (!phoneRegex.test(value.replace(/\s/g, ''))) {
                isValid = false;
                errorMessage = 'Please enter a valid phone number';
            }
        }
        
        // Display error
        this.displayFieldError(input, errorMessage);
        
        return isValid;
    }

    displayFieldError(input, message) {
        const errorElement = input.parentNode.querySelector('.error-message');
        
        if (message) {
            input.classList.add('error');
            if (errorElement) {
                errorElement.textContent = message;
                errorElement.style.display = 'block';
            }
        } else {
            input.classList.remove('error');
            if (errorElement) {
                errorElement.style.display = 'none';
            }
        }
    }

    clearErrors(input) {
        input.classList.remove('error');
        const errorElement = input.parentNode.querySelector('.error-message');
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    }

    async submitForm(form, formData) {
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        
        // Show loading state
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';
        
        try {
            // Simulate form submission
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Show success message
            this.showFormMessage(form, 'Thank you! Your message has been sent successfully.', 'success');
            form.reset();
            
        } catch (error) {
            // Show error message
            this.showFormMessage(form, 'Sorry, there was an error sending your message. Please try again.', 'error');
        } finally {
            // Reset button
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    }

    showFormMessage(form, message, type) {
        const messageElement = form.querySelector('.form-message') || this.createMessageElement(form);
        
        messageElement.textContent = message;
        messageElement.className = `form-message ${type}`;
        messageElement.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            messageElement.style.display = 'none';
        }, 5000);
    }

    createMessageElement(form) {
        const messageElement = document.createElement('div');
        messageElement.className = 'form-message';
        form.appendChild(messageElement);
        return messageElement;
    }
}

// ========================================
// LAZY LOADING
// ========================================

class LazyLoader {
    constructor() {
        this.images = document.querySelectorAll('img[data-src]');
        this.init();
    }

    init() {
        this.setupIntersectionObserver();
    }

    setupIntersectionObserver() {
        const options = {
            root: null,
            rootMargin: CONFIG.lazyLoadMargin,
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadImage(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, options);

        this.images.forEach(img => {
            observer.observe(img);
        });
    }

    loadImage(img) {
        const src = img.getAttribute('data-src');
        if (src) {
            img.src = src;
            img.removeAttribute('data-src');
            img.classList.add('loaded');
        }
    }
}

// ========================================
// BACK TO TOP BUTTON
// ========================================

class BackToTop {
    constructor() {
        this.button = document.getElementById('backToTop');
        this.init();
    }

    init() {
        if (this.button) {
            this.setupEventListeners();
        }
    }

    setupEventListeners() {
        window.addEventListener('scroll', throttle(() => this.handleScroll(), 100));
        this.button.addEventListener('click', () => this.scrollToTop());
    }

    handleScroll() {
        if (window.scrollY > CONFIG.scrollThreshold) {
            this.button.classList.add('show');
        } else {
            this.button.classList.remove('show');
        }
    }

    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
}

// ========================================
// TESTIMONIAL SLIDER
// ========================================

class TestimonialSlider {
    constructor() {
        this.slider = document.querySelector('.testimonial-slider');
        this.slides = document.querySelectorAll('.testimonial-slide');
        this.prevBtn = document.querySelector('.slider-prev');
        this.nextBtn = document.querySelector('.slider-next');
        this.indicators = document.querySelectorAll('.slider-indicator');
        this.currentSlide = 0;
        this.autoplayInterval = null;
        this.init();
    }

    init() {
        if (this.slider && this.slides.length > 0) {
            this.setupEventListeners();
            this.showSlide(0);
            this.startAutoplay();
        }
    }

    setupEventListeners() {
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.previousSlide());
        }
        
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.nextSlide());
        }
        
        this.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => this.goToSlide(index));
        });
        
        // Pause autoplay on hover
        this.slider.addEventListener('mouseenter', () => this.stopAutoplay());
        this.slider.addEventListener('mouseleave', () => this.startAutoplay());
        
        // Touch/swipe support
        this.setupTouchEvents();
    }

    setupTouchEvents() {
        let startX = 0;
        let endX = 0;
        
        this.slider.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        });
        
        this.slider.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            this.handleSwipe(startX, endX);
        });
    }

    handleSwipe(startX, endX) {
        const threshold = 50;
        const diff = startX - endX;
        
        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                this.nextSlide();
            } else {
                this.previousSlide();
            }
        }
    }

    showSlide(index) {
        this.slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });
        
        this.indicators.forEach((indicator, i) => {
            indicator.classList.toggle('active', i === index);
        });
        
        this.currentSlide = index;
    }

    nextSlide() {
        const nextIndex = (this.currentSlide + 1) % this.slides.length;
        this.showSlide(nextIndex);
    }

    previousSlide() {
        const prevIndex = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
        this.showSlide(prevIndex);
    }

    goToSlide(index) {
        this.showSlide(index);
    }

    startAutoplay() {
        this.autoplayInterval = setInterval(() => {
            this.nextSlide();
        }, 5000);
    }

    stopAutoplay() {
        if (this.autoplayInterval) {
            clearInterval(this.autoplayInterval);
            this.autoplayInterval = null;
        }
    }
}

// ========================================
// PRICING PLAN SELECTOR
// ========================================

class PricingSelector {
    constructor() {
        this.toggles = document.querySelectorAll('.pricing-toggle');
        this.prices = document.querySelectorAll('.plan-price');
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.toggles.forEach(toggle => {
            toggle.addEventListener('change', (e) => {
                this.updatePricing(e.target.checked);
            });
        });
    }

    updatePricing(isYearly) {
        this.prices.forEach(price => {
            const monthly = price.getAttribute('data-monthly');
            const yearly = price.getAttribute('data-yearly');
            
            if (monthly && yearly) {
                price.textContent = isYearly ? yearly : monthly;
            }
        });
    }
}

// ========================================
// PERFORMANCE MONITORING
// ========================================

class PerformanceMonitor {
    constructor() {
        this.init();
    }

    init() {
        this.measurePageLoad();
        this.setupPerformanceObserver();
    }

    measurePageLoad() {
        window.addEventListener('load', () => {
            const navigation = performance.getEntriesByType('navigation')[0];
            const loadTime = navigation.loadEventEnd - navigation.fetchStart;
            
            console.log(`Page load time: ${loadTime}ms`);
            
            // Report to analytics if needed
            if (typeof gtag !== 'undefined') {
                gtag('event', 'page_load_time', {
                    custom_parameter: loadTime
                });
            }
        });
    }

    setupPerformanceObserver() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.entryType === 'largest-contentful-paint') {
                        console.log(`LCP: ${entry.startTime}ms`);
                    }
                }
            });
            
            observer.observe({ entryTypes: ['largest-contentful-paint'] });
        }
    }
}

// ========================================
// THEME SWITCHER
// ========================================

class ThemeSwitcher {
    constructor() {
        this.themeToggle = document.querySelector('.theme-toggle');
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme);
        this.setupEventListeners();
    }

    setupEventListeners() {
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(this.currentTheme);
        localStorage.setItem('theme', this.currentTheme);
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        
        if (this.themeToggle) {
            const icon = this.themeToggle.querySelector('i');
            if (icon) {
                icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
            }
        }
    }
}

// ========================================
// ACCESSIBILITY ENHANCEMENTS
// ========================================

class AccessibilityEnhancements {
    constructor() {
        this.init();
    }

    init() {
        this.setupKeyboardNavigation();
        this.setupFocusManagement();
        this.setupScreenReaderSupport();
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // ESC key functionality
            if (e.key === 'Escape') {
                this.closeAllDropdowns();
                this.closeAllModals();
            }
            
            // Tab navigation for custom elements
            if (e.key === 'Tab') {
                this.handleTabNavigation(e);
            }
        });
    }

    setupFocusManagement() {
        // Focus indicators
        const focusableElements = document.querySelectorAll(
            'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
        );
        
        focusableElements.forEach(element => {
            element.addEventListener('focus', () => {
                element.setAttribute('data-focus-visible', 'true');
            });
            
            element.addEventListener('blur', () => {
                element.removeAttribute('data-focus-visible');
            });
        });
    }

    setupScreenReaderSupport() {
        // Dynamic content announcements
        const announcer = document.createElement('div');
        announcer.setAttribute('aria-live', 'polite');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.className = 'sr-only';
        document.body.appendChild(announcer);
        
        this.announcer = announcer;
    }

    announce(message) {
        if (this.announcer) {
            this.announcer.textContent = message;
            setTimeout(() => {
                this.announcer.textContent = '';
            }, 1000);
        }
    }

    closeAllDropdowns() {
        const dropdowns = document.querySelectorAll('.dropdown.active');
        dropdowns.forEach(dropdown => {
            dropdown.classList.remove('active');
        });
    }

    closeAllModals() {
        const modals = document.querySelectorAll('.modal.active');
        modals.forEach(modal => {
            modal.classList.remove('active');
        });
    }

    handleTabNavigation(e) {
        const focusableElements = Array.from(document.querySelectorAll(
            'a:not([disabled]), button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ));
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                lastElement.focus();
                e.preventDefault();
            }
        } else {
            if (document.activeElement === lastElement) {
                firstElement.focus();
                e.preventDefault();
            }
        }
    }
}

// ========================================
// MAIN APPLICATION INITIALIZATION
// ========================================

class XworkApp {
    constructor() {
        this.components = [];
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeComponents());
        } else {
            this.initializeComponents();
        }
    }

    initializeComponents() {
        try {
            // Initialize all components
            this.components.push(new Preloader());
            this.components.push(new Navigation());
            this.components.push(new HeroAnimations());
            this.components.push(new CounterAnimations());
            this.components.push(new ScrollAnimations());
            this.components.push(new FAQ());
            this.components.push(new Modal());
            this.components.push(new FormHandler());
            this.components.push(new LazyLoader());
            this.components.push(new BackToTop());
            this.components.push(new TestimonialSlider());
            this.components.push(new PricingSelector());
            this.components.push(new PerformanceMonitor());
            this.components.push(new ThemeSwitcher());
            this.components.push(new AccessibilityEnhancements());
            
            console.log('Xwork application initialized successfully');
            
        } catch (error) {
            console.error('Error initializing Xwork application:', error);
        }
    }

    destroy() {
        // Cleanup function for components
        this.components.forEach(component => {
            if (component.destroy && typeof component.destroy === 'function') {
                component.destroy();
            }
        });
        
        this.components = [];
    }
}

// ========================================
// UTILITY FUNCTIONS FOR EXTERNAL USE
// ========================================

// Export utilities for external scripts
window.XworkUtils = {
    debounce,
    throttle,
    isInViewport,
    smoothScrollTo,
    getViewportDimensions
};

// ========================================
// INITIALIZE APPLICATION
// ========================================

// Initialize the application
const xworkApp = new XworkApp();

// Global error handling
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
});

// Unhandled promise rejection handling
window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
});

// Performance monitoring
if ('performance' in window) {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            console.log('Performance metrics:', {
                DNS: perfData.domainLookupEnd - perfData.domainLookupStart,
                TCP: perfData.connectEnd - perfData.connectStart,
                Request: perfData.responseStart - perfData.requestStart,
                Response: perfData.responseEnd - perfData.responseStart,
                DOM: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                Load: perfData.loadEventEnd - perfData.loadEventStart
            });
        }, 0);
    });
}

// Service Worker registration (if available)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}


