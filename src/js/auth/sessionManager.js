import { hasValidSession, logout } from './login.js';

/**
 * Session Manager
 * Maneja la verificación de sesiones y redirecciones automáticas
 */

export function initSessionCheck() {
  // Verificar sesión al cargar la página
  if (!hasValidSession()) {
    // Solo redirigir si no estamos ya en la página de login
    const currentPath = window.location.pathname;
    if (!currentPath.includes('login.html') && !currentPath.includes('register.html')) {
      redirectToLogin();
      return false;
    }
    return false;
  }
  
  // Configurar verificación periódica de sesión (cada 5 minutos)
  setInterval(checkSession, 5 * 60 * 1000);
  
  return true;
}

export function checkSession() {
  if (!hasValidSession()) {
    // Mostrar notificación de sesión expirada
    showSessionExpiredNotification();
    
    // Redirigir al login después de 3 segundos
    setTimeout(() => {
      redirectToLogin();
    }, 3000);
  }
}

function showSessionExpiredNotification() {
  // Crear notificación de sesión expirada
  const notification = document.createElement('div');
  notification.className = 'session-expired-notification';
  notification.innerHTML = `
    <div class="notification-content">
      <div class="notification-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
      </div>
      <div class="notification-text">
        <h4>Sesión expirada</h4>
        <p>Tu sesión ha expirado. Serás redirigido al login.</p>
      </div>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Remover la notificación después de 3 segundos
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 3000);
}

export function redirectToLogin() {
  // Solo redirigir si no estamos ya en la página de login o register
  const currentPath = window.location.pathname;
  if (currentPath.includes('login.html') || currentPath.includes('register.html')) {
    return; // Ya estamos en login/register, no redirigir
  }
  
  // Limpiar datos de sesión antes de redirigir
  logout();
  
  // Redirigir al login
  window.location.href = './login.html';
}

// Función para verificar sesión antes de realizar acciones que requieren autenticación
export function requireAuth() {
  if (!hasValidSession()) {
    redirectToLogin();
    return false;
  }
  return true;
}

// Función para obtener el token actual
export function getCurrentToken() {
  const rememberMe = localStorage.getItem("rememberMe");
  const token = rememberMe === "true" ? localStorage.getItem('token') : sessionStorage.getItem('token');
  return token;
}

// Alias para compatibilidad
export function getToken() {
  return getCurrentToken();
}

