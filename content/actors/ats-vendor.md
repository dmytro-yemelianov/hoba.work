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
recommendations:
  -
    id: "drop-continuity-from-the-ranking-model"
    title: "Remove employment continuity from the ranking feature set"
    rationale: "The feature set of the ranking model is written by the vendor, not configured per customer, so continuity is one of the few inputs here that no buyer has to agree to remove. While it stays in the set, a break in employment lowers the rank, a lower rank returns fewer interviews, and the next application carries a longer break."
    cost: "medium"
    costs: "Every threshold customers tuned against the old score distribution shifts, and the field stays on competitors' feature lists after it leaves this one."
    targets:
      - "M-011"
      - "L-001"
      - "B-002"
    interventions:
      - "I-004"
  -
    id: "stop-scoring-unreadable-files"
    title: "Stop scoring files the parser could not read"
    rationale: "A file whose work history was lost in extraction and a file with no relevant work history reach the ranker as the same low number, and nothing downstream separates them. The extraction score is already computed, so routing anything below its threshold into a hold state rather than into the ranking is a change inside the pipeline the vendor owns."
    cost: "medium"
    costs: "The hold state is work that lands on customers with nobody assigned to it, and the share of applications the platform disposes of without a person — a number the buyer is shown — falls."
    targets:
      - "M-003"
      - "B-002"
      - "A-009"
    interventions: []
  -
    id: "show-the-parsed-record-to-the-applicant"
    title: "Show the applicant the record the parser stored"
    rationale: "The parsed record, not the uploaded file, is the version of the candidate every later stage reads, and it lives inside the platform rather than on the customer's careers page. Putting it into the submission confirmation with a way to correct it is the one point where the person who can tell that half the work history is missing is still able to say so."
    cost: "medium"
    costs: "It creates a candidate-facing surface the vendor maintains and receives corrections through, used by people who are not the customer that bought the platform."
    targets:
      - "M-003"
      - "B-001"
      - "B-002"
    interventions:
      - "I-005"
  -
    id: "hold-the-queue-rather-than-declining-it"
    title: "Hold the unreviewed queue instead of declining it"
    rationale: "When the inactivity timeout fires, what it does and what it emails are the vendor's, and the same batch job can hold the applications and raise the requisition to the customer as having had no interview activity since a stated date. Whether the listing then comes down is a decision about funding, which is not visible from inside the platform. Holding rather than declining leaves that decision with the party who can make it, and leaves the applicants a state rather than a verdict."
    cost: "medium"
    costs: "Every held queue becomes a customer decision the current default takes off their desk, and support load is exactly what these defaults are tuned to keep down."
    targets:
      - "M-020"
      - "M-006"
      - "A-001"
      - "A-002"
      - "pat.closed_then_reposted_requisition_motif"
    interventions:
      - "I-001"
  -
    id: "preview-what-a-knockout-rule-removes"
    title: "Show what a knockout rule removes before saving"
    rationale: "Which knockout rules can be expressed, and what the configuration screen shows while one is being written, are both the vendor's. Whether a rule is reasonable is not visible from here; what it would have done to the applications already stored is, and running the draft against them puts that in front of the person who does hold the judgement."
    cost: "low"
    costs: "The dry run reads the customer's stored applications on the configuration path, and the screen now states a number the vendor stands behind — including when a draft rule would have ended the entire stored pool."
    targets:
      - "M-008"
      - "M-024"
      - "pat.experience_age_impossibility"
      - "B-002"
      - "L-003"
    interventions: []
  -
    id: "name-the-rule-in-the-automated-decline"
    title: "Name the rule and threshold in automated declines"
    rationale: "The message an automated rule sends is the vendor's template, and the rule that fired, its threshold and the value it read are already in the log line behind it. Carrying those three items into the message is what separates a decline that names a criterion from one that arrives as a verdict on the person."
    cost: "medium"
    costs: "The customer's configuration becomes quotable by everyone it is applied to, and a threshold stated in writing draws replies the current template does not."
    targets:
      - "M-008"
      - "B-002"
      - "A-009"
      - "A-002"
    interventions: []
status: "active"
evidence_level: "supported"
evidence_ids: []
---

# ATS vendor

The platform the funnel runs inside. Writes no policy and decides no hire, yet its defaults decide what a great many people ever see.
