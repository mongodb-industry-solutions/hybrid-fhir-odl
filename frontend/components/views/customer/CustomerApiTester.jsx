"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Play, RotateCcw, Database, FileJson, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";

const Monaco = dynamic(() => import("@monaco-editor/react"), { ssr: false });

const BACKEND_PATH = "/api/internal";

// Customer API endpoints configuration
const API_ENDPOINTS = {
  PATIENT_BY_LOCAL_ID: {
    name: "PATIENT_BY_LOCAL_ID",
    title: "Patient Search by Local ID",
    description: "Find patient records by Local ID with optional hospital filtering",
    getPath: "/api/v1/patient/_by-local-id/",
    postPath: "/api/v1/patient/_by-local-id/find",
    mdm: "MDM_PMI_patient_api",
    params: [
      { name: "local_id", type: "string", required: false, help: "Local Patient ID (e.g., A123456(7))" },
      { name: "hospCode", type: "string", required: false, help: "Hospital Code" },
      { name: "page", type: "number", required: false, default: 1, help: "Page number" },
      { name: "limit", type: "number", required: false, default: 20, help: "Records per page" }
    ]
  },

  PMI_CASE_BY_LOCAL_ID: {
    name: "PMI_CASE_BY_LOCAL_ID",
    title: "PMI Cases by Local ID",
    description: "Retrieve Patient Management Information cases by Local ID",
    getPath: "/api/v1/pmi_case/_by-local-id/",
    postPath: "/api/v1/pmi_case/_by-local-id/find",
    mdm: "MDM_PMI_pmi_case",
    params: [
      { name: "local_id", type: "string", required: false, help: "Local Patient ID" },
      { name: "hospCode", type: "string", required: false, help: "Hospital Code" },
      { name: "patientKey", type: "string", required: false, help: "Patient Key" },
      { name: "page", type: "number", required: false, default: 1, help: "Page number" },
      { name: "limit", type: "number", required: false, default: 20, help: "Records per page" }
    ]
  },

  CPI_CASE_BY_TEAM: {
    name: "CPI_CASE_BY_TEAM",
    title: "CPI Cases by Team",
    description: "Retrieve Clinical Process Improvement cases by care team filters",
    getPath: "/api/v1/cpi_case/_by-team/",
    postPath: "/api/v1/cpi_case/_by-team/find",
    mdm: "MDM_PI_cpi_case",
    params: [
      { name: "hospCode", type: "string", required: true, help: "Hospital Code (Required)" },
      { name: "wardCode", type: "string", required: false, help: "Ward Code" },
      { name: "specCode", type: "string", required: false, help: "Specialty Code" },
      { name: "teamCode", type: "string", required: false, help: "Team Code" },
      { name: "statusCode", type: "string", required: false, help: "Status Code" },
      { name: "caseType", type: "string", required: false, help: "Case Type" },
      { name: "page", type: "number", required: false, default: 1, help: "Page number" },
      { name: "limit", type: "number", required: false, default: 20, help: "Records per page" }
    ]
  },
  CPI_CASE_BY_MO: {
    name: "CPI_CASE_BY_MO",
    title: "CPI Cases by Medical Officer",
    description: "Retrieve Clinical Process Improvement cases by medical officer filters",
    getPath: "/api/v1/cpi_case/_by-mo/",
    postPath: "/api/v1/cpi_case/_by-mo/find",
    mdm: "MDM_PI_cpi_case",
    params: [
      { name: "hospCode", type: "string", required: true, help: "Hospital Code (Required)" },
      { name: "doctorCode", type: "string", required: false, help: "Doctor Code" },
      { name: "specialistCode", type: "string", required: false, help: "Specialist Code" },
      { name: "statusCode", type: "string", required: false, default: "AC", help: "Status Code (default: AC)" },
      { name: "caseType", type: "array", required: false, help: "Case Type array (e.g., I,A)" },
      { name: "page", type: "number", required: false, default: 1, help: "Page number" },
      { name: "limit", type: "number", required: false, default: 20, help: "Records per page" }
    ]
  }
};

