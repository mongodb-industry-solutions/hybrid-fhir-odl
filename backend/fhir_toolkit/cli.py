from typing import Any, Dict, List

import typer
from .db import create_indexes, get_collection
from .synth import (
    generate_patients,
    generate_practitioners,
    generate_careteams,
    generate_encounters_for_patients,
)
from .ingest import upsert_documents
from .mappings import ensure_resource_id
from .config import settings

app = typer.Typer(help="FHIR + MongoDB toolkit CLI")

@app.command()
def init_db():
    # Create recommended indexes.
    create_indexes()
    typer.echo("Indexes created.")

@app.command()
def seed(
    patients: int = typer.Option(50, help="Number of patients"),
    encounters_per_patient: int = typer.Option(3, help="Encounters per patient"),
    practitioners: int = typer.Option(20, help="Number of practitioners"),
    careteams: int = typer.Option(10, help="Number of care teams"),
    tenant: str = typer.Option(None, help="Override tenant key for seeded data")
):
    # Generate synthetic resources and publish them to MongoDB.
    tenant_key = tenant or settings.tenant
    pats = generate_patients(patients)
    patient_resources: List[Dict[str, Any]] = []
    for resource, _ in pats:
        ensure_resource_id(resource)
        patient_resources.append(resource)
    pats_env = pats

    pracs = generate_practitioners(practitioners)
    for r in pracs:
        ensure_resource_id(r)
    pracs_env = [(r, {}) for r in pracs]

    teams = generate_careteams(careteams)
    for r in teams:
        ensure_resource_id(r)
    teams_env = [(r, {}) for r in teams]

    encs = generate_encounters_for_patients(patient_resources, pracs, teams, per_patient=encounters_per_patient)

    total = 0
    total += upsert_documents(pats_env, tenant=tenant_key)
    total += upsert_documents(pracs_env, tenant=tenant_key)
    total += upsert_documents(teams_env, tenant=tenant_key)
    total += upsert_documents(encs, tenant=tenant_key)

    typer.echo(f"Seeded {total} resources into {settings.mongodb_db}.{settings.mongodb_collection} for tenant {tenant_key}")

@app.command()
def wipe(confirm: bool = typer.Option(False, help="Confirm deletion")):
    # Delete all documents in the target collection (tenant only).
    if not confirm:
        typer.echo("Pass --confirm to proceed.")
        raise typer.Exit(code=1)
    coll = get_collection()
    res = coll.delete_many({"tenant": settings.tenant})
    typer.echo(f"Deleted {res.deleted_count} docs for tenant {settings.tenant}.")

def main():
    app()

if __name__ == "__main__":
    main()
