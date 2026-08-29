---
id: "client"
type: "actor"
title: "Client"
summary: "The party paying for the seat when the company is not its own customer. Signs the contract the requisition depends on, and often holds a gate the candidate never sees named."
controls:
  - "Whether the contract that funds the seat is signed, extended or cancelled"
  - "The rate the seat bills at, which the band is derived from"
  - "Approval of the profiles submitted against the contract, where the contract gives them that right"
  - "Their own interview round, after the employer's loop has already said yes"
  - "How many seats the engagement needs, and by when"
blind_to:
  - "What the employer's own funnel did to reach the profiles they are shown"
  - "What the candidate was told about who is deciding, and when"
  - "The margin between the rate they pay and the salary the candidate is offered"
  - "What declining a profile without a reason costs the person behind it"
incentives:
  - "Fill the seats the engagement needs without carrying employment obligations"
  - "Keep the option to end the engagement without ending anyone's employment — that is what the vendor is for"
  - "Pay for delivery, not for the search that produced it"
aliases: {}
specimens:
  -
    kind: "note"
    label: "Where the client sits in someone else's funnel"
    lines:
      -
        text: "The employer's loop finishes: screen, technical, panel, level. The candidate is told the process went well."
      -
        text: "The profile then goes to the client for approval, and sometimes to a client interview the posting never mentioned."
        tell: true
      -
        text: "A decline at this desk arrives to the candidate as a generic rejection from the employer, because the employer cannot state a reason it was never given."
    reading: "The candidate is waiting on a party that is not their prospective employer and that no message has named. Nothing in what they can see distinguishes this wait from an internal one."
recommendations:
  -
    id: "let-your-round-be-named"
    title: "Let your round be named in the process the candidate is told"
    rationale: "Where the contract gives the client a profile approval or an interview, the candidate ends up waiting on a party no message has named. Allowing the vendor to state that stage — one client review, expected turnaround — costs no confidentiality and converts an unexplained silence into a stated step."
    cost: "low"
    costs: "A named stage invites questions when it overruns; an unnamed one never has to answer for itself."
    targets:
      - "obs.complete_silence_after_submission"
      - "obs.rejection_after_the_application_sat_pending_for_months"
      - "mech.stronger_competing_candidate_in_final_cohort"
    interventions: []
  -
    id: "state-the-funding-state-of-the-seat"
    title: "State in the brief whether the seat is funded or bid-conditional"
    rationale: "A search run against an unsigned bid is a real search for a conditional seat. The vendor's recruiters can only disclose what the brief states, so the one sentence that makes outreach honest — this role opens when the contract signs — has to originate here."
    cost: "low"
    costs: "A bid the market can see is a bid competitors can see; some clients treat the existence of the search as confidential."
    targets:
      - "mech.bid_conditional_talent_pool"
      - "mech.speculative_sourcing_talent_pooling_without_opening"
      - "bar.outbound_sourcing_talent_pool_contact"
    interventions:
      - "I-009"
  -
    id: "return-profile-decisions-with-a-category"
    title: "Return profile decisions on a stated clock, with a category"
    rationale: "The employer cannot tell the candidate what it was never told. A decline that arrives as one of three categories — profile, rate, timing — on a stated turnaround lets the vendor close records with a reason instead of a template, without exposing anything commercially sensitive."
    cost: "low"
    costs: "A category is a commitment; 'no' with no category can no longer be sent."
    targets:
      - "obs.generic_closer_alignment_rejection_template"
      - "obs.rejection_after_the_application_sat_pending_for_months"
    interventions:
      - "I-003"
---

# Client

The party paying for the seat when the company is not its own customer. Signs the contract the requisition depends on, and often holds a gate the candidate never sees named.
