# Quick Start Guide - FHIR Data Management Platform

## Fixed Issues ✅

1. **Backend start script** - Fixed path resolution issue
2. **Frontend autoprefixer** - Installed missing dependency

## How to Run (2 Terminals)

### Terminal 1 - Backend API

From the project root:

```bash
./start-server.sh
```

You should see:
```
Starting FHIR Mongo Toolkit API server...
API will be available at: http://localhost:8000
API Documentation at: http://localhost:8000/docs

INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

**Test it:**
```bash
curl http://localhost:8000/health
# Should return: {"status":"ok","tenant":"tenant-1"}
```

### Terminal 2 - Frontend Web App

From the project root:

```bash
cd frontend
npm run dev
```

You should see:
```
▲ Next.js 14.2.33
- Local:        http://localhost:3000

✓ Ready in 2.3s
```

**Open in browser:**
```
http://localhost:3000
```

## What You Should See

### Backend (http://localhost:8000/docs)
- Interactive Swagger UI documentation
- 15+ API endpoints
- Try out any endpoint directly
- See request/response schemas

### Frontend (http://localhost:3000)
1. **Header** with:
   - FHIR branding (green activity icon)
   - "Backend Connected" indicator (green dot)

2. **Stats Cards** showing:
   - MongoDB
   - FHIR R4
   - Synthetic
   - FastAPI

3. **FHIR Tabs** with three sections:
   - **Resource Browser**: View and search FHIR resources
   - **Synthetic Data**: Generate test data
   - **API Tester**: Test endpoints interactively

## Testing the Application

### 1. Generate Synthetic Data

1. Go to the **Synthetic Data** tab
2. Configure:
   - Patients: 5
   - Encounters per patient: 2
   - Practitioners: 10
   - Care Teams: 5
3. Click **Generate Data**
4. Wait for success message

### 2. Browse Resources

1. Go to the **Resource Browser** tab
2. You should see a list of FHIR resources
3. Try filtering by resource type (Patient, Encounter, etc.)
4. Click on a resource to view details
5. See both the FHIR resource and envelope data side-by-side

### 3. Test API Endpoints

1. Go to the **API Tester** tab
2. Select an endpoint from the dropdown
3. Fill in any required parameters (auto-populated with samples)
4. Click **Test Endpoint**
5. View the JSON response

## Troubleshooting

### Backend won't start

**Error**: `bad interpreter: No such file or directory`
**Solution**: Already fixed! The script now uses `python -m uvicorn` instead of direct path

**Error**: `ModuleNotFoundError: No module named 'certifi'`
**Solution**:
```bash
cd backend
source .venv/bin/activate
pip install certifi
```

**Error**: `pymongo.errors.ServerSelectionTimeoutError`
**Solution**: Check MongoDB connection in `backend/.env`:
```bash
cd backend
cat .env
# Verify MONGODB_URI is correct
```

### Frontend won't start

**Error**: `Cannot find module 'autoprefixer'`
**Solution**: Already fixed! Run:
```bash
cd frontend
npm install autoprefixer
```

**Error**: `Module not found` errors
**Solution**:
```bash
cd frontend
rm -rf .next node_modules
npm install
npm run dev
```

### Backend connected but no data

**Solution**: Generate synthetic data:
```bash
cd backend
source .venv/bin/activate
fhir-tool seed --patients 5 --encounters-per-patient 2
```

### API calls fail with CORS errors

**Solution**: The app uses an API proxy at `/api/internal/[...path]` which should prevent CORS issues. If you still see them:
1. Restart both backend and frontend
2. Check `.env.local` in frontend has correct BACKEND_URL
3. Open browser DevTools and check Network tab for actual error

## Stopping the Servers

### Stop Backend
Press `Ctrl+C` in Terminal 1

### Stop Frontend
Press `Ctrl+C` in Terminal 2

## Next Steps

### Add More Data
```bash
cd backend
source .venv/bin/activate
fhir-tool seed --patients 50 --encounters-per-patient 5
```

### View API Documentation
```
http://localhost:8000/docs
```

### Customize the Theme
Edit `frontend/app/globals.css`:
```css
:root {
  --color-primary: #00A86B;  /* Change this color */
}
```

### Deploy to Production

**Backend**:
1. Update `.env` with production MongoDB URI
2. Set up proper authentication
3. Deploy to AWS, Google Cloud, or your preferred platform
4. Use gunicorn or similar for production ASGI server

**Frontend**:
```bash
cd frontend
npm run build
npm start
```
Then deploy to Vercel, Netlify, or your preferred platform.

## Port Reference

| Service | Port | URL |
|---------|------|-----|
| Backend API | 8000 | http://localhost:8000 |
| API Docs | 8000 | http://localhost:8000/docs |
| Frontend | 3000 | http://localhost:3000 |
| MongoDB | 27017 | (Atlas cloud) |

## File Locations

| Component | Location |
|-----------|----------|
| Backend Code | `backend/fhir_toolkit/` |
| Backend Config | `backend/.env` |
| Frontend App | `frontend/` |
| FHIR Components | `frontend/components/views/fhir/` |
| API Proxy | `frontend/app/api/internal/[...path]/route.js` |
| Styles | `frontend/app/globals.css` |

## Success Checklist

- [ ] Backend starts without errors
- [ ] Health check returns `{"status":"ok"}`
- [ ] Frontend starts without errors
- [ ] Browser shows http://localhost:3000
- [ ] Green "Backend Connected" indicator visible
- [ ] Four stat cards visible
- [ ] Three tabs (Resource Browser, Synthetic Data, API Tester)
- [ ] Can generate synthetic data
- [ ] Can browse resources
- [ ] Can test API endpoints
- [ ] No console errors in browser DevTools

## Getting Help

- **Backend Issues**: See [backend/README.md](backend/README.md)
- **Frontend Issues**: See [frontend/README.md](frontend/README.md)
- **Integration**: See [FRONTEND_ACCESS.md](FRONTEND_ACCESS.md)
- **Setup**: See [SETUP_COMPLETE.md](SETUP_COMPLETE.md)
- **Web App**: See [WEB_APP_COMPLETE.md](WEB_APP_COMPLETE.md)

---

**Ready to go!** Start both servers and open http://localhost:3000 🚀
