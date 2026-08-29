---
id: "loop.employment_gap_penalty_loop"
type: "loop"
aliases:
  - "L-001"
title: "Employment Gap Penalty Loop"
summary: "An employment gap triggers automated downranking (mech.employment_gap_downranking_bias), which pushes the profile below keyword and qualification filters (mech.automated_keyword_qualification_filter); fewer interview invitations lengthen the gap, which in turn strengthens the downranking."
mechanisms:
  - "mech.employment_gap_downranking_bias"
  - "mech.automated_keyword_qualification_filter"
edges:
  -
    from: "mech.employment_gap_downranking_bias"
    to: "mech.automated_keyword_qualification_filter"
    relation: "amplifies"
  -
    from: "mech.automated_keyword_qualification_filter"
    to: "mech.employment_gap_downranking_bias"
    relation: "amplifies"
entry_points:
  - "mech.employment_gap_downranking_bias"
interventions:
  - "int.remove_career_gap_feature_from_automated_ranking_models"
specimens:
  -
    kind: "ats"
    label: "The same profile, two cycles apart"
    context: "same CV, same market, nine months between"
    lines:
      -
        text: "Cycle 1 — skills 91, domain 88, continuity penalty −22 (gap 14 months) → rank 57"
        tell: true
      -
        text: "Cycle 2 — skills 91, domain 88, continuity penalty −34 (gap 23 months) → rank 45"
        tell: true
      -
        text: "Advance threshold both times: 60."
    reading: "Nothing in the work changed between the two rows. The only variable that moved is the one the penalty reads, and it moves because the penalty worked the first time."
  -
    kind: "note"
    label: "Why the loop closes"
    lines:
      -
        text: "Downranking pushes the profile below the filter threshold."
      -
        text: "Below the threshold there are no interviews."
      -
        text: "No interviews means no offer, so the gap continues to grow."
      -
        text: "A longer gap increases the penalty on the next application."
        tell: true
    reading: "Each step is a reasonable rule on its own. Together they form a cycle whose input is its own output."
perspectives:
  -
    actor: "candidate"
    sees: "Applications that return no reply at all, or a generic rejection, with the same CV and the same market as the cycle before."
    reads: "Something in the profile moved between cycles, and the only thing that did move is the length of the break itself."
    does: "Keeps applying, since applications are the only input available, and each month without an interview adds to the break the next application carries."
  -
    actor: "recruiter"
    sees: "A ranked queue of several hundred applications against capacity to read a few dozen, on a requisition where time-to-fill is measured."
    reads: "The order is a triage of a list that cannot be read end to end, not a judgement about anyone in it."
    does: "Reads from the top down until the week's capacity is used, which is where the ranking becomes the decision."
  -
    actor: "ats-vendor"
    sees: "A continuity feature computed from the dates in the parsed work history, shipping enabled by default."
    reads: "It is one input among several in a ranking the buyer evaluates on throughput; whether a low-scored profile was unreadable rather than unqualified is not something the score records."
    does: "Applies the penalty on every scoring pass and offers it as a setting the customer can switch off, which nothing in the default configuration prompts anyone to do."
status: "active"
evidence_level: "supported"
evidence_ids:
  - "EVD-003"
---

# Employment Gap Penalty Loop

An employment gap triggers automated downranking (mech.employment_gap_downranking_bias), which pushes the profile below keyword and qualification filters (mech.automated_keyword_qualification_filter); fewer interview invitations lengthen the gap, which in turn strengthens the downranking.

### Cycle Dynamics
This causal loop reinforces mechanisms across iterations:
- `mech.employment_gap_downranking_bias` amplifies `mech.automated_keyword_qualification_filter`
- `mech.automated_keyword_qualification_filter` amplifies `mech.employment_gap_downranking_bias`
