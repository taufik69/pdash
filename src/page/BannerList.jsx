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

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value }) {
  return (
    <div style={s.statCard}>
      <div style={s.statIcon}>
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
        background: isHovered ? "var(--secondary)" : "transparent",
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
          <div style={{ ...s.statusBadge, color: "var(--success)", background: "var(--secondary)" }}>
            <Monitor size={12} style={{ marginRight: 4 }} /> Active
          </div>
        ) : (
          <div style={{ ...s.statusBadge, color: "var(--muted-foreground)", background: "var(--secondary)" }}>
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
        <StatCard icon={Images} label="Total Banners" value={banners?.length || 0} />
        <StatCard icon={Monitor} label="Active Banners" value={banners?.filter((b) => b.isActive)?.length || 0}/>
        <StatCard icon={MonitorOff} label="Inactive" value={banners?.filter((b) => !b.isActive)?.length || 0} />
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
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeIn { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
  @keyframes slideUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
  @keyframes toastSlide { from { opacity:0; transform:translateX(30px); } to { opacity:1; transform:translateX(0); } }

  .ct-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 32px; gap: 16px; }
  .ct-title { font-size: 32px; font-weight: 800; color: var(--foreground); letter-spacing: -0.03em; margin: 0; }
  .ct-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    margin-bottom: 32px;
  }
  .ct-card-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; padding: 24px; border-bottom: 1px solid var(--border); }
  
  .ct-btn-add { 
    display: inline-flex; align-items: center; gap: 8px; 
    background: var(--primary); color: var(--primary-foreground); 
    border: none; border-radius: 10px; padding: 10px 20px; 
    font-size: 14px; font-weight: 700; cursor: pointer; 
    transition: all 0.2s; 
  }
  .ct-btn-add:hover { opacity: 0.9; transform: translateY(-1px); }
`;

const s = {
  page: { fontFamily: "'Inter', sans-serif", color: "var(--foreground)", padding: "32px 24px 80px", animation: "fadeIn 0.4s ease" },
  centerState: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "50vh", gap: 16 },
  spinner: { width: 40, height: 40, border: "3px solid var(--border)", borderTop: "3px solid var(--foreground)", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  stateText: { color: "var(--muted-foreground)", fontSize: 14, fontWeight: 500 },
  breadcrumb: { display: "flex", gap: 8, alignItems: "center", marginBottom: 8 },
  breadcrumbLink: { color: "var(--muted-foreground)", fontSize: 13, cursor: "pointer", fontWeight: 500 },
  breadcrumbSep: { color: "var(--border)", fontSize: 12 },
  breadcrumbCurrent: { color: "var(--foreground)", fontSize: 13, fontWeight: 600 },
  titleSub: { fontSize: 14, color: "var(--muted-foreground)", margin: 0 },
  statCard: { 
    display: "flex", alignItems: "center", flex: 1, gap: 16, 
    background: "var(--background)", border: "1px solid var(--border)", 
    borderRadius: 12, padding: "20px", animation: "slideUp 0.4s ease",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
  },
  statIcon: { 
    width: 44, height: 44, borderRadius: 10, 
    display: "flex", alignItems: "center", justifyContent: "center", 
    flexShrink: 0, background: "var(--secondary)", color: "var(--foreground)" 
  },
  statValue: { fontSize: 24, fontWeight: 800, color: "var(--foreground)", lineHeight: 1, letterSpacing: "-0.02em" },
  statLabel: { fontSize: 12, color: "var(--muted-foreground)", marginTop: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" },
  card: { background: "var(--background)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", animation: "slideUp 0.45s ease" },
  cardTitleWrap: { display: "flex", alignItems: "center", gap: 16 },
  cardIcon: { 
    width: 40, height: 40, borderRadius: 10, 
    background: "var(--secondary)", color: "var(--foreground)", 
    display: "flex", alignItems: "center", justifyContent: "center" 
  },
  cardTitle: { fontSize: 16, fontWeight: 700, color: "var(--foreground)" },
  cardSubtitle: { fontSize: 13, color: "var(--muted-foreground)" },
  tableOuterWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "16px 20px", fontSize: 11, fontWeight: 800, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "left", background: "var(--secondary)", borderBottom: "1px solid var(--border)" },
  td: { padding: "16px 20px", fontSize: 14, color: "var(--foreground)", borderBottom: "1px solid var(--border)", fontWeight: 500 },
  tr: { transition: "all 0.2s ease" },
  indexBadge: { width: 28, height: 28, background: "var(--secondary)", borderRadius: 6, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "var(--foreground)" },
  bannerThumb: { width: 120, height: 60, borderRadius: 8, objectFit: "cover", border: "1px solid var(--border)", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" },
  bannerThumbPlaceholder: { width: 120, height: 60, background: "var(--secondary)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border)" },
  nameCell: { display: "flex", flexDirection: "column", gap: 2 },
  bannerTitle: { fontSize: 14, fontWeight: 700, color: "var(--foreground)" },
  bannerId: { fontSize: 12, color: "var(--muted-foreground)", fontStyle: "italic" },
  statusBadge: { display: "inline-flex", alignItems: "center", padding: "6px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.03em" },
  actionsCell: { display: "flex", alignItems: "center", justifyContent: "center", gap: 10 },
  editBtn: { width: 36, height: 36, borderRadius: 8, border: "1px solid var(--border)", background: "var(--secondary)", color: "var(--foreground)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" },
  deleteBtn: { width: 36, height: 36, borderRadius: 8, border: "1px solid var(--border)", background: "var(--secondary)", color: "var(--destructive)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" },
  btnDisabled: { opacity: 0.5, cursor: "not-allowed" },
  emptyCell: { padding: "100px 0" },
  emptyState: { display: "flex", flexDirection: "column", alignItems: "center", gap: 16 },
  emptyTitle: { fontSize: 18, fontWeight: 700, color: "var(--muted-foreground)" },
  emptyBtn: { background: "var(--foreground)", color: "var(--background)", border: "none", padding: "10px 24px", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer" },
  toastStack: { position: "fixed", top: 24, right: 24, zIndex: 1100, display: "flex", flexDirection: "column", gap: 10, maxWidth: 360 },
  toast: { display: "flex", alignItems: "center", gap: 12, padding: "14px 20px", borderRadius: 10, border: "1px solid var(--border)", fontSize: 14, fontWeight: 600, boxShadow: "0 10px 40px rgba(0,0,0,0.1)", animation: "toastSlide 0.3s ease" },
};
