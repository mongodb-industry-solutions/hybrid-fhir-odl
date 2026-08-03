"use client";

// Demo Sherpa integration for the Hybrid FHIR ODL demo.
//
// Sherpa components must render inside a react-router context, and this app has
// no router of its own. We mount a MemoryRouter here and bridge it to the host's
// internal view state (see ./viewState): host view changes move the router so
// Sherpa can capture them, and Sherpa-driven navigation during journey playback
// flips the host view.
//
// MemoryRouter, not BrowserRouter: Next's App Router patches window.history, so a
// BrowserRouter navigate() triggers a Next router update, which re-renders the
// tree and feeds straight back into the sync effects below — "Maximum update
// depth exceeded". MemoryRouter keeps its location off window entirely, so the
// two routers never contend. Next still owns the real URL.
//
// Loaded through next/dynamic({ ssr: false }) from app/providers.jsx, because
// Sherpa reads window during render.

import React from "react";
import { MemoryRouter, useLocation, useNavigate } from "react-router-dom";
import { DemoSherpaGuide, DemoSherpaCaptureBridge } from "demo-sherpa";
import { getRouteTalkTrackBundle } from "./talkTracks";
import { pathToView, viewToPath, useViewState } from "./viewState";

const parseBooleanFlag = (value, fallback = true) => {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized) return fallback;
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return fallback;
};

const parseNumberOrFallback = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseList = (value) =>
  String(value || "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

const sherpaEnabled = parseBooleanFlag(process.env.NEXT_PUBLIC_SHERPA_ENABLED, true);

// Empty string keeps Sherpa in browser-local mode: journeys live in browser
// storage and no catalog backend is required to run the demo.
const sherpaCatalogApiBaseUrl = process.env.NEXT_PUBLIC_SHERPA_CATALOG_API_URL || "";

// Sherpa is presenter tooling; a failure in it must never take down the demo.
class SherpaErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error("Demo Sherpa failed during render. Continuing without it.", error);
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

// Two-way sync between the host view state and the MemoryRouter location.
//
// Each effect watches exactly one thing and depends on nothing else, so neither
// can re-fire as a side effect of the other's write. The current location and
// navigate are read through refs: comparing values before writing is not enough
// on its own, because useNavigate() returns a fresh function identity after every
// navigation, and location in a dependency array re-runs the view effect on every
// move. Either one turns this into "Maximum update depth exceeded".
//
// Convergence: a location change sets the view derived from that same location,
// so the view effect then finds the router already correct and does nothing. A
// view change navigates once, and the resulting location maps back to the same
// view, so setView is a no-op. Both directions settle in one pass.
function RouteSync() {
  const { view, setView } = useViewState();
  const location = useLocation();
  const navigate = useNavigate();

  const navigateRef = React.useRef(navigate);
  navigateRef.current = navigate;

  const locationRef = React.useRef(location);
  locationRef.current = location;

  // Host view changed (presenter clicked a tab) -> move the router so Sherpa
  // resolves the right talk track and records the right path.
  React.useEffect(() => {
    const targetPath = viewToPath(view);
    if (locationRef.current.pathname !== targetPath) {
      navigateRef.current(targetPath, { replace: true });
    }
  }, [view]);

  // Sherpa navigated (journey playback) -> move the host view. Paths outside this
  // app's vocabulary are left untouched: during playback Sherpa may visit a path
  // recorded elsewhere, and yanking the router back would fight it.
  React.useEffect(() => {
    const nextView = pathToView(location.pathname);
    if (nextView === null) return;
    setView((current) => (current === nextView ? current : nextView));
  }, [location.pathname, setView]);

  // Mirror the router path into the address bar. Sherpa verifies every replayed
  // navigation with a url-includes check against window.location (see replay.js),
  // so a path that only exists inside MemoryRouter fails playback with "Flow Lost".
  //
  // replaceState, not push: playback should not fill the back button with steps.
  // The existing history state object is passed through so Next's App Router keeps
  // its own tree state and does not treat this as a fresh navigation.
  //
  // Only paths this app owns are mirrored. Journey data can arrive from the shared
  // catalog API, and a step path such as "//evil.example.com/x" is read as
  // protocol-relative: replaceState then throws SecurityError, which the boundary
  // below catches and takes Sherpa down for the rest of the session. Allowlisting
  // via pathToView removes that whole class -- an unrenderable foreign path now
  // just fails its own verification instead of killing the guide.
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (pathToView(location.pathname) === null) return;
    if (!location.pathname.startsWith("/") || location.pathname.startsWith("//")) return;
    if (window.location.pathname === location.pathname) return;
    window.history.replaceState(
      window.history.state,
      "",
      location.pathname + window.location.search
    );
  }, [location.pathname]);

  return null;
}

