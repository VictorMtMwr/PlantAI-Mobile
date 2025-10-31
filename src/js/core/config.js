import { Capacitor } from '@capacitor/core';

export const isNativePlatform = Capacitor.isNativePlatform();
export const isLocal =
  window.location.hostname === "localhost" ||
  window.location.hostname.includes("192.168.");

// 🔧 En producción HTTPS (Render), usa el proxy interno "/api"
// En web usamos URL absoluta para evitar rutas relativas bajo /pages/*
const WEB_API_BASE = `${window.location.origin}/api`;
export const API_URL = isNativePlatform
  ? "http://plantai.lab.utb.edu.co:5000/api"
  : (isLocal ? "/api" : WEB_API_BASE);

console.log("🔍 Plataforma nativa:", isNativePlatform);
console.log("🔍 isLocal:", isLocal);
console.log("🔍 API_URL final:", API_URL);
