import { useEffect, useMemo, useState } from "react";
import { Heart, Search } from "lucide-react";
import { Link } from "react-router-dom";

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
} from "../components/SiteComponents";

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] =
    useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] =
    useState("all");

  const [favorites, setFavorites] = useState(() => {
    try {
      const saved =
        localStorage.getItem("mima_favorites");

      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(
        "mima_favorites",
        JSON.stringify(favorites)
      );
    } catch (error) {
      console.error(
        "Could not save favorites:",
        error
      );
    }
  }, [favorites]);

  useEffect(() => {
    async function fetchProducts() {
      setProductsLoading(true);

      const { data, error } = await supabase
        .from("products")
        .select("*");

      if (error) {
        console.error(
          "Could not load products:",
          error.message
        );
      } else {
        setProducts(data || []);
      }

      setProductsLoading(false);
    }

    fetchProducts();
  }, []);

  const filteredPieces = useMemo(() => {
    return products.filter((piece) => {
      const matchesCategory =
        filterCategory === "all" ||
        piece.category === filterCategory;

      const matchesSearch =
        piece.name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

      const isAvailable = piece.available !== false;
      return matchesCategory && matchesSearch && isAvailable;
    });
  }, [
    products,
    searchTerm,
    filterCategory,
  ]);

  function toggleFavorite(pieceName) {
    setFavorites((current) =>
      current.includes(pieceName)
        ? current.filter(
            (name) => name !== pieceName
          )
        : [...current, pieceName]
    );
  }

  function resetFilters() {
    setSearchTerm("");
    setFilterCategory("all");
  }

  return (
    <section className="px-6 md:px-12 py-14 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7">
        <div>
          <h2 className="display text-3xl mb-2">
            Browse the collection
          </h2>

          <p
            className="text-base"
            style={{ color: INK_SOFT }}
          >
            Every piece is made to order, then fitted
            to you.
          </p>
        </div>

        <span
          className="text-xs"
          style={{ color: SAGE_DARK }}
        >
          {favorites.length} saved{" "}
          {favorites.length === 1
            ? "piece"
            : "pieces"}
        </span>
      </div>

      {/* SEARCH / FILTER */}
      <div className="flex flex-col md:flex-row gap-3 mb-8">
        <label
          className="flex items-center gap-2 border px-3 py-2 flex-1"
          style={{
            borderColor: CREAM_DARK,
            background: "#fffaf0",
          }}
        >
          <Search size={16} color={INK_SOFT} />

          <input
            aria-label="Search pieces"
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
            placeholder="Search pieces"
            className="bg-transparent outline-none text-sm w-full"
          />
        </label>

        <select
          aria-label="Filter by category"
          value={filterCategory}
          onChange={(e) =>
            setFilterCategory(e.target.value)
          }
          className="border px-3 py-2 text-sm"
          style={{
            borderColor: CREAM_DARK,
            background: "#fffaf0",
          }}
        >
          <option value="all">
            All categories
          </option>

          {CATEGORIES.map((category) => (
            <option
              key={category.id}
              value={category.id}
            >
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <p
        className="eyebrow mb-4"
        style={{ color: INK_SOFT }}
      >
        {filteredPieces.length}{" "}
        {filteredPieces.length === 1
          ? "piece"
          : "pieces"}{" "}
        found
      </p>

      {productsLoading ? (
        <p
          style={{ color: INK_SOFT }}
          className="text-sm"
        >
          Loading products...
        </p>
      ) : filteredPieces.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPieces.map((piece, index) => (
            <Reveal
              key={piece.id || piece.name}
              delay={Math.min(index * 0.05, 0.3)}
            >
              <div
                className="card-hover"
                style={{
                  border: `1px solid ${CREAM_DARK}`,
                  background: CREAM,
                }}
              >
                <div className="relative">
                  {piece.image_url ? (
                    <FadeImage
                      src={piece.image_url}
                      alt={piece.name}
                      className="aspect-[4/5] h-auto"
                    />
                  ) : (
                    <PlaceholderImage
                      label={piece.name}
                      tall
                    />
                  )}

                  <button
                    onClick={() =>
                      toggleFavorite(piece.name)
                    }
                    aria-label={`${
                      favorites.includes(piece.name)
                        ? "Remove"
                        : "Save"
                    } ${piece.name}`}
                    className="absolute top-3 right-3 p-2"
                    style={{
                      background: CREAM,
                    }}
                  >
                    <Heart
                      size={17}
                      fill={
                        favorites.includes(
                          piece.name
                        )
                          ? ROSE
                          : "none"
                      }
                      color={ROSE}
                      style={{
                        transition:
                          "transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
                        transform:
                          favorites.includes(
                            piece.name
                          )
                            ? "scale(1.15)"
                            : "scale(1)",
                      }}
                    />
                  </button>
                </div>

                <div className="p-4">
                  <p
                    className="eyebrow mb-1"
                    style={{ color: SAGE_DARK }}
                  >
                    {
                      CATEGORIES.find(
                        (category) =>
                          category.id ===
                          piece.category
                      )?.name
                    }
                  </p>

                  <h3 className="display text-base mb-1">
                    {piece.name}
                  </h3>

                  <p
                    className="text-xs mb-3"
                    style={{ color: INK_SOFT }}
                  >
                    {piece.price}
                  </p>

                  <Link
                    to={`/enquiry?category=${encodeURIComponent(
                      piece.category || ""
                    )}&piece=${encodeURIComponent(
                      piece.name || ""
                    )}`}
                    className="btn text-xs px-4 py-2 w-full block text-center"
                    style={{
                      background: SAGE_DARK,
                      color: CREAM,
                    }}
                  >
                    Enquire about this piece
                  </Link>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      ) : (
        <Reveal>
          <div
            className="py-14 text-center border"
            style={{ borderColor: CREAM_DARK }}
          >
            <p className="display text-xl mb-2">
              Nothing found yet
            </p>

            <p
              className="text-sm mb-4"
              style={{ color: INK_SOFT }}
            >
              Try another search or reset your
              filters.
            </p>

            <button
              onClick={resetFilters}
              className="btn text-xs px-4 py-2"
              style={{
                background: SAGE_DARK,
                color: CREAM,
              }}
            >
              Reset filters
            </button>
          </div>
        </Reveal>
      )}
    </section>
  );
}

