import React from "react";
import { Heart } from "lucide-react";
import { CREAM, INK, INK_SOFT, SAGE_DARK, ROSE } from "./theme";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ background: CREAM, fontFamily: "'Jost', sans-serif" }}
    >
      <Heart size={28} color={ROSE} strokeWidth={1.2} className="mb-5" />
      <p className="text-xs uppercase tracking-widest mb-3" style={{ color: SAGE_DARK, letterSpacing: "0.12em" }}>
        404
      </p>
      <h1
        className="text-3xl md:text-4xl mb-3"
        style={{ color: INK, fontFamily: "'Playfair Display', serif" }}
      >
        This page hasn't been stitched yet.
      </h1>
      <p className="text-sm mb-8 max-w-sm" style={{ color: INK_SOFT }}>
        The page you're looking for doesn't exist, or may have moved.
      </p>

      <a
        href="/"
        className="text-sm px-6 py-3"
        style={{ background: ROSE, color: CREAM }}
      >
        Back to home
      </a>
    </div>
  );
}