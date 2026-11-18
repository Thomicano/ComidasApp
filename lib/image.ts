/** Lee una imagen local, la achica (y si se pide la recorta al centro en cuadrado) y la devuelve como
 *  data URL JPEG. Achicar es obligatorio: una foto de celular entera no entra en localStorage. */
export async function readImage(file: File, { max, square = false }: { max: number; square?: boolean }) {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
  const img = new Image();
  img.src = dataUrl;
  await img.decode();
  const side = Math.min(img.naturalWidth, img.naturalHeight);
  const sw = square ? side : img.naturalWidth;
  const sh = square ? side : img.naturalHeight;
  const scale = Math.min(1, max / Math.max(sw, sh));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(sw * scale);
  canvas.height = Math.round(sh * scale);
  canvas.getContext("2d")!.drawImage(img, (img.naturalWidth - sw) / 2, (img.naturalHeight - sh) / 2, sw, sh, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.82);
}
