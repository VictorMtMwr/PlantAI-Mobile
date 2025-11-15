const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Directorio de archivos estáticos
const distPath = path.join(__dirname, 'dist');

// Middleware para servir archivos estáticos (assets, CSS, JS, imágenes, etc.)
app.use(express.static(distPath, {
  // No enviar index.html automáticamente para rutas de archivos
  index: false
}));

// Servir la página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Servir páginas HTML específicas
const htmlPages = ['login', 'register', 'classification', 'historial', 'account', 'about'];
htmlPages.forEach(page => {
  app.get(`/${page}`, (req, res) => {
    const pagePath = path.join(distPath, 'pages', `${page}.html`);
    if (fs.existsSync(pagePath)) {
      res.sendFile(pagePath);
    } else {
      // Si no existe, redirigir al index
      res.sendFile(path.join(distPath, 'index.html'));
    }
  });
});

// Manejar todas las demás rutas - servir index.html para SPA
// Esto permite que el enrutamiento del lado del cliente funcione
app.get('*', (req, res) => {
  // Verificar si la solicitud es para un archivo estático
  const requestedPath = path.join(distPath, req.path);
  
  // Si es un archivo que existe y es realmente un archivo (no un directorio)
  if (fs.existsSync(requestedPath) && fs.statSync(requestedPath).isFile()) {
    res.sendFile(requestedPath);
  } else {
    // Para cualquier otra ruta (rutas de la aplicación), servir index.html
    res.sendFile(path.join(distPath, 'index.html'));
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en el puerto ${PORT}`);
  console.log(`📁 Sirviendo archivos desde: ${distPath}`);
});

