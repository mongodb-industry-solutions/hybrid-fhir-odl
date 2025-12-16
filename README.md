# FHIR Hybrid Data Manager Reference Pattern

A comprehensive FHIR first healthcare data management system with MongoDB backend, featuring advanced search capabilities and an interactive API demonstrator. This reference pattern demonstrates a FHIR aware system architecture optimized for real-world healthcare data scenarios.

## 🚀 Quick Start - Ready to Run!

**Everything is set up and ready!** Just follow these two simple steps:

### Step 1: Start Backend (Terminal 1)

From the project root:

```bash
./start-server.sh
```

**Expected output:**
```
Starting FHIR Mongo Toolkit API server...
API will be available at: http://localhost:8000
API Documentation at: http://localhost:8000/docs

INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

**Test it:**
```bash
curl http://localhost:8000/health
# Should return: {"status":"ok","tenant":"tenant-1"}
```

### Step 2: Start Frontend (Terminal 2)

From the project root:

```bash
cd frontend
npm run dev
```

**Expected output:**
```
▲ Next.js 14.2.33
- Local:        http://localhost:3000
✓ Ready in 2-3s
```

### Step 3: Open Browser

Visit **http://localhost:3000** and you'll see:

1. **Header** with FHIR branding and "Backend Connected" indicator (green dot)
2. **Stats Cards** showing: MongoDB, FHIR R4, Synthetic, FastAPI
3. **FHIR Tabs** with three sections:
   - **Resource Browser**: View and search FHIR resources
   - **Synthetic Data**: Generate test data
   - **API Tester**: Test endpoints interactively

## 🛠️ Alternative Deployment Methods

### Using Makefile (Recommended)

For easier development and deployment, use the included Makefile:

**Quick Development Setup:**
```bash
# Install all dependencies
make install

# Start both backend and frontend in development mode
make dev
```

**Docker Deployment:**
```bash
# Build and start with Docker
make docker-build
make up

# View logs
make logs

# Stop containers
make down
```

**Individual Services:**
```bash
# Start only backend (API server)
make backend

# Start only frontend (web app)
make frontend
```

**Other Useful Commands:**
```bash
# See all available commands
make help

# Clean all build artifacts
make clean

# Restart Docker containers
make restart
```

The Makefile provides a unified interface for all development and deployment tasks, making it easier to work with the project regardless of your preferred method.

## 🏗️ Project Structure

```
hybrid-odl/
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
   - Regional healthcare endpoints (Hong Kong legacy support)
   - Data inspection and discovery tools
   - PMI (Patient Management Information) case queries
   - CPI (Clinical Process Improvement) queries

3. **FHIR R4 API** - FHIR aware healthcare interoperability
   - Patient search (20+ parameters)
   - Encounter search (15+ parameters)
   - Accelerated and canonical search modes
   - Cross-resource queries (Patient → Encounter relationships)

### Interactive Web Application

#### 1. Resource Browser Tab
- View all FHIR resources from MongoDB
- Filter by resource type (Patient, Encounter, Practitioner, CareTeam)
- Search by Local ID, case number, codes
- Click to view full resource details
- Side-by-side JSON view with both FHIR resource and envelope data

#### 2. Synthetic Data Tab
- Generate test data with one click
- Configure:
  - Number of patients (default: 5)
  - Encounters per patient (default: 2)
  - Practitioners (default: 10)
  - Care teams (default: 5)
- Wipe all data option (with confirmation)

#### 3. API Tester Tab
- **31+ pre-built query examples** with real data
- **One-click execution** - no typing required
- **Cross-resource demonstrations** - Patient-Encounter relationships
- **Visual categorization** - Basic, Complex, Cross-resource
- **Auto-discovery** - Populates examples from your database
- **Dual search modes** - Accelerated (fast) vs Canonical (FHIR aware)
- **Debug mode** - View MongoDB filters

## 🎯 Getting Started - First Use

### 1. Generate Sample Data

Once both servers are running:

1. Visit http://localhost:3000
2. Go to "FHIR Data Management" → "Synthetic Data" tab
3. Configure your data generation settings (or use defaults)
4. Click "Generate All" to create sample data
5. Wait for the success message

### 2. Browse Your Data

1. Switch to the "Resource Browser" tab
2. You should see a list of FHIR resources
3. Try filtering by resource type (Patient, Encounter, etc.)
4. Click on a resource to view full details

### 3. Test API Endpoints

1. Go to the "API Tester" tab
2. Select an endpoint from the dropdown
3. Click any example button (e.g., "Female Patients")
4. Query executes automatically with results displayed

## 📚 API Documentation

