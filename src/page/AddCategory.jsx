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
  success: { bg: "var(--background)", color: "var(--foreground)", border: "var(--border)", icon: "✓" },
  error: { bg: "var(--background)", color: "var(--destructive)", border: "var(--border)", icon: "✕" },
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
                        <ImagePlus size={22} color="var(--foreground)" />
                      </div>
                      <p style={s.dropText}>
                        <strong style={{ color: "var(--foreground)" }}>
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
  @keyframes spin       { to { transform: rotate(360deg); } }
  @keyframes fadeIn     { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
  @keyframes slideUp    { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
  @keyframes toastSlide { from { opacity:0; transform:translateX(30px); } to { opacity:1; transform:translateX(0); } }

  *, *::before, *::after { box-sizing: border-box; }

  .ac-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 32px; }
  .ac-title { font-size: 32px; font-weight: 800; color: var(--foreground); letter-spacing: -0.03em; margin: 0; }

  .ac-card-header {
    display: flex; justify-content: space-between; align-items: center;
    padding: 24px; border-bottom: 1px solid var(--border);
  }

  .ac-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 32px; }

  .ac-submit-btn {
    display: inline-flex; align-items: center; gap: 8px;
    background: var(--primary); color: var(--primary-foreground);
    border: none; borderRadius: 10px; padding: 12px 32px;
    font-size: 14px; font-weight: 700; cursor: pointer;
    transition: all 0.2s ease;
  }
  .ac-submit-btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }

  @media (max-width: 860px) {
    .ac-grid { grid-template-columns: 1fr; gap: 24px; }
  }
`;

const s = {
  page: {
    maxWidth: 1600,
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

  card: {
    background: "var(--background)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    overflow: "hidden",
    animation: "slideUp 0.45s ease",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
  },

  cardTitleWrap: { display: "flex", alignItems: "center", gap: 16 },
  cardIcon: {
    width: 40, height: 40, borderRadius: 10,
    background: "var(--secondary)", color: "var(--foreground)",
    display: "flex", alignItems: "center", justifyContent: "center"
  },
  cardTitle: { fontSize: 16, fontWeight: 700, color: "var(--foreground)" },
  cardSubtitle: { fontSize: 13, color: "var(--muted-foreground)" },

  formBody: { padding: "32px" },
  col: { display: "flex", flexDirection: "column", gap: 24 },

  fieldGroup: { display: "flex", flexDirection: "column", gap: 8 },
  label: { fontSize: 11, fontWeight: 700, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em" },
  required: { color: "var(--destructive)" },
  charCount: { fontSize: 11, color: "var(--muted-foreground)", fontStyle: "italic" },

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
    resize: "none",
    minHeight: 140,
    lineHeight: 1.6,
    transition: "border-color 0.2s",
    fontWeight: 500
  },
  inputError: { borderColor: "var(--destructive)" },
  errorMsg: { fontSize: 12, color: "var(--destructive)", margin: 0, fontWeight: 500 },

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
    transition: "all 0.2s",
    minHeight: 220
  },
  dropzoneActive: { borderColor: "var(--foreground)", background: "var(--secondary)" },
  dropzoneError: { borderColor: "var(--destructive)" },
  dropIcon: {
    width: 48, height: 48, borderRadius: 10,
    background: "var(--secondary)",
    display: "flex", alignItems: "center", justifyContent: "center"
  },
  dropText: { fontSize: 14, color: "var(--foreground)", margin: 0, fontWeight: 600 },
  dropHint: { fontSize: 12, color: "var(--muted-foreground)", margin: 0 },

  previewWrap: {
    display: "flex", flexDirection: "column",
    gap: 16, alignItems: "center", justifyContent: "center",
    background: "var(--secondary)",
    border: "1px solid var(--border)",
    borderRadius: 12, padding: 24,
    minHeight: 220
  },
  previewImg: {
    width: 120, height: 120,
    objectFit: "cover", borderRadius: 12,
    border: "1px solid var(--border)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
  },
  previewInfo: { display: "flex", flexDirection: "column", gap: 8, alignItems: "center", textAlign: "center" },
  previewName: { fontSize: 13, fontWeight: 600, color: "var(--foreground)", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" },
  previewSize: { fontSize: 12, color: "var(--muted-foreground)" },
  removeBtn: {
    marginTop: 4, background: "var(--destructive)",
    border: "none", color: "white",
    borderRadius: 6, padding: "6px 16px",
    fontSize: 12, fontWeight: 700,
    cursor: "pointer"
  },

  formFooter: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "24px", borderTop: "1px solid var(--border)",
    background: "var(--background)"
  },
  footerHint: { fontSize: 13, color: "var(--muted-foreground)" },
  submitDisabled: { opacity: 0.5, cursor: "not-allowed" },
  spinner: {
    display: "inline-block", width: 14, height: 14,
    border: "2px solid rgba(255,255,255,0.3)",
    borderTopColor: "white", borderRadius: "50%",
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
