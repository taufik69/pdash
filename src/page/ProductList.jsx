import { getProducts, deleteProduct } from "@/api/api";
import {
  Edit2,
  Trash2,
  Package,
  Layers,
  DollarSign,
  AlertTriangle,
  Plus,
  X,
  Tag,
  Hash,
  BarChart2,
  ShoppingBag,
} from "lucide-react";
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

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
function ConfirmDialog({ open, onConfirm, onCancel, productName }) {
  if (!open) return null;
  return (
    <div style={s.dialogOverlay}>
      <div style={s.dialog}>
        <div style={s.dialogIcon}>
          <AlertTriangle size={24} color="#f87171" />
        </div>
        <div style={s.dialogTitle}>Delete Product</div>
        <div style={s.dialogMsg}>
          Are you sure you want to delete{" "}
          <strong style={{ color: "#f3f4f6" }}>{productName}</strong>? This
          action cannot be undone.
        </div>
        <div style={s.dialogActions}>
          <button onClick={onCancel} style={s.dialogCancel}>
            Cancel
          </button>
          <button onClick={onConfirm} style={s.dialogConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Product Detail Modal ─────────────────────────────────────────────────────
const FLAGS = [
  {
    key: "isNew",
    label: "New",
    bg: "oklch(0.7 0.15 150 / 0.15)",
    color: "oklch(0.7 0.15 150)",
    border: "oklch(0.7 0.15 150 / 0.3)",
  },
  {
    key: "isSale",
    label: "Sale",
    bg: "var(--destructive-foreground)",
    color: "var(--destructive)",
    border: "var(--destructive)",
  },
  {
    key: "isLimited",
    label: "Limited",
    bg: "oklch(0.7 0.15 80 / 0.15)",
    color: "oklch(0.7 0.15 80)",
    border: "oklch(0.7 0.15 80 / 0.3)",
  },
  {
    key: "isHot",
    label: "Hot",
    bg: "oklch(0.6 0.15 40 / 0.15)",
    color: "oklch(0.6 0.15 40)",
    border: "oklch(0.6 0.15 40 / 0.3)",
  },
  {
    key: "isFeatured",
    label: "Featured",
    bg: "oklch(0.6 0.15 250 / 0.15)",
    color: "oklch(0.6 0.15 250)",
    border: "oklch(0.6 0.15 250 / 0.3)",
  },
  {
    key: "isBestSelling",
    label: "Best Selling",
    bg: "oklch(0.7 0.15 60 / 0.15)",
    color: "oklch(0.7 0.15 60)",
    border: "oklch(0.7 0.15 60 / 0.3)",
  },
];

function ProductDetailModal({ prod, onClose, onEdit }) {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!prod) return null;

  const activeFlags = FLAGS.filter((f) => prod[f.key]);
  const effectivePrice =
    prod.discountValue > 0
      ? prod.discountType === "percentage"
        ? Number(prod.price) * (1 - prod.discountValue / 100)
        : Number(prod.price) - prod.discountValue
      : null;

  return (
    <div style={s.dialogOverlay} onClick={onClose}>
      <div style={s.detailModal} onClick={(e) => e.stopPropagation()}>
        {/* Close */}
        <button style={s.detailClose} onClick={onClose} title="Close">
          <X size={16} />
        </button>

        {/* Top strip: image + headline */}
        <div style={s.detailTop}>
          {prod.image?.[0]?.url ? (
            <img src={prod.image[0].url} alt={prod.name} style={s.detailImg} />
          ) : (
            <div style={s.detailImgPlaceholder}>
              <Package size={36} color="#374151" />
            </div>
          )}
          <div style={s.detailHeadline}>
            <div style={s.detailName}>{prod.name}</div>
            {prod.brand && <div style={s.detailBrand}>{prod.brand}</div>}
            {/* Flags */}
            {activeFlags.length > 0 && (
              <div style={s.detailFlags}>
                {activeFlags.map((f) => (
                  <span
                    key={f.key}
                    style={{
                      ...s.flagChip,
                      background: f.bg,
                      color: f.color,
                      border: `1px solid ${f.border}`,
                    }}
                  >
                    {f.label}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div style={s.detailDivider} />

        {/* Info grid */}
        <div style={s.detailGrid}>
          <DetailField
            icon={<Tag size={13} />}
            label="Category"
            value={prod.category?.name || "—"}
          />
          <DetailField
            icon={<Hash size={13} />}
            label="SKU"
            value={prod.sku || "—"}
            mono
          />
          <DetailField
            icon={<DollarSign size={13} />}
            label="Price"
            value={
              <span>
                <span style={{ color: "var(--foreground)", fontWeight: 700 }}>
                  ${Number(prod.price).toFixed(2)}
                </span>
                {effectivePrice !== null && (
                  <span
                    style={{ color: "var(--success)", fontSize: 11, marginLeft: 6 }}
                  >
                    → ${effectivePrice.toFixed(2)} after discount
                  </span>
                )}
              </span>
            }
          />
          <DetailField
            icon={<BarChart2 size={13} />}
            label="Stock"
            value={
              prod.stock === 0 ? (
                <span style={{ color: "var(--destructive)", fontWeight: 600 }}>
                  Out of Stock
                </span>
              ) : (
                <span
                  style={{
                    color: prod.stock < 10 ? "oklch(0.7 0.15 80)" : "var(--success)",
                    fontWeight: 600,
                  }}
                >
                  {prod.stock} units
                </span>
              )
            }
          />
          {prod.discountValue > 0 && (
            <DetailField
              icon={<ShoppingBag size={13} />}
              label="Discount"
              value={
                prod.discountType === "percentage"
                  ? `${prod.discountValue}% off`
                  : `$${prod.discountValue} off`
              }
            />
          )}
        </div>

        {/* Description */}
        {prod.description && (
          <>
            <div style={s.detailDivider} />
            <div style={s.detailDescLabel}>Description</div>
            <div style={s.detailDesc}>{prod.description}</div>
          </>
        )}

        {/* Actions */}
        <div style={s.detailDivider} />
        <div style={s.detailActions}>
          <button
            style={s.detailEditBtn}
            onClick={() => {
              onClose();
              onEdit(prod);
            }}
          >
            <Edit2 size={14} /> Edit Product
          </button>
          <button style={s.detailCancelBtn} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailField({ icon, label, value, mono }) {
  return (
    <div style={s.detailField}>
      <div style={s.detailFieldLabel}>
        <span style={s.detailFieldIcon}>{icon}</span>
        {label}
      </div>
      <div style={{ ...s.detailFieldValue, ...(mono ? s.monoText : {}) }}>
        {value}
      </div>
    </div>
  );
}

// ─── Virtual List ─────────────────────────────────────────────────────────────
const ROW_HEIGHT = 74;
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

// ─── Product Row ──────────────────────────────────────────────────────────────
function ProductRow({
  prod,
  index,
  isHovered,
  onHover,
  onEdit,
  onDelete,
  onRowClick,
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
      onMouseEnter={() => onHover(prod._id || prod.slug)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onRowClick(prod)}
      title="Click to view details"
    >
      {/* # */}
      <td style={s.td}>
        <span style={s.indexBadge}>{index + 1}</span>
      </td>

      {/* Image */}
      <td style={s.td}>
        {prod.image?.[0]?.url ? (
          <img src={prod.image[0].url} alt={prod.name} style={s.prodImg} />
        ) : (
          <div style={s.prodImgPlaceholder}>
            <Package size={16} color="var(--muted-foreground)" />
          </div>
        )}
      </td>

      {/* Name & Brand */}
      <td style={s.td}>
        <div style={s.nameCell}>
          <span style={s.prodName}>{prod.name}</span>
          {prod.brand && <span style={s.prodBrand}>{prod.brand}</span>}
        </div>
      </td>

      {/* SKU */}
      <td style={s.td}>
        <span style={s.skuText}>{prod.sku || "—"}</span>
      </td>

      {/* Category */}
      <td style={s.td}>
        <span style={s.categoryChip}>{prod.category?.name || "—"}</span>
      </td>

      {/* Price */}
      <td style={s.td}>
        <div style={s.priceCell}>
          <span style={s.priceMain}>${Number(prod.price).toFixed(2)}</span>
          {prod.discountValue > 0 && (
            <span style={s.discountBadge}>
              -
              {prod.discountType === "percentage"
                ? `${prod.discountValue}%`
                : `$${prod.discountValue}`}
            </span>
          )}
        </div>
      </td>

      {/* Stock */}
      <td style={s.td}>
        {prod.stock === 0 ? (
          <span style={s.outOfStock}>Out of Stock</span>
        ) : (
          <span
            style={{
              ...s.stockBadge,
              ...(prod.stock < 10 ? s.stockLow : s.stockOk),
            }}
          >
            {prod.stock}
          </span>
        )}
      </td>

      {/* Flags */}
      <td style={s.td}>
        <div style={s.flagsCell}>
          {FLAGS.filter((f) => prod[f.key]).map((f) => (
            <span
              key={f.key}
              style={{
                ...s.flagChip,
                background: "var(--secondary)",
                color: "var(--foreground)",
                border: "1px solid var(--border)",
              }}
            >
              {f.label}
            </span>
          ))}
          {!FLAGS.some((f) => prod[f.key]) && <span style={s.dash}>—</span>}
        </div>
      </td>

      {/* Actions */}
      <td style={{ ...s.td, textAlign: "center" }}>
        <div style={s.actionsCell}>
          <button
            style={s.viewBtn}
            onClick={(e) => {
              e.stopPropagation();
              onRowClick(prod);
            }}
            title="View details"
          >
            <Package size={14} />
          </button>
          <button
            style={s.editBtn}
            onClick={(e) => {
              e.stopPropagation();
              onEdit(prod);
            }}
            title="Edit product"
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
              onDelete(prod);
            }}
            disabled={isDeleting}
            title="Delete product"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ isFiltered, search, onClear, onAdd }) {
  return (
    <div style={s.emptyState}>
      <div style={s.emptyIconWrap}>
        <Package size={38} color="#374151" />
      </div>
      <p style={s.emptyTitle}>
        {isFiltered ? "No products match your search" : "No products found"}
      </p>
      <p style={s.emptyHint}>
        {isFiltered
          ? `No results for "${search}". Try a different term.`
          : "Your catalogue is empty. Add your first product to get started."}
      </p>
      {isFiltered ? (
        <button onClick={onClear} style={s.emptyBtn}>
          Clear Search
        </button>
      ) : (
        <button onClick={onAdd} style={s.emptyBtn}>
          + Add Product
        </button>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ProductList() {
  const navigate = useNavigate();
  const toast = useToast();
  const scrollRef = useRef(null);

  const { data, isPending, isError } = getProducts();
  const deleteProductMutation = deleteProduct();

  const products = data?.data?.data || [];

  const [search, setSearch] = useState("");
  const [hoveredRow, setHoveredRow] = useState(null);
  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [confirmProd, setConfirmProd] = useState(null);
  const [detailProd, setDetailProd] = useState(null); // ← new: detail modal

  // ── Filter + sort ───────────────────────────────────────────────────────────
  const filtered = products
    .filter((p) => {
      const q = search.toLowerCase();
      return (
        p.name?.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q) ||
        p.category?.name?.toLowerCase().includes(q)
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

  const VLIST_HEIGHT = 520;
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

  const handleEdit = (prod) =>
    navigate("/edit-product", { state: { products: prod } });
  const handleDelete = (prod) => setConfirmProd(prod);
  const handleRowClick = (prod) => setDetailProd(prod);

  const confirmDelete = () => {
    if (!confirmProd) return;
    deleteProductMutation.mutate(confirmProd.slug, {
      onSuccess: () =>
        toast.success(`"${confirmProd.name}" deleted successfully.`),
      onError: (err) =>
        toast.error(err?.response?.data?.message || "Delete failed."),
      onSettled: () => setConfirmProd(null),
    });
  };

  // ── Stats ───────────────────────────────────────────────────────────────────
  const totalStock = products.reduce((s, p) => s + (p.stock || 0), 0);
  const outOfStock = products.filter((p) => p.stock === 0).length;
  const avgPrice = products.length
    ? (
        products.reduce((s, p) => s + Number(p.price || 0), 0) / products.length
      ).toFixed(2)
    : "0.00";

  // ── Loading / Error ─────────────────────────────────────────────────────────
  if (isPending)
    return (
      <div style={s.page}>
        <style>{css}</style>
        <div style={s.centerState}>
          <div style={s.spinner} />
          <p style={s.stateText}>Loading products…</p>
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
            Failed to load products.
          </p>
        </div>
      </div>
    );

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={s.page}>
      <style>{css}</style>
      <ToastStack toasts={toast.toasts} onRemove={toast.remove} />

      <ConfirmDialog
        open={!!confirmProd}
        productName={confirmProd?.name}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmProd(null)}
      />

      {/* ── Product Detail Modal ── */}
      <ProductDetailModal
        prod={detailProd}
        onClose={() => setDetailProd(null)}
        onEdit={handleEdit}
      />

      {/* ── Header ── */}
      <div className="pl-header">
        <div>
          <div style={s.breadcrumb}>
            <span style={s.breadcrumbLink}>Dashboard</span>
            <span style={s.breadcrumbSep}>/</span>
            <span style={s.breadcrumbCurrent}>Products</span>
          </div>
          <h1 className="pl-title">Products</h1>
          <p style={s.titleSub}>
            Manage product catalogue — edit and update listings.
          </p>
        </div>
        <button
          onClick={() => navigate("/add-product")}
          style={s.btnAdd}
          className="pl-btn-add"
        >
          <Plus size={15} />
          <span>Add Product</span>
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div className="pl-stats">
        <StatCard
          icon={Package}
          label="Total Products"
          value={products.length}
        />
        <StatCard
          icon={Layers}
          label="Total Stock"
          value={totalStock}
        />
        <StatCard
          icon={DollarSign}
          label="Avg. Price"
          value={`$${avgPrice}`}
        />
        <StatCard
          icon={Package}
          label="Out of Stock"
          value={outOfStock}
        />
      </div>

      {/* ── Table Card ── */}
      <div style={s.card}>
        {/* Card header */}
        <div className="pl-card-header">
          <div style={s.cardTitleWrap}>
            <span style={s.cardIcon}>
              <Package size={17} />
            </span>
            <div>
              <div style={s.cardTitle}>Product List</div>
              <div style={s.cardSubtitle}>
                {filtered.length} of {products.length} products
                {filtered.length !== products.length && " (filtered)"}
                {" · "}
                <span style={{ color: "#d97706" }}>virtualised</span>
                {products.length > 0 && (
                  <span style={{ color: "#4b5563" }}>
                    {" "}
                    · click a row to view details
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="pl-search-wrap">
            <span style={s.searchIcon}>🔍</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, SKU, brand, category…"
              style={s.searchInput}
            />
            {search && (
              <button onClick={() => setSearch("")} style={s.searchClear}>
                ×
              </button>
            )}
          </div>
        </div>

        {/* ── Content: empty state OR virtualised table ── */}
        {products.length === 0 ? (
          /* Catalogue is genuinely empty */
          <EmptyState
            isFiltered={false}
            onAdd={() => navigate("/add-product")}
          />
        ) : (
          <>
            {/* ── Virtualised Table ── */}
            <div style={s.tableOuterWrap}>
              {/* Fixed header */}
              <div style={s.tableHeaderWrap}>
                <table style={{ ...s.table, tableLayout: "fixed" }}>
                  <colgroup>
                    <col style={{ width: 42 }} />
                    <col style={{ width: 62 }} />
                    <col style={{ width: "20%" }} />
                    <col style={{ width: "12%" }} />
                    <col style={{ width: "13%" }} />
                    <col style={{ width: "11%" }} />
                    <col style={{ width: 72 }} />
                    <col style={{ width: "18%" }} />
                    <col style={{ width: 76 }} />
                  </colgroup>
                  <thead>
                    <tr>
                      {[
                        { label: "#", key: null },
                        { label: "Image", key: null },
                        { label: "Name", key: "name" },
                        { label: "SKU", key: "sku" },
                        { label: "Category", key: null },
                        { label: "Price", key: "price" },
                        { label: "Stock", key: "stock" },
                        { label: "Flags", key: null },
                        { label: "Actions", key: null },
                      ].map(({ label, key }) => (
                        <th
                          key={label}
                          style={{
                            ...s.th,
                            ...(key
                              ? { cursor: "pointer", userSelect: "none" }
                              : {}),
                            ...(label === "Actions"
                              ? { textAlign: "center" }
                              : {}),
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
                  /* Search filter returned nothing */
                  <EmptyState
                    isFiltered
                    search={search}
                    onClear={() => setSearch("")}
                  />
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
                          <col style={{ width: 42 }} />
                          <col style={{ width: 62 }} />
                          <col style={{ width: "20%" }} />
                          <col style={{ width: "12%" }} />
                          <col style={{ width: "13%" }} />
                          <col style={{ width: "11%" }} />
                          <col style={{ width: 72 }} />
                          <col style={{ width: "18%" }} />
                          <col style={{ width: 76 }} />
                        </colgroup>
                        <tbody>
                          {visibleItems.map((prod, i) => (
                            <ProductRow
                              key={prod._id || prod.slug}
                              prod={prod}
                              index={startIndex + i}
                              isHovered={hoveredRow === (prod._id || prod.slug)}
                              onHover={setHoveredRow}
                              onEdit={handleEdit}
                              onDelete={handleDelete}
                              onRowClick={handleRowClick}
                              isDeleting={deleteProductMutation.isPending}
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
            <div className="pl-table-footer">
              Showing{" "}
              <strong style={{ color: "#f3f4f6" }}>{filtered.length}</strong>{" "}
              products
              {filtered.length !== products.length && (
                <>
                  {" "}
                  ·{" "}
                  <strong style={{ color: "#d97706" }}>
                    {products.length - filtered.length}
                  </strong>{" "}
                  hidden by filter
                </>
              )}
              <span style={s.footerVirt}>· Only visible rows rendered</span>
            </div>
          </>
        )}
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
  @keyframes dialogIn   { from { opacity:0; transform:scale(0.95) translateY(8px); } to { opacity:1; transform:scale(1) translateY(0); } }
  @keyframes emptyIn    { from { opacity:0; transform:translateY(20px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }

  *, *::before, *::after { box-sizing: border-box; }
  ::-webkit-scrollbar       { width:6px; height:6px; }
  ::-webkit-scrollbar-track { background:#0d0d0d; }
  ::-webkit-scrollbar-thumb { background:#1f2937; border-radius:3px; }

  .pl-title {
    font-family: 'Playfair Display', serif;
    font-size: 30px; font-weight: 700;
    margin: 0 0 4px; color: #f9fafb;
    letter-spacing: -0.02em;
  }
  .pl-header {
    display: flex; justify-content: space-between;
    align-items: flex-start; margin-bottom: 28px;
    flex-wrap: wrap; gap: 16px;
  }
  .pl-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    margin-bottom: 32px;
  }

  .pl-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24px;
    border-bottom: 1px solid var(--border);
  }
  .pl-search-wrap {
    display: flex;
    align-items: center;
    gap: 10px;
    background: var(--background);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 8px 14px;
    width: 320px;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .pl-search-wrap:focus-within {
    border-color: var(--foreground);
    box-shadow: 0 0 0 2px var(--secondary);
  }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes dialogIn {
    from { opacity: 0; transform: scale(0.96) translateY(10px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes toastSlide {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
`;

const s = {
  page: { 
    maxWidth: 1200, 
    margin: "0 auto",
    fontFamily: "'Inter', sans-serif"
  },
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
    minWidth: 900,
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
  },

  indexBadge: {
    fontSize: 12,
    fontWeight: 600,
    color: "var(--muted-foreground)",
  },

  prodImg: {
    width: 44,
    height: 44,
    borderRadius: 8,
    objectFit: "cover",
    border: "1px solid var(--border)",
    display: "block",
  },
  prodImgPlaceholder: {
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
  prodName: {
    fontSize: 14,
    fontWeight: 600,
    color: "var(--foreground)",
    lineHeight: 1.4,
  },
  prodBrand: { fontSize: 12, color: "var(--muted-foreground)" },

  skuText: {
    fontSize: 12,
    color: "var(--muted-foreground)",
    fontWeight: 500,
  },

  categoryChip: {
    display: "inline-block",
    background: "var(--secondary)",
    color: "var(--foreground)",
    border: "1px solid var(--border)",
    borderRadius: 6,
    padding: "2px 10px",
    fontSize: 12,
    fontWeight: 500,
  },

  priceCell: { display: "flex", flexDirection: "column", gap: 1 },
  priceMain: { fontSize: 14, fontWeight: 700, color: "var(--foreground)" },
  discountBadge: {
    fontSize: 11,
    color: "var(--success)",
    fontWeight: 600,
  },

  stockBadge: {
    display: "inline-block",
    padding: "2px 10px",
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 600,
  },
  stockOk: {
    color: "var(--success)",
  },
  stockLow: {
    color: "#f59e0b",
  },
  outOfStock: {
    color: "var(--destructive)",
    fontSize: 12,
    fontWeight: 700,
    textTransform: "uppercase",
  },

  flagsCell: { display: "flex", flexWrap: "wrap", gap: 4 },
  flagChip: {
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 600,
  },
  dash: { color: "var(--border)" },

  actionsCell: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },

  viewBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    border: "1px solid var(--border)",
    background: "transparent",
    color: "var(--muted-foreground)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  editBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    border: "1px solid var(--border)",
    background: "transparent",
    color: "var(--success)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    border: "1px solid var(--border)",
    background: "transparent",
    color: "var(--destructive)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  btnDisabled: { opacity: 0.5, cursor: "not-allowed" },

  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    padding: "80px 24px",
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 16,
    background: "var(--secondary)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: { fontSize: 18, fontWeight: 700, color: "var(--foreground)", margin: 0 },
  emptyHint: { fontSize: 14, color: "var(--muted-foreground)", margin: 0, textAlign: "center", maxWidth: 320 },
  emptyBtn: {
    marginTop: 10,
    padding: "10px 24px",
    background: "var(--primary)",
    color: "var(--primary-foreground)",
    border: "1px solid var(--primary)",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },

  dialogOverlay: {
    position: "fixed",
    inset: 0,
    zIndex: 1200,
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backdropFilter: "blur(4px)",
  },
  dialog: {
    background: "var(--background)",
    border: "1px solid var(--border)",
    borderRadius: 16,
    padding: "32px",
    maxWidth: 400,
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: 16,
    textAlign: "center",
    animation: "dialogIn 0.2s ease",
    boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
  },
  dialogIcon: {
    width: 48,
    height: 48,
    borderRadius: 50,
    background: "var(--destructive)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto",
  },
  dialogTitle: { fontSize: 20, fontWeight: 700, color: "var(--foreground)" },
  dialogMsg: { fontSize: 14, color: "var(--muted-foreground)", lineHeight: 1.5 },
  dialogActions: { display: "flex", gap: 12, marginTop: 8 },
  dialogCancel: {
    flex: 1,
    padding: "10px",
    background: "transparent",
    border: "1px solid var(--border)",
    borderRadius: 8,
    color: "var(--foreground)",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  dialogConfirm: {
    flex: 1,
    padding: "10px",
    background: "var(--destructive)",
    border: "1px solid var(--destructive)",
    borderRadius: 8,
    color: "white",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },

  detailModal: {
    background: "var(--background)",
    border: "1px solid var(--border)",
    borderRadius: 16,
    padding: "32px",
    maxWidth: 540,
    width: "100%",
    position: "relative",
    animation: "dialogIn 0.3s ease",
    boxShadow: "0 30px 60px rgba(0,0,0,0.15)",
    maxHeight: "90vh",
    overflowY: "auto",
  },
  detailClose: {
    position: "absolute",
    top: 20,
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 6,
    background: "var(--secondary)",
    border: "none",
    color: "var(--foreground)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  detailTop: { display: "flex", gap: 24, marginBottom: 24 },
  detailImg: {
    width: 100,
    height: 100,
    borderRadius: 12,
    objectFit: "cover",
    border: "1px solid var(--border)",
  },
  detailHeadline: { flex: 1 },
  detailName: { fontSize: 24, fontWeight: 800, color: "var(--foreground)", marginBottom: 4, letterSpacing: "-0.02em" },
  detailBrand: { fontSize: 14, color: "var(--muted-foreground)", marginBottom: 12 },
  detailDivider: { height: 1, background: "var(--border)", margin: "24px 0" },
  detailGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  detailField: {
    background: "var(--secondary)",
    borderRadius: 10,
    padding: "14px",
  },
  detailFieldLabel: { fontSize: 11, fontWeight: 700, color: "var(--muted-foreground)", textTransform: "uppercase", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 },
  detailFieldValue: { fontSize: 15, color: "var(--foreground)", fontWeight: 600 },
  detailDesc: { fontSize: 14, color: "var(--muted-foreground)", lineHeight: 1.6 },
  detailActions: { display: "flex", gap: 12 },
  detailEditBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    flex: 1,
    padding: "11px",
    background: "rgba(99,102,241,0.12)",
    border: "1px solid rgba(99,102,241,0.3)",
    borderRadius: 10,
    color: "#818cf8",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    justifyContent: "center",
    transition: "background 0.2s",
  },
  detailCancelBtn: {
    flex: 1,
    padding: "11px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid #1f2937",
    borderRadius: 10,
    color: "#9ca3af",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    transition: "background 0.2s",
  },

  // ── Toast ──
  toastStack: {
    position: "fixed",
    top: 20,
    right: 20,
    zIndex: 1300,
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
