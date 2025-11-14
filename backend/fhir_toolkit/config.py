from pydantic import BaseModel
from dotenv import load_dotenv
import os

load_dotenv()

class Settings(BaseModel):
    mongodb_uri: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    mongodb_db: str = os.getenv("MONGODB_DB", "fhir_demo")
    mongodb_collection: str = os.getenv("MONGODB_COLLECTION", "fhir")
    tenant: str = os.getenv("MONGODB_TENANT", os.getenv("TENANT", "acme"))
    fhir_base_url: str = os.getenv("FHIR_BASE_URL", "http://localhost:8000/fhir")
    enable_fhir_denorm: bool = os.getenv("ENABLE_FHIR_DENORMALIZATION", "true").lower() in ("1", "true", "yes")

settings = Settings()
