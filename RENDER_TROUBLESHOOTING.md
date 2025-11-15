# 🔍 Solución de Problemas - Render

## Problema: Se muestra la página de la API en lugar de la aplicación

Si estás viendo la página "SAPSAI Dataset" en lugar de tu aplicación PlantAI Mobile, sigue estos pasos:

### 1. Verificar el Servicio Correcto en Render

1. Inicia sesión en [Render Dashboard](https://dashboard.render.com)
2. Verifica que estás viendo el servicio correcto:
   - El nombre del servicio debe ser `plantai-mobile` (o el nombre que configuraste)
   - El tipo debe ser **Web Service** (no Static Site)
   - La URL debe ser algo como `plantai-mobile.onrender.com`

### 2. Verificar la Configuración del Servicio

En el dashboard de Render, verifica:

- **Environment:** `Node`
- **Build Command:** `npm ci && npm run build`
- **Start Command:** `npm start`
- **Root Directory:** (dejar vacío, usar raíz del proyecto)

### 3. Verificar los Logs de Build

1. Ve a la sección "Events" o "Logs" en el dashboard de Render
2. Verifica que el build se completó correctamente:
   - Debe mostrar: `✅ Build successful`
   - No debe haber errores relacionados con `dist/` o `index.html`

### 4. Verificar los Logs del Servidor

1. Ve a la sección "Logs" en el dashboard de Render
2. Busca mensajes como:
   - `✅ Directorio dist/ encontrado`
   - `✅ index.html encontrado`
   - `🚀 Servidor ejecutándose en el puerto XXXX`

Si ves errores como:
- `❌ ERROR: El directorio dist/ no existe`
- `❌ ERROR: index.html no encontrado`

Entonces el problema es que el build no se está ejecutando correctamente.

### 5. Verificar que el Build se Ejecuta

El problema más común es que el build no se ejecuta o falla silenciosamente.

**Solución:**

1. En Render, ve a "Settings" del servicio
2. Verifica que el "Build Command" sea: `npm ci && npm run build`
3. Verifica que el "Start Command" sea: `npm start`
4. Asegúrate de que `package-lock.json` esté en el repositorio

### 6. Verificar el Directorio de Salida

1. Verifica que `vite.config.js` esté configurado para generar `dist/`:
   ```js
   build: {
     outDir: "../dist",
   }
   ```

2. Verifica que `server.js` esté buscando en el lugar correcto:
   ```js
   const distPath = path.join(__dirname, 'dist');
   ```

### 7. Re-desplegar desde Cero

Si nada funciona:

1. **Elimina el servicio actual en Render**
2. **Crea un nuevo Web Service:**
   - Conecta tu repositorio
   - Configura manualmente:
     - **Name:** `plantai-mobile`
     - **Environment:** `Node`
     - **Build Command:** `npm ci && npm run build`
     - **Start Command:** `npm start`
     - **Plan:** Free
3. **Verifica que `package-lock.json` esté en el repositorio:**
   ```bash
   git add package-lock.json
   git commit -m "Add package-lock.json"
   git push
   ```

### 8. Verificar que no hay Servicios Duplicados

Asegúrate de que no tienes múltiples servicios en Render que puedan estar causando confusión:

1. Ve a tu dashboard de Render
2. Verifica todos los servicios activos
3. Si hay servicios duplicados o antiguos, elimínalos

### 9. Verificar la URL Correcta

Asegúrate de que estás accediendo a la URL correcta:

- ✅ Correcto: `https://plantai-mobile.onrender.com`
- ❌ Incorrecto: `https://plantai.lab.utb.edu.co` (esta es la API)

### 10. Verificar el Código Fuente en el Navegador

1. Abre la URL de Render en el navegador
2. Presiona `Ctrl+Shift+I` (o `Cmd+Option+I` en Mac) para abrir las herramientas de desarrollo
3. Ve a la pestaña "Network"
4. Recarga la página
5. Verifica qué archivos se están cargando:
   - ¿Se están cargando archivos desde `/assets/`?
   - ¿Se está cargando `index.html`?
   - ¿Hay errores 404?

### 11. Verificar el Contenido de index.html

1. En el navegador, ve a `https://plantai-mobile.onrender.com`
2. Haz clic derecho → "Ver código fuente"
3. Verifica que el contenido sea el de tu aplicación:
   - Debe mostrar `PlantAI` en el título
   - Debe tener enlaces a `/assets/...`
   - NO debe mostrar contenido de "SAPSAI Dataset"

## Solución Rápida

Si estás seguro de que el servicio está configurado correctamente pero aún ves la página incorrecta:

1. **Forzar un nuevo despliegue:**
   - En Render, ve a "Manual Deploy"
   - Haz clic en "Deploy latest commit"

2. **Verificar los archivos en el repositorio:**
   ```bash
   git status
   git add .
   git commit -m "Fix deployment configuration"
   git push
   ```

3. **Esperar a que Render despliegue automáticamente**

## Contacto

Si después de seguir estos pasos el problema persiste:

1. Comparte los logs de build de Render
2. Comparte los logs del servidor de Render
3. Verifica que todos los archivos estén en el repositorio:
   - `server.js`
   - `render.yaml`
   - `package.json`
   - `package-lock.json`
   - `vite.config.js`

