import { deleteBrand, getBrand } from "@/api/api";
import { Edit2, Trash2, Layers, Plus, Star } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
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
    info: (m) => add(m, "info"),
    remove: (id) => setToasts((p) => p.filter((t) => t.id !== id)),
  };
}

const TOAST_META = {
  success: { bg: "#064e3b", color: "#6ee7b7", border: "#065f46", icon: "✓" },
  error: { bg: "#450a0a", color: "#fca5a5", border: "#7f1d1d", icon: "✕" },
  info: { bg: "#0c1a3a", color: "#93c5fd", border: "#1e3a6e", icon: "i" },
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

// ─── Virtual List ─────────────────────────────────────────────────────────────
const ROW_HEIGHT = 78;
const OVERSCAN = 5;

function useVirtualList(items, containerRef) {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(520);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    setContainerHeight(el.clientHeight);
    const ro = new ResizeObserver(() => setContainerHeight(el.clientHeight));
    ro.observe(el);
    const onScroll = () => setScrollTop(el.scrollTop);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", onScroll);
    };
  }, [containerRef]);

  const totalHeight = items.length * ROW_HEIGHT;
  const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
  const visibleCount = Math.ceil(containerHeight / ROW_HEIGHT) + OVERSCAN * 2;
  const endIndex = Math.min(items.length, startIndex + visibleCount);
  const offsetY = startIndex * ROW_HEIGHT;
  const visibleItems = items.slice(startIndex, endIndex);

  return { totalHeight, startIndex, offsetY, visibleItems };
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

