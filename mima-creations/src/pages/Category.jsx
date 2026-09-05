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

const PAGE_SIZE = 12;

export default function Category() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const category = CATEGORIES.find((item) => item.id === categoryId);

  function buildQuery(from, to) {
    return supabase
      .from("products")
      .select("*", { count: "exact" })
      .eq("category", categoryId)
      .or("available.is.null,available.eq.true")
      .order("id", { ascending: false })
      .range(from, to);
  }

  async function fetchProducts() {
    setLoading(true);
    setError(false);
    const { data, error: fetchError, count } = await buildQuery(0, PAGE_SIZE - 1);
    if (fetchError) {
      console.error("Could not load category products:", fetchError.message);
      setError(true);
    } else {
      setProducts(data || []);
      setTotalCount(count ?? 0);
      setHasMore((data || []).length === PAGE_SIZE);
    }
    setLoading(false);
  }

  async function loadMore() {
    setLoadingMore(true);
    const from = products.length;
    const { data, error: fetchError } = await buildQuery(from, from + PAGE_SIZE - 1);
    if (fetchError) {
      console.error("Could not load more products:", fetchError.message);
    } else {
      setProducts((current) => [...current, ...(data || [])]);
      setHasMore((data || []).length === PAGE_SIZE);
    }
    setLoadingMore(false);
  }

  useEffect(() => {
    if (category) fetchProducts();
  }, [categoryId, category]);

  if (!category) {
    return (
      <section className="px-6 py-16 max-w-4xl mx-auto text-center">
        <h2 className="display text-3xl mb-4">Category not found</h2>
        <p className="text-sm mb-6" style={{ color: INK_SOFT }}>The category you're looking for doesn't exist.</p>
        <Link to="/shop" className="btn inline-block text-sm px-6 py-3" style={{ background: SAGE_DARK, color: CREAM }}>Browse the shop</Link>
      </section>
    );
  }

  return (
    <section className="px-6 md:px-12 py-14 max-w-6xl mx-auto">
      <nav aria-label="Breadcrumb" className="text-xs mb-6" style={{ color: INK_SOFT }}>
        <Link to="/home" className="hover:underline">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/shop" className="hover:underline">Shop</Link>
        <span className="mx-2">/</span>
        <span style={{ color: INK }}>{category.name}</span>
      </nav>
      <h2 className="display text-3xl mb-1">{category.name}</h2>
      <p className="text-base mb-2 max-w-xl" style={{ color: INK_SOFT }}>{category.desc}</p>
      {!loading && !error && totalCount > 0 && (
        <p className="eyebrow mb-8" style={{ color: INK_SOFT }}>
          {totalCount} {totalCount === 1 ? "piece" : "pieces"}
        </p>
      )}
      {loading ? (
        <LoadingState message="Loading creations..." />
      ) : error ? (
        <ErrorState message="We couldn't load the collection." onRetry={fetchProducts} />
      ) : products.length > 0 ? (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, index) => (
              <Reveal key={product.id} delay={Math.min((index % PAGE_SIZE) * 0.06, 0.3)}>
                <div className="card-hover" style={{ border: `1px solid ${CREAM_DARK}` }}>
                  <Link to={`/product/${product.id}`} aria-label={`View ${product.name}`}>
                    {product.image_url ? <div className="img-zoom-wrap"><FadeImage src={product.image_url} alt={product.name} className="aspect-[4/5] h-auto" /></div> : <div className="img-zoom-wrap"><PlaceholderImage label={product.name} tall /></div>}
                  </Link>
                  <div className="p-4">
                    <Link to={`/product/${product.id}`} className="block">
                      <h3 className="display text-base mb-1">{product.name}</h3>
                      <p className="text-xs mb-3" style={{ color: INK_SOFT }}>{product.price}</p>
                    </Link>
                    <button
                      onClick={() => navigate(`/enquiry?category=${encodeURIComponent(category.id)}&piece=${encodeURIComponent(product.name)}`)}
                      className="btn text-xs px-4 py-2 w-full"
                      style={{ background: SAGE_DARK, color: CREAM }}
                    >
                      Enquire about this piece
                    </button>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          {hasMore && (
            <div className="flex justify-center mt-8">
              <button onClick={loadMore} disabled={loadingMore} className="btn text-sm px-6 py-3" style={{ background: CREAM_DARK, color: INK }}>
                {loadingMore ? "Loading..." : "Load more"}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="py-14 text-center border" style={{ borderColor: CREAM_DARK }}>
          <p className="display text-xl mb-2">No pieces available yet</p>
          <p className="text-sm mb-5" style={{ color: INK_SOFT }}>New pieces for this category will appear here.</p>
          <Link to="/shop" className="btn inline-block text-xs px-4 py-2" style={{ background: SAGE_DARK, color: CREAM }}>View all pieces</Link>
        </div>
      )}
    </section>
  );
}
