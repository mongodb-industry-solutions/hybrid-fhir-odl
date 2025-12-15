# fhir-mongo-toolkit

Generate synthetic FHIR resources and publish them to MongoDB. Exposes both a **CLI** and a **FastAPI** service.
Includes a light **mapping layer** that wraps valid FHIR JSON in an envelope for app/search fields:

```json
{
  "tenant": "<TENANT>",
  "resourceType": "Patient",
  "resource": { ... valid FHIR JSON ... },
  "app": { ... non-FHIR operational fields ... },
  "search": { ... small derived fields for fast querying ... }
}
```

## Quick start

1) **Python env & install**
```bash
python -m venv .venv && source .venv/bin/activate
pip install -e .
```

2) **Configure environment**
```bash
cp .env.sample .env
# edit .env with your MongoDB URI, DB, collection, tenant
```

3) **Create indexes**
```bash
fhir-tool init-db
```

4) **Seed synthetic data**
```bash
# 100 patients, 3 encounters per patient
fhir-tool seed --patients 100 --encounters-per-patient 3
```

5) **Run the API**
```bash
uvicorn fhir_toolkit.api:app --reload --port 8000
```

### CLI help
```bash
fhir-tool --help
```

## Environment (.env)
- `MONGODB_URI` MongoDB connection string
- `MONGODB_DB` Database name (default: fhir_demo)
- `MONGODB_COLLECTION` Collection name (default: fhir)
- `TENANT` Tenant key used for sharding/scoping (default: acme)

(Optional)
- `FHIR_BASE_URL` Reserved for future upstream FHIR interactions

## Indexes created
- Unique: `{ tenant:1, resourceType:1, "resource.id":1 }`
- Patient by Local ID: `{ tenant:1, resourceType:1, "search.local_id":1 }`
- Patient by HKID (legacy): `{ tenant:1, resourceType:1, "search.hkid":1 }`
- Encounters by patientKey/time: `{ tenant:1, resourceType:1, "search.patientKey":1, "search.start":-1 }`
- Team filter: `{ tenant:1, resourceType:1, "search.teamCode":1, "search.statusCode":1 }`
- Doctor filter: `{ tenant:1, resourceType:1, "search.doctorCode":1, "search.caseType":1 }`

> Sharding: recommend a compound shard key `{ tenant:1, "search.patientKey":1 }` at the cluster level.

## API endpoints (subset)
- `GET /health`
- `GET /patients/by-local-id?local_id=...&hospCode=...`
- `GET /patients/by-hkid?hkid=...&hospCode=...` (legacy)
- `GET /pmicases/by-local-id?local_id=...`
- `GET /pmicases/by-hkid?hkid=...` (legacy)
- `GET /cpi/cases/by-team?hospCode=...&teamCode=...`
- `GET /cpi/cases/by-mo?hospCode=...&doctorCode=...`
- FHIR-like:
  - `GET /fhir/Patient?identifier=local_id|{LOCAL_ID}`
  - `GET /fhir/Patient?identifier=hkid|{HKID}` (legacy)
  - `GET /fhir/Encounter?subject.identifier=local_id|{LOCAL_ID}`
  - `GET /fhir/Encounter?subject.identifier=hkid|{HKID}` (legacy)
  - `GET /fhir/Encounter?participant.identifier={doctorCode}`

## License
MIT
