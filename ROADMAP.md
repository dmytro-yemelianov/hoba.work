# Roadmap

Tracked on [the project board](https://github.com/users/dmytro-yemelianov/projects/4).
Every item below is a GitHub issue; this file is the ordering and the reasoning
behind it.

## Sequence

The order is driven by what unblocks what, not by size.

1. **Harness** (#14, #15) — the repeatable chores get one entry point first,
   because everything after this is long content and design work that will run
   them dozens of times.
2. **Distribution** (#12) — `robots.txt`, `sitemap.xml`, `llms.txt`. Independent
   of everything else and cheap.
3. **URLs** (#2 spike → #1) — language leaves the URL. This has to land before
   the card worker and the Markdown routes, because both need to know how a
   language is chosen for a given request.
4. **Machine formats** (#13) — every page as Markdown and JSON, on the URL
   scheme decided in step 3.
5. **Cards** (#7 → #8) — the verbacorpus card worker ported over, then
   per-entity `og:image` and the share control.
6. **Model** (#3 → #4 → #5 → #16 → #17 → #6) — actors, then workflows as data,
   then the player, then the canonical path, then the eras, then the decision
   tree. The tree waited for the player deliberately and the wait paid: it is
   the same canvas, transport and detail panel with the fork handed to the
   reader, not a second interaction model. *Done.*
7. **Lens** (#9, #10 → #11) — per-actor recommendations and perspectives, then
   the selector. Depends on actors existing. *Done.*
8. **Formal core** (#18 → #19 → #20) — the registry's structural claims proved
   rather than sampled, then the diagnostic protocol turned into the set algebra
   it is usually assumed to already be, then the compatibility report. See
   *What is worth formalising* below for what each of these is and, more
   usefully, what two of them are not.

## Decided

**URLs (#2 → #1).** Two prerendered trees at `/_i/en/**` and `/_i/uk/**`; the
edge worker resolves a language per request and serves the matching asset under
one language-free URL. The alternative — both languages in one document,
revealed in the client — was measured and rejected: it leaves the graph
explorer structurally broken in Ukrainian, binds every `getElementById` to the
hidden English copy, and can stamp only one `<head>`, so every Ukrainian share
would carry an English card.

Two things the spike changed about the plan. It is a latency **win**: the worker
already made exactly one asset fetch per request, and the change deletes both
the language 302 and the trailing-slash 308 that every in-site click paid —
about 70 ms. And a stated `Accept-Language` now outranks geography, which is
both more defensible and what makes the test suite independent of where it runs.

## The URL trade-off, recorded

Removing the language segment gives one shareable link per page, which is the
point. It costs one indexable URL per language: search engines will index a
single version and `hreflang` stops meaning anything.

Mitigations that do not put a language back in the slug:

- canonical URL without a language, `Vary: Accept-Language` on the response;
- `?lang=uk` as an explicit override for "send this in Ukrainian", which is a
  query, not part of the slug;
- `/uk/*` keeps working as a 301 so every link already shared stays alive.

This is a deliberate trade, made once, written down here so it is not
rediscovered as a bug later.

## The two axes, recorded

**The canonical path (#16).** WF-003 writes the process as the commitments it is
supposed to keep, and every other entry is positioned against it. A barrier is
not a gate — this path has fourteen gates and they are all legitimate. A barrier
is the point at which one of those commitments stops being kept. `deviations`
on each state names which ones, and tests assert the relation is total: every
barrier has exactly one commitment it breaks, every mechanism at least one.

Deliberately *not* deviations: a decline and a closed search. Most candidates are
declined and some searches stop; a path that could only end in a hire would be a
fantasy rather than a standard. What makes them part of the path is that they
arrive, they say what happened, and they arrive in time to be useful.

**The eras (#17).** The second axis: the same funnel had different physics when
capital was free. Four eras from 2008, each stating where the money came from,
what that did to hiring, how a person got in, and what closed it. Every figure
carries an evidence record with a URL, and where a source is a tracker rather
than an official statistic the record says so — the two tell different stories
about the same period, and the difference is the argument.

The rule this sets for anything added here later: **no figure without a source a
reader can open**, and no conflation of a tracked count with an official series.
Research for it ran as five strands, each put to an adversarial verifier
instructed to refute rather than confirm. Three claims did not survive and are
not on the site.

## What is worth formalising

An assessment of four proposals — Lean4 proofs, a deterministic resume
compiler, success probabilities, and set algebra over the diagnostic protocol —
checked against the code rather than against the description of the code. Two
survive as stated, one survives in a different form, one is refused.

### Lean4 over WF-003 and the barrier DAG (#18) — yes, largest return

WF-003 is already close to a formal object: a finite state set, transitions with
guards, `deviations` on every state. Four of its properties are currently
asserted by vitest against the data that happens to be in `content/` today.
In Lean they become properties of the structure, and the generator then cannot
build a registry that violates them:

- reachability of every state from `real-need` (today: a BFS in a test);
- totality of the barrier mapping, `∀ b, ∃! s, b ∈ s.deviations` (today:
  `expect(misplaced).toEqual([])` over fourteen barriers);
- no dead ends, `∀ s, s.kind ≠ terminal → ∃ t, t.from = s`;
- acyclicity of the barrier DAG.

Two corrections to how this was described. **The barrier DAG is not checked by
Tarjan.** Acyclicity is a dedicated topological sort in
`packages/registry/src/validation.ts`; Tarjan runs over *mechanisms*, and its
job is to confirm that every declared loop (`L-*`) is backed by a real strongly
connected component. Two different checks with two different purposes.

And the proposed headline theorem — that a deviation-free path ends in `hired`,
`declined` or `closed` — is near-trivial, because those are the only three
terminal states WF-003 has. The sharper theorem is **termination**, and it is
worth stating because it is not currently asserted anywhere: WF-003 has fifteen
states, twenty-one transitions and **zero back edges**, so every walk from
`real-need` reaches a terminal in at most thirteen steps. WF-001 — the funnel as
observed — has exactly one back edge, `rejected → published`, which is P-002,
the closed-then-reposted motif. So: *the ideal path terminates and the observed
funnel need not*, and the single edge that separates them is a named pattern in
the registry. That is the atlas's central claim as a theorem about its own data.

### Set algebra over the diagnostic protocol (#19) — yes, but it is not half there

This was described as already half-implemented. It is not, and the gap is
specific enough to be the first task.

`HOBADiagnosticEngine.analyze` computes the compatible-mechanism set as a
**union** — mechanisms that operate at an identified barrier *or* emit a
selected observation — and then attaches the probes hanging off those
observations as suggestions. `DiagnosticInput` is
`{artifacts, stage?, role_family?, seniority_band?, notes?}`: **there is no field
for a probe result**, so nothing is ever fed back and the narrowing chain
`M₀ ⊇ M₁ ⊇ M₂ …` does not exist.

Worse for the interesting question: `diagnosticProbeSchema` is
`{id, action, expected_signal, cost, removability_target?}`. Which mechanisms a
probe *eliminates* is nowhere in the data, so minimal probe cover is not merely
unimplemented — it is not computable from the registry as it stands. The
prerequisite is a `discriminates` field on the probe, and populating it for
every existing probe. Only then is "what is the smallest set of probes that
separates every compatible mechanism?" a set-cover problem with an answer.

What *is* computable today and is honest: the number of distinct routes through
WF-003 and how many end in each terminal. Cardinality, not probability.

The weakest claim in the proposal is patterns as non-empty intersections. P-001
is defined by a prose `trigger_rule`, `required_artifacts` and
`compatible_mechanisms` — there are no requirement *sets* to intersect. Proving
non-emptiness would first require modelling requirements as a lattice, which the
registry does not have and which would be a larger change than the proof is
worth. Either that model gets built deliberately, or the claim is dropped.

### A compatibility report, not a resume compiler (#20) — yes, in that form

`Resume × Facets → which gates fire` is right, and the refusal that goes with it
is right: nothing that rewrites a document to pass a filter. That would turn the
atlas into an instrument for playing the system it documents, and would
legitimise the exact mechanisms it exists to describe. I-005 already names the
honest form — a conformance check, not an optimiser.

The employer side must be a **facet vector**, never a database: an employer with
a knockout filter configured, a unanimity panel rule, an unpublished band. The
methodology forbids naming a company and the tests enforce it, so the user
supplies the parameters.

### Success probabilities — no, and this is permanent

A real probability needs a denominator: how many people with this profile
applied, and how many were hired. Nobody has that but employers, and they do not
publish it. What is derivable from open sources — 244 applications per opening
(EVD-027), 4.5% of software postings at entry level (EVD-028) — describes a
market, not a person.

"Your probability of success: 12%" would be false precision, which the
methodology already forbids, and it would be worse than no number at all,
because people act on numbers they trust. The atlas exists partly so that a
structural problem is not read as personal failure; a fabricated personal
probability does exactly the opposite.

What replaces it, all of which the site already does somewhere:

- conditional structural statements with no number — "a knockout rule configured
  at five years will not pass four; that is arithmetic, not a judgement";
- orders of magnitude with the source and the population named, which is what
  the eras page does;
- **bounds rather than points**. Where the probability is exactly zero because a
  knockout fired, that is deterministic and therefore sayable.

The difference between "this configuration will filter you out" and "you have a
12% chance" is the difference between an atlas and a horoscope.

## Not scheduled yet

- Anything that would put a real company or person into the registry. The
  methodology forbids it and the tests enforce it.
- Any per-person probability of being hired. See *Success probabilities* above:
  there is no denominator, and a fabricated one would invert the point of the
  project. This is a permanent refusal, not a backlog item.
