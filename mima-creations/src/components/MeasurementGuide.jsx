import { useState } from "react";
import { INK, INK_SOFT, SAGE_DARK, CREAM_DARK } from "./SiteComponents";

const GUIDE_TEXT = [
  ["Bust / Chest", "Measure around the fullest part of your chest, keeping the tape level and snug but not tight."],
  ["Waist", "Measure around your natural waistline — usually just above your belly button, where your body bends when you lean side to side."],
  ["Hips", "Measure around the fullest part of your hips, roughly 7-8 inches below your waist."],
  ["Shoulder", "Measure straight across your back from the edge of one shoulder to the other."],
  ["Sleeve length", "Measure from the top of your shoulder to where you want the sleeve to end (wrist, elbow, etc.)."],
  ["Overall length", "For a kurti/dress: shoulder to where you want the hem. For a blouse: shoulder to waist."],
  ["Height", "Stand straight against a wall and measure from the floor to the top of your head."],
];

export default function MeasurementGuide() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="text-xs underline"
        style={{ color: SAGE_DARK }}
      >
        {open ? "Hide measuring guide" : "Not sure how to measure? See a guide"}
      </button>

      {open && (
        <div className="mt-3 p-4" style={{ background: "#fff", border: `1px solid ${CREAM_DARK}` }}>
          <div className="grid sm:grid-cols-2 gap-6 items-start">
            <svg viewBox="0 0 200 320" width="100%" style={{ maxWidth: "180px" }} aria-hidden="true">
              {/* simple front-view silhouette */}
              <path
                d="M100 20 C 112 20 120 30 120 42 C 120 54 112 62 100 62 C 88 62 80 54 80 42 C 80 30 88 20 100 20 Z
                   M75 68 L125 68 L135 130 L130 200 L125 300 L108 300 L104 180 L96 180 L92 300 L75 300 L70 200 L65 130 Z"
                fill="none"
                stroke={INK_SOFT}
                strokeWidth="1.2"
              />
              {/* bust line */}
              <line x1="72" y1="95" x2="128" y2="95" stroke={SAGE_DARK} strokeWidth="1" strokeDasharray="3 3" />
              <text x="132" y="98" fontSize="9" fill={INK_SOFT}>Bust</text>
              {/* waist line */}
              <line x1="70" y1="135" x2="130" y2="135" stroke={SAGE_DARK} strokeWidth="1" strokeDasharray="3 3" />
              <text x="132" y="138" fontSize="9" fill={INK_SOFT}>Waist</text>
              {/* hips line */}
              <line x1="66" y1="165" x2="134" y2="165" stroke={SAGE_DARK} strokeWidth="1" strokeDasharray="3 3" />
              <text x="136" y="168" fontSize="9" fill={INK_SOFT}>Hips</text>
              {/* shoulder line */}
              <line x1="75" y1="70" x2="125" y2="70" stroke={SAGE_DARK} strokeWidth="1" strokeDasharray="3 3" />
              <text x="6" y="66" fontSize="9" fill={INK_SOFT}>Shoulder</text>
            </svg>

            <div className="flex flex-col gap-2">
              {GUIDE_TEXT.map(([label, text]) => (
                <p key={label} className="text-xs leading-5" style={{ color: INK_SOFT }}>
                  <strong style={{ color: INK }}>{label}:</strong> {text}
                </p>
              ))}
            </div>
          </div>
          <p className="text-xs mt-4" style={{ color: INK_SOFT }}>
            Tip: use a soft fabric measuring tape, not a rigid one, and measure over light clothing, not bulky layers.
          </p>
        </div>
      )}
    </div>
  );
}