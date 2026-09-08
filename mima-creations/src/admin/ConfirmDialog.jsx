import React from "react";
import { CREAM, INK, INK_SOFT, CREAM_DARK } from "./adminTheme";

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6" style={{ background: "rgba(43,38,32,0.4)" }}>
      <div className="w-full max-w-sm p-6" style={{ background: CREAM, border: `1px solid ${CREAM_DARK}` }}>
        <p className="text-base font-medium mb-2" style={{ color: INK, fontFamily: "'Playfair Display', serif" }}>{title}</p>
        <p className="text-sm mb-5" style={{ color: INK_SOFT }}>{message}</p>
        <div className="flex gap-2 justify-end">
          <button onClick={onCancel} className="text-sm px-4 py-2" style={{ background: CREAM_DARK, color: INK }}>
            Cancel
          </button>
          <button onClick={onConfirm} className="text-sm px-4 py-2" style={{ background: "#B3261E", color: "#fff" }}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}