import { deleteOrder, getOrders, updateOrderStatus } from "@/api/api";
import {
  Trash2,
  ShoppingBag,
  CreditCard,
  Users,
  AlertTriangle,
  Clock,
  Eye,
  PenLine,
  ShieldAlert,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useRef, useEffect, useCallback } from "react";

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

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
function ConfirmDialog({ open, onConfirm, onCancel, invoiceId }) {
  if (!open) return null;
  return (
    <div style={s.dialogOverlay}>
      <div style={s.dialog}>
        <div style={s.dialogIcon}>
          <AlertTriangle size={24} color="white" />
        </div>
        <div style={s.dialogTitle}>Delete Order</div>
        <div style={s.dialogMsg}>
          Are you sure you want to delete order{" "}
          <strong style={{ color: "var(--foreground)" }}>{invoiceId}</strong>?
          This action cannot be undone.
        </div>
        <div style={s.dialogActions}>
          <button onClick={onCancel} style={s.dialogCancel}>Cancel</button>
          <button onClick={onConfirm} style={s.dialogConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}

// ─── Update Status Dialog ─────────────────────────────────────────────────────
function UpdateStatusDialog({ open, currentStatus, onConfirm, onCancel, invoiceId }) {
  const [status, setStatus] = useState(currentStatus || "pending");

  useEffect(() => {
    if (open) setStatus(currentStatus || "pending");
  }, [open, currentStatus]);

  if (!open) return null;
  return (
    <div style={s.dialogOverlay}>
      <div style={s.dialog}>
        <div style={{ ...s.dialogIcon, background: "var(--secondary)", color: "var(--foreground)" }}>
          <PenLine size={24} />
        </div>
        <div style={s.dialogTitle}>Update Order Status</div>
        <div style={s.dialogMsg}>
          Select a new status for order{" "}
          <strong style={{ color: "var(--foreground)" }}>{invoiceId}</strong>
        </div>
        
        <select 
          value={status} 
          onChange={(e) => setStatus(e.target.value)}
          style={s.statusSelect}
        >
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="confirmed">Confirmed</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <div style={s.dialogActions}>
          <button onClick={onCancel} style={s.dialogCancel}>Cancel</button>
          <button onClick={() => onConfirm(status)} style={s.dialogUpdateBtn}>
            Update
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Virtual List ─────────────────────────────────────────────────────────────
const ROW_HEIGHT = 90;
const OVERSCAN = 4;

function useVirtualList(items, containerRef) {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(500);

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

// ─── Payment badge ────────────────────────────────────────────────────────────
const PAYMENT_STYLES = {
  cod: { bg: "var(--secondary)", color: "var(--foreground)", label: "COD" },
  online: { bg: "var(--secondary)", color: "var(--success)", label: "Online" },
  card: { bg: "var(--secondary)", color: "var(--foreground)", label: "Card" },
};
function PaymentBadge({ method }) {
  const key = (method || "").toLowerCase();
  const st = PAYMENT_STYLES[key] || { bg: "var(--secondary)", color: "var(--muted-foreground)", label: method || "—" };
  return (
    <span style={{ ...s.badgeBase, background: st.bg, color: st.color }}>
      {st.label}
    </span>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────
const STATUS_STYLES = {
  pending: { color: "oklch(0.7 0.15 80)", label: "Pending" },
  processing: { color: "oklch(0.7 0.15 250)", label: "Processing" },
  confirmed: { color: "var(--foreground)", label: "Confirmed" },
  delivered: { color: "var(--success)", label: "Delivered" },
  cancelled: { color: "var(--muted-foreground)", label: "Cancelled" },
  returned: { color: "var(--muted-foreground)", label: "Returned" },
  rejected: { color: "var(--destructive)", label: "Rejected" },
};

function StatusBadge({ status }) {
  const key = (status || "").toLowerCase();
  const st = STATUS_STYLES[key] || {
    color: "var(--muted-foreground)",
    label: status || "Pending",
  };
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 9px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 600,
        whiteSpace: "nowrap",
        background: "var(--secondary)",
        color: st.color,
        border: `1px solid var(--border)`,
      }}
    >
      {st.label}
    </span>
  );
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

// ─── Order Row ────────────────────────────────────────────────────────────────
function OrderRow({
  order,
  index,
  isHovered,
  onHover,
  onView,
  onUpdateStatus,
  onDelete,
  isDeleting,
}) {
  const itemCount = order.items?.length || 0;
  const itemSummary = order.items?.slice(0, 2).map((it, i) => (
    <div key={i} style={s.itemLine}>
      <span style={s.itemQty}>{it.qty}×</span>
      <span style={s.itemName}>
        {it.productId?.name ?? it.productId ?? "—"}
      </span>
    </div>
  ));

  return (
    <tr
      style={{
        ...s.tr,
        background: isHovered ? "var(--secondary)" : "transparent",
        height: ROW_HEIGHT,
        cursor: "pointer",
      }}
      onMouseEnter={() => onHover(order._id)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onView(order)}
    >
      <td style={s.td}>
        <span style={s.indexBadge}>{index + 1}</span>
      </td>

      <td style={s.td}>
        <span style={s.invoiceId}>{order.invoiceId || "—"}</span>
      </td>

      <td style={s.td}>
        <div style={s.nameCell}>
          <span style={s.customerName}>{order.customer?.fullName || "—"}</span>
          <span style={s.customerPhone}>{order.customer?.phone || ""}</span>
        </div>
      </td>

      <td style={s.td}>
        <span style={s.addressText}>{order.customer?.address || "—"}</span>
      </td>

      <td style={s.td}>
        <PaymentBadge method={order.paymentMethod} />
      </td>

      <td style={s.td}>
        <StatusBadge status={order.status} />
      </td>

      <td style={s.td}>
        <div style={s.itemsCell}>
          {itemSummary}
          {itemCount > 2 && (
            <span style={s.moreItems}>+{itemCount - 2} more</span>
          )}
        </div>
      </td>

      <td style={s.td}>
        <span style={s.noteText}>{order.note || "—"}</span>
      </td>

      <td style={{ ...s.td, textAlign: "center" }}>
        <div style={s.actionsCell}>
          <button
            style={s.viewBtn}
            onClick={(e) => {
              e.stopPropagation();
              onView(order);
            }}
            title="View Details"
          >
            <Eye size={14} />
          </button>
          <button
            style={s.fraudBtn}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/fraud-checker?phone=${order.customer?.phone}`);
            }}
            title="Fraud Check"
          >
            <ShieldAlert size={14} />
          </button>
          <button
            style={s.editBtn}
            onClick={(e) => {
              e.stopPropagation();
              onUpdateStatus(order);
            }}
            title="Update Status"
          >
            <PenLine size={14} />
          </button>
          <button
            style={{
              ...s.deleteBtn,
              ...(isDeleting ? s.btnDisabled : {}),
            }}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(order);
            }}
            disabled={isDeleting}
            title="Delete Order"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function OrderList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const statusFilter = searchParams.get("status") || "";

  const toast = useToast();
  const scrollRef = useRef(null);

  const { data, isPending, isError } = getOrders(statusFilter);
  const orderDeleteMutation = deleteOrder();
  const statusUpdateMutation = updateOrderStatus();

  const orders = data?.data?.data || [];

  const [search, setSearch] = useState("");
  const [hoveredRow, setHoveredRow] = useState(null);
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [confirmOrder, setConfirmOrder] = useState(null);
  const [updateOrder, setUpdateOrder] = useState(null);

  // ── Filter + sort ───────────────────────────────────────────────────────────
  const filtered = orders
    .filter((o) => {
      const q = search.toLowerCase();
      return (
        o.customer?.fullName?.toLowerCase().includes(q) ||
        o.customer?.phone?.toLowerCase().includes(q) ||
        o.invoiceId?.toLowerCase().includes(q) ||
        o.paymentMethod?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (!sortKey) return 0;
      let av = a[sortKey],
        bv = b[sortKey];
      if (typeof av === "string") av = av.toLowerCase();
      if (typeof bv === "string") bv = bv.toLowerCase();
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  const VLIST_HEIGHT = 500;
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

  const handleView = (order) =>
    navigate("/order-details", { state: { order } });
  const handleDelete = (order) => setConfirmOrder(order);
  const confirmDelete = () => {
    if (!confirmOrder) return;
    orderDeleteMutation.mutate(confirmOrder.invoiceId, {
      onSuccess: () =>
        toast.success(`Order ${confirmOrder.invoiceId} deleted.`),
      onError: (err) =>
        toast.error(err?.response?.data?.message || "Delete failed."),
      onSettled: () => setConfirmOrder(null),
    });
  };

  const handleUpdateStatus = (order) => setUpdateOrder(order);
  const confirmUpdateStatus = (newStatus) => {
    if (!updateOrder) return;
    statusUpdateMutation.mutate({ invoiceId: updateOrder.invoiceId, status: newStatus }, {
      onSuccess: () => toast.success(`Order ${updateOrder.invoiceId} updated to ${newStatus}.`),
      onError: (err) => toast.error(err?.response?.data?.message || "Update failed."),
      onSettled: () => setUpdateOrder(null),
    });
  };

  // ── Stats ───────────────────────────────────────────────────────────────────
  const totalItems = orders.reduce((n, o) => n + (o.items?.length || 0), 0);
  const codOrders = orders.filter(
    (o) => o.paymentMethod?.toLowerCase() === "cod",
  ).length;
  const uniqueCustomers = new Set(
    orders.map((o) => o.customer?.phone).filter(Boolean),
  ).size;

  // ── Loading / Error ─────────────────────────────────────────────────────────
  if (isPending)
    return (
      <div style={s.page}>
        <style>{css}</style>
        <div style={s.centerState}>
          <div style={s.spinner} />
          <p style={s.stateText}>Loading orders…</p>
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
            Failed to load orders.
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
        open={!!confirmOrder}
        invoiceId={confirmOrder?.invoiceId}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmOrder(null)}
      />
      <UpdateStatusDialog
        open={!!updateOrder}
        invoiceId={updateOrder?.invoiceId}
        currentStatus={updateOrder?.status}
        onConfirm={confirmUpdateStatus}
        onCancel={() => setUpdateOrder(null)}
      />

      {/* ── Header ── */}
      <div className="ol-header">
        <div>
          <div style={s.breadcrumb}>
            <span style={s.breadcrumbLink}>Dashboard</span>
            <span style={s.breadcrumbSep}>/</span>
            <span style={s.breadcrumbCurrent}>Orders</span>
          </div>
          <h1 className="ol-title">
            {statusFilter ? `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Orders` : "Orders"}
          </h1>
          <p style={s.titleSub}>View and manage customer orders.</p>
        </div>
      </div>

      {/* ── Stat Cards ── */}
    <div className="ol-stats">
        <StatCard
          icon={ShoppingBag}
          label="Total Orders"
          value={orders.length}
        />
        <StatCard
          icon={Clock}
          label="Total Items"
          value={totalItems}
        />
        <StatCard
          icon={Users}
          label="Unique Customers"
          value={uniqueCustomers}
        />
        <StatCard
          icon={CreditCard}
          label="COD Orders"
          value={codOrders}
        />
      </div>

      {/* ── Table Card ── */}
      <div style={s.card}>
        {/* Card header */}
        <div className="ol-card-header">
          <div style={s.cardTitleWrap}>
            <span style={s.cardIcon}>
              <ShoppingBag size={17} />
            </span>
            <div>
              <div style={s.cardTitle}>Order List</div>
              <div style={s.cardSubtitle}>
                {filtered.length} of {orders.length} orders
                {filtered.length !== orders.length && " (filtered)"}
                {" · "}
                <span style={{ color: "#d97706" }}>virtualised</span>
              </div>
            </div>
          </div>
          <div className="ol-search-wrap">
            <span style={s.searchIcon}>🔍</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, phone, invoice, payment…"
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
                <col style={{ width: 44 }} />
                <col style={{ width: "13%" }} />
                <col style={{ width: "14%" }} />
                <col style={{ width: "16%" }} />
                <col style={{ width: "8%" }} />
                <col style={{ width: "8%" }} />
                <col style={{ width: "23%" }} />
                <col style={{ width: "14%" }} />
                <col style={{ width: 100 }} />
              </colgroup>
              <thead>
                <tr>
                  {[
                    { label: "#", key: null },
                    { label: "Invoice", key: "invoiceId" },
                    { label: "Customer", key: null },
                    { label: "Address", key: null },
                    { label: "Payment", key: "paymentMethod" },
                    { label: "Status", key: "status" },
                    { label: "Items", key: null },
                    { label: "Note", key: null },
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
                <span style={{ fontSize: 44 }}>🛒</span>
                <p style={s.emptyTitle}>No orders found</p>
                <p style={s.emptyHint}>
                  {search
                    ? "Try a different search term."
                    : "Orders will appear here once customers place them."}
                </p>
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
                      <col style={{ width: 44 }} />
                      <col style={{ width: "13%" }} />
                      <col style={{ width: "14%" }} />
                      <col style={{ width: "16%" }} />
                      <col style={{ width: "8%" }} />
                      <col style={{ width: "8%" }} />
                      <col style={{ width: "23%" }} />
                      <col style={{ width: "14%" }} />
                      <col style={{ width: 100 }} />
                    </colgroup>
                    <tbody>
                      {visibleItems.map((order, i) => (
                        <OrderRow
                          key={order._id}
                          order={order}
                          index={startIndex + i}
                          isHovered={hoveredRow === order._id}
                          onHover={setHoveredRow}
                          onView={handleView}
                          onUpdateStatus={handleUpdateStatus}
                          onDelete={handleDelete}
                          isDeleting={orderDeleteMutation.isPending}
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
        <div className="ol-table-footer">
          Showing{" "}
          <strong style={{ color: "#f3f4f6" }}>{filtered.length}</strong> orders
          {filtered.length !== orders.length && (
            <>
              {" "}
              ·{" "}
              <strong style={{ color: "#d97706" }}>
                {orders.length - filtered.length}
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
  @keyframes fadeIn     { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

  .ol-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 32px;
  }
  .ol-title {
    font-size: 32px;
    font-weight: 800;
    letter-spacing: -0.03em;
    color: var(--foreground);
    margin: 0 0 4px 0;
  }

  .ol-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 20px;
    margin-bottom: 32px;
  }

  .ol-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24px;
    border-bottom: 1px solid var(--border);
  }
  .ol-search-wrap {
    display: flex;
    align-items: center;
    gap: 10px;
    background: var(--background);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 8px 14px;
    width: 320px;
    transition: all 0.2s;
  }
  .ol-search-wrap:focus-within {
    border-color: var(--foreground);
    box-shadow: 0 0 0 2px var(--secondary);
  }

  .ol-table-footer {
    padding: 16px 24px;
    border-top: 1px solid var(--border);
    font-size: 13px;
    color: var(--muted-foreground);
    text-align: right;
  }

  @keyframes spin       { to { transform: rotate(360deg); } }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes toastSlide {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes dialogIn {
    from { opacity: 0; transform: scale(0.96) translateY(10px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }
`;

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = {
  page: { 
    maxWidth: 1200, 
    margin: "0 auto",
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
    minWidth: 1000,
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
  invoiceId: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--foreground)",
  },

  nameCell: { display: "flex", flexDirection: "column", gap: 1 },
  customerName: { fontSize: 14, fontWeight: 600, color: "var(--foreground)", lineHeight: 1.4 },
  customerPhone: { fontSize: 12, color: "var(--muted-foreground)" },

  addressText: { fontSize: 13, color: "var(--muted-foreground)", lineHeight: 1.4 },
  itemsCell: { display: "flex", flexDirection: "column", gap: 4 },
  itemLine: { fontSize: 12, color: "var(--foreground)" },
  itemQty: { fontWeight: 700, marginRight: 4 },
  itemName: { color: "var(--muted-foreground)" },
  moreItems: { fontSize: 11, fontWeight: 700, color: "var(--muted-foreground)" },
  noteText: { fontSize: 12, color: "var(--muted-foreground)", fontStyle: "italic" },

  badgeBase: {
    display: "inline-block",
    padding: "2px 10px",
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 700,
    whiteSpace: "nowrap",
  },

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
  fraudBtn: {
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
    background: "#111827",
    border: "1px solid #1f2937",
    borderRadius: 20,
    padding: "32px 28px",
    maxWidth: 380,
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
    textAlign: "center",
    animation: "dialogIn 0.25s cubic-bezier(0.16,1,0.3,1)",
    boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
  },
  dialogIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    background: "rgba(239,68,68,0.1)",
    border: "1px solid rgba(239,68,68,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: "#f3f4f6",
    fontFamily: "'Playfair Display', serif",
  },
  dialogMsg: { fontSize: 13, color: "#9ca3af", lineHeight: 1.6 },
  dialogActions: { display: "flex", gap: 10, marginTop: 8, width: "100%" },
  dialogCancel: {
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
  },
  dialogConfirm: {
    flex: 1,
    padding: "11px",
    background: "rgba(239,68,68,0.15)",
    border: "1px solid rgba(239,68,68,0.3)",
    borderRadius: 10,
    color: "#f87171",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
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
