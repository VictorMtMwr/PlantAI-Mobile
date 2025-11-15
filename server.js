// server.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createProxyMiddleware } from "http-proxy-middleware";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Configurar CORS para permitir peticiones desde el frontend
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Permitir cualquier origen (o puedes especificar solo plantai-mobile.onrender.com)
  res.header("Access-Control-Allow-Origin", origin || "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  
  // Manejar preflight requests
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  
  next();
});

// ✅ Proxy para tu API externa
// Intenta primero con HTTPS, si falla usa HTTP
app.use(
  "/api",
  createProxyMiddleware({
    target: "https://plantai.lab.utb.edu.co", // Intentar primero con HTTPS (puerto 443 por defecto)
    changeOrigin: true,
    secure: false, // Permitir certificados autofirmados si es necesario
    logLevel: "debug",
    timeout: 30000,
    proxyTimeout: 30000,
    onProxyReq: (proxyReq, req, res) => {
      // Log para debugging
      console.log(`🔄 Proxy: ${req.method} ${req.url} -> ${proxyReq.path}`);
    },
    onError(err, req, res) {
      console.error('🔴 Proxy error:', err.message);
      if (!res.headersSent) {
        res.writeHead(502, { 'Content-Type': 'application/json' });
      }
      res.end(JSON.stringify({ error: 'Bad gateway', details: err.message }));
    },
    // No reescribir el path; el backend ya expone /api
  })
);

// ✅ Servir archivos estáticos del build de Vite
app.use(express.static(path.join(__dirname, "dist")));

// ✅ Fallback para rutas desconocidas (SPA routing)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`🌿 PlantAI app running on port ${PORT}`);
});
