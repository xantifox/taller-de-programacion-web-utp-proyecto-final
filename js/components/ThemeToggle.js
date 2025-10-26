/* js/components/ThemeToggle.js */

/**
 * Clase ThemeToggle
 * Gestiona el cambio entre tema claro y oscuro del sitio
 * @class
 */
class ThemeToggle {
    /**
     * Constructor de ThemeToggle
     * Inicializa el sistema de temas y configura eventos
     */
    constructor() {
        // Elementos DOM
        this.toggleButton = document.getElementById('themeToggle');
        this.htmlElement = document.documentElement;
        this.metaThemeColor = document.querySelector('meta[name="theme-color"]');
        
        // Estado del tema
        this.themes = {
            LIGHT: 'light',
            DARK: 'dark'
        };
        
        // Colores del meta theme-color
        this.themeColors = {
            light: '#FEFEFE',
            dark: '#1A1A1A'
        };
        
        // Verificar que el botón existe
        if (!this.toggleButton) {
            console.warn('⚠️ ThemeToggle: Botón de tema no encontrado. ID esperado: "themeToggle"');
            return;
        }
        
        // Inicializar
        this.initialize();
        
        console.log('✅ ThemeToggle: Inicializado correctamente');
    }
    
    /**
     * Inicializa el sistema de temas
     * Detecta tema guardado o preferencia del sistema
     */
    initialize() {
        // 1. Detectar tema inicial
        const initialTheme = this.getInitialTheme();
        
        // 2. Aplicar tema sin transición (para evitar flash)
        this.applyThemeWithoutTransition(initialTheme);
        
        // 3. Configurar event listeners
        this.setupEventListeners();
        
        // 4. Observar cambios en la preferencia del sistema
        this.watchSystemPreference();
        
        // 5. Actualizar atributos ARIA
        this.updateAriaAttributes();
        
        console.log(`🎨 Tema inicial: ${initialTheme}`);
    }
    
    /**
     * Detecta el tema inicial a usar
     * Prioridad: localStorage > preferencia del sistema > tema claro por defecto
     * @returns {string} - 'light' o 'dark'
     */
    getInitialTheme() {
        // 1. Verificar si hay tema guardado en localStorage
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme && (savedTheme === this.themes.LIGHT || savedTheme === this.themes.DARK)) {
            return savedTheme;
        }
        
        // 2. Detectar preferencia del sistema
        if (window.matchMedia) {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
                return this.themes.DARK;
            }
        }
        
        // 3. Tema claro por defecto
        return this.themes.LIGHT;
    }
    
    /**
     * Aplica el tema sin animación de transición
     * Usado solo en la carga inicial para evitar flash
     * @param {string} theme - 'light' o 'dark'
     */
    applyThemeWithoutTransition(theme) {
        // Desactivar transiciones temporalmente
        this.htmlElement.classList.add('theme-transition-disabled');
        
        // Aplicar tema
        this.setTheme(theme, false);
        
        // Reactivar transiciones después de un frame
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                this.htmlElement.classList.remove('theme-transition-disabled');
            });
        });
    }
    
    /**
     * Configura los event listeners del componente
     */
    setupEventListeners() {
        // Click en el botón de toggle
        this.toggleButton.addEventListener('click', () => {
            this.toggleTheme();
        });
        
        // Atajo de teclado: Ctrl/Cmd + Shift + D para cambiar tema
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
                e.preventDefault();
                this.toggleTheme();
            }
        });
        
        // Evento custom para cambio de tema programático
        document.addEventListener('setTheme', (e) => {
            if (e.detail && e.detail.theme) {
                this.setTheme(e.detail.theme);
            }
        });
    }
    
    /**
     * Observa cambios en la preferencia de color del sistema
     */
    watchSystemPreference() {
        if (!window.matchMedia) return;
        
        const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        // Listener para cambios en la preferencia del sistema
        darkModeQuery.addEventListener('change', (e) => {
            // Solo actualizar si no hay tema guardado manualmente
            if (!localStorage.getItem('theme')) {
                const newTheme = e.matches ? this.themes.DARK : this.themes.LIGHT;
                this.setTheme(newTheme, true);
                console.log(`🔄 Tema actualizado por preferencia del sistema: ${newTheme}`);
            }
        });
    }
    
    /**
     * Cambia entre tema claro y oscuro
     */
    toggleTheme() {
        const currentTheme = this.getCurrentTheme();
        const newTheme = currentTheme === this.themes.LIGHT 
            ? this.themes.DARK 
            : this.themes.LIGHT;
        
        this.setTheme(newTheme, true);
        
        // Feedback visual: animación del botón
        this.animateButton();
        
        console.log(`🔄 Tema cambiado: ${currentTheme} → ${newTheme}`);
    }
    
    /**
     * Establece un tema específico
     * @param {string} theme - 'light' o 'dark'
     * @param {boolean} saveToStorage - Si debe guardarse en localStorage
     */
    setTheme(theme, saveToStorage = true) {
        // Validar tema
        if (theme !== this.themes.LIGHT && theme !== this.themes.DARK) {
            console.error(`❌ Tema inválido: ${theme}`);
            return;
        }
        
        // 1. Actualizar atributo data-theme en <html>
        this.htmlElement.setAttribute('data-theme', theme);
        
        // 2. Guardar en localStorage si es necesario
        if (saveToStorage) {
            localStorage.setItem('theme', theme);
        }
        
        // 3. Actualizar meta theme-color
        this.updateMetaThemeColor(theme);
        
        // 4. Actualizar atributos ARIA
        this.updateAriaAttributes();
        
        // 5. Dispatch evento custom para otros componentes
        this.dispatchThemeChangeEvent(theme);
    }
    
    /**
     * Obtiene el tema actual
     * @returns {string} - 'light' o 'dark'
     */
    getCurrentTheme() {
        const theme = this.htmlElement.getAttribute('data-theme');
        return theme || this.themes.LIGHT;
    }
    
    /**
     * Actualiza el meta tag theme-color del navegador
     * @param {string} theme - 'light' o 'dark'
     */
    updateMetaThemeColor(theme) {
        if (!this.metaThemeColor) {
            // Crear meta tag si no existe
            this.metaThemeColor = document.createElement('meta');
            this.metaThemeColor.name = 'theme-color';
            document.head.appendChild(this.metaThemeColor);
        }
        
        const color = this.themeColors[theme];
        this.metaThemeColor.setAttribute('content', color);
    }
    
    /**
     * Actualiza los atributos ARIA para accesibilidad
     */
    updateAriaAttributes() {
        const currentTheme = this.getCurrentTheme();
        const label = currentTheme === this.themes.LIGHT 
            ? 'Cambiar a modo oscuro' 
            : 'Cambiar a modo claro';
        
        this.toggleButton.setAttribute('aria-label', label);
        this.toggleButton.setAttribute('aria-pressed', currentTheme === this.themes.DARK);
        
        // Actualizar title para tooltip
        this.toggleButton.title = label;
    }
    
    /**
     * Animación del botón al hacer clic
     */
    animateButton() {
        // Agregar clase de animación
        this.toggleButton.classList.add('theme-toggle-active');
        
        // Remover clase después de la animación
        setTimeout(() => {
            this.toggleButton.classList.remove('theme-toggle-active');
        }, 300);
    }
    
    /**
     * Dispatch evento custom cuando el tema cambia
     * Permite que otros componentes reaccionen al cambio
     * @param {string} theme - 'light' o 'dark'
     */
    dispatchThemeChangeEvent(theme) {
        const event = new CustomEvent('themeChanged', {
            detail: {
                theme: theme,
                timestamp: Date.now()
            },
            bubbles: true,
            cancelable: false
        });
        
        document.dispatchEvent(event);
    }
    
    /**
     * Método público: Obtener el tema actual
     * @returns {string} - 'light' o 'dark'
     */
    getTheme() {
        return this.getCurrentTheme();
    }
    
    /**
     * Método público: Establecer tema programáticamente
     * @param {string} theme - 'light' o 'dark'
     */
    setThemePublic(theme) {
        this.setTheme(theme, true);
    }
    
    /**
     * Método público: Reset tema a preferencia del sistema
     */
    resetToSystemPreference() {
        localStorage.removeItem('theme');
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches 
            ? this.themes.DARK 
            : this.themes.LIGHT;
        this.setTheme(systemTheme, false);
        console.log(`🔄 Tema reseteado a preferencia del sistema: ${systemTheme}`);
    }
    
    /**
     * Destructor: Limpia event listeners
     */
    destroy() {
        // Remover event listeners si es necesario
        // (Para uso en aplicaciones SPA)
        console.log('🗑️ ThemeToggle: Destruido');
    }
}

