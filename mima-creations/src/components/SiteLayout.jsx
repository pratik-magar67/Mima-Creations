import { useEffect, useState } from "react";
import {
Menu,
X,
Mail,
} from "lucide-react";
import {
Link,
useLocation,
useNavigate,
} from "react-router-dom";

import {
CREAM,
CREAM_DARK,
INK,
INK_SOFT,
SAGE_DARK,
ROSE,
Logo,
InstagramIcon,
StitchDivider,
ScrollToTopButton,
} from "./SiteComponents";

export default function SiteLayout({ children }) {
const location = useLocation();
const navigate = useNavigate();

const [menuOpen, setMenuOpen] = useState(false);
const [scrolled, setScrolled] = useState(false);
const [headerScrolled, setHeaderScrolled] =
useState(false);

useEffect(() => {
setMenuOpen(false);

window.scrollTo({
  top: 0,
  behavior: "smooth",
});

}, [location.pathname, location.search]);

useEffect(() => {
function handleScroll() {
setScrolled(window.scrollY > 480);
setHeaderScrolled(window.scrollY > 12);
}

window.addEventListener(
  "scroll",
  handleScroll
);

handleScroll();

return () => {
  window.removeEventListener(
    "scroll",
    handleScroll
  );
};

}, []);

const navLinks = [
["home", "Home"],
["shop", "Shop"],
["about", "About"],
["feedback", "Feedback"],
["contact", "Contact"],
];

const mobileNavLinks = [...navLinks, ["enquiry", "Enquiry"]];

function nav(id) {
const path = id === "home" ? "/home" : `/${id}`;
setMenuOpen(false);
navigate(path);
}

function isActive(path) {
const target = path === "home" ? "/home" : `/${path}`;
if (path === "home") {
return (
location.pathname === "/" ||
location.pathname === "/home"
);
}

return location.pathname.startsWith(target);

}

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
<style>
{`
@import url('https://fonts.googleapis.com/css2?family=Parisienne&family=Playfair+Display:ital,wght@0,500;0,600;1,500&family=Jost:wght@400;500;600&display=swap');

      .script {
        font-family: 'Parisienne', cursive;
      }

      .display {
        font-family: 'Playfair Display', serif;
        color: #2B2620;
      }

      .eyebrow {
        text-transform: uppercase;
        letter-spacing: 0.12em;
        font-size: 0.6875rem;
      }

      .btn {
        transition:
          transform 0.15s ease,
          opacity 0.15s ease;
      }

      .btn:hover {
        transform: translateY(-1px);
        opacity: 0.92;
      }

      .card-hover {
        transition:
          transform 0.25s ease,
          box-shadow 0.25s ease;
      }

      .card-hover:hover {
        transform: translateY(-4px);
        box-shadow:
          0 10px 24px rgba(43, 38, 32, 0.08);
      }

      .mobile-menu-panel {
        display: grid;
        grid-template-rows: 0fr;
        transition: grid-template-rows 0.35s ease;
        overflow: hidden;
        border-bottom: 1px solid transparent;
      }
      .mobile-menu-panel.open {
        grid-template-rows: 1fr;
        border-bottom: 1px solid ${CREAM_DARK};
      }
      .mobile-menu-panel-inner {
        min-height: 0;
        overflow: hidden;
      }
      .mobile-nav-link {
        opacity: 0;
        transform: translateY(-6px);
        transition: opacity 0.3s ease, transform 0.3s ease;
      }
      .mobile-menu-panel.open .mobile-nav-link {
        opacity: 1;
        transform: translateY(0);
      }
      @media (min-width: 768px) {
        .scroll-top-btn {
          bottom: 24px !important;
        }
      }

      .fabric-texture {
        background-image:
          repeating-linear-gradient(
            45deg,
            rgba(43, 38, 32, 0.025) 0,
            rgba(43, 38, 32, 0.025) 1px,
            transparent 1px,
            transparent 7px
          ),
          repeating-linear-gradient(
            -45deg,
            rgba(43, 38, 32, 0.025) 0,
            rgba(43, 38, 32, 0.025) 1px,
            transparent 1px,
            transparent 7px
          );
      }

      @media (prefers-reduced-motion: reduce) {
        .mobile-menu-panel, .mobile-nav-link { transition: none; }

        .card-hover:hover {
          transform: none;
        }
      }

      input:focus-visible,
      select:focus-visible,
      textarea:focus-visible {
        outline: 2px solid #5F7A5C;
        outline-offset: 2px;
      }

      button:focus-visible,
      a:focus-visible {
        outline: 2px solid #5F7A5C;
        outline-offset: 2px;
      }

      button:focus:not(:focus-visible),
      a:focus:not(:focus-visible) {
        outline: none;
      }
    `}
  </style>

  <div
    className="sticky top-0 z-20"
    style={{
      background: headerScrolled ? "rgba(246, 240, 227, 0.85)" : CREAM,
      backdropFilter: headerScrolled ? "blur(10px)" : "none",
      WebkitBackdropFilter: headerScrolled ? "blur(10px)" : "none",
      borderBottom: `1px solid ${headerScrolled ? "rgba(236, 226, 204, 0.6)" : "transparent"}`,
      boxShadow: headerScrolled ? "0 4px 20px rgba(43,38,32,0.08)" : "none",
      transition: "background 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease",
    }}
  >
    <header className="flex items-center justify-between px-6 md:px-12 py-4">
      <Link
        to="/home"
        className="flex items-center gap-4"
        aria-label="Mima Creations home"
      >
        <Logo size={60} />

        <span
          className="block display text-base sm:text-xl"
          style={{
            color: INK,
            letterSpacing: "0.01em",
          }}
        >
          Mima Creations
        </span>
      </Link>

      <nav
        className="hidden md:flex items-center gap-7 text-sm"
        style={{
          color: INK_SOFT,
        }}
      >
        {navLinks.map(([id, label]) => {
          const path = id === "home" ? "/home" : `/${id}`;
          return (
            <Link
              key={id}
              to={path}
              className={
                isActive(id)
                  ? "font-medium"
                  : ""
              }
              style={{
                color: isActive(id)
                  ? INK
                  : INK_SOFT,
              }}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-3">
        <Link
          to="/enquiry"
          className="btn hidden sm:inline-block text-sm px-5 py-2"
          style={{
            background: SAGE_DARK,
            color: CREAM,
          }}
        >
          Enquire
        </Link>

        <button
          type="button"
          className="md:hidden"
          onClick={() =>
            setMenuOpen(
              (current) =>
                !current
            )
          }
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? (
            <X size={22} />
          ) : (
            <Menu size={22} />
          )}
        </button>
      </div>
    </header>

    <div className={`md:hidden mobile-menu-panel ${menuOpen ? "open" : ""}`}>
      <div className="mobile-menu-panel-inner">
        <div className="flex flex-col px-6 py-4" style={{ background: CREAM }}>
          {mobileNavLinks.map(([id, label], i) => (
            <button
              key={id}
              onClick={() => nav(id)}
              className="mobile-nav-link text-left text-base py-2.5"
              style={{
                color: id === "enquiry" ? ROSE : INK,
                fontWeight: id === "enquiry" ? 600 : 400,
                transitionDelay: menuOpen ? `${i * 0.04}s` : "0s",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  </div>

  <main className="flex-1 pb-20 md:pb-0">
    {children}
  </main>

  <footer
    className="pt-3 pb-24 md:pb-6"
    style={{
      background: CREAM,
    }}
  >
    <div className="max-w-6xl mx-auto px-6">
      <StitchDivider />
    </div>

    <div className="max-w-6xl mx-auto px-6 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
      <Link
        to="/home"
        className="flex items-center gap-3"
      >
        <Logo size={42} />

        <span
          className="script text-lg"
          style={{
            color: INK,
          }}
        >
          Mima Creations
        </span>
      </Link>

      <div
        className="flex flex-wrap justify-center items-center gap-5 text-sm"
        style={{
          color: INK_SOFT,
        }}
      >
        <a
          href="https://instagram.com/mimaa_creations2"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1"
        >
          <InstagramIcon size={14} />
          @mimaa_creations2
        </a>

        <a
          href="mailto:hello@mimacreations.com"
          className="flex items-center gap-1"
        >
          <Mail size={14} />
          hello@mimacreations.com
        </a>
      </div>
    </div>
  </footer>

  {location.pathname !==
    "/enquiry" && (
    <div
      className="md:hidden fixed bottom-0 inset-x-0 z-20 px-4 py-3"
      style={{
        background: CREAM,
        borderTop:
          "1px solid " +
          CREAM_DARK,
      }}
    >
      <Link
        to="/enquiry"
        className="btn block w-full text-sm py-3 text-center"
        style={{
          background: ROSE,
          color: CREAM,
        }}
      >
        Enquire about a custom piece
      </Link>
    </div>
  )}

  <ScrollToTopButton
    visible={scrolled}
  />
</div>

);
}