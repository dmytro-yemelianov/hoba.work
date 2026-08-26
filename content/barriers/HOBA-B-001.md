---
id: "HOBA-B-001"
type: "barrier"
title: "Application Ingestion"
stage: "ingestion"
order: 1
precedes:
  - "HOBA-B-002"
description: "The initial ingestion gate where candidate CV and structured application fields enter the talent acquisition database / ATS."
pass_condition: "Application record is successfully received, validated for minimum schema, and linked to the active job requisition."
status: "active"
evidence_level: "established"
evidence_ids:
  - "EVD-001"
---

# Application Ingestion

The initial ingestion gate where candidate CV and structured application fields enter the talent acquisition database / ATS.

### Pass Condition
Application record is successfully received, validated for minimum schema, and linked to the active job requisition.
