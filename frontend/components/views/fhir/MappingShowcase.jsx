"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Layers, Download } from "lucide-react";

const DOMAIN_ORDER = ["Patient", "PMI Encounter", "CPI Encounter"];

const DOMAIN_DESCRIPTIONS = {
  "Patient": "This resource represents an individual receiving or registered to receive healthcare services. It contains demographic and identifying information such as name, date of birth, and contact details.",
  "PMI Encounter": "This represents Patient Management Information encounters. It captures an instance of interaction between a patient and the healthcare system from a Patient Management/Registration perspective, focusing on administrative and demographic context. It tracks when, where, and under what circumstances a patient accessed care.",
  "CPI Encounter": "This represents Clinical Process Information encounters. It represents a clinical interaction or visit from a Care Provision/Clinical perspective, recording the healthcare services delivered, clinical observations, and treatments provided. It focuses on the medical details and outcomes of the encounter rather than administrative information.",
  "Encounter": "This resource represents a FHIR standard Encounter which models an interaction between a patient and healthcare provider(s) for the purpose of providing healthcare service(s).",
  "Observation": "This resource represents a FHIR standard Observation which models measurements, assessments, and findings from clinical or diagnostic processes.",
  "Procedure": "This resource represents a FHIR standard Procedure which models an activity that is performed on, with, or for a patient as part of the provision of care.",
  "Condition": "This resource represents a FHIR standard Condition which models a clinical condition, problem, diagnosis, or other event or situation of concern.",
  "DiagnosticReport": "This resource represents a FHIR standard DiagnosticReport which models findings and interpretation of diagnostic tests performed on patients.",
  "Medication": "This resource represents a FHIR standard Medication which models the identification and definition of a medication for the purpose of prescribing.",
  "Organization": "This resource represents a FHIR standard Organization which models formally or informally recognized groupings of people or organizations.",
  "Practitioner": "This resource represents a FHIR standard Practitioner which models a person who is directly or indirectly involved in the provisioning of healthcare."
};

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

      {!status.loading && !status.error && (
        <div className="bg-slate-100 border border-slate-300 rounded-xl overflow-hidden">
          <div className="bg-slate-200 px-6 py-4 flex items-center gap-3">
            <Layers size={20} className="text-blue-600" />
            <h3 className="text-slate-800 font-semibold text-lg">Column Guide</h3>
            <span className="text-slate-600 text-sm">Understanding the field mapping structure</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-base">
              <thead className="bg-slate-200 text-slate-700 uppercase text-sm font-semibold">
                <tr>
                  <th className="px-4 py-3 text-left w-1/6">Field</th>
                  <th className="px-4 py-3 text-left w-1/8">Interpretation</th>
                  <th className="px-4 py-3 text-left w-1/4">Bucket</th>
                  <th className="px-4 py-3 text-left w-1/6">Target Path</th>
                  <th className="px-4 py-3 text-left w-1/8">Transformation</th>
                  <th className="px-4 py-3 text-left w-1/6">Indexed?</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300 text-slate-700">
                <tr className="bg-white">
                  <td className="px-4 py-4 font-medium">
                    <div className="text-slate-800 font-semibold mb-2 text-base">Source Field Name</div>
                    <div className="text-sm text-slate-600">The original field name from the source system or specification</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-slate-800 font-semibold mb-2 text-base">Business Meaning</div>
                    <div className="text-sm text-slate-600">Human-readable description of what this field represents</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-slate-800 font-semibold mb-2 text-base">Data Category</div>
                    <div className="text-sm text-slate-600 space-y-1">
                      <span className="block"><span className="inline-block w-4 h-4 bg-emerald-200 border border-emerald-500 rounded mr-2"></span>FHIR_CORE: Standard FHIR resource data</span>
                      <span className="block"><span className="inline-block w-4 h-4 bg-purple-200 border border-purple-500 rounded mr-2"></span>APP: Application-specific metadata</span>
                      <span className="block"><span className="inline-block w-4 h-4 bg-sky-200 border border-sky-500 rounded mr-2"></span>SEARCH: Indexed search fields</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-slate-800 font-semibold mb-2 text-base">FHIR Location</div>
                    <div className="text-sm text-slate-600">JSON path where this field is stored in the FHIR resource or envelope</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-slate-800 font-semibold mb-2 text-base">Data Processing</div>
                    <div className="text-sm text-slate-600">Any data conversion, formatting, or validation applied during mapping</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-slate-800 font-semibold mb-2 text-base">Search Ready</div>
                    <div className="text-sm text-slate-600">Whether this field is indexed for fast querying and search operations</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!status.loading &&
        !status.error &&
        orderedDomains.map((domain) => (
          <div key={domain} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="bg-slate-800 px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Layers size={16} className="text-emerald-400" />
                  <h3 className="text-slate-200 font-semibold">{domain}</h3>
                </div>
                <span className="text-slate-400 text-xs">{grouped.get(domain)?.length ?? 0} fields</span>
              </div>
              {DOMAIN_DESCRIPTIONS[domain] && (
                <p className="text-slate-300 text-sm leading-relaxed">{DOMAIN_DESCRIPTIONS[domain]}</p>
              )}
            </div>
            <FieldTable rows={grouped.get(domain) ?? []} />
          </div>
        ))}
    </div>
  );
}