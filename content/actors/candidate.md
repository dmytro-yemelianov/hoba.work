---
id: "candidate"
type: "actor"
title: "Candidate"
summary: "The person applying. The only party in the funnel who sees the whole of their own process and almost none of anyone else's."
controls:
  - "What is submitted, and in what machine-readable shape"
  - "Which processes to enter and when to withdraw"
  - "Which questions to ask, and when to ask them"
  - "What is recorded: dates, wording, who said it"
blind_to:
  - "Whether a requisition is funded, frozen or already promised internally"
  - "The band, the level, and the rubric being scored against"
  - "How many others are in the pipeline and where they came from"
  - "Whether a rejection was written by a person or emitted by a rule"
incentives:
  - "Reach a decision quickly enough to keep options open"
  - "Avoid spending unpaid hours on processes that were never live"
  - "Preserve the ability to reapply without having burned the relationship"
aliases:
  facet:
    - "candidate"
  intervention:
    - "candidate-action"
specimens:
  -
    kind: "note"
    label: "What the candidate can and cannot see"
    lines:
      -
        text: "Visible: every message received, every date, every stated reason, every hour spent."
      -
        text: "Invisible: the requisition status, the approved band, the rubric, the queue depth, and whether a human read anything."
        tell: true
      -
        text: "Most of the pain of a hiring process is an attempt to infer the second list from the first."
    reading: "This asymmetry is the reason the registry exists. It does not remove it — it makes the boundary between the two lists explicit."
recommendations:
  -
    id: "check-parser-output-before-submitting"
    title: "Check what the parser extracted before you submit"
    rationale: "The shape of the file is on the candidate's side of the line; what a reader decides after it is not. A layout a person reads without difficulty can arrive in the record as zero work-history entries, and the score that follows is arithmetic on what was extracted. Running the file through a parser first turns an invisible failure into an edit."
    cost: "low"
    costs: "A single-column text export gives up the layout, and every later edit to the document has to be checked again."
    targets:
      - "M-003"
      - "B-001"
      - "B-002"
      - "A-009"
    interventions:
      - "I-005"
  -
    id: "ask-what-the-conversation-is-attached-to"
    title: "Ask what the conversation is attached to"
    rationale: "Whether an approved requisition sits behind the outreach, and whether an internal candidacy is already running, are not in any field the candidate can see. Asking at the first exchange is the only route to either, and the answer arrives before the unpaid hours do."
    cost: "low"
    costs: "A logistics question in the first reply comes before any discussion of the work, and the answer cannot be checked against anything."
    targets:
      - "M-016"
      - "M-005"
      - "M-006"
      - "B-014"
      - "A-012"
    interventions: []
  -
    id: "ask-for-the-band-before-assessment"
    title: "Ask for the band before any assessment is scheduled"
    rationale: "The band, the level and the rubric are the second of the candidate's two lists, and the compensation bind runs on the candidate naming a number first. Asking for the band before an assessment is booked puts the mismatch at the screen rather than at week four, when the hours are already spent."
    cost: "medium"
    costs: "The question can end a process at the screen, and stating an expectation early fixes a number before the level is fixed."
    targets:
      - "M-004"
      - "B-004"
      - "B-009"
      - "pat.compensation_double_bind"
      - "A-005"
    interventions:
      - "I-002"
  -
    id: "keep-a-dated-record"
    title: "Keep a dated record of every message"
    rationale: "Dates, wording and who said it are the one part of the process the candidate holds in full. Kept as they arrive, they separate what a process established from what it did not: a rejection timed minutes after submission, a requisition back on the board, two rounds whose feedback disagrees."
    cost: "low"
    costs: "It is unpaid administrative time in the period when time is scarcest, and a complete record of a process that ends in silence is still a record of silence."
    targets:
      - "pat.closed_then_reposted_requisition_motif"
      - "A-004"
      - "A-014"
      - "A-007"
      - "M-013"
    interventions: []
  -
    id: "submit-at-the-stated-timebox"
    title: "Submit at the stated timebox and name the cuts"
    rationale: "The hours a work sample takes come out of the same budget as the search itself, and the minutes it is read for are set on the other side of the gate. Stopping at the stated timebox and writing down what was cut to fit it keeps the exercise inside the scope that was agreed and leaves the trade-offs on the page."
    cost: "medium"
    costs: "A submission that stops at the timebox is read next to submissions that did not stop, and the reviewer's minutes are not something the candidate sets."
    targets:
      - "L-002"
      - "M-019"
      - "B-006"
      - "A-006"
    interventions:
      - "I-006"
  -
    id: "set-a-closing-date-for-silence"
    title: "Set a date when a silent process closes"
    rationale: "Silence after submission covers a listing nobody took down, a batch expiry job and a queue that was never reached, and none of the three is visible from outside. Choosing the closing date in advance turns an open question into a finished one and returns the hours to the searches that answered."
    cost: "medium"
    costs: "An answer that arrives after the chosen date is treated as no answer, and the time already spent is written off rather than waited out."
    targets:
      - "M-020"
      - "M-006"
      - "M-009"
      - "B-003"
      - "A-001"
    interventions:
      - "I-001"
status: "active"
evidence_level: "supported"
evidence_ids: []
---

# Candidate

The person applying. The only party in the funnel who sees the whole of their own process and almost none of anyone else's.
