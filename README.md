# Hybrid FHIR ODL - Operational Data Layer Reference Pattern

Looking for a reliable way to modernize your healthcare data infrastructure? The Hybrid FHIR ODL reference pattern combines the power of FHIR R4 with a high-performance operational data layer using MongoDB as its core. 

This project explores the new FHIR-first data model approach, enabling fast operational querying over clinical data while adhering to FHIR standards. Modelled after real-world healthcare scenarios, it provides a robust foundation for system modernization without sacrificing interoperability.

If this resonates with your goals, dive in and explore how the Hybrid FHIR ODL can transform your healthcare data management!



## 🚀 Quick Start - Ready to Run!

**Everything is set up and ready!** Just follow these simple steps:


### Step 1: Configure your Environment

First, copy the example environment files for both backend and frontend:
```bash
# Copy environment templates
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local
```
Then edit the `backend/.env` file to set your MongoDB connection string:
```
# Example MongoDB URI
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net
MONGODB_DB=fhir_hybrid_odl
MONGODB_COLLECTION=fhir
MONGODB_TENANT=tenant-1
```
 Finally, you can adjust the `frontend/.env.local` if needed (the defaults should work for local development).

---

### Step 2: Install Dependencies

Open a new terminal, browse to the project root directory and run:
```bash
# Install all dependencies
make install
```

---


### Step 3: Start the Application

Open two terminal windows or tabs. In the first terminal, start the backend server:
```bash
make backend
```
In the second terminal, start the frontend server:
```bash
make frontend
```

---
### Step 4: Access the Application

You are all set! Open your web browser and navigate to:
```
http://localhost:8080
```   

Now you can fully experience the Hybrid FHIR ODL approach! Create, explore, and test data with ease.



## 🏗️ Project Structure

```
hybrid-odl/
├── backend/                    # Python FastAPI + MongoDB
│   ├── fhir_toolkit/            # Main backend application code
│   ├── .env                     # Backend environment variables 
│   ├── pyproject.toml           # Python project configuration
|   ├── README.md                # This README file contains specific backend information
│   └── ...                      # Other backend files
├── frontend/                   # Next.js + React frontend application
│   ├── app/                     # Main frontend application code
│   ├── .env.local               # Frontend environment variables
│   ├── package.json             # Node.js project configuration
│   ├── README.md                # This README file contains specific frontend information
│   └── ...                      # Other frontend files
├── scripts/                    # Helper scripts
│── .gitignore                  # Git ignore file
│── Makefile                    # Makefile for common commands
│── docker-compose.yml          # Docker Compose configuration file
│── Dockerfile.backend        # Dockerfile for backend service
│── Dockerfile.frontend        # Dockerfile for frontend service
└── README.md                   # This README file

```

## ✨ Features & Platform Overview

### Our FHIR-First Hybrid Approach

The Hybrid FHIR ODL represents a **FHIR-first architecture** that bridges modern healthcare standards with existing systems. This **Operational Data Layer (ODL)** transforms healthcare data into FHIR-first resources while maintaining backward compatibility, enabling seamless interoperability without requiring complete system overhauls.

**Key Benefits:**
- Accelerated healthcare digital transformation
- Unified data layer supporting both FHIR and custom API languages
- Progressive adoption of interoperability standards
- Reduced integration complexity
- Preserved existing investments

### Target Audience

This demonstration platform is designed for:
- **Healthcare Developers & Engineers**: Experience technical FHIR API implementation and integration patterns
- **Healthcare Decision Makers**: Understand strategic benefits of FHIR adoption strategies
- **System Integrators**: Explore real-world scenarios for system migrations and integration projects

### Three Distinct APIs

1. **Admin API** - System management and health monitoring
   - Health checks and system status
   - Data seeding with synthetic FHIR-compliant clinical data
   - Data lifecycle management and cleanup operations

2. **Custom Integration API** - Custom business logic and regional support
   - Regional healthcare endpoints with localized support
   - Data inspection and discovery tools for integration planning
   - PMI (Patient Management Information) case queries
   - CPI (Clinical Process Improvement) workflows
   - Team and ward-based clinical queries

