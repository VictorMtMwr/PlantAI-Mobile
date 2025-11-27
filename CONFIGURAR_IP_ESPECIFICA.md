# 🌐 Configurar PlantAI Mobile para IP: 3.137.150.131

Guía específica para configurar tu aplicación en la IP pública `3.137.150.131`.

## ✅ Estado Actual

- ✅ Nginx está instalado y funcionando
- ✅ El Security Group está configurado (puedes acceder al puerto 80)
- ⚠️ Nginx aún muestra la página por defecto (necesita configuración)

## 🚀 Pasos para Configurar

### Paso 1: Verificar que tu aplicación está corriendo

En tu servidor EC2, ejecuta:

```bash
# Verificar que la aplicación está corriendo
pm2 status
# O si usas systemd:
sudo systemctl status plantai-mobile

# Probar que responde localmente
curl http://localhost:3000
```

Si la aplicación NO está corriendo, iníciala:

```bash
cd /var/www/plantai-mobile
pm2 start ecosystem.config.js
# O
sudo systemctl start plantai-mobile
```

### Paso 2: Configurar Nginx

Ejecuta el script automático:

```bash
cd /var/www/plantai-mobile
./setup-nginx.sh
```

O manualmente:

```bash
# Crear archivo de configuración
sudo nano /etc/nginx/sites-available/plantai-mobile
```

Pega esta configuración:

```nginx
server {
    listen 80;
    server_name 3.137.150.131;

    # Logs
    access_log /var/log/nginx/plantai-access.log;
    error_log /var/log/nginx/plantai-error.log;

    # Tamaño máximo de carga
    client_max_body_size 20M;

    # Proxy para API (evita problemas de CORS)
    location /api/ {
        proxy_pass https://plantai.lab.utb.edu.co/api/;
        proxy_http_version 1.1;
        proxy_set_header Host plantai.lab.utb.edu.co;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS headers
        add_header Access-Control-Allow-Origin * always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Authorization, Content-Type" always;
        
        # Manejar preflight requests
        if ($request_method = OPTIONS) {
            add_header Access-Control-Allow-Origin * always;
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
            add_header Access-Control-Allow-Headers "Authorization, Content-Type" always;
            add_header Access-Control-Max-Age 3600;
            add_header Content-Type 'text/plain charset=UTF-8';
            add_header Content-Length 0;
            return 204;
        }
    }

    # Proxy a Node.js para la aplicación
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Cache para archivos estáticos
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|webp|woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Paso 3: Habilitar el sitio

```bash
# Crear enlace simbólico
sudo ln -s /etc/nginx/sites-available/plantai-mobile /etc/nginx/sites-enabled/

# Eliminar configuración por defecto
sudo rm /etc/nginx/sites-enabled/default

# Verificar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

### Paso 4: Verificar

```bash
# Desde el servidor
curl http://localhost

# Deberías ver el HTML de tu aplicación, no la página de Nginx
```

### Paso 5: Acceder desde el navegador

Abre tu navegador y visita:
```
http://3.137.150.131
```

Deberías ver tu aplicación PlantAI Mobile funcionando.

## 🐛 Solución de Problemas

### Sigue mostrando "Welcome to nginx"

1. Verificar que eliminaste el default:
   ```bash
   ls -la /etc/nginx/sites-enabled/
   # No debería haber "default"
   ```

2. Verificar que tu sitio está habilitado:
   ```bash
   ls -la /etc/nginx/sites-enabled/plantai-mobile
   # Debería existir
   ```

3. Reiniciar Nginx:
   ```bash
   sudo systemctl restart nginx
   ```

### Error 502 Bad Gateway

1. Verificar que Node.js está corriendo:
   ```bash
   curl http://localhost:3000
   ```

2. Verificar logs de Nginx:
   ```bash
   sudo tail -f /var/log/nginx/plantai-error.log
   ```

3. Verificar que el puerto 3000 está escuchando:
   ```bash
   sudo netstat -tulpn | grep 3000
   ```

### La aplicación no responde

1. Verificar que la aplicación está corriendo:
   ```bash
   pm2 status
   # O
   sudo systemctl status plantai-mobile
   ```

2. Verificar que el build existe:
   ```bash
   ls -la /var/www/plantai-mobile/dist/
   ```

3. Si no existe, hacer build:
   ```bash
   cd /var/www/plantai-mobile
   npm run build
   pm2 restart plantai-mobile
   ```

## ✅ Checklist

- [ ] Aplicación Node.js corriendo en puerto 3000
- [ ] Nginx configurado con proxy a localhost:3000
- [ ] Sitio plantai-mobile habilitado en Nginx
- [ ] Configuración default de Nginx eliminada
- [ ] Nginx reiniciado
- [ ] Puedes acceder a http://3.137.150.131 y ver tu aplicación

