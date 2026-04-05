import {
  CircleDollarSign,
  ShoppingCartIcon,
  TagIcon,
  LayoutGrid,
  Package,
  ListOrdered,
  Plus,
  Trash2,
  ArrowUpRight,
  RefreshCw,
  TrendingUp,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCategory } from "@/api/api";
import { getProducts } from "@/api/api";
import { getOrders, deleteOrder } from "@/api/api";

const statusMeta = (s = "") => {
  const map = {
    pending: { color: "#da7708", bg: "#da77081a", border: "#da770833" },
    completed: { color: "#4ade80", bg: "#4ade801a", border: "#4ade8033" },
    shipped: { color: "#60a5fa", bg: "#60a5fa1a", border: "#60a5fa33" },
    cancelled: { color: "#f87171", bg: "#f871711a", border: "#f8717133" },
  };
  return (
    map[s.toLowerCase()] ?? {
      color: "#607d99",
      bg: "#607d991a",
      border: "#607d9933",
    }
  );
};

const KPICard = ({ title, value, icon: Icon, accent, delta, idx }) => (
  <div
    className="kpi"
    style={{ "--a": accent, animationDelay: `${idx * 60}ms` }}
  >
    <div className="kpi-top">
      <div
        className="kpi-icon"
        style={{ background: `${accent}1a`, border: `1px solid ${accent}33` }}
      >
        <Icon size={15} style={{ color: accent }} />
      </div>
      {delta !== undefined && (
        <span className="kpi-delta">
          <TrendingUp size={9} /> +{delta}%
        </span>
      )}
    </div>
    <p className="kpi-val">{value}</p>
    <p className="kpi-lbl">{title}</p>
  </div>
);

const Panel = ({ title, cta, onCta, children }) => (
  <div className="panel">
    <div className="panel-hd">
      <span className="panel-title">{title}</span>
      {cta && (
        <button className="panel-cta" onClick={onCta}>
          {cta} <ChevronRight size={10} />
        </button>
      )}
    </div>
    {children}
  </div>
);

const Bone = ({ h = 32 }) => <div className="bone" style={{ height: h }} />;
const BoneList = ({ n = 4, h }) => (
  <div
    style={{
      padding: "12px 16px",
      display: "flex",
      flexDirection: "column",
      gap: 7,
    }}
  >
    {[...Array(n)].map((_, i) => (
      <Bone key={i} h={h} />
    ))}
  </div>
);

const Empty = ({ icon: Icon, msg }) => (
  <div className="empty-st">
    <Icon size={18} />
    <p>{msg}</p>
  </div>
);

