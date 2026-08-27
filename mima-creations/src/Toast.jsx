import React from "react";
import { CREAM, SAGE_DARK } from "./adminTheme";

export default function Toast({ message, visible }) {
  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 text-sm"
      style={{
        background: SAGE_DARK,
        color: CREAM,
        opacity: visible ? 1 : 0,
        transform: `translateX(-50%) translateY(${visible ? "0" : "8px"})`,
        transition: "opacity 0.25s ease, transform 0.25s ease",
        pointerEvents: "none",
      }}
    >
      {message}
    </div>
  );
}