import { CREAM_DARK, INK, INK_SOFT, SAGE_DARK, SAGE_LIGHT } from "./adminTheme";
import React, { useState, useEffect } from "react";
import { ImageOff } from "lucide-react";
import { supabase } from "../supabaseClient";
import Toast from "./Toast";
import ConfirmDialog from "./ConfirmDialog";
import CropModal from "./CropModal";
import { AdminLoadingState, AdminErrorState } from "./AdminStateViews";
import { validateImageFile } from "../imageValidation";

const CATEGORY_OPTIONS = ["sarees", "dresses", "kurtis", "crochet"];
const emptyForm = { name: "", category: "sarees", price: "", description: "", image_url: "", available: true };

function getStoragePathFromUrl(url) {
  if (!url) return null;
  const marker = "/storage-product-image/";
  const idx = url.indexOf(marker);
  return idx === -1 ? null : url.slice(idx + marker.length);
}

export default function ProductsTab() {
  const [products, setProducts] = useState([]);
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

  useEffect(() => { fetchProducts(); }, []);
  async function fetchProducts() {
    setLoading(true); setFetchError(false);
    const { data, error } = await supabase.from("products").select("*").order("id", { ascending: false });
    if (error) { console.error("Could not load products:", error.message); setFetchError(true); } else setProducts(data);
    setLoading(false);
  }
  function handleChange(e) { const { name, value } = e.target; setForm((f) => ({ ...f, [name]: value })); }
  function handleFileChange(e) {
    const file = e.target.files[0] || null; e.target.value = ""; if (!file) return;
    const validationError = validateImageFile(file);
    if (validationError) { setError(validationError); return; }
    setCropSource({ src: URL.createObjectURL(file), fileName: file.name });
  }
  function handleCropConfirm(croppedFile) {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (cropSource) URL.revokeObjectURL(cropSource.src);
    setImageFile(croppedFile); setPreviewUrl(URL.createObjectURL(croppedFile)); setCropSource(null);
  }
  function handleCropCancel() { if (cropSource) URL.revokeObjectURL(cropSource.src); setCropSource(null); }
  function handleCropExisting(url) { setCropSource({ src: url, fileName: url.split("/").pop().split("?")[0] || "cropped.jpg" }); }
  function showToast(message) { setToast({ visible: true, message }); setTimeout(() => setToast({ visible: false, message: "" }), 2500); }
  function startEdit(product) {
    setEditingId(product.id); setImageFile(null); setPreviewUrl(null);
    setForm({ name: product.name, category: product.category, price: product.price, description: product.description || "", image_url: product.image_url || "", available: product.available !== false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function cancelEdit() { setEditingId(null); setImageFile(null); setPreviewUrl(null); setForm(emptyForm); }
  async function uploadImage() {
    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from("storage-product-image").upload(fileName, imageFile);
    if (uploadError) throw new Error(uploadError.message);
    return supabase.storage.from("storage-product-image").getPublicUrl(fileName).data.publicUrl;
  }
  async function handleSubmit(e) {
    e.preventDefault(); setSaving(true); setError("");
    let finalForm = { ...form };
    const oldImageUrl = editingId ? products.find((p) => p.id === editingId)?.image_url : null;
    try {
      if (imageFile) {
        setUploading(true); finalForm.image_url = await uploadImage(); setUploading(false);
        const oldPath = getStoragePathFromUrl(oldImageUrl);
        if (oldPath) await supabase.storage.from("storage-product-image").remove([oldPath]);
      }
      const result = editingId ? await supabase.from("products").update(finalForm).eq("id", editingId) : await supabase.from("products").insert([finalForm]);
      if (result.error) throw new Error(result.error.message);
      showToast(editingId ? "Product updated" : "Product added"); setEditingId(null); setForm(emptyForm); setImageFile(null); setPreviewUrl(null); fetchProducts();
    } catch (err) { setError(err.message); setUploading(false); }
    setSaving(false);
  }
  async function toggleAvailability(id, available) {
    setProducts((current) => current.map((p) => p.id === id ? { ...p, available } : p));
    const { error } = await supabase.from("products").update({ available }).eq("id", id);
    if (error) { console.error("Could not update availability:", error.message); fetchProducts(); } else showToast(available ? "Marked available" : "Marked unavailable");
  }
  function handleDelete(id, imageUrl) { setConfirmDelete({ open: true, id, imageUrl }); }
  async function confirmDeleteProduct() {
    const { id, imageUrl } = confirmDelete; setConfirmDelete({ open: false, id: null, imageUrl: null });
    const path = getStoragePathFromUrl(imageUrl);
    if (path) { const { error: storageError } = await supabase.storage.from("storage-product-image").remove([path]); if (storageError) console.error("Could not delete photo from storage:", storageError.message); }
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) setError(error.message); else { showToast("Product deleted"); fetchProducts(); }
  }

  return <div>
    <form onSubmit={handleSubmit} className="p-4 sm:p-5 mb-6" style={{ background: "#fff", border: `1px solid ${CREAM_DARK}` }}>
      <h2 className="text-base mb-4" style={{ color: INK, fontFamily: "'Playfair Display', serif" }}>{editingId ? "Edit product" : "Add a new product"}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3"><input required name="name" value={form.name} onChange={handleChange} placeholder="Product name" className="p-2.5 text-sm border" style={{ borderColor: CREAM_DARK }} /><select name="category" value={form.category} onChange={handleChange} className="p-2.5 text-sm border" style={{ borderColor: CREAM_DARK }}>{CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
      <div className="mb-3"><input required name="price" value={form.price} onChange={handleChange} placeholder="Price, e.g. From Rs. 3,500" className="w-full p-2.5 text-sm border" style={{ borderColor: CREAM_DARK }} /></div>
      <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" rows={2} className="w-full p-2.5 text-sm border mb-3" style={{ borderColor: CREAM_DARK }} />
      <label className="flex items-center gap-2 mb-3 text-sm" style={{ color: INK }}><input type="checkbox" checked={form.available !== false} onChange={(e) => setForm((f) => ({ ...f, available: e.target.checked }))} className="w-4 h-4" />Available for enquiries</label>
      <div className="mb-3"><label className="block text-xs mb-1.5" style={{ color: INK_SOFT }}>Product photo</label><input type="file" accept="image/*" onChange={handleFileChange} className="text-xs" />{previewUrl && <div className="mt-2"><img src={previewUrl} alt="Preview" className="w-24 h-24 object-cover" style={{ border: `1px solid ${CREAM_DARK}` }} /><p className="text-xs mt-1" style={{ color: INK_SOFT }}>{imageFile.name}</p><button type="button" onClick={() => setCropSource({ src: previewUrl, fileName: imageFile.name })} className="text-xs px-3 py-1.5 mt-2" style={{ background: CREAM_DARK, color: INK, border: "none" }}>Re-crop</button></div>}{!previewUrl && form.image_url && <div className="mt-2"><img src={form.image_url} alt="Current" className="w-24 h-24 object-cover" style={{ border: `1px solid ${CREAM_DARK}` }} /><p className="text-xs mt-1" style={{ color: INK_SOFT }}>Current photo (upload a new one to replace it)</p><button type="button" onClick={() => handleCropExisting(form.image_url)} className="text-xs px-3 py-1.5 mt-2" style={{ background: CREAM_DARK, color: INK, border: "none" }}>Crop this photo</button></div>}</div>
      {error && <p className="text-sm mb-3" style={{ color: "#B3261E" }}>{error}</p>}
      <div className="flex flex-col sm:flex-row gap-2"><button type="submit" disabled={saving} className="px-4 py-2.5 sm:py-2 text-sm w-full sm:w-auto" style={{ background: SAGE_DARK, color: "#fff", border: "none" }}>{uploading ? "Uploading photo..." : saving ? "Saving..." : editingId ? "Save changes" : "Add product"}</button>{editingId && <button type="button" onClick={cancelEdit} className="px-4 py-2.5 sm:py-2 text-sm w-full sm:w-auto" style={{ background: CREAM_DARK, border: "none" }}>Cancel</button>}</div>
    </form>
    {loading ? <AdminLoadingState message="Loading products..." /> : fetchError ? <AdminErrorState message="We couldn't load products." onRetry={fetchProducts} /> : products.length === 0 ? <div className="text-center py-10" style={{ border: `1px solid ${CREAM_DARK}`, background: "#fff" }}><p className="text-sm" style={{ color: INK_SOFT }}>No products yet — add your first one above.</p></div> : <div className="flex flex-col gap-3">{products.map((p) => <div key={p.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 p-4" style={{ background: "#fff", border: `1px solid ${CREAM_DARK}` }}><div className="flex items-center gap-3 min-w-0">{p.image_url ? <img src={p.image_url} alt={p.name} className="w-12 h-12 object-cover shrink-0" /> : <div className="w-12 h-12 flex items-center justify-center shrink-0" style={{ background: SAGE_LIGHT, color: SAGE_DARK }}><ImageOff size={16} /></div>}<div className="min-w-0"><p className="font-medium truncate" style={{ color: INK }}>{p.name}</p><p className="text-sm truncate" style={{ color: INK_SOFT }}>{p.category} &middot; {p.price}</p></div></div><div className="flex flex-wrap gap-2 items-center">{p.available === false && <span className="text-xs px-2 py-1" style={{ background: "#EDEDED", color: INK_SOFT }}>Unavailable</span>}<button onClick={() => toggleAvailability(p.id, p.available === false)} className="text-xs px-3 py-2" style={{ background: CREAM_DARK, color: INK }}>{p.available === false ? "Mark available" : "Mark unavailable"}</button><button onClick={() => startEdit(p)} className="text-xs px-3 py-2" style={{ background: "#ECE2CC", border: "none" }}>Edit</button><button onClick={() => handleDelete(p.id, p.image_url)} className="text-xs px-3 py-2" style={{ background: "#B3261E", color: "#fff", border: "none" }}>Delete</button></div></div>)}</div>}
    {cropSource && <CropModal imageSrc={cropSource.src} fileName={cropSource.fileName} onCancel={handleCropCancel} onConfirm={handleCropConfirm} />}<ConfirmDialog open={confirmDelete.open} title="Delete this product?" message="This can't be undone. The photo will also be removed." onConfirm={confirmDeleteProduct} onCancel={() => setConfirmDelete({ open: false, id: null, imageUrl: null })} /><Toast message={toast.message} visible={toast.visible} />
  </div>;
}
