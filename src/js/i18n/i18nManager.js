import { translations } from './translations.js';

class I18nManager {
  constructor() {
    this.currentLanguage = this.loadLanguage();
    this.init();
  }

  init() {
    // Aplicar idioma guardado al cargar
    this.setLanguage(this.currentLanguage);
    
    // Asegurar que se traduzca cuando el DOM esté listo
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.translatePage();
      });
    } else {
      // DOM ya está listo
      this.translatePage();
    }
    
    // Escuchar cambios de idioma
    window.addEventListener('languageChanged', () => {
      this.translatePage();
    });
  }

  loadLanguage() {
    const savedLanguage = localStorage.getItem('plantai-language');
    return savedLanguage || 'es'; // Por defecto español
  }

  saveLanguage(language) {
    localStorage.setItem('plantai-language', language);
    this.currentLanguage = language;
  }

  setLanguage(language) {
    if (!translations[language]) {
      console.warn(`Idioma ${language} no disponible, usando español`);
      language = 'es';
    }
    
    this.saveLanguage(language);
    this.translatePage();
    
    // Disparar evento personalizado para que otros componentes se actualicen
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language } }));
  }

  translatePage() {
    const lang = translations[this.currentLanguage];
    if (!lang) return;

    // Traducir elementos con data-i18n
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      const translation = this.t(key);
      if (translation && translation !== key) {
        if (element.tagName === 'INPUT' && element.type === 'submit') {
          element.value = translation;
        } else if (element.tagName === 'INPUT' && element.placeholder !== undefined) {
          element.placeholder = translation;
        } else if (element.tagName === 'OPTION') {
          element.textContent = translation;
        } else if (element.tagName === 'BUTTON' && element.querySelector('span')) {
          // Si el botón tiene un span, traducir el span
          const span = element.querySelector('span');
          if (span && !span.hasAttribute('data-i18n')) {
            span.textContent = translation;
          } else {
            element.textContent = translation;
          }
        } else {
          // Para otros elementos, reemplazar el contenido solo si no tiene hijos con data-i18n
          const hasI18nChildren = element.querySelector('[data-i18n]');
          if (!hasI18nChildren) {
            element.textContent = translation;
          }
        }
      }
    });

    // Traducir elementos con data-i18n-html (para HTML interno)
    document.querySelectorAll('[data-i18n-html]').forEach(element => {
      const key = element.getAttribute('data-i18n-html');
      const translation = this.t(key);
      if (translation) {
        element.innerHTML = translation;
      }
    });

    // Actualizar atributos
    document.querySelectorAll('[data-i18n-title]').forEach(element => {
      const key = element.getAttribute('data-i18n-title');
      const translation = this.t(key);
      if (translation) {
        element.title = translation;
      }
    });

    document.querySelectorAll('[data-i18n-alt]').forEach(element => {
      const key = element.getAttribute('data-i18n-alt');
      const translation = this.t(key);
      if (translation) {
        element.alt = translation;
      }
    });
  }

  t(key, params = {}) {
    const lang = translations[this.currentLanguage];
    if (!lang) return key;

    let translation = lang[key] || key;

    // Reemplazar parámetros si existen
    Object.keys(params).forEach(param => {
      translation = translation.replace(`{${param}}`, params[param]);
    });

    return translation;
  }

  getCurrentLanguage() {
    return this.currentLanguage;
  }

  getAvailableLanguages() {
    return Object.keys(translations);
  }
}

// Crear instancia global del manejador de idiomas
window.i18nManager = new I18nManager();

// Exportar para uso en módulos
export default window.i18nManager;

