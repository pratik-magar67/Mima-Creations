import React, { useEffect, useState } from "react";
import { ArrowUp, Heart } from "lucide-react";

import logoImg from "../assets/logo.png";

export const CREAM = "#F6F0E3";
export const CREAM_DARK = "#ECE2CC";
export const INK = "#2B2620";
export const INK_SOFT = "#6B6357";
export const SAGE = "#7C9478";
export const SAGE_DARK = "#5F7A5C";
export const SAGE_LIGHT = "#E3EBDE";
export const ROSE = "#AD6E5B";

export const WHATSAPP_NUMBER = "9779824203807";

export const CATEGORIES = [
{
id: "sarees",
name: "Sarees & Blouses",
desc: "Hand-embroidered blouses and draped sarees, fitted to you.",
},
{
id: "dresses",
name: "Dresses & Gowns",
desc: "Custom gowns and dresses for every occasion.",
},
{
id: "kurtis",
name: "Kurtis",
desc: "Everyday and festive kurtis, made to your measurements.",
},
{
id: "crochet",
name: "Crochet",
desc: "Hand-crocheted pieces, stitched one loop at a time.",
},
];

export const TESTIMONIALS = [
{
quote: "Placeholder — swap in a real quote from your Feedback highlight.",
name: "Customer name",
},
{
quote: "Placeholder — swap in a real quote from your Feedback highlight.",
name: "Customer name",
},
{
quote: "Placeholder — swap in a real quote from your Feedback highlight.",
name: "Customer name",
},
];

export function InstagramIcon({
size = 16,
color = "currentColor",
}) {
return (
<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" aria-hidden="true" >
<rect x="2" y="2" width="20" height="20" rx="5" />
<circle cx="12" cy="12" r="4.2" />
<circle cx="17.3" cy="6.7" r="1" fill={color} stroke="none" />
</svg>
);
}

export function Logo({ size = 120 }) {
return (
<img
src={logoImg}
alt="Mima Creations logo"
width={size}
height={size}
style={{
objectFit: "contain",
display: "block",
}}
/>
);
}

export function PlaceholderImage({
label,
tall = false,
fill = false,
}) {
let heightClass = "aspect-square h-auto";

if (fill) {
heightClass = "h-full";
} else if (tall) {
heightClass = "aspect-[4/5] h-auto";
}

const imageClassName =
"w-full " +
heightClass +
" flex flex-col items-center justify-center gap-2 placeholder-fill";

return (
<div
className={imageClassName}
style={{
background: SAGE_LIGHT,
border: "1px solid " + SAGE,
}}
>
<Heart size={22} color={SAGE_DARK} strokeWidth={1.2} />

  <span
    className="text-xs px-4 text-center"
    style={{
      color: INK_SOFT,
    }}
  >
    {label}
  </span>
</div>

);
}

export function FadeImage({
src,
alt,
className = "",
}) {
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
transition:
"opacity var(--dur-base) var(--ease-elegant), filter var(--dur-base) var(--ease-elegant)",
}}
/>
);
}

export function FadeInOnMount({ children, delay = 0, className = "" }) {
const [visible, setVisible] = useState(false);

useEffect(() => {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) {
    setVisible(true);
    return;
  }

  const t = setTimeout(() => setVisible(true), 50);
  return () => clearTimeout(t);
}, []);

return (
  <div
    className={className}
    style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(12px)",
      transition: `opacity var(--dur-slow) var(--ease-elegant) ${delay}s, transform var(--dur-slow) var(--ease-elegant) ${delay}s`,
    }}
  >
    {children}
  </div>
);
}

export function Reveal({
children,
delay = 0,
className = "",
}) {
const ref = React.useRef(null);

const [visible, setVisible] = useState(false);

useEffect(() => {
const prefersReduced =
window.matchMedia(
"(prefers-reduced-motion: reduce)"
).matches;

if (prefersReduced) {
  setVisible(true);
  return;
}

const observer =
  new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    },
    {
      threshold: 0.15,
    }
  );

if (ref.current) {
  observer.observe(ref.current);
}

return () => observer.disconnect();

}, []);

return (
<div
ref={ref}
className={className}
style={{
opacity: visible ? 1 : 0,
transform: visible
? "translateY(0)"
: "translateY(16px)",
transition:
"opacity var(--dur-slow) var(--ease-elegant) " +
delay +
"s, transform var(--dur-slow) var(--ease-elegant) " +
delay +
"s",
}}
>
{children}
</div>
);
}

export function StitchDivider() {
const ref = React.useRef(null);
const [drawn, setDrawn] = useState(false);

useEffect(() => {
const observer =
new IntersectionObserver(
([entry]) => {
if (entry.isIntersecting) {
setDrawn(true);
observer.disconnect();
}
},
{
threshold: 0.5,
}
);

if (ref.current) {
  observer.observe(ref.current);
}

return () => observer.disconnect();

}, []);

return (
<svg
ref={ref}
width="100%"
height="20"
style={{
display: "block",
}}
aria-hidden="true"
>
<line
x1="0"
y1="10"
x2="100%"
y2="10"
stroke={SAGE_DARK}
strokeWidth="1.5"
strokeDasharray="6 8"
strokeDashoffset={drawn ? 0 : 1000}
style={{
transition:
"stroke-dashoffset 1.4s ease",
}}
/>
</svg>
);
}

export function StitchCheck() {
const [drawn, setDrawn] = useState(false);

useEffect(() => {
const timer = setTimeout(() => {
setDrawn(true);
}, 150);

return () => clearTimeout(timer);

}, []);

return (
<svg width="64" height="64" viewBox="0 0 64 64" aria-hidden="true" >
<circle
cx="32"
cy="32"
r="28"
fill="none"
stroke={SAGE}
strokeWidth="1.5"
strokeDasharray="4 6"
strokeDashoffset={drawn ? 0 : 200}
style={{
transition:
"stroke-dashoffset 1s ease",
}}
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
    style={{
      transition:
        "stroke-dashoffset 0.6s ease 0.5s",
    }}
  />
</svg>

);
}

export function ScrollToTopButton({
visible,
}) {
return (
<button
onClick={() =>
window.scrollTo({
top: 0,
behavior: "smooth",
})
}
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
pointerEvents: visible
? "auto"
: "none",
transform: visible
? "translateY(0)"
: "translateY(12px)",
transition:
"opacity 0.3s ease, transform 0.3s ease",
zIndex: 30,
border: "none",
}}
>
<ArrowUp size={18} />
</button>
);
}