const MAX_OUTPUT_WIDTH = 1200; // no product photo needs to be wider than this for web display

export function getCroppedImageFile(imageSrc, croppedAreaPixels, fileName) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = imageSrc;

    image.onload = () => {
      // Scale down the output if the crop is larger than we actually need
      const scale = Math.min(1, MAX_OUTPUT_WIDTH / croppedAreaPixels.width);
      const outputWidth = Math.round(croppedAreaPixels.width * scale);
      const outputHeight = Math.round(croppedAreaPixels.height * scale);

      const canvas = document.createElement("canvas");
      canvas.width = outputWidth;
      canvas.height = outputHeight;
      const ctx = canvas.getContext("2d");

      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        outputWidth,
        outputHeight
      );

      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Cropping failed"));
          return;
        }
        const file = new File([blob], fileName, { type: "image/jpeg" });
        resolve(file);
      }, "image/jpeg", 0.82);
    };

    image.onerror = () => reject(new Error("Could not load image for cropping"));
  });
}