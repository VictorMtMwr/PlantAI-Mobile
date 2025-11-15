# 🚀 Guía de Despliegue en Render

Esta guía te ayudará a desplegar PlantAI Mobile en Render.

## 📋 Requisitos Previos

1. Una cuenta en [Render](https://render.com)
2. Repositorio Git (GitHub, GitLab o Bitbucket)
3. Node.js 18+ y npm 9+

## 🔧 Configuración del Proyecto

El proyecto ya está configurado con:
- ✅ Servidor Express (`server.js`)
- ✅ Scripts de build y start en `package.json`
- ✅ Archivo de configuración `render.yaml`

## 📦 Pasos para Desplegar

### Opción 1: Despliegue Automático con render.yaml (Recomendado)

1. **Conecta tu repositorio a Render:**
   - Inicia sesión en [Render Dashboard](https://dashboard.render.com)
   - Haz clic en "New +" y selecciona "Blueprint"
   - Conecta tu repositorio de Git
   - Render detectará automáticamente el archivo `render.yaml`

2. **Render creará automáticamente el servicio:**
   - Tipo: Web Service
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Puerto: Configurado automáticamente (variable de entorno PORT)

3. **Espera a que se complete el despliegue:**
   - Render instalará las dependencias
   - Ejecutará el build de Vite
   - Iniciará el servidor Express
   - Tu aplicación estará disponible en la URL proporcionada por Render

### Opción 2: Despliegue Manual

1. **Crea un nuevo Web Service en Render:**
   - Inicia sesión en [Render Dashboard](https://dashboard.render.com)
   - Haz clic en "New +" y selecciona "Web Service"
   - Conecta tu repositorio de Git

2. **Configura el servicio:**
   - **Name:** `plantai-mobile` (o el nombre que prefieras)
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free (o el plan que prefieras)

3. **Variables de Entorno (opcional):**
   - `NODE_ENV`: `production`
   - Render asigna automáticamente `PORT`

4. **Haz clic en "Create Web Service"**

## 🔍 Verificación del Despliegue

Una vez desplegado, verifica:

1. **La aplicación carga correctamente:**
   - Visita la URL proporcionada por Render
   - Deberías ver la página principal de PlantAI

2. **Las rutas funcionan:**
   - Prueba acceder a `/login`, `/register`, etc.
   - Todas las rutas deberían funcionar correctamente

3. **Los archivos estáticos se cargan:**
   - Verifica que los CSS, JavaScript e imágenes se cargan correctamente
   - Revisa la consola del navegador para errores

## 🐛 Solución de Problemas

### Error: "Cannot find module 'express'"
**Solución:** Asegúrate de que `express` está en las `dependencies` de `package.json` y no en `devDependencies`.

### Error: "Cannot GET /ruta"
**Solución:** Verifica que el servidor Express está configurado correctamente para servir las rutas de la SPA.

### Error: "Port already in use"
**Solución:** Render asigna automáticamente el puerto a través de `process.env.PORT`. Asegúrate de que el servidor usa esta variable.

### Build falla
**Solución:** 
- Verifica que todas las dependencias están correctamente instaladas
- Revisa los logs de build en Render para ver errores específicos
- Asegúrate de que Node.js 18+ está configurado

### Archivos estáticos no se cargan
**Solución:**
- Verifica que la carpeta `dist/` se genera correctamente durante el build
- Asegúrate de que las rutas en `vite.config.js` son correctas
- Verifica que el servidor Express está sirviendo correctamente los archivos estáticos

## 📝 Notas Importantes

1. **API Backend:** La aplicación está configurada para usar la API en `https://plantai.lab.utb.edu.co/api/v1`. Asegúrate de que esta API esté disponible y accesible.

2. **CORS:** Si tienes problemas con CORS, verifica que el backend permite solicitudes desde el dominio de Render.

3. **Variables de Entorno:** Si necesitas configurar variables de entorno adicionales, puedes hacerlo en el dashboard de Render bajo "Environment".

4. **Dominio Personalizado:** Puedes configurar un dominio personalizado en Render en la sección "Custom Domain" del servicio.

## 🔄 Actualización del Despliegue

Cada vez que hagas push a la rama principal del repositorio, Render:
1. Detectará automáticamente los cambios
2. Ejecutará el build
3. Desplegará la nueva versión

Puedes desactivar el despliegue automático en la configuración del servicio si prefieres hacerlo manualmente.

## 📚 Recursos Adicionales

- [Documentación de Render](https://render.com/docs)
- [Despliegue de Node.js en Render](https://render.com/docs/node-version)
- [Variables de Entorno en Render](https://render.com/docs/environment-variables)

