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

    const apiKey = "da8ef2fae0afe7a0178d70fc0ca36f91";
    const formData = new FormData();
    formData.append('phone', phoneToSearch);

    try {
      const response = await fetch('https://fraudchecker.link/api/v1/qc/', {
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
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Fraud Checker</h1>
        <p className="text-gray-500 text-sm">Check customer delivery history and cancellation rates to prevent fraud.</p>
      </div>

      {/* Form */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
        <form onSubmit={(e) => { e.preventDefault(); handleCheck(); }} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Customer Phone Number</label>
            <input 
              type="text" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 01712345678" 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#da7708] focus:border-[#da7708] outline-none transition-all text-gray-800"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading || !phone}
            className="px-6 py-2 bg-[#da7708] hover:bg-[#b05f06] text-white font-medium rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 h-11"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Check History
          </button>
        </form>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 mb-6 bg-red-50 text-red-600 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Summary */}
          <div className="md:col-span-3 grid grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center py-6">
              <span className="text-gray-500 text-sm font-medium mb-1">Total Parcels</span>
              <span className="text-3xl font-bold text-gray-800">{result.total_parcels || 0}</span>
            </div>
            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 shadow-sm flex flex-col items-center justify-center py-6">
              <span className="text-emerald-600 text-sm font-medium mb-1 flex items-center gap-1"><CheckCircle className="w-4 h-4"/> Delivered</span>
              <span className="text-3xl font-bold text-emerald-700">{result.total_delivered || 0}</span>
            </div>
            <div className="bg-rose-50 p-4 rounded-xl border border-rose-200 shadow-sm flex flex-col items-center justify-center py-6">
              <span className="text-rose-600 text-sm font-medium mb-1 flex items-center gap-1"><XCircle className="w-4 h-4"/> Cancelled</span>
              <span className="text-3xl font-bold text-rose-700">{result.total_cancel || 0}</span>
            </div>
          </div>

          {/* Action Row */}
          {(result.total_cancel > 2 || (result.total_cancel > 0 && result.total_delivered === 0)) && (
            <div className="md:col-span-3">
              <div className="bg-rose-100/50 border border-rose-200 p-4 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <AlertTriangle className="text-rose-600 w-6 h-6" />
                   <div>
                     <p className="text-rose-900 font-bold text-sm">High Risk Customer Detected</p>
                     <p className="text-rose-700 text-xs">This customer has a significant number of cancellations. Consider blocking access.</p>
                   </div>
                </div>
                <button 
                  onClick={() => navigate('/ip-block', { state: { target: phone, reason: 'High fraud/cancellation rate' } })}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg flex items-center gap-2 transition-colors"
                >
                  <ShieldOff size={14} /> Block Customer
                </button>
              </div>
            </div>
          )}

          {/* Details */}
          {result.apis && Object.keys(result.apis).length > 0 && (
            <div className="md:col-span-3 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
               <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                  <h3 className="font-semibold text-gray-800">Courier Breakdown</h3>
               </div>
               <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                 {Object.entries(result.apis).map(([courier, data]) => (
                    <div key={courier} className="border border-gray-100 rounded-lg p-5 bg-white shadow-sm hover:shadow-md transition-shadow">
                       <h4 className="font-bold text-gray-800 text-lg mb-4 pb-2 border-b border-gray-100">{courier}</h4>
                       <div className="space-y-3 text-sm">
                         <div className="flex justify-between items-center">
                            <span className="text-gray-500">Total Parcels</span>
                            <span className="font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">{data.total_parcels || 0}</span>
                         </div>
                         <div className="flex justify-between items-center">
                            <span className="text-gray-500">Delivered</span>
                            <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{data.total_delivered_parcels || 0}</span>
                         </div>
                         <div className="flex justify-between items-center">
                            <span className="text-gray-500">Cancelled</span>
                            <span className="font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">{data.total_cancelled_parcels || 0}</span>
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
