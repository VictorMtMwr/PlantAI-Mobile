import { isNativePlatform } from '../core/config.js';

// Función para obtener la ruta correcta de la imagen según la plataforma
function getImagePath(relativePath) {
  if (isNativePlatform) {
    // En Android nativo, las imágenes se sirven desde el directorio assets
    // Convertir ../img/developers/victor.jpg a /img/developers/victor.jpg
    const cleanPath = relativePath.replace(/^\.\.\//, '/');
    
    // Construir la ruta absoluta usando window.location.origin
    // En Capacitor Android, window.location.origin puede ser 'capacitor://localhost' o 'http://localhost'
    const basePath = window.location.origin;
    const absolutePath = `${basePath}${cleanPath}`;
    
    console.log('🖼️ Ruta de imagen nativa:', absolutePath);
    console.log('🖼️ window.location:', window.location.href);
    console.log('🖼️ window.location.origin:', window.location.origin);
    console.log('🖼️ window.location.pathname:', window.location.pathname);
    
    return absolutePath;
  } else {
    // En web, usar ruta relativa normal
    return relativePath;
  }
}

// Datos de los desarrolladores (guardamos la ruta relativa original)
const developersData = {
  victor: {
    name: 'Víctor Martínez',
    role: 'ML Developer, Backend Developer, Android Developer & Project Manager',
    imagePath: '../img/developers/victor.jpg',
    education: 'Ingeniero de Sistemas de la Universidad Tecnológica de Bolívar',
    responsibilities: 'Desarrollador de Backend y ML Developer, encargado de todo el área de inteligencia artificial del proyecto y construccion de la aplicacion nativa para Android. Responsable del diseño e implementación de los modelos de machine learning para la clasificación de plantas, así como del desarrollo de la arquitectura backend que soporta la aplicación, además de la gestión del proyecto y el equipo de desarrollo.'
  },
  santiago: {
    name: 'Santiago Payares',
    role: 'Frontend Developer & UX/UI Designer',
    imagePath: '../img/developers/santiago-payares.jpg',
    education: 'Ingeniero de Sistemas de la Universidad Tecnológica de Bolívar',
    responsibilities: 'Desarrollador de Frontend y UX/UI Designer. Responsable del diseño e implementación de la interfaz de usuario y la experiencia del usuario de la aplicación.'
  },
  julian: {
    name: 'Julián Camacho',
    role: 'Documentation & Quality Assurance',
    imagePath: '../img/developers/julian-camacho.jpg',
    education: 'Ingeniero de Sistemas de la Universidad Tecnológica de Bolívar',
    responsibilities: 'Desarrollador de documentación. Responsable de la documentación del proyecto y la aseguramiento de calidad de la aplicación.'
  },
  camilo: {
    name: 'Camilo Naufal',
    role: 'Artificial Vision, AI Expert & Testing',
    imagePath: '../img/developers/camilo-naufal.jpg',
    education: 'Información pendiente',
    responsibilities: 'Responsable guiar las distintas etapas de entrenamiento y pruebas de los modelos aportando sus conocimiento en visión por computadora. También responsable de la prueba de la aplicación.'
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
        // Intentar diferentes rutas alternativas
        fallbackPaths.push(
          `${window.location.origin}/img/developers/${fileName}`,
          `./img/developers/${fileName}`,
          `../img/developers/${fileName}`,
          `img/developers/${fileName}`
        );
      }
      
      // Manejar errores de carga de imagen con múltiples intentos
      const errorHandler = (function(paths, devName) {
        let attemptCount = 0;
        return function() {
          attemptCount++;
          console.warn(`Error cargando imagen (intento ${attemptCount}):`, this.src);
          
          if (isNativePlatform && attemptCount <= paths.length) {
            const nextPath = paths[attemptCount - 1];
            if (nextPath && this.src !== nextPath) {
              console.log(`Intentando ruta alternativa ${attemptCount}:`, nextPath);
              this.src = nextPath;
            }
          } else {
            // Si todas las rutas fallan, usar el SVG de respaldo
            console.error('Todas las rutas fallaron, usando imagen de respaldo');
            const initials = devName.split(' ').map(n => n[0]).join('');
            this.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Ccircle cx='100' cy='100' r='80' fill='%2310b981'/%3E%3Ctext x='100' y='120' font-size='60' text-anchor='middle' fill='white'%3E${initials}%3C/text%3E%3C/svg%3E`;
            this.onerror = null; // Prevenir bucle infinito
          }
        };
      })(fallbackPaths, developer.name);
      
      imageElement.onerror = errorHandler;
    }
    document.getElementById('modalDeveloperName').textContent = developer.name;
    document.getElementById('modalDeveloperRole').textContent = developer.role;
    document.getElementById('modalEducation').textContent = developer.education;
    document.getElementById('modalResponsibilities').textContent = developer.responsibilities;

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

