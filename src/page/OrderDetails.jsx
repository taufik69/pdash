import { getOrderByInvoice } from "@/api/api";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ShoppingBag,
  User,
  MapPin,
  CreditCard,
  FileText,
  Package,
  Hash,
} from "lucide-react";

// ─── Custom Toast ─────────────────────────────────────────────────────────────
import { useState } from "react";
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

// ─── Payment badge ────────────────────────────────────────────────────────────
const PAYMENT_STYLES = {
  cod: {
    bg: "rgba(251,191,36,0.12)",
    color: "#fbbf24",
    border: "rgba(251,191,36,0.3)",
  },
  online: {
    bg: "rgba(16,185,129,0.12)",
    color: "#34d399",
    border: "rgba(16,185,129,0.3)",
  },
  card: {
    bg: "rgba(99,102,241,0.12)",
    color: "#818cf8",
    border: "rgba(99,102,241,0.3)",
  },
};
function PaymentBadge({ method }) {
  const key = (method || "").toLowerCase();
  const st = PAYMENT_STYLES[key] || {
    bg: "rgba(255,255,255,0.06)",
    color: "#9ca3af",
    border: "rgba(255,255,255,0.1)",
  };
  return (
    <span
      style={{
        ...s.badge,
        background: st.bg,
        color: st.color,
        border: `1px solid ${st.border}`,
      }}
    >
      {method || "—"}
    </span>
  );
}

