---
id: "HOBA-A-012"
type: "artifact"
title: "Вхідне повідомлення від рекрутера з подальшим зникненням"
summary: "Рекрутер сам пише кандидату про зацікавленість, але зникає після того, як кандидат надає резюме або слоти для дзвінка."
stages:
  - "sourcing"
  - "recruiter"
status: "active"
evidence_level: "supported"
evidence_ids:
  - "EVD-001"
probes:
  -
    id: "PROBE-A-012-1"
    action: "Send one single polite follow-up after 5 business days referencing original outreach thread."
    expected_signal: "Recovers stalled conversation if recruiter was out-of-office or overwhelmed."
    cost: "low"
non_inferences:
  - "Does not prove candidate profile was rejected; often indicates batch automated sourcing campaigns."
---

# Вхідне повідомлення від рекрутера з подальшим зникненням

Рекрутер сам пише кандидату про зацікавленість, але зникає після того, як кандидат надає резюме або слоти для дзвінка.

### Diagnostic Non-Inferences
- Does not prove candidate profile was rejected; often indicates batch automated sourcing campaigns.
