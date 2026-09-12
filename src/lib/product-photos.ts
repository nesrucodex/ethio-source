export const MAX_PRODUCT_PHOTOS = 8;
export const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
export const PHOTO_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

export function validPhotoUrl(value: string) {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      url.hostname.includes(".") &&
      !/^(localhost|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.)/.test(
        url.hostname,
      ) &&
      !url.hostname.endsWith(".local")
    );
  } catch {
    return false;
  }
}