3. **FHIR R4 API** - Standards-compliant healthcare interoperability
   - Patient search with 20+ clinical parameters
   - Encounter search with 15+ healthcare-specific parameters
   - Accelerated and canonical search modes for performance optimization
   - Cross-resource queries supporting Patient → Encounter relationships
   - Full FHIR R4 compliance with modern healthcare standards

### Comprehensive Interactive Web Application

#### 1. FHIR Mappings Tab - *Understanding Data Transformation*
**Purpose**: View FHIR-to-custom field mappings and understand data transformation rules

**Key Features:**
- Browse comprehensive FHIR field mapping documentation
- Download CSV mapping files for integration planning
- Understand data transformation rules between FHIR and custom formats
- Explore FHIR-to-custom resource mappings with semantic descriptions

**Usage**: Essential for integration planning - guides data transformation and ensures accurate field mapping between FHIR standards and custom healthcare systems.

#### 2. Synthetic Clinical Data Tab - *Safe Test Data Generation*
**Purpose**: Generate synthetic clinical data for testing without real patient information

**Key Features:**
- Generate FHIR resources (Patient, Encounter, Care Team, Practitioner)
- Customize generation parameters for realistic test scenarios
- Preview generated data before saving to verify quality
- Bulk generate multiple clinical records efficiently
- One-click data generation with HIPAA-safe synthetic content
- Configurable parameters: patients (default: 5), encounters per patient (default: 2), practitioners (default: 10), care teams (default: 5)
- Complete data wipe option with confirmation for clean testing

**Usage**: Perfect for development, compliance testing, and demonstration scenarios while maintaining patient privacy and regulatory compliance.

#### 3. Clinical Data Viewer Tab - *Resource Inspection & Validation*
**Purpose**: Browse, inspect, and validate stored FHIR resources

**Key Features:**
- Search and filter stored clinical data by healthcare criteria
- Filter by resource type (Patient, Encounter, Practitioner, CareTeam)
- Search by Local ID, case numbers, and clinical codes
- Advanced filtering with healthcare-specific parameters
- View detailed FHIR JSON structure with envelope data
- Comprehensive resource detail inspection (expandable bottom panel)
- Side-by-side JSON view showing both FHIR resource and envelope data

**Usage**: Monitor data quality, validate FHIR integrity, and examine how clinical data is stored and structured in the hybrid approach.

#### 4. Custom Integration APIs Tab - *Testing Healthcare System Integration*
**Purpose**: Test custom healthcare system API endpoints and validate integration flows

**Key Features:**
- Test custom API endpoints with healthcare-specific parameters
- View comprehensive API documentation and technical specifications
- Execute integration calls with real clinical data
- Validate API responses and data transformation accuracy
- Parameter forms with preset loading capabilities
- Real-time response inspection and debugging

**Usage**: Essential for testing FHIR-to-custom integrations, ensuring data flows correctly between different healthcare systems and validating custom endpoint implementations.

#### 5. FHIR Clinical API Tab - *Standards-Compliant Testing*
**Purpose**: Test FHIR clinical API endpoints and validate standards compliance

**Key Features:**
- Execute comprehensive FHIR operations (GET, POST, PUT, DELETE)
- Test resource creation, updates, and complex clinical searches
- Real-time API response inspection with clinical context
- **31+ pre-built clinical query examples** with real healthcare scenarios
- **One-click execution** - no manual parameter entry required
- **Cross-resource demonstrations** - Patient-Encounter clinical relationships
- **Visual categorization** - Basic, Complex, Cross-resource query types
- **Auto-discovery** - Dynamically populates examples from your clinical database
- **Dual search modes** - Accelerated (fast performance) vs Canonical (FHIR-compliant)
- **Debug mode** - View MongoDB pipeline and optimization details

**Usage**: Primary tool for testing FHIR operations, ensuring clinical data management aligns with healthcare standards, and validating interoperability implementations.

#### 6. Healthcare API Documentation Tab - *Comprehensive Reference*
**Purpose**: Access complete technical reference for all APIs and integration patterns

**Key Features:**
- FHIR API and custom endpoint comprehensive reference documentation
- Interactive API exploration with live examples
- Integration code examples and implementation patterns
- Security and authorization guides for healthcare compliance
- Real-time documentation with executable examples
- Quick search functionality for endpoints and healthcare topics

**Usage**: Comprehensive technical reference supporting FHIR implementation, custom integration planning, and healthcare interoperability development.

