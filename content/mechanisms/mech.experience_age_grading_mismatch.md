---
id: "mech.experience_age_grading_mismatch"
type: "mechanism"
aliases:
  - "M-017"
title: "Experience-Age Grading Mismatch"
summary: "A candidate with 10+ years applies for a role graded at mid or senior, and the screening note records forecasts about boredom, short tenure and salary expectation."
operates_at:
  - "bar.inbound_screening_triage"
  - "bar.recruiter_screening_call"
  - "bar.hiring_manager_in_depth_review"
emissions:
  -
    artifact: "A-013"
    fidelity: "direct"
    likelihood: "high"
    evidence: ["EVD-002"]
  -
    artifact: "A-002"
    fidelity: "euphemism"
    likelihood: "high"
    evidence: ["EVD-001"]
facets:
  actor: "recruiter"
  nature: "bias"
  visibility: "inferable"
  removability: "none"
amplifies:
  - "mech.unstated_compensation_band_discrepancy"
masks:
  - "mech.genuine_technical_skill_shortfall"
perspectives:
  -
    actor: "recruiter"
    sees: "A CV with years and scope above the level the requisition is graded and funded at, and a screening queue larger than the week's capacity."
    reads: "A forecast about retention and salary expectation, formed before any technical signal exists. The band is fixed and the level is not the recruiter's to change."
    does: "Passes at screening, or asks the hiring manager whether they want the profile at the level above — which is a different requisition."
  -
    actor: "candidate"
    sees: "A rejection naming seniority or overqualification, arriving before any technical stage, for a role whose posted band was acceptable."
    reads: "A decision about a future they were not asked about. Nothing in it separates a levelling grid from a judgement about the work."
    does: "Records the stage the rejection arrived at, and names a salary expectation at the screen of the next process rather than after it."
  -
    actor: "employer-policy"
    sees: "A levelling grid mapping years and scope to a band, and requisitions approved at one level at a time."
    reads: "Consistency across every hire, which is what the grid exists for. The applications the grid excludes do not reach this layer."
    does: "Holds the grid and the band, and any exception moves through the levelling committee on its own cycle rather than through the process in progress."
status: "active"
evidence_level: "supported"
honest_baseline: false
evidence_ids:
  - "EVD-002"
specimens:
  -
    kind: "note"
    label: "Screening note, internal"
    lines:
      -
        text: "12 years experience against a role scoped at 4–6."
      -
        text: "Concern: likely to be bored within two quarters; salary expectation probably above band; risk of using us as a bridge."
        tell: true
      -
        text: "Recommend: pass, unless the manager wants to see them for the level above."
    reading: "Every line is a forecast about the future, none is an observation about the work. This is why the rejection can arrive before any technical signal exists."
non_inferences:
  - "Being rejected as \"overqualified\" is an organisational tier mismatch, not a candidate deficiency."
---

# Experience-Age Grading Mismatch

A candidate with 10+ years applies for a role graded at mid or senior, and the screening note records forecasts about boredom, short tenure and salary expectation.

### Structural Context
- **Actor:** `recruiter`
- **Nature:** `bias`
- **Removability:** `none`

### Causal Relations
- Amplifies `mech.unstated_compensation_band_discrepancy` — Unstated Compensation Band Discrepancy
- Masks `mech.genuine_technical_skill_shortfall` — Genuine Technical Skill Shortfall

### Non-Inferences
- Being rejected as "overqualified" is an organisational tier mismatch, not a candidate deficiency.
