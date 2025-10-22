/**
 * Bottom Navigation Handler
 * Manages the bottom navigation bar functionality
 */

export function initBottomNavigation() {
  console.log('🚀 Inicializando navegación inferior');
  
  const navItems = document.querySelectorAll('.nav-item');
  const horizontalNavTabs = document.querySelectorAll('.nav-tab');
  
  console.log('🔍 Found nav items:', navItems.length);
  console.log('🔍 Found horizontal nav tabs:', horizontalNavTabs.length);
  
  // Handle bottom navigation clicks
  navItems.forEach((item, index) => {
    console.log(`🔍 Nav item ${index}:`, {
      dataTab: item.getAttribute('data-tab'),
      text: item.textContent.trim()
    });
    
    item.addEventListener('click', (e) => {
      e.preventDefault();
      
      const targetTab = item.getAttribute('data-tab');
      console.log('🔗 Bottom nav clicked:', targetTab);
      
      // Update active states
      updateActiveStates(targetTab);
      
      // Handle tab content switching
      handleTabContent(targetTab);
    });
  });
  
  // Handle horizontal navigation clicks (if exists)
  horizontalNavTabs.forEach((tab, index) => {
    console.log(`🔍 Horizontal nav tab ${index}:`, {
      href: tab.getAttribute('href'),
      dataTab: tab.getAttribute('data-tab'),
      text: tab.textContent.trim()
    });
    
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      
      const targetTab = tab.getAttribute('data-tab');
      const href = tab.getAttribute('href');
      
      console.log('🔗 Horizontal nav clicked:', { href, targetTab });
      
      // Navigate to the target page
      if (href && href !== '#' && !href.startsWith('#')) {
        console.log('📄 Navegando a página:', href);
        // For Android native, ensure proper navigation
        if (window.Capacitor && window.Capacitor.isNativePlatform()) {
          console.log('📱 Using Capacitor navigation for native platform');
          // For Capacitor, we need to use relative paths from the dist folder
          const relativePath = href.startsWith('./') ? href : './' + href;
          console.log('📱 Navigating to:', relativePath);
          window.location.href = relativePath;
        } else {
          console.log('🌐 Using standard web navigation');
          // For web, use standard navigation
          window.location.href = href;
        }
      } else {
        console.log('📱 Cambiando pestaña:', targetTab);
        // Update active states for tab content
        updateActiveStates(targetTab);
        
        // Handle tab content switching
        handleTabContent(targetTab);
      }
    });
  });
}

function updateActiveStates(activeTab) {
  // Update bottom navigation
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.classList.remove('active');
    if (item.getAttribute('data-tab') === activeTab) {
      item.classList.add('active');
    }
  });
  
  // Update horizontal navigation (if exists)
  const horizontalNavTabs = document.querySelectorAll('.nav-tab');
  horizontalNavTabs.forEach(tab => {
    tab.classList.remove('active');
    if (tab.getAttribute('data-tab') === activeTab) {
      tab.classList.add('active');
    }
  });
}

function handleTabContent(tabName) {
  console.log('🔄 Handling tab content for:', tabName);
  
  // Hide all content sections
  const sections = document.querySelectorAll('.tab-content');
  console.log('🔍 Found tab content sections:', sections.length);
  sections.forEach(section => {
    section.classList.add('hidden');
  });
  
  // Show the selected tab content
  const targetSection = document.getElementById(`${tabName}-content`);
  console.log('🎯 Target section:', targetSection ? 'found' : 'not found');
  if (targetSection) {
    targetSection.classList.remove('hidden');
  }
  
  // Handle specific tab actions
  switch (tabName) {
    case 'inicio':
      console.log('🏠 Handling inicio tab');
      handleInicioTab();
      break;
    case 'historial':
      console.log('📚 Handling historial tab');
      handleHistorialTab();
      break;
    case 'cuenta':
      console.log('👤 Handling cuenta tab');
      handleCuentaTab();
      break;
    default:
      console.log('❓ Unknown tab:', tabName);
  }
}

function handleInicioTab() {
  console.log('🏠 Handling inicio tab - showing carousel and classify sections');
  
  // Ensure carousel is visible and functional
  const carouselSection = document.querySelector('.carousel-section');
  console.log('🎠 Carousel section:', carouselSection ? 'found' : 'not found');
  if (carouselSection) {
    carouselSection.style.display = 'block';
  }
  
  // Ensure classify section is visible
  const classifySection = document.querySelector('.classify-section');
  console.log('🔬 Classify section:', classifySection ? 'found' : 'not found');
  if (classifySection) {
    classifySection.style.display = 'block';
  }
}

function handleHistorialTab() {
  console.log('📚 Handling historial tab - creating/showing historial content');
  
  // Create or show historial content
  let historialContent = document.getElementById('historial-content');
  console.log('📚 Historial content:', historialContent ? 'found' : 'not found');
  
  if (!historialContent) {
    console.log('📚 Creating new historial content');
    historialContent = createHistorialContent();
    const homeContainer = document.querySelector('.home-container');
    console.log('🏠 Home container:', homeContainer ? 'found' : 'not found');
    if (homeContainer) {
      homeContainer.appendChild(historialContent);
    } else {
      console.error('❌ No home container found to append historial content');
    }
  }
  
  historialContent.classList.remove('hidden');
  
  // Hide other sections
  const carouselSection = document.querySelector('.carousel-section');
  const classifySection = document.querySelector('.classify-section');
  
  console.log('🎠 Hiding carousel section:', carouselSection ? 'found' : 'not found');
  console.log('🔬 Hiding classify section:', classifySection ? 'found' : 'not found');
  
  if (carouselSection) carouselSection.style.display = 'none';
  if (classifySection) classifySection.style.display = 'none';
}

