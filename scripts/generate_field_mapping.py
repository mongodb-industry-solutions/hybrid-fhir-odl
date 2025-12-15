#!/usr/bin/env python3
"""Generate field mapping documentation (Markdown + CSV)."""
from __future__ import annotations

import csv
from pathlib import Path
from typing import List, Dict


def row(
    domain: str,
    field: str,
    interpretation: str,
    bucket: str,
    resource: str,
    target: str,
    transformation: str,
    indexed: str = "No",
    search: str = "",
) -> Dict[str, str]:
    return {
        "Domain": domain,
        "Field": field,
        "Interpretation": interpretation,
        "Bucket": bucket,
        "FHIR Resource": resource,
        "Target Path": target,
        "Transformation": transformation,
        "Indexed?": indexed,
        "Search Params": search,
    }


ROWS: List[Dict[str, str]] = [
    # Patient
    row("Patient", "_id", "Mongo envelope identifier", "APP", "Envelope", "app._id", "Stringified ObjectId from MongoDB"),
    row("Patient", "patientKey", "Master patient identifier", "FHIR_CORE", "Patient", "Patient.id", "Use canonical Patient.id; mirrored to search.patientKey", "Yes", "Patient._id"),
    row("Patient", "dob", "Birth date (search/comparison)", "FHIR_CORE", "Patient", "Patient.birthDate", "Store ISO date; mirror to search.dob", "Yes", "Patient.birthdate"),
    row("Patient", "dobStr", "Display-friendly DOB", "APP", "Application", "app.dobStr", "Presentation string derived from Patient.birthDate"),
    row("Patient", "deathDate", "Deceased date/time", "FHIR_CORE", "Patient", "Patient.deceasedDateTime", "Populate when exact date provided"),
    row("Patient", "deathFlag", "Deceased indicator", "FHIR_CORE", "Patient", "Patient.deceasedBoolean", "Only set when deathDate absent; map bool to Y/N in payload"),
    row("Patient", "sex", "Administrative sex", "FHIR_CORE", "Patient", "Patient.gender", "Map {M,F,U} ↔ {male,female,unknown}", "Yes", "Patient.gender"),
    row("Patient", "name", "Official name (English)", "FHIR_CORE", "Patient", "Patient.name[0]", "Prefer name.text else combine given/family", "", "Patient.name"),
    row("Patient", "chiName", "Official name (Chinese)", "FHIR_CORE", "Patient", "Patient.name[language=zh]", "Pick first name entry tagged zh"),
    row("Patient", "patientName", "Legacy display name", "APP", "Application", "app.patientName", "Copy of English name for CPI snapshots"),
    row("Patient", "accessCode", "Access permission code", "APP", "Application", "app.accessCode", "Stored only in application bucket"),
    row("Patient", "deathIndicator", "Legacy death flag", "APP", "Application", "app.deathIndicator", "String (Y/N) derived from Patient.deceased*"),
    row("Patient", "hkid", "HKID identifier", "FHIR_CORE", "Patient", "Patient.identifier(system=\"hkid\")", "Identifier token; mirror to search.hkid", "Yes", "Patient.identifier"),
    row("Patient", "medicalRecNum[]", "MRNs per hospital", "FHIR_CORE", "Patient", "Patient.identifier(system=\"mrn:{hosp}\")", "Split identifiers with mrn: prefix; emit {hospCode,mrn}", "Yes", "Patient.identifier"),
    row("Patient", "hospitalData[]", "Snapshot MRN list", "APP", "Application", "app.hospitalData[]", "Augment MRNs with `_id` + patientKey for CPI payloads"),
    row("Patient", "homePhone", "Home phone", "FHIR_CORE", "Patient", "Patient.telecom[use=home]", "Lookup telecom entry where system=phone & use=home"),
    row("Patient", "officePhone", "Work phone", "FHIR_CORE", "Patient", "Patient.telecom[use=work]", "Lookup telecom entry where system=phone & use=work"),
    row("Patient", "otherPhone", "Other phone", "FHIR_CORE", "Patient", "Patient.telecom[use=other]", "Lookup telecom entry where system=phone & use=other"),
    row("Patient", "maritalStatus", "Marital status", "FHIR_CORE", "Patient", "Patient.maritalStatus", "Prefer text else coding[0].code"),
    row("Patient", "fullAddress", "Address (English)", "FHIR_CORE", "Patient", "Patient.address[0]", "Use address[0].text or join line elements"),
    row("Patient", "fullAddressChi", "Address (Chinese)", "FHIR_CORE", "Patient", "Patient.address[language=zh]", "Grab first address with language zh and return text"),
    row("Patient", "documentType", "Doc/ID type", "APP", "Application", "app.documentType", "Pass-through from application payload"),
    row("Patient", "documentCode", "Doc/ID code", "APP", "Application", "app.documentCode", "Pass-through from application payload"),
    row("Patient", "lastDocumentType", "Last doc type", "APP", "Application", "app.lastDocumentType", "Pass-through from application payload"),
    row("Patient", "religion", "Religion", "APP", "Application", "app.religion", "Pass-through from application payload"),
    row("Patient", "race", "Race/ethnicity", "APP", "Application", "app.race", "Pass-through from application payload"),
    row("Patient", "exactDobFlag", "DOB precision flag", "APP", "Application", "app.exactDobFlag", "Boolean indicator only stored in app bucket"),
    row("Patient", "lastPayCode", "Last payment/entitlement code", "APP", "Application", "app.lastPayCode", "Stored in app until Coverage resource available"),
    row("Patient", "otherDocNum", "Other document number", "FHIR_CORE", "Patient", "Patient.identifier(system=\"doc:other\")", "Pull identifier or fall back to app.otherDocNum"),
    row("Patient", "ccCodes[]", "Legacy CC code list", "APP", "Application", "app.ccCodes", "Array of ints stored solely in app bucket"),
    row("Patient", "hospCode", "Managing hospital", "FHIR_CORE", "Patient", "Patient.managingOrganization.reference", "Reference Organization/{code}; mirror to search.hospCode", "Yes", "Patient.organization"),
    row("Patient", "last_update_datetime", "Last update timestamp", "FHIR_CORE", "Patient", "Patient.meta.lastUpdated", "ISO timestamp from meta.lastUpdated"),
    row("Patient", "lastUpdateDatetime", "Legacy camelCase timestamp", "APP", "Application", "app.lastUpdateDatetime", "Copy of meta.lastUpdated for CPI payloads"),
    # PMI Encounter
    row("PMI Encounter", "_id", "Mongo envelope identifier", "APP", "Envelope", "app._id", "Stringified ObjectId from MongoDB"),
    row("PMI Encounter", "caseNum", "Encounter case number", "FHIR_CORE", "Encounter", "Encounter.identifier(system=\"caseNum\")", "Use identifier token with legacy system", "Yes", "Encounter.identifier"),
    row("PMI Encounter", "hospCode", "Hospital code", "FHIR_CORE", "Encounter", "Encounter.serviceProvider.reference", "Reference Organization/{code}; mirror to search.hospCode", "Yes", "Encounter.service-provider"),
    row("PMI Encounter", "admissionDate", "Admission datetime", "FHIR_CORE", "Encounter", "Encounter.period.start", "Direct copy from period.start", "Yes", "Encounter.date"),
    row("PMI Encounter", "dischargeDate", "Discharge datetime", "FHIR_CORE", "Encounter", "Encounter.period.end", "Direct copy from period.end", "Yes", "Encounter.date"),
    row("PMI Encounter", "caseType", "Case type (IP/OP/ER)", "FHIR_CORE", "Encounter", "Encounter.class.code", "Translate class.code ↔ spec caseType", "Yes", "Encounter.class"),
    row("PMI Encounter", "status", "Encounter status", "FHIR_CORE", "Encounter", "Encounter.status", "Direct copy from resource.status", "Yes", "Encounter.status"),
    row("PMI Encounter", "dischargeCode", "Discharge disposition", "FHIR_CORE", "Encounter", "Encounter.hospitalization.dischargeDisposition", "Use first dischargeDisposition coding code"),
    row("PMI Encounter", "lastSpecCode", "Latest specialty", "FHIR_CORE", "Encounter", "Encounter.serviceType.coding[0].code", "Fallback to Encounter.type when serviceType missing"),
    row("PMI Encounter", "wardCode", "Ward/Location code", "FHIR_CORE", "Encounter", "Encounter.location[0].location.reference", "Reference Location/{code}; mirror to search.wardCode", "Yes", "Encounter.location"),
    row("PMI Encounter", "wardClass", "Ward class", "APP", "Application", "app.wardClass", "Stored only in app bucket"),
    row("PMI Encounter", "lastBedNum", "Latest bed number", "APP", "Application", "app.lastBedNum", "Stored only in app bucket"),
    row("PMI Encounter", "patientKey", "Encounter subject key", "FHIR_CORE", "Encounter", "Encounter.subject.reference", "Reference Patient/{id}; mirror to search.patientKey", "Yes", "Encounter.patient"),
    row("PMI Encounter", "patientType", "Patient type", "APP", "Application", "app.patientType", "Stored only in app bucket"),
    row("PMI Encounter", "sourceHospCode", "Admit source hospital", "APP", "Application", "app.sourceHospCode", "Not a core Encounter field; kept in app bucket"),
    row("PMI Encounter", "sourceIndicator", "Admit source indicator", "APP", "Application", "app.sourceIndicator", "Stored only in app bucket"),
    row("PMI Encounter", "patientGroup", "Patient group code", "APP", "Application", "app.patientGroup", "Stored only in app bucket"),
    row("PMI Encounter", "patient.*", "Embedded patient snapshot", "APP", "Application", "app.patientSnapshot", "Materialized via build_patient_payload per Encounter"),
    # CPI Encounter
    row("CPI Encounter", "_id", "Mongo envelope identifier", "APP", "Envelope", "app._id", "Stringified ObjectId from MongoDB"),
    row("CPI Encounter", "caseNum", "Encounter case number", "FHIR_CORE", "Encounter", "Encounter.identifier(system=\"caseNum\")", "Use identifier token with legacy system", "Yes", "Encounter.identifier"),
    row("CPI Encounter", "hospCode", "Hospital code", "FHIR_CORE", "Encounter", "Encounter.serviceProvider.reference", "Reference Organization/{code}; mirror to search.hospCode", "Yes", "Encounter.service-provider"),
    row("CPI Encounter", "admissionDate", "Admission datetime", "FHIR_CORE", "Encounter", "Encounter.period.start", "Direct copy from period.start", "Yes", "Encounter.date"),
    row("CPI Encounter", "caseType", "Case type (IP/OP/ER)", "FHIR_CORE", "Encounter", "Encounter.class.code", "Translate class.code ↔ spec caseType", "Yes", "Encounter.class"),
    row("CPI Encounter", "dischargeCode", "Discharge disposition", "FHIR_CORE", "Encounter", "Encounter.hospitalization.dischargeDisposition", "Use first dischargeDisposition coding code"),
    row("CPI Encounter", "lastBedNum", "Latest bed number", "APP", "Application", "app.lastBedNum", "Stored only in app bucket"),
    row("CPI Encounter", "lastSpecCode", "Latest specialty", "FHIR_CORE", "Encounter", "Encounter.serviceType.coding[0].code", "Fallback to Encounter.type when serviceType missing"),
    row("CPI Encounter", "lastWardClass", "Latest ward class", "APP", "Application", "app.wardClass", "Stored only in app bucket"),
    row("CPI Encounter", "lastWardCode", "Latest ward code", "FHIR_CORE", "Encounter", "Encounter.location[0].location.reference", "Reference Location/{code}; mirror to search.wardCode", "Yes", "Encounter.location"),
    row("CPI Encounter", "patientKey", "Encounter subject key", "FHIR_CORE", "Encounter", "Encounter.subject.reference", "Reference Patient/{id}; mirror to search.patientKey", "Yes", "Encounter.patient"),
    row("CPI Encounter", "sourceCode", "Admit source code", "FHIR_CORE", "Encounter", "Encounter.hospitalization.admitSource.coding[0].code", "Use first admitSource coding code"),
    row("CPI Encounter", "statusCode", "Encounter status code", "FHIR_CORE", "Encounter", "Encounter.status", "Mirror Encounter.status into search.statusCode", "Yes", "Encounter.status"),
    row("CPI Encounter", "cpiPatient.*", "Embedded patient snapshot", "APP", "Application", "app.cpiPatient", "Materialized via build_patient_payload per Encounter"),
    row("CPI Encounter", "cpiPatient.accessCode", "Snapshot access code", "APP", "Application", "app.cpiPatient.accessCode", "Derived from patient app.accessCode"),
    row("CPI Encounter", "cpiPatient.deathIndicator", "Snapshot death indicator", "APP", "Application", "app.cpiPatient.deathIndicator", "Derived from patient app.deathIndicator"),
    row("CPI Encounter", "cpiPatient.patientName", "Snapshot patient name", "APP", "Application", "app.cpiPatient.patientName", "Derived from patient name"),
    row("CPI Encounter", "cpiPatient.hospitalData[].mrn", "Snapshot MRNs", "APP", "Application", "app.cpiPatient.hospitalData[].mrn", "Copied from patient hospitalData"),
    row("CPI Encounter", "dischargeInformation[].specialty", "Discharge specialty code", "APP", "Application", "app.dischargeInformation[].specialty", "Derived from Encounter.serviceType/type per discharge record"),
    row("CPI Encounter", "dischargeInformation[].specialistIc", "Specialist identifier", "APP", "Application", "app.dischargeInformation[].specialistIc", "Extract participant w/ SPRF role"),
    row("CPI Encounter", "dischargeInformation[].moInChargeId", "Doctor code", "APP", "Application", "app.dischargeInformation[].moInChargeId", "Extract participant w/ ATND role"),
    row("CPI Encounter", "dischargeInformation[].dischargeTeam", "Care team reference", "APP", "Application", "app.dischargeInformation[].dischargeTeam", "CareTeam identifier kept in app bucket"),
    row("CPI Encounter", "dischargeInformation[].hospCode", "Hospital code reference", "APP", "Application", "app.dischargeInformation[].hospCode", "Mirror Encounter.serviceProvider for history rows"),
    row("CPI Encounter", "dischargeInformation[].caseNum", "Case number copy", "APP", "Application", "app.dischargeInformation[].caseNum", "Mirror Encounter caseNum per discharge entry"),
    row("CPI Encounter", "dischargeInformation[].createDate", "Discharge timestamp", "APP", "Application", "app.dischargeInformation[].createDate", "Use period.end fallback to meta.lastUpdated"),
    row("CPI Encounter", "dischargeInformation[]._id", "Discharge entry identifier", "APP", "Application", "app.dischargeInformation[]._id", "Stable synthetic id `${encounterId}:discharge:{n}`"),
]

