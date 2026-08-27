# Interaction model — specification for review

A model of what happens between an applicant and a company, built from scratch,
intended to be **necessary and sufficient**: every scenario the atlas must
describe is expressible in it, and no primitive can be removed without losing
something. It must also collapse gracefully — the simplest hiring story should
be three events and no machinery.

This is a specification, not an implementation. Nothing in the repository
changes until it is agreed.

---

## 1. The adequacy test

The model is **sufficient** if it can express, without new primitives:

| | must express |
|---|---|
| entry | inbound application, outbound outreach, referral, agency submission, internal transfer, rehire, contract-to-hire |
| dialogue | recruiter screen, technical round, panel, negotiation, reference call, silence |
| internal | requisition drafting, headcount approval, levelling, committee sign-off, freeze, reorganisation |
| cohort | the other applicants on the same requisition, and their effect on this one |
| exterior | rates, layoffs, applicant volume per opening, a change in law |
| plurality | one applicant running several processes, and competing offers |

It is **necessary** if removing any primitive makes one of those inexpressible.
Section 3 carries that argument per primitive.

It is **degenerate-friendly** if the trivial case costs nothing: section 6.

---

## 2. Why the current model is not minimal

The registry has ten shapes — artifact, barrier, mechanism, pattern, loop,
intervention, evidence, actor, workflow, era. Several are not independent:

- **loops are computed**, not authored: strongly connected components over
  mechanisms, found by Tarjan. A derived view stored as a node type.
- **barriers duplicate workflow states.** B-002 and the `machine-screened` state
  of WF-001 are the same point in the process, authored twice and kept in sync
  by a validator.
- **patterns are conjunctions of constraints**, expressed as prose
  `trigger_rule` plus two id lists, so their central claim — that the joint
  satisfying set is empty — is asserted rather than computed.
- **`facets.visibility` is a property of a mechanism**, but visibility is a
  relation between a party and a fact. A mechanism is not opaque; it is opaque
  *to the applicant* and transparent to the party that configured it.

Three things the registry cannot express at all:

1. **The cohort.** M-002 is "stronger competing candidate in the final cohort",
   but there is no cohort in the model — no way to say a condition ranks within
   a set rather than testing an individual.
2. **Duration.** A-015 is defined by six weeks elapsing. Nothing in the schema
   carries time, so the defining property lives in prose.
3. **Concurrency.** An applicant with two live processes, where an offer in one
   changes the other, has no representation.

---

## 3. Primitives

Four. Everything else is a view.

### 3.1 Record

An addressable object with typed fields. The requisition, the posting, the
application, a screening note, a score, a message, the offer, an ATS
configuration, a published rate series.

A **party** is a record that can emit events: applicant, referrer, recruiter,
hiring manager, interviewer, approver, vendor system, agency, regulator. Not a
closed list of six — a role held in a particular process.

> **Necessary:** events must be about something, and asymmetry must be
> asymmetric about something. Collapsing parties into records is the one
> deliberate economy: a party has state (capacity, quota, budget) exactly as a
> record does, and treating it as one removes a whole primitive at the cost of
> one sentence of explanation.

### 3.2 Event

A party changes a field, creates a record, or sends a message, at a position in
an order. The atom. Nothing else happens.

> **Necessary:** a process is an ordered set of events. Without it there is only
> a snapshot.

### 3.3 Condition

A predicate over record fields that must hold for a class of event to occur.
Knockout rules, score thresholds, unanimity requirements, budget approval,
jurisdiction lists, band ceilings.

A condition carries three things that are not derivable from it:

- **owner** — which party may change it, including *none in this process*, which
  is how the exterior enters;
- **determinacy** — `deterministic` (arithmetic on stated values), `judgement`
  (a person decides), `stochastic` (depends on who else applied that week);
- **arity** — `absolute` (tests this record alone) or `comparative` (ranks this
  record within a set). **This distinction is new and load-bearing.**

> **Necessary:** conditions are counterfactual. Events record what happened;
> conditions state what would have blocked. No sequence of events entails the
> rule that would have fired on a different input, and every "why" in the atlas
> is a claim about a condition.

### 3.4 Visibility

A relation from (party, record field, position in the order) to one of
`observable`, `inferable`, `opaque`.

> **Necessary, and the reason this is a model of *hiring* rather than a generic
> workflow.** Two processes with identical events and identical conditions are
> different objects if one is legible to the applicant and the other is not.
> Visibility cannot be derived from events, because it is precisely the map from
> events to the subset one party gets to see. The applicant reasons over a
> projection; the whole atlas exists because that projection is lossy.

---

## 4. What is deliberately not a primitive

- **Time** is carried as an ordering plus optional durations on events. A metric
  clock is not needed to say a rejection arrived after sixty days; an elapsed
  field on the event is.
- **Macro context** is not its own layer. It is records with no owner inside the
  process, on which condition parameters depend. An era is an interval over
  which those records held certain values. This is what removes a whole entity
  type without losing the eras page.
