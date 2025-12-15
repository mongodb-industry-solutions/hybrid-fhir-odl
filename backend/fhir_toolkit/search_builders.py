
from typing import Dict, Any, Optional, Tuple, List
import re
from datetime import datetime
from .config import settings
from .search_config import allowed_fields

def _parse_date_token(s: str) -> Tuple[str, Optional[str]]:
    """
    Parse FHIR date prefixes (ge,gt,le,lt,eq,ne,sa,eb,ap). Returns (op, iso).
    This is intentionally simple for demo usage.
    """
    if not s:
        return "eq", None
    m = re.match(r'^(ge|gt|le|lt|ne|eq|sa|eb|ap)?(.*)$', s)
    if not m:
        return "eq", None
    op = m.group(1) or "eq"
    iso = m.group(2)
    # naive validation
    try:
        datetime.fromisoformat(iso.replace("Z","").replace("z",""))
    except Exception:
        pass
    return op, iso

def _ensure_list(val: Any) -> List[Any]:
    if val is None:
        return []
    if isinstance(val, list):
        return val
    return [val]

def _clauses_to_query(clauses: List[Dict[str, Any]]) -> Dict[str, Any]:
    if not clauses:
        return {}
    if len(clauses) == 1:
        return clauses[0]
    return {"$and": clauses}

def _parse_bool(val: Any) -> Optional[bool]:
    if isinstance(val, bool):
        return val
    if isinstance(val, str):
        lowered = val.lower()
        if lowered in ("true","1","t","yes","y"):
            return True
        if lowered in ("false","0","f","no","n"):
            return False
    return None

def build_patient_filter(params: Dict[str, Any], accelerated: bool = True) -> Dict[str, Any]:
    """
    Support common Patient params:
      - identifier (token) e.g. local_id|A123456(7) or hkid|A123456(7) or mrn:QH|12345
      - gender, birthdate (prefixes), name (contains), address-city, address-district
      - general-practitioner, organization (references)
      - telecom (contains)
    In accelerated mode we use precomputed 'search.*' fields when possible.
    """
    clauses: List[Dict[str, Any]] = []
    enabled = allowed_fields(settings.enable_fhir_denorm)
    def add(clause: Dict[str, Any]):
        if clause:
            clauses.append(clause)

    # identifier (token)
    for ident in _ensure_list(params.get("identifier")):
        if "|" not in ident:
            continue
        system, value = ident.split("|", 1)
        if accelerated and "local_id" in enabled and (system == "local_id" or system == "hkid"):
            add({"search.local_id": value})
        # Backward compatibility: support hkid queries
        if accelerated and "hkid" in enabled and system == "hkid":
            add({"search.hkid": value})
        elif accelerated and "mrns" in enabled and system.startswith("mrn:"):
            add({"search.mrns": {"$elemMatch": {"hospCode": system.split(":",1)[1], "mrn": value}}})
        else:
            add({"resource.identifier": {"$elemMatch": {"system": system, "value": value}}})

    # birthdate
    use_search_dob = accelerated and "dob" in enabled
    fld_birth = "search.dob" if use_search_dob else "resource.birthDate"
    for tok in _ensure_list(params.get("birthdate")):
        op, iso = _parse_date_token(tok)
        if not iso:
            continue
        if op in ("ge","gt","le","lt"):
            add({fld_birth: {f"${op}": iso}})
        elif op == "eq":
            add({fld_birth: iso})
        elif op == "ne":
            add({fld_birth: {"$ne": iso}})

    # gender
    if "gender" in params:
        fld = "search.gender" if (accelerated and "gender" in enabled) else "resource.gender"
        add({fld: params["gender"]})

    # active
    if "active" in params:
        val = params["active"]
        if isinstance(val, str):
            val = val.lower() in ("true","1","t","yes")
        add({"resource.active": val})

    # name / family / given
    if "name" in params:
        pattern = params["name"]
        target = "search.name" if (accelerated and "name" in enabled) else "resource.name.text"
        add({target: {"$regex": pattern, "$options": "i"}})
    if "family" in params:
        target = "search.family" if (accelerated and "family" in enabled) else "resource.name.family"
        add({target: {"$regex": params["family"], "$options": "i"}})
    if "given" in params:
        target = "search.given" if (accelerated and "given" in enabled) else "resource.name.given"
        add({target: {"$regex": params["given"], "$options": "i"}})

    # address filters
    def _regex_clause(field: str, value: str):
        return {field: {"$regex": value, "$options": "i"}}

    if "address" in params:
        add(_regex_clause("resource.address.text", params["address"]))
    if "address-city" in params:
        fld = "search.city" if (accelerated and "city" in enabled) else "resource.address.city"
        add(_regex_clause(fld, params["address-city"]))
    if "address-district" in params:
        fld = "search.district" if (accelerated and "district" in enabled) else "resource.address.district"
        add(_regex_clause(fld, params["address-district"]))
    if "address-state" in params:
        fld = "search.district" if accelerated else "resource.address.state"
        add(_regex_clause(fld, params["address-state"]))
    if "address-country" in params:
        add(_regex_clause("resource.address.country", params["address-country"]))
    if "address-postalcode" in params:
        add(_regex_clause("resource.address.postalCode", params["address-postalcode"]))
    if "address-use" in params:
        add({"resource.address.use": params["address-use"]})

    # telecom / phone / email
    if "telecom" in params:
        add({"resource.telecom.value": {"$regex": params["telecom"], "$options": "i"}})
    if "phone" in params:
        add({"resource.telecom": {"$elemMatch": {"system": "phone", "value": {"$regex": params["phone"], "$options": "i"}}}})
    if "email" in params:
        add({"resource.telecom": {"$elemMatch": {"system": "email", "value": {"$regex": params["email"], "$options": "i"}}}})

    # practitioner / organization links
    for key, canon_field in [
        ("general-practitioner", "resource.generalPractitioner.reference"),
        ("organization", "resource.managingOrganization.reference"),
        ("link", "resource.link.other.reference"),
    ]:
        if key in params:
            add({canon_field: params[key]})

    # language
    if "language" in params:
        add({"resource.communication": {"$elemMatch": {"language.coding.code": params["language"]}}})

    # deceased + death-date
    if "deceased" in params:
        val = params["deceased"]
        if isinstance(val, str):
            val = val.lower() in ("true","1","t","yes")
        add({"resource.deceasedBoolean": val})
    for tok in _ensure_list(params.get("death-date")):
        op, iso = _parse_date_token(tok)
        if not iso:
            continue
        if op in ("ge","gt","le","lt"):
            add({"resource.deceasedDateTime": {f"${op}": iso}})
        elif op == "eq":
            add({"resource.deceasedDateTime": iso})
        elif op == "ne":
            add({"resource.deceasedDateTime": {"$ne": iso}})

    return _clauses_to_query(clauses)

