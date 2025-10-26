/**
 * MAIN.JS - Archivo Principal de JavaScript
 * Orquesta toda la funcionalidad del proyecto AcuarelaArte
 * 
 * @version 1.0.0
 * @author AcuarelaArte Team
 */

// ===================================================================
// IMPORTS
// ===================================================================

// Utils
import { initImageLoader, preloadCriticalImages, getLoadingStats } from './utils/imageLoader.js';

// Components (se importarÃ¡n segÃºn se necesiten)
// import ThemeToggle from './components/ThemeToggle.js';
// import ResponsiveMenu from './components/ResponsiveMenu.js';
// import FormValidator from './components/FormValidator.js';
// import Gallery from './components/Gallery.js';
// import Lightbox from './components/Lightbox.js';

// ===================================================================
// CONFIGURACIÃ“N GLOBAL
// ===================================================================

const APP_CONFIG = {
    name: 'AcuarelaArte',
    version: '1.0.0',
    debug: window.location.hostname === 'localhost',
    features: {
        lazyLoading: true,
        darkMode: true,
        analytics: false
    }
};

// ===================================================================
// CLASE PRINCIPAL DE LA APLICACIÃ“N
// ===================================================================

class AcuarelaArteApp {
    constructor() {
        // Estado de la aplicación
        this.state = {
            isInitialized: false,
            currentPage: this.getCurrentPage(),
            theme: localStorage.getItem('theme') || 'light',
            menuOpen: false
        };

        // Módulos cargados
        this.modules = {
            themeToggle: null,
            responsiveMenu: null,
            gallery: null,
            lightbox: null,
            formValidator: null
        };

        // Inicializar cuando DOM estÃ© listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    /**
     * Inicialización principal de la aplicación
     */
    async init() {
        try {
            this.log('ðŸš€ Inicializando AcuarelaArte App...');

            // 1. Cargar módulos core (para todas las pÃ¡ginas)
            await this.loadCoreModules();

            // 2. Cargar módulos especÃ­ficos de la pÃ¡gina
            await this.loadPageModules();

            // 3. Inicializar event listeners globales
            this.initGlobalListeners();

            // 4. Aplicar tema guardado
            this.applyTheme(this.state.theme);

            // Marcar como inicializado
            this.state.isInitialized = true;

            // this.log('âœ… App inicializada correctamente');
            this.log(`ðŸ“„ PÃ¡gina actual: ${this.state.currentPage}`);

            // Trigger evento custom
            document.dispatchEvent(new CustomEvent('appInitialized', {
                detail: { app: this, config: APP_CONFIG }
            }));

        } catch (error) {
            console.error('âŒ Error inicializando aplicación:', error);
            this.handleInitError(error);
        }
    }

    /**
     * Carga módulos core (presentes en todas las pÃ¡ginas)
     */
    async loadCoreModules() {
        this.log('ðŸ“¦ Cargando módulos core...');

        // 1. Image Loader - Sistema de carga de imÃ¡genes
        if (APP_CONFIG.features.lazyLoading) {
            initImageLoader();
            
            // Precargar imÃ¡genes crÃ­ticas
            const criticalImages = this.getCriticalImages();
            if (criticalImages.length > 0) {
                preloadCriticalImages(criticalImages);
            }
        }

        // 2. Theme Toggle - Control de temas (si el elemento existe)
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle && APP_CONFIG.features.darkMode) {
            // Importar dinÃ¡micamente solo si existe
            const { default: ThemeToggle } = await import('./components/ThemeToggle.js');
            this.modules.themeToggle = new ThemeToggle();
        }

        // 3. Responsive Menu - MenÃº hamburguesa (si el elemento existe)
        // const menuToggle = document.getElementById('menuToggle');
        // if (menuToggle) {
        //     const { default: ResponsiveMenu } = await import('./components/ResponsiveMenu.js');
        //     this.modules.responsiveMenu = new ResponsiveMenu();
        // }

        this.log('âœ… Módulos core cargados');
    }

    /**
     * Carga módulos especÃ­ficos segÃºn la pÃ¡gina actual
     */
    async loadPageModules() {
        this.log(`ðŸ“„ Cargando módulos para: ${this.state.currentPage}`);

        switch (this.state.currentPage) {
            case 'index':
                await this.loadHomeModules();
                break;

            case 'portafolio':
                await this.loadPortfolioModules();
                break;

            case 'tecnicas':
                await this.loadTechniquesModules();
                break;

            case 'progreso':
                await this.loadProgressModules();
                break;

            case 'contacto':
                await this.loadContactModules();
                break;

            case 'materiales':
                await this.loadMaterialsModules();
                break;

            default:
                this.log('âš ï¸ PÃ¡gina sin módulos especÃ­ficos');
        }
    }

    /**
     * Módulos especÃ­ficos para la pÃ¡gina de inicio
     */
    async loadHomeModules() {
        this.log('ðŸ  Cargando módulos de Home...');
        
        // Animaciones de scroll
        this.initScrollAnimations();
        
        // Parallax suave si hay elementos con data-parallax
        const parallaxElements = document.querySelectorAll('[data-parallax]');
        if (parallaxElements.length > 0) {
            this.initParallax();
        }
    }

    /**
     * Módulos especÃ­ficos para portafolio
     */
    async loadPortfolioModules() {
        this.log('ðŸ–¼ï¸ Cargando módulos de Portafolio...');
        
        // GalerÃ­a con filtros
        const galleryElement = document.getElementById('galleryGrid');
        if (galleryElement) {
            const { default: Gallery } = await import('./components/Gallery.js');
            this.modules.gallery = new Gallery();
        }

        // Lightbox para visualización de obras
        const lightboxElement = document.getElementById('lightbox');
        if (lightboxElement) {
            const { default: Lightbox } = await import('./components/Lightbox.js');
            this.modules.lightbox = new Lightbox();
        }
    }

