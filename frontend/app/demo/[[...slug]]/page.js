import AppContainer from "@/components/AppContainer";

// Demo routes (/demo, /demo/<tab>) render the same shell as /, so the path
// vocabulary Sherpa uses internally is also linkable. ViewStateProvider derives
// the starting view from the path, so these URLs open on the right tab.
export default function DemoRoute() {
  return <AppContainer />;
}
