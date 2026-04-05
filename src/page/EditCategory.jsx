import { updateCategory } from "@/api/api";
import { useState, useRef, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Tag, ArrowLeft, ImagePlus } from "lucide-react";

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
    remove: (id) => setToasts((p) => p.filter((t) => t.id !== id)),
  };
}
const TOAST_META = {
  success: { bg: "#064e3b", color: "#6ee7b7", border: "#065f46", icon: "✓" },
  error: { bg: "#450a0a", color: "#fca5a5", border: "#7f1d1d", icon: "✕" },
};
function ToastStack({ toasts, onRemove }) {
  if (!toasts.length) return null;
  return (
    <div style={s.toastStack}>
      {toasts.map((t) => {
        const m = TOAST_META[t.type] || TOAST_META.success;
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

// ─── Main Component ───────────────────────────────────────────────────────────
export default function EditCategory() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const fileInputRef = useRef(null);

  // Passed from CategoryTable: navigate("/edit-category", { state: { category: cat } })
  const category = location.state?.category;
  const categoryMutate = updateCategory();

  const [formData, setFormData] = useState({
    name: category?.name || "",
    description: category?.description || "",
    image: null, // null = keep existing; File = replace
  });
  const [errors, setErrors] = useState({});
  const [dragOver, setDragOver] = useState(false);

  // Guard: no category in state → redirect
  useEffect(() => {
    if (!category) navigate("/category-list", { replace: true });
  }, [category, navigate]);

  // Preview URL: new file wins, then existing remote URL
  const previewUrl = useMemo(() => {
    if (formData.image) return URL.createObjectURL(formData.image);
    return category?.image?.url || "";
  }, [formData.image, category]);

  const isNewImage = !!formData.image;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const applyFile = (file) => {
    if (!file) return;
    setFormData((p) => ({ ...p, image: file }));
    if (errors.image) setErrors((p) => ({ ...p, image: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    else if (formData.description.trim().length < 10)
      newErrors.description = "At least 10 characters required";
    if (formData.image) {
      const allowed = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
      if (!allowed.includes(formData.image.type))
        newErrors.image = "Only JPG, PNG or WEBP allowed";
      else if (formData.image.size > 3 * 1024 * 1024)
        newErrors.image = "Image must be under 3 MB";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fix the errors before saving.");
      return;
    }

    // ── Build payload ───────────────────────────────────────────────────────
    // API: api.put(`/categories/update-category/${data.slug}`, data)
    // mutationFn receives the whole `data` arg and reads data.slug for the URL.
    // We use FormData for multipart (image upload), and attach .slug as a
    // plain property so the mutationFn can read it via data.slug.
    const payload = new FormData();
    payload.append("name", formData.name.trim());
    payload.append("description", formData.description.trim());
    if (formData.image) payload.append("image", formData.image);

    // Attach slug as a plain property — mutationFn reads data.slug
    payload.slug = category.slug;

    categoryMutate.mutate(payload, {
      onSuccess: () => {
        toast.success("Category updated successfully!");
        setTimeout(() => navigate("/category-list"), 1200);
      },
      onError: (err) => {
        toast.error(
          err?.response?.data?.message || "Update failed. Please try again.",
        );
      },
    });
  };

  if (!category) return null;

  return (
    <div style={s.page}>
      <style>{css}</style>
      <ToastStack toasts={toast.toasts} onRemove={toast.remove} />

      {/* ── Header ── */}
      <div className="ec-header">
        <div>
          <div style={s.breadcrumb}>
            <span
              style={s.breadcrumbLink}
            >
              Dashboard
            </span>
            <span style={s.breadcrumbSep}>/</span>
            <span
              style={s.breadcrumbLink}
            >
              Categories
            </span>
            <span style={s.breadcrumbSep}>/</span>
            <span style={s.breadcrumbCurrent}>Edit</span>
          </div>
          <h1 className="ec-title">Edit Category</h1>
          <p style={s.titleSub}>
            Editing&nbsp;
            <span style={{ color: "#d97706", fontWeight: 600 }}>
              {category.name}
            </span>
          </p>
        </div>
        <button onClick={() => navigate(-1)} className="ec-back-btn">
          <ArrowLeft size={15} />
          <span>Back</span>
        </button>
      </div>

      {/* ── Card ── */}
      <div style={s.card}>
        {/* Card header */}
        <div className="ec-card-header">
          <div style={s.cardTitleWrap}>
            <span style={s.cardIcon}>
              <Tag size={17} />
            </span>
            <div>
              <div style={s.cardTitle}>Category Details</div>
              <div style={s.cardSubtitle}>
                Update fields below — leave image unchanged to keep the current
                one
              </div>
            </div>
          </div>

          {/* Slug read-only chip */}
          {category.slug && (
            <div style={s.slugChip}>
              <span style={s.slugLabel}>slug</span>
              <span style={s.slugValue}>{category.slug}</span>
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={s.formBody}>
            <div className="ec-grid">
              {/* ── Left col ── */}
              <div style={s.col}>
                {/* Name */}
                <div style={s.fieldGroup}>
                  <label style={s.label}>
                    Category Name <span style={s.required}>*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Electronics, Apparel…"
                    style={{ ...s.input, ...(errors.name ? s.inputError : {}) }}
                  />
                  {errors.name && <p style={s.errorMsg}>⚠ {errors.name}</p>}
                </div>

                {/* Description */}
                <div style={s.fieldGroup}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <label style={s.label}>
                      Description <span style={s.required}>*</span>
                    </label>
                    <span style={s.charCount}>
                      {formData.description.length} chars
                    </span>
                  </div>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe what products belong in this category…"
                    style={{
                      ...s.textarea,
                      ...(errors.description ? s.inputError : {}),
                    }}
                  />
                  {errors.description && (
                    <p style={s.errorMsg}>⚠ {errors.description}</p>
                  )}
                </div>
              </div>

              {/* ── Right col ── */}
              <div style={s.col}>
                <div style={s.fieldGroup}>
                  <label style={s.label}>
                    Cover Image
                    <span style={s.optionalTag}>
                      optional — leave unchanged to keep current
                    </span>
                  </label>

                  {previewUrl ? (
                    /* ── Preview card (existing or new) ── */
                    <div style={s.previewWrap}>
                      <img
                        src={previewUrl}
                        alt="preview"
                        style={s.previewImg}
                      />
                      <div style={s.previewInfo}>
                        {isNewImage ? (
                          <>
                            <div style={s.previewName}>
                              {formData.image?.name}
                            </div>
                            <div style={s.previewMeta}>
                              {(formData.image?.size / 1024).toFixed(0)} KB
                              &nbsp;·&nbsp;
                              {formData.image?.type.split("/")[1].toUpperCase()}
                            </div>
                            <span style={s.newBadge}>New image selected</span>
                          </>
                        ) : (
                          <>
                            <div style={s.previewName}>Current image</div>
                            <div style={s.previewMeta}>Uploaded previously</div>
                            <span style={s.existingBadge}>No changes</span>
                          </>
                        )}

                        <div
                          style={{
                            display: "flex",
                            gap: 8,
                            marginTop: 10,
                            flexWrap: "wrap",
                          }}
                        >
                          <button
                            type="button"
                            style={s.changeBtn}
                            onClick={() => fileInputRef.current?.click()}
                          >
                            {isNewImage ? "Change selection" : "Replace image"}
                          </button>
                          {isNewImage && (
                            <button
                              type="button"
                              style={s.revertBtn}
                              onClick={() => {
                                setFormData((p) => ({ ...p, image: null }));
                                if (fileInputRef.current)
                                  fileInputRef.current.value = "";
                              }}
                            >
                              Revert
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* ── Drop zone (no existing image) ── */
                    <div
                      style={{
                        ...s.dropzone,
                        ...(dragOver ? s.dropzoneActive : {}),
                        ...(errors.image ? s.dropzoneError : {}),
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOver(true);
                      }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragOver(false);
                        applyFile(e.dataTransfer.files?.[0]);
                      }}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div style={s.dropIcon}>
                        <ImagePlus size={22} color="#d97706" />
                      </div>
                      <p style={s.dropText}>
                        <strong style={{ color: "#d97706" }}>
                          Click to upload
                        </strong>{" "}
                        or drag & drop
                      </p>
                      <p style={s.dropHint}>JPG, PNG, WEBP — max 3 MB</p>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => applyFile(e.target.files?.[0])}
                    style={{ display: "none" }}
                  />
                  {errors.image && <p style={s.errorMsg}>⚠ {errors.image}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* ── Footer ── */}
          <div style={s.formFooter}>
            <span style={s.footerHint}>
              Fields marked <span style={s.required}>*</span> are required
            </span>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                onClick={() => navigate(-1)}
                style={s.cancelBtn}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={categoryMutate.isPending}
                className="ec-submit-btn"
                style={{
                  ...s.submitBtn,
                  ...(categoryMutate.isPending ? s.submitDisabled : {}),
                }}
              >
                {categoryMutate.isPending ? (
                  <>
                    <span style={s.spinner} /> Saving…
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── CSS ──────────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

  @keyframes spin       { to { transform: rotate(360deg); } }
  @keyframes fadeIn     { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
  @keyframes slideUp    { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
  @keyframes toastSlide { from { opacity:0; transform:translateX(40px); } to { opacity:1; transform:translateX(0); } }

  *, *::before, *::after { box-sizing: border-box; }

  .ec-title {
    font-family: 'Playfair Display', serif;
    font-size: 30px; font-weight: 700;
    margin: 0 0 4px; color: #f9fafb;
    letter-spacing: -0.02em;
  }
  .ec-header {
    display: flex; justify-content: space-between;
    align-items: flex-start; margin-bottom: 28px;
    flex-wrap: wrap; gap: 16px;
  }
  .ec-card-header {
    display: flex; justify-content: space-between;
    align-items: center; flex-wrap: wrap;
    gap: 14px; padding: 20px 24px;
    border-bottom: 1px solid #1f2937;
  }
  .ec-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 32px;
  }
  .ec-back-btn {
    display: inline-flex; align-items: center; gap: 7px;
    background: rgba(255,255,255,0.04); border: 1px solid #1f2937;
    color: #9ca3af; border-radius: 11px; padding: 10px 18px;
    font-size: 14px; font-weight: 600; cursor: pointer;
    font-family: 'DM Sans', sans-serif; white-space: nowrap;
    transition: background 0.2s, color 0.2s;
  }
  .ec-back-btn:hover { background: rgba(255,255,255,0.07); color: #f3f4f6; }
  .ec-submit-btn:hover:not(:disabled) { opacity: 0.88; }

  @media (max-width: 700px) {
    .ec-title  { font-size: 22px; }
    .ec-grid   { grid-template-columns: 1fr; gap: 0; }
    .ec-back-btn span { display: none; }
    .ec-back-btn { padding: 10px 12px; }
    .ec-card-header { flex-direction: column; align-items: flex-start; }
  }
  @media (max-width: 480px) {
    .ec-title { font-size: 18px; }
  }
`;

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = {
  page: {
    fontFamily: "'DM Sans', sans-serif",
    color: "#e5e7eb",
    padding: "32px 24px 80px",
    animation: "fadeIn 0.35s ease",
  },

  breadcrumb: {
    display: "flex",
    gap: 6,
    alignItems: "center",
    marginBottom: 6,
  },
  breadcrumbLink: { color: "#6b7280", fontSize: 13, cursor: "pointer" },
  breadcrumbSep: { color: "#374151" },
  breadcrumbCurrent: { color: "#d97706", fontSize: 13 },
  titleSub: { fontSize: 13, color: "#6b7280", margin: 0 },

  card: {
    background: "#111827",
    border: "1px solid #1f2937",
    borderRadius: 18,
    overflow: "hidden",
    animation: "slideUp 0.4s ease",
  },

  cardTitleWrap: { display: "flex", alignItems: "center", gap: 14 },
  cardIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    background: "rgba(217,119,6,0.12)",
    color: "#d97706",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: { fontSize: 15, fontWeight: 600, color: "#f3f4f6" },
  cardSubtitle: { fontSize: 12, color: "#6b7280", marginTop: 2 },

  slugChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    background: "#0d1117",
    border: "1px solid #1f2937",
    borderRadius: 8,
    padding: "6px 14px",
  },
  slugLabel: {
    fontSize: 10,
    fontWeight: 700,
    color: "#4b5563",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  slugValue: {
    fontSize: 12,
    color: "#9ca3af",
    fontFamily: "'Courier New', monospace",
  },

  formBody: { padding: "28px 24px" },
  col: { display: "flex", flexDirection: "column", gap: 24 },

  fieldGroup: { display: "flex", flexDirection: "column", gap: 8 },
  label: {
    fontSize: 11,
    fontWeight: 600,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  required: { color: "#d97706" },
  optionalTag: {
    fontSize: 10,
    fontWeight: 400,
    color: "#4b5563",
    textTransform: "none",
    letterSpacing: 0,
  },
  charCount: { fontSize: 11, color: "#374151" },

  input: {
    width: "100%",
    background: "#0d1117",
    border: "1.5px solid #1f2937",
    borderRadius: 10,
    padding: "11px 14px",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
    color: "#f3f4f6",
    outline: "none",
    transition: "border-color 0.2s",
  },
  textarea: {
    width: "100%",
    background: "#0d1117",
    border: "1.5px solid #1f2937",
    borderRadius: 10,
    padding: "11px 14px",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
    color: "#f3f4f6",
    outline: "none",
    resize: "none",
    minHeight: 130,
    lineHeight: 1.6,
    transition: "border-color 0.2s",
  },
  inputError: { borderColor: "rgba(239,68,68,0.5)" },
  errorMsg: { fontSize: 12, color: "#f87171", margin: 0 },

  dropzone: {
    border: "1.5px dashed #1f2937",
    borderRadius: 12,
    padding: "36px 20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    cursor: "pointer",
    textAlign: "center",
    background: "#0d1117",
    transition: "border-color 0.2s, background 0.2s",
    minHeight: 180,
  },
  dropzoneActive: {
    borderColor: "rgba(217,119,6,0.5)",
    background: "rgba(217,119,6,0.04)",
  },
  dropzoneError: { borderColor: "rgba(239,68,68,0.4)" },
  dropIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    background: "rgba(217,119,6,0.1)",
    border: "1px solid rgba(217,119,6,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  dropText: { fontSize: 14, color: "#9ca3af", margin: 0, lineHeight: 1.5 },
  dropHint: { fontSize: 11, color: "#374151", margin: 0 },

  previewWrap: {
    display: "flex",
    gap: 16,
    alignItems: "flex-start",
    background: "#0d1117",
    border: "1.5px solid #1f2937",
    borderRadius: 12,
    padding: 16,
  },
  previewImg: {
    width: 100,
    height: 100,
    objectFit: "cover",
    borderRadius: 10,
    border: "1.5px solid #1f2937",
    flexShrink: 0,
  },
  previewInfo: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    flex: 1,
    minWidth: 0,
  },
  previewName: {
    fontSize: 13,
    fontWeight: 600,
    color: "#f3f4f6",
    wordBreak: "break-all",
  },
  previewMeta: { fontSize: 11, color: "#6b7280" },

  newBadge: {
    display: "inline-block",
    fontSize: 10,
    fontWeight: 700,
    color: "#34d399",
    background: "rgba(16,185,129,0.1)",
    border: "1px solid rgba(16,185,129,0.25)",
    borderRadius: 5,
    padding: "2px 8px",
    width: "fit-content",
  },
  existingBadge: {
    display: "inline-block",
    fontSize: 10,
    fontWeight: 700,
    color: "#6b7280",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid #1f2937",
    borderRadius: 5,
    padding: "2px 8px",
    width: "fit-content",
  },

  changeBtn: {
    background: "rgba(217,119,6,0.1)",
    border: "1px solid rgba(217,119,6,0.25)",
    color: "#d97706",
    borderRadius: 7,
    padding: "5px 12px",
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    whiteSpace: "nowrap",
  },
  revertBtn: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid #1f2937",
    color: "#6b7280",
    borderRadius: 7,
    padding: "5px 12px",
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    whiteSpace: "nowrap",
  },

  formFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 24px",
    borderTop: "1px solid #1f2937",
    gap: 16,
    flexWrap: "wrap",
  },
  footerHint: { fontSize: 12, color: "#4b5563" },
  cancelBtn: {
    display: "inline-flex",
    alignItems: "center",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid #1f2937",
    color: "#9ca3af",
    borderRadius: 11,
    padding: "11px 20px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },
  submitBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    background: "#d97706",
    color: "#fff",
    border: "none",
    borderRadius: 11,
    padding: "11px 28px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    transition: "opacity 0.2s",
    whiteSpace: "nowrap",
  },
  submitDisabled: { opacity: 0.5, cursor: "not-allowed" },
  spinner: {
    display: "inline-block",
    width: 14,
    height: 14,
    border: "2px solid rgba(255,255,255,0.3)",
    borderTopColor: "#fff",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
    verticalAlign: "middle",
  },

  toastStack: {
    position: "fixed",
    top: 20,
    right: 20,
    zIndex: 1100,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    maxWidth: 340,
    width: "calc(100vw - 40px)",
  },
  toast: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "13px 16px",
    borderRadius: 12,
    border: "1px solid",
    fontSize: 14,
    fontWeight: 500,
    fontFamily: "'DM Sans', sans-serif",
    boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
    animation: "toastSlide 0.3s ease",
  },
  toastIcon: {
    width: 22,
    height: 22,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 700,
    flexShrink: 0,
    background: "rgba(255,255,255,0.1)",
  },
  toastMsg: { flex: 1, lineHeight: 1.4 },
  toastClose: {
    background: "none",
    border: "none",
    fontSize: 20,
    cursor: "pointer",
    lineHeight: 1,
    padding: 0,
    opacity: 0.7,
    flexShrink: 0,
  },
};