// ─── Row ─────────────────────────────────────────────────────────────
function BrandRow({ cat, index, isHovered, onHover, onEdit, onDelete, isDeleting }) {
  return (
    <tr
      style={{
        ...s.tr,
        background: isHovered ? "#1a2233" : "transparent",
        height: ROW_HEIGHT,
      }}
      onMouseEnter={() => onHover(cat._id || cat.slug)}
      onMouseLeave={() => onHover(null)}
    >
      <td style={s.td}><span style={s.indexBadge}>{index + 1}</span></td>
      
      <td style={s.td}>
        {cat.image?.url ? (
          <img src={cat.image.url} alt={cat.name} style={s.catImg} />
        ) : (
           <div style={s.catImgPlaceholder}>
             <Star size={16} color="#4b5563" />
           </div>
        )}
      </td>

      <td style={s.td}>
        <div style={s.nameCell}>
          <span style={s.catName}>{cat.name}</span>
          {cat.slug && <span style={s.catSlug}>{cat.slug}</span>}
        </div>
      </td>

      <td style={s.td}>
        <p style={s.descCell}>{cat.description || "—"}</p>
      </td>

      <td style={{ ...s.td, textAlign: "center" }}>
        <div style={s.actionsCell}>
          <button
            style={{
              ...s.deleteBtn,
              ...(isHovered ? s.deleteBtnHover : {}),
              ...(isDeleting ? s.btnDisabled : {}),
            }}
            onClick={() => onDelete(cat.slug)}
            disabled={isDeleting}
            title="Delete Brand"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function BrandList() {
  const navigate = useNavigate();
  const toast = useToast();
  const scrollRef = useRef(null);

  const { data, isPending, isError } = getBrand();
  const deleteMutation = deleteBrand();

  const brands = data?.data?.data || [];

  const [search, setSearch] = useState("");
  const [hoveredRow, setHoveredRow] = useState(null);
  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState("asc");

  const filtered = brands
    .filter((c) => {
      const q = search.toLowerCase();
      return (
        c.name?.toLowerCase().includes(q) ||
        c.slug?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      let av = a[sortKey], bv = b[sortKey];

      if (typeof av === "string") av = av.toLowerCase();
      if (typeof bv === "string") bv = bv.toLowerCase();
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  const VLIST_HEIGHT = 480;
  const { totalHeight, offsetY, visibleItems, startIndex } = useVirtualList(filtered, scrollRef);

  const toggleSort = useCallback((key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  }, [sortKey]);

  const handleEdit = (cat) => {} // Not implemented right now

  const handleDelete = (slug) => {
    deleteMutation.mutate(slug, {
      onSuccess: () => toast.success("Brand deleted successfully."),
      onError: (err) => toast.error(err?.response?.data?.message || "Delete failed."),
    });
  };

  if (isPending) return (
    <div style={s.page}><style>{css}</style>
      <div style={s.centerState}>
        <div style={s.spinner} /><p style={s.stateText}>Loading brands…</p>
      </div>
    </div>
  );

  if (isError) return (
    <div style={s.page}><style>{css}</style>
      <div style={s.centerState}>
        <span style={{ fontSize: 40 }}>⚠️</span>
        <p style={{ ...s.stateText, color: "#f87171" }}>Failed to load brands.</p>
      </div>
    </div>
  );

  return (
    <div style={s.page}>
      <style>{css}</style>
      <ToastStack toasts={toast.toasts} onRemove={toast.remove} />

      <div className="ct-header">
        <div>
          <div style={s.breadcrumb}>
            <span style={s.breadcrumbLink}>Dashboard</span>
            <span style={s.breadcrumbSep}>/</span>
            <span style={s.breadcrumbCurrent}>Brands</span>
          </div>
          <h1 className="ct-title">Brands</h1>
          <p style={s.titleSub}>Manage brands — associate incoming products with known brands.</p>
        </div>
        <button onClick={() => navigate("/add-brand")} style={s.btnAdd} className="ct-btn-add">
          <Plus size={15} /><span>Add Brand</span>
        </button>
      </div>

      <div className="ct-stats">
        <StatCard icon={Star} label="Total Brands" value={brands.length} accent="#d97706" />
        <StatCard icon={Star} label="Filtered Results" value={filtered.length} accent="#818cf8" />
        <StatCard icon={Star} label="With Logos" value={brands.filter((c) => c.image?.url).length} accent="#34d399" />
      </div>

      <div style={s.card}>
        <div className="ct-card-header">
          <div style={s.cardTitleWrap}>
            <span style={s.cardIcon}><Star size={17} /></span>
            <div>
              <div style={s.cardTitle}>Brand List</div>
              <div style={s.cardSubtitle}>
                {filtered.length} of {brands.length} items
              </div>
            </div>
          </div>
          <div className="ct-search-wrap">
            <span style={s.searchIcon}>🔍</span>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, slug..." style={s.searchInput} />
            {search && <button onClick={() => setSearch("")} style={s.searchClear}>×</button>}
          </div>
        </div>

        <div style={s.tableOuterWrap}>
          <div style={s.tableHeaderWrap}>
            <table style={{ ...s.table, tableLayout: "fixed" }}>
              <colgroup>
                <col style={{ width: 46 }} />
                <col style={{ width: 70 }} />
                <col style={{ width: "30%" }} />
                <col style={{ width: "45%" }} />
                <col style={{ width: 100 }} />
              </colgroup>
              <thead>
                <tr>
                  {[
                    { label: "#", key: null },
                    { label: "Logo", key: null },
                    { label: "Name", key: "name" },
                    { label: "Description", key: null },
                    { label: "Actions", key: null },
                  ].map(({ label, key }) => (
                    <th
                      key={label}
                      style={{
                        ...s.th, ...(key ? { cursor: "pointer", userSelect: "none" } : {}),
                        ...(label === "Actions" ? { textAlign: "center" } : {}),
                      }}
                      onClick={() => key && toggleSort(key)}
                    >
                      {label}
                      {key && sortKey === key && <span style={s.sortArrow}>{sortDir === "asc" ? " ↑" : " ↓"}</span>}
                    </th>
                  ))}
                </tr>
              </thead>
            </table>
          </div>

          <div ref={scrollRef} style={{ ...s.tableScrollBody, height: VLIST_HEIGHT }}>
            {filtered.length === 0 ? (
              <div style={s.emptyState}>
                <span style={{ fontSize: 44 }}>🗂️</span>
                <p style={s.emptyTitle}>No items found</p>
                <p style={s.emptyHint}>{search ? "Try a different search term." : "Add your first brand to get started."}</p>
                {!search && <button onClick={() => navigate("/add-brand")} style={s.emptyBtn}>+ Add Brand</button>}
              </div>
            ) : (
              <div style={{ height: totalHeight, position: "relative" }}>
                <div style={{ position: "absolute", top: offsetY, left: 0, right: 0 }}>
                  <table style={{ ...s.table, tableLayout: "fixed" }}>
                    <colgroup>
                      <col style={{ width: 46 }} />
                      <col style={{ width: 70 }} />
                      <col style={{ width: "30%" }} />
                      <col style={{ width: "45%" }} />
                      <col style={{ width: 100 }} />
                    </colgroup>
                    <tbody>
                      {visibleItems.map((cat, i) => (
                        <BrandRow
                          key={cat._id || cat.slug}
                          cat={cat}
                          index={startIndex + i}
                          isHovered={hoveredRow === (cat._id || cat.slug)}
                          onHover={setHoveredRow}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          isDeleting={deleteMutation.isPending}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
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
  @keyframes toastSlide { from { opacity:0; transform:translateX(40px); } to { opacity:1; transform:translateX(0); } }
  *, *::before, *::after { box-sizing: border-box; }
  ::-webkit-scrollbar { width:6px; height:6px; }
  ::-webkit-scrollbar-track { background:#0d0d0d; }
  ::-webkit-scrollbar-thumb { background:#1f2937; border-radius:3px; }

  .ct-title { font-family: 'Playfair Display', serif; font-size: 30px; font-weight: 700; margin: 0 0 4px; color: #f9fafb; letter-spacing: -0.02em; }
  .ct-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; flex-wrap: wrap; gap: 16px; }
  .ct-stats { display: flex; gap: 16px; margin-bottom: 28px; }
  .ct-card-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px; padding: 20px 24px; border-bottom: 1px solid #1f2937; }
  .ct-search-wrap { display: flex; align-items: center; gap: 8px; background: #0d1117; border: 1.5px solid #1f2937; border-radius: 10px; padding: 8px 14px; min-width: 280px; }
  
  .ct-btn-add { display: inline-flex; align-items: center; gap: 7px; background: #d97706; color: #fff; border: none; border-radius: 11px; padding: 10px 18px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; white-space: nowrap; flex-shrink: 0; transition: opacity 0.2s; }
  .ct-btn-add:hover { opacity: 0.88; }
`;

// ─── Inline Styles ────────────────────────────────────────────────────────────
const s = {
  page: { fontFamily: "'DM Sans', sans-serif", color: "#e5e7eb", padding: "32px 24px 80px", animation: "fadeIn 0.35s ease" },
  centerState: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 16 },
  spinner: { width: 40, height: 40, border: "3px solid #1f2937", borderTop: "3px solid #d97706", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  stateText: { color: "#6b7280", fontSize: 14 },
  breadcrumb: { display: "flex", gap: 6, alignItems: "center", marginBottom: 6 },
  breadcrumbLink: { color: "#6b7280", fontSize: 13, cursor: "pointer" },
  breadcrumbSep: { color: "#374151" },
  breadcrumbCurrent: { color: "#d97706", fontSize: 13 },
  titleSub: { fontSize: 13, color: "#6b7280", margin: 0 },
  statCard: { display: "flex", alignItems: "center", flex: 1, gap: 14, background: "#111827", border: "1px solid #1f2937", borderRadius: 14, padding: "16px 20px", animation: "slideUp 0.4s ease" },
  statIcon: { width: 40, height: 40, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  statValue: { fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: "#f9fafb", lineHeight: 1 },
  statLabel: { fontSize: 12, color: "#6b7280", marginTop: 3 },
  card: { background: "#111827", border: "1px solid #1f2937", borderRadius: 18, overflow: "hidden", animation: "slideUp 0.45s ease" },
  cardTitleWrap: { display: "flex", alignItems: "center", gap: 14 },
  cardIcon: { width: 38, height: 38, borderRadius: 10, background: "rgba(217,119,6,0.12)", color: "#d97706", display: "flex", alignItems: "center", justifyContent: "center" },
  cardTitle: { fontSize: 15, fontWeight: 600, color: "#f3f4f6" },
  cardSubtitle: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  searchIcon: { fontSize: 13, flexShrink: 0 },
  searchInput: { background: "none", border: "none", outline: "none", color: "#f3f4f6", fontSize: 13, fontFamily: "'DM Sans', sans-serif", width: "100%" },
  searchClear: { background: "none", border: "none", color: "#6b7280", fontSize: 18, cursor: "pointer", padding: 0, lineHeight: 1, flexShrink: 0 },
  tableOuterWrap: { overflowX: "auto", WebkitOverflowScrolling: "touch" },
  tableHeaderWrap: { position: "sticky", top: 0, zIndex: 2, background: "#0d1117", borderBottom: "1px solid #1f2937" },
  tableScrollBody: { overflowY: "auto", WebkitOverflowScrolling: "touch", minWidth: 680 },
  table: { width: "100%", borderCollapse: "collapse", minWidth: 680 },
  th: { padding: "12px 14px", fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.07em", background: "#0d1117", whiteSpace: "nowrap" },
  sortArrow: { color: "#d97706", fontStyle: "normal" },
  tr: { borderBottom: "1px solid #1a2233", transition: "background 0.12s ease" },
  td: { padding: "0 14px", fontSize: 13, color: "#d1d5db", verticalAlign: "middle", height: ROW_HEIGHT },
  indexBadge: { display: "inline-flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, background: "#1f2937", borderRadius: 7, fontSize: 12, fontWeight: 600, color: "#9ca3af" },
  catImg: { width: 48, height: 48, borderRadius: 9, objectFit: "cover", border: "1.5px solid #1f2937", display: "block" },
  catImgPlaceholder: { width: 48, height: 48, borderRadius: 9, background: "#1f2937", border: "1.5px solid #374151", display: "flex", alignItems: "center", justifyContent: "center" },
  nameCell: { display: "flex", flexDirection: "column", gap: 2 },
  catName: { fontSize: 13, fontWeight: 600, color: "#f3f4f6", lineHeight: 1.3 },
  catSlug: { fontSize: 11, color: "#6b7280", fontFamily: "'Courier New', monospace" },
  descCell: { fontSize: 13, color: "#9ca3af", margin: 0, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" },
  actionsCell: { display: "flex", alignItems: "center", justifyContent: "center", gap: 8 },
  deleteBtn: { display: "inline-flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, borderRadius: 9, border: "none", cursor: "pointer", transition: "all 0.15s ease", outline: "none", background: "rgba(239,68,68,0.06)", color: "#f87171" },
  deleteBtnHover: { background: "rgba(239,68,68,0.15)", transform: "translateY(-1px)" },
  btnDisabled: { opacity: 0.5, cursor: "not-allowed", transform: "none" },
  emptyState: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: 40, textAlign: "center" },
  emptyTitle: { fontSize: 16, fontWeight: 600, color: "#f3f4f6", margin: "16px 0 6px" },
  emptyHint: { fontSize: 13, color: "#9ca3af", margin: "0 0 20px" },
  emptyBtn: { background: "#1f2937", color: "#f3f4f6", border: "1px solid #374151", borderRadius: 9, padding: "10px 20px", fontSize: 13, fontWeight: 500, cursor: "pointer" },
  toastStack: { position: "fixed", top: 20, right: 20, zIndex: 1100, display: "flex", flexDirection: "column", gap: 10, maxWidth: 340, width: "calc(100vw - 40px)" },
  toast: { display: "flex", alignItems: "center", gap: 10, padding: "13px 16px", borderRadius: 12, border: "1px solid", fontSize: 14, fontWeight: 500, fontFamily: "'DM Sans', sans-serif", boxShadow: "0 8px 32px rgba(0,0,0,0.5)", animation: "toastSlide 0.3s ease" },
  toastIcon: { width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0, background: "rgba(255,255,255,0.1)" },
  toastMsg: { flex: 1, lineHeight: 1.4 },
  toastClose: { background: "none", border: "none", fontSize: 20, cursor: "pointer", lineHeight: 1, padding: 0, opacity: 0.7, flexShrink: 0 },
};
