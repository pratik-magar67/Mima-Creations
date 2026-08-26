import React, { useState } from "react";
import { Heart, Mail, MessageCircle, Menu, X, ChevronRight, ArrowRight } from "lucide-react";
import logoImg from "./assets/logo.jpg";

function InstagramIcon({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.3" cy="6.7" r="1" fill={color} stroke="none" />
    </svg>
  );
}

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

const PIECES = {
  sarees: [
    { name: "Emerald Embroidered Blouse", price: "From Rs. 3,500" },
    { name: "Rose Gold Silk Saree Set", price: "From Rs. 6,500" },
    { name: "Ivory Zari Blouse", price: "From Rs. 3,800" },
  ],
  dresses: [
    { name: "Powder Blue Cottagecore Dress", price: "From Rs. 4,200" },
    { name: "Crimson Evening Gown", price: "From Rs. 7,000" },
  ],
  kurtis: [
    { name: "Indigo Block-Print Kurti", price: "From Rs. 2,800" },
    { name: "Festive Zari Kurti", price: "From Rs. 3,200" },
  ],
  crochet: [
    { name: "Sunflower Coaster Set", price: "From Rs. 800" },
    { name: "Crochet Flower Bouquet", price: "From Rs. 1,500" },
  ],
};

const TESTIMONIALS = [
  { quote: "Placeholder — swap in a real quote from your Feedback highlight.", name: "Customer name" },
  { quote: "Placeholder — swap in a real quote from your Feedback highlight.", name: "Customer name" },
  { quote: "Placeholder — swap in a real quote from your Feedback highlight.", name: "Customer name" },
];

function Logo({ size = 120 }) {
  return (
    <img
      src={logoImg}
      alt="Mima Creations logo"
      width={size}
      height={size}
      style={{ objectFit: "contain" }}
    />
  );
}

function PlaceholderImage({ label, tall = false }) {
  return (
    <div
      className={`w-full ${tall ? "h-72" : "h-48"} flex flex-col items-center justify-center gap-2`}
      style={{ background: SAGE_LIGHT, border: `1px solid ${SAGE}` }}
    >
      <Heart size={22} color={SAGE_DARK} strokeWidth={1.2} />
      <span className="text-xs px-4 text-center" style={{ color: INK_SOFT, fontFamily: "'Jost', sans-serif" }}>
        {label}
      </span>
    </div>
  );
}

