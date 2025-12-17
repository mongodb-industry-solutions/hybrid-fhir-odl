from fastapi import FastAPI, Query, Body, HTTPException, Request
from typing import Optional, List, Dict, Any
from .db import get_collection
from .config import settings
from .synth import (
    generate_patients,
    generate_practitioners,
    generate_careteams,
    generate_encounters_for_patients,
)
from .ingest import upsert_documents
from .mappings import envelope, ensure_resource_id, compute_search
from .customer_specs import build_patient_payload, build_encounter_payload, build_cpi_payload
from .search_builders import (
    build_patient_filter,
    build_encounter_filter,
    build_practitioner_filter,
    build_careteam_filter,
)
from starlette.datastructures import QueryParams

# Define API tags for documentation organization
tags_metadata = [
    {
        "name": "Admin API",
        "description": "System health checks and administrative operations for maintenance and testing. Includes data seeding and cleanup operations.",
    },
    {
        "name": "Application API",
        "description": "Custom business logic endpoints including legacy healthcare APIs, data inspection, and discovery tools. Supports local region healthcare conventions (Local ID, PMI cases).",
    },
    {
        "name": "FHIR API",
        "description": "HL7 FHIR R4 compliant endpoints for healthcare interoperability. Standard FHIR resources with Bundle responses and search parameters.",
    },
]

app = FastAPI(
    title="FHIR Mongo Toolkit API",
    version="0.1.2",
    description="Three distinct APIs for FHIR healthcare data management: Admin operations, Application-specific business logic, and HL7 FHIR R4 compliant endpoints.",
    openapi_tags=tags_metadata
)

def _normalize_query_params(params: QueryParams) -> Dict[str, Any]:
    normalized: Dict[str, Any] = {}
    for key in params.keys():
        values = params.getlist(key)
        normalized[key] = values if len(values) > 1 else values[0]
    return normalized

def _bundle_links(request: Request, page: int, limit: int, total: int) -> List[Dict[str, Any]]:
    links: List[Dict[str, Any]] = []
    base = request.url
    links.append({"relation": "self", "url": str(base.include_query_params(page=page, limit=limit))})
    if page > 1:
        links.append({"relation": "prev", "url": str(base.include_query_params(page=page-1, limit=limit))})
    if page * limit < total:
        links.append({"relation": "next", "url": str(base.include_query_params(page=page+1, limit=limit))})
    return links


def _as_list(value: Any) -> List[str]:
    if value is None:
        return []
    if isinstance(value, list):
        return [v for v in value if v is not None]
    return [value]

# ========== ADMIN API ==========

@app.get("/")
async def read_root(request: Request):
    return {"message": "Server is running"}

@app.get("/health", tags=["Admin API"], summary="Health check")
def health():
    """
    Check system health and status.

    Returns the current status and tenant configuration.
    """
    return {"status":"ok","tenant": settings.tenant}

@app.post("/admin/seed", tags=["Admin API"], summary="Generate synthetic FHIR data")
def admin_seed(
    patients: int = Body(50, description="Number of patients to generate"),
    encounters_per_patient: int = Body(3, description="Encounters per patient"),
    practitioners: int = Body(20, description="Number of practitioners"),
    careteams: int = Body(10, description="Number of care teams"),
    tenant: Optional[str] = Body(None, description="Override tenant key for this operation")
):
    """
    Generate synthetic FHIR data for testing and development.
    """
    # 1) Generate canonical FHIR resources
    pats = generate_patients(patients)                 # List[Tuple[resource, app]]
    pracs = generate_practitioners(practitioners)      # List[Dict]
    teams = generate_careteams(careteams)              # List[Dict]  <-- pass only the count

    # 2) Ensure Patient.id exists BEFORE we generate Encounters (to keep references consistent)
    patient_resources: List[Dict[str, Any]] = []
    for resource, _ in pats:
        ensure_resource_id(resource)
        patient_resources.append(resource)

    # 3) Generate Encounters; this returns List[Tuple[resource, app]]
    encs = generate_encounters_for_patients(
        patient_resources, pracs, teams, per_patient=encounters_per_patient
    )

    for r in pracs + teams:
        ensure_resource_id(r)

    # 4) Build upsert pairs for Patient/Practitioner/CareTeam (empty app objects by design)
    pats_env  = pats
    pracs_env = [(r, {}) for r in pracs]
    teams_env = [(r, {}) for r in teams]

    # 5) Upsert all
    tenant_key = tenant or settings.tenant
    total = 0
    total += upsert_documents(pats_env, tenant=tenant_key)
    total += upsert_documents(pracs_env, tenant=tenant_key)
    total += upsert_documents(teams_env, tenant=tenant_key)
    total += upsert_documents(encs, tenant=tenant_key)

    return {
        "ok": True,
        "inserted": total,
        "patients": len(pats_env),
        "practitioners": len(pracs_env),
        "careteams": len(teams_env),
        "encounters": len(encs),
        "tenant": tenant_key
    }

