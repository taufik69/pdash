import { deleteCategory, getCategory } from "@/api/api";
import { Edit2, Trash2, Layers, Plus } from "lucide-react";
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
      <div style={{ ...s.statIcon, background: 'var(--secondary)', color: 'var(--foreground)' }}>
        <Icon size={20} />
      </div>
      <div>
        <div style={s.statValue}>{value}</div>
        <div style={s.statLabel}>{label}</div>
      </div>
    </div>
  );
}

// ─── Category Row ─────────────────────────────────────────────────────────────
function CategoryRow({
  cat,
  index,
  isHovered,
  onHover,
  onEdit,
  onDelete,
  isDeleting,
}) {
  return (
    <tr
      style={{
        ...s.tr,
        background: isHovered ? "var(--secondary)" : "transparent",
        height: ROW_HEIGHT,
        cursor: "pointer",
      }}
      onMouseEnter={() => onHover(cat._id || cat.slug)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onEdit(cat)}
    >
      {/* # */}
      <td style={s.td}>
        <span style={s.indexBadge}>{index + 1}</span>
      </td>

      {/* Image */}
      <td style={s.td}>
        {cat.image?.url ? (
          <img src={cat.image.url} alt={cat.name} style={s.catImg} />
        ) : (
          <div style={s.catImgPlaceholder}>
            <Layers size={16} color="var(--muted-foreground)" />
          </div>
        )}
      </td>

      {/* Name & Slug */}
      <td style={s.td}>
        <div style={s.nameCell}>
          <span style={s.catName}>{cat.name}</span>
          {cat.slug && <span style={s.catSlug}>{cat.slug}</span>}
        </div>
      </td>

      {/* Description */}
      <td style={s.td}>
        <p style={s.descCell}>{cat.description || "—"}</p>
      </td>

      {/* Actions */}
      <td style={{ ...s.td, textAlign: "center" }}>
        <div style={s.actionsCell}>
          <button
            style={s.editBtn}
            onClick={(e) => {
              e.stopPropagation();
              onEdit(cat);
            }}
            title="Edit category"
          >
            <Edit2 size={14} />
          </button>
          <button
            style={{
              ...s.deleteBtn,
              ...(isDeleting ? s.btnDisabled : {}),
            }}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(cat.slug);
            }}
            disabled={isDeleting}
            title="Delete category"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CategoryTable() {
  const navigate = useNavigate();
  const toast = useToast();
  const scrollRef = useRef(null);

  const { data, isPending, isError } = getCategory();
  const categoryDeleteMutation = deleteCategory();

  const categories = data?.data?.data || [];

  const [search, setSearch] = useState("");
  const [hoveredRow, setHoveredRow] = useState(null);
  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState("asc");

  // ── Filter + sort ───────────────────────────────────────────────────────────
  const filtered = categories
    .filter((c) => {
      const q = search.toLowerCase();
      return (
        c.name?.toLowerCase().includes(q) ||
        c.slug?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      let av = a[sortKey],
        bv = b[sortKey];
      if (typeof av === "string") av = av.toLowerCase();
      if (typeof bv === "string") bv = bv.toLowerCase();
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  const VLIST_HEIGHT = 480;
  const { totalHeight, offsetY, visibleItems, startIndex } = useVirtualList(
    filtered,
    scrollRef,
  );

  const toggleSort = useCallback(
    (key) => {
      if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      else {
        setSortKey(key);
        setSortDir("asc");
      }
    },
    [sortKey],
  );

  const handleEdit = (cat) =>
    navigate("/edit-category", { state: { category: cat } });

  const handleDelete = (slug) => {
    categoryDeleteMutation.mutate(slug, {
      onSuccess: () => toast.success("Category deleted successfully."),
      onError: (err) =>
        toast.error(err?.response?.data?.message || "Delete failed."),
    });
  };

  // ── Loading / Error ─────────────────────────────────────────────────────────
  if (isPending)
    return (
      <div style={s.page}>
        <style>{css}</style>
        <div style={s.centerState}>
          <div style={s.spinner} />
          <p style={s.stateText}>Loading categories…</p>
        </div>
      </div>
    );

  if (isError)
    return (
      <div style={s.page}>
        <style>{css}</style>
        <div style={s.centerState}>
          <span style={{ fontSize: 40 }}>⚠️</span>
          <p style={{ ...s.stateText, color: "#f87171" }}>
            Failed to load categories.
          </p>
        </div>
      </div>
    );

  // ── Render ──────────────────────────────────────────────────────────────────
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
            <span style={s.breadcrumbCurrent}>Categories</span>
          </div>
          <h1 className="ct-title">Categories</h1>
          <p style={s.titleSub}>
            Manage category list — edit and delete entries.
          </p>
        </div>
        <button
          onClick={() => navigate("/add-category")}
          style={s.btnAdd}
          className="ct-btn-add"
        >
          <Plus size={15} />
          <span>Add Category</span>
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div className="ct-stats">
        <StatCard
          icon={Layers}
          label="Total Categories"
          value={categories.length}
        />
        <StatCard
          icon={Layers}
          label="Filtered Results"
          value={filtered.length}
        />
        <StatCard
          icon={Layers}
          label="With Images"
          value={categories.filter((c) => c.image?.url).length}
        />
        <StatCard
          icon={Layers}
          label="No Description"
          value={categories.filter((c) => !c.description).length}
        />
      </div>

      {/* ── Table Card ── */}
      <div style={s.card}>
        {/* Card header */}
        <div className="ct-card-header">
          <div style={s.cardTitleWrap}>
            <span style={s.cardIcon}>
              <Layers size={17} />
            </span>
            <div>
              <div style={s.cardTitle}>Category List</div>
              <div style={s.cardSubtitle}>
                {filtered.length} of {categories.length} categories
                {filtered.length !== categories.length && " (filtered)"}
                {" · "}
                <span style={{ color: "#d97706" }}>virtualised</span>
              </div>
            </div>
          </div>
          <div className="ct-search-wrap">
            <span style={s.searchIcon}>🔍</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, slug, description…"
              style={s.searchInput}
            />
            {search && (
              <button onClick={() => setSearch("")} style={s.searchClear}>
                ×
              </button>
            )}
          </div>
        </div>

        {/* ── Virtualised Table ── */}
        <div style={s.tableOuterWrap}>
          {/* Fixed header */}
          <div style={s.tableHeaderWrap}>
            <table style={{ ...s.table, tableLayout: "fixed" }}>
              <colgroup>
                <col style={{ width: 46 }} />
                <col style={{ width: 70 }} />
                <col style={{ width: "25%" }} />
                <col style={{ width: "45%" }} />
                <col style={{ width: 100 }} />
              </colgroup>
              <thead>
                <tr>
                  {[
                    { label: "#", key: null },
                    { label: "Image", key: null },
                    { label: "Name", key: "name" },
                    { label: "Description", key: null },
                    { label: "Actions", key: null },
                  ].map(({ label, key }) => (
                    <th
                      key={label}
                      style={{
                        ...s.th,
                        ...(key
                          ? { cursor: "pointer", userSelect: "none" }
                          : {}),
                        ...(label === "Actions" ? { textAlign: "center" } : {}),
                      }}
                      onClick={() => key && toggleSort(key)}
                    >
                      {label}
                      {key && sortKey === key && (
                        <span style={s.sortArrow}>
                          {sortDir === "asc" ? " ↑" : " ↓"}
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
            </table>
          </div>

          {/* Scrollable body */}
          <div
            ref={scrollRef}
            style={{ ...s.tableScrollBody, height: VLIST_HEIGHT }}
          >
            {filtered.length === 0 ? (
              <div style={s.emptyState}>
                <span style={{ fontSize: 44 }}>🗂️</span>
                <p style={s.emptyTitle}>No categories found</p>
                <p style={s.emptyHint}>
                  {search
                    ? "Try a different search term."
                    : "Add your first category to get started."}
                </p>
                {!search && (
                  <button
                    onClick={() => navigate("/add-category")}
                    style={s.emptyBtn}
                  >
                    + Add Category
                  </button>
                )}
              </div>
            ) : (
              <div style={{ height: totalHeight, position: "relative" }}>
                <div
                  style={{
                    position: "absolute",
                    top: offsetY,
                    left: 0,
                    right: 0,
                  }}
                >
                  <table style={{ ...s.table, tableLayout: "fixed" }}>
                    <colgroup>
                      <col style={{ width: 46 }} />
                      <col style={{ width: 70 }} />
                      <col style={{ width: "25%" }} />
                      <col style={{ width: "45%" }} />
                      <col style={{ width: 100 }} />
                    </colgroup>
                    <tbody>
                      {visibleItems.map((cat, i) => (
                        <CategoryRow
                          key={cat._id || cat.slug}
                          cat={cat}
                          index={startIndex + i}
                          isHovered={hoveredRow === (cat._id || cat.slug)}
                          onHover={setHoveredRow}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          isDeleting={categoryDeleteMutation.isPending}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="ct-table-footer">
          Showing{" "}
          <strong style={{ color: "var(--foreground)" }}>{filtered.length}</strong>{" "}
          categories
          {filtered.length !== categories.length && (
            <>
              {" "}
              ·{" "}
              <strong style={{ color: "var(--foreground)" }}>
                {categories.length - filtered.length}
              </strong>{" "}
              hidden by filter
            </>
          )}
          <span style={s.footerVirt}>· Only visible rows rendered</span>
        </div>
      </div>
    </div>
  );
}

// ─── CSS ──────────────────────────────────────────────────────────────────────
const css = `
  @keyframes spin       { to { transform: rotate(360deg); } }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes toastSlide {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
`;

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = {
  page: { 
    maxWidth: 1200, 
    margin: "0 auto",
    padding: "32px 24px 80px",
    fontFamily: "'Inter', sans-serif"
  },
  centerState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "60vh",
    gap: 16,
  },
  spinner: {
    width: 32,
    height: 32,
    border: "3px solid var(--secondary)",
    borderTop: "3px solid var(--foreground)",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  stateText: { color: "var(--muted-foreground)", fontSize: 14 },

  breadcrumb: {
    display: "flex",
    gap: 8,
    alignItems: "center",
    marginBottom: 8,
  },
  breadcrumbLink: { color: "var(--muted-foreground)", fontSize: 13, cursor: "pointer", fontWeight: 500 },
  breadcrumbSep: { color: "var(--border)", fontSize: 12 },
  breadcrumbCurrent: { color: "var(--foreground)", fontSize: 13, fontWeight: 600 },
  titleSub: { fontSize: 14, color: "var(--muted-foreground)", margin: 0, fontWeight: 400 },

  statCard: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    background: "var(--background)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    padding: "20px 24px",
    animation: "slideUp 0.4s ease",
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 800,
    color: "var(--foreground)",
    lineHeight: 1,
    letterSpacing: "-0.02em",
  },
  statLabel: { fontSize: 13, color: "var(--muted-foreground)", marginTop: 4, fontWeight: 500 },

  card: {
    background: "var(--background)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    overflow: "hidden",
    animation: "slideUp 0.45s ease",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },
  cardTitleWrap: { display: "flex", alignItems: "center", gap: 14 },
  cardIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    background: "var(--secondary)",
    color: "var(--foreground)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: { fontSize: 16, fontWeight: 700, color: "var(--foreground)", letterSpacing: "-0.01em" },
  cardSubtitle: { fontSize: 13, color: "var(--muted-foreground)", marginTop: 3 },

  searchIcon: { fontSize: 14, opacity: 0.5 },
  searchInput: {
    background: "none",
    border: "none",
    outline: "none",
    color: "var(--foreground)",
    fontSize: 14,
    width: "100%",
    fontWeight: 500,
  },
  searchClear: {
    background: "none",
    border: "none",
    color: "var(--muted-foreground)",
    fontSize: 18,
    cursor: "pointer",
    padding: 0,
    lineHeight: 1,
    flexShrink: 0,
  },

  tableOuterWrap: { overflowX: "auto" },
  tableHeaderWrap: {
    position: "sticky",
    top: 0,
    zIndex: 2,
    background: "var(--background)",
    borderBottom: "1px solid var(--border)",
  },
  tableScrollBody: {
    overflowY: "auto",
    minWidth: 800,
  },
  table: { width: "100%", borderCollapse: "collapse" },

  th: {
    padding: "14px 16px",
    fontSize: 12,
    fontWeight: 600,
    color: "var(--muted-foreground)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    textAlign: "left",
  },
  sortArrow: { color: "var(--foreground)", fontStyle: "normal" },

  tr: {
    borderBottom: "1px solid var(--border)",
    transition: "background 0.2s ease",
  },
  td: {
    padding: "0 16px",
    fontSize: 14,
    color: "var(--foreground)",
    verticalAlign: "middle",
    height: ROW_HEIGHT,
  },

  indexBadge: {
    fontSize: 12,
    fontWeight: 600,
    color: "var(--muted-foreground)",
  },

  catImg: {
    width: 44,
    height: 44,
    borderRadius: 8,
    objectFit: "cover",
    border: "1px solid var(--border)",
    display: "block",
  },
  catImgPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 8,
    background: "var(--secondary)",
    border: "1px solid var(--border)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  nameCell: { display: "flex", flexDirection: "column", gap: 1 },
  catName: { fontSize: 14, fontWeight: 600, color: "var(--foreground)", lineHeight: 1.4 },
  catSlug: {
    fontSize: 12,
    color: "var(--muted-foreground)",
    fontWeight: 500,
  },

  descCell: {
    fontSize: 13,
    color: "#9ca3af",
    margin: 0,
    lineHeight: 1.5,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },

  actionsCell: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  editBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 34,
    height: 34,
    borderRadius: 9,
    background: "var(--secondary)",
    border: "1px solid var(--border)",
    color: "var(--foreground)",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  editBtnHover: {
    background: "var(--accent)",
  },

  deleteBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 34,
    height: 34,
    borderRadius: 9,
    background: "var(--secondary)",
    border: "1px solid var(--border)",
    color: "var(--destructive)",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  deleteBtnHover: {
    background: "var(--destructive-foreground)",
  },
  btnDisabled: { opacity: 0.45, cursor: "not-allowed", transform: "none" },

  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: "100%",
    padding: "60px 24px",
  },
  emptyTitle: { fontSize: 15, fontWeight: 600, color: "#9ca3af", margin: 0 },
  emptyHint: { fontSize: 12, color: "#4b5563", margin: 0 },
  emptyBtn: {
    marginTop: 6,
    padding: "8px 20px",
    background: "rgba(217,119,6,0.12)",
    border: "1px solid rgba(217,119,6,0.3)",
    color: "#d97706",
    borderRadius: 9,
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },

  footerVirt: { color: "#374151", marginLeft: 8, fontStyle: "italic" },
  btnAdd: {},

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
