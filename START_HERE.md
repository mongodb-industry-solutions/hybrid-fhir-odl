# START HERE - FHIR Data Management Platform

## ✅ Everything is Ready!

All components have been created, dependencies installed, and issues fixed.

## 🚀 Quick Start (2 Commands)

### Step 1: Start Backend (Terminal 1)

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

### Step 2: Start Frontend (Terminal 2)

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

```
http://localhost:3000
```

## 🎯 What You'll See

### Frontend Dashboard
1. **Header** - FHIR branding with "Backend Connected" indicator
2. **Stats Cards** - MongoDB, FHIR R4, Synthetic, FastAPI
3. **FHIR Tabs** - Three functional tabs:
   - Resource Browser
   - Synthetic Data Generator
   - API Endpoint Tester

### Backend API Docs
```
http://localhost:8000/docs
```
Interactive Swagger UI with all 15+ endpoints

## 📦 What Was Created

### Fixed Issues
- ✅ Backend start script path issue
- ✅ Frontend autoprefixer dependency
- ✅ Missing UI components (tabs)

### Project Structure
```
tapdata-hybrid-fhir/
├── backend/           # Python FastAPI + MongoDB
├── frontend/          # Next.js app + components
└── *.md              # Documentation
```

### Created Components
- ✅ `components/ui/tabs.jsx` - Tabs UI component
- ✅ `components/AppContainer.jsx` - Main app
- ✅ `app/layout.js` - Next.js layout
- ✅ `app/page.js` - Home page
- ✅ `app/globals.css` - FHIR-themed styles
- ✅ `app/api/internal/[...path]/route.js` - API proxy

## 🎨 Features

### 1. Resource Browser Tab
- View all FHIR resources from MongoDB
- Filter by resource type (Patient, Encounter, Practitioner, CareTeam)
- Search by HKID, case number, codes
- Click to view full resource details
- Side-by-side JSON view

### 2. Synthetic Data Tab
- Generate test data with one click
- Configure:
  - Number of patients
  - Encounters per patient
  - Practitioners
  - Care teams
- Wipe all data option (with confirmation)

### 3. API Tester Tab
- Test any backend endpoint
- Select from dropdown
- Auto-populated sample parameters
- View JSON responses
- Syntax-highlighted output

## 🔧 If Something Goes Wrong

### Backend Issues

**Can't find backend directory:**
```bash
# You might be in wrong location
cd /Users/francesc.mateu/Documents/GitHub/tapdata-hybrid-fhir
./start-server.sh
```

**Module not found:**
```bash
cd backend
source .venv/bin/activate
pip install -e .
```

### Frontend Issues

**Module not found:**
```bash
cd frontend
rm -rf .next
npm install
npm run dev
```

**Port 3000 already in use:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
npm run dev
```

## 📚 Documentation

- **[QUICK_START.md](QUICK_START.md)** - Detailed startup guide
- **[README.md](README.md)** - Main project overview
- **[WEB_APP_COMPLETE.md](WEB_APP_COMPLETE.md)** - Web app details
- **[SETUP_COMPLETE.md](SETUP_COMPLETE.md)** - Backend setup
- **[frontend/README.md](frontend/README.md)** - Frontend docs

## ✨ Next Steps

### Generate Some Data
```bash
cd backend
source .venv/bin/activate
fhir-tool seed --patients 10 --encounters-per-patient 3
```

### Explore the API
Visit http://localhost:8000/docs and try:
- GET `/health` - Check status
- GET `/inspect/distinctResourceTypes` - See what data types exist
- GET `/fhir/Patient?identifier=<HKID>` - FHIR-compliant search

### Customize the Theme
Edit `frontend/app/globals.css`:
```css
:root {
  --color-primary: #00A86B;  /* Emerald green - change this! */
}
```

## 🎉 Success Indicators

When everything works, you should have:
- ✅ No errors in either terminal
- ✅ Green "Backend Connected" indicator
- ✅ All three tabs clickable
- ✅ Can generate synthetic data
- ✅ Can browse resources
- ✅ Can test API endpoints

## 💡 Pro Tips

1. **Generate data first** - Use the Synthetic Data tab or CLI to create test data
2. **Use the API tester** - Great for understanding the endpoints
3. **Check backend docs** - http://localhost:8000/docs has interactive testing
4. **Browser DevTools** - Open console (F12) to see any errors

## 📞 Getting Help

If you encounter issues:
1. Check the terminal outputs for error messages
2. Review the documentation files listed above
3. Check browser console (F12) for frontend errors
4. Verify MongoDB connection in `backend/.env`

---

**Ready? Run the two commands and you're live!** 🚀

Terminal 1: `./start-server.sh`
Terminal 2: `cd frontend && npm run dev`
Browser: `http://localhost:3000`
