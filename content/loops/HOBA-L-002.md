---
id: "HOBA-L-002"
type: "loop"
title: "Take-Home Opportunity-Cost Saturation Loop"
summary: "Candidates invest heavy hours into unbounded take-home assignments, reducing bandwidth for applications, while reviewers suffer evaluation fatigue."
mechanisms:
  - "HOBA-M-012"
  - "HOBA-M-019"
edges:
  -
    from: "HOBA-M-012"
    to: "HOBA-M-019"
    relation: "amplifies"
  -
    from: "HOBA-M-019"
    to: "HOBA-M-012"
    relation: "amplifies"
entry_points:
  - "HOBA-M-012"
interventions:
  - "HOBA-I-006"
status: "active"
evidence_level: "supported"
evidence_ids:
  - "EVD-006"
---

# Take-Home Opportunity-Cost Saturation Loop

Candidates invest heavy hours into unbounded take-home assignments, reducing bandwidth for applications, while reviewers suffer evaluation fatigue.

### Cycle Dynamics
This causal loop reinforces mechanisms across iterations:
- `HOBA-M-012` amplifies `HOBA-M-019`
- `HOBA-M-019` amplifies `HOBA-M-012`
