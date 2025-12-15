"use client";

import React from "react";
import { Book, ExternalLink, Activity, Server, Shield, Database } from "lucide-react";

export default function FhirApiDocs() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://backend:3100";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Book className="w-6 h-6 text-emerald-500" />
          API Documentation
        </h2>
        <p className="text-slate-400 mt-1">
          Three distinct APIs: FHIR-compliant, Application-specific, and Admin operations
        </p>
      </div>

      {/* API Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* FHIR API */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 rounded-lg">
              <Activity className="w-7 h-7 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">FHIR API</h3>
              <p className="text-xs text-slate-400">HL7 FHIR R4</p>
            </div>
          </div>

          <p className="text-slate-300 text-xs leading-relaxed">
            Standard FHIR-compliant endpoints for healthcare interoperability.
          </p>

          <div className="space-y-1.5">
            <div className="flex items-start gap-2 text-xs">
              <div className="w-1 h-1 bg-emerald-500 rounded-full mt-1.5"></div>
              <span className="text-slate-300">GET /fhir/Patient</span>
            </div>
            <div className="flex items-start gap-2 text-xs">
              <div className="w-1 h-1 bg-emerald-500 rounded-full mt-1.5"></div>
              <span className="text-slate-300">GET /fhir/Encounter</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-700">
            <a
              href={`${backendUrl}/redoc#tag/FHIR-API`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-lg transition-colors w-full font-medium"
            >
              <Book className="w-3.5 h-3.5" />
              View Docs
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="text-xs text-slate-500">
            <div>Base: <code className="text-emerald-400">/fhir/</code></div>
          </div>
        </div>

        {/* Application API */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 rounded-lg">
              <Database className="w-7 h-7 text-blue-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Application API</h3>
              <p className="text-xs text-slate-400">Business Logic</p>
            </div>
          </div>

          <p className="text-slate-300 text-xs leading-relaxed">
            Legacy healthcare APIs and data inspection endpoints.
          </p>

          <div className="space-y-1.5">
            <div className="flex items-start gap-2 text-xs">
              <div className="w-1 h-1 bg-blue-500 rounded-full mt-1.5"></div>
              <span className="text-slate-300">GET /patients/by-hkid</span>
            </div>
            <div className="flex items-start gap-2 text-xs">
              <div className="w-1 h-1 bg-blue-500 rounded-full mt-1.5"></div>
              <span className="text-slate-300">GET /pmicases/by-hkid</span>
            </div>
            <div className="flex items-start gap-2 text-xs">
              <div className="w-1 h-1 bg-blue-500 rounded-full mt-1.5"></div>
              <span className="text-slate-300">GET /cpi/cases/by-team</span>
            </div>
            <div className="flex items-start gap-2 text-xs">
              <div className="w-1 h-1 bg-blue-500 rounded-full mt-1.5"></div>
              <span className="text-slate-300">GET /inspect/resources</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-700">
            <a
              href={`${backendUrl}/redoc#tag/Application-API`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors w-full font-medium"
            >
              <Book className="w-3.5 h-3.5" />
              View Docs
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="text-xs text-slate-500">
            <div>Base: <code className="text-blue-400">/patients/, /inspect/, /cpi/</code></div>
          </div>
        </div>

        {/* Admin API */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/10 rounded-lg">
              <Shield className="w-7 h-7 text-purple-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Admin API</h3>
              <p className="text-xs text-slate-400">Operations</p>
            </div>
          </div>

          <p className="text-slate-300 text-xs leading-relaxed">
            System health checks and administrative operations.
          </p>

          <div className="space-y-1.5">
            <div className="flex items-start gap-2 text-xs">
              <div className="w-1 h-1 bg-purple-500 rounded-full mt-1.5"></div>
              <span className="text-slate-300">GET /health</span>
            </div>
            <div className="flex items-start gap-2 text-xs">
              <div className="w-1 h-1 bg-purple-500 rounded-full mt-1.5"></div>
              <span className="text-slate-300">POST /admin/seed</span>
            </div>
            <div className="flex items-start gap-2 text-xs">
              <div className="w-1 h-1 bg-purple-500 rounded-full mt-1.5"></div>
              <span className="text-slate-300">POST /admin/wipe</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-700">
            <a
              href={`${backendUrl}/redoc#tag/Admin-API`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors w-full font-medium"
            >
              <Book className="w-3.5 h-3.5" />
              View Docs
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="text-xs text-slate-500">
            <div>Base: <code className="text-purple-400">/health, /admin/</code></div>
          </div>
        </div>
      </div>

      {/* Additional Info Section */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">API Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="text-sm font-medium text-slate-400">Backend Server</div>
            <code className="text-emerald-400 text-sm break-all">{backendUrl}</code>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium text-slate-400">OpenAPI Schema</div>
            <a
              href={`${backendUrl}/openapi.json`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
            >
              /openapi.json
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium text-slate-400">Content Type</div>
            <code className="text-purple-400 text-sm">application/json</code>
          </div>
        </div>
      </div>

      {/* Info Footer */}
      <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <Book className="w-5 h-5 text-blue-400 mt-0.5" />
        <div>
          <p className="text-blue-400 font-medium">Interactive Documentation</p>
          <p className="text-slate-400 text-sm mt-1">
            Click the buttons above to open the full interactive API documentation in a new tab.
            ReDoc provides a clean, three-column layout with detailed schemas and examples.
          </p>
        </div>
      </div>
    </div>
  );
}
