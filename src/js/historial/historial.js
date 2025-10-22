import { API_URL, isNativePlatform } from '../core/config.js';
import { CapacitorHttp, Capacitor } from '@capacitor/core';
import { getCurrentToken, requireAuth } from '../auth/sessionManager.js';

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
    const closeModalBtn = document.getElementById('closeModalBtn');
    const closeModalBtn2 = document.getElementById('closeModalBtn2');
    const copyJsonBtn = document.getElementById('copyJsonBtn');
    const modal = document.getElementById('detailsModal');

    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', () => this.closeModal());
    }

    if (closeModalBtn2) {
      closeModalBtn2.addEventListener('click', () => this.closeModal());
    }

    if (copyJsonBtn) {
      copyJsonBtn.addEventListener('click', () => this.copyJsonToClipboard());
    }

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.classList.contains('modal-overlay')) {
          this.closeModal();
        }
      });
    }
  }

  async loadClassifications() {
    this.showLoading();
    this.hideError();
    this.hideEmptyState();
    this.hideClassificationsList();
    this.hidePagination();

    try {
      const token = getCurrentToken();
      if (!token) throw new Error('No token available');

      let data;

      if (Capacitor.isNativePlatform()) {
        const response = await CapacitorHttp.get({
          url: `${API_URL}/plant-classifier/classifications`,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        data = response.data;
      } else {
        const response = await fetch(`${API_URL}/plant-classifier/classifications`, {
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
    
    const date = new Date(classification.created_at || classification.timestamp || Date.now());
    const formattedDate = date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

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
    const confidenceColor = this.getConfidenceColor(confidence);

    return `
      <div class="classification-card">
        <div class="classification-image">
          ${this.createImageElement(classification)}
        </div>
        
        <div class="classification-info">
          <div class="classification-header">
            <h3 class="plant-name">${classification.scientific_name || classification.species || classification.plant_name || classification.name || 'Planta Desconocida'}</h3>
            <div class="confidence-badge" style="background-color: ${confidenceColor}">
              ${confidence}%
            </div>
          </div>
          
          <div class="classification-details">
            <p class="scientific-name">${classification.plant_name || classification.name || classification.scientific_name || 'Nombre común no disponible'}</p>
            <p class="classification-date">${formattedDate}</p>
          </div>
          
          ${this.createAdditionalInfo(classification)}
        </div>
        
        <div class="classification-actions">
          <button class="action-btn view-btn" onclick="viewClassificationDetails('${classification.id || classification._id}')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            Ver Detalles
          </button>
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
          class="plant-image"
          onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
        />
        <div class="placeholder-image" style="display: none;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
        </div>
      `;
    }

    return `
      <div class="placeholder-image">
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
        this.classifications.sort((a, b) => new Date(b.created_at || b.timestamp) - new Date(a.created_at || a.timestamp));
        break;
      case 'oldest':
        this.classifications.sort((a, b) => new Date(a.created_at || a.timestamp) - new Date(b.created_at || b.timestamp));
        break;
      case 'confidence':
        this.classifications.sort((a, b) => (b.confidence || b.score || 0) - (a.confidence || a.score || 0));
        break;
    }
    this.renderClassifications();
  }

  // Métodos de paginación
  calculatePagination() {
    // totalCount ya viene del API, solo calcular totalPages
    this.totalPages = Math.ceil(this.totalCount / this.itemsPerPage);
  }

  getCurrentPageItems() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.classifications.slice(startIndex, endIndex);
  }

  renderClassifications() {
    const container = document.getElementById('classificationsContainer');
    if (!container) return;

    const currentPageItems = this.getCurrentPageItems();
    const classificationsHTML = currentPageItems.map(classification =>
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
      this.currentPage = page;
      this.renderClassifications();
      this.updatePagination();
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
    
    // Mostrar información principal
    this.renderMainInfo(classification);
    
    // Mostrar información técnica
    this.renderTechnicalInfo(classification);
    
    // Mostrar JSON completo
    this.renderJsonData(classification);
    
    // Mostrar modal
    const modal = document.getElementById('detailsModal');
    if (modal) {
      modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden'; // Prevenir scroll del body
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

    if (classification.image_url || classification.image) {
      modalImage.innerHTML = `
        <img 
          src="${classification.image_url || classification.image}" 
          alt="${classification.scientific_name || classification.plant_name || 'Planta'}"
          onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
        />
        <div class="placeholder-image" style="display: none;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
        </div>
      `;
    } else {
      modalImage.innerHTML = `
        <div class="placeholder-image">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
        </div>
      `;
    }
  }

  renderMainInfo(classification) {
    const mainInfo = document.getElementById('mainInfo');
    if (!mainInfo) return;

    const mainFields = [
      { key: 'scientific_name', label: 'Nombre Científico' },
      { key: 'plant_name', label: 'Nombre Común' },
      { key: 'species', label: 'Especie' },
      { key: 'genus', label: 'Género' },
      { key: 'family', label: 'Familia' },
      { key: 'speciesConfidence', label: 'Confianza (%)', format: (value) => `${Math.round(value * 100)}%` },
      { key: 'created_at', label: 'Fecha de Clasificación', format: (value) => new Date(value).toLocaleString('es-ES') }
    ];

    const mainInfoHTML = mainFields
      .filter(field => classification[field.key] !== undefined && classification[field.key] !== null)
      .map(field => {
        const value = field.format ? field.format(classification[field.key]) : classification[field.key];
        return `
          <div class="info-item">
            <div class="info-label">${field.label}</div>
            <div class="info-value">${value}</div>
          </div>
        `;
      }).join('');

    mainInfo.innerHTML = mainInfoHTML || '<div class="info-item"><div class="info-value">No hay información principal disponible</div></div>';
  }

  renderTechnicalInfo(classification) {
    const technicalInfo = document.getElementById('technicalInfo');
    if (!technicalInfo) return;

    // Excluir campos ya mostrados en información principal
    const excludedFields = ['scientific_name', 'plant_name', 'species', 'genus', 'family', 'speciesConfidence', 'created_at', 'image_url', 'image'];
    
    const technicalFields = Object.keys(classification)
      .filter(key => !excludedFields.includes(key))
      .map(key => ({
        key,
        label: this.formatFieldLabel(key),
        value: this.formatFieldValue(classification[key])
      }));

    const technicalInfoHTML = technicalFields
      .map(field => `
        <div class="info-item">
          <div class="info-label">${field.label}</div>
          <div class="info-value">${field.value}</div>
        </div>
      `).join('');

    technicalInfo.innerHTML = technicalInfoHTML || '<div class="info-item"><div class="info-value">No hay información técnica disponible</div></div>';
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
        ¡Copiado!
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

document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Historial page loaded, initializing HistorialManager');
  try {
    window.historialManager = new HistorialManager();
    console.log('✅ HistorialManager initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing HistorialManager:', error);
  }
});
