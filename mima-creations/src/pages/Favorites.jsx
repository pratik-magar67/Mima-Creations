import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { supabase } from "../supabaseClient";
import {
  CREAM,
  CREAM_DARK,
  INK,
  INK_SOFT,
  ROSE,
  SAGE_DARK,
  CATEGORIES,
  FadeImage,
  PlaceholderImage,
  Reveal,
  LoadingState,
  ErrorState,
} from "../components/SiteComponents";

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("mima_favorites");
      setFavorites(saved ? JSON.parse(saved) : []);
    } catch {
      setFavorites([]);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    setError(false);
    const { data, error: fetchErr } = await supabase.from("products").select("*");
    if (fetchErr) {
      console.error("Could not load favorites:", fetchErr.message);
      setError(true);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  }

  function removeFavorite(name) {
    const updated = favorites.filter((n) => n !== name);
    setFavorites(updated);
    try {
      localStorage.setItem("mima_favorites", JSON.stringify(updated));
    } catch (e) {
      console.error("Could not save favorites:", e);
    }
  }

  const savedProducts = products.filter((p) => favorites.includes(p.name));

  return (
    <section className="px-6 md:px-12 py-14 max-w-6xl mx-auto">
      <nav aria-label="Breadcrumb" className="text-xs mb-6" style={{ color: INK_SOFT }}>
        <Link to="/home" className="hover:underline">Home</Link>
        <span className="mx-2">/</span>
        <span style={{ color: INK }}>Favorites</span>
      </nav>

      <h1 className="display text-3xl mb-2">Your saved pieces</h1>
      <p className="text-base mb-10" style={{ color: INK_SOFT }}>
        Pieces you've saved while browsing, kept right here.
      </p>

      {loading ? (
        <LoadingState message="Loading your saved pieces..." />
      ) : error ? (
        <ErrorState message="We couldn't load your favorites." onRetry={fetchProducts} />
      ) : savedProducts.length === 0 ? (
        <div className="py-14 text-center border" style={{ borderColor: CREAM_DARK }}>
          <Heart size={22} color={ROSE} strokeWidth={1.2} className="mx-auto mb-3" />
          <p className="display text-xl mb-2">No saved pieces yet</p>
          <p className="text-sm mb-5" style={{ color: INK_SOFT }}>
            Tap the heart on any piece while browsing to save it here.
          </p>
          <Link to="/shop" className="btn inline-block text-sm px-6 py-3" style={{ background: SAGE_DARK, color: CREAM }}>
            Browse the shop
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedProducts.map((piece, index) => (
            <Reveal key={piece.id} delay={Math.min(index * 0.05, 0.3)}>
              <div className="card-hover" style={{ border: `1px solid ${CREAM_DARK}`, background: CREAM }}>
                <div className="relative">
                  <Link to={`/product/${piece.id}`}>
                    {piece.image_url ? (
                      <div className="img-zoom-wrap">
                        <FadeImage src={piece.image_url} alt={piece.name} className="aspect-[4/5] h-auto" />
                      </div>
                    ) : (
                      <div className="img-zoom-wrap">
                        <PlaceholderImage label={piece.name} tall />
                      </div>
                    )}
                  </Link>
                  <button
                    onClick={() => removeFavorite(piece.name)}
                    aria-label={`Remove ${piece.name} from favorites`}
                    className="absolute top-3 right-3 p-2"
                    style={{ background: CREAM }}
                  >
                    <Heart size={17} fill={ROSE} color={ROSE} />
                  </button>
                </div>
                <div className="p-4">
                  <Link to={`/product/${piece.id}`} className="block">
                    <p className="eyebrow mb-1" style={{ color: SAGE_DARK }}>
                      {CATEGORIES.find((c) => c.id === piece.category)?.name}
                    </p>
                    <h3 className="display text-base mb-1">{piece.name}</h3>
                  </Link>
                  <p className="text-xs mb-3" style={{ color: INK_SOFT }}>{piece.price}</p>
                  <Link
                    to={`/enquiry?category=${encodeURIComponent(piece.category || "")}&piece=${encodeURIComponent(piece.name || "")}`}
                    className="btn text-xs px-4 py-2 w-full block text-center"
                    style={{ background: SAGE_DARK, color: CREAM }}
                  >
                    Enquire about this piece
                  </Link>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}