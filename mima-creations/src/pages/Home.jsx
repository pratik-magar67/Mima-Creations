import { Link } from "react-router-dom";
import {
  ArrowRight,
  ChevronRight,
} from "lucide-react";

import {
  CREAM,
  INK,
  INK_SOFT,
  SAGE,
  SAGE_DARK,
  SAGE_LIGHT,
  ROSE,
  CATEGORIES,
  TESTIMONIALS,
  PlaceholderImage,
  Reveal,
  FadeInOnMount,
  StitchDivider,
} from "../components/SiteComponents";

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <FadeInOnMount className="grid md:grid-cols-[1.1fr_1fr] items-start md:items-stretch">
          <div className="px-6 md:px-12 py-10 md:py-24 flex flex-col justify-center order-2 md:order-1">
            <svg
              aria-hidden="true"
              width="220"
              height="30"
              style={{ marginBottom: "-6px" }}
            >
              <line
                x1="0"
                y1="15"
                x2="220"
                y2="15"
                stroke={SAGE_DARK}
                strokeWidth="1.5"
                strokeDasharray="6 8"
                opacity="0.6"
              />
            </svg>

            <p
              className="script text-2xl mb-3"
              style={{ color: ROSE }}
            >
              From my hand to your heart
            </p>

            <h1
              className="display text-4xl md:text-6xl leading-[1.05] mb-5"
              style={{ color: INK }}
            >
              Your design,
              <br />
              our craft.
            </h1>

            <p
              className="text-base mb-6 max-w-md"
              style={{ color: INK_SOFT }}
            >
              Custom-made · Made-to-order · Prepaid only.
              Sarees & blouses, dresses & gowns, kurtis,
              and hand-crocheted pieces — every one made
              just for you.
            </p>

            <Link
              to="/enquiry"
              className="btn inline-flex items-center gap-2 text-sm px-6 py-3 w-fit"
              style={{
                background: ROSE,
                color: CREAM,
              }}
            >
              Enquire about a custom piece
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="order-1 md:order-2 h-56 sm:h-64 md:h-auto">
            <PlaceholderImage
              label="Replace with a hero photo — an embroidered blouse or saree works best"
              fill
            />
          </div>
        </FadeInOnMount>
      </section>

      <div style={{ paddingTop: "150px", paddingBottom: "8px" }}>
        <StitchDivider />
      </div>

      {/* CATEGORIES */}
      <section
        className="fabric-texture px-6 md:px-12 py-24 md:py-28"
        style={{ background: SAGE_LIGHT }}
      >
        <Reveal>
          <h2
            className="display text-3xl mb-10 text-center"
            style={{
              color: INK,
              letterSpacing: "0.01em",
            }}
          >
            What we make
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 max-w-7xl mx-auto">
            {CATEGORIES.map((category, index) => (
              <Reveal
                key={category.id}
                delay={index * 0.08}
              >
                <Link
                  to={`/category/${category.id}`}
                  className="btn card-hover group block text-left w-full"
                  style={{
                    background: CREAM,
                    border: `1px solid ${SAGE}`,
                  }}
                >
                  <div className="img-zoom-wrap">
                    <PlaceholderImage label={category.name} tall />
                  </div>

                  <div className="p-5">
                    <h3 className="display text-lg mb-2">
                      {category.name}
                    </h3>

                    <p
                      className="text-sm"
                      style={{ color: INK_SOFT }}
                    >
                      {category.desc}
                    </p>

                    <span
                      className="inline-flex items-center gap-1 text-sm mt-4"
                      style={{ color: SAGE_DARK }}
                    >
                      View pieces
                      <ChevronRight size={16} />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </Reveal>
      </section>

      <StitchDivider />

      {/* TESTIMONIAL PREVIEW */}
      <section
        className="py-24 md:py-28"
        style={{ background: CREAM }}
      >
        <Reveal className="max-w-6xl mx-auto px-6">
          <h2
            className="display text-3xl md:text-4xl text-center mb-10"
            style={{ color: INK }}
          >
            Happy customers
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {TESTIMONIALS.map((testimonial, index) => (
              <div
                key={index}
                className="border"
                style={{
                  borderColor: "#E8DDC9",
                  background: "#F8F3E9",
                }}
              >
                <PlaceholderImage label="Replace with customer photo" />

                <div className="p-5">
                  <p
                    className="italic text-sm leading-6"
                    style={{ color: INK }}
                  >
                    "{testimonial.quote}"
                  </p>

                  <p
                    className="mt-4 text-sm"
                    style={{ color: SAGE_DARK }}
                  >
                    — {testimonial.name}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              to="/feedback"
              className="inline-flex items-center gap-1 text-sm"
              style={{ color: SAGE_DARK }}
            >
              View all feedback
              <ChevronRight size={15} />
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
