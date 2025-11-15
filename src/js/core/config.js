import { Capacitor } from '@capacitor/core';

export const isNativePlatform = Capacitor.isNativePlatform();
export const isLocal = window.location.hostname === "localhost" || window.location.hostname.includes("192.168.");

// En plataforma nativa, siempre usar URL completa con protocolo
// En web, usar ruta relativa para desarrollo local (proxy de Vite) o URL completa para producción
export const API_URL = isNativePlatform
  ? "https://plantai.lab.utb.edu.co/api/v1" // En nativo siempre URL completa
  : isLocal
    ? "/api/v1" // En web local, usar proxy de Vite
    : "https://plantai.lab.utb.edu.co/api/v1"; // En web producción, URL completa

console.log("🔍 Plataforma nativa:", isNativePlatform);
console.log("🔍 isLocal:", isLocal);
console.log("🔍 API_URL final:", API_URL);
