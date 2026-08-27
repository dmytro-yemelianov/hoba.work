---
id: "ats-vendor"
type: "actor"
title: "ATS vendor"
summary: "The platform the funnel runs inside. Writes no policy and decides no hire, yet its defaults decide what a great many people ever see."
controls:
  - "What the parser can extract, and what it silently drops"
  - "Which knockout rules a customer can configure, and which are on by default"
  - "What the ranking model reads as a feature"
  - "When an unreviewed application expires, and what it emails when it does"
blind_to:
  - "Whether a rule its customer configured is lawful, reasonable or even intended"
  - "What happened to a candidate outside the platform"
  - "Whether the profile it scored 12/100 was unreadable rather than unqualified"
incentives:
  - "Throughput and customer-visible efficiency, which are what the buyer evaluates"
  - "Feature parity with competitors, including features with known disparate effects"
  - "Defaults that reduce customer support load, not candidate confusion"
aliases:
  facet:
    - "system"
  intervention:
    - "ats-vendor"
specimens:
  -
    kind: "ats"
    label: "A default nobody chose"
    lines:
      -
        text: "Setting: auto_expire_unreviewed · Default: enabled · Threshold: 60 days"
      -
        text: "Setting: employment_gap_penalty · Default: enabled"
        tell: true
      -
        text: "Both ship on. Turning them off is a customer action nobody is prompted to take."
    reading: "Two lines of default configuration account for several mechanisms in this registry and one of its three reinforcing loops."
status: "active"
evidence_level: "supported"
evidence_ids: []
---

# ATS vendor

The platform the funnel runs inside. Writes no policy and decides no hire, yet its defaults decide what a great many people ever see.
