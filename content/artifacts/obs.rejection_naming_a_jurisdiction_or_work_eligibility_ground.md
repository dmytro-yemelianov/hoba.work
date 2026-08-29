---
id: "obs.rejection_naming_a_jurisdiction_or_work_eligibility_ground"
type: "artifact"
aliases:
  - "A-017"
title: "Rejection naming a jurisdiction or work-eligibility ground"
summary: "The stated reason is where the candidate lives, the hours they can cover, or the right to be employed there — not anything about the work."
stages:
  - "ingestion"
  - "recruiter"
perspectives:
  -
    actor: "actor.candidate"
    sees: "A reason that can be checked against the posting: a country, a set of hours, a permit. Unlike most stated reasons, this one refers to a fact rather than a judgement."
    reads: "The ground named is verifiable, which is unusual. Whether it was the operative ground, or the one that could be written down without commenting on the candidate, is not settled by the message."
    does: "Compares the ground against what the posting stated when it was applied to, using a saved copy, because a posting can be edited after the fact."
  -
    actor: "actor.recruiter"
    sees: "A candidate the team would take and a hiring location list that does not include where they are."
    reads: "This is the one closing reason that is fully outside the candidate and fully inside a document. It can be stated without hedging."
    does: "Names the ground plainly, because doing so is both accurate and easier than a template that would invite a follow-up."
  -
    actor: "actor.employer_policy"
    sees: "A list of jurisdictions in which a contract can be issued, set by which entities and payroll providers exist, and reviewed on a slower cycle than any single search."
    reads: "The list is a constraint on the search, not an assessment within it. Roles are published against it, and exceptions cost more than a single hire usually justifies."
    does: "Holds the list, and grants exceptions through a route that runs on a different calendar from the requisition."
status: "active"
evidence_level: "hypothesis"
evidence_ids: []
probes:
  -
    id: "PROBE-A-017-1"
    action: "Compare the ground named in the message against the copy of the posting as it stood on the day of application."
    expected_signal: "Establishes whether the ground was stated up front or introduced afterwards."
    cost: "low"
    outcomes:
      -
        id: "stated-in-the-posting"
        label: "The posting stated the same constraint, in the same terms, before the application was made."
        excludes:
          - "mech.ats_parser_extraction_failure"
          - "mech.hiring_manager_consensus_impasse"
        because: "An upfront explicit location constraint rules out post-hoc constraint injection and location bait-and-switch."
      -
        id: "absent-from-the-posting"
        label: "The posting said nothing about the constraint, or stated a wider one."
        excludes:
          - "mech.genuine_technical_skill_shortfall"
        because: "Rejecting on an unstated location constraint contradicts an honest baseline evaluation against published terms."
      -
        id: "posting-edited"
        label: "The posting now carries the constraint, and the saved copy shows it did not."
        excludes:
          - "mech.genuine_technical_skill_shortfall"
        because: "Retroactively editing criteria after applications arrive contradicts honest process standards."
      -
        id: "no-saved-copy"
        label: "No copy of the posting as applied to was kept, and the listing has changed or gone."
        excludes: []
specimens:
  -
    kind: "email"
    label: "Recruiter reply"
    subject: "Re: your application"
    lines:
      -
        text: "Thanks for your time on the call earlier this week."
      -
        text: "We are not able to employ in your country of residence for this role, so we cannot take this forward."
        tell: true
      -
        text: "If that changes on your side, do let us know."
    reading: "The ground is checkable against a document, which almost no other stated reason is. That makes it worth checking — and checkable is not the same as operative."
non_inferences:
  - "Does not establish that no route to employment existed, only that none was used here."
  - "Does not establish that the constraint was the first ground on which the application was set aside."
---

# Rejection naming a jurisdiction or work-eligibility ground

The stated reason is where the candidate lives, the hours they can cover, or the right to be employed there — not anything about the work.

### Diagnostic Non-Inferences
- Does not establish that no route to employment existed, only that none was used here.
- Does not establish that the constraint was the first ground on which the application was set aside.
