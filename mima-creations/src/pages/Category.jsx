import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { supabase } from "../supabaseClient";

import {
  CREAM,
  CREAM_DARK,
  INK,
  INK_SOFT,
  SAGE_DARK,
  CATEGORIES,
  FadeImage,
  PlaceholderImage,
  Reveal,
  LoadingState,
  ErrorState,
} from "../components/SiteComponents";

export default function Category() {
  const { categoryId } = useParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const category = CATEGORIES.find(
    (item) => item.id === categoryId
  );

  async function fetchProducts() {
    setLoading(true);
    setError(false);

    const { data, error: fetchError } = await supabase
      .from("products")
      .select("*")
      .eq("category", categoryId);

    if (fetchError) {
      console.error("Could not load category products:", fetchError.message);
      setError(true);
    } else {
      setProducts(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    if (category) {
      fetchProducts();
    }
  }, [categoryId, category]);

  if (!category) {
    return (
      <section className="px-6 py-16 max-w-4xl mx-auto text-center">
        <h2 className="display text-3xl mb-4">
          Category not found
        </h2>

        <p
          className="text-sm mb-6"
          style={{ color: INK_SOFT }}
        >
          The category you're looking for doesn't
          exist.
        </p>

        <Link
          to="/shop"
          className="btn inline-block text-sm px-6 py-3"
          style={{
            background: SAGE_DARK,
            color: CREAM,
          }}
        >
          Browse the shop
        </Link>
      </section>
    );
  }

  return (
    <section className="px-6 md:px-12 py-14 max-w-6xl mx-auto">
      {/* BREADCRUMB */}
      <nav
        aria-label="Breadcrumb"
        className="text-xs mb-6"
        style={{ color: INK_SOFT }}
      >
        <Link
          to="/home"
          className="hover:underline"
        >
          Home
        </Link>

        <span className="mx-2">/</span>

        <Link
          to="/shop"
          className="hover:underline"
        >
          Shop
        </Link>

        <span className="mx-2">/</span>

        <span style={{ color: INK }}>
          {category.name}
        </span>
      </nav>

      <h2 className="display text-3xl mb-1">
        {category.name}
      </h2>

      <p
        className="text-base mb-10 max-w-xl"
        style={{ color: INK_SOFT }}
      >
        {category.desc}
      </p>

      {loading ? (
        <LoadingState message="Loading creations..." />
      ) : error ? (
        <ErrorState
          message="We couldn't load the collection."
          onRetry={fetchProducts}
        />
      ) : products.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.filter((p) => p.available !== false).map((product, index) => (
            <Reveal
              key={product.id || product.name}
              delay={Math.min(index * 0.06, 0.3)}
            >
              <div
                className="card-hover"
                style={{
                  border: `1px solid ${CREAM_DARK}`,
                }}
              >
                <Link to={`/product/${product.id}`} aria-label={`View ${product.name}`}>
                  {product.image_url ? (
                    <div className="img-zoom-wrap">
                      <FadeImage
                        src={product.image_url}
                        alt={product.name}
                        className="aspect-[4/5] h-auto"
                      />
                    </div>
                  ) : (
                    <div className="img-zoom-wrap">
                      <PlaceholderImage
                        label={product.name}
                        tall
                      />
                    </div>
                  )}
                </Link>

                <div className="p-4">
                  <Link to={`/product/${product.id}`} className="block">
                    <h3 className="display text-base mb-1">
                      {product.name}
                    </h3>

                    <p
                      className="text-xs mb-3"
                      style={{ color: INK_SOFT }}
                    >
                      {product.price}
                    </p>
                  </Link>

                  <button
                    onClick={() =>
                      navigate(
                        `/enquiry?category=${encodeURIComponent(
                          category.id
                        )}&piece=${encodeURIComponent(
                          product.name
                        )}`
                      )
                    }
                    className="btn text-xs px-4 py-2 w-full"
                    style={{
                      background: SAGE_DARK,
                      color: CREAM,
                    }}
                  >
                    Enquire about this piece
                  </button>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      ) : (
        <div
          className="py-14 text-center border"
          style={{
            borderColor: CREAM_DARK,
          }}
        >
          <p className="display text-xl mb-2">
            No pieces available yet
          </p>

          <p
            className="text-sm mb-5"
            style={{ color: INK_SOFT }}
          >
            New pieces for this category will appear
            here.
          </p>

          <Link
            to="/shop"
            className="btn inline-block text-xs px-4 py-2"
            style={{
              background: SAGE_DARK,
              color: CREAM,
            }}
          >
            View all pieces
          </Link>
        </div>
      )}
    </section>
  );
}
