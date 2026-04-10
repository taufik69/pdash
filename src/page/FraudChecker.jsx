import React, { useState, useEffect, useCallback } from "react";
import { Search, Loader2, AlertTriangle, CheckCircle, XCircle, ShieldOff } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function FraudChecker() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [phone, setPhone] = useState(searchParams.get("phone") || "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleCheck = useCallback(async (targetPhone) => {
    const phoneToSearch = targetPhone || phone;
    if (!phoneToSearch.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const apiKey = import.meta.env.VITE_QC_API_KEY || "c4f905ed02aa3fd8e2aeabbc8f4bd4f2";
    const formData = new FormData();
    formData.append('phone', phoneToSearch);

    try {
      const apiUrl = import.meta.env.VITE_API_QC_URL || '/api/qc/';
      const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
              'Authorization': `Bearer ${apiKey}`
          },
          body: formData
      });
      
      const data = await response.json();
      if(data) {
        setResult(data);
      } else {
        setError("No data found for this number.");
      }
    } catch (err) {
      console.error('Error:', err);
      setError("Failed to fetch data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [phone]);

  useEffect(() => {
    const phoneParam = searchParams.get("phone");
    if (phoneParam) {
      setPhone(phoneParam);
      handleCheck(phoneParam);
    }
  }, [searchParams, handleCheck]);

  return (
    <div style={s.page}>
      <style>{css}</style>
      
      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Fraud Checker</h1>
          <p style={s.titleSub}>Check customer delivery history and cancellation rates to prevent fraud.</p>
        </div>
      </div>

      {/* Form Card */}
      <div style={s.card}>
        <form onSubmit={(e) => { e.preventDefault(); handleCheck(); }} style={s.form}>
          <div style={s.fieldGroup}>
            <label style={s.label}>Customer Phone Number</label>
            <div style={s.inputWrapper}>
              <input 
                type="text" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 01712345678" 
                style={s.input}
                required
              />
              <button 
                type="submit" 
                disabled={loading || !phone}
                style={{
                  ...s.submitBtn,
                  ...(loading || !phone ? s.btnDisabled : {})
                }}
              >
                {loading ? <Loader2 style={{ ...s.icon, animation: "spin 1s linear infinite" }} /> : <Search style={s.icon} />}
                <span>Check History</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Error */}
      {error && (
        <div style={s.errorBadge}>
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Result */}
      {result && (
        <div style={s.resultGrid}>
          {/* Summary Cards */}
          <div style={s.statGrid}>
            <div style={s.statCard}>
              <span style={s.statLabel}>Total Parcels</span>
              <span style={s.statValue}>{result.total_parcels || 0}</span>
            </div>
            <div style={{ ...s.statCard, borderBottom: "4px solid var(--success)" }}>
              <span style={{ ...s.statLabel, color: "var(--success)" }}>
                <CheckCircle size={14} style={{ marginRight: 4 }} /> Delivered
              </span>
              <span style={{ ...s.statValue, color: "var(--success)" }}>{result.total_delivered || 0}</span>
            </div>
            <div style={{ ...s.statCard, borderBottom: "4px solid var(--destructive)" }}>
              <span style={{ ...s.statLabel, color: "var(--destructive)" }}>
                <XCircle size={14} style={{ marginRight: 4 }} /> Cancelled
              </span>
              <span style={{ ...s.statValue, color: "var(--destructive)" }}>{result.total_cancel || 0}</span>
            </div>
          </div>

          {/* Alert Column */}
          {(result.total_cancel > 2 || (result.total_cancel > 0 && result.total_delivered === 0)) && (
            <div style={s.alertBox}>
              <div style={s.alertContent}>
                <AlertTriangle style={s.alertIcon} />
                <div>
                  <p style={s.alertTitle}>High Risk Customer Detected</p>
                  <p style={s.alertText}>This customer has a significant number of cancellations. Consider blocking access.</p>
                </div>
              </div>
              <button 
                onClick={() => navigate('/ip-block', { state: { target: phone, reason: 'High fraud/cancellation rate' } })}
                style={s.blockBtn}
              >
                <ShieldOff size={14} /> <span>Block Customer</span>
              </button>
            </div>
          )}

          {/* Courier Details */}
          {result.apis && Object.keys(result.apis).length > 0 && (
            <div style={s.detailsCard}>
               <div style={s.detailsHeader}>
                  <h3 style={s.detailsTitle}>Courier Breakdown</h3>
               </div>
               <div style={s.detailsBody}>
                 {Object.entries(result.apis).map(([courier, data]) => (
                    <div key={courier} style={s.courierCard}>
                       <h4 style={s.courierName}>{courier}</h4>
                       <div style={s.courierStats}>
                         <div style={s.courierRow}>
                            <span style={s.courierLabel}>Total Parcels</span>
                            <span style={s.courierValue}>{data.total_parcels || 0}</span>
                         </div>
                         <div style={s.courierRow}>
                            <span style={s.courierLabel}>Delivered</span>
                            <span style={{ ...s.courierValue, color: "var(--success)", background: "var(--secondary)" }}>{data.total_delivered_parcels || 0}</span>
                         </div>
                         <div style={s.courierRow}>
                            <span style={s.courierLabel}>Cancelled</span>
                            <span style={{ ...s.courierValue, color: "var(--destructive)", background: "var(--secondary)" }}>{data.total_cancelled_parcels || 0}</span>
                         </div>
                       </div>
                    </div>
                 ))}
               </div>
            </div>
          )}
        </div>
      )}
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
  page: { maxWidth: 900, margin: "0 auto", padding: "32px 24px", fontFamily: "'Inter', sans-serif", color: "var(--foreground)", animation: "fadeIn 0.4s ease" },
  header: { marginBottom: 32 },
  title: { fontSize: 32, fontWeight: 800, margin: "0 0 8px", letterSpacing: "-0.03em" },
  titleSub: { fontSize: 14, color: "var(--muted-foreground)", margin: 0 },
  card: { background: "var(--background)", border: "1px solid var(--border)", borderRadius: 12, padding: 24, animation: "slideUp 0.4s ease" },
  form: { display: "flex", flexDirection: "column", gap: 16 },
  fieldGroup: { display: "flex", flexDirection: "column", gap: 12 },
  label: { fontSize: 11, fontWeight: 700, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em" },
  inputWrapper: { display: "flex", gap: 12 },
  input: { flex: 1, background: "var(--background)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 16px", fontSize: 14, color: "var(--foreground)", outline: "none", fontWeight: 500, transition: "all 0.2s" },
  submitBtn: { display: "flex", alignItems: "center", gap: 8, background: "var(--foreground)", color: "var(--background)", border: "none", borderRadius: 10, padding: "0 24px", fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" },
  btnDisabled: { opacity: 0.5, cursor: "not-allowed" },
  icon: { width: 16, height: 16 },
  errorBadge: { display: "flex", alignItems: "center", gap: 10, background: "var(--destructive)", color: "white", padding: "12px 16px", borderRadius: 10, marginTop: 24, fontSize: 14, fontWeight: 600 },
  resultGrid: { display: "flex", flexDirection: "column", gap: 24, marginTop: 32 },
  statGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 },
  statCard: { background: "var(--background)", border: "1px solid var(--border)", borderRadius: 12, padding: "24px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, textAlign: "center", animation: "slideUp 0.45s ease" },
  statLabel: { fontSize: 12, fontWeight: 700, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.03em", display: "flex", alignItems: "center" },
  statValue: { fontSize: 32, fontWeight: 800, color: "var(--foreground)" },
  alertBox: { background: "var(--secondary)", border: "1px solid var(--border)", padding: "20px 24px", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, animation: "slideUp 0.5s ease" },
  alertContent: { display: "flex", alignItems: "center", gap: 16 },
  alertIcon: { color: "var(--destructive)", width: 28, height: 28 },
  alertTitle: { fontSize: 14, fontWeight: 800, margin: 0, color: "var(--foreground)" },
  alertText: { fontSize: 13, color: "var(--muted-foreground)", margin: "2px 0 0" },
  blockBtn: { display: "flex", alignItems: "center", gap: 8, background: "var(--destructive)", color: "white", border: "none", borderRadius: 8, padding: "10px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer" },
  detailsCard: { background: "var(--background)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", animation: "slideUp 0.55s ease" },
  detailsHeader: { padding: "16px 24px", background: "var(--secondary)", borderBottom: "1px solid var(--border)" },
  detailsTitle: { fontSize: 14, fontWeight: 800, margin: 0 },
  detailsBody: { padding: 24, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 24 },
  courierCard: { border: "1px solid var(--border)", borderRadius: 10, padding: 20 },
  courierName: { fontSize: 16, fontWeight: 800, margin: "0 0 16px", color: "var(--foreground)", borderBottom: "1px solid var(--border)", paddingBottom: 8 },
  courierStats: { display: "flex", flexDirection: "column", gap: 12 },
  courierRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  courierLabel: { fontSize: 12, color: "var(--muted-foreground)", fontWeight: 500 },
  courierValue: { fontSize: 12, fontWeight: 700, color: "var(--foreground)", background: "var(--secondary)", padding: "2px 8px", borderRadius: 4 },
};
