// Carousel functionality
document.addEventListener('DOMContentLoaded', () => {
  const track = document.querySelector('.carousel-track');
  const slides = Array.from(track.children);
  const nextButton = document.getElementById('nextSlide');
  const prevButton = document.getElementById('prevSlide');
  const indicators = document.querySelectorAll('.indicator');
  
  let currentSlide = 0;
  const slideCount = slides.length;

  // Update carousel position
  const updateCarousel = (index) => {
    currentSlide = index;
    const slideWidth = slides[0].getBoundingClientRect().width;
    track.style.transform = `translateX(-${slideWidth * currentSlide}px)`;
    
    // Update indicators
    indicators.forEach((indicator, i) => {
      indicator.classList.toggle('active', i === currentSlide);
    });
  };

  // Next slide
  nextButton?.addEventListener('click', () => {
    const nextSlide = (currentSlide + 1) % slideCount;
    updateCarousel(nextSlide);
  });

  // Previous slide
  prevButton?.addEventListener('click', () => {
    const prevSlide = (currentSlide - 1 + slideCount) % slideCount;
    updateCarousel(prevSlide);
  });

  // Indicator clicks
  indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => {
      updateCarousel(index);
    });
  });

  // Auto-play carousel every 5 seconds
  let autoPlayInterval = setInterval(() => {
    const nextSlide = (currentSlide + 1) % slideCount;
    updateCarousel(nextSlide);
  }, 5000);

  // Pause auto-play on hover
  const carouselContainer = document.querySelector('.carousel-container');
  carouselContainer?.addEventListener('mouseenter', () => {
    clearInterval(autoPlayInterval);
  });

  carouselContainer?.addEventListener('mouseleave', () => {
    autoPlayInterval = setInterval(() => {
      const nextSlide = (currentSlide + 1) % slideCount;
      updateCarousel(nextSlide);
    }, 5000);
  });

  // Touch swipe support for mobile
  let touchStartX = 0;
  let touchEndX = 0;

  track?.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  });

  track?.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  });

  const handleSwipe = () => {
    if (touchStartX - touchEndX > 50) {
      // Swipe left - next slide
      const nextSlide = (currentSlide + 1) % slideCount;
      updateCarousel(nextSlide);
    }
    if (touchEndX - touchStartX > 50) {
      // Swipe right - previous slide
      const prevSlide = (currentSlide - 1 + slideCount) % slideCount;
      updateCarousel(prevSlide);
    }
  };

  // Navigation tabs
  const navTabs = document.querySelectorAll('.nav-tab');
  navTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      navTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });
});
