"use client";

import React, { useMemo, useState } from "react";
import { Layers, Download } from "lucide-react";

const SEARCHABLE_FIELDS = new Set(["name", "sex", "dob", "admissionDate", "dischargeDate"]);

const FIELDS = [
  { domain: "Patient", field: "_id", interpretation: "Mongo row id", origin: "FHIR", target: "Patient.id" },
  { domain: "Patient", field: "dobStr", interpretation: "DOB string (redundant)", origin: "FHIR", target: "Patient.birthDate" },
  { domain: "Patient", field: "deathDate", interpretation: "Deceased date/time", origin: "FHIR", target: "Patient.deceasedDateTime" },
  { domain: "Patient", field: "deathFlag", interpretation: "Deceased flag", origin: "FHIR", target: "Patient.deceasedBoolean" },
  { domain: "Patient", field: "dob", interpretation: "Birth date", origin: "FHIR", target: "Patient.birthDate" },
  { domain: "Patient", field: "sex", interpretation: "Administrative sex", origin: "FHIR", target: "Patient.gender" },
  { domain: "Patient", field: "name", interpretation: "Official name (EN)", origin: "FHIR", target: "Patient.name[0]" },
  { domain: "Patient", field: "chiName", interpretation: "Official name (ZH)", origin: "FHIR", target: "Patient.name[1]" },
  { domain: "Patient", field: "hkid", interpretation: "HKID number", origin: "Custom", target: "Patient.identifier(system=\"hkid\")" },
  { domain: "Patient", field: "medicalRecNum[]", interpretation: "MRNs per hospital", origin: "Custom", target: "Patient.identifier(system=\"mrn:{hospCode}\")" },
  { domain: "Patient", field: "homePhone", interpretation: "Home phone", origin: "FHIR", target: "Patient.telecom[use=home]" },
  { domain: "Patient", field: "officePhone", interpretation: "Work phone", origin: "FHIR", target: "Patient.telecom[use=work]" },
  { domain: "Patient", field: "otherPhone", interpretation: "Other phone", origin: "FHIR", target: "Patient.telecom[use=other]" },
  { domain: "Patient", field: "maritalStatus", interpretation: "Marital status", origin: "FHIR", target: "Patient.maritalStatus" },
  { domain: "Patient", field: "fullAddress", interpretation: "Address (EN)", origin: "FHIR", target: "Patient.address[0]" },
  { domain: "Patient", field: "fullAddressChi", interpretation: "Address (ZH)", origin: "FHIR", target: "Patient.address[1]" },
  { domain: "Patient", field: "documentType", interpretation: "Doc/ID type", origin: "Custom", target: "app.documentType" },
  { domain: "Patient", field: "documentCode", interpretation: "Doc/ID code", origin: "Custom", target: "app.documentCode" },
  { domain: "Patient", field: "lastDocumentType", interpretation: "Last doc type", origin: "Custom", target: "app.lastDocumentType" },
  { domain: "Patient", field: "religion", interpretation: "Religion", origin: "Custom", target: "app.religion" },
  { domain: "Patient", field: "race", interpretation: "Race/ethnicity", origin: "Custom", target: "app.race" },
  { domain: "Patient", field: "exactDobFlag", interpretation: "DOB precision flag", origin: "Custom", target: "app.exactDobFlag" },
  { domain: "Patient", field: "lastPayCode", interpretation: "Last payment code", origin: "FHIR", target: "Coverage.type.coding[0].code" },
  { domain: "Patient", field: "otherDocNum", interpretation: "Other document number", origin: "FHIR", target: "Patient.identifier(system=\"doc:other\")" },
  { domain: "Patient", field: "patientKey", interpretation: "Internal patient key", origin: "Custom", target: "Patient.id" },
  { domain: "Patient", field: "ccCodes[]", interpretation: "Legacy ccCodes", origin: "Custom", target: "app.ccCodes" },
  { domain: "Patient", field: "hospCode", interpretation: "Managing hospital", origin: "FHIR", target: "Patient.managingOrganization" },
  { domain: "Patient", field: "last_update_datetime", interpretation: "Last update timestamp", origin: "FHIR", target: "Patient.meta.lastUpdated" },
  // PMI Encounter
  { domain: "PMI Encounter", field: "_id", interpretation: "Mongo row id", origin: "FHIR", target: "Encounter.id" },
  { domain: "PMI Encounter", field: "caseNum", interpretation: "Case number", origin: "Custom", target: "Encounter.identifier(caseNum)" },
  { domain: "PMI Encounter", field: "hospCode", interpretation: "Hospital code", origin: "Custom", target: "Encounter.serviceProvider" },
  { domain: "PMI Encounter", field: "admissionDate", interpretation: "Admission datetime", origin: "FHIR", target: "Encounter.period.start" },
  { domain: "PMI Encounter", field: "dischargeDate", interpretation: "Discharge datetime", origin: "FHIR", target: "Encounter.period.end" },
  { domain: "PMI Encounter", field: "caseType", interpretation: "Case type (IP/OP/ER)", origin: "Custom", target: "Encounter.class.code" },
  { domain: "PMI Encounter", field: "status", interpretation: "Encounter status", origin: "FHIR", target: "Encounter.status" },
  { domain: "PMI Encounter", field: "dischargeCode", interpretation: "Discharge disposition", origin: "FHIR", target: "Encounter.hospitalization.dischargeDisposition" },
  { domain: "PMI Encounter", field: "lastSpecCode", interpretation: "Latest specialty", origin: "Custom", target: "Encounter.serviceType.coding[0].code" },
  { domain: "PMI Encounter", field: "wardCode", interpretation: "Ward code", origin: "Custom", target: "Encounter.location[0].location" },
  { domain: "PMI Encounter", field: "wardClass", interpretation: "Ward class", origin: "Custom", target: "app.wardClass" },
  { domain: "PMI Encounter", field: "lastBedNum", interpretation: "Latest bed number", origin: "Custom", target: "app.lastBedNum" },
  { domain: "PMI Encounter", field: "patientKey", interpretation: "Patient master key", origin: "Custom", target: "Encounter.subject.reference" },
  { domain: "PMI Encounter", field: "patientType", interpretation: "Patient type", origin: "Custom", target: "app.patientType" },
  { domain: "PMI Encounter", field: "sourceHospCode", interpretation: "Admit source hospital", origin: "FHIR", target: "Encounter.hospitalization.origin" },
  { domain: "PMI Encounter", field: "sourceIndicator", interpretation: "Admit source indicator", origin: "Custom", target: "app.sourceIndicator" },
  { domain: "PMI Encounter", field: "patientGroup", interpretation: "Patient group", origin: "FHIR", target: "EpisodeOfCare.type[0].coding[0].code" },
  { domain: "PMI Encounter", field: "patient.*", interpretation: "Embedded patient snapshot", origin: "Custom", target: "build_patient_payload(...)" },
  // CPI Encounter
  { domain: "CPI Encounter", field: "_id", interpretation: "Mongo row id", origin: "FHIR", target: "Encounter.id" },
  { domain: "CPI Encounter", field: "caseNum", interpretation: "Case number", origin: "Custom", target: "Encounter.identifier(caseNum)" },
  { domain: "CPI Encounter", field: "hospCode", interpretation: "Hospital code", origin: "Custom", target: "Encounter.serviceProvider" },
  { domain: "CPI Encounter", field: "admissionDate", interpretation: "Admission datetime", origin: "FHIR", target: "Encounter.period.start" },
  { domain: "CPI Encounter", field: "caseType", interpretation: "Case type (IP/OP/ER)", origin: "Custom", target: "Encounter.class.code" },
  { domain: "CPI Encounter", field: "dischargeCode", interpretation: "Discharge disposition", origin: "FHIR", target: "Encounter.hospitalization.dischargeDisposition" },
  { domain: "CPI Encounter", field: "lastBedNum", interpretation: "Latest bed number", origin: "Custom", target: "app.lastBedNum" },
  { domain: "CPI Encounter", field: "lastSpecCode", interpretation: "Latest specialty", origin: "Custom", target: "Encounter.serviceType.coding[0].code" },
  { domain: "CPI Encounter", field: "lastWardClass", interpretation: "Latest ward class", origin: "Custom", target: "app.wardClass" },
  { domain: "CPI Encounter", field: "lastWardCode", interpretation: "Latest ward code", origin: "Custom", target: "Encounter.location[0].location" },
  { domain: "CPI Encounter", field: "patientKey", interpretation: "Patient master key", origin: "Custom", target: "Encounter.subject.reference" },
  { domain: "CPI Encounter", field: "sourceCode", interpretation: "Admit source code", origin: "Custom", target: "Encounter.hospitalization.admitSource.coding[0].code" },
  { domain: "CPI Encounter", field: "statusCode", interpretation: "Encounter status code", origin: "Custom", target: "Encounter.status" },
  { domain: "CPI Encounter", field: "cpiPatient._id", interpretation: "Patient row id (snapshot)", origin: "Custom", target: "Patient.id" },
  { domain: "CPI Encounter", field: "cpiPatient.hkid", interpretation: "Snapshot HKID", origin: "Custom", target: "Patient.identifier(system=\"hkid\")" },
  { domain: "CPI Encounter", field: "cpiPatient.patientKey", interpretation: "Snapshot master key", origin: "Custom", target: "Patient.id" },
  { domain: "CPI Encounter", field: "cpiPatient.name", interpretation: "Snapshot name (EN)", origin: "Custom", target: "Patient.name[0]" },
  { domain: "CPI Encounter", field: "cpiPatient.chiName", interpretation: "Snapshot name (ZH)", origin: "Custom", target: "Patient.name[1]" },
  { domain: "CPI Encounter", field: "cpiPatient.sex", interpretation: "Snapshot gender", origin: "Custom", target: "Patient.gender" },
  { domain: "CPI Encounter", field: "cpiPatient.dob", interpretation: "Snapshot birth date", origin: "Custom", target: "Patient.birthDate" },
  { domain: "CPI Encounter", field: "cpiPatient.deathDate", interpretation: "Snapshot deceased date", origin: "Custom", target: "Patient.deceasedDateTime" },
  { domain: "CPI Encounter", field: "cpiPatient.deathFlag", interpretation: "Snapshot deceased flag", origin: "Custom", target: "Patient.deceasedBoolean" },
  { domain: "CPI Encounter", field: "cpiPatient.hospitalData[].mrn", interpretation: "Snapshot MRNs", origin: "Custom", target: "Derived from Patient.identifier(mrn:{hospCode})" },
  { domain: "CPI Encounter", field: "dischargeInformation[].specialty", interpretation: "Discharge specialty", origin: "Custom", target: "Encounter.serviceType / Encounter.type" },
  { domain: "CPI Encounter", field: "dischargeInformation[].specialistIc", interpretation: "Specialist identifier", origin: "Custom", target: "Encounter.participant(type=SPRF)" },
  { domain: "CPI Encounter", field: "dischargeInformation[].moInChargeId", interpretation: "MO in charge", origin: "Custom", target: "Encounter.participant(type=ATND)" },
  { domain: "CPI Encounter", field: "dischargeInformation[].dischargeTeam", interpretation: "Team name/code", origin: "Custom", target: "Encounter.careTeam.reference" },
  { domain: "CPI Encounter", field: "dischargeInformation[].hospCode", interpretation: "Hospital code", origin: "Custom", target: "Encounter.serviceProvider" },
  { domain: "CPI Encounter", field: "dischargeInformation[].caseNum", interpretation: "Case number", origin: "Custom", target: "Encounter.identifier(caseNum)" },
  { domain: "CPI Encounter", field: "dischargeInformation[].createDate", interpretation: "Create date", origin: "Custom", target: "Encounter.period.end" }
];

