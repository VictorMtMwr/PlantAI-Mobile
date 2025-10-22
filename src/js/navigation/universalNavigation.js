/**
 * Universal Navigation Handler
 * Manages navigation between HTML pages for both web and mobile
 */

import { Capacitor } from '@capacitor/core';

export function initUniversalNavigation() {
  console.log('🚀 Inicializando navegación universal');
  
  // Handle all navigation tabs
  const navTabs = document.querySelectorAll('.nav-tab');
  console.log('🔍 Found navigation tabs:', navTabs.length);
  
  navTabs.forEach((tab, index) => {
    console.log(`🔍 Tab ${index}:`, {
      href: tab.getAttribute('href'),
      dataTab: tab.getAttribute('data-tab'),
      text: tab.textContent.trim()
    });
    
    tab.addEventListener('click', function(e) {
      e.preventDefault();
      
      const href = this.getAttribute('href');
      const targetTab = this.getAttribute('data-tab');
      
      console.log('🔗 Navegando a:', href, 'Tab:', targetTab);
      
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
        // Handle tab content switching if needed
        handleTabContent(targetTab);
      }
    });
  });
  
  // Update active states based on current page
  updateActiveStatesForCurrentPage();
}

function handleTabContent(tabName) {
  // Hide all content sections
  const sections = document.querySelectorAll('.tab-content');
  sections.forEach(section => {
    section.classList.add('hidden');
  });
  
  // Show the selected tab content
  const targetSection = document.getElementById(`${tabName}-content`);
  if (targetSection) {
    targetSection.classList.remove('hidden');
  }
  
  // Handle specific tab actions
  switch (tabName) {
    case 'inicio':
      handleInicioTab();
      break;
    case 'historial':
      handleHistorialTab();
      break;
    case 'cuenta':
      handleCuentaTab();
      break;
  }
}

function handleInicioTab() {
  // Ensure carousel is visible and functional
  const carouselSection = document.querySelector('.carousel-section');
  if (carouselSection) {
    carouselSection.style.display = 'block';
  }
  
  // Ensure classify section is visible
  const classifySection = document.querySelector('.classify-section');
  if (classifySection) {
    classifySection.style.display = 'block';
  }
}

function handleHistorialTab() {
  // Create or show historial content
  let historialContent = document.getElementById('historial-content');
  
  if (!historialContent) {
    historialContent = createHistorialContent();
    document.querySelector('.home-container').appendChild(historialContent);
  }
  
  historialContent.classList.remove('hidden');
  
  // Hide other sections
  const carouselSection = document.querySelector('.carousel-section');
  const classifySection = document.querySelector('.classify-section');
  
  if (carouselSection) carouselSection.style.display = 'none';
  if (classifySection) classifySection.style.display = 'none';
}

function handleCuentaTab() {
  // Create or show cuenta content
  let cuentaContent = document.getElementById('cuenta-content');
  
  if (!cuentaContent) {
    cuentaContent = createCuentaContent();
    document.querySelector('.home-container').appendChild(cuentaContent);
  }
  
  cuentaContent.classList.remove('hidden');
  
  // Hide other sections
  const carouselSection = document.querySelector('.carousel-section');
  const classifySection = document.querySelector('.classify-section');
  
  if (carouselSection) carouselSection.style.display = 'none';
  if (classifySection) classifySection.style.display = 'none';
}

function updateActiveStatesForCurrentPage() {
  const currentPage = getCurrentPageName();
  console.log('📍 Página actual:', currentPage);
  
  // Remove active class from all tabs
  const navTabs = document.querySelectorAll('.nav-tab');
  navTabs.forEach(tab => {
    tab.classList.remove('active');
  });
  
  // Add active class to current page tab
  const currentTab = document.querySelector(`[data-tab="${currentPage}"]`);
  if (currentTab) {
    currentTab.classList.add('active');
    console.log('✅ Tab activo:', currentPage);
  }
}

function getCurrentPageName() {
  const path = window.location.pathname;
  const filename = path.split('/').pop();
  
  // Map filenames to tab names
  const pageMap = {
    'classification.html': 'inicio',
    'historial.html': 'historial',
    'account.html': 'cuenta',
    'index.html': 'inicio'
  };
  
  return pageMap[filename] || 'inicio';
}

function createHistorialContent() {
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
        <button class="btn-primary" onclick="window.location.href='classification.html'">
          Clasificar Nueva Planta
        </button>
      </div>
    </div>
  `;
  
  return content;
}

function createCuentaContent() {
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
  
  return content;
}
