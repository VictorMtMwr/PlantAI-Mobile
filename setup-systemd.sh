#!/bin/bash

# Script alternativo para configurar PlantAI Mobile como servicio systemd
# Úsalo si prefieres systemd en lugar de PM2

set -e

echo "🚀 Configurando PlantAI Mobile como servicio systemd..."

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encontró package.json. Ejecuta este script desde el directorio raíz del proyecto."
    exit 1
fi

# Obtener el directorio actual (absoluto)
APP_DIR=$(pwd)
USER=$(whoami)
NODE_PATH=$(which node)

echo "📁 Directorio de la aplicación: $APP_DIR"
echo "👤 Usuario: $USER"
echo "🔧 Node.js: $NODE_PATH"

# Crear archivo de servicio systemd
SERVICE_FILE="/etc/systemd/system/plantai-mobile.service"

echo ""
echo "📝 Creando archivo de servicio systemd..."

sudo tee $SERVICE_FILE > /dev/null <<EOF
[Unit]
Description=PlantAI Mobile Application
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$APP_DIR
Environment=NODE_ENV=production
Environment=PORT=3000
ExecStart=$NODE_PATH server.js
Restart=on-failure
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=plantai-mobile

[Install]
WantedBy=multi-user.target
EOF

echo "✅ Archivo de servicio creado: $SERVICE_FILE"

# Recargar systemd
echo ""
echo "🔄 Recargando systemd..."
sudo systemctl daemon-reload

# Habilitar el servicio para que inicie al arrancar
echo "⚙️  Habilitando inicio automático..."
sudo systemctl enable plantai-mobile

# Iniciar el servicio
echo "🚀 Iniciando el servicio..."
sudo systemctl start plantai-mobile

# Verificar estado
echo ""
echo "📊 Estado del servicio:"
sudo systemctl status plantai-mobile --no-pager

echo ""
echo "✅ Servicio configurado exitosamente!"
echo ""
echo "📝 Comandos útiles:"
echo "  - Ver estado: sudo systemctl status plantai-mobile"
echo "  - Ver logs: sudo journalctl -u plantai-mobile -f"
echo "  - Reiniciar: sudo systemctl restart plantai-mobile"
echo "  - Detener: sudo systemctl stop plantai-mobile"
echo "  - Iniciar: sudo systemctl start plantai-mobile"
echo ""
echo "✅ El servicio se iniciará automáticamente al reiniciar el servidor."

