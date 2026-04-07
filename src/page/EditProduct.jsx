import {
  updateProduct,
  deleteProductImage,
  uploadProductImage,
  getCategory,
  getBrand,
  getSubCategory,
  addVariants,
  deleteVariant,
  updateVariant,
} from "@/api/api";
import { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Package, ArrowLeft, ImagePlus, X, Trash2, Plus, Edit2 } from "lucide-react";

// ─── Custom Toast ─────────────────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = (message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  };
  return {
    toasts,
    success: (m) => add(m, "success"),
    error: (m) => add(m, "error"),
    info: (m) => add(m, "info"),
    remove: (id) => setToasts((p) => p.filter((t) => t.id !== id)),
  };
}
const TOAST_META = {
  success: { bg: "var(--background)", color: "var(--foreground)", border: "var(--border)", icon: "✓" },
  error: { bg: "var(--background)", color: "var(--destructive)", border: "var(--border)", icon: "✕" },
  info: { bg: "var(--background)", color: "var(--muted-foreground)", border: "var(--border)", icon: "i" },
};
function ToastStack({ toasts, onRemove }) {
  if (!toasts.length) return null;
  return (
    <div style={s.toastStack}>
      {toasts.map((t) => {
        const m = TOAST_META[t.type] || TOAST_META.info;
        return (
          <div
            key={t.id}
            style={{
              ...s.toast,
              background: m.bg,
              color: m.color,
              borderColor: m.border,
            }}
          >
            <span style={s.toastIcon}>{m.icon}</span>
            <span style={s.toastMsg}>{t.message}</span>
            <button
              onClick={() => onRemove(t.id)}
              style={{ ...s.toastClose, color: m.color }}
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ─── Flag config ──────────────────────────────────────────────────────────────
const FLAGS = [
  { key: "isNew", label: "New", color: "var(--foreground)", bg: "var(--secondary)", border: "var(--border)" },
  { key: "isSale", label: "Sale", color: "var(--foreground)", bg: "var(--secondary)", border: "var(--border)" },
  { key: "isLimited", label: "Limited", color: "var(--foreground)", bg: "var(--secondary)", border: "var(--border)" },
  { key: "isHot", label: "Hot", color: "var(--foreground)", bg: "var(--secondary)", border: "var(--border)" },
  { key: "isFeatured", label: "Featured", color: "var(--foreground)", bg: "var(--secondary)", border: "var(--border)" },
  { key: "isBestSelling", label: "BestSelling", color: "var(--foreground)", bg: "var(--secondary)", border: "var(--border)" },
];

function SectionCard({ title, subtitle, children }) {
  return (
    <div style={s.sectionCard}>
      <div style={s.sectionHeader}>
        <div style={s.sectionTitle}>{title}</div>
        {subtitle && <div style={s.sectionSubtitle}>{subtitle}</div>}
      </div>
      <div style={s.sectionBody}>{children}</div>
    </div>
  );
}

function Field({ label, error, hint, children }) {
  return (
    <div style={s.fieldGroup}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <label style={s.label}>{label}</label>
        {hint && <span style={s.hint}>{hint}</span>}
      </div>
      {children}
      {error && <p style={s.errorMsg}>⚠ {error}</p>}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function EditProduct() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const fileInputRef = useRef(null);

  const product = location.state?.products;

  const updateProductMutate = updateProduct();
  const deleteImageMutate = deleteProductImage();
  const uploadImageMutate = uploadProductImage();
  const addVariantsMutate = addVariants();
  const deleteVariantMutate = deleteVariant();
  const updateVariantMutate = updateVariant();

  const { data: categoryData, isLoading: categoryLoading } = getCategory();
  const { data: brandData, isLoading: brandLoading } = getBrand();
  const { data: subCatData, isLoading: subCatLoading } = getSubCategory();

  const [existingImages, setExistingImages] = useState(product?.image || []);
  const [existingVariants, setExistingVariants] = useState(product?.variants || []);
  const [deletingImgId, setDeletingImgId] = useState(null);
  const [deletingVariantId, setDeletingVariantId] = useState(null);
  const [addingVariant, setAddingVariant] = useState(false);
  const [editingVariantId, setEditingVariantId] = useState(null);
  const [editVForm, setEditVForm] = useState(null);
  const [newFiles, setNewFiles] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);

  const [formData, setFormData] = useState({
    name: product?.name || "",
    brandRef: product?.brandRef?._id || product?.brandRef || "",
    sku: product?.sku || "",
    shortDescription: product?.shortDescription || "",
    description: product?.description || "",
    category: product?.category?._id || product?.category || "",
    subcategory: product?.subcategory?._id || product?.subcategory || "",
    price: product?.price || "",
    discountType: product?.discountType || "fixed",
    discountValue: product?.discountValue || "",
    stock: product?.stock || "",
    totalReviews: product?.totalReviews || "",
    isNew: product?.isNew || false,
    isSale: product?.isSale || false,
    isLimited: product?.isLimited || false,
    isHot: product?.isHot || false,
    isFeatured: product?.isFeatured || false,
    isBestSelling: product?.isBestSelling || false,
    color: product?.color?.join(", ") || "",
    size: product?.size?.join(", ") || "",
    hasVariants: product?.hasVariants || false,
  });

  const [errors, setErrors] = useState({});
  const [vForm, setVForm] = useState({ color: "", size: "", sku: "", price: "", stock: "" });

  if (!product) {
    navigate("/product-list", { replace: true });
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const handleCheckbox = (e) => {
    const { name, checked } = e.target;
    setFormData((p) => ({ ...p, [name]: checked }));
  };

  const applyNewFiles = (files) => {
    const arr = Array.from(files);
    setNewFiles((p) => [...p, ...arr]);
    setNewPreviews((p) => [...p, ...arr.map((f) => URL.createObjectURL(f))]);
  };

  const removeNewFile = (idx) => {
    setNewFiles((p) => p.filter((_, i) => i !== idx));
    setNewPreviews((p) => p.filter((_, i) => i !== idx));
  };

  const handleDeleteImage = (img) => {
    setDeletingImgId(img._id || img.public_id);
    deleteImageMutate.mutate(
      { slug: product.slug, imgID: img._id || img.public_id },
      {
        onSuccess: () => {
          setExistingImages((p) => p.filter((i) => (i._id || i.public_id) !== (img._id || img.public_id)));
          toast.success("Image deleted.");
        },
        onError: (err) => toast.error(err?.response?.data?.message || "Failed to delete image."),
        onSettled: () => setDeletingImgId(null),
      }
    );
  };

  const handleUploadImages = () => {
    if (!newFiles.length) return;
    const body = new FormData();
    newFiles.forEach((f) => body.append("image", f));
    uploadImageMutate.mutate(
      { slug: product.slug, formData: body },
      {
        onSuccess: (res) => {
          const uploaded = res?.data?.data?.image || [];
          setExistingImages(uploaded);
          setNewFiles([]);
          setNewPreviews([]);
          toast.success(`${newFiles.length} image(s) uploaded successfully.`);
        },
        onError: (err) => toast.error(err?.response?.data?.message || "Image upload failed."),
      }
    );
  };

  const handleAddVariant = () => {
    if (!vForm.color || !vForm.size || !vForm.price || !vForm.stock) {
      toast.error("Please fill required fields (Color, Size, Price, Stock) for variant.");
      return;
    }
    const newVariant = { ...vForm, price: Number(vForm.price), stock: Number(vForm.stock) };
    
    setAddingVariant(true);
    addVariantsMutate.mutate(
      { slug: product.slug, variants: [newVariant] },
      {
        onSuccess: (res) => {
          const updatedProduct = res?.data?.data || res?.data;
          if (updatedProduct?.variants) {
            setExistingVariants(updatedProduct.variants);
          }
          setVForm({ color: "", size: "", sku: "", price: "", stock: "" });
          toast.success("Variant added successfully.");
        },
        onError: (err) => {
          toast.error(err?.response?.data?.message || "Failed to add variant.");
        },
        onSettled: () => setAddingVariant(false)
      }
    );
  };

  const handleDeleteVariant = (variantId) => {
    setDeletingVariantId(variantId);
    deleteVariantMutate.mutate(
      { slug: product.slug, variantId },
      {
        onSuccess: (res) => {
          const updatedProduct = res?.data?.data || res?.data;
          if (updatedProduct?.variants) {
            setExistingVariants(updatedProduct.variants);
          } else {
            setExistingVariants(p => p.filter(v => v._id !== variantId));
          }
          toast.success("Variant deleted.");
        },
        onError: (err) => {
          toast.error(err?.response?.data?.message || "Failed to delete variant.");
        },
        onSettled: () => setDeletingVariantId(null)
      }
    );
  };

  const handleEditClick = (v) => {
    setEditingVariantId(v._id);
    setEditVForm({ ...v });
  };

  const handleCancelEdit = () => {
    setEditingVariantId(null);
    setEditVForm(null);
  };

  const handleUpdateVariant = () => {
    if (!editVForm.color || !editVForm.size || editVForm.price === "" || editVForm.stock === "") {
      toast.error("Please fill required fields (Color, Size, Price, Stock) for variant.");
      return;
    }
    
    updateVariantMutate.mutate(
      { 
        slug: product.slug, 
        variantId: editingVariantId, 
        payload: {
          color: editVForm.color,
          size: editVForm.size,
          sku: editVForm.sku,
          price: Number(editVForm.price),
          stock: Number(editVForm.stock)
        }
      },
      {
        onSuccess: (res) => {
          const updatedProduct = res?.data?.data || res?.data;
          if (updatedProduct?.variants) {
            setExistingVariants(updatedProduct.variants);
          } else {
             setExistingVariants(p => p.map(v => v._id === editingVariantId ? { ...editVForm, price: Number(editVForm.price), stock: Number(editVForm.stock) } : v));
          }
          toast.success("Variant updated successfully.");
          setEditingVariantId(null);
          setEditVForm(null);
        },
        onError: (err) => {
          toast.error(err?.response?.data?.message || "Failed to update variant.");
        }
      }
    );
  };

  const relevantSubcategories = subCatData?.data?.data?.filter(
    (sc) => sc.category?._id === formData.category || sc.category === formData.category
  ) || [];

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    const colors = formData.color.split(",").map((v) => v.trim()).filter(Boolean);
    const sizes = formData.size.split(",").map((v) => v.trim()).filter(Boolean);

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.sku.trim()) newErrors.sku = "SKU is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.price || Number(formData.price) <= 0) newErrors.price = "Price must be > 0";
    if (formData.stock === "" || Number(formData.stock) < 0) newErrors.stock = "Stock required";
    if (!formData.description.trim()) newErrors.description = "Description is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fix the errors before saving.");
      return;
    }

    const payload = {};
    payload.name = formData.name.trim();
    payload.sku = formData.sku.trim();
    payload.description = formData.description.trim();
    if (formData.shortDescription.trim()) payload.shortDescription = formData.shortDescription.trim();
    payload.category = formData.category;
    if(formData.subcategory) payload.subcategory = formData.subcategory;
    if(formData.brandRef) payload.brandRef = formData.brandRef;

    payload.price = Number(formData.price);
    if (formData.discountType) payload.discountType = formData.discountType;
    if (formData.discountValue !== "") payload.discountValue = Number(formData.discountValue);
    payload.stock = Number(formData.stock);
    if (formData.totalReviews !== "") payload.totalReviews = Number(formData.totalReviews);
    
    // Flags
    payload.isNew = formData.isNew;
    payload.isSale = formData.isSale;
    payload.isLimited = formData.isLimited;
    payload.isHot = formData.isHot;
    payload.isFeatured = formData.isFeatured;
    payload.isBestSelling = formData.isBestSelling;
    
    // Arrays
    if (colors.length > 0) payload.color = colors;
    if (sizes.length > 0) payload.size = sizes;
    
    // Variants array
    payload.hasVariants = formData.hasVariants;

    payload.slug = product.slug;

    updateProductMutate.mutate(payload, {
      onSuccess: () => {
        toast.success("Product updated successfully!");
        setTimeout(() => navigate("/product-list"), 1200);
      },
      onError: (err) => toast.error(err?.response?.data?.message || "Update failed."),
    });
  };

  const isPending = updateProductMutate.isPending;

  return (
    <div style={s.page}>
      <style>{css}</style>
      <ToastStack toasts={toast.toasts} onRemove={toast.remove} />

      {/* ── Header ── */}
      <div className="ep-header">
        <div>
          <div style={s.breadcrumb}>
            <span style={s.breadcrumbLink} onClick={() => navigate("/products")}>Dashboard</span>
            <span style={s.breadcrumbSep}>/</span>
            <span style={s.breadcrumbLink} onClick={() => navigate("/products")}>Products</span>
            <span style={s.breadcrumbSep}>/</span>
            <span style={s.breadcrumbCurrent}>Edit</span>
          </div>
          <h1 className="ep-title">Edit Product</h1>
          <p style={s.titleSub}>
            Editing&nbsp;
            <span style={{ color: "var(--foreground)", fontWeight: 700 }}>{product.name}</span>
            {product.sku && <span style={s.skuInline}>&nbsp;·&nbsp;{product.sku}</span>}
          </p>
        </div>
        <button onClick={() => navigate(-1)} className="ep-back-btn">
          <ArrowLeft size={15} /><span>Back</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        
        {/* ── 1. Basic Info ── */}
        <SectionCard title="Basic Information" subtitle="Core product identity">
          <div className="ep-grid-2">
            <Field label="Product Name *" error={errors.name}>
              <input name="name" value={formData.name} onChange={handleChange} style={{ ...s.input, ...(errors.name ? s.inputError : {}) }} />
            </Field>
            <Field label="SKU *" error={errors.sku}>
              <input name="sku" value={formData.sku} onChange={handleChange} style={{ ...s.input, ...(errors.sku ? s.inputError : {}) }} />
            </Field>
          </div>
          <div className="ep-grid-3" style={{ marginTop: 20 }}>
            <Field label="Category *" error={errors.category}>
              <select name="category" value={formData.category} onChange={handleChange} style={{ ...s.input, ...(errors.category ? s.inputError : {}), cursor: "pointer" }}>
                <option value="">{categoryLoading ? "Loading…" : "Select a category"}</option>
                {categoryData?.data?.data?.map((cat) => (
                  <option key={cat._id || cat.id} value={cat._id || cat.id}>{cat.name}</option>
                ))}
              </select>
            </Field>

            <Field label="Sub-Category" hint="(Optional)">
              <select name="subcategory" value={formData.subcategory} onChange={handleChange} style={{ ...s.input, cursor: "pointer" }} disabled={!formData.category}>
                <option value="">{subCatLoading ? "Loading…" : "Select Sub-Category"}</option>
                {relevantSubcategories.map((sc) => (
                  <option key={sc._id || sc.slug} value={sc._id || sc.slug}>{sc.name}</option>
                ))}
              </select>
            </Field>

            <Field label="Brand" hint="(Optional)">
              <select name="brandRef" value={formData.brandRef} onChange={handleChange} style={{ ...s.input, cursor: "pointer" }}>
                <option value="">{brandLoading ? "Loading…" : "Select Brand"}</option>
                {brandData?.data?.data?.map((b) => (
                  <option key={b._id || b.slug} value={b._id || b.slug}>{b.name}</option>
                ))}
              </select>
            </Field>
          </div>
        </SectionCard>

        {/* ── 2. Pricing & Stock ── */}
        <SectionCard title="Pricing & Stock" subtitle="Price, inventory and discount">
          <div className="ep-grid-3">
            <Field label="Price ($) *" error={errors.price}>
              <input type="number" name="price" value={formData.price} onChange={handleChange} min="0" step="0.01" style={{ ...s.input, ...(errors.price ? s.inputError : {}) }} />
            </Field>
            <Field label="Stock *" error={errors.stock}>
              <input type="number" name="stock" value={formData.stock} onChange={handleChange} min="0" style={{ ...s.input, ...(errors.stock ? s.inputError : {}) }} />
            </Field>
            <Field label="Total Reviews" error={errors.totalReviews}>
              <input type="number" name="totalReviews" value={formData.totalReviews} onChange={handleChange} min="0" style={s.input} />
            </Field>
            <Field label="Discount Type" hint="(Optional)">
              <select name="discountType" value={formData.discountType} onChange={handleChange} style={{ ...s.input, cursor: "pointer" }}>
                <option value="fixed">Fixed ($)</option>
                <option value="percentage">Percentage (%)</option>
              </select>
            </Field>
            <Field label="Discount Value" hint="(Optional)">
              <input type="number" name="discountValue" value={formData.discountValue} onChange={handleChange} min="0" style={s.input} />
            </Field>
          </div>
        </SectionCard>

        {/* ── 3. Variants ── */}
        <SectionCard title="Product Variants" subtitle="Add specific SKUs for colors and sizes">
          <div style={{ marginBottom: 16 }}>
            <label style={s.flagLabel} className="ep-flag">
              <input type="checkbox" name="hasVariants" checked={formData.hasVariants} onChange={handleCheckbox} style={{ display: "none" }} />
              <span style={{ ...s.flagDot, background: formData.hasVariants ? "var(--foreground)" : "var(--border)" }} />
              This product has multiple variants (e.g. different colors & sizes)
            </label>
          </div>

          {formData.hasVariants && (
            <div style={s.variantContainer}>
              {existingVariants.length > 0 && (
                <div style={s.vList}>
                  {existingVariants.map((v, i) => (
                    <div key={v._id || v.sku || i} style={s.vItem}>
                      {editingVariantId === v._id ? (
                        <div style={{ width: "100%" }}>
                          <div className="ep-grid-3" style={{ gap: 10, marginBottom: 10 }}>
                            <input value={editVForm.color} onChange={e => setEditVForm(p => ({...p, color: e.target.value}))} placeholder="Color" style={{...s.input, padding: "6px 10px", fontSize: 13}} />
                            <input value={editVForm.size} onChange={e => setEditVForm(p => ({...p, size: e.target.value}))} placeholder="Size" style={{...s.input, padding: "6px 10px", fontSize: 13}} />
                            <input value={editVForm.sku} onChange={e => setEditVForm(p => ({...p, sku: e.target.value}))} placeholder="SKU" style={{...s.input, padding: "6px 10px", fontSize: 13}} />
                            <input type="number" value={editVForm.price} onChange={e => setEditVForm(p => ({...p, price: e.target.value}))} placeholder="Price" min="0" step="0.01" style={{...s.input, padding: "6px 10px", fontSize: 13}} />
                            <input type="number" value={editVForm.stock} onChange={e => setEditVForm(p => ({...p, stock: e.target.value}))} placeholder="Stock" min="0" style={{...s.input, padding: "6px 10px", fontSize: 13}} />
                          </div>
                          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                            <button type="button" onClick={handleCancelEdit} style={{...s.addVariantBtn, width: "auto", padding: "0 12px", height: 30, background: "transparent", border: "1px solid var(--border)", color: "var(--foreground)"}}>Cancel</button>
                            <button type="button" onClick={handleUpdateVariant} disabled={updateVariantMutate.isPending} style={{...s.addVariantBtn, width: "auto", padding: "0 12px", height: 30, background: "var(--foreground)", color: "var(--background)"}}>
                              {updateVariantMutate.isPending ? "Saving..." : "Save"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div style={s.vInfo}>
                            <div style={s.vTitle}>{v.color} - {v.size} {v.sku ? `(${v.sku})` : ""}</div>
                            <div style={s.vDetails}>Price: ${v.price} &middot; Stock: {v.stock}</div>
                          </div>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button 
                              type="button" 
                              onClick={() => handleEditClick(v)}
                              style={{ ...s.vActionBtn, color: "var(--muted-foreground)" }}
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              type="button" 
                              onClick={() => handleDeleteVariant(v._id)} 
                              disabled={deletingVariantId === v._id}
                              style={{ ...s.vActionBtn, color: "var(--destructive)", ...(deletingVariantId === v._id ? s.btnDisabled : {}) }}
                            >
                              {deletingVariantId === v._id ? <span style={{ ...s.spinner, width: 14, height: 14, borderTopColor: 'var(--destructive)' }} /> : <Trash2 size={16} />}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div style={s.vForm}>
                <h4 style={s.vFormTitle}>Add Variant</h4>
                <div className="ep-grid-3">
                  <Field label="Color *">
                    <input value={vForm.color} onChange={e => setVForm(p => ({...p, color: e.target.value}))} placeholder="Red" style={s.input} />
                  </Field>
                  <Field label="Size *">
                    <input value={vForm.size} onChange={e => setVForm(p => ({...p, size: e.target.value}))} placeholder="XL" style={s.input} />
                  </Field>
                  <Field label="Variant SKU" hint="(Optional)">
                    <input value={vForm.sku} onChange={e => setVForm(p => ({...p, sku: e.target.value}))} placeholder="LJ-RED-XL" style={s.input} />
                  </Field>
                  <Field label="Price ($) *">
                    <input type="number" value={vForm.price} onChange={e => setVForm(p => ({...p, price: e.target.value}))} placeholder="0.00" min="0" step="0.01" style={s.input} />
                  </Field>
                  <Field label="Stock *">
                    <input type="number" value={vForm.stock} onChange={e => setVForm(p => ({...p, stock: e.target.value}))} placeholder="0" min="0" style={s.input} />
                  </Field>
                  <div style={{ display: "flex", alignItems: "flex-end" }}>
                     <button type="button" onClick={handleAddVariant} disabled={addingVariant} style={{ ...s.addVariantBtn, ...(addingVariant ? s.btnDisabled : {}) }}>
                       {addingVariant ? <><span style={s.spinner} /> Adding…</> : <><Plus size={16}/> Add to List</>}
                     </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </SectionCard>

        {/* ── 4. Attribute Strings (Legacy) ── */}
        <SectionCard title="Global Options" subtitle="Define available options globally (comma separated)">
          <div className="ep-grid-2">
            <Field label="Colors" hint="(Optional) e.g. Red, Blue">
              <input name="color" value={formData.color} onChange={handleChange} placeholder="Red, Blue, Black…" style={s.input} />
              {formData.color && (
                <div style={s.tagRow}>
                  {formData.color.split(",").map((c) => c.trim()).filter(Boolean).map((c, i) => (
                      <span key={i} style={s.tag}>{c}</span>
                  ))}
                </div>
              )}
            </Field>
            <Field label="Sizes" hint="(Optional) e.g. S, M, L">
              <input name="size" value={formData.size} onChange={handleChange} placeholder="S, M, L, XL…" style={s.input} />
              {formData.size && (
                <div style={s.tagRow}>
                  {formData.size.split(",").map((sz) => sz.trim()).filter(Boolean).map((sz, i) => (
                      <span key={i} style={s.tag}>{sz}</span>
                  ))}
                </div>
              )}
            </Field>
          </div>
        </SectionCard>

        {/* ── 5. Descriptions ── */}
        <SectionCard title="Descriptions" subtitle="Product copy for listings and detail pages">
          <div className="ep-grid-2">
            <Field label="Short Description" hint="(Optional)">
              <textarea name="shortDescription" value={formData.shortDescription} onChange={handleChange} style={{ ...s.textarea, height: 90 }} />
            </Field>
            <Field label="Full Description *" error={errors.description}>
              <textarea name="description" value={formData.description} onChange={handleChange} style={{ ...s.textarea, height: 90, ...(errors.description ? s.inputError : {}) }} />
            </Field>
          </div>
        </SectionCard>

        {/* ── 6. Flags ── */}
        <SectionCard title="Product Flags" subtitle="Toggle labels to highlight this product">
          <div className="ep-grid-flags">
            {FLAGS.map((f) => (
              <label key={f.key} style={{ ...s.flagLabel, ...(formData[f.key] ? { background: f.bg, borderColor: f.border, color: f.color } : {}) }} className="ep-flag">
                <input type="checkbox" name={f.key} checked={formData[f.key]} onChange={handleCheckbox} style={{ display: "none" }} />
                <span style={{ ...s.flagDot, background: formData[f.key] ? f.color : "#374151" }} />
                {f.label}
              </label>
            ))}
          </div>
        </SectionCard>

        {/* ── 7. Images ── */}
        <SectionCard title="Product Images" subtitle="Manage existing images or upload new ones">
          {existingImages.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={s.imgSectionLabel}>Current Images</div>
              <div className="ep-image-grid">
                {existingImages.map((img, i) => {
                  const id = img._id || img.public_id;
                  const isDeleting = deletingImgId === id;
                  return (
                    <div key={id || i} style={s.existingImgWrap}>
                      <img src={img.url} alt="img" style={s.existingImg} />
                      <button type="button" style={{ ...s.imgDeleteBtn, ...(isDeleting ? s.btnDisabled : {}) }} disabled={isDeleting} onClick={() => handleDeleteImage(img)} title="Delete image">
                        {isDeleting ? <span style={s.miniSpinner} /> : <Trash2 size={12} />}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div style={s.imgSectionLabel}>Upload New Images</div>
          {newPreviews.length === 0 ? (
            <div style={s.dropzone} onClick={() => fileInputRef.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); applyNewFiles(e.dataTransfer.files); }}>
              <div style={s.dropIcon}><ImagePlus size={22} color="var(--foreground)" /></div>
              <p style={s.dropText}><strong>Click to upload</strong> or drag & drop</p>
              <p style={s.dropHint}>JPG, PNG, WEBP — multiple files allowed</p>
            </div>
          ) : (
            <div>
              <div className="ep-image-grid" style={{ marginBottom: 12 }}>
                {newPreviews.map((src, i) => (
                  <div key={i} style={s.existingImgWrap}>
                    <img src={src} alt="new" style={s.existingImg} />
                    <button type="button" style={s.imgDeleteBtn} onClick={() => removeNewFile(i)}><X size={12} /></button>
                  </div>
                ))}
                <div style={s.addMoreTile} onClick={() => fileInputRef.current?.click()}>
                  <ImagePlus size={18} color="#6b7280" />
                  <span style={{ fontSize: 10, color: "#6b7280", marginTop: 3 }}>Add more</span>
                </div>
              </div>
              <button type="button" disabled={uploadImageMutate.isPending} onClick={handleUploadImages} style={{ ...s.uploadBtn, ...(uploadImageMutate.isPending ? s.btnDisabled : {}) }}>
                {uploadImageMutate.isPending ? <><span style={s.spinner} /> Uploading…</> : `Upload ${newFiles.length} image(s)`}
              </button>
            </div>
          )}
          <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={(e) => applyNewFiles(e.target.files)} style={{ display: "none" }} />
        </SectionCard>

        {/* ── Submit row ── */}
        <div style={s.submitRow}>
          <span style={s.footerHint}>Updating: <strong>{product.name}</strong></span>
          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" onClick={() => navigate(-1)} style={s.cancelBtn}>Cancel</button>
            <button type="submit" disabled={isPending} className="ep-submit-btn" style={{ ...(isPending ? s.submitDisabled : {}) }}>
              {isPending ? <><span style={s.spinner} /> Saving…</> : "Save Changes"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

// ─── CSS ──────────────────────────────────────────────────────────────────────
const css = `
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeIn { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
  @keyframes slideUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
  @keyframes toastSlide { from { opacity:0; transform:translateX(30px); } to { opacity:1; transform:translateX(0); } }
  *, *::before, *::after { box-sizing: border-box; }

  .ep-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 32px; gap: 16px; }
  .ep-title { font-size: 32px; font-weight: 800; color: var(--foreground); letter-spacing: -0.03em; margin: 0; }

  .ep-back-btn { 
    display: inline-flex; align-items: center; gap: 8px; 
    background: transparent; color: var(--muted-foreground); 
    border: 1px solid var(--border); border-radius: 8px; 
    padding: 8px 16px; font-size: 14px; font-weight: 600; 
    cursor: pointer; transition: all 0.2s; 
  }
  .ep-back-btn:hover { background: var(--secondary); color: var(--foreground); }

  .ep-grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
  .ep-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
  .ep-grid-flags { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; }
  .ep-image-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 16px; }

  .ep-flag { cursor: pointer; transition: all 0.2s ease; border: 1px solid var(--border); }
  .ep-flag:hover { border-color: var(--foreground); }

  .ep-submit-btn {
    display: inline-flex; align-items: center; gap: 8px;
    background: var(--foreground); color: var(--background);
    border: none; border-radius: 10px; padding: 12px 32px;
    font-size: 14px; font-weight: 700; cursor: pointer;
    transition: all 0.2s ease;
  }
  .ep-submit-btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }

  @media (max-width: 768px) {
    .ep-grid-2, .ep-grid-3 { grid-template-columns: 1fr; }
  }
`;

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = {
  page: { 
    maxWidth: 1000, 
    margin: "0 auto", 
    fontFamily: "'Inter', sans-serif", 
    color: "var(--foreground)", 
    padding: "32px 24px 80px", 
    animation: "fadeIn 0.4s ease" 
  },
  breadcrumb: { display: "flex", gap: 8, alignItems: "center", marginBottom: 8 },
  breadcrumbLink: { color: "var(--muted-foreground)", fontSize: 13, cursor: "pointer", fontWeight: 500 },
  breadcrumbSep: { color: "var(--border)", fontSize: 12 },
  breadcrumbCurrent: { color: "var(--foreground)", fontSize: 13, fontWeight: 600 },
  titleSub: { fontSize: 14, color: "var(--muted-foreground)", margin: 0 },
  skuInline: { fontSize: 12, color: "var(--muted-foreground)", marginLeft: 8, fontWeight: 500 },

  sectionCard: { 
    background: "var(--background)", 
    border: "1px solid var(--border)", 
    borderRadius: 12, 
    overflow: "hidden", 
    animation: "slideUp 0.45s ease",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
  },
  sectionHeader: { 
    padding: "20px 24px", 
    borderBottom: "1px solid var(--border)", 
    display: "flex", 
    flexDirection: "column",
    gap: 4
  },
  sectionTitle: { fontSize: 16, fontWeight: 700, color: "var(--foreground)" },
  sectionSubtitle: { fontSize: 13, color: "var(--muted-foreground)" },
  sectionBody: { padding: "24px" },

  fieldGroup: { display: "flex", flexDirection: "column", gap: 8 },
  label: { fontSize: 11, fontWeight: 700, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em" },
  hint: { fontSize: 11, color: "var(--muted-foreground)", fontStyle: "italic" },
  errorMsg: { fontSize: 12, color: "var(--destructive)", margin: 0, fontWeight: 500 },

  input: { 
    width: "100%", 
    background: "var(--background)", 
    border: "1px solid var(--border)", 
    borderRadius: 8, 
    padding: "10px 14px", 
    fontSize: 14, 
    color: "var(--foreground)", 
    outline: "none", 
    transition: "border-color 0.2s",
    fontWeight: 500
  },
  textarea: { 
    width: "100%", 
    background: "var(--background)", 
    border: "1px solid var(--border)", 
    borderRadius: 8, 
    padding: "12px 14px", 
    fontSize: 14, 
    color: "var(--foreground)", 
    outline: "none", 
    resize: "vertical", 
    lineHeight: 1.6, 
    transition: "border-color 0.2s",
    fontWeight: 500
  },
  inputError: { borderColor: "var(--destructive)" },

  tagRow: { display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 },
  tag: { 
    display: "inline-block", 
    padding: "2px 10px", 
    borderRadius: 6, 
    fontSize: 11, 
    fontWeight: 700,
    background: "var(--secondary)",
    border: "1px solid var(--border)"
  },

  flagLabel: { 
    display: "flex", 
    alignItems: "center", 
    gap: 10, 
    padding: "12px 16px", 
    borderRadius: 8, 
    background: "var(--background)", 
    fontSize: 13, 
    fontWeight: 600, 
    color: "var(--foreground)", 
    userSelect: "none",
    transition: "all 0.2s"
  },
  flagDot: { width: 8, height: 8, borderRadius: "50%", flexShrink: 0 },

  variantContainer: { background: "var(--secondary)", borderRadius: 12, padding: 20, marginTop: 4 },
  vList: { display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 },
  vItem: { 
    display: "flex", justifyContent: "space-between", alignItems: "center", 
    padding: "12px 16px", 
    background: "var(--background)", 
    border: "1px solid var(--border)", 
    borderRadius: 8 
  },
  vInfo: { display: "flex", flexDirection: "column", gap: 2 },
  vTitle: { fontSize: 14, fontWeight: 700, color: "var(--foreground)" },
  vDetails: { fontSize: 12, color: "var(--muted-foreground)" },
  vActionBtn: { background: "none", border: "none", cursor: "pointer", padding: 4 },
  vForm: { 
    background: "var(--background)", 
    border: "1px solid var(--border)", 
    borderRadius: 8, 
    padding: 20,
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
  },
  vFormTitle: { fontSize: 12, fontWeight: 700, color: "var(--muted-foreground)", margin: "0 0 16px", textTransform: "uppercase" },
  addVariantBtn: { 
    width: "100%", height: 42, 
    display: "flex", alignItems: "center", justifyContent: "center", 
    gap: 8, background: "var(--foreground)", color: "var(--background)", 
    border: "none", borderRadius: 8, 
    fontSize: 13, fontWeight: 700, cursor: "pointer" 
  },

  imgSectionLabel: { fontSize: 12, fontWeight: 700, color: "var(--muted-foreground)", marginBottom: 12, textTransform: "uppercase" },
  existingImgWrap: { position: "relative", aspectRatio: "1", borderRadius: 8, overflow: "hidden", border: "1px solid var(--border)" },
  existingImg: { width: "100%", height: "100%", objectFit: "cover" },
  imgDeleteBtn: { 
    position: "absolute", top: 4, right: 4, 
    width: 20, height: 20, 
    borderRadius: 4, 
    background: "var(--destructive)", 
    border: "none", color: "white", 
    display: "flex", alignItems: "center", justifyContent: "center", 
    cursor: "pointer" 
  },
  miniSpinner: { 
    display: "inline-block", 
    width: 10, height: 10, 
    border: "2px solid rgba(255,255,255,0.3)", 
    borderTopColor: "white", 
    borderRadius: "50%", 
    animation: "spin 0.7s linear infinite" 
  },
  
  dropzone: { 
    border: "2px dashed var(--border)", 
    borderRadius: 12, 
    padding: "48px 24px", 
    display: "flex", 
    flexDirection: "column", 
    alignItems: "center", 
    justifyContent: "center", 
    gap: 12, 
    cursor: "pointer", 
    textAlign: "center", 
    background: "var(--background)", 
    transition: "all 0.2s" 
  },
  dropIcon: { 
    width: 44, height: 44, 
    borderRadius: 10, 
    background: "var(--secondary)", 
    display: "flex", alignItems: "center", justifyContent: "center" 
  },
  dropText: { fontSize: 14, color: "var(--foreground)", margin: 0, fontWeight: 600 },
  dropHint: { fontSize: 12, color: "var(--muted-foreground)", margin: 0 },
  addMoreTile: { 
    aspectRatio: "1", 
    border: "1px dashed var(--border)", 
    borderRadius: 8, 
    display: "flex", flexDirection: "column", 
    alignItems: "center", justifyContent: "center", 
    cursor: "pointer", 
    background: "var(--background)", 
    transition: "all 0.2s" 
  },
  uploadBtn: { 
    width: "100%", height: 42,
    display: "flex", alignItems: "center", justifyContent: "center", 
    gap: 8, background: "var(--foreground)", color: "var(--background)", 
    border: "none", borderRadius: 8, 
    fontSize: 13, fontWeight: 700, cursor: "pointer", 
    marginTop: 12 
  },
  btnDisabled: { opacity: 0.5, cursor: "not-allowed" },

  submitRow: { 
    display: "flex", alignItems: "center", justifyContent: "space-between", 
    padding: "24px", 
    background: "var(--background)", 
    border: "1px solid var(--border)", 
    borderRadius: 12, 
    marginTop: 8
  },
  footerHint: { fontSize: 13, color: "var(--muted-foreground)" },
  cancelBtn: { 
    background: "transparent", color: "var(--muted-foreground)", 
    border: "none", padding: "0 20px", 
    fontSize: 14, fontWeight: 600, cursor: "pointer" 
  },
  submitDisabled: { opacity: 0.5, cursor: "not-allowed" },
  spinner: { 
    display: "inline-block", 
    width: 14, height: 14, 
    border: "2px solid rgba(255,255,255,0.3)", 
    borderTopColor: "white", 
    borderRadius: "50%", 
    animation: "spin 0.7s linear infinite" 
  },

  toastStack: { position: "fixed", top: 24, right: 24, zIndex: 1100, display: "flex", flexDirection: "column", gap: 10, maxWidth: 360 },
  toast: { 
    display: "flex", alignItems: "center", gap: 12, 
    padding: "14px 20px", borderRadius: 10, border: "1px solid", 
    fontSize: 14, fontWeight: 600, boxShadow: "0 10px 40px rgba(0,0,0,0.1)", 
    animation: "toastSlide 0.3s ease" 
  },
  toastIcon: { fontWeight: 700 },
  toastMsg: { flex: 1 },
  toastClose: { background: "none", border: "none", cursor: "pointer", opacity: 0.5 },
};
