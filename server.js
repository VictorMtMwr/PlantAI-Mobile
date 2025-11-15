const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Directorio de archivos estáticos
const distPath = path.join(__dirname, 'dist');

// Verificar que el directorio dist existe
if (!fs.existsSync(distPath)) {
  console.error('❌ ERROR: El directorio dist/ no existe. Ejecuta "npm run build" primero.');
  process.exit(1);
}

// Verificar que index.html existe
const indexPath = path.join(distPath, 'index.html');
if (!fs.existsSync(indexPath)) {
  console.error('❌ ERROR: index.html no encontrado en dist/. Ejecuta "npm run build" primero.');
  process.exit(1);
}

console.log('✅ Directorio dist/ encontrado');
console.log('✅ index.html encontrado');

// Middleware para servir archivos estáticos (assets, CSS, JS, imágenes, etc.)
app.use(express.static(distPath, {
  // No enviar index.html automáticamente para rutas de archivos
  index: false,
  // Agregar headers de seguridad
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
    }
  }
}));

// Ruta de diagnóstico (solo en desarrollo)
if (process.env.NODE_ENV !== 'production') {
  app.get('/diagnostic', (req, res) => {
    const distExists = fs.existsSync(distPath);
    const indexExists = fs.existsSync(indexPath);
    const distFiles = distExists ? fs.readdirSync(distPath) : [];
    
    res.json({
      distExists,
      indexExists,
      distPath,
      indexPath,
      distFiles,
      port: PORT,
      nodeEnv: process.env.NODE_ENV
    });
  });
}

// Servir la página principal
app.get('/', (req, res) => {
  console.log('📄 Sirviendo index.html');
  // Verificar que el archivo existe antes de enviarlo
  if (!fs.existsSync(indexPath)) {
    console.error('❌ ERROR: index.html no existe!');
    return res.status(500).send('Error: index.html no encontrado. Verifica que el build se ejecutó correctamente.');
  }
  res.sendFile(indexPath);
});

// Servir páginas HTML específicas
const htmlPages = ['login', 'register', 'classification', 'historial', 'account', 'about'];
htmlPages.forEach(page => {
  app.get(`/${page}`, (req, res) => {
    const pagePath = path.join(distPath, 'pages', `${page}.html`);
    console.log(`📄 Intentando servir: ${pagePath}`);
    if (fs.existsSync(pagePath)) {
      res.sendFile(pagePath);
    } else {
      console.log(`⚠️ Página ${page} no encontrada, sirviendo index.html`);
      // Si no existe, redirigir al index
      res.sendFile(indexPath);
    }
  });
});

// Manejar todas las demás rutas - servir index.html para SPA
// Esto permite que el enrutamiento del lado del cliente funcione
app.get('*', (req, res) => {
  // Verificar si la solicitud es para un archivo estático
  const requestedPath = path.join(distPath, req.path);
  
  // Si es un archivo que existe y es realmente un archivo (no un directorio)
  if (fs.existsSync(requestedPath)) {
    try {
      const stats = fs.statSync(requestedPath);
      if (stats.isFile()) {
        console.log(`📄 Sirviendo archivo estático: ${req.path}`);
        res.sendFile(requestedPath);
        return;
      }
    } catch (error) {
      console.error(`❌ Error al acceder a ${requestedPath}:`, error.message);
    }
  }
  
  // Para cualquier otra ruta (rutas de la aplicación), servir index.html
  console.log(`📄 Ruta no encontrada (${req.path}), sirviendo index.html para SPA`);
  res.sendFile(indexPath);
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('❌ Error en el servidor:', err);
  res.status(500).send('Error interno del servidor');
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en el puerto ${PORT}`);
  console.log(`📁 Sirviendo archivos desde: ${distPath}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
});