- **Motive.** There is no field for why a party did something, and there will not
  be one. Conditions have owners and parameters; they never have purposes. This
  is a modelling constraint, not an oversight, and it is what keeps the atlas
  from becoming an accusation.

---

## 5. Every current entity type as a view

| current type | in this model |
|---|---|
| observation (`A-*`) | an event whose visibility to the applicant is `observable` |
| barrier (`B-*`) | a condition gating a forward event, plus its position in the order |
| mechanism (`M-*`) | a condition, its owner, and the events it causes — an account of why a gate did not pass |
| pattern (`P-*`) | a set of conditions whose joint satisfying set is empty for some party. **Computable**, where today it is asserted |
| loop (`L-*`) | a cycle in the event/condition dependency graph. Already computed; now it need not be stored |
| intervention (`I-*`) | a proposed change to a condition, or to a visibility edge. The second kind has no clean home today |
| evidence (`EVD-*`) | a record attesting a condition or a class of event |
| actor | a party |
| workflow | the graph of event types, with conditions on the edges |
| era | an interval over which ownerless records held given values |

Nothing is lost, two things are gained: patterns become computable, and an
intervention that changes only *who can see what* becomes expressible. Several
of the interventions written this year are of that second kind — publishing a
rubric changes no rule, only a visibility edge — and the current schema records
them as though they changed the rule.

---

## 6. Degenerations

The model must cost nothing when nothing is happening.

- **Everything visible** → the conditions and events remain, visibility drops
  out, and what is left is an ordinary state machine. This is the canonical
  path, WF-003.
- **No conditions** → a message log. Two parties, some events, an order.
- **One requisition, one application, no cohort** → three events: submitted,
  decided, answered. One condition. This is the whole model at its floor.
- **Only ownerless conditions** → the eras model: the exterior, with no process
  inside it.
- **One party** → a diary.

---

## 7. Worked coverage

**Outbound outreach with no requisition.** The recruiter emits a message event
before any posting record exists. There is no requisition to be a parent, and
the condition that would gate a forward event — headcount approved — has never
been evaluated. This is M-016, and note that it now differs from M-009
*structurally* rather than by an observation we have failed to find: one has a
parent requisition record, the other does not.

**Cohort.** A requisition has many child application records. A comparative
condition ranks them. "Stronger competing candidate" stops being an unexplained
mechanism and becomes a comparative condition that this record did not top —
with the honest consequence that its outcome depends on records the applicant
can never see, which is a visibility fact, not a merit fact.

**Competing offers.** Two processes, two requisitions, one applicant record.
An accept event in one emits a withdraw event in the other. Nothing new is
needed.

**A freeze.** An ownerless record changes value. Condition parameters that
depend on it change. Forward events that were permitted stop being permitted,
including after an offer. The applicant sees an event whose cause is a record
they have no visibility on at all — which is exactly the shape of the
experience, and the model says so rather than describing it.

**A rejection at sixty days.** An event with an elapsed field, caused by a
condition whose parameter is a retention interval, owned by the vendor.

---

## 8. What the model must refuse

- **No probability that a given person is hired.** There is no denominator, and
  the model must not be able to fake one. Comparative conditions make this
  tempting — a rank in a cohort looks like a probability — so the refusal has to
  be enforced, not merely stated.
- **No named real company or person**, as now.
- **Not a simulator.** The model must express a run that happened or could have.
  It must not be used to forecast one. The line: given a full assignment it can
  say which events were permitted; it can never say which will occur.

---

## 9. Cost, honestly

This is a substrate change under 120 authored entries — 81 of them registry
nodes, the rest evidence records — mirrored in two languages. Most of the
migration is mechanical — the ten types become views and the content maps
across — but three parts are not:

- **Visibility** currently lives as one facet value per mechanism. Turning it
  into a per-party relation is new authoring for every entry, not a rewrite.
- **Comparative conditions** do not exist yet; the mechanisms that need them
  (M-002, M-009, M-018) would be re-expressed.
- **Patterns** become computable, which means the four existing ones must
  actually compute, and one may turn out not to.

That last risk is worth naming as an argument *for* the change: an assertion
that stops being true when you compute it was never a finding.

---

## 10. What I need decided

1. **Substrate or replacement?** Recommendation: substrate. The ten types stay
   as the public vocabulary and the reading experience; the four primitives sit
   underneath and make the derived ones derived. A clean-slate replacement of
   the reader-facing vocabulary would cost the whole site for no reader benefit.
2. **Cohort explicit?** Recommendation: yes. Without it, comparative conditions
   have nothing to range over and three mechanisms stay hand-waved.
3. **Time: order only, or durations too?** Recommendation: order plus an
   optional elapsed field. A metric clock would invite arithmetic the evidence
   does not support.
4. **Concurrency?** Recommendation: yes — it is nearly free once processes are
   records, and competing offers are a real part of the subject.
5. **Does the visibility relation get authored per party, or per (party, class)
   with overrides?** Recommendation: per class with overrides, or the authoring
   cost is six times the current registry.