function handleCuentaTab() {
  console.log('👤 Handling cuenta tab - creating/showing cuenta content');
  
  // Create or show cuenta content
  let cuentaContent = document.getElementById('cuenta-content');
  console.log('👤 Cuenta content:', cuentaContent ? 'found' : 'not found');
  
  if (!cuentaContent) {
    console.log('👤 Creating new cuenta content');
    cuentaContent = createCuentaContent();
    const homeContainer = document.querySelector('.home-container');
    console.log('🏠 Home container:', homeContainer ? 'found' : 'not found');
    if (homeContainer) {
      homeContainer.appendChild(cuentaContent);
    } else {
      console.error('❌ No home container found to append cuenta content');
    }
  }
  
  cuentaContent.classList.remove('hidden');
  
  // Hide other sections
  const carouselSection = document.querySelector('.carousel-section');
  const classifySection = document.querySelector('.classify-section');
  
  console.log('🎠 Hiding carousel section:', carouselSection ? 'found' : 'not found');
  console.log('🔬 Hiding classify section:', classifySection ? 'found' : 'not found');
  
  if (carouselSection) carouselSection.style.display = 'none';
  if (classifySection) classifySection.style.display = 'none';
}

function createHistorialContent() {
  console.log('📚 Creating historial content dynamically');
  const content = document.createElement('div');
  content.id = 'historial-content';
  content.className = 'tab-content';
  content.innerHTML = `
    <div class="historial-container">
      <div class="historial-header">
        <h2 class="historial-title">Historial de Clasificaciones</h2>
        <p class="historial-subtitle">Tus plantas identificadas</p>
      </div>
      
      <div class="historial-list">
        <div class="historial-item">
          <div class="historial-image">
            <div class="placeholder-image">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
            </div>
          </div>
          <div class="historial-info">
            <h3 class="plant-name">Rosa (Rosa spp.)</h3>
            <p class="plant-scientific">Confianza: 95%</p>
            <p class="historial-date">Hace 2 días</p>
          </div>
        </div>
        
        <div class="historial-item">
          <div class="historial-image">
            <div class="placeholder-image">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
            </div>
          </div>
          <div class="historial-info">
            <h3 class="plant-name">Lavanda (Lavandula)</h3>
            <p class="plant-scientific">Confianza: 87%</p>
            <p class="historial-date">Hace 1 semana</p>
          </div>
        </div>
        
        <div class="historial-item">
          <div class="historial-image">
            <div class="placeholder-image">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
            </div>
          </div>
          <div class="historial-info">
            <h3 class="plant-name">Girasol (Helianthus)</h3>
            <p class="plant-scientific">Confianza: 92%</p>
            <p class="historial-date">Hace 2 semanas</p>
          </div>
        </div>
      </div>
      
      <div class="empty-state">
        <p>No hay clasificaciones recientes</p>
        <button class="btn-primary" onclick="handleTabContent('inicio')">
          Clasificar Nueva Planta
        </button>
      </div>
    </div>
  `;
  
  console.log('📚 Historial content created successfully');
  return content;
}

function createCuentaContent() {
  console.log('👤 Creating cuenta content dynamically');
  const content = document.createElement('div');
  content.id = 'cuenta-content';
  content.className = 'tab-content';
  content.innerHTML = `
    <div class="cuenta-container">
      <div class="cuenta-header">
        <div class="profile-avatar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
        <h2 class="profile-name">Usuario PlantAI</h2>
        <p class="profile-email">usuario@plantai.com</p>
      </div>
      
      <div class="cuenta-menu">
        <div class="menu-item">
          <div class="menu-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14,2 14,8 20,8"></polyline>
            </svg>
          </div>
          <span class="menu-label">Mis Clasificaciones</span>
          <svg class="menu-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9,18 15,12 9,6"></polyline>
          </svg>
        </div>
        
        <div class="menu-item">
          <div class="menu-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
          </div>
          <span class="menu-label">Plantas Favoritas</span>
          <svg class="menu-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9,18 15,12 9,6"></polyline>
          </svg>
        </div>
        
        <div class="menu-item">
          <div class="menu-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 12l2 2 4-4"></path>
              <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"></path>
              <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"></path>
            </svg>
          </div>
          <span class="menu-label">Configuración</span>
          <svg class="menu-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9,18 15,12 9,6"></polyline>
          </svg>
        </div>
        
        <div class="menu-item">
          <div class="menu-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 12l2 2 4-4"></path>
              <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"></path>
              <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"></path>
            </svg>
          </div>
          <span class="menu-label">Ayuda y Soporte</span>
          <svg class="menu-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9,18 15,12 9,6"></polyline>
          </svg>
        </div>
        
        <div class="menu-item logout">
          <div class="menu-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </div>
          <span class="menu-label">Cerrar Sesión</span>
          <svg class="menu-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9,18 15,12 9,6"></polyline>
          </svg>
        </div>
      </div>
    </div>
  `;
  
  console.log('👤 Cuenta content created successfully');
  return content;
}

