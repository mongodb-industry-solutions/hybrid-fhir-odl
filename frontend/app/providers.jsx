"use client";

import dynamic from "next/dynamic";
import { ViewStateProvider } from "@/components/demoSherpa/viewState";

// Sherpa mounts client-side only: it uses window and a react-router MemoryRouter,
// neither of which belongs in a prerender. The catch() keeps the demo usable if
// the demo-sherpa package is missing from a build (fail open, never fail closed).
const HybridFhirDemoSherpa = dynamic(
  () =>
    import("@/components/demoSherpa/HybridFhirDemoSherpa").catch(() => ({
      default: () => null,
    })),
  { ssr: false }
);

export default function Providers({ children }) {
  return (
    <ViewStateProvider>
      {children}
      <HybridFhirDemoSherpa />
    </ViewStateProvider>
  );
}