@app.post("/admin/wipe", tags=["Admin API"], summary="Clear all tenant data")
def admin_wipe(
    confirm: bool = Body(False, description="Must be true to confirm data deletion"),
    tenant: Optional[str] = Body(None, description="Override tenant to wipe")
):
    """
    Delete all data for the current tenant.

    **⚠️ WARNING**: This operation cannot be undone!

    Requires `confirm: true` in request body to proceed.
    """
    if not confirm:
        raise HTTPException(status_code=400, detail="Pass confirm=true in body to wipe tenant data")
    tenant_key = tenant or settings.tenant
    coll = get_collection()
    res = coll.delete_many({"tenant": tenant_key})
    return {"ok": True, "deleted": res.deleted_count, "tenant": tenant_key}

# ========== APPLICATION API ==========

@app.get("/inspect/distinctResourceTypes", tags=["Application API"], summary="List all resource types")
def distinct_resource_types():
    """
    Get a list of all distinct FHIR resource types stored in the database.

    Returns a sorted array of resource type names (e.g., Patient, Encounter, Practitioner).
    """
    coll = get_collection()
    types = coll.distinct("resourceType", {"tenant": settings.tenant})
    return {"resourceTypes": sorted([t for t in types if t])}

@app.get("/inspect/sample-local-id", tags=["Application API"], summary="Get sample Local ID")
def sample_local_id():
    """
    Retrieve a sample Local ID from existing patient data.

    Useful for testing and discovering valid Local ID values in the system.
    """
    coll = get_collection()
    doc = coll.find_one({"tenant": settings.tenant, "resourceType":"Patient", "search.local_id": {"$exists": True}}, {"search.local_id":1})
    return {"local_id": (doc or {}).get("search",{}).get("local_id")}


@app.get("/inspect/resources", tags=["Application API"], summary="Search and list resources")
def list_resources(
    resourceType: Optional[str] = None,
    q: Optional[str] = None,
    limit: int = 20,
    page: int = 1
):
    """
    Search and browse FHIR resources with filtering options.

    Supports filtering by:
    - Resource type (Patient, Encounter, etc.)
    - Query string (searches Local ID, case number, doctor code, team code, hospital code, resource ID)

    Returns paginated results with full resource, app, and search data.
    """
    coll = get_collection()
    match = {"tenant": settings.tenant}
    if resourceType:
        match["resourceType"] = resourceType
    if q:
        match["$or"] = [
            {"search.local_id": q},
            {"search.caseNum": q},
            {"search.doctorCode": q},
            {"search.teamCode": q},
            {"search.hospCode": q},
            {"resource.id": q}
        ]
    cur = coll.find(match, {"resource":1,"app":1,"search":1}).sort("_id",-1).skip(max(0,(page-1))*limit).limit(limit)
    items = []
    for d in cur:
        d["_id"] = str(d["_id"])
        items.append(d)
    total = coll.count_documents(match)
    return {"items": items, "total": total, "page": page, "limit": limit}

@app.get("/inspect/resource/{rtype}/{rid}", tags=["Application API"], summary="Get specific resource")
def get_resource(rtype: str, rid: str):
    """
    Retrieve a specific FHIR resource by type and ID.

    Returns the full envelope including resource, app, and search data.
    """
    coll = get_collection()
    d = coll.find_one({"tenant": settings.tenant, "resourceType": rtype, "resource.id": rid}, {"resource":1,"app":1,"search":1})
    if not d:
        raise HTTPException(status_code=404, detail="Not found")
    d["_id"] = str(d["_id"])
    return d

