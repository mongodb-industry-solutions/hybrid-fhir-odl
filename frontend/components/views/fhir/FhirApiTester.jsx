"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import dynamic from "next/dynamic";
import { Sparkles, Play, ChevronDown, ChevronUp } from "lucide-react";
const Monaco = dynamic(() => import("@monaco-editor/react"), { ssr: false });

const BACKEND_PATH = "/api/internal";

function qs(params) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    if (typeof v === "string" && v.includes(",") && (k === "birthdate" || k === "date-start" || k === "end-date")) {
      v.split(",").forEach(x => sp.append(k, x.trim()));
    } else {
      sp.append(k, v);
    }
  });
  return sp.toString();
}

function Field({ def, value, onChange, sampleValues }) {
  const type = def.type || "string";
  const fieldKey = def.name;

  // Auto-populate dropdowns with real data
  let options = def.options || [];
  if (!options.length && sampleValues) {
    if (fieldKey === "gender" && sampleValues.genders) {
      options = sampleValues.genders;
    } else if (fieldKey === "status" && sampleValues.statuses) {
      options = sampleValues.statuses;
    }
  }

  if (options.length > 0) {
    return (
      <select
        className="w-full px-2 py-1 rounded bg-slate-800 border border-slate-600 text-slate-200 hover:border-emerald-500 transition-colors"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">(any)</option>
        {options.map((o)=> <option key={o} value={o}>{o}</option>)}
      </select>
    );
  }
  if (type === "date") {
    return (
      <div className="flex gap-2">
        <select
          className="px-2 py-1 rounded bg-slate-800 border border-slate-600 text-slate-200"
          value={(value && value.match(/^(ge|gt|le|lt|ne|eq|sa|eb|ap)/)?.[0]) || "eq"}
          onChange={(e) => {
            const rest = value ? value.replace(/^(ge|gt|le|lt|ne|eq|sa|eb|ap)/, "") : "";
            onChange(e.target.value + rest);
          }}
        >
          {["eq","ne","gt","ge","lt","le","sa","eb","ap"].map(op => <option key={op} value={op}>{op}</option>)}
        </select>
        <input
          className="flex-1 px-2 py-1 rounded bg-slate-800 border border-slate-600 text-slate-200"
          type="date"
          value={(value && value.replace(/^(ge|gt|le|lt|ne|eq|sa|eb|ap)/,"")) || ""}
          onChange={(e) => onChange(((value && value.match(/^(ge|gt|le|lt|ne|eq|sa|eb|ap)/)?.[0]) || "eq") + e.target.value)}
        />
      </div>
    );
  }
  if (type === "quantity") {
    return (
      <div className="flex gap-2">
        <select
          className="px-2 py-1 rounded bg-slate-800 border border-slate-600 text-slate-200"
          value={(value && value.match(/^(ge|gt|le|lt|ne|eq)/)?.[0]) || "eq"}
          onChange={(e) => {
            const num = value ? value.replace(/^(ge|gt|le|lt|ne|eq)/, "") : "";
            onChange(e.target.value + num);
          }}
        >
          {["eq","ne","gt","ge","lt","le"].map(op => <option key={op} value={op}>{op}</option>)}
        </select>
        <input
          className="flex-1 px-2 py-1 rounded bg-slate-800 border border-slate-600 text-slate-200"
          type="number"
          step="0.1"
          value={(value && value.replace(/^(ge|gt|le|lt|ne|eq)/,"")) || ""}
          onChange={(e) => onChange(((value && value.match(/^(ge|gt|le|lt|ne|eq)/)?.[0]) || "eq") + e.target.value)}
        />
      </div>
    );
  }
  return (
    <input
      className="w-full px-2 py-1 rounded bg-slate-800 border border-slate-600 text-slate-200"
      placeholder={def.help || def.name}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export default function FhirApiTester({ onTabChange }) {
  const [resource, setResource] = useState("Patient");
  const [cfg, setCfg] = useState(null);
  const [sampleValues, setSampleValues] = useState(null);
  const [hasData, setHasData] = useState(null); // null = loading, true/false = data status
  const [form, setForm] = useState({});
  const [url, setUrl] = useState("");
  const [sending, setSending] = useState(false);
  const [respJson, setRespJson] = useState("");
  const [filterJson, setFilterJson] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [count, setCount] = useState(0);
  const [paramsExpanded, setParamsExpanded] = useState(false);
  const resultsRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [configRes, samplesRes] = await Promise.all([
          fetch(`/fhir-config/${resource.toLowerCase()}.json`),
          fetch(`${BACKEND_PATH}/inspect/sample-values/${resource}`)
        ]);
        if (configRes.ok) setCfg(await configRes.json());
        if (samplesRes.ok) {
          const samples = await samplesRes.json();
          setSampleValues(samples);
          setHasData(samples.hasData || false);
        } else {
          setHasData(false);
        }
      } catch (e) { console.error(e); setHasData(false); }
    };
    load();
    setForm({});
    setRespJson("");
    setFilterJson("");
    setUrl("");
  }, [resource]);

  // Generate comprehensive smart presets organized by category
  const smartPresets = useMemo(() => {
    if (!sampleValues) return { categories: [] };

    if (resource === "Patient") {
      const categories = [];

      // Basic Searches
      const basic = [];
      if (sampleValues.genders?.includes("female")) {
        basic.push({ label: "All Female Patients", desc: "Filter by gender", params: { gender: "female", limit: "10" }});
        basic.push({ label: "All Male Patients", desc: "Filter by gender", params: { gender: "male", limit: "10" }});
      }
      if (sampleValues.local_ids?.length > 0) {
        basic.push({ label: `Specific Patient (${sampleValues.local_ids[0]})`, desc: "Search by Local ID", params: { identifier: `local_id|${sampleValues.local_ids[0]}` }});
      }
      if (sampleValues.familyNames?.length > 1) {
        basic.push({ label: `Name: ${sampleValues.familyNames[0]}`, desc: "Search by family name", params: { family: sampleValues.familyNames[0] }});
      }
      if (basic.length) categories.push({ name: "Basic Searches", queries: basic });

      // Date & Demographics
      const demographics = [];
      if (sampleValues.birthDateRange) {
        const midYear = Math.floor((new Date(sampleValues.birthDateRange.min).getFullYear() + new Date(sampleValues.birthDateRange.max).getFullYear()) / 2);
        demographics.push({ label: `Born After ${midYear}`, desc: "Date comparison (greater than)", params: { birthdate: `gt${midYear}-01-01`, limit: "10" }});
        demographics.push({ label: `Born Before ${midYear}`, desc: "Date comparison (less than)", params: { birthdate: `lt${midYear}-01-01`, limit: "10" }});
        demographics.push({ label: `Born in ${midYear}`, desc: "Date exact match", params: { birthdate: `${midYear}-01-01`, limit: "10" }});
      }
      if (demographics.length) categories.push({ name: "Date & Demographics", queries: demographics });

      // Combined Queries (same resource)
      const combined = [];
      if (sampleValues.genders?.includes("female") && sampleValues.birthDateRange) {
        const recentYear = new Date(sampleValues.birthDateRange.max).getFullYear() - 10;
        combined.push({ label: "Young Female Patients", desc: "Gender + birth date", params: { gender: "female", birthdate: `gt${recentYear}-01-01`, limit: "10" }});
      }
      if (sampleValues.familyNames?.length > 0 && sampleValues.genders?.includes("male")) {
        combined.push({ label: `Male ${sampleValues.familyNames[0]}s`, desc: "Name + gender", params: { family: sampleValues.familyNames[0], gender: "male", limit: "10" }});
      }
      if (sampleValues.genders?.includes("female") && sampleValues.familyNames?.length > 0) {
        combined.push({ label: `Female ${sampleValues.familyNames[0]}s`, desc: "Name + gender combination", params: { family: sampleValues.familyNames[0], gender: "female", limit: "10" }});
      }
      if (combined.length) categories.push({ name: "Combined Queries", queries: combined });

      // Usage Hint: How to use with Encounter
      const usageHint = [];
      if (sampleValues.local_ids?.length > 0) {
        usageHint.push({
          label: `💡 Use ${sampleValues.local_ids[0]} with Encounter`,
          desc: "Switch to Encounter tab to see cross-resource queries",
          params: { identifier: `local_id|${sampleValues.local_ids[0]}` }
        });
      }
      if (usageHint.length) categories.push({ name: "💡 Cross-Resource Tip", queries: usageHint });

      const extras = [];
      if (sampleValues.local_ids?.length > 0) {
        extras.push({
          label: "Patient + Encounters bundle",
          desc: "_revinclude=Encounter:patient",
          params: {
            identifier: `local_id|${sampleValues.local_ids[0]}`,
            "_revinclude": "Encounter:patient",
            limit: "5"
          }
        });
      }
      if (extras.length) categories.push({ name: "FHIR Extras (_revinclude)", queries: extras });

      return { categories };

    } else if (resource === "Encounter") {
      const categories = [];

      // Status & Class
      const statusQueries = [];
      if (sampleValues.statuses?.includes("finished")) {
        statusQueries.push({ label: "Finished Encounters", desc: "Filter by status", params: { status: "finished", limit: "10" }});
      }
      if (sampleValues.statuses?.includes("in-progress")) {
        statusQueries.push({ label: "Active Encounters", desc: "In-progress encounters", params: { status: "in-progress", limit: "10" }});
      }
      if (statusQueries.length) categories.push({ name: "Status & Classification", queries: statusQueries });

      // Provider & Location
      const provider = [];
      if (sampleValues.hospitalCodes?.length > 0) {
        const orgRef = (code) => `Organization/${code}`;
        provider.push({ label: `Hospital: ${sampleValues.hospitalCodes[0]}`, desc: "Filter by service provider", params: { "service-provider": orgRef(sampleValues.hospitalCodes[0]), limit: "10" }});
        if (sampleValues.hospitalCodes.length > 1) {
          provider.push({ label: `Hospital: ${sampleValues.hospitalCodes[1]}`, desc: "Different hospital", params: { "service-provider": orgRef(sampleValues.hospitalCodes[1]), limit: "10" }});
        }
      }
      if (sampleValues.doctorCodes?.length > 0) {
        const token = (code) => `doctorCode|${code}`;
        provider.push({ label: `Doctor: ${sampleValues.doctorCodes[0]}`, desc: "Filter by practitioner", params: { "participant.identifier": token(sampleValues.doctorCodes[0]), limit: "10" }});
      }
      if (sampleValues.teamCodes?.length > 0) {
        const teamRef = (code) => `CareTeam/${code}`;
        provider.push({ label: `Care Team: ${sampleValues.teamCodes[0]}`, desc: "Filter by care team", params: { careteam: teamRef(sampleValues.teamCodes[0]), limit: "10" }});
      }
      if (provider.length) categories.push({ name: "Provider & Location", queries: provider });

      // Date Ranges
      const dateQueries = [];
      if (sampleValues.dateRange) {
        const maxDate = new Date(sampleValues.dateRange.max);
        const recent = new Date(maxDate);
        recent.setMonth(recent.getMonth() - 1);
        dateQueries.push({ label: "Last Month", desc: "Recent encounters", params: { "date-start": `ge${recent.toISOString().split('T')[0]}`, limit: "10" }});

        const threeMonths = new Date(maxDate);
        threeMonths.setMonth(threeMonths.getMonth() - 3);
        dateQueries.push({ label: "Last 3 Months", desc: "Date range query", params: { "date-start": `ge${threeMonths.toISOString().split('T')[0]}`, limit: "10" }});

        const sixMonths = new Date(maxDate);
        sixMonths.setMonth(sixMonths.getMonth() - 6);
        dateQueries.push({ label: "Last 6 Months", desc: "Longer date range", params: { "date-start": `ge${sixMonths.toISOString().split('T')[0]}`, limit: "10" }});
      }
      if (dateQueries.length) categories.push({ name: "Date Ranges", queries: dateQueries });

      // Complex Combined Queries (same resource)
      const complex = [];
      if (sampleValues.hospitalCodes?.length > 0 && sampleValues.statuses?.includes("finished")) {
        const orgRef = `Organization/${sampleValues.hospitalCodes[0]}`;
        complex.push({ label: `Completed @ ${sampleValues.hospitalCodes[0]}`, desc: "Hospital + status", params: { "service-provider": orgRef, status: "finished", limit: "10" }});
      }
      if (sampleValues.doctorCodes?.length > 0 && sampleValues.dateRange) {
        const recent = new Date(sampleValues.dateRange.max);
        recent.setMonth(recent.getMonth() - 1);
        complex.push({ label: `Dr. ${sampleValues.doctorCodes[0]} Recent`, desc: "Practitioner + date", params: { "participant.identifier": `doctorCode|${sampleValues.doctorCodes[0]}`, "date-start": `ge${recent.toISOString().split('T')[0]}`, limit: "10" }});
      }
      if (sampleValues.hospitalCodes?.length > 0 && sampleValues.doctorCodes?.length > 0) {
        complex.push({ label: `Dr. ${sampleValues.doctorCodes[0]} @ ${sampleValues.hospitalCodes[0]}`, desc: "Practitioner + hospital", params: { "participant.identifier": `doctorCode|${sampleValues.doctorCodes[0]}`, "service-provider": `Organization/${sampleValues.hospitalCodes[0]}`, limit: "10" }});
      }
      if (sampleValues.statuses?.includes("finished") && sampleValues.dateRange) {
        const lastMonth = new Date(sampleValues.dateRange.max);
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        complex.push({ label: "Finished Last Month", desc: "Status + date range", params: { status: "finished", "date-start": `ge${lastMonth.toISOString().split('T')[0]}`, limit: "10" }});
      }
      if (complex.length) categories.push({ name: "Complex Combined Queries", queries: complex });

      // Cross-Resource Queries (Patient -> Encounter relationships)
      const crossResource = [];
      if (sampleValues.local_ids?.length > 0) {
        crossResource.push({
          label: `Encounters for Patient ${sampleValues.local_ids[0]}`,
          desc: "Cross-resource: Patient → Encounters via Local ID",
          params: { "subject.identifier": `local_id|${sampleValues.local_ids[0]}`, limit: "10" }
        });
      }
      if (sampleValues.local_ids?.length > 1) {
        crossResource.push({
          label: `Encounters for ${sampleValues.local_ids[1]}`,
          desc: "Different patient's encounters",
          params: { "subject.identifier": `local_id|${sampleValues.local_ids[1]}`, limit: "10" }
        });
      }
      if (sampleValues.local_ids?.length > 0 && sampleValues.statuses?.includes("finished")) {
        crossResource.push({
          label: `Finished visits for ${sampleValues.local_ids[0]}`,
          desc: "Patient encounters + status filter",
          params: { "subject.identifier": `local_id|${sampleValues.local_ids[0]}`, status: "finished", limit: "10" }
        });
      }
      if (sampleValues.local_ids?.length > 0 && sampleValues.hospitalCodes?.length > 0) {
        crossResource.push({
          label: `${sampleValues.local_ids[0]} @ ${sampleValues.hospitalCodes[0]}`,
          desc: "Patient encounters at specific hospital",
          params: { "subject.identifier": `local_id|${sampleValues.local_ids[0]}`, "service-provider": sampleValues.hospitalCodes[0], limit: "10" }
        });
      }
      if (sampleValues.local_ids?.length > 0 && sampleValues.dateRange) {
        const recent = new Date(sampleValues.dateRange.max);
        recent.setMonth(recent.getMonth() - 3);
        crossResource.push({
          label: `${sampleValues.local_ids[0]} Recent 3mo`,
          desc: "Patient's recent encounters (date filter)",
          params: { "subject.identifier": `local_id|${sampleValues.local_ids[0]}`, "date-start": `ge${recent.toISOString().split('T')[0]}`, limit: "10" }
        });
      }
      if (crossResource.length) categories.push({ name: "Cross-Resource Queries (Patient → Encounter)", queries: crossResource });

      const fhirExtras = [
        {
          label: "Include Patient resources",
          desc: "_include=Encounter:subject",
          params: { limit: "5", "_include": "Encounter:subject" }
        }
      ];
      if (sampleValues.doctorCodes?.length > 0) {
        fhirExtras.push({
          label: `Doctor ${sampleValues.doctorCodes[0]} + include subject`,
          desc: "Doctor filter with included Patient bundles",
          params: {
            "participant.identifier": `doctorCode|${sampleValues.doctorCodes[0]}`,
            "_include": "Encounter:subject",
            limit: "5"
          }
        });
      }
      categories.push({ name: "FHIR Extras (_include)", queries: fhirExtras });

      return { categories };
    }

    return { categories: [] };
  }, [sampleValues, resource]);

  const queryString = useMemo(() => qs(form), [form]);

  useEffect(() => {
    const base = `${BACKEND_PATH}/fhir/${resource}`;
    setUrl(`${base}?${queryString}`);
  }, [resource, queryString]);

  const run = async () => {
    setSending(true);
    setElapsed(0);
    const t0 = performance.now();
    const url = `${BACKEND_PATH}/fhir/${resource}?${queryString}`;
    console.log('[FhirApiTester] Fetching:', url);
    const res = await fetch(url, {
      headers: {
        "x-debug-filter": "true",
        "x-search-mode": "accelerated"
      }
    });
    const t1 = performance.now();
    setElapsed(Math.max(0, t1 - t0));
    const data = await res.json();
    console.log('[FhirApiTester] Response data:', data);
    console.log('[FhirApiTester] mongoPipeline:', data.mongoPipeline);
    console.log('[FhirApiTester] mongoFilter:', data.mongoFilter);
    const bundle = data.bundle || data;
    setRespJson(JSON.stringify(bundle, null, 2));
    const entries = Array.isArray(bundle.entry) ? bundle.entry.length : 0;
    setCount(entries);
    // Prefer showing the full pipeline, fall back to filter
    const filterToShow = data.mongoPipeline || data.mongoFilter || {};
    console.log('[FhirApiTester] Setting filterJson to:', filterToShow);
    setFilterJson(JSON.stringify(filterToShow, null, 2));
    setSending(false);
    
    // Smooth scroll to results section
    setTimeout(() => {
      if (resultsRef.current) {
        resultsRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }, 100);
  };

  const setParam = (name, val) => setForm(prev => ({ ...prev, [name]: val }));
  const loadPreset = (query) => {
    setForm(query.params);
    setTimeout(() => run(), 100); // Auto-run the query
  };

  const totalQueries = smartPresets.categories?.reduce((sum, cat) => sum + cat.queries.length, 0) || 0;

  return (
    <div className="space-y-4">
      {/* Header with Controls */}
      <div className="bg-gradient-to-r from-emerald-900/20 to-blue-900/20 border border-emerald-700/30 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Sparkles className="text-emerald-400" size={20} />
            <h3 className="text-lg font-semibold text-slate-200">FHIR Search Demonstrator</h3>
            <span className="text-xs bg-emerald-900/40 text-emerald-300 px-2 py-1 rounded">{totalQueries} examples</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Resource Type</label>
            <select
              className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-600 text-slate-200 hover:border-emerald-500 transition-colors"
              value={resource}
              onChange={(e) => setResource(e.target.value)}
            >
              <option>Patient</option>
              <option>Encounter</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">Results</label>
            <div className="px-3 py-2 bg-slate-800/50 rounded border border-slate-700 text-sm text-slate-300">
              {elapsed > 0 ? (
                <>
                  <span className="text-emerald-400 font-mono">{elapsed.toFixed(0)}ms</span>
                  {" • "}
                  <span className="text-blue-400 font-mono">{count} results</span>
                </>
              ) : (
                <span className="text-slate-500">No query run yet</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Database Population Notice */}
      {hasData === false && (
        <div className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-blue-700/40 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="text-blue-400" size={20} />
            <h4 className="text-lg font-bold text-blue-300">📊 Please populate the database to see example queries</h4>
          </div>
          <div className="text-sm text-slate-300 space-y-2">
            <p>The FHIR search demonstrator works best with sample data to generate meaningful examples.</p>
            <div className="bg-slate-800/50 p-3 rounded border border-slate-700">
              <p className="font-medium text-emerald-400 mb-2">💡 Quick setup:</p>
              <ol className="list-decimal pl-4 space-y-1 text-sm">
                <li>Navigate to the 
                  <button 
                    onClick={() => onTabChange?.('synthetic')}
                    className="font-bold text-emerald-400 hover:text-emerald-300 underline decoration-emerald-400 hover:decoration-emerald-300 transition-colors cursor-pointer ml-1"
                  >
                    Synthetic Data Creation
                  </button> tab
                </li>
                <li>Generate sample {resource} records</li>
                <li>Return here to see personalized example queries based on your data</li>
              </ol>
            </div>
            <p className="text-blue-400 text-xs">You can still test manual queries below, though results will be empty until data is added.</p>
          </div>
        </div>
      )}

     {/* Custom Search Parameters Section */}
      <div className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-blue-700/40 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
          <h4 className="text-xl font-bold bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent">
            🔧 Custom Query Builder
          </h4>
          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
        </div>
        <div className="text-sm text-slate-300 mb-4">
          Need precise control? Build your own custom FHIR search with specific parameters below.
        </div>
        
        {/* Parameters dropdown */}
        <div className="bg-slate-800/50 border border-slate-600/50 rounded p-3">
          <button
            onClick={() => setParamsExpanded(!paramsExpanded)}
            className="flex items-center gap-2 text-slate-200 font-medium mb-2 hover:text-emerald-400 transition-colors w-full"
          >
            {paramsExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            <span>{resource} search parameters</span>
            <span className="text-xs text-slate-500">({cfg?.params?.length || 0} fields)</span>
          </button>
          {paramsExpanded && (
            <>
              <div className="space-y-2">
                {cfg?.params?.map((p) => (
                  <div key={p.name}>
                    <div className="text-xs text-slate-400 mb-1">{p.name}{p.help ? ` — ${p.help}`: ""}</div>
                    <Field def={p} value={form[p.name]} onChange={(v)=>setParam(p.name, v)} sampleValues={sampleValues} />
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-slate-700">
                <div className="text-xs text-slate-400 mb-2">Manual search available below. Or use examples above for instant results!</div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Quick Examples */}
      {smartPresets.categories?.length > 0 && hasData !== false && (
        <div className="bg-gradient-to-r from-emerald-900/30 to-blue-900/30 border border-emerald-700/40 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <h4 className="text-xl font-bold bg-gradient-to-r from-emerald-300 to-blue-300 bg-clip-text text-transparent flex items-center gap-2">
                {/* <Sparkles className="text-blue-400" size={20} /> */}
                ⚡ Quick testing? Try these examples
              </h4>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-slate-300">(Click any button to run)</span>
            </div>
            <button
              className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex items-center gap-2 transition-all"
              onClick={run}
              disabled={sending || !queryString}
            >
              {sending ? "Running..." : (
                <>
                  <Play size={14} /> Run Current Query
                </>
              )}
            </button>
          </div>

          {smartPresets.categories.map((category, idx) => (
            <div key={idx} className="mb-4 last:mb-0">
              <div className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                <div className={`w-1 h-4 rounded ${idx === 0 ? 'bg-emerald-500' : idx === 1 ? 'bg-blue-500' : idx === 2 ? 'bg-purple-500' : 'bg-orange-500'}`}></div>
                {category.name}
                <span className="text-xs text-slate-500">({category.queries.length})</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                {category.queries.map((query, qidx) => (
                  <button
                    key={qidx}
                    onClick={() => loadPreset(query)}
                    className="text-left px-3 py-2 rounded bg-gradient-to-br from-slate-700 to-slate-800 hover:from-emerald-700 hover:to-emerald-800 border border-slate-600 hover:border-emerald-500 transition-all group"
                  >
                    <div className="text-sm font-medium text-slate-200 group-hover:text-emerald-300 flex items-center gap-1">
                      <Play size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      {query.label}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">{query.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          ))}

          {url && (
            <div className="mt-4 p-3 bg-slate-900/50 rounded border border-slate-700">
              <div className="text-xs text-slate-400 mb-1">Current Query URL:</div>
              <div className="text-xs font-mono text-emerald-400 break-all">
                GET {url.replace(BACKEND_PATH, '')}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" ref={resultsRef}>
        <div className="bg-slate-800 border border-slate-700 rounded p-2">
          <div className="text-slate-200 text-sm mb-1">MongoDB Filter / Pipeline</div>
          <Monaco height="500px" defaultLanguage="json" value={filterJson} onChange={()=>{}} options={{readOnly:true}} />
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded p-2">
          <div className="text-slate-200 text-sm mb-1">Response Bundle</div>
          <Monaco height="500px" defaultLanguage="json" value={respJson} onChange={()=>{}} options={{readOnly:true}} />
        </div>
      </div>
    </div>
  );
}
