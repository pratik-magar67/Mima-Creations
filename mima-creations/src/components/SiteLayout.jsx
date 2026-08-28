import { useEffect, useState } from "react";
import {
Menu,
X,
Mail,
} from "lucide-react";
import {
Link,
useLocation,
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
{
path: "/home",
label: "Home",
},
{
path: "/shop",
label: "Shop",
},
{
path: "/about",
label: "About",
},
{
path: "/feedback",
label: "Feedback",
},
{
path: "/contact",
label: "Contact",
},
];

function isActive(path) {
if (path === "/home") {
return (
location.pathname === "/" ||
location.pathname === "/home"
);
}

return location.pathname.startsWith(path);

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

      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateY(-8px);
        }

        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .mobile-menu-enter {
        animation: slideDown 0.25s ease;
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
        .mobile-menu-enter {
          animation: none;
        }

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

  <header
    className="flex items-center justify-between px-6 md:px-12 py-4 sticky top-0 z-10"
    style={{
      background: CREAM,
      borderBottom:
        "1px solid " +
        (headerScrolled
          ? CREAM_DARK
          : "transparent"),
      boxShadow: headerScrolled
        ? "0 4px 16px rgba(43,38,32,0.06)"
        : "none",
      transition:
        "box-shadow 0.3s ease, border-color 0.3s ease",
    }}
  >
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
      {navLinks.map(
        (link) => (
          <Link
            key={link.path}
            to={link.path}
            className={
              isActive(link.path)
                ? "font-medium"
                : ""
            }
            style={{
              color: isActive(
                link.path
              )
                ? INK
                : INK_SOFT,
            }}
          >
            {link.label}
          </Link>
        )
      )}
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

  {menuOpen && (
    <div
      className="md:hidden flex flex-col px-6 py-4 gap-3 border-b mobile-menu-enter"
      style={{
        background: CREAM,
        borderColor: CREAM_DARK,
      }}
    >
      {navLinks.map(
        (link) => (
          <Link
            key={link.path}
            to={link.path}
            className="text-left text-sm py-1"
            style={{
              color: isActive(
                link.path
              )
                ? INK
                : INK_SOFT,
            }}
            onClick={() =>
              setMenuOpen(false)
            }
          >
            {link.label}
          </Link>
        )
      )}

      <Link
        to="/enquiry"
        onClick={() =>
          setMenuOpen(false)
        }
        className="btn text-sm px-5 py-2 mt-1 w-fit"
        style={{
          background: SAGE_DARK,
          color: CREAM,
        }}
      >
        Enquire
      </Link>
    </div>
  )}

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