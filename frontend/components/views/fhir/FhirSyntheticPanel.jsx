"use client";

import React, { useState } from "react";
import { Beaker, Loader2, CheckCircle2, Trash2 } from "lucide-react";

const API = (path) => `/api/internal${path.startsWith("/") ? path : `/${path}`}`;

export default function FhirSyntheticPanel() {
  const [patients, setPatients] = useState(50);
  const [encounters, setEncounters] = useState(3);
  const [practitioners, setPractitioners] = useState(20);
  const [careteams, setCareteams] = useState(10);
  const [tenant, setTenant] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const run = async () => {
    setLoading(true);
    setResult(null);
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
  };

  const wipe = async () => {
    setLoading(true);
    const res = await fetch(API("/admin/wipe"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirm: true, ...(tenant ? { tenant } : {}) })
    });
    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  return (
    <div className="space-y-4">
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
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : "Generate"}
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
