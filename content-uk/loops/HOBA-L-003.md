---
id: "HOBA-L-003"
type: "loop"
title: "Петля завищених вимог та тривалого пошуку"
summary: "Завищені вимоги відсіюють сильних спеціалістів, вакансія висить місяцями, команда виснажується і починає змінювати вимоги на льоту."
mechanisms:
  - "HOBA-M-024"
  - "HOBA-M-008"
  - "HOBA-M-013"
edges:
  -
    from: "HOBA-M-024"
    to: "HOBA-M-008"
    relation: "amplifies"
  -
    from: "HOBA-M-008"
    to: "HOBA-M-013"
    relation: "amplifies"
  -
    from: "HOBA-M-013"
    to: "HOBA-M-024"
    relation: "amplifies"
entry_points:
  - "HOBA-M-024"
interventions:
  - "HOBA-I-001"
  - "HOBA-I-003"
status: "active"
evidence_level: "supported"
evidence_ids:
  - "EVD-001"
  - "EVD-004"
---

# Петля завищених вимог та тривалого пошуку

Завищені вимоги відсіюють сильних спеціалістів, вакансія висить місяцями, команда виснажується і починає змінювати вимоги на льоту.

### Cycle Dynamics
This causal loop reinforces mechanisms across iterations:
- `HOBA-M-024` amplifies `HOBA-M-008`
- `HOBA-M-008` amplifies `HOBA-M-013`
- `HOBA-M-013` amplifies `HOBA-M-024`