@app.get("/inspect/sample-values/{rtype}", tags=["Application API"], summary="Get sample values for search fields")
def get_sample_values(rtype: str, limit: int = 5):
    """
    Discover sample values from the database for use in search demonstrations.

    Returns example values for common search fields like gender, status, identifiers, etc.
    Useful for populating UI dropdowns and creating realistic search presets.
    """
    coll = get_collection()
    result = {}

    if rtype == "Patient":
        # Get sample Local IDs
        local_ids = coll.distinct("search.local_id", {"tenant": settings.tenant, "resourceType": "Patient", "search.local_id": {"$exists": True}})
        result["local_ids"] = local_ids[:limit]
        # hkids removed - use local_ids instead

        # Get sample genders
        genders = coll.distinct("resource.gender", {"tenant": settings.tenant, "resourceType": "Patient"})
        result["genders"] = genders

        # Get sample family names
        families = coll.distinct("resource.name.family", {"tenant": settings.tenant, "resourceType": "Patient"})
        result["familyNames"] = [f for f in families if f][:limit]

        # Get sample cities
        cities = coll.distinct("resource.address.city", {"tenant": settings.tenant, "resourceType": "Patient"})
        result["cities"] = [c for c in cities if c][:limit]

        # Get birth date range
        oldest = coll.find_one({"tenant": settings.tenant, "resourceType": "Patient", "resource.birthDate": {"$exists": True}}, {"resource.birthDate": 1}, sort=[("resource.birthDate", 1)])
        youngest = coll.find_one({"tenant": settings.tenant, "resourceType": "Patient", "resource.birthDate": {"$exists": True}}, {"resource.birthDate": 1}, sort=[("resource.birthDate", -1)])
        if oldest and youngest:
            result["birthDateRange"] = {
                "min": oldest.get("resource", {}).get("birthDate"),
                "max": youngest.get("resource", {}).get("birthDate")
            }

    elif rtype == "Encounter":
        # Get sample statuses
        statuses = coll.distinct("resource.status", {"tenant": settings.tenant, "resourceType": "Encounter"})
        result["statuses"] = statuses

        # Get sample hospital codes
        hospCodes = coll.distinct("search.hospCode", {"tenant": settings.tenant, "resourceType": "Encounter", "search.hospCode": {"$exists": True}})
        result["hospitalCodes"] = hospCodes[:limit]

        # Get sample doctor codes
        doctorCodes = coll.distinct("search.doctorCode", {"tenant": settings.tenant, "resourceType": "Encounter", "search.doctorCode": {"$exists": True}})
        result["doctorCodes"] = [d for d in doctorCodes if d][:limit]

        # Get sample team codes
        teamCodes = coll.distinct("search.teamCode", {"tenant": settings.tenant, "resourceType": "Encounter", "search.teamCode": {"$exists": True}})
        result["teamCodes"] = [t for t in teamCodes if t][:limit]

        # Get date range
        oldest = coll.find_one(
            {"tenant": settings.tenant, "resourceType": "Encounter", "search.start": {"$exists": True}},
            {"search.start": 1},
            sort=[("search.start", 1)]
        )
        newest = coll.find_one(
            {"tenant": settings.tenant, "resourceType": "Encounter", "search.start": {"$exists": True}},
            {"search.start": 1},
            sort=[("search.start", -1)]
        )
        if oldest and newest:
            result["dateRange"] = {
                "min": oldest.get("search", {}).get("start"),
                "max": newest.get("search", {}).get("start")
            }

    return result

@app.get("/inspect/patient-summary/{value}", tags=["Application API"], summary="Cross-resource patient graph")
def patient_summary(value: str, by: str = Query("id", description="Use 'id' for lookup"), encounter_limit: int = 5):
    """
    Return a compact cross-resource view of a patient, their encounters, and the practitioners/care teams involved.

    Demonstrates how the four stored resource types can be joined without leaving MongoDB.
    """
    by_key = (by or "id").lower()
    if by_key != "id":
        raise HTTPException(status_code=400, detail="Parameter 'by' must be 'id'")

    coll = get_collection()
    patient_query = {"tenant": settings.tenant, "resourceType": "Patient"}
    patient_query["resource.id"] = value
    patient_doc = coll.find_one(patient_query, {"resource": 1, "app": 1, "search": 1})
    if not patient_doc:
        raise HTTPException(status_code=404, detail="Patient not found")

    patient_key = patient_doc.get("search", {}).get("patientKey") or patient_doc["resource"].get("id")
    encounter_query = {"tenant": settings.tenant, "resourceType": "Encounter"}
    encounter_query["search.patientKey"] = patient_key

    enc_cursor = coll.find(encounter_query, {"resource": 1, "search": 1}).sort("search.start", -1).limit(encounter_limit)
    encounters = []
    doctor_codes = set()
    specialist_codes = set()
    team_codes = set()
    for enc in enc_cursor:
        encounters.append(enc["resource"])
        meta = enc.get("search") or {}
        if meta.get("doctorCode"):
            doctor_codes.add(meta["doctorCode"])
        if meta.get("specialistCode"):
            specialist_codes.add(meta["specialistCode"])
        if meta.get("teamCode"):
            team_codes.add(meta["teamCode"])

    practitioner_docs = {}
    practitioner_codes = list(doctor_codes.union(specialist_codes))
    if practitioner_codes:
        prac_cursor = coll.find(
            {
                "tenant": settings.tenant,
                "resourceType": "Practitioner",
                "search.doctorCode": {"$in": practitioner_codes}
            },
            {"resource": 1, "search": 1}
        )
        for doc in prac_cursor:
            code = (doc.get("search") or {}).get("doctorCode")
            if code:
                practitioner_docs[code] = doc["resource"]

    careteam_docs = {}
    if team_codes:
        care_cursor = coll.find(
            {
                "tenant": settings.tenant,
                "resourceType": "CareTeam",
                "search.teamCode": {"$in": list(team_codes)}
            },
            {"resource": 1, "search": 1}
        )
        for doc in care_cursor:
            code = (doc.get("search") or {}).get("teamCode")
            if code:
                careteam_docs[code] = doc["resource"]

    total_encounters = coll.count_documents(encounter_query)
    return {
        "patient": patient_doc["resource"],
        "encounters": encounters,
        "totalEncounters": total_encounters,
        "practitioners": practitioner_docs,
        "careTeams": careteam_docs,
        "codes": {
            "doctorCodes": sorted(doctor_codes),
            "specialistCodes": sorted(specialist_codes),
            "teamCodes": sorted(team_codes)
        },
        "limits": {"encounterLimit": encounter_limit}
    }

