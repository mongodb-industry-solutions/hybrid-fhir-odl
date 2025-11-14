# FHIR Web Application

A Next.js web application for managing FHIR (Fast Healthcare Interoperability Resources) data with a MongoDB backend.

## Features

- **Resource Browser**: Browse and search FHIR resources (Patient, Encounter, Practitioner, CareTeam)
- **Synthetic Data Generator**: Create realistic test data for development
- **API Tester**: Test all backend endpoints interactively
- **Real-time Data**: Live connection to FastAPI backend

## Prerequisites

- Node.js 18+ and npm
- Backend API server running (see `../backend/`)

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment** (already done in `.env.local`):
   ```env
   NEXT_PUBLIC_ENABLE_FHIR=true
   NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
   ```

3. **Start the backend** (in another terminal):
   ```bash
   cd ../backend
   source .venv/bin/activate
   uvicorn fhir_toolkit.api:app --host 0.0.0.0 --port 8000 --reload
   ```

4. **Start the frontend**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   ```
   http://localhost:3000
   ```

## Project Structure

```
frontend/
├── app/
│   ├── api/internal/[...path]/  # Backend API proxy
│   ├── globals.css              # Global styles (FHIR themed)
│   ├── layout.js                # Root layout
│   └── page.js                  # Home page
├── components/
│   ├── AppContainer.jsx         # Main app wrapper
│   └── views/fhir/              # FHIR components
│       ├── FhirTabs.jsx         # Main tab interface
│       ├── FhirResourceBrowser.jsx
│       ├── FhirSyntheticPanel.jsx
│       ├── FhirApiTester.jsx
│       └── JsonEditor.jsx
├── public/
│   └── fhir-icon.svg            # FHIR logo
└── .env.local                   # Environment variables
```

## Available Scripts

- `npm run dev` - Start development server (http://localhost:3000)
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Components

### Resource Browser
- Browse all FHIR resources in MongoDB
- Filter by resource type
- Search by HKID, case number, codes
- View resource details with JSON formatting
- Side-by-side view of FHIR resource and envelope data

### Synthetic Data Generator
- Generate synthetic patients, encounters, practitioners, care teams
- Configurable quantities
- Realistic Hong Kong healthcare data
- Wipe all data with confirmation

### API Tester
- Test all backend endpoints
- Dynamic parameter inputs
- Pre-populated sample data
- JSON response viewer with syntax highlighting

## API Proxy

The app includes an API proxy at `/api/internal/[...path]` that forwards requests to the backend. This avoids CORS issues and keeps the backend URL configurable.

Example:
```javascript
// Frontend makes request to:
fetch('/api/internal/inspect/distinctResourceTypes')

// Proxy forwards to:
http://localhost:8000/inspect/distinctResourceTypes
```

## Customization

### Theme Colors
Edit `app/globals.css` to customize the color scheme:
```css
:root {
  --color-primary: #00A86B;      /* FHIR green */
  --color-primary-hover: #008F5B;
  /* ... more colors */
}
```

### Backend URL
Change in `.env.local`:
```env
NEXT_PUBLIC_BACKEND_URL=http://your-backend:8000
```

## Development

### Hot Reload
The development server supports hot reload. Changes to components will reflect immediately.

### Debugging
- Check browser console for errors
- Backend logs appear in the terminal running uvicorn
- Network tab shows API requests/responses

## Deployment

### Build for Production
```bash
npm run build
npm start
```

### Environment Variables
Set these in production:
- `NEXT_PUBLIC_ENABLE_FHIR=true`
- `NEXT_PUBLIC_BACKEND_URL=https://your-backend-api.com`

## Troubleshooting

### Backend Connection Failed
- Ensure backend is running on port 8000
- Check `.env.local` has correct BACKEND_URL
- Verify CORS settings if running on different domains

### Components Not Loading
- Clear `.next` folder and rebuild: `rm -rf .next && npm run dev`
- Check console for import errors

### API Errors
- Check backend logs
- Verify MongoDB connection in backend
- Test endpoints directly at http://localhost:8000/docs

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + Custom CSS Variables
- **Icons**: Lucide React
- **Code Editor**: Monaco Editor (VS Code editor)
- **Language**: JavaScript/JSX (TypeScript-ready)

## License

This project is part of the tapdata-hybrid-fhir toolkit.

## Support

For issues or questions:
- Backend API docs: http://localhost:8000/docs
- Main project README: `../README.md`
