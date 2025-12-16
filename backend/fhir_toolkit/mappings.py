
from typing import Dict, Any, Optional, List, Set
from .config import settings
from .search_config import allowed_fields
import uuid

LOCAL_ID_SYSTEM = "local_id"
CASE_NUM_SYSTEM = "caseNum"
MRN_PREFIX = "mrn:"  # we expect MRN identifiers with system like "mrn:QH"
SPECIALIST_ROLE_CODES: Set[str] = {"SPRF", "CON", "CONS", "SPECIALIST", "SPC"}

def _get_identifier(resource: Dict[str, Any], system_prefix: str, exact: bool = True) -> Optional[str]:
    """Return first identifier whose system matches (exact or startswith) system_prefix."""
    for idf in resource.get("identifier", []) or []:
        sys = idf.get("system")
        if not sys:
            continue
        if exact and sys == system_prefix and "value" in idf:
            return idf["value"]
        if not exact and sys.startswith(system_prefix) and "value" in idf:
            return idf["value"]
    return None

def _collect_mrns(resource: Dict[str, Any]) -> List[Dict[str, str]]:
    out: List[Dict[str, str]] = []
    for idf in resource.get("identifier", []) or []:
        sys = idf.get("system")
        val = idf.get("value")
        if not sys or not val:
            continue
        if sys.startswith(MRN_PREFIX):
            hosp = sys.split(":", 1)[1]
            out.append({"hospCode": hosp, "mrn": val})
    return out

def _get_reference_identifier(ref_obj: Dict[str, Any], system: str) -> Optional[str]:
    """Read Reference.identifier value when available."""
    identifiers = ref_obj.get("identifier")
    if isinstance(identifiers, dict):
        identifiers = [identifiers]
    for idf in identifiers or []:
        if idf.get("system") == system and idf.get("value"):
            return idf["value"]
    return None

def _participant_role_codes(part: Dict[str, Any]) -> Set[str]:
    codes: Set[str] = set()
    for concept in part.get("type") or []:
        for coding in concept.get("coding") or []:
            code = coding.get("code")
            if code:
                codes.add(str(code).upper())
    return codes

def ensure_resource_id(resource: Dict[str, Any]) -> None:
    if "id" not in resource or not resource["id"]:
        resource["id"] = str(uuid.uuid4())

