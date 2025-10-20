import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Filesystem } from '@capacitor/filesystem';
import { base64ToBlob } from '../utils/base64.js';
import { isNativePlatform } from '../core/config.js';
import { sendToServer } from '../classification/classify.js';

export function initCamera() {
  const openCamera = document.getElementById("openCamera");
  const closeCamera = document.getElementById("closeCamera");
  const capture = document.getElementById("capture");
  const camera = document.getElementById("camera");
  const canvas = document.getElementById("snapshot");

  if (!openCamera) return;

  openCamera.addEventListener("click", async () => {
    try {
      if (!isNativePlatform) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        camera.srcObject = stream;
        camera.classList.remove("hidden");
        closeCamera.classList.add("active");
        capture.classList.add("active");
        return;
      }

      await Camera.requestPermissions();
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        saveToGallery: false,
      });

      let blob;
      if (image.path && image.path.startsWith('file://')) {
        const file = await Filesystem.readFile({ path: image.path });
        blob = base64ToBlob(file.data, 'image/jpeg');
      } else if (image.webPath) {
        const response = await fetch(image.webPath);
        blob = await response.blob();
      } else throw new Error("No se pudo obtener la imagen");

      await sendToServer(blob);

    } catch (error) {
      console.error("❌ Error cámara:", error);
      alert("❌ No se pudo acceder a la cámara");
    }
  });

  if (closeCamera) closeCamera.addEventListener("click", () => {
    const stream = camera.srcObject;
    if (stream) stream.getTracks().forEach((t) => t.stop());
    camera.srcObject = null;
    camera.classList.add("hidden");
    closeCamera.classList.remove("active");
    capture.classList.remove("active");
  });

  if (capture) capture.addEventListener("click", () => {
    const ctx = canvas.getContext("2d");
    canvas.width = camera.videoWidth;
    canvas.height = camera.videoHeight;
    ctx.drawImage(camera, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) sendToServer(blob);
    }, "image/jpeg", 0.9);
  });
}
