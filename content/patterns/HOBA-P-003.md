---
id: "HOBA-P-003"
type: "pattern"
title: "Experience-Age Impossibility"
summary: "Requisition requires more years of hands-on experience in a specific framework or tool than that technology has existed in the open-source ecosystem."
required_artifacts:
  - "HOBA-A-002"
  - "HOBA-A-009"
compatible_mechanisms:
  - "HOBA-M-008"
  - "HOBA-M-024"
trigger_rule: "Job description or automated screen requires X years of experience where X > technology_age."
establishes:
  - "Job description was authored without technical review, using copy-paste templates with automated gating rules."
non_inferences:
  - "Does not imply technical team is incompetent, only that HR screening pipeline lacks technical validation."
interventions:
  - "HOBA-I-005"
status: "active"
evidence_level: "supported"
evidence_ids:
  - "EVD-001"
---

# Experience-Age Impossibility

Requisition requires more years of hands-on experience in a specific framework or tool than that technology has existed in the open-source ecosystem.

### Trigger Rule
Job description or automated screen requires X years of experience where X > technology_age.

### What this Establishes
- Job description was authored without technical review, using copy-paste templates with automated gating rules.

### What this Does NOT Establish
- Does not imply technical team is incompetent, only that HR screening pipeline lacks technical validation.