@app.get("/patients/by-local-id", tags=["Application API"], summary="Find patients by Local ID")
def patient_by_local_id(local_id: str, hospCode: Optional[str] = None, limit: int = 20, page: int = 1):
    """
    Find patient records by Local ID.

    Optionally filter by hospital code. Returns resource and app data for each match.
    Results are sorted by last updated timestamp.
    """

    # Use local_id field for patient lookup
    q = {"tenant": settings.tenant, "resourceType": "Patient", "search.local_id": local_id}
    if hospCode:
        q["search.mrns.hospCode"] = hospCode
    coll = get_collection()
    cur = coll.find(q, {"resource":1, "app":1}).sort("resource.meta.lastUpdated", -1).skip((page-1)*limit).limit(limit)
    return [ {"resource": d["resource"], "app": d.get("app",{})} for d in cur ]

@app.get("/pmicases/by-local-id", tags=["Application API"], summary="Get PMI cases by Local ID")
def pmi_cases_by_local_id(local_id: str, hospCode: Optional[str]=None, limit: int = 50, page: int = 1):
    """
    Retrieve Patient Management Information (PMI) cases by Local ID.

    Finds all encounters (hospital visits) associated with a patient's Local ID.
    Optionally filter by hospital code. Returns sorted by encounter start date.
    """
    coll = get_collection()
    pat = coll.find_one({"tenant": settings.tenant, "resourceType":"Patient", "search.local_id": local_id}, {"search.patientKey":1})
    if not pat:
        return []
    q = {"tenant": settings.tenant, "resourceType":"Encounter", "search.patientKey": pat["search"]["patientKey"]}
    if hospCode:
        q["search.hospCode"] = hospCode
    cur = coll.find(q, {"resource":1, "app":1}).sort("search.start", -1).skip((page-1)*limit).limit(limit)
    return [ {"resource": d["resource"], "app": d.get("app",{})} for d in cur ]

@app.get("/cpi/cases/by-team", tags=["Application API"], summary="Get CPI cases by care team")
def cpi_cases_by_team(
    hospCode: str,
    teamCode: Optional[str] = None,
    wardCode: Optional[str] = None,
    specCode: Optional[str] = None,
    statusCode: Optional[str] = None,
    limit: int = 50, page: int = 1
):
    """
    Retrieve Clinical Process Improvement (CPI) cases by care team filters.

    Query encounters by:
    - Hospital code (required)
    - Team code (care team identifier)
    - Ward code (hospital ward)
    - Specialty code (medical specialty)
    - Status code (encounter status)

    Returns encounters sorted by start date.
    """
    q = {"tenant": settings.tenant, "resourceType":"Encounter", "search.hospCode": hospCode}
    if teamCode: q["search.teamCode"] = teamCode
    if wardCode: q["search.wardCode"] = wardCode
    if specCode: q["search.specCode"] = specCode
    if statusCode: q["search.statusCode"] = statusCode
    coll = get_collection()
    cur = coll.find(q, {"resource":1, "app":1}).sort("search.start", -1).skip((page-1)*limit).limit(limit)
    return [ {"resource": d["resource"], "app": d.get("app",{})} for d in cur ]

@app.get("/cpi/cases/by-mo", tags=["Application API"], summary="Get CPI cases by medical officer")
def cpi_cases_by_mo(
    hospCode: str,
    doctorCode: Optional[str] = None,
    specialistCode: Optional[str] = None,
    caseType: Optional[List[str]] = Query(default=None),
    statusCode: Optional[str] = None,
    limit: int = 50, page: int = 1
):
    """
    Retrieve Clinical Process Improvement (CPI) cases by medical officer filters.

    Query encounters by:
    - Hospital code (required)
    - Doctor code (attending physician)
    - Specialist code (consulting specialist)
    - Case type (multiple types can be specified)
    - Status code (encounter status)

    Returns encounters sorted by start date.
    """
    q = {"tenant": settings.tenant, "resourceType":"Encounter", "search.hospCode": hospCode}
    if doctorCode: q["search.doctorCode"] = doctorCode
    if specialistCode: q["search.specialistCode"] = specialistCode
    if statusCode: q["search.statusCode"] = statusCode
    if caseType: q["search.caseType"] = {"$in": caseType}
    coll = get_collection()
    cur = coll.find(q, {"resource":1, "app":1}).sort("search.start", -1).skip((page-1)*limit).limit(limit)
    return [ {"resource": d["resource"], "app": d.get("app",{})} for d in cur ]

