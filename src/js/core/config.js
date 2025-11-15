import { Capacitor } from '@capacitor/core';

export const isNativePlatform = Capacitor.isNativePlatform();
export const isLocal = window.location.hostname === "localhost" || window.location.hostname.includes("192.168.");

// En plataforma nativa, siempre usar URL completa con protocolo
// En web local, usar proxy de Vite; en producción, usar URL completa del backend
export const API_URL = isNativePlatform
  ? "https://plantai.lab.utb.edu.co/api/v1" // En nativo siempre URL completa (HTTPS usa puerto 443 por defecto)
  : isLocal
    ? "/api/v1" // En web local, usar proxy de Vite
    : "https://plantai.lab.utb.edu.co/api/v1"; // En producción web, usar URL completa del backend (HTTPS)

console.log("🔍 Plataforma nativa:", isNativePlatform);
console.log("🔍 isLocal:", isLocal);
console.log("🔍 API_URL final:", API_URL);
