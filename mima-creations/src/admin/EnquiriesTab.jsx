import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { CREAM_DARK, INK, INK_SOFT, SAGE_DARK, ROSE } from "./adminTheme";
import { AdminLoadingState, AdminErrorState } from "./AdminStateViews";
import { normalizeStatus } from "./statusUtils";
import Toast from "./Toast";
import ConfirmDialog from "./ConfirmDialog";

const STATUS_OPTIONS = ["new", "contacted", "in_progress", "completed"];
const PAGE_SIZE = 20;

const STATUS_LABELS = {
  new: "New",
  contacted: "Contacted",
  in_progress: "In progress",
  completed: "Completed",
};

const STATUS_COLORS = {
  new: { bg: "#E3EBDE", text: SAGE_DARK },
  contacted: { bg: "#F3E4DD", text: ROSE },
  in_progress: { bg: "#EFE6D0", text: "#8A6D2F" },
  completed: { bg: "#EDEDED", text: "#6B6357" },
};

const MEASUREMENT_LABELS = {
  bust: "Bust",
  waist: "Waist",
  hips: "Hips",
  shoulder: "Shoulder",
  sleeve: "Sleeve",
  length: "Length",
  height: "Height",
};

function getEnquiryPhotoPath(url) {
  if (!url) return null;
  const marker = "/enquiry-photos/";
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return url.slice(idx + marker.length);
}

export default function EnquiriesTab() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [hasMore, setHasMore] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "" });
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null, imageUrl: null });

  useEffect(() => {
    fetchEnquiries();
  }, []);

  function showToast(message) {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: "" }), 2500);
  }

  async function fetchEnquiries() {
    setLoading(true);
    setError("");
    const { data, error } = await supabase
      .from("enquiries")
      .select("*")
      .order("created_at", { ascending: false })
      .range(0, PAGE_SIZE - 1);

    if (error) setError(error.message);
    else {
      setEnquiries(data);
      setHasMore(data.length === PAGE_SIZE);
    }
    setLoading(false);
  }

  async function loadMore() {
    setLoadingMore(true);
    const from = enquiries.length;
    const to = from + PAGE_SIZE - 1;
    const { data, error } = await supabase
      .from("enquiries")
      .select("*")
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Could not load more enquiries:", error.message);
      showToast("Couldn't load more enquiries");
    } else {
      setEnquiries((current) => [...current, ...data]);
      setHasMore(data.length === PAGE_SIZE);
    }
    setLoadingMore(false);
  }

  async function updateStatus(id, newStatus) {
    setEnquiries((current) => current.map((e) => (e.id === id ? { ...e, status: newStatus } : e)));
    const { error } = await supabase.from("enquiries").update({ status: newStatus }).eq("id", id);
    if (error) {
      console.error("Could not update status:", error.message);
      fetchEnquiries();
    }
  }

  function handleDelete(id, imageUrl) {
    setConfirmDelete({ open: true, id, imageUrl });
  }

  async function confirmDeleteEnquiry() {
    const { id, imageUrl } = confirmDelete;
    setConfirmDelete({ open: false, id: null, imageUrl: null });

    const path = getEnquiryPhotoPath(imageUrl);
    if (path) {
      const { error: storageError } = await supabase.storage.from("enquiry-photos").remove([path]);
      if (storageError) {
        console.error("Could not delete reference photo from storage:", storageError.message);
      }
    }

    const { error } = await supabase.from("enquiries").delete().eq("id", id);
    if (error) {
      console.error("Could not delete enquiry:", error.message);
      showToast("Couldn't delete enquiry");
    } else {
      setEnquiries((current) => current.filter((e) => e.id !== id));
      showToast("Enquiry deleted");
    }
  }

  if (loading) return <AdminLoadingState message="Loading enquiries..." />;
  if (error) return <AdminErrorState message="We couldn't load enquiries." onRetry={fetchEnquiries} />;
  if (enquiries.length === 0) return <p className="text-sm" style={{ color: INK_SOFT }}>No enquiries yet.</p>;

  const filteredEnquiries = statusFilter === "all"
    ? enquiries
    : enquiries.filter((e) => normalizeStatus(e.status) === statusFilter);

  return (
    <div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {["all", ...STATUS_OPTIONS].map((s) => (
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
            {s === "all" ? "All" : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {statusFilter !== "all" && hasMore && (
        <p className="text-xs mb-3" style={{ color: INK_SOFT }}>
          Filtering only what's loaded so far — load more below to see older matches too.
        </p>
      )}

      {filteredEnquiries.length === 0 ? (
        <p className="text-sm" style={{ color: INK_SOFT }}>No enquiries in this stage.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredEnquiries.map((e) => {
            const status = normalizeStatus(e.status);
            const colors = STATUS_COLORS[status];
            return (
              <div key={e.id} className="p-5" style={{ background: "#fff", border: `1px solid ${CREAM_DARK}` }}>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-2">
                  <div>
                    <p className="font-medium" style={{ color: INK }}>{e.name}</p>
                    <p className="text-sm" style={{ color: INK_SOFT }}>{e.contact}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1" style={{ background: colors.bg, color: colors.text }}>
                      {STATUS_LABELS[status]}
                    </span>
                    <select
                      value={status}
                      onChange={(ev) => updateStatus(e.id, ev.target.value)}
                      className="text-xs px-2 py-1 border"
                      style={{ borderColor: CREAM_DARK }}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleDelete(e.id, e.image_url)}
                      className="text-xs px-3 py-1.5"
                      style={{ background: "#fff", color: "#B3261E", border: "1px solid #B3261E" }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p className="text-sm" style={{ color: INK_SOFT }}>
                  <strong style={{ color: INK }}>Category:</strong> {e.category || "—"} &nbsp;·&nbsp;
                  <strong style={{ color: INK }}>Budget:</strong> {e.budget || "—"}
                </p>
                {e.notes && <p className="text-sm mt-2" style={{ color: INK }}>{e.notes}</p>}

                {e.measurements && Object.keys(e.measurements).length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                    {Object.entries(e.measurements).map(([key, value]) => (
                      <span key={key} className="text-xs" style={{ color: INK_SOFT }}>
                        <strong style={{ color: INK }}>{MEASUREMENT_LABELS[key] || key}:</strong> {value}
                      </span>
                    ))}
                  </div>
                )}

                {e.image_url && (
                  <a href={e.image_url} target="_blank" rel="noreferrer" className="mt-3 inline-block">
                    <img
                      src={e.image_url}
                      alt="Reference photo"
                      className="w-20 h-20 object-cover"
                      style={{ border: `1px solid ${CREAM_DARK}` }}
                    />
                  </a>
                )}

                <p className="text-xs mt-3" style={{ color: "#A69C8C" }}>
                  {new Date(e.created_at).toLocaleString()}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center mt-5">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="text-sm px-5 py-2"
            style={{ background: CREAM_DARK, color: INK }}
          >
            {loadingMore ? "Loading..." : "Load more"}
          </button>
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete.open}
        title="Delete this enquiry?"
        message="This can't be undone. The reference photo, if any, will also be removed."
        onConfirm={confirmDeleteEnquiry}
        onCancel={() => setConfirmDelete({ open: false, id: null, imageUrl: null })}
      />
      <Toast message={toast.message} visible={toast.visible} />
    </div>
  );
}
