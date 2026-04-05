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
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeIn { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
  @keyframes slideUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
`;

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = {
  page: { fontFamily: "'DM Sans', sans-serif", color: "#e5e7eb", padding: "32px 24px 80px", animation: "fadeIn 0.35s ease" },
  centerState: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "50vh", gap: 16 },
  spinner: { width: 32, height: 32, border: "3px solid #1f2937", borderTopColor: "#d97706", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  stateText: { color: "#6b7280", fontSize: 13 },
  breadcrumb: { display: "flex", gap: 6, alignItems: "center", marginBottom: 6 },
  breadcrumbLink: { color: "#6b7280", fontSize: 13, cursor: "pointer" },
  breadcrumbSep: { color: "#374151" },
  breadcrumbCurrent: { color: "#d97706", fontSize: 13 },
  ac_header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 },
  ac_title: { fontFamily: "'Playfair Display', serif", fontSize: 28, margin: 0, color: "#f9fafb" },
  titleSub: { fontSize: 13, color: "#6b7280", margin: "4px 0 0" },
  btnBack: { display: "flex", alignItems: "center", gap: 6, background: "none", border: "1px solid #1f2937", color: "#6b7280", padding: "8px 14px", borderRadius: 9, fontSize: 12, cursor: "pointer" },
  card: { background: "#111827", border: "1px solid #1f2937", borderRadius: 18, overflow: "hidden", animation: "slideUp 0.4s ease" },
  cardTitleWrap: { display: "flex", alignItems: "center", gap: 14 },
  cardIcon: { width: 38, height: 38, borderRadius: 10, background: "rgba(217,119,6,0.12)", color: "#d97706", display: "flex", alignItems: "center", justifyContent: "center" },
  cardTitle: { fontSize: 14, fontWeight: 600, color: "#f3f4f6" },
  cardSubtitle: { fontSize: 11, color: "#6b7280", marginTop: 2 },
  formBody: { padding: "28px 24px" },
  ac_grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 },
  col: { display: "flex", flexDirection: "column", gap: 24 },
  fieldGroup: { display: "flex", flexDirection: "column", gap: 8 },
  label: { fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em" },
  input: { width: "100%", background: "#0d1117", border: "1.5px solid #1f2937", borderRadius: 10, padding: "11px 14px", color: "#f3f4f6", fontSize: 14, outline: "none" },
  inputError: { borderColor: "rgba(239,68,68,0.4)" },
  errorMsg: { fontSize: 11, color: "#f87171", margin: 0 },
  toggleWrap: { display: "flex", alignItems: "center", gap: 12, marginTop: 4 },
  checkbox: { width: 18, height: 18, accentColor: "#d97706", cursor: "pointer" },
  toggleLabel: { fontSize: 14, color: "#9ca3af", cursor: "pointer" },
  previewWrap: { display: "flex", gap: 16, alignItems: "flex-start", background: "#0d1117", border: "1.5px solid #1f2937", borderRadius: 12, padding: 14 },
  previewImg: { width: 130, height: 74, objectFit: "cover", borderRadius: 7 },
  previewInfo: { display: "flex", flexDirection: "column", gap: 6, flex: 1 },
  previewName: { fontSize: 12, fontWeight: 600, color: "#f3f4f6", wordBreak: "break-all" },
  changeBtn: { background: "rgba(217,119,6,0.1)", border: "1px solid rgba(217,119,6,0.2)", color: "#d97706", borderRadius: 6, padding: "5px 12px", fontSize: 11, cursor: "pointer", width: "fit-content" },
  resetBtn: { background: "none", border: "none", color: "#6b7280", padding: 0, fontSize: 10, cursor: "pointer", width: "fit-content", textDecoration: "underline" },
  formFooter: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderTop: "1px solid #1f2937" },
  footerHint: { fontSize: 11, color: "#4b5563" },
  submitBtn: { background: "#d97706", color: "#fff", border: "none", borderRadius: 9, padding: "11px 24px", fontSize: 13, fontWeight: 600, cursor: "pointer" },
  submitDisabled: { opacity: 0.5, cursor: "not-allowed" },
  cancelBtn: { background: "none", border: "1px solid #1f2937", color: "#6b7280", padding: "11px 24px", borderRadius: 9, fontSize: 13, cursor: "pointer" },
  toastStack: { position: "fixed", top: 20, right: 20, zIndex: 1100, display: "flex", flexDirection: "column", gap: 10 },
  toast: { display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 10, border: "1px solid", fontSize: 13 },
};
