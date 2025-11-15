import { API_URL, isNativePlatform } from '../core/config.js';
import { CapacitorHttp, Capacitor } from '@capacitor/core';
import { logout, hasValidSession } from '../auth/login.js';

class AccountManager {
  constructor() {
    if (!hasValidSession()) {
      this.redirectToLogin();
      return;
    }
    
    const rememberMe = localStorage.getItem("rememberMe");
    this.token = rememberMe === "true" ? localStorage.getItem('token') : sessionStorage.getItem('token');
    this.userData = null;
    this.tokenVisible = false;
    this.detailsExpanded = false;
    this.init();
  }

  async init() {
    if (!this.token) {
      this.redirectToLogin();
      return;
    }

    this.setupEventListeners();
    
    // Esperar un momento para que themeManager se inicialice
    setTimeout(() => {
      this.updateThemeDisplay();
    }, 100);
    
    await this.loadUserData();
  }

  setupEventListeners() {
    const toggleTokenBtn = document.getElementById('toggleToken');
    if (toggleTokenBtn) {
      console.log('✅ Botón toggleToken encontrado');
      toggleTokenBtn.addEventListener('click', () => {
        console.log('👁️ Click en botón toggleToken');
        this.toggleTokenVisibility();
      });
    } else {
      console.error('❌ Botón toggleToken NO encontrado');
    }

    const copyTokenBtn = document.getElementById('copyToken');
    if (copyTokenBtn) {
      copyTokenBtn.addEventListener('click', () => this.copyToken());
    }

    const themeToggleCard = document.getElementById('themeToggleCard');
    if (themeToggleCard) {
      // Soporte para web y móvil
      const handleThemeToggle = (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('🎨 Botón de tema presionado en cuenta');
        this.toggleTheme();
      };
      
      themeToggleCard.addEventListener('click', handleThemeToggle);
      themeToggleCard.addEventListener('touchend', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('👆 Touch en botón de tema');
        this.toggleTheme();
      });
    }

    const exportDataCard = document.getElementById('exportDataCard');
    if (exportDataCard) {
      exportDataCard.addEventListener('click', () => this.exportData());
    }

    const settingsCard = document.getElementById('settingsCard');
    if (settingsCard) {
      settingsCard.addEventListener('click', () => this.openSettings());
    }

    const logoutCard = document.getElementById('logoutCard');
    if (logoutCard) {
      logoutCard.addEventListener('click', () => this.showLogoutConfirmation());
    }

    const toggleDetails = document.getElementById('toggleDetails');
    if (toggleDetails) {
      toggleDetails.addEventListener('click', () => this.toggleAccountDetails());
    }

    const retryBtn = document.getElementById('retryBtn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => this.loadUserData());
    }

    window.addEventListener('themeChanged', () => {
      this.updateThemeDisplay();
    });
    