- **Swagger UI**: http://localhost:8000/docs (Interactive testing)
- **ReDoc**: http://localhost:8000/redoc (Clean documentation)
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
curl "http://localhost:8000/fhir/Encounter?subject.identifier=local_id|A224515(2)&limit=10"
# Use Local ID for patient identification

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
- Slower but FHIR first approach
- Best for FHIR standards validation

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
- ✅ FHIR first data model
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

### Regional Healthcare Support

- Local ID search (primary)
- Local ID search for patient identification
- Hospital-specific MRN (Medical Record Numbers)
- PMI case management
- CPI (Clinical Process Improvement) workflows
- Team and ward-based queries

## 🛠️ Troubleshooting

### Backend Issues

**Backend won't start:**

*Error*: `bad interpreter: No such file or directory`
*Solution*: Fixed! The script now uses `python -m uvicorn`

*Error*: `ModuleNotFoundError: No module named 'certifi'`
*Solution*:
```bash
cd backend
source .venv/bin/activate
pip install certifi
```

*Error*: `pymongo.errors.ServerSelectionTimeoutError`
*Solution*: Check MongoDB connection:
```bash
cd backend
cat .env
# Verify MONGODB_URI is correct
```

### Frontend Issues

**Frontend won't start:**

*Error*: `Cannot find module 'autoprefixer'`
*Solution*: Fixed! Dependencies are installed

*Error*: Module not found errors
*Solution*:
```bash
cd frontend
rm -rf .next node_modules
npm install
npm run dev
```

### Application Issues

**Backend connected but no data:**
Generate synthetic data via the web interface or CLI:
```bash
cd backend
source .venv/bin/activate
fhir-tool seed --patients 5 --encounters-per-patient 2
```

**API calls fail with CORS errors:**
The app uses an API proxy at `/api/internal/[...path]` which prevents CORS issues. If you still see them:
1. Restart both backend and frontend
2. Check `.env.local` in frontend has correct BACKEND_URL
3. Check browser DevTools Network tab for actual errors

## 🎨 Customization

### Customize the Theme
Edit `frontend/app/globals.css`:
```css
:root {
  --color-primary: #00A86B;  /* Change this emerald green color */
}
```

### Add More Data
```bash
cd backend
source .venv/bin/activate
fhir-tool seed --patients 50 --encounters-per-patient 5
```

## 🚀 Production Deployment

### Backend Deployment
1. Update `.env` with production MongoDB URI
2. Set up proper authentication
3. Deploy to AWS, Google Cloud, or your preferred platform
4. Use gunicorn or similar for production ASGI server

### Frontend Deployment
```bash
cd frontend
npm run build
npm start
```
Then deploy to Vercel, Netlify, or your preferred platform.

## 📊 Port Reference

| Service | Port | URL |
|---------|------|-----|
| Backend API | 8000 | http://localhost:8000 |
| API Docs | 8000 | http://localhost:8000/docs |
| Frontend | 3000 | http://localhost:3000 |
| MongoDB | 27017 | (Atlas cloud) |

## 📂 Important File Locations

| Component | Location |
|-----------|----------|
| Backend Code | `backend/fhir_toolkit/` |
| Backend Config | `backend/.env` |
| Frontend App | `frontend/` |
| FHIR Components | `frontend/components/views/fhir/` |
| API Proxy | `frontend/app/api/internal/[...path]/route.js` |
| Styles | `frontend/app/globals.css` |

## ✅ Success Checklist

After following the quick start, you should have:

- [ ] Backend starts without errors
- [ ] Health check returns `{"status":"ok"}`
- [ ] Frontend starts without errors
- [ ] Browser shows http://localhost:3000
- [ ] Green "Backend Connected" indicator visible
- [ ] Four stat cards visible (MongoDB, FHIR R4, Synthetic, FastAPI)
- [ ] Three tabs (Resource Browser, Synthetic Data, API Tester)
- [ ] Can generate synthetic data
- [ ] Can browse resources
- [ ] Can test API endpoints
- [ ] No console errors in browser DevTools

## 🛠️ Prerequisites

- Python 3.11+
- Node.js 20+
- MongoDB Atlas account (or local MongoDB)

## 🤝 Contributing

This is a demonstration reference pattern showing:
- FHIR R4 API design patterns
- MongoDB document design for healthcare
- Fast search with pre-computed indexes
- Multi-API architecture (Admin, App, FHIR)
- Interactive API exploration tools

## 🙏 Acknowledgments

- Built with FastAPI, Next.js 14, and MongoDB
- FHIR R4 specification by HL7
- Tailwind CSS for styling
- Monaco Editor for JSON viewing

## 📝 License

[Your License Here]

---

**Ready to get started?** 🚀

1. **Terminal 1**: `./start-server.sh`
2. **Terminal 2**: `cd frontend && npm run dev`
3. **Browser**: http://localhost:3000

Generate some data, explore the API, and start building!