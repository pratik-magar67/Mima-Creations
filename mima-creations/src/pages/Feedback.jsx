import {
  CREAM,
  CREAM_DARK,
  INK,
  INK_SOFT,
  SAGE_DARK,
  TESTIMONIALS,
  PlaceholderImage,
  Reveal,
} from "../components/SiteComponents";

export default function Feedback() {
  return (
    <section
      className="py-12 md:py-14"
      style={{ background: CREAM }}
    >
      <Reveal className="max-w-6xl mx-auto px-6">
        <h2
          className="display text-3xl md:text-4xl text-center mb-8"
          style={{ color: INK }}
        >
          Happy customers
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {TESTIMONIALS.map((testimonial, index) => (
            <div
              key={index}
              style={{
                border: `1px solid ${CREAM_DARK}`,
                background: "#F8F3E9",
              }}
            >
              <PlaceholderImage label="Replace with customer photo" />

              <div className="p-4">
                <p
                  className="text-sm italic mb-3 leading-5"
                  style={{ color: INK_SOFT }}
                >
                  "{testimonial.quote}"
                </p>

                <p
                  className="text-xs"
                  style={{ color: SAGE_DARK }}
                >
                  — {testimonial.name}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
