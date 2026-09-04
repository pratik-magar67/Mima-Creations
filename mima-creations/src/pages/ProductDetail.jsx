import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
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

export default function ProductDetail() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [related, setRelated] = useState([]);

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

  async function fetchProduct() {
    setLoading(true);
    setNotFound(false);
    setFetchError(false);

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        setNotFound(true);
      } else {
        setFetchError(true);
      }
      setProduct(null);
    } else {
      setProduct(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (productId) fetchProduct();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [productId]);

  useEffect(() => {
    async function fetchRelated() {
      if (!product) return;
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("category", product.category)
        .neq("id", product.id)
        .eq("available", true)
        .limit(3);
      if (!error) setRelated(data || []);
    }
    fetchRelated();
  }, [product]);

  function toggleFavorite(pieceId) {
    setFavorites((current) =>
      current.includes(pieceId)
        ? current.filter((id) => id !== pieceId)
        : [...current, pieceId]
    );
  }

  if (loading) {
    return (
      <section className="px-6 md:px-12 py-14 max-w-6xl mx-auto">
        <LoadingState message="Loading creations..." />
      </section>
    );
  }

  if (fetchError) {
    return (
      <section className="px-6 md:px-12 py-14 max-w-6xl mx-auto">
        <ErrorState
          message="We couldn't load this piece."
          onRetry={fetchProduct}
        />
      </section>
    );
  }

  if (notFound || !product) {
    return (
      <section className="px-6 md:px-12 py-20 max-w-2xl mx-auto text-center">
        <p className="display text-2xl mb-3" style={{ color: INK }}>
          We couldn't find that piece.
        </p>
        <p className="text-sm mb-6" style={{ color: INK_SOFT }}>
          It may have been removed, or the link is incorrect.
        </p>
        <Link
          to="/shop"
          className="btn text-sm px-6 py-3 inline-block"
          style={{ background: SAGE_DARK, color: CREAM }}
        >
          Back to shop
        </Link>
      </section>
    );
  }

  const categoryInfo = CATEGORIES.find((c) => c.id === product.category);
  const isFavorite = favorites.includes(product.id);

  return (
    <section className="px-6 md:px-12 py-12 max-w-6xl mx-auto">
      <nav aria-label="Breadcrumb" className="text-xs mb-6" style={{ color: INK_SOFT }}>
        <Link to="/home" className="hover:underline">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/shop" className="hover:underline">Shop</Link>
        {categoryInfo && (
          <>
            <span className="mx-2">/</span>
            <Link to={`/category/${categoryInfo.id}`} className="hover:underline">
              {categoryInfo.name}
            </Link>
          </>
        )}
        <span className="mx-2">/</span>
        <span style={{ color: INK }}>{product.name}</span>
      </nav>

      <Reveal className="grid md:grid-cols-2 gap-10 items-start">
        <div className="relative">
          <div className="img-zoom-wrap">
            {product.image_url ? (
              <FadeImage src={product.image_url} alt={product.name} className="aspect-[4/5] h-auto" />
            ) : (
              <PlaceholderImage label={product.name} tall />
            )}
          </div>
          <button
            onClick={() => toggleFavorite(product.id)}
            aria-label={`${isFavorite ? "Remove" : "Save"} ${product.name}`}
            className="absolute top-3 right-3 p-2"
            style={{ background: CREAM }}
          >
            <Heart
              size={19}
              fill={isFavorite ? ROSE : "none"}
              color={ROSE}
              style={{
                transition: "transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
                transform: isFavorite ? "scale(1.15)" : "scale(1)",
              }}
            />
          </button>
        </div>

        <div>
          {categoryInfo && (
            <p className="eyebrow mb-2" style={{ color: SAGE_DARK }}>{categoryInfo.name}</p>
          )}
          <h1 className="display text-3xl md:text-4xl mb-3" style={{ color: INK }}>
            {product.name}
          </h1>
          <p className="text-lg mb-6" style={{ color: INK }}>{product.price}</p>

          {product.description && (
            <p className="text-sm mb-8 leading-6" style={{ color: INK_SOFT }}>
              {product.description}
            </p>
          )}

          <Link
            to={`/enquiry?category=${encodeURIComponent(product.category || "")}&piece=${encodeURIComponent(product.name || "")}`}
            className="btn text-sm px-6 py-3 inline-block"
            style={{ background: SAGE_DARK, color: CREAM }}
          >
            Enquire about this piece
          </Link>

          <p className="text-xs mt-4" style={{ color: INK_SOFT }}>
            Made to order · Prepaid only · Every piece fitted to you
          </p>
        </div>
      </Reveal>

      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="display text-xl mb-6" style={{ color: INK }}>You might also like</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {related.map((p) => (
              <Link
                key={p.id}
                to={`/product/${p.id}`}
                className="card-hover block"
                style={{ border: `1px solid ${CREAM_DARK}`, background: CREAM }}
              >
                <div className="img-zoom-wrap">
                  {p.image_url ? (
                    <FadeImage src={p.image_url} alt={p.name} className="aspect-[4/5] h-auto" />
                  ) : (
                    <PlaceholderImage label={p.name} tall />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="display text-base mb-1">{p.name}</h3>
                  <p className="text-xs" style={{ color: INK_SOFT }}>{p.price}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}