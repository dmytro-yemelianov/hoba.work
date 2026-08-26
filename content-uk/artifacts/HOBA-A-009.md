---
id: "HOBA-A-009"
type: "artifact"
title: "Відмова протягом кількох хвилин після відправки"
summary: "Автоматична відмова надходить через 2–30 хвилин після подачі, часто у неробочий час."
stages:
  - "ingestion"
status: "active"
evidence_level: "supported"
evidence_ids:
  - "EVD-001"
probes:
  -
    id: "PROBE-A-009-1"
    action: "Audit application answers to mandatory knock-out questions (work permit, country of residence, minimum years experience)."
    expected_signal: "Identifies exact boolean filter rule triggered by ATS."
    cost: "low"
non_inferences:
  - "Does not imply candidate resume was judged as poor by human engineers."
---

# Відмова протягом кількох хвилин після відправки

Автоматична відмова надходить через 2–30 хвилин після подачі, часто у неробочий час.

### Diagnostic Non-Inferences
- Does not imply candidate resume was judged as poor by human engineers.
