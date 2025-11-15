// server.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createProxyMiddleware } from "http-proxy-middleware";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Proxy para tu API externa (debe estar ANTES de otros middlewares)
// Configurar el proxy con filtro explícito
const proxyOptions = {
  target: "https://plantai.lab.utb.edu.co", // Backend con SSL
  changeOrigin: true,
  secure: true, // El backend tiene SSL válido
  logLevel: "debug",
  timeout: 30000,
  proxyTimeout: 30000,
  // Asegurar que todos los métodos HTTP se reenvíen correctamente
  onProxyReq: (proxyReq, req, res) => {
    // Log para debugging
    console.log(`🔄 Proxy REQUEST: ${req.method} ${req.url} -> https://plantai.lab.utb.edu.co${proxyReq.path}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    // Agregar headers CORS en la respuesta del proxy
    proxyRes.headers['Access-Control-Allow-Origin'] = req.headers.origin || '*';
    proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
    console.log(`✅ Proxy RESPONSE: ${proxyRes.statusCode} for ${req.method} ${req.url}`);
  },
  onError(err, req, res) {
    console.error('🔴 Proxy ERROR:', err.message);
    console.error('   Stack:', err.stack);
    if (!res.headersSent) {
      res.writeHead(502, { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': req.headers.origin || '*'
      });
    }
    res.end(JSON.stringify({ error: 'Bad gateway', details: err.message }));
  },
};

// Crear el middleware del proxy con filtro
const proxyMiddleware = createProxyMiddleware({
  ...proxyOptions,
  filter: (pathname, req) => {
    const shouldProxy = pathname.startsWith('/api');
    console.log(`🔍 Proxy filter: ${req.method} ${pathname} -> ${shouldProxy ? 'PROXY' : 'SKIP'}`);
    return shouldProxy;
  },
});

// Aplicar el proxy ANTES de cualquier otro middleware
app.use(proxyMiddleware);

// Middleware para logging de todas las peticiones (después del proxy)
app.use((req, res, next) => {
  console.log(`📥 Request: ${req.method} ${req.url}`);
  next();
});

// ✅ Configurar CORS para archivos estáticos (después del proxy)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Solo aplicar CORS a rutas que no sean /api (ya manejadas por el proxy)
  if (!req.path.startsWith('/api')) {
    res.header("Access-Control-Allow-Origin", origin || "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Credentials", "true");
    
    // Manejar preflight requests solo para rutas estáticas
    if (req.method === "OPTIONS") {
      return res.sendStatus(204);
    }
  }
  
  next();
});

// ✅ Servir archivos estáticos del build de Vite
app.use(express.static(path.join(__dirname, "dist")));

// ✅ Fallback para rutas desconocidas (SPA routing)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`🌿 PlantAI app running on port ${PORT}`);
});
