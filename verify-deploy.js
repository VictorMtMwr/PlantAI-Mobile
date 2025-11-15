#!/usr/bin/env node

/**
 * Script de verificación para el despliegue
 * Ejecuta: node verify-deploy.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando configuración de despliegue...\n');

let errors = [];
let warnings = [];

// 1. Verificar que package.json existe y tiene las dependencias correctas
console.log('1. Verificando package.json...');
const packagePath = path.join(__dirname, 'package.json');
if (fs.existsSync(packagePath)) {
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  // Verificar script de start
  if (!packageJson.scripts || !packageJson.scripts.start) {
    errors.push('❌ package.json no tiene script "start"');
  } else {
    console.log('   ✅ Script "start" encontrado');
  }
  
  // Verificar script de build
  if (!packageJson.scripts || !packageJson.scripts.build) {
    errors.push('❌ package.json no tiene script "build"');
  } else {
    console.log('   ✅ Script "build" encontrado');
  }
  
  // Verificar express
  if (!packageJson.dependencies || !packageJson.dependencies.express) {
    errors.push('❌ express no está en dependencies');
  } else {
    console.log('   ✅ express encontrado en dependencies');
  }
  
  // Verificar engines
  if (!packageJson.engines || !packageJson.engines.node) {
    warnings.push('⚠️  No se especificó la versión de Node.js en engines');
  } else {
    console.log(`   ✅ Node.js version: ${packageJson.engines.node}`);
  }
} else {
  errors.push('❌ package.json no existe');
}

// 2. Verificar que server.js existe
console.log('\n2. Verificando server.js...');
const serverPath = path.join(__dirname, 'server.js');
if (fs.existsSync(serverPath)) {
  console.log('   ✅ server.js existe');
  const serverContent = fs.readFileSync(serverPath, 'utf8');
  
  // Verificar que usa process.env.PORT
  if (!serverContent.includes('process.env.PORT')) {
    warnings.push('⚠️  server.js no usa process.env.PORT');
  } else {
    console.log('   ✅ server.js usa process.env.PORT');
  }
  
  // Verificar que sirve desde dist/
  if (!serverContent.includes("path.join(__dirname, 'dist')")) {
    errors.push('❌ server.js no está configurado para servir desde dist/');
  } else {
    console.log('   ✅ server.js configurado para servir desde dist/');
  }
} else {
  errors.push('❌ server.js no existe');
}

// 3. Verificar que render.yaml existe
console.log('\n3. Verificando render.yaml...');
const renderPath = path.join(__dirname, 'render.yaml');
if (fs.existsSync(renderPath)) {
  console.log('   ✅ render.yaml existe');
  const renderContent = fs.readFileSync(renderPath, 'utf8');
  
  // Verificar buildCommand
  if (!renderContent.includes('buildCommand')) {
    warnings.push('⚠️  render.yaml no especifica buildCommand');
  } else {
    console.log('   ✅ buildCommand especificado');
  }
  
  // Verificar startCommand
  if (!renderContent.includes('startCommand')) {
    warnings.push('⚠️  render.yaml no especifica startCommand');
  } else {
    console.log('   ✅ startCommand especificado');
  }
} else {
  warnings.push('⚠️  render.yaml no existe (no es crítico si configuras manualmente)');
}

// 4. Verificar que vite.config.js existe
console.log('\n4. Verificando vite.config.js...');
const vitePath = path.join(__dirname, 'vite.config.js');
if (fs.existsSync(vitePath)) {
  console.log('   ✅ vite.config.js existe');
  const viteContent = fs.readFileSync(vitePath, 'utf8');
  
  // Verificar outDir
  if (!viteContent.includes('outDir') || !viteContent.includes('../dist')) {
    warnings.push('⚠️  vite.config.js podría no estar configurado para generar dist/');
  } else {
    console.log('   ✅ vite.config.js configurado para generar dist/');
  }
} else {
  errors.push('❌ vite.config.js no existe');
}

// 5. Verificar que package-lock.json existe (recomendado para builds consistentes)
console.log('\n5. Verificando package-lock.json...');
const lockPath = path.join(__dirname, 'package-lock.json');
if (fs.existsSync(lockPath)) {
  console.log('   ✅ package-lock.json existe');
} else {
  warnings.push('⚠️  package-lock.json no existe. Ejecuta "npm install" para generarlo.');
}

// 6. Verificar que .gitignore no excluye archivos necesarios
console.log('\n6. Verificando .gitignore...');
const gitignorePath = path.join(__dirname, 'gitignore');
if (fs.existsSync(gitignorePath)) {
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
  
  // Verificar que dist/ está excluido (correcto)
  if (gitignoreContent.includes('dist/')) {
    console.log('   ✅ dist/ está excluido de git (correcto)');
  }
  
  // Verificar que package-lock.json NO está excluido (debería estar incluido)
  if (gitignoreContent.includes('package-lock.json')) {
    warnings.push('⚠️  package-lock.json está excluido de git. Debería estar incluido para builds consistentes.');
  } else {
    console.log('   ✅ package-lock.json NO está excluido de git');
  }
  
  // Verificar que server.js NO está excluido
  if (gitignoreContent.includes('server.js')) {
    errors.push('❌ server.js está excluido de git');
  } else {
    console.log('   ✅ server.js NO está excluido de git');
  }
}

// 7. Intentar verificar que el build funciona (si dist/ existe localmente)
console.log('\n7. Verificando estructura de dist/ (si existe)...');
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  console.log('   ✅ Directorio dist/ existe');
  
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    console.log('   ✅ index.html existe en dist/');
  } else {
    warnings.push('⚠️  index.html no existe en dist/. Ejecuta "npm run build"');
  }
  
  const assetsPath = path.join(distPath, 'assets');
  if (fs.existsSync(assetsPath)) {
    const assetsFiles = fs.readdirSync(assetsPath);
    console.log(`   ✅ Directorio assets/ existe con ${assetsFiles.length} archivos`);
  } else {
    warnings.push('⚠️  Directorio assets/ no existe en dist/');
  }
  
  const pagesPath = path.join(distPath, 'pages');
  if (fs.existsSync(pagesPath)) {
    const pagesFiles = fs.readdirSync(pagesPath);
    console.log(`   ✅ Directorio pages/ existe con ${pagesFiles.length} archivos`);
  } else {
    warnings.push('⚠️  Directorio pages/ no existe en dist/');
  }
} else {
  console.log('   ℹ️  Directorio dist/ no existe (normal si no has ejecutado build)');
  console.log('   💡 Ejecuta "npm run build" para generar dist/');
}

// Resumen
console.log('\n' + '='.repeat(50));
console.log('📊 RESUMEN');
console.log('='.repeat(50));

if (errors.length === 0 && warnings.length === 0) {
  console.log('✅ ¡Todo está configurado correctamente!');
  console.log('\n💡 Próximos pasos:');
  console.log('   1. Ejecuta "npm run build" para verificar que el build funciona');
  console.log('   2. Ejecuta "npm start" para probar el servidor localmente');
  console.log('   3. Si todo funciona, haz commit y push de los cambios');
  console.log('   4. Despliega en Render');
  process.exit(0);
} else {
  if (errors.length > 0) {
    console.log('\n❌ ERRORES (deben corregirse):');
    errors.forEach(error => console.log(`   ${error}`));
  }
  
  if (warnings.length > 0) {
    console.log('\n⚠️  ADVERTENCIAS (recomendado corregir):');
    warnings.forEach(warning => console.log(`   ${warning}`));
  }
  
  if (errors.length > 0) {
    console.log('\n❌ Hay errores que deben corregirse antes de desplegar.');
    process.exit(1);
  } else {
    console.log('\n⚠️  Hay advertencias, pero puedes proceder con el despliegue.');
    process.exit(0);
  }
}

