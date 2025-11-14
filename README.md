# FHIR Hybrid Tapdata Project

A comprehensive FHIR R4 compliant healthcare data management system with MongoDB backend, featuring advanced search capabilities and an interactive API demonstrator.

## 🏗️ Project Structure

```
tapdata-hybrid-fhir/
├── backend/                    # Python FastAPI + MongoDB
│   ├── fhir_toolkit/          # Main application package
│   │   ├── api.py             # FastAPI endpoints (3 APIs)
│   │   ├── search_builders.py # Advanced FHIR search logic
│   │   ├── db.py              # MongoDB connection
│   │   ├── config.py          # Configuration
│   │   ├── synth.py           # Synthetic data generation
│   │   └── mappings.py        # FHIR resource mappings
│   ├── .venv/                 # Python virtual environment
│   └── pyproject.toml         # Python dependencies
├── frontend/                   # Next.js React application
│   ├── app/                   # Next.js app router
│   ├── components/            # React components
│   │   └── views/fhir/        # FHIR-specific views
│   │       ├── FhirApiTester.jsx      # Interactive API demonstrator
│   │       ├── FhirResourceBrowser.jsx # Resource browser
│   │       └── FhirSyntheticPanel.jsx  # Data generation UI
│   ├── public/fhir-config/    # FHIR search configuration
│   └── package.json           # Node dependencies
├── docs/                       # Project documentation
├── .env.local.example         # Environment template
├── start-server.sh            # Backend startup script
├── start-frontend.sh          # Frontend startup script
└── README.md                  # This file
```

## ✨ Features

### Three Distinct APIs

1. **Admin API** - System management
   - Health checks
   - Data seeding (synthetic FHIR data)
   - Data cleanup

2. **Application API** - Custom business logic
   - Legacy Hong Kong healthcare endpoints
   - Data inspection and discovery tools
   - PMI (Patient Management Information) case queries
   - CPI (Clinical Process Improvement) queries

3. **FHIR R4 API** - Standards-compliant healthcare interoperability
   - Patient search (20+ parameters)
   - Encounter search (15+ parameters)
   - Accelerated and canonical search modes
   - Cross-resource queries (Patient → Encounter relationships)

### Interactive API Demonstrator

- **31+ pre-built query examples** with real data
- **One-click execution** - no typing required
- **Cross-resource demonstrations** - Patient-Encounter relationships
- **Visual categorization** - Basic, Complex, Cross-resource
- **Auto-discovery** - Populates examples from your database
- **Dual search modes** - Accelerated (fast) vs Canonical (spec-compliant)
- **Debug mode** - View MongoDB filters

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 20+
- MongoDB Atlas account (or local MongoDB)

### 1. Backend Setup

```bash
# Set environment variables
cp .env.local.example .env.local
# Edit .env.local with your MongoDB URI and tenant

# Start backend server
./start-server.sh

# Backend runs on http://localhost:8000
```

### 2. Frontend Setup

```bash
# Start frontend development server  
./start-frontend.sh

# Frontend runs on http://localhost:3000
```

### 3. Generate Sample Data

Visit http://localhost:3000 and:
1. Go to "FHIR Data Management" → "Synthetic Data" tab
2. Click "Generate All" to create sample data
3. Switch to "API Tester" tab to explore

## 📚 API Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI Spec**: http://localhost:8000/openapi.json

All three APIs are organized with clear tags in the documentation.

## 🎯 Usage Examples

### Via Interactive Demonstrator (Recommended)

1. Open http://localhost:3000
2. Navigate to "FHIR Data Management" → "API Tester"
3. Click any example button (e.g., "Female Patients")
4. Query executes automatically with results displayed

### Via API (cURL)

```bash
# Search for female patients (accelerated mode)
curl -H "x-search-mode: accelerated" \
     "http://localhost:8000/fhir/Patient?gender=female&limit=10"

# Find encounters for a specific patient (cross-resource)
curl "http://localhost:8000/fhir/Encounter?subject.identifier=hkid|A224515(2)&limit=10"

# Complex query: Recent encounters for a doctor at specific hospital
curl "http://localhost:8000/fhir/Encounter?participant.identifier=D-1310&service-provider=QH&date-start=ge2025-09-01&limit=10"
```

## 🔧 Configuration

### Environment Variables

```bash
# MongoDB
MONGODB_URI=mongodb+srv://...
MONGODB_TENANT=your-tenant-id

# Frontend (optional)
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_ENABLE_FHIR=true
```

### Search Modes

**Accelerated Mode** (Default):
- Uses pre-indexed `search.*` fields
- Faster queries (50-100ms typical)
- Best for production use

**Canonical Mode**:
- Uses standard FHIR `resource.*` fields
- Slower but spec-compliant
- Best for standards validation

## 📖 Documentation

- [Setup Guide](docs/SETUP_COMPLETE.md)
- [API Documentation](docs/API_DOCS_INTEGRATION.md)
- [Three APIs Overview](docs/THREE_APIS_COMPLETE.md)
- [Web Application Guide](docs/WEB_APP_COMPLETE.md)
- [Frontend Access](docs/FRONTEND_ACCESS.md)
- [Quick Start](QUICK_START.md)
- [Getting Started](START_HERE.md)

## 🏥 Healthcare Data Model

### FHIR Envelope Pattern

Resources are stored with three sections:

```json
{
  "tenant": "your-tenant",
  "resourceType": "Patient",
  "resource": { /* Standard FHIR resource */ },
  "app": { /* Application-specific data */ },
  "search": { /* Pre-indexed search fields */ }
}
```

This hybrid approach provides:
- ✅ FHIR R4 compliance
- ✅ Fast search performance
- ✅ Custom business logic support
- ✅ Multi-tenancy

## 🌟 Key Capabilities

### Advanced Search Features

- **Date comparisons**: gt, ge, lt, le, eq, ne
- **Token search**: system|value identifiers  
- **String search**: Partial matching with regex
- **Reference search**: Patient → Encounter links
- **Combined queries**: Multiple parameters
- **Cross-resource**: Relationship-based queries

### Hong Kong Healthcare Support

- HKID (Hong Kong ID) search
- Hospital-specific MRN (Medical Record Numbers)
- PMI case management
- CPI (Clinical Process Improvement) workflows
- Team and ward-based queries

## 🤝 Contributing

This is a demonstration/reference implementation showing:
- FHIR R4 API design patterns
- MongoDB document design for healthcare
- Fast search with pre-computed indexes
- Multi-API architecture (Admin, App, FHIR)
- Interactive API exploration tools

## 📝 License

[Your License Here]

## 🙏 Acknowledgments

- Built with FastAPI, Next.js 14, and MongoDB
- FHIR R4 specification by HL7
- Tailwind CSS for styling
- Monaco Editor for JSON viewing
