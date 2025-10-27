import './core/config.js';
import { initLogin } from './auth/login.js';
import { initRegister } from './auth/register.js';
import { initCamera } from './camera/cameraHandler.js';
import { initGallery } from './camera/galleryHandler.js';
import { initAnimations } from './utils/animations.js';

document.addEventListener("DOMContentLoaded", () => {
  initLogin();
  initRegister();
  initCamera();
  initGallery();
  initAnimations();
});
