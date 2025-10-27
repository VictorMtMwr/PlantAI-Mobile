import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createProxyMiddleware } from "http-proxy-middleware";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Proxy para tu API HTTP externa
app.use(
  "/api",
  createProxyMiddleware({
    target: "http://plantai.lab.utb.edu.co:5000", // Tu API real (HTTP)
    changeOrigin: true,
    secure: false,
  })
);

// Servir los archivos estáticos del build de Vite
app.use(express.static(path.join(__dirname, "dist")));

// Redirigir cualquier ruta al index.html (SPA routing)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`🌿 PlantAI app running on port ${PORT}`);
});
