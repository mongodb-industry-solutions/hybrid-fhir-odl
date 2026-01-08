"use client";

import React, { useState, useEffect } from "react";
import { Beaker, Loader2, CheckCircle2, Trash2, AlertTriangle, Database } from "lucide-react";

const API = (path) => `/api/internal${path.startsWith("/") ? path : `/${path}`}`;
const DOCUMENT_LIMIT = 1000;

export default function FhirSyntheticPanel() {
  const [patients, setPatients] = useState(50);
  const [encounters, setEncounters] = useState(3);
  const [practitioners, setPractitioners] = useState(20);
  const [careteams, setCareteams] = useState(10);
  const [tenant, setTenant] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [currentCount, setCurrentCount] = useState(0);
  const [countLoading, setCountLoading] = useState(false);
  const [showLimitWarning, setShowLimitWarning] = useState(false);

  const fetchCurrentCount = async () => {
    setCountLoading(true);
    try {
      const res = await fetch(API("/admin/stats"), {
        method: "GET"
      });
      if (res.ok) {
        const data = await res.json();
        // Assuming the stats API returns total document count
        setCurrentCount(data.total_documents || 0);
      }
    } catch (error) {
      console.error("Error fetching current count:", error);
    } finally {
      setCountLoading(false);
    }
  };

  // Fetch current count on component mount and when tenant changes
  useEffect(() => {
    fetchCurrentCount();
  }, [tenant]);

  const calculateTotalNewDocs = () => {
    // Each patient creates 1 document, each encounter creates 1 document per patient
    return patients + (patients * encounters) + practitioners + careteams;
  };

  const wouldExceedLimit = () => {
    const newDocs = calculateTotalNewDocs();
    return (currentCount + newDocs) > DOCUMENT_LIMIT;
  };

  const run = async () => {
    const newDocs = calculateTotalNewDocs();
    
    if (wouldExceedLimit()) {
      setShowLimitWarning(true);
      return;
    }

    setLoading(true);
    setResult(null);
    setShowLimitWarning(false);
    const res = await fetch(API("/admin/seed"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patients,
        encounters_per_patient: encounters,
        practitioners,
        careteams,
        ...(tenant ? { tenant } : {})
      })
    });
    const data = await res.json();
    setResult(data);
    setLoading(false);
    
    // Refresh count after generation
    await fetchCurrentCount();
  };

  const wipe = async () => {
    setLoading(true);
    setShowLimitWarning(false);
    const res = await fetch(API("/admin/wipe"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirm: true, ...(tenant ? { tenant } : {}) })
    });
    const data = await res.json();
    setResult(data);
    setLoading(false);
    
    // Refresh count after wiping
    await fetchCurrentCount();
  };

  return (
    <div className="space-y-4">
      {/* Document Limit Warning Banner */}
      {showLimitWarning && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-red-400 flex-shrink-0" size={20} />
            <div>
              <h4 className="font-medium text-red-200">Document Limit Exceeded</h4>
              <p className="text-sm text-red-300 mt-1">
                Cannot generate {calculateTotalNewDocs()} new documents. Current count: {currentCount}, 
                which would exceed the limit of {DOCUMENT_LIMIT} documents per tenant.
              </p>
              <p className="text-sm text-red-300 mt-2">
                <strong>Please wipe the tenant first to clear existing data.</strong>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Current Count Display */}
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 mt-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Database className="text-green-400" size={18} />
            <h4 className="text-slate-200 font-medium">Current Status</h4>
          </div>
          <button
            onClick={fetchCurrentCount}
            disabled={countLoading}
            className="text-xs px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded"
          >
            {countLoading ? <Loader2 className="animate-spin" size={12} /> : "Refresh"}
          </button>
        </div>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-slate-400">Current Documents:</span>
            <div className="font-mono text-slate-200">{currentCount}</div>
          </div>
          <div>
            <span className="text-slate-400">Limit:</span>
            <div className="font-mono text-slate-200">{DOCUMENT_LIMIT}</div>
          </div>
          <div>
            <span className="text-slate-400">Remaining:</span>
            <div className={`font-mono ${(DOCUMENT_LIMIT - currentCount) < 100 ? 'text-yellow-400' : 'text-green-400'}`}>
              {Math.max(0, DOCUMENT_LIMIT - currentCount)}
            </div>
          </div>
        </div>
        {wouldExceedLimit() && !showLimitWarning && (
          <div className="mt-2 text-xs text-yellow-400">
            ⚠️ Planned generation ({calculateTotalNewDocs()} docs) would exceed limit
          </div>
        )}
      </div>

      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <div className="flex items-center gap-2 mb-3">
          <Beaker className="text-blue-400" size={18} />
          <h3 className="text-slate-200 font-medium">Synthetic Data Generator</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Tenant</label>
            <input
              type="text"
              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
              placeholder="defaults to server tenant"
              value={tenant}
              onChange={(e) => setTenant(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Patients</label>
            <input
              type="number"
              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
              value={patients}
              onChange={(e) => setPatients(Number(e.target.value) || 0)}
              min={1}
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Encounters / Patient</label>
            <input
              type="number"
              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
              value={encounters}
              onChange={(e) => setEncounters(Number(e.target.value) || 0)}
              min={0}
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Practitioners</label>
            <input
              type="number"
              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
              value={practitioners}
              onChange={(e) => setPractitioners(Number(e.target.value) || 0)}
              min={0}
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Care Teams</label>
            <input
              type="number"
              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
              value={careteams}
              onChange={(e) => setCareteams(Number(e.target.value) || 0)}
              min={0}
            />
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={run}
            disabled={loading || wouldExceedLimit()}
            className={`px-4 py-2 text-white rounded flex items-center gap-2 ${
              wouldExceedLimit() 
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : "Generate"}
            {wouldExceedLimit() && <AlertTriangle size={16} />}
          </button>
          <button
            onClick={wipe}
            disabled={loading}
            className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded flex items-center gap-1"
          >
            <Trash2 size={16} /> Wipe Tenant
          </button>
        </div>
        {result && (
          <div className="mt-4 text-sm text-slate-300 bg-slate-900 p-3 rounded border border-slate-700">
            <div className="flex items-center gap-2 mb-2 text-green-400">
              <CheckCircle2 size={16} /> Result
            </div>
            <pre className="text-xs overflow-auto">{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