CSV_HEADERS = [
    "Domain",
    "Field",
    "Interpretation",
    "Bucket",
    "FHIR Resource",
    "Target Path",
    "Transformation",
    "Indexed?",
    "Search Params",
]

ROOT = Path(__file__).resolve().parents[1]
DOCS_DIR = ROOT / "docs"
MD_PATH = DOCS_DIR / "SPEC_FIELD_MAPPING.md"
PUBLIC_MD_PATH = ROOT / "frontend" / "public" / "docs" / "SPEC_FIELD_MAPPING.md"
CSV_PATH = DOCS_DIR / "spec_field_mapping.csv"
PUBLIC_CSV_PATH = ROOT / "frontend" / "public" / "spec_field_mapping.csv"
PUBLIC_JSON_PATH = ROOT / "frontend" / "public" / "fhir-config" / "field-mapping.json"


def write_csv() -> None:
    with CSV_PATH.open("w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=CSV_HEADERS)
        writer.writeheader()
        for row_data in ROWS:
            writer.writerow(row_data)
    PUBLIC_CSV_PATH.parent.mkdir(parents=True, exist_ok=True)
    with PUBLIC_CSV_PATH.open("w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=CSV_HEADERS)
        writer.writeheader()
        for row_data in ROWS:
            writer.writerow(row_data)


def write_markdown() -> None:
    lines = [
        "# Customer Field Mapping",
        "",
        "Download as CSV: [spec_field_mapping.csv](spec_field_mapping.csv)",
        "",
        "Bucket legend: `FHIR_CORE` (native resource fields), `APP` (application-only), `SEARCH` (denormalized search helpers).",
        "",
    ]
    header = "| " + " | ".join(CSV_HEADERS) + " |"
    divider = "| " + " | ".join(["---"] * len(CSV_HEADERS)) + " |"
    lines.extend([header, divider])
    for row_data in ROWS:
        values = [row_data[h] for h in CSV_HEADERS]
        lines.append("| " + " | ".join(values) + " |")
    lines.append("")
    lines.extend(
        [
            "> Multi-cardinality FHIR elements follow the standard ordering:",
            "> `Patient.name[0]` / `[1]` for EN / ZH, `Patient.address[0]` / `[1]` for EN / ZH, and `Patient.telecom` entries are keyed by `use`.",
            ">",
            "> Set `ENABLE_FHIR_DENORMALIZATION=false` to disable the optional FHIR search mirrors (name, gender, DOB, encounter period). Customer-specific fields remain denormalized so the legacy APIs retain their current performance.",
        ]
    )
    content = "\n".join(lines) + "\n"
    MD_PATH.write_text(content)
    PUBLIC_MD_PATH.parent.mkdir(parents=True, exist_ok=True)
    PUBLIC_MD_PATH.write_text(content)


def write_json() -> None:
    PUBLIC_JSON_PATH.parent.mkdir(parents=True, exist_ok=True)
    import json

    with PUBLIC_JSON_PATH.open("w") as f:
        json.dump(ROWS, f, indent=2)


def main() -> None:
    write_csv()
    write_markdown()
    write_json()
    print(f"Wrote {CSV_PATH}")
    print(f"Wrote {PUBLIC_CSV_PATH}")
    print(f"Wrote {MD_PATH}")
    print(f"Wrote {PUBLIC_MD_PATH}")
    print(f"Wrote {PUBLIC_JSON_PATH}")


if __name__ == "__main__":
    main()
