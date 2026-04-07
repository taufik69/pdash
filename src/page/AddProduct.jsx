import { createProduct, getCategory, getBrand, getSubCategory } from "@/api/api";
import { useState, useRef } from "react";
import { Package, ImagePlus, X, Plus, Trash2 } from "lucide-react";

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

// ─── Reusable Field ───────────────────────────────────────────────────────────
function Field({ label, error, hint, children }) {
  const isRequired = typeof label === 'string' && label.includes('*');
  const cleanLabel = typeof label === 'string' ? label.replace('*', '').trim() : label;

  return (
    <div style={s.fieldGroup}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <label style={s.label}>
          {cleanLabel} {isRequired && <span style={{ color: "var(--destructive)", fontSize: "14px", marginLeft: "2px" }}>*</span>}
        </label>
        {hint && <span style={s.hint}>{hint}</span>}
      </div>
      {children}
      {error && <p style={s.errorMsg}>⚠ {error}</p>}
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
  { key: "isBestSelling", label: "Best Selling", color: "var(--foreground)", bg: "var(--secondary)", border: "var(--border)" },
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

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AddProduct() {
  const productMutate = createProduct();
  const toast = useToast();
  const fileInputRef = useRef(null);

  const { data: categoryData, isLoading: categoryLoading } = getCategory();
  const { data: brandData, isLoading: brandLoading } = getBrand();
  const { data: subCatData, isLoading: subCatLoading } = getSubCategory();

  const INIT = {
    name: "",
    brandRef: "",
    sku: "",
    shortDescription: "",
    description: "",
    category: "",
    subcategory: "",
    price: "",
    discountType: "fixed",
    discountValue: "",
    stock: "",
    totalReviews: "",
    isNew: false,
    isSale: false,
    isLimited: false,
    isHot: false,
    isFeatured: false,
    isBestSelling: false,
    color: "",
    size: "",
    image: [],
    hasVariants: false,
    variants: [],
  };

  const [formData, setFormData] = useState(INIT);
  const [errors, setErrors] = useState({});
  const [imagePreviews, setImagePreviews] = useState([]);
  const [dragOver, setDragOver] = useState(false);

  // For variant form
  const [vForm, setVForm] = useState({ color: "", size: "", sku: "", price: "", stock: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const handleCheckbox = (e) => {
    const { name, checked } = e.target;
    setFormData((p) => ({ ...p, [name]: checked }));
  };

  const applyImages = (files) => {
    if(!files) return;
    const arr = Array.from(files);
    setFormData((p) => ({ ...p, image: [...p.image, ...arr] }));
    const newPreviews = arr.map((f) => URL.createObjectURL(f));
    setImagePreviews(p => [...p, ...newPreviews]);
    if (errors.image) setErrors((p) => ({ ...p, image: "" }));
  };

  const removeImage = (idx) => {
    setFormData((p) => ({ ...p, image: p.image.filter((_, i) => i !== idx) }));
    setImagePreviews((p) => p.filter((_, i) => i !== idx));
  };

  const addVariant = () => {
    if (!vForm.color || !vForm.size || !vForm.price || !vForm.stock) {
      toast.error("Please fill required fields (Color, Size, Price, Stock) for variant.");
      return;
    }
    setFormData((p) => ({
      ...p,
      variants: [...p.variants, { ...vForm, price: Number(vForm.price), stock: Number(vForm.stock) }]
    }));
    setVForm({ color: "", size: "", sku: "", price: "", stock: "" });
  };

  const removeVariant = (idx) => {
    setFormData(p => ({
      ...p,
      variants: p.variants.filter((_, i) => i !== idx)
    }));
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
    if (!formData.stock || Number(formData.stock) < 0) newErrors.stock = "Stock is required";
    if (!formData.image.length) newErrors.image = "At least one image is required";
    // Description logic
    if (!formData.description.trim()) newErrors.description = "Description is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fix the errors before submitting.");
      return;
    }

    const payload = new FormData();
    payload.append("name", formData.name.trim());
    payload.append("sku", formData.sku.trim());
    payload.append("description", formData.description.trim());
    if (formData.shortDescription.trim()) payload.append("shortDescription", formData.shortDescription.trim());
    payload.append("category", formData.category);
    if(formData.subcategory) payload.append("subcategory", formData.subcategory);
    if(formData.brandRef) payload.append("brandRef", formData.brandRef);

    payload.append("price", Number(formData.price));
    if (formData.discountType) payload.append("discountType", formData.discountType);
    if (formData.discountValue) payload.append("discountValue", Number(formData.discountValue));
    payload.append("stock", Number(formData.stock));
    if (formData.totalReviews) payload.append("totalReviews", Number(formData.totalReviews));
    
    // Flags
    payload.append("isNew", formData.isNew);
    payload.append("isSale", formData.isSale);
    payload.append("isLimited", formData.isLimited);
    payload.append("isHot", formData.isHot);
    payload.append("isFeatured", formData.isFeatured);
    payload.append("isBestSelling", formData.isBestSelling);
    
    // Arrays
    colors.forEach((c) => payload.append("color[]", c));
    sizes.forEach((sz) => payload.append("size[]", sz));
    
    // Variants array
    if (formData.hasVariants && formData.variants.length > 0) {
      payload.append("variants", JSON.stringify(formData.variants));
    }

    formData.image.forEach((img) => payload.append("image", img));

    productMutate.mutate(payload, {
      onSuccess: () => {
        toast.success("Product created successfully!");
        setFormData(INIT);
        setImagePreviews([]);
        setErrors({});
        if (fileInputRef.current) fileInputRef.current.value = "";
      },
      onError: (err) => {
        toast.error(err?.response?.data?.message || "Failed to create product.");
      },
    });
  };

  return (
    <div style={s.page}>
      <style>{css}</style>
      <ToastStack toasts={toast.toasts} onRemove={toast.remove} />

      {/* ── Header ── */}
      <div className="ap-header">
        <div>
          <div style={s.breadcrumb}>
            <span style={s.breadcrumbLink}>Dashboard</span>
            <span style={s.breadcrumbSep}>/</span>
            <span style={s.breadcrumbCurrent}>Products</span>
            <span style={s.breadcrumbSep}>/</span>
            <span style={s.breadcrumbCurrent}>Add</span>
          </div>
          <h1 className="ap-title">Add Product</h1>
          <p style={s.titleSub}>Fill in all sections to create a new product listing.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        
        {/* ── 1. Basic Info ── */}
        <SectionCard title="Basic Information" subtitle="Core product identity">
          <div className="ap-grid-2">
            <Field label="Product Name *" error={errors.name}>
              <input name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Classic Leather Jacket" style={{ ...s.input, ...(errors.name ? s.inputError : {}) }} />
            </Field>
            <Field label="SKU *" error={errors.sku}>
              <input name="sku" value={formData.sku} onChange={handleChange} placeholder="e.g. LJ-001-BLK" style={{ ...s.input, ...(errors.sku ? s.inputError : {}) }} />
            </Field>
          </div>
          <div className="ap-grid-3" style={{ marginTop: 20 }}>
            <Field label="Category *" error={errors.category}>
              <select name="category" value={formData.category} onChange={handleChange} style={{ ...s.input, ...(errors.category ? s.inputError : {}), cursor: "pointer" }}>
                <option value="">{categoryLoading ? "Loading…" : "Select Category"}</option>
                {categoryData?.data?.data?.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </Field>

            <Field label="Sub-Category" hint="(Optional)">
              <select name="subcategory" value={formData.subcategory} onChange={handleChange} style={{ ...s.input, cursor: "pointer" }} disabled={!formData.category}>
                <option value="">{subCatLoading ? "Loading…" : "Select Sub-Category"}</option>
                {relevantSubcategories.map((sc) => (
                  <option key={sc.id} value={sc.id}>{sc.name}</option>
                ))}
              </select>
            </Field>

            <Field label="Brand" hint="(Optional)">
              <select name="brandRef" value={formData.brandRef} onChange={handleChange} style={{ ...s.input, cursor: "pointer" }}>
                <option value="">{brandLoading ? "Loading…" : "Select Brand"}</option>
                {brandData?.data?.data?.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </Field>
          </div>
        </SectionCard>

        {/* ── 2. Pricing & Base Stock ── */}
        <SectionCard title="Base Pricing & Stock" subtitle="Required base attributes">
          <div className="ap-grid-3">
            <Field label="Price ($) *" error={errors.price}>
              <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="0.00" min="0" step="0.01" style={{ ...s.input, ...(errors.price ? s.inputError : {}) }} />
            </Field>
            <Field label="Stock *" error={errors.stock}>
              <input type="number" name="stock" value={formData.stock} onChange={handleChange} placeholder="0" min="0" style={{ ...s.input, ...(errors.stock ? s.inputError : {}) }} />
            </Field>
            <Field label="Total Reviews" hint="(Optional)">
              <input type="number" name="totalReviews" value={formData.totalReviews} onChange={handleChange} placeholder="0" min="0" style={s.input} />
            </Field>
            <Field label="Discount Type" hint="(Optional)">
              <select name="discountType" value={formData.discountType} onChange={handleChange} style={{ ...s.input, cursor: "pointer" }}>
                <option value="fixed">Fixed ($)</option>
                <option value="percentage">Percentage (%)</option>
              </select>
            </Field>
            <Field label="Discount Value" hint="(Optional)">
              <input type="number" name="discountValue" value={formData.discountValue} onChange={handleChange} placeholder="0" min="0" style={s.input} />
            </Field>
          </div>
        </SectionCard>

        {/* ── 3. Variants ── */}
        <SectionCard title="Product Variants" subtitle="Add specific SKUs for colors and sizes">
          <div style={{ marginBottom: 16 }}>
            <label style={s.flagLabel} className="ap-flag">
              <input type="checkbox" name="hasVariants" checked={formData.hasVariants} onChange={handleCheckbox} style={{ display: "none" }} />
              <span style={{ ...s.flagDot, background: formData.hasVariants ? "var(--foreground)" : "var(--border)" }} />
              This product has multiple variants (e.g. different colors & sizes)
            </label>
          </div>

          {formData.hasVariants && (
            <div style={s.variantContainer}>
              {formData.variants.length > 0 && (
                <div style={s.vList}>
                  {formData.variants.map((v, i) => (
                    <div key={i} style={s.vItem}>
                      <div style={s.vInfo}>
                        <div style={s.vTitle}>{v.color} - {v.size} {v.sku ? `(${v.sku})` : ""}</div>
                        <div style={s.vDetails}>Price: ${v.price} &middot; Stock: {v.stock}</div>
                      </div>
                      <button type="button" onClick={() => removeVariant(i)} style={s.vRemove}><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
              )}

              <div style={s.vForm}>
                <h4 style={s.vFormTitle}>Add Variant</h4>
                <div className="ap-grid-3">
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
                     <button type="button" onClick={addVariant} style={s.addVariantBtn}><Plus size={16}/> Add to List</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </SectionCard>

        {/* ── 4. Attribute Strings (Legacy) ── */}
        <SectionCard title="Global Options" subtitle="Define available options globally (comma separated)">
          <div className="ap-grid-2">
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
          <div className="ap-grid-2">
            <Field label="Short Description" hint="(Optional)">
              <textarea name="shortDescription" value={formData.shortDescription} onChange={handleChange} placeholder="Brief summary…" style={{ ...s.textarea, height: 90 }} />
            </Field>
            <Field label="Full Description *" error={errors.description}>
              <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Detailed description…" style={{ ...s.textarea, height: 90, ...(errors.description ? s.inputError : {}) }} />
            </Field>
          </div>
        </SectionCard>

        {/* ── 6. Flags ── */}
        <SectionCard title="Product Flags" subtitle="Toggle labels to highlight this product">
          <div className="ap-grid-flags">
            {FLAGS.map((f) => (
              <label key={f.key} style={{ ...s.flagLabel, ...(formData[f.key] ? { background: f.bg, borderColor: f.border, color: f.color } : {}) }} className="ap-flag">
                <input type="checkbox" name={f.key} checked={formData[f.key]} onChange={handleCheckbox} style={{ display: "none" }} />
                <span style={{ ...s.flagDot, background: formData[f.key] ? f.color : "#374151" }} />
                {f.label}
              </label>
            ))}
          </div>
        </SectionCard>

        {/* ── 7. Images ── */}
        <SectionCard title="Product Images *" subtitle="Upload one or more product photos">
          {!imagePreviews.length ? (
            <div
              style={{ ...s.dropzone, ...(dragOver ? s.dropzoneActive : {}), ...(errors.image ? s.dropzoneError : {}) }}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); applyImages(e.dataTransfer.files); }}
              onClick={() => fileInputRef.current?.click()}
            >
              <div style={s.dropIcon}><ImagePlus size={24} color="var(--foreground)" /></div>
              <p style={s.dropText}><strong>Click to upload</strong> or drag & drop</p>
              <p style={s.dropHint}>JPG, PNG, WEBP — multiple files allowed</p>
            </div>
          ) : (
            <div>
              <div className="ap-image-grid">
                {imagePreviews.map((src, i) => (
                  <div key={i} style={s.previewItem}>
                    <img src={src} alt="preview" style={s.previewImg} />
                    <button type="button" style={s.previewRemove} onClick={() => removeImage(i)}><X size={12} /></button>
                  </div>
                ))}
                <div style={s.addMoreBtn} onClick={() => fileInputRef.current?.click()}>
                  <ImagePlus size={20} color="#6b7280" />
                  <span style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>Add more</span>
                </div>
              </div>
            </div>
          )}
          <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={(e) => applyImages(e.target.files)} style={{ display: "none" }} />
          {errors.image && <p style={{ ...s.errorMsg, marginTop: 8 }}>⚠ {errors.image}</p>}
        </SectionCard>

        {/* ── Submit ── */}
        <div style={s.submitRow}>
          <span style={s.footerHint}>Fields marked * are required</span>
          <button type="submit" disabled={productMutate.isPending} className="ap-submit-btn" style={{ ...s.submitBtn, ...(productMutate.isPending ? s.submitDisabled : {}) }}>
            {productMutate.isPending ? <><span style={s.spinner} /> Creating…</> : "Create Product"}
          </button>
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

  .ap-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 32px; }
  .ap-title { font-size: 32px; font-weight: 800; color: var(--foreground); letter-spacing: -0.03em; margin: 0; }

  .ap-grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
  .ap-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
  .ap-grid-flags { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; }
  .ap-image-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 16px; }

  .ap-flag { cursor: pointer; transition: all 0.2s ease; border: 1px solid var(--border); }
  .ap-flag:hover { border-color: var(--foreground); }

  .ap-submit-btn {
    display: inline-flex; align-items: center; gap: 8px;
    background: var(--primary); color: var(--primary-foreground);
    border: none; borderRadius: 10px; padding: 12px 32px;
    font-size: 14px; font-weight: 700; cursor: pointer;
    transition: all 0.2s ease;
  }
  .ap-submit-btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
  .ap-submit-btn:active:not(:disabled) { transform: translateY(0); }

  @media (max-width: 768px) {
    .ap-grid-2, .ap-grid-3 { grid-template-columns: 1fr; }
  }
`;

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
  dropzoneActive: { borderColor: "var(--foreground)", background: "var(--secondary)" },
  dropzoneError: { borderColor: "var(--destructive)" },
  dropIcon: { 
    width: 48, height: 48, 
    borderRadius: 10, 
    background: "var(--secondary)", 
    display: "flex", alignItems: "center", justifyContent: "center", 
    marginBottom: 4 
  },
  dropText: { fontSize: 14, color: "var(--foreground)", margin: 0, fontWeight: 600 },
  dropHint: { fontSize: 12, color: "var(--muted-foreground)", margin: 0 },

  previewItem: { position: "relative", aspectRatio: "1", borderRadius: 8, overflow: "hidden", border: "1px solid var(--border)" },
  previewImg: { width: "100%", height: "100%", objectFit: "cover" },
  previewRemove: { 
    position: "absolute", top: 4, right: 4, 
    width: 20, height: 20, 
    borderRadius: 4, 
    background: "var(--destructive)", 
    border: "none", color: "white", 
    display: "flex", alignItems: "center", justifyContent: "center", 
    cursor: "pointer" 
  },
  addMoreBtn: { 
    aspectRatio: "1", 
    border: "1px dashed var(--border)", 
    borderRadius: 8, 
    display: "flex", flexDirection: "column", 
    alignItems: "center", justifyContent: "center", 
    cursor: "pointer", 
    background: "var(--background)", 
    transition: "all 0.2s" 
  },

  submitRow: { 
    display: "flex", alignItems: "center", justifyContent: "space-between", 
    padding: "24px", 
    background: "var(--background)", 
    border: "1px solid var(--border)", 
    borderRadius: 12, 
    marginTop: 8
  },
  footerHint: { fontSize: 13, color: "var(--muted-foreground)" },
  submitDisabled: { opacity: 0.5, cursor: "not-allowed" },
  spinner: { 
    display: "inline-block", 
    width: 14, height: 14, 
    border: "2px solid rgba(255,255,255,0.3)", 
    borderTopColor: "white", 
    borderRadius: "50%", 
    animation: "spin 0.7s linear infinite" 
  },

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
  vRemove: { background: "none", border: "none", color: "var(--destructive)", cursor: "pointer", padding: 4 },
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