export default function MappingShowcase() {
  const searchableDefaults = useMemo(() => {
    const defaults = {};
    FIELDS.forEach((row) => {
      if (SEARCHABLE_FIELDS.has(row.field)) {
        defaults[row.field] = true;
      }
    });
    return defaults;
  }, []);

  const [searchPrefs, setSearchPrefs] = useState(searchableDefaults);

  const toggleSearch = (field) => {
    if (!SEARCHABLE_FIELDS.has(field)) return;
    setSearchPrefs((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleExport = () => {
    const header = ["Origin field", "Interpretation", "Domain", "Maps FHIR", "Target field", "In Search"];
    const rows = FIELDS.map((row) => [
      row.field,
      row.interpretation,
      row.domain,
      row.origin,
      row.target,
      SEARCHABLE_FIELDS.has(row.field) ? (searchPrefs[row.field] ? "Yes" : "No") : "N/A"
    ]);
    const csv = [header, ...rows]
      .map((cols) => cols.map((col) => `"${String(col ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "field-mapping.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderOriginChip = (origin) => (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
        origin === "FHIR" ? "bg-emerald-500/20 text-emerald-200" : "bg-slate-600 text-slate-200"
      }`}
    >
      {origin}
    </span>
  );

  const renderToggle = (field) => {
    if (!SEARCHABLE_FIELDS.has(field)) {
      return <span className="text-slate-500 text-xs">N/A</span>;
    }
    const enabled = searchPrefs[field];
    return (
      <button
        onClick={() => toggleSearch(field)}
        className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
          enabled ? "bg-emerald-500/20 text-emerald-200" : "bg-slate-700 text-slate-200"
        }`}
      >
        {enabled ? "Enabled" : "Disabled"}
      </button>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-emerald-600/40 rounded-xl p-4 flex flex-wrap items-start gap-4">
        <div className="flex items-start gap-3">
          <Layers className="text-emerald-400 mt-1" size={22} />
          <div>
            <h2 className="text-slate-100 text-lg font-semibold">Customer Field Mapping</h2>
            <p className="text-slate-400 text-sm max-w-4xl">
              Every field from the PDF specification maps to either a FHIR element or an <code>app.*</code> location.
              Use the toggles to control which FHIR-native fields are denormalized into <code>search.*</code> for faster lookups.
            </p>
          </div>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-3 py-2 text-sm rounded-md bg-emerald-600/30 border border-emerald-500/40 text-emerald-100 hover:bg-emerald-600/50"
        >
          <Download size={16} /> Download CSV
        </button>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase text-slate-400 bg-slate-800/70">
            <tr>
              <th className="px-3 py-2">Origin field</th>
              <th className="px-3 py-2">Interpretation</th>
              <th className="px-3 py-2">Domain</th>
              <th className="px-3 py-2">Maps FHIR</th>
              <th className="px-3 py-2">Target field</th>
              <th className="px-3 py-2">In Search</th>
            </tr>
          </thead>
          <tbody className="text-slate-300">
            {FIELDS.map((row) => (
              <tr key={`${row.domain}-${row.field}`} className="border-t border-slate-700/60">
                <td className="px-3 py-2 font-mono text-xs text-emerald-200">{row.field}</td>
                <td className="px-3 py-2">{row.interpretation}</td>
                <td className="px-3 py-2">{row.domain}</td>
                <td className="px-3 py-2">{renderOriginChip(row.origin)}</td>
                <td className="px-3 py-2 text-xs text-slate-400">
                  <code>{row.target}</code>
                </td>
                <td className="px-3 py-2">{renderToggle(row.field)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
