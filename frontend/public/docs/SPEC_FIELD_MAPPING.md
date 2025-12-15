# Customer Field Mapping

Download as CSV: [spec_field_mapping.csv](spec_field_mapping.csv)

Bucket legend: `FHIR_CORE` (native resource fields), `APP` (application-only), `SEARCH` (denormalized search helpers).

| Domain | Field | Interpretation | Bucket | FHIR Resource | Target Path | Transformation | Indexed? | Search Params |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Patient | _id | Mongo envelope identifier | APP | Envelope | app._id | Stringified ObjectId from MongoDB | No |  |
| Patient | patientKey | Master patient identifier | FHIR_CORE | Patient | Patient.id | Use canonical Patient.id; mirrored to search.patientKey | Yes | Patient._id |
| Patient | dob | Birth date (search/comparison) | FHIR_CORE | Patient | Patient.birthDate | Store ISO date; mirror to search.dob | Yes | Patient.birthdate |
| Patient | dobStr | Display-friendly DOB | APP | Application | app.dobStr | Presentation string derived from Patient.birthDate | No |  |
| Patient | deathDate | Deceased date/time | FHIR_CORE | Patient | Patient.deceasedDateTime | Populate when exact date provided | No |  |
| Patient | deathFlag | Deceased indicator | FHIR_CORE | Patient | Patient.deceasedBoolean | Only set when deathDate absent; map bool to Y/N in payload | No |  |
| Patient | sex | Administrative sex | FHIR_CORE | Patient | Patient.gender | Map {M,F,U} ↔ {male,female,unknown} | Yes | Patient.gender |
| Patient | name | Official name (English) | FHIR_CORE | Patient | Patient.name[0] | Prefer name.text else combine given/family |  | Patient.name |
| Patient | chiName | Official name (Chinese) | FHIR_CORE | Patient | Patient.name[language=zh] | Pick first name entry tagged zh | No |  |
| Patient | patientName | Legacy display name | APP | Application | app.patientName | Copy of English name for CPI snapshots | No |  |
| Patient | accessCode | Access permission code | APP | Application | app.accessCode | Stored only in application bucket | No |  |
| Patient | deathIndicator | Legacy death flag | APP | Application | app.deathIndicator | String (Y/N) derived from Patient.deceased* | No |  |
| Patient | hkid | HKID identifier | FHIR_CORE | Patient | Patient.identifier(system="hkid") | Identifier token; mirror to search.hkid | Yes | Patient.identifier |
| Patient | medicalRecNum[] | MRNs per hospital | FHIR_CORE | Patient | Patient.identifier(system="mrn:{hosp}") | Split identifiers with mrn: prefix; emit {hospCode,mrn} | Yes | Patient.identifier |
| Patient | hospitalData[] | Snapshot MRN list | APP | Application | app.hospitalData[] | Augment MRNs with `_id` + patientKey for CPI payloads | No |  |
| Patient | homePhone | Home phone | FHIR_CORE | Patient | Patient.telecom[use=home] | Lookup telecom entry where system=phone & use=home | No |  |
| Patient | officePhone | Work phone | FHIR_CORE | Patient | Patient.telecom[use=work] | Lookup telecom entry where system=phone & use=work | No |  |
| Patient | otherPhone | Other phone | FHIR_CORE | Patient | Patient.telecom[use=other] | Lookup telecom entry where system=phone & use=other | No |  |
| Patient | maritalStatus | Marital status | FHIR_CORE | Patient | Patient.maritalStatus | Prefer text else coding[0].code | No |  |
| Patient | fullAddress | Address (English) | FHIR_CORE | Patient | Patient.address[0] | Use address[0].text or join line elements | No |  |
| Patient | fullAddressChi | Address (Chinese) | FHIR_CORE | Patient | Patient.address[language=zh] | Grab first address with language zh and return text | No |  |
| Patient | documentType | Doc/ID type | APP | Application | app.documentType | Pass-through from application payload | No |  |
| Patient | documentCode | Doc/ID code | APP | Application | app.documentCode | Pass-through from application payload | No |  |
| Patient | lastDocumentType | Last doc type | APP | Application | app.lastDocumentType | Pass-through from application payload | No |  |
| Patient | religion | Religion | APP | Application | app.religion | Pass-through from application payload | No |  |
| Patient | race | Race/ethnicity | APP | Application | app.race | Pass-through from application payload | No |  |
| Patient | exactDobFlag | DOB precision flag | APP | Application | app.exactDobFlag | Boolean indicator only stored in app bucket | No |  |
| Patient | lastPayCode | Last payment/entitlement code | APP | Application | app.lastPayCode | Stored in app until Coverage resource available | No |  |
| Patient | otherDocNum | Other document number | FHIR_CORE | Patient | Patient.identifier(system="doc:other") | Pull identifier or fall back to app.otherDocNum | No |  |
| Patient | ccCodes[] | Legacy CC code list | APP | Application | app.ccCodes | Array of ints stored solely in app bucket | No |  |
| Patient | hospCode | Managing hospital | FHIR_CORE | Patient | Patient.managingOrganization.reference | Reference Organization/{code}; mirror to search.hospCode | Yes | Patient.organization |
| Patient | last_update_datetime | Last update timestamp | FHIR_CORE | Patient | Patient.meta.lastUpdated | ISO timestamp from meta.lastUpdated | No |  |
| Patient | lastUpdateDatetime | Legacy camelCase timestamp | APP | Application | app.lastUpdateDatetime | Copy of meta.lastUpdated for CPI payloads | No |  |
| PMI Encounter | _id | Mongo envelope identifier | APP | Envelope | app._id | Stringified ObjectId from MongoDB | No |  |
| PMI Encounter | caseNum | Encounter case number | FHIR_CORE | Encounter | Encounter.identifier(system="caseNum") | Use identifier token with legacy system | Yes | Encounter.identifier |
| PMI Encounter | hospCode | Hospital code | FHIR_CORE | Encounter | Encounter.serviceProvider.reference | Reference Organization/{code}; mirror to search.hospCode | Yes | Encounter.service-provider |
| PMI Encounter | admissionDate | Admission datetime | FHIR_CORE | Encounter | Encounter.period.start | Direct copy from period.start | Yes | Encounter.date |
| PMI Encounter | dischargeDate | Discharge datetime | FHIR_CORE | Encounter | Encounter.period.end | Direct copy from period.end | Yes | Encounter.date |
| PMI Encounter | caseType | Case type (IP/OP/ER) | FHIR_CORE | Encounter | Encounter.class.code | Translate class.code ↔ spec caseType | Yes | Encounter.class |
| PMI Encounter | status | Encounter status | FHIR_CORE | Encounter | Encounter.status | Direct copy from resource.status | Yes | Encounter.status |
| PMI Encounter | dischargeCode | Discharge disposition | FHIR_CORE | Encounter | Encounter.hospitalization.dischargeDisposition | Use first dischargeDisposition coding code | No |  |
| PMI Encounter | lastSpecCode | Latest specialty | FHIR_CORE | Encounter | Encounter.serviceType.coding[0].code | Fallback to Encounter.type when serviceType missing | No |  |
| PMI Encounter | wardCode | Ward/Location code | FHIR_CORE | Encounter | Encounter.location[0].location.reference | Reference Location/{code}; mirror to search.wardCode | Yes | Encounter.location |
| PMI Encounter | wardClass | Ward class | APP | Application | app.wardClass | Stored only in app bucket | No |  |
| PMI Encounter | lastBedNum | Latest bed number | APP | Application | app.lastBedNum | Stored only in app bucket | No |  |
| PMI Encounter | patientKey | Encounter subject key | FHIR_CORE | Encounter | Encounter.subject.reference | Reference Patient/{id}; mirror to search.patientKey | Yes | Encounter.patient |
| PMI Encounter | patientType | Patient type | APP | Application | app.patientType | Stored only in app bucket | No |  |
| PMI Encounter | sourceHospCode | Admit source hospital | APP | Application | app.sourceHospCode | Not a core Encounter field; kept in app bucket | No |  |
| PMI Encounter | sourceIndicator | Admit source indicator | APP | Application | app.sourceIndicator | Stored only in app bucket | No |  |
| PMI Encounter | patientGroup | Patient group code | APP | Application | app.patientGroup | Stored only in app bucket | No |  |
| PMI Encounter | patient.* | Embedded patient snapshot | APP | Application | app.patientSnapshot | Materialized via build_patient_payload per Encounter | No |  |
| CPI Encounter | _id | Mongo envelope identifier | APP | Envelope | app._id | Stringified ObjectId from MongoDB | No |  |
| CPI Encounter | caseNum | Encounter case number | FHIR_CORE | Encounter | Encounter.identifier(system="caseNum") | Use identifier token with legacy system | Yes | Encounter.identifier |
| CPI Encounter | hospCode | Hospital code | FHIR_CORE | Encounter | Encounter.serviceProvider.reference | Reference Organization/{code}; mirror to search.hospCode | Yes | Encounter.service-provider |
| CPI Encounter | admissionDate | Admission datetime | FHIR_CORE | Encounter | Encounter.period.start | Direct copy from period.start | Yes | Encounter.date |
| CPI Encounter | caseType | Case type (IP/OP/ER) | FHIR_CORE | Encounter | Encounter.class.code | Translate class.code ↔ spec caseType | Yes | Encounter.class |
| CPI Encounter | dischargeCode | Discharge disposition | FHIR_CORE | Encounter | Encounter.hospitalization.dischargeDisposition | Use first dischargeDisposition coding code | No |  |
| CPI Encounter | lastBedNum | Latest bed number | APP | Application | app.lastBedNum | Stored only in app bucket | No |  |
| CPI Encounter | lastSpecCode | Latest specialty | FHIR_CORE | Encounter | Encounter.serviceType.coding[0].code | Fallback to Encounter.type when serviceType missing | No |  |
| CPI Encounter | lastWardClass | Latest ward class | APP | Application | app.wardClass | Stored only in app bucket | No |  |
| CPI Encounter | lastWardCode | Latest ward code | FHIR_CORE | Encounter | Encounter.location[0].location.reference | Reference Location/{code}; mirror to search.wardCode | Yes | Encounter.location |
| CPI Encounter | patientKey | Encounter subject key | FHIR_CORE | Encounter | Encounter.subject.reference | Reference Patient/{id}; mirror to search.patientKey | Yes | Encounter.patient |
| CPI Encounter | sourceCode | Admit source code | FHIR_CORE | Encounter | Encounter.hospitalization.admitSource.coding[0].code | Use first admitSource coding code | No |  |
| CPI Encounter | statusCode | Encounter status code | FHIR_CORE | Encounter | Encounter.status | Mirror Encounter.status into search.statusCode | Yes | Encounter.status |
| CPI Encounter | cpiPatient.* | Embedded patient snapshot | APP | Application | app.cpiPatient | Materialized via build_patient_payload per Encounter | No |  |
| CPI Encounter | cpiPatient.accessCode | Snapshot access code | APP | Application | app.cpiPatient.accessCode | Derived from patient app.accessCode | No |  |
| CPI Encounter | cpiPatient.deathIndicator | Snapshot death indicator | APP | Application | app.cpiPatient.deathIndicator | Derived from patient app.deathIndicator | No |  |
| CPI Encounter | cpiPatient.patientName | Snapshot patient name | APP | Application | app.cpiPatient.patientName | Derived from patient name | No |  |
| CPI Encounter | cpiPatient.hospitalData[].mrn | Snapshot MRNs | APP | Application | app.cpiPatient.hospitalData[].mrn | Copied from patient hospitalData | No |  |
| CPI Encounter | dischargeInformation[].specialty | Discharge specialty code | APP | Application | app.dischargeInformation[].specialty | Derived from Encounter.serviceType/type per discharge record | No |  |
| CPI Encounter | dischargeInformation[].specialistIc | Specialist identifier | APP | Application | app.dischargeInformation[].specialistIc | Extract participant w/ SPRF role | No |  |
| CPI Encounter | dischargeInformation[].moInChargeId | Doctor code | APP | Application | app.dischargeInformation[].moInChargeId | Extract participant w/ ATND role | No |  |
| CPI Encounter | dischargeInformation[].dischargeTeam | Care team reference | APP | Application | app.dischargeInformation[].dischargeTeam | CareTeam identifier kept in app bucket | No |  |
| CPI Encounter | dischargeInformation[].hospCode | Hospital code reference | APP | Application | app.dischargeInformation[].hospCode | Mirror Encounter.serviceProvider for history rows | No |  |
| CPI Encounter | dischargeInformation[].caseNum | Case number copy | APP | Application | app.dischargeInformation[].caseNum | Mirror Encounter caseNum per discharge entry | No |  |
| CPI Encounter | dischargeInformation[].createDate | Discharge timestamp | APP | Application | app.dischargeInformation[].createDate | Use period.end fallback to meta.lastUpdated | No |  |
| CPI Encounter | dischargeInformation[]._id | Discharge entry identifier | APP | Application | app.dischargeInformation[]._id | Stable synthetic id `${encounterId}:discharge:{n}` | No |  |

> Multi-cardinality FHIR elements follow the standard ordering:
> `Patient.name[0]` / `[1]` for EN / ZH, `Patient.address[0]` / `[1]` for EN / ZH, and `Patient.telecom` entries are keyed by `use`.
>
> Set `ENABLE_FHIR_DENORMALIZATION=false` to disable the optional FHIR search mirrors (name, gender, DOB, encounter period). Customer-specific fields remain denormalized so the legacy APIs retain their current performance.
