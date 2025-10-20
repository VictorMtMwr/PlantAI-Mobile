import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Filesystem } from '@capacitor/filesystem';
import { base64ToBlob } from '../utils/base64.js';
import { isNativePlatform } from '../core/config.js';
import { sendToServer } from '../classification/classify.js';

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

      await sendToServer(blob);

    } catch (error) {
      console.error("❌ Error galería:", error);
      alert("❌ Error al seleccionar imagen de la galería");
    }
  });

  if (fileInput) {
    fileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) sendToServer(file);
    });
  }
}
