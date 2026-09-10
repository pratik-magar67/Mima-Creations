import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Upload, X } from "lucide-react";

import { supabase } from "../supabaseClient";
import MeasurementGuide from "../components/MeasurementGuide";
import { validateImageFile, resizeImageFile } from "../imageValidation";

import {
  CREAM,
  CREAM_DARK,
  INK,
  INK_SOFT,
  SAGE,
  SAGE_DARK,
  ROSE,
  CATEGORIES,
  StitchCheck,
} from "../components/SiteComponents";

const WHATSAPP_NUMBER = "9779824203807";
const BUSINESS_EMAIL = "mimaacreation@gmail.com";
const MAX_REFERENCE_PHOTOS = 3;
const COOLDOWN_MS = 60000; // 1 minute between submissions
const MIN_FILL_TIME_MS = 2500; // reject submissions faster than this

const MEASUREMENT_FIELDS = [
  ["bust", "Bust / Chest"],
  ["waist", "Waist"],
  ["hips", "Hips"],
  ["shoulder", "Shoulder"],
  ["sleeve", "Sleeve length"],
  ["length", "Overall length"],
  ["height", "Height"],
];

const CROCHET_FIELDS = [
  ["flowerCount", "Number of flowers"],
  ["flowerColors", "Flower color(s)"],
  ["wrapping", "Wrapping material"],
  ["size", "Size / Stem length"],
];

function fieldsForCategory(category) {
  return category === "crochet" ? CROCHET_FIELDS : MEASUREMENT_FIELDS;
}

