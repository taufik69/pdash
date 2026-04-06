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
    
    // Check if we have data passed from Fraud Checker or other pages
    if (location.state?.target) {
      setNewIp(location.state.target);
    }
    if (location.state?.reason) {
      setReason(location.state.reason);
    }
  }, [location.state]);

  const fetchBlockedIps = async () => {
    try {
      const res = await fetch(`${API_BASE}/security/blocked-ips`);
      const data = await res.json();
      if (data.success) {
        setBlockedIps(data.data);
      }
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
      const res = await fetch(`${API_BASE}/security/unblock/${id}`, {
        method: "PUT",
      });
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
    <div className="p-6 max-w-5xl mx-auto font-mono text-sm">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-[#da7708]" />
            Security Center
          </h1>
          <p className="text-gray-500 mt-1">Manage IP restrictions and prevent fraudulent activities.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm sticky top-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#da7708]" />
              Block New IP
            </h2>
            <form onSubmit={handleBlockIp} className="space-y-4 text-sm">
              <div>
                <label className="block text-gray-700 mb-1.5 font-medium">IP Address</label>
                <input
                  type="text"
                  value={newIp}
                  onChange={(e) => setNewIp(e.target.value)}
                  placeholder="e.g. 192.168.1.1"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#da7708]/20 outline-none transition-all placeholder:text-gray-400"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1.5 font-medium">Reason (Optional)</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Unusual order volume"
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#da7708]/20 outline-none transition-all resize-none placeholder:text-gray-400"
                />
              </div>
              
              {message && (
                <div className={`p-3 rounded-lg flex items-center gap-2 ${
                  message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                }`}>
                  {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                disabled={adding || !newIp}
                className="w-full py-3 bg-[#da7708] hover:bg-[#b05f06] text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm shadow-[#da7708]/20"
              >
                {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                Block Address
              </button>
            </form>
          </div>
        </div>

        {/* List Column */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden min-h-[400px]">
             <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <h3 className="font-bold text-gray-800">Currently Blocked Addresses</h3>
                <span className="text-[10px] bg-[#da7708]/10 text-[#da7708] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  {blockedIps.length} Active Blocks
                </span>
             </div>
             
             {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <p>Loading database...</p>
                </div>
             ) : blockedIps.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4 text-center px-10">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                    <ShieldOff className="w-8 h-8 text-gray-300" />
                  </div>
                  <div>
                    <p className="text-gray-900 font-bold mb-1">No blocked IPs found</p>
                    <p className="text-gray-400 text-xs text-balance">The database is currently clean of any restricted addresses.</p>
                  </div>
                </div>
             ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50/50 text-gray-500 text-[10px] uppercase tracking-wider font-bold">
                        <th className="px-6 py-3">IP Address</th>
                        <th className="px-6 py-3">Blocked On</th>
                        <th className="px-6 py-3">Reason</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {blockedIps.map((ip) => (
                        <tr key={ip._id} className="hover:bg-gray-50/40 transition-colors group">
                          <td className="px-6 py-4">
                            <code className="text-[#da7708] font-bold bg-[#da7708]/5 px-2 py-0.5 rounded">
                              {ip.ipAddress}
                            </code>
                          </td>
                          <td className="px-6 py-4 text-gray-500 text-xs">
                            {new Date(ip.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-gray-600 text-xs italic">
                              {ip.reason || "No reason provided"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleUnblock(ip._id)}
                              className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                              title="Unblock IP"
                            >
                              <ShieldOff className="w-4 h-4" />
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
