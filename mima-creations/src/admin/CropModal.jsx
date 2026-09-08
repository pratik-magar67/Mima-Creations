import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { getCroppedImageFile } from "./cropImage";
import { CREAM, INK, INK_SOFT, SAGE_DARK, CREAM_DARK } from "./adminTheme";

export default function CropModal({ imageSrc, fileName, onCancel, onConfirm }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [processing, setProcessing] = useState(false);

  const onCropComplete = useCallback((_, pixels) => {
    setCroppedAreaPixels(pixels);
  }, []);

  async function handleConfirm() {
    if (!croppedAreaPixels) return;
    setProcessing(true);
    try {
      const croppedFile = await getCroppedImageFile(imageSrc, croppedAreaPixels, fileName);
      onConfirm(croppedFile);
    } catch (err) {
      console.error("Crop failed:", err.message);
      setProcessing(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6" style={{ background: "rgba(43,38,32,0.6)" }}>
      <div className="w-full max-w-md p-5" style={{ background: CREAM, border: `1px solid ${CREAM_DARK}` }}>
        <p className="text-base font-medium mb-3" style={{ color: INK, fontFamily: "'Playfair Display', serif" }}>
          Crop photo
        </p>

        <div style={{ position: "relative", width: "100%", height: "320px", background: "#000" }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={4 / 5}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="mt-4 mb-4">
          <label className="text-xs" style={{ color: INK_SOFT }}>Zoom</label>
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="flex gap-2 justify-end">
          <button onClick={onCancel} className="text-sm px-4 py-2" style={{ background: CREAM_DARK, color: INK }}>
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={processing}
            className="text-sm px-4 py-2"
            style={{ background: SAGE_DARK, color: CREAM }}
          >
            {processing ? "Cropping..." : "Use this crop"}
          </button>
        </div>
      </div>
    </div>
  );
}