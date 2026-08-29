---
id: "mech.ats_parser_extraction_failure"
type: "mechanism"
aliases:
  - "M-003"
title: "ATS Parser Extraction Failure"
summary: "Multi-column formatting, graphics, custom fonts, or unsupported document layouts cause ATS parser to corrupt or omit critical work history."
operates_at:
  - "bar.application_ingestion"
  - "bar.automated_filter_parser_threshold"
emissions:
  -
    artifact: "obs.complete_silence_after_submission"
    fidelity: "void"
    likelihood: "medium"
    evidence: ["evidence.hidden_workers_untapped_talent_hbs_accenture"]
    observed_at: ["ingestion"]
  -
    artifact: "obs.rejection_within_minutes_of_application_submission"
    fidelity: "direct"
    likelihood: "high"
    evidence: ["evidence.hidden_workers_untapped_talent_hbs_accenture"]
    observed_at: ["ingestion"]
facets:
  actor: "system"
  nature: "noise"
  visibility: "inferable"
  removability: "candidate"
amplifies:
  - "mech.automated_keyword_qualification_filter"
masks: []
perspectives:
  -
    actor: "actor.candidate"
    sees: "A document that opens correctly in a reader, and either a rejection soon after submission or no reply at all."
    reads: "The stored profile is not shown back, so this is inferable from the timing and from nothing else."
    does: "Resubmits in a single-column form with a text layer, wherever a second application is accepted. This is the branch the candidate can act on without anyone's cooperation."
  -
    actor: "actor.recruiter"
    sees: "A queue ordered by score, longer than the number of screens that fit in the week."
    reads: "A profile below the line reads as a profile that did not qualify. The document behind the score is not opened to check which it is."
    does: "Works down the ranked list from the top. The list carries no marker separating unread from unqualified, so the positions below the line stay closed."
status: "active"
evidence_level: "established"
honest_baseline: false
evidence_ids:
  - "evidence.hidden_workers_untapped_talent_hbs_accenture"
specimens:
  -
    kind: "ats"
    label: "Parsed profile, as the ATS stored it"
    context: "the same CV that renders correctly in a PDF reader"
    lines:
      -
        text: "Name: parsed · Email: parsed · Phone: parsed"
      -
        text: "Work experience: 0 entries"
        tell: true
      -
        text: "Skills: 0 entries"
      -
        text: "Raw text captured: 340 characters of a 4,100-character document"
      -
        text: "Ranking score: 12/100 — insufficient experience"
    reading: "The document was not read and rejected; it was not read. A two-column layout and a graphic header are enough to produce this."
non_inferences:
  - "Does not imply human recruiter evaluated and disliked candidate experience."
---

# ATS Parser Extraction Failure

Multi-column formatting, graphics, custom fonts, or unsupported document layouts cause ATS parser to corrupt or omit critical work history.

### Structural Context
- **Actor:** `system`
- **Nature:** `noise`
- **Removability:** `candidate`

### Causal Relations
- Amplifies `mech.automated_keyword_qualification_filter` — Automated Keyword / Qualification Filter

### Non-Inferences
- Does not imply human recruiter evaluated and disliked candidate experience.
