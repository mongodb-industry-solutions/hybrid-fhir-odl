"use client";

import React, { useState, useEffect } from "react";
import { Beaker, Loader2, CheckCircle2, Trash2, AlertTriangle, Database, ChevronDown, RefreshCw, Plus, X } from "lucide-react";

const API = (path) => `/api/internal${path.startsWith("/") ? path : `/${path}`}`;
const DEFAULT_DOCUMENT_LIMIT = 1000;

const RESOURCE_COLORS = {
  Patient:      "#10b981",
  Encounter:    "#3b82f6",
  Practitioner: "#a855f7",
  CareTeam:     "#f59e0b",
};
const FALLBACK_COLOR = "#64748b";

function DonutChart({ breakdown, total }) {
  if (!total) {
    return (
      <div className="flex flex-col items-center justify-center w-36 h-36">
        <div className="w-24 h-24 rounded-full border-4 border-slate-700 flex items-center justify-center">
          <span className="text-slate-500 text-xs text-center leading-tight">No data</span>
        </div>
      </div>
    );
  }

  const cx = 60, cy = 60, R = 52, r = 30;
  const entries = Object.entries(breakdown).filter(([, c]) => c > 0);
  let startAngle = -Math.PI / 2;

  const segments = entries.map(([type, count]) => {
    const fraction = count / total;
    const sweep = fraction * 2 * Math.PI;
    const endAngle = startAngle + sweep;
    const largeArc = sweep > Math.PI ? 1 : 0;

    const cos0 = Math.cos(startAngle), sin0 = Math.sin(startAngle);
    const cos1 = Math.cos(endAngle),   sin1 = Math.sin(endAngle);

    const path = [
      `M ${cx + R * cos0} ${cy + R * sin0}`,
      `A ${R} ${R} 0 ${largeArc} 1 ${cx + R * cos1} ${cy + R * sin1}`,
      `L ${cx + r * cos1} ${cy + r * sin1}`,
      `A ${r} ${r} 0 ${largeArc} 0 ${cx + r * cos0} ${cy + r * sin0}`,
      "Z",
    ].join(" ");

    const seg = { type, count, color: RESOURCE_COLORS[type] ?? FALLBACK_COLOR, path };
    startAngle = endAngle;
    return seg;
  });

  return (
    <div className="flex items-center gap-6">
      <svg width="120" height="120" viewBox="0 0 120 120" className="shrink-0">
        {segments.map((s) => (
          <path key={s.type} d={s.path} fill={s.color} />
        ))}
        <text x="60" y="56" textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="monospace">total</text>
        <text x="60" y="71" textAnchor="middle" fill="#f1f5f9" fontSize="16" fontWeight="bold" fontFamily="monospace">{total}</text>
      </svg>
      <div className="space-y-2">
        {segments.map((s) => (
          <div key={s.type} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: s.color }} />
            <span className="text-slate-400 text-xs w-24">{s.type}</span>
            <span className="text-slate-200 text-xs font-mono">{s.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function FhirSyntheticPanel() {
  const [selectedTenant, setSelectedTenant] = useState("");
  const [availableTenants, setAvailableTenants] = useState([]);
  const [creatingTenant, setCreatingTenant] = useState(false);
  const [newTenantName, setNewTenantName] = useState("");

  const [patients, setPatients] = useState(50);
  const [encounters, setEncounters] = useState(3);
  const [practitioners, setPractitioners] = useState(20);
  const [careteams, setCareteams] = useState(10);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [currentCount, setCurrentCount] = useState(0);
  const [documentLimit, setDocumentLimit] = useState(DEFAULT_DOCUMENT_LIMIT);
  const [resourceBreakdown, setResourceBreakdown] = useState({});
  const [countLoading, setCountLoading] = useState(false);
  const [showLimitWarning, setShowLimitWarning] = useState(false);

  const fetchTenants = async () => {
    try {
      const res = await fetch(API("/admin/tenants"));
      if (res.ok) {
        const data = await res.json();
        setAvailableTenants(data.tenants || []);
      }
    } catch (err) {
      console.error("Error fetching tenants:", err);
    }
  };

  const fetchCurrentCount = async () => {
    setCountLoading(true);
    try {
      const url = selectedTenant
        ? `${API("/admin/stats")}?tenant=${encodeURIComponent(selectedTenant)}`
        : API("/admin/stats");
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setCurrentCount(data.total_documents || 0);
        setDocumentLimit(data.limit || DEFAULT_DOCUMENT_LIMIT);
        setResourceBreakdown(data.resource_breakdown || {});
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setCountLoading(false);
    }
  };

  useEffect(() => { fetchTenants(); }, []);
  useEffect(() => { fetchCurrentCount(); }, [selectedTenant]);

  const calculateTotalNewDocs = () => patients + patients * encounters + practitioners + careteams;
  const wouldExceedLimit = () => currentCount + calculateTotalNewDocs() > documentLimit;

  const run = async () => {
    if (wouldExceedLimit()) { setShowLimitWarning(true); return; }
    setLoading(true); setResult(null); setShowLimitWarning(false);
    const res = await fetch(API("/admin/seed"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patients, encounters_per_patient: encounters, practitioners, careteams,
        ...(selectedTenant ? { tenant: selectedTenant } : {}),
      }),
    });
    setResult(await res.json());
    setLoading(false);
    await fetchTenants();
    await fetchCurrentCount();
  };

  const wipe = async () => {
    setLoading(true); setShowLimitWarning(false);
    const res = await fetch(API("/admin/wipe"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirm: true, ...(selectedTenant ? { tenant: selectedTenant } : {}) }),
    });
    setResult(await res.json());
    setLoading(false);
    await fetchTenants();
    await fetchCurrentCount();
  };

  const remaining = Math.max(0, documentLimit - currentCount);

  return (
    <div className="space-y-6">

      {/* ── Tenant selector ── */}
      <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl px-5 py-4 flex items-center gap-4 mb-2">
        <span className="text-slate-400 text-sm shrink-0">You have selected tenant:</span>

        {/* Dropdown */}
        <div className="relative">
          <select
            value={selectedTenant}
            onChange={(e) => { setSelectedTenant(e.target.value); setResult(null); }}
            className="appearance-none bg-slate-900 text-emerald-400 font-semibold text-sm pl-3 pr-8 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 cursor-pointer transition-colors"
          >
            <option value="">acme (default)</option>
            {availableTenants.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-emerald-500" />
        </div>

        {/* Create new tenant */}
        {!creatingTenant ? (
          <button
            onClick={() => { setCreatingTenant(true); setNewTenantName(""); }}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 border border-slate-700 hover:border-emerald-600/60 rounded-lg px-3 py-1.5 transition-colors"
          >
            <Plus size={13} /> New tenant
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <input
              autoFocus
              type="text"
              value={newTenantName}
              onChange={(e) => setNewTenantName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newTenantName.trim()) {
                  const name = newTenantName.trim();
                  if (!availableTenants.includes(name)) setAvailableTenants((prev) => [...prev, name]);
                  setSelectedTenant(name);
                  setResult(null);
                  setCreatingTenant(false);
                }
                if (e.key === "Escape") setCreatingTenant(false);
              }}
              placeholder="tenant name…"
              className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 w-40"
            />
            <button
              disabled={!newTenantName.trim()}
              onClick={() => {
                const name = newTenantName.trim();
                if (!availableTenants.includes(name)) setAvailableTenants((prev) => [...prev, name]);
                setSelectedTenant(name);
                setResult(null);
                setCreatingTenant(false);
              }}
              className="text-xs px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              Create
            </button>
            <button
              onClick={() => setCreatingTenant(false)}
              className="text-slate-500 hover:text-slate-300 transition-colors"
            >
              <X size={15} />
            </button>
          </div>
        )}
      </div>

      {/* ── Document limit warning ── */}
      {showLimitWarning && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="text-red-400 shrink-0 mt-0.5" size={18} />
          <div>
            <p className="font-medium text-red-200 text-sm">Document limit exceeded</p>
            <p className="text-xs text-red-300 mt-1">
              Cannot generate {calculateTotalNewDocs()} new documents — current count is {currentCount}, limit is {documentLimit}.
              Wipe the tenant first to make room.
            </p>
          </div>
        </div>
      )}

      {/* ── Current Status ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Database className="text-emerald-400" size={16} />
            <h4 className="text-slate-200 font-semibold text-sm uppercase tracking-wide">Current Status</h4>
          </div>
          <button
            onClick={fetchCurrentCount}
            disabled={countLoading}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={12} className={countLoading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-5 flex flex-col sm:flex-row items-center gap-6">
          <DonutChart breakdown={resourceBreakdown} total={currentCount} />

          <div className="flex-1 grid grid-cols-3 gap-4 w-full">
            <div className="bg-slate-900/60 rounded-lg p-3 text-center">
              <p className="text-slate-500 text-xs mb-1">Documents</p>
              <p className="text-slate-100 font-mono text-xl font-semibold">{currentCount}</p>
            </div>
            <div className="bg-slate-900/60 rounded-lg p-3 text-center">
              <p className="text-slate-500 text-xs mb-1">Limit</p>
              <p className="text-slate-100 font-mono text-xl font-semibold">{documentLimit}</p>
            </div>
            <div className="bg-slate-900/60 rounded-lg p-3 text-center">
              <p className="text-slate-500 text-xs mb-1">Remaining</p>
              <p className={`font-mono text-xl font-semibold ${remaining < 100 ? "text-yellow-400" : "text-emerald-400"}`}>
                {remaining}
              </p>
            </div>

            {wouldExceedLimit() && !showLimitWarning && (
              <div className="col-span-3 text-xs text-yellow-400 flex items-center gap-1">
                <AlertTriangle size={12} />
                Planned generation ({calculateTotalNewDocs()} docs) would exceed limit
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Synthetic Data Generator ── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Beaker className="text-blue-400" size={16} />
          <h3 className="text-slate-200 font-semibold text-sm uppercase tracking-wide">Synthetic Data Generator</h3>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-5 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Patients", value: patients, set: setPatients, min: 1 },
              { label: "Encounters / Patient", value: encounters, set: setEncounters, min: 0 },
              { label: "Practitioners", value: practitioners, set: setPractitioners, min: 0 },
              { label: "Care Teams", value: careteams, set: setCareteams, min: 0 },
            ].map(({ label, value, set, min }) => (
              <div key={label}>
                <label className="block text-xs text-slate-400 mb-1">{label}</label>
                <input
                  type="number"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                  value={value}
                  onChange={(e) => set(Number(e.target.value) || 0)}
                  min={min}
                />
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={run}
              disabled={loading || wouldExceedLimit()}
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg flex items-center gap-2 transition-colors ${
                wouldExceedLimit() ? "bg-slate-600 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-500"
              }`}
            >
              {loading ? <Loader2 className="animate-spin" size={15} /> : <Beaker size={15} />}
              Generate
              {wouldExceedLimit() && <AlertTriangle size={14} />}
            </button>
            <button
              onClick={wipe}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium bg-red-700/80 hover:bg-red-600 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Trash2 size={15} /> Wipe Tenant
            </button>
          </div>

          {result && (
            <div className="text-sm text-slate-300 bg-slate-900/70 p-3 rounded-lg border border-slate-700">
              <div className="flex items-center gap-2 mb-2 text-emerald-400 text-xs font-medium uppercase tracking-wide">
                <CheckCircle2 size={14} /> Result
              </div>
              <pre className="text-xs overflow-auto text-slate-300">{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
