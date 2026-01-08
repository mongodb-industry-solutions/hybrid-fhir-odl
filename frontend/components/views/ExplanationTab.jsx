"use client";

import React, { useState } from "react";
import { Book, Info, GitCompare, Beaker, FileJson2, Briefcase, ServerCog, ChevronDown, ChevronRight, Target, Users, Lightbulb } from "lucide-react";

const ExplanationTab = () => {
  const [openSection, setOpenSection] = useState('what');

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  const introSections = [
    {
      id: 'what',
      title: 'What is this approach?',
      content: (
        <div className="space-y-3">
          <p>
            We propose a <strong className="text-slate-100">FHIR-first architecture</strong> that serves as a bridge between modern healthcare 
            standards and existing systems. Our Operational Data Layer (ODL) transforms existing healthcare 
            data into FHIR-first resources while maintaining backward compatibility with custom APIs.
          </p>
          <p>
            This <strong className="text-slate-100">hybrid approach</strong> ensures seamless interoperability without requiring complete system overhauls, 
            allowing healthcare organizations to modernize incrementally while preserving existing investments.
          </p>
        </div>
      )
    },
    {
      id: 'why',
      title: 'Why use it? Our Goal',
      content: (
        <div className="space-y-3">
          <p>
            The primary goal is to <strong className="text-slate-100">accelerate healthcare digital transformation</strong> by providing 
            a unified data layer that speaks both FHIR and custom API languages.
          </p>
          <p>
            This platform enables healthcare organizations to adopt modern interoperability standards progressively, 
            reducing integration complexity and ensuring clinical data flows seamlessly across 
            different systems, vendors, and care settings.
          </p>
          <div className="bg-green-900/20 border border-green-500/20 rounded-lg p-3 mt-3">
            <p className="text-sm text-green-200">
              <strong>Key Benefits:</strong> Faster implementation, reduced risk, preserved investments, improved interoperability
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'whom',
      title: 'For Whom? Target Audience',
      content: (
        <div className="space-y-4">
          <p>
            This demonstration is designed for <strong className="text-slate-100">healthcare IT professionals, system integrators, 
            and digital health innovators</strong> who are tasked with modernizing healthcare data infrastructure.
          </p>
          <div className="grid gap-3">
            <div className="bg-purple-900/20 border border-purple-500/20 rounded-lg p-3">
              <h4 className="font-medium text-purple-200 mb-1">Healthcare Developers & Engineers</h4>
              <p className="text-sm text-purple-100">
                Experience technical implementation of FHIR APIs, data transformation, and integration patterns
              </p>
            </div>
            <div className="bg-purple-900/20 border border-purple-500/20 rounded-lg p-3">
              <h4 className="font-medium text-purple-200 mb-1">Healthcare Decision Makers</h4>
              <p className="text-sm text-purple-100">
                Understand strategic benefits and practical implications of FHIR adoption strategies
              </p>
            </div>
            <div className="bg-purple-900/20 border border-purple-500/20 rounded-lg p-3">
              <h4 className="font-medium text-purple-200 mb-1">System Integrators</h4>
              <p className="text-sm text-purple-100">
                Explore real-world scenarios for planning system migrations and integration projects
              </p>
            </div>
          </div>
        </div>
      )
    }
  ];
  const tabExplanations = [
    {
      icon: <GitCompare className="text-blue-400" size={20} />,
      title: "FHIR Mappings Tab",
      description: "View and understand FHIR-to-custom field mappings for clinical data interoperability",
      features: [
        "View comprehensive FHIR-to-customer field mapping documentation",
        "Download interoperability mapping files in CSV format", 
        "Understand clinical data transformation rules and where each piece of information is located in the new FHIR envelope model",
        "See how standard FHIR resources map to custom MDM requirements"
      ],
      usage: "Essential for understanding how standardized FHIR clinical data transforms into custom system formats for seamless interoperability. Use this tab to guide your data integration and ensure all necessary clinical information is accurately mapped.",
      navigationGuide: "This tab is organized into comprehensive documentation sections that showcase how FHIR clinical data maps to custom system formats. The interface provides both browsable documentation and downloadable resources for integration teams. **Mapping Area**: Browse through organized sections showing field mappings for each FHIR resource type. For each field of each resource you will find a semantic description, the bucket in which it is being located in the FHIR envelope pattern, the path to find it inside the new documents and how it was altered to be included in it. **Download Section**: Use the download button to get CSV files with the mapping details."},
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
      title: "Custom Integration APIs Tab",
      description: "Test and interact with custom healthcare system API endpoints using clinical parameters",
      features: [
        "Test custom system API endpoints with clinical parameters",
        "View custom API documentation and healthcare specifications",
        "Execute real integration calls and validate responses"
      ],
      usage: "Essential for testing FHIR-to-custom integrations and ensuring clinical data flows correctly between modern FHIR systems and existing healthcare infrastructure.",
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
        "Complete FHIR API and custom endpoint reference documentation",
        "Interactive healthcare API exploration",
        "Clinical integration code examples and patterns", 
        "Healthcare security and authorization guides"
      ],
      usage: "Your comprehensive reference for understanding FHIR endpoints, clinical data parameters, and healthcare interoperability patterns.",
      navigationGuide: "This tab features a comprehensive documentation system with hierarchical navigation, interactive examples, and integrated testing capabilities. The layout maximizes both browsing efficiency and hands-on learning through embedded tools. **Documentation Tiles**: Choose from the 3 available documentation tiles, each of them targeting one of the main API implemented in this platform. **Documentation Content**: Click the 'View Docs' button and read a extremely detailed documentation with examples in the main content section. **Interactive Examples**: In the bottom part of these documentation files, you will be able to try live API calls directly from the documentation using embedded testing tools. **Search Function**: Use the search bar inside the specific documentation to quickly find endpoints or topics."
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center border-b border-slate-700 pb-6">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Info className="text-blue-400" size={28} />
          <h1 className="text-3xl font-bold text-slate-100">Hybrid FHIR ODL Guide</h1>
        </div>
        <p className="text-slate-300 text-lg max-w-2xl mx-auto">
          Welcome to the <strong className="text-slate-200">Hybrid FHIR ODL</strong> demonstration platform. This <strong className="text-slate-200">comprehensive guide</strong> explains 
          our <strong className="text-slate-200">innovative approach</strong> to bridging <strong className="text-slate-200">FHIR standards</strong> with custom healthcare systems, 
          and how to effectively use each tool for <strong className="text-slate-200">clinical data integration</strong> and <strong className="text-slate-200">interoperability</strong>.
        </p>
      </div>

      {/* Getting Started */}
      <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg p-6 border border-blue-500/20">
        <h2 className="text-xl font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <Book className="text-blue-400" size={20} />
          Our Approach & Vision
        </h2>
        
        <div className="space-y-3">
          {introSections.map((section) => (
            <div key={section.id} className="border border-slate-600 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between p-4 bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-slate-200">{section.title}</h3>
                </div>
                {openSection === section.id ? (
                  <ChevronDown className="text-slate-400" size={20} />
                ) : (
                  <ChevronRight className="text-slate-400" size={20} />
                )}
              </button>
              
              {openSection === section.id && (
                <div className="p-4 bg-slate-800/30 border-t border-slate-600 animate-in slide-in-from-top-2 duration-300">
                  <div className="text-slate-300 leading-relaxed">
                    {section.content}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Quick overview when all sections are closed */}
        {!openSection && (
          <div className="mt-4 p-4 bg-slate-800/30 rounded-lg border border-slate-600">
            <p className="text-sm text-slate-400 text-center italic">
              👆 Click on any section above to learn more about our hybrid FHIR approach, 
              goals, and who this demonstration is designed for.
            </p>
          </div>
        )}
      </div>

      {/* Workflow Section */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h2 className="text-xl font-semibold text-slate-200 mb-4">Recommended Workflow</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">1</span>
            <div>
              <h3 className="font-medium text-slate-300">Review FHIR Mappings & Data Structure</h3>
              <p className="text-sm text-slate-400">Start by exploring the FHIR Mappings tab to understand how clinical data transforms between FHIR standards and custom API formats. This foundation is crucial for understanding the data structure.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">2</span>
            <div>
              <h3 className="font-medium text-slate-300">Generate Synthetic Clinical Data</h3>
              <p className="text-sm text-slate-400">Use the Synthetic Clinical Data tab to populate the system with test data. This creates the foundation for testing and exploring the platform's capabilities.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">3</span>
            <div>
              <h3 className="font-medium text-slate-300">Test Custom Integration APIs</h3>
              <p className="text-sm text-slate-400">Explore the Custom APIs tab to test how the platform handles custom healthcare system integrations and validates data flows between different formats.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">4</span>
            <div>
              <h3 className="font-medium text-slate-300">Test FHIR Clinical APIs</h3>
              <p className="text-sm text-slate-400">Use the FHIR API tab to test standard FHIR operations and validate how the platform handles modern healthcare interoperability standards.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">5</span>
            <div>
              <h3 className="font-medium text-slate-300">Browse & Monitor Clinical Data</h3>
              <p className="text-sm text-slate-400">Use the Clinical Data Viewer tab to inspect stored FHIR resources and verify the results of your testing and integration scenarios.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">6</span>
            <div>
              <h3 className="font-medium text-slate-300">Review API Documentation</h3>
              <p className="text-sm text-slate-400">Reference the API Documentation tab for detailed technical specifications and implementation examples to support your integration planning.</p>
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
            <div key={index} className="bg-slate-200 rounded-lg p-6 border border-slate-300 hover:border-slate-400 transition-colors shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                {tab.icon}
                <h3 className="text-lg font-semibold text-slate-800">{tab.title}</h3>
              </div>
              
              <p className="text-slate-600 mb-4">{tab.description}</p>
              
              <div className="space-y-3">
                <h4 className="font-medium text-slate-700">Key Features:</h4>
                <ul className="space-y-1">
                  {tab.features.map((feature, idx) => (
                    <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
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
              
              <div className="mt-4 p-3 bg-slate-100 rounded border border-slate-300">
                <h4 className="font-medium text-slate-700 text-sm mb-1">When to use:</h4>
                <p className="text-xs text-slate-600">{tab.usage}</p>
              </div>
            </div>
          ))}
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
              <li>• Test both FHIR and custom endpoints for full coverage</li>
            </ul>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default ExplanationTab;