def compute_search(resource: Dict[str, Any], app: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Compute small 'search' fields for accelerated queries while remaining FHIR-first."""
    app = app or {}
    rtype = resource.get("resourceType")
    s: Dict[str, Any] = {}
    enabled_fields = allowed_fields(settings.enable_fhir_denorm)

    def _put(field: str, value: Any):
        if value is None:
            return
        if field in enabled_fields:
            s[field] = value

    if rtype == "Patient":
        # Stable link key used by PMI/CPI helpers (FHIR-first: just reuse Patient.id)
        _put("patientKey", resource.get("id"))
        # Identifiers & demographics
        _put("local_id", _get_identifier(resource, LOCAL_ID_SYSTEM, exact=True))
        # hkid removed - use local_id instead
        _put("gender", resource.get("gender"))
        _put("dob", resource.get("birthDate"))
        # Names
        names = resource.get("name") or []
        if names:
            family = names[0].get("family")
            given = (names[0].get("given") or [None])[0]
            full_name = names[0].get("text") or " ".join([given or "", family or ""]).strip() or None
            _put("family", family)
            _put("given", given)
            _put("name", full_name)
        # Address
        addrs = resource.get("address") or []
        if addrs:
            _put("city", addrs[0].get("city"))
            _put("district", addrs[0].get("district") or addrs[0].get("state"))
        # Local region ccCodes (array of up to 6 ints)
        cc_from_ext: List[int] = []
        for ext in resource.get("extension", []) or []:
            if ext.get("url") == "http://example.org/local/StructureDefinition/ccCodes":
                v = ext.get("valueInteger")
                if isinstance(v, int):
                    cc_from_ext.append(v)
        if not cc_from_ext and "ccCodes" in app:
            try:
                cc_from_ext = [int(x) for x in (app.get("ccCodes") or [])]
            except Exception:
                cc_from_ext = []
        _put("ccCodes", cc_from_ext[:6])    # keep your current field name
        # MRNs by hospital: [{"hospCode": "...", "mrn": "..."}]
        _put("mrns", _collect_mrns(resource))

    elif rtype == "CareTeam":
        s["teamCode"] = _get_identifier(resource, "teamCode", exact=True)
        s["hospCode"] = _get_identifier(resource, "hospCode", exact=True)

    elif rtype == "Practitioner":
        s["doctorCode"] = _get_identifier(resource, "doctorCode", exact=True)
        names = resource.get("name") or []
        if names:
            s["name"] = names[0].get("text") or " ".join(names[0].get("given") or []) or names[0].get("family")

    elif rtype == "Encounter":
        # Period accelerators (your storage uses search.start/search.end)
        period = resource.get("period") or {}
        s["start"] = period.get("start")
        s["end"] = period.get("end")
        # Subject Local ID and patientKey (from reference)
        subj = resource.get("subject") or {}
        if "identifier" in subj:
            idf = subj["identifier"]
            if isinstance(idf, dict) and idf.get("system") == LOCAL_ID_SYSTEM:
                s["local_id"] = idf.get("value")
                # hkid removed - use local_id instead
        # Extract Patient/{id} -> patientKey
        ref = subj.get("reference") or ""
        if ref.startswith("Patient/"):
            s["patientKey"] = ref.split("/", 1)[1]
        # Practitioner, CareTeam, Org/Ward, Specialty
        doctor_code = None
        specialist_code = None
        for part in resource.get("participant", []) or []:
            ind = part.get("individual") or {}
            ref = ind.get("reference") or ""
            ref_code = ref.split("/", 1)[1] if ref.startswith("Practitioner/") else None
            ref_codes = _participant_role_codes(part)
            id_doctor = _get_reference_identifier(ind, "doctorCode")
            id_specialist = _get_reference_identifier(ind, "specialistCode")

            if id_doctor:
                doctor_code = doctor_code or id_doctor
            if id_specialist:
                specialist_code = specialist_code or id_specialist

            if ref_code:
                if ref_codes & SPECIALIST_ROLE_CODES:
                    specialist_code = specialist_code or ref_code
                elif not doctor_code:
                    doctor_code = ref_code
                elif not specialist_code:
                    specialist_code = ref_code

        if doctor_code:
            _put("doctorCode", doctor_code)
        if specialist_code:
            _put("specialistCode", specialist_code)
        for ct in resource.get("careTeam", []) or []:
            r = ct.get("reference") or ""
            if r.startswith("CareTeam/"):
                _put("teamCode", r.split("/", 1)[1])
        sp = resource.get("serviceProvider") or {}
        r = sp.get("reference") or ""
        if r.startswith("Organization/"):
            _put("hospCode", r.split("/", 1)[1])
        for loc in resource.get("location", []) or []:
            loc_ref = (loc.get("location") or {}).get("reference") or ""
            if loc_ref.startswith("Location/"):
                _put("wardCode", loc_ref.split("/", 1)[1])
        types = resource.get("type") or []
        if types and types[0].get("coding"):
            _put("specCode", types[0]["coding"][0].get("code"))
        # Encounter identifiers & codes
        _put("caseNum", _get_identifier(resource, CASE_NUM_SYSTEM, exact=True))
        _put("statusCode", resource.get("status"))
        klass = (resource.get("class") or {}).get("code")
        _put("caseType", {"IMP":"I","AMB":"A","EMER":"E"}.get(klass))

    return s

def envelope(resource: Dict[str, Any], app: Optional[Dict[str, Any]] = None, tenant: Optional[str] = None) -> Dict[str, Any]:
    """Wrap a FHIR resource into the storage envelope."""
    ensure_resource_id(resource)
    app = app or {}
    return {
        "tenant": tenant or settings.tenant,
        "resourceType": resource.get("resourceType"),
        "resource": resource,
        "app": app,
        "search": compute_search(resource, app)
    }
