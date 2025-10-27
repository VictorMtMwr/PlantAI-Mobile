/**
 * Animaciones y efectos visuales para la aplicación PlantAI
 */

/**
 * Agrega efecto de ripple (onda) cuando se hace clic en un botón
 */
export function addRippleEffect(button) {
  button.addEventListener('click', function(e) {
    const ripple = document.createElement('span');
    ripple.classList.add('ripple-effect');
    
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    
    this.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
  });
}

/**
 * Inicializa efectos de ripple en todos los botones de acción
 */
export function initRippleEffects() {
  const actionButtons = document.querySelectorAll('.action-btn, .classify-btn');
  actionButtons.forEach(button => {
    addRippleEffect(button);
  });
}

/**
 * Agrega animación de aparición secuencial a elementos
 */
export function animateSequentially(elements, delay = 100) {
  elements.forEach((element, index) => {
    setTimeout(() => {
      element.style.animation = 'fadeInUp 0.6s ease-out both';
    }, index * delay);
  });
}

/**
 * Agrega efecto de hover 3D a las tarjetas
 */
export function add3DCardEffect(card) {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  });
  
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
  });
}

/**
 * Inicializa efectos 3D en las tarjetas de acción
 */
export function init3DCardEffects() {
  const cards = document.querySelectorAll('.action-btn');
  cards.forEach(card => {
    card.style.transition = 'transform 0.3s ease';
    add3DCardEffect(card);
  });
}

/**
 * Agrega animación de pulso al botón de clasificar
 */
export function addPulseAnimation(button) {
  button.classList.add('pulse-animation');
  
  setTimeout(() => {
    button.classList.remove('pulse-animation');
  }, 2000);
}

/**
 * Observa elementos y los anima cuando entran en el viewport
 */
export function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });
  
  const animatedElements = document.querySelectorAll('.animate-on-scroll');
  animatedElements.forEach(el => observer.observe(el));
}

/**
 * Agrega efecto de carga al botón de clasificar
 */
export function showButtonLoading(button, loadingText = 'Clasificando...') {
  const originalText = button.innerHTML;
  button.disabled = true;
  button.classList.add('loading');
  button.innerHTML = `
    <span class="loading-spinner"></span>
    <span>${loadingText}</span>
  `;
  
  return () => {
    button.disabled = false;
    button.classList.remove('loading');
    button.innerHTML = originalText;
  };
}

/**
 * Inicializa todas las animaciones de la página
 */
export function initAnimations() {
  // Esperar a que el DOM esté completamente cargado
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initRippleEffects();
      init3DCardEffects();
      initScrollAnimations();
    });
  } else {
    initRippleEffects();
    init3DCardEffects();
    initScrollAnimations();
  }
}
