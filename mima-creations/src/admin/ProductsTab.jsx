import { CREAM_DARK, INK, INK_SOFT, SAGE_DARK, SAGE_LIGHT } from "./adminTheme";
import { useEffect, useState } from "react";
import { ImageOff, X } from "lucide-react";
import { supabase } from "../supabaseClient";
import Toast from "./Toast";
import ConfirmDialog from "./ConfirmDialog";
import CropModal from "./CropModal";
import { AdminLoadingState, AdminErrorState } from "./AdminStateViews";
import { validateImageFile } from "../imageValidation";

const MAX_PHOTOS = 3;
const CATEGORY_OPTIONS = ["sarees", "dresses", "kurtis", "crochet"];
const emptyForm = { name: "", category: "sarees", price: "", description: "", available: true };

function getStoragePathFromUrl(url) {
  if (!url) return null;
  const marker = "/storage-product-image/";
  const index = url.indexOf(marker);
  return index === -1 ? null : url.slice(index + marker.length);
}

export default function ProductsTab() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [removedExisting, setRemovedExisting] = useState([]);
  const [pendingPhotos, setPendingPhotos] = useState([]);
  const [cropQueue, setCropQueue] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "" });
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null, imageUrls: [] });

  const cropSource = cropQueue[0];
  const keptExisting = existingPhotos.filter((url) => !removedExisting.includes(url));
  const totalPhotoCount = keptExisting.length + pendingPhotos.length;

  useEffect(() => { fetchProducts(); }, []);

  async function fetchProducts() {
    setLoading(true); setFetchError(false);
    const { data, error: fetchErrorResult } = await supabase.from("products").select("*").order("id", { ascending: false });
    if (fetchErrorResult) { console.error("Could not load products:", fetchErrorResult.message); setFetchError(true); }
    else setProducts(data || []);
    setLoading(false);
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleFilesChange(event) {
    const files = Array.from(event.target.files);
    event.target.value = "";
    const remaining = MAX_PHOTOS - totalPhotoCount;
    if (!files.length) return;
    if (remaining <= 0) { setError(`You can add up to ${MAX_PHOTOS} photos.`); return; }
    const validFiles = files.slice(0, remaining).filter((file) => {
      const validationError = validateImageFile(file);
      if (validationError) setError(validationError);
      return !validationError;
    });
    if (files.length > remaining) setError(`Only added ${remaining} photo(s) — the limit is ${MAX_PHOTOS} per product.`);
    setCropQueue((current) => [...current, ...validFiles.map((file) => ({ src: URL.createObjectURL(file), fileName: file.name }))]);
  }

  function handleCropConfirm(croppedFile) {
    const current = cropQueue[0];
    if (!current) return;
    if (current.reCropIndex !== undefined) {
      setPendingPhotos((photos) => photos.map((photo, index) => index === current.reCropIndex ? { file: croppedFile, previewUrl: URL.createObjectURL(croppedFile) } : photo));
    } else if (current.replaceExisting) {
      setRemovedExisting((urls) => [...urls, current.replaceExisting]);
      setPendingPhotos((photos) => [...photos, { file: croppedFile, previewUrl: URL.createObjectURL(croppedFile) }]);
    } else {
      URL.revokeObjectURL(current.src);
      setPendingPhotos((photos) => [...photos, { file: croppedFile, previewUrl: URL.createObjectURL(croppedFile) }]);
    }
    setCropQueue((queue) => queue.slice(1));
  }

  function handleCropCancel() {
    const current = cropQueue[0];
    if (current && current.reCropIndex === undefined && !current.replaceExisting) URL.revokeObjectURL(current.src);
    setCropQueue((queue) => queue.slice(1));
  }

  function showToast(message) { setToast({ visible: true, message }); setTimeout(() => setToast({ visible: false, message: "" }), 2500); }
  function recropPending(index) { setCropQueue((queue) => [...queue, { src: pendingPhotos[index].previewUrl, fileName: pendingPhotos[index].file.name, reCropIndex: index }]); }
  function recropExisting(url) { setCropQueue((queue) => [...queue, { src: url, fileName: url.split("/").pop().split("?")[0] || "cropped.jpg", replaceExisting: url }]); }
  function removePending(index) { setPendingPhotos((photos) => { URL.revokeObjectURL(photos[index].previewUrl); return photos.filter((_, photoIndex) => photoIndex !== index); }); }
  function toggleRemoveExisting(url) { setRemovedExisting((urls) => urls.includes(url) ? urls.filter((item) => item !== url) : [...urls, url]); }

  function startEdit(product) {
    setEditingId(product.id);
    setExistingPhotos(product.image_urls?.length ? product.image_urls : product.image_url ? [product.image_url] : []);
    setRemovedExisting([]); setPendingPhotos([]); setCropQueue([]);
    setForm({ name: product.name, category: product.category, price: product.price, description: product.description || "", available: product.available !== false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() { setEditingId(null); setExistingPhotos([]); setRemovedExisting([]); setPendingPhotos([]); setCropQueue([]); setForm(emptyForm); }

  async function uploadImage(file) {
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}.${file.name.split(".").pop()}`;
    const { error: uploadError } = await supabase.storage.from("storage-product-image").upload(name, file);
    if (uploadError) throw new Error(uploadError.message);
    return supabase.storage.from("storage-product-image").getPublicUrl(name).data.publicUrl;
  }

  async function handleSubmit(event) {
    event.preventDefault(); setSaving(true); setError("");
    try {
      const newUrls = [];
      if (pendingPhotos.length) { setUploading(true); for (const photo of pendingPhotos) newUrls.push(await uploadImage(photo.file)); setUploading(false); }
      const imageUrls = [...keptExisting, ...newUrls].slice(0, MAX_PHOTOS);
      const payload = { ...form, image_urls: imageUrls, image_url: imageUrls[0] || null };
      const result = editingId ? await supabase.from("products").update(payload).eq("id", editingId) : await supabase.from("products").insert([payload]);
      if (result.error) throw new Error(result.error.message);
      for (const url of removedExisting) { const path = getStoragePathFromUrl(url); if (path) await supabase.storage.from("storage-product-image").remove([path]); }
      showToast(editingId ? "Product updated" : "Product added"); cancelEdit(); fetchProducts();
    } catch (submitError) { setError(submitError.message); setUploading(false); }
    setSaving(false);
  }

  async function toggleAvailability(id, available) {
    setProducts((items) => items.map((item) => item.id === id ? { ...item, available } : item));
    const { error: updateError } = await supabase.from("products").update({ available }).eq("id", id);
    if (updateError) fetchProducts(); else showToast(available ? "Marked available" : "Marked unavailable");
  }

  function handleDelete(id, imageUrls) { setConfirmDelete({ open: true, id, imageUrls }); }
  async function confirmDeleteProduct() {
    const { id, imageUrls } = confirmDelete; setConfirmDelete({ open: false, id: null, imageUrls: [] });
    for (const url of imageUrls) { const path = getStoragePathFromUrl(url); if (path) await supabase.storage.from("storage-product-image").remove([path]); }
    const { error: deleteError } = await supabase.from("products").delete().eq("id", id);
    if (deleteError) setError(deleteError.message); else { showToast("Product deleted"); fetchProducts(); }
  }

  return <div>
    <form onSubmit={handleSubmit} className="p-4 sm:p-5 mb-6" style={{ background: "#fff", border: `1px solid ${CREAM_DARK}` }}>
      <h2 className="text-base mb-4" style={{ color: INK, fontFamily: "'Playfair Display', serif" }}>{editingId ? "Edit product" : "Add a new product"}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3"><input required name="name" value={form.name} onChange={handleChange} placeholder="Product name" className="p-2.5 text-sm border" style={{ borderColor: CREAM_DARK }} /><select name="category" value={form.category} onChange={handleChange} className="p-2.5 text-sm border" style={{ borderColor: CREAM_DARK }}>{CATEGORY_OPTIONS.map((category) => <option key={category} value={category}>{category}</option>)}</select></div>
      <input required name="price" value={form.price} onChange={handleChange} placeholder="Price, e.g. From Rs. 3,500" className="w-full p-2.5 text-sm border mb-3" style={{ borderColor: CREAM_DARK }} />
      <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" rows={2} className="w-full p-2.5 text-sm border mb-3" style={{ borderColor: CREAM_DARK }} />
      <label className="flex items-center gap-2 mb-3 text-sm" style={{ color: INK }}><input type="checkbox" checked={form.available !== false} onChange={(event) => setForm((current) => ({ ...current, available: event.target.checked }))} className="w-4 h-4" />Available for enquiries</label>
      <div className="mb-3"><label className="block text-xs mb-1.5" style={{ color: INK_SOFT }}>Product photos ({totalPhotoCount} / {MAX_PHOTOS})</label><input type="file" accept="image/*" multiple onChange={handleFilesChange} disabled={totalPhotoCount >= MAX_PHOTOS} className="text-xs" />{(keptExisting.length || pendingPhotos.length) > 0 && <div className="flex flex-wrap gap-3 mt-3">{keptExisting.map((url) => <div key={url} className="relative"><img src={url} alt="Current" className="w-24 h-24 object-cover" style={{ border: `1px solid ${CREAM_DARK}` }} /><button type="button" onClick={() => toggleRemoveExisting(url)} aria-label="Remove photo" className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center rounded-full" style={{ background: "#B3261E", color: "#fff" }}><X size={12} /></button><button type="button" onClick={() => recropExisting(url)} className="text-[11px] mt-1 underline w-full text-center" style={{ color: INK_SOFT }}>Re-crop</button></div>)}{pendingPhotos.map((photo, index) => <div key={photo.previewUrl} className="relative"><img src={photo.previewUrl} alt="New upload preview" className="w-24 h-24 object-cover" style={{ border: `1px solid ${CREAM_DARK}` }} /><button type="button" onClick={() => removePending(index)} aria-label="Remove photo" className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center rounded-full" style={{ background: "#B3261E", color: "#fff" }}><X size={12} /></button><button type="button" onClick={() => recropPending(index)} className="text-[11px] mt-1 underline w-full text-center" style={{ color: INK_SOFT }}>Re-crop</button></div>)}</div>}<p className="text-[11px] mt-2" style={{ color: INK_SOFT }}>The first photo shown here is used as the cover photo everywhere else on the site.</p></div>
      {error && <p className="text-sm mb-3" style={{ color: "#B3261E" }}>{error}</p>}
      <div className="flex flex-col sm:flex-row gap-2"><button type="submit" disabled={saving} className="px-4 py-2.5 sm:py-2 text-sm w-full sm:w-auto" style={{ background: SAGE_DARK, color: "#fff", border: "none" }}>{uploading ? "Uploading photos..." : saving ? "Saving..." : editingId ? "Save changes" : "Add product"}</button>{editingId && <button type="button" onClick={cancelEdit} className="px-4 py-2.5 sm:py-2 text-sm w-full sm:w-auto" style={{ background: CREAM_DARK, border: "none" }}>Cancel</button>}</div>
    </form>
    {loading ? <AdminLoadingState message="Loading products..." /> : fetchError ? <AdminErrorState message="We couldn't load products." onRetry={fetchProducts} /> : products.length === 0 ? <div className="text-center py-10" style={{ border: `1px solid ${CREAM_DARK}`, background: "#fff" }}><p className="text-sm" style={{ color: INK_SOFT }}>No products yet — add your first one above.</p></div> : <div className="flex flex-col gap-3">{products.map((product) => <div key={product.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 p-4" style={{ background: "#fff", border: `1px solid ${CREAM_DARK}` }}><div className="flex items-center gap-3 min-w-0">{product.image_url ? <img src={product.image_url} alt={product.name} className="w-12 h-12 object-cover shrink-0" /> : <div className="w-12 h-12 flex items-center justify-center shrink-0" style={{ background: SAGE_LIGHT, color: SAGE_DARK }}><ImageOff size={16} /></div>}<div className="min-w-0"><p className="font-medium truncate" style={{ color: INK }}>{product.name}</p><p className="text-sm truncate" style={{ color: INK_SOFT }}>{product.category} &middot; {product.price}</p></div></div><div className="flex flex-wrap gap-2 items-center">{product.available === false && <span className="text-xs px-2 py-1" style={{ background: "#EDEDED", color: INK_SOFT }}>Unavailable</span>}<button onClick={() => toggleAvailability(product.id, product.available === false)} className="text-xs px-3 py-2" style={{ background: CREAM_DARK, color: INK }}>{product.available === false ? "Mark available" : "Mark unavailable"}</button><button onClick={() => startEdit(product)} className="text-xs px-3 py-2" style={{ background: "#ECE2CC", border: "none" }}>Edit</button><button onClick={() => handleDelete(product.id, product.image_urls?.length ? product.image_urls : product.image_url ? [product.image_url] : [])} className="text-xs px-3 py-2" style={{ background: "#B3261E", color: "#fff", border: "none" }}>Delete</button></div></div>)}</div>}
    {cropSource && <CropModal imageSrc={cropSource.src} fileName={cropSource.fileName} onCancel={handleCropCancel} onConfirm={handleCropConfirm} />}<ConfirmDialog open={confirmDelete.open} title="Delete this product?" message="This can't be undone. All of its photos will also be removed." onConfirm={confirmDeleteProduct} onCancel={() => setConfirmDelete({ open: false, id: null, imageUrls: [] })} /><Toast message={toast.message} visible={toast.visible} />
  </div>;
}
