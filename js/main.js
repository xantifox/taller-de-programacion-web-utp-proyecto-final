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

// Components (se importarán según se necesiten)
// import ThemeToggle from './components/ThemeToggle.js';
// import ResponsiveMenu from './components/ResponsiveMenu.js';
// import FormValidator from './components/FormValidator.js';
// import Gallery from './components/Gallery.js';
// import Lightbox from './components/Lightbox.js';

// ===================================================================
// CONFIGURACIÓN GLOBAL
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
// CLASE PRINCIPAL DE LA APLICACIÓN
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

        // Inicializar cuando DOM esté listo
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
            this.log('🚀 Inicializando AcuarelaArte App...');

            // 1. Cargar módulos core (para todas las páginas)
            await this.loadCoreModules();

            // 2. Cargar módulos específicos de la página
            await this.loadPageModules();

            // 3. Inicializar event listeners globales
            this.initGlobalListeners();

            // 4. Aplicar tema guardado
            this.applyTheme(this.state.theme);

            // Marcar como inicializado
            this.state.isInitialized = true;

            this.log('✅ App inicializada correctamente');
            this.log(`📄 Página actual: ${this.state.currentPage}`);

            // Trigger evento custom
            document.dispatchEvent(new CustomEvent('appInitialized', {
                detail: { app: this, config: APP_CONFIG }
            }));

        } catch (error) {
            console.error('❌ Error inicializando aplicación:', error);
            this.handleInitError(error);
        }
    }

    /**
     * Carga módulos core (presentes en todas las páginas)
     */
    async loadCoreModules() {
        this.log('📦 Cargando módulos core...');

        // 1. Image Loader - Sistema de carga de imágenes
        if (APP_CONFIG.features.lazyLoading) {
            initImageLoader();
            
            // Precargar imágenes críticas
            const criticalImages = this.getCriticalImages();
            if (criticalImages.length > 0) {
                preloadCriticalImages(criticalImages);
            }
        }

        // 2. Theme Toggle - Control de temas (si el elemento existe)
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle && APP_CONFIG.features.darkMode) {
            // Importar dinámicamente solo si existe
            const { default: ThemeToggle } = await import('./components/ThemeToggle.js');
            this.modules.themeToggle = new ThemeToggle();
        }

        // 3. Responsive Menu - Menú hamburguesa (si el elemento existe)
        const menuToggle = document.getElementById('menuToggle');
        if (menuToggle) {
            const { default: ResponsiveMenu } = await import('./components/ResponsiveMenu.js');
            this.modules.responsiveMenu = new ResponsiveMenu();
        }

        this.log('✅ Módulos core cargados');
    }

    /**
     * Carga módulos específicos según la página actual
     */
    async loadPageModules() {
        this.log(`📄 Cargando módulos para: ${this.state.currentPage}`);

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
                this.log('⚠️ Página sin módulos específicos');
        }
    }

    /**
     * Módulos específicos para la página de inicio
     */
    async loadHomeModules() {
        this.log('🏠 Cargando módulos de Home...');
        
        // Animaciones de scroll
        this.initScrollAnimations();
        
        // Parallax suave si hay elementos con data-parallax
        const parallaxElements = document.querySelectorAll('[data-parallax]');
        if (parallaxElements.length > 0) {
            this.initParallax();
        }
    }

    /**
     * Módulos específicos para portafolio
     */
    async loadPortfolioModules() {
        this.log('🖼️ Cargando módulos de Portafolio...');
        
        // Galería con filtros
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
     * Módulos específicos para técnicas
     */
    async loadTechniquesModules() {
        this.log('📚 Cargando módulos de Técnicas...');
        
        // Acordeones para expandir técnicas
        this.initAccordions();
    }

    /**
     * Módulos específicos para progreso
     */
    async loadProgressModules() {
        this.log('📈 Cargando módulos de Progreso...');
        
        // Timeline interactiva si es necesario
        this.initTimeline();
    }

    /**
     * Módulos específicos para contacto
     */
    async loadContactModules() {
        this.log('📧 Cargando módulos de Contacto...');
        
        // Validación de formulario
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            const { default: FormValidator } = await import('./components/FormValidator.js');
            this.modules.formValidator = new FormValidator('contactForm');
        }
    }

    /**
     * Módulos específicos para materiales
     */
    async loadMaterialsModules() {
        this.log('🛒 Cargando módulos de Materiales...');
        
        // Tabla interactiva (ordenamiento, filtrado)
        // Se implementará con JavaScript vanilla en Issue #8
    }

    /**
     * Inicializa event listeners globales
     */
    initGlobalListeners() {
        // Smooth scroll para enlaces internos
        this.initSmoothScroll();

        // Manejo de errores de imágenes
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
     * Manejo global de errores de imágenes
     */
    handleImageErrors() {
        document.addEventListener('imageError', (e) => {
            this.log('⚠️ Error cargando imagen:', e.detail);
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
     * Parallax básico
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
     * Timeline básica
     */
    initTimeline() {
        // Animaciones de timeline si es necesario
        // Por ahora solo CSS
    }

    /**
     * Performance monitoring (solo desarrollo)
     */
    initPerformanceMonitoring() {
        // Log de estadísticas de carga de imágenes cada 5 segundos
        setInterval(() => {
            const stats = getLoadingStats();
            this.log('📊 Image Loading Stats:', stats);
        }, 5000);
    }

    /**
     * Obtiene la página actual
     */
    getCurrentPage() {
        const path = window.location.pathname;
        const page = path.split('/').pop().replace('.html', '') || 'index';
        return page;
    }

    /**
     * Obtiene imágenes críticas para precargar
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
            <p>⚠️ Error al cargar la aplicación. Por favor, recarga la página.</p>
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
// INICIALIZACIÓN
// ===================================================================

// Crear instancia global de la app
window.acuarelaArte = new AcuarelaArteApp();

// Export para uso en otros módulos si es necesario
export default AcuarelaArteApp;