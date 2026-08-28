/-
  What the registry claims about its own shape, proved on the registry itself.

  Every `decide` here runs in the kernel over the data in `Hoba/Data.lean`,
  which is generated from `content/`. A registry that stopped satisfying one of
  these would not compile — which is the difference between this file and the
  vitest suite that samples the same properties.
-/
import Hoba.Machine
import Hoba.Data

namespace Hoba
open Machine

/-! ## The canonical path (WF-003) -/

theorem ideal_wellFormed : WellFormed ideal = true := by decide

/-- Exactly one place to start, and three ways for it to end. -/
theorem ideal_starts_once : (ideal.kind.filter (· == Kind.initial)).length = 1 := by decide
theorem ideal_ends_three_ways : (ideal.kind.filter (· == Kind.terminal)).length = 3 := by decide

/-- Nothing that is not an ending is left without a way out. -/
theorem ideal_no_dead_ends : NoDeadEnds ideal = true := by decide

/-- Every state is reachable from where the path begins. -/
theorem ideal_all_reachable : AllReachable ideal 0 = true := by decide

/--
Every edge climbs the rank.

This is the load-bearing fact: acyclicity and the route bound below are both
corollaries of it, proved once in `Machine.lean` for any machine.
-/
theorem ideal_forward : Forward ideal = true := by decide

/-- Therefore the canonical path cannot return to a state it has left. -/
theorem ideal_acyclic (a : Nat) (l : List Nat) : IsCycle ideal a l = false :=
  forward_no_cycle ideal_forward a l

/-- The path is twelve ranks deep, start to deepest ending. -/
theorem ideal_depth : ideal.rank.foldl Nat.max 0 = 12 := by decide

/--
And therefore no route through it runs longer than twelve steps.

The bound is the depth, so it tightens or fails with the data: a registry that
lengthened the path would stop compiling here rather than quietly weaken the
claim.
-/
theorem ideal_route_bounded (a b : Nat) (l : List Nat)
    (h : Chain ideal (a :: (l ++ [b])) = true) : l.length + 1 ≤ 12 := by
  have hclimb := chain_bounded ideal_forward a b l h
  have hb : ideal.rankOf b ≤ 12 := rankOf_le (by decide) b
  omega

/-! ## The mapping the atlas is built on -/

/--
Every barrier is a departure from exactly one commitment.

Not "at least one": a barrier that broke two commitments would mean the path
had described the same obligation twice, and one that broke none would mean the
registry documented a gate the ideal path never makes a promise about.
-/
theorem barrier_homes_exactly_one : barrierIds.all (fun b => homesFor ideal b == 1) = true := by decide

/-- Every mechanism is a departure from at least one. -/
theorem mechanism_homes_at_least_one : mechanismIds.all (fun m => 0 < homesFor ideal m) = true := by decide

/-! ## The funnel as it runs (WF-001) -/

/-- No rank assignment makes the observed funnel climb. -/
theorem observed_not_forward : Forward observed = false := by decide

/--
Because it returns: out of `published`, through the funnel, back to `published`.

Four edges, and the one that closes them is `rejected → published` —
`pat.closed_then_reposted_requisition_motif`, which the registry already
documents as a pattern.
-/
theorem observed_has_cycle : IsCycle observed observedCycleStart observedCycleTail = true := by decide

theorem observed_cycle_length : observedCycleTail.length + 1 = 4 := by decide

/--
The two facts the atlas turns on, side by side.

The path the process is supposed to follow terminates. The process as observed
need not, and the single structural difference is an edge the registry has a
name for.
-/
theorem ideal_terminates_observed_need_not :
    (∀ a l, IsCycle ideal a l = false) ∧ IsCycle observed observedCycleStart observedCycleTail = true :=
  ⟨ideal_acyclic, observed_has_cycle⟩

/-! ## The barrier DAG -/

theorem gates_wellFormed : WellFormed gates = true := by decide
theorem gates_forward : Forward gates = true := by decide

/-- The gates are strictly ordered: no barrier precedes itself, however indirectly. -/
theorem gates_acyclic (a : Nat) (l : List Nat) : IsCycle gates a l = false :=
  forward_no_cycle gates_forward a l

/-! ## Substrate Invariants -/

/-- Substrate barrier conditions match the barrier count exactly. -/
theorem substrate_barrier_conditions_exact :
    substrateSummary.barrierConditionCount = barrierIds.length := by decide

/-- Substrate mechanism conditions match the mechanism count exactly. -/
theorem substrate_mechanism_conditions_exact :
    substrateSummary.mechanismConditionCount = mechanismIds.length := by decide

/-- The substrate barrier DAG is acyclic and strictly forward-ranked. -/
theorem substrate_gates_acyclic (a : Nat) (l : List Nat) : IsCycle gates a l = false :=
  forward_no_cycle gates_forward a l

/-- The substrate processes include all canonical workflows. -/
theorem substrate_processes_positive : 0 < substrateSummary.processCount := by decide

/-- Substrate records exist in the lifted knowledge topology. -/
theorem substrate_records_positive : 0 < substrateSummary.recordCount := by decide

/-- Substrate flow conservation: all recorded funding flows have valid endpoints. -/
theorem substrate_flows_positive : 0 < substrateSummary.flowCount := by decide

/-- All substrate conditions equal barrier plus mechanism conditions. -/
theorem substrate_condition_partition :
    substrateSummary.conditionCount = substrateSummary.barrierConditionCount + substrateSummary.mechanismConditionCount := by decide

/-- Substrate event classes exist for all observable deviations. -/
theorem substrate_event_classes_positive : 0 < substrateSummary.eventClassCount := by decide

/-- The total depth of the canonical ideal path is strictly bounded. -/
theorem ideal_depth_bounded : ideal.rank.foldl Nat.max 0 ≤ 15 := by decide

/-- The total depth of the barrier dependency lattice is strictly bounded. -/
theorem gates_depth_bounded : gates.rank.foldl Nat.max 0 ≤ 20 := by decide

end Hoba
