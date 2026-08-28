import { CREAM_DARK, INK, INK_SOFT, SAGE_DARK, SAGE_LIGHT } from "./adminTheme";
import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import Toast from "./Toast";
import ConfirmDialog from "./ConfirmDialog";
import CropModal from "./CropModal";

const CATEGORY_OPTIONS = ["sarees", "dresses", "kurtis", "crochet"];

const emptyForm = { name: "", category: "sarees", price: "", description: "", image_url: "" };

function getStoragePathFromUrl(url) {
  if (!url) return null;
  const marker = "/storage-product-image/";
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return url.slice(idx + marker.length);
}

export default function ProductsTab() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
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
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: false });

    if (error) setError(error.message);
    else setProducts(data);
    setLoading(false);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function handleFileChange(e) {
    const file = e.target.files[0] || null;
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setCropSource({ src: objectUrl, fileName: file.name });
    e.target.value = "";
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

  function showToast(message) {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: "" }), 2500);
  }

  function startEdit(product) {
    setEditingId(product.id);
    setImageFile(null);
    setPreviewUrl(null);
    setForm({
      name: product.name,
      category: product.category,
      price: product.price,
      description: product.description || "",
      image_url: product.image_url || "",
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
      .from("storage-product-image")
      .upload(fileName, imageFile);

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data } = supabase.storage.from("storage-product-image").getPublicUrl(fileName);
    return data.publicUrl;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    let finalForm = { ...form };
    const oldImageUrl = editingId ? products.find((p) => p.id === editingId)?.image_url : null;

    try {
      if (imageFile) {
        setUploading(true);
        const publicUrl = await uploadImage();
        finalForm.image_url = publicUrl;
        setUploading(false);

        if (oldImageUrl) {
          const oldPath = getStoragePathFromUrl(oldImageUrl);
          if (oldPath) {
            await supabase.storage.from("storage-product-image").remove([oldPath]);
          }
        }
      }

      if (editingId) {
        const { error } = await supabase.from("products").update(finalForm).eq("id", editingId);
        if (error) throw new Error(error.message);
      } else {
        const { error } = await supabase.from("products").insert([finalForm]);
        if (error) throw new Error(error.message);
      }

      showToast(editingId ? "Product updated" : "Product added");
      setEditingId(null);
      setForm(emptyForm);
      setImageFile(null);
      setPreviewUrl(null);
      fetchProducts();
    } catch (err) {
      setError(err.message);
      setUploading(false);
    }

    setSaving(false);
  }

  function handleDelete(id, imageUrl) {
    setConfirmDelete({ open: true, id, imageUrl });
  }

  async function confirmDeleteProduct() {
    const { id, imageUrl } = confirmDelete;
    setConfirmDelete({ open: false, id: null, imageUrl: null });

    const path = getStoragePathFromUrl(imageUrl);
    if (path) {
      const { error: storageError } = await supabase.storage
        .from("storage-product-image")
        .remove([path]);
      if (storageError) {
        console.error("Could not delete photo from storage:", storageError.message);
      }
    }

    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) setError(error.message);
    else {
      showToast("Product deleted");
      fetchProducts();
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} style={{ background: "#fff", border: "1px solid #ECE2CC", padding: "20px", marginBottom: "24px" }}>
        <h2 style={{ fontSize: "16px", marginBottom: "16px", color: "#2B2620" }}>
          {editingId ? "Edit product" : "Add a new product"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <input required name="name" value={form.name} onChange={handleChange} placeholder="Product name" style={{ padding: "8px", border: "1px solid #ccc" }} />
          <select name="category" value={form.category} onChange={handleChange} style={{ padding: "8px", border: "1px solid #ccc" }}>
            {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: "12px" }}>
          <input required name="price" value={form.price} onChange={handleChange} placeholder="Price, e.g. From Rs. 3,500" style={{ width: "100%", padding: "8px", border: "1px solid #ccc" }} />
        </div>
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" rows={2} style={{ width: "100%", padding: "8px", border: "1px solid #ccc", marginBottom: "12px" }} />

        <div style={{ marginBottom: "12px" }}>
          <label style={{ display: "block", fontSize: "13px", color: "#6B6357", marginBottom: "6px" }}>
            Product photo
          </label>
          <input type="file" accept="image/*" onChange={handleFileChange} style={{ fontSize: "13px" }} />
          {previewUrl && (
            <div style={{ marginTop: "8px" }}>
              <img src={previewUrl} alt="Preview" style={{ width: "96px", height: "96px", objectFit: "cover", border: `1px solid ${CREAM_DARK}` }} />
              <p style={{ fontSize: "12px", color: INK_SOFT }}>{imageFile.name}</p>
            </div>
          )}
          {!previewUrl && form.image_url && (
            <div style={{ marginTop: "8px" }}>
              <img src={form.image_url} alt="Current" style={{ width: "96px", height: "96px", objectFit: "cover", border: `1px solid ${CREAM_DARK}` }} />
              <p style={{ fontSize: "12px", color: INK_SOFT }}>Current photo (upload a new one to replace it)</p>
            </div>
          )}
        </div>

        {error && <p style={{ color: "#B3261E", fontSize: "13px", marginBottom: "12px" }}>{error}</p>}

        <div style={{ display: "flex", gap: "8px" }}>
          <button type="submit" disabled={saving} style={{ padding: "8px 16px", background: "#5F7A5C", color: "#fff", border: "none" }}>
            {uploading ? "Uploading photo..." : saving ? "Saving..." : editingId ? "Save changes" : "Add product"}
          </button>
          {editingId && (
            <button type="button" onClick={cancelEdit} style={{ padding: "8px 16px", background: "#ECE2CC", border: "none" }}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {loading && <p style={{ color: "#6B6357" }}>Loading products...</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {products.map((p) => (
          <div key={p.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3" style={{ background: "#fff", border: "1px solid #ECE2CC", padding: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {p.image_url ? (
                <img src={p.image_url} alt={p.name} style={{ width: "48px", height: "48px", objectFit: "cover" }} />
              ) : (
                <div style={{ width: "48px", height: "48px", background: "#E3EBDE" }} />
              )}
              <div>
                <p style={{ fontWeight: 600, color: "#2B2620" }}>{p.name}</p>
                <p style={{ fontSize: "13px", color: "#6B6357" }}>{p.category} · {p.price}</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => startEdit(p)} style={{ padding: "6px 12px", background: "#ECE2CC", border: "none", fontSize: "13px" }}>Edit</button>
              <button onClick={() => handleDelete(p.id, p.image_url)} style={{ padding: "6px 12px", background: "#B3261E", color: "#fff", border: "none", fontSize: "13px" }}>Delete</button>
            </div>
          </div>
        ))}
      </div>
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
        title="Delete this product?"
        message="This can't be undone. The photo will also be removed."
        onConfirm={confirmDeleteProduct}
        onCancel={() => setConfirmDelete({ open: false, id: null, imageUrl: null })}
      />
      <Toast message={toast.message} visible={toast.visible} />
    </div>
  );
}