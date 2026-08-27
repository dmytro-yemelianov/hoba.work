---
id: "recruiter"
type: "actor"
title: "Recruiter"
summary: "The function that moves people through the funnel. Holds the most information about the process and the least authority over its outcome."
controls:
  - "Which applications are read and in what order"
  - "What is disclosed at the screen, and when"
  - "The wording of the rejection"
  - "Whether a candidate is told a search has stalled"
blind_to:
  - "What the panel actually scored, beyond the recommendation"
  - "Whether finance will approve the headcount this quarter"
  - "What the hiring manager privately requires but has not written down"
incentives:
  - "Move the pipeline; time-to-fill is measured, time-to-clarity is not"
  - "Protect the relationship with the hiring manager, who is the internal client"
  - "Avoid saying anything that could be quoted back as a commitment"
aliases:
  facet:
    - "recruiter"
  intervention:
    - "recruiter-process"
specimens:
  -
    kind: "ats"
    label: "The week as the metrics see it"
    lines:
      -
        at: "week 1"
        text: "Open requisitions: 11 · Applications received: 640 · Screening capacity: 40"
      -
        at: "week 1"
        text: "Measured: time-to-fill, pipeline conversion, offer acceptance."
      -
        at: "week 1"
        text: "Not measured: time-to-clarity, or whether anyone who was rejected understood why."
        tell: true
    reading: "Several mechanisms in this registry are the shape of this table rather than of any decision anyone made."
recommendations:
  -
    id: "state-the-band-first"
    title: "State the band before asking for a number"
    rationale: "The screen is where compensation first comes up, and the order of the two questions is the recruiter's to set. Saying the band that is on the requisition, before asking what the candidate expects, removes the asymmetry that both branches of the compensation bind run on. Where no band has been set, saying that is also an answer the candidate can act on."
    cost: "medium"
    costs: "It spends the flexibility of hearing the candidate's figure first, and it puts a number into the conversation that can be quoted back later as a commitment."
    targets:
      - "B-004"
      - "M-004"
      - "P-004"
    interventions:
      - "I-002"
  -
    id: "name-the-stage-and-criterion"
    title: "Name the stage and the criterion that ended it"
    rationale: "The wording of the rejection belongs to this seat, and the same message can carry the stage the process ended at, the criterion that was named to the recruiter, and what the process never reached. Where the panel returned a recommendation without a criterion, the message records that no criterion was given, rather than a template sentence standing in its place. What can be written is bounded by what the recruiter was handed."
    cost: "medium"
    costs: "Each message is written rather than selected, against a clock measured as time-to-fill, and asking the panel for a criterion spends standing with the hiring manager, who is the internal client."
    targets:
      - "A-002"
      - "M-010"
      - "B-008"
    interventions:
      - "I-003"
  -
    id: "tell-them-when-a-search-stalls"
    title: "Tell everyone still inside when a search stops moving"
    rationale: "Whether a candidate learns that a search has stalled is decided in this seat, and it is decidable from what is visible here: the date of the last scheduling activity on the requisition. The message states that date and no more, because whether the headcount returns this quarter is not visible from here. Silence at this point is read as a decision about the candidate."
    cost: "medium"
    costs: "Candidates who are told make other plans, and the message puts in writing that the internal client's search has stopped, against a seat measured on time-to-fill and on that relationship."
    targets:
      - "A-001"
      - "A-003"
      - "M-006"
    interventions:
      - "I-001"
  -
    id: "name-the-stages-and-dates"
    title: "Name every stage and its date at the screen"
    rationale: "What the process contains, how many conversations it has and when the first decision is due are disclosed at the screen or nowhere, and that disclosure sits in this seat. A candidate holding the list can tell a delay from an ending. When a round is added or a date moves, the same channel carries that within days to everyone already inside."
    cost: "medium"
    costs: "A stated date is a commitment held against interviewer calendars this seat does not control, so every slip becomes a message that has to be written."
    targets:
      - "B-004"
      - "A-007"
      - "M-013"
    interventions: []
  -
    id: "say-if-a-requisition-exists"
    title: "Say whether an approved requisition sits behind the call"
    rationale: "Outreach and the first conversation are where the recruiter states what the contact is for. Whether a requisition is open and approved, or whether this is a pool for headcount that does not exist yet, is a fact available at the moment of contact. Without it, the silence that follows such a conversation is read as a decision about the candidate."
    cost: "medium"
    costs: "It costs replies: outreach that states there is no open requisition gives less reason to answer, and reply volume is what the sourcing side of the pipeline is counted in."
    targets:
      - "M-016"
      - "A-012"
      - "B-014"
    interventions: []
  -
    id: "fix-the-reading-order"
    title: "Set the reading order in advance and in writing"
    rationale: "Which applications are read and in what order is decided in this seat, and the order can be fixed before the week's queue exists: a stated share of screening capacity for inbound, order of arrival within each source, and no sort on how recently someone was last employed. The rule adds no screening capacity; it decides once where the capacity goes, instead of deciding it profile by profile against the length of the queue."
    cost: "high"
    costs: "Reading without that sort covers fewer profiles per hour, and outbound candidates the hiring manager has asked about wait behind inbound ones."
    targets:
      - "B-003"
      - "M-009"
      - "M-011"
      - "L-001"
    interventions: []
status: "active"
evidence_level: "supported"
evidence_ids: []
---

# Recruiter

The function that moves people through the funnel. Holds the most information about the process and the least authority over its outcome.
