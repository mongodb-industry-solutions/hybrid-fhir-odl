"""Customer payload mapping helpers.

Each field from the PDF specification maps to either a canonical FHIR
element (preferred) or remains in the application envelope when there is
no interoperable representation.  These helpers build the JSON payloads
expected by the customer APIs without duplicating data between
`resource` and `app`.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional, Set


def _resource_id(resource: Dict[str, Any]) -> Optional[str]:
    return resource.get("id")


def _get_identifier(resource: Dict[str, Any], system_prefix: str) -> Optional[str]:
    for ident in resource.get("identifier", []) or []:
        system = ident.get("system")
        if not system:
            continue
        if system == system_prefix or system.startswith(f"{system_prefix}:"):
            return ident.get("value")
    return None


def _get_identifiers(resource: Dict[str, Any], prefix: str) -> List[Dict[str, str]]:
    values: List[Dict[str, str]] = []
    for ident in resource.get("identifier", []) or []:
        system = ident.get("system") or ""
        if not system.startswith(prefix):
            continue
        suffix = system.split(":", 1)[1] if ":" in system else ""
        values.append({"system": suffix, "value": ident.get("value")})
    return values


def _first_text(values: List[Dict[str, Any]], language: Optional[str] = None) -> Optional[str]:
    for name in values or []:
        lang = name.get("language") or (name.get("extension", [{}])[0] or {}).get("valueCode")
        if language and lang != language:
            continue
        if name.get("text"):
            return name["text"]
        given = " ".join(name.get("given") or [])
        if given or name.get("family"):
            return f"{given} {name.get('family') or ''}".strip()
    return None


def _phone(resource: Dict[str, Any], use: str) -> Optional[str]:
    for telecom in resource.get("telecom", []) or []:
        if telecom.get("system") == "phone" and telecom.get("use") == use:
            return telecom.get("value")
    return None


def build_patient_payload(
    resource: Dict[str, Any],
    app: Dict[str, Any],
    doc_id: Optional[Any] = None,
) -> Dict[str, Any]:
    """Assemble the PATIENT response body for local ID or HKID lookup."""

    address = (resource.get("address") or [{}])[0]
    medical_rec_nums = [
        {"hospCode": ident["system"], "mrn": ident["value"]}
        for ident in _get_identifiers(resource, "mrn")
    ]
    patient_key = _resource_id(resource)
    hospital_data = [
        {
            "_id": f"{patient_key}:{entry['hospCode']}" if patient_key and entry.get("hospCode") else None,
            "mrn": entry.get("mrn"),
            "patientKey": patient_key,
            "hospCode": entry.get("hospCode"),
        }
        for entry in medical_rec_nums
    ]
    last_updated = (resource.get("meta") or {}).get("lastUpdated")
    out: Dict[str, Any] = {
        "_id": str(doc_id) if doc_id is not None else patient_key,
        "dobStr": app.get("dobStr") or resource.get("birthDate"),
        "deathDate": resource.get("deceasedDateTime"),
        "deathFlag": resource.get("deceasedBoolean"),
        "dob": resource.get("birthDate"),
        "sex": resource.get("gender"),
        "name": _first_text(resource.get("name") or []),
        "chiName": _first_text(resource.get("name") or [], language="zh"),
        "localId": _get_identifier(resource, "local_id") or _get_identifier(resource, "hkid"),
        "hkid": _get_identifier(resource, "hkid"),  # Keep for backward compatibility
        "medicalRecNum": medical_rec_nums,
        "hospitalData": app.get("hospitalData") or hospital_data,
        "homePhone": _phone(resource, "home"),
        "officePhone": _phone(resource, "work"),
        "otherPhone": _phone(resource, "other"),
        "maritalStatus": (resource.get("maritalStatus") or {}).get("text")
            or (resource.get("maritalStatus") or {}).get("coding", [{}])[0].get("code"),
        "fullAddress": address.get("text") or " ".join(address.get("line") or []),
        "fullAddressChi": next((addr.get("text") for addr in (resource.get("address") or []) if addr.get("language") == "zh"), None),
        "documentType": app.get("documentType"),
        "documentCode": app.get("documentCode"),
        "lastDocumentType": app.get("lastDocumentType"),
        "religion": app.get("religion"),
        "race": app.get("race"),
        "exactDobFlag": app.get("exactDobFlag"),
        "lastPayCode": app.get("lastPayCode"),
        "otherDocNum": _get_identifier(resource, "doc:other") or app.get("otherDocNum"),
        "patientKey": patient_key,
        "patientName": app.get("patientName") or _first_text(resource.get("name") or []),
        "accessCode": app.get("accessCode"),
        "deathIndicator": app.get("deathIndicator") or ("Y" if resource.get("deceasedBoolean") else "N"),
        "ccCodes": app.get("ccCodes", []),
        "hospCode": ((resource.get("managingOrganization") or {}).get("reference") or "").split("/", 1)[-1] or None,
        "last_update_datetime": last_updated,
        "lastUpdateDatetime": app.get("lastUpdateDatetime") or last_updated,
    }
    return out


def build_encounter_payload(
    resource: Dict[str, Any],
    app: Dict[str, Any],
    doc_id: Optional[Any] = None,
    episode: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    period = resource.get("period") or {}
    hospitalization = resource.get("hospitalization") or {}
    location = (resource.get("location") or [{}])[0]
    discharge = hospitalization.get("dischargeDisposition", {}).get("coding", [{}])[0]
    service_type = ((resource.get("serviceType") or {}).get("coding") or [{}])[0].get("code")
    admit_source = ((hospitalization.get("admitSource") or {}).get("coding") or [{}])[0].get("code")
    encounter_id = str(doc_id) if doc_id is not None else _resource_id(resource)
    out: Dict[str, Any] = {
        "_id": encounter_id,
        "caseNum": _get_identifier(resource, "caseNum"),
        "hospCode": ((resource.get("serviceProvider") or {}).get("reference") or "").split("/", 1)[-1] or None,
        "admissionDate": period.get("start"),
        "dischargeDate": period.get("end"),
        "caseType": (resource.get("class") or {}).get("code"),
        "status": resource.get("status"),
        "dischargeCode": discharge.get("code"),
        "lastSpecCode": service_type or ((resource.get("type") or [{}])[0].get("coding") or [{}])[0].get("code"),
        "wardCode": ((location.get("location") or {}).get("reference") or "").split("/", 1)[-1] or None,
        "wardClass": app.get("wardClass"),
        "lastWardCode": ((location.get("location") or {}).get("reference") or "").split("/", 1)[-1] or None,
        "lastWardClass": app.get("wardClass"),
        "lastBedNum": app.get("lastBedNum"),
        "patientKey": ((resource.get("subject") or {}).get("reference") or "").split("/", 1)[-1] or None,
        "patientType": app.get("patientType"),
        "sourceHospCode": ((hospitalization.get("origin") or {}).get("reference") or "").split("/", 1)[-1] or None,
        "sourceIndicator": app.get("sourceIndicator"),
        "patientGroup": app.get("patientGroup"),
        "statusCode": resource.get("status"),
    }
    return out


def build_cpi_payload(
    resource: Dict[str, Any],
    app: Dict[str, Any],
    doc_id: Optional[Any] = None,
    episode: Optional[Dict[str, Any]] = None,
    patient_snapshot: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    base = build_encounter_payload(resource, app, doc_id=doc_id, episode=episode)
    base.update(
        {
            "sourceCode": ((resource.get("hospitalization") or {}).get("admitSource") or {}).get("coding", [{}])[0].get("code"),
            "cpiPatient": patient_snapshot,
            "dischargeInformation": _build_discharge_information(resource, str(doc_id) if doc_id is not None else base.get("_id")),
        }
    )
    return base


def _extract_practitioner_code(resource: Dict[str, Any], targets: Set[str]) -> Optional[str]:
    for participant in resource.get("participant", []) or []:
        codes = set()
        for concept in participant.get("type") or []:
            for coding in concept.get("coding") or []:
                if coding.get("code"):
                    codes.add(str(coding["code"]).upper())
        if codes & targets:
            ref = (participant.get("individual") or {}).get("reference")
            if ref and "/" in ref:
                return ref.split("/", 1)[1]
    return None


def _care_team_code(resource: Dict[str, Any]) -> Optional[str]:
    for care in resource.get("careTeam", []) or []:
        ref = care.get("reference")
        if ref and "/" in ref:
            return ref.split("/", 1)[1]
    return None


def _build_discharge_information(resource: Dict[str, Any], parent_id: Optional[str]) -> List[Dict[str, Any]]:
    info: List[Dict[str, Any]] = []
    period = resource.get("period") or {}
    hosp_code = ((resource.get("serviceProvider") or {}).get("reference") or "").split("/", 1)[-1] or None
    case_num = _get_identifier(resource, "caseNum")
    specialty = ((resource.get("serviceType") or {}).get("coding") or [{}])[0].get("code")
    if not specialty:
        specialty = ((resource.get("type") or [{}])[0].get("coding") or [{}])[0].get("code")
    specialist_code = _extract_practitioner_code(resource, {"SPRF", "SPECIALIST", "CONS"})
    doctor_code = _extract_practitioner_code(resource, {"ATND"})
    team_code = _care_team_code(resource)
    if any([specialty, specialist_code, doctor_code, team_code, hosp_code, case_num]):
        info.append(
            {
                "_id": f"{parent_id}:discharge:0" if parent_id else None,
                "specialty": specialty,
                "specialistIc": specialist_code,
                "moInChargeId": doctor_code,
                "dischargeTeam": team_code,
                "hospCode": hosp_code,
                "caseNum": case_num,
                "createDate": period.get("end") or (resource.get("meta") or {}).get("lastUpdated"),
            }
        )
    return info