---
id: "obs.offer_rescinded_or_delayed_due_to_internal_freeze"
type: "artifact"
aliases:
  - "A-011"
title: "Offer rescinded or delayed due to internal freeze"
summary: "Candidate is offered a role verbally or in writing, and the offer is then delayed or withdrawn before the start date."
stages:
  - "offer"
  - "post-offer"
perspectives:
  -
    actor: "candidate"
    sees: "A written offer with a start date, then a message before that date saying outstanding offers are suspended. Notice may already have been given at the current employer."
    reads: "The stated cause sits above the hiring loop, and the message does not say whether the role is cancelled or deferred. Two dated documents about the same role now exist."
    does: "Asks in writing whether the requisition is cancelled or deferred and to which quarter, keeps both messages, and reopens the processes that were paused."
  -
    actor: "recruiter"
    sees: "An instruction that every open requisition is paused, arriving the same morning it arrives for everyone else, and a list of candidates to notify that includes one already holding a written offer."
    reads: "The commitment that was conveyed rests on an authority the recruiter does not hold, and whether headcount returns this quarter is not visible from inside the funnel."
    does: "Writes the message and chooses its wording. Can state the scope of the freeze and that other offers are in the same position; cannot give a start date."
  -
    actor: "employer-policy"
    sees: "A headcount decision applied to every open requisition at once. What reaches this layer is a count of paused requisitions and the spend it holds back."
    reads: "A pause preserves optionality: an approved requisition that can be stopped costs less than one that cannot. Offers already extended are part of that count."
    does: "Sets the scope of the freeze and the date it is reviewed. Resignations already handed in on the other side of those offers are not a figure this layer holds."
status: "active"
evidence_level: "supported"
evidence_ids:
  - "EVD-004"
probes:
  -
    id: "PROBE-A-011-1"
    action: "Ask for written notice of whether the requisition is cancelled outright or deferred to the next fiscal quarter."
    expected_signal: "Establishes whether there is a date to wait for."
    cost: "low"
    outcomes:
      -
        id: "deferred-with-date"
        label: "A written reply states that the requisition is paused rather than closed, names the quarter or the date on which the freeze is reviewed, and says the offer is revisited if headcount returns."
        excludes:
          - "mech.genuine_technical_skill_shortfall"
          - "mech.stale_or_orphaned_job_requisition"
        because: "A formal written pause date confirms a genuine headcount freeze (mech.headcount_freeze_or_budget_cancellation) rather than an honest hire or an evergreen ghost posting."
      -
        id: "cancelled-in-writing"
        label: "A written reply states that the requisition is closed and the headcount withdrawn, and names no date to return to."
        excludes:
          - "mech.genuine_technical_skill_shortfall"
        because: "Definitive written headcount cancellation after offer issuance directly confirms retraction."
      -
        id: "scope-without-date"
        label: "A written reply confirms the freeze and its scope — every open requisition, other offers in the same position — and states that whether the role is cancelled or deferred is not known from inside the hiring process."
        excludes:
          - "mech.genuine_technical_skill_shortfall"
        because: "Company-wide freeze confirmation confirms systemic budget suspension."
      -
        id: "no-written-answer"
        label: "Nothing further arrives in writing: the answer is given verbally, or the thread stops, and the two dated documents already held remain the whole record."
        excludes: []
specimens:
  -
    kind: "email"
    label: "The offer, then the retraction"
    subject: "Offer — Senior Backend Engineer"
    context: "nine days apart"
    lines:
      -
        text: "Day 0 — Delighted to confirm the offer we discussed. Start date 1 June, contract attached for signature."
      -
        text: "Day 9 — I am very sorry to write this. A company-wide hiring freeze was announced this morning and all outstanding offers are suspended, including yours."
        tell: true
      -
        text: "Day 9 — I understand you may have given notice. Please tell me if there is anything I can do, and I will be honest with you about what I can and cannot influence."
    reading: "Two dated documents about the same role. Whatever happens next, the fact that a written offer existed on day 0 is established, not remembered."
  -
    kind: "chat"
    label: "Establishing the scope of the freeze"
    lines:
      -
        speaker: "Candidate"
        at: "day 9"
        text: "Is the freeze specific to the team, or company-wide?"
      -
        speaker: "Recruiter"
        at: "day 9"
        text: "Company-wide. Every open req is paused, and three other offers are in the same position as yours."
        tell: true
    reading: "The answer places the cause outside the hiring loop and outside the candidate. It also makes the claim checkable against public news."
non_inferences:
  - "Does not mean the candidate failed a reference check, unless the message says so."
---

# Offer rescinded or delayed due to internal freeze

Candidate is offered a role verbally or in writing, and the offer is then delayed or withdrawn before the start date.

### Diagnostic Non-Inferences
- Does not mean the candidate failed a reference check, unless the message says so.