## 🎯 First Use Experience

### Recommended Workflow for Healthcare Data Integration

Follow this structured approach to explore the platform's capabilities and understand the hybrid FHIR approach:

1. **Review FHIR Mappings & Data Structure**
   Start by exploring the FHIR Mappings tab to understand how clinical data transforms between FHIR standards and custom API formats. This foundation is crucial for understanding the data structure and integration patterns.

2. **Generate Synthetic Clinical Data**
   Use the Synthetic Clinical Data tab to populate the system with test data. This creates the foundation for testing and exploring the platform's capabilities while maintaining HIPAA compliance.

3. **Test Custom Integration APIs**
   Explore the Custom APIs tab to test how the platform handles custom healthcare system integrations and validates data flows between different formats and systems.

4. **Test FHIR Clinical APIs**
   Use the FHIR API tab to test standard FHIR operations and validate how the platform handles modern healthcare interoperability standards and clinical workflows.

5. **Browse & Monitor Clinical Data**
   Use the Clinical Data Viewer tab to inspect stored FHIR resources and verify the results of your testing and integration scenarios, ensuring data quality and structure.

6. **Review API Documentation**
   Reference the API Documentation tab for detailed technical specifications and implementation examples to support your integration planning and development efforts.


## 🏥 Healthcare Data Model & Clinical Architecture

### FHIR-first Pattern for Clinical Data

Clinical resources are stored using a hybrid envelope approach with three distinct sections optimized for healthcare workflows:

```json
{
  "tenant": "healthcare-organization-tenant",
  "resourceType": "Patient", 
  "resource": { 
    /* Standard FHIR R4 clinical resource with full compliance */ 
    "resourceType": "Patient",
    "id": "patient-123",
    "name": [{"family": "Smith", "given": ["John"]}],
    "gender": "male",
    "birthDate": "1985-03-15"
  },
  "app": { 
    /* Healthcare application-specific data for custom workflows */
    "localId": "A224515(2)",
    "hospitalMRN": "MRN-789456",
    "careTeam": "cardiology-team-1"
  },
  "search": { 
    /* Pre-indexed clinical search fields for performance */
    "patient_name": "john smith",
    "patient_gender": "male", 
    "patient_birthdate": "1985-03-15",
    "local_identifier": "A224515(2)"
  }
}
```

This hybrid healthcare architecture provides:
- ✅ **FHIR R4 compliance** - Full standards adherence for interoperability
- ✅ **Clinical performance** - Optimized search for patient care workflows  
- ✅ **Custom healthcare logic** - Support for regional and institutional requirements
- ✅ **Multi-tenancy** - Secure isolation for healthcare organizations
- ✅ **Scalable clinical data** - Designed for large-scale healthcare implementations

## 🌟 Key Healthcare Capabilities & Clinical Features

### Advanced Clinical Search Features

- **Clinical date comparisons**: gt, ge, lt, le, eq, ne for encounter dates, birth dates, and clinical timelines
- **Healthcare token search**: system|value identifiers for MRN, Local ID, and clinical codes  
- **Clinical string search**: Partial matching for patient names, provider names, and clinical terms
- **Care coordination**: Patient → Encounter → Provider relationship queries for clinical workflows
- **Combined clinical queries**: Multiple healthcare parameters for complex clinical scenarios
- **Cross-resource clinical relationships**: Care team, encounter, and patient association queries

### Regional Healthcare Support & Localization

- **Local ID search** - Primary patient identification for regional healthcare systems
- **Hospital-specific MRN** - Medical Record Numbers with institution-specific formats
- **PMI case management** - Patient Management Information workflows and case tracking
- **CPI workflows** - Clinical Process Improvement analytics and quality measurement
- **Team and ward-based queries** - Clinical team coordination and location-based care
- **Regional compliance** - Support for local healthcare regulations and clinical practices

## 🛠️ Healthcare System Troubleshooting

### Backend Issues in Clinical Environments

**Backend won't start in healthcare deployment:**

*Error*: `bad interpreter: No such file or directory`
*Solution*: Fixed! The script now uses proper Python module execution via `python -m uvicorn`

*Error*: `ModuleNotFoundError: No module named 'certifi'` (Common in healthcare secure environments)
*Solution*:
```bash
cd backend
source .venv/bin/activate
pip install certifi
# For healthcare environments with certificate requirements
pip install certifi --trusted-host pypi.org --trusted-host pypi.python.org
```

