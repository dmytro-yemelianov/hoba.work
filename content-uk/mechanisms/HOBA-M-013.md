---
id: "HOBA-M-013"
type: "mechanism"
title: "Зміна вимог до ролі під час процесу найму"
summary: "Команда змінює фокус, технологічний стек або грейд ролі безпосередньо під час співбесід."
operates_at:
  - "HOBA-B-007"
  - "HOBA-B-008"
  - "HOBA-B-009"
emissions:
  -
    artifact: "HOBA-A-003"
    fidelity: "distortion"
    likelihood: "medium"
    evidence: ["EVD-004"]
  -
    artifact: "HOBA-A-004"
    fidelity: "direct"
    likelihood: "high"
    evidence: ["EVD-004"]
facets:
  actor: "hiring-manager"
  nature: "noise"
  visibility: "inferable"
  removability: "none"
amplifies:
  - "HOBA-M-004"
masks:
  - "HOBA-M-001"
status: "active"
evidence_level: "supported"
honest_baseline: false
evidence_ids:
  - "EVD-004"
non_inferences:
  - "Candidate rejection was driven by shifting team mandate, not prior interview answers."
---

# Зміна вимог до ролі під час процесу найму

Команда змінює фокус, технологічний стек або грейд ролі безпосередньо під час співбесід.

### Structural Context
- **Actor:** `hiring-manager`
- **Nature:** `noise`
- **Removability:** `none`

### Non-Inferences
- Candidate rejection was driven by shifting team mandate, not prior interview answers.
