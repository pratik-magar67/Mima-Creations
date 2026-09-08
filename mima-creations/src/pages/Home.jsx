import { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ChevronRight,
} from "lucide-react";

import heroGown from "../assets/hero-gown.png";
import categorySarees from "../assets/category-sarees.png";
import categoryDresses from "../assets/category-dresses.png";
import categoryKurtis from "../assets/category-kurtis.png";
import categoryCrochet from "../assets/category-crochet.png";
import { supabase } from "../supabaseClient";

const CATEGORY_IMAGES = {
  sarees: categorySarees,
  dresses: categoryDresses,
  kurtis: categoryKurtis,
  crochet: categoryCrochet,
};

const FALLBACK_HERO_IMAGES = [
  { src: heroGown, alt: "Custom royal blue gown by Mima Creations" },
  { src: categorySarees, alt: "Sarees & Blouses by Mima Creations" },
  { src: categoryDresses, alt: "Dresses & Gowns by Mima Creations" },
  { src: categoryKurtis, alt: "Kurtis by Mima Creations" },
  { src: categoryCrochet, alt: "Crochet pieces by Mima Creations" },
];

import {
  CREAM,
  INK,
  INK_SOFT,
  SAGE,
  SAGE_DARK,
  SAGE_LIGHT,
  ROSE,
  CATEGORIES,
  PlaceholderImage,
  FadeImage,
  ImageCarousel,
  Reveal,
  FadeInOnMount,
  StitchDivider,
} from "../components/SiteComponents";

export default function Home() {
  const [heroImages, setHeroImages] = useState(FALLBACK_HERO_IMAGES);
  const [usingFallback, setUsingFallback] = useState(true);
  const [heroVisible, setHeroVisible] = useState(true);
  const [feedback, setFeedback] = useState([]);
  const [feedbackLoaded, setFeedbackLoaded] = useState(false);

  const fetchedImagesRef = useRef(null);
  const swappedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchHeroImages() {
      const results = await Promise.all(
        CATEGORIES.map((category) =>
          supabase
            .from("products")
            .select("id, name, image_url")
            .eq("category", category.id)
            .or("available.is.null,available.eq.true")
            .not("image_url", "is", null)
            .order("id", { ascending: false })
            .limit(1)
        )
      );

      if (cancelled) return;

      const fetched = results
        .flatMap((r) => r.data || [])
        .map((p) => ({ src: p.image_url, alt: p.name }));

      if (fetched.length === 0) return;

      await Promise.all(
        fetched.map(
          (img) =>
            new Promise((resolve) => {
              const preload = new Image();
              preload.onload = resolve;
              preload.onerror = resolve;
              preload.src = img.src;
            })
        )
      );

      if (cancelled) return;

      fetchedImagesRef.current = fetched;
    }

    fetchHeroImages();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchFeedback() {
      const { data, error } = await supabase
        .from("feedback")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(3);

      if (cancelled) return;

      if (error) {
        console.error("Could not load feedback:", error.message);
      } else {
        setFeedback(data || []);
      }
      setFeedbackLoaded(true);
    }

    fetchFeedback();
    return () => {
      cancelled = true;
    };
  }, []);

  const swapToLiveImages = useCallback(() => {
    if (swappedRef.current || !fetchedImagesRef.current) return;
    swappedRef.current = true;
    setHeroVisible(false);
    setTimeout(() => {
      setHeroImages(fetchedImagesRef.current);
      setUsingFallback(false);
      setHeroVisible(true);
    }, 350);
  }, []);

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
              className="btn hidden md:inline-flex items-center gap-2 text-sm px-6 py-3 w-fit"
              style={{
                background: ROSE,
                color: CREAM,
              }}
            >
              Enquire about a custom piece
              <ArrowRight size={16} />
            </Link>
          </div>

          <div
            className="order-1 md:order-2 h-80 sm:h-96 md:h-[600px] lg:h-[680px]"
            style={{ opacity: heroVisible ? 1 : 0, transition: "opacity 0.35s ease" }}
          >
            <ImageCarousel
              key={usingFallback ? "fallback" : "live"}
              images={heroImages}
              objectPosition="50% 15%"
              onCycleComplete={usingFallback ? swapToLiveImages : undefined}
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
                    {CATEGORY_IMAGES[category.id] ? (
                      <FadeImage src={CATEGORY_IMAGES[category.id]} alt={category.name} className="aspect-[4/5] h-auto" />
                    ) : (
                      <PlaceholderImage label={category.name} tall />
                    )}
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
      {feedbackLoaded && feedback.length > 0 && (
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
              {feedback.map((item) => (
                <div
                  key={item.id}
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
                      "{item.quote}"
                    </p>

                    <p
                      className="mt-4 text-sm"
                      style={{ color: SAGE_DARK }}
                    >
                      — {item.customer_name}
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
      )}
    </>
  );
}
