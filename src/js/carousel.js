// Carousel rebuilt: robust implementation using container width to avoid partial offsets
document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.carousel-container');
  if (!container) return;

  const track = container.querySelector('.carousel-track');
  const slides = Array.from(track.querySelectorAll('.carousel-slide'));
  const prevButton = container.querySelector('#prevSlide') || container.querySelector('.prev');
  const nextButton = container.querySelector('#nextSlide') || container.querySelector('.next');
  const indicatorsContainer = document.querySelector('.carousel-indicators');

  if (!track || slides.length === 0 || !indicatorsContainer) {
    console.error('Carousel: elementos faltantes');
    return;
  }

  let currentIndex = 0;
  let autoplayTimer = null;
  const slideCount = slides.length;
  // Ensure track has transition in CSS; set here as fallback
  track.style.transition = track.style.transition || 'transform 0.45s ease-in-out';

  // Prefer the inner visible wrapper width when present (handles padding/margins)
  const wrapper = container.querySelector('.carousel-wrapper') || container;
  const getVisibleWidth = () => wrapper.clientWidth || wrapper.getBoundingClientRect().width || container.clientWidth;

  const goTo = (index) => {
    if (index >= slideCount) index = 0;
    if (index < 0) index = slideCount - 1;
    const width = getVisibleWidth();
    track.style.transform = `translateX(-${width * index}px)`;
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

  // Buttons
  prevButton?.addEventListener('click', (e) => {
    e?.preventDefault();
    goTo(currentIndex - 1);
    resetAutoplay();
  });
  nextButton?.addEventListener('click', (e) => {
    e?.preventDefault();
    goTo(currentIndex + 1);
    resetAutoplay();
  });

  // Swipe support (touch)
  let startX = 0;
  let startY = 0;
  track.addEventListener('touchstart', (e) => {
    const t = e.changedTouches[0];
    startX = t.clientX;
    startY = t.clientY;
    clearAutoplay();
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    const t = e.changedTouches[0];
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;
    // horizontal swipe
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      if (dx < 0) goTo(currentIndex + 1);
      else goTo(currentIndex - 1);
    }
    resetAutoplay();
  }, { passive: true });

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
