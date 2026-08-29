---
id: "pat.compensation_double_bind"
type: "pattern"
aliases:
  - "P-004"
title: "Compensation Double Bind"
summary: "The candidate has to name a compensation expectation first: a high number ends the process, and a low one lowers the level the candidate is assessed at."
required_artifacts:
  - "obs.generic_closer_alignment_rejection_template"
  - "obs.compensation_band_reduced_or_altered_mid_process"
compatible_mechanisms:
  - "mech.unstated_compensation_band_discrepancy"
  - "mech.experience_age_grading_mismatch"
trigger_rule: "The candidate is asked for a compensation number before the band for the role is stated, and the band is not stated in return."
establishes:
  - "An information asymmetry works as an uncalibrated filter before technical merit is assessed."
specimens:
  -
    kind: "chat"
    label: "The asymmetry, in four messages"
    lines:
      -
        speaker: "Recruiter"
        at: "screen, minute 3"
        text: "Before we go further — what are your compensation expectations?"
      -
        speaker: "Candidate"
        at: "screen, minute 3"
        text: "Happy to discuss. What is the band for the role?"
      -
        speaker: "Recruiter"
        at: "screen, minute 4"
        text: "We prefer to hear the candidate number first so we can match it to the right level."
        tell: true
      -
        speaker: "Candidate"
        at: "screen, minute 5"
        text: "Understood. My expectation is in the range of 85–95k."
    reading: "The number is required from one side and withheld by the other, and it is collected before the level is fixed. Both outcomes below follow from that ordering."
  -
    kind: "email"
    label: "The two branches"
    context: "the same question, two candidates, one week"
    lines:
      -
        text: "Quoted 95k — We are not able to proceed; the expectation is outside the range we have for this role."
        tell: true
      -
        text: "Quoted 70k — Good news, we would like to move ahead. Based on the conversation we are looking at this as a mid-level hire rather than senior."
        tell: true
    reading: "A high number ends the process and a low one moves the level. There is no answer that leaves both the process and the grade untouched — which is what makes it a bind rather than a negotiation."
non_inferences:
  - "Does not establish that the employer has an unlimited budget, or that any of this is malicious."
interventions:
  - "I-002"
perspectives:
  -
    actor: "candidate"
    sees: "A request for a compensation expectation at the screen, and a band that is not stated in return."
    reads: "The number is collected before the level is fixed, so it is an input to the level rather than an answer to it."
    does: "Names a range without the band, without the level, and without knowing how many others in the pipeline have already named one."
  -
    actor: "recruiter"
    sees: "A screening form with an expectations field that has to be filled before the candidate moves to the panel, and disclosure rules for the band that are set elsewhere."
    reads: "The number is the cheapest available check on whether the process is viable, before panel time is spent on it."
    does: "Asks for the number first and records it in the field, and says about the band exactly what is permitted at this stage."
  -
    actor: "employer-policy"
    sees: "A band per level and a rule about what may be said about it, both reviewed on a cycle measured in quarters."
    reads: "A stated expectation is the input that places a candidate on the grid; a band stated first becomes the floor of every negotiation that follows."
    does: "Publishes the band where a disclosure rule requires it and not elsewhere, and keeps levelling a decision separate from the number."
  -
    actor: "public-policy"
    sees: "Postings in covered jurisdictions, which either carry a band or do not."
    reads: "A published band is measurable and enforceable; the level a candidate will be assessed at is neither."
    does: "Requires the band in the posting, which closes one branch of the bind and leaves the levelling branch untouched."
status: "active"
evidence_level: "supported"
evidence_ids:
  - "EVD-005"
---

# Compensation Double Bind

The candidate has to name a compensation expectation first: a high number ends the process, and a low one lowers the level the candidate is assessed at.

### Trigger Rule
The candidate is asked for a compensation number before the band for the role is stated, and the band is not stated in return.

### What this Establishes
- An information asymmetry works as an uncalibrated filter before technical merit is assessed.

### What this Does NOT Establish
- Does not establish that the employer has an unlimited budget, or that any of this is malicious.
