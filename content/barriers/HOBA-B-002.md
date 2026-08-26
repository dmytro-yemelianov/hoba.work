---
id: "HOBA-B-002"
type: "barrier"
title: "Automated Filter & Parser Threshold"
stage: "ingestion"
order: 2
precedes:
  - "HOBA-B-003"
  - "HOBA-B-004"
description: "Algorithmic text extraction, keyword scoring, compliance screening (location/work authorization), and knockout question evaluations."
pass_condition: "CV parsing achieves sufficient extraction score and candidate passes all mandatory algorithmic gating rules."
status: "active"
evidence_level: "established"
evidence_ids:
  - "EVD-001"
---

# Automated Filter & Parser Threshold

Algorithmic text extraction, keyword scoring, compliance screening (location/work authorization), and knockout question evaluations.

### Pass Condition
CV parsing achieves sufficient extraction score and candidate passes all mandatory algorithmic gating rules.
