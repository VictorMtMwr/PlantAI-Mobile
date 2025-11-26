# 🚀 Guía de Despliegue en AWS EC2

Esta guía te ayudará a desplegar PlantAI Mobile en una instancia EC2 de AWS.

## 📋 Requisitos Previos

1. Una cuenta de AWS con acceso a EC2
2. Una instancia EC2 creada (Ubuntu 22.04 LTS recomendado)
3. Acceso SSH a la instancia EC2
4. Un grupo de seguridad configurado con:
   - Puerto 22 (SSH) abierto para tu IP
   - Puerto 80 (HTTP) abierto para 0.0.0.0/0
   - Puerto 443 (HTTPS) abierto para 0.0.0.0/0 (opcional, para SSL)

## 🔧 Paso 1: Configurar la Instancia EC2

### 1.1 Conectarse a la instancia

```bash
ssh -i tu-clave.pem ubuntu@tu-ip-ec2
```

### 1.2 Actualizar el sistema

```bash
sudo apt update && sudo apt upgrade -y
```

### 1.3 Instalar Node.js 18+

```bash
# Instalar Node.js usando NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar instalación
node --version
npm --version
```

### 1.4 Instalar Git

```bash
sudo apt install -y git
```

### 1.5 Instalar PM2 (gestor de procesos)

```bash
sudo npm install -g pm2
```

### 1.6 Instalar Nginx (opcional pero recomendado)

```bash
sudo apt install -y nginx
```

## 📦 Paso 2: Clonar y Configurar el Proyecto

### 2.1 Clonar el repositorio

```bash
# Crear directorio para la aplicación
sudo mkdir -p /var/www
cd /var/www

# Clonar tu repositorio (reemplaza con tu URL)
sudo git clone https://github.com/tu-usuario/PlantAI-Mobile.git plantai-mobile
# O si es privado, usa SSH:
# sudo git clone git@github.com:tu-usuario/PlantAI-Mobile.git plantai-mobile

# Cambiar propietario
sudo chown -R $USER:$USER /var/www/plantai-mobile
cd plantai-mobile
```

### 2.2 Instalar dependencias y construir

```bash
npm install
npm run build
```

### 2.3 Verificar que el build se completó

```bash
ls -la dist/
# Deberías ver index.html y otros archivos
```

## 🚀 Paso 3: Configurar el Servidor (INICIO AUTOMÁTICO)

**⚠️ IMPORTANTE:** Para que la aplicación siga funcionando aunque cierres la máquina o la sesión SSH, debes configurar el inicio automático.

### 3.1 Opción A: Script Automático con PM2 (MÁS FÁCIL - Recomendado)

El proyecto incluye un script que configura todo automáticamente:

```bash
# Asegúrate de estar en el directorio del proyecto
cd /var/www/plantai-mobile

# Ejecutar el script de instalación
./deploy-ec2.sh
```

Este script:
- ✅ Instala Node.js si no está instalado
- ✅ Instala PM2 si no está instalado
- ✅ Instala dependencias y construye la aplicación
- ✅ Inicia la aplicación con PM2
- ✅ Configura el inicio automático

**Después de ejecutar el script, PM2 te mostrará un comando. DEBES ejecutarlo para habilitar el inicio automático:**

```bash
# Ejecuta el comando que PM2 te muestre, será algo como:
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

### 3.2 Opción B: Configuración Manual con PM2

Si prefieres hacerlo manualmente:

```bash
# Crear directorio de logs
mkdir -p logs

# Iniciar la aplicación
pm2 start ecosystem.config.js

# Guardar configuración
pm2 save

# Configurar inicio automático (IMPORTANTE: esto hace que se inicie al arrancar)
pm2 startup
# Ejecutar el comando que PM2 te muestre (será algo como: sudo env PATH=...)
```

**El comando `pm2 startup` es CRÍTICO** - sin él, la aplicación NO se iniciará automáticamente al reiniciar el servidor.

### 3.3 Opción C: Usar systemd (Alternativa)

Crear servicio systemd:

```bash
sudo nano /etc/systemd/system/plantai-mobile.service
```

Contenido:

```ini
[Unit]
Description=PlantAI Mobile Application
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/var/www/plantai-mobile
Environment=NODE_ENV=production
Environment=PORT=3000
ExecStart=/usr/bin/node server.js
Restart=on-failure
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=plantai-mobile

[Install]
WantedBy=multi-user.target
```

Habilitar y iniciar el servicio:

```bash
# Opción 1: Usar el script automático
./setup-systemd.sh

# Opción 2: Manual
sudo systemctl daemon-reload
sudo systemctl enable plantai-mobile  # Esto habilita el inicio automático
sudo systemctl start plantai-mobile
sudo systemctl status plantai-mobile
```

**El comando `systemctl enable` es CRÍTICO** - sin él, el servicio NO se iniciará automáticamente al reiniciar el servidor.

## 🌐 Paso 4: Configurar Nginx como Reverse Proxy

### 4.1 Crear configuración de Nginx

```bash
sudo nano /etc/nginx/sites-available/plantai-mobile
```

Contenido:

```nginx
server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;  # O tu IP pública

    # Logs
    access_log /var/log/nginx/plantai-access.log;
    error_log /var/log/nginx/plantai-error.log;

    # Tamaño máximo de carga
    client_max_body_size 20M;

    # Proxy a Node.js
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

### 4.2 Habilitar el sitio

```bash
# Crear enlace simbólico
sudo ln -s /etc/nginx/sites-available/plantai-mobile /etc/nginx/sites-enabled/

# Eliminar configuración por defecto (opcional)
sudo rm /etc/nginx/sites-enabled/default

# Verificar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
sudo systemctl status nginx
```

