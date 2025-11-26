#!/bin/bash

# Script de instalación automática para PlantAI Mobile en EC2
# Este script configura la aplicación para que se inicie automáticamente al arrancar

set -e  # Salir si hay algún error

echo "🚀 Instalando PlantAI Mobile en EC2..."
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: No se encontró package.json. Ejecuta este script desde el directorio raíz del proyecto.${NC}"
    exit 1
fi

# Verificar que Node.js está instalado
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}⚠️  Node.js no está instalado. Instalando Node.js 18...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
fi

echo -e "${GREEN}✅ Node.js $(node --version) instalado${NC}"

# Verificar que PM2 está instalado
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}⚠️  PM2 no está instalado. Instalando PM2...${NC}"
    sudo npm install -g pm2
fi

echo -e "${GREEN}✅ PM2 instalado${NC}"

# Instalar dependencias
echo ""
echo "📦 Instalando dependencias..."
npm install

# Construir la aplicación
echo ""
echo "🔨 Construyendo la aplicación..."
npm run build

# Verificar que el build fue exitoso
if [ ! -d "dist" ] || [ ! -f "dist/index.html" ]; then
    echo -e "${RED}❌ Error: El build falló. Verifica los logs anteriores.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build completado exitosamente${NC}"

# Crear directorio de logs si no existe
mkdir -p logs

# Detener instancia anterior si existe
echo ""
echo "🔄 Configurando PM2..."
pm2 delete plantai-mobile 2>/dev/null || true

# Iniciar la aplicación con PM2
echo "🚀 Iniciando la aplicación..."
pm2 start ecosystem.config.js

# Guardar la configuración de PM2
pm2 save

# Configurar PM2 para iniciar al arrancar el sistema
echo ""
echo "⚙️  Configurando inicio automático..."
STARTUP_CMD=$(pm2 startup systemd -u $USER --hp $HOME 2>&1 | grep "sudo" || true)

if [ -n "$STARTUP_CMD" ]; then
    echo -e "${YELLOW}⚠️  Ejecuta el siguiente comando para habilitar el inicio automático:${NC}"
    echo ""
    echo -e "${GREEN}$STARTUP_CMD${NC}"
    echo ""
    echo "Este comando configura PM2 para iniciar automáticamente cuando el sistema arranque."
    echo "Copia y ejecuta el comando mostrado arriba."
else
    echo -e "${GREEN}✅ Inicio automático ya configurado${NC}"
fi

# Mostrar estado
echo ""
echo "📊 Estado de la aplicación:"
pm2 status

echo ""
echo -e "${GREEN}✅ Instalación completada!${NC}"
echo ""
echo "📝 Comandos útiles:"
echo "  - Ver logs: pm2 logs plantai-mobile"
echo "  - Reiniciar: pm2 restart plantai-mobile"
echo "  - Detener: pm2 stop plantai-mobile"
echo "  - Estado: pm2 status"
echo ""
echo "🌐 La aplicación está corriendo en http://localhost:3000"
echo ""
echo "⚠️  IMPORTANTE: Si PM2 te mostró un comando arriba, ejecútalo para que la aplicación"
echo "    se inicie automáticamente al reiniciar el servidor."

