---
id: "HOBA-I-005"
type: "intervention"
title: "Candidate ATS Parser Conformance Test Utility"
summary: "Provide candidates with an open-source parsing validation tool to verify CV machine-readability before submission."
targets:
  - "HOBA-M-003"
  - "HOBA-B-002"
actor: "candidate-action"
scope: "individual"
cost: "low"
status: "active"
evidence_level: "supported"
expected_effects:
  - "Eliminate formatting-induced silent parsing failures"
  - "Increase candidate confidence in resume ingestion fidelity"
measurements:
  - "parser_extraction_error_rate"
  - "ingestion_pass_rate"
evidence_ids:
  - "EVD-001"
---

# Candidate ATS Parser Conformance Test Utility

Provide candidates with an open-source parsing validation tool to verify CV machine-readability before submission.

### Expected Effects
- Eliminate formatting-induced silent parsing failures
- Increase candidate confidence in resume ingestion fidelity

### Measurements
- `parser_extraction_error_rate`
- `ingestion_pass_rate`
