# 🌐 Exponer la Aplicación en la IP Pública de EC2

Esta guía te muestra cómo exponer PlantAI Mobile en la IP pública de tu instancia EC2 para que sea accesible desde internet.

## 📋 Pasos Rápidos

### Paso 1: Configurar el Security Group de AWS

**⚠️ IMPORTANTE:** Antes de hacer cualquier cosa, debes abrir los puertos en el Security Group de AWS.

1. **Ir a la consola de AWS EC2:**
   - Ve a [AWS Console](https://console.aws.amazon.com/ec2/)
   - Selecciona "Instances"
   - Selecciona tu instancia EC2
   - Ve a la pestaña "Security"

2. **Abrir el Security Group:**
   - Haz clic en el Security Group asociado
   - Ve a la pestaña "Inbound rules"
   - Haz clic en "Edit inbound rules"

3. **Agregar reglas:**
   
   **Opción A: Si vas a usar Nginx (Recomendado - Puerto 80)**
   ```
   Tipo: HTTP
   Puerto: 80
   Origen: 0.0.0.0/0 (o tu IP específica para más seguridad)
   ```
   
   **Opción B: Si vas a exponer directamente el puerto 3000**
   ```
   Tipo: Custom TCP
   Puerto: 3000
   Origen: 0.0.0.0/0 (o tu IP específica para más seguridad)
   ```

4. **Guardar las reglas**

### Paso 2: Obtener tu IP Pública

En la instancia EC2, ejecuta:

```bash
curl ifconfig.me
# O
curl http://169.254.169.254/latest/meta-data/public-ipv4
```

También puedes verla en la consola de AWS EC2.

## 🚀 Opción 1: Usar Nginx (RECOMENDADO)

Esta es la mejor opción porque:
- ✅ Expone en el puerto 80 (HTTP estándar)
- ✅ Más seguro (el servidor Node.js solo escucha en localhost)
- ✅ Mejor rendimiento
- ✅ Fácil agregar SSL después

### 2.1 Instalar Nginx

```bash
sudo apt update
sudo apt install -y nginx
```

### 2.2 Configurar Nginx automáticamente

El proyecto incluye un script que configura Nginx automáticamente:

```bash
cd /var/www/plantai-mobile
./setup-nginx.sh
```

Este script:
- ✅ Crea la configuración de Nginx
- ✅ Configura el proxy a tu aplicación Node.js
- ✅ Habilita el sitio
- ✅ Reinicia Nginx

### 2.3 Configurar Nginx manualmente

Si prefieres hacerlo manualmente:

```bash
# Crear archivo de configuración
sudo nano /etc/nginx/sites-available/plantai-mobile
```

Pega esta configuración (reemplaza `TU_IP_PUBLICA` con tu IP o usa `_` para aceptar cualquier dominio):

```nginx
server {
    listen 80;
    server_name _;  # Acepta cualquier dominio/IP

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

Habilitar el sitio:

```bash
# Crear enlace simbólico
sudo ln -s /etc/nginx/sites-available/plantai-mobile /etc/nginx/sites-enabled/

# Eliminar configuración por defecto
sudo rm /etc/nginx/sites-enabled/default

# Verificar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx  # Para que inicie automáticamente
```

### 2.4 Verificar

```bash
# Verificar que Nginx está corriendo
sudo systemctl status nginx

# Probar localmente
curl http://localhost

# Probar desde tu máquina (reemplaza con tu IP pública)
curl http://TU_IP_PUBLICA
```

### 2.5 Acceder desde el navegador

Abre tu navegador y visita:
```
http://TU_IP_PUBLICA
```

## 🔧 Opción 2: Exponer Directamente el Puerto 3000

Esta opción es más simple pero menos segura. Solo úsala si no quieres instalar Nginx.

### 2.1 Modificar el servidor para escuchar en todas las interfaces

El servidor actualmente solo escucha en `localhost`. Necesitas modificarlo para que escuche en `0.0.0.0`:

```bash
cd /var/www/plantai-mobile
nano server.js
```

Cambia esta línea (alrededor de la línea 116):

```javascript
// ANTES:
app.listen(PORT, () => {

// DESPUÉS:
app.listen(PORT, '0.0.0.0', () => {
```

O mejor, modifica para que use una variable de entorno:

```javascript
const HOST = process.env.HOST || '0.0.0.0';
app.listen(PORT, HOST, () => {
  console.log(`🚀 Servidor ejecutándose en http://${HOST}:${PORT}`);
  console.log(`📁 Sirviendo archivos desde: ${distPath}`);
  console.log(`🌐 URL: http://${HOST}:${PORT}`);
});
```

### 2.2 Reiniciar la aplicación

```bash
# Con PM2
pm2 restart plantai-mobile

# Con systemd
sudo systemctl restart plantai-mobile
```

### 2.3 Verificar

```bash
# Verificar que está escuchando en todas las interfaces
sudo netstat -tulpn | grep 3000
# Deberías ver: 0.0.0.0:3000

# Probar desde tu máquina
curl http://TU_IP_PUBLICA:3000
```

### 2.4 Acceder desde el navegador

```
http://TU_IP_PUBLICA:3000
```

## ✅ Verificación Final

### Verificar que todo funciona:

1. **Desde el servidor:**
   ```bash
   curl http://localhost:3000
   ```

2. **Desde tu máquina local:**
   ```bash
   curl http://TU_IP_PUBLICA
   # O si usas puerto 3000:
   curl http://TU_IP_PUBLICA:3000
   ```

3. **Desde el navegador:**
   - Abre `http://TU_IP_PUBLICA` (o `http://TU_IP_PUBLICA:3000`)
   - Deberías ver la aplicación funcionando

## 🔒 Seguridad Adicional

### 1. Configurar Firewall (UFW)

```bash
# Habilitar firewall
sudo ufw enable

# Permitir SSH (IMPORTANTE: hazlo primero o te quedarás fuera)
sudo ufw allow 22/tcp

# Permitir HTTP
sudo ufw allow 80/tcp

# Permitir HTTPS (si vas a usar SSL)
sudo ufw allow 443/tcp

# Si usas puerto 3000 directamente
sudo ufw allow 3000/tcp

# Ver estado
sudo ufw status
```

### 2. Limitar acceso por IP (Opcional)

En el Security Group de AWS, en lugar de `0.0.0.0/0`, puedes usar tu IP específica:
```
Origen: TU_IP_PUBLICA/32
```

### 3. Usar SSL/HTTPS

Para producción, es recomendable usar HTTPS. Ver la sección de SSL en `DEPLOY_EC2.md`.

## 🐛 Solución de Problemas

### Error: "Connection refused"

1. **Verificar que el Security Group tiene el puerto abierto:**
   - Ve a AWS Console → EC2 → Security Groups
   - Verifica que el puerto 80 (o 3000) está abierto

2. **Verificar que la aplicación está corriendo:**
   ```bash
   pm2 status
   # o
   sudo systemctl status plantai-mobile
   ```

3. **Verificar que está escuchando:**
   ```bash
   sudo netstat -tulpn | grep 3000
   ```

### Error: "502 Bad Gateway" (con Nginx)

1. **Verificar que Node.js está corriendo:**
   ```bash
   curl http://localhost:3000
   ```

2. **Verificar logs de Nginx:**
   ```bash
   sudo tail -f /var/log/nginx/plantai-error.log
   ```

3. **Verificar configuración de Nginx:**
   ```bash
   sudo nginx -t
   ```

### La aplicación no responde desde fuera

1. **Verificar firewall local:**
   ```bash
   sudo ufw status
   ```

2. **Verificar que el Security Group está correcto:**
   - El Security Group debe estar asociado a tu instancia
   - Las reglas deben estar guardadas

3. **Probar desde el servidor:**
   ```bash
   curl http://TU_IP_PUBLICA
   ```

## 📝 Resumen de URLs

- **IP Pública de tu EC2:** La encuentras en AWS Console → EC2 → Instances
- **Con Nginx:** `http://TU_IP_PUBLICA`
- **Sin Nginx (puerto 3000):** `http://TU_IP_PUBLICA:3000`

## 🎯 Checklist Final

- [ ] Security Group configurado con puerto 80 (o 3000) abierto
- [ ] Nginx instalado y configurado (si usas Opción 1)
- [ ] Aplicación corriendo y accesible en localhost:3000
- [ ] Nginx corriendo (si usas Opción 1)
- [ ] Firewall configurado (opcional pero recomendado)
- [ ] Puedes acceder desde el navegador usando la IP pública

