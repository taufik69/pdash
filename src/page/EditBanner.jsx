import { getBannerById, updateBanner } from "@/api/api";
import { useState, useRef, useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ImagePlus, Images, ArrowLeft } from "lucide-react";

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
export default function EditBanner() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const bannerUpdateMutation = updateBanner();
  const toast = useToast();
  const fileInputRef = useRef(null);

  // Try to get banner from state if navigated from list
  const initialBanner = location.state?.banner;
  const { data, isPending: isFetching } = getBannerById(id);

  const [formData, setFormData] = useState({
    title: "",
    isActive: true,
    image: null,
    existingImageUrl: "",
  });

  const [errors, setErrors] = useState({});
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    const b = initialBanner || data?.data?.data;
    if (b) {
      setFormData({
        title: b.title || "",
        isActive: b.isActive ?? true,
        image: null,
        existingImageUrl: b.image?.url || "",
      });
    }
  }, [initialBanner, data]);

  const previewUrl = useMemo(() => {
    if (formData.image) return URL.createObjectURL(formData.image);
    return formData.existingImageUrl || "https://placehold.co/600x400/0d1117/6b7280?text=No+Preview";
  }, [formData.image, formData.existingImageUrl]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
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
    if (!formData.title.trim()) newErrors.title = "Title is required";
    
    if (formData.image) {
      const allowed = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
      if (!allowed.includes(formData.image.type))
        newErrors.image = "Only JPG, PNG or WEBP allowed";
      else if (formData.image.size > 5 * 1024 * 1024)
        newErrors.image = "Banner must be under 5 MB";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload = new FormData();
    payload.append("title", formData.title.trim());
    payload.append("isActive", formData.isActive);
    if (formData.image) {
      payload.append("image", formData.image);
    }

    console.log("Mutating banner update:", { id, payload });
    bannerUpdateMutation.mutate({ id, data: payload }, {
      onSuccess: (res) => {
        console.log("Update success:", res.data);
        toast.success("Banner updated successfully!");
        setTimeout(() => navigate("/banner-list"), 1500);
      },
      onError: (err) => {
        console.error("Update error:", err);
        toast.error(err?.response?.data?.message || "Failed to update banner.");
      },
    });
  };

  if (isFetching && !initialBanner) {
    return (
      <div style={s.page}>
        <style>{css}</style>
        <div style={s.centerState}>
          <div style={s.spinner} />
          <p style={s.stateText}>Fetching banner details…</p>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <style>{css}</style>
      <ToastStack toasts={toast.toasts} onRemove={toast.remove} />

      {/* ── Header ── */}
      <div className="ac-header">
        <div>
          <div style={s.breadcrumb}>
            <span style={s.breadcrumbLink} onClick={() => navigate("/banner-list")}>Banners</span>
            <span style={s.breadcrumbSep}>/</span>
            <span style={s.breadcrumbCurrent}>Edit</span>
          </div>
          <h1 className="ac-title">Edit Banner</h1>
          <p style={s.titleSub}>Update title, status or change the hero image.</p>
        </div>
        <button onClick={() => navigate("/banner-list")} style={s.btnBack}>
          <ArrowLeft size={16} /> Back to List
        </button>
      </div>

      {/* ── Form Card ── */}
      <div style={s.card}>
        <div className="ac-card-header">
          <div style={s.cardTitleWrap}>
            <span style={s.cardIcon}>
              <Images size={17} />
            </span>
            <div>
              <div style={s.cardTitle}>Banner Configuration</div>
              <div style={s.cardSubtitle}>Modify banner properties for ID: {id.slice(-8)}</div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={s.formBody}>
            <div className="ac-grid">
              {/* ── Left col ── */}
              <div style={s.col}>
                {/* Title */}
                <div style={s.fieldGroup}>
                  <label style={s.label}>Banner Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    style={{ ...s.input, ...(errors.title ? s.inputError : {}) }}
                  />
                  {errors.title && <p style={s.errorMsg}>⚠ {errors.title}</p>}
                </div>

                {/* Status Toggle */}
                <div style={s.fieldGroup}>
                  <label style={s.label}>Display Status</label>
                  <div style={s.toggleWrap}>
                    <input
                      type="checkbox"
                      id="isActive"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                      style={s.checkbox}
                    />
                    <label htmlFor="isActive" style={s.toggleLabel}>
                      {formData.isActive ? "Active (Visible on Homepage)" : "Inactive (Hidden)"}
                    </label>
                  </div>
                </div>
              </div>

              {/* ── Right col ── */}
              <div style={s.col}>
                <div style={s.fieldGroup}>
                  <label style={s.label}>Banner Image</label>

                  <div style={s.previewWrap}>
                    <img src={previewUrl} alt="preview" style={s.previewImg} />
                    <div style={s.previewInfo}>
                      <div style={s.previewName}>
                        {formData.image ? formData.image.name : "Current Image"}
                      </div>
                      <button
                        type="button"
                        style={s.changeBtn}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {formData.image ? "Upload Different" : "Edit Image"}
                      </button>
                      {formData.image && (
                        <button
                          type="button"
                          style={s.resetBtn}
                          onClick={() => setFormData(p => ({ ...p, image: null }))}
                        >
                          Reset to Original
                        </button>
                      )}
                    </div>
                  </div>
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
            <span style={s.footerHint}>Update will clear image cache on frontends</span>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                type="button"
                onClick={() => navigate("/banner-list")}
                style={s.cancelBtn}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={bannerUpdateMutation.isPending}
                style={{
                  ...s.submitBtn,
                  ...(bannerUpdateMutation.isPending ? s.submitDisabled : {}),
                }}
              >
                {bannerUpdateMutation.isPending ? "Updating…" : "Save Changes"}
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
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeIn { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
  @keyframes slideUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
  @keyframes toastSlide { from { opacity:0; transform:translateX(30px); } to { opacity:1; transform:translateX(0); } }

  *, *::before, *::after { box-sizing: border-box; }
  .ac-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 32px; gap: 16px; }
  .ac-title { font-size: 32px; font-weight: 800; color: var(--foreground); letter-spacing: -0.03em; margin: 0; }
  .ac-card-header { display: flex; justify-content: space-between; align-items: center; padding: 24px; border-bottom: 1px solid var(--border); }
  .ac-grid { display: grid; grid-template-columns: 1fr 1.2fr; gap: 32px; }
  
  @media (max-width: 860px) {
    .ac-grid { grid-template-columns: 1fr; gap: 24px; }
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
  centerState: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "50vh", gap: 16 },
  spinner: { width: 40, height: 40, border: "3px solid var(--border)", borderTop: "3px solid var(--foreground)", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  stateText: { color: "var(--muted-foreground)", fontSize: 14, fontWeight: 500 },
  breadcrumb: { display: "flex", gap: 8, alignItems: "center", marginBottom: 8 },
  breadcrumbLink: { color: "var(--muted-foreground)", fontSize: 13, cursor: "pointer", fontWeight: 500 },
  breadcrumbSep: { color: "var(--border)", fontSize: 12 },
  breadcrumbCurrent: { color: "var(--foreground)", fontSize: 13, fontWeight: 600 },
  titleSub: { fontSize: 14, color: "var(--muted-foreground)", margin: 0 },
  btnBack: { display: "flex", alignItems: "center", gap: 8, background: "var(--secondary)", border: "1px solid var(--border)", color: "var(--foreground)", padding: "10px 16px", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" },
  card: { background: "var(--background)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", animation: "slideUp 0.45s ease", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" },
  cardTitleWrap: { display: "flex", alignItems: "center", gap: 16 },
  cardIcon: { width: 40, height: 40, borderRadius: 10, background: "var(--secondary)", color: "var(--foreground)", display: "flex", alignItems: "center", justifyContent: "center" },
  cardTitle: { fontSize: 16, fontWeight: 700, color: "var(--foreground)" },
  cardSubtitle: { fontSize: 13, color: "var(--muted-foreground)" },
  formBody: { padding: "32px" },
  col: { display: "flex", flexDirection: "column", gap: 24 },
  fieldGroup: { display: "flex", flexDirection: "column", gap: 12 },
  label: { fontSize: 11, fontWeight: 700, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em" },
  required: { color: "var(--destructive)" },
  input: { width: "100%", background: "var(--background)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 14px", fontSize: 14, color: "var(--foreground)", outline: "none", transition: "border-color 0.2s", fontWeight: 500 },
  inputError: { borderColor: "var(--destructive)" },
  errorMsg: { fontSize: 12, color: "var(--destructive)", margin: 0, fontWeight: 500 },
  toggleWrap: { display: "flex", alignItems: "center", gap: 12, background: "var(--secondary)", padding: "12px 16px", borderRadius: 10, border: "1px solid var(--border)", cursor: "pointer" },
  checkbox: { width: 18, height: 18, accentColor: "var(--foreground)", cursor: "pointer" },
  toggleLabel: { fontSize: 14, fontWeight: 600, color: "var(--foreground)", cursor: "pointer" },
  previewWrap: { display: "flex", flexDirection: "column", gap: 16, alignItems: "center", justifyContent: "center", background: "var(--secondary)", border: "1px solid var(--border)", borderRadius: 12, padding: 24, minHeight: 220 },
  previewImg: { width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 12, border: "1px solid var(--border)", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" },
  previewInfo: { display: "flex", flexDirection: "column", gap: 8, alignItems: "center", textAlign: "center" },
  previewName: { fontSize: 13, fontWeight: 600, color: "var(--foreground)", maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis" },
  changeBtn: { background: "var(--primary)", color: "var(--primary-foreground)", border: "none", borderRadius: 8, padding: "8px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer" },
  resetBtn: { background: "none", border: "none", color: "var(--muted-foreground)", padding: 0, fontSize: 12, cursor: "pointer", fontWeight: 600, textDecoration: "underline" },
  formFooter: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px", borderTop: "1px solid var(--border)", background: "var(--background)" },
  footerHint: { fontSize: 13, color: "var(--muted-foreground)" },
  submitBtn: { background: "var(--foreground)", color: "var(--background)", border: "none", borderRadius: 10, padding: "12px 32px", fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" },
  submitDisabled: { opacity: 0.5, cursor: "not-allowed" },
  cancelBtn: { background: "var(--secondary)", border: "1px solid var(--border)", color: "var(--foreground)", padding: "12px 24px", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" },
  toastStack: { position: "fixed", top: 24, right: 24, zIndex: 1100, display: "flex", flexDirection: "column", gap: 10, maxWidth: 360 },
  toast: { display: "flex", alignItems: "center", gap: 12, padding: "14px 20px", borderRadius: 10, border: "1px solid var(--border)", fontSize: 14, fontWeight: 600, boxShadow: "0 10px 40px rgba(0,0,0,0.1)", animation: "toastSlide 0.3s ease" },
};
