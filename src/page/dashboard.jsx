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
    pending: { color: "oklch(0.7 0.15 80)", bg: "var(--secondary)", border: "var(--border)" },
    completed: { color: "var(--success)", bg: "var(--secondary)", border: "var(--border)" },
    shipped: { color: "oklch(0.7 0.15 250)", bg: "var(--secondary)", border: "var(--border)" },
    cancelled: { color: "var(--destructive)", bg: "var(--secondary)", border: "var(--border)" },
  };
  return (
    map[s.toLowerCase()] ?? {
      color: "var(--muted-foreground)",
      bg: "var(--secondary)",
      border: "var(--border)",
    }
  );
};

const KPICard = ({ title, value, icon: Icon, delta, idx }) => (
  <div
    className="kpi"
    style={{ animationDelay: `${idx * 60}ms` }}
  >
    <div className="kpi-top">
      <div className="kpi-icon">
        <Icon size={18} />
      </div>
      {delta !== undefined && (
        <span className="kpi-delta">
          <TrendingUp size={12} /> +{delta}%
        </span>
      )}
    </div>
    <div className="kpi-val">{value}</div>
    <div className="kpi-lbl">{title}</div>
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
      delta: 12,
    },
    {
      title: "Orders",
      value: orderLoading ? "—" : orders.length,
      icon: ShoppingCartIcon,
      delta: 8,
    },
    {
      title: "Categories",
      value: catLoading ? "—" : categories.length,
      icon: LayoutGrid,
    },
    {
      title: "Revenue",
      value: orderLoading ? "—" : `৳${revenue.toLocaleString()}`,
      icon: CircleDollarSign,
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
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .pg {
          min-height: 100vh;
          background: var(--background);
          font-family: 'Inter', sans-serif;
          color: var(--foreground);
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
          margin-bottom: 32px;
          animation: up 0.5s ease both;
        }

        @media (min-width: 640px) {
          .hd {
            flex-direction: row;
            align-items: flex-end;
            justify-content: space-between;
          }
        }

        .hd-label {
          font-size: 13px;
          font-weight: 500;
          color: var(--muted-foreground);
          margin-bottom: 4px;
        }

        .hd-title {
          font-size: 32px;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: var(--foreground);
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
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
          color: var(--foreground);
          background: transparent;
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 8px 16px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-outline:hover { background: var(--secondary); }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
          color: var(--primary-foreground);
          background: var(--primary);
          border: 1px solid var(--primary);
          border-radius: 8px;
          padding: 8px 16px;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        .btn-primary:hover { opacity: 0.9; }

        /* ── KPI grid ──────────────────────────────────────── */
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }

        .kpi {
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          animation: up 0.5s ease both;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .kpi:hover { transform: translateY(-2px); }

        .kpi-top { display: flex; align-items: center; justify-content: space-between; }

        .kpi-icon {
          width: 40px; height: 40px;
          border-radius: 10px;
          background: var(--secondary);
          color: var(--foreground);
          display: flex; align-items: center; justify-content: center;
        }

        .kpi-delta {
          display: flex; align-items: center; gap: 4px;
          font-size: 13px; font-weight: 600; color: var(--success);
        }

        .kpi-val {
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: var(--foreground);
        }

        .kpi-lbl {
          font-size: 13px;
          font-weight: 500;
          color: var(--muted-foreground);
        }

        /* ── Content grids ─────────────────────────────────── */
        .grid-a {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
          margin-bottom: 24px;
        }
        @media (min-width: 1024px) { .grid-a { grid-template-columns: 1fr 340px; } }

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
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .panel-hd {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 20px; border-bottom: 1px solid var(--border);
        }
        .panel-title { font-size: 14px; font-weight: 700; color: var(--foreground); }
        .panel-cta {
          background: none;
          border: none;
          cursor: pointer;
          transition: color 0.12s;
        }

        .panel-cta:hover { color: var(--foreground); }

        /* ── Orders table ──────────────────────────────────── */
        .tbl-wrap { overflow-x: auto; }
        table.t { width: 100%; border-collapse: collapse; }
        table.t th {
          padding: 12px 20px; text-align: left;
          font-size: 12px; font-weight: 600; color: var(--muted-foreground);
          text-transform: uppercase; letter-spacing: 0.05em;
          border-bottom: 1px solid var(--border);
        }
        table.t td { padding: 14px 20px; border-bottom: 1px solid var(--border); }
        table.t tr:last-child td { border-bottom: none; }
        table.t tr:hover { background: var(--secondary); }

        .t-inv { font-size: 13px; font-weight: 600; color: var(--foreground); }
        .t-name { font-size: 14px; color: var(--muted-foreground); }
        .t-pill {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 12px; font-weight: 600;
          padding: 2px 10px; border-radius: 6px; border: 1px solid var(--border);
        }
        .t-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
        .t-amt { font-size: 14px; font-weight: 700; }

        .t-del {
          background: none; border: none; cursor: pointer; color: var(--muted-foreground);
          padding: 6px; border-radius: 6px; transition: all 0.2s;
        }
        .t-del:hover { color: var(--destructive); background: var(--secondary); }

        /* ── Product rows ──────────────────────────────────── */
        .p-row {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 20px; border-bottom: 1px solid var(--border);
          transition: background 0.2s;
        }
        .p-row:last-child { border-bottom: none; }
        .p-row:hover { background: var(--secondary); }

        .p-thumb {
          width: 40px; height: 40px; border-radius: 8px;
          background: var(--secondary); border: 1px solid var(--border);
          overflow: hidden; display: flex; align-items: center; justify-content: center;
        }
        .p-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .p-info { flex: 1; min-width: 0; }
        .p-name { font-size: 14px; font-weight: 600; color: var(--foreground); margin-bottom: 2px; }
        .p-price { font-size: 12px; color: var(--muted-foreground); }

        .cat-wrap { padding: 16px; display: flex; flex-wrap: wrap; gap: 8px; }
        .cat-chip {
          font-size: 12px; font-weight: 500; color: var(--foreground);
          background: var(--secondary); border: 1px solid var(--border);
          padding: 4px 12px; border-radius: 6px; transition: all 0.2s;
        }
        .cat-chip:hover { border-color: var(--foreground); }

        /* ── Quick actions ─────────────────────────────────── */
        .qa {
          background: var(--background); border: 1px solid var(--border);
          border-radius: 12px; padding: 24px; margin-top: 24px;
        }
        .qa-lbl { font-size: 13px; font-weight: 500; color: var(--muted-foreground); margin-bottom: 4px; }
        .qa-title { font-size: 18px; font-weight: 700; color: var(--foreground); margin-bottom: 20px; }
        .qa-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; }
        .qa-btn {
          display: flex; align-items: center; gap: 12px; padding: 14px;
          background: var(--background); border: 1px solid var(--border);
          border-radius: 10px; cursor: pointer; transition: all 0.2s;
        }
        .qa-btn:hover { border-color: var(--foreground); background: var(--secondary); transform: translateY(-2px); }
        .qa-ico { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; background: var(--secondary); }
        .qa-name { font-size: 13px; font-weight: 600; color: var(--foreground); }

        @keyframes up {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
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
                  color: "oklch(0.6 0.15 40)",
                },
                {
                  label: "Add Category",
                  icon: LayoutGrid,
                  route: "/add-category",
                  color: "oklch(0.6 0.15 280)",
                },
                {
                  label: "View Orders",
                  icon: ListOrdered,
                  route: "/order-list",
                  color: "oklch(0.6 0.15 220)",
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
