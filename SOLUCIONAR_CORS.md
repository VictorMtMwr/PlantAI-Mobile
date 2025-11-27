# 🔧 Solucionar Error de CORS

## 🔍 Problema

El error de CORS ocurre porque el frontend intenta hacer peticiones directamente a `https://plantai.lab.utb.edu.co/api/v1` desde `http://3.137.150.131`, y el navegador bloquea estas peticiones cross-origin.

## ✅ Solución Implementada

He configurado dos cosas:

1. **Proxy en Nginx:** Las peticiones a `/api/*` se redirigen al backend, evitando CORS
2. **Código actualizado:** El frontend ahora usa rutas relativas `/api/v1` en lugar de URLs completas

## 🚀 Pasos para Aplicar la Solución

### Paso 1: Reconstruir la aplicación

```bash
cd /var/www/plantai-mobile

# Hacer pull de los cambios (si usas Git)
git pull

# Reconstruir la aplicación
npm run build
```

### Paso 2: Reconfigurar Nginx

```bash
# Ejecutar el script actualizado
./setup-nginx.sh
```

O manualmente:

```bash
# Editar configuración de Nginx
sudo nano /etc/nginx/sites-available/plantai-mobile
```

Asegúrate de que tiene la sección `/api/` con el proxy al backend.

### Paso 3: Reiniciar servicios

```bash
# Reiniciar Nginx
sudo systemctl restart nginx

# Reiniciar la aplicación Node.js
pm2 restart plantai-mobile
# O
sudo systemctl restart plantai-mobile
```

### Paso 4: Verificar

1. **Abrir DevTools** en el navegador (F12)
2. **Ir a la pestaña Network**
3. **Intentar hacer login**
4. **Verificar que las peticiones a `/api/v1/auth/login` funcionan** (no deberían mostrar error de CORS)

## 🔍 Verificación Detallada

### Verificar que el proxy funciona:

```bash
# Desde el servidor, probar el proxy
curl -X POST http://localhost/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}'
```

### Verificar logs de Nginx:

```bash
# Ver logs de acceso
sudo tail -f /var/log/nginx/plantai-access.log

# Ver logs de errores
sudo tail -f /var/log/nginx/plantai-error.log
```

### Verificar en el navegador:

1. Abre `http://3.137.150.131`
2. Abre DevTools (F12) → Network
3. Intenta hacer login
4. Verifica que:
   - Las peticiones van a `/api/v1/auth/login` (ruta relativa)
   - No hay errores de CORS
   - El status es 200 o 401 (no CORS error)

## 🐛 Si Aún Hay Problemas

### Error: "CORS policy: No 'Access-Control-Allow-Origin' header"

1. **Verificar que Nginx tiene la configuración de `/api/`:**
   ```bash
   sudo cat /etc/nginx/sites-available/plantai-mobile | grep -A 10 "location /api/"
   ```

2. **Verificar que Nginx se reinició:**
   ```bash
   sudo systemctl status nginx
   ```

3. **Verificar la configuración:**
   ```bash
   sudo nginx -t
   ```

### Las peticiones aún van a la URL completa

1. **Verificar que el build se hizo después de los cambios:**
   ```bash
   # Verificar el archivo compilado
   grep -r "plantai.lab.utb.edu.co" dist/assets/*.js | head -5
   ```
   
   Si encuentras la URL completa, necesitas reconstruir:
   ```bash
   npm run build
   pm2 restart plantai-mobile
   ```

### El proxy no funciona

1. **Verificar que el backend está accesible:**
   ```bash
   curl https://plantai.lab.utb.edu.co/api/v1/health
   # O cualquier endpoint que exista
   ```

2. **Verificar logs de Nginx:**
   ```bash
   sudo tail -50 /var/log/nginx/plantai-error.log
   ```

3. **Probar el proxy manualmente:**
   ```bash
   curl http://localhost/api/v1/auth/login -X POST \
     -H "Content-Type: application/json" \
     -d '{"email":"test","password":"test"}'
   ```

## 📝 Resumen de Cambios

### Archivos Modificados:

1. **`src/js/core/config.js`**
   - Cambiado para usar rutas relativas `/api/v1` en web
   - Evita peticiones cross-origin

2. **`setup-nginx.sh`**
   - Agregado proxy para `/api/` al backend
   - Agregados headers CORS

3. **`EXPOSER_IP_PUBLICA.md`**
   - Actualizada configuración de Nginx con proxy de API

## ✅ Checklist Final

- [ ] Código actualizado (git pull o cambios aplicados)
- [ ] Aplicación reconstruida (`npm run build`)
- [ ] Nginx reconfigurado (`./setup-nginx.sh`)
- [ ] Nginx reiniciado
- [ ] Aplicación Node.js reiniciada
- [ ] Probado en el navegador - no hay errores de CORS
- [ ] Login funciona correctamente

## 🎯 Resultado Esperado

Después de aplicar estos cambios:
- ✅ Las peticiones van a `/api/v1/*` (ruta relativa)
- ✅ Nginx hace proxy al backend automáticamente
- ✅ No hay errores de CORS
- ✅ La aplicación funciona correctamente

