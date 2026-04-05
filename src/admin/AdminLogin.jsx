import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  Lock,
  Mail,
  BarChart3,
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
  Activity,
  CheckCircle2,
} from "lucide-react";

const BARS = [42, 68, 55, 80, 63, 91, 74, 58, 87, 70, 95, 82];
const ALERTS = [
  { text: "New order #4821 received", time: "2m ago", dot: "#22c55e" },
  { text: "Low stock: Teak Chair", time: "18m ago", dot: "#f59e0b" },
  { text: "Payment confirmed #4819", time: "34m ago", dot: "#22c55e" },
];

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [focused, setFocused] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    if (
      formData.email === "admin@gmail.com" &&
      formData.password === "admin"
    ) {
      localStorage.setItem(
        "admin",
        JSON.stringify({
          name: "Admin",
          email: formData.email,
          avatar: './default.jpg',
          token: "loggedin",
        }),
      );
      navigate("/home");
    } else {
      setError("Invalid credentials. Please try again.");
      setLoading(false);
    }
  };

  const maxBar = Math.max(...BARS);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        background: "#0d1117",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Sora:wght@600;700;800&display=swap');

        :root {
          --amber:#da7708; --amber-lt:#f59e0b; --amber-dk:#92400e;
          --bg:#0d1117; --bg2:#111827; --bg3:#161d2e;
          --border:rgba(255,255,255,0.055); --border-a:rgba(218,119,8,0.35);
          --text:#f1f5f9; --muted:#4b5563;
        }

        @keyframes fadeUp    { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spinCW    { to{transform:rotate(360deg)} }
        @keyframes spinCCW   { to{transform:rotate(-360deg)} }
        @keyframes pulseGlow { 0%,100%{box-shadow:0 0 0 0 rgba(218,119,8,.4)} 50%{box-shadow:0 0 0 10px rgba(218,119,8,0)} }
        @keyframes float     { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        @keyframes shake     { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-7px)} 40%{transform:translateX(7px)} 60%{transform:translateX(-5px)} 80%{transform:translateX(5px)} }
        @keyframes loadBar   { 0%{width:0;opacity:1} 85%{width:90%;opacity:1} 100%{width:100%;opacity:0} }
        @keyframes barGrow   { from{transform:scaleY(0)} to{transform:scaleY(1)} }
        @keyframes shimmer   { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes dotBlink  { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.35;transform:scale(.65)} }
        @keyframes scanLine  { 0%{top:-40%} 100%{top:140%} }
        @keyframes gridMove  { from{background-position:0 0} to{background-position:0 40px} }
        @keyframes ringCW    { to{transform:rotate(360deg)} }
        @keyframes ringCCW   { to{transform:rotate(-360deg)} }

        .f1{animation:fadeUp .5s cubic-bezier(.22,1,.36,1) .05s both}
        .f2{animation:fadeUp .5s cubic-bezier(.22,1,.36,1) .15s both}
        .f3{animation:fadeUp .5s cubic-bezier(.22,1,.36,1) .25s both}
        .f4{animation:fadeUp .5s cubic-bezier(.22,1,.36,1) .35s both}
        .f5{animation:fadeUp .5s cubic-bezier(.22,1,.36,1) .45s both}
        .f6{animation:fadeUp .5s cubic-bezier(.22,1,.36,1) .55s both}

        .float-it  { animation:float 5s ease-in-out infinite }
        .shake     { animation:shake .42s ease }

        .inp {
          width:100%; background:var(--bg3);
          border:1px solid var(--border); border-radius:10px;
          color:var(--text); font-size:14px;
          font-family:'Plus Jakarta Sans',sans-serif;
          padding:13px 13px 13px 44px;
          outline:none; transition:border .2s,box-shadow .2s,background .2s;
          letter-spacing:.01em;
        }
        .inp:focus { border-color:var(--border-a); background:rgba(218,119,8,.04); box-shadow:0 0 0 3px rgba(218,119,8,.1); }
        .inp::placeholder { color:rgba(255,255,255,.18); }

        .cta {
          width:100%; padding:14px 20px; border-radius:10px; border:none;
          cursor:pointer; font-family:'Plus Jakarta Sans',sans-serif;
          font-size:14.5px; font-weight:700; letter-spacing:.025em; color:#0d1117;
          background:linear-gradient(135deg,#f59e0b 0%,#da7708 55%,#b45309 100%);
          display:flex; align-items:center; justify-content:center; gap:8px;
          position:relative; overflow:hidden; transition:transform .2s,box-shadow .2s;
        }
        .cta:hover:not(:disabled){ transform:translateY(-1px); box-shadow:0 10px 34px rgba(218,119,8,.36); }
        .cta:active:not(:disabled){ transform:translateY(0); }
        .cta:disabled{ opacity:.65; cursor:not-allowed; }
        .cta::before{ content:''; position:absolute; inset:0; background:linear-gradient(135deg,rgba(255,255,255,.2),transparent 55%); opacity:0; transition:opacity .2s; }
        .cta:hover::before{ opacity:1; }
        .cta-bar{ position:absolute; bottom:0; left:0; height:2px; background:rgba(0,0,0,.25); animation:loadBar 1s ease forwards; }

        .shimmer-t {
          background:linear-gradient(90deg,#da7708,#f59e0b,#fde68a,#f59e0b,#da7708);
          background-size:200% auto;
          -webkit-background-clip:text; -webkit-text-fill-color:transparent;
          animation:shimmer 3.5s linear infinite;
        }

        .dash-card { background:var(--bg3); border:1px solid var(--border); border-radius:12px; overflow:hidden; }
        .stat-chip { background:rgba(218,119,8,.06); border:1px solid rgba(218,119,8,.14); border-radius:8px; padding:10px 12px; transition:all .2s; }
        .stat-chip:hover { background:rgba(218,119,8,.11); border-color:rgba(218,119,8,.28); }

        .grid-bg {
          position:absolute; inset:0;
          background-image:linear-gradient(rgba(218,119,8,.032) 1px,transparent 1px),linear-gradient(90deg,rgba(218,119,8,.032) 1px,transparent 1px);
          background-size:40px 40px;
          animation:gridMove 10s linear infinite;
          pointer-events:none;
        }
        .orb { position:absolute; border-radius:50%; filter:blur(85px); pointer-events:none; }
        .divider { height:1px; background:linear-gradient(90deg,transparent,rgba(218,119,8,.18),transparent); }
        .live-dot { width:7px; height:7px; border-radius:50%; background:#22c55e; animation:dotBlink 2s ease-in-out infinite; }

        .ring-outer { animation:ringCW  12s linear infinite; border:1px solid rgba(218,119,8,.22); background-image:conic-gradient(from 0deg,transparent 62%,rgba(218,119,8,.65) 100%); }
        .ring-inner { animation:ringCCW 8s  linear infinite; border:1px solid rgba(245,158,11,.14); }

        .scan-wrap { position:relative; overflow:hidden; }
        .scan-wrap::after { content:''; position:absolute; left:0; right:0; height:35%; background:linear-gradient(to bottom,transparent,rgba(218,119,8,.1),transparent); animation:scanLine 3.5s ease-in-out infinite; pointer-events:none; }

        .field-label { font-size:11px; font-weight:600; letter-spacing:.09em; text-transform:uppercase; color:var(--muted); margin-bottom:6px; display:block; }
        .badge { display:inline-flex; align-items:center; gap:5px; font-size:10px; font-weight:700; letter-spacing:.06em; color:rgba(218,119,8,.7); background:rgba(218,119,8,.08); border:1px solid rgba(218,119,8,.18); border-radius:20px; padding:4px 10px; }
        .sec-item { display:flex; align-items:center; gap:5px; }
        .sec-item span:first-child { color:rgba(218,119,8,.45); }
        .sec-item span:last-child  { font-size:10px; color:#1f2937; font-weight:600; letter-spacing:.04em; }
      `}</style>

      {/* ══════════ LEFT PANEL ══════════ */}
      <div
        className="hidden lg:flex"
        style={{
          width: "52%",
          position: "relative",
          overflow: "hidden",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 36px",
        }}
      >
        <div className="grid-bg" />
        <div
          className="orb"
          style={{
            width: 480,
            height: 480,
            background: "rgba(218,119,8,.1)",
            top: "-8%",
            left: "-8%",
          }}
        />
        <div
          className="orb"
          style={{
            width: 280,
            height: 280,
            background: "rgba(245,158,11,.06)",
            bottom: "2%",
            right: "8%",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            right: 0,
            width: 80,
            background: "linear-gradient(to left,#0d1117,transparent)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 80,
            background: "linear-gradient(to top,#0d1117,transparent)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 10,
            width: "100%",
            maxWidth: 450,
            opacity: mounted ? 1 : 0,
            transition: "opacity .8s ease .1s",
          }}
        >
          {/* Brand row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginBottom: 32,
            }}
          >
            <div
              className="float-it"
              style={{
                position: "relative",
                width: 50,
                height: 50,
                flexShrink: 0,
              }}
            >
              <div
                className="ring-outer"
                style={{ position: "absolute", inset: 0, borderRadius: "50%" }}
              />
              <div
                className="ring-inner"
                style={{ position: "absolute", inset: 4, borderRadius: "50%" }}
              />
              <div
                className="scan-wrap"
                style={{
                  position: "absolute",
                  inset: 8,
                  borderRadius: 9,
                  background: "linear-gradient(135deg,#da7708,#92400e)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  animation: "pulseGlow 3s ease-in-out infinite",
                }}
              >
                <ShieldCheck size={17} color="#0d1117" strokeWidth={2.5} />
              </div>
            </div>
            <div>
              <p
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: ".18em",
                  textTransform: "uppercase",
                  color: "rgba(218,119,8,.55)",
                  marginBottom: 2,
                }}
              >
                BD Online Shop
              </p>
              <p
                style={{
                  fontSize: 19,
                  fontWeight: 800,
                  color: "#f1f5f9",
                  fontFamily: "'Sora',sans-serif",
                  lineHeight: 1.1,
                }}
              >
                Admin <span className="shimmer-t">Dashboard</span>
              </p>
            </div>
            <div
              style={{
                marginLeft: "auto",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <div className="live-dot" />
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#22c55e",
                  letterSpacing: ".06em",
                }}
              >
                LIVE
              </span>
            </div>
          </div>

          {/* Dashboard preview card */}
          <div className="dash-card" style={{ marginBottom: 14 }}>
            {/* Window chrome */}
            <div
              style={{
                padding: "9px 14px",
                borderBottom: "1px solid rgba(255,255,255,.04)",
                display: "flex",
                alignItems: "center",
                gap: 7,
              }}
            >
              {["#ef4444", "#f59e0b", "#22c55e"].map((c) => (
                <div
                  key={c}
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: c,
                    opacity: 0.7,
                  }}
                />
              ))}
              <div
                style={{
                  flex: 1,
                  height: 4,
                  borderRadius: 2,
                  background: "rgba(255,255,255,.04)",
                  marginLeft: 8,
                }}
              />
              <span
                style={{
                  fontSize: 8,
                  color: "var(--muted)",
                  fontWeight: 700,
                  letterSpacing: ".1em",
                }}
              >
                ADMIN PANEL
              </span>
            </div>

            <div style={{ display: "flex", height: 185 }}>
              {/* Sidebar */}
              <div
                style={{
                  width: 42,
                  borderRight: "1px solid rgba(255,255,255,.04)",
                  padding: "12px 0",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                {[BarChart3, Package, ShoppingCart, Users, Activity].map(
                  (Icon, i) => (
                    <div
                      key={i}
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: 6,
                        background:
                          i === 0 ? "rgba(218,119,8,.2)" : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: i === 0 ? "#da7708" : "rgba(255,255,255,.16)",
                      }}
                    >
                      <Icon size={12} />
                    </div>
                  ),
                )}
              </div>

              {/* Content */}
              <div
                style={{
                  flex: 1,
                  padding: "13px 14px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 7,
                  }}
                >
                  {[
                    { label: "Revenue", val: "৳84K", c: "#22c55e" },
                    { label: "Orders", val: "350", c: "#f59e0b" },
                    { label: "Stock", val: "120", c: "#60a5fa" },
                  ].map(({ label, val, c }) => (
                    <div
                      key={label}
                      style={{
                        background: "rgba(255,255,255,.025)",
                        border: "1px solid rgba(255,255,255,.045)",
                        borderRadius: 7,
                        padding: "7px 8px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 7.5,
                          color: "var(--muted)",
                          fontWeight: 700,
                          letterSpacing: ".06em",
                          display: "block",
                          marginBottom: 4,
                        }}
                      >
                        {label.toUpperCase()}
                      </span>
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 800,
                          color: "#f1f5f9",
                          fontFamily: "'Sora',sans-serif",
                        }}
                      >
                        {val}
                      </p>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 5,
                  }}
                >
                  <p
                    style={{
                      fontSize: 7.5,
                      fontWeight: 700,
                      color: "var(--muted)",
                      letterSpacing: ".09em",
                    }}
                  >
                    MONTHLY REVENUE
                  </p>
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "flex-end",
                      gap: 2.5,
                    }}
                  >
                    {BARS.map((h, i) => (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          height: `${(h / maxBar) * 100}%`,
                          borderRadius: 2,
                          background:
                            i === BARS.length - 1
                              ? "linear-gradient(to top,#da7708,#f59e0b)"
                              : "rgba(218,119,8,.18)",
                          transformOrigin: "bottom",
                          animation: `barGrow .55s cubic-bezier(.22,1,.36,1) ${i * 0.035}s both`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Activity feed */}
          <div
            className="dash-card"
            style={{ padding: "11px 15px", marginBottom: 14 }}
          >
            <p
              style={{
                fontSize: 8.5,
                fontWeight: 700,
                letterSpacing: ".12em",
                color: "var(--muted)",
                marginBottom: 9,
              }}
            >
              RECENT ACTIVITY
            </p>
            {ALERTS.map(({ text, time, dot }, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  marginBottom: i < ALERTS.length - 1 ? 8 : 0,
                }}
              >
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: dot,
                    flexShrink: 0,
                    opacity: 0.85,
                  }}
                />
                <p
                  style={{
                    flex: 1,
                    fontSize: 11,
                    color: "rgba(241,245,249,.55)",
                    fontWeight: 500,
                  }}
                >
                  {text}
                </p>
                <span
                  style={{
                    fontSize: 9,
                    color: "var(--muted)",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                  }}
                >
                  {time}
                </span>
              </div>
            ))}
          </div>

          {/* Stat chips */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 10,
            }}
          >
            {[
              { Icon: Users, label: "Users", val: "2,148" },
              { Icon: ShoppingCart, label: "Orders", val: "48" },
              { Icon: TrendingUp, label: "Growth", val: "+12.4%" },
            ].map(({ Icon, label, val }) => (
              <div key={label} className="stat-chip">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    marginBottom: 5,
                    color: "#da7708",
                  }}
                >
                  <Icon size={11} />
                  <span
                    style={{
                      fontSize: 8,
                      fontWeight: 700,
                      letterSpacing: ".09em",
                      color: "var(--muted)",
                      textTransform: "uppercase",
                    }}
                  >
                    {label}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: 15,
                    fontWeight: 800,
                    color: "#f1f5f9",
                    fontFamily: "'Sora',sans-serif",
                  }}
                >
                  {val}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════ RIGHT PANEL ══════════ */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
          position: "relative",
          background: "#111827",
          borderLeft: "1px solid rgba(255,255,255,.045)",
        }}
      >
        <div
          className="orb"
          style={{
            width: 300,
            height: 300,
            background: "rgba(218,119,8,.055)",
            top: "8%",
            right: "5%",
            filter: "blur(70px)",
          }}
        />

        <div
          style={{
            width: "100%",
            maxWidth: 355,
            position: "relative",
            zIndex: 10,
          }}
        >
          {/* Mobile logo */}
          <div
            className="lg:hidden"
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: 28,
            }}
          >
            <div
              className="scan-wrap"
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: "linear-gradient(135deg,#da7708,#92400e)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ShieldCheck size={22} color="#0d1117" strokeWidth={2.5} />
            </div>
          </div>

          {/* Header */}
          <div className="f1" style={{ marginBottom: 26 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                marginBottom: 14,
                flexWrap: "wrap",
              }}
            >
              <span className="badge">
                <CheckCircle2 size={9} /> Enterprise Secured
              </span>
              <span className="badge">
                <Activity size={9} /> System Online
              </span>
            </div>
            <h1
              style={{
                fontSize: 29,
                fontWeight: 800,
                color: "#f1f5f9",
                fontFamily: "'Sora',sans-serif",
                lineHeight: 1.15,
                marginBottom: 8,
              }}
            >
              Welcome Back,
              <br />
              <span className="shimmer-t">Administrator</span>
            </h1>
            <p
              style={{
                fontSize: 12.5,
                color: "#374151",
                fontWeight: 500,
                lineHeight: 1.65,
              }}
            >
              Sign in to your secure dashboard. Access is monitored and
              restricted to authorised personnel only.
            </p>
          </div>

          <div className="divider f1" style={{ marginBottom: 22 }} />

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="f2" style={{ marginBottom: 13 }}>
              <label className="field-label">Email Address</label>
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    position: "absolute",
                    left: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color:
                      focused === "email" ? "#da7708" : "rgba(255,255,255,.18)",
                    transition: "color .2s",
                    pointerEvents: "none",
                  }}
                >
                  <Mail size={14} />
                </div>
                <input
                  type="email"
                  name="email"
                  placeholder="admin@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused(null)}
                  className="inp"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="f3" style={{ marginBottom: 6 }}>
              <label className="field-label">Password</label>
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    position: "absolute",
                    left: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color:
                      focused === "password"
                        ? "#da7708"
                        : "rgba(255,255,255,.18)",
                    transition: "color .2s",
                    pointerEvents: "none",
                  }}
                >
                  <Lock size={14} />
                </div>
                <input
                  type={showPwd ? "text" : "password"}
                  name="password"
                  placeholder="••••••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused(null)}
                  className="inp"
                  style={{ paddingRight: 44 }}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  style={{
                    position: "absolute",
                    right: 13,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    color: showPwd ? "#da7708" : "rgba(255,255,255,.18)",
                    transition: "color .2s",
                  }}
                >
                  {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div
              className="f3"
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginBottom: 20,
              }}
            >
              <span
                style={{
                  fontSize: 11.5,
                  color: "rgba(218,119,8,.55)",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Forgot password?
              </span>
            </div>

            {error && (
              <div
                className="shake"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "11px 14px",
                  borderRadius: 9,
                  marginBottom: 14,
                  background: "rgba(239,68,68,.07)",
                  border: "1px solid rgba(239,68,68,.2)",
                  color: "#f87171",
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                <span style={{ fontSize: 10 }}>⚠</span> {error}
              </div>
            )}

            <div className="f4">
              <button type="submit" className="cta" disabled={loading}>
                {loading ? (
                  <>
                    <div
                      style={{
                        width: 15,
                        height: 15,
                        borderRadius: "50%",
                        border: "2.5px solid rgba(13,17,23,.25)",
                        borderTopColor: "#0d1117",
                        animation: "spinCW .7s linear infinite",
                      }}
                    />
                    Authenticating…
                    <span className="cta-bar" />
                  </>
                ) : (
                  <>
                    Sign In to Dashboard <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Security row */}
          <div className="f5" style={{ marginTop: 24 }}>
            <div className="divider" style={{ marginBottom: 16 }} />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 20,
              }}
            >
              {[
                [<ShieldCheck size={10} />, "256-bit SSL"],
                [<Lock size={10} />, "Encrypted"],
                [<Activity size={10} />, "Monitored"],
              ].map(([icon, text]) => (
                <div key={text} className="sec-item">
                  <span>{icon}</span>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="f6" style={{ marginTop: 14, textAlign: "center" }}>
            <p style={{ fontSize: 10, color: "#1f2937", fontWeight: 500 }}>
              © 2025 BD Online Shop · Admin Portal v2.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
