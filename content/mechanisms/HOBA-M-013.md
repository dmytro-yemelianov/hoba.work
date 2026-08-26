---
id: "HOBA-M-013"
type: "mechanism"
title: "Mid-Process Role Requirement Redefinition"
summary: "Team changes tech stack, seniority requirements, or project scope mid-funnel, invalidating previous interview assessments."
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

# Mid-Process Role Requirement Redefinition

Team changes tech stack, seniority requirements, or project scope mid-funnel, invalidating previous interview assessments.

### Structural Context
- **Actor:** `hiring-manager`
- **Nature:** `noise`
- **Removability:** `none`

### Non-Inferences
- Candidate rejection was driven by shifting team mandate, not prior interview answers.
