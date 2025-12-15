from typing import Dict, Set, TypedDict, Literal


class SearchFieldConfig(TypedDict):
    path: str
    category: Literal["fhir", "custom"]


# Central registry of denormalized search fields. "category" indicates whether
# the value can be read directly from the canonical FHIR structure ("fhir") or
# represents a custom/customer-only attribute ("custom").
SEARCH_FIELDS: Dict[str, SearchFieldConfig] = {
    "local_id": {"path": "Patient.identifier(local_id)", "category": "custom"},
    "hkid": {"path": "Patient.identifier(local_id)", "category": "custom"},  # Backward compatibility
    "name": {"path": "Patient.name[0].text", "category": "fhir"},
    "family": {"path": "Patient.name[0].family", "category": "fhir"},
    "given": {"path": "Patient.name[0].given[0]", "category": "fhir"},
    "dob": {"path": "Patient.birthDate", "category": "fhir"},
    "gender": {"path": "Patient.gender", "category": "fhir"},
    "city": {"path": "Patient.address[0].city", "category": "fhir"},
    "district": {"path": "Patient.address[0].district", "category": "fhir"},
    "mrns": {"path": "Patient.identifier(mrn:{hosp})", "category": "custom"},
    "ccCodes": {"path": "Patient.extension(ccCodes)", "category": "custom"},
    "caseNum": {"path": "Encounter.identifier(caseNum)", "category": "custom"},
    "caseType": {"path": "Encounter.class.code", "category": "custom"},
    "specCode": {"path": "Encounter.serviceType.coding[0].code", "category": "custom"},
    "statusCode": {"path": "Encounter.status", "category": "custom"},
    "start": {"path": "Encounter.period.start", "category": "fhir"},
    "end": {"path": "Encounter.period.end", "category": "fhir"},
    "patientKey": {"path": "Encounter.subject.reference", "category": "custom"},
    "hospCode": {"path": "Encounter.serviceProvider.reference", "category": "custom"},
    "wardCode": {"path": "Encounter.location[0].location.reference", "category": "custom"},
    "doctorCode": {"path": "Encounter.participant(ATND)", "category": "custom"},
    "specialistCode": {"path": "Encounter.participant(SPRF)", "category": "custom"},
    "teamCode": {"path": "Encounter.careTeam.reference", "category": "custom"},
}


def allowed_fields(enable_fhir_denorm: bool) -> Set[str]:
    if enable_fhir_denorm:
        return set(SEARCH_FIELDS.keys())
    return {name for name, cfg in SEARCH_FIELDS.items() if cfg["category"] == "custom"}
