/**
 * IMAGE LOADER - Sistema de Carga Progresiva de Imágenes
 * Maneja placeholders, lazy loading y optimización de carga
 * 
 * @module imageLoader
 * @version 1.0.0
 */

/**
 * Configuración del Image Loader
 */
const CONFIG = {
    // Margen para empezar a cargar antes de que sea visible
    rootMargin: '50px',
    
    // Umbral de visibilidad (0 = apenas visible, 1 = completamente visible)
    threshold: 0.01,
    
    // Clase para imágenes lazy
    lazyClass: 'lazy-load',
    
    // Clase cuando está cargando
    loadingClass: 'image-loading',
    
    // Clase cuando cargó correctamente
    loadedClass: 'image-loaded',
    
    // Clase cuando hay error
    errorClass: 'image-error',
    
    // Clase placeholder
    placeholderClass: 'lazy-placeholder',
    
    // Reintentos en caso de error
    maxRetries: 3,
    
    // Delay entre reintentos (ms)
    retryDelay: 1000
};

/**
 * Mapa para tracking de reintentos por imagen
 */
const retryMap = new Map();

/**
 * Observer para Intersection Observer API
 */
let imageObserver = null;

/**
 * Inicializa el sistema de carga de imágenes
 * @public
 */
export function initImageLoader() {
    // Verificar soporte de IntersectionObserver
    if (!('IntersectionObserver' in window)) {
        console.warn('IntersectionObserver no soportado, cargando todas las imágenes');
        loadAllImagesImmediately();
        return;
    }

    // Crear observer
    imageObserver = new IntersectionObserver(
        handleIntersection,
        {
            rootMargin: CONFIG.rootMargin,
            threshold: CONFIG.threshold
        }
    );

    // Observar todas las imágenes lazy
    observeImages();

    console.log('✅ Image Loader inicializado');
}

/**
 * Observa todas las imágenes con data-src
 * @private
 */
function observeImages() {
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    lazyImages.forEach(img => {
        // Agregar clase placeholder inicial
        img.classList.add(CONFIG.placeholderClass);
        
        // Agregar alt text si no tiene
        if (!img.alt) {
            img.alt = 'Imagen cargando...';
        }
        
        // Observar imagen
        imageObserver.observe(img);
    });

    console.log(`📸 Observando ${lazyImages.length} imágenes lazy`);
}

/**
 * Callback cuando imagen entra en viewport
 * @private
 * @param {IntersectionObserverEntry[]} entries 
 * @param {IntersectionObserver} observer 
 */
function handleIntersection(entries, observer) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            
            // Cargar imagen
            loadImage(img);
            
            // Dejar de observar esta imagen
            observer.unobserve(img);
        }
    });
}

/**
 * Carga una imagen específica
 * @private
 * @param {HTMLImageElement} img - Elemento imagen a cargar
 */
function loadImage(img) {
    const src = img.dataset.src;
    const srcset = img.dataset.srcset;
    
    if (!src) {
        console.warn('Imagen sin data-src:', img);
        return;
    }

    // Marcar como cargando
    img.classList.remove(CONFIG.placeholderClass);
    img.classList.add(CONFIG.loadingClass);

    // Crear imagen temporal para precargar
    const tempImage = new Image();

    // Handler de carga exitosa
    tempImage.onload = () => {
        handleImageLoaded(img, src, srcset);
    };

    // Handler de error
    tempImage.onerror = () => {
        handleImageError(img, src);
    };

    // Iniciar carga
    if (srcset) {
        tempImage.srcset = srcset;
    }
    tempImage.src = src;
}

/**
 * Maneja imagen cargada exitosamente
 * @private
 * @param {HTMLImageElement} img 
 * @param {string} src 
 * @param {string} srcset 
 */
function handleImageLoaded(img, src, srcset) {
    // Aplicar src
    img.src = src;
    
    if (srcset) {
        img.srcset = srcset;
    }

    // Actualizar alt text
    const originalAlt = img.dataset.alt;
    if (originalAlt) {
        img.alt = originalAlt;
    }

    // Actualizar clases
    img.classList.remove(CONFIG.loadingClass);
    img.classList.add(CONFIG.loadedClass);

    // Limpiar data attributes
    delete img.dataset.src;
    delete img.dataset.srcset;

    // Limpiar del mapa de reintentos
    retryMap.delete(img);

    // Trigger evento custom
    img.dispatchEvent(new CustomEvent('imageLoaded', {
        detail: { src, srcset }
    }));

    console.log('✅ Imagen cargada:', src);
}

/**
 * Maneja error de carga de imagen
 * @private
 * @param {HTMLImageElement} img 
 * @param {string} src 
 */