    // Actualizar tema al hacer la página visible (cuando vuelves a ella)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        console.log('📄 Página visible de nuevo, actualizando tema...');
        setTimeout(() => {
          this.updateThemeDisplay();
        }, 100);
      }
    });
    
    // Actualizar al cargar la página
    window.addEventListener('pageshow', () => {
      console.log('📄 Página cargada/mostrada, actualizando tema...');
      setTimeout(() => {
        this.updateThemeDisplay();
      }, 100);
    });
  }

  updateThemeDisplay() {
    const currentThemeText = document.getElementById('currentThemeText');
    
    // Leer el tema REAL del DOM, no de localStorage
    const htmlTheme = document.documentElement.getAttribute('data-theme');
    let currentTheme = htmlTheme === 'dark' ? 'dark' : 'light';
    
    // Verificar también con themeManager si está disponible
    if (window.themeManager) {
      currentTheme = window.themeManager.getCurrentTheme();
      console.log('📱 Tema desde themeManager:', currentTheme);
    } else {
      console.log('📱 Tema desde HTML:', currentTheme);
    }
    
    if (currentThemeText) {
      currentThemeText.textContent = currentTheme === 'dark' ? 'Modo oscuro' : 'Modo claro';
      console.log('📱 Texto del tema actualizado a:', currentTheme);
    }
    
    // Actualizar iconos del botón de tema
    const themeCard = document.getElementById('themeToggleCard');
    if (themeCard) {
      const sunIcon = themeCard.querySelector('.sun-icon');
      const moonIcon = themeCard.querySelector('.moon-icon');
      
      if (currentTheme === 'dark') {
        if (sunIcon) sunIcon.style.display = 'block';
        if (moonIcon) moonIcon.style.display = 'none';
      } else {
        if (sunIcon) sunIcon.style.display = 'none';
        if (moonIcon) moonIcon.style.display = 'block';
      }
    }
  }

  toggleTheme() {
    console.log('🔄 toggleTheme() llamado en account.js');
    
    // Asegurar que themeManager existe
    if (!window.themeManager) {
      console.warn('⚠️ themeManager no existe, intentando obtener desde localStorage');
      
      // Fallback: cambiar tema manualmente
      const currentTheme = localStorage.getItem('plantai-theme') || 'light';
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      
      console.log('Cambiando de', currentTheme, 'a', newTheme);
      
      // Aplicar cambio directamente
      localStorage.setItem('plantai-theme', newTheme);
      
      const html = document.documentElement;
      if (newTheme === 'dark') {
        html.setAttribute('data-theme', 'dark');
        document.body.classList.add('dark-theme');
        document.body.classList.remove('light-theme');
      } else {
        html.removeAttribute('data-theme');
        document.body.classList.add('light-theme');
        document.body.classList.remove('dark-theme');
      }
      
      this.updateThemeDisplay();
      this.showToast('Tema cambiado', 'success');
      return;
    }
    
    // Si themeManager existe, usarlo normalmente
    console.log('ThemeManager disponible:', !!window.themeManager);
    console.log('Tema actual antes:', window.themeManager.getCurrentTheme());
    
    window.themeManager.toggleTheme();
    
    console.log('Tema actual después:', window.themeManager.getCurrentTheme());
    this.updateThemeDisplay();
    this.showToast('Tema cambiado', 'success');
  }

  async exportData() {
    try {
      this.showToast('Preparando exportación...', 'info');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Solo exportar datos reales que existan en localStorage
      const realData = this.getRealUserData();
      
      if (!realData.hasData) {
        this.showToast('No hay datos para exportar', 'info');
        return;
      }

      const blob = new Blob([JSON.stringify(realData.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `plantai-datos-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      this.showToast(`Datos exportados: ${realData.summary}`, 'success');
    } catch (error) {
      console.error('Error exporting data:', error);
      this.showToast('Error al exportar datos', 'error');
    }
  }

  getRealUserData() {
    const data = {
      exportDate: new Date().toISOString(),
      app: 'PlantAI Mobile'
    };
    
    let hasData = false;
    let summary = '';
    
    // Solo agregar datos que realmente existan
    const classificationHistory = this.getClassificationHistory();
    if (classificationHistory.length > 0) {
      data.classificationHistory = classificationHistory;
      data.totalClassifications = classificationHistory.length;
      hasData = true;
      summary += `${classificationHistory.length} clasificaciones`;
    }
    
    // Verificar si hay token de autenticación
    const rememberMe = localStorage.getItem('rememberMe');
    const token = rememberMe === "true" ? localStorage.getItem('token') : sessionStorage.getItem('token');
    if (token) {
      data.hasAuthToken = true;
      if (summary) summary += ', ';
      summary += 'token de sesión';
      hasData = true;
    }
    
    // Verificar configuraciones guardadas
    const theme = localStorage.getItem('theme');
    if (theme) {
      data.settings = { theme };
      if (summary) summary += ', ';
      summary += 'configuraciones';
      hasData = true;
    }
    
    if (!hasData) {
      summary = 'sin datos';
    }
    
    return { hasData, data, summary };
  }

  getClassificationHistory() {
    try {
      const history = JSON.parse(localStorage.getItem('classificationHistory') || '[]');
      return Array.isArray(history) ? history : [];
    } catch (error) {
      console.error('Error reading classification history:', error);
      return [];
    }
  }

  openSettings() {
    const settingsHTML = `
      <div class="settings-modal">
        <div class="settings-content">
          <div class="settings-header">
            <h3>Configuraciones</h3>
            <span class="close-settings">&times;</span>
          </div>
          <div class="settings-body">
            <div class="setting-item">
              <label>Tema de la aplicación</label>
              <select id="themeSelect">
                <option value="light">Claro</option>
                <option value="dark">Oscuro</option>
                <option value="auto">Automático</option>
              </select>
            </div>
            <div class="setting-item">
              <label>Guardar imágenes clasificadas</label>
              <input type="checkbox" id="saveImages" checked>
            </div>
            <div class="setting-item">
              <label>Notificaciones</label>
              <input type="checkbox" id="notifications" checked>
            </div>
            <div class="setting-item">
              <label>Limpiar historial de clasificaciones</label>
              <button id="clearHistory" class="btn-danger">Limpiar Historial</button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Agregar el modal al body
    const modal = document.createElement('div');
    modal.innerHTML = settingsHTML;
    document.body.appendChild(modal.firstElementChild);
    
    // Configurar valores actuales
    const themeSelect = document.getElementById('themeSelect');
    const currentTheme = localStorage.getItem('theme') || 'auto';
    themeSelect.value = currentTheme;
    
    // Event listeners
    document.querySelector('.close-settings').addEventListener('click', () => {
      document.querySelector('.settings-modal').remove();
    });
    
    themeSelect.addEventListener('change', (e) => {
      const newTheme = e.target.value;
      if (window.themeManager) {
        if (newTheme === 'auto') {
          window.themeManager.setAutoTheme();
        } else {
          window.themeManager.setTheme(newTheme);
        }
      }
    });
    
    document.getElementById('clearHistory').addEventListener('click', () => {
      if (confirm('¿Estás seguro de que quieres limpiar todo el historial de clasificaciones?')) {
        localStorage.removeItem('classificationHistory');
        this.showToast('Historial limpiado exitosamente', 'success');
        this.displayUserData(); // Actualizar el conteo
        document.querySelector('.settings-modal').remove();
      }
    });
    
    // Cerrar al hacer click fuera
    document.querySelector('.settings-modal').addEventListener('click', (e) => {
      if (e.target.classList.contains('settings-modal')) {
        document.querySelector('.settings-modal').remove();
      }
    });
  }

  showLogoutConfirmation() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      this.logout();
    }
  }

  toggleAccountDetails() {
    const toggleBtn = document.getElementById('toggleDetails');
    const content = document.getElementById('accountDetailsContent');
    
    this.detailsExpanded = !this.detailsExpanded;
    
    if (this.detailsExpanded) {
      content.classList.remove('collapsed');
      content.classList.add('expanded');
      toggleBtn.classList.add('expanded');
    } else {
      content.classList.remove('expanded');
      content.classList.add('collapsed');
      toggleBtn.classList.remove('expanded');
    }
  }

  async loadUserData() {
    this.showLoading();
    
    try {
      // Primero intentar cargar datos del servidor
      const requestConfig = {
        url: `${API_URL}/user/profile`,
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      };

      let response;
      if (isNativePlatform()) {
        response = await CapacitorHttp.get(requestConfig);
      } else {
        const fetchResponse = await fetch(requestConfig.url, {
          method: 'GET',
          headers: requestConfig.headers,
        });
        response = {
          status: fetchResponse.status,
          data: await fetchResponse.json()
        };
      }

      if (response.status === 200 && response.data) {
        this.userData = response.data;
        console.log('✅ Datos del usuario cargados desde el servidor:', this.userData);
        console.log('🔍 Rol del usuario desde la API:', this.userData.role);
        console.log('🔍 Todos los campos disponibles:', Object.keys(this.userData));
        
        // Asegurar que el rol se obtenga correctamente de la API
        if (!this.userData.role) {
          console.warn('⚠️ El campo "role" no está presente en la respuesta de la API');
          console.log('🔍 Buscando variantes del campo role:', {
            role: this.userData.role,
            userRole: this.userData.userRole,
            user_role: this.userData.user_role,
            roles: this.userData.roles,
            userType: this.userData.userType
          });
        } else {
          console.log('✅ Rol encontrado en la API:', this.userData.role);
        }
        
        // Normalizar fechas del servidor si vienen en diferentes formatos
        console.log('🔍 Buscando campos de fecha en los datos del servidor...');
        console.log('  - createdAt:', this.userData.createdAt);
        console.log('  - created_at:', this.userData.created_at);
        console.log('  - accountCreatedAt:', this.userData.accountCreatedAt);
        console.log('  - registeredAt:', this.userData.registeredAt);
        
        if (this.userData.createdAt) {
          this.userData.createdAt = new Date(this.userData.createdAt);
          console.log('📅 Usando createdAt:', this.userData.createdAt);
        } else if (this.userData.created_at) {
          this.userData.createdAt = new Date(this.userData.created_at);
          console.log('📅 Usando created_at:', this.userData.createdAt);
        } else if (this.userData.accountCreatedAt) {
          this.userData.createdAt = new Date(this.userData.accountCreatedAt);
          console.log('📅 Usando accountCreatedAt:', this.userData.createdAt);
        } else if (this.userData.registeredAt) {
          this.userData.createdAt = new Date(this.userData.registeredAt);
          console.log('📅 Usando registeredAt:', this.userData.createdAt);
        } else {
          console.warn('⚠️ No se encontró ningún campo de fecha de creación en los datos del servidor');
        }
        
        if (this.userData.lastLogin) {
          this.userData.lastLogin = new Date(this.userData.lastLogin);
        } else if (this.userData.last_login) {
          this.userData.lastLogin = new Date(this.userData.last_login);
        }
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.warn('⚠️ Could not load data from server, using local data:', error);
      // Si falla el servidor, usar datos locales del token
      this.userData = this.getUserDataFromToken();
      console.log('📝 Usando datos del token JWT:', this.userData);
    }
    
    // Siempre mostrar datos (del servidor o locales)
    this.displayUserData();
    this.hideLoading();
  }

  getUserDataFromToken() {
    // Intentar decodificar el JWT para obtener información básica
    try {
      const tokenParts = this.token.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        // Solo usar datos que realmente existan en el token
        const userData = {};
        
        // Extraer nombre completo
        if (payload.fullName) userData.fullName = payload.fullName;
        else if (payload.full_name) userData.fullName = payload.full_name;
        else if (payload.name) userData.fullName = payload.name;
        else if (payload.username) userData.fullName = payload.username;
        else userData.fullName = 'Usuario';
        
        // Extraer nombre de usuario
        if (payload.name) userData.name = payload.name;
        else if (payload.username) userData.name = payload.username;
        else userData.name = 'Usuario';
        
        // Extraer email
        if (payload.email) userData.email = payload.email;
        else userData.email = 'Sin email';
        
        // Extraer username
        if (payload.username) userData.username = payload.username;
        else if (payload.sub) userData.username = payload.sub;
        else userData.username = 'usuario';
        
        // Extraer rol
        if (payload.role) userData.role = payload.role;
        else if (payload.roles) userData.role = Array.isArray(payload.roles) ? payload.roles[0] : payload.roles;
        else if (payload.authorities) userData.role = Array.isArray(payload.authorities) ? payload.authorities[0] : payload.authorities;
        else userData.role = 'user';
        
        // Extraer fechas - buscar múltiples campos posibles
        // Buscar fecha de creación de cuenta (NO usar iat que es fecha del token)
        if (payload.createdAt) {
          // Si es timestamp en segundos
          userData.createdAt = typeof payload.createdAt === 'number' && payload.createdAt < 10000000000
            ? new Date(payload.createdAt * 1000)
            : new Date(payload.createdAt);
        } else if (payload.created_at) {
          userData.createdAt = typeof payload.created_at === 'number' && payload.created_at < 10000000000
            ? new Date(payload.created_at * 1000)
            : new Date(payload.created_at);
        } else if (payload.accountCreatedAt) {
          userData.createdAt = typeof payload.accountCreatedAt === 'number' && payload.accountCreatedAt < 10000000000
            ? new Date(payload.accountCreatedAt * 1000)
            : new Date(payload.accountCreatedAt);
        } else if (payload.registeredAt) {
          userData.createdAt = typeof payload.registeredAt === 'number' && payload.registeredAt < 10000000000
            ? new Date(payload.registeredAt * 1000)
            : new Date(payload.registeredAt);
        }
        // Si no hay fecha de creación en el token, no establecer createdAt
        // NO usar iat porque es la fecha del token, no de la cuenta
        
        // Como fallback, usar la fecha del primer login guardada en localStorage
        if (!userData.createdAt) {
          const firstLoginDate = localStorage.getItem("firstLoginDate");
          if (firstLoginDate) {
            userData.createdAt = new Date(firstLoginDate);
            console.log('📅 Usando fecha del primer login como createdAt:', userData.createdAt);
          }
        }
        
        console.log('Datos extraídos del token:', userData);
        console.log('Payload completo del token:', payload);
        return userData;
      }
    } catch (error) {
      console.warn('Could not decode token:', error);
    }
    
    // Fallback mínimo cuando no hay token válido
    return {
      fullName: 'Usuario',
      name: 'Usuario',
      email: 'Sin email',
      username: 'usuario',
      role: 'user'
    };
  }

  async displayUserData() {
    const userNameElement = document.getElementById('userName');
    const userEmailElement = document.getElementById('userEmail');
    const userRoleTextElement = document.getElementById('userRoleText');
    const totalScansElement = document.getElementById('totalScans');
    const joinDateElement = document.getElementById('joinDate');
    const lastLoginElement = document.getElementById('lastLogin');
    
    // Nuevos elementos para la sección de información personal
    const fullNameElement = document.getElementById('fullName');
    const emailInfoElement = document.getElementById('emailInfo');
    const roleBadgeElement = document.getElementById('roleBadge');
    const userSinceInfoElement = document.getElementById('userSinceInfo');

    if (this.userData) {
      // Actualizar elementos del header
      if (userNameElement) {
        userNameElement.textContent = this.userData.name || this.userData.username || 'Usuario';
      }
      
      if (userEmailElement) {
        userEmailElement.textContent = this.userData.email || 'Sin email';
      }
      
      if (userRoleTextElement) {
        const roleText = this.formatRole(this.userData.role || 'user');
        userRoleTextElement.textContent = roleText;
      }
      
      if (totalScansElement) {
        // Mostrar un placeholder mientras se carga
        totalScansElement.textContent = '...';
        const totalScans = await this.getTotalScans();
        totalScansElement.textContent = totalScans;
        console.log('📊 Total de escaneos:', totalScans);
      }
      
      if (joinDateElement) {
        if (this.userData.createdAt) {
          const joinDate = new Date(this.userData.createdAt);
          if (!isNaN(joinDate.getTime())) {
            joinDateElement.textContent = this.formatDate(joinDate);
            console.log('📅 Fecha de creación de cuenta:', joinDate);
          } else {
            joinDateElement.textContent = 'Sin registro';
            console.warn('⚠️ Fecha inválida:', this.userData.createdAt);
          }
        } else {
          joinDateElement.textContent = 'Sin registro';
          console.log('📅 No hay fecha de creación de cuenta');
        }
      }
      
      if (lastLoginElement) {
        if (this.userData.lastLogin) {
          const lastLogin = new Date(this.userData.lastLogin);
          lastLoginElement.textContent = this.formatDateTime(lastLogin);
        } else {
          lastLoginElement.textContent = 'Sin registro';
        }
      }
      
      // Actualizar elementos de la sección de información personal
      if (fullNameElement) {
        fullNameElement.textContent = this.userData.fullName || this.userData.name || 'Usuario';
      }
      
      if (emailInfoElement) {
        emailInfoElement.textContent = this.userData.email || 'Sin email';
      }
      
      if (roleBadgeElement) {
        // Usar el rol de la API, no un valor por defecto
        const userRole = this.userData.role;
        if (userRole) {
          const roleText = this.formatRole(userRole);
          console.log('🔍 Rol del usuario desde API:', userRole, '-> Formateado:', roleText);
          roleBadgeElement.textContent = roleText;
          roleBadgeElement.className = 'role-badge ' + this.getRoleClass(userRole);
        } else {
          console.warn('⚠️ No se encontró el campo "role" en los datos del usuario');
          roleBadgeElement.textContent = 'No disponible';
          roleBadgeElement.className = 'role-badge role-user';
        }
      } else {
        console.warn('⚠️ No se encontró el elemento roleBadgeElement');
      }
      
      if (userSinceInfoElement) {
        if (this.userData.createdAt) {
          const joinDate = new Date(this.userData.createdAt);
          if (!isNaN(joinDate.getTime())) {
            userSinceInfoElement.textContent = this.formatFullDate(joinDate);
            console.log('📅 Usuario desde (fecha completa):', this.formatFullDate(joinDate));
          } else {
            userSinceInfoElement.textContent = 'Fecha no disponible';
            console.warn('⚠️ Fecha inválida en userSinceInfo:', this.userData.createdAt);
          }
        } else {
          userSinceInfoElement.textContent = 'Fecha no disponible';
          console.log('📅 No hay fecha de creación en userSinceInfo');
        }
      }
    }
  }

  formatRole(role) {
    if (!role) return 'Usuario';
    
    // Normalizar el rol a minúsculas para la búsqueda
    const normalizedRole = role.toLowerCase();
    
    const roleMap = {
      'admin': 'Administrador',
      'administrator': 'Administrador',
      'user': 'Usuario',
      'moderator': 'Moderador',
      'premium': 'Premium',
      'contributor': 'Contribuidor',
      'role_admin': 'Administrador',
      'role_user': 'Usuario',
      'role_moderator': 'Moderador',
      'role_premium': 'Premium',
      'role_contributor': 'Contribuidor'
    };
    
    return roleMap[normalizedRole] || role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  }

  getRoleClass(role) {
    if (!role) return 'role-user';
    
    // Normalizar el rol a minúsculas para la búsqueda
    const normalizedRole = role.toLowerCase();
    
    const roleClassMap = {
      'admin': 'role-admin',
      'administrator': 'role-admin',
      'moderator': 'role-moderator',
      'premium': 'role-premium',
      'user': 'role-user',
      'contributor': 'role-contributor',
      'role_admin': 'role-admin',
      'role_user': 'role-user',
      'role_moderator': 'role-moderator',
      'role_premium': 'role-premium',
      'role_contributor': 'role-contributor'
    };
    
    return roleClassMap[normalizedRole] || 'role-user';
  }

  formatFullDate(date) {
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  }

  async getTotalScans() {
    try {
      // Obtener el conteo desde el servidor (igual que en historial.js)
      const token = this.token;
      if (!token) {
        console.warn('⚠️ No hay token disponible');
        return 0;
      }

      let data;

      if (Capacitor.isNativePlatform()) {
        const response = await CapacitorHttp.get({
          url: `${API_URL}/plant-classifier/classifications`,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        data = response.data;
      } else {
        const response = await fetch(`${API_URL}/plant-classifier/classifications`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          console.warn('⚠️ Error al obtener clasificaciones:', response.status);
          return 0;
        }
        
        data = await response.json();
      }

      // El servidor devuelve { count, pages, results }
      const count = data.count || 0;
      console.log('✅ Total de clasificaciones obtenido del servidor:', count);
      return count;

    } catch (error) {
      console.error('❌ Error al obtener total de escaneos:', error);
      return 0;
    }
  }

  formatDate(date) {
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays}d`;
    } else if (diffDays < 365) {
      return `${Math.floor(diffDays / 30)}m`;
    } else {
      return `${Math.floor(diffDays / 365)}a`;
    }
  }

  formatDateTime(date) {
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 60) {
      return `Hace ${diffMinutes} min`;
    } else if (diffHours < 24) {
      return `Hace ${diffHours}h`;
    } else if (diffDays < 7) {
      return `Hace ${diffDays}d`;
    } else {
      return date.toLocaleDateString('es-ES', { 
        day: 'numeric', 
        month: 'short' 
      });
    }
  }

  toggleTokenVisibility() {
    console.log('🔍 toggleTokenVisibility llamado');
    console.log('Estado actual tokenVisible:', this.tokenVisible);
    console.log('Token actual:', this.token ? 'existe' : 'no existe');
    
    const tokenDisplay = document.getElementById('tokenDisplay');
    const toggleBtn = document.getElementById('toggleToken');
    
    if (!tokenDisplay) {
      console.error('❌ tokenDisplay NO encontrado');
      return;
    }
    
    console.log('Texto actual del tokenDisplay:', tokenDisplay.textContent);
    
    this.tokenVisible = !this.tokenVisible;
    
    if (this.tokenVisible) {
      // Mostrar el token real
      tokenDisplay.textContent = this.token || 'No hay token';
      tokenDisplay.classList.add('visible');
      console.log('👁️ Token VISIBLE - Nuevo texto:', tokenDisplay.textContent);
      console.log('Longitud del token:', this.token ? this.token.length : 0);
    } else {
      // Ocultar el token
      tokenDisplay.textContent = '••••••••••••••••••••••••••••••••';
      tokenDisplay.classList.remove('visible');
      console.log('🙈 Token OCULTO');
    }
  }

  async copyToken() {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(this.token);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = this.token;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      
      this.showToast('Token copiado al portapapeles', 'success');
    } catch (error) {
      console.error('Error copying token:', error);
      this.showToast('Error al copiar token', 'error');
    }
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    Object.assign(toast.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: type === 'success' ? 'var(--success-color)' : 
                  type === 'error' ? 'var(--error-color)' : 
                  type === 'warning' ? 'var(--warning-color)' : 'var(--info-color)',
      color: 'white',
      padding: '12px 16px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      zIndex: '9999',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      transform: 'translateX(100%)',
      transition: 'transform 0.3s ease',
      maxWidth: '300px',
      wordWrap: 'break-word'
    });

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.transform = 'translateX(0)';
    }, 100);

    setTimeout(() => {
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 3000);
  }

  async logout() {
    try {
      this.showToast('Cerrando sesión...', 'info');
      // Pequeño delay para que se vea el mensaje
      await new Promise(resolve => setTimeout(resolve, 500));
      logout(); // Esta función redirige automáticamente
    } catch (error) {
      console.error('Error during logout:', error);
      this.showToast('Error al cerrar sesión', 'error');
      // Intentar cerrar sesión de todas formas
      logout();
    }
  }

  showLoading() {
    const loadingState = document.getElementById('loadingState');
    const errorState = document.getElementById('errorState');
    
    if (loadingState) loadingState.style.display = 'flex';
    if (errorState) errorState.classList.add('hidden');
  }

  hideLoading() {
    const loadingState = document.getElementById('loadingState');
    if (loadingState) loadingState.style.display = 'none';
  }

  showError() {
    const loadingState = document.getElementById('loadingState');
    const errorState = document.getElementById('errorState');
    
    if (loadingState) loadingState.style.display = 'none';
    if (errorState) errorState.classList.remove('hidden');
  }

  redirectToLogin() {
    window.location.href = '../pages/login.html';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new AccountManager();
});