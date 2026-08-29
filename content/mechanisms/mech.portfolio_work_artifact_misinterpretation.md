---
id: "mech.portfolio_work_artifact_misinterpretation"
type: "mechanism"
aliases:
  - "M-023"
title: "Portfolio / Work Artifact Misinterpretation"
summary: "The surface a screener opens does not show the candidate's architecture work, which sits in a non-standard repository layout or in contributions under another organisation."
operates_at:
  - "bar.inbound_screening_triage"
  - "bar.technical_screen_live_assessment"
emissions:
  -
    artifact: "A-019"
    fidelity: "direct"
    likelihood: "medium"
    evidence: []
  -
    artifact: "A-002"
    fidelity: "euphemism"
    likelihood: "high"
    evidence: ["EVD-001"]
  -
    artifact: "A-008"
    fidelity: "distortion"
    likelihood: "medium"
    evidence: ["EVD-006"]
    observed_at: ["technical"]
facets:
  actor: "candidate"
  nature: "noise"
  visibility: "inferable"
  removability: "candidate"
amplifies:
  - "mech.genuine_technical_skill_shortfall"
masks: []
perspectives:
  -
    actor: "candidate"
    sees: "A rejection, or structured feedback naming a shortfall in an area the candidate has shipped work in."
    reads: "The work exists. What is not visible from here is which surface was opened and what it showed."
    does: "Restructures what is submitted: the relevant work pinned, the commits linked directly rather than the account, the ownership stated in the CV line rather than left to be discovered."
  -
    actor: "recruiter"
    sees: "A link and the minutes available for it, against an inbound volume larger than the week's screening capacity."
    reads: "The surface that opens is the profile. A page of forks reads as little original work, because what is not on it cannot be told apart from what does not exist."
    does: "Records the note from what the page showed and moves to the next application. That note travels forward as the evidence about the candidate's work."
  -
    actor: "hiring-manager"
    sees: "A shortlist and the screening notes attached to it, not the repositories themselves."
    reads: "Architecture ownership was checked and not evidenced, which is what the note in front of them says."
    does: "Spends the panel's time on the shortlist as delivered. Reopening a screened-out profile costs review hours the team is already short of."
status: "active"
evidence_level: "supported"
honest_baseline: false
evidence_ids:
  - "EVD-001"
specimens:
  -
    kind: "note"
    label: "What the screener saw and what was there"
    lines:
      -
        text: "Screener note: mostly forks, little original work, no evidence of architecture ownership."
      -
        text: "The account: 3 pinned forks, and 40 commits over two years to an upstream project under a different org — including the storage layer rewrite referenced in the CV."
        tell: true
    reading: "The work exists and the surface that was checked does not show it. This is a discovery failure, and it is one of the few the candidate can fix directly."
non_inferences:
  - "Misinterpreted architecture can be corrected through structured documentation."
---

# Portfolio / Work Artifact Misinterpretation

The surface a screener opens does not show the candidate's architecture work, which sits in a non-standard repository layout or in contributions under another organisation.

### Structural Context
- **Actor:** `candidate`
- **Nature:** `noise`
- **Removability:** `candidate`

### Causal Relations
- Amplifies `mech.genuine_technical_skill_shortfall` — Genuine Technical Skill Shortfall

### Non-Inferences
- Misinterpreted architecture can be corrected through structured documentation.
