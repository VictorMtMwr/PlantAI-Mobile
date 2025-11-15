// Carousel rebuilt: robust implementation using container width to avoid partial offsets
document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.carousel-container');
  if (!container) {
    console.warn('Carousel: contenedor no encontrado');
    return;
  }

  const track = container.querySelector('.carousel-track');
  // Buscar slides desde el track primero, luego desde el contenedor como fallback
  let slides = track ? Array.from(track.querySelectorAll('.carousel-slide')) : [];
  if (slides.length === 0) {
    slides = Array.from(container.querySelectorAll('.carousel-slide'));
  }
  
  const prevButton = container.querySelector('#prevSlide') || container.querySelector('.prev');
  const nextButton = container.querySelector('#nextSlide') || container.querySelector('.next');
  const indicatorsContainer = document.querySelector('.carousel-indicators');

  if (!track) {
    console.error('Carousel: track no encontrado');
    return;
  }

  if (slides.length === 0) {
    console.error('Carousel: no hay slides');
    return;
  }

  if (!indicatorsContainer) {
    console.error('Carousel: indicadores no encontrados');
    return;
  }

  let currentIndex = 0;
  let autoplayTimer = null;
  const slideCount = slides.length;
  
  // Ensure track has transition in CSS; set here as fallback
  track.style.transition = track.style.transition || 'transform 0.45s ease-in-out';
  track.style.display = 'flex';
  track.style.width = `${slideCount * 100}%`;

  // Prefer the inner visible wrapper width when present (handles padding/margins)
  const wrapper = container.querySelector('.carousel-wrapper') || container;
  const getVisibleWidth = () => {
    const width = wrapper.clientWidth || wrapper.getBoundingClientRect().width || container.clientWidth;
    return width || window.innerWidth;
  };

  const goTo = (index) => {
    if (index >= slideCount) index = 0;
    if (index < 0) index = slideCount - 1;
    const width = getVisibleWidth();
    const translateX = -(width * index);
    track.style.transform = `translateX(${translateX}px)`;
    track.style.webkitTransform = `translateX(${translateX}px)`; // Para compatibilidad con Android
    updateIndicators(index);
    currentIndex = index;
  };

  // Indicators
  indicatorsContainer.innerHTML = '';
  for (let i = 0; i < slideCount; i++) {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'indicator' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Ir a la diapositiva ${i + 1}`);
    dot.addEventListener('click', () => {
      goTo(i);
      resetAutoplay();
    });
    indicatorsContainer.appendChild(dot);
  }

  const indicators = Array.from(indicatorsContainer.children);
  const updateIndicators = (target) => {
    indicators.forEach((d, idx) => d.classList.toggle('active', idx === target));
  };

  // Buttons - Compatible con web y Android nativo
  if (prevButton) {
    prevButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      goTo(currentIndex - 1);
      resetAutoplay();
    });
  }

  if (nextButton) {
    nextButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      goTo(currentIndex + 1);
      resetAutoplay();
    });
  }

  // Swipe support (touch) - Compatible con web y Android nativo
  let startX = 0;
  let startY = 0;
  let isDragging = false;
  let currentX = 0;
  
  // Detectar si estamos en plataforma nativa
  const isNative = window.Capacitor && window.Capacitor.isNativePlatform();
  
  // Usar tanto touch como pointer events para mejor compatibilidad
  const handleStart = (e) => {
    const point = e.touches ? e.touches[0] : (e.pointerType === 'touch' || e.pointerType === 'pen' ? e : null);
    if (!point) return; // Solo procesar eventos touch/pen, no mouse
    
    startX = point.clientX;
    startY = point.clientY;
    currentX = startX;
    isDragging = true;
    clearAutoplay();
    track.style.transition = 'none'; // Desactivar transición durante el arrastre
    
    // Solo prevenir default en nativo para evitar conflictos con scroll en web
    if (isNative) {
      e.preventDefault();
    }
  };

  const handleMove = (e) => {
    if (!isDragging) return;
    const point = e.touches ? e.touches[0] : (e.pointerType === 'touch' || e.pointerType === 'pen' ? e : null);
    if (!point) return;
    
    currentX = point.clientX;
    const dx = currentX - startX;
    const width = getVisibleWidth();
    const baseTranslate = -(width * currentIndex);
    const dragTranslate = baseTranslate + dx;
    track.style.transform = `translateX(${dragTranslate}px)`;
    track.style.webkitTransform = `translateX(${dragTranslate}px)`;
    
    // Solo prevenir default en nativo
    if (isNative) {
      e.preventDefault();
    }
  };

  const handleEnd = (e) => {
    if (!isDragging) return;
    isDragging = false;
    track.style.transition = 'transform 0.45s ease-in-out'; // Reactivar transición
    
    const point = e.changedTouches ? e.changedTouches[0] : (e.pointerType === 'touch' || e.pointerType === 'pen' ? e : null);
    if (!point) return;
    
    const dx = point.clientX - startX;
    const dy = point.clientY - startY;
    
    // horizontal swipe - umbral reducido para mejor respuesta en móvil
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 30) {
      if (dx < 0) {
        goTo(currentIndex + 1);
      } else {
        goTo(currentIndex - 1);
      }
    } else {
      // Si no hay swipe suficiente, volver al slide actual
      goTo(currentIndex);
    }
    resetAutoplay();
    
    // Solo prevenir default en nativo
    if (isNative) {
      e.preventDefault();
    }
  };

  // Eventos touch (Android/iOS) - usar passive: true en web para mejor scroll
  track.addEventListener('touchstart', handleStart, { passive: !isNative });
  track.addEventListener('touchmove', handleMove, { passive: !isNative });
  track.addEventListener('touchend', handleEnd, { passive: !isNative });
  track.addEventListener('touchcancel', handleEnd, { passive: !isNative });

  // Eventos pointer (mejor compatibilidad) - solo para touch/pen, no mouse
  if (window.PointerEvent) {
    track.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'touch' || e.pointerType === 'pen') {
        handleStart(e);
      }
    });
    track.addEventListener('pointermove', (e) => {
      if ((e.pointerType === 'touch' || e.pointerType === 'pen') && isDragging) {
        handleMove(e);
      }
    });
    track.addEventListener('pointerup', (e) => {
      if (e.pointerType === 'touch' || e.pointerType === 'pen') {
        handleEnd(e);
      }
    });
    track.addEventListener('pointercancel', (e) => {
      if (e.pointerType === 'touch' || e.pointerType === 'pen') {
        handleEnd(e);
      }
    });
  }

  // Autoplay
  const startAutoplay = () => {
    clearAutoplay();
    autoplayTimer = setInterval(() => {
      goTo(currentIndex + 1);
    }, 5000);
  };
  const clearAutoplay = () => { if (autoplayTimer) { clearInterval(autoplayTimer); autoplayTimer = null; } };
  const resetAutoplay = () => { clearAutoplay(); startAutoplay(); };

  // Resize handler - keep same slide visible
  let resizeTimeout = null;
  window.addEventListener('resize', () => {
    // debounce
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      // reapply transform using new width
      goTo(currentIndex);
    }, 80);
  });

  // Start
  goTo(0);
  startAutoplay();
});
