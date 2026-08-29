---
id: "bar.application_ingestion"
type: "barrier"
aliases:
  - "B-001"
title: "Application Ingestion"
stage: "ingestion"
order: 3
precedes:
  - "bar.automated_filter_parser_threshold"
description: "The initial ingestion gate where candidate CV and structured application fields enter the talent acquisition database / ATS."
pass_condition: "The application record is received, validates against the minimum schema, and is linked to an active job requisition."
specimens:
  -
    kind: "ats"
    label: "What the gate wrote"
    context: "the whole of it"
    lines:
      -
        at: "18:22:04"
        text: "POST /apply — 200 OK"
      -
        at: "18:22:04"
        text: "Candidate record created · linked to req #4471"
      -
        at: "18:22:05"
        text: "Required fields validated: 12 of 12"
      -
        at: "18:22:05"
        text: "Status: Under review"
        tell: true
    reading: "Passing this gate means a row exists and is attached to a live requisition. It says nothing about whether anyone will read it."
perspectives:
  -
    actor: "candidate"
    sees: "A confirmation that the form was accepted and a status that reads as under review. Nothing about which queue the record entered or who it is assigned to."
    reads: "The application is in the process, and the word review implies a reader."
    does: "Records the date and the wording, and keeps other processes running while the status stays unchanged."
  -
    actor: "ats-vendor"
    sees: "A request that validated against the schema and a record linked to a live requisition. The CV arrives here as fields, not as a reading."
    reads: "The transaction succeeded. This is throughput, which is what the buyer of the platform evaluates."
    does: "Creates the record, applies the default status, and starts the expiry clock that ships enabled."
  -
    actor: "recruiter"
    sees: "A counter on a requisition rising against a screening capacity that does not rise with it."
    reads: "Passing this gate carries no signal about the candidate. Until triage reaches the record, it is volume."
    does: "Nothing at this gate. The queue is worked at the next one, in an order set there."
status: "active"
evidence_level: "established"
evidence_ids:
  - "evidence.hidden_workers_untapped_talent_hbs_accenture"
---

# Application Ingestion

The initial ingestion gate where candidate CV and structured application fields enter the talent acquisition database / ATS.

### Pass Condition
The application record is received, validates against the minimum schema, and is linked to an active job requisition.
