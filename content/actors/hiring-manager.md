---
id: "hiring-manager"
type: "actor"
title: "Hiring manager"
summary: "The person the role reports to, and the panel they convene. Sets the bar, owns the outcome, and is doing this alongside the work the role exists to absorb."
controls:
  - "The requirements as written, and the ones only they know about"
  - "Who interviews and what they ask"
  - "The level a candidate is assessed at"
  - "Whether a split panel becomes a hire"
blind_to:
  - "What the same candidate showed in rounds they did not attend"
  - "How the requirements read to someone outside the team"
  - "What the search is costing the people covering the gap"
incentives:
  - "Avoid a bad hire, which is visible and attributed, more than a missed hire, which is neither"
  - "Fill the gap without the ramp-up cost of someone who needs teaching"
  - "Keep the team's own delivery on track while running the loop"
aliases:
  facet:
    - "hiring-manager"
  intervention:
    - "hiring-manager"
specimens:
  -
    kind: "note"
    label: "The asymmetry that sets the bar"
    lines:
      -
        text: "A bad hire is visible for a year and attributed to the person who made it."
      -
        text: "A missed hire is invisible and attributed to nobody."
        tell: true
      -
        text: "Both are costly. Only one has a name on it."
    reading: "This is not a bias to be scolded out of anyone; it is an incentive with a shape. Several conservative-default mechanisms follow from it directly."
recommendations:
  -
    id: "requirements-from-the-quarter"
    title: "Write the requirement list from last quarter's work"
    rationale: "The requirements as written belong to this actor, and the list is what the keyword filter and the recruiter's screen are both built from. Checking each line against what the team delivered last quarter separates what the job uses from what a previous strong candidate happened to have. A year count larger than the age of the technology is checkable before the posting goes up."
    cost: "medium"
    costs: "A shorter list brings more applications into a funnel this actor's own team staffs, and it gives up the requirement page as the argument for a higher level and a wider band."
    targets:
      - "M-024"
      - "pat.experience_age_impossibility"
      - "M-008"
      - "L-003"
    interventions: []
  -
    id: "house-preferences-in-the-brief"
    title: "Put the house preferences into the interview brief"
    rationale: "This actor sets what each interviewer asks, and holds the requirements only they know about. A preference about architecture or about vertical experience that is not in the brief is still scored in the room, and the candidate cannot design against a criterion they were not given."
    cost: "low"
    costs: "A preference in writing is open to challenge from the panel and from the recruiter, and one that cannot be put into a sentence does not make it into the brief."
    targets:
      - "M-010"
      - "M-018"
      - "bar.technical_screen_live_assessment"
      - "bar.hiring_manager_in_depth_review"
      - "A-014"
    interventions: []
  -
    id: "timebox-and-review-floor"
    title: "Cap the take-home and floor the review time"
    rationale: "The exercise and who reviews it are both this actor's to set. Work built over hours and read in minutes is scored on whatever the reader happened to open, and the note that comes out of it describes the review rather than the submission. Capping the candidate's hours without a floor under the reviewer's minutes moves the asymmetry rather than closing it."
    cost: "medium"
    costs: "A three-hour sample carries less to go on, so more of the decision falls to the panel, and twenty minutes from each of two reviewers comes out of a sprint the team is already behind on."
    targets:
      - "M-019"
      - "M-012"
      - "bar.take_home_work_sample_evaluation"
      - "L-002"
    interventions:
      - "I-006"
  -
    id: "decision-rule-before-the-panel"
    title: "Agree the decision rule before the first conversation"
    rationale: "Whether a split panel becomes a hire is this actor's decision, and a unanimity requirement settles it in advance: one dissent and three produce the same outcome. Writing the rule down before the loop starts, including who breaks a tie, keeps an even split from being written up as a finding about the candidate."
    cost: "medium"
    costs: "Naming the tiebreaker means this actor signs a hire the panel did not agree on, and a hire that goes wrong is visible for a year and carries their name."
    targets:
      - "M-022"
      - "bar.team_cross_functional_panel"
      - "A-014"
    interventions: []
  -
    id: "freeze-requirements-once-the-loop-opens"
    title: "Freeze the requirements once the loop opens"
    rationale: "The requirements as written are this actor's; whether a requisition closes is not. Assessments taken against one description do not carry over to another, so a change of stack or scope that arrives mid-loop belongs in the next posting rather than in the scoring of work already done. Everyone already inside is then measured against the description they were given."
    cost: "high"
    costs: "The loop runs to the end against a profile the team has moved past, and the change the requirements needed waits for a search that starts again from the posting."
    targets:
      - "M-013"
      - "L-003"
    interventions: []
  -
    id: "level-fixed-before-the-loop"
    title: "Fix the assessed level before the loop opens"
    rationale: "The level a candidate is assessed at is this actor's to set, and it is set at the in-depth review whether or not it was written down first. Naming the level, and what evidence meets it, before the loop opens means experience above the band is measured against the requirements rather than against a forecast about how long someone stays."
    cost: "medium"
    costs: "A level fixed in advance removes the move of recovering a strong candidate at the level below, and where the level was set wrong the search runs again from the posting."
    targets:
      - "pat.seniority_double_bind"
      - "A-013"
      - "M-017"
      - "bar.hiring_manager_in_depth_review"
    interventions: []
status: "active"
evidence_level: "supported"
evidence_ids: []
---

# Hiring manager

The person the role reports to, and the panel they convene. Sets the bar, owns the outcome, and is doing this alongside the work the role exists to absorb.
