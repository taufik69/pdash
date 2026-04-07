import React, { useState, useEffect } from "react";
import { Shield, ShieldOff, Plus, Trash2, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useLocation } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

export default function IPBlockManager() {
  const location = useLocation();
  const [blockedIps, setBlockedIps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newIp, setNewIp] = useState("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchBlockedIps();
    if (location.state?.target) setNewIp(location.state.target);
    if (location.state?.reason) setReason(location.state.reason);
  }, [location.state]);

  const fetchBlockedIps = async () => {
    try {
      const res = await fetch(`${API_BASE}/security/blocked-ips`);
      const data = await res.json();
      if (data.success) setBlockedIps(data.data);
    } catch (err) {
      console.error("Failed to fetch blocked IPs", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockIp = async (e) => {
    e.preventDefault();
    if (!newIp) return;
    setAdding(true);
    try {
      const res = await fetch(`${API_BASE}/security/block`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ipAddress: newIp, reason }),
      });
      const data = await res.json();
      if (data.success) {
        setNewIp("");
        setReason("");
        setMessage({ type: "success", text: "IP blocked successfully" });
        fetchBlockedIps();
      } else {
        setMessage({ type: "error", text: data.message || "Failed to block IP" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Connection error" });
    } finally {
      setAdding(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleUnblock = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/security/unblock/${id}`, { method: "PUT" });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: "IP unblocked successfully" });
        fetchBlockedIps();
      }
    } catch (err) {
      setMessage({ type: "error", text: "Failed to unblock" });
    } finally {
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div style={s.page}>
      <style>{css}</style>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Security Center</h1>
          <p style={s.titleSub}>Manage IP restrictions and prevent fraudulent activities.</p>
        </div>
      </div>

      <div style={s.grid}>
        {/* Form Column */}
        <div style={s.formCol}>
          <div style={s.card}>
            <h2 style={s.cardTitle}>
              <Plus size={16} /> Block New IP
            </h2>
            <form onSubmit={handleBlockIp} style={s.form}>
              <div style={s.fieldGroup}>
                <label style={s.label}>IP Address</label>
                <input
                  type="text"
                  value={newIp}
                  onChange={(e) => setNewIp(e.target.value)}
                  placeholder="e.g. 192.168.1.1"
                  style={s.input}
                  required
                />
              </div>
              <div style={s.fieldGroup}>
                <label style={s.label}>Reason (Optional)</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Unusual order volume"
                  rows={3}
                  style={s.textarea}
                />
              </div>
              
              {message && (
                <div style={{
                  ...s.message,
                  ...(message.type === 'success' ? s.messageSuccess : s.messageError)
                }}>
                  {message.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                disabled={adding || !newIp}
                style={{ ...s.submitBtn, ...(adding || !newIp ? s.btnDisabled : {}) }}
              >
                {adding ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Shield size={16} />}
                <span>Block Address</span>
              </button>
            </form>
          </div>
        </div>

        {/* List Column */}
        <div style={s.listCol}>
          <div style={s.card}>
             <div style={s.listHeader}>
                <h3 style={s.cardTitle}>Currently Blocked</h3>
                <span style={s.badge}>{blockedIps.length} Active Blocks</span>
             </div>
             
             {loading ? (
                <div style={s.centerState}>
                  <Loader2 size={32} style={{ animation: "spin 1s linear infinite", color: "var(--muted-foreground)" }} />
                  <p style={s.stateText}>Loading database...</p>
                </div>
             ) : blockedIps.length === 0 ? (
                <div style={s.centerState}>
                  <ShieldOff size={48} style={{ color: "var(--border)" }} />
                  <div style={{ textAlign: "center" }}>
                    <p style={{ fontWeight: 700, margin: "0 0 4px" }}>No blocked IPs</p>
                    <p style={{ fontSize: 12, color: "var(--muted-foreground)" }}>The database is clear of restrictions.</p>
                  </div>
                </div>
             ) : (
                <div style={s.tableWrap}>
                  <table style={s.table}>
                    <thead>
                      <tr>
                        <th style={s.th}>IP Address</th>
                        <th style={s.th}>Blocked On</th>
                        <th style={s.th}>Reason</th>
                        <th style={{ ...s.th, textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {blockedIps.map((ip) => (
                        <tr key={ip._id} style={s.tr}>
                          <td style={s.td}>
                            <code style={s.code}>{ip.ipAddress}</code>
                          </td>
                          <td style={s.td}>{new Date(ip.createdAt).toLocaleDateString()}</td>
                          <td style={s.td}>
                            <span style={s.reasonText}>{ip.reason || "No reason"}</span>
                          </td>
                          <td style={{ ...s.td, textAlign: "right" }}>
                            <button onClick={() => handleUnblock(ip._id)} style={s.unblockBtn} title="Unblock IP">
                              <ShieldOff size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeIn { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
  @keyframes slideUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
  *, *::before, *::after { box-sizing: border-box; }
`;

const s = {
  page: { maxWidth: 1100, margin: "0 auto", padding: "32px 24px", fontFamily: "'Inter', sans-serif", color: "var(--foreground)", animation: "fadeIn 0.4s ease" },
  header: { marginBottom: 32 },
  title: { fontSize: 32, fontWeight: 800, margin: "0 0 8px", letterSpacing: "-0.03em" },
  titleSub: { fontSize: 14, color: "var(--muted-foreground)", margin: 0 },
  grid: { display: "grid", gridTemplateColumns: "1fr 2fr", gap: 32 },
  formCol: { position: "sticky", top: 32 },
  listCol: { minHeight: 400 },
  card: { background: "var(--background)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", animation: "slideUp 0.45s ease" },
  cardTitle: { fontSize: 15, fontWeight: 700, margin: "20px 24px 16px", display: "flex", alignItems: "center", gap: 8 },
  form: { padding: "0 24px 24px", display: "flex", flexDirection: "column", gap: 20 },
  fieldGroup: { display: "flex", flexDirection: "column", gap: 8 },
  label: { fontSize: 11, fontWeight: 700, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em" },
  input: { background: "var(--background)", border: "1px solid var(--border)", borderRadius: 8, padding: "12px 16px", fontSize: 14, color: "var(--foreground)", outline: "none", transition: "all 0.2s" },
  textarea: { background: "var(--background)", border: "1px solid var(--border)", borderRadius: 8, padding: "12px 16px", fontSize: 14, color: "var(--foreground)", outline: "none", resize: "none", fontFamily: "inherit" },
  submitBtn: { display: "flex", alignItems: "center", gap: 8, justifyContent: "center", background: "var(--foreground)", color: "var(--background)", border: "none", borderRadius: 10, padding: "14px", fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" },
  btnDisabled: { opacity: 0.5, cursor: "not-allowed" },
  message: { padding: "10px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 10 },
  messageSuccess: { background: "var(--success)", color: "white" },
  messageError: { background: "var(--destructive)", color: "white" },
  listHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--secondary)", borderBottom: "1px solid var(--border)" },
  badge: { fontSize: 10, fontWeight: 800, background: "var(--foreground)", color: "var(--background)", padding: "4px 12px", borderRadius: 20, marginRight: 24 },
  centerState: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 40px", gap: 16 },
  stateText: { fontSize: 13, color: "var(--muted-foreground)", fontWeight: 500 },
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "12px 24px", fontSize: 11, fontWeight: 800, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "left", background: "var(--secondary)", borderBottom: "1px solid var(--border)" },
  td: { padding: "16px 24px", fontSize: 13, color: "var(--foreground)", borderBottom: "1px solid var(--border)" },
  tr: { transition: "all 0.2s" },
  code: { background: "var(--secondary)", padding: "4px 8px", borderRadius: 4, fontWeight: 700, color: "var(--foreground)", border: "1px solid var(--border)" },
  reasonText: { color: "var(--muted-foreground)", fontStyle: "italic", fontSize: 12 },
  unblockBtn: { background: "none", border: "1px solid var(--border)", color: "var(--destructive)", padding: "10px", borderRadius: 8, cursor: "pointer", display: "inline-flex", transition: "all 0.2s" },
};
