---
id: "obs.explicit_feedback_citing_skill_depth_shortfall"
type: "observation"
aliases:
  - "A-008"
title: "Explicit feedback citing skill-depth shortfall"
summary: "Interviewer or recruiter provides structured notes citing a specific deficit in algorithmic complexity, architecture, or tool mastery."
stages:
  - "technical"
  - "team"
perspectives:
  -
    actor: "actor.candidate"
    sees: "A rejection that names the exercise, the property of the solution and the expectation for the level, together with a stated window for re-application."
    reads: "A threshold for this level in one named place, which is a claim that can be checked against what happened in the room."
    does: "Checks the claim against their own record of the panel, and works from the two facts given: the named gap and the named window."
  -
    actor: "actor.hiring_manager"
    sees: "The panel's write-ups against the rubric, including the exercise where the step to the linear solution came after a prompt."
    reads: "Evidence about the bar for the level rather than about the person; a decline can be revisited in six months and a hire cannot."
    does: "Declines for now, keeps the exercise and the property in the notes, and leaves the re-application open."
  -
    actor: "actor.recruiter"
    sees: "A recommendation with a written reason attached to it, and none of the scoring that stands behind the reason."
    reads: "A reason specific enough to send as written; the field it arrived in is free text, so what is in it is what the panel typed there."
    does: "Sends the reason in the panel's own terms and adds the re-application window, and cannot expand on it if asked, because the scoring did not travel with it."
status: "active"
evidence_level: "supported"
evidence_ids:
  - "evidence.employment_interview_reliability_new_meta_analytic_estimates_by_structure_and_format"
probes:
  -
    id: "PROBE-A-008-1"
    action: "Review the interview solution against the standard patterns for that problem and identify the edge cases it misses."
    expected_signal: "Verifies whether the code actually lacked the optimisation or rigour the notes name."
    cost: "medium"
    outcomes:
      -
        id: "feedback-matches-the-code"
        label: "The solution has the property the feedback names, and the approach it expected is a standard pattern for that problem."
        excludes: []
      -
        id: "expectation-is-local"
        label: "The solution has the property the feedback names, and the approach it expected is specific to one stack or house pattern rather than a general one."
        excludes: []
      -
        id: "feedback-misdescribes-the-code"
        label: "The solution does not have the property the feedback names — the code already does what the notes say was missing."
        excludes: []
      -
        id: "nothing-retained"
        label: "Nothing was retained from the exercise — a shared editor closed, a whiteboard erased — so the claim cannot be checked against anything."
        excludes: []
specimens:
  -
    kind: "email"
    label: "Structured feedback notes"
    subject: "Feedback — technical panel"
    context: "day 3 after the panel"
    lines:
      -
        text: "The panel was positive on system decomposition and on how you reasoned about failure modes."
      -
        text: "The gap was in the second exercise: the solution was correct but quadratic, and the panel was looking for the linear approach using a hash index. We would want to see that reached without prompting at this level."
        tell: true
      -
        text: "We are not moving forward now, but this was close and we would welcome a re-application in six months."
    reading: "A named exercise, a named property, a named expectation. This is the rare rejection that is actually actionable."
  -
    kind: "transcript"
    label: "The moment in the panel"
    context: "minute 38, second exercise"
    lines:
      -
        speaker: "Interviewer"
        at: "38:04"
        text: "This works. What is the complexity?"
      -
        speaker: "Candidate"
        at: "38:11"
        text: "Quadratic — nested scan over the same list."
      -
        speaker: "Interviewer"
        at: "38:15"
        text: "Right. Can you get it down?"
      -
        speaker: "Candidate"
        at: "38:22"
        text: "Probably with an index of some kind. I would want to think about it."
        tell: true
      -
        speaker: "Interviewer"
        at: "38:40"
        text: "That is fine, let us move on for time."
    reading: "The transcript and the written feedback agree. When they agree, the feedback is describing something that actually happened."
non_inferences:
  - "Does not imply general incompetence; it reflects the threshold for this specific role level."
---

# Explicit feedback citing skill-depth shortfall

Interviewer or recruiter provides structured notes citing a specific deficit in algorithmic complexity, architecture, or tool mastery.

### Diagnostic Non-Inferences
- Does not imply general incompetence; it reflects the threshold for this specific role level.
