import { API_URL, isNativePlatform } from '../core/config.js';
import { getToken } from '../auth/sessionManager.js';

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

    if (isNativePlatform()) {
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

    // Mostrar información usando el mismo formato que el modal de historial
    if (resultText) {
      resultText.innerHTML = `
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
            <span class="info-icon">📐</span>
            Forma
          </div>
          <div class="info-value">${shapeWithConfidence}</div>
        </div>
      `;
    }

    // Actualizar imagen si hay URL de la API
    if (classificationImage) {
      const imageUrl = data.imagePath || data.imageUrl || data.image || "";
      if (imageUrl) {
        const fullImageUrl = imageUrl.startsWith('http') 
          ? imageUrl 
          : `${API_URL.replace('/api/v1', '').replace('/api', '')}${imageUrl}`;
        classificationImage.innerHTML = `<img src="${fullImageUrl}" alt="Imagen clasificada" />`;
      } else if (fileBlob) {
        // Si no hay URL de la API, mantener la imagen del blob
        const imageObjectUrl = URL.createObjectURL(fileBlob);
        classificationImage.innerHTML = `<img src="${imageObjectUrl}" alt="Imagen clasificada" />`;
      }
    }

  } catch (error) {
    console.error("Error en clasificación:", error);
    if (resultText) {
      resultText.innerHTML = `<div class="info-card"><div class="info-value" style="color: #ef4444;">Error al clasificar la imagen: ${error.message}</div></div>`;
    }
  }
}
