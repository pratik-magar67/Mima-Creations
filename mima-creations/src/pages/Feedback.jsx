import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import {
  CREAM,
  CREAM_DARK,
  INK,
  INK_SOFT,
  SAGE_DARK,
  PlaceholderImage,
  Reveal,
  LoadingState,
  ErrorState,
} from "../components/SiteComponents";

export default function Feedback() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchFeedback();
  }, []);

  async function fetchFeedback() {
    setLoading(true);
    setError(false);
    const { data, error: fetchError } = await supabase
      .from("feedback")
      .select("*")
      .order("created_at", { ascending: false });

    if (fetchError) {
      console.error("Could not load feedback:", fetchError.message);
      setError(true);
    } else {
      setFeedback(data || []);
    }
    setLoading(false);
  }

  return (
    <section className="py-12 md:py-14" style={{ background: CREAM }}>
      <Reveal className="max-w-6xl mx-auto px-6">
        <h2 className="display text-3xl md:text-4xl text-center mb-8" style={{ color: INK }}>
          Happy customers
        </h2>

        {loading ? (
          <LoadingState message="Loading feedback..." />
        ) : error ? (
          <ErrorState message="We couldn't load feedback." onRetry={fetchFeedback} />
        ) : feedback.length === 0 ? (
          <div className="py-14 text-center border max-w-2xl mx-auto" style={{ borderColor: CREAM_DARK }}>
            <p className="display text-xl mb-2">No feedback till now</p>
            <p className="text-sm" style={{ color: INK_SOFT }}>
              Check back soon — happy customer stories will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {feedback.map((item) => (
              <div key={item.id} style={{ border: `1px solid ${CREAM_DARK}`, background: "#F8F3E9" }}>
                {item.image_url ? (
                  <img src={item.image_url} alt={item.customer_name} className="w-full aspect-square object-cover" />
                ) : (
                  <PlaceholderImage label="Replace with customer photo" />
                )}
                <div className="p-4">
                  <p className="text-sm italic mb-3 leading-5" style={{ color: INK_SOFT }}>
                    "{item.quote}"
                  </p>
                  <p className="text-xs" style={{ color: SAGE_DARK }}>
                    — {item.customer_name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Reveal>
    </section>
  );
}
