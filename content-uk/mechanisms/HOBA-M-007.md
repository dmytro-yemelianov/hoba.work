---
id: "HOBA-M-007"
type: "mechanism"
title: "Замороження headcount або скасування бюджету"
summary: "Керівництво або фінансовий відділ блокує нові найми через зміну бюджету під час триваючого процесу інтерв’ю."
operates_at:
  - "HOBA-B-008"
  - "HOBA-B-010"
  - "HOBA-B-012"
emissions:
  -
    artifact: "HOBA-A-003"
    fidelity: "direct"
    likelihood: "high"
    evidence: ["EVD-004"]
  -
    artifact: "HOBA-A-011"
    fidelity: "direct"
    likelihood: "high"
    evidence: ["EVD-004"]
facets:
  actor: "policy"
  nature: "rule"
  visibility: "inferable"
  removability: "none"
amplifies:
  - "HOBA-M-006"
masks:
  - "HOBA-M-001"
  - "HOBA-M-002"
status: "active"
evidence_level: "established"
honest_baseline: false
evidence_ids:
  - "EVD-004"
non_inferences:
  - "Candidate performance in interview was not the causal trigger for process termination."
---

# Замороження headcount або скасування бюджету

Керівництво або фінансовий відділ блокує нові найми через зміну бюджету під час триваючого процесу інтерв’ю.

### Structural Context
- **Actor:** `policy`
- **Nature:** `rule`
- **Removability:** `none`

### Non-Inferences
- Candidate performance in interview was not the causal trigger for process termination.
