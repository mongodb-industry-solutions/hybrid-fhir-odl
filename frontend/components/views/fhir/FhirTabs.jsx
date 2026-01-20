"use client";

import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, Beaker, FileJson2, ServerCog, Book, GitCompare, Briefcase } from "lucide-react";
import FhirSyntheticPanel from "./FhirSyntheticPanel";
import FhirResourceBrowser from "./FhirResourceBrowser";
import CustomerTabs from "../customer/CustomerTabs";
import FhirApiTester from "./FhirApiTester";
import FhirApiDocs from "./FhirApiDocs";
import MappingShowcase from "./MappingShowcase";

export default function FhirTabs() {
  const [enabled, setEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState("mappings");
  
  useEffect(() => {
    const flag = process.env.NEXT_PUBLIC_ENABLE_FHIR;
    setEnabled(flag === undefined ? true : flag === "true");
  }, []);
  
  const handleTabChange = (tabValue) => {
    setActiveTab(tabValue);
  };
  
  if (!enabled) return null;
  return (
    <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
      <div className="flex items-center gap-2 mb-3">
        <Database className="text-blue-400" size={18} />
        <h2 className="text-slate-200 font-semibold">Hybrid FHIR ODL</h2>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-800">
          <TabsTrigger value="mappings" className="data-[state=active]:bg-slate-700">
            <GitCompare className="mr-2" size={14} /> Mappings
          </TabsTrigger>
          <TabsTrigger value="synthetic" className="data-[state=active]:bg-slate-700">
            <Beaker className="mr-2" size={14} /> Synthetic Data
          </TabsTrigger>
          <TabsTrigger value="resources" className="data-[state=active]:bg-slate-700">
            <FileJson2 className="mr-2" size={14} /> Data Viewer
          </TabsTrigger>
          <TabsTrigger value="customer" className="data-[state=active]:bg-purple-700">
            <Briefcase className="mr-2" size={14} /> Customer APIs
          </TabsTrigger>
          <TabsTrigger value="fhir-api" className="data-[state=active]:bg-slate-700">
            <ServerCog className="mr-2" size={14} /> FHIR API
          </TabsTrigger>
          <TabsTrigger value="docs" className="data-[state=active]:bg-slate-700">
            <Book className="mr-2" size={14} /> API Docs
          </TabsTrigger>
        </TabsList>
        <TabsContent value="mappings"><MappingShowcase /></TabsContent>
        <TabsContent value="synthetic"><FhirSyntheticPanel /></TabsContent>
        <TabsContent value="resources"><FhirResourceBrowser /></TabsContent>
        <TabsContent value="customer"><CustomerTabs onTabChange={handleTabChange} /></TabsContent>
        <TabsContent value="fhir-api"><FhirApiTester onTabChange={handleTabChange} /></TabsContent>
        <TabsContent value="docs"><FhirApiDocs /></TabsContent>
      </Tabs>
    </div>
  );
}
