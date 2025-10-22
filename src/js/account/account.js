import { API_URL, isNativePlatform } from '../core/config.js';
import { CapacitorHttp } from '@capacitor/core';
import { logout, hasValidSession } from '../auth/login.js';

class AccountManager {
  constructor() {
    // Verificar si hay una sesión válida
    if (!hasValidSession()) {
      this.redirectToLogin();
      return;
    }
    
    // Obtener el token desde localStorage o sessionStorage
    const rememberMe = localStorage.getItem("rememberMe");
    this.token = rememberMe === "true" ? localStorage.getItem('token') : sessionStorage.getItem('token');
    this.userData = null;
    this.init();
  }

  async init() {
    if (!this.token) {
      this.redirectToLogin();
      return;
    }

    this.setupEventListeners();
    await this.loadUserData();
  }

  setupEventListeners() {
    // Toggle token visibility
    const toggleTokenBtn = document.getElementById('toggleToken');
    if (toggleTokenBtn) {
      toggleTokenBtn.addEventListener('click', () => this.toggleTokenVisibility());
    }

    // Copy token
    const copyTokenBtn = document.getElementById('copyToken');
    if (copyTokenBtn) {
      copyTokenBtn.addEventListener('click', () => this.copyToken());
    }

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.logout());
    }

    // Retry button
    const retryBtn = document.getElementById('retryBtn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => this.loadUserData());
    }
  }

  async loadUserData() {
    this.showLoading();
    this.hideError();

    try {
      // Primero intentamos obtener la información del usuario desde el token
      const userData = await this.getUserInfoFromToken();
      
      if (userData) {
        this.userData = userData;
        this.displayUserData(userData);
        this.hideLoading();
      } else {
        // Si no podemos obtener info del token, intentamos hacer una petición al servidor
        const serverData = await this.getUserInfoFromServer();
        this.userData = serverData;
        this.displayUserData(serverData);
        this.hideLoading();
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      this.showError();
      this.hideLoading();
    }
  }

  async getUserInfoFromToken() {
    try {
      // Decodificar el token JWT (solo la parte del payload)
      const tokenParts = this.token.split('.');
      if (tokenParts.length !== 3) {
        throw new Error('Invalid token format');
      }

      const payload = JSON.parse(atob(tokenParts[1]));
      
      // Formatear los datos del usuario
      return {
        id: payload.sub || payload.id || payload.user_id,
        name: payload.name || payload.full_name || payload.username || 'Usuario',
        email: payload.email || payload.email_address,
        status: payload.status || 'Activo',
        createdAt: payload.created_at || payload.iat ? new Date(payload.iat * 1000).toLocaleDateString() : 'No disponible',
        role: payload.role || payload.user_role || 'Usuario',
        permissions: payload.permissions || [],
        ...payload // Incluir cualquier otra propiedad del token
      };
    } catch (error) {
      console.error('Error parsing token:', error);
      return null;
    }
  }

  async getUserInfoFromServer() {
    try {
      let response;
      
      if (isNativePlatform) {
        response = await CapacitorHttp.get({
          url: `${API_URL}/auth/me`,
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          }
        });
      } else {
        response = await fetch(`${API_URL}/auth/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        response = { data: await response.json() };
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching user data from server:', error);
      throw error;
    }
  }

  displayUserData(userData) {
    // Información básica del perfil
    const userName = document.getElementById('userName');
    const userEmail = document.getElementById('userEmail');
    
    if (userName) userName.textContent = userData.name || userData.full_name || 'Usuario';
    if (userEmail) userEmail.textContent = userData.email || 'No disponible';

    // Mostrar toda la información del usuario de manera organizada
    this.displayAllUserInfo(userData);
  }

  displayAllUserInfo(userData) {
    // Crear una sección para mostrar toda la información del usuario
    let userInfoSection = document.getElementById('allUserInfo');
    
    if (!userInfoSection) {
      userInfoSection = document.createElement('section');
      userInfoSection.id = 'allUserInfo';
      userInfoSection.className = 'all-user-info-section';
      userInfoSection.innerHTML = `
        <h3 class="section-title">Información del Usuario</h3>
        <div id="userDataContainer" class="user-data-container"></div>
      `;
      
      const tokenSection = document.querySelector('.token-section');
      if (tokenSection && tokenSection.parentNode) {
        tokenSection.parentNode.insertBefore(userInfoSection, tokenSection);
      }
    }

    const userDataContainer = document.getElementById('userDataContainer');
    if (userDataContainer) {
      // Filtrar información sensible
      const safeData = { ...userData };
      if (safeData.password) delete safeData.password;
      if (safeData.token) delete safeData.token;
      
      // Crear tarjetas para todos los campos disponibles
      const userCards = Object.entries(safeData)
        .filter(([key, value]) => value !== null && value !== undefined)
        .map(([key, value]) => this.createInfoCard(key, value))
        .join('');

      userDataContainer.innerHTML = userCards || '<p class="no-additional-data">No hay información disponible.</p>';
    }
  }

  createInfoCard(key, value) {
    // Mapear claves a nombres más legibles
    const keyMappings = {
      'id': 'ID del Usuario',
      'fullName': 'Nombre Completo',
      'role': 'Rol',
      'permissions': 'Permisos',
      'iat': 'Fecha de Emisión del Token',
      'exp': 'Fecha de Expiración del Token',
      'username': 'Nombre de Usuario',
      'firstName': 'Nombre',
      'lastName': 'Apellido',
      'phone': 'Teléfono',
      'address': 'Dirección',
      'city': 'Ciudad',
      'country': 'País',
      'zipCode': 'Código Postal',
      'isActive': 'Usuario Activo',
      'isVerified': 'Usuario Verificado',
      'lastLogin': 'Último Inicio de Sesión',
      'loginCount': 'Número de Inicios de Sesión',
      'preferences': 'Preferencias',
      'settings': 'Configuraciones',
      'subscription': 'Suscripción',
      'plan': 'Plan',
      'trialEnd': 'Fin del Período de Prueba',
      'created_at': 'Fecha de Creación',
      'updated_at': 'Fecha de Actualización'
    };

    const displayKey = keyMappings[key] || key.charAt(0).toUpperCase() + key.slice(1);
    const displayValue = this.formatValue(value);

    return `
      <div class="additional-info-card">
        <div class="additional-info-icon">
          ${this.getIconForKey(key)}
        </div>
        <div class="additional-info-content">
          <h4>${displayKey}</h4>
          <p>${displayValue}</p>
        </div>
      </div>
    `;
  }

  formatValue(value) {
    if (Array.isArray(value)) {
      if (value.length === 0) return 'Ninguno';
      return value.join(', ');
    }
    
    if (typeof value === 'boolean') {
      return value ? 'Sí' : 'No';
    }
    
    if (typeof value === 'number') {
      // Si es una fecha en formato timestamp
      if (value > 1000000000 && value < 9999999999) {
        return new Date(value * 1000).toLocaleString('es-ES');
      }
      return value.toString();
    }
    
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value, null, 2);
    }
    
    return value.toString();
  }

  getIconForKey(key) {
    const iconMappings = {
      'id': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M9 12l2 2 4-4"></path>
        <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"></path>
        <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"></path>
        <path d="M12 3c0 1-1 3-3 3s-3-2-3-3 1-3 3-3 3 2 3 3"></path>
        <path d="M12 21c0-1 1-3 3-3s3 2 3 3-1 3-3 3-3-2-3-3"></path>
      </svg>`,
      'fullName': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>`,
      'role': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
      </svg>`,
      'permissions': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M9 12l2 2 4-4"></path>
        <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"></path>
        <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"></path>
        <path d="M12 3c0 1-1 3-3 3s-3-2-3-3 1-3 3-3 3 2 3 3"></path>
        <path d="M12 21c0-1 1-3 3-3s3 2 3 3-1 3-3 3-3-2-3-3"></path>
      </svg>`,
      'iat': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12,6 12,12 16,14"></polyline>
      </svg>`,
      'exp': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12,6 12,12 16,14"></polyline>
      </svg>`,
      'username': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>`,
      'phone': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
      </svg>`,
      'address': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      </svg>`,
      'isActive': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M9 12l2 2 4-4"></path>
        <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"></path>
        <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"></path>
        <path d="M12 3c0 1-1 3-3 3s-3-2-3-3 1-3 3-3 3 2 3 3"></path>
        <path d="M12 21c0-1 1-3 3-3s3 2 3 3-1 3-3 3-3-2-3-3"></path>
      </svg>`,
      'lastLogin': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12,6 12,12 16,14"></polyline>
      </svg>`
    };

    return iconMappings[key] || `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="9" y1="9" x2="15" y2="15"></line>
      <line x1="15" y1="9" x2="9" y2="15"></line>
    </svg>`;
  }

  toggleTokenVisibility() {
    const tokenDisplay = document.getElementById('tokenDisplay');
    const eyeIcon = document.querySelector('.eye-icon');
    
    if (!tokenDisplay) return;

    if (tokenDisplay.classList.contains('visible')) {
      tokenDisplay.textContent = '••••••••••••••••••••••••••••••••';
      tokenDisplay.classList.remove('visible');
      eyeIcon.innerHTML = `
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      `;
    } else {
      tokenDisplay.textContent = this.token;
      tokenDisplay.classList.add('visible');
      eyeIcon.innerHTML = `
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
        <line x1="1" y1="1" x2="23" y2="23"></line>
      `;
    }
  }

  async copyToken() {
    try {
      await navigator.clipboard.writeText(this.token);
      
      // Mostrar feedback visual
      const copyBtn = document.getElementById('copyToken');
      const originalText = copyBtn.innerHTML;
      copyBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20,6 9,17 4,12"></polyline>
        </svg>
        Copiado
      `;
      
      setTimeout(() => {
        copyBtn.innerHTML = originalText;
      }, 2000);
    } catch (error) {
      console.error('Error copying token:', error);
      alert('No se pudo copiar el token');
    }
  }

  logout() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      logout();
      window.location.href = './login.html';
    }
  }

  showLoading() {
    const loadingState = document.getElementById('loadingState');
    if (loadingState) {
      loadingState.classList.remove('hidden');
    }
  }

  hideLoading() {
    const loadingState = document.getElementById('loadingState');
    if (loadingState) {
      loadingState.classList.add('hidden');
    }
  }

  showError() {
    const errorState = document.getElementById('errorState');
    if (errorState) {
      errorState.classList.remove('hidden');
    }
  }

  hideError() {
    const errorState = document.getElementById('errorState');
    if (errorState) {
      errorState.classList.add('hidden');
    }
  }

  redirectToLogin() {
    window.location.href = './login.html';
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  new AccountManager();
});
