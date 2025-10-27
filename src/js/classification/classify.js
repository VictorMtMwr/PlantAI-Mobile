import { API_URL, isNativePlatform } from '../core/config.js';
import { getToken } from '../auth/sessionManager.js';

document.addEventListener("DOMContentLoaded", () => {
  const closeModalButton = document.getElementById("closeModal");
  const modal = document.getElementById("modal");

  if (closeModalButton && modal) {
    closeModalButton.addEventListener("click", () => {
      modal.classList.add("hidden"); // Ocultar el modal
    });
  }
});

export async function sendToServer(fileBlob) {
  const modal = document.getElementById("modal");
  const resultText = document.getElementById("resultText");
  if (modal) modal.classList.remove("hidden");
  if (resultText) resultText.textContent = "Procesando imagen...";

  // Obtener token correctamente usando la función centralizada
  const token = getToken();
  
  if (!token) {
    alert("No hay sesión activa");
    return;
  }

  try {
    const formData = new FormData();
    formData.append("image", fileBlob, "plant_image.jpg");

    const res = await fetch(`${API_URL}/plant-classifier/upload`, {
      method: "POST",
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });

    if (!res.ok) throw new Error(await res.text());
    const responseData = await res.json();
    const data = responseData.classification || {};
    const species = data.species || "Desconocida";
    const shape = data.shape || "Desconocida";
    const speciesConfidence = ((data.speciesConfidence || 0) * 100).toFixed(2);
    const shapeConfidence = ((data.shapeConfidence || 0) * 100).toFixed(2);
    const imageUrl = data.imageUrl ? (data.imageUrl.startsWith('http') ? data.imageUrl : `${API_URL.replace('/api','')}${data.imageUrl}`) : '';

    resultText.innerHTML = `
      <strong>Especie:</strong> ${species} (${speciesConfidence}%)<br>
      <strong>Forma:</strong> ${shape} (${shapeConfidence}%)<br>
      ${imageUrl ? `<img src="${imageUrl}" alt="Imagen clasificada" style="max-width:100%; margin-top:10px; border-radius:8px;">` : ''}
    `;

  } catch (error) {
    console.error("Error en clasificación:", error);
    resultText.textContent = `Error al clasificar la imagen: ${error.message}`;
  }
}