# ========== CUSTOMER SPEC-COMPLIANT API ==========

@app.get("/api/v1/patient/_by-local-id/", tags=["Application API"], summary="[SPEC] Find patients by Local ID (GET)")
@app.post("/api/v1/patient/_by-local-id/find", tags=["Application API"], summary="[SPEC] Find patients by Local ID (POST)")
def spec_patient_by_local_id(
    local_id: Optional[str] = None,
    hospCode: Optional[str] = None,
    limit: int = 20,
    page: int = 1
):
    """
    Customer spec-compliant endpoint: Find patients by Local ID.

    Supports both GET and POST methods as per customer specification.
    Returns data in format: {"data": [...], "count": N}

    Parameters match MDM_PMI_patient_api specification.
    """
    q = {"tenant": settings.tenant, "resourceType": "Patient"}
    if local_id:
        q["search.local_id"] = local_id
    if hospCode:
        q["search.mrns.hospCode"] = hospCode

    coll = get_collection()
    total = coll.count_documents(q)
    cur = list(
        coll.find(q, {"resource": 1, "app": 1}).sort("resource.meta.lastUpdated", -1).skip((page - 1) * limit).limit(limit)
    )
    data = [build_patient_payload(doc.get("resource", {}), doc.get("app", {}), doc.get("_id")) for doc in cur]
    return {"data": data, "count": total}

@app.get("/api/v1/pmi_case/_by-local-id/", tags=["Application API"], summary="[SPEC] Get PMI cases by Local ID (GET)")
@app.post("/api/v1/pmi_case/_by-local-id/find", tags=["Application API"], summary="[SPEC] Get PMI cases by Local ID (POST)")
def spec_pmi_cases_by_local_id(
    local_id: Optional[str] = None,
    hospCode: Optional[str] = None,
    patientKey: Optional[str] = None,
    limit: int = 20,
    page: int = 1
):
    """
    Customer spec-compliant endpoint: Retrieve PMI cases by Local ID.

    Supports both GET and POST methods as per customer specification.
    Returns data in format: {"data": [...], "count": N}

    Parameters match MDM_PMI_pmi_case specification.
    """
    coll = get_collection()

    # If patientKey is provided, use it directly; otherwise find by Local ID
    if not patientKey and local_id:
        pat = coll.find_one({"tenant": settings.tenant, "resourceType":"Patient", "search.local_id": local_id}, {"search.patientKey":1})
        if not pat:
            return {"data": [], "count": 0}
        patientKey = pat["search"]["patientKey"]

    if not patientKey:
        return {"data": [], "count": 0}

    q = {"tenant": settings.tenant, "resourceType":"Encounter", "search.patientKey": patientKey}
    if hospCode:
        q["search.hospCode"] = hospCode

    total = coll.count_documents(q)
    enc_docs = list(
        coll.find(q, {"resource": 1, "app": 1, "search.patientKey": 1}).sort("search.start", -1).skip((page - 1) * limit).limit(limit)
    )
    patient_ids = [doc.get("search", {}).get("patientKey") for doc in enc_docs if doc.get("search", {}).get("patientKey")]
    patient_ids = [pid for pid in patient_ids if pid]
    patient_map: Dict[str, Dict[str, Any]] = {}
    if patient_ids:
        patient_cursor = coll.find(
            {"tenant": settings.tenant, "resourceType": "Patient", "resource.id": {"$in": patient_ids}},
            {"resource": 1, "app": 1}
        )
        for pat_doc in patient_cursor:
            pid = pat_doc.get("resource", {}).get("id")
            if pid:
                patient_map[pid] = pat_doc
    data = []
    for doc in enc_docs:
        pid = doc.get("search", {}).get("patientKey")
        patient_resource = None
        patient_payload = None
        patient_resource = patient_map.get(pid) if pid else None
        if patient_resource:
            patient_payload = build_patient_payload(
                patient_resource.get("resource", {}),
                patient_resource.get("app", {}),
                patient_resource.get("_id"),
            )
        encounter_payload = build_encounter_payload(doc.get("resource", {}), doc.get("app", {}), doc.get("_id"), None)
        if patient_payload:
            encounter_payload["patient"] = patient_payload
        data.append(encounter_payload)

    return {"data": data, "count": total}

