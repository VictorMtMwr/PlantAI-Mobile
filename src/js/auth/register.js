import { API_URL, isNativePlatform } from '../core/config.js';
import { CapacitorHttp } from '@capacitor/core';

export function initRegister() {
  const registerForm = document.getElementById("registerForm");
  if (!registerForm) return;

  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phoneNumber").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();
    const termsAccepted = document.getElementById("terms").checked;

    if (!fullName || !email || !phone || !password || !confirmPassword) {
      alert("⚠️ Todos los campos son obligatorios."); return;
    }
    if (!termsAccepted) { alert("⚠️ Debes aceptar los términos."); return; }
    if (password !== confirmPassword) { alert("⚠️ Las contraseñas no coinciden."); return; }

    try {
      const requestBody = { fullName, email, password, phone };
      let responseData;

      if (isNativePlatform) {
        const response = await CapacitorHttp.post({
          url: `${API_URL}/auth/register`,
          headers: { "Content-Type": "application/json" },
          data: requestBody,
        });
        responseData = response.data;
      } else {
        const res = await fetch(`${API_URL}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });
        responseData = await res.json();
      }

      if (responseData?.error?.toLowerCase().includes("exists")) {
        alert("⚠️ Este correo ya está registrado.");
        return;
      }

      window.location.href = "./login.html";
    } catch (error) {
      console.error("❌ Error en registro:", error);
      alert("❌ Error al registrar usuario.");
    }
  });
}
