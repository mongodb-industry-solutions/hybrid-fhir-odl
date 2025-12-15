
from typing import List, Dict, Any, Tuple
from faker import Faker
import random
from datetime import datetime, timedelta

fake = Faker()

HOSPITALS = [
    {"code": "QH", "name": "Queen Hospital"},
    {"code": "GH", "name": "General Hospital"},
]

WARDS = ["W01","W02","W12","ICU","OPD"]
SPECS = ["CARD","NEUR","ONCO","ORTH","PED"]
CASE_TYPES = ["I","A","E"]  # Inpatient / Ambulatory / Emergency
STATUSES = ["planned","in-progress","onhold","finished","cancelled"]
PAY_CODES = ["GOV", "SELF", "PRIV"]
PATIENT_GROUPS = ["G1", "G2", "VIP"]

def _hkid() -> str:
    letters = "ABCDEFGHJKLMNPQRSTUVWXYZ"
    a = random.choice(letters)
    digits = "".join([str(random.randint(0,9)) for _ in range(6)])
    chk = str(random.randint(0,9))
    return f"{a}{digits}({chk})"

def _cccodes_from_name(name: str) -> List[int]:
    # Dummy numeric representation for demo purposes
    return [ord(ch) % 100 for ch in name if ch.isalpha()][:6]

def generate_patients(n: int = 50) -> List[Tuple[Dict[str, Any], Dict[str, Any]]]:
    out: List[Tuple[Dict[str, Any], Dict[str, Any]]] = []
    for _ in range(n):
        first = fake.first_name()
        last = fake.last_name()
        hkid = _hkid()
        hosp = random.choice(HOSPITALS)["code"]
        mrn = str(random.randint(100000, 999999))
        cc_codes = _cccodes_from_name(f"{first}{last}")
        now_iso = datetime.utcnow().isoformat()

        death_flag = random.random() < 0.05
        resource: Dict[str, Any] = {
            "resourceType": "Patient",
            "identifier": [
                {"system": "hkid", "value": hkid},
                {"system": f"mrn:{hosp}", "value": mrn},
                {"system": "doc:other", "value": fake.bothify(text="??####")}
            ],
            "name": [
                {"use": "official", "family": last, "given": [first], "text": f"{first} {last}"},
                {"use": "official", "text": f"張 {first}", "language": "zh"}
            ],
            "gender": random.choice(["male","female","other","unknown"]),
            "birthDate": fake.date_between(start_date="-90y", end_date="-1y").isoformat(),
            "address": [
                {
                    "use": "home",
                    "line": [fake.street_address()],
                    "city": fake.city(),
                    "district": fake.state_abbr(),
                    "postalCode": fake.postcode(),
                    "country": "HK",
                    "text": fake.address().replace("\n", " " )
                },
                {
                    "use": "home",
                    "text": "中国 香港 九龙",  # simple placeholder Chinese address
                    "language": "zh"
                }
            ],
            "telecom": [
                {"system": "phone", "use": "home", "value": fake.phone_number()},
                {"system": "phone", "use": "work", "value": fake.phone_number()},
                {"system": "phone", "use": "other", "value": fake.phone_number()},
            ],
            "maritalStatus": {"coding": [{"system": "http://terminology.hl7.org/CodeSystem/v3-MaritalStatus", "code": random.choice(["S", "M", "D"])}]},
            "managingOrganization": {"reference": f"Organization/{hosp}"},
            "meta": {"lastUpdated": now_iso},
            "extension": [
                *[
                    {"url": "http://example.org/hk/StructureDefinition/ccCodes", "valueInteger": c}
                    for c in cc_codes
                ]
            ],
            **({"deceasedBoolean": True, "deceasedDateTime": fake.date_time_between(start_date="-2y", end_date="-1y").isoformat()} if death_flag else {}),
        }
        hospital_data = [{"mrn": mrn, "hospCode": hosp}]
        app = {
            "documentType": random.choice(["PASS", "ID"]),
            "documentCode": fake.bothify(text="??######"),
            "lastDocumentType": random.choice(["PASS", "ID"]),
            "religion": random.choice(["BUD", "CHR", "NON"]),
            "race": random.choice(["ASIAN", "WHITE", "UNKNOWN"]),
            "exactDobFlag": random.choice([True, False]),
            "lastPayCode": _random_last_pay_code(),
            "ccCodes": cc_codes,
            "dobStr": resource["birthDate"],
            "patientName": resource["name"][0]["text"],
            "accessCode": random.randint(100000, 999999),
            "deathIndicator": "Y" if death_flag else "N",
            "hospitalData": hospital_data,
            "lastUpdateDatetime": now_iso,
        }
        out.append((resource, app))
    return out

def generate_practitioners(n: int = 12) -> List[Dict[str, Any]]:
    out: List[Dict[str, Any]] = []
    for i in range(n):
        code = f"DR{100+i}"
        resource = {
            "resourceType": "Practitioner",
            "identifier": [{"system":"doctorCode","value": code}],
            "name": [{"text": f"Dr. {fake.first_name()} {fake.last_name()}"}],
            "active": True
        }
        out.append(resource)
    return out

