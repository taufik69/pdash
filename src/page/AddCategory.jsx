import { createCategory } from "@/api/api";
import { useState, useRef, useMemo } from "react";
import { ImagePlus, Tag } from "lucide-react";

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
export default function AddCategory() {
  const categoryMutate = createCategory();
  const toast = useToast();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: null,
  });
  const [errors, setErrors] = useState({});
  const [dragOver, setDragOver] = useState(false);

  const previewUrl = useMemo(() => {
    if (!formData.image) return "";
    return URL.createObjectURL(formData.image);
  }, [formData.image]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const applyFile = (file) => {
    if (!file) return;
    setFormData((prev) => ({ ...prev, image: file }));
    if (errors.image) setErrors((prev) => ({ ...prev, image: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    else if (formData.description.trim().length < 10)
      newErrors.description = "At least 10 characters required";
    if (!formData.image) newErrors.image = "Image is required";
    else {
      const allowed = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
      if (!allowed.includes(formData.image.type))
        newErrors.image = "Only JPG, PNG or WEBP allowed";
      else if (formData.image.size > 3 * 1024 * 1024)
        newErrors.image = "Image must be under 3 MB";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fix the errors before submitting.");
      return;
    }

    const payload = new FormData();
    payload.append("name", formData.name.trim());
    payload.append("description", formData.description.trim());
    payload.append("image", formData.image);

    categoryMutate.mutate(payload, {
      onSuccess: () => {
        setFormData({ name: "", description: "", image: null });
        setErrors({});
        if (fileInputRef.current) fileInputRef.current.value = "";
        toast.success("Category created successfully!");
      },
      onError: () => {
        toast.error("Failed to create category. Please try again.");
      },
    });
  };

  return (
    <div style={s.page}>
      <style>{css}</style>
      <ToastStack toasts={toast.toasts} onRemove={toast.remove} />

      {/* ── Header ── */}
      <div className="ac-header">
        <div>
          <div style={s.breadcrumb}>
            <span style={s.breadcrumbLink}>Dashboard</span>
            <span style={s.breadcrumbSep}>/</span>
            <span style={s.breadcrumbCurrent}>Categories</span>
            <span style={s.breadcrumbSep}>/</span>
            <span style={s.breadcrumbCurrent}>Add</span>
          </div>
          <h1 className="ac-title">Add Category</h1>
          <p style={s.titleSub}>
            Create a new category for your product catalogue.
          </p>
        </div>
      </div>

      {/* ── Form Card ── */}
      <div style={s.card}>
        {/* Card header */}
        <div className="ac-card-header">
          <div style={s.cardTitleWrap}>
            <span style={s.cardIcon}>
              <Tag size={17} />
            </span>
            <div>
              <div style={s.cardTitle}>Category Details</div>
              <div style={s.cardSubtitle}>
                Fill in all required fields to create a category
              </div>
            </div>
          </div>
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit}>
          <div style={s.formBody}>
            <div className="ac-grid">
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
                    Cover Image <span style={s.required}>*</span>
                  </label>

                  {previewUrl ? (
                    <div style={s.previewWrap}>
                      <img
                        src={previewUrl}
                        alt="preview"
                        style={s.previewImg}
                      />
                      <div style={s.previewInfo}>
                        <div style={s.previewName}>{formData.image?.name}</div>
                        <div style={s.previewSize}>
                          {(formData.image?.size / 1024).toFixed(0)} KB
                          &nbsp;·&nbsp;
                          {formData.image?.type.split("/")[1].toUpperCase()}
                        </div>
                        <button
                          type="button"
                          style={s.removeBtn}
                          onClick={() => {
                            setFormData((prev) => ({ ...prev, image: null }));
                            if (fileInputRef.current)
                              fileInputRef.current.value = "";
                          }}
                        >
                          Remove image
                        </button>
                      </div>
                    </div>
                  ) : (
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
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => applyFile(e.target.files?.[0])}
                        style={{ display: "none" }}
                      />
                    </div>
                  )}
                  {errors.image && <p style={s.errorMsg}>⚠ {errors.image}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* ── Footer / Submit ── */}
          <div style={s.formFooter}>
            <span style={s.footerHint}>
              Fields marked <span style={s.required}>*</span> are required
            </span>
            <button
              type="submit"
              disabled={categoryMutate.isPending}
              className="ac-submit-btn"
              style={{
                ...s.submitBtn,
                ...(categoryMutate.isPending ? s.submitDisabled : {}),
              }}
            >
              {categoryMutate.isPending ? (
                <>
                  <span style={s.spinner} /> Creating…
                </>
              ) : (
                "Create Category"
              )}
            </button>
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

  .ac-title {
    font-family: 'Playfair Display', serif;
    font-size: 30px;
    font-weight: 700;
    margin: 0 0 4px;
    color: #f9fafb;
    letter-spacing: -0.02em;
  }

  .ac-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 28px;
    flex-wrap: wrap;
    gap: 16px;
  }

  .ac-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 14px;
    padding: 20px 24px;
    border-bottom: 1px solid #1f2937;
  }

  .ac-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 32px;
  }

  .ac-submit-btn:hover:not(:disabled) { opacity: 0.88; }

  @media (max-width: 700px) {
    .ac-title  { font-size: 22px; }
    .ac-grid   { grid-template-columns: 1fr; gap: 0; }
  }
  @media (max-width: 480px) {
    .ac-title  { font-size: 18px; }
  }
`;

// ─── Inline Styles ────────────────────────────────────────────────────────────
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

  formBody: { padding: "28px 24px" },
  col: { display: "flex", flexDirection: "column", gap: 24 },

  fieldGroup: { display: "flex", flexDirection: "column", gap: 8 },
  label: {
    fontSize: 11,
    fontWeight: 600,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "0.07em",
  },
  required: { color: "#d97706" },
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
  dropHint: {
    fontSize: 11,
    color: "#374151",
    margin: 0,
    letterSpacing: "0.04em",
  },

  previewWrap: {
    display: "flex",
    gap: 16,
    alignItems: "flex-start",
    background: "#0d1117",
    border: "1.5px solid #1f2937",
    borderRadius: 12,
    padding: 14,
  },
  previewImg: {
    width: 90,
    height: 90,
    objectFit: "cover",
    borderRadius: 9,
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
  previewSize: { fontSize: 11, color: "#6b7280" },
  removeBtn: {
    marginTop: 6,
    background: "rgba(239,68,68,0.1)",
    border: "1px solid rgba(239,68,68,0.25)",
    color: "#f87171",
    borderRadius: 7,
    padding: "5px 12px",
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    width: "fit-content",
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
