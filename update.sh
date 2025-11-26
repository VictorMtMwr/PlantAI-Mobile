#!/bin/bash

# Script para actualizar PlantAI Mobile en el servidor

cd "$(dirname "$0")"

echo "🔄 Actualizando PlantAI Mobile..."

# Obtener últimos cambios
echo "📥 Obteniendo cambios del repositorio..."
git pull origin main || git pull origin master

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Construir aplicación
echo "🔨 Construyendo aplicación..."
npm run build

# Verificar que el build fue exitoso
if [ ! -d "dist" ] || [ ! -f "dist/index.html" ]; then
    echo "❌ Error: El build falló. Verifica los logs anteriores."
    exit 1
fi

# Reiniciar aplicación
echo "🔄 Reiniciando aplicación..."
if command -v pm2 &> /dev/null; then
    pm2 restart plantai-mobile || pm2 start ecosystem.config.js
    echo "✅ Aplicación reiniciada con PM2"
elif systemctl is-active --quiet plantai-mobile; then
    sudo systemctl restart plantai-mobile
    echo "✅ Aplicación reiniciada con systemd"
else
    echo "⚠️  No se encontró PM2 ni systemd. Reinicia manualmente."
fi

echo "✅ Actualización completada!"

