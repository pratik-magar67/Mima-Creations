import { useState } from "react";
import { INK, INK_SOFT, SAGE_DARK, ROSE, CREAM_DARK } from "./SiteComponents";

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
            <svg viewBox="0 0 220 340" width="100%" style={{ maxWidth: "200px" }} aria-hidden="true">
              {/* head */}
              <circle cx="110" cy="28" r="18" fill="none" stroke={INK_SOFT} strokeWidth="1.4" />
              {/* neck */}
              <path d="M102 44 L102 54 L118 54 L118 44" fill="none" stroke={INK_SOFT} strokeWidth="1.4" />

              {/* torso + arms silhouette */}
              <path
                d="M102 54
                   L70 62 L58 130
                   L68 132 L78 70
                   L82 100 C 74 130 74 150 80 172
                   C 74 200 76 225 84 245
                   L84 305 L100 305 L100 250
                   L120 250 L120 305 L136 305
                   L136 245 C 144 225 146 200 140 172
                   C 146 150 146 130 138 100
                   L142 70 L152 132 L162 130
                   L150 62 L118 54"
                fill="none"
                stroke={INK_SOFT}
                strokeWidth="1.4"
                strokeLinejoin="round"
              />

              {/* shoulder line */}
              <line x1="68" y1="66" x2="152" y2="66" stroke={SAGE_DARK} strokeWidth="1" strokeDasharray="3 3" />
              <text x="158" y="69" fontSize="10" fill={INK_SOFT}>Shoulder</text>

              {/* bust line */}
              <line x1="74" y1="98" x2="146" y2="98" stroke={SAGE_DARK} strokeWidth="1" strokeDasharray="3 3" />
              <text x="158" y="101" fontSize="10" fill={INK_SOFT}>Bust</text>

              {/* waist line */}
              <line x1="76" y1="148" x2="144" y2="148" stroke={SAGE_DARK} strokeWidth="1" strokeDasharray="3 3" />
              <text x="158" y="151" fontSize="10" fill={INK_SOFT}>Waist</text>

              {/* hips line */}
              <line x1="72" y1="185" x2="148" y2="185" stroke={SAGE_DARK} strokeWidth="1" strokeDasharray="3 3" />
              <text x="158" y="188" fontSize="10" fill={INK_SOFT}>Hips</text>

              {/* sleeve length indicator (shoulder to wrist, left side) */}
              <line x1="55" y1="66" x2="55" y2="132" stroke={ROSE} strokeWidth="1" strokeDasharray="2 3" />
              <text x="8" y="102" fontSize="9" fill={INK_SOFT}>Sleeve</text>

              {/* height indicator, full figure */}
              <line x1="196" y1="10" x2="196" y2="308" stroke={ROSE} strokeWidth="1" strokeDasharray="2 3" />
              <text x="178" y="160" fontSize="9" fill={INK_SOFT} transform="rotate(-90 178 160)">Height</text>
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