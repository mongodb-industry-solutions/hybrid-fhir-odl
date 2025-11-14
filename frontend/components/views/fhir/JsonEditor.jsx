"use client";
import dynamic from "next/dynamic";
const Monaco = dynamic(() => import("@monaco-editor/react"), { ssr: false, loading: () => null });
export default function JsonEditor({ value, onChange, height="300px", readOnly=false }) {
  if (Monaco) {
    return (
      <div className="border border-slate-800 rounded-lg overflow-hidden">
        <Monaco
          height={height}
          language="json"
          theme="vs-dark"
          value={typeof value === "string" ? value : JSON.stringify(value, null, 2)}
          onChange={(v) => onChange && onChange(v || "")}
          options={{ readOnly, minimap: { enabled: false }, fontSize: 13 }}
        />
      </div>
    );
  }
  return (
    <pre className="bg-slate-800 text-slate-200 p-3 rounded-md text-xs overflow-auto h-[300px]">
      {typeof value === "string" ? value : JSON.stringify(value, null, 2)}
    </pre>
  );
}