def build_encounter_filter(params: Dict[str, Any], accelerated: bool = True) -> Dict[str, Any]:
    """
    Support Encounter params:
      - subject.identifier (token) -> Local ID
      - participant.identifier (token) -> doctorCode
      - class, status
      - date-start (ge/le etc), end-date
      - service-provider (Organization reference), careteam (CareTeam reference)
      - appointment (Appointment reference)
      - Custom accelerated filters: teamCode, doctorCode, hospCode, caseType, statusCode
    """
    clauses: List[Dict[str, Any]] = []
    enabled = allowed_fields(settings.enable_fhir_denorm)
    def add(clause: Dict[str, Any]):
        if clause:
            clauses.append(clause)

    # identifier (token)
    for ident in _ensure_list(params.get("identifier")):
        if "|" not in ident:
            continue
        system, value = ident.split("|", 1)
        if accelerated and system == "caseNum" and "caseNum" in enabled:
            add({"search.caseNum": value})
        else:
            add({"resource.identifier": {"$elemMatch": {"system": system, "value": value}}})

    # Patient Local ID via subject.identifier
    for subj_ident in _ensure_list(params.get("subject.identifier")):
        if "|" not in subj_ident:
            continue
        system, value = subj_ident.split("|", 1)
        if accelerated and (system == "local_id" or system == "hkid") and "local_id" in enabled:
            add({"search.local_id": value})
        # Backward compatibility: support hkid queries
        if accelerated and system == "hkid" and "hkid" in enabled:
            add({"search.hkid": value})
        else:
            add({"resource.subject.identifier": {"system": system, "value": value}})

    # subject / patient reference
    for key in ("subject", "patient"):
        if key in params:
            ref = params[key]
            if "/" not in ref:
                ref = f"Patient/{ref}"
            add({"resource.subject.reference": ref})

    # Participant practitioner (doctor)
    for part_ident in _ensure_list(params.get("participant.identifier")):
        if "|" not in part_ident:
            continue
        system, value = part_ident.split("|", 1)
        if accelerated and system in ("doctorCode","practitionerCode") and "doctorCode" in enabled:
            add({"search.doctorCode": value})
        else:
            add({"resource.participant.identifier": {"system": system, "value": value}})

    if "participant" in params:
        ref = params["participant"]
        add({"resource.participant.individual.reference": ref})

    # class & status (canonical)
    if "class" in params:
        add({"resource.class.code": params["class"]})
    if "status" in params:
        add({"resource.status": params["status"]})

    # Encounter type
    for typ in _ensure_list(params.get("type")):
        if "|" in typ:
            system, code = typ.split("|", 1)
            add({"resource.type": {"$elemMatch": {"coding": {"$elemMatch": {"system": system, "code": code}}}}})
        else:
            add({"resource.type.coding.code": typ})

    # Date range + date convenience
    date_fields = [
        ("date-start", "resource.period.start", "search.start", "start"),
        ("end-date", "resource.period.end", "search.end", "end"),
        ("date", "resource.period.start", "search.start", "start"),
    ]
    for key, canon_field, accel_field, field_name in date_fields:
        for tok in _ensure_list(params.get(key)):
            op, iso = _parse_date_token(tok)
            if not iso:
                continue
            use_search = accelerated and field_name in enabled
            target = accel_field if use_search else canon_field
            if op in ("ge","gt","le","lt"):
                add({target: {f"${op}": iso}})
            elif op == "eq":
                add({target: iso})
            elif op == "ne":
                add({target: {"$ne": iso}})

    # Canonical references
    if "service-provider" in params:
        add({"resource.serviceProvider.reference": params["service-provider"]})
    if "careteam" in params:
        add({"resource.careTeam.reference": params["careteam"]})
    if "appointment" in params:
        add({"resource.appointment.reference": params["appointment"]})
    if "location" in params:
        add({"resource.location.location.reference": params["location"]})

    # Length
    for tok in _ensure_list(params.get("length")):
        op = "eq"
        val = tok
        m = re.match(r'^(ge|gt|le|lt|ne|eq)?(.*)$', tok)
        if m:
            op = m.group(1) or "eq"
            val = m.group(2)
        try:
            num = float(val)
        except ValueError:
            continue
        if op in ("ge","gt","le","lt"):
            add({"resource.length.value": {f"${op}": num}})
        elif op == "ne":
            add({"resource.length.value": {"$ne": num}})
        else:
            add({"resource.length.value": num})

    # Reason / diagnosis codes
    if "reason-code" in params:
        code = params["reason-code"]
        if "|" in code:
            system, value = code.split("|", 1)
            add({"resource.reasonCode": {"$elemMatch": {"coding": {"$elemMatch": {"system": system, "code": value}}}}})
        else:
            add({"resource.reasonCode.coding.code": code})
    if "diagnosis-code" in params:
        val = params["diagnosis-code"]
        add({"resource.diagnosis.condition.reference": val})

    # Accelerated custom filters
    for k in ["teamCode", "doctorCode", "hospCode", "caseType", "statusCode", "wardCode", "specCode", "caseNum"]:
        if k in params:
            if k in enabled:
                add({f"search.{k}": params[k]})
            else:
                add({f"resource.{k}": params[k]})

    return _clauses_to_query(clauses)