export default function Page() {
  const navigate = useNavigate();
  const [deletingId, setDeletingId] = useState(null);

  const { data: catData, isLoading: catLoading } = getCategory();
  const { data: prodData, isLoading: prodLoading } = getProducts();
  const { data: orderData, isLoading: orderLoading } = getOrders();
  const deleteMutation = deleteOrder();

  const categories = catData?.data?.data ?? [];
  const products = prodData?.data?.data ?? [];
  const orders = orderData?.data?.data ?? [];

  const revenue = orders
    .filter((o) => (o.status ?? "").toLowerCase() === "completed")
    .reduce((s, o) => s + (parseFloat(o.totalAmount) || 0), 0);

  const kpis = [
    {
      title: "Products",
      value: prodLoading ? "—" : products.length,
      icon: TagIcon,
      accent: "#da7708",
      delta: 12,
    },
    {
      title: "Orders",
      value: orderLoading ? "—" : orders.length,
      icon: ShoppingCartIcon,
      accent: "#60a5fa",
      delta: 8,
    },
    {
      title: "Categories",
      value: catLoading ? "—" : categories.length,
      icon: LayoutGrid,
      accent: "#c084fc",
    },
    {
      title: "Revenue",
      value: orderLoading ? "—" : `৳${revenue.toLocaleString()}`,
      icon: CircleDollarSign,
      accent: "#4ade80",
      delta: 23,
    },
  ];

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this order?")) return;
    setDeletingId(id);
    await deleteMutation.mutateAsync(id).finally(() => setDeletingId(null));
  };

  return (
    <div className="pg">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist+Mono:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --panel:  #0c1829;
          --lift:   #111f30;
          --border: #172335;
          --line:   #1d2f45;
          --amber:  #da7708;
          --amb10:  #da77081a;
          --amb25:  #da770840;
          --ink:    #cddaec;
          --dim:    #5c7892;
          --muted:  #2d4360;
          --font:   'Geist Mono', 'Fira Code', ui-monospace, monospace;
        }

        /* ── Page ──────────────────────────────────────────── */
        .pg {
          min-height: 100vh;
          background:
            radial-gradient(ellipse 55% 35% at 10% 0%, #da77080f 0%, transparent 55%),
            var(--bg);
          font-family: var(--font);
          color: var(--ink);
          padding: 24px 20px 48px;
        }

        @media (min-width: 640px)  { .pg { padding: 28px 28px 52px; } }
        @media (min-width: 1024px) { .pg { padding: 36px 40px 60px; } }

        .pg-inner {
          max-width: 1280px;
          margin: 0 auto;
        }

        /* ── Header ────────────────────────────────────────── */
        .hd {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 28px;
          padding-bottom: 20px;
          border-bottom: 1px solid var(--border);
          animation: up 0.5s ease both;
        }

        @media (min-width: 640px) {
          .hd {
            flex-direction: row;
            align-items: flex-end;
            justify-content: space-between;
            margin-bottom: 32px;
          }
        }

        .hd-label {
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.26em;
          text-transform: uppercase;
          color: var(--amber);
          margin-bottom: 6px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .hd-label::before {
          content: '';
          width: 16px; height: 2px;
          background: var(--amber);
          border-radius: 1px;
        }

        .hd-title {
          font-size: 26px;
          font-weight: 600;
          letter-spacing: -0.02em;
          color: var(--ink);
          line-height: 1.1;
        }

        @media (min-width: 640px) { .hd-title { font-size: 30px; } }

        .hd-actions {
          display: flex;
          gap: 8px;
          flex-shrink: 0;
        }

        .btn-outline {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: var(--font);
          font-size: 10px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--dim);
          background: transparent;
          border: 1px solid var(--border);
          border-radius: 4px;
          padding: 8px 14px;
          cursor: pointer;
          transition: color 0.13s, border-color 0.13s, background 0.13s;
          white-space: nowrap;
        }

        .btn-outline:hover {
          color: var(--ink);
          border-color: var(--muted);
          background: var(--lift);
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: var(--font);
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #07101d;
          background: var(--amber);
          border: 1px solid var(--amber);
          border-radius: 4px;
          padding: 8px 16px;
          cursor: pointer;
          transition: opacity 0.13s, box-shadow 0.2s;
          white-space: nowrap;
          box-shadow: 0 0 0 0 var(--amb25);
        }

        .btn-primary:hover {
          opacity: 0.88;
          box-shadow: 0 0 20px var(--amb25);
        }

        /* ── KPI grid ──────────────────────────────────────── */
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-bottom: 14px;
        }

        @media (min-width: 768px)  { .kpi-grid { grid-template-columns: repeat(4, 1fr); gap: 12px; } }

        .kpi {
          background: var(--panel);
          border: 1px solid var(--border);
          border-top: 2px solid var(--a);
          border-radius: 6px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          animation: up 0.5s ease both;
          transition: transform 0.18s, box-shadow 0.18s;
        }

        .kpi:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 20px #0008;
        }

        .kpi-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .kpi-icon {
          width: 32px; height: 32px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .kpi-delta {
          display: flex;
          align-items: center;
          gap: 3px;
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.04em;
          color: #4ade80;
        }

        .kpi-val {
          font-size: 24px;
          font-weight: 500;
          letter-spacing: -0.03em;
          color: var(--ink);
          font-variant-numeric: tabular-nums;
        }

        @media (min-width: 640px) { .kpi-val { font-size: 28px; } }

        .kpi-lbl {
          font-size: 9px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--dim);
        }

        /* ── Content grids ─────────────────────────────────── */
        .grid-a {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
          margin-bottom: 12px;
        }

        @media (min-width: 1024px) {
          .grid-a { grid-template-columns: 1fr 300px; }
        }

        .grid-b {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }

        @media (min-width: 768px) {
          .grid-b { grid-template-columns: 1fr 1fr; }
        }

        @media (min-width: 1024px) {
          .grid-b { grid-template-columns: 240px 1fr; }
        }

        /* ── Panel ─────────────────────────────────────────── */
        .panel {
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 6px;
          overflow: hidden;
          animation: up 0.5s 0.1s ease both;
        }

        .panel-hd {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border);
        }

        .panel-title {
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: var(--dim);
        }

        .panel-cta {
          display: flex;
          align-items: center;
          gap: 3px;
          font-family: var(--font);
          font-size: 9px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--muted);
          background: none;
          border: none;
          cursor: pointer;
          transition: color 0.12s;
        }

        .panel-cta:hover { color: var(--amber); }

        /* ── Orders table ──────────────────────────────────── */
        .tbl-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }

        table.t {
          width: 100%;
          border-collapse: collapse;
          min-width: 480px;
        }

        table.t th {
          padding: 9px 16px;
          text-align: left;
          font-size: 8.5px;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--muted);
          border-bottom: 1px solid var(--border);
          white-space: nowrap;
        }

        table.t td {
          padding: 10px 16px;
          border-bottom: 1px solid var(--line);
          vertical-align: middle;
        }

        table.t tr:last-child td { border-bottom: none; }
        table.t tbody tr { transition: background 0.1s; }
        table.t tbody tr:hover { background: var(--lift); }

        .t-inv { font-size: 10px; letter-spacing: 0.06em; color: var(--muted); }
        .t-name { font-size: 11.5px; color: var(--ink); }

        .t-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 8.5px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 3px 8px;
          border-radius: 3px;
          border: 1px solid;
        }

        .t-dot { width: 4px; height: 4px; border-radius: 50%; background: currentColor; flex-shrink: 0; }

        .t-amt { font-size: 11.5px; font-weight: 500; font-variant-numeric: tabular-nums; }

        .t-del {
          background: none; border: none;
          cursor: pointer;
          color: var(--border);
          padding: 3px;
          border-radius: 3px;
          opacity: 0;
          transition: color 0.12s, background 0.12s, opacity 0.12s;
        }

        tr:hover .t-del { opacity: 1; }
        .t-del:hover { color: #f87171; background: #f8717114; }

        /* ── Product rows ──────────────────────────────────── */
        .p-row {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 11px 16px;
          border-bottom: 1px solid var(--line);
          transition: background 0.1s;
        }

        .p-row:last-child { border-bottom: none; }
        .p-row:hover { background: var(--lift); }
        .p-row:hover .p-arr { color: var(--amber); }

        .p-thumb {
          width: 36px; height: 36px;
          border-radius: 5px;
          background: var(--lift);
          border: 1px solid var(--border);
          flex-shrink: 0;
          overflow: hidden;
          display: flex; align-items: center; justify-content: center;
        }

        .p-thumb img { width: 100%; height: 100%; object-fit: cover; }

        .p-info { flex: 1; min-width: 0; }

        .p-name {
          font-size: 11px;
          color: var(--ink);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-bottom: 2px;
        }

        .p-price { font-size: 10px; color: var(--amber); letter-spacing: 0.04em; }
        .p-arr { color: var(--line); flex-shrink: 0; transition: color 0.12s; }

        /* ── Category chips ────────────────────────────────── */
        .cat-wrap { padding: 12px 14px; display: flex; flex-wrap: wrap; gap: 7px; }

        .cat-chip {
          font-family: var(--font);
          font-size: 9px;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--dim);
          background: var(--lift);
          border: 1px solid var(--border);
          padding: 5px 11px;
          border-radius: 3px;
          cursor: default;
          transition: color 0.12s, border-color 0.12s, background 0.12s;
        }

        .cat-chip:hover {
          color: var(--amber);
          border-color: var(--amb25);
          background: var(--amb10);
        }

        /* ── Quick actions ─────────────────────────────────── */
        .qa {
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 20px;
          animation: up 0.5s 0.18s ease both;
        }

        .qa-lbl {
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: var(--dim);
          margin-bottom: 4px;
        }

        .qa-title {
          font-size: 18px;
          font-weight: 500;
          letter-spacing: -0.01em;
          color: var(--ink);
          margin-bottom: 18px;
        }

        .qa-title span { color: var(--amber); }

        .qa-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 8px;
        }

        @media (min-width: 480px) { .qa-grid { grid-template-columns: repeat(3, 1fr); } }

        .qa-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 13px 14px;
          background: var(--lift);
          border: 1px solid var(--border);
          border-radius: 5px;
          cursor: pointer;
          text-align: left;
          transition: border-color 0.14s, background 0.14s, transform 0.12s;
          position: relative;
          overflow: hidden;
        }

        .qa-btn::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 2px;
          background: var(--q);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.2s ease;
        }

        .qa-btn:hover {
          border-color: color-mix(in srgb, var(--q) 40%, transparent);
          transform: translateY(-1px);
        }

        .qa-btn:hover::after { transform: scaleX(1); }
        .qa-btn:active { transform: scale(0.98); }

        .qa-ico {
          width: 30px; height: 30px;
          border-radius: 6px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        .qa-name {
          font-family: var(--font);
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          flex: 1;
          text-align: left;
        }

        /* ── Skeletons ─────────────────────────────────────── */
        .bone {
          border-radius: 3px;
          background: linear-gradient(90deg, var(--lift) 25%, var(--border) 50%, var(--lift) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.8s ease infinite;
        }

        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* ── Empty ─────────────────────────────────────────── */
        .empty-st {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 8px; padding: 36px 20px;
          color: var(--muted);
          font-size: 10px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        /* ── Scrollbar ─────────────────────────────────────── */
        ::-webkit-scrollbar { width: 3px; height: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
        ::-webkit-scrollbar-thumb:hover { background: var(--amb25); }

        /* ── Animations ────────────────────────────────────── */
        @keyframes up {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="pg-inner">
        {/* ── Header ──────────────────────────────────────── */}
        <header className="hd">
          <div>
            <p className="hd-label">Overview</p>
            <h1 className="hd-title">Admin Dashboard</h1>
          </div>
          <div className="hd-actions">
            <button
              className="btn-outline"
              onClick={() => window.location.reload()}
            >
              <RefreshCw size={11} /> Refresh
            </button>
            <button
              className="btn-primary"
              onClick={() => navigate("/add-product")}
            >
              <Plus size={11} /> New Product
            </button>
          </div>
        </header>

        {/* ── KPIs ────────────────────────────────────────── */}
        <div className="kpi-grid">
          {kpis.map((k, i) => (
            <KPICard key={k.title} {...k} idx={i} />
          ))}
        </div>

        {/* ── Orders + Products ────────────────────────────── */}
        <div className="grid-a">
          <Panel
            title="Recent Orders"
            cta="View all"
            onCta={() => navigate("/order-list")}
          >
            {orderLoading ? (
              <BoneList n={6} h={34} />
            ) : orders.length === 0 ? (
              <Empty icon={AlertCircle} msg="No orders yet" />
            ) : (
              <div className="tbl-wrap">
                <table className="t">
                  <thead>
                    <tr>
                      {["Invoice", "Customer", "Status", "Amount", ""].map(
                        (h) => (
                          <th key={h}>{h}</th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 8).map((o, i) => {
                      const sm = statusMeta(o.status);
                      const oid = o.invoiceID ?? o._id;
                      return (
                        <tr key={o._id ?? i}>
                          <td>
                            <span className="t-inv">
                              #{o.invoiceID ?? o._id?.slice(-6)}
                            </span>
                          </td>
                          <td>
                            <span className="t-name">
                              {o.customerName ?? o.user?.name ?? "—"}
                            </span>
                          </td>
                          <td>
                            <span
                              className="t-pill"
                              style={{
                                color: sm.color,
                                background: sm.bg,
                                borderColor: sm.border,
                              }}
                            >
                              <span className="t-dot" />
                              {o.status ?? "Unknown"}
                            </span>
                          </td>
                          <td>
                            <span className="t-amt" style={{ color: sm.color }}>
                              ৳{parseFloat(o.totalAmount ?? 0).toLocaleString()}
                            </span>
                          </td>
                          <td>
                            <button
                              className="t-del"
                              onClick={() => handleDelete(oid)}
                              disabled={deletingId === oid}
                            >
                              <Trash2 size={12} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>

          <Panel
            title="Products"
            cta="Manage"
            onCta={() => navigate("/products")}
          >
            {prodLoading ? (
              <BoneList n={5} h={46} />
            ) : products.length === 0 ? (
              <Empty icon={Package} msg="No products" />
            ) : (
              products.slice(0, 6).map((prod, i) => (
                <div className="p-row" key={prod._id ?? i}>
                  <div className="p-thumb">
                    {prod.images?.[0] ? (
                      <img src={prod.images[0]} alt={prod.name} />
                    ) : (
                      <Package size={12} style={{ color: "var(--muted)" }} />
                    )}
                  </div>
                  <div className="p-info">
                    <p className="p-name">{prod.name}</p>
                    <p className="p-price">
                      ৳{parseFloat(prod.price ?? 0).toLocaleString()}
                    </p>
                  </div>
                  <ArrowUpRight size={12} className="p-arr" />
                </div>
              ))
            )}
          </Panel>
        </div>

        {/* ── Categories + Quick Actions ────────────────────── */}
        <div className="grid-b">
          <Panel
            title="Categories"
            cta="Manage"
            onCta={() => navigate("/add-category")}
          >
            {catLoading ? (
              <BoneList n={4} h={26} />
            ) : categories.length === 0 ? (
              <Empty icon={LayoutGrid} msg="No categories" />
            ) : (
              <div className="cat-wrap">
                {categories.map((c, i) => (
                  <span className="cat-chip" key={c._id ?? i}>
                    {c.name}
                  </span>
                ))}
              </div>
            )}
          </Panel>

          <div className="qa">
            <p className="qa-lbl">Shortcuts</p>
            <p className="qa-title">
              Jump right <span>in</span>
            </p>
            <div className="qa-grid">
              {[
                {
                  label: "Add Product",
                  icon: Plus,
                  route: "/add-product",
                  color: "#da7708",
                },
                {
                  label: "Add Category",
                  icon: LayoutGrid,
                  route: "/add-category",
                  color: "#c084fc",
                },
                {
                  label: "View Orders",
                  icon: ListOrdered,
                  route: "/order-list",
                  color: "#60a5fa",
                },
              ].map(({ label, icon: Icon, route, color }) => (
                <button
                  key={label}
                  className="qa-btn"
                  onClick={() => navigate(route)}
                  style={{ "--q": color }}
                >
                  <div
                    className="qa-ico"
                    style={{
                      background: `${color}18`,
                      border: `1px solid ${color}30`,
                    }}
                  >
                    <Icon size={13} style={{ color }} />
                  </div>
                  <span className="qa-name" style={{ color }}>
                    {label}
                  </span>
                  <ChevronRight
                    size={11}
                    style={{ color, opacity: 0.5, flexShrink: 0 }}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
