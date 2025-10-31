// server.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createProxyMiddleware } from "http-proxy-middleware";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Proxy para tu API HTTP externa
app.use(
  "/api",
  createProxyMiddleware({
    target: "http://plantai.lab.utb.edu.co:5000", // Tu API real (HTTP)
    changeOrigin: true,
    secure: false,
    logLevel: "debug",
    timeout: 30000,
    proxyTimeout: 30000,
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
