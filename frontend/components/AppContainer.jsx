"use client";

import React from "react";
import FhirTabs from "./views/fhir/FhirTabs";
import CobrandedLogo from "./CobrandedLogo";

const AppContainer = () => {
  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <CobrandedLogo size="lg" />
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-emerald-400">Backend Connected</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <FhirTabs />
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 pb-8 border-t border-slate-700 pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-4">
            <CobrandedLogo size="sm" className="opacity-70" />
            <p className="text-center text-sm text-slate-500">
              Hybrid FHIR & Customer API Platform • MongoDB + FastAPI + React
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AppContainer;
