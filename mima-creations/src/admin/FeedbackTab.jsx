import { CREAM_DARK, INK, INK_SOFT } from "./adminTheme";
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import Toast from "./Toast";
import ConfirmDialog from "./ConfirmDialog";
import CropModal from "./CropModal";
import { AdminLoadingState, AdminErrorState } from "./AdminStateViews";
import { validateImageFile } from "../imageValidation";

const emptyForm = { customer_name: "", quote: "", image_url: "" };

function getStoragePathFromUrl(url) {
  if (!url) return null;
  const marker = "/storage-feedback-image/";
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return url.slice(idx + marker.length);
}

export default function FeedbackTab() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [cropSource, setCropSource] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "" });
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null, imageUrl: null });

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

  function handleFileChange(e) {
    const file = e.target.files[0] || null;
    e.target.value = "";
    if (!file) return;

    const validationError = validateImageFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setCropSource({ src: objectUrl, fileName: file.name });
  }

  function handleCropConfirm(croppedFile) {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (cropSource) URL.revokeObjectURL(cropSource.src);

    setImageFile(croppedFile);
    setPreviewUrl(URL.createObjectURL(croppedFile));
    setCropSource(null);
  }

  function handleCropCancel() {
    if (cropSource) URL.revokeObjectURL(cropSource.src);
    setCropSource(null);
  }

  function handleCropExisting(url) {
    const fileName = url.split("/").pop().split("?")[0] || "cropped.jpg";
    setCropSource({ src: url, fileName });
  }

  function showToast(message) {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: "" }), 2500);
  }

  function startEdit(item) {
    setEditingId(item.id);
    setImageFile(null);
    setPreviewUrl(null);
    setForm({
      customer_name: item.customer_name,
      quote: item.quote,
      image_url: item.image_url || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setImageFile(null);
    setPreviewUrl(null);
    setForm(emptyForm);
  }

  async function uploadImage() {
    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("storage-feedback-image")
      .upload(fileName, imageFile);

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data } = supabase.storage.from("storage-feedback-image").getPublicUrl(fileName);
    return data.publicUrl;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const finalForm = { ...form };
    const oldImageUrl = editingId ? feedback.find((f) => f.id === editingId)?.image_url : null;

    try {
      if (imageFile) {
        setUploading(true);
        const publicUrl = await uploadImage();
        finalForm.image_url = publicUrl;
        setUploading(false);

        if (oldImageUrl) {
          const oldPath = getStoragePathFromUrl(oldImageUrl);
          if (oldPath) {
            await supabase.storage.from("storage-feedback-image").remove([oldPath]);
          }
        }
      }

      if (editingId) {
        const { error } = await supabase
          .from("feedback")
          .update(finalForm)
          .eq("id", editingId);
        if (error) throw new Error(error.message);
      } else {
        const { error } = await supabase.from("feedback").insert([finalForm]);
        if (error) throw new Error(error.message);
      }

      showToast(editingId ? "Feedback updated" : "Feedback added");
      setEditingId(null);
      setForm(emptyForm);
      setImageFile(null);
      setPreviewUrl(null);
      fetchFeedback();
    } catch (err) {
      setError(err.message);
      setUploading(false);
    }

    setSaving(false);
  }

  function handleDelete(id, imageUrl) {
    setConfirmDelete({ open: true, id, imageUrl });
  }

  async function confirmDeleteFeedback() {
    const { id, imageUrl } = confirmDelete;
    setConfirmDelete({ open: false, id: null, imageUrl: null });

    const path = getStoragePathFromUrl(imageUrl);
    if (path) {
      const { error: storageError } = await supabase.storage
        .from("storage-feedback-image")
        .remove([path]);
      if (storageError) {
        console.error("Could not delete photo from storage:", storageError.message);
      }
    }

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

        <div style={{ marginBottom: "12px" }}>
          <label style={{ display: "block", fontSize: "13px", color: "#6B6357", marginBottom: "6px" }}>
            Customer photo
          </label>
          <input type="file" accept="image/*" onChange={handleFileChange} style={{ fontSize: "13px" }} />
          {previewUrl && (
            <div style={{ marginTop: "8px" }}>
              <img src={previewUrl} alt="Preview" style={{ width: "96px", height: "96px", objectFit: "cover", border: `1px solid ${CREAM_DARK}` }} />
              <p style={{ fontSize: "12px", color: INK_SOFT }}>{imageFile.name}</p>
              <button
                type="button"
                onClick={() => setCropSource({ src: previewUrl, fileName: imageFile.name })}
                className="text-xs px-3 py-1.5 mt-2"
                style={{ background: CREAM_DARK, color: INK, border: "none" }}
              >
                Re-crop
              </button>
            </div>
          )}
          {!previewUrl && form.image_url && (
            <div style={{ marginTop: "8px" }}>
              <img src={form.image_url} alt="Current" style={{ width: "96px", height: "96px", objectFit: "cover", border: `1px solid ${CREAM_DARK}` }} />
              <p style={{ fontSize: "12px", color: INK_SOFT }}>Current photo (upload a new one to replace it)</p>
              <button
                type="button"
                onClick={() => handleCropExisting(form.image_url)}
                className="text-xs px-3 py-1.5 mt-2"
                style={{ background: CREAM_DARK, color: INK, border: "none" }}
              >
                Crop this photo
              </button>
            </div>
          )}
        </div>

        {error && <p style={{ color: "#B3261E", fontSize: "13px", marginBottom: "12px" }}>{error}</p>}

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            type="submit"
            disabled={saving}
            style={{ padding: "8px 16px", background: "#5F7A5C", color: "#fff", border: "none" }}
          >
            {uploading ? "Uploading photo..." : saving ? "Saving..." : editingId ? "Save changes" : "Add feedback"}
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
              className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3"
              style={{ background: "#fff", border: "1px solid #ECE2CC", padding: "14px" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {item.image_url ? (
                  <img src={item.image_url} alt={item.customer_name} style={{ width: "48px", height: "48px", objectFit: "cover" }} />
                ) : (
                  <div style={{ width: "48px", height: "48px", background: "#E3EBDE" }} />
                )}
                <div>
                  <p style={{ fontWeight: 600, color: "#2B2620" }}>{item.customer_name}</p>
                  <p style={{ fontSize: "13px", color: "#6B6357", marginTop: "4px", maxWidth: "400px" }}>
                    "{item.quote}"
                  </p>
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <button
                  onClick={() => startEdit(item)}
                  style={{ padding: "6px 12px", background: "#ECE2CC", border: "none", fontSize: "13px" }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item.id, item.image_url)}
                  style={{ padding: "6px 12px", background: "#B3261E", color: "#fff", border: "none", fontSize: "13px" }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {cropSource && (
        <CropModal
          imageSrc={cropSource.src}
          fileName={cropSource.fileName}
          onCancel={handleCropCancel}
          onConfirm={handleCropConfirm}
        />
      )}
      <ConfirmDialog
        open={confirmDelete.open}
        title="Delete this feedback?"
        message="This can't be undone. The photo will also be removed."
        onConfirm={confirmDeleteFeedback}
        onCancel={() => setConfirmDelete({ open: false, id: null, imageUrl: null })}
      />
      <Toast message={toast.message} visible={toast.visible} />
    </div>
  );
}
