import { isNativePlatform } from '../core/config.js';

// Función para obtener traducciones
function getTranslation(key) {
  const i18n = window.i18nManager || { t: (k) => k };
  return i18n.t(key);
}

// Función para obtener la ruta correcta de la imagen según la plataforma
function getImagePath(relativePath) {
  if (isNativePlatform) {
    // En Android nativo, las imágenes se sirven desde el directorio assets/public
    // Extraer el nombre del archivo
    const fileName = relativePath.split('/').pop();
    
    // En Capacitor Android, las rutas deben ser relativas a la raíz del sitio
    // window.location.origin puede ser 'capacitor://localhost' o 'http://localhost'
    const basePath = window.location.origin;
    
    // Intentar múltiples rutas posibles en Android nativo
    // Las imágenes están en /img/developers/ en la raíz del sitio
    const possiblePaths = [
      `/img/developers/${fileName}`,  // Ruta absoluta desde la raíz (PRIMERA OPCIÓN)
      `${basePath}/img/developers/${fileName}`, // Ruta completa con basePath
      `./img/developers/${fileName}`, // Ruta relativa desde la página actual
      `../img/developers/${fileName}`, // Ruta relativa desde pages/
      `img/developers/${fileName}`,   // Ruta sin barra inicial
      relativePath // Ruta original como último recurso
    ];
    
    // Construir rutas absolutas adicionales
    const absolutePaths = possiblePaths.map(path => {
      // Limpiar la ruta: remover ./ y ../ del inicio
      let cleanPath = path;
      if (path.startsWith('./')) {
        cleanPath = path.substring(2);
      } else if (path.startsWith('../')) {
        cleanPath = path.substring(3);
      }
      // Si no comienza con / y no tiene basePath, agregar /
      if (!cleanPath.startsWith('/') && !cleanPath.startsWith(basePath)) {
        cleanPath = `/${cleanPath}`;
      }
      // Si no tiene basePath, agregarlo
      if (!cleanPath.startsWith(basePath) && !cleanPath.startsWith('http') && !cleanPath.startsWith('capacitor')) {
        return `${basePath}${cleanPath}`;
      }
      return cleanPath;
    });
    
    // Retornar la primera ruta (ruta relativa simple)
    const firstPath = possiblePaths[0]; // Usar ruta relativa simple primero
    console.log('🖼️ Android nativo - Ruta de imagen (primera opción):', firstPath);
    console.log('🖼️ Rutas alternativas:', absolutePaths);
    console.log('🖼️ window.location.origin:', basePath);
    console.log('🖼️ window.location.href:', window.location.href);
    console.log('🖼️ window.location.pathname:', window.location.pathname);
    
    // Guardar las rutas alternativas para el error handler
    window._developerImageFallbackPaths = absolutePaths;
    
    return firstPath;
  } else {
    // En web, usar ruta relativa normal
    return relativePath;
  }
}

