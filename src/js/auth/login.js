import { API_URL, isNativePlatform } from '../core/config.js';
import { CapacitorHttp } from '@capacitor/core';

export function initLogin() {
  const loginForm = document.getElementById("loginForm");
  if (!loginForm) return;

  // Cargar estado del checkbox "Mantener sesión iniciada"
  loadRememberMeState();

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const rememberMe = document.getElementById("rememberMe").checked;

    try {
      let data;

      if (isNativePlatform) {
        const response = await CapacitorHttp.post({
          url: `${API_URL}/auth/login`,
          headers: { "Content-Type": "application/json" },
          data: { email, password },
        });
        data = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
      } else {
        const targetUrl = `${API_URL}/auth/login`;
        console.log('🔗 Login request →', targetUrl);
        const res = await fetch(targetUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        if (!res.ok) {
          const errorText = await res.text().catch(() => '(sin cuerpo)');
          console.error('❌ Login HTTP error:', { status: res.status, statusText: res.statusText, url: res.url, body: errorText });
          throw new Error(`HTTP ${res.status} ${res.statusText}: ${errorText}`);
        }
        data = await res.json();
      }

      const token = data.token || data.accessToken || data.access_token || data.jwt;
      if (!token) throw new Error("No se recibió token del servidor");
      
      // Guardar token y estado de "Mantener sesión iniciada"
      saveLoginData(token, rememberMe, email);
      
      window.location.href = "./classification.html";

    } catch (error) {
      console.error("❌ Error en login:", error);
      const message = (error && error.message) ? error.message : String(error);
      alert(`❌ Error al iniciar sesión: ${message}`);
    }
  });
}

function saveLoginData(token, rememberMe, email) {
  // Limpiar datos anteriores
  localStorage.removeItem("token");
  sessionStorage.removeItem("token");
  
  // Guardar la fecha del primer login si no existe (aproximación de cuenta creada)
  if (!localStorage.getItem("firstLoginDate")) {
    localStorage.setItem("firstLoginDate", new Date().toISOString());
  }
  
  if (rememberMe) {
    // Si "Mantener sesión iniciada" está marcado, usar localStorage (persistente)
    localStorage.setItem("token", token);
    localStorage.setItem("rememberMe", "true");
    localStorage.setItem("userEmail", email);
    
    // Guardar timestamp para verificar expiración
    const tokenData = {
      token: token,
      timestamp: Date.now(),
      email: email
    };
    localStorage.setItem("tokenData", JSON.stringify(tokenData));
  } else {
    // Si no está marcado, usar sessionStorage (solo para la sesión actual)
    sessionStorage.setItem("token", token);
    localStorage.setItem("rememberMe", "false");
  }
}

function loadRememberMeState() {
  const rememberMe = localStorage.getItem("rememberMe");
  const userEmail = localStorage.getItem("userEmail");
  
  if (rememberMe === "true" && userEmail) {
    // Marcar el checkbox si la sesión anterior tenía "Mantener sesión iniciada"
    const checkbox = document.getElementById("rememberMe");
    const emailInput = document.getElementById("email");
    
    if (checkbox) checkbox.checked = true;
    if (emailInput) emailInput.value = userEmail;
  }
}

// Función para verificar si el token está expirado
export function isTokenExpired() {
  const tokenData = localStorage.getItem("tokenData");
  
  if (!tokenData) {
    return true; // No hay token guardado
  }
  
  try {
    const data = JSON.parse(tokenData);
    const now = Date.now();
    const tokenAge = now - data.timestamp;
    
    // Considerar el token expirado después de 7 días (604800000 ms)
    const maxAge = 7 * 24 * 60 * 60 * 1000;
    
    return tokenAge > maxAge;
  } catch (error) {
    console.error("Error parsing token data:", error);
    return true;
  }
}

// Función para verificar si hay una sesión válida
export function hasValidSession() {
  const rememberMe = localStorage.getItem("rememberMe");
  const token = rememberMe === "true" ? localStorage.getItem("token") : sessionStorage.getItem("token");
  
  if (!token) {
    return false;
  }
  
  if (rememberMe === "true") {
    // Si tiene "Mantener sesión iniciada", verificar si el token no ha expirado
    return !isTokenExpired();
  }
  
  // Si no tiene "Mantener sesión iniciada", el token de sessionStorage es válido mientras dure la sesión
  return true;
}

// Función para cerrar sesión
export function logout() {
  // Limpiar todos los datos de sesión
  localStorage.removeItem("token");
  localStorage.removeItem("tokenData");
  localStorage.removeItem("rememberMe");
  localStorage.removeItem("userEmail");
  sessionStorage.removeItem("token");
  
  // Redirigir al login
  window.location.href = './login.html';
}