@app.get("/api/v1/cpi_case/_by-team/", tags=["Application API"], summary="[SPEC] Get CPI cases by team (GET)")
@app.post("/api/v1/cpi_case/_by-team/find", tags=["Application API"], summary="[SPEC] Get CPI cases by team (POST)")
def spec_cpi_cases_by_team(
    hospCode: str,
    teamCode: Optional[str] = None,
    wardCode: Optional[str] = None,
    specCode: Optional[str] = None,
    statusCode: Optional[str] = None,
    caseType: Optional[str] = None,
    limit: int = 20,
    page: int = 1
):
    """
    Customer spec-compliant endpoint: Retrieve CPI cases by care team.

    Supports both GET and POST methods as per customer specification.
    Returns data in format: {"data": [...], "count": N}

    Parameters match MDM_HPI_cpi_case specification.
    """
    q = {"tenant": settings.tenant, "resourceType":"Encounter", "search.hospCode": hospCode}
    if teamCode: q["search.teamCode"] = teamCode
    if wardCode: q["search.wardCode"] = wardCode
    if specCode: q["search.specCode"] = specCode
    if statusCode: q["search.statusCode"] = statusCode
    if caseType: q["search.caseType"] = caseType

    coll = get_collection()
    total = coll.count_documents(q)
    enc_docs = list(
        coll.find(q, {"resource": 1, "app": 1, "search.patientKey": 1}).sort("search.start", -1).skip((page - 1) * limit).limit(limit)
    )
    patient_ids = [doc.get("search", {}).get("patientKey") for doc in enc_docs if doc.get("search", {}).get("patientKey")]
    patient_ids = [pid for pid in patient_ids if pid]
    patient_map: Dict[str, Dict[str, Any]] = {}
    if patient_ids:
        patient_cursor = coll.find(
            {"tenant": settings.tenant, "resourceType": "Patient", "resource.id": {"$in": patient_ids}},
            {"resource": 1, "app": 1}
        )
        for pat_doc in patient_cursor:
            pid = pat_doc.get("resource", {}).get("id")
            if pid:
                patient_map[pid] = pat_doc
    data = []
    for doc in enc_docs:
        pid = doc.get("search", {}).get("patientKey")
        patient_payload = None
        patient_resource = patient_map.get(pid) if pid else None
        if patient_resource:
            patient_payload = build_patient_payload(
                patient_resource.get("resource", {}),
                patient_resource.get("app", {}),
                patient_resource.get("_id"),
            )
        payload = build_cpi_payload(
            doc.get("resource", {}),
            doc.get("app", {}),
            doc.get("_id"),
            None,
            patient_payload,
        )
        data.append(payload)

    return {"data": data, "count": total}

@app.get("/api/v1/cpi_case/_by-mo/", tags=["Application API"], summary="[SPEC] Get CPI cases by MO (GET)")
@app.post("/api/v1/cpi_case/_by-mo/find", tags=["Application API"], summary="[SPEC] Get CPI cases by MO (POST)")
def spec_cpi_cases_by_mo(
    hospCode: str,
    doctorCode: Optional[str] = None,
    specialistCode: Optional[str] = None,
    caseType: Optional[List[str]] = Query(default=None),
    statusCode: Optional[str] = "AC",
    limit: int = 20,
    page: int = 1
):
    """
    Customer spec-compliant endpoint: Retrieve CPI cases by medical officer.

    Supports both GET and POST methods as per customer specification.
    Returns data in format: {"data": [...], "count": N}

    Parameters match MDM_PI_cpi_case specification (legacy: MDM_HPI_cpi_case).
    Default statusCode is "AC" as per spec.
    Default caseType is ["I","A"] if not specified.
    """
    if caseType is None:
        caseType = ["I", "A"]

    q = {"tenant": settings.tenant, "resourceType":"Encounter", "search.hospCode": hospCode}
    if doctorCode: q["search.doctorCode"] = doctorCode
    if specialistCode: q["search.specialistCode"] = specialistCode
    if statusCode: q["search.statusCode"] = statusCode
    if caseType: q["search.caseType"] = {"$in": caseType}

    coll = get_collection()
    total = coll.count_documents(q)
    enc_docs = list(
        coll.find(q, {"resource": 1, "app": 1, "search.patientKey": 1}).sort("search.start", -1).skip((page - 1) * limit).limit(limit)
    )
    patient_ids = [doc.get("search", {}).get("patientKey") for doc in enc_docs if doc.get("search", {}).get("patientKey")]
    patient_ids = [pid for pid in patient_ids if pid]
    patient_map: Dict[str, Dict[str, Any]] = {}
    if patient_ids:
        patient_cursor = coll.find(
            {"tenant": settings.tenant, "resourceType": "Patient", "resource.id": {"$in": patient_ids}},
            {"resource": 1, "app": 1}
        )
        for pat_doc in patient_cursor:
            pid = pat_doc.get("resource", {}).get("id")
            if pid:
                patient_map[pid] = pat_doc
    data = []
    for doc in enc_docs:
        pid = doc.get("search", {}).get("patientKey")
        patient_payload = None
        patient_resource = patient_map.get(pid) if pid else None
        if patient_resource:
            patient_payload = build_patient_payload(
                patient_resource.get("resource", {}),
                patient_resource.get("app", {}),
                patient_resource.get("_id"),
            )
        payload = build_cpi_payload(
            doc.get("resource", {}),
            doc.get("app", {}),
            doc.get("_id"),
            None,
            patient_payload,
        )
        data.append(payload)

    return {"data": data, "count": total}

