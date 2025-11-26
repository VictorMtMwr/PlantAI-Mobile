import './core/config.js';
import { initLogin } from './auth/login.js';
import { initRegister } from './auth/register.js';
import { initCamera } from './camera/cameraHandler.js';
import { initGallery } from './camera/galleryHandler.js';
import { initAnimations } from './utils/animations.js';
import { initEasterEgg } from './utils/easterEgg.js';

document.addEventListener("DOMContentLoaded", () => {
  // Solo inicializar login en la página de login
  const currentPath = window.location.pathname;
  const isLoginPage = currentPath.includes('login.html');
  const isRegisterPage = currentPath.includes('register.html');
  
  if (isLoginPage) {
    initLogin();
  }
  
  if (isRegisterPage) {
    initRegister();
  }
  
  // Inicializar cámara y galería solo en la página de clasificación
  const isClassificationPage = currentPath.includes('classification.html');
  if (isClassificationPage) {
    initCamera();
    initGallery();
    // Inicializar easter egg en la página de clasificación
    initEasterEgg();
  }
  
  // Inicializar animaciones en todas las páginas
  initAnimations();
});
