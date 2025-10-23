// Carousel functionality
document.addEventListener('DOMContentLoaded', () => {
  const track = document.querySelector('.carousel-track');
  const slides = Array.from(track.children);
  const nextButton = document.getElementById('nextSlide');
  const prevButton = document.getElementById('prevSlide');
  const indicators = document.querySelectorAll('.indicator');
  
  let currentSlide = 0;
  const slideCount = slides.length;

  // Update carousel position with better mobile support
  const updateCarousel = (index) => {
    currentSlide = index;
    
    console.log('🎠 Updating carousel to slide:', currentSlide, 'of', slideCount);
    
    // Hide all slides first
    slides.forEach((slide, i) => {
      slide.classList.remove('active');
      slide.style.display = 'none';
      slide.style.opacity = '0';
      console.log('🎠 Hiding slide:', i);
    });
    
    // Show current slide
    if (slides[currentSlide]) {
      slides[currentSlide].classList.add('active');
      slides[currentSlide].style.display = 'flex';
      slides[currentSlide].style.opacity = '1';
      console.log('🎠 Showing slide:', currentSlide);
    } else {
      console.error('🎠 Slide not found:', currentSlide);
    }
    
    // Update indicators
    indicators.forEach((indicator, i) => {
      indicator.classList.toggle('active', i === currentSlide);
    });
    
    console.log('🎠 Carousel updated to slide:', currentSlide);
  };

  // Next slide
  if (nextButton) {
    nextButton.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('🎠 Next button clicked');
      const nextSlide = (currentSlide + 1) % slideCount;
      updateCarousel(nextSlide);
    });
  } else {
    console.warn('🎠 Next button not found');
  }

  // Previous slide
  if (prevButton) {
    prevButton.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('🎠 Previous button clicked');
      const prevSlide = (currentSlide - 1 + slideCount) % slideCount;
      updateCarousel(prevSlide);
    });
  } else {
    console.warn('🎠 Previous button not found');
  }

  // Indicator clicks
  indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('🎠 Indicator clicked:', index);
      updateCarousel(index);
    });
  });
  
  console.log('🎠 Carousel initialized with', slideCount, 'slides');
  console.log('🎠 Found indicators:', indicators.length);
  
  // Initialize carousel - show first slide
  if (slideCount > 0) {
    console.log('🎠 Initializing carousel with first slide');
    // Use setTimeout to ensure DOM is ready
    setTimeout(() => {
      updateCarousel(0);
    }, 100);
  } else {
    console.warn('🎠 No slides found in carousel');
  }

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
  let touchStartY = 0;
  let touchEndY = 0;

  if (track) {
    track.addEventListener('touchstart', (e) => {
      e.preventDefault();
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
      console.log('🎠 Touch start:', touchStartX, touchStartY);
    }, { passive: false });

    track.addEventListener('touchmove', (e) => {
      e.preventDefault();
    }, { passive: false });

    track.addEventListener('touchend', (e) => {
      e.preventDefault();
      touchEndX = e.changedTouches[0].screenX;
      touchEndY = e.changedTouches[0].screenY;
      console.log('🎠 Touch end:', touchEndX, touchEndY);
      handleSwipe();
    }, { passive: false });
  }

  const handleSwipe = () => {
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    
    // Only handle horizontal swipes
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        // Swipe right - previous slide
        console.log('🎠 Swipe right - previous slide');
        const prevSlide = (currentSlide - 1 + slideCount) % slideCount;
        updateCarousel(prevSlide);
      } else {
        // Swipe left - next slide
        console.log('🎠 Swipe left - next slide');
        const nextSlide = (currentSlide + 1) % slideCount;
        updateCarousel(nextSlide);
      }
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
