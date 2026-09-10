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
    contact: "",
    contactMethod: "whatsapp",
    category: validCategory,
    notes: pieceFromUrl ? `Interested in: ${pieceFromUrl}` : "",
    budget: "",
  });

  /*
   * Keep WhatsApp and Email values separately.
   *
   * This allows the form to behave like:
   *
   * WhatsApp -> 9812345678
   * Email -> blank
   *
   * Switch back to WhatsApp -> 9812345678
   *
   * Email -> previously entered email
   */
  const [contactValues, setContactValues] = useState({
    whatsapp: "",
    email: "",
  });

  const [measurements, setMeasurements] = useState({});
  const [showMeasurements, setShowMeasurements] = useState(false);

  const isCrochet = enquiry.category === "crochet";
  const activeMeasurementFields = fieldsForCategory(enquiry.category);

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [formLoadTime] = useState(() => Date.now());
  const [cooldownActive, setCooldownActive] = useState(false);
  const [dbSaveFailed, setDbSaveFailed] = useState(false);

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
      notes: pieceFromUrl
        ? `Interested in: ${pieceFromUrl}`
        : current.notes,
    }));
  }, [validCategory, pieceFromUrl]);

  function handleChange(e) {
    const { name, value } = e.target;

    setEnquiry((current) => {
      const next = {
        ...current,
        [name]: value,
      };

      // Switching between crochet and clothing categories uses a different
      // field set, so clear out whatever was entered for the previous set.
      if (
        name === "category" &&
        fieldsForCategory(value) !== fieldsForCategory(current.category)
      ) {
        setMeasurements({});
      }

      return next;
    });
  }

  /*
   * Switch between WhatsApp and Email.
   *
   * Each method has its own saved value.
   * If the selected method has no previous value,
   * the input appears blank.
   */
  function handleContactMethodChange(method) {
    setEnquiry((current) => ({
      ...current,
      contactMethod: method,
      contact: contactValues[method] || "",
    }));
  }

  /*
   * Save the value separately for the currently selected method.
   *
   * WhatsApp:
   * - Only numbers are allowed.
   *
   * Email:
   * - The value is kept exactly as typed.
   */
  function handleContactChange(e) {
    const { value } = e.target;
    const method = enquiry.contactMethod;

    const cleanedValue =
      method === "whatsapp"
        ? value.replace(/\D/g, "")
        : value;

    // Save the value for the current contact method.
    setContactValues((current) => ({
      ...current,
      [method]: cleanedValue,
    }));

    // Keep enquiry.contact synchronized with the currently selected method.
    setEnquiry((current) => ({
      ...current,
      contact: cleanedValue,
    }));
  }

  function handleMeasurementChange(key, value) {
    setMeasurements((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handlePhotoChange(e) {
    const file = e.target.files[0] || null;

    e.target.value = "";

    if (!file) return;

    const validationError = validateImageFile(file);

    if (validationError) {
      setUploadError(validationError);
      return;
    }

    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }

    setUploadError("");

    try {
      const resized = await resizeImageFile(file);

      setPhotoFile(resized);
      setPhotoPreview(URL.createObjectURL(resized));
    } catch (err) {
      console.error("Could not process photo:", err.message);

      setUploadError(
        "Could not process that photo — please try a different image."
      );
    }
  }

  function removePhoto() {
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }

    setPhotoFile(null);
    setPhotoPreview(null);
  }

  async function uploadReferencePhoto() {
    const fileExt = photoFile.name.split(".").pop();

    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${fileExt}`;

    const { error: uploadErr } = await supabase.storage
      .from("enquiry-photos")
      .upload(fileName, photoFile);

    if (uploadErr) {
      throw new Error(uploadErr.message);
    }

    const { data } = supabase.storage
      .from("enquiry-photos")
      .getPublicUrl(fileName);

    return data.publicUrl;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (submitting) return;

    // Honeypot check — if this hidden field has anything in it, it's a bot.
    if (e.target.elements.website?.value) {
      return;
    }

    // Timing check — reject implausibly fast submissions.
    if (Date.now() - formLoadTime < MIN_FILL_TIME_MS) {
      return;
    }

    // Cooldown check.
    try {
      const lastSubmit = localStorage.getItem("mima_last_enquiry_ts");

      if (
        lastSubmit &&
        Date.now() - Number(lastSubmit) < COOLDOWN_MS
      ) {
        setCooldownActive(true);
        return;
      }
    } catch {
      // Ignore, proceed without cooldown protection if storage is unavailable.
    }

    setSubmitting(true);
    setUploadError("");

    let imageUrl = null;

    try {
      if (photoFile) {
        imageUrl = await uploadReferencePhoto();
      }

      const cleanMeasurements = Object.fromEntries(
        Object.entries(measurements).filter(
          ([, v]) => v && v.trim() !== ""
        )
      );

      const hasMeasurements =
        Object.keys(cleanMeasurements).length > 0;

      const { error } = await supabase.from("enquiries").insert([
        {
          name: enquiry.name,
          contact: enquiry.contact,
          category: enquiry.category,
          notes: enquiry.notes || null,
          budget: enquiry.budget || null,
          status: "new",
          image_url: imageUrl,
          measurements: hasMeasurements
            ? cleanMeasurements
            : null,
        },
      ]);

      if (error) {
        // WhatsApp remains the primary channel,
        // but tell the customer the backup was not saved.
        console.error(
          "Could not save enquiry:",
          error.message
        );

        setDbSaveFailed(true);
      } else {
        setDbSaveFailed(false);
      }

      const activeFields =
        fieldsForCategory(enquiry.category);

      const measurementLines = hasMeasurements
        ? Object.entries(cleanMeasurements)
            .map(([key, value]) => {
              const label =
                activeFields.find(([k]) => k === key)?.[1] ||
                key;

              return `${label}: ${value}`;
            })
            .join(", ")
        : "Not provided";

      const text = encodeURIComponent(
        `Hi Mima Creations! I would like to submit an enquiry:\n\n` +
          `*Name:* ${enquiry.name}\n` +
          `*Contact:* ${enquiry.contact} (${enquiry.contactMethod === "whatsapp" ? "WhatsApp" : "Email"})\n` +
          `*Category:* ${enquiry.category}\n` +
          `*Notes:* ${enquiry.notes || "None"}\n` +
          `*${enquiry.category === "crochet" ? "Crochet details" : "Measurements"}:* ${measurementLines}\n` +
          `*Reference photo:* ${imageUrl ? "Attached via form" : "None"}\n` +
          `*Budget:* ${enquiry.budget || "Not specified"}`
      );

      window.open(
        `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`,
        "_blank"
      );

      try {
        localStorage.setItem(
          "mima_last_enquiry_ts",
          String(Date.now())
        );
      } catch {
        // Ignore if storage unavailable.
      }

      setSubmitted(true);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      console.error(
        "Enquiry submission failed:",
        err.message
      );

      setUploadError(
        "Could not upload your photo. You can still submit without it."
      );
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

        <h2 className="display text-3xl mb-3">
          Thank you, {enquiry.name || "friend"}!
        </h2>

        <p
          className="text-sm mb-8"
          style={{ color: INK_SOFT }}
        >
          Your enquiry has been formatted and opened in WhatsApp.
          We'll reach out to discuss further details and pricing.
        </p>

        {dbSaveFailed && (
          <p
            className="text-xs mb-8 px-4 py-3 text-left"
            style={{
              background: "#F3E4DD",
              color: "#8A4A3A",
              border: "1px solid #E3C9BE",
            }}
          >
            One thing to note: we couldn't save a backup copy of
            your enquiry on our end, so please make sure to send
            the WhatsApp message that just opened — that's what
            we'll use to follow up with you.
          </p>
        )}

        <Link
          to="/home"
          className="btn inline-block text-sm px-6 py-3"
          style={{
            background: SAGE_DARK,
            color: CREAM,
          }}
        >
          Back to home
        </Link>
      </section>
    );
  }

  return (
    <section className="px-6 md:px-12 py-14 max-w-2xl mx-auto">
      <p
        className="script text-xl mb-1"
        style={{ color: ROSE }}
      >
        Let's design something for you
      </p>

      <h2 className="display text-3xl mb-6">
        Custom order enquiry
      </h2>

      <form
        onSubmit={handleSubmit}
        style={{
          border: `1px solid ${SAGE}`,
          background: "#E3EBDE",
        }}
        className="p-6 md:p-8"
      >
        {/* Honeypot — hidden from real visitors, catches basic bots */}
        <input
          type="text"
          name="website"
          tabIndex="-1"
          autoComplete="off"
          aria-hidden="true"
          style={{
            position: "absolute",
            left: "-9999px",
            width: "1px",
            height: "1px",
            opacity: 0,
          }}
        />

        <div className="grid sm:grid-cols-2 gap-5 mb-5">
          {/* Name */}
          <label className="block">
            <span
              className="text-xs"
              style={{ color: INK_SOFT }}
            >
              Name
            </span>

            <input
              required
              name="name"
              value={enquiry.name}
              onChange={handleChange}
              className="w-full mt-1 p-2 bg-transparent border"
              style={{ borderColor: "#2B2620" }}
            />
          </label>

          {/* Contact */}
          <div className="block">
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="contact-input"
                className="text-xs"
                style={{ color: INK_SOFT }}
              >
                {enquiry.contactMethod === "whatsapp"
                  ? "WhatsApp number"
                  : "Email address"}
              </label>

              <div
                className="flex text-xs shrink-0"
                style={{
                  border: "1px solid #2B2620",
                }}
              >
                {/* WhatsApp button */}
                <button
                  type="button"
                  onClick={() =>
                    handleContactMethodChange("whatsapp")
                  }
                  className="px-2 py-0.5"
                  style={{
                    background:
                      enquiry.contactMethod === "whatsapp"
                        ? SAGE_DARK
                        : "transparent",
                    color:
                      enquiry.contactMethod === "whatsapp"
                        ? CREAM
                        : INK_SOFT,
                  }}
                >
                  WhatsApp
                </button>

                {/* Email button */}
                <button
                  type="button"
                  onClick={() =>
                    handleContactMethodChange("email")
                  }
                  className="px-2 py-0.5"
                  style={{
                    background:
                      enquiry.contactMethod === "email"
                        ? SAGE_DARK
                        : "transparent",
                    color:
                      enquiry.contactMethod === "email"
                        ? CREAM
                        : INK_SOFT,
                    borderLeft:
                      "1px solid #2B2620",
                  }}
                >
                  Email
                </button>
              </div>
            </div>

            <input
              id="contact-input"
              required
              name="contact"
              type={
                enquiry.contactMethod === "whatsapp"
                  ? "tel"
                  : "email"
              }
              inputMode={
                enquiry.contactMethod === "whatsapp"
                  ? "numeric"
                  : "email"
              }
              pattern={
                enquiry.contactMethod === "whatsapp"
                  ? "[0-9]*"
                  : undefined
              }
              maxLength={
                enquiry.contactMethod === "whatsapp"
                  ? 15
                  : undefined
              }
              value={enquiry.contact}
              onChange={handleContactChange}
              placeholder={
                enquiry.contactMethod === "whatsapp"
                  ? "e.g. 9779812345678"
                  : "e.g. you@example.com"
              }
              className="w-full p-2 bg-transparent border"
              style={{ borderColor: "#2B2620" }}
            />
          </div>
        </div>

        {/* Category */}
        <label className="block mb-5">
          <span
            className="text-xs"
            style={{ color: INK_SOFT }}
          >
            Category
          </span>

          <select
            name="category"
            value={enquiry.category}
            onChange={handleChange}
            className="w-full mt-1 p-2 bg-transparent border"
            style={{ borderColor: "#2B2620" }}
          >
            {CATEGORIES.map((category) => (
              <option
                key={category.id}
                value={category.id}
              >
                {category.name}
              </option>
            ))}
          </select>
        </label>

        {/* Notes */}
        <label className="block mb-5">
          <span
            className="text-xs"
            style={{ color: INK_SOFT }}
          >
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

        {/* Measurements / Crochet details */}
        <div className="mb-5">
          <button
            type="button"
            onClick={() =>
              setShowMeasurements((s) => !s)
            }
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
                {activeMeasurementFields.map(
                  ([key, label]) => (
                    <label
                      key={key}
                      className="block"
                    >
                      <span
                        className="text-xs"
                        style={{ color: INK_SOFT }}
                      >
                        {label}
                      </span>

                      <input
                        value={measurements[key] || ""}
                        onChange={(e) =>
                          handleMeasurementChange(
                            key,
                            e.target.value
                          )
                        }
                        placeholder={
                          isCrochet ? "" : "in inches"
                        }
                        className="w-full mt-1 p-2 bg-transparent border text-sm"
                        style={{
                          borderColor: "#2B2620",
                        }}
                      />
                    </label>
                  )
                )}
              </div>

              {!isCrochet && <MeasurementGuide />}
            </>
          )}
        </div>

        {/* Reference photo */}
        <div className="mb-6">
          <span
            className="text-xs"
            style={{ color: INK_SOFT }}
          >
            Reference photo (optional)
          </span>

          {photoPreview ? (
            <div className="relative mt-2 w-28">
              <img
                src={photoPreview}
                alt="Reference preview"
                className="w-28 h-28 object-cover"
                style={{
                  border: `1px solid ${CREAM_DARK}`,
                }}
              />

              <button
                type="button"
                onClick={removePhoto}
                aria-label="Remove photo"
                className="absolute -top-2 -right-2 p-1"
                style={{
                  background: INK,
                  color: CREAM,
                  borderRadius: "999px",
                }}
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <label
              className="mt-2 flex items-center gap-2 text-sm px-4 py-3 cursor-pointer w-fit"
              style={{
                border: `1px dashed ${SAGE_DARK}`,
                color: SAGE_DARK,
                background: CREAM,
              }}
            >
              <Upload size={16} />

              Attach a photo

              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </label>
          )}

          {uploadError && (
            <p
              className="text-xs mt-2"
              style={{ color: "#B3261E" }}
            >
              {uploadError}
            </p>
          )}
        </div>

        {/* Budget */}
        <label className="block mb-6">
          <span
            className="text-xs"
            style={{ color: INK_SOFT }}
          >
            Budget range (optional)
          </span>

          <input
            name="budget"
            value={enquiry.budget}
            onChange={handleChange}
            placeholder="e.g. Rs. 3,000–5,000"
            className="w-full mt-1 p-2 bg-transparent border"
            style={{ borderColor: "#2B2620" }}
          />
        </label>

        {/* Submit */}
        {cooldownActive ? (
          <p
            className="text-sm"
            style={{ color: INK_SOFT }}
          >
            You've just sent an enquiry — please wait a
            moment before sending another.
          </p>
        ) : (
          <button
            type="submit"
            disabled={submitting}
            className="btn text-sm px-6 py-3 w-full sm:w-auto"
            style={{
              background: ROSE,
              color: CREAM,
              opacity: submitting ? 0.6 : 1,
            }}
          >
            {submitting ? "Sending..." : "Send enquiry"}
          </button>
        )}

        <p
          className="text-xs mt-4"
          style={{ color: INK_SOFT }}
        >
          This is a made-to-order piece — I'll confirm details
          and pricing with you before we begin. Prepaid only.
        </p>

        <p
          className="text-xs mt-2"
          style={{ color: INK_SOFT }}
        >
          Your information is used only to prepare your custom
          order and will not be shared with anyone else.
        </p>
      </form>
    </section>
  );
}