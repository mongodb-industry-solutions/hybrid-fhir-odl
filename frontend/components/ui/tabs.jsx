"use client";

import * as React from "react";

const TabsContext = React.createContext({});

export function Tabs({ children, defaultValue, value, onValueChange, className = "" }) {
  const [selectedValue, setSelectedValue] = React.useState(defaultValue || value);

  const handleValueChange = (newValue) => {
    setSelectedValue(newValue);
    if (onValueChange) {
      onValueChange(newValue);
    }
  };

  React.useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
    }
  }, [value]);

  return (
    <TabsContext.Provider value={{ value: selectedValue, onValueChange: handleValueChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className = "" }) {
  return (
    <div className={`inline-flex h-10 items-center justify-center rounded-lg bg-slate-800 p-1 text-slate-400 ${className}`}>
      {children}
    </div>
  );
}

export function TabsTrigger({ children, value, className = "" }) {
  const context = React.useContext(TabsContext);
  const isActive = context.value === value;

  return (
    <button
      onClick={() => context.onValueChange(value)}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
        isActive
          ? "bg-primary text-primary-text shadow-sm"
          : "text-slate-400 hover:bg-slate-700 hover:text-white"
      } ${className}`}
    >
      {children}
    </button>
  );
}

export function TabsContent({ children, value, className = "" }) {
  const context = React.useContext(TabsContext);

  if (context.value !== value) {
    return null;
  }

  return <div className={className}>{children}</div>;
}
