# Customer Field Mapping

| Domain | Field | Interpretation | Maps FHIR | Target |
| --- | --- | --- | --- | --- |
| Patient | `_id` | Mongo row id | FHIR | `Patient.id` |
| Patient | `dobStr` | DOB string (redundant) | FHIR | `Patient.birthDate` |
| Patient | `deathDate` | Deceased date/time | FHIR | `Patient.deceasedDateTime` |
| Patient | `deathFlag` | Deceased flag | FHIR | `Patient.deceasedBoolean` |
| Patient | `dob` | Birth date | FHIR | `Patient.birthDate` |
| Patient | `sex` | Administrative sex | FHIR | `Patient.gender` |
| Patient | `name` | Official name (English) | FHIR | `Patient.name[0]` |
| Patient | `chiName` | Official name (Chinese) | FHIR | `Patient.name[1]` |
| Patient | `hkid` | HKID number | Custom | `Patient.identifier(system="hkid")` |
| Patient | `medicalRecNum[]` | MRNs per hospital | Custom | `Patient.identifier(system="mrn:{hospCode}")` |
| Patient | `homePhone` | Home phone | FHIR | `Patient.telecom[use=home]` |
| Patient | `officePhone` | Work phone | FHIR | `Patient.telecom[use=work]` |
| Patient | `otherPhone` | Other phone | FHIR | `Patient.telecom[use=other]` |
| Patient | `maritalStatus` | Marital status | FHIR | `Patient.maritalStatus` |
| Patient | `fullAddress` | Address (English) | FHIR | `Patient.address[0]` |
| Patient | `fullAddressChi` | Address (Chinese) | FHIR | `Patient.address[1]` |
| Patient | `documentType` | Doc/ID type | Custom | `app.documentType` |
| Patient | `documentCode` | Doc/ID code | Custom | `app.documentCode` |
| Patient | `lastDocumentType` | Last doc type | Custom | `app.lastDocumentType` |
| Patient | `religion` | Religion | Custom | `app.religion` |
| Patient | `race` | Race/ethnicity | Custom | `app.race` |
| Patient | `exactDobFlag` | DOB precision flag | Custom | `app.exactDobFlag` |
| Patient | `lastPayCode` | Last payment/entitlement code | FHIR | `Coverage.type.coding[0].code` |
| Patient | `otherDocNum` | Other document number | FHIR | `Patient.identifier(system="doc:other")` |
| Patient | `patientKey` | Internal master patient key | Custom | `Patient.id` |
| Patient | `ccCodes[]` | Legacy code list | Custom | `app.ccCodes` |
| Patient | `hospCode` | Managing hospital | FHIR | `Patient.managingOrganization` |
| Patient | `last_update_datetime` | Last update timestamp | FHIR | `Patient.meta.lastUpdated` |
| PMI Encounter | `_id` | Mongo row id | FHIR | `Encounter.id` |
| PMI Encounter | `caseNum` | Case number | Custom | `Encounter.identifier(caseNum)` |
| PMI Encounter | `hospCode` | Hospital code | Custom | `Encounter.serviceProvider` |
| PMI Encounter | `admissionDate` | Admission datetime | FHIR | `Encounter.period.start` |
| PMI Encounter | `dischargeDate` | Discharge datetime | FHIR | `Encounter.period.end` |
| PMI Encounter | `caseType` | Case type (IP/OP/ER) | Custom | `Encounter.class.code` |
| PMI Encounter | `status` | Encounter status | FHIR | `Encounter.status` |
| PMI Encounter | `dischargeCode` | Discharge disposition | FHIR | `Encounter.hospitalization.dischargeDisposition` |
| PMI Encounter | `lastSpecCode` | Latest specialty | Custom | `Encounter.serviceType.coding[0].code` |
| PMI Encounter | `wardCode` | Ward code | Custom | `Encounter.location[0].location.reference` |
| PMI Encounter | `wardClass` | Ward class | Custom | `app.wardClass` |
| PMI Encounter | `lastBedNum` | Latest bed number | Custom | `app.lastBedNum` |
| PMI Encounter | `patientKey` | Patient master key | Custom | `Encounter.subject.reference` |
| PMI Encounter | `patientType` | Patient type | Custom | `app.patientType` |
| PMI Encounter | `sourceHospCode` | Admit source hospital | FHIR | `Encounter.hospitalization.origin.reference` |
| PMI Encounter | `sourceIndicator` | Admit source indicator | Custom | `app.sourceIndicator` |
| PMI Encounter | `patientGroup` | Patient group | FHIR | `EpisodeOfCare.type[0].coding[0].code` |
| PMI Encounter | `patient.*` | Embedded snapshot | Custom | Derived via `build_patient_payload` |
| CPI Encounter | `_id` | Mongo row id | FHIR | `Encounter.id` |
| CPI Encounter | `caseNum` | Case number | Custom | `Encounter.identifier(caseNum)` |
| CPI Encounter | `hospCode` | Hospital code | Custom | `Encounter.serviceProvider` |
| CPI Encounter | `admissionDate` | Admission datetime | FHIR | `Encounter.period.start` |
| CPI Encounter | `caseType` | Case type (IP/OP/ER) | Custom | `Encounter.class.code` |
| CPI Encounter | `dischargeCode` | Discharge disposition | FHIR | `Encounter.hospitalization.dischargeDisposition` |
| CPI Encounter | `lastBedNum` | Latest bed number | Custom | `app.lastBedNum` |
| CPI Encounter | `lastSpecCode` | Latest specialty | Custom | `Encounter.serviceType.coding[0].code` |
| CPI Encounter | `lastWardClass` | Latest ward class | Custom | `app.wardClass` |
| CPI Encounter | `lastWardCode` | Latest ward code | Custom | `Encounter.location[0].location.reference` |
| CPI Encounter | `patientKey` | Patient master key | Custom | `Encounter.subject.reference` |
| CPI Encounter | `sourceCode` | Admit source code | Custom | `Encounter.hospitalization.admitSource.coding[0].code` |
| CPI Encounter | `statusCode` | Encounter status code | Custom | `Encounter.status` |
| CPI Encounter | `cpiPatient.*` | Embedded patient snapshot | Custom | Derived via `build_patient_payload` |
| CPI Encounter | `cpiPatient.hospitalData[].mrn` | Snapshot MRNs | Custom | From `Patient.identifier(mrn:{hospCode})` |
| CPI Encounter | `dischargeInformation[]` | Discharge details | Custom | Derived from `Encounter.participant` + `Encounter.careTeam` |

> Multi-cardinality FHIR elements follow the standard ordering:
> `Patient.name[0]` / `[1]` for EN / ZH, `Patient.address[0]` / `[1]` for EN / ZH, and `Patient.telecom` entries are keyed by `use`.
>
> Set `ENABLE_FHIR_DENORMALIZATION=false` to disable the optional FHIR search mirrors (name, gender, DOB, encounter period). Customer-specific fields remain denormalized so the legacy APIs retain their current performance.
