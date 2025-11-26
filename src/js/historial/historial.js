import { API_URL, isNativePlatform } from '../core/config.js';
import { CapacitorHttp, Capacitor } from '@capacitor/core';
import { getCurrentToken, requireAuth } from '../auth/sessionManager.js';
import { getRecommendationsByScientificName } from '../data/diseaseRecommendations.js';
import { translateRecommendationText } from '../i18n/recommendationsTranslations.js';

class HistorialManager {
  constructor() {
    this.classifications = [];
    this.currentPage = 1;
    this.itemsPerPage = 10;
    this.totalCount = 0;
    this.totalPages = 0;
    this.init();
  }

  async init() {
    if (!requireAuth()) return;

    this.setupEventListeners();
    await this.loadClassifications();
  }

  setupEventListeners() {
    const retryBtn = document.getElementById('retryBtn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => this.loadClassifications());
    }

    const startClassifyingBtn = document.getElementById('startClassifyingBtn');
    if (startClassifyingBtn) {
      startClassifyingBtn.addEventListener('click', () => {
        window.location.href = 'classification.html';
      });
    }

    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => this.sortClassifications(e.target.value));
    }

    // Pagination event listeners
    const prevPageBtn = document.getElementById('prevPageBtn');
    if (prevPageBtn) {
      prevPageBtn.addEventListener('click', () => this.goToPreviousPage());
    }

    const nextPageBtn = document.getElementById('nextPageBtn');
    if (nextPageBtn) {
      nextPageBtn.addEventListener('click', () => this.goToNextPage());
    }

    // Modal event listeners
    const modal = document.getElementById('detailsModal');

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target.closest('.modal-close-btn')) {
          this.closeModal();
        }
        if (e.target.closest('#toggleJsonBtn')) {
          this.toggleJsonSection();
        }
        if (e.target.closest('#copyJsonBtn')) {
          this.copyJsonToClipboard();
        }
        if (e.target.classList.contains('modal-overlay')) {
          this.closeModal();
        }
      });
    }
  }

  toggleJsonSection() {
    const jsonSection = document.getElementById('jsonSection');
    const toggleBtn = document.getElementById('toggleJsonBtn');
    const btnSpan = toggleBtn.querySelector('span');
    const iconShow = toggleBtn.querySelector('.icon-show');
    const iconHide = toggleBtn.querySelector('.icon-hide');

    const isHidden = jsonSection.classList.contains('hidden');

    if (isHidden) {
      jsonSection.classList.remove('hidden');
      btnSpan.textContent = 'Ocultar JSON';
      iconShow.classList.add('hidden');
      iconHide.classList.remove('hidden');
    } else {
      jsonSection.classList.add('hidden');
      btnSpan.textContent = 'Mostrar JSON';
      iconShow.classList.remove('hidden');
      iconHide.classList.add('hidden');
    }
  }

  async loadClassifications(page = null) {
    // Si se especifica una página, actualizar currentPage
    if (page !== null) {
      this.currentPage = page;
    }

    this.showLoading();
    this.hideError();
    this.hideEmptyState();
    this.hideClassificationsList();
    this.hidePagination();

    try {
      const token = getCurrentToken();
      if (!token) throw new Error('No token available');

      // Construir URL con parámetros de paginación
      const pageParam = this.currentPage || 1;
      const limitParam = this.itemsPerPage || 10;
      const url = `${API_URL}/plant-classifier/classifications?page=${pageParam}&limit=${limitParam}`;

      console.log('📡 Cargando página:', pageParam, 'URL:', url);

      let data;

      if (Capacitor.isNativePlatform()) {
        const response = await CapacitorHttp.get({
          url: url,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        data = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
      } else {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        data = await response.json();
      }

      // ✅ Ajuste: el backend devuelve { count, pages, results }
      console.log('📊 Respuesta del API:', data);
      
      this.classifications = data.results || [];
      this.totalCount = data.count || 0;
      this.totalPages = data.pages || 1;
      
      console.log('📊 totalCount:', this.totalCount);
      console.log('📊 totalPages:', this.totalPages);
      console.log('📊 currentPage:', this.currentPage);
      console.log('📊 classifications length:', this.classifications.length);

      this.displayClassifications();

    } catch (error) {
      console.error('Error loading classifications:', error);
      this.showError();
    } finally {
      this.hideLoading();
    }
  }

  displayClassifications() {
    console.log('🎯 displayClassifications - totalCount:', this.totalCount);
    console.log('🎯 displayClassifications - classifications length:', this.classifications.length);
    
    // Asegurar que el estado vacío esté oculto primero
    this.hideEmptyState();
    
    // Actualizar contador en el header
    this.updatePlantCount();
    
    // Solo mostrar estado vacío si count es específicamente 0
    if (this.totalCount === 0) {
      console.log('🎯 Mostrando estado vacío porque totalCount es 0');
      this.showEmptyState();
      this.hidePagination();
      this.hideClassificationsList();
      return;
    }else{
      this.hideEmptyState();
      this.calculatePagination();
      this.showClassificationsList();
      this.renderClassifications();
      this.updatePagination();
      console.log('🎯 Mostrando clasificaciones porque totalCount > 0');
    }
  }

  updatePlantCount() {
    const countElement = document.getElementById('totalCount');
    if (countElement) {
      const count = this.totalCount || 0;
      const text = count === 1 ? '1 planta' : `${count} plantas`;
      
      // Obtener el HTML del icono
      const iconHtml = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>`;
      
      const newContent = iconHtml + text;
      
      // Solo actualizar si el contenido cambió
      if (countElement.innerHTML !== newContent) {
        // Animación suave del contador
        countElement.style.transform = 'scale(0.8)';
        countElement.style.opacity = '0.6';
        
        setTimeout(() => {
          countElement.innerHTML = newContent;
          countElement.style.transform = 'scale(1)';
          countElement.style.opacity = '1';
        }, 150);
      }
    }
  }

  renderClassifications() {
    const container = document.getElementById('classificationsContainer');
    if (!container) return;

    const classificationsHTML = this.classifications.map(classification =>
      this.createClassificationCard(classification)
    ).join('');

    container.innerHTML = classificationsHTML;
  }

  createClassificationCard(classification) {
    console.log('🌱 Datos de clasificación:', classification);
    
    // Obtener la fecha correcta sin usar Date.now() como fallback
    const dateValue = classification.created_at || classification.timestamp || classification.createdAt || classification.date;
    
    if (!dateValue) {
      console.warn('⚠️ No se encontró fecha para la clasificación:', classification);
    }
    
    const date = dateValue ? new Date(dateValue) : null;
    
    // Formatear fecha con hora y minuto
    let formattedDate = 'Fecha no disponible';
    let formattedTime = '';
    
    if (date && !isNaN(date.getTime())) {
      formattedDate = date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
      
      formattedTime = date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });
    }

    // Calcular el porcentaje usando speciesConfidence
    let confidence = 0;
    if (classification.speciesConfidence !== undefined && classification.speciesConfidence !== null) {
      // Si speciesConfidence ya es un porcentaje (0-100)
      if (classification.speciesConfidence <= 1) {
        confidence = Math.round(classification.speciesConfidence * 100);
      } else {
        confidence = Math.round(classification.speciesConfidence);
      }
    } else if (classification.confidence !== undefined && classification.confidence !== null) {
      // Fallback a confidence si speciesConfidence no existe
      if (classification.confidence <= 1) {
        confidence = Math.round(classification.confidence * 100);
      } else {
        confidence = Math.round(classification.confidence);
      }
    } else if (classification.score !== undefined && classification.score !== null) {
      // Fallback a score si no hay speciesConfidence ni confidence
      if (classification.score <= 1) {
        confidence = Math.round(classification.score * 100);
      } else {
        confidence = Math.round(classification.score);
      }
    }
    
    console.log('📊 speciesConfidence original:', classification.speciesConfidence);
    console.log('📊 Confidence calculado:', confidence);

    // Obtener nombre científico (preferir scientificName, luego scientific_name, luego species)
    const scientificName = classification.scientificName || classification.scientific_name || classification.species || 'No identificado';
    
    // Obtener nombre común (preferir español, luego inglés)
    // Intentar múltiples variaciones de campos
    const commonName = classification.commonNameEs 
      || classification.commonNameEn 
      || classification.common_name 
      || classification.commonName
      || classification.plant_name
      || classification.name
      || 'Nombre común no disponible';
    
    // Debug: verificar qué campos están disponibles
    console.log('🔍 Campos disponibles en classification:', Object.keys(classification));
    console.log('🔍 commonNameEs:', classification.commonNameEs);
    console.log('🔍 commonNameEn:', classification.commonNameEn);
    console.log('🔍 common_name:', classification.common_name);
    console.log('🔍 Nombre común final:', commonName);

    // Obtener estado de salud
    const isHealthy = classification.isHealthy !== undefined ? classification.isHealthy : classification.taggedHealthy;
    const isDiseased = isHealthy === false;
    
    // Generar botón de recomendaciones si está enferma
    const i18n = window.i18nManager || { t: (key) => key };
    const recommendationsBtn = isDiseased ? `
      <button class="recommendations-btn-card" 
              onclick="event.stopPropagation(); showRecommendationsFromHistorial('${scientificName.replace(/'/g, "\\'")}', '${commonName.replace(/'/g, "\\'")}')" 
              title="${i18n.t('recommendations.button')}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
          <path d="M2 17l10 5 10-5"></path>
          <path d="M2 12l10 5 10-5"></path>
        </svg>
        <span>${i18n.t('recommendations.button')}</span>
      </button>
    ` : '';

    return `
      <div class="classification-card" onclick="viewClassificationDetails('${classification.id || classification._id}')">
        <div class="card-image">
          ${this.createImageElement(classification)}
          <div class="confidence-badge">${confidence}%</div>
        </div>
        
        <div class="card-content">
          <div class="card-info">
            <div class="plant-name-header">
              <h3 class="plant-name">${scientificName}</h3>
              ${recommendationsBtn}
            </div>
            <p class="plant-common">${commonName}</p>
            <div class="classification-datetime">
              <span class="classification-date">${formattedDate}</span>
              ${formattedTime ? `<span class="classification-time">${formattedTime}</span>` : ''}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  createImageElement(classification) {
    if (classification.image_url || classification.imagePath || classification.image) {
      return `
        <img 
          src="${classification.image_url || classification.imagePath || classification.image}" 
          alt="${classification.plant_name || 'Planta'}"
          onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
        />
        <div class="image-placeholder" style="display: none;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
        </div>
      `;
    }

    return `
      <div class="image-placeholder">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <circle cx="8.5" cy="8.5" r="1.5"></circle>
          <polyline points="21 15 16 10 5 21"></polyline>
        </svg>
      </div>
    `;
  }

  createAdditionalInfo(classification) {
    const additionalInfo = [];

    if (classification.family) {
      additionalInfo.push(`<p class="info-item"><strong>Familia:</strong> ${classification.family}</p>`);
    }

    if (classification.genus) {
      additionalInfo.push(`<p class="info-item"><strong>Género:</strong> ${classification.genus}</p>`);
    }

    if (classification.common_names && Array.isArray(classification.common_names)) {
      additionalInfo.push(`<p class="info-item"><strong>Nombres comunes:</strong> ${classification.common_names.join(', ')}</p>`);
    }

    if (classification.description) {
      additionalInfo.push(`<p class="info-item"><strong>Descripción:</strong> ${classification.description}</p>`);
    }

    if (classification.location) {
      additionalInfo.push(`<p class="info-item"><strong>Ubicación:</strong> ${classification.location}</p>`);
    }

    return additionalInfo.length > 0 ? 
      `<div class="additional-info">${additionalInfo.join('')}</div>` : '';
  }

  renderPaginationInfo() {
    const paginationInfo = document.getElementById('paginationInfo');
    if (!paginationInfo) return;

    paginationInfo.innerHTML = `
      <p>Total de clasificaciones: <strong>${this.totalCount}</strong></p>
      <p>Total de páginas: <strong>${this.totalPages}</strong></p>
    `;
  }

  getConfidenceColor(confidence) {
    if (confidence >= 90) return '#22c55e'; // Verde
    if (confidence >= 70) return '#f59e0b'; // Amarillo
    if (confidence >= 50) return '#f97316'; // Naranja
    return '#ef4444'; // Rojo
  }

  sortClassifications(sortBy) {
    switch (sortBy) {
      case 'newest':
        this.classifications.sort((a, b) => {
          const dateA = new Date(a.created_at || a.timestamp || a.createdAt || a.date || 0);
          const dateB = new Date(b.created_at || b.timestamp || b.createdAt || b.date || 0);
          return dateB - dateA;
        });
        break;
      case 'oldest':
        this.classifications.sort((a, b) => {
          const dateA = new Date(a.created_at || a.timestamp || a.createdAt || a.date || 0);
          const dateB = new Date(b.created_at || b.timestamp || b.createdAt || b.date || 0);
          return dateA - dateB;
        });
        break;
      case 'confidence':
        this.classifications.sort((a, b) => {
          const confA = a.speciesConfidence || a.confidence || a.score || 0;
          const confB = b.speciesConfidence || b.confidence || b.score || 0;
          return confB - confA;
        });
        break;
    }
    this.renderClassifications();
  }

  // Métodos de paginación
  calculatePagination() {
    // totalPages ya viene del API, no necesitamos calcularlo
    // Solo asegurarnos de que esté actualizado
    if (this.totalCount > 0 && this.totalPages === 0) {
      this.totalPages = Math.ceil(this.totalCount / this.itemsPerPage);
    }
  }

  renderClassifications() {
    const container = document.getElementById('classificationsContainer');
    if (!container) return;

    // El backend ya devuelve solo los items de la página actual
    // No necesitamos hacer slice, usamos directamente this.classifications
    const classificationsHTML = this.classifications.map(classification =>
      this.createClassificationCard(classification)
    ).join('');

    container.innerHTML = classificationsHTML;
  }

  updatePagination() {
    this.updatePaginationInfo();
    this.updatePaginationButtons();
    this.renderPageNumbers();
    this.showPagination();
  }

  updatePaginationInfo() {
    const paginationInfo = document.getElementById('paginationInfo');
    if (!paginationInfo) return;

    const startItem = (this.currentPage - 1) * this.itemsPerPage + 1;
    const endItem = Math.min(this.currentPage * this.itemsPerPage, this.totalCount);
    
    paginationInfo.textContent = `Mostrando ${startItem}-${endItem} de ${this.totalCount} clasificaciones`;
  }

  updatePaginationButtons() {
    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');
    
    if (prevBtn) {
      prevBtn.disabled = this.currentPage === 1;
    }
    
    if (nextBtn) {
      nextBtn.disabled = this.currentPage === this.totalPages;
    }
  }

  renderPageNumbers() {
    const pageNumbersContainer = document.getElementById('pageNumbers');
    if (!pageNumbersContainer) return;

    const maxVisiblePages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    let pageNumbersHTML = '';

    // Primera página
    if (startPage > 1) {
      pageNumbersHTML += `<span class="page-number" data-page="1">1</span>`;
      if (startPage > 2) {
        pageNumbersHTML += `<span class="page-number ellipsis">...</span>`;
      }
    }

    // Páginas visibles
    for (let i = startPage; i <= endPage; i++) {
      const activeClass = i === this.currentPage ? 'active' : '';
      pageNumbersHTML += `<span class="page-number ${activeClass}" data-page="${i}">${i}</span>`;
    }

    // Última página
    if (endPage < this.totalPages) {
      if (endPage < this.totalPages - 1) {
        pageNumbersHTML += `<span class="page-number ellipsis">...</span>`;
      }
      pageNumbersHTML += `<span class="page-number" data-page="${this.totalPages}">${this.totalPages}</span>`;
    }

    pageNumbersContainer.innerHTML = pageNumbersHTML;

    // Agregar event listeners a los números de página
    pageNumbersContainer.querySelectorAll('.page-number:not(.ellipsis)').forEach(pageNumber => {
      pageNumber.addEventListener('click', (e) => {
        const page = parseInt(e.target.dataset.page);
        this.goToPage(page);
      });
    });
  }

  goToPage(page) {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      // Cargar los datos de la nueva página desde el API
      this.loadClassifications(page);
    }
  }

  goToPreviousPage() {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  goToNextPage() {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  showPagination() {
    const paginationControls = document.getElementById('paginationControls');
    if (paginationControls && this.totalPages > 1) {
      paginationControls.classList.remove('hidden');
    }
  }

  hidePagination() {
    const paginationControls = document.getElementById('paginationControls');
    if (paginationControls) {
      paginationControls.classList.add('hidden');
    }
  }

  // Estados visuales
  showLoading() { document.getElementById('loadingState')?.classList.remove('hidden'); }
  hideLoading() { document.getElementById('loadingState')?.classList.add('hidden'); }
  showError() { document.getElementById('errorState')?.classList.remove('hidden'); }
  hideError() { document.getElementById('errorState')?.classList.add('hidden'); }
  showEmptyState() { 
    const element = document.getElementById('emptyState');
    if (element) {
      element.classList.remove('hidden');
      console.log('🔧 showEmptyState ejecutado - elemento mostrado');
    } else {
      console.log('🔧 showEmptyState - elemento no encontrado');
    }
  }
  hideEmptyState() { 
    const element = document.getElementById('emptyState');
    console.log('🔧 hideEmptyState - elemento:', element);
    if (element) {
      element.classList.add('hidden');
      console.log('🔧 hideEmptyState ejecutado - elemento oculto', element.classList);

    } else {
      console.log('🔧 hideEmptyState - elemento no encontrado');
    }
  }
  showClassificationsList() { document.getElementById('classificationsList')?.classList.remove('hidden'); }
  hideClassificationsList() { document.getElementById('classificationsList')?.classList.add('hidden'); }

  // Métodos del modal
  showDetailsModal(classification) {
    console.log('🔍 Mostrando modal para:', classification);
    
    // Mostrar imagen
    this.renderModalImage(classification);
    
    // Mostrar información técnica
    this.renderTechnicalInfo(classification);
    
    // Mostrar JSON completo
    this.renderJsonData(classification);
    
    // Mostrar modal
    const modal = document.getElementById('detailsModal');
    if (modal) {
      console.log('🔍 Removiendo clase hidden del modal');
      modal.classList.remove('hidden');
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden'; // Prevenir scroll del body
      console.log('🔍 Modal mostrado, clases:', modal.classList.toString());
    } else {
      console.error('❌ Modal no encontrado');
    }
  }

  closeModal() {
    const modal = document.getElementById('detailsModal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = ''; // Restaurar scroll del body
    }
  }

  renderModalImage(classification) {
    const modalImage = document.getElementById('modalImage');
    if (!modalImage) return;

    const imageUrl = classification.image_url || classification.imagePath || classification.image;
    console.log(`🖼️ Intentando cargar imagen desde: ${imageUrl}`);

    if (imageUrl) {
      modalImage.innerHTML = `
        <img 
          src="${imageUrl}" 
          alt="Imagen de ${classification.scientific_name || classification.plant_name || 'Planta'}"
          class="modal-plant-image"
          onerror="this.parentElement.innerHTML = this.parentElement.dataset.placeholder;"
        />
      `;
      // Guardar el placeholder en un data attribute por si falla la carga
      modalImage.dataset.placeholder = `
        <div class="image-placeholder">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
          <span>Imagen no disponible</span>
        </div>
      `;
    } else {
      modalImage.innerHTML = `
        <div class="image-placeholder">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
          <span>Imagen no disponible</span>
        </div>
      `;
    }
  }

  renderMainInfo(classification) {
    const mainInfo = document.getElementById('mainInfo');
    if (!mainInfo) return;

    // Nombre científico (predicho) con confianza
    const scientificName = classification.scientificName || classification.scientific_name || 'No identificado';
    const confidence = classification.speciesConfidence !== undefined && classification.speciesConfidence !== null
      ? Math.round((classification.speciesConfidence <= 1 ? classification.speciesConfidence * 100 : classification.speciesConfidence))
      : null;
    const plantNameWithConfidence = confidence !== null 
      ? `${scientificName} (${confidence}%)`
      : scientificName;

    // Nombre común (preferir español, luego inglés)
    const commonName = classification.commonNameEs || classification.commonNameEn || classification.common_name || 'Nombre común no disponible';

    // Estado de salud
    const isHealthy = classification.isHealthy !== undefined ? classification.isHealthy : classification.taggedHealthy;
    const healthStatus = isHealthy === true ? 'Healthy' : isHealthy === false ? 'Diseased' : 'No determinado';
    const healthIcon = isHealthy === true ? '✅' : isHealthy === false ? '❌' : '❓';
    const healthColor = isHealthy === true ? 'var(--success-color)' : isHealthy === false ? '#ef4444' : 'var(--text-secondary)';

    const mainInfoHTML = `
      <div class="info-card">
        <div class="info-label">
          <span class="info-icon">🌿</span>
          Especie (Predicho)
        </div>
        <div class="info-value">${plantNameWithConfidence}</div>
      </div>
      <div class="info-card">
        <div class="info-label">
          <span class="info-icon">🏷️</span>
          Nombre Común
        </div>
        <div class="info-value">${commonName}</div>
      </div>
      <div class="info-card">
        <div class="info-label">
          <span class="info-icon">${healthIcon}</span>
          Estado de Salud
        </div>
        <div class="info-value" style="color: ${healthColor}; font-weight: 600;">${healthStatus}</div>
      </div>
    `;

    mainInfo.innerHTML = mainInfoHTML || '<div class="info-card"><div class="info-value">No hay información principal disponible</div></div>';
  }

  renderTechnicalInfo(classification) {
    const technicalInfo = document.getElementById('technicalInfo');
    if (!technicalInfo) return;

    // Nombre científico (predicho) con confianza
    const scientificName = classification.scientificName || classification.scientific_name || 'No identificado';
    const confidence = classification.speciesConfidence !== undefined && classification.speciesConfidence !== null
      ? Math.round((classification.speciesConfidence <= 1 ? classification.speciesConfidence * 100 : classification.speciesConfidence))
      : null;
    const plantNameWithConfidence = confidence !== null 
      ? `${scientificName} (${confidence}%)`
      : scientificName;

    // Nombre común (preferir español, luego inglés)
    const commonName = classification.commonNameEs || classification.commonNameEn || classification.common_name || 'Nombre común no disponible';

    // Estado de salud
    const isHealthy = classification.isHealthy !== undefined ? classification.isHealthy : classification.taggedHealthy;
    const healthStatus = isHealthy === true ? 'Healthy' : isHealthy === false ? 'Diseased' : 'No determinado';
    const healthIcon = isHealthy === true ? '✅' : isHealthy === false ? '❌' : '❓';
    const healthColor = isHealthy === true ? 'var(--success-color)' : isHealthy === false ? '#ef4444' : 'var(--text-secondary)';

    // Obtener y formatear la fecha
    const dateValue = classification.created_at || classification.timestamp || classification.createdAt || classification.date;
    let formattedDateTime = 'Fecha no disponible';
    
    if (dateValue) {
      const date = new Date(dateValue);
      if (!isNaN(date.getTime())) {
        const dateStr = date.toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
        const timeStr = date.toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
        formattedDateTime = `${dateStr} a las ${timeStr}`;
      }
    }

    const i18n = window.i18nManager || { t: (key) => key };
    const relevantFields = [
      { key: 'species', label: i18n.t('classification.species'), value: plantNameWithConfidence, icon: '🌿' },
      { key: 'commonName', label: i18n.t('classification.commonName'), value: commonName, icon: '🏷️' },
      { key: 'healthStatus', label: i18n.t('classification.healthStatus'), value: healthStatus, color: healthColor, icon: healthIcon },
      { key: 'dateTime', label: i18n.t('classification.dateTime'), value: formattedDateTime, icon: '📅' },
      { key: 'shapeConfidence', label: i18n.t('classification.formConfidence'), format: (value) => `${Math.round((value <= 1 ? value * 100 : value))}%`, icon: '📐' },
      { key: 'shape', label: i18n.t('classification.shape'), icon: '💠' },
      { key: 'status', label: i18n.t('classification.status'), icon: '🚦' }
    ];

    const technicalInfoHTML = relevantFields
      .filter(field => {
        // Campos que siempre deben mostrarse (tienen value predefinido)
        if (field.value !== undefined) return true;
        // Para los demás, verificar si existen en classification
        return classification[field.key] !== undefined && classification[field.key] !== null;
      })
      .map(field => {
        let value;
        // Si tiene value predefinido (como dateTime, species, commonName, healthStatus)
        if (field.value !== undefined) {
          value = field.value;
        } else if (field.format) {
          value = field.format(classification[field.key]);
        } else {
          value = classification[field.key];
        }
        
        const valueStyle = field.color ? `style="color: ${field.color}; font-weight: 600;"` : '';
        
        return `
          <div class="info-card">
            <div class="info-label">
              <span class="info-icon">${field.icon}</span>
              ${field.label}
            </div>
            <div class="info-value" ${valueStyle}>${value}</div>
          </div>
        `;
      }).join('');

    technicalInfo.innerHTML = technicalInfoHTML || '<div class="info-card"><div class="info-value">No hay información técnica relevante</div></div>';
  }

  renderJsonData(classification) {
    const jsonData = document.getElementById('jsonData');
    if (!jsonData) return;

    jsonData.textContent = JSON.stringify(classification, null, 2);
  }

  formatFieldLabel(key) {
    const labels = {
      'id': 'ID',
      '_id': 'ID',
      'confidence': 'Confianza',
      'score': 'Puntuación',
      'timestamp': 'Timestamp',
      'location': 'Ubicación',
      'description': 'Descripción',
      'common_names': 'Nombres Comunes',
      'image_url': 'URL de Imagen',
      'image': 'Imagen',
      'user_id': 'ID de Usuario',
      'model_version': 'Versión del Modelo',
      'processing_time': 'Tiempo de Procesamiento',
      'metadata': 'Metadatos'
    };
    
    return labels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  formatFieldValue(value) {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'boolean') return value ? 'Sí' : 'No';
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    if (typeof value === 'number' && value < 1 && value > 0) return `${Math.round(value * 100)}%`;
    return String(value);
  }

  async copyJsonToClipboard() {
    const jsonData = document.getElementById('jsonData');
    if (!jsonData) return;

    try {
      await navigator.clipboard.writeText(jsonData.textContent);
      
      // Mostrar feedback visual
      const copyBtn = document.getElementById('copyJsonBtn');
      const originalText = copyBtn.innerHTML;
      copyBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20,6 9,17 4,12"></polyline>
        </svg>
        Copiado
      `;
      
      setTimeout(() => {
        copyBtn.innerHTML = originalText;
      }, 2000);
      
    } catch (error) {
      console.error('Error al copiar:', error);
      alert('No se pudo copiar al portapapeles');
    }
  }
}

// Función global para ver detalles
window.viewClassificationDetails = function (classificationId) {
  console.log('Ver detalles de clasificación:', classificationId);
  
  // Buscar la clasificación por ID
  const classification = window.historialManager?.classifications.find(c => 
    (c.id || c._id) === classificationId
  );
  
  if (classification && window.historialManager) {
    window.historialManager.showDetailsModal(classification);
  } else {
    console.error('Clasificación no encontrada:', classificationId);
  }
};

// Función global para mostrar recomendaciones desde el historial
window.showRecommendationsFromHistorial = function (scientificName, commonName) {
  const recommendations = getRecommendationsByScientificName(scientificName);
  const i18n = window.i18nManager || { t: (key) => key };
  
  if (!recommendations) {
    alert(`No hay recomendaciones disponibles para ${scientificName}`);
    return;
  }

  // Crear o obtener el modal de recomendaciones
  let recommendationsModal = document.getElementById("recommendationsModal");
  
  if (!recommendationsModal) {
    recommendationsModal = document.createElement("div");
    recommendationsModal.id = "recommendationsModal";
    recommendationsModal.className = "modal hidden";
    document.body.appendChild(recommendationsModal);
  }

  const currentLang = i18n.getCurrentLanguage ? i18n.getCurrentLanguage() : 'es';
  
  // Construir el contenido del modal
  let diseasesHTML = '';
  recommendations.diseases.forEach(disease => {
    const translatedName = translateRecommendationText(disease.name, currentLang);
    const translatedSymptoms = disease.symptoms.map(s => translateRecommendationText(s, currentLang));
    const translatedTreatments = disease.treatments.map(t => translateRecommendationText(t, currentLang));
    const translatedCause = disease.cause ? translateRecommendationText(disease.cause, currentLang) : '';
    const translatedVector = disease.vector ? translateRecommendationText(disease.vector, currentLang) : '';
    
    const symptomsHTML = translatedSymptoms.map(s => `<li>${s}</li>`).join('');
    const treatmentsHTML = translatedTreatments.map(t => `<li>${t}</li>`).join('');
    const causeHTML = translatedCause ? `<p class="disease-cause"><strong>${i18n.t('recommendations.cause')}:</strong> ${translatedCause}</p>` : '';
    const vectorHTML = translatedVector ? `<p class="disease-vector"><strong>${i18n.t('recommendations.vector')}:</strong> ${translatedVector}</p>` : '';
    
    diseasesHTML += `
      <div class="disease-card">
        <h4 class="disease-name">${translatedName}</h4>
        ${causeHTML}
        ${vectorHTML}
        <div class="disease-section">
          <h5 class="disease-section-title">${i18n.t('recommendations.symptoms')}:</h5>
          <ul class="disease-list">${symptomsHTML}</ul>
        </div>
        <div class="disease-section">
          <h5 class="disease-section-title">${i18n.t('recommendations.treatments')}:</h5>
          <ul class="disease-list">${treatmentsHTML}</ul>
        </div>
      </div>
    `;
  });

  const translatedCommonName = translateRecommendationText(recommendations.commonName, currentLang);
  const translatedPractices = recommendations.generalPractices.map(p => translateRecommendationText(p, currentLang));
  const generalPracticesHTML = translatedPractices.map(p => `<li>${p}</li>`).join('');

  recommendationsModal.innerHTML = `
    <div class="modal-overlay"></div>
    <div class="modal-content recommendations-modal-content">
      <div class="modal-header">
        <h2 class="modal-title">${i18n.t('recommendations.title')} ${translatedCommonName}</h2>
        <button class="modal-close-btn" id="closeRecommendationsModal">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="modal-body recommendations-modal-body">
        <div class="recommendations-intro">
          <p class="scientific-name"><em>${recommendations.scientificName}</em></p>
        </div>
        <div class="diseases-section">
          <h3 class="section-title-recommendations">${i18n.t('recommendations.commonDiseases')}</h3>
          ${diseasesHTML}
        </div>
        ${recommendations.generalPractices.length > 0 ? `
          <div class="general-practices-section">
            <h3 class="section-title-recommendations">${i18n.t('recommendations.culturalPractices')}</h3>
            <ul class="disease-list">${generalPracticesHTML}</ul>
          </div>
        ` : ''}
      </div>
    </div>
  `;

  // Agregar event listeners
  const closeBtn = recommendationsModal.querySelector("#closeRecommendationsModal");
  const overlay = recommendationsModal.querySelector(".modal-overlay");
  
  const closeModal = () => {
    recommendationsModal.classList.add("hidden");
    document.body.style.overflow = "";
  };
  
  if (closeBtn) {
    closeBtn.addEventListener("click", closeModal);
  }

  if (overlay) {
    overlay.addEventListener("click", closeModal);
  }

  // Cerrar con ESC
  const handleEscKey = (e) => {
    if (e.key === "Escape" && !recommendationsModal.classList.contains("hidden")) {
      closeModal();
      document.removeEventListener("keydown", handleEscKey);
    }
  };
  document.addEventListener("keydown", handleEscKey);

  // Mostrar el modal
  recommendationsModal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
};

document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Historial page loaded, initializing HistorialManager');
  try {
    window.historialManager = new HistorialManager();
    console.log('✅ HistorialManager initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing HistorialManager:', error);
  }
});
