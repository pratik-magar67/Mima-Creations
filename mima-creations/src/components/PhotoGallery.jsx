import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CREAM, INK, CREAM_DARK } from "../theme";

export function PhotoCarousel({ images, alt = "", className = "" }) {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef(null);

  if (!images || images.length === 0) return null;

  function goTo(nextIndex) {
    setIndex((nextIndex + images.length) % images.length);
  }

  function handleTouchStart(event) {
    touchStartX.current = event.touches[0].clientX;
  }

  function handleTouchEnd(event) {
    if (touchStartX.current === null) return;
    const delta = event.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) goTo(delta > 0 ? index - 1 : index + 1);
    touchStartX.current = null;
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div
        className="flex h-full transition-transform duration-300 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {images.map((src, photoIndex) => (
          <img
            key={src + photoIndex}
            src={src}
            alt={alt ? `${alt} — photo ${photoIndex + 1}` : `Photo ${photoIndex + 1}`}
            className="w-full h-full object-cover flex-shrink-0"
          />
        ))}
      </div>
      {images.length > 1 && (
        <>
          <button type="button" onClick={() => goTo(index - 1)} aria-label="Previous photo" className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full" style={{ background: CREAM, color: INK, opacity: 0.9 }}>
            <ChevronLeft size={18} />
          </button>
          <button type="button" onClick={() => goTo(index + 1)} aria-label="Next photo" className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full" style={{ background: CREAM, color: INK, opacity: 0.9 }}>
            <ChevronRight size={18} />
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, dotIndex) => (
              <button key={dotIndex} type="button" onClick={() => goTo(dotIndex)} aria-label={`Go to photo ${dotIndex + 1}`} className="w-1.5 h-1.5 rounded-full" style={{ background: dotIndex === index ? INK : CREAM_DARK }} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function ScrollableGallery({ images, alt = "", aspectClass = "aspect-square" }) {
  if (!images || images.length === 0) return null;
  return (
    <div className={`flex overflow-x-auto snap-x snap-mandatory ${aspectClass}`} style={{ scrollbarWidth: "none" }}>
      {images.map((src, index) => (
        <img key={src + index} src={src} alt={alt ? `${alt} — photo ${index + 1}` : `Photo ${index + 1}`} className="w-full h-full object-cover flex-shrink-0 snap-start" />
      ))}
    </div>
  );
}