# ========== FHIR API ==========

@app.get("/fhir/Practitioner", tags=["FHIR API"], summary="Search Practitioner resources")
def fhir_practitioner(
    request: Request,
    limit: int = 20, page: int = 1
):
    """
    FHIR R4 Practitioner search endpoint.

    Supports identifier, name, family, given, telecom, and active filters.
    """
    accelerated = request.headers.get("x-search-mode", "canonical").lower() == "accelerated"
    params = _normalize_query_params(request.query_params)
    mongo_filter = build_practitioner_filter(params, accelerated)
    mongo_filter.update({"tenant": settings.tenant, "resourceType": "Practitioner"})
    coll = get_collection()
    skip = max(page - 1, 0) * limit
    total = coll.count_documents(mongo_filter)
    cur = coll.find(mongo_filter, {"resource": 1}).sort("_id", -1).skip(skip).limit(limit)
    bundle = {
        "resourceType": "Bundle",
        "type": "searchset",
        "total": total,
        "link": _bundle_links(request, page, limit, total),
        "entry": [{"resource": d["resource"]} for d in cur]
    }
    return bundle

@app.get("/fhir/CareTeam", tags=["FHIR API"], summary="Search CareTeam resources")
def fhir_careteam(
    request: Request,
    limit: int = 20, page: int = 1
):
    """
    FHIR R4 CareTeam search endpoint.

    Supports identifier, name, status, hospCode/teamCode filters (accelerated when available).
    """
    accelerated = request.headers.get("x-search-mode", "canonical").lower() == "accelerated"
    params = _normalize_query_params(request.query_params)
    mongo_filter = build_careteam_filter(params, accelerated)
    mongo_filter.update({"tenant": settings.tenant, "resourceType": "CareTeam"})
    coll = get_collection()
    skip = max(page - 1, 0) * limit
    total = coll.count_documents(mongo_filter)
    cur = coll.find(mongo_filter, {"resource": 1}).sort("_id", -1).skip(skip).limit(limit)
    bundle = {
        "resourceType": "Bundle",
        "type": "searchset",
        "total": total,
        "link": _bundle_links(request, page, limit, total),
        "entry": [{"resource": d["resource"]} for d in cur]
    }
    return bundle

@app.get("/fhir/Patient", tags=["FHIR API"], summary="Search Patient resources")
def fhir_patient(request: Request, limit: int = 20, page: int = 1):
    """
    FHIR R4 compliant Patient search endpoint with advanced search parameters.

    Supports multiple FHIR search parameters:
    - `identifier` - Search by identifier with system|value format (local_id|A123456(7), mrn:HOSPCODE|12345)
    - `name` - Search by any name (family, given, or text)
    - `family` - Search by family name
    - `given` - Search by given name
    - `gender` - Search by gender (male, female, other, unknown)
    - `birthdate` - Search by birth date (supports prefixes: eq, ne, gt, ge, lt, le)
    - `address`, `address-city`, `address-state`, `address-country`, `address-postalcode` - Address search
    - `phone`, `email`, `telecom` - Contact information search
    - `active` - Filter by active status (true/false)
    - `deceased` - Filter by deceased status
    - `language` - Search by communication language
    - `general-practitioner`, `organization`, `link` - Reference searches

    **Search Modes** (via header):
    - `x-search-mode: accelerated` - Use optimized search fields (faster)
    - `x-search-mode: canonical` - Use standard FHIR resource fields (default)

    **Debug Mode** (via header):
    - `x-debug-filter: true` - Return MongoDB filter along with results

    Returns a FHIR Bundle (searchset) containing matching Patient resources.
    """
    accelerated = request.headers.get("x-search-mode", "canonical").lower() == "accelerated"
    params = _normalize_query_params(request.query_params)
    includes = _as_list(params.pop("_include", None))
    rev_includes = _as_list(params.pop("_revinclude", None))
    mongo_filter = build_patient_filter(params, accelerated)
    mongo_filter.update({"tenant": settings.tenant, "resourceType": "Patient"})
    coll = get_collection()
    skip = max(page - 1, 0) * limit
    total = coll.count_documents(mongo_filter)
    cur = coll.find(mongo_filter, {"resource": 1}).skip(skip).limit(limit)
    primary_entries = [{"resource": d["resource"]} for d in cur]
    bundle = {
        "resourceType": "Bundle",
        "type": "searchset",
        "total": total,
        "link": _bundle_links(request, page, limit, total),
        "entry": primary_entries
    }
    if rev_includes:
        patient_ids = [entry["resource"].get("id") for entry in primary_entries if entry.get("resource")]
        patient_ids = [pid for pid in patient_ids if pid]
        rev_targets = {"Encounter:subject", "Encounter:patient"}
        if patient_ids and any(token in rev_targets for token in rev_includes):
            ref_values = [f"Patient/{pid}" for pid in patient_ids]
            rev_filter = {
                "tenant": settings.tenant,
                "resourceType": "Encounter",
                "$or": [
                    {"resource.subject.reference": {"$in": ref_values}},
                    {"search.patientKey": {"$in": patient_ids}}
                ]
            }
            rev_cursor = coll.find(rev_filter, {"resource": 1}).limit(200)
            for doc in rev_cursor:
                bundle["entry"].append({
                    "resource": doc["resource"],
                    "search": {"mode": "include"}
                })
    if request.headers.get("x-debug-filter", "false").lower() == "true":
        # Build aggregation pipeline representation
        pipeline = [
            {"$match": mongo_filter},
            {"$project": {"resource": 1}},
            {"$skip": (page - 1) * limit},
            {"$limit": limit}
        ]
        return {
            "bundle": bundle,
            "mongoFilter": mongo_filter,
            "mongoPipeline": pipeline,
            "mode": ("accelerated" if accelerated else "canonical")
        }
    return bundle

