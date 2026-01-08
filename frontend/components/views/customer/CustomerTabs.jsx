"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, ServerCog, BookOpen } from "lucide-react";
import CustomerApiTester from "./CustomerApiTester";

export default function CustomerTabs() {
  return (
    <div className="p-4 bg-slate-900 rounded-xl border border-purple-800/30">
      <div className="flex items-center gap-2 mb-3">
        <Briefcase className="text-purple-400" size={18} />
        <h2 className="text-slate-200 font-semibold">Customer API Management</h2>
      </div>
      <Tabs defaultValue="api-tester" className="w-full">
        <TabsList className="bg-slate-800">
          <TabsTrigger value="api-tester" className="data-[state=active]:bg-purple-700">
            <ServerCog className="mr-2" size={14} /> API Tester
          </TabsTrigger>
          <TabsTrigger value="documentation" className="data-[state=active]:bg-purple-700">
            <BookOpen className="mr-2" size={14} /> Documentation
          </TabsTrigger>
        </TabsList>
        <TabsContent value="api-tester">
          <CustomerApiTester />
        </TabsContent>
        <TabsContent value="documentation">
          <CustomerApiDocumentation />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CustomerApiDocumentation() {
  return (
    <div className="space-y-4 text-slate-300">
      <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-lg p-6 border border-purple-500/20">
        <h3 className="text-xl font-semibold text-slate-200 mb-4">Customer API Specification</h3>
        <p className="text-slate-400 mb-4">
          This interface provides spec-compliant endpoints matching the customer's MDM Building requirements.
          All endpoints support both GET and POST methods and return data in the standardized format:
        </p>
        <pre className="bg-slate-900 rounded p-3 text-sm overflow-x-auto border border-slate-700">
{`{
  "data": [...],  // Array of records
  "count": 0      // Total count of records
}`}
        </pre>
      </div>

      <div className="grid gap-4">
        {/* PATIENT_BY_LOCAL_ID */}
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <h4 className="text-lg font-semibold text-purple-400 mb-2">1. PATIENT_BY_LOCAL_ID</h4>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium text-slate-300">MDM:</span>
              <span className="ml-2 text-slate-400">MDM_PMI_patient_api</span>
            </div>
            <div>
              <span className="font-medium text-slate-300">Endpoints:</span>
              <div className="ml-2 space-y-1 mt-1">
                <div className="bg-slate-900 rounded px-2 py-1 font-mono text-xs">
                  <span className="text-emerald-400">GET</span> /api/v1/patient/_by-local-id/
                </div>
                <div className="bg-slate-900 rounded px-2 py-1 font-mono text-xs">
                  <span className="text-blue-400">POST</span> /api/v1/patient/_by-local-id/find
                </div>
                <div className="bg-slate-900 rounded px-2 py-1 font-mono text-xs text-slate-500">
                  <span className="text-emerald-400">GET</span> /api/v1/patient/_by-hkid/ (custom)
                </div>
              </div>
            </div>
            <div>
              <span className="font-medium text-slate-300">Parameters:</span>
              <ul className="ml-2 mt-1 space-y-1 text-slate-400">
                <li>• <code className="text-purple-300">local_id</code> - Local Patient ID</li>
                <li>• <code className="text-purple-300">hkid</code> - Hong Kong ID (legacy)</li>
                <li>• <code className="text-purple-300">hospCode</code> - Hospital Code</li>
                <li>• <code className="text-purple-300">page</code> - Page number (default: 1)</li>
                <li>• <code className="text-purple-300">limit</code> - Records per page (default: 20)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* PMI_CASE_BY_LOCAL_ID */}
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <h4 className="text-lg font-semibold text-purple-400 mb-2">2. PMI_CASE_BY_LOCAL_ID</h4>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium text-slate-300">MDM:</span>
              <span className="ml-2 text-slate-400">MDM_PMI_pmi_case</span>
            </div>
            <div>
              <span className="font-medium text-slate-300">Endpoints:</span>
              <div className="ml-2 space-y-1 mt-1">
                <div className="bg-slate-900 rounded px-2 py-1 font-mono text-xs">
                  <span className="text-emerald-400">GET</span> /api/v1/pmi_case/_by-local-id/
                </div>
                <div className="bg-slate-900 rounded px-2 py-1 font-mono text-xs">
                  <span className="text-blue-400">POST</span> /api/v1/pmi_case/_by-local-id/find
                </div>
                <div className="bg-slate-900 rounded px-2 py-1 font-mono text-xs text-slate-500">
                  <span className="text-emerald-400">GET</span> /api/v1/pmi_case/_by-hkid/ (custom)
                </div>
              </div>
            </div>
            <div>
              <span className="font-medium text-slate-300">Parameters:</span>
              <ul className="ml-2 mt-1 space-y-1 text-slate-400">
                <li>• <code className="text-purple-300">local_id</code> - Local Patient ID</li>
                <li>• <code className="text-purple-300">hkid</code> - Hong Kong ID (legacy)</li>
                <li>• <code className="text-purple-300">hospCode</code> - Hospital Code</li>
                <li>• <code className="text-purple-300">patientKey</code> - Patient Key</li>
                <li>• <code className="text-purple-300">page</code> - Page number (default: 1)</li>
                <li>• <code className="text-purple-300">limit</code> - Records per page (default: 20)</li>
              </ul>
            </div>
            <div>
              <span className="font-medium text-slate-300">Description:</span>
              <p className="ml-2 mt-1 text-slate-400">
                Returns PMI cases with nested patient information included in the response.
              </p>
            </div>
          </div>
        </div>

        {/* CPI_CASE_BY_TEAM */}
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <h4 className="text-lg font-semibold text-purple-400 mb-2">3. CPI_CASE_BY_TEAM</h4>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium text-slate-300">MDM:</span>
              <span className="ml-2 text-slate-400">MDM_PI_cpi_case</span>
            </div>
            <div>
              <span className="font-medium text-slate-300">Endpoints:</span>
              <div className="ml-2 space-y-1 mt-1">
                <div className="bg-slate-900 rounded px-2 py-1 font-mono text-xs">
                  <span className="text-emerald-400">GET</span> /api/v1/cpi_case/_by-team/
                </div>
                <div className="bg-slate-900 rounded px-2 py-1 font-mono text-xs">
                  <span className="text-blue-400">POST</span> /api/v1/cpi_case/_by-team/find
                </div>
              </div>
            </div>
            <div>
              <span className="font-medium text-slate-300">Parameters:</span>
              <ul className="ml-2 mt-1 space-y-1 text-slate-400">
                <li>• <code className="text-purple-300">hospCode</code> - Hospital Code <span className="text-red-400">(Required)</span></li>
                <li>• <code className="text-purple-300">wardCode</code> - Ward Code</li>
                <li>• <code className="text-purple-300">specCode</code> - Specialty Code</li>
                <li>• <code className="text-purple-300">teamCode</code> - Team Code</li>
                <li>• <code className="text-purple-300">statusCode</code> - Status Code</li>
                <li>• <code className="text-purple-300">caseType</code> - Case Type</li>
                <li>• <code className="text-purple-300">page</code> - Page number (default: 1)</li>
                <li>• <code className="text-purple-300">limit</code> - Records per page (default: 20)</li>
              </ul>
            </div>
            <div>
              <span className="font-medium text-slate-300">Description:</span>
              <p className="ml-2 mt-1 text-slate-400">
                Returns CPI cases with nested cpiPatient and dischargeInformation data.
              </p>
            </div>
          </div>
        </div>

        {/* CPI_CASE_BY_MO */}
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <h4 className="text-lg font-semibold text-purple-400 mb-2">4. CPI_CASE_BY_MO</h4>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium text-slate-300">MDM:</span>
              <span className="ml-2 text-slate-400">MDM_PI_cpi_case</span>
            </div>
            <div>
              <span className="font-medium text-slate-300">Endpoints:</span>
              <div className="ml-2 space-y-1 mt-1">
                <div className="bg-slate-900 rounded px-2 py-1 font-mono text-xs">
                  <span className="text-emerald-400">GET</span> /api/v1/cpi_case/_by-mo/
                </div>
                <div className="bg-slate-900 rounded px-2 py-1 font-mono text-xs">
                  <span className="text-blue-400">POST</span> /api/v1/cpi_case/_by-mo/find
                </div>
              </div>
            </div>
            <div>
              <span className="font-medium text-slate-300">Parameters:</span>
              <ul className="ml-2 mt-1 space-y-1 text-slate-400">
                <li>• <code className="text-purple-300">hospCode</code> - Hospital Code <span className="text-red-400">(Required)</span></li>
                <li>• <code className="text-purple-300">doctorCode</code> - Doctor Code</li>
                <li>• <code className="text-purple-300">specialistCode</code> - Specialist Code</li>
                <li>• <code className="text-purple-300">statusCode</code> - Status Code (default: "AC")</li>
                <li>• <code className="text-purple-300">caseType</code> - Array of case types (default: ["I","A"])</li>
                <li>• <code className="text-purple-300">page</code> - Page number (default: 1)</li>
                <li>• <code className="text-purple-300">limit</code> - Records per page (default: 20)</li>
              </ul>
            </div>
            <div>
              <span className="font-medium text-slate-300">Description:</span>
              <p className="ml-2 mt-1 text-slate-400">
                Returns CPI cases filtered by medical officer with nested cpiPatient and dischargeInformation data.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mt-6">
        <h4 className="text-sm font-semibold text-blue-400 mb-2">Integration Notes</h4>
        <ul className="text-sm text-slate-400 space-y-1">
          <li>• All endpoints support both GET and POST methods as per customer spec</li>
          <li>• Response format is standardized with <code className="text-purple-300">data</code> array and <code className="text-purple-300">count</code> field</li>
          <li>• Nested objects (patient, cpiPatient, dischargeInformation) are populated automatically</li>
          <li>• Pagination is supported via <code className="text-purple-300">page</code> and <code className="text-purple-300">limit</code> parameters</li>
          <li>• Data is mapped from FHIR resources to MDM format via the <code className="text-purple-300">app</code> envelope</li>
        </ul>
      </div>
    </div>
  );
}
