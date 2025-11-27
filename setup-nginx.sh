#!/bin/bash

# Script para configurar Nginx como reverse proxy para PlantAI Mobile

set -e

echo "🌐 Configurando Nginx para PlantAI Mobile..."
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Verificar que Nginx está instalado
if ! command -v nginx &> /dev/null; then
    echo -e "${YELLOW}⚠️  Nginx no está instalado. Instalando...${NC}"
    sudo apt update
    sudo apt install -y nginx
fi

echo -e "${GREEN}✅ Nginx instalado${NC}"

# Obtener IP pública (opcional, para mostrar al usuario)
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || curl -s ifconfig.me 2>/dev/null || echo "TU_IP_PUBLICA")

# Crear archivo de configuración de Nginx
CONFIG_FILE="/etc/nginx/sites-available/plantai-mobile"

echo ""
echo "📝 Creando configuración de Nginx..."

sudo tee $CONFIG_FILE > /dev/null <<EOF
server {
    listen 80;
    server_name _;  # Acepta cualquier dominio/IP

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
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Host \$host;
        
        # CORS headers (si el backend no los envía)
        add_header Access-Control-Allow-Origin * always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Authorization, Content-Type" always;
        
        # Manejar preflight requests
        if (\$request_method = OPTIONS) {
            add_header Access-Control-Allow-Origin * always;
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
            add_header Access-Control-Allow-Headers "Authorization, Content-Type" always;
            add_header Access-Control-Max-Age 3600;
            add_header Content-Type 'text/plain charset=UTF-8';
            add_header Content-Length 0;
            return 204;
        }
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Proxy a Node.js para la aplicación
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
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
EOF

echo -e "${GREEN}✅ Configuración creada: $CONFIG_FILE${NC}"

# Habilitar el sitio
echo ""
echo "🔗 Habilitando el sitio..."

# Eliminar enlace simbólico anterior si existe
sudo rm -f /etc/nginx/sites-enabled/plantai-mobile

# Crear nuevo enlace simbólico
sudo ln -s /etc/nginx/sites-available/plantai-mobile /etc/nginx/sites-enabled/

# Eliminar configuración por defecto (opcional)
if [ -f /etc/nginx/sites-enabled/default ]; then
    echo "🗑️  Eliminando configuración por defecto de Nginx..."
    sudo rm /etc/nginx/sites-enabled/default
fi

# Verificar configuración
echo ""
echo "🔍 Verificando configuración de Nginx..."
if sudo nginx -t; then
    echo -e "${GREEN}✅ Configuración de Nginx válida${NC}"
else
    echo -e "${RED}❌ Error en la configuración de Nginx${NC}"
    exit 1
fi

# Reiniciar Nginx
echo ""
echo "🔄 Reiniciando Nginx..."
sudo systemctl restart nginx

# Habilitar Nginx para que inicie automáticamente
sudo systemctl enable nginx

# Verificar estado
echo ""
echo "📊 Estado de Nginx:"
sudo systemctl status nginx --no-pager -l

echo ""
echo -e "${GREEN}✅ Nginx configurado exitosamente!${NC}"
echo ""
echo "🌐 Tu aplicación está disponible en:"
echo "   http://$PUBLIC_IP"
echo ""
echo "⚠️  IMPORTANTE: Asegúrate de que el Security Group de AWS tiene el puerto 80 abierto."
echo ""
echo "📝 Para verificar:"
echo "   curl http://localhost"
echo "   curl http://$PUBLIC_IP"
echo ""

