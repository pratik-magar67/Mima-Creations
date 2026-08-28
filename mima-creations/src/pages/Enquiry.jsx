import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";

import { supabase } from "../supabaseClient";

import {
  CREAM,
  INK_SOFT,
  SAGE,
  SAGE_DARK,
  ROSE,
  CATEGORIES,
  StitchCheck,
} from "../components/SiteComponents";

const WHATSAPP_NUMBER = "9779824203807";

export default function Enquiry() {
  const [searchParams] = useSearchParams();

  const categoryFromUrl =
    searchParams.get("category");

  const pieceFromUrl =
    searchParams.get("piece");

  const validCategory = CATEGORIES.some(
    (category) =>
      category.id === categoryFromUrl
  )
    ? categoryFromUrl
    : "sarees";

  const [enquiry, setEnquiry] = useState({
    name: "",
    contact: "",
    category: validCategory,
    notes: pieceFromUrl
      ? `Interested in: ${pieceFromUrl}`
      : "",
    budget: "",
  });

  const [submitted, setSubmitted] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

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

    setEnquiry((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (submitting) return;

    setSubmitting(true);

    const { error } = await supabase
      .from("enquiries")
      .insert([
        {
          name: enquiry.name,
          contact: enquiry.contact,
          category: enquiry.category,
          notes: enquiry.notes || null,
          budget: enquiry.budget || null,
          status: "new",
        },
      ]);

    if (error) {
      console.error(
        "Could not save enquiry:",
        error.message
      );
    }

    const text = encodeURIComponent(
      `Hi Mima Creations! I would like to submit an enquiry:\n\n` +
      `*Name:* ${enquiry.name}\n` +
      `*Contact:* ${enquiry.contact}\n` +
      `*Category:* ${enquiry.category}\n` +
      `*Notes:* ${enquiry.notes || "None"}\n` +
      `*Budget:* ${
        enquiry.budget || "Not specified"
      }`
    );

    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`,
      "_blank"
    );

    setSubmitted(true);
    setSubmitting(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
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
          Your enquiry has been formatted and opened
          in WhatsApp. We'll reach out to discuss
          further details and pricing.
        </p>

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
        <div className="grid sm:grid-cols-2 gap-5 mb-5">
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

          <label className="block">
            <span
              className="text-xs"
              style={{ color: INK_SOFT }}
            >
              Contact (email or WhatsApp)
            </span>

            <input
              required
              name="contact"
              value={enquiry.contact}
              onChange={handleChange}
              className="w-full mt-1 p-2 bg-transparent border"
              style={{ borderColor: "#2B2620" }}
            />
          </label>
        </div>

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

        <label className="block mb-5">
          <span
            className="text-xs"
            style={{ color: INK_SOFT }}
          >
            Notes, measurements, or a reference you
            have in mind
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
          {submitting
            ? "Sending..."
            : "Send enquiry"}
        </button>

        <p
          className="text-xs mt-4"
          style={{ color: INK_SOFT }}
        >
          This is a made-to-order piece — I'll confirm
          details and pricing with you before we begin.
          Prepaid only.
        </p>
      </form>
    </section>
  );
}
