/-
  The registry's structural claims, as things a kernel can check.

  Everything the atlas asserts about its own shape is currently asserted by a
  test over whatever happens to be in `content/` today. The claims themselves
  are stronger than that: they are properties of the structure, and a registry
  that violated one would be malformed rather than merely surprising.

  Names are replaced by indices on the way in, so every proposition here is
  arithmetic over finite lists and `decide` can discharge it in the kernel — no
  `native_decide`, no compiler in the trusted base, no mathlib.
-/

namespace Hoba

/-- A state's role in the machine. -/
inductive Kind where
  | initial
  | active
  | terminal
  deriving DecidableEq, Repr, Inhabited

/--
A workflow as the atlas stores it, with names replaced by indices.

`rank` is a topological level emitted by the generator alongside the data. It
is not a claim on its own — `Forward` below is what turns it into one, and
`walk_bounded` is what makes it worth having.
-/
structure Machine where
  n : Nat
  kind : List Kind
  /-- Per state: the entries that are the ways it stops keeping its commitment. -/
  deviations : List (List Nat)
  edges : List (Nat × Nat)
  rank : List Nat
  deriving Repr

namespace Machine

def rankOf (m : Machine) (s : Nat) : Nat := m.rank.getD s 0
def kindOf (m : Machine) (s : Nat) : Kind := m.kind.getD s Kind.active
def states (m : Machine) : List Nat := List.range m.n
def exits (m : Machine) (s : Nat) : List Nat :=
  m.edges.filterMap (fun e => if e.1 == s then some e.2 else none)

/-- Every index mentioned is a state, and the per-state lists have length `n`. -/
def WellFormed (m : Machine) : Bool :=
  m.kind.length == m.n && m.rank.length == m.n && m.deviations.length == m.n &&
    m.edges.all (fun e => e.1 < m.n && e.2 < m.n)

/-- Every edge climbs the rank. This is acyclicity in a decidable form. -/
def Forward (m : Machine) : Bool :=
  m.edges.all (fun e => m.rankOf e.1 < m.rankOf e.2)

/-- No state that is not terminal is left without a way out. -/
def NoDeadEnds (m : Machine) : Bool :=
  m.states.all (fun s => m.kindOf s == Kind.terminal || m.edges.any (fun e => e.1 == s))

/-- How many states name `b` among the ways they go wrong. -/
def homesFor (m : Machine) (b : Nat) : Nat :=
  (m.deviations.filter (fun ds => ds.contains b)).length

private def absorb (seen : List Nat) : List Nat → List Nat
  | [] => seen
  | x :: xs => absorb (if seen.contains x then seen else seen ++ [x]) xs

private def grow (m : Machine) : Nat → List Nat → List Nat
  | 0, seen => seen
  | fuel + 1, seen =>
    let next := absorb seen (seen.flatMap m.exits)
    if next.length == seen.length then seen else grow m fuel next

/-- Everything reachable from `start`, with the state count as fuel. -/
def reachable (m : Machine) (start : Nat) : List Nat := grow m m.n [start]

def AllReachable (m : Machine) (start : Nat) : Bool :=
  m.states.all (fun s => (m.reachable start).contains s)

/-- Consecutive states, each following the last along an edge. -/
def Chain (m : Machine) : List Nat → Bool
  | [] => true
  | [_] => true
  | a :: b :: rest => m.edges.contains (a, b) && Chain m (b :: rest)

/-- A closed chain: out of `a`, through `l`, back to `a`. -/
def IsCycle (m : Machine) (a : Nat) (l : List Nat) : Bool := Chain m (a :: (l ++ [a]))

/-- Consecutive states, each ranked strictly above the last. -/
def Climbs (m : Machine) : List Nat → Bool
  | a :: b :: rest => (m.rankOf a < m.rankOf b) && Climbs m (b :: rest)
  | _ => true

end Machine

open Machine

