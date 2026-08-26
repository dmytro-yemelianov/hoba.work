---
id: "HOBA-L-001"
type: "loop"
title: "Петля пенальті за перерву в роботі"
summary: "Перерва в роботі активує алгоритмічне зниження рейтингу в ATS, що веде до зменшення інтерв’ю і ще більше подовжує перерву."
mechanisms:
  - "HOBA-M-011"
  - "HOBA-M-008"
  - "HOBA-M-009"
edges:
  -
    from: "HOBA-M-011"
    to: "HOBA-M-008"
    relation: "amplifies"
  -
    from: "HOBA-M-008"
    to: "HOBA-M-009"
    relation: "amplifies"
  -
    from: "HOBA-M-009"
    to: "HOBA-M-011"
    relation: "amplifies"
entry_points:
  - "HOBA-M-011"
interventions:
  - "HOBA-I-004"
status: "active"
evidence_level: "supported"
evidence_ids:
  - "EVD-003"
---

# Петля пенальті за перерву в роботі

Перерва в роботі активує алгоритмічне зниження рейтингу в ATS, що веде до зменшення інтерв’ю і ще більше подовжує перерву.

### Cycle Dynamics
This causal loop reinforces mechanisms across iterations:
- `HOBA-M-011` amplifies `HOBA-M-008`
- `HOBA-M-008` amplifies `HOBA-M-009`
- `HOBA-M-009` amplifies `HOBA-M-011`