def generate_careteams(n: int = 8) -> List[Dict[str, Any]]:
    out: List[Dict[str, Any]] = []
    for i in range(n):
        hosp = random.choice(HOSPITALS)["code"]
        code = f"TEAM{200+i}"
        resource = {
            "resourceType": "CareTeam",
            "identifier": [{"system":"teamCode","value": code}, {"system":"hospCode","value": hosp}],
            "status": "active",
            "name": f"{code} - {fake.word().title()}"
        }
        out.append(resource)
    return out

def generate_encounters_for_patients(patients: List[Dict[str, Any]], practitioners: List[Dict[str, Any]], careteams: List[Dict[str, Any]], per_patient: int = 2) -> List[Tuple[Dict[str, Any], Dict[str, Any]]]:
    out: List[Tuple[Dict[str, Any], Dict[str, Any]]] = []

    for pat in patients:
        hkid = next((idf.get("value") for idf in pat.get("identifier", []) if idf.get("system")=="hkid"), None)
        pid = pat.get("id", None) or fake.uuid4()
        hosp = random.choice(HOSPITALS)["code"]
        for _ in range(per_patient):
            start = fake.date_time_between(start_date="-365d", end_date="-1d")
            length_days = random.randint(1, 10)
            end = start + timedelta(days=length_days)

            team = random.choice(careteams)
            doctor = random.choice(practitioners)
            ward = random.choice(WARDS)
            spec = random.choice(SPECS)
            case_type = random.choice(CASE_TYPES)
            status = random.choice(STATUSES)
            case_num = f"{hosp}-{int(start.timestamp())}-{random.randint(10,99)}"
            admit_source = random.choice(["hosp", "er", "clinic"])
            discharge_code = random.choice(["HOME", "WARD", "ICU"])

            doctor_code = doctor["identifier"][0]["value"]
            specialist = random.choice(practitioners)
            specialist_code = specialist["identifier"][0]["value"]
            participants: List[Dict[str, Any]] = [
                {
                    "type": [{"coding": [{"system": "http://terminology.hl7.org/CodeSystem/v3-ParticipationType", "code": "ATND"}]}],
                    "individual": {"reference": f"Practitioner/{doctor_code}"}
                }
            ]
            if specialist_code != doctor_code:
                participants.append({
                    "type": [{"coding": [{"system": "http://terminology.hl7.org/CodeSystem/v3-ParticipationType", "code": "SPRF"}]}],
                    "individual": {"reference": f"Practitioner/{specialist_code}"}
                })
            else:
                specialist_code = doctor_code

            resource: Dict[str, Any] = {
                "resourceType": "Encounter",
                "identifier": [{"system": "caseNum", "value": case_num}],
                "status": status,
                "class": {"code": "IMP" if case_type == "I" else ("AMB" if case_type == "A" else "EMER")},
                "serviceType": {"coding": [{"system": "http://example.org/hk/serviceType", "code": spec}]},
                "subject": {
                    "reference": f"Patient/{pid}",
                    **({"identifier": {"system": "hkid", "value": hkid}} if hkid else {})
                },
                "period": {"start": start.isoformat(), "end": end.isoformat()},
                "serviceProvider": {"reference": f"Organization/{hosp}"},
                "hospitalization": {
                    "admitSource": {
                        "coding": [
                            {"system": "http://terminology.hl7.org/CodeSystem/admit-source", "code": admit_source}
                        ]
                    },
                    "dischargeDisposition": {
                        "coding": [
                            {"system": "http://example.org/hk/discharge", "code": discharge_code}
                        ]
                    }
                },
                "participant": participants,
                "careTeam": [{"reference": f"CareTeam/{team['identifier'][0]['value']}"}],
                "location": [{"location": {"reference": f"Location/{ward}"}}],
                "type": [{"coding":[{"system":"http://example.org/hk/specCode","code": spec}]}]
            }

            app = {
                "caseNum": case_num,
                "doctorCode": doctor_code,
                "specialistCode": specialist_code,
                "teamCode": team["identifier"][0]["value"],
                "hospCode": hosp,
                "wardCode": ward,
                "specCode": spec,
                "statusCode": status,
                "caseType": case_type,
                "wardClass": random.choice(["GEN", "VIP", "ISO"]),
                "lastBedNum": f"{ward}-{random.randint(1,40)}",
                "patientType": random.choice(["G", "P"]),
                "sourceIndicator": random.choice(["ER", "REF", "SELF"]),
                "patientGroup": _random_patient_group(),
            }
            out.append((resource, app))
    return out


def _random_last_pay_code() -> str:
    return random.choice(PAY_CODES)


def _random_patient_group() -> str:
    return random.choice(PATIENT_GROUPS)