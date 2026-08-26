---
id: "HOBA-M-020"
type: "mechanism"
title: "Automated Application Expiration Timeout"
summary: "ATS configuration automatically issues bulk rejections to all pending unreviewed applications after 45 or 60 days."
operates_at:
  - "HOBA-B-001"
  - "HOBA-B-003"
emissions:
  -
    artifact: "HOBA-A-002"
    fidelity: "void"
    likelihood: "high"
    evidence: ["EVD-001"]
  -
    artifact: "HOBA-A-001"
    fidelity: "void"
    likelihood: "medium"
    evidence: ["EVD-001"]
facets:
  actor: "system"
  nature: "rule"
  visibility: "opaque"
  removability: "none"
amplifies: []
masks:
  - "HOBA-M-006"
status: "active"
evidence_level: "established"
honest_baseline: false
evidence_ids:
  - "EVD-001"
non_inferences:
  - "Bulk timeout rejection contains zero qualitative assessment of candidate profile."
---

# Automated Application Expiration Timeout

ATS configuration automatically issues bulk rejections to all pending unreviewed applications after 45 or 60 days.

### Structural Context
- **Actor:** `system`
- **Nature:** `rule`
- **Removability:** `none`

### Non-Inferences
- Bulk timeout rejection contains zero qualitative assessment of candidate profile.
