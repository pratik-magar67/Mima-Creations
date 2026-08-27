import { supabase } from "./supabaseClient";
import React, { useState, useEffect, useMemo, useRef, useLayoutEffect } from "react";
import { Heart, Mail, MessageCircle, Menu, X, ChevronRight, ArrowRight, ArrowUp, Search } from "lucide-react";
import logoImg from "./assets/logo.png";


// --- CONSTANTS & DATA ---
const WHATSAPP_NUMBER = "9779824203807"; // Replace with your WhatsApp number with country code

const CREAM = "#F6F0E3";
const CREAM_DARK = "#ECE2CC";
const INK = "#2B2620";
const INK_SOFT = "#6B6357";
const SAGE = "#7C9478";
const SAGE_DARK = "#5F7A5C";
const SAGE_LIGHT = "#E3EBDE";
const ROSE = "#AD6E5B";

const CATEGORIES = [
  { id: "sarees", name: "Sarees & Blouses", desc: "Hand-embroidered blouses and draped sarees, fitted to you." },
  { id: "dresses", name: "Dresses & Gowns", desc: "Custom gowns and dresses for every occasion." },
  { id: "kurtis", name: "Kurtis", desc: "Everyday and festive kurtis, made to your measurements." },
  { id: "crochet", name: "Crochet", desc: "Hand-crocheted pieces, stitched one loop at a time." },
];

const TESTIMONIALS = [
  { quote: "Placeholder — swap in a real quote from your Feedback highlight.", name: "Customer name" },
  { quote: "Placeholder — swap in a real quote from your Feedback highlight.", name: "Customer name" },
  { quote: "Placeholder — swap in a real quote from your Feedback highlight.", name: "Customer name" },
];

// --- HELPER COMPONENTS ---
function InstagramIcon({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.3" cy="6.7" r="1" fill={color} stroke="none" />
    </svg>
  );
}

function Logo({ size = 120 }) {
  return (
    <img
      src={logoImg}
      alt="Mima Creations logo"
      width={size}
      height={size}
      style={{ objectFit: "contain", display: "block" }}
    />
  );
}

function PlaceholderImage({ label, tall = false, fill = false }) {
  const heightClass = fill ? "h-full" : tall ? "h-72" : "h-48";

  return (
    <div
      className={`w-full ${heightClass} flex flex-col items-center justify-center gap-2`}
      style={{ background: SAGE_LIGHT, border: `1px solid ${SAGE}` }}
    >
      <Heart
        size={22}
        color={SAGE_DARK}
        strokeWidth={1.2}
        style={{ transition: "transform 0.3s ease" }}
        className="group-hover:scale-110"
      />
      <span className="text-xs px-4 text-center" style={{ color: INK_SOFT }}>
        {label}
      </span>
    </div>
  );
}

export function FadeImage({ src, alt, className = "" }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <img
      src={src}
      alt={alt}
      onLoad={() => setLoaded(true)}
      className={className}
      style={{
        width: "100%",
        objectFit: "cover",
        display: "block",
        opacity: loaded ? 1 : 0,
        filter: loaded ? "blur(0px)" : "blur(10px)",
        transition: "opacity 0.5s ease, filter 0.5s ease",
      }}
    />
  );
}

function Reveal({ children, delay = 0, className = "" }) {
  const ref = React.useRef(null);
  const [visible, setVisible] = useState(() => (
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ));

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.15 });

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
        transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

function StitchDivider() {
  const ref = React.useRef(null);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setDrawn(true);
        observer.disconnect();
      }
    }, { threshold: 0.5 });

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <svg ref={ref} width="100%" height="20" style={{ display: "block" }} aria-hidden="true">
      <line
        x1="0"
        y1="10"
        x2="100%"
        y2="10"
        stroke={SAGE_DARK}
        strokeWidth="1.5"
        strokeDasharray="6 8"
        strokeDashoffset={drawn ? 0 : 1000}
        style={{ transition: "stroke-dashoffset 1.4s ease" }}
      />
    </svg>
  );
}

