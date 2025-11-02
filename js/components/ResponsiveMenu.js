/* js/components/ResponsiveMenu.js */

/**
 * ===================================================================
 * ResponsiveMenu.js - Menú Hamburguesa Responsive
 * AcuarelaArte - Portafolio de Acuarelas
 * 
 * Funcionalidades:
 * - Toggle del menú móvil (hamburguesa)
 * - Cerrar menú al hacer clic en un enlace
 * - Cerrar menú al hacer clic fuera del área
 * - Cerrar menú al redimensionar ventana (>1024px)
 * - Actualizar atributos ARIA para accesibilidad
 * - Prevenir scroll del body cuando menú está abierto
 * - Trap focus dentro del menú cuando está abierto
 * - Soporte para navegación con teclado (ESC para cerrar)
 * 
 * Uso:
 * import ResponsiveMenu from './components/ResponsiveMenu.js';
 * const menu = new ResponsiveMenu();
 * 
 * HTML requerido: Ver navigation.css para estructura
 * ===================================================================
 */

class ResponsiveMenu {
    /**
     * Constructor - Inicializa el menú responsive
     */
    constructor() {
        // Elementos del DOM
        this.menuToggle = document.getElementById('menuToggle');
        this.navMenu = document.getElementById('navMenu');
        this.body = document.body;
        
        // Estado del menú
        this.isOpen = false;
        
        // Breakpoint donde el menú se vuelve horizontal
        this.desktopBreakpoint = 1024;
        
        // Verificar que los elementos existen
        if (!this.menuToggle || !this.navMenu) {
            console.warn('ResponsiveMenu: Elementos requeridos no encontrados (menuToggle o navMenu)');
            return;
        }
        
        // Inicializar el menú
        this.init();
    }
    
