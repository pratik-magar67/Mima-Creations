import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { CREAM_DARK, INK, INK_SOFT, SAGE_DARK, ROSE } from "./adminTheme";

const STATUS_OPTIONS = ["new", "contacted", "done"];

const STATUS_COLORS = {
  new: { bg: "#E3EBDE", text: SAGE_DARK },
  contacted: { bg: "#F3E4DD", text: ROSE },
  done: { bg: "#EDEDED", text: "#6B6357" },
};

export default function EnquiriesTab() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchEnquiries();
  }, []);

  async function fetchEnquiries() {
    setLoading(true);
    const { data, error } = await supabase
      .from("enquiries")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) setError(error.message);
    else setEnquiries(data);
    setLoading(false);
  }

  async function updateStatus(id, newStatus) {
    setEnquiries((current) => current.map((e) => (e.id === id ? { ...e, status: newStatus } : e)));
    const { error } = await supabase.from("enquiries").update({ status: newStatus }).eq("id", id);
    if (error) {
      console.error("Could not update status:", error.message);
      fetchEnquiries();
    }
  }

  const newCount = enquiries.filter((e) => (e.status || "new") === "new").length;

  const filteredEnquiries = statusFilter === "all"
    ? enquiries
    : enquiries.filter((e) => (e.status || "new") === statusFilter);

  if (loading) return <p className="text-sm" style={{ color: INK_SOFT }}>Loading enquiries...</p>;
  if (error) return <p className="text-sm" style={{ color: "#B3261E" }}>Error: {error}</p>;
  if (enquiries.length === 0) return <p className="text-sm" style={{ color: INK_SOFT }}>No enquiries yet.</p>;

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {['all', ...STATUS_OPTIONS].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className="text-xs px-3 py-1.5"
            style={{
              background: statusFilter === s ? SAGE_DARK : "#fff",
              color: statusFilter === s ? "#F6F0E3" : INK_SOFT,
              border: `1px solid ${statusFilter === s ? SAGE_DARK : CREAM_DARK}`,
            }}
          >
            {s === "all" ? "All" : s}
          </button>
        ))}
      </div>
      {filteredEnquiries.length === 0 ? (
        <p className="text-sm" style={{ color: INK_SOFT }}>No {statusFilter} enquiries.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredEnquiries.map((e) => {
        const colors = STATUS_COLORS[e.status] || STATUS_COLORS.new;
        return (
          <div key={e.id} className="p-5" style={{ background: "#fff", border: `1px solid ${CREAM_DARK}` }}>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-2">
              <div>
                <p className="font-medium" style={{ color: INK }}>{e.name}</p>
                <p className="text-sm" style={{ color: INK_SOFT }}>{e.contact}</p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="text-xs px-2 py-1"
                  style={{ background: colors.bg, color: colors.text }}
                >
                  {e.status || "new"}
                </span>
                <select
                  value={e.status || "new"}
                  onChange={(ev) => updateStatus(e.id, ev.target.value)}
                  className="text-xs px-2 py-1 border"
                  style={{ borderColor: CREAM_DARK }}
                >
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <p className="text-sm" style={{ color: INK_SOFT }}>
              <strong style={{ color: INK }}>Category:</strong> {e.category || "—"} &nbsp;·&nbsp;
              <strong style={{ color: INK }}>Budget:</strong> {e.budget || "—"}
            </p>
            {e.notes && <p className="text-sm mt-2" style={{ color: INK }}>{e.notes}</p>}
            <p className="text-xs mt-3" style={{ color: "#A69C8C" }}>
              {new Date(e.created_at).toLocaleString()}
            </p>
          </div>
        );
          })}
        </div>
      )}
    </div>
  );
}