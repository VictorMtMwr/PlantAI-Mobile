import { API_URL, isNativePlatform } from '../core/config.js';
import { CapacitorHttp } from '@capacitor/core';

export function initLogin() {
  const loginForm = document.getElementById("loginForm");
  if (!loginForm) return;

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

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
        const res = await fetch(`${API_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        if (!res.ok) throw new Error(await res.text());
        data = await res.json();
      }

      const token = data.token || data.accessToken || data.access_token || data.jwt;
      if (!token) throw new Error("No se recibió token del servidor");
      localStorage.clear();
      localStorage.setItem("token", token);
      window.location.href = "./classification.html";

    } catch (error) {
      console.error("❌ Error en login:", error);
      alert("❌ Credenciales inválidas o error en el servidor");
    }
  });
}
