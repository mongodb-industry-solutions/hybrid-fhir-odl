"use client";

import React, { useState, useEffect } from "react";
import FhirTabs from "./views/fhir/FhirTabs";
import CobrandedLogo from "./CobrandedLogo";
import ExplanationTab from "./views/ExplanationTab";
import { Info, X, ArrowUp } from "lucide-react";
import { useViewState } from "./demoSherpa/viewState";

const AppContainer = () => {
  // Guide-vs-demo and the active tab live in shared view state so Demo Sherpa can
  // address them as routes and replay them during a journey.
  const { showingGuide: showHelp, activeTab, setActiveTab, toggleGuide, showDemo } = useViewState();
  const [showNotification, setShowNotification] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleCloseHelp = () => {
    setIsTransitioning(true);
    // Start the guide fade-out
    setTimeout(() => {
      showDemo();
      setShowNotification(true);
      setIsTransitioning(false);
    }, 300); // Wait for fade-out animation

    // Auto-hide notification after 5 seconds
    setTimeout(() => setShowNotification(false), 5300);
  };

  const handleToggleView = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      toggleGuide();
      setIsTransitioning(false);
    }, 300); // Wait for fade-out animation
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <CobrandedLogo size="lg" datalabOnly />
            <div className="flex items-center gap-4">
              <button
                onClick={handleToggleView}
                className={`flex items-center gap-2 px-4 py-2 ${
                  showHelp 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white rounded-lg transition-colors duration-200`}
              >
                <Info size={16} />
                <span className="text-sm font-medium">
                  {showHelp ? 'Go Back to Demo' : 'Hybrid FHIR ODL Guide'}
                </span>
              </button>
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
        {/* Notification Banner */}
        {showNotification && !showHelp && (
          <div className="mb-6 bg-gradient-to-r from-blue-900/80 to-indigo-900/80 border border-blue-500/30 rounded-lg p-4 shadow-lg backdrop-blur-sm animate-in slide-in-from-top-2 fade-in duration-700 ease-out">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 p-2 bg-blue-500/20 rounded-lg animate-in zoom-in-50 duration-500 delay-200">
                  <Info className="text-blue-400" size={20} />
                </div>
                <div className="animate-in slide-in-from-left-2 duration-500 delay-100">
                  <h3 className="font-medium text-blue-100">Guide Closed Successfully</h3>
                  <p className="text-sm text-blue-200/80">
                    You can reopen the Hybrid FHIR ODL Guide anytime by clicking the 
                    <span className="inline-flex items-center mx-2 px-2 py-1 bg-blue-600/50 rounded text-xs font-medium animate-pulse">
                      <ArrowUp size={12} className="mr-1" /> Hybrid FHIR ODL Guide
                    </span>
                    button in the header above.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowNotification(false)}
                className="flex-shrink-0 p-1 hover:bg-blue-500/20 rounded transition-all duration-200 hover:scale-110 animate-in zoom-in duration-500 delay-300"
              >
                <X size={16} className="text-blue-300" />
              </button>
            </div>
          </div>
        )}

        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          {showHelp ? (
            <div className={`relative transition-all duration-300 ease-in-out ${
              isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
            }`}>
              <ExplanationTab />
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out">
              <FhirTabs activeTab={activeTab} onActiveTabChange={setActiveTab} />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 pb-8 border-t border-slate-700 pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-4">
            <CobrandedLogo size="sm" className="opacity-70" datalabOnly />
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