export default function Enquiry() {
  const [searchParams] = useSearchParams();

  const categoryFromUrl = searchParams.get("category");
  const pieceFromUrl = searchParams.get("piece");

  const validCategory = CATEGORIES.some(
    (category) => category.id === categoryFromUrl
  )
    ? categoryFromUrl
    : "sarees";

  const [enquiry, setEnquiry] = useState({
    name: "",
    category: validCategory,
    notes: pieceFromUrl ? `Interested in: ${pieceFromUrl}` : "",
    budget: "",
  });

  const [contactMethod, setContactMethod] = useState("whatsapp");
  const [contactValues, setContactValues] = useState({ whatsapp: "", email: "" });

  const [measurements, setMeasurements] = useState({});
  const [showMeasurements, setShowMeasurements] = useState(false);

  const isCrochet = enquiry.category === "crochet";
  const activeMeasurementFields = fieldsForCategory(enquiry.category);

  const [photos, setPhotos] = useState([]);

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [formLoadTime] = useState(() => Date.now());
  const [cooldownActive, setCooldownActive] = useState(false);
  const [dbSaveFailed, setDbSaveFailed] = useState(false);
  const [sentLinks, setSentLinks] = useState({ whatsapp: null, mailto: null });

  useEffect(() => {
    try {
      const lastSubmit = localStorage.getItem("mima_last_enquiry_ts");
      if (lastSubmit && Date.now() - Number(lastSubmit) < COOLDOWN_MS) {
        setCooldownActive(true);
      }
    } catch {
      // localStorage unavailable, skip cooldown check
    }
  }, []);

  useEffect(() => {
    setEnquiry((current) => ({
      ...current,
      category: validCategory,
      notes: pieceFromUrl ? `Interested in: ${pieceFromUrl}` : current.notes,
    }));
  }, [validCategory, pieceFromUrl]);

  function handleChange(e) {
    const { name, value } = e.target;
    setEnquiry((current) => {
      const next = { ...current, [name]: value };
      // Switching between crochet and clothing categories uses a different
      // field set, so clear out whatever was entered for the previous set.
      if (name === "category" && fieldsForCategory(value) !== fieldsForCategory(current.category)) {
        setMeasurements({});
      }
      return next;
    });
  }

  function handleContactChange(e) {
    const { value } = e.target;
    setContactValues((current) => ({ ...current, [contactMethod]: value }));
  }

  function handleMeasurementChange(key, value) {
    setMeasurements((current) => ({ ...current, [key]: value }));
  }

  async function handlePhotoChange(e) {
    const files = Array.from(e.target.files);
    e.target.value = "";
    if (files.length === 0) return;

    const remaining = MAX_REFERENCE_PHOTOS - photos.length;
    if (remaining <= 0) {
      setUploadError(`You can attach up to ${MAX_REFERENCE_PHOTOS} photos.`);
      return;
    }

    const toProcess = files.slice(0, remaining);
    if (files.length > toProcess.length) {
      setUploadError(`Only added ${toProcess.length} photo(s) — the limit is ${MAX_REFERENCE_PHOTOS}.`);
    } else {
      setUploadError("");
    }

    for (const file of toProcess) {
      const validationError = validateImageFile(file);
      if (validationError) {
        setUploadError(validationError);
        continue;
      }
      try {
        const resized = await resizeImageFile(file);
        setPhotos((prev) => [...prev, { file: resized, previewUrl: URL.createObjectURL(resized) }]);
      } catch (err) {
        console.error("Could not process photo:", err.message);
        setUploadError("Could not process that photo — please try a different image.");
      }
    }
  }

  function removePhoto(index) {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  }

  async function uploadReferencePhoto(file) {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

    const { error: uploadErr } = await supabase.storage
      .from("enquiry-photos")
      .upload(fileName, file);

    if (uploadErr) throw new Error(uploadErr.message);

    const { data } = supabase.storage.from("enquiry-photos").getPublicUrl(fileName);
    return data.publicUrl;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;

    // Honeypot check — if this hidden field has anything in it, it's a bot
    if (e.target.elements.website?.value) {
      return;
    }

    // Timing check — reject implausibly fast submissions
    if (Date.now() - formLoadTime < MIN_FILL_TIME_MS) {
      return;
    }

    // Cooldown check
    try {
      const lastSubmit = localStorage.getItem("mima_last_enquiry_ts");
      if (lastSubmit && Date.now() - Number(lastSubmit) < COOLDOWN_MS) {
        setCooldownActive(true);
        return;
      }
    } catch {
      // ignore, proceed without cooldown protection if storage is unavailable
    }

    setSubmitting(true);
    setUploadError("");

    let imageUrls = [];

    try {
      for (const photo of photos) {
        imageUrls.push(await uploadReferencePhoto(photo.file));
      }

      const cleanMeasurements = Object.fromEntries(
        Object.entries(measurements).filter(([, v]) => v && v.trim() !== "")
      );
      const hasMeasurements = Object.keys(cleanMeasurements).length > 0;

      const contactValue = contactValues[contactMethod];

      const { error } = await supabase.from("enquiries").insert([
        {
          name: enquiry.name,
          contact: contactValue,
          category: enquiry.category,
          notes: enquiry.notes || null,
          budget: enquiry.budget || null,
          status: "new",
          image_url: imageUrls[0] || null,
          image_urls: imageUrls.length > 0 ? imageUrls : null,
          measurements: hasMeasurements ? cleanMeasurements : null,
        },
      ]);

      if (error) {
        // WhatsApp/email remains the primary channel, but tell the customer the backup was not saved.
        console.error("Could not save enquiry:", error.message);
        setDbSaveFailed(true);
      } else {
        setDbSaveFailed(false);
      }

      const activeFields = fieldsForCategory(enquiry.category);
      const measurementLines = hasMeasurements
        ? Object.entries(cleanMeasurements)
            .map(([key, value]) => {
              const label = activeFields.find(([k]) => k === key)?.[1] || key;
              return `${label}: ${value}`;
            })
            .join(", ")
        : "Not provided";

      const measurementsLabel = enquiry.category === "crochet" ? "Crochet details" : "Measurements";
      const photoLine = imageUrls.length > 0
        ? `${imageUrls.length} photo${imageUrls.length > 1 ? "s" : ""} attached via form`
        : "None";

      const summaryLines = [
        ["Name", enquiry.name],
        ["Contact", contactValue],
        ["Category", enquiry.category],
        ["Notes", enquiry.notes || "None"],
        [measurementsLabel, measurementLines],
        ["Reference photo", photoLine],
        ["Budget", enquiry.budget || "Not specified"],
      ];

      const whatsappText = encodeURIComponent(
        `Hi Mima Creations! I would like to submit an enquiry:\n\n` +
          summaryLines.map(([label, value]) => `*${label}:* ${value}`).join("\n")
      );
      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappText}`;

      const mailtoSubject = encodeURIComponent(`Custom order enquiry — ${enquiry.name}`);
      const mailtoBody = encodeURIComponent(
        `Hi Mima Creations! I would like to submit an enquiry:\n\n` +
          summaryLines.map(([label, value]) => `${label}: ${value}`).join("\n")
      );
      const mailtoUrl = `mailto:${BUSINESS_EMAIL}?subject=${mailtoSubject}&body=${mailtoBody}`;

      setSentLinks({ whatsapp: whatsappUrl, mailto: mailtoUrl });

      if (contactMethod === "email") {
        window.location.href = mailtoUrl;
      } else {
        window.open(whatsappUrl, "_blank");
      }

      try {
        localStorage.setItem("mima_last_enquiry_ts", String(Date.now()));
      } catch {
        // ignore if storage unavailable
      }

      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Enquiry submission failed:", err.message);
      setUploadError("Could not upload your photos. You can still submit without them.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <section className="px-6 md:px-12 py-16 max-w-xl mx-auto text-center">
        <div className="flex justify-center mb-4">
          <StitchCheck />
        </div>
        <h2 className="display text-3xl mb-3">Thank you, {enquiry.name || "friend"}!</h2>

        {contactMethod === "email" ? (
          <>
            <p className="text-sm mb-3" style={{ color: INK_SOFT }}>
              Your enquiry has been prepared in an email to {BUSINESS_EMAIL}. Check that your
              email app just opened — we'll reach out to discuss further details and pricing.
            </p>
            <p className="text-sm mb-8" style={{ color: INK_SOFT }}>
              Email app didn't open?{" "}
              <a href={sentLinks.mailto} className="underline" style={{ color: SAGE_DARK }}>
                Click here to try again
              </a>
              , or send it yourself to <a href={`mailto:${BUSINESS_EMAIL}`} className="underline" style={{ color: SAGE_DARK }}>{BUSINESS_EMAIL}</a>.
              Prefer WhatsApp instead?{" "}
              <a href={sentLinks.whatsapp} target="_blank" rel="noreferrer" className="underline" style={{ color: SAGE_DARK }}>
                Send it there
              </a>.
            </p>
          </>
        ) : (
          <>
            <p className="text-sm mb-3" style={{ color: INK_SOFT }}>
              Your enquiry has been formatted and opened in WhatsApp. We'll reach out to discuss
              further details and pricing.
            </p>
            <p className="text-sm mb-8" style={{ color: INK_SOFT }}>
              WhatsApp didn't open?{" "}
              <a href={sentLinks.whatsapp} target="_blank" rel="noreferrer" className="underline" style={{ color: SAGE_DARK }}>
                Click here to try again
              </a>
              , or prefer email?{" "}
              <a href={sentLinks.mailto} className="underline" style={{ color: SAGE_DARK }}>
                Send it that way instead
              </a>.
            </p>
          </>
        )}

        {dbSaveFailed && (
          <p
            className="text-xs mb-8 px-4 py-3 text-left"
            style={{ background: "#F3E4DD", color: "#8A4A3A", border: "1px solid #E3C9BE" }}
          >
            One thing to note: we couldn't save a backup copy of your enquiry on our end, so
            please make sure to send the {contactMethod === "email" ? "email" : "WhatsApp message"} that
            just opened — that's what we'll use to follow up with you.
          </p>
        )}

        <Link
          to="/home"
          className="btn inline-block text-sm px-6 py-3"
          style={{ background: SAGE_DARK, color: CREAM }}
        >
          Back to home
        </Link>
      </section>
    );
  }

  return (
    <section className="px-6 md:px-12 py-14 max-w-2xl mx-auto">
      <p className="script text-xl mb-1" style={{ color: ROSE }}>
        Let's design something for you
      </p>
      <h2 className="display text-3xl mb-6">Custom order enquiry</h2>

      <form
        onSubmit={handleSubmit}
        style={{ border: `1px solid ${SAGE}`, background: "#E3EBDE" }}
        className="p-6 md:p-8"
      >
        {/* Honeypot — hidden from real visitors, catches basic bots */}
        <input
          type="text"
          name="website"
          tabIndex="-1"
          autoComplete="off"
          aria-hidden="true"
          style={{ position: "absolute", left: "-9999px", width: "1px", height: "1px", opacity: 0 }}
        />

        <div className="grid sm:grid-cols-2 gap-5 mb-5">
          <label className="block">
            <span className="text-xs" style={{ color: INK_SOFT }}>Name</span>
            <input
              required
              name="name"
              value={enquiry.name}
              onChange={handleChange}
              className="w-full mt-1 p-2 bg-transparent border"
              style={{ borderColor: "#2B2620" }}
            />
          </label>

          <div>
            <span className="text-xs" style={{ color: INK_SOFT }}>How should we reach you?</span>
            <div className="flex gap-2 mt-1 mb-2">
              <button
                type="button"
                onClick={() => setContactMethod("whatsapp")}
                className="text-xs px-3 py-1.5"
                style={{
                  background: contactMethod === "whatsapp" ? SAGE_DARK : "transparent",
                  color: contactMethod === "whatsapp" ? CREAM : INK,
                  border: `1px solid ${SAGE_DARK}`,
                }}
              >
                WhatsApp
              </button>
              <button
                type="button"
                onClick={() => setContactMethod("email")}
                className="text-xs px-3 py-1.5"
                style={{
                  background: contactMethod === "email" ? SAGE_DARK : "transparent",
                  color: contactMethod === "email" ? CREAM : INK,
                  border: `1px solid ${SAGE_DARK}`,
                }}
              >
                Email
              </button>
            </div>
            <input
              required
              name="contact"
              type={contactMethod === "email" ? "email" : "tel"}
              value={contactValues[contactMethod]}
              onChange={handleContactChange}
              placeholder={contactMethod === "email" ? "e.g. you@email.com" : "e.g. 98XXXXXXXX"}
              className="w-full p-2 bg-transparent border"
              style={{ borderColor: "#2B2620" }}
            />
          </div>
        </div>

        <label className="block mb-5">
          <span className="text-xs" style={{ color: INK_SOFT }}>Category</span>
          <select
            name="category"
            value={enquiry.category}
            onChange={handleChange}
            className="w-full mt-1 p-2 bg-transparent border"
            style={{ borderColor: "#2B2620" }}
          >
            {CATEGORIES.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </label>

        <label className="block mb-5">
          <span className="text-xs" style={{ color: INK_SOFT }}>
            Notes or a reference you have in mind
          </span>
          <textarea
            name="notes"
            value={enquiry.notes}
            onChange={handleChange}
            rows={4}
            className="w-full mt-1 p-2 bg-transparent border"
            style={{ borderColor: "#2B2620" }}
          />
        </label>

        <div className="mb-5">
          <button
            type="button"
            onClick={() => setShowMeasurements((s) => !s)}
            className="text-sm underline"
            style={{ color: SAGE_DARK }}
          >
            {showMeasurements
              ? isCrochet
                ? "Hide crochet details"
                : "Hide measurements"
              : isCrochet
              ? "Add crochet details (optional)"
              : "Add measurements (optional)"}
          </button>

          {showMeasurements && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                {activeMeasurementFields.map(([key, label]) => (
                  <label key={key} className="block">
                    <span className="text-xs" style={{ color: INK_SOFT }}>{label}</span>
                    <input
                      value={measurements[key] || ""}
                      onChange={(e) => handleMeasurementChange(key, e.target.value)}
                      placeholder={isCrochet ? "" : "in inches"}
                      className="w-full mt-1 p-2 bg-transparent border text-sm"
                      style={{ borderColor: "#2B2620" }}
                    />
                  </label>
                ))}
              </div>
              {!isCrochet && <MeasurementGuide />}
            </>
          )}
        </div>

        <div className="mb-6">
          <span className="text-xs" style={{ color: INK_SOFT }}>
            Reference photos, optional ({photos.length} / {MAX_REFERENCE_PHOTOS})
          </span>

          {photos.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-2">
              {photos.map((photo, i) => (
                <div key={photo.previewUrl} className="relative w-28">
                  <img
                    src={photo.previewUrl}
                    alt="Reference preview"
                    className="w-28 h-28 object-cover"
                    style={{ border: `1px solid ${CREAM_DARK}` }}
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    aria-label="Remove photo"
                    className="absolute -top-2 -right-2 p-1"
                    style={{ background: INK, color: CREAM, borderRadius: "999px" }}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {photos.length < MAX_REFERENCE_PHOTOS && (
            <label
              className="mt-2 flex items-center gap-2 text-sm px-4 py-3 cursor-pointer w-fit"
              style={{ border: `1px dashed ${SAGE_DARK}`, color: SAGE_DARK, background: CREAM }}
            >
              <Upload size={16} />
              {photos.length > 0 ? "Attach another photo" : "Attach a photo"}
              <input type="file" accept="image/*" multiple onChange={handlePhotoChange} className="hidden" />
            </label>
          )}

          {uploadError && (
            <p className="text-xs mt-2" style={{ color: "#B3261E" }}>{uploadError}</p>
          )}
        </div>

        <label className="block mb-6">
          <span className="text-xs" style={{ color: INK_SOFT }}>Budget range (optional)</span>
          <input
            name="budget"
            value={enquiry.budget}
            onChange={handleChange}
            placeholder="e.g. Rs. 3,000–5,000"
            className="w-full mt-1 p-2 bg-transparent border"
            style={{ borderColor: "#2B2620" }}
          />
        </label>

        {cooldownActive ? (
          <p className="text-sm" style={{ color: INK_SOFT }}>
            You've just sent an enquiry — please wait a moment before sending another.
          </p>
        ) : (
          <button
            type="submit"
            disabled={submitting}
            className="btn text-sm px-6 py-3 w-full sm:w-auto"
            style={{ background: ROSE, color: CREAM, opacity: submitting ? 0.6 : 1 }}
          >
            {submitting
              ? "Sending..."
              : contactMethod === "email"
              ? "Send enquiry by email"
              : "Send enquiry on WhatsApp"}
          </button>
        )}

        <p className="text-xs mt-4" style={{ color: INK_SOFT }}>
          This is a made-to-order piece — I'll confirm details and pricing with you before we
          begin. Prepaid only.
        </p>
        <p className="text-xs mt-2" style={{ color: INK_SOFT }}>
          Your information is used only to prepare your custom order and will not be shared
          with anyone else.
        </p>
      </form>
    </section>
  );
}