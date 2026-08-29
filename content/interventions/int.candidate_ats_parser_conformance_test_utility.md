---
id: "int.candidate_ats_parser_conformance_test_utility"
type: "intervention"
aliases:
  - "I-005"
title: "Candidate ATS Parser Conformance Test Utility"
summary: "Provide candidates with an open-source parsing validation tool to verify CV machine-readability before submission."
targets:
  - "mech.ats_parser_extraction_failure"
  - "bar.automated_filter_parser_threshold"
  - "pat.experience_age_impossibility"
actor: "candidate-action"
scope: "individual"
cost: "low"
specimens:
  -
    kind: "note"
    label: "Tool output, before submitting"
    subject: "hoba-parse-check · cv.pdf"
    lines:
      -
        text: "Extraction score: 41/100"
      -
        text: "Work experience entries recovered: 0 of 5 — two-column layout detected"
        tell: true
      -
        text: "Skills recovered: 0 of 24 — rendered inside a graphic"
      -
        text: "Suggested: single-column export, text-based headings, skills as plain text."
      -
        text: "Re-check after changes: extraction score 93/100, 5 of 5 entries, 24 of 24 skills."
    reading: "This is the one intervention on the candidate side of the line. Seeing what the parser sees turns an invisible failure into a fixable file."
perspectives:
  -
    actor: "candidate"
    sees: "An extraction report against their own file: how many work entries and skills a parser recovers, and which layout choice dropped them."
    reads: "The failure was in the document rather than in the record, and it is fixable before submission rather than inferable afterwards."
    does: "Re-exports single-column with text headings, re-checks, and submits the version that survives extraction."
  -
    actor: "recruiter"
    sees: "A complete profile in the queue: work history in fields, skills in fields, orderable against the rest."
    reads: "A profile with nothing in the experience field and a profile whose experience did not extract read identically from here; this removes one of the two before it arrives."
    does: "Screens on the content, and in the applications that still arrive empty, an unreadable file and a thin record remain indistinguishable."
status: "active"
evidence_level: "supported"
expected_effects:
  - "The candidate can see the extraction before submitting, so an unreadable file is distinguishable from a thin one"
  - "mech.ats_parser_extraction_failure moves from invisible to checkable on the candidate's side of the line"
measurements:
  - "parser_extraction_error_rate"
  - "ingestion_pass_rate"
evidence_ids:
  - "evidence.hidden_workers_untapped_talent_hbs_accenture"
---

# Candidate ATS Parser Conformance Test Utility

Provide candidates with an open-source parsing validation tool to verify CV machine-readability before submission.

### Expected Effects
- The candidate can see the extraction before submitting, so an unreadable file is distinguishable from a thin one
- mech.ats_parser_extraction_failure moves from invisible to checkable on the candidate's side of the line

### Measurements
- `parser_extraction_error_rate`
- `ingestion_pass_rate`