function StitchCheck() {
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDrawn(true), 150);
    return () => clearTimeout(timer);
  }, []);

  return (
    <svg width="64" height="64" viewBox="0 0 64 64" aria-hidden="true">
      <circle
        cx="32"
        cy="32"
        r="28"
        fill="none"
        stroke={SAGE}
        strokeWidth="1.5"
        strokeDasharray="4 6"
        strokeDashoffset={drawn ? 0 : 200}
        style={{ transition: "stroke-dashoffset 1s ease" }}
      />
      <path
        d="M20 33 L28 41 L44 24"
        fill="none"
        stroke={ROSE}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="40"
        strokeDashoffset={drawn ? 0 : 40}
        style={{ transition: "stroke-dashoffset 0.6s ease 0.5s" }}
      />
    </svg>
  );
}

function ScrollToTopButton({ visible }) {
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Scroll to top"
      className="btn scroll-top-btn"
      style={{
        position: "fixed",
        bottom: "75px",
        right: "20px",
        width: "44px",
        height: "44px",
        borderRadius: "50%",
        background: SAGE_DARK,
        color: CREAM,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transition: "opacity 0.3s ease, transform 0.3s ease",
        zIndex: 30,
        border: "none",
      }}
    >
      <ArrowUp size={18} />
    </button>
  );
}

function MobileEnquireBar({ onEnquire }) {
  return (
    <div
      className="md:hidden fixed bottom-0 inset-x-0 z-20 px-4 py-3"
      style={{ background: CREAM, borderTop: `1px solid ${CREAM_DARK}` }}
    >
      <button onClick={onEnquire} className="btn w-full text-sm py-3" style={{ background: ROSE, color: CREAM }}>
        Enquire about a custom piece
      </button>
    </div>
  );
}

