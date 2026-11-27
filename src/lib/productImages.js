export const imageTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
export const maxImageBytes = 4 * 1024 * 1024;
export const maxProductImages = 10;

export function validateProductImage(file) {
  if (!file.size || !imageTypes.includes(file.type)) return "Choose a JPEG, PNG, WebP, or AVIF image.";
  if (file.size > maxImageBytes) return "Each product image must be 4 MB or smaller.";
  return "";
}
