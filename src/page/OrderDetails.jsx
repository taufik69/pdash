import { getOrderByInvoice } from "@/api/api";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  ArrowLeft,
  ShoppingBag,
  User,
  MapPin,
  FileText,
  Package,
} from "lucide-react";

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

// ─── Payment badge ────────────────────────────────────────────────────────────
const PAYMENT_STYLES = {
  cod: { bg: "var(--secondary)", color: "var(--foreground)", border: "var(--border)" },
  online: { bg: "var(--secondary)", color: "var(--success)", border: "var(--border)" },
  card: { bg: "var(--secondary)", color: "var(--foreground)", border: "var(--border)" },
};

function PaymentBadge({ method }) {
  const key = (method || "").toLowerCase();
  const st = PAYMENT_STYLES[key] || {
    bg: "var(--secondary)",
    color: "var(--muted-foreground)",
    border: "var(--border)",
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

  const passedOrder = location.state?.order || null;
  const invoiceId = passedOrder?.invoiceId || location.state?.invoiceId;
  const { data, isPending, isError } = getOrderByInvoice(invoiceId);
  const order = data?.data?.data || passedOrder;

  if (isPending && !order)
    return (
      <div style={s.page}>
        <style>{css}</style>
        <div style={s.centerState}>
          <div style={s.spinner} />
          <p style={s.stateText}>Loading order details…</p>
        </div>
      </div>
    );

  if ((isError && !order) || !order)
    return (
      <div style={s.page}>
        <style>{css}</style>
        <div style={s.centerState}>
          <ArrowLeft size={48} style={{ color: "var(--border)" }} />
          <p style={s.stateText}>{isError ? "Failed to load order." : "Order not found."}</p>
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

  return (
    <div style={s.page}>
      <style>{css}</style>
      <ToastStack toasts={toast.toasts} onRemove={toast.remove} />

      <div style={s.header}>
        <div>
          <div style={s.breadcrumb}>
            <span style={s.breadcrumbLink} onClick={() => navigate("/orders")}>Dashboard</span>
            <span style={s.breadcrumbSep}>/</span>
            <span style={s.breadcrumbLink} onClick={() => navigate("/orders")}>Orders</span>
            <span style={s.breadcrumbSep}>/</span>
            <span style={s.breadcrumbCurrent}>{order.invoiceId || "Details"}</span>
          </div>
          <h1 className="od-title">Order Details</h1>
          <p style={s.titleSub}>Full breakdown for invoice <span style={{ color: "var(--foreground)", fontWeight: 700 }}>{order.invoiceId}</span></p>
        </div>
        <button onClick={() => navigate(-1)} className="od-back-btn">
          <ArrowLeft size={15} />
          <span>Back to Orders</span>
        </button>
      </div>

      <div className="od-summary">
        <div style={s.summaryCard}>
          <div style={s.summaryLabel}>Invoice ID</div>
          <div style={s.summaryValue}>{order.invoiceId || "—"}</div>
        </div>
        <div style={s.summaryCard}>
          <div style={s.summaryLabel}>Total Items</div>
          <div style={s.summaryValue}>{items.length} <span style={s.summaryMuted}>lines</span></div>
        </div>
        <div style={s.summaryCard}>
          <div style={s.summaryLabel}>Total Qty</div>
          <div style={s.summaryValue}>{totalQty} <span style={s.summaryMuted}>pcs</span></div>
        </div>
        <div style={s.summaryCard}>
          <div style={s.summaryLabel}>Payment</div>
          <div style={{ marginTop: 4 }}><PaymentBadge method={order.paymentMethod} /></div>
        </div>
      </div>

      <div className="od-grid">
        <div style={s.col}>
          <SectionCard icon={User} title="Customer Information">
            <InfoRow label="Full Name" value={order.customer?.fullName} />
            <div style={{...s.infoRow, borderBottom: 'none'}}>
               <span style={s.infoLabel}>Phone</span>
               <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4}}>
                  <span style={s.infoValue}>{order.customer?.phone || "—"}</span>
                  <button 
                    onClick={() => navigate(`/fraud-checker?phone=${order.customer?.phone}`)}
                    style={s.fraudBtn}
                  >
                    Check Fraud History
                  </button>
               </div>
            </div>
            <InfoRow label="Email" value={order.customer?.email} />
          </SectionCard>

          <SectionCard icon={MapPin} title="Delivery Address">
            <InfoRow label="Address" value={order.customer?.address} />
            <InfoRow label="City" value={order.customer?.city} />
            <InfoRow label="Region" value={order.customer?.region} />
          </SectionCard>

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

        <div style={s.col}>
          <SectionCard icon={ShoppingBag} title={`Order Items (${items.length})`}>
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
                    <div key={i} style={s.itemCard}>
                      {img ? (
                        <img src={img} alt={name} style={s.itemImg} />
                      ) : (
                        <div style={s.itemImgPlaceholder}>
                          <Package size={18} color="var(--muted-foreground)" />
                        </div>
                      )}
                      <div style={s.itemInfo}>
                        <div style={s.itemName}>{name}</div>
                        <div style={s.itemMeta}>
                          {item.color && <span style={s.metaChip}>{item.color}</span>}
                          {item.size && <span style={s.metaChip}>{item.size}</span>}
                          {item.sku && <span style={s.metaChip}>{item.sku}</span>}
                        </div>
                      </div>
                      <div style={s.itemPricing}>
                        <div style={s.itemQtyBadge}>{item.qty} ×</div>
                        <div style={s.itemPrice}>${Number(price).toFixed(2)}</div>
                        <div style={s.itemSubtotal}>${Number(subtotal).toFixed(2)}</div>
                      </div>
                    </div>
                  );
                })}

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

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeIn { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
  @keyframes slideUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
  @keyframes toastSlide { from { opacity:0; transform:translateX(30px); } to { opacity:1; transform:translateX(0); } }
  *, *::before, *::after { box-sizing: border-box; }

  .od-title { font-size: 32px; font-weight: 800; color: var(--foreground); letter-spacing: -0.03em; margin: 0; }
  .od-summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 32px 0; }
  .od-grid { display: grid; grid-template-columns: 1fr 1.4fr; gap: 32px; align-items: start; }

  .od-back-btn {
    display: inline-flex; align-items: center; gap: 8px;
    background: var(--secondary); border: 1px solid var(--border);
    color: var(--foreground); border-radius: 10px;
    padding: 10px 20px; font-size: 14px; font-weight: 700;
    cursor: pointer; transition: all 0.2s;
  }
  .od-back-btn:hover { background: var(--border); }

  @media (max-width: 960px) {
    .od-grid { grid-template-columns: 1fr; }
    .od-summary { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 600px) {
    .od-summary { grid-template-columns: repeat(2, 1fr); gap: 12px; }
    .od-back-btn span { display: none; }
  }
`;

const s = {
  page: { fontFamily: "'Inter', sans-serif", color: "var(--foreground)", padding: "32px 24px 80px", animation: "fadeIn 0.4s ease" },
  centerState: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 16 },
  spinner: { width: 40, height: 40, border: "3px solid var(--border)", borderTop: "3px solid var(--foreground)", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  stateText: { color: "var(--muted-foreground)", fontSize: 14, fontWeight: 500 },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 8, flexWrap: "wrap", gap: 16 },
  breadcrumb: { display: "flex", gap: 8, alignItems: "center", marginBottom: 8 },
  breadcrumbLink: { color: "var(--muted-foreground)", fontSize: 13, cursor: "pointer", fontWeight: 500 },
  breadcrumbSep: { color: "var(--border)", fontSize: 12 },
  breadcrumbCurrent: { color: "var(--foreground)", fontSize: 13, fontWeight: 600 },
  titleSub: { fontSize: 14, color: "var(--muted-foreground)", margin: 0 },
  summaryCard: { background: "var(--background)", border: "1px solid var(--border)", borderRadius: 12, padding: "20px", animation: "slideUp 0.4s ease", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" },
  summaryLabel: { fontSize: 11, fontWeight: 800, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 },
  summaryValue: { fontSize: 24, fontWeight: 800, color: "var(--foreground)", lineHeight: 1, letterSpacing: "-0.02em" },
  summaryMuted: { fontSize: 13, color: "var(--muted-foreground)", fontWeight: 500 },
  badge: { display: "inline-block", padding: "6px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.03em" },
  col: { display: "flex", flexDirection: "column", gap: 32 },
  sectionCard: { background: "var(--background)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", animation: "slideUp 0.45s ease" },
  sectionHeader: { display: "flex", alignItems: "center", gap: 12, padding: "16px 24px", borderBottom: "1px solid var(--border)" },
  sectionIconWrap: { width: 36, height: 36, borderRadius: 10, background: "var(--secondary)", color: "var(--foreground)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  sectionTitle: { fontSize: 15, fontWeight: 700, color: "var(--foreground)" },
  sectionBody: { padding: "24px" },
  infoRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, padding: "12px 0", borderBottom: "1px solid var(--border)" },
  infoLabel: { fontSize: 13, color: "var(--muted-foreground)", fontWeight: 600, flexShrink: 0 },
  infoValue: { fontSize: 14, color: "var(--foreground)", fontWeight: 700, textAlign: "right", wordBreak: "break-all" },
  mono: { fontStyle: "italic", color: "var(--muted-foreground)", fontSize: 12 },
  divider: { borderTop: "1px solid var(--border)", margin: "16px 0" },
  noteBlock: { display: "flex", flexDirection: "column", gap: 8 },
  noteText: { fontSize: 14, color: "var(--muted-foreground)", lineHeight: 1.6, margin: 0, fontStyle: "italic" },
  fraudBtn: { fontSize: 11, color: "var(--destructive)", background: "var(--secondary)", border: "1px solid var(--border)", padding: "4px 10px", borderRadius: 6, cursor: "pointer", fontWeight: 700 },
  itemsList: { display: "flex", flexDirection: "column", gap: 12 },
  emptyItems: { fontSize: 14, color: "var(--muted-foreground)", textAlign: "center", padding: "32px 0" },
  itemCard: { display: "flex", alignItems: "center", gap: 16, padding: "16px", background: "var(--secondary)", borderRadius: 12, border: "1px solid var(--border)" },
  itemImg: { width: 64, height: 64, borderRadius: 8, objectFit: "cover", border: "1px solid var(--border)", flexShrink: 0 },
  itemImgPlaceholder: { width: 64, height: 64, borderRadius: 8, background: "var(--background)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  itemInfo: { flex: 1, minWidth: 0 },
  itemName: { fontSize: 14, fontWeight: 700, color: "var(--foreground)", lineHeight: 1.4, marginBottom: 8 },
  itemMeta: { display: "flex", flexWrap: "wrap", gap: 8 },
  metaChip: { fontSize: 11, fontWeight: 700, color: "var(--muted-foreground)", background: "var(--background)", borderRadius: 6, padding: "4px 10px", border: "1px solid var(--border)" },
  itemPricing: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 },
  itemQtyBadge: { fontSize: 12, fontWeight: 800, color: "var(--foreground)", background: "var(--background)", border: "1px solid var(--border)", borderRadius: 6, padding: "2px 8px" },
  itemPrice: { fontSize: 12, color: "var(--muted-foreground)", fontWeight: 500 },
  itemSubtotal: { fontSize: 16, fontWeight: 800, color: "var(--foreground)" },
  totalRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24, paddingTop: 24, borderTop: "2px solid var(--border)" },
  totalLabel: { fontSize: 16, fontWeight: 700, color: "var(--muted-foreground)" },
  totalValue: { fontSize: 32, fontWeight: 800, color: "var(--foreground)", letterSpacing: "-0.04em" },
  toastStack: { position: "fixed", top: 24, right: 24, zIndex: 1300, display: "flex", flexDirection: "column", gap: 10, maxWidth: 360 },
  toast: { display: "flex", alignItems: "center", gap: 12, padding: "14px 20px", borderRadius: 10, border: "1px solid var(--border)", fontSize: 14, fontWeight: 600, boxShadow: "0 10px 40px rgba(0,0,0,0.1)", animation: "toastSlide 0.3s ease" },
  toastIcon: { fontWeight: 700 },
  toastMsg: { flex: 1 },
  toastClose: { background: "none", border: "none", cursor: "pointer", opacity: 0.5 },
};