export default function HybridFhirDemoSherpa() {
  const { view } = useViewState();
  // Only the router's starting entry; RouteSync owns it from then on.
  const initialEntries = React.useMemo(() => [viewToPath(view)], []); // eslint-disable-line react-hooks/exhaustive-deps

  const overviewSections = React.useMemo(
    () => [
      { id: "narration", label: "Narration" },
      { id: "step-outline", label: "Walkthrough" },
      { id: "why-mongo", label: "Why MongoDB", legacyItemsKey: "whyMongo", renderMode: "list" },
    ],
    []
  );

  // Default top clears this app's 80px header, so Sherpa does not sit on top of
  // the guide toggle and status pill. The presenter can still drag it anywhere.
  const defaultPosition = React.useMemo(
    () => ({
      right: parseNumberOrFallback(process.env.NEXT_PUBLIC_SHERPA_DEFAULT_RIGHT, 16),
      top: parseNumberOrFallback(process.env.NEXT_PUBLIC_SHERPA_DEFAULT_TOP, 96),
    }),
    []
  );

  const currentUser = React.useMemo(
    () => ({
      id: process.env.NEXT_PUBLIC_SHERPA_USER_ID || "",
      name: process.env.NEXT_PUBLIC_SHERPA_USER_NAME || "",
      email: process.env.NEXT_PUBLIC_SHERPA_USER_EMAIL || "",
      roles: parseList(process.env.NEXT_PUBLIC_SHERPA_ROLES),
    }),
    []
  );

  const demoContext = React.useMemo(
    () => ({
      projectSlug: process.env.NEXT_PUBLIC_SHERPA_PROJECT_SLUG || "ist-demos",
      projectName: process.env.NEXT_PUBLIC_SHERPA_PROJECT_NAME || "IST Demos",
      demoSlug: process.env.NEXT_PUBLIC_SHERPA_DEMO_SLUG || "hybrid-fhir-odl",
      demoName: process.env.NEXT_PUBLIC_SHERPA_DEMO_NAME || "Hybrid FHIR ODL",
      demoDescription:
        process.env.NEXT_PUBLIC_SHERPA_DEMO_DESCRIPTION ||
        "MongoDB Atlas as a hybrid Operational Data Layer serving both FHIR and purpose-built customer APIs from one copy of the data.",
    }),
    []
  );

  if (!sherpaEnabled) return null;

  return (
    <SherpaErrorBoundary>
      <MemoryRouter initialEntries={initialEntries}>
        <RouteSync />
        <DemoSherpaCaptureBridge />
        <DemoSherpaGuide
          enabled
          title={process.env.NEXT_PUBLIC_SHERPA_TITLE || "Demo Sherpa"}
          studioTitle={process.env.NEXT_PUBLIC_SHERPA_STUDIO_TITLE || "Demo Sherpa Studio"}
          routeContextResolver={getRouteTalkTrackBundle}
          playerLogoSrc={process.env.NEXT_PUBLIC_SHERPA_PLAYER_LOGO_URL || "/fhir-icon.svg"}
          assistantLogoSrc={process.env.NEXT_PUBLIC_SHERPA_ASSISTANT_LOGO_URL || ""}
          catalogApiBaseUrl={sherpaCatalogApiBaseUrl}
          currentUser={currentUser}
          projectOwnerEmails={parseList(process.env.NEXT_PUBLIC_SHERPA_PROJECT_OWNER_EMAILS)}
          overviewSections={overviewSections}
          defaultPosition={defaultPosition}
          demoContext={demoContext}
        />
      </MemoryRouter>
    </SherpaErrorBoundary>
  );
}