export default function MimaCreationsSite() {
  const [view, setView] = useState("home");
  const [activeCategory, setActiveCategory] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [enquiry, setEnquiry] = useState({ name: "", contact: "", category: "sarees", notes: "", budget: "" });
  const [submitted, setSubmitted] = useState(false);

  function nav(v, cat = null) {
    setView(v);
    setActiveCategory(cat);
    setMenuOpen(false);
    setSubmitted(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startEnquiry(categoryId, pieceName) {
    setEnquiry((f) => ({ ...f, category: categoryId, notes: pieceName ? `Interested in: ${pieceName}` : "" }));
    nav("enquiry");
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setEnquiry((f) => ({ ...f, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const navLinks = [
    ["home", "Home"],
    ["shop", "Shop"],
    ["about", "About"],
    ["feedback", "Feedback"],
    ["contact", "Contact"],
  ];

  return (
    <div style={{ background: CREAM, color: INK, minHeight: "100vh", fontFamily: "'Jost', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Parisienne&family=Playfair+Display:ital,wght@0,500;0,600;1,500&family=Jost:wght@400;500;600&display=swap');
        .script { font-family: 'Parisienne', cursive; }
        .display { font-family: 'Playfair Display', serif; }
        .btn { transition: transform 0.15s ease, opacity 0.15s ease; }
        .btn:hover { transform: translateY(-1px); opacity: 0.92; }
        input:focus, select:focus, textarea:focus { outline: 2px solid ${SAGE_DARK}; outline-offset: 2px; }
        button:focus, a:focus { outline: 2px solid ${SAGE_DARK}; outline-offset: 2px; }
      `}</style>

      <header className="flex items-center justify-between px-6 md:px-12 py-4 border-b sticky top-0 z-10" style={{ borderColor: CREAM_DARK, background: CREAM }}>
        <button onClick={() => nav("home")} className="flex items-center gap-3">
          <Logo size={56} />
          <span className="hidden sm:block display text-lg" style={{ color: INK }}>Mima Creations</span>
        </button>

        <nav className="hidden md:flex items-center gap-7 text-sm" style={{ color: INK_SOFT }}>
          {navLinks.map(([id, label]) => (
            <button key={id} onClick={() => nav(id)} className={view === id ? "font-medium" : ""} style={{ color: view === id ? INK : INK_SOFT }}>
              {label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button onClick={() => nav("enquiry")} className="btn hidden sm:inline-block text-sm px-5 py-2" style={{ background: SAGE_DARK, color: CREAM }}>
            Enquire
          </button>
          <button className="md:hidden" onClick={() => setMenuOpen((m) => !m)} aria-label="Menu">
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {menuOpen && (
        <div className="md:hidden flex flex-col px-6 py-4 gap-3 border-b" style={{ background: CREAM, borderColor: CREAM_DARK }}>
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

      {view === "home" && (
        <>
          <section className="px-6 md:px-12 py-16 md:py-20 grid md:grid-cols-2 gap-10 items-center max-w-6xl mx-auto">
            <div>
              <p className="script text-2xl mb-3" style={{ color: ROSE }}>From my hand to your heart</p>
              <h1 className="display text-4xl md:text-5xl leading-tight mb-5">Your design, our craft.</h1>
              <p className="text-sm mb-6" style={{ color: INK_SOFT }}>
                Custom-made · Made-to-order · Prepaid only. Sarees & blouses, dresses & gowns, kurtis, and hand-crocheted
                pieces — every one made just for you.
              </p>
              <button onClick={() => nav("enquiry")} className="btn inline-flex items-center gap-2 text-sm px-6 py-3" style={{ background: ROSE, color: CREAM }}>
                Enquire about a custom piece <ArrowRight size={16} />
              </button>
            </div>
            <PlaceholderImage label="Replace with a hero photo — an embroidered blouse or saree works best" tall />
          </section>

          <section className="px-6 md:px-12 py-14" style={{ background: SAGE_LIGHT }}>
            <h2 className="display text-2xl mb-8 text-center">What we make</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {CATEGORIES.map((c) => (
                <button key={c.id} onClick={() => nav("category", c.id)} className="btn text-left" style={{ background: CREAM, border: `1px solid ${SAGE}` }}>
                  <PlaceholderImage label={c.name} />
                  <div className="p-4">
                    <h3 className="display text-base mb-1">{c.name}</h3>
                    <p className="text-xs" style={{ color: INK_SOFT }}>{c.desc}</p>
                    <span className="inline-flex items-center gap-1 text-xs mt-3" style={{ color: SAGE_DARK }}>
                      View pieces <ChevronRight size={14} />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="px-6 md:px-12 py-14 max-w-5xl mx-auto">
            <h2 className="display text-2xl mb-8 text-center">Happy customers</h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {TESTIMONIALS.map((t, i) => (
                <div key={i} className="p-5" style={{ border: `1px solid ${CREAM_DARK}` }}>
                  <p className="text-sm italic mb-3" style={{ color: INK_SOFT }}>"{t.quote}"</p>
                  <p className="text-xs" style={{ color: SAGE_DARK }}>— {t.name}</p>
                </div>
              ))}
            </div>
            <p className="text-center text-xs mt-4" style={{ color: INK_SOFT }}>
              Sample cards — replace with real quotes from your Feedback highlight.
            </p>
          </section>
        </>
      )}

      {view === "shop" && (
        <section className="px-6 md:px-12 py-14 max-w-6xl mx-auto">
          <h2 className="display text-3xl mb-2">Shop by category</h2>
          <p className="text-sm mb-10" style={{ color: INK_SOFT }}>Every piece is made to order — pick a category to browse.</p>
          <div className="grid sm:grid-cols-2 gap-6">
            {CATEGORIES.map((c) => (
              <button key={c.id} onClick={() => nav("category", c.id)} className="btn text-left" style={{ background: CREAM, border: `1px solid ${SAGE}` }}>
                <PlaceholderImage label={c.name} tall />
                <div className="p-5">
                  <h3 className="display text-lg mb-1">{c.name}</h3>
                  <p className="text-xs" style={{ color: INK_SOFT }}>{c.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {view === "category" && activeCategory && (
        <section className="px-6 md:px-12 py-14 max-w-6xl mx-auto">
          <button onClick={() => nav("shop")} className="text-xs mb-6" style={{ color: SAGE_DARK }}>&larr; All categories</button>
          <h2 className="display text-3xl mb-1">{CATEGORIES.find((c) => c.id === activeCategory)?.name}</h2>
          <p className="text-sm mb-10" style={{ color: INK_SOFT }}>{CATEGORIES.find((c) => c.id === activeCategory)?.desc}</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(PIECES[activeCategory] || []).map((p, i) => (
              <div key={i} style={{ border: `1px solid ${CREAM_DARK}` }}>
                <PlaceholderImage label={p.name} tall />
                <div className="p-4">
                  <h3 className="display text-base mb-1">{p.name}</h3>
                  <p className="text-xs mb-3" style={{ color: INK_SOFT }}>{p.price}</p>
                  <button onClick={() => startEnquiry(activeCategory, p.name)} className="btn text-xs px-4 py-2 w-full" style={{ background: SAGE_DARK, color: CREAM }}>
                    Enquire about this piece
                  </button>
                </div>
              </div>
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
          <Heart size={26} color={ROSE} className="mx-auto mb-4" />
          <h2 className="display text-3xl mb-3">Thank you, {enquiry.name || "friend"}!</h2>
          <p className="text-sm mb-8" style={{ color: INK_SOFT }}>
            Your enquiry has been received. We'll reach out at <strong>{enquiry.contact || "your contact"}</strong> soon
            to talk details and pricing.
          </p>
          <button onClick={() => nav("home")} className="btn text-sm px-6 py-3" style={{ background: SAGE_DARK, color: CREAM }}>
            Back to home
          </button>
        </section>
      )}

      {view === "about" && (
        <section className="px-6 md:px-12 py-14 max-w-4xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <PlaceholderImage label="Replace with a photo of the maker at work" tall />
          <div>
            <p className="script text-2xl mb-3" style={{ color: ROSE }}>From my hand to your heart</p>
            <h2 className="display text-3xl mb-4">Our story</h2>
            <p className="text-sm mb-4" style={{ color: INK_SOFT }}>
              Mima Creations began as a way of turning fabric, thread, and yarn into something personal —
              pieces made for one person at a time, not a rack. Every saree, dress, kurti, and crochet
              piece is cut and stitched only after we know the person who'll wear it.
            </p>
            <p className="text-sm" style={{ color: INK_SOFT }}>
              Add more of the real story here — how it started, what "your design, our craft" means to you,
              and what customers can expect when they reach out.
            </p>
          </div>
        </section>
      )}

      {view === "feedback" && (
        <section className="px-6 md:px-12 py-14 max-w-5xl mx-auto">
          <h2 className="display text-3xl mb-8 text-center">Happy customers</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} style={{ border: `1px solid ${CREAM_DARK}` }}>
                <PlaceholderImage label="Replace with customer photo" />
                <div className="p-4">
                  <p className="text-sm italic mb-3" style={{ color: INK_SOFT }}>"{t.quote}"</p>
                  <p className="text-xs" style={{ color: SAGE_DARK }}>— {t.name}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {view === "contact" && (
        <section className="px-6 md:px-12 py-14 max-w-md mx-auto text-center">
          <Logo size={90} />
          <h2 className="display text-2xl mt-4 mb-6">Get in touch</h2>
          <div className="flex flex-col gap-4 items-center text-sm">
            <span className="flex items-center gap-2"><InstagramIcon size={16} /> @mimaa_creations2</span>
            <span className="flex items-center gap-2"><Mail size={16} /> hello@mimacreations.com</span>
            <span className="flex items-center gap-2"><MessageCircle size={16} /> WhatsApp — add your number</span>
          </div>
          <button onClick={() => nav("enquiry")} className="btn text-sm px-6 py-3 mt-8" style={{ background: ROSE, color: CREAM }}>
            Start a custom order
          </button>
        </section>
      )}

      <footer className="px-6 md:px-12 py-10 border-t flex flex-col md:flex-row items-center justify-between gap-4" style={{ borderColor: CREAM_DARK }}>
        <div className="flex items-center gap-3">
          <Logo size={40} />
          <span className="script text-lg">Mima Creations</span>
        </div>
        <div className="flex items-center gap-5 text-xs" style={{ color: INK_SOFT }}>
          <span className="flex items-center gap-1"><InstagramIcon size={14} /> @mimaa_creations2</span>
          <span className="flex items-center gap-1"><Mail size={14} /> hello@mimacreations.com</span>
        </div>
      </footer>
    </div>
  );
}