    /**
     * Módulos especÃ­ficos para tÃ©cnicas
     */
    async loadTechniquesModules() {
        this.log('ðŸ“š Cargando módulos de TÃ©cnicas...');
        
        // Acordeones para expandir tÃ©cnicas
        this.initAccordions();
    }

    /**
     * Módulos especÃ­ficos para progreso
     */
    async loadProgressModules() {
        this.log('ðŸ“ˆ Cargando módulos de Progreso...');
        
        // Timeline interactiva si es necesario
        this.initTimeline();
    }

    /**
     * Módulos especÃ­ficos para contacto
     */
    async loadContactModules() {
        this.log('ðŸ“§ Cargando módulos de Contacto...');
        
        // Validación de formulario
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            const { default: FormValidator } = await import('./components/FormValidator.js');
            this.modules.formValidator = new FormValidator('contactForm');
        }
    }

    /**
     * Módulos especÃ­ficos para materiales
     */
    async loadMaterialsModules() {
        this.log('ðŸ›’ Cargando módulos de Materiales...');
        
        // Tabla interactiva (ordenamiento, filtrado)
        // Se implementarÃ¡ con JavaScript vanilla en Issue #8
    }

    /**
     * Inicializa event listeners globales
     */
    initGlobalListeners() {
        // Smooth scroll para enlaces internos
        this.initSmoothScroll();

        // Manejo de errores de imÃ¡genes
        this.handleImageErrors();

        // Performance monitoring en desarrollo
        if (APP_CONFIG.debug) {
            this.initPerformanceMonitoring();
        }
    }

    /**
     * Inicializa smooth scroll
     */
    initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                
                // Ignorar si es solo "#"
                if (href === '#') return;
                
                e.preventDefault();
                const target = document.querySelector(href);
                
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    /**
     * Manejo global de errores de imÃ¡genes
     */
    handleImageErrors() {
        document.addEventListener('imageError', (e) => {
            this.log('âš ï¸ Error cargando imagen:', e.detail);
        });
    }

    /**
     * Animaciones de entrada con Intersection Observer
     */
    initScrollAnimations() {
        const elements = document.querySelectorAll('.fade-in-up');
        
        if (elements.length === 0) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        elements.forEach(el => observer.observe(el));
    }

    /**
     * Parallax bÃ¡sico
     */
    initParallax() {
        const parallaxElements = document.querySelectorAll('[data-parallax]');
        
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            
            parallaxElements.forEach(el => {
                const speed = parseFloat(el.dataset.parallax) || 0.5;
                const yPos = -(scrolled * speed);
                el.style.transform = `translateY(${yPos}px)`;
            });
        });
    }

    /**
     * Acordeones simples
     */
    initAccordions() {
        const accordionButtons = document.querySelectorAll('.expand-technique');
        
        accordionButtons.forEach(button => {
            button.addEventListener('click', () => {
                const content = button.previousElementSibling;
                const isExpanded = button.getAttribute('aria-expanded') === 'true';
                
                button.setAttribute('aria-expanded', !isExpanded);
                content.style.display = isExpanded ? 'none' : 'block';
                button.textContent = isExpanded ? 'Ver Tutorial Completo' : 'Ocultar Tutorial';
            });
        });
    }

    /**
     * Timeline bÃ¡sica
     */
    initTimeline() {
        // Animaciones de timeline si es necesario
        // Por ahora solo CSS
    }

    /**
     * Performance monitoring (solo desarrollo)
     */
    initPerformanceMonitoring() {
        // Log de estadÃ­sticas de carga de imÃ¡genes cada 5 segundos
        setInterval(() => {
            const stats = getLoadingStats();
            this.log('ðŸ“Š Image Loading Stats:', stats);
        }, 5000);
    }

    /**
     * Obtiene la pÃ¡gina actual
     */
    getCurrentPage() {
        const path = window.location.pathname;
        const page = path.split('/').pop().replace('.html', '') || 'index';
        return page;
    }

    /**
     * Obtiene imÃ¡genes crÃ­ticas para precargar
     */
    getCriticalImages() {
        const criticalImages = [];
        
        // Hero image si existe
        const heroImage = document.querySelector('.hero-img');
        if (heroImage && heroImage.dataset.src) {
            criticalImages.push(heroImage.dataset.src);
        }

        return criticalImages;
    }

    /**
     * Aplica tema
     */
    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.state.theme = theme;
    }

    /**
     * Manejo de error de inicialización
     */
    handleInitError(error) {
        // Mostrar mensaje de error amigable al usuario
        const errorDiv = document.createElement('div');
        errorDiv.className = 'init-error';
        errorDiv.innerHTML = `
            <p>âš ï¸ Error al cargar la aplicación. Por favor, recarga la pÃ¡gina.</p>
            <button onclick="location.reload()">Recargar</button>
        `;
        document.body.prepend(errorDiv);
    }

    /**
     * Logger condicional (solo en desarrollo)
     */
    log(...args) {
        if (APP_CONFIG.debug) {
            console.log('[AcuarelaArte]', ...args);
        }
    }

    /**
     * Limpieza de recursos
     */
    cleanup() {
        // Limpiar event listeners y observers
        Object.values(this.modules).forEach(module => {
            if (module && typeof module.cleanup === 'function') {
                module.cleanup();
            }
        });
    }
}

// ===================================================================
// INICIALIZACIÃ“N
// ===================================================================

// Crear instancia global de la app
window.acuarelaArte = new AcuarelaArteApp();

// Export para uso en otros módulos si es necesario
export default AcuarelaArteApp;