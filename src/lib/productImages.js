export const imageTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
export const maxImageBytes = 4 * 1024 * 1024;
export const maxProductImages = 10;

export const imageUploadPath = "/api/hv/admin/product-images";

/** Uploads one photo to the backend (Cloudinary) and returns its public URL. */
export async function uploadProductImage(file, token) {
  const response = await fetch(imageUploadPath, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: file,
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.url) {
    const error = new Error(payload?.message || "Could not upload the product image.");
    error.status = response.status;
    throw error;
  }
  return payload.url;
}

export function validateProductImage(file) {
  if (!file.size || !imageTypes.includes(file.type)) return "Choose a JPEG, PNG, WebP, or AVIF image.";
  if (file.size > maxImageBytes) return "Each product image must be 4 MB or smaller.";
  return "";
}
