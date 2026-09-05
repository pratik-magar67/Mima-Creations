export const MAX_UPLOAD_SIZE_MB = 8;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

// iOS Safari sometimes reports an empty file.type for HEIC photos taken
// directly from the camera, so fall back to checking the extension too.
const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "heic", "heif"];

export function validateImageFile(file) {
  const ext = file.name.split(".").pop()?.toLowerCase();

  if (!ALLOWED_IMAGE_TYPES.includes(file.type) && !ALLOWED_EXTENSIONS.includes(ext)) {
    return "Please upload a JPEG, PNG, or WebP image.";
  }
  if (file.size > MAX_UPLOAD_SIZE_MB * 1024 * 1024) {
    return `Image must be smaller than ${MAX_UPLOAD_SIZE_MB}MB.`;
  }
  return null;
}

// Downscales an image to a max width and re-encodes as JPEG.
// Used for the enquiry reference photo, which has no crop step to piggyback resizing on.
const MAX_OUTPUT_WIDTH = 1600;

export function resizeImageFile(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      const scale = Math.min(1, MAX_OUTPUT_WIDTH / image.width);
      const width = Math.round(image.width * scale);
      const height = Math.round(image.height * scale);

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d").drawImage(image, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(objectUrl);
          if (!blob) return reject(new Error("Could not process image"));
          resolve(new File([blob], file.name, { type: "image/jpeg" }));
        },
        "image/jpeg",
        0.82
      );
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Could not load image"));
    };

    image.src = objectUrl;
  });
}
