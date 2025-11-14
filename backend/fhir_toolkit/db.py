from typing import Optional, List, Tuple, Dict, Any
from pymongo import MongoClient, ASCENDING, DESCENDING, errors
from .config import settings
from .search_config import allowed_fields

try:
    import certifi
    _TLS_CA = dict(tlsCAFile=certifi.where())
except Exception:
    # Local dev without TLS
    _TLS_CA = {}

_client: Optional[MongoClient] = None


def get_client() -> MongoClient:
    """Shared MongoClient."""
    global _client
    if _client is None:
        _client = MongoClient(settings.mongodb_uri, **_TLS_CA)
    return _client


def get_collection():
    db = get_client()[settings.mongodb_db]
    return db[settings.mongodb_collection]


def _same_key(existing: Dict[str, Any], keys: List[Tuple[str, int]]) -> bool:
    """Compare key spec (order matters)."""
    ex = list(existing.get("key", {}).items())
    return ex == keys


def _ensure_index(coll, keys: List[Tuple[str, int]], name: str = None, force: bool = False, **opts):
    """
    Create index if not present. If an index with same key exists but options differ:
    - drop & recreate when force=True
    - otherwise gracefully skip to avoid IndexOptionsConflict
    """
    existing_with_same_key = None
    for ix in coll.list_indexes():
        if _same_key(ix, keys):
            existing_with_same_key = ix
            break

    if existing_with_same_key:
        # If options (unique/partialFilterExpression) mismatch and force=True -> drop/recreate
        needs_rebuild = False
        if opts.get("unique") and not existing_with_same_key.get("unique"):
            needs_rebuild = True
        if "partialFilterExpression" in opts:
            if opts["partialFilterExpression"] != existing_with_same_key.get("partialFilterExpression"):
                needs_rebuild = True

        if needs_rebuild and force:
            coll.drop_index(existing_with_same_key["name"])
        else:
            # keep existing index as-is (avoid conflict)
            return existing_with_same_key["name"]

    try:
        return coll.create_index(keys, name=name, **opts)
    except errors.OperationFailure as e:
        # If conflict remains, skip silently to keep startup robust
        if e.code == 85:  # IndexOptionsConflict
            return f"skipped:{name or str(keys)}"
        raise


def create_indexes(force: bool = False) -> Dict[str, str]:
    """
    Create (or rebuild when force=True) all recommended indexes.

    force=True will drop all non-_id indexes first to guarantee a clean slate.
    """
    coll = get_collection()
    enabled_fields = allowed_fields(settings.enable_fhir_denorm)
    result: Dict[str, str] = {}

    if force:
        for ix in coll.list_indexes():
            if ix["name"] != "_id_":
                coll.drop_index(ix["name"])

    # Envelope identity (unique) – requires partialFilterExpression
    result["idx_tenant_type_id"] = _ensure_index(
        coll,
        [("tenant", ASCENDING), ("resourceType", ASCENDING), ("resource.id", ASCENDING)],
        name="idx_tenant_type_id",
        force=force,
        unique=True,
        partialFilterExpression={"resource.id": {"$exists": True}}
    )

    # General type
    result["idx_tenant_type"] = _ensure_index(
        coll,
        [("tenant", ASCENDING), ("resourceType", ASCENDING)],
        name="idx_tenant_type",
        force=force
    )

    # --------------------
    # Patient accelerated
    # --------------------
    result["idx_patient_hkid"] = _ensure_index(
        coll,
        [("tenant", ASCENDING), ("resourceType", ASCENDING), ("search.hkid", ASCENDING)],
        name="idx_patient_hkid",
        force=force
    )

    if {"gender", "dob"}.issubset(enabled_fields):
        result["idx_patient_gender_dob"] = _ensure_index(
            coll,
            [("tenant", ASCENDING), ("resourceType", ASCENDING),
             ("search.gender", ASCENDING), ("search.dob", ASCENDING)],
            name="idx_patient_gender_dob",
            force=force
        )
    else:
        result["idx_patient_gender_dob"] = "disabled"

    if {"city", "family"}.issubset(enabled_fields):
        result["idx_patient_city_family"] = _ensure_index(
            coll,
            [("tenant", ASCENDING), ("resourceType", ASCENDING),
             ("search.city", ASCENDING), ("search.family", ASCENDING)],
            name="idx_patient_city_family",
            force=force
        )
    else:
        result["idx_patient_city_family"] = "disabled"

    if "name" in enabled_fields:
        result["idx_patient_name"] = _ensure_index(
            coll,
            [("tenant", ASCENDING), ("resourceType", ASCENDING), ("search.name", ASCENDING)],
            name="idx_patient_name",
            force=force
        )
    else:
        result["idx_patient_name"] = "disabled"

    result["idx_patient_ccCodes"] = _ensure_index(
        coll,
        [("tenant", ASCENDING), ("resourceType", ASCENDING), ("search.ccCodes", ASCENDING)],
        name="idx_patient_ccCodes",
        force=force
    )

    result["idx_patient_mrn_by_hosp"] = _ensure_index(
        coll,
        [("tenant", ASCENDING), ("resourceType", ASCENDING),
         ("search.mrns.hospCode", ASCENDING), ("search.mrns.mrn", ASCENDING)],
        name="idx_patient_mrn_by_hosp",
        force=force
    )

    # --------------------
    # Encounter accelerated
    # --------------------
    result["idx_encounter_team_status"] = _ensure_index(
        coll,
        [("tenant", ASCENDING), ("resourceType", ASCENDING),
         ("search.hospCode", ASCENDING), ("search.teamCode", ASCENDING), ("search.statusCode", ASCENDING)],
        name="idx_encounter_team_status",
        force=force
    )

    result["idx_encounter_doctor_caseType"] = _ensure_index(
        coll,
        [("tenant", ASCENDING), ("resourceType", ASCENDING),
         ("search.hospCode", ASCENDING), ("search.doctorCode", ASCENDING), ("search.caseType", ASCENDING)],
        name="idx_encounter_doctor_caseType",
        force=force
    )

    result["idx_encounter_specialist_caseType"] = _ensure_index(
        coll,
        [("tenant", ASCENDING), ("resourceType", ASCENDING),
         ("search.hospCode", ASCENDING), ("search.specialistCode", ASCENDING), ("search.caseType", ASCENDING)],
        name="idx_encounter_specialist_caseType",
        force=force
    )

    if {"start", "end"}.issubset(enabled_fields):
        result["idx_encounter_period"] = _ensure_index(
            coll,
            [("tenant", ASCENDING), ("resourceType", ASCENDING),
             ("search.start", DESCENDING), ("search.end", DESCENDING)],
            name="idx_encounter_period",
            force=force
        )
    else:
        result["idx_encounter_period"] = "disabled"

    result["idx_encounter_by_patient_hkid"] = _ensure_index(
        coll,
        [("tenant", ASCENDING), ("resourceType", ASCENDING), ("search.hkid", ASCENDING)],
        name="idx_encounter_by_patient_hkid",
        force=force
    )

    result["idx_encounter_patientKey"] = _ensure_index(
        coll,
        [("tenant", ASCENDING), ("resourceType", ASCENDING), ("search.patientKey", ASCENDING)],
        name="idx_encounter_patientKey",
        force=force
    )

    result["idx_encounter_caseNum"] = _ensure_index(
        coll,
        [("tenant", ASCENDING), ("resourceType", ASCENDING), ("search.caseNum", ASCENDING)],
        name="idx_encounter_caseNum",
        force=force
    )

    return result
