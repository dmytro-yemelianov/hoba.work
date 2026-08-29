---
id: "mech.start_date_slippage_and_post_acceptance_revocation"
type: "mechanism"
aliases:
  - "M-027"
title: "Start-Date Slippage and Post-Acceptance Revocation"
summary: "Employers defer confirmed start dates or revoke accepted offers between signing and day one when budgeting priorities or project authorisations change."
operates_at:
  - "bar.offer_closing_contract_execution"
  - "bar.probation_period_post_start_confirmation"
emissions:
  -
    artifact: "A-020"
    fidelity: "direct"
    likelihood: "high"
    evidence:
      - "EVD-040"
      - "EVD-041"
    observed_at:
      - "post-offer"
  -
    artifact: "A-001"
    fidelity: "void"
    likelihood: "medium"
    evidence: []
    observed_at:
      - "post-offer"
  -
    artifact: "A-011"
    fidelity: "euphemism"
    likelihood: "medium"
    evidence: []
    observed_at:
      - "post-offer"
facets:
  actor: "policy"
  nature: "incentive"
  visibility: "opaque"
  removability: "none"
amplifies: []
masks: []
honest_baseline: false
status: "active"
evidence_level: "established"
evidence_ids:
  - "EVD-040"
  - "EVD-041"
specimens:
  -
    kind: "email"
    label: "Start-date deferral notice"
    lines:
      -
        text: "We are finalizing internal team allocations and will be confirming the revised start date shortly."
        tell: true
      -
        text: "Please do not report to the office until the updated equipment schedule is issued."
        tell: false
    reading: "The delay manages company cash flow and headcount quotas by deferring payroll liability onto the candidate."
perspectives:
  -
    actor: "employer-policy"
    sees: "A hiring freeze or executive budget revision taking effect across pending hires before day-one employment commencement."
    reads: "Deferring start dates avoids immediate payroll commitments during headcount transitions."
    does: "Freezes onboarding queues and issues holding notifications."
  -
    actor: "candidate"
    sees: "A signed offer with an indefinite or pushed start date after resigning from previous employment."
    reads: "Contractual commitment was asymmetrical: candidate resignation is irreversible while company start date is deferred."
    does: "Assesses legal notice entitlements (EVD-041) and evaluates reopening active job search."
  -
    actor: "recruiter"
    sees: "A closed search reopened administratively because the approved start date cannot be scheduled."
    reads: "Hiring quotas shifted after offer signature, leaving recruiter metrics and candidate stranded."
    does: "Attempts to maintain contact while leadership resolves headcount funding."
non_inferences:
  - "Does not establish that candidate credentials or references failed validation."
---

# Start-Date Slippage and Post-Acceptance Revocation

Employers defer confirmed start dates or revoke accepted offers between signing and day one when budgeting priorities or project authorisations change.

### Structural Context
- **Actor:** `policy`
- **Nature:** `incentive`
- **Removability:** `none`

### Non-Inferences
- Does not establish that candidate credentials or references failed validation.
