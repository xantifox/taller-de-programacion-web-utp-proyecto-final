/* js/pages/home.js */
// js/pages/home.js

/**
 * HOME.JS - Interacciones página principal
 * AcuarelaArte - Portafolio de Acuarelas
 * 
 * Funcionalidades:
 * - Animaciones de entrada al hacer scroll (Intersection Observer)
 * - Efectos parallax sutiles en cards
 * - Animaciones en hover mejoradas
 * - Lazy loading de imágenes
 * - Reducción de movimiento para accesibilidad
 */

class HomePage {
    constructor() {
        this.initScrollAnimations();
        this.initParallaxEffects();
        this.initHoverInteractions();
        this.initLazyLoading();
        this.checkReducedMotion();
        
        console.log('✅ HomePage inicializado');
    }

    /**
     * Animaciones de entrada al hacer scroll
     * Usa Intersection Observer para detectar elementos visibles
     */
    initScrollAnimations() {
        // Configuración del observer
        const observerOptions = {
            threshold: 0.15, // 15% del elemento visible
            rootMargin: '0px 0px -50px 0px' // Trigger antes de que llegue al viewport
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    // Añadir clase de animación con delay escalonado
                    setTimeout(() => {
                        entry.target.classList.add('animate-in');
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, index * 100); // Delay de 100ms entre cada elemento
                    
                    // Dejar de observar una vez animado
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observar todos los elementos con clase fade-in-up
        const animatedElements = document.querySelectorAll('.fade-in-up');
        animatedElements.forEach(el => {
            // Estado inicial
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
            
            observer.observe(el);
        });

        // Observar highlight items
        const highlightItems = document.querySelectorAll('.highlight-item');
        highlightItems.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(40px)';
            el.style.transition = 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
            
            observer.observe(el);
        });
    }

    /**
     * Efectos parallax sutiles en hover
     * Aplica transformación 3D basada en la posición del mouse
     */
    initParallaxEffects() {
        const cards = document.querySelectorAll('.highlight-item, .philosophy-card');
        
        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                // Si el usuario prefiere reducir movimiento, no aplicar parallax
                if (this.prefersReducedMotion) return;
                
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = (y - centerY) / 20; // Dividir para suavizar
                const rotateY = (centerX - x) / 20;
                
                card.style.transform = `
                    perspective(1000px) 
                    rotateX(${rotateX}deg) 
                    rotateY(${rotateY}deg) 
                    translateY(-8px) 
                    scale(1.02)
                `;
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0) scale(1)';
            });
        });
    }

    /**
     * Interacciones mejoradas en hover
     * Añade efectos adicionales a las imágenes
     */
    initHoverInteractions() {
        const highlightImages = document.querySelectorAll('.highlight-img');
        
        highlightImages.forEach(img => {
            const container = img.closest('.highlight-item');
            
            if (!container) return;
            
            container.addEventListener('mouseenter', () => {
                // Añadir clase para animaciones CSS adicionales
                img.classList.add('img-hover-active');
            });
            
            container.addEventListener('mouseleave', () => {
                img.classList.remove('img-hover-active');
            });
        });

        // Efecto ripple en enlaces highlight-link
        const links = document.querySelectorAll('.highlight-link');
        
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                const ripple = document.createElement('span');
                ripple.classList.add('ripple-effect');
                
                const rect = link.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.width = ripple.style.height = `${size}px`;
                ripple.style.left = `${x}px`;
                ripple.style.top = `${y}px`;
                
                link.appendChild(ripple);
                
                // Remover después de la animación
                setTimeout(() => ripple.remove(), 600);
            });
        });
    }

    /**
     * Lazy loading de imágenes
     * Carga imágenes solo cuando están cerca del viewport
     */
    initLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    
                    // Cargar imagen
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    
                    // Añadir clase cuando cargue
                    img.addEventListener('load', () => {
                        img.classList.add('loaded');
                    });
                    
                    imageObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px' // Empezar a cargar 50px antes
        });
        
        images.forEach(img => imageObserver.observe(img));
    }

    /**
     * Verificar preferencia de movimiento reducido
     * Respeta configuración de accesibilidad del usuario
     */
    checkReducedMotion() {
        this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (this.prefersReducedMotion) {
            console.log('⚠️ Movimiento reducido activado - animaciones deshabilitadas');
            
            // Remover todas las animaciones CSS
            const style = document.createElement('style');
            style.textContent = `
                * {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                }
            `;
            document.head.appendChild(style);
        }
        
        // Escuchar cambios en la preferencia
        window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
            this.prefersReducedMotion = e.matches;
            if (e.matches) {
                location.reload(); // Recargar para aplicar cambios
            }
        });
    }

    /**
     * Contador animado para estadísticas (opcional)
     * Anima números desde 0 hasta el valor final
     */
    animateCounters() {
        const counters = document.querySelectorAll('[data-counter]');
        
        counters.forEach(counter => {
            const target = parseInt(counter.dataset.counter);
            const duration = 2000; // 2 segundos
            const increment = target / (duration / 16); // 60fps
            let current = 0;
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const timer = setInterval(() => {
                            current += increment;
                            if (current >= target) {
                                current = target;
                                clearInterval(timer);
                            }
                            counter.textContent = Math.floor(current);
                        }, 16);
                        
                        observer.unobserve(counter);
                    }
                });
            });
            
            observer.observe(counter);
        });
    }

    /**
     * Smooth scroll mejorado para enlaces internos
     */
    initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                
                if (href === '#') return;
                
                e.preventDefault();
                const target = document.querySelector(href);
                
                if (target) {
                    const offsetTop = target.getBoundingClientRect().top + window.pageYOffset;
                    const headerHeight = 80; // Altura del header fijo
                    
                    window.scrollTo({
                        top: offsetTop - headerHeight,
                        behavior: this.prefersReducedMotion ? 'auto' : 'smooth'
                    });
                    
                    // Focus para accesibilidad
                    target.focus({ preventScroll: true });
                }
            });
        });
    }

    /**
     * Añadir efectos de partículas de fondo (opcional)
     * Crea elementos decorativos flotantes
     */
    initBackgroundParticles() {
        const highlightsSection = document.querySelector('.highlights');
        if (!highlightsSection || this.prefersReducedMotion) return;
        
        const particlesContainer = document.createElement('div');
        particlesContainer.classList.add('particles-container');
        particlesContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            pointer-events: none;
            z-index: 0;
        `;
        
        // Crear 5 partículas
        for (let i = 0; i < 5; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            particle.style.cssText = `
                position: absolute;
                width: ${Math.random() * 100 + 50}px;
                height: ${Math.random() * 100 + 50}px;
                background: radial-gradient(circle, rgba(74, 144, 194, 0.1) 0%, transparent 70%);
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: float ${Math.random() * 10 + 10}s ease-in-out infinite;
                animation-delay: ${Math.random() * 5}s;
            `;
            particlesContainer.appendChild(particle);
        }
        
        highlightsSection.insertBefore(particlesContainer, highlightsSection.firstChild);
    }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new HomePage();
    });
} else {
    new HomePage();
}

// Exportar para uso en otros módulos si es necesario
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HomePage;
}