function buildQueryString(params) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    if (typeof v === "string" && v.includes(",")) {
      v.split(",").forEach(x => sp.append(k, x.trim()));
    } else {
      sp.append(k, v);
    }
  });
  return sp.toString();
}

function ParamField({ param, value, onChange }) {
  const inputClasses = "w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors";

  if (param.type === "number") {
    return (
      <input
        type="number"
        className={inputClasses}
        placeholder={param.help || param.name}
        value={value || param.default || ""}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  if (param.type === "array") {
    return (
      <input
        type="text"
        className={inputClasses}
        placeholder={param.help || "Comma-separated values"}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  return (
    <input
      type="text"
      className={inputClasses}
      placeholder={param.help || param.name}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export default function CustomerApiTester() {
  const [selectedEndpoint, setSelectedEndpoint] = useState("PATIENT_BY_LOCAL_ID");
  const [method, setMethod] = useState("GET");
  const [params, setParams] = useState({});
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sampleValues, setSampleValues] = useState({});
  const [paramsExpanded, setParamsExpanded] = useState(true);

  const currentEndpoint = API_ENDPOINTS[selectedEndpoint];

  // Fetch sample values on mount
  useEffect(() => {
    const fetchSamples = async () => {
      try {
        const res = await fetch(`${BACKEND_PATH}/inspect/sample-local-id`);
        const data = await res.json();
        setSampleValues(data);
      } catch (err) {
        console.error("Failed to fetch sample values:", err);
      }
    };
    fetchSamples();
  }, []);

  // Fetch sample hospital codes and other values
  useEffect(() => {
    const fetchSampleData = async () => {
      try {
        const encounterRes = await fetch(`${BACKEND_PATH}/inspect/sample-values/Encounter?limit=5`);
        const encounterData = await encounterRes.json();
        setSampleValues(prev => ({ ...prev, ...encounterData }));
      } catch (err) {
        console.error("Failed to fetch encounter sample values:", err);
      }
    };
    fetchSampleData();
  }, []);

  const handleExecute = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const path = method === "GET" ? currentEndpoint.getPath : currentEndpoint.postPath;
      const queryString = buildQueryString(params);
      const url = `${BACKEND_PATH}${path}${queryString ? `?${queryString}` : ""}`;

      const options = {
        method,
        headers: {
          "Content-Type": "application/json",
        }
      };

      if (method === "POST") {
        options.body = JSON.stringify(params);
      }

      const res = await fetch(url, options);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || `HTTP ${res.status}`);
      }

      setResponse({
        status: res.status,
        data,
        count: data.count || 0,
        recordsReturned: data.data?.length || 0
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setParams({});
    setResponse(null);
    setError(null);
  };

  const handleLoadPreset = () => {
    // Load preset based on available sample values
    const preset = {};

    if (selectedEndpoint === "PATIENT_BY_LOCAL_ID" && sampleValues.local_id) {
      preset.local_id = sampleValues.local_id;
    }

    if (selectedEndpoint === "PMI_CASE_BY_LOCAL_ID" && sampleValues.local_id) {
      preset.local_id = sampleValues.local_id;
    }

    if ((selectedEndpoint === "CPI_CASE_BY_TEAM" || selectedEndpoint === "CPI_CASE_BY_MO") && sampleValues.hospitalCodes?.length > 0) {
      preset.hospCode = sampleValues.hospitalCodes[0];
    }

    if (selectedEndpoint === "CPI_CASE_BY_MO" && sampleValues.doctorCodes?.length > 0) {
      preset.doctorCode = sampleValues.doctorCodes[0];
    }

    if (selectedEndpoint === "CPI_CASE_BY_TEAM" && sampleValues.teamCodes?.length > 0) {
      preset.teamCode = sampleValues.teamCodes[0];
    }

    setParams(prev => ({ ...prev, ...preset }));
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-lg p-4 border border-purple-500/20">
        <div className="flex items-center gap-2 mb-2">
          <Database className="text-purple-400" size={20} />
          <h3 className="text-lg font-semibold text-slate-200">Customer API Tester</h3>
        </div>
        <p className="text-sm text-slate-400">
          Test the customer specification-compliant APIs for Patient and Case Management
        </p>
      </div>

      {/* Endpoint Selection */}
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <label className="block text-sm font-medium text-slate-300 mb-2">Select API Endpoint</label>
        <select
          className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-600 text-slate-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
          value={selectedEndpoint}
          onChange={(e) => {
            setSelectedEndpoint(e.target.value);
            setParams({});
            setResponse(null);
            setError(null);
          }}
        >
          {Object.entries(API_ENDPOINTS).map(([key, endpoint]) => (
            <option key={key} value={key}>
              {endpoint.title} ({endpoint.name})
            </option>
          ))}
        </select>

        <div className="mt-3 p-3 bg-slate-900/50 rounded border border-slate-700">
          <p className="text-sm text-slate-300 mb-1">{currentEndpoint.description}</p>
          <p className="text-xs text-slate-500">MDM: {currentEndpoint.mdm}</p>
        </div>
      </div>

      {/* Method Selection */}
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <label className="block text-sm font-medium text-slate-300 mb-2">HTTP Method</label>
        <div className="flex gap-2">
          <button
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              method === "GET"
                ? "bg-emerald-600 text-white"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
            onClick={() => setMethod("GET")}
          >
            GET
          </button>
          <button
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              method === "POST"
                ? "bg-blue-600 text-white"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
            onClick={() => setMethod("POST")}
          >
            POST
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          {method === "GET" ? currentEndpoint.getPath : currentEndpoint.postPath}
        </p>
      </div>

      {/* Parameters */}
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setParamsExpanded(!paramsExpanded)}
            className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-slate-100 transition-colors"
          >
            {paramsExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            <span>Parameters</span>
            <span className="text-xs text-slate-500">({currentEndpoint.params.length} fields)</span>
          </button>
          <button
            onClick={handleLoadPreset}
            className="text-xs px-3 py-1 rounded bg-purple-600 hover:bg-purple-700 text-white transition-colors"
          >
            Load Preset
          </button>
        </div>

        {paramsExpanded && (
          <div className="space-y-3">
            {currentEndpoint.params.map((param) => (
              <div key={param.name}>
                <label className="block text-xs text-slate-400 mb-1">
                  {param.name}
                  {param.required && <span className="text-red-400 ml-1">*</span>}
                  {param.default && <span className="text-slate-500 ml-1">(default: {param.default})</span>}
                </label>
                <ParamField
                  param={param}
                  value={params[param.name]}
                  onChange={(val) => setParams({ ...params, [param.name]: val })}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleExecute}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play size={16} />
          {loading ? "Executing..." : "Execute Request"}
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-400">
            <AlertCircle size={16} />
            <span className="font-medium">Error</span>
          </div>
          <p className="text-sm text-red-300 mt-1">{error}</p>
        </div>
      )}

      {/* Response Display */}
      {response && (
        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
          <div className="bg-slate-900 px-4 py-3 border-b border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileJson className="text-emerald-400" size={16} />
                <span className="text-sm font-medium text-slate-200">Response</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span>Status: <span className="text-emerald-400">{response.status}</span></span>
                <span>Total: <span className="text-purple-400">{response.count}</span></span>
                <span>Returned: <span className="text-blue-400">{response.recordsReturned}</span></span>
              </div>
            </div>
          </div>
          <div className="h-96">
            <Monaco
              language="json"
              theme="vs-dark"
              value={JSON.stringify(response.data, null, 2)}
              options={{
                readOnly: true,
                minimap: { enabled: false },
                fontSize: 13,
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                wordWrap: "on",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