/* ===================================================================
   ESTILOS CSS REQUERIDOS PARA EL TOGGLE BUTTON
   Agregar estos estilos a tu archivo CSS principal o buttons.css
   =================================================================== */

/*
.theme-toggle {
    position: relative;
    width: 60px;
    height: 30px;
    background: var(--border-color);
    border-radius: 15px;
    border: none;
    cursor: pointer;
    overflow: hidden;
    transition: background-color var(--duration-normal) var(--ease-out);
}

.theme-toggle:hover {
    background: var(--border-hover);
}

.theme-toggle:focus {
    outline: 2px solid var(--border-focus);
    outline-offset: 2px;
}

.theme-toggle::before {
    content: '';
    position: absolute;
    top: 3px;
    left: 3px;
    width: 24px;
    height: 24px;
    background: var(--primary-color);
    border-radius: 50%;
    transition: transform var(--duration-normal) var(--ease-out);
    box-shadow: 0 2px 4px var(--shadow-color);
}

[data-theme="dark"] .theme-toggle::before {
    transform: translateX(30px);
}

.theme-toggle::after {
    content: '☀️';
    position: absolute;
    top: 50%;
    left: 8px;
    transform: translateY(-50%);
    font-size: 14px;
    transition: opacity var(--duration-fast) var(--ease-out);
}

[data-theme="dark"] .theme-toggle::after {
    content: '🌙';
    left: auto;
    right: 8px;
}

.theme-toggle-active {
    animation: toggleBounce var(--duration-normal) var(--ease-bounce);
}

@keyframes toggleBounce {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(0.95); }
}

.theme-transition-disabled,
.theme-transition-disabled *,
.theme-transition-disabled *::before,
.theme-transition-disabled *::after {
    transition: none !important;
    animation: none !important;
}
*/

/* ===================================================================
   EJEMPLO DE USO EN HTML
   =================================================================== */

/*
<!DOCTYPE html>
<html lang="es" data-theme="light">
<head>
    <meta name="theme-color" content="#FEFEFE">
    ...
</head>
<body>
    <button 
        id="themeToggle" 
        class="theme-toggle"
        aria-label="Cambiar tema"
        aria-pressed="false"
        type="button">
    </button>
    
    <script type="module">
        import ThemeToggle from './js/ThemeToggle.js';
        
        // Inicializar al cargar la página
        document.addEventListener('DOMContentLoaded', () => {
            const themeToggle = new ThemeToggle();
            
            // Escuchar cambios de tema
            document.addEventListener('themeChanged', (e) => {
                console.log('Tema cambiado a:', e.detail.theme);
            });
        });
    </script>
</body>
</html>
*/

/* ===================================================================
   EXPORTAR CLASE COMO MÓDULO ES6
   =================================================================== */

export default ThemeToggle;
