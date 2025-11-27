import { Capacitor } from '@capacitor/core';

export const isNativePlatform = Capacitor.isNativePlatform();
export const isLocal = window.location.hostname === "localhost" || window.location.hostname.includes("192.168.");

// En plataforma nativa, siempre usar URL completa con protocolo
// En web, usar ruta relativa para evitar problemas de CORS (proxy de Nginx/Express)
export const API_URL = isNativePlatform
  ? "https://plantai.lab.utb.edu.co/api/v1" // En nativo siempre URL completa
  : "/api/v1"; // En web (local y producción), usar ruta relativa para evitar CORS

console.log("🔍 Plataforma nativa:", isNativePlatform);
console.log("🔍 isLocal:", isLocal);
console.log("🔍 API_URL final:", API_URL);
