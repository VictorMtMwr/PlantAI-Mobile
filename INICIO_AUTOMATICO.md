# 🔄 Configurar Inicio Automático en EC2

Esta guía te asegura que **PlantAI Mobile se inicie automáticamente** cuando el servidor EC2 arranque, incluso si cierras la máquina o la sesión SSH.

## ⚠️ ¿Por qué es importante?

Sin configurar el inicio automático:
- ❌ Si reinicias el servidor, la aplicación NO se iniciará
- ❌ Si cierras la sesión SSH, la aplicación puede detenerse
- ❌ Si hay un fallo del sistema, la aplicación NO se reiniciará

Con inicio automático configurado:
- ✅ La aplicación se inicia automáticamente al arrancar el servidor
- ✅ La aplicación se reinicia automáticamente si falla
- ✅ Puedes cerrar la sesión SSH sin problemas

## 🚀 Método 1: PM2 (Recomendado)

### Paso 1: Ejecutar el script de instalación

```bash
cd /var/www/plantai-mobile
./deploy-ec2.sh
```

### Paso 2: Configurar inicio automático

Después de ejecutar el script, PM2 te mostrará un comando. **DEBES ejecutarlo:**

```bash
# Ejemplo del comando que verás (el tuyo será diferente):
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

**Copia y ejecuta exactamente el comando que PM2 te muestre.**

### Paso 3: Verificar

```bash
# Verificar que PM2 está configurado
pm2 startup

# Verificar que la aplicación está corriendo
pm2 status

# Verificar que está guardada
pm2 save
```

### Paso 4: Probar el inicio automático

```bash
# Reiniciar el servidor
sudo reboot

# Después de reiniciar, conectarte de nuevo y verificar:
pm2 status
# Deberías ver que plantai-mobile está corriendo
```

## 🔧 Método 2: systemd (Alternativa)

### Paso 1: Ejecutar el script

```bash
cd /var/www/plantai-mobile
./setup-systemd.sh
```

Este script:
- ✅ Crea el servicio systemd
- ✅ Habilita el inicio automático (`systemctl enable`)
- ✅ Inicia el servicio

### Paso 2: Verificar

```bash
# Verificar que el servicio está habilitado (debe mostrar "enabled")
sudo systemctl is-enabled plantai-mobile

# Verificar que está corriendo
sudo systemctl status plantai-mobile
```

### Paso 3: Probar el inicio automático

```bash
# Reiniciar el servidor
sudo reboot

# Después de reiniciar, conectarte de nuevo y verificar:
sudo systemctl status plantai-mobile
# Debería mostrar "active (running)"
```

## ✅ Verificación Final

Para asegurarte de que todo funciona:

1. **Verificar que está corriendo:**
   ```bash
   # Con PM2
   pm2 status
   
   # Con systemd
   sudo systemctl status plantai-mobile
   ```

2. **Probar reinicio:**
   ```bash
   sudo reboot
   ```
   
   Después de que el servidor reinicie (espera 1-2 minutos), reconéctate y verifica:
   ```bash
   # Con PM2
   pm2 status
   
   # Con systemd
   sudo systemctl status plantai-mobile
   ```

3. **Verificar que la aplicación responde:**
   ```bash
   curl http://localhost:3000
   ```

## 🐛 Solución de Problemas

### PM2 no inicia automáticamente

1. Verificar que ejecutaste el comando de `pm2 startup`:
   ```bash
   pm2 startup
   ```
   Si muestra un comando, ejecútalo.

2. Verificar que guardaste la configuración:
   ```bash
   pm2 save
   ```

3. Verificar el archivo de startup:
   ```bash
   cat ~/.pm2/dump.pm2
   ```

### systemd no inicia automáticamente

1. Verificar que el servicio está habilitado:
   ```bash
   sudo systemctl is-enabled plantai-mobile
   ```
   Debe mostrar "enabled". Si muestra "disabled":
   ```bash
   sudo systemctl enable plantai-mobile
   ```

2. Verificar los logs:
   ```bash
   sudo journalctl -u plantai-mobile -n 50
   ```

### La aplicación no responde después de reiniciar

1. Verificar que el build existe:
   ```bash
   ls -la /var/www/plantai-mobile/dist/
   ```

2. Verificar permisos:
   ```bash
   ls -la /var/www/plantai-mobile/
   ```

3. Verificar logs:
   ```bash
   # Con PM2
   pm2 logs plantai-mobile
   
   # Con systemd
   sudo journalctl -u plantai-mobile -f
   ```

## 📝 Notas Importantes

1. **Solo usa UN método** (PM2 O systemd), no ambos a la vez.

2. **PM2 es más fácil** para desarrollo y tiene mejor monitoreo.

3. **systemd es más estándar** en Linux y se integra mejor con el sistema.

4. **Después de cualquier cambio** en el código, recuerda:
   ```bash
   npm run build
   pm2 restart plantai-mobile  # o sudo systemctl restart plantai-mobile
   ```

5. **El inicio automático solo funciona** si:
   - Con PM2: Ejecutaste el comando de `pm2 startup`
   - Con systemd: Ejecutaste `systemctl enable`

## 🔄 Actualizar la Aplicación

Para actualizar sin perder el inicio automático:

```bash
cd /var/www/plantai-mobile
./update.sh
```

Este script actualiza el código y reinicia la aplicación, pero **NO afecta** la configuración de inicio automático.

