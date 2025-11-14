"use client";
import React, { useEffect, useState } from "react";
import { Search, RefreshCw, Eye } from "lucide-react";
import JsonEditor from "./JsonEditor";
const API = (path) => `/api/internal${path.startsWith("/") ? path : `/${path}`}`;
export default function FhirResourceBrowser() {
  const [resourceTypes, setResourceTypes] = useState([]);
  const [resourceType, setResourceType] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetch(API("/inspect/distinctResourceTypes"))
      .then(r => r.json())
      .then(d => { setResourceTypes(d.resourceTypes || []); setResourceType(d.resourceTypes?.[0] || ""); });
  }, []);

  const fetchList = async () => {
    const params = new URLSearchParams();
    if (resourceType) params.set("resourceType", resourceType);
    if (query) params.set("q", query);
    params.set("page", String(page));
    params.set("limit", String(limit));
    const res = await fetch(API(`/inspect/resources?${params.toString()}`));
    const data = await res.json();
    setItems(data.items || []);
    setTotal(data.total || 0);
  };

  useEffect(() => { if (resourceType) fetchList(); }, [resourceType, page, limit]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Resource Type</label>
          <select className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-200"
            value={resourceType} onChange={(e)=>setResourceType(e.target.value)}>
            {resourceTypes.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs text-slate-400 mb-1">Search (HKID, caseNum, doctorCode, teamCode, hospCode, id)</label>
          <div className="flex gap-2">
            <input className="flex-1 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-200"
              placeholder="e.g. A123456(7) or C-000123" value={query} onChange={(e)=>setQuery(e.target.value)} />
            <button onClick={()=>{ setPage(1); fetchList(); }} className="px-3 py-1 bg-blue-600 text-white rounded flex items-center gap-1">
              <Search size={14}/> Search
            </button>
            <button onClick={fetchList} className="px-3 py-1 bg-slate-700 text-slate-200 rounded flex items-center gap-1">
              <RefreshCw size={14}/> Refresh
            </button>
          </div>
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Page Size</label>
          <select className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-200"
            value={limit} onChange={(e)=>setLimit(Number(e.target.value))}>
            {[10,20,50,100].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-slate-800 rounded border border-slate-700">
        <table className="w-full text-sm">
          <thead className="bg-slate-800/70">
            <tr className="text-left">
              <th className="px-3 py-2 text-slate-300">_id</th>
              <th className="px-3 py-2 text-slate-300">resource.id</th>
              <th className="px-3 py-2 text-slate-300">hkid / caseNum</th>
              <th className="px-3 py-2 text-slate-300">hosp/ward/spec</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it._id} className="border-t border-slate-700 hover:bg-slate-800/40">
                <td className="px-3 py-2 text-slate-400">{it._id}</td>
                <td className="px-3 py-2 text-slate-200">{it.resource?.id}</td>
                <td className="px-3 py-2 text-slate-200">{it.search?.hkid || it.search?.caseNum || "-"}</td>
                <td className="px-3 py-2 text-slate-400">{(it.search?.hospCode || "-")}/{(it.search?.wardCode || "-")}/{(it.search?.specCode || "-")}</td>
                <td className="px-3 py-2">
                  <button onClick={()=>setSelected(it)} className="px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-100 rounded flex items-center gap-1">
                    <Eye size={14}/> Open
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td className="px-3 py-6 text-center text-slate-400" colSpan={5}>No items</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center text-sm text-slate-400">
        <div>Total: {total}</div>
        <div className="flex items-center gap-2">
          <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page<=1} className="px-2 py-1 bg-slate-700 rounded disabled:opacity-50">Prev</button>
          <span>Page {page}</span>
          <button onClick={()=>setPage(p=>p+1)} disabled={(page*limit)>=total} className="px-2 py-1 bg-slate-700 rounded disabled:opacity-50">Next</button>
        </div>
      </div>

      {selected && (
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <h3 className="text-slate-300 text-sm mb-1">FHIR Resource</h3>
            <JsonEditor value={selected.resource} onChange={()=>{}} height="350px" readOnly />
          </div>
          <div>
            <h3 className="text-slate-300 text-sm mb-1">Envelope (app + search)</h3>
            <JsonEditor value={{app: selected.app, search: selected.search}} onChange={()=>{}} height="350px" readOnly />
          </div>
        </div>
      )}
    </div>
  );
}
