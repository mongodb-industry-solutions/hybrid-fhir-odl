// Presenter narration for every Sherpa-visible route in the Hybrid FHIR ODL demo.
// Keys match the paths produced by viewToPath() in ./viewState.
//
// Sherpa reads this through routeContextResolver and uses it as the default
// source for the Narration, Walkthrough, and Why Mongo panels. Step-level notes
// authored in Studio override these per step, so keep page-level context here.

const ROUTE_TALK_TRACKS = {
  "/": {
    title: "Hybrid FHIR ODL Guide",
    talkTrack: [
      "Start here to frame the problem: healthcare data arrives as FHIR, but the systems that consume it want their own shapes, and the usual answer is a pile of point-to-point integrations.",
      "This guide explains the hybrid Operational Data Layer: store FHIR resources as documents in MongoDB Atlas, then serve both standards-compliant FHIR APIs and purpose-built customer APIs from that one copy of the data.",
    ],
    journeySteps: [
      "Walk the guide to establish the ODL architecture and where it sits between source systems and consumers.",
      "Click 'Go Back to Demo' to move from the concept into the working platform.",
    ],
    whyMongo: [
      "The document model stores FHIR resources in their native nested shape, so there is no relational shredding step to maintain.",
      "One flexible schema can back many API contracts, which is what makes the hybrid ODL possible at all.",
    ],
  },
  "/demo/mappings": {
    title: "Mappings",
    talkTrack: [
      "Mappings is the heart of the hybrid story: this is where a FHIR resource field is bound to the field a customer-facing API actually exposes.",
      "Because the mapping is configuration rather than code, adding a new consumer contract does not mean a new ETL pipeline or a schema migration.",
    ],
    journeySteps: [
      "Pick a resource and walk a few field bindings from FHIR path to customer-facing field.",
      "Point out that the same underlying document serves both shapes at read time.",
    ],
    whyMongo: [
      "Flexible documents let the FHIR resource stay canonical while projections and aggregation pipelines produce each consumer's view.",
      "Schema evolution is additive: new fields land alongside existing ones without downtime.",
    ],
  },
  "/demo/synthetic": {
    title: "Synthetic Data",
    talkTrack: [
      "Synthetic Data generates realistic FHIR resources on demand, so the demo can be run against a populated ODL without any PHI.",
      "This is also the honest answer to 'can I try this with my own data' — the ingestion path here is the same one real source systems would use.",
    ],
    journeySteps: [
      "Generate a batch of patients and encounters.",
      "Note the volume and shape produced, then move to the Data Viewer to see it landed.",
    ],
    whyMongo: [
      "Documents are written in exactly the shape FHIR defines, so ingestion is a direct insert rather than a transformation stage.",
      "Atlas absorbs bursty write loads without schema coordination between producers.",
    ],
  },
  "/demo/resources": {
    title: "Data Viewer",
    talkTrack: [
      "The Data Viewer shows the stored FHIR resources as they really live in MongoDB: nested, self-contained documents.",
      "Use this to defuse the 'but FHIR is complicated' objection — the nesting that is painful in a relational schema is simply the document.",
    ],
    journeySteps: [
      "Browse a Patient and an Encounter document and expand the nested structures.",
      "Call out identifiers and references that the FHIR API will resolve.",
    ],
    whyMongo: [
      "One document per resource means one read per resource, with no joins to reassemble a clinical record.",
      "The stored form matches the wire form, which keeps the API layer thin.",
    ],
  },
  "/demo/customer": {
    title: "Customer APIs",
    talkTrack: [
      "Customer APIs are the second half of 'hybrid': tailored, non-FHIR endpoints shaped for a specific consumer, served from the same documents.",
      "This is the payoff — a mobile app or partner integration gets a lean contract without anyone standing up a separate datastore for it.",
    ],
    journeySteps: [
      "Call a customer endpoint and compare the response to the raw FHIR resource behind it.",
      "Tie the difference back to the bindings shown on the Mappings tab.",
    ],
    whyMongo: [
      "Aggregation pipelines reshape documents at query time, so each consumer contract is a projection, not a copy.",
      "No duplicated datasets means no synchronization lag between the FHIR view and the customer view.",
    ],
  },
  "/demo/fhir-api": {
    title: "FHIR API",
    talkTrack: [
      "The FHIR API tester proves the interoperability side: standards-compliant FHIR read and search operations served directly from Atlas.",
      "This is what lets the ODL sit in an existing healthcare ecosystem without asking any partner to adopt a proprietary contract.",
    ],
    journeySteps: [
      "Run a FHIR read for a known resource id, then a search with parameters.",
      "Show that the response is valid FHIR, unmodified from what a certified consumer expects.",
    ],
    whyMongo: [
      "FHIR search parameters map onto indexed document queries, so compliance does not cost performance.",
      "The same cluster answers FHIR traffic and customer traffic, with one operational footprint.",
    ],
  },
  "/demo/docs": {
    title: "API Docs",
    talkTrack: [
      "API Docs is the handoff artifact: the full surface a customer team would build against, FHIR and custom endpoints side by side.",
      "Use it to close on next steps — this is the contract they would consume in a pilot.",
    ],
    journeySteps: [
      "Skim the endpoint list and highlight the two families of routes.",
      "Point at the endpoint most relevant to the customer's stated use case.",
    ],
    whyMongo: [
      "A single Atlas-backed ODL is what keeps both API families in sync by construction.",
      "Adding an endpoint is a mapping and a pipeline, not a new integration project.",
    ],
  },
};

const DEFAULT_BUNDLE = {
  title: "Hybrid FHIR ODL",
  talkTrack: [
    "This demo shows MongoDB Atlas as a hybrid Operational Data Layer for FHIR: one document store serving both standards-compliant FHIR APIs and purpose-built customer APIs.",
  ],
  journeySteps: [
    "Open the Hybrid FHIR ODL Guide for the architecture, then move through the demo tabs.",
  ],
  whyMongo: [
    "The flexible document model lets one canonical copy of FHIR data back many consumer contracts.",
  ],
};

export const getRouteTalkTrackBundle = (pathname) =>
  ROUTE_TALK_TRACKS[pathname] || DEFAULT_BUNDLE;

export default ROUTE_TALK_TRACKS;
