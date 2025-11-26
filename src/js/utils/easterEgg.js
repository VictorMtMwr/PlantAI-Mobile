// Easter Egg - Logo Click Handler
import { isNativePlatform } from '../core/config.js';

let clickCount = 0;
let clickTimeout = null;
const REQUIRED_CLICKS = 5; // Número de clics necesarios para activar el easter egg
const CLICK_TIMEOUT = 2000; // Tiempo en ms para resetear el contador

export function initEasterEgg() {
  const logo = document.querySelector('.app-logo');
  if (!logo) return;

  logo.style.cursor = 'pointer';
  logo.style.transition = 'transform 0.3s ease';

  logo.addEventListener('click', async (e) => {
    e.preventDefault();
    clickCount++;
    
    // Resetear contador después de un tiempo
    clearTimeout(clickTimeout);
    clickTimeout = setTimeout(() => {
      clickCount = 0;
    }, CLICK_TIMEOUT);

    // Animación de clic
    logo.style.transform = 'scale(0.9) rotate(5deg)';
    setTimeout(() => {
      logo.style.transform = 'scale(1) rotate(0deg)';
    }, 150);

    // Vibración en nativo
    if (isNativePlatform) {
      try {
        const { Haptics } = await import('@capacitor/haptics');
        await Haptics.impact({ style: 'light' });
      } catch (error) {
        // Haptics no disponible, continuar sin vibración
      }
    }

    // Si se alcanza el número requerido de clics
    if (clickCount >= REQUIRED_CLICKS) {
      clickCount = 0;
      showEasterEggModal();
    } else {
      // Feedback visual mientras se acumulan clics
      const remaining = REQUIRED_CLICKS - clickCount;
      if (remaining <= 2) {
        showClickFeedback(remaining);
      }
    }
  });
}

function showClickFeedback(remaining) {
  // Crear un elemento temporal para mostrar feedback
  const feedback = document.createElement('div');
  feedback.textContent = `${remaining}...`;
  feedback.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: var(--success-color);
    color: white;
    padding: 12px 24px;
    border-radius: 12px;
    font-size: 24px;
    font-weight: bold;
    z-index: 10000;
    pointer-events: none;
    animation: fadeInOut 0.5s ease;
  `;
  
  // Agregar animación CSS si no existe
  if (!document.getElementById('easterEggStyles')) {
    const style = document.createElement('style');
    style.id = 'easterEggStyles';
    style.textContent = `
      @keyframes fadeInOut {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
        50% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
        100% { opacity: 0; transform: translate(-50%, -50%) scale(1); }
      }
      @keyframes confetti {
        0% { transform: translateY(0) rotate(0deg); opacity: 1; }
        100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
      }
      .easter-egg-modal {
        animation: modalBounce 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      }
      @keyframes modalBounce {
        0% { transform: scale(0) rotate(-180deg); opacity: 0; }
        50% { transform: scale(1.1) rotate(10deg); }
        100% { transform: scale(1) rotate(0deg); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(feedback);
  setTimeout(() => {
    feedback.remove();
  }, 500);
}

function showEasterEggModal() {
  // Crear confeti
  createConfetti();

  // Crear modal
  const modal = document.createElement('div');
  modal.className = 'easter-egg-modal';
  modal.innerHTML = `
    <div class="easter-egg-overlay"></div>
    <div class="easter-egg-content">
      <div class="easter-egg-header">
        <h2>🎉 ¡Easter Egg Encontrado! 🎉</h2>
        <button class="easter-egg-close">&times;</button>
      </div>
      <div class="easter-egg-body">
        <div class="easter-egg-icon">🌱</div>
        <h3>¡Felicitaciones!</h3>
        <p>Has descubierto el easter egg de PlantAI</p>
        <div class="easter-egg-info">
          <p><strong>PlantAI</strong> fue desarrollado con 💚 por el equipo de la Universidad Tecnológica de Bolívar</p>
          <p>Versión: 1.0.0</p>
          <p>¡Gracias por usar nuestra aplicación!</p>
        </div>
        <div class="easter-egg-fun">
          <p>🌿 ¿Sabías que las plantas pueden comunicarse entre sí?</p>
          <p>🌱 Algunas plantas pueden vivir más de 5,000 años</p>
          <p>🍃 Las plantas producen el 98% del oxígeno que respiramos</p>
        </div>
      </div>
    </div>
  `;

  // Agregar estilos si no existen
  if (!document.getElementById('easterEggModalStyles')) {
    const style = document.createElement('style');
    style.id = 'easterEggModalStyles';
    style.textContent = `
      .easter-egg-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(8px);
        z-index: 10000;
        animation: fadeIn 0.3s ease;
      }
      .easter-egg-content {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, var(--success-color) 0%, #059669 100%);
        border-radius: 24px;
        padding: 32px;
        max-width: 400px;
        width: 90%;
        z-index: 10001;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        border: 3px solid rgba(255, 255, 255, 0.3);
      }
      .easter-egg-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
      }
      .easter-egg-header h2 {
        margin: 0;
        color: white;
        font-size: 24px;
        text-align: center;
        flex: 1;
      }
      .easter-egg-close {
        background: rgba(255, 255, 255, 0.2);
        border: 2px solid white;
        color: white;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        font-size: 24px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
      }
      .easter-egg-close:hover {
        background: white;
        color: var(--success-color);
        transform: rotate(90deg);
      }
      .easter-egg-body {
        text-align: center;
        color: white;
      }
      .easter-egg-icon {
        font-size: 64px;
        margin-bottom: 16px;
        animation: bounce 1s infinite;
      }
      @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }
      .easter-egg-body h3 {
        margin: 0 0 12px 0;
        font-size: 28px;
        color: white;
      }
      .easter-egg-body p {
        margin: 12px 0;
        line-height: 1.6;
        color: rgba(255, 255, 255, 0.95);
      }
      .easter-egg-info {
        background: rgba(255, 255, 255, 0.15);
        backdrop-filter: blur(10px);
        border-radius: 16px;
        padding: 20px;
        margin: 20px 0;
        border: 1px solid rgba(255, 255, 255, 0.2);
      }
      .easter-egg-fun {
        margin-top: 20px;
        padding-top: 20px;
        border-top: 2px solid rgba(255, 255, 255, 0.3);
      }
      .easter-egg-fun p {
        font-size: 14px;
        margin: 8px 0;
        opacity: 0.9;
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      .confetti-piece {
        position: fixed;
        width: 10px;
        height: 10px;
        background: var(--success-color);
        z-index: 10002;
        pointer-events: none;
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';

  // Cerrar modal
  const closeBtn = modal.querySelector('.easter-egg-close');
  const overlay = modal.querySelector('.easter-egg-overlay');
  
  const closeModal = () => {
    modal.style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => {
      modal.remove();
      document.body.style.overflow = '';
    }, 300);
  };

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', closeModal);

  // Cerrar con ESC
  const handleEsc = (e) => {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', handleEsc);
    }
  };
  document.addEventListener('keydown', handleEsc);
}

function createConfetti() {
  const colors = ['#10b981', '#059669', '#34d399', '#6ee7b7', '#a7f3d0'];
  const confettiCount = 50;

  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti-piece';
    confetti.style.left = Math.random() * 100 + '%';
    confetti.style.top = '-10px';
    confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
    confetti.style.animation = `confetti ${2 + Math.random() * 2}s linear forwards`;
    confetti.style.animationDelay = Math.random() * 0.5 + 's';
    confetti.style.opacity = '0';

    document.body.appendChild(confetti);

    // Remover después de la animación
    setTimeout(() => {
      confetti.remove();
    }, 4000);
  }
}