function handleImageError(img, src) {
    const retries = retryMap.get(img) || 0;

    if (retries < CONFIG.maxRetries) {
        // Incrementar contador de reintentos
        retryMap.set(img, retries + 1);

        console.warn(`⚠️ Error cargando imagen (intento ${retries + 1}/${CONFIG.maxRetries}):`, src);

        // Reintentar después de delay
        setTimeout(() => {
            loadImage(img);
        }, CONFIG.retryDelay * (retries + 1)); // Incrementar delay con cada reintento

    } else {
        // Máximo de reintentos alcanzado
        console.error('❌ Error definitivo cargando imagen:', src);

        // Marcar como error
        img.classList.remove(CONFIG.loadingClass);
        img.classList.add(CONFIG.errorClass);

        // Aplicar imagen fallback si existe
        const fallback = img.dataset.fallback;
        if (fallback) {
            img.src = fallback;
        } else {
            // Usar placeholder genérico
            img.alt = 'Error al cargar imagen';
        }

        // Trigger evento custom
        img.dispatchEvent(new CustomEvent('imageError', {
            detail: { src, retries }
        }));

        // Limpiar
        retryMap.delete(img);
    }
}

/**
 * Carga todas las imágenes inmediatamente (fallback)
 * @private
 */
function loadAllImagesImmediately() {
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    lazyImages.forEach(img => {
        const src = img.dataset.src;
        const srcset = img.dataset.srcset;
        
        if (src) {
            img.src = src;
        }
        
        if (srcset) {
            img.srcset = srcset;
        }
        
        delete img.dataset.src;
        delete img.dataset.srcset;
    });

    console.log('⚡ Cargadas todas las imágenes inmediatamente (fallback)');
}

/**
 * Precarga imágenes críticas
 * @public
 * @param {string[]} urls - Array de URLs a precargar
 */
export function preloadCriticalImages(urls) {
    if (!Array.isArray(urls) || urls.length === 0) {
        return;
    }

    urls.forEach(url => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = url;
        document.head.appendChild(link);
    });

    console.log(`⚡ Precargadas ${urls.length} imágenes críticas`);
}

/**
 * Carga imágenes en un contenedor específico
 * @public
 * @param {string} containerSelector - Selector CSS del contenedor
 */
export function loadImagesInContainer(containerSelector) {
    const container = document.querySelector(containerSelector);
    
    if (!container) {
        console.warn('Contenedor no encontrado:', containerSelector);
        return;
    }

    const images = container.querySelectorAll('img[data-src]');
    images.forEach(img => loadImage(img));

    console.log(`📸 Cargadas ${images.length} imágenes en:`, containerSelector);
}

/**
 * Actualiza src de imagen con fade effect
 * @public
 * @param {HTMLImageElement} img 
 * @param {string} newSrc 
 */
export function updateImageWithFade(img, newSrc) {
    // Fade out
    img.style.transition = 'opacity 0.3s ease';
    img.style.opacity = '0';

    setTimeout(() => {
        // Cambiar src
        img.src = newSrc;
        
        // Fade in cuando carga
        img.onload = () => {
            img.style.opacity = '1';
        };
    }, 300);
}

/**
 * Obtiene estadísticas de carga
 * @public
 * @returns {Object} Estadísticas
 */
export function getLoadingStats() {
    const allImages = document.querySelectorAll('img');
    const lazyImages = document.querySelectorAll(`img[data-src]`);
    const loadedImages = document.querySelectorAll(`.${CONFIG.loadedClass}`);
    const errorImages = document.querySelectorAll(`.${CONFIG.errorClass}`);
    const loadingImages = document.querySelectorAll(`.${CONFIG.loadingClass}`);

    return {
        total: allImages.length,
        lazy: lazyImages.length,
        loaded: loadedImages.length,
        loading: loadingImages.length,
        errors: errorImages.length,
        pending: lazyImages.length - loadedImages.length - errorImages.length,
        percentage: Math.round((loadedImages.length / allImages.length) * 100)
    };
}

/**
 * Limpia resources y observers
 * @public
 */
export function cleanup() {
    if (imageObserver) {
        imageObserver.disconnect();
        imageObserver = null;
    }
    
    retryMap.clear();
    
    console.log('🧹 Image Loader limpiado');
}

/**
 * Función principal de inicialización
 * Alias de initImageLoader para compatibilidad
 * @public
 */
export function loadPlaceholders() {
    initImageLoader();
}

/**
 * Auto-inicialización si se importa como módulo
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initImageLoader);
} else {
    initImageLoader();
}

// Export default para uso flexible
export default {
    init: initImageLoader,
    loadPlaceholders,
    preloadCritical: preloadCriticalImages,
    loadInContainer: loadImagesInContainer,
    updateWithFade: updateImageWithFade,
    getStats: getLoadingStats,
    cleanup
};