import { useState } from "react";
import { INK, INK_SOFT, SAGE_DARK, ROSE, CREAM_DARK } from "./SiteComponents";
import measurementGuideImg from "../assets/measurement_guide.png";

const GUIDE_TEXT = [
  ["Bust / Chest", "Measure around the fullest part of your chest, keeping the tape level and snug but not tight."],
  ["Waist", "Measure around your natural waistline — usually just above your belly button, where your body bends when you lean side to side."],
  ["Hips", "Measure around the fullest part of your hips, roughly 7-8 inches below your waist."],
  ["Shoulder", "Measure straight across your back from the edge of one shoulder to the other."],
  ["Sleeve length", "Measure from the top of your shoulder to where you want the sleeve to end (wrist, elbow, etc.)."],
  ["Overall length", "This depends on the piece — for a kurti/dress, measure shoulder to where you want the hem; for a blouse, shoulder to waist. Not shown in the diagram since it varies by style."],
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
            <img
              src={measurementGuideImg}
              alt="Diagram showing where to measure shoulder, bust, waist, hips, sleeve length, and height"
              style={{ width: "100%", maxWidth: "220px", display: "block" }}
            />

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