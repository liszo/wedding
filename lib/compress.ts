export async function compressImage(
  file: File,
  maxDim = 1600,
  quality = 0.82
): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });

  let { width, height } = bitmap;
  const scale = Math.min(1, maxDim / Math.max(width, height));
  width = Math.round(width * scale);
  height = Math.round(height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas unavailable");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((res) =>
    canvas.toBlob(res, "image/jpeg", quality)
  );
  if (!blob) throw new Error("compression failed");
  return blob;
}