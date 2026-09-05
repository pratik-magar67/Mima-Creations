import { useEffect, useState } from "react";
import { Heart, Search } from "lucide-react";
import { Link } from "react-router-dom";

import { supabase } from "../supabaseClient";

import {
  CREAM,
  CREAM_DARK,
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

const PAGE_SIZE = 12;
const SEARCH_DEBOUNCE_MS = 350;

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [productsError, setProductsError] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

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
    const timeout = setTimeout(() => setSearchTerm(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  function buildQuery(from, to) {
    let query = supabase
      .from("products")
      .select("*", { count: "exact" })
      .or("available.is.null,available.eq.true")
      .order("id", { ascending: false })
      .range(from, to);

    if (filterCategory !== "all") query = query.eq("category", filterCategory);
    if (searchTerm) query = query.ilike("name", `%${searchTerm}%`);
    return query;
  }

  async function fetchProducts() {
    setProductsLoading(true);
    setProductsError(false);
    const { data, error, count } = await buildQuery(0, PAGE_SIZE - 1);

    if (error) {
      console.error("Could not load products:", error.message);
      setProductsError(true);
    } else {
      setProducts(data || []);
      setTotalCount(count ?? 0);
      setHasMore((data || []).length === PAGE_SIZE);
    }
    setProductsLoading(false);
  }

  async function loadMore() {
    setLoadingMore(true);
    const from = products.length;
    const { data, error } = await buildQuery(from, from + PAGE_SIZE - 1);

    if (error) {
      console.error("Could not load more products:", error.message);
    } else {
      setProducts((current) => [...current, ...(data || [])]);
      setHasMore((data || []).length === PAGE_SIZE);
    }
    setLoadingMore(false);
  }

  useEffect(() => {
    fetchProducts();
  }, [filterCategory, searchTerm]);

  function toggleFavorite(pieceId) {
    setFavorites((current) =>
      current.includes(pieceId) ? current.filter((id) => id !== pieceId) : [...current, pieceId]
    );
  }

  function resetFilters() {
    setSearchInput("");
    setSearchTerm("");
    setFilterCategory("all");
  }

  return (
    <section className="px-6 md:px-12 py-14 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7">
        <div>
          <h2 className="display text-3xl mb-2">Browse the collection</h2>
          <p className="text-base" style={{ color: INK_SOFT }}>
            Every piece is made to order, then fitted to you.
          </p>
        </div>
        <Link to="/favorites" className="text-xs hover:underline" style={{ color: SAGE_DARK }}>
          {favorites.length} saved {favorites.length === 1 ? "piece" : "pieces"}
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-8">
        <label className="flex items-center gap-2 border px-3 py-2 flex-1" style={{ borderColor: CREAM_DARK, background: "#fffaf0" }}>
          <Search size={16} color={INK_SOFT} />
          <input
            aria-label="Search pieces"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
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

      {!productsLoading && !productsError && (
        <p className="eyebrow mb-4" style={{ color: INK_SOFT }}>
          {totalCount} {totalCount === 1 ? "piece" : "pieces"} found
        </p>
      )}

      {productsLoading ? (
        <LoadingState message="Loading creations..." />
      ) : productsError ? (
        <ErrorState message="We couldn't load the collection." onRetry={fetchProducts} />
      ) : products.length > 0 ? (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((piece, index) => (
              <Reveal key={piece.id} delay={Math.min((index % PAGE_SIZE) * 0.05, 0.3)}>
                <div className="card-hover" style={{ border: `1px solid ${CREAM_DARK}`, background: CREAM }}>
                  <div className="relative">
                    <Link to={`/product/${piece.id}`} aria-label={`View ${piece.name}`}>
                      {piece.image_url ? (
                        <div className="img-zoom-wrap"><FadeImage src={piece.image_url} alt={piece.name} className="aspect-[4/5] h-auto" /></div>
                      ) : (
                        <div className="img-zoom-wrap"><PlaceholderImage label={piece.name} tall /></div>
                      )}
                    </Link>
                    <button
                      onClick={() => toggleFavorite(piece.id)}
                      aria-label={`${favorites.includes(piece.id) ? "Remove" : "Save"} ${piece.name}`}
                      className="absolute top-3 right-3 p-2"
                      style={{ background: CREAM }}
                    >
                      <Heart
                        size={17}
                        fill={favorites.includes(piece.id) ? ROSE : "none"}
                        color={ROSE}
                        style={{ transition: "transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)", transform: favorites.includes(piece.id) ? "scale(1.15)" : "scale(1)" }}
                      />
                    </button>
                  </div>
                  <div className="p-4">
                    <Link to={`/product/${piece.id}`} className="block">
                      <p className="eyebrow mb-1" style={{ color: SAGE_DARK }}>
                        {CATEGORIES.find((category) => category.id === piece.category)?.name}
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
          {hasMore && (
            <div className="flex justify-center mt-8">
              <button onClick={loadMore} disabled={loadingMore} className="btn text-sm px-6 py-3" style={{ background: CREAM_DARK, color: "#2B2620" }}>
                {loadingMore ? "Loading..." : "Load more"}
              </button>
            </div>
          )}
        </>
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
  );
}
