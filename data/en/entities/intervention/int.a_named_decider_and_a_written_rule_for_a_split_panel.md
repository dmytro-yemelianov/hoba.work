---
id: "int.a_named_decider_and_a_written_rule_for_a_split_panel"
type: "intervention"
title: "A named decider and a written rule for a split panel"
summary: "Before the panel sits, one member is named as holding the decision and the rule for an even split is written down; when the split happens, the candidate is told that it did and which way the rule ran."
targets:
  - "mech.hiring_manager_consensus_impasse"
  - "bar.team_cross_functional_panel"
actor: "hiring-manager"
scope: "team"
cost: "low"
specimens:
  -
    kind: "note"
    label: "The rule, written before the panel meets"
    lines:
      -
        at: "before"
        text: "Decider for req #5120: the hiring manager. On an even split the decider decides and records one paragraph of reasons."
        tell: true
      -
        at: "after"
        text: "Panel 2–2 on system design depth. Decider: no hire. Reason recorded: the two dissenting scores rested on the same unasked follow-up."
      -
        at: "sent"
        text: "To the candidate: the panel did not reach agreement; the decision fell to the named decider under the rule set before the round."
    reading: "Panels split, and no rule stops them splitting. What a written rule stops is the split being resolved by whoever is most tired, and then reported outward as a considered judgement about the candidate. The default nobody wrote down is almost always no hire — which means the absence of a rule is itself a rule, and an unstated one."
perspectives:
  -
    actor: "actor.hiring_manager"
    sees: "A line to fill in before the panel is scheduled: who decides, and what happens on a tie."
    reads: "The tie rule was always there — it was just never written, and unwritten it defaulted to the outcome that requires nobody to be responsible for it."
    does: "Names the decider, writes the tie rule, and records a paragraph of reasons when the rule is used."
  -
    actor: "actor.recruiter"
    sees: "A debrief that ends with a recorded decision rather than a second round of scheduling."
    reads: "An impasse used to cost the candidate weeks and produce nothing to send; now it produces a sentence that is true and can be sent the same day."
    does: "Sends the outcome with the fact of the split in it, rather than converting it into a fit narrative."
  -
    actor: "actor.candidate"
    sees: "An outcome that says the panel disagreed and a named person decided under a rule fixed beforehand."
    reads: "Being split on is not the same as being found wanting: half the room was on the other side, and what settled it was a rule about ties."
    does: "Reads the result as a close call rather than a verdict, and reapplies where the registry says the same team reopens."
status: "active"
evidence_level: "supported"
expected_effects:
  - "mech.hiring_manager_consensus_impasse keeps operating — panels will split — but stops resolving by default and unrecorded"
  - "The candidate learns the outcome turned on a tie rule, not on a finding about them"
measurements:
  - "tie_rule_declared_rate"
  - "impasse_disclosure_rate"
evidence_ids:
  - "evidence.employment_interview_reliability_new_meta_analytic_estimates_by_structure_and_format"
  - "evidence.structured_selection_procedures_and_evaluator_preparation_29_c_f_r_1607_4_eu_ai_act_annex_iii"
---

# A named decider and a written rule for a split panel

Before the panel sits, one member is named as holding the decision and the rule for an even split is written down; when the split happens, the candidate is told that it did and which way the rule ran.

### Expected Effects
- mech.hiring_manager_consensus_impasse keeps operating — panels will split — but stops resolving by default and unrecorded
- The candidate learns the outcome turned on a tie rule, not on a finding about them

### Measurements
- `tie_rule_declared_rate`
- `impasse_disclosure_rate`
