---
id: "mech.domain_specificity_over_weighting"
type: "mechanism"
aliases:
  - "M-018"
title: "Domain Specificity Over-Weighting"
summary: "The interviewer holds experience in one exact vertical — adtech, crypto, a named payment processor — as a requirement, ahead of transferable systems depth."
operates_at:
  - "bar.recruiter_screening_call"
  - "bar.hiring_manager_in_depth_review"
emissions:
  -
    artifact: "obs.rejection_naming_a_specific_industry_sector_as_required"
    fidelity: "direct"
    likelihood: "medium"
    evidence: []
    observed_at: ["recruiter"]
  -
    artifact: "obs.generic_closer_alignment_rejection_template"
    fidelity: "euphemism"
    likelihood: "high"
    evidence: ["evidence.hidden_workers_untapped_talent_hbs_accenture"]
    observed_at: ["recruiter"]
  -
    artifact: "obs.explicit_feedback_citing_skill_depth_shortfall"
    fidelity: "direct"
    likelihood: "medium"
    evidence: ["evidence.employment_interview_reliability_new_meta_analytic_estimates_by_structure_and_format"]
facets:
  actor: "hiring-manager"
  nature: "bias"
  visibility: "inferable"
  removability: "intermediary"
amplifies:
  - "mech.hidden_evaluation_rubric_or_undisclosed_priority"
masks:
  - "mech.genuine_technical_skill_shortfall"
perspectives:
  -
    actor: "actor.hiring_manager"
    sees: "A gap in the team's coverage of a specific set of rules or protocols, and a candidate whose depth is in an adjacent shape of the same problem."
    reads: "Transferable depth plus a ramp-up the team pays for while it is already short-handed. A miss on the vertical is visible after the hire and has a name on it."
    does: "Holds the vertical as a requirement rather than a preference, and the round turns on it whatever the rest of the panel recorded."
  -
    actor: "actor.candidate"
    sees: "A technical conversation that goes well until a question about a specific vertical, then a rejection worded as closer alignment."
    reads: "The engineering was heard and the vertical decided it, or the engineering was the reason and the vertical is the wording. The email carries both."
    does: "Records where in the round the turn happened, and reads the next posting's domain nouns as requirements rather than as context."
  -
    actor: "actor.recruiter"
    sees: "A brief with a vertical named in it, and panels returning notes that cite the vertical rather than the technical rubric."
    reads: "A requirement that narrows the pool while time-to-fill keeps counting, and one the hiring manager holds rather than the recruiter."
    does: "Screens on the vertical, because a shortlist without it comes back from the hiring manager, and sends the standard wording to the rest."
  -
    actor: "actor.ats_vendor"
    sees: "A requirement entered as a domain term, and a ranking model for which that term is a feature like any other."
    reads: "A configured preference, scored as specified. The platform has nothing that represents an adjacent domain solving the same problem."
    does: "Ranks and filters on the term as entered, and profiles whose depth is described in other nouns fall below the review threshold."
status: "active"
evidence_level: "supported"
honest_baseline: false
evidence_ids:
  - "evidence.employment_interview_reliability_new_meta_analytic_estimates_by_structure_and_format"
specimens:
  -
    kind: "transcript"
    label: "Where the round turned"
    context: "minute 12"
    lines:
      -
        speaker: "Interviewer"
        at: "12:03"
        text: "You have built settlement systems, but not in cards specifically?"
      -
        speaker: "Candidate"
        at: "12:09"
        text: "Not cards. Same problem shape though — idempotency, reconciliation, chargeback-equivalent reversals."
      -
        speaker: "Interviewer"
        at: "12:19"
        text: "We really need someone who has lived in card rails. The scheme rules are their own world."
        tell: true
    reading: "Transferable depth was heard and set aside for vertical familiarity. That is a legitimate preference and a narrow one; the rejection is about the filter, not the engineering."
non_inferences:
  - "Transferable general engineering skills are not disproven by lack of specific proprietary protocol knowledge."
---

# Domain Specificity Over-Weighting

The interviewer holds experience in one exact vertical — adtech, crypto, a named payment processor — as a requirement, ahead of transferable systems depth.

### Structural Context
- **Actor:** `hiring-manager`
- **Nature:** `bias`
- **Removability:** `intermediary`

### Causal Relations
- Amplifies `mech.hidden_evaluation_rubric_or_undisclosed_priority` — Hidden Evaluation Rubric or Undisclosed Priority
- Masks `mech.genuine_technical_skill_shortfall` — Genuine Technical Skill Shortfall

### Non-Inferences
- Transferable general engineering skills are not disproven by lack of specific proprietary protocol knowledge.
