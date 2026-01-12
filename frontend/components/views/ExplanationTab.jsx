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
      description: "View FHIR-to-custom field mappings",
      features: [
        "Browse FHIR field mapping documentation",
        "Download CSV mapping files",
        "Understand data transformation rules",
        "See FHIR-to-custom resource mappings"
      ],
      usage: "Essential for understanding how FHIR data transforms to custom formats. Guide your integration and ensure accurate mapping.",
      navigationGuide: "Browse mapping documentation and download resources. **Mapping Area**: View field mappings by resource type with semantic descriptions and paths. **Download Section**: Get CSV files with mapping details."},
    {
      icon: <Beaker className="text-green-400" size={20} />,
      title: "Synthetic Clinical Data Tab", 
      description: "Generate synthetic clinical data for testing",
      features: [
        "Generate FHIR resources (Patient, Encounter, Care Team, Practitioner)",
        "Customize generation parameters",
        "Preview before saving",
        "Bulk generate multiple records"
      ],
      usage: "Create realistic test data without real patient information. Perfect for development and compliance testing.",
      navigationGuide: "Efficient interface for data generation and management. **Resource Selection**: Choose resource types and quantities. **Action Buttons**: Generate new data or wipe existing data."
    },
    {
      icon: <FileJson2 className="text-yellow-400" size={20} />,
      title: "Clinical Data Viewer Tab",
      description: "Browse and inspect stored FHIR resources", 
      features: [
        "Search stored clinical data",
        "Filter by healthcare criteria",
        "View detailed FHIR JSON structure",
        "Inspect resource details (check bottom panel!)"
      ],
      usage: "Examine stored data, validate FHIR integrity, and monitor data quality. Ensure resources are correctly formatted.",
      navigationGuide: "Layered browsing with search, list, and detail views. **Search & Filter**: Top section for ID/criteria filtering. **Resource List**: Browse available resources. **Detail View**: Click 'Open' to expand bottom panel with complete resource details."
    },
    {
      icon: <Briefcase className="text-purple-400" size={20} />,
      title: "Custom Integration APIs Tab",
      description: "Test custom healthcare system API endpoints",
      features: [
        "Test custom API endpoints",
        "View API documentation & specifications",
        "Execute integration calls",
        "Validate responses"
      ],
      usage: "Test FHIR-to-custom integrations and ensure data flows correctly between systems.",
      navigationGuide: "Dual testing and documentation environment. **API Tester**: Select endpoints and methods. **Documentation**: View API specs and examples. **Parameter Forms**: Fill fields or use 'Load Preset'. **Response Panel**: View API results."
    },
    {
      icon: <ServerCog className="text-indigo-400" size={20} />,
      title: "FHIR Clinical API Tab", 
      description: "Test FHIR clinical API endpoints",
      features: [
        "Execute FHIR operations (GET, POST, PUT, DELETE)",
        "Test resource creation, updates, and searches",
        "Real-time API response inspection"
      ],
      usage: "Primary tool for testing FHIR operations and ensuring data management aligns with standards.",
      navigationGuide: "Structured workflow for comprehensive FHIR testing. **Search Selector**: Choose search type. **Resource Config**: Select resource type. **Sample Filtering**: Use preset examples. **Custom Parameters**: Full control over search constraints. **Execute & Results**: View responses and MongoDB pipeline."
    },
    {
      icon: <Book className="text-orange-400" size={20} />,
      title: "Healthcare API Documentation Tab",
      description: "Reference documentation for APIs",
      features: [
        "FHIR API and custom endpoint reference",
        "Interactive API exploration",
        "Integration code examples",
        "Security and authorization guides"
      ],
      usage: "Comprehensive reference for FHIR endpoints, parameters, and interoperability patterns.",
      navigationGuide: "Documentation system with navigation and interactive examples. **Documentation Tiles**: Choose from 3 main API tiles. **Content**: Click 'View Docs' for detailed documentation. **Interactive Examples**: Try live API calls from documentation. **Search**: Find endpoints or topics quickly."
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
                <div className="mt-4 p-4 bg-gradient-to-r from-slate-800 to-slate-700 rounded-lg border border-slate-600">
                  <h4 className="font-semibold text-slate-100 text-sm mb-3 flex items-center gap-2">
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
                          <div className="mb-4 pb-3 border-b border-slate-500">
                            <p className="text-sm text-slate-200 leading-relaxed italic">{initialDescription}</p>
                          </div>
                          
                          {/* Numbered Steps */}
                          {sections.map((section, idx) => {
                            const [title, ...contentParts] = section.split('**: ');
                            const content = contentParts.join('**: ').replace(/\.$/, '');
                            return (
                              <div key={idx} className="flex items-start gap-3 bg-slate-700/50 rounded p-3 border border-slate-500/40">
                                <div className="flex-shrink-0 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs font-medium mt-0.5">
                                  {idx + 1}
                                </div>
                                <div>
                                  <h5 className="font-medium text-slate-100 text-xs mb-1">{title}</h5>
                                  <p className="text-xs text-slate-300 leading-relaxed">{content}</p>
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