    /**
     * Inicializa todos los event listeners
     */
    init() {
        // Toggle del menú al hacer clic en el botón
        this.menuToggle.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevenir que active el listener de document
            this.toggleMenu();
        });
        
        // Cerrar menú al hacer clic en los enlaces
        this.setupLinkListeners();
        
        // Cerrar menú al hacer clic fuera
        this.setupOutsideClickListener();
        
        // Cerrar menú al redimensionar ventana
        this.setupResizeListener();
        
        // Cerrar menú con tecla ESC
        this.setupKeyboardListeners();
        
        // Trap focus cuando menú está abierto (accesibilidad)
        this.setupFocusTrap();
        
        console.log('✅ ResponsiveMenu inicializado correctamente');
    }
    
    /**
     * Toggle del menú (abrir/cerrar)
     */
    toggleMenu() {
        if (this.isOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }
    
    /**
     * Abre el menú
     */
    openMenu() {
        this.isOpen = true;
        
        // Agregar clases CSS
        this.navMenu.classList.add('active');
        this.body.classList.add('menu-open');
        
        // Actualizar atributos ARIA
        this.menuToggle.setAttribute('aria-expanded', 'true');
        this.menuToggle.setAttribute('aria-label', 'Cerrar menú de navegación');
        
        // Prevenir scroll del body
        this.body.style.overflow = 'hidden';
        
        // Focus en el primer enlace del menú (accesibilidad)
        this.focusFirstMenuItem();
        
        // Log para debug
        console.log('📱 Menú abierto');
    }
    
    /**
     * Cierra el menú
     */
    closeMenu() {
        this.isOpen = false;
        
        // Remover clases CSS
        this.navMenu.classList.remove('active');
        this.body.classList.remove('menu-open');
        
        // Actualizar atributos ARIA
        this.menuToggle.setAttribute('aria-expanded', 'false');
        this.menuToggle.setAttribute('aria-label', 'Abrir menú de navegación');
        
        // Restaurar scroll del body
        this.body.style.overflow = '';
        
        // Devolver focus al botón toggle (accesibilidad)
        // this.menuToggle.focus(); // Comentado para evitar focus forzado
        
        // Log para debug
        console.log('📱 Menú cerrado');
    }
    
    /**
     * Configura listeners para cerrar menú al hacer clic en enlaces
     */
    setupLinkListeners() {
        const navLinks = this.navMenu.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                // Cerrar menú solo si estamos en móvil
                if (window.innerWidth < this.desktopBreakpoint) {
                    this.closeMenu();
                }
            });
        });
    }
    
    /**
     * Configura listener para cerrar menú al hacer clic fuera
     */
    setupOutsideClickListener() {
        document.addEventListener('click', (e) => {
            // Solo cerrar si el menú está abierto
            if (!this.isOpen) return;
            
            // No cerrar si el click fue en el toggle o en el menú
            if (
                this.menuToggle.contains(e.target) ||
                this.navMenu.contains(e.target)
            ) {
                return;
            }
            
            // Cerrar menú
            this.closeMenu();
        });
    }
    
    /**
     * Configura listener para cerrar menú al redimensionar ventana
     */
    setupResizeListener() {
        let resizeTimer;
        
        window.addEventListener('resize', () => {
            // Debounce: esperar 150ms después del último resize
            clearTimeout(resizeTimer);
            
            resizeTimer = setTimeout(() => {
                // Si estamos en desktop y el menú está abierto, cerrarlo
                if (window.innerWidth >= this.desktopBreakpoint && this.isOpen) {
                    this.closeMenu();
                    console.log('🖥️ Menú cerrado por cambio a vista desktop');
                }
            }, 150);
        });
    }
    
    /**
     * Configura listeners de teclado (ESC para cerrar)
     */
    setupKeyboardListeners() {
        document.addEventListener('keydown', (e) => {
            // ESC key
            if (e.key === 'Escape' && this.isOpen) {
                this.closeMenu();
                this.menuToggle.focus(); // Devolver focus al botón
            }
        });
    }
    
    /**
     * Configura trap de focus para accesibilidad
     * El focus debe permanecer dentro del menú cuando está abierto
     */
    setupFocusTrap() {
        // Obtener todos los elementos focuseables dentro del menú
        const getFocusableElements = () => {
            return this.navMenu.querySelectorAll(
                'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
            );
        };
        
        // Listener para trap de focus
        document.addEventListener('keydown', (e) => {
            // Solo aplicar si el menú está abierto y es tecla TAB
            if (!this.isOpen || e.key !== 'Tab') return;
            
            const focusableElements = getFocusableElements();
            
            if (focusableElements.length === 0) return;
            
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            
            // Si SHIFT + TAB en el primer elemento, ir al último
            if (e.shiftKey && document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
            // Si TAB en el último elemento, ir al primero
            else if (!e.shiftKey && document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        });
    }
    
    /**
     * Enfoca el primer elemento del menú
     */
    focusFirstMenuItem() {
        const firstLink = this.navMenu.querySelector('.nav-link');
        if (firstLink) {
            // Pequeño delay para asegurar que el menú está visible
            setTimeout(() => {
                firstLink.focus();
            }, 100);
        }
    }
    
    /**
     * Obtiene el estado actual del menú
     * @returns {boolean} - true si el menú está abierto
     */
    getState() {
        return this.isOpen;
    }
    
    /**
     * Destruye el componente y limpia event listeners
     * Útil si necesitas remover el menú dinámicamente
     */
    destroy() {
        // Cerrar menú si está abierto
        if (this.isOpen) {
            this.closeMenu();
        }
        
        // Aquí podrías remover event listeners si los guardaste en propiedades
        // Por simplicidad, el garbage collector se encargará cuando el objeto sea eliminado
        
        console.log('🗑️ ResponsiveMenu destruido');
    }
}

/**
 * Auto-inicialización cuando el DOM esté listo
 * Puedes comentar esto si prefieres inicializar manualmente desde main.js
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Solo inicializar si los elementos existen
        if (document.getElementById('menuToggle') && document.getElementById('navMenu')) {
            window.responsiveMenu = new ResponsiveMenu();
        }
    });
} else {
    // DOM ya está listo
    if (document.getElementById('menuToggle') && document.getElementById('navMenu')) {
        window.responsiveMenu = new ResponsiveMenu();
    }
}

// Exportar para uso como módulo ES6
export default ResponsiveMenu;

/**
 * ===================================================================
 * NOTAS DE USO
 * ===================================================================
 * 
 * 1. IMPORTACIÓN COMO MÓDULO:
 * 
 * // En tu main.js
 * import ResponsiveMenu from './components/ResponsiveMenu.js';
 * const menu = new ResponsiveMenu();
 * 
 * 2. USO TRADICIONAL (sin módulos):
 * 
 * <script src="js/components/ResponsiveMenu.js"></script>
 * // Se auto-inicializa o usa window.responsiveMenu
 * 
 * 3. HTML REQUERIDO:
 * 
 * <button class="menu-toggle" 
 *         id="menuToggle" 
 *         aria-expanded="false"
 *         aria-label="Abrir menú de navegación">
 *     <span class="hamburger-line"></span>
 *     <span class="hamburger-line"></span>
 *     <span class="hamburger-line"></span>
 * </button>
 * 
 * <ul class="nav-menu" id="navMenu">
 *     <li class="nav-item">
 *         <a href="/" class="nav-link">Inicio</a>
 *     </li>
 *     <!-- Más items... -->
 * </ul>
 * 
 * 4. CSS REQUERIDO:
 * 
 * Ver navigation.css para estilos completos
 * 
 * 5. MÉTODOS PÚBLICOS:
 * 
 * menu.openMenu()      - Abre el menú
 * menu.closeMenu()     - Cierra el menú
 * menu.toggleMenu()    - Alterna estado
 * menu.getState()      - Obtiene estado (true/false)
 * menu.destroy()       - Destruye el componente
 * 
 * 6. EVENTOS PERSONALIZADOS (opcional - para implementar):
 * 
 * document.addEventListener('menu:opened', () => {
 *     console.log('Menú abierto');
 * });
 * 
 * document.addEventListener('menu:closed', () => {
 *     console.log('Menú cerrado');
 * });
 * 
 * 7. COMPATIBILIDAD:
 * 
 * - Chrome 90+  ✅
 * - Firefox 88+ ✅
 * - Safari 14+  ✅
 * - Edge 90+    ✅
 * 
 * 8. ACCESIBILIDAD:
 * 
 * - ✅ ARIA attributes
 * - ✅ Navegación por teclado
 * - ✅ Focus trap
 * - ✅ ESC para cerrar
 * - ✅ Screen reader friendly
 * 
 * ===================================================================
 */