// Datos de los desarrolladores (guardamos la ruta relativa original)
// Los textos se traducen dinámicamente usando getTranslation()
const developersData = {
  victor: {
    name: 'Víctor Martínez',
    roleKey: 'developer.victor.role',
    imagePath: '../img/developers/victor.jpg',
    educationKey: 'developer.victor.education',
    responsibilitiesKey: 'developer.victor.responsibilities'
  },
  santiago: {
    name: 'Santiago Payares',
    roleKey: 'developer.santiago.role',
    imagePath: '../img/developers/santiago-payares.jpg',
    educationKey: 'developer.santiago.education',
    responsibilitiesKey: 'developer.santiago.responsibilities'
  },
  julian: {
    name: 'Julián Camacho',
    roleKey: 'developer.julian.role',
    imagePath: '../img/developers/julian-camacho.jpg',
    educationKey: 'developer.julian.education',
    responsibilitiesKey: 'developer.julian.responsibilities'
  },
  camilo: {
    name: 'Camilo Naufal',
    roleKey: 'developer.camilo.role',
    imagePath: '../img/developers/camilo-naufal.jpg',
    educationKey: 'developer.camilo.education',
    responsibilitiesKey: 'developer.camilo.responsibilities'
  }
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('developerModal');
  const closeBtn = document.getElementById('closeModal');
  const overlay = modal?.querySelector('.modal-overlay');
  const developerCards = document.querySelectorAll('.developer-card[data-developer]');

  // Función para abrir el modal
  function openModal(developerId) {
    const developer = developersData[developerId];
    if (!developer || !modal) return;

    // Llenar el modal con la información
    const imageElement = document.getElementById('modalDeveloperImage');
    if (imageElement) {
      // Obtener la ruta correcta según la plataforma
      const imageSrc = getImagePath(developer.imagePath);
      imageElement.src = imageSrc;
      imageElement.alt = developer.name;
      
      // Preparar rutas de respaldo para Android nativo
      const fallbackPaths = [];
      if (isNativePlatform) {
        const fileName = developer.imagePath.split('/').pop();
        const basePath = window.location.origin;
        const currentPath = window.location.pathname;
        const isInPages = currentPath.includes('/pages/');
        
        // Usar las rutas alternativas guardadas por getImagePath, o construir nuevas
        const savedPaths = window._developerImageFallbackPaths || [];
        if (savedPaths.length > 0) {
          fallbackPaths.push(...savedPaths);
        } else {
          // Construir rutas basadas en la ubicación actual
          if (isInPages) {
            // Si estamos en pages/, usar ruta relativa
            fallbackPaths.push(
              `../img/developers/${fileName}`,
              `./img/developers/${fileName}`,
              `/img/developers/${fileName}`,
              `${basePath}/img/developers/${fileName}`
            );
          } else {
            // Si estamos en la raíz, usar ruta absoluta
            fallbackPaths.push(
              `/img/developers/${fileName}`,
              `${basePath}/img/developers/${fileName}`,
              `./img/developers/${fileName}`,
              `img/developers/${fileName}`
            );
          }
        }
      }
      
      // Manejar errores de carga de imagen con múltiples intentos
      const errorHandler = (function(paths, devName) {
        let attemptCount = 0;
        const maxAttempts = paths.length + 1; // +1 para el SVG de respaldo
        
        return function() {
          attemptCount++;
          console.warn(`❌ Error cargando imagen (intento ${attemptCount}/${maxAttempts}):`, this.src);
          
          if (isNativePlatform && attemptCount <= paths.length) {
            const nextPath = paths[attemptCount - 1];
            if (nextPath && this.src !== nextPath) {
              console.log(`🔄 Intentando ruta alternativa ${attemptCount}/${paths.length}:`, nextPath);
              this.src = nextPath;
            } else if (attemptCount > paths.length) {
              // Si todas las rutas fallan, usar el SVG de respaldo
              console.error('❌ Todas las rutas fallaron, usando imagen de respaldo');
              const initials = devName.split(' ').map(n => n[0]).join('');
              this.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Ccircle cx='100' cy='100' r='80' fill='%2310b981'/%3E%3Ctext x='100' y='120' font-size='60' text-anchor='middle' fill='white'%3E${initials}%3C/text%3E%3C/svg%3E`;
              this.onerror = null; // Prevenir bucle infinito
            }
          } else {
            // Si todas las rutas fallan, usar el SVG de respaldo
            console.error('❌ Todas las rutas fallaron, usando imagen de respaldo');
            const initials = devName.split(' ').map(n => n[0]).join('');
            this.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Ccircle cx='100' cy='100' r='80' fill='%2310b981'/%3E%3Ctext x='100' y='120' font-size='60' text-anchor='middle' fill='white'%3E${initials}%3C/text%3E%3C/svg%3E`;
            this.onerror = null; // Prevenir bucle infinito
          }
        };
      })(fallbackPaths, developer.name);
      
      imageElement.onerror = errorHandler;
      
      // Agregar evento onload para confirmar que la imagen se cargó
      imageElement.onload = function() {
        console.log('✅ Imagen cargada exitosamente:', this.src);
      };
      
      // Limpiar las rutas guardadas después de usarlas
      if (window._developerImageFallbackPaths) {
        delete window._developerImageFallbackPaths;
      }
    }
    document.getElementById('modalDeveloperName').textContent = developer.name;
    document.getElementById('modalDeveloperRole').textContent = getTranslation(developer.roleKey);
    document.getElementById('modalEducation').textContent = getTranslation(developer.educationKey);
    document.getElementById('modalResponsibilities').textContent = getTranslation(developer.responsibilitiesKey);
    
    // Traducir la página después de actualizar el modal
    if (window.i18nManager) {
      window.i18nManager.translatePage();
    }

    // Mostrar el modal
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Prevenir scroll del body
  }

  // Función para cerrar el modal
  function closeModal() {
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = ''; // Restaurar scroll del body
    }
  }

  // Agregar event listeners a las tarjetas de desarrolladores
  developerCards.forEach(card => {
    const developerImage = card.querySelector('.developer-image.clickable');
    if (developerImage) {
      developerImage.addEventListener('click', (e) => {
        e.preventDefault();
        const developerId = card.getAttribute('data-developer');
        if (developerId) {
          openModal(developerId);
        }
      });
      
      // Agregar cursor pointer
      developerImage.style.cursor = 'pointer';
    }
  });

  // Cerrar modal al hacer clic en el botón de cerrar
  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  // Cerrar modal al hacer clic en el overlay
  if (overlay) {
    overlay.addEventListener('click', closeModal);
  }

  // Cerrar modal con la tecla ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      closeModal();
    }
  });
});