@app.get("/fhir/Encounter", tags=["FHIR API"], summary="Search Encounter resources")
def fhir_encounter(
    request: Request,
    limit: int = 50, page: int = 1
):
    """
    FHIR R4 compliant Encounter search endpoint with advanced search parameters.

    Supports multiple FHIR search parameters:
    - `identifier` - Search by encounter identifier with system|value format
    - `status` - Encounter status (planned, in-progress, finished, etc.)
    - `class` - Encounter class code (inpatient, outpatient, emergency, etc.)
    - `type` - Encounter type with system|code format
    - `subject` or `patient` - Patient reference (Patient/123 or use subject.identifier)
    - `subject.identifier` - Patient identifier (format: local_id|A123456(7))
    - `participant` or `practitioner` - Practitioner reference
    - `participant.identifier` - Practitioner/doctor code
    - `date` - Date range when encounter occurred (supports prefixes)
    - `date-start` - Encounter start date (supports prefixes: eq, ne, gt, ge, lt, le)
    - `end-date` - Encounter end date
    - `location` - Location reference
    - `length` - Encounter length/duration (supports numeric comparisons)
    - `reason-code` - Reason code for encounter
    - `diagnosis-code` - Diagnosis code
    - `service-provider` - Service provider/hospital reference
    - `careteam` - Care team reference
    - `appointment` - Appointment reference

    **Search Modes** (via header):
    - `x-search-mode: accelerated` - Use optimized search fields (faster)
    - `x-search-mode: canonical` - Use standard FHIR resource fields (default)

    **Debug Mode** (via header):
    - `x-debug-filter: true` - Return MongoDB filter along with results

    Returns a FHIR Bundle (searchset) containing matching Encounter resources,
    sorted by encounter start date (most recent first).
    """
    accelerated = request.headers.get("x-search-mode", "canonical").lower() == "accelerated"
    params = _normalize_query_params(request.query_params)
    includes = _as_list(params.pop("_include", None))
    mongo_filter = build_encounter_filter(params, accelerated)
    mongo_filter.update({"tenant": settings.tenant, "resourceType": "Encounter"})
    coll = get_collection()
    sort_field = "search.start" if accelerated else "resource.period.start"
    skip = max(page - 1, 0) * limit
    total = coll.count_documents(mongo_filter)
    cur = coll.find(mongo_filter, {"resource": 1}).sort(sort_field, -1).skip(skip).limit(limit)
    primary_entries = [{"resource": d["resource"]} for d in cur]
    bundle = {
        "resourceType": "Bundle",
        "type": "searchset",
        "total": total,
        "link": _bundle_links(request, page, limit, total),
        "entry": primary_entries
    }
    if includes:
        include_targets = {"Encounter:subject", "Encounter:patient"}
        requested = {token for token in includes if token in include_targets}
        if requested:
            patient_refs = []
            for entry in primary_entries:
                ref = entry["resource"].get("subject", {}).get("reference")
                if ref and ref.startswith("Patient/"):
                    patient_refs.append(ref.split("/", 1)[1])
            patient_refs = list({pid for pid in patient_refs if pid})
            if patient_refs:
                patient_cursor = coll.find(
                    {"tenant": settings.tenant, "resourceType": "Patient", "resource.id": {"$in": patient_refs}},
                    {"resource": 1}
                )
                for doc in patient_cursor:
                    bundle["entry"].append({
                        "resource": doc["resource"],
                        "search": {"mode": "include"}
                    })
    if request.headers.get("x-debug-filter", "false").lower() == "true":
        # Build aggregation pipeline representation
        pipeline = [
            {"$match": mongo_filter},
            {"$sort": {sort_field: -1}},
            {"$skip": (page - 1) * limit},
            {"$limit": limit},
            {"$project": {"resource": 1}}
        ]
        return {
            "bundle": bundle,
            "mongoFilter": mongo_filter,
            "mongoPipeline": pipeline,
            "mode": ("accelerated" if accelerated else "canonical")
        }
    return bundle