/-- In a forward machine, following edges is the same as climbing the rank. -/
theorem chain_climbs {m : Machine} (h : Forward m = true) :
    ∀ l : List Nat, Chain m l = true → Climbs m l = true := by
  intro l
  induction l with
  | nil => intro _; rfl
  | cons a rest ih =>
    cases rest with
    | nil => intro _; rfl
    | cons b tail =>
      intro hc
      simp only [Chain, Bool.and_eq_true] at hc
      have hmem : (a, b) ∈ m.edges := by
        have := hc.1
        simpa using this
      have hlt : m.rankOf a < m.rankOf b := by
        have := List.all_eq_true.mp h _ hmem
        simpa using this
      simp only [Climbs, Bool.and_eq_true, decide_eq_true_eq]
      exact ⟨hlt, ih hc.2⟩

/-- A climb from `a` to `b` puts `b` strictly above `a`. -/
theorem climbs_lt {m : Machine} :
    ∀ (l : List Nat) (a b : Nat), Climbs m (a :: (l ++ [b])) = true → m.rankOf a < m.rankOf b := by
  intro l
  induction l with
  | nil =>
    intro a b h
    simp only [List.nil_append, Climbs, Bool.and_eq_true, decide_eq_true_eq] at h
    exact h.1
  | cons c cs ih =>
    intro a b h
    simp only [List.cons_append, Climbs, Bool.and_eq_true, decide_eq_true_eq] at h
    exact Nat.lt_trans h.1 (ih c b h.2)

/-- A list of ranks all under `k` reads back under `k`, in range or out of it. -/
theorem getD_le {k : Nat} :
    ∀ (l : List Nat) (s : Nat), l.all (fun r => r ≤ k) = true → l.getD s 0 ≤ k := by
  intro l
  induction l with
  | nil => intro s _; simp
  | cons a as ih =>
    intro s h
    simp only [List.all_cons, Bool.and_eq_true, decide_eq_true_eq] at h
    cases s with
    | zero => simpa using h.1
    | succ t => simpa using ih t h.2

/-- Every state of a machine whose ranks are bounded sits under that bound. -/
theorem rankOf_le {m : Machine} {k : Nat} (h : m.rank.all (fun r => r ≤ k) = true) (s : Nat) :
    m.rankOf s ≤ k := getD_le m.rank s h

/--
A forward machine has no cycles at all.

This is the theorem the whole file exists for. It is stated about any machine,
so proving `Forward` of a particular one — which `decide` does in the kernel —
gives its acyclicity for free.
-/
theorem forward_no_cycle {m : Machine} (h : Forward m = true) (a : Nat) (l : List Nat) :
    IsCycle m a l = false := by
  cases hEq : IsCycle m a l with
  | false => rfl
  | true => exact absurd (climbs_lt l a a (chain_climbs h _ hEq)) (Nat.lt_irrefl _)

/-- A climb of `k` steps needs `k` rank to spend. -/
theorem climbs_steps {m : Machine} :
    ∀ (l : List Nat) (a b : Nat), Climbs m (a :: (l ++ [b])) = true →
      l.length + 1 + m.rankOf a ≤ m.rankOf b := by
  intro l
  induction l with
  | nil =>
    intro a b h
    simp only [List.nil_append, Climbs, Bool.and_eq_true, decide_eq_true_eq] at h
    have := h.1
    simp only [List.length_nil]
    omega
  | cons c cs ih =>
    intro a b h
    simp only [List.cons_append, Climbs, Bool.and_eq_true, decide_eq_true_eq] at h
    have hstep := h.1
    have hrest := ih c b h.2
    simp only [List.length_cons]
    omega

/--
Every route through a forward machine is at most as long as the rank it ends
on. Acyclicity says the walk cannot return; this says how soon it must stop.
-/
theorem chain_bounded {m : Machine} (h : Forward m = true) (a b : Nat) (l : List Nat)
    (hc : Chain m (a :: (l ++ [b])) = true) : l.length + 1 + m.rankOf a ≤ m.rankOf b :=
  climbs_steps l a b (chain_climbs h _ hc)

end Hoba
