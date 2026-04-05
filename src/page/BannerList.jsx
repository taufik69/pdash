import { deleteBanner, getBanners } from "@/api/api";
import { Edit2, Trash2, Images, Plus, Monitor, MonitorOff } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

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

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div style={s.statCard}>
      <div style={{ ...s.statIcon, background: accent + "18", color: accent }}>
        <Icon size={18} />
      </div>
      <div>
        <div style={s.statValue}>{value}</div>
        <div style={s.statLabel}>{label}</div>
      </div>
    </div>
  );
}

// ─── Banner Row ─────────────────────────────────────────────────────────────
function BannerRow({ banner, index, onEdit, onDelete, isDeleting }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <tr
      style={{
        ...s.tr,
        background: isHovered ? "#1a2233" : "transparent",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <td style={s.td}>
        <span style={s.indexBadge}>{index + 1}</span>
      </td>
      <td style={s.td}>
        {banner.image?.url ? (
          <img src={banner.image.url} alt={banner.title} style={s.bannerThumb} />
        ) : (
          <div style={s.bannerThumbPlaceholder}>
            <Images size={16} color="#4b5563" />
          </div>
        )}
      </td>
      <td style={s.td}>
        <div style={s.nameCell}>
          <span style={s.bannerTitle}>{banner.title}</span>
          <span style={s.bannerId}>ID: {banner._id.slice(-6)}</span>
        </div>
      </td>
      <td style={s.td}>
        {banner.isActive ? (
          <div style={{ ...s.statusBadge, color: "#34d399", background: "rgba(52,211,153,0.1)" }}>
            <Monitor size={12} style={{ marginRight: 4 }} /> Active
          </div>
        ) : (
          <div style={{ ...s.statusBadge, color: "#9ca3af", background: "rgba(156,163,175,0.1)" }}>
            <MonitorOff size={12} style={{ marginRight: 4 }} /> Inactive
          </div>
        )}
      </td>
      <td style={{ ...s.td, textAlign: "center" }}>
        <div style={s.actionsCell}>
          <button style={s.editBtn} onClick={() => { console.log('Edit clicked for', banner._id); onEdit(banner); }} title="Edit banner">
            <Edit2 size={13} />
          </button>
          <button
            style={{ ...s.deleteBtn, ...(isDeleting ? s.btnDisabled : {}) }}
            onClick={(e) => { 
                e.stopPropagation();
                console.log('Delete clicked for', banner._id); 
                onDelete(banner._id); 
            }}
            disabled={isDeleting}
            title="Delete banner"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function BannerList() {
  const navigate = useNavigate();
  const toast = useToast();

  const { data, isPending, isError } = getBanners();
  const bannerDeleteMutation = deleteBanner();

  const banners = data?.data?.data || [];

  const handleEdit = (banner) => navigate(`/edit-banner/${banner._id}`, { state: { banner } });

  const handleDelete = (id) => {
    console.log("handleDelete called for ID:", id);
    if (!window.confirm(`Are you sure you want to delete this banner (ID: ${id})?`)) {
      console.log("Delete cancelled by user.");
      return;
    }
    console.log("Propagating delete to mutation...");
    bannerDeleteMutation.mutate(id, {
      onSuccess: (res) => {
        console.log("Delete success:", res.data);
        toast.success("Banner deleted successfully.");
      },
      onError: (err) => {
        console.error("Delete error:", err);
        toast.error(err?.response?.data?.message || "Delete failed.");
      },
    });
  };

  if (isPending)
    return (
      <div style={s.page}>
        <style>{css}</style>
        <div style={s.centerState}>
          <div style={s.spinner} />
          <p style={s.stateText}>Loading banners…</p>
        </div>
      </div>
    );

  if (isError)
    return (
      <div style={s.page}>
        <style>{css}</style>
        <div style={s.centerState}>
          <span style={{ fontSize: 40 }}>⚠️</span>
          <p style={{ ...s.stateText, color: "#f87171" }}>Failed to load banners.</p>
        </div>
      </div>
    );

  return (
    <div style={s.page}>
      <style>{css}</style>
      <ToastStack toasts={toast.toasts} onRemove={toast.remove} />

      {/* ── Header ── */}
      <div className="ct-header">
        <div>
          <div style={s.breadcrumb}>
            <span style={s.breadcrumbLink}>Dashboard</span>
            <span style={s.breadcrumbSep}>/</span>
            <span style={s.breadcrumbCurrent}>Banners</span>
          </div>
          <h1 className="ct-title">Banners</h1>
          <p style={s.titleSub}>Manage your homepage slider banners.</p>
        </div>
        <button onClick={() => navigate("/add-banner")} style={s.btnAdd} className="ct-btn-add">
          <Plus size={15} />
          <span>Add Banner</span>
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="ct-stats">
        <StatCard icon={Images} label="Total Banners" value={banners?.length || 0} accent="#d97706" />
        <StatCard icon={Monitor} label="Active Banners" value={banners?.filter((b) => b.isActive)?.length || 0} accent="#34d399" />
        <StatCard icon={MonitorOff} label="Inactive" value={banners?.filter((b) => !b.isActive)?.length || 0} accent="#6b7280" />
      </div>

      {/* ── Table Card ── */}
      <div style={s.card}>
        <div className="ct-card-header">
          <div style={s.cardTitleWrap}>
            <span style={s.cardIcon}>
              <Images size={17} />
            </span>
            <div>
              <div style={s.cardTitle}>Banner List</div>
              <div style={s.cardSubtitle}>{banners?.length || 0} banners configured</div>
            </div>
          </div>
        </div>

        <div style={s.tableOuterWrap}>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={{ ...s.th, width: 50 }}>#</th>
                <th style={{ ...s.th, width: 120 }}>Preview</th>
                <th style={s.th}>Title</th>
                <th style={{ ...s.th, width: 120 }}>Status</th>
                <th style={{ ...s.th, width: 100, textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {banners.length === 0 ? (
                <tr>
                  <td colSpan="5" style={s.emptyCell}>
                    <div style={s.emptyState}>
                      <Images size={40} color="#374151" />
                      <p style={s.emptyTitle}>No banners found</p>
                      <button onClick={() => navigate("/add-banner")} style={s.emptyBtn}>
                        Create your first banner
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                banners.map((banner, i) => (
                  <BannerRow
                    key={banner._id}
                    banner={banner}
                    index={i}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    isDeleting={bannerDeleteMutation.isPending}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
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
`;

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = {
  page: { fontFamily: "'DM Sans', sans-serif", color: "#e5e7eb", padding: "32px 24px 80px", animation: "fadeIn 0.35s ease" },
  centerState: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "50vh", gap: 16 },
  spinner: { width: 40, height: 40, border: "3px solid #1f2937", borderTop: "3px solid #d97706", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  stateText: { color: "#6b7280", fontSize: 14 },
  breadcrumb: { display: "flex", gap: 6, alignItems: "center", marginBottom: 6 },
  breadcrumbLink: { color: "#6b7280", fontSize: 13, cursor: "pointer" },
  breadcrumbSep: { color: "#374151" },
  breadcrumbCurrent: { color: "#d97706", fontSize: 13 },
  titleSub: { fontSize: 13, color: "#6b7280", margin: 0 },
  btnAdd: { display: "inline-flex", alignItems: "center", gap: 7, background: "#d97706", color: "#fff", border: "none", borderRadius: 11, padding: "10px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer" },
  statCard: { display: "flex", alignItems: "center", gap: 14, background: "#111827", border: "1px solid #1f2937", borderRadius: 14, padding: "16px 20px" },
  statIcon: { width: 36, height: 36, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center" },
  statValue: { fontSize: 20, fontWeight: 700, color: "#f9fafb" },
  statLabel: { fontSize: 11, color: "#6b7280", marginTop: 2 },
  card: { background: "#111827", border: "1px solid #1f2937", borderRadius: 18, overflow: "hidden" },
  cardTitleWrap: { display: "flex", alignItems: "center", gap: 14 },
  cardIcon: { width: 34, height: 34, borderRadius: 9, background: "rgba(217,119,6,0.12)", color: "#d97706", display: "flex", alignItems: "center", justifyContent: "center" },
  cardTitle: { fontSize: 14, fontWeight: 600, color: "#f3f4f6" },
  cardSubtitle: { fontSize: 11, color: "#6b7280", marginTop: 1 },
  tableOuterWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", minWidth: 600 },
  th: { padding: "14px", fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.07em", background: "#0d1117", textAlign: "left", borderBottom: "1px solid #1f2937" },
  td: { padding: "12px 14px", fontSize: 13, color: "#d1d5db", borderBottom: "1px solid #1a2233" },
  tr: { transition: "background 0.1s ease" },
  indexBadge: { width: 24, height: 24, background: "#1f2937", borderRadius: 6, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#9ca3af" },
  bannerThumb: { width: 90, height: 50, borderRadius: 6, objectFit: "cover", border: "1px solid #1f2937" },
  bannerThumbPlaceholder: { width: 90, height: 50, background: "#1f2937", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" },
  nameCell: { display: "flex", flexDirection: "column", gap: 2 },
  bannerTitle: { fontWeight: 600, color: "#f3f4f6" },
  bannerId: { fontSize: 10, color: "#4b5563", fontFamily: "monospace" },
  statusBadge: { display: "inline-flex", alignItems: "center", padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 500 },
  actionsCell: { display: "flex", alignItems: "center", justifyContent: "center", gap: 8 },
  editBtn: { width: 30, height: 30, borderRadius: 8, border: "1px solid #1f2937", background: "none", color: "#6b7280", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  deleteBtn: { width: 30, height: 30, borderRadius: 8, border: "1px solid rgba(239,68,68,0.15)", background: "none", color: "#f87171", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  emptyCell: { padding: "80px 0" },
  emptyState: { display: "flex", flexDirection: "column", alignItems: "center", gap: 12 },
  emptyTitle: { fontSize: 14, color: "#6b7280" },
  emptyBtn: { background: "none", border: "1px solid #d97706", color: "#d97706", padding: "8px 16px", borderRadius: 8, fontSize: 12, cursor: "pointer" },
  toastStack: { position: "fixed", top: 20, right: 20, zIndex: 1100, display: "flex", flexDirection: "column", gap: 10 },
  toast: { display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 10, border: "1px solid", fontSize: 13 },
};
