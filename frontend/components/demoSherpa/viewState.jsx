"use client";

// Demo Sherpa needs stable, addressable "routes" to hang talk tracks off and to
// replay during a guided journey. This app is a single Next.js page driven by
// internal view state (guide vs. demo, plus the active FHIR tab), so instead of
// rewriting it as a routed app we define a path vocabulary for those views and
// keep the host's view state as the single source of truth.
//
// Those paths live in Sherpa's MemoryRouter, not the address bar — Next owns the
// real URL (see HybridFhirDemoSherpa). The URL is still read once on load, so
// /demo/<tab> deep links and refreshes land on the right view.
//
// See demo-sherpa README, "Next.js And Internal-View Apps".

import React from "react";
import { usePathname } from "next/navigation";

export const DEMO_TABS = [
  "mappings",
  "synthetic",
  "resources",
  "customer",
  "fhir-api",
  "docs",
];

export const DEFAULT_TAB = "mappings";
export const GUIDE_VIEW = "guide";

/** Internal view id -> Sherpa-visible browser path. */
export const viewToPath = (view) => {
  if (!view || view === GUIDE_VIEW) return "/";
  if (!view.startsWith("demo:")) return "/";
  const tab = view.slice("demo:".length);
  return `/demo/${encodeURIComponent(DEMO_TABS.includes(tab) ? tab : DEFAULT_TAB)}`;
};

/**
 * Path -> internal view id, or null if the path is not one this app owns.
 *
 * Returning null matters during journey playback: Sherpa may navigate to a path
 * recorded elsewhere, and the sync bridge must leave those alone rather than
 * forcing the router back to a view of ours, which would fight playback.
 */
export const pathToView = (pathname) => {
  const parts = String(pathname || "/").split("/").filter(Boolean);
  if (parts.length === 0) return GUIDE_VIEW;
  if (parts[0] !== "demo" || parts.length > 2) return null;
  if (parts.length === 1) return `demo:${DEFAULT_TAB}`;
  let tab;
  try {
    tab = decodeURIComponent(parts[1]);
  } catch {
    return null;
  }
  return DEMO_TABS.includes(tab) ? `demo:${tab}` : null;
};

/** Same, but total: used for the first render, where we must pick something. */
export const initialViewFromPath = (pathname) => pathToView(pathname) || GUIDE_VIEW;

const ViewStateContext = React.createContext(null);

export function ViewStateProvider({ children }) {
  // Derive the first view from the URL Next.js actually served, so a refresh or
  // a shared link lands on the same screen. After that this state is authoritative
  // and the Sherpa router bridge follows it.
  const initialPathname = usePathname();
  const [view, setView] = React.useState(() => initialViewFromPath(initialPathname));

  const value = React.useMemo(() => {
    const showingGuide = view === GUIDE_VIEW;
    return {
      view,
      setView,
      showingGuide,
      activeTab: showingGuide ? DEFAULT_TAB : view.slice("demo:".length),
      showGuide: () => setView(GUIDE_VIEW),
      showDemo: (tab = DEFAULT_TAB) => setView(`demo:${tab}`),
      setActiveTab: (tab) => setView(`demo:${tab}`),
      toggleGuide: () => setView((current) => (current === GUIDE_VIEW ? `demo:${DEFAULT_TAB}` : GUIDE_VIEW)),
    };
  }, [view]);

  return <ViewStateContext.Provider value={value}>{children}</ViewStateContext.Provider>;
}

export function useViewState() {
  const context = React.useContext(ViewStateContext);
  if (!context) {
    throw new Error("useViewState must be used inside <ViewStateProvider>");
  }
  return context;
}
