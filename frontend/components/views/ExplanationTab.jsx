"use client";

import React from "react";
import { Book, HelpCircle, GitCompare, Beaker, FileJson2, Briefcase, ServerCog } from "lucide-react";

const ExplanationTab = () => {
  const tabExplanations = [
    {
      icon: <GitCompare className="text-blue-400" size={20} />,
      title: "FHIR Mappings Tab",
      description: "View and understand FHIR-to-legacy field mappings for clinical data interoperability",
      features: [
        "View comprehensive FHIR-to-customer field mapping documentation",
        "Download interoperability mapping files in CSV format", 
        "Understand clinical data transformation rules and where each piece of information is located in the new FHIR envelope model",
        "See how standard FHIR resources map to legacy MDM requirements"
      ],
      usage: "Essential for understanding how standardized FHIR clinical data transforms into legacy system formats for seamless interoperability. Use this tab to guide your data integration and ensure all necessary clinical information is accurately mapped.",
      navigationGuide: "This tab is organized into comprehensive documentation sections that showcase how FHIR clinical data maps to legacy system formats. The interface provides both browsable documentation and downloadable resources for integration teams. **Mapping Area**: Browse through organized sections showing field mappings for each FHIR resource type. For each field of each resource you will find a semantic description, the bucket in which it is being located in the FHIR envelope pattern, the path to find it inside the new documents and how it was altered to be included in it. **Download Section**: Use the download button to get CSV files with the mapping details."},
    {
      icon: <Beaker className="text-green-400" size={20} />,
      title: "Synthetic Clinical Data Tab", 
      description: "Generate synthetic clinical data for development and testing",
      features: [
        "Generate realistic synthetic Patient, Encounter, Care Team and Practitioner FHIR resources following the FHIR first approach defined in the mapping documentation",
        "Customize clinical data generation parameters",
        "Preview clinical data before saving",
        "Bulk generate multiple clinical records for testing scenarios"
      ],
      usage: "Essential for creating realistic, clinical test data without using real patient information. Use this tab for development and compliance testing of your FHIR-based healthcare integrations.",
      navigationGuide: "This tab features a intuitive interface designed for efficient synthetic data generation. This section allows you to choose the amount of resources you want to create from each type and check the operation has been succesfully completed when populating the database. It also includes a wiping functionality so that you can clear all generated data easily and repopulate as many times as needed. **Resource Selection**: Choose the type of FHIR resource to generate and include the amount of entities you want to create for each of them on its designated input field. **Action Buttons**: Use 'Generate' to create new data and 'Wipe Tenant' to clear all existing synthetic data from the system in that specific tenant."
    },
    {
      icon: <FileJson2 className="text-yellow-400" size={20} />,
      title: "Clinical Data Viewer Tab",
      description: "Browse and inspect FHIR clinical resources stored in your healthcare data repository", 
      features: [
        "Search through all the synthetic clinical data resources that have been created and stored",
        "Filter clinical data by various healthcare criteria",
        "View detailed FHIR JSON structure and clinical elements of each resource once you click the Open button. Make sure to check the bottom part of the tab to see all resource details!", 
      ],
      usage: "Critical for examining stored clinical data, validating FHIR resource integrity, and monitoring your healthcare data quality. Use this tab to ensure your FHIR resources are correctly formatted and contain the expected clinical information.",
      navigationGuide: "This tab uses a layered approach with search controls at the top, a scrollable resource list on the left top corner, and an expandable detail panel at the bottom. This design allows efficient browsing through large datasets while providing detailed inspection capabilities. **Search & Filter Bar**: Use the top section to search and filter resources by local ID, Case Number, or other criteria. **Resource List**: Browse through the top left section showing all available resources from which to search (Patients,Practitioners ... ). **Detailed View**: Click the 'Open' button on any resource to expand the bottom panel. **Bottom Panel**: Scroll down to see complete resource details in both formatted and JSON views."
    },
    {
      icon: <Briefcase className="text-purple-400" size={20} />,
      title: "Legacy Integration APIs Tab",
      description: "Test and interact with legacy healthcare system API endpoints using clinical parameters",
      features: [
        "Test legacy system API endpoints with clinical parameters",
        "View legacy API documentation and healthcare specifications",
        "Execute real integration calls and validate responses"
      ],
      usage: "Essential for testing FHIR-to-legacy integrations and ensuring clinical data flows correctly between modern FHIR systems and existing healthcare infrastructure.",
      navigationGuide: "This tab provides a comprehensive API testing environment with dual functionality - both interactive testing and detailed documentation. The interface splits into distinct sections for efficient workflow between testing endpoints and referencing specifications. **API Tester Section**: Use the main panel to select the specific endpoint and the method (POST or GET) to use. **Documentation Tab**: Switch to the documentation tab for detailed API specifications and examples. This section will be very valuable when trying to understand how each endpoint works. **Parameter Forms**: Fill in required fields with clinical data to test different scenarios.If you don't have an specific resource in mind, try our 'Load Preset' functionality, which will allow you to do a quick search based on preset parameters. Then, use the 'Execute Request' button to send your request and get the results. **Response Panel**: Check the bottom part of the tab for API responses and validation results."
    },
    {
      icon: <ServerCog className="text-indigo-400" size={20} />,
      title: "FHIR Clinical API Tab", 
      description: "Direct interface to test FHIR clinical API endpoints",
      features: [
        "Execute standard FHIR API operations (GET, POST, PUT, DELETE)",
        "Test clinical resource creation, updates, and search queries",
        "Real-time clinical API response inspection and validation"
      ],
      usage: "Your primary tool for testing FHIR clinical operations and ensuring your healthcare data management is aligned with the standards.",
      navigationGuide: "This tab follows a structured workflow approach for FHIR API testing, guiding you from operation selection through execution to results analysis. Each section builds upon the previous one to ensure comprehensive API validation. **FHIR Search Selector**: Choose between accelerated and canonical search for your next query. **Resource Configuration**: Select FHIR resource type to search for from the dropdown on the right. **Sample Filtering Section**: If you don't want to fill in all the filters and parameters for a query, feel free to try any of the preset filtering examples we share. These are divided by query type (basic, demographic, combined, etc.). **Search Parameter Section**: If, on the other hand, you want full control over your search parameters, use the form fields provided to specify every constraint you can think of. **Execute & Results**: Use the 'Execute' button and view responses in the results panel below.This results panel will show you the complete MongoDB pipeline based on your query parameters as well as the JSON response returned by the API."
    },
    {
      icon: <Book className="text-orange-400" size={20} />,
      title: "Healthcare API Documentation Tab",
      description: "Comprehensive documentation for FHIR and healthcare integration APIs",
      features: [
        "Complete FHIR API and legacy endpoint reference documentation",
        "Interactive healthcare API exploration",
        "Clinical integration code examples and patterns", 
        "Healthcare security and authorization guides"
      ],
      usage: "Your comprehensive reference for understanding FHIR endpoints, clinical data parameters, and healthcare interoperability patterns.",
      navigationGuide: "This tab features a comprehensive documentation system with hierarchical navigation, interactive examples, and integrated testing capabilities. The layout maximizes both browsing efficiency and hands-on learning through embedded tools. **Documentation Tiles**: Choose from the 3 available documentation tiles, each of them targeting one of the main API implemented in this data manager. **Documentation Content**: Click the 'View Docs' button and read a extremely detailed documentation with examples in the main content section. **Interactive Examples**: In the bottom part of these documentation files, you will be able to try live API calls directly from the documentation using embedded testing tools. **Search Function**: Use the search bar inside the specific documentation to quickly find endpoints or topics."
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center border-b border-slate-700 pb-6">
        <div className="flex items-center justify-center gap-2 mb-3">
          <HelpCircle className="text-blue-400" size={24} />
          <h1 className="text-2xl font-bold text-slate-200">FHIR Data Manager Guide</h1>
        </div>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Welcome to your FHIR-first healthcare data management system. This comprehensive guide explains 
          each tool and how to effectively use them for clinical data integration and interoperability.
        </p>
      </div>

      {/* Getting Started */}
      <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg p-6 border border-blue-500/20">
        <h2 className="text-xl font-semibold text-slate-200 mb-3 flex items-center gap-2">
          <Book className="text-blue-400" size={20} />
          Getting Started
        </h2>
        <div className="space-y-3 text-slate-300">
          <p>
            This FHIR-first data manager provides specialized tools for clinical data integration, 
            emphasizing FHIR (Fast Healthcare Interoperability Resources) standards while supporting 
            legacy customer API integrations for seamless healthcare interoperability.
          </p>
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div className="bg-slate-800/50 rounded p-4">
              <h3 className="font-medium text-slate-200 mb-2">For Healthcare Developers</h3>
              <p className="text-sm text-slate-400">
                Leverage FHIR API testing, synthetic clinical data generation, and interoperability 
                documentation to build robust healthcare integrations.
              </p>
            </div>
            <div className="bg-slate-800/50 rounded p-4">
              <h3 className="font-medium text-slate-200 mb-2">For Clinical Data Analysts</h3>
              <p className="text-sm text-slate-400">
                Explore FHIR resource structures, clinical data mappings, and healthcare record 
                transformations to understand data flows and quality.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Explanations */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-slate-200 border-b border-slate-700 pb-2">
          Tab-by-Tab Guide
        </h2>
        
        <div className="grid gap-6 lg:grid-cols-2">
          {tabExplanations.map((tab, index) => (
            <div key={index} className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                {tab.icon}
                <h3 className="text-lg font-semibold text-slate-200">{tab.title}</h3>
              </div>
              
              <p className="text-slate-400 mb-4">{tab.description}</p>
              
              <div className="space-y-3">
                <h4 className="font-medium text-slate-300">Key Features:</h4>
                <ul className="space-y-1">
                  {tab.features.map((feature, idx) => (
                    <li key={idx} className="text-sm text-slate-400 flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              
              {tab.navigationGuide && (
                <div className="mt-4 p-4 bg-gradient-to-r from-blue-900/30 to-indigo-900/30 rounded-lg border border-blue-400/30">
                  <h4 className="font-semibold text-blue-200 text-sm mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                    Navigation Guide
                  </h4>
                  <div className="grid gap-3">
                    {(() => {
                      const parts = tab.navigationGuide.split('. **');
                      const initialDescription = parts[0];
                      const sections = parts.slice(1);
                      
                      return (
                        <>
                          {/* Initial Description */}
                          <div className="mb-4 pb-3 border-b border-blue-400/20">
                            <p className="text-sm text-blue-100 leading-relaxed italic">{initialDescription}</p>
                          </div>
                          
                          {/* Numbered Steps */}
                          {sections.map((section, idx) => {
                            const [title, ...contentParts] = section.split('**: ');
                            const content = contentParts.join('**: ').replace(/\.$/, '');
                            return (
                              <div key={idx} className="flex items-start gap-3 bg-blue-950/40 rounded p-3 border border-blue-500/20">
                                <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-medium mt-0.5">
                                  {idx + 1}
                                </div>
                                <div>
                                  <h5 className="font-medium text-blue-100 text-xs mb-1">{title}</h5>
                                  <p className="text-xs text-blue-200/80 leading-relaxed">{content}</p>
                                </div>
                              </div>
                            );
                          })}
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}
              
              <div className="mt-4 p-3 bg-slate-900 rounded border border-slate-700">
                <h4 className="font-medium text-slate-300 text-sm mb-1">When to use:</h4>
                <p className="text-xs text-slate-400">{tab.usage}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Workflow Section */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h2 className="text-xl font-semibold text-slate-200 mb-4">Clinical Data Management Workflow</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">1</span>
            <div>
              <h3 className="font-medium text-slate-300">Start with Healthcare Documentation</h3>
              <p className="text-sm text-slate-400">Review the Healthcare API Documentation to understand FHIR endpoints and clinical data structures.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">2</span>
            <div>
              <h3 className="font-medium text-slate-300">Understand FHIR Mappings</h3>
              <p className="text-sm text-slate-400">Check the FHIR Mappings tab to see how clinical data transforms between FHIR standards and legacy formats.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">3</span>
            <div>
              <h3 className="font-medium text-slate-300">Generate Clinical Test Data</h3>
              <p className="text-sm text-slate-400">Use the Synthetic Clinical Data tab to create test data for development and testing.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">4</span>
            <div>
              <h3 className="font-medium text-slate-300">Test Healthcare APIs</h3>
              <p className="text-sm text-slate-400">Use both FHIR Clinical API and Legacy Integration APIs tabs to validate clinical data flows and responses.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">5</span>
            <div>
              <h3 className="font-medium text-slate-300">Monitor Clinical Data</h3>
              <p className="text-sm text-slate-400">Use the Clinical Data Viewer tab to inspect stored FHIR resources and verify healthcare integration results.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tips Section */}
      {/* <div className="bg-gradient-to-r from-emerald-900/20 to-teal-900/20 rounded-lg p-6 border border-emerald-500/20">
        <h2 className="text-xl font-semibold text-slate-200 mb-4">Clinical Data Management Pro Tips</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="font-medium text-emerald-400">FHIR Best Practices</h3>
            <ul className="space-y-1 text-sm text-slate-400">
              <li>• Always validate FHIR R4 resources for clinical compliance</li>
              <li>• Use synthetic clinical data for HIPAA-safe development</li>
              <li>• Check FHIR mappings when clinical data seems incorrect</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium text-emerald-400">Healthcare API Testing</h3>
            <ul className="space-y-1 text-sm text-slate-400">
              <li>• Test with various clinical parameter combinations</li>
              <li>• Verify FHIR response formats match healthcare standards</li>
              <li>• Test both FHIR and legacy endpoints for full coverage</li>
            </ul>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default ExplanationTab;