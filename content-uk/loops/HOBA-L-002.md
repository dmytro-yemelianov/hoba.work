---
id: "HOBA-L-002"
type: "loop"
title: "Петля витрат часу на тестові завдання"
summary: "Кандидати витрачають десятки годин на тестові завдання, втрачаючи час на пошук, поки перевіряючі поверхнево сканують код через втому."
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

# Петля витрат часу на тестові завдання

Кандидати витрачають десятки годин на тестові завдання, втрачаючи час на пошук, поки перевіряючі поверхнево сканують код через втому.

### Cycle Dynamics
This causal loop reinforces mechanisms across iterations:
- `HOBA-M-012` amplifies `HOBA-M-019`
- `HOBA-M-019` amplifies `HOBA-M-012`