// ─── Info Row ─────────────────────────────────────────────────────────────────
function InfoRow({ label, value, mono }) {
  return (
    <div style={s.infoRow}>
      <span style={s.infoLabel}>{label}</span>
      <span style={{ ...s.infoValue, ...(mono ? s.mono : {}) }}>
        {value || "—"}
      </span>
    </div>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────
function SectionCard({ icon: Icon, title, children }) {
  return (
    <div style={s.sectionCard}>
      <div style={s.sectionHeader}>
        <span style={s.sectionIconWrap}>
          <Icon size={16} />
        </span>
        <span style={s.sectionTitle}>{title}</span>
      </div>
      <div style={s.sectionBody}>{children}</div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function OrderDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  // Accept either passed order object or just invoiceId from state
  const passedOrder = location.state?.order || null;
  const invoiceId = passedOrder?.invoiceId || location.state?.invoiceId;

  // Fetch fresh data by invoiceId (adjust hook name to match your API)
  const { data, isPending, isError } = getOrderByInvoice(invoiceId);

  // Prefer fresh API data, fall back to passed order
  const order = data?.data?.data || passedOrder;

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (isPending)
    return (
      <div style={s.page}>
        <style>{css}</style>
        <div style={s.centerState}>
          <div style={s.spinner} />
          <p style={s.stateText}>Loading order details…</p>
        </div>
      </div>
    );

  if (isError && !order)
    return (
      <div style={s.page}>
        <style>{css}</style>
        <div style={s.centerState}>
          <span style={{ fontSize: 40 }}>⚠️</span>
          <p style={{ ...s.stateText, color: "#f87171" }}>
            Failed to load order.
          </p>
          <button onClick={() => navigate(-1)} style={s.backBtn}>
            ← Go back
          </button>
        </div>
      </div>
    );

  if (!order)
    return (
      <div style={s.page}>
        <style>{css}</style>
        <div style={s.centerState}>
          <span style={{ fontSize: 40 }}>🔍</span>
          <p style={s.stateText}>Order not found.</p>
          <button onClick={() => navigate(-1)} style={s.backBtn}>
            ← Go back
          </button>
        </div>
      </div>
    );

  const items = order.items || [];
  const totalQty = items.reduce((n, it) => n + (it.qty || 0), 0);
  const totalAmount = items.reduce(
    (n, it) => n + (it.qty || 0) * (it.price || it.productId?.price || 0),
    0,
  );

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={s.page}>
      <style>{css}</style>
      <ToastStack toasts={toast.toasts} onRemove={toast.remove} />

      {/* ── Header ── */}
      <div style={s.header}>
        <div>
          <div style={s.breadcrumb}>
            <span style={s.breadcrumbLink} onClick={() => navigate("/orders")}>
              Dashboard
            </span>
            <span style={s.breadcrumbSep}>/</span>
            <span style={s.breadcrumbLink} onClick={() => navigate("/orders")}>
              Orders
            </span>
            <span style={s.breadcrumbSep}>/</span>
            <span style={s.breadcrumbCurrent}>
              {order.invoiceId || "Details"}
            </span>
          </div>
          <h1 className="od-title">Order Details</h1>
          <p style={s.titleSub}>
            Full breakdown for invoice{" "}
            <span
              style={{
                color: "#d97706",
                fontFamily: "'Courier New', monospace",
              }}
            >
              {order.invoiceId}
            </span>
          </p>
        </div>
        <button
          onClick={() => navigate(-1)}
          style={s.backBtn}
          className="od-back-btn"
        >
          <ArrowLeft size={15} />
          <span>Back to Orders</span>
        </button>
      </div>

      {/* ── Summary strip ── */}
      <div className="od-summary">
        <div style={s.summaryCard}>
          <div style={s.summaryLabel}>Invoice ID</div>
          <div
            style={{
              ...s.summaryValue,
              fontFamily: "'Courier New', monospace",
              fontSize: 15,
            }}
          >
            {order.invoiceId || "—"}
          </div>
        </div>
        <div style={s.summaryCard}>
          <div style={s.summaryLabel}>Total Items</div>
          <div style={s.summaryValue}>
            {items.length} <span style={s.summaryMuted}>lines</span>
          </div>
        </div>
        <div style={s.summaryCard}>
          <div style={s.summaryLabel}>Total Qty</div>
          <div style={s.summaryValue}>
            {totalQty} <span style={s.summaryMuted}>pcs</span>
          </div>
        </div>
        <div style={s.summaryCard}>
          <div style={s.summaryLabel}>Payment</div>
          <div style={{ marginTop: 4 }}>
            <PaymentBadge method={order.paymentMethod} />
          </div>
        </div>
      </div>

      {/* ── Main grid ── */}
      <div className="od-grid">
        {/* ── Left col ── */}
        <div style={s.col}>
          {/* Customer */}
          <SectionCard icon={User} title="Customer Information">
            <InfoRow label="Full Name" value={order.customer?.fullName} />
            <InfoRow label="Phone" value={order.customer?.phone} mono />
            <InfoRow label="Email" value={order.customer?.email} />
          </SectionCard>

          {/* Delivery */}
          <SectionCard icon={MapPin} title="Delivery Address">
            <InfoRow label="Address" value={order.customer?.address} />
            <InfoRow label="City" value={order.customer?.city} />
            <InfoRow label="Region" value={order.customer?.region} />
          </SectionCard>

          {/* Payment & Note */}
          <SectionCard icon={FileText} title="Payment & Note">
            <InfoRow label="Payment Method" value={order.paymentMethod} />
            <InfoRow label="Transaction ID" value={order.transactionId} mono />
            <div style={s.divider} />
            <div style={s.noteBlock}>
              <span style={s.infoLabel}>Note</span>
              <p style={s.noteText}>{order.note || "No note provided."}</p>
            </div>
          </SectionCard>
        </div>

        {/* ── Right col — Items ── */}
        <div style={s.col}>
          <SectionCard
            icon={ShoppingBag}
            title={`Order Items (${items.length})`}
          >
            {items.length === 0 ? (
              <p style={s.emptyItems}>No items in this order.</p>
            ) : (
              <div style={s.itemsList}>
                {items.map((item, i) => {
                  const prod = item.productId;
                  const name = prod?.name ?? prod ?? "—";
                  const img = prod?.image?.[0]?.url || null;
                  const price = item.price ?? prod?.price ?? 0;
                  const subtotal = (item.qty || 0) * price;

                  return (
                    <div
                      key={i}
                      style={{
                        ...s.itemCard,
                        ...(i < items.length - 1 ? s.itemCardBorder : {}),
                      }}
                    >
                      {/* Image */}
                      {img ? (
                        <img src={img} alt={name} style={s.itemImg} />
                      ) : (
                        <div style={s.itemImgPlaceholder}>
                          <Package size={18} color="#4b5563" />
                        </div>
                      )}

                      {/* Info */}
                      <div style={s.itemInfo}>
                        <div style={s.itemName}>{name}</div>
                        <div style={s.itemMeta}>
                          {item.color && (
                            <span style={s.metaChip}>{item.color}</span>
                          )}
                          {item.size && (
                            <span style={s.metaChip}>{item.size}</span>
                          )}
                          {item.sku && (
                            <span
                              style={{
                                ...s.metaChip,
                                fontFamily: "'Courier New', monospace",
                              }}
                            >
                              {item.sku}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Price x Qty */}
                      <div style={s.itemPricing}>
                        <div style={s.itemQtyBadge}>{item.qty} ×</div>
                        <div style={s.itemPrice}>
                          ${Number(price).toFixed(2)}
                        </div>
                        <div style={s.itemSubtotal}>
                          ${Number(subtotal).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Total row */}
                {totalAmount > 0 && (
                  <div style={s.totalRow}>
                    <span style={s.totalLabel}>Order Total</span>
                    <span style={s.totalValue}>${totalAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}
          </SectionCard>
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
  @keyframes slideUp    { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
  @keyframes toastSlide { from { opacity:0; transform:translateX(40px); } to { opacity:1; transform:translateX(0); } }

  *, *::before, *::after { box-sizing: border-box; }

  .od-title {
    font-family: 'Playfair Display', serif;
    font-size: 30px; font-weight: 700;
    margin: 0 0 4px; color: #f9fafb;
    letter-spacing: -0.02em;
  }

  .od-summary {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 28px;
  }

  .od-grid {
    display: grid;
    grid-template-columns: 1fr 1.4fr;
    gap: 24px;
    align-items: start;
  }

  .od-back-btn {
    display: inline-flex; align-items: center; gap: 7px;
    background: rgba(255,255,255,0.04);
    border: 1px solid #1f2937;
    color: #9ca3af; border-radius: 11px;
    padding: 10px 18px; font-size: 14px; font-weight: 600;
    cursor: pointer; font-family: 'DM Sans', sans-serif;
    white-space: nowrap; flex-shrink: 0;
    transition: background 0.2s, color 0.2s;
  }
  .od-back-btn:hover { background: rgba(255,255,255,0.07); color: #f3f4f6; }

  @media (max-width: 960px) {
    .od-grid    { grid-template-columns: 1fr; }
    .od-summary { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 600px) {
    .od-title   { font-size: 22px; }
    .od-summary { grid-template-columns: repeat(2, 1fr); gap: 10px; }
    .od-back-btn span { display: none; }
    .od-back-btn { padding: 10px 12px; }
  }
  @media (max-width: 420px) {
    .od-title   { font-size: 18px; }
  }
`;

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = {
  page: {
    fontFamily: "'DM Sans', sans-serif",
    color: "#e5e7eb",
    padding: "32px 24px 80px",
    animation: "fadeIn 0.35s ease",
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
    width: 40,
    height: 40,
    border: "3px solid #1f2937",
    borderTop: "3px solid #d97706",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  stateText: { color: "#6b7280", fontSize: 14 },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 28,
    flexWrap: "wrap",
    gap: 16,
  },
  breadcrumb: {
    display: "flex",
    gap: 6,
    alignItems: "center",
    marginBottom: 6,
  },
  breadcrumbLink: { color: "#6b7280", fontSize: 13, cursor: "pointer" },
  breadcrumbSep: { color: "#374151" },
  breadcrumbCurrent: { color: "#d97706", fontSize: 13 },
  titleSub: { fontSize: 13, color: "#6b7280", margin: 0 },

  backBtn: {}, // handled via className

  // ── Summary strip ──
  summaryCard: {
    background: "#111827",
    border: "1px solid #1f2937",
    borderRadius: 14,
    padding: "16px 20px",
    animation: "slideUp 0.4s ease",
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    marginBottom: 6,
  },
  summaryValue: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 22,
    fontWeight: 700,
    color: "#f9fafb",
    lineHeight: 1,
  },
  summaryMuted: {
    fontSize: 13,
    color: "#6b7280",
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 400,
  },

  badge: {
    display: "inline-block",
    padding: "4px 12px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
  },

  col: { display: "flex", flexDirection: "column", gap: 20 },

  // ── Section card ──
  sectionCard: {
    background: "#111827",
    border: "1px solid #1f2937",
    borderRadius: 18,
    overflow: "hidden",
    animation: "slideUp 0.45s ease",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "16px 20px",
    borderBottom: "1px solid #1f2937",
  },
  sectionIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 9,
    background: "rgba(217,119,6,0.12)",
    color: "#d97706",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  sectionTitle: { fontSize: 14, fontWeight: 600, color: "#f3f4f6" },
  sectionBody: { padding: "20px" },

  // ── Info rows ──
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    padding: "9px 0",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
  },
  infoLabel: { fontSize: 12, color: "#6b7280", fontWeight: 500, flexShrink: 0 },
  infoValue: {
    fontSize: 13,
    color: "#f3f4f6",
    fontWeight: 500,
    textAlign: "right",
    wordBreak: "break-all",
  },
  mono: {
    fontFamily: "'Courier New', monospace",
    fontSize: 12,
    color: "#9ca3af",
  },

  divider: { borderTop: "1px solid #1f2937", margin: "12px 0" },

  noteBlock: { display: "flex", flexDirection: "column", gap: 6 },
  noteText: {
    fontSize: 13,
    color: "#9ca3af",
    lineHeight: 1.7,
    margin: 0,
    fontStyle: "italic",
  },

  // ── Items list ──
  itemsList: { display: "flex", flexDirection: "column" },
  emptyItems: {
    fontSize: 13,
    color: "#6b7280",
    textAlign: "center",
    padding: "24px 0",
  },

  itemCard: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: "14px 0",
  },
  itemCardBorder: { borderBottom: "1px solid rgba(255,255,255,0.05)" },

  itemImg: {
    width: 56,
    height: 56,
    borderRadius: 10,
    objectFit: "cover",
    border: "1.5px solid #1f2937",
    flexShrink: 0,
  },
  itemImgPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 10,
    background: "#1f2937",
    border: "1.5px solid #374151",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  itemInfo: { flex: 1, minWidth: 0 },
  itemName: {
    fontSize: 13,
    fontWeight: 600,
    color: "#f3f4f6",
    lineHeight: 1.4,
    marginBottom: 6,
  },
  itemMeta: { display: "flex", flexWrap: "wrap", gap: 5 },
  metaChip: {
    fontSize: 10,
    fontWeight: 500,
    color: "#9ca3af",
    background: "#1f2937",
    borderRadius: 5,
    padding: "2px 7px",
    border: "1px solid #374151",
  },

  itemPricing: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 3,
    flexShrink: 0,
  },
  itemQtyBadge: {
    fontSize: 11,
    fontWeight: 700,
    color: "#d97706",
    background: "rgba(217,119,6,0.1)",
    border: "1px solid rgba(217,119,6,0.2)",
    borderRadius: 5,
    padding: "1px 7px",
  },
  itemPrice: { fontSize: 12, color: "#6b7280" },
  itemSubtotal: { fontSize: 14, fontWeight: 700, color: "#f3f4f6" },

  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    paddingTop: 16,
    borderTop: "1px solid #1f2937",
  },
  totalLabel: { fontSize: 13, fontWeight: 600, color: "#9ca3af" },
  totalValue: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 22,
    fontWeight: 700,
    color: "#d97706",
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