def build_practitioner_filter(params: Dict[str, Any], accelerated: bool = True) -> Dict[str, Any]:
    clauses: List[Dict[str, Any]] = []

    def add(clause: Dict[str, Any]):
        if clause:
            clauses.append(clause)

    for ident in _ensure_list(params.get("identifier")):
        if "|" not in ident:
            continue
        system, value = ident.split("|", 1)
        if accelerated and system == "doctorCode":
            add({"search.doctorCode": value})
        else:
            add({"resource.identifier": {"$elemMatch": {"system": system, "value": value}}})

    if "doctorCode" in params:
        fld = "search.doctorCode" if accelerated else "resource.identifier"
        if accelerated:
            add({fld: params["doctorCode"]})
        else:
            add({"resource.identifier": {"$elemMatch": {"system": "doctorCode", "value": params["doctorCode"]}}})

    if "name" in params:
        target = "search.name" if accelerated else "resource.name.text"
        add({target: {"$regex": params["name"], "$options": "i"}})
    if "family" in params:
        add({"resource.name.family": {"$regex": params["family"], "$options": "i"}})
    if "given" in params:
        add({"resource.name.given": {"$regex": params["given"], "$options": "i"}})

    if "active" in params:
        parsed = _parse_bool(params["active"])
        if parsed is not None:
            add({"resource.active": parsed})

    if "telecom" in params:
        add({"resource.telecom.value": {"$regex": params["telecom"], "$options": "i"}})

    if "organization" in params:
        add({"resource.qualification": {"$elemMatch": {"issuer.reference": params["organization"]}}})

    return _clauses_to_query(clauses)

def build_careteam_filter(params: Dict[str, Any], accelerated: bool = True) -> Dict[str, Any]:
    clauses: List[Dict[str, Any]] = []

    def add(clause: Dict[str, Any]):
        if clause:
            clauses.append(clause)

    for ident in _ensure_list(params.get("identifier")):
        if "|" not in ident:
            continue
        system, value = ident.split("|", 1)
        if accelerated and system == "teamCode":
            add({"search.teamCode": value})
        elif accelerated and system == "hospCode":
            add({"search.hospCode": value})
        else:
            add({"resource.identifier": {"$elemMatch": {"system": system, "value": value}}})

    if "teamCode" in params:
        fld = "search.teamCode" if accelerated else "resource.identifier"
        if accelerated:
            add({fld: params["teamCode"]})
        else:
            add({"resource.identifier": {"$elemMatch": {"system": "teamCode", "value": params["teamCode"]}}})

    if "hospCode" in params:
        fld = "search.hospCode" if accelerated else "resource.identifier"
        if accelerated:
            add({fld: params["hospCode"]})
        else:
            add({"resource.identifier": {"$elemMatch": {"system": "hospCode", "value": params["hospCode"]}}})

    if "name" in params:
        add({"resource.name": {"$regex": params["name"], "$options": "i"}})

    if "status" in params:
        add({"resource.status": params["status"]})

    return _clauses_to_query(clauses)
