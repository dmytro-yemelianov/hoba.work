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
    artifact: "obs.feedback_naming_as_absent_something_the_submitted_work_contains"
    fidelity: "direct"
    likelihood: "medium"
    evidence: []
  -
    artifact: "obs.generic_closer_alignment_rejection_template"
    fidelity: "euphemism"
    likelihood: "high"
    evidence: ["evidence.hidden_workers_untapped_talent_hbs_accenture"]
  -
    artifact: "obs.explicit_feedback_citing_skill_depth_shortfall"
    fidelity: "distortion"
    likelihood: "medium"
    evidence: ["evidence.employment_interview_reliability_new_meta_analytic_estimates_by_structure_and_format"]
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
    actor: "actor.candidate"
    sees: "A rejection, or structured feedback naming a shortfall in an area the candidate has shipped work in."
    reads: "The work exists. What is not visible from here is which surface was opened and what it showed."
    does: "Restructures what is submitted: the relevant work pinned, the commits linked directly rather than the account, the ownership stated in the CV line rather than left to be discovered."
  -
    actor: "actor.recruiter"
    sees: "A link and the minutes available for it, against an inbound volume larger than the week's screening capacity."
    reads: "The surface that opens is the profile. A page of forks reads as little original work, because what is not on it cannot be told apart from what does not exist."
    does: "Records the note from what the page showed and moves to the next application. That note travels forward as the evidence about the candidate's work."
  -
    actor: "actor.hiring_manager"
    sees: "A shortlist and the screening notes attached to it, not the repositories themselves."
    reads: "Architecture ownership was checked and not evidenced, which is what the note in front of them says."
    does: "Spends the panel's time on the shortlist as delivered. Reopening a screened-out profile costs review hours the team is already short of."
status: "active"
evidence_level: "supported"
honest_baseline: false
evidence_ids:
  - "evidence.hidden_workers_untapped_talent_hbs_accenture"
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
