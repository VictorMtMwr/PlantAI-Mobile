import { API_URL, isNativePlatform } from '../core/config.js';
import { getToken } from '../auth/sessionManager.js';
import { getRecommendationsByScientificName } from '../data/diseaseRecommendations.js';
import { translateRecommendationText } from '../i18n/recommendationsTranslations.js';

document.addEventListener("DOMContentLoaded", () => {
  const closeModalButton = document.getElementById("closeModal");
  const modal = document.getElementById("modal");
  const modalOverlay = modal?.querySelector(".modal-overlay");

  if (closeModalButton && modal) {
    closeModalButton.addEventListener("click", () => {
      modal.classList.add("hidden");
      document.body.style.overflow = "";
    });
  }

  if (modalOverlay && modal) {
    modalOverlay.addEventListener("click", () => {
      modal.classList.add("hidden");
      document.body.style.overflow = "";
    });
  }

  // Cerrar con ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal && !modal.classList.contains("hidden")) {
      modal.classList.add("hidden");
      document.body.style.overflow = "";
    }
  });
});

export async function sendToServer(fileBlob) {
  const modal = document.getElementById("modal");
  const resultText = document.getElementById("resultText");
  const classificationImage = document.getElementById("classificationImage");
  
  if (modal) {
    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  }
  
  if (resultText) resultText.innerHTML = '<div class="info-card"><div class="info-value">Procesando imagen...</div></div>';
  if (classificationImage) classificationImage.innerHTML = "";

  // Mostrar la imagen cargada inmediatamente
  if (classificationImage && fileBlob) {
    const imageObjectUrl = URL.createObjectURL(fileBlob);
    classificationImage.innerHTML = `<img src="${imageObjectUrl}" alt="Imagen clasificada" />`;
  }

  // Obtener token correctamente usando la función centralizada
  const token = getToken();
  
  if (!token) {
    alert("No hay sesión activa");
    if (modal) {
      modal.classList.add("hidden");
      document.body.style.overflow = "";
    }
    return;
  }

  try {
    let responseData;

    if (isNativePlatform) {
      // Para plataforma nativa, usar XMLHttpRequest que funciona mejor con FormData en Android
      const formData = new FormData();
      formData.append("image", fileBlob, "plant_image.jpg");

      const response = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${API_URL}/plant-classifier/upload`, true);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText);
              resolve({ status: xhr.status, data });
            } catch (e) {
              resolve({ status: xhr.status, data: xhr.responseText });
            }
          } else {
            reject(new Error(`HTTP error! status: ${xhr.status}, message: ${xhr.responseText}`));
          }
        };
        
        xhr.onerror = () => reject(new Error('Network error'));
        xhr.ontimeout = () => reject(new Error('Request timeout'));
        xhr.send(formData);
      });

      responseData = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
    } else {
      // Para web, usar FormData normal
      const formData = new FormData();
      formData.append("image", fileBlob, "plant_image.jpg");

      const res = await fetch(`${API_URL}/plant-classifier/upload`, {
        method: "POST",
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error(await res.text());
      responseData = await res.json();
    }
    const data = responseData.classification || {};
    
    // Obtener nombre científico con confianza
    const scientificName = data.scientificName || data.scientific_name || data.species || "No identificado";
    const speciesConfidence = data.speciesConfidence !== undefined && data.speciesConfidence !== null
      ? Math.round((data.speciesConfidence <= 1 ? data.speciesConfidence * 100 : data.speciesConfidence))
      : null;
    const plantNameWithConfidence = speciesConfidence !== null
      ? `${scientificName} (${speciesConfidence}%)`
      : scientificName;

    // Obtener nombre común (preferir español)
    const commonName = data.commonNameEs || data.commonNameEn || data.common_name || "Nombre común no disponible";

    // Obtener forma con confianza
    const shape = data.shape || "Desconocida";
    const shapeConfidence = data.shapeConfidence !== undefined && data.shapeConfidence !== null
      ? Math.round((data.shapeConfidence <= 1 ? data.shapeConfidence * 100 : data.shapeConfidence))
      : null;
    const shapeWithConfidence = shapeConfidence !== null
      ? `${shape} (${shapeConfidence}%)`
      : shape;

    // Obtener estado de salud
    const isHealthy = data.isHealthy !== undefined ? data.isHealthy : data.taggedHealthy;
    const isDiseased = isHealthy === false;

    // Mostrar información usando el mismo formato que el modal de historial
    if (resultText) {
      let healthStatusHTML = '';
      if (isHealthy !== undefined) {
        const healthStatus = isHealthy === true ? 'Saludable' : 'Enferma';
        const healthIcon = isHealthy === true ? '✅' : '❌';
        const healthColor = isHealthy === true ? 'var(--success-color)' : '#ef4444';
        const i18n = window.i18nManager || { t: (key) => key };
        const healthStatusText = isHealthy === true 
          ? i18n.t('classification.healthy') 
          : i18n.t('classification.diseased');
        healthStatusHTML = `
          <div class="info-card">
            <div class="info-label">
              <span class="info-icon">${healthIcon}</span>
              ${i18n.t('classification.healthStatus')}
            </div>
            <div class="info-value" style="color: ${healthColor};">${healthStatusText}</div>
          </div>
        `;
      }

      const i18n = window.i18nManager || { t: (key) => key };
      resultText.innerHTML = `
        <div class="info-card">
          <div class="info-label">
            <span class="info-icon">🌿</span>
            ${i18n.t('classification.species')}
          </div>
          <div class="info-value">${plantNameWithConfidence}</div>
        </div>
        <div class="info-card">
          <div class="info-label">
            <span class="info-icon">🏷️</span>
            ${i18n.t('classification.commonName')}
          </div>
          <div class="info-value">${commonName}</div>
        </div>
        <div class="info-card">
          <div class="info-label">
            <span class="info-icon">📐</span>
            ${i18n.t('classification.shape')}
          </div>
          <div class="info-value">${shapeWithConfidence}</div>
        </div>
        ${healthStatusHTML}
      `;
    }

    // Actualizar imagen si hay URL de la API
    if (classificationImage) {
      const imageUrl = data.imagePath || data.imageUrl || data.image || "";
      let imageHTML = '';
      
      if (imageUrl) {
        const fullImageUrl = imageUrl.startsWith('http') 
          ? imageUrl 
          : `${API_URL.replace('/api/v1', '').replace('/api', '')}${imageUrl}`;
        imageHTML = `<img src="${fullImageUrl}" alt="Imagen clasificada" />`;
      } else if (fileBlob) {
        // Si no hay URL de la API, mantener la imagen del blob
        const imageObjectUrl = URL.createObjectURL(fileBlob);
        imageHTML = `<img src="${imageObjectUrl}" alt="Imagen clasificada" />`;
      }

      // Si está enferma, agregar botón de recomendaciones con wrapper
      if (isDiseased && imageHTML) {
        const i18n = window.i18nManager || { t: (key) => key };
        const recommendationsBtn = `
          <button id="recommendationsBtn" class="recommendations-btn" title="${i18n.t('recommendations.button')}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
              <path d="M2 17l10 5 10-5"></path>
              <path d="M2 12l10 5 10-5"></path>
            </svg>
            <span>${i18n.t('recommendations.button')}</span>
          </button>
        `;
        imageHTML = `<div class="modal-image-wrapper">${imageHTML}${recommendationsBtn}</div>`;
      }

      if (imageHTML) {
        classificationImage.innerHTML = imageHTML;

        // Agregar evento al botón de recomendaciones si existe
        if (isDiseased) {
          // Usar setTimeout para asegurar que el DOM esté actualizado
          setTimeout(() => {
            const recommendationsBtn = document.getElementById("recommendationsBtn");
            if (recommendationsBtn) {
              recommendationsBtn.addEventListener("click", () => {
                showRecommendationsModal(scientificName, commonName);
              });
            }
          }, 100);
        }
      }
    }

  } catch (error) {
    console.error("Error en clasificación:", error);
    if (resultText) {
      resultText.innerHTML = `<div class="info-card"><div class="info-value" style="color: #ef4444;">Error al clasificar la imagen: ${error.message}</div></div>`;
    }
  }
}

// Función para mostrar el modal de recomendaciones
function showRecommendationsModal(scientificName, commonName) {
  console.log(`🔍 Buscando recomendaciones para: "${scientificName}"`);
  const recommendations = getRecommendationsByScientificName(scientificName);
  
  if (!recommendations) {
    const i18n = window.i18nManager || { t: (key) => key };
    alert(i18n.t('recommendations.notAvailable') || `No hay recomendaciones disponibles para ${scientificName}`);
    return;
  }
  
  console.log(`✅ Recomendaciones encontradas para: "${recommendations.scientificName}"`);

  // Crear o obtener el modal de recomendaciones
  let recommendationsModal = document.getElementById("recommendationsModal");
  
  if (!recommendationsModal) {
    recommendationsModal = document.createElement("div");
    recommendationsModal.id = "recommendationsModal";
    recommendationsModal.className = "modal hidden";
    document.body.appendChild(recommendationsModal);
  }

  const i18n = window.i18nManager || { t: (key) => key };
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
}
