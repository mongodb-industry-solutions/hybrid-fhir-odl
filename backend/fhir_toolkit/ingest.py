from typing import Iterable, Tuple, Dict, Any, List, Optional
from pymongo import UpdateOne
from .db import get_collection
from .mappings import envelope, ensure_resource_id

def upsert_documents(pairs: Iterable[Tuple[Dict[str,Any], Dict[str,Any]]], tenant: Optional[str] = None) -> int:
    # Upsert envelope docs for (resource, app) pairs.
    coll = get_collection()
    ops: List[UpdateOne] = []
    count = 0
    for resource, app in pairs:
        ensure_resource_id(resource)
        doc = envelope(resource, app, tenant=tenant)
        filt = {"tenant": doc["tenant"], "resourceType": doc["resourceType"], "resource.id": doc["resource"]["id"]}
        ops.append(UpdateOne(filt, {"$set": doc}, upsert=True))
        count += 1
        if len(ops) >= 1000:
            coll.bulk_write(ops, ordered=False)
            ops.clear()
    if ops:
        coll.bulk_write(ops, ordered=False)
    return count
