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
  success: { bg: "var(--background)", color: "var(--foreground)", border: "var(--border)", icon: "✓" },
  error: { bg: "var(--background)", color: "var(--destructive)", border: "var(--border)", icon: "✕" },
  info: { bg: "var(--background)", color: "var(--foreground)", border: "var(--border)", icon: "i" },
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
        background: isHovered ? "var(--secondary)" : "transparent",
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
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeIn { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
  @keyframes slideUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
  @keyframes toastSlide { from { opacity:0; transform:translateX(30px); } to { opacity:1; transform:translateX(0); } }
  *, *::before, *::after { box-sizing: border-box; }
  ::-webkit-scrollbar { width:6px; height:6px; }
  ::-webkit-scrollbar-track { background: var(--background); }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius:3px; }

  .ct-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 32px; gap: 16px; }
  .ct-title { font-size: 32px; font-weight: 800; color: var(--foreground); letter-spacing: -0.03em; margin: 0; }
  .ct-stats { display: flex; gap: 16px; margin-bottom: 32px; }
  .ct-card-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; padding: 24px; border-bottom: 1px solid var(--border); }
  .ct-search-wrap { display: flex; align-items: center; gap: 10px; background: var(--background); border: 1px solid var(--border); border-radius: 8px; padding: 8px 16px; min-width: 300px; }
  
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
  centerState: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 16 },
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
  searchIcon: { fontSize: 14, filter: "grayscale(1)" },
  searchInput: { background: "none", border: "none", outline: "none", color: "var(--foreground)", fontSize: 14, fontWeight: 500, width: "100%" },
  searchClear: { background: "none", border: "none", color: "var(--muted-foreground)", fontSize: 20, cursor: "pointer", padding: 0 },
  tableOuterWrap: { overflowX: "auto" },
  tableHeaderWrap: { position: "sticky", top: 0, zIndex: 2, background: "var(--secondary)", borderBottom: "1px solid var(--border)" },
  tableScrollBody: { overflowY: "auto", minWidth: 700 },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "16px 20px", fontSize: 11, fontWeight: 800, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "left" },
  sortArrow: { color: "var(--foreground)", marginLeft: 4 },
  tr: { borderBottom: "1px solid var(--border)", transition: "all 0.2s ease" },
  td: { padding: "12px 20px", fontSize: 14, color: "var(--foreground)", verticalAlign: "middle", fontWeight: 500 },
  indexBadge: { display: "inline-flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, background: "var(--secondary)", borderRadius: 6, fontSize: 12, fontWeight: 700, color: "var(--foreground)" },
  catImg: { width: 44, height: 44, borderRadius: 8, objectFit: "cover", border: "1px solid var(--border)", display: "block" },
  catImgPlaceholder: { width: 44, height: 44, borderRadius: 8, background: "var(--secondary)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center" },
  nameCell: { display: "flex", flexDirection: "column", gap: 2 },
  catName: { fontSize: 14, fontWeight: 700, color: "var(--foreground)" },
  catSlug: { fontSize: 12, color: "var(--muted-foreground)", fontStyle: "italic" },
  descCell: { fontSize: 13, color: "var(--muted-foreground)", margin: 0, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" },
  actionsCell: { display: "flex", alignItems: "center", justifyContent: "center", gap: 10 },
  deleteBtn: { display: "inline-flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: 8, border: "1px solid var(--border)", cursor: "pointer", transition: "all 0.2s", background: "transparent", color: "var(--destructive)" },
  deleteBtnHover: { background: "var(--destructive)", color: "white", borderColor: "var(--destructive)" },
  btnDisabled: { opacity: 0.5, cursor: "not-allowed" },
  emptyState: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 60, textAlign: "center" },
  emptyTitle: { fontSize: 18, fontWeight: 700, color: "var(--foreground)", margin: "20px 0 8px" },
  emptyHint: { fontSize: 14, color: "var(--muted-foreground)", margin: "0 0 24px" },
  emptyBtn: { background: "var(--foreground)", color: "var(--background)", border: "none", borderRadius: 8, padding: "10px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer" },
  toastStack: { position: "fixed", top: 24, right: 24, zIndex: 1100, display: "flex", flexDirection: "column", gap: 10, maxWidth: 360 },
  toast: { display: "flex", alignItems: "center", gap: 12, padding: "14px 20px", borderRadius: 10, border: "1px solid var(--border)", fontSize: 14, fontWeight: 600, boxShadow: "0 10px 40px rgba(0,0,0,0.1)", animation: "toastSlide 0.3s ease" },
  toastIcon: { fontWeight: 700 },
  toastMsg: { flex: 1 },
  toastClose: { background: "none", border: "none", cursor: "pointer", opacity: 0.5 },
};
