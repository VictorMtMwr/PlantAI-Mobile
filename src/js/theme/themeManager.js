class ThemeManager {
  constructor() {
    this.currentTheme = 'light';
    this.init();
  }

  init() {
    // Cargar tema guardado del localStorage
    this.loadTheme();
    
    // Aplicar el tema INMEDIATAMENTE antes de crear el botón
    this.applyTheme();
    
    // Crear el botón de cambio de tema
    this.createThemeToggle();
    
    // Agregar event listeners
    this.addEventListeners();
  }

  loadTheme() {
    const savedTheme = localStorage.getItem('plantai-theme');
    console.log('🔍 Cargando tema guardado:', savedTheme);
    
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      this.currentTheme = savedTheme;
      console.log('✅ Tema cargado desde localStorage:', this.currentTheme);
    } else {
      // Detectar preferencia del sistema
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        this.currentTheme = 'dark';
        console.log('🌙 Tema detectado del sistema: dark');
      } else {
        this.currentTheme = 'light';
        console.log('☀️ Tema por defecto: light');
      }
    }
  }

  saveTheme() {
    localStorage.setItem('plantai-theme', this.currentTheme);
  }

  createThemeToggle() {
    // Verificar si ya existe el botón
    if (document.querySelector('.theme-toggle')) {
      return;
    }

    const toggleButton = document.createElement('button');
    toggleButton.className = 'theme-toggle';
    toggleButton.setAttribute('aria-label', 'Cambiar tema');
    toggleButton.innerHTML = `
      <span class="sun-icon">☀️</span>
      <span class="moon-icon">🌙</span>
    `;
    
    document.body.appendChild(toggleButton);
  }

  addEventListeners() {
    // Event listener para el botón de cambio de tema
    const handleThemeToggle = (e) => {
      const themeBtn = e.target.closest('.theme-toggle');
      if (themeBtn) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        console.log('🎨 Cambiando tema...');
        this.toggleTheme();
        return false;
      }
    };
    
    // Soporte para click y touch - usar capture para interceptar primero
    document.addEventListener('click', handleThemeToggle, { capture: true, passive: false });
    document.addEventListener('touchstart', handleThemeToggle, { capture: true, passive: false });
    document.addEventListener('touchend', (e) => {
      if (e.target.closest('.theme-toggle')) {
        e.preventDefault();
        e.stopPropagation();
      }
    }, { capture: true, passive: false });

    // Escuchar cambios en la preferencia del sistema
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('plantai-theme')) {
          this.currentTheme = e.matches ? 'dark' : 'light';
          this.applyTheme();
        }
      });
    }

    // Aplicar tema al cargar la página
    document.addEventListener('DOMContentLoaded', () => {
      this.applyTheme();
    });
  }

  toggleTheme() {
    console.log('🔄 Cambiando de', this.currentTheme, 'a', this.currentTheme === 'light' ? 'dark' : 'light');
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.applyTheme();
    this.saveTheme();
    console.log('✅ Tema cambiado a:', this.currentTheme);
    
    // Emitir evento personalizado para notificar el cambio de tema
    window.dispatchEvent(new CustomEvent('themeChanged', {
      detail: { theme: this.currentTheme }
    }));
  }

  applyTheme() {
    const html = document.documentElement;
    console.log('🎨 Aplicando tema:', this.currentTheme);
    
    if (this.currentTheme === 'dark') {
      html.setAttribute('data-theme', 'dark');
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
      console.log('🌙 Modo oscuro aplicado');
    } else {
      html.removeAttribute('data-theme');
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
      console.log('☀️ Modo claro aplicado');
    }

    // Actualizar meta theme-color para móviles
    this.updateMetaThemeColor();
    
    // Forzar actualización de estilos específicos
    this.updateSpecificElements();
  }

  updateSpecificElements() {
    // Actualizar navegación inferior específicamente
    const bottomNav = document.querySelector('.horizontal-nav.bottom-nav');
    if (bottomNav) {
      bottomNav.style.backgroundColor = 'var(--nav-bg)';
      bottomNav.style.borderTopColor = 'var(--nav-border)';
    }

    // Actualizar tabs de navegación
    const navTabs = document.querySelectorAll('.nav-tab');
    navTabs.forEach(tab => {
      tab.style.color = 'var(--text-secondary)';
      if (tab.classList.contains('active')) {
        tab.style.color = 'var(--nav-active)';
        tab.style.backgroundColor = 'var(--nav-active-bg)';
        tab.style.borderBottomColor = 'var(--nav-active)';
      }
    });

    // Actualizar iconos de navegación
    const navIcons = document.querySelectorAll('.nav-icon');
    navIcons.forEach(icon => {
      icon.style.color = 'inherit';
    });
  }

  updateMetaThemeColor() {
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.name = 'theme-color';
      document.head.appendChild(metaThemeColor);
    }

    const color = this.currentTheme === 'dark' ? '#121212' : '#ffffff';
    metaThemeColor.content = color;
  }

  getCurrentTheme() {
    return this.currentTheme;
  }

  setTheme(theme) {
    if (theme === 'light' || theme === 'dark') {
      this.currentTheme = theme;
      this.applyTheme();
      this.saveTheme();
    }
  }

  // Método para obtener colores CSS del tema actual
  getThemeColors() {
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);
    
    return {
      bgPrimary: computedStyle.getPropertyValue('--bg-primary').trim(),
      bgSecondary: computedStyle.getPropertyValue('--bg-secondary').trim(),
      textPrimary: computedStyle.getPropertyValue('--text-primary').trim(),
      textSecondary: computedStyle.getPropertyValue('--text-secondary').trim(),
      buttonPrimary: computedStyle.getPropertyValue('--button-primary').trim(),
      buttonPrimaryHover: computedStyle.getPropertyValue('--button-primary-hover').trim()
    };
  }
}

// Crear instancia global del manejador de temas
window.themeManager = new ThemeManager();

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ThemeManager;
}