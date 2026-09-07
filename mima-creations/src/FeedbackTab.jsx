import { useState, useEffect } from "react";
import { INK_SOFT } from "./adminTheme";
import { supabase } from "./supabaseClient";
import Toast from "./Toast";
import ConfirmDialog from "./ConfirmDialog";
import { AdminLoadingState, AdminErrorState } from "./AdminStateViews";

const emptyForm = { customer_name: "", quote: "" };

export default function FeedbackTab() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "" });
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });

  useEffect(() => {
    fetchFeedback();
  }, []);

  async function fetchFeedback() {
    setLoading(true);
    setFetchError(false);
    const { data, error } = await supabase
      .from("feedback")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Could not load feedback:", error.message);
      setFetchError(true);
    } else {
      setFeedback(data);
    }
    setLoading(false);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function showToast(message) {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: "" }), 2500);
  }

  function startEdit(item) {
    setEditingId(item.id);
    setForm({ customer_name: item.customer_name, quote: item.quote });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (editingId) {
        const { error } = await supabase
          .from("feedback")
          .update(form)
          .eq("id", editingId);
        if (error) throw new Error(error.message);
      } else {
        const { error } = await supabase.from("feedback").insert([form]);
        if (error) throw new Error(error.message);
      }

      showToast(editingId ? "Feedback updated" : "Feedback added");
      setEditingId(null);
      setForm(emptyForm);
      fetchFeedback();
    } catch (err) {
      setError(err.message);
    }

    setSaving(false);
  }

  function handleDelete(id) {
    setConfirmDelete({ open: true, id });
  }

  async function confirmDeleteFeedback() {
    const { id } = confirmDelete;
    setConfirmDelete({ open: false, id: null });

    const { error } = await supabase.from("feedback").delete().eq("id", id);
    if (error) setError(error.message);
    else {
      showToast("Feedback deleted");
      fetchFeedback();
    }
  }

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        style={{ background: "#fff", border: "1px solid #ECE2CC", padding: "20px", marginBottom: "24px" }}
      >
        <h2 style={{ fontSize: "16px", marginBottom: "16px", color: "#2B2620" }}>
          {editingId ? "Edit feedback" : "Add customer feedback"}
        </h2>

        <div style={{ marginBottom: "12px" }}>
          <input
            required
            name="customer_name"
            value={form.customer_name}
            onChange={handleChange}
            placeholder="Customer name"
            style={{ width: "100%", padding: "8px", border: "1px solid #ccc" }}
          />
        </div>

        <textarea
          required
          name="quote"
          value={form.quote}
          onChange={handleChange}
          placeholder="What did they say?"
          rows={3}
          style={{ width: "100%", padding: "8px", border: "1px solid #ccc", marginBottom: "12px" }}
        />

        {error && <p style={{ color: "#B3261E", fontSize: "13px", marginBottom: "12px" }}>{error}</p>}

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            type="submit"
            disabled={saving}
            style={{ padding: "8px 16px", background: "#5F7A5C", color: "#fff", border: "none" }}
          >
            {saving ? "Saving..." : editingId ? "Save changes" : "Add feedback"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              style={{ padding: "8px 16px", background: "#ECE2CC", border: "none" }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <AdminLoadingState message="Loading feedback..." />
      ) : fetchError ? (
        <AdminErrorState message="We couldn't load feedback." onRetry={fetchFeedback} />
      ) : feedback.length === 0 ? (
        <div className="text-center py-10" style={{ border: "1px solid #ECE2CC", background: "#fff" }}>
          <p style={{ color: INK_SOFT, fontSize: "14px" }}>No feedback added yet.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {feedback.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3"
              style={{ background: "#fff", border: "1px solid #ECE2CC", padding: "14px" }}
            >
              <div>
                <p style={{ fontWeight: 600, color: "#2B2620" }}>{item.customer_name}</p>
                <p style={{ fontSize: "13px", color: "#6B6357", marginTop: "4px", maxWidth: "480px" }}>
                  "{item.quote}"
                </p>
              </div>
              <div className="flex gap-2 items-center">
                <button
                  onClick={() => startEdit(item)}
                  style={{ padding: "6px 12px", background: "#ECE2CC", border: "none", fontSize: "13px" }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  style={{ padding: "6px 12px", background: "#B3261E", color: "#fff", border: "none", fontSize: "13px" }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete.open}
        title="Delete this feedback?"
        message="This can't be undone."
        onConfirm={confirmDeleteFeedback}
        onCancel={() => setConfirmDelete({ open: false, id: null })}
      />
      <Toast message={toast.message} visible={toast.visible} />
    </div>
  );
}