// --- MAIN APPLICATION ---
export default function MimaCreationsSite() {
  const [view, setView] = useState("home");
  const [activeCategory, setActiveCategory] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [enquiry, setEnquiry] = useState({ name: "", contact: "", category: "sarees", notes: "", budget: "" });
  const [submitted, setSubmitted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [fade, setFade] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const navRefs = useRef({});
  const fadeTimeout = useRef(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0, ready: false });

  // Load and persist favorites in localStorage
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem("mima_favorites");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("mima_favorites", JSON.stringify(favorites));
    } catch (error) {
      console.error("Could not save favorites:", error);
    }
  }, [favorites]);

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase.from("products").select("*");
      if (error) {
        console.error("Could not load products:", error.message);
      } else {
        setProducts(data);
      }
      setProductsLoading(false);
    }
    fetchProducts();
  }, []);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 480);
      setHeaderScrolled(window.scrollY > 12);
    }

    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useLayoutEffect(() => {
    const el = navRefs.current[view];
    if (el) setIndicator({ left: el.offsetLeft, width: el.offsetWidth, ready: true });
  }, [view]);

  useEffect(() => {
    function onResize() {
      const el = navRefs.current[view];
      if (el) setIndicator({ left: el.offsetLeft, width: el.offsetWidth, ready: true });
    }

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [view]);

  // Optimized Search/Filter via useMemo
  const filteredPieces = useMemo(() => {
    return products.filter((piece) => {
      const matchesCategory = filterCategory === "all" || piece.category === filterCategory;
      const matchesSearch = piece.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, searchTerm, filterCategory]);

  function nav(targetView, cat = null) {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function apply() {
      setView(targetView);
      setActiveCategory(cat);
      setMenuOpen(false);
      setSubmitted(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    if (prefersReduced) {
      apply();
      return;
    }

    if (fadeTimeout.current) clearTimeout(fadeTimeout.current);

    setFade(true);
    fadeTimeout.current = setTimeout(() => {
      apply();
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setFade(false));
      });
    }, 150);
  }

  function startEnquiry(categoryId, pieceName) {
    setEnquiry((f) => ({ ...f, category: categoryId, notes: pieceName ? `Interested in: ${pieceName}` : "" }));
    nav("enquiry");
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setEnquiry((f) => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);

    // Save the enquiry to Supabase so it shows up in the dashboard
    const { error } = await supabase.from("enquiries").insert([
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
      console.error("Could not save enquiry:", error.message);
    }

    // Create pre-filled WhatsApp link
    const text = encodeURIComponent(
      `Hi Mima Creations! I would like to submit an enquiry:\n\n` +
      `*Name:* ${enquiry.name}\n` +
      `*Contact:* ${enquiry.contact}\n` +
      `*Category:* ${enquiry.category}\n` +
      `*Notes:* ${enquiry.notes || "None"}\n` +
      `*Budget:* ${enquiry.budget || "Not specified"}`
    );

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, "_blank");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function toggleFavorite(pieceName) {
    setFavorites((current) =>
      current.includes(pieceName)
        ? current.filter((name) => name !== pieceName)
        : [...current, pieceName]
    );
  }

  function resetFilters() {
    setSearchTerm("");
    setFilterCategory("all");
  }

  const navLinks = [
    ["home", "Home"],
    ["shop", "Shop"],
    ["about", "About"],
    ["feedback", "Feedback"],
    ["contact", "Contact"],
  ];

  return (
    <div
      style={{
        background: CREAM,
        color: INK,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Jost', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Parisienne&family=Playfair+Display:ital,wght@0,500;0,600;1,500&family=Jost:wght@400;500;600&display=swap');
        .script { font-family: 'Parisienne', cursive; }
        .display { font-family: 'Playfair Display', serif; color: #2B2620; }
        .eyebrow { text-transform: uppercase; letter-spacing: 0.12em; font-size: 0.6875rem; }
        .btn { transition: transform 0.15s ease, opacity 0.15s ease; }
        .btn:hover { transform: translateY(-1px); opacity: 0.92; }
        .card-hover { transition: transform 0.25s ease, box-shadow 0.25s ease; }
        .card-hover:hover { transform: translateY(-4px); box-shadow: 0 10px 24px rgba(43,38,32,0.08); }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .mobile-menu-enter { animation: slideDown 0.25s ease; }
        @media (min-width: 768px) {
          .scroll-top-btn { bottom: 24px !important; }
        }
        .fabric-texture {
          background-image:
            repeating-linear-gradient(45deg, rgba(43,38,32,0.025) 0, rgba(43,38,32,0.025) 1px, transparent 1px, transparent 7px),
            repeating-linear-gradient(-45deg, rgba(43,38,32,0.025) 0, rgba(43,38,32,0.025) 1px, transparent 1px, transparent 7px);
        }
        @media (prefers-reduced-motion: reduce) {
          .mobile-menu-enter { animation: none; }
          .card-hover:hover { transform: none; }
        }
        input:focus-visible, select:focus-visible, textarea:focus-visible { outline: 2px solid ${SAGE_DARK}; outline-offset: 2px; }
        button:focus-visible, a:focus-visible { outline: 2px solid ${SAGE_DARK}; outline-offset: 2px; }
        button:focus:not(:focus-visible), a:focus:not(:focus-visible) { outline: none; }
      `}</style>

      {/* HEADER */}
      <header
        className="flex items-center justify-between px-6 md:px-12 py-4 sticky top-0 z-10"
        style={{
          background: CREAM,
          borderBottom: `1px solid ${headerScrolled ? CREAM_DARK : "transparent"}`,
          boxShadow: headerScrolled ? "0 4px 16px rgba(43,38,32,0.06)" : "none",
          transition: "box-shadow 0.3s ease, border-color 0.3s ease",
        }}
      >
        <button onClick={() => nav("home")} className="flex items-center gap-4">
          <Logo size={60} />
          <span className="block display text-base sm:text-xl" style={{ color: INK, letterSpacing: "0.01em" }}>Mima Creations</span>
        </button>

        <nav className="hidden md:flex items-center gap-7 text-sm relative" style={{ color: INK_SOFT }}>
          {navLinks.map(([id, label]) => (
            <button
              key={id}
              ref={(el) => (navRefs.current[id] = el)}
              onClick={() => nav(id)}
              className={view === id ? "font-medium" : ""}
              style={{ color: view === id ? INK : INK_SOFT }}
            >
              {label}
            </button>
          ))}
          {indicator.ready && (
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                bottom: "-8px",
                left: indicator.left,
                width: indicator.width,
                height: 0,
                borderBottom: `1.5px dashed ${SAGE_DARK}`,
                transition: "left 0.35s ease, width 0.35s ease",
              }}
            />
          )}
        </nav>

        <div className="flex items-center gap-3">
          <button onClick={() => nav("enquiry")} className="btn hidden sm:inline-block text-sm px-5 py-2" style={{ background: SAGE_DARK, color: CREAM }}>
            Enquire
          </button>
          <button className="md:hidden" onClick={() => setMenuOpen((m) => !m)} aria-label="Toggle navigation menu">
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="md:hidden flex flex-col px-6 py-4 gap-3 border-b mobile-menu-enter" style={{ background: CREAM, borderColor: CREAM_DARK }}>
          {navLinks.map(([id, label]) => (
            <button key={id} onClick={() => nav(id)} className="text-left text-sm py-1" style={{ color: INK }}>
              {label}
            </button>
          ))}
          <button onClick={() => nav("enquiry")} className="btn text-sm px-5 py-2 mt-1 w-fit" style={{ background: SAGE_DARK, color: CREAM }}>
            Enquire
          </button>
        </div>
      )}

      {/* MAIN CONTENT */}
      <main className="flex-1 pb-20 md:pb-0" style={{ opacity: fade ? 0 : 1, transition: "opacity 0.18s ease" }}>
        {view === "home" && (
          <>
            <section className="relative overflow-hidden">
              <Reveal className="grid md:grid-cols-[1.1fr_1fr] items-stretch">
                <div className="px-6 md:px-12 py-16 md:py-24 flex flex-col justify-center order-2 md:order-1">
                  <svg aria-hidden="true" width="220" height="30" style={{ marginBottom: "-6px" }}>
                    <line x1="0" y1="15" x2="220" y2="15" stroke={SAGE_DARK} strokeWidth="1.5" strokeDasharray="6 8" opacity="0.6" />
                  </svg>
                  <p className="script text-2xl mb-3" style={{ color: ROSE }}>From my hand to your heart</p>
                  <h1 className="display text-4xl md:text-6xl leading-[1.05] mb-5" style={{ color: INK }}>
                    Your design,<br />our craft.
                  </h1>
                  <p className="text-base mb-6 max-w-md" style={{ color: INK_SOFT }}>
                    Custom-made · Made-to-order · Prepaid only. Sarees & blouses, dresses & gowns, kurtis, and hand-crocheted
                    pieces — every one made just for you.
                  </p>
                  <button onClick={() => nav("enquiry")} className="btn inline-flex items-center gap-2 text-sm px-6 py-3 w-fit" style={{ background: ROSE, color: CREAM }}>
                    Enquire about a custom piece <ArrowRight size={16} />
                  </button>
                </div>
                <div className="order-1 md:order-2 h-64 md:h-auto">
                  <PlaceholderImage label="Replace with a hero photo — an embroidered blouse or saree works best" fill />
                </div>
              </Reveal>
            </section>

            <StitchDivider />

            <section className="fabric-texture px-6 md:px-12 py-20" style={{ background: SAGE_LIGHT }}>
              <Reveal>
                <h2 className="display text-3xl mb-8 text-center" style={{ color: INK, letterSpacing: "0.01em" }}>
                  What we make
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                  {CATEGORIES.map((c, i) => (
                    <Reveal key={c.id} delay={i * 0.08}>
                      <button onClick={() => nav("category", c.id)} className="btn card-hover group text-left w-full" style={{ background: CREAM, border: `1px solid ${SAGE}` }}>
                      <PlaceholderImage label={c.name} />
                      <div className="p-4">
                        <h3 className="display text-base mb-1">{c.name}</h3>
                        <p className="text-xs" style={{ color: INK_SOFT }}>{c.desc}</p>
                        <span className="inline-flex items-center gap-1 text-xs mt-3" style={{ color: SAGE_DARK }}>
                          View pieces <ChevronRight size={14} />
                        </span>
                      </div>
                      </button>
                    </Reveal>
                  ))}
                </div>
              </Reveal>
            </section>

            <StitchDivider />

            <section className="py-24 md:py-28" style={{ background: CREAM }}>
              <Reveal className="max-w-6xl mx-auto px-6">
                <h2 className="display text-3xl md:text-4xl text-center mb-10" style={{ color: INK }}>
                  Happy customers
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                  {TESTIMONIALS.map((t, i) => (
                    <div key={i} className="border" style={{ borderColor: "#E8DDC9", background: "#F8F3E9" }}>
                      <PlaceholderImage label="Replace with customer photo" />
                      <div className="p-5">
                        <p className="italic text-sm leading-6" style={{ color: INK }}>"{t.quote}"</p>
                        <p className="mt-4 text-sm" style={{ color: SAGE_DARK }}>— {t.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Reveal>
            </section>
          </>
        )}

        {view === "shop" && (
          <section className="px-6 md:px-12 py-14 max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7">
              <div>
                <h2 className="display text-3xl mb-2">Browse the collection</h2>
                <p className="text-base" style={{ color: INK_SOFT }}>Every piece is made to order, then fitted to you.</p>
              </div>
              <span className="text-xs" style={{ color: SAGE_DARK }}>
                {favorites.length} saved {favorites.length === 1 ? "piece" : "pieces"}
              </span>
            </div>

            <div className="flex flex-col md:flex-row gap-3 mb-8">
              <label className="flex items-center gap-2 border px-3 py-2 flex-1" style={{ borderColor: CREAM_DARK, background: "#fffaf0" }}>
                <Search size={16} color={INK_SOFT} />
                <input
                  aria-label="Search pieces"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search pieces"
                  className="bg-transparent outline-none text-sm w-full"
                />
              </label>
              <select
                aria-label="Filter by category"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="border px-3 py-2 text-sm"
                style={{ borderColor: CREAM_DARK, background: "#fffaf0" }}
              >
                <option value="all">All categories</option>
                {CATEGORIES.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>

            <p className="eyebrow mb-4" style={{ color: INK_SOFT }}>
              {filteredPieces.length} {filteredPieces.length === 1 ? "piece" : "pieces"} found
            </p>

            {productsLoading ? (
              <p style={{ color: INK_SOFT }} className="text-sm">Loading products...</p>
            ) : filteredPieces.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPieces.map((piece, i) => (
                  <Reveal key={piece.name} delay={Math.min(i * 0.05, 0.3)}>
                    <div className="card-hover" style={{ border: `1px solid ${CREAM_DARK}`, background: CREAM }}>
                    <div className="relative">
                      {piece.image_url ? (
                        <FadeImage src={piece.image_url} alt={piece.name} className="h-72" />
                      ) : (
                        <PlaceholderImage label={piece.name} tall />
                      )}
                      <button
                        onClick={() => toggleFavorite(piece.name)}
                        aria-label={`${favorites.includes(piece.name) ? "Remove" : "Save"} ${piece.name}`}
                        className="absolute top-3 right-3 p-2"
                        style={{ background: CREAM }}
                      >
                        <Heart
                          size={17}
                          fill={favorites.includes(piece.name) ? ROSE : "none"}
                          color={ROSE}
                          style={{
                            transition: "transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
                            transform: favorites.includes(piece.name) ? "scale(1.15)" : "scale(1)",
                          }}
                        />
                      </button>
                    </div>
                    <div className="p-4">
                      <p className="eyebrow mb-1" style={{ color: SAGE_DARK }}>
                        {CATEGORIES.find((category) => category.id === piece.category)?.name}
                      </p>
                      <h3 className="display text-base mb-1">{piece.name}</h3>
                      <p className="text-xs mb-3" style={{ color: INK_SOFT }}>{piece.price}</p>
                      <button
                        onClick={() => startEnquiry(piece.category, piece.name)}
                        className="btn text-xs px-4 py-2 w-full"
                        style={{ background: SAGE_DARK, color: CREAM }}
                      >
                        Enquire about this piece
                      </button>
                    </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            ) : (
              <Reveal>
                <div className="py-14 text-center border" style={{ borderColor: CREAM_DARK }}>
                  <p className="display text-xl mb-2">Nothing found yet</p>
                  <p className="text-sm mb-4" style={{ color: INK_SOFT }}>Try another search or reset your filters.</p>
                  <button onClick={resetFilters} className="btn text-xs px-4 py-2" style={{ background: SAGE_DARK, color: CREAM }}>
                    Reset filters
                  </button>
                </div>
              </Reveal>
            )}
          </section>
        )}

        {view === "category" && activeCategory && (
          <section className="px-6 md:px-12 py-14 max-w-6xl mx-auto">
            <nav aria-label="Breadcrumb" className="text-xs mb-6" style={{ color: INK_SOFT }}>
              <button onClick={() => nav("home")} className="hover:underline">Home</button>
              <span className="mx-2">/</span>
              <button onClick={() => nav("shop")} className="hover:underline">Shop</button>
              <span className="mx-2">/</span>
              <span style={{ color: INK }}>{CATEGORIES.find((c) => c.id === activeCategory)?.name}</span>
            </nav>
            <h2 className="display text-3xl mb-1">{CATEGORIES.find((c) => c.id === activeCategory)?.name}</h2>
            <p className="text-base mb-10 max-w-xl" style={{ color: INK_SOFT }}>{CATEGORIES.find((c) => c.id === activeCategory)?.desc}</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.filter((p) => p.category === activeCategory).map((p, i) => (
                <Reveal key={i} delay={Math.min(i * 0.06, 0.3)}>
                  <div className="card-hover" style={{ border: `1px solid ${CREAM_DARK}` }}>
                  {p.image_url ? (
                    <FadeImage src={p.image_url} alt={p.name} className="h-72" />
                  ) : (
                    <PlaceholderImage label={p.name} tall />
                  )}
                  <div className="p-4">
                    <h3 className="display text-base mb-1">{p.name}</h3>
                    <p className="text-xs mb-3" style={{ color: INK_SOFT }}>{p.price}</p>
                    <button onClick={() => startEnquiry(activeCategory, p.name)} className="btn text-xs px-4 py-2 w-full" style={{ background: SAGE_DARK, color: CREAM }}>
                      Enquire about this piece
                    </button>
                  </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {view === "enquiry" && !submitted && (
          <section className="px-6 md:px-12 py-14 max-w-2xl mx-auto">
            <p className="script text-xl mb-1" style={{ color: ROSE }}>Let's design something for you</p>
            <h2 className="display text-3xl mb-6">Custom order enquiry</h2>
            <form onSubmit={handleSubmit} style={{ border: `1px solid ${SAGE}`, background: SAGE_LIGHT }} className="p-6 md:p-8">
              <div className="grid sm:grid-cols-2 gap-5 mb-5">
                <label className="block">
                  <span className="text-xs" style={{ color: INK_SOFT }}>Name</span>
                  <input required name="name" value={enquiry.name} onChange={handleChange} className="w-full mt-1 p-2 bg-transparent border" style={{ borderColor: INK }} />
                </label>
                <label className="block">
                  <span className="text-xs" style={{ color: INK_SOFT }}>Contact (email or WhatsApp)</span>
                  <input required name="contact" value={enquiry.contact} onChange={handleChange} className="w-full mt-1 p-2 bg-transparent border" style={{ borderColor: INK }} />
                </label>
              </div>
              <label className="block mb-5">
                <span className="text-xs" style={{ color: INK_SOFT }}>Category</span>
                <select name="category" value={enquiry.category} onChange={handleChange} className="w-full mt-1 p-2 bg-transparent border" style={{ borderColor: INK }}>
                  {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </label>
              <label className="block mb-5">
                <span className="text-xs" style={{ color: INK_SOFT }}>Notes, measurements, or a reference you have in mind</span>
                <textarea name="notes" value={enquiry.notes} onChange={handleChange} rows={4} className="w-full mt-1 p-2 bg-transparent border" style={{ borderColor: INK }} />
              </label>
              <label className="block mb-6">
                <span className="text-xs" style={{ color: INK_SOFT }}>Budget range (optional)</span>
                <input name="budget" value={enquiry.budget} onChange={handleChange} placeholder="e.g. Rs. 3,000–5,000" className="w-full mt-1 p-2 bg-transparent border" style={{ borderColor: INK }} />
              </label>
              <button type="submit" className="btn text-sm px-6 py-3 w-full sm:w-auto" style={{ background: ROSE, color: CREAM }}>
                Send enquiry
              </button>
              <p className="text-xs mt-4" style={{ color: INK_SOFT }}>
                This is a made-to-order piece — I'll confirm details and pricing with you before we begin. Prepaid only.
              </p>
            </form>
          </section>
        )}

        {view === "enquiry" && submitted && (
          <section className="px-6 md:px-12 py-16 max-w-xl mx-auto text-center">
            <div className="flex justify-center mb-4"><StitchCheck /></div>
            <h2 className="display text-3xl mb-3">Thank you, {enquiry.name || "friend"}!</h2>
            <p className="text-sm mb-8" style={{ color: INK_SOFT }}>
              Your enquiry has been formatted and opened in WhatsApp. We'll reach out to discuss further details and pricing.
            </p>
            <button onClick={() => nav("home")} className="btn text-sm px-6 py-3" style={{ background: SAGE_DARK, color: CREAM }}>
              Back to home
            </button>
          </section>
        )}

        {view === "about" && (
          <section className="py-16 md:py-20" style={{ background: CREAM }}>
            <Reveal className="max-w-6xl mx-auto px-6">
              <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-10 items-center">
                <PlaceholderImage label="Replace with a photo of the maker at work" tall />
                <div>
                  <p className="script text-2xl mb-3" style={{ color: ROSE }}>From my hand to your heart</p>
                  <h2 className="display text-3xl mb-4" style={{ color: INK }}>Our story</h2>
                  <p className="text-sm mb-4" style={{ color: INK_SOFT }}>
                    Mima Creations began as a way of turning fabric, thread, and yarn into something personal —
                    pieces made for one person at a time, not a rack. Every saree, dress, kurti, and crochet
                    piece is cut and stitched only after we know the person who'll wear it.
                  </p>
                </div>
              </div>
            </Reveal>
          </section>
        )}

        {view === "feedback" && (
          <section className="py-12 md:py-14" style={{ background: CREAM }}>
            <Reveal className="max-w-6xl mx-auto px-6">
              <h2 className="display text-3xl md:text-4xl text-center mb-8" style={{ color: INK }}>
                Happy customers
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {TESTIMONIALS.map((t, i) => (
                  <div key={i} style={{ border: `1px solid ${CREAM_DARK}`, background: "#F8F3E9" }}>
                    <PlaceholderImage label="Replace with customer photo" />
                    <div className="p-4">
                      <p className="text-sm italic mb-3 leading-5" style={{ color: INK_SOFT }}>"{t.quote}"</p>
                      <p className="text-xs" style={{ color: SAGE_DARK }}>— {t.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </section>
        )}

        {view === "contact" && (
          <section className="py-16 md:py-20" style={{ background: CREAM }}>
            <Reveal className="max-w-6xl mx-auto px-6">
              <div className="max-w-md mx-auto text-center">
                <div className="flex flex-col items-center gap-2">
                  <Logo size={90} />
                  <span className="script text-2xl" style={{ color: INK }}>Mima Creations</span>
                </div>
                <h2 className="display text-2xl mt-4 mb-6" style={{ color: INK }}>Get in touch</h2>
                <div className="flex flex-col gap-4 items-center text-sm">
                  <span className="flex items-center gap-2"><InstagramIcon size={16} /> @mimaa_creations2</span>
                  <span className="flex items-center gap-2"><Mail size={16} /> hello@mimacreations.com</span>
                  <span className="flex items-center gap-2"><MessageCircle size={16} /> WhatsApp: +{WHATSAPP_NUMBER}</span>
                </div>
                <button onClick={() => nav("enquiry")} className="btn text-sm px-6 py-3 mt-8" style={{ background: ROSE, color: CREAM }}>
                  Start a custom order
                </button>
              </div>
            </Reveal>
          </section>
        )}
      </main>

      {/* FOOTER */}
      <footer className="pt-3 pb-24 md:pb-6" style={{ background: CREAM }}>
        <div className="max-w-6xl mx-auto px-6">
          <StitchDivider />
        </div>
        <div className="max-w-6xl mx-auto px-6 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo size={42} />
            <span className="script text-lg" style={{ color: INK }}>Mima Creations</span>
          </div>
          <div className="flex items-center gap-5 text-sm" style={{ color: INK_SOFT }}>
            <span className="flex items-center gap-1"><InstagramIcon size={14} /> @mimaa_creations2</span>
            <span className="flex items-center gap-1"><Mail size={14} /> hello@mimacreations.com</span>
          </div>
        </div>
      </footer>
      {view !== "enquiry" && <MobileEnquireBar onEnquire={() => nav("enquiry")} />}
      <ScrollToTopButton visible={scrolled} />
    </div>
  );
}