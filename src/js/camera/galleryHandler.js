import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Filesystem } from '@capacitor/filesystem';
import { base64ToBlob } from '../utils/base64.js';
import { isNativePlatform } from '../core/config.js';
import { sendToServer } from '../classification/classify.js';

// Show image preview and classify button
function showImagePreview(imageSrc, blob) {
  const imagePreview = document.getElementById('imagePreview');
  const previewImg = document.getElementById('previewImg');
  const classifyBtn = document.getElementById('classifyButton');
  
  if (previewImg && imagePreview && classifyBtn) {
    previewImg.src = imageSrc;
    imagePreview.classList.remove('hidden');
    classifyBtn.classList.remove('hidden');
    
    // Store blob for classification
    classifyBtn.onclick = () => sendToServer(blob);
  }
}

export function initGallery() {
  const selectImageButton = document.getElementById("selectImage");
  const fileInput = document.getElementById("fileInput");
  if (!selectImageButton) return;

  selectImageButton.addEventListener("click", async () => {
    if (!isNativePlatform) {
      fileInput.click();
      return;
    }

    try {
      await Camera.requestPermissions();
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos,
      });

      let blob;
      if (image.path && image.path.startsWith('file://')) {
        const file = await Filesystem.readFile({ path: image.path });
        blob = base64ToBlob(file.data, 'image/jpeg');
      } else if (image.webPath) {
        const response = await fetch(image.webPath);
        blob = await response.blob();
      } else throw new Error("No se pudo obtener la ruta de la imagen");

      // Show preview instead of sending directly
      const reader = new FileReader();
      reader.onload = (e) => showImagePreview(e.target.result, blob);
      reader.readAsDataURL(blob);

    } catch (error) {
      console.error("❌ Error galería:", error);
      alert("❌ Error al seleccionar imagen de la galería");
    }
  });

  if (fileInput) {
    fileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => showImagePreview(event.target.result, file);
        reader.readAsDataURL(file);
      }
    });
  }
}
