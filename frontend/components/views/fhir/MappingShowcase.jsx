"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Layers, Download } from "lucide-react";

const DOMAIN_ORDER = ["Patient", "PMI Encounter", "CPI Encounter"];

const bucketBadge = (bucket) => {
  switch (bucket) {
    case "FHIR_CORE":
      return "bg-emerald-500/20 text-emerald-200 border border-emerald-400/40";
    case "APP":
      return "bg-purple-500/20 text-purple-200 border border-purple-400/40";
    case "SEARCH":
      return "bg-sky-500/20 text-sky-200 border border-sky-400/40";
    default:
      return "bg-slate-700 text-slate-200";
  }
};

function FieldTable({ rows }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-800 text-slate-300 uppercase text-xs">
          <tr>
            <th className="px-3 py-2 text-left">Field</th>
            <th className="px-3 py-2 text-left">Interpretation</th>
            <th className="px-3 py-2 text-left">Bucket</th>
            <th className="px-3 py-2 text-left">Target Path</th>
            <th className="px-3 py-2 text-left">Transformation</th>
            <th className="px-3 py-2 text-left">Indexed?</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800 text-slate-200">
          {rows.map((row) => (
            <tr key={`${row.Domain}-${row.Field}`}>
              <td className="px-3 py-2 font-medium text-slate-100">{row.Field}</td>
              <td className="px-3 py-2">{row.Interpretation}</td>
              <td className="px-3 py-2">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${bucketBadge(row.Bucket)}`}>{row.Bucket}</span>
              </td>
              <td className="px-3 py-2">
                <code className="bg-slate-800/80 px-2 py-1 rounded text-xs text-emerald-200">{row["Target Path"]}</code>
              </td>
              <td className="px-3 py-2 text-slate-300">{row.Transformation || "—"}</td>
              <td className="px-3 py-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    row["Indexed?"] === "Yes" ? "bg-emerald-500/20 text-emerald-200" : "bg-slate-700 text-slate-200"
                  }`}
                >
                  {row["Indexed?"]}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function MappingShowcase() {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState({ loading: true, error: "" });

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/fhir-config/field-mapping.json");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setRows(data);
        setStatus({ loading: false, error: "" });
      } catch (err) {
        console.error(err);
        setStatus({ loading: false, error: "Unable to load field mapping metadata." });
      }
    }
    load();
  }, []);

  const grouped = useMemo(() => {
    const groups = new Map();
    for (const item of rows) {
      if (!groups.has(item.Domain)) {
        groups.set(item.Domain, []);
      }
      groups.get(item.Domain).push(item);
    }
    for (const arr of groups.values()) {
      arr.sort((a, b) => a.Field.localeCompare(b.Field));
    }
    return groups;
  }, [rows]);

  const orderedDomains = useMemo(() => {
    const seen = new Set();
    const order = [];
    for (const domain of DOMAIN_ORDER) {
      if (grouped.has(domain)) {
        order.push(domain);
        seen.add(domain);
      }
    }
    for (const domain of grouped.keys()) {
      if (!seen.has(domain)) {
        order.push(domain);
      }
    }
    return order;
  }, [grouped]);

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-emerald-600/40 rounded-xl p-4 flex flex-wrap items-start gap-4">
        <div className="flex items-start gap-3">
          <Layers className="text-emerald-400 mt-1" size={22} />
          <div>
            <p className="text-slate-200 font-semibold">FHIR-first mapping</p>
            <p className="text-slate-400 text-sm">
              This view loads the same mapping metadata that powers the downloadable CSV/Markdown so UI, docs, and APIs stay in sync.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <a
            href="/spec_field_mapping.csv"
            className="inline-flex items-center gap-2 px-3 py-1 text-sm rounded-full border border-emerald-500/60 text-emerald-200 hover:bg-emerald-500/10"
          >
            <Download size={14} /> Download CSV
          </a>
          <a
            href="/docs/SPEC_FIELD_MAPPING.md"
            target="_blank"
            className="inline-flex items-center gap-2 px-3 py-1 text-sm rounded-full border border-slate-600 text-slate-200 hover:bg-slate-700/60"
          >
            Full Markdown
          </a>
        </div>
      </div>

      {status.loading && <p className="text-slate-400 text-sm">Loading mapping metadata…</p>}
      {status.error && <p className="text-rose-400 text-sm">{status.error}</p>}

      {!status.loading &&
        !status.error &&
        orderedDomains.map((domain) => (
          <div key={domain} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="bg-slate-800 px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers size={16} className="text-emerald-400" />
                <h3 className="text-slate-200 font-semibold">{domain}</h3>
              </div>
              <span className="text-slate-400 text-xs">{grouped.get(domain)?.length ?? 0} fields</span>
            </div>
            <FieldTable rows={grouped.get(domain) ?? []} />
          </div>
        ))}
    </div>
  );
}