## 🔒 Paso 5: Configurar SSL con Let's Encrypt (Opcional pero Recomendado)

### 5.1 Instalar Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 5.2 Obtener certificado SSL

```bash
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com
```

Sigue las instrucciones. Certbot actualizará automáticamente la configuración de Nginx.

### 5.3 Renovación automática

Certbot configura automáticamente la renovación. Verificar:

```bash
sudo certbot renew --dry-run
```

## 🔄 Paso 6: Actualizar la Aplicación

### 6.1 Script de actualización

Crear script para facilitar actualizaciones:

```bash
nano /var/www/plantai-mobile/update.sh
```

Contenido:

```bash
#!/bin/bash

cd /var/www/plantai-mobile

echo "🔄 Actualizando PlantAI Mobile..."

# Obtener últimos cambios
git pull origin main

# Instalar dependencias
npm install

# Construir aplicación
npm run build

# Reiniciar aplicación
if command -v pm2 &> /dev/null; then
    pm2 restart plantai-mobile
else
    sudo systemctl restart plantai-mobile
fi

echo "✅ Actualización completada!"
```

Hacer ejecutable:

```bash
chmod +x update.sh
```

### 6.2 Usar el script

```bash
./update.sh
```

## 📊 Paso 7: Monitoreo y Logs

### 7.1 Ver logs con PM2

```bash
# Ver logs en tiempo real
pm2 logs plantai-mobile

# Ver últimas líneas
pm2 logs plantai-mobile --lines 100

# Ver información del proceso
pm2 info plantai-mobile

# Ver estadísticas
pm2 monit
```

### 7.2 Ver logs con systemd

```bash
# Ver logs del servicio
sudo journalctl -u plantai-mobile -f

# Ver últimas 100 líneas
sudo journalctl -u plantai-mobile -n 100
```

### 7.3 Ver logs de Nginx

```bash
# Logs de acceso
sudo tail -f /var/log/nginx/plantai-access.log

# Logs de errores
sudo tail -f /var/log/nginx/plantai-error.log
```

## 🛠️ Comandos Útiles

### Reiniciar la aplicación

```bash
# Con PM2
pm2 restart plantai-mobile

# Con systemd
sudo systemctl restart plantai-mobile
```

### Detener la aplicación

```bash
# Con PM2
pm2 stop plantai-mobile

# Con systemd
sudo systemctl stop plantai-mobile
```

### Ver estado

```bash
# Con PM2
pm2 status

# Con systemd
sudo systemctl status plantai-mobile
```

### Reiniciar Nginx

```bash
sudo systemctl restart nginx
```

## 🔍 Verificación del Despliegue

1. **Verificar que el servidor responde:**
   ```bash
   curl http://localhost:3000
   ```

2. **Verificar que Nginx funciona:**
   ```bash
   curl http://tu-ip-o-dominio
   ```

3. **Verificar en el navegador:**
   - Visita `http://tu-ip-o-dominio` o `https://tu-dominio.com`
   - Deberías ver la aplicación funcionando

## 🐛 Solución de Problemas

### El servidor no inicia

```bash
# Verificar logs
pm2 logs plantai-mobile
# o
sudo journalctl -u plantai-mobile -n 50

# Verificar que el puerto no esté en uso
sudo netstat -tulpn | grep 3000

# Verificar que dist/ existe
ls -la /var/www/plantai-mobile/dist/
```

### Error 502 Bad Gateway

- Verificar que la aplicación está corriendo en el puerto 3000
- Verificar configuración de Nginx
- Revisar logs de Nginx: `sudo tail -f /var/log/nginx/plantai-error.log`

### Archivos estáticos no se cargan

- Verificar que `npm run build` se ejecutó correctamente
- Verificar permisos: `sudo chown -R ubuntu:ubuntu /var/www/plantai-mobile`
- Verificar que dist/ contiene los archivos

### Problemas con CORS

- Verificar que la API backend permite solicitudes desde tu dominio
- Revisar configuración de CORS en el backend

## 🔐 Seguridad Adicional

### Firewall (UFW)

```bash
# Habilitar firewall
sudo ufw enable

# Permitir SSH
sudo ufw allow 22/tcp

# Permitir HTTP
sudo ufw allow 80/tcp

# Permitir HTTPS
sudo ufw allow 443/tcp

# Ver estado
sudo ufw status
```

### Actualizar sistema regularmente

```bash
# Crear tarea cron para actualizaciones
sudo crontab -e

# Agregar línea (actualizar cada domingo a las 2 AM)
0 2 * * 0 apt update && apt upgrade -y
```

## 📝 Notas Importantes

1. **API Backend:** La aplicación está configurada para usar la API en `https://plantai.lab.utb.edu.co/api/v1`. Asegúrate de que esta API esté accesible desde tu servidor EC2.

2. **Variables de Entorno:** Si necesitas configurar variables de entorno adicionales, puedes hacerlo en:
   - `ecosystem.config.js` (si usas PM2)
   - `/etc/systemd/system/plantai-mobile.service` (si usas systemd)

3. **Backups:** Considera configurar backups regulares de:
   - Código fuente (Git)
   - Base de datos (si aplica)
   - Configuraciones de servidor

4. **Monitoreo:** Considera usar servicios como:
   - CloudWatch (AWS)
   - PM2 Plus (monitoreo de PM2)
   - Uptime monitoring (UptimeRobot, Pingdom, etc.)

## 📚 Recursos Adicionales

- [Documentación de AWS EC2](https://docs.aws.amazon.com/ec2/)
- [Documentación de PM2](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Documentación de Nginx](https://nginx.org/en/docs/)
- [Documentación de Let's Encrypt](https://letsencrypt.org/docs/)