*Error*: `pymongo.errors.ServerSelectionTimeoutError` (MongoDB connectivity for clinical data)
*Solution*: Verify MongoDB Atlas connection for clinical data storage:
```bash
cd backend
cat .env
# Verify MONGODB_URI is correct for healthcare database
# Ensure network access from healthcare environment
```

### Frontend Issues in Healthcare Applications

**Frontend won't start in clinical environment:**

*Error*: `Cannot find module 'autoprefixer'` (Healthcare development dependencies)
*Solution*: Dependencies are now properly configured for healthcare applications

*Error*: Module not found errors in clinical development
*Solution*:
```bash
cd frontend
rm -rf .next node_modules
npm install
# For healthcare secure networks, configure npm registry if needed
npm run dev
```

## 🎨 Healthcare Application Customization


### Add Custom Healthcare Endpoints
1. Extend `backend/fhir_toolkit/api.py` with custom clinical endpoints
2. Update `frontend/components/views/customer/` for custom healthcare UI components
3. Modify FHIR mappings in `docs/spec_field_mapping.csv` for custom clinical fields



## ✅ Healthcare Implementation Success Checklist

After following the healthcare quick start guide, you should have:

- [ ] **Backend Clinical Services**: Backend starts without errors and serves FHIR R4 compliant APIs
- [ ] **Health Check Validation**: Health check endpoint returns `{"status":"ok"}` for clinical monitoring
- [ ] **Frontend Healthcare Application**: Frontend starts and displays clinical interface at http://localhost:3000
- [ ] **Clinical Connectivity**: Green "Backend Connected" indicator confirms healthcare API connectivity
- [ ] **Healthcare Dashboard**: Four clinical stat cards visible (MongoDB Clinical Data, FHIR R4 Compliance, Synthetic Clinical Data, FastAPI Healthcare Services)
- [ ] **Clinical Workflow Tabs**: Six healthcare tabs accessible (FHIR Mappings, Synthetic Clinical Data, Clinical Data Viewer, Custom Integration APIs, FHIR Clinical API, Healthcare API Documentation)
- [ ] **Clinical Data Generation**: Can generate synthetic HIPAA-safe clinical data for testing
- [ ] **Healthcare Resource Management**: Can browse clinical resources with FHIR compliance validation
- [ ] **Clinical API Testing**: Can test both FHIR and custom healthcare API endpoints
- [ ] **Clinical Error-Free Operation**: No console errors in browser DevTools affecting clinical workflows
- [ ] **Healthcare Data Quality**: FHIR resources display correctly with proper clinical structure
- [ ] **Clinical Search Functionality**: Both accelerated and canonical search modes function for clinical queries

## 🛠️ Healthcare Prerequisites

- Python 3.11+ (for healthcare backend development)
- Node.js 20+ (for clinical frontend applications) 
- MongoDB Atlas account (for HIPAA-compliant clinical data storage) or local MongoDB for development

## 🤝 Contributing to Innovation

This demonstration showcases a reference pattern for modern healthcare data infrastructure, highlighting:
- **FHIR R4 API design patterns** - Standards-compliant healthcare interoperability
- **Clinical MongoDB document design** - Optimized clinical data storage with FHIR-first pattern
- **Healthcare performance optimization** - Fast clinical search with pre-computed indexes for patient care
- **Multi-API healthcare architecture** - Admin, Custom Healthcare, and FHIR APIs for comprehensive clinical workflows
- **Interactive clinical tools** - Healthcare API exploration and clinical data management interfaces
- **Healthcare integration patterns** - Real-world scenarios for clinical system modernization

## 🙏 Technology Acknowledgments

- **FastAPI** - High-performance API framework optimized for healthcare applications
- **Next.js 14** - Modern React framework for clinical web applications  
- **MongoDB** - Flexible document database ideal for FHIR clinical data storage
- **FHIR R4 specification** - HL7 healthcare interoperability standard
- **Tailwind CSS** - Utility-first CSS framework for clinical UI development
- **Monaco Editor** - Advanced JSON editor for clinical data inspection and FHIR resource viewing



## Experience the Hybrid FHIR ODL Today!
