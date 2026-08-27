# Interaction model — specification for review

A model of what happens between an applicant and a company, built from scratch,
intended to be **necessary and sufficient**: every scenario the atlas must
describe is expressible in it, and no primitive can be removed without losing
something. It must also collapse gracefully — the simplest hiring story should
be three events and no machinery.

This is a specification, not an implementation. Nothing in the repository
changes until it is agreed.

**Settled so far:** the four primitives sit *underneath* the ten reader-facing
types rather than replacing them; the cohort is explicit; time is an ordering
plus an optional elapsed field; concurrent processes are in; visibility is
authored per class with overrides. Sections 2a–2b and questions 6–7 are the
part still open, and both arrived from a reader's objection rather than from
the model.

---

## 1. The adequacy test

The model is **sufficient** if it can express, without new primitives:

| | must express |
|---|---|
| **demand** | **who is paying for the seat, and whether the money exists yet: internal budget, a signed client contract, or a bid not yet won** |
| **money** | **the funding chain of a seat — source → allocations → payroll — and the fees distributed to third parties along the process** |
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

## 2a. The demand side, which the first draft of this spec missed

The adequacy test above originally asked what happens *to* the applicant and
never asked why the requisition exists at all. The answer is that somebody is
paying for the seat, and that party may sit outside the company entirely.

Two shapes, and the model has to hold both:

- **Own account.** The company is its own client. The seat is funded from its
  own revenue and the demand comes from internal planning.
- **Client account.** An external client funds the seat through a contract — or
  has not signed one yet, and the company is staffing a bid it hopes to win.

The registry today describes only the first. The words *client* and *bench*
appear five and six times across all content, always incidentally; there is no
client party, no contract record, and no gate owned by anyone outside the
employer. For the market the Ukrainian half of the atlas addresses, that is the
wrong default.

**What the omission has been mislabelling.**

- **M-016, "speculative sourcing without an opening."** Often not speculative.
  CVs are collected because a bid cannot be won without them; the role is real,
  conditional on the win. That is a different structure with a different remedy,
  and the current entry cannot say it.
- **M-007, freeze.** Frequently a client not signing, or cancelling — an event in
  a record the applicant has no visibility on whatsoever.
- **Compensation.** On a client account the band is derived from a rate the
  client pays, minus margin. That is why it reads as arbitrary and immovable:
  it is downstream of a contract nobody in the interview loop can renegotiate.
- **A whole missing gate.** Client-side CV approval and the client's own
  interview, after the employer's loop has already said yes. The applicant
  passes everything and then waits on a party that is not their prospective
  employer. The atlas has no B-\* for this.
- **Bench.** Employment with no project attached, or the interval between two.
- **Ramp-up.** A won contract needing twenty engineers in six weeks moves
  thresholds that are stated elsewhere as fixed.

**And one sign flips.** B-005's perspective holds that a bad hire is costlier
than a missed one, and states it as though it were universal. On a client
account an unfilled billable seat loses revenue directly, so the asymmetry can
invert — which is why the same market contains both a five-round loop and a
same-week offer. Several entries are implicitly own-account and say so nowhere.

**Does this need a fifth primitive? No — and that is the test it had to pass.**

| the thing | in the four primitives |
|---|---|
| client | a party, which is a record that emits events |
| contract, bid, statement of work | records |
| "is the seat funded" | a condition whose parameter is a field of the contract record |
| client CV approval, client interview | conditions owned by the client, determinacy `judgement` |
| band from rate | a condition parameter depending on a record field |
| bench | an employment record with no parent project record |
| scaling after a win | many requisitions from one contract, with comparative thresholds relaxed |
| growth strategy | a record the applicant has no visibility on — the correct representation |

**One attribute must widen, though.** Condition `owner` was written as though the
only question were which party *inside the company* may change it. There are
three positions, not two:

1. **inside the process** — the recruiter, the manager, the employer's policy;
2. **outside it but still a party** — the client, an agency, a regulator. Can be
   negotiated with, and can be addressed by an intervention;
3. **ownerless** — rates, layoffs, the legal regime. Nobody in reach.

Collapsing 2 into 3 is what made a client contract look like weather. It is not
weather: somebody signed it.

---

## 2b. Financial flows

Section 2a asks *who* pays. This section asks the two questions around it:
where that money comes from, and where it goes on its way through the process.
Money enters the model at three points, and the atlas already holds evidence
for two of them without a structure to hang it on.

### Source — where the seat's money originates

Product revenue, a client contract, an investment round, credit, a state budget
line. The macro half is already authored: the eras are literally about the
price of money — the rate series (EVD-007, EVD-008), §174 making US engineering
salaries costlier to expense (EVD-012–015) — but nothing connects any
requisition to any source. The era pages explain the climate; no entry can say
*this seat was funded by that kind of money*.

### Chain — the path from source to seat

`source → budget → headcount plan → requisition → offer → payroll`, or on a
client account `client budget → contract rate → margin → band → salary`. The
chain is what several stubborn facts are made of:

- **a freeze is an edge breaking somewhere upstream** — and section 2a's three
  ownership positions say where: a client not signing (outside party), a board
  decision (inside), a rate shock (ownerless);
- **band rigidity is chain arithmetic.** The number cannot move at the seat's
  position because there is no slack there; the slack, if any, is several edges
  up, owned by someone the applicant never meets;
- **§174 is a chain event**: a tax rule changed the arithmetic of every US
  engineering seat at once. The atlas holds it as era evidence; the model makes
  it expressible as a parameter change propagating down every chain at once;
- **the chain is the most opaque structure in the subject.** The applicant
  usually sees none of it — not the source, not the margin, not which edge
  broke. Visibility applies to every edge, and the typical assignment is
  `opaque` end to end.

### Distribution — who is paid along the process

Fees explain third-party behaviour that the current registry attributes to an
`incentive` facet without the parameter:

- **contingency agency**: a percentage of first-year salary, paid on placement —
  which is why the behaviour is speed, volume and overselling, a *different*
  incentive from the in-house quota already catalogued as M-009;
- **in-house recruiter**: salary plus quota metrics;
- **ATS vendor**: per-seat subscription — what the dashboard optimises is what
  the buyer renews on, which the ats-vendor perspectives already describe in
  prose;
- **referral bonus**: the referral entry path exists because of a distribution
  edge;
- **job boards**: pay-per-posting is cheap against a funded requisition, which
  is the arithmetic under the ghost-posting figure (EVD-034) — the posting
  costs little, the seat costs a great deal, so postings outlive seats;
- **the applicant also pays.** Unpaid take-home hours (A-006 is defined by
  them), unreimbursed travel, resignation risk before a countersignature.
  Distribution edges can point *from* the applicant, and the model must not
  make employer-side costs the only representable ones.

### In the primitives

A **flow** is an event linking two records, with an optional amount. A **chain**
is a path over flows — computed, like loops, never authored. Conservation —
what arrives equals what leaves plus what stays — is ordinary `deterministic`
condition arithmetic. Sources are records, owned or ownerless per 2a. **No
fifth primitive**, again — but one more computed view, and one policy:

> **Shape is always expressible; amounts only with evidence.** A chain with
> every amount unknown is still a finding — the shape alone explains why the
> band cannot move and which edge a freeze broke. An invented rate card would
> be the exact false precision the methodology forbids.

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

- **owner** — which party may change it, in one of three positions: inside the
  process, outside it but still a party (a client, an agency, a regulator), or
  ownerless. The middle position is the one section 2a adds, and losing it is
  what made a signed contract look like weather;
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

Nothing is lost, three things are gained: patterns become computable; an
intervention that changes only *who can see what* becomes expressible; and the
funding chain — which no current type can name at all — becomes a computed
view, stitching the eras to the requisitions they were always the climate for. Several
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

**A freeze.** An edge of the funding chain breaks, and the three ownership
positions name where: a client did not sign (outside party), a board pulled the
budget (inside the company, outside this process), a rate shock repriced the
source (ownerless). Condition parameters downstream change, and forward events
that were permitted stop being permitted, including after an offer. The
applicant sees one event whose cause sits on a chain they have no visibility on
at all — which is exactly the shape of the experience, and the model says so
rather than describing it. Which of the three it was is invisible from the
outcome, and the model is honest about that too: same observable event, three
distinct chains.

**A rejection at sixty days.** An event with an elapsed field, caused by a
condition whose parameter is a retention interval, owned by the vendor.

**An agency placement.** The agency is a party paid by a distribution edge —
a percentage of first-year salary, on placement. Every behaviour the applicant
meets follows from that edge's shape without any recourse to motive: speed over
fit, volume over depth, pressure to accept. Change the edge (retained fee,
split milestones) and the conditions change with it. This is an intervention
target the current registry cannot even address, because the party being paid
is not one of its six actors.

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
6. **Does the client account become first-class content, or only permitted by
   the substrate?** The substrate holds it either way. The content question is
   whether the atlas grows a client party, a contract record, a client-approval
   gate and the bench mechanisms — and re-reads the entries that quietly assume
   an own-account company, B-005's cost asymmetry first among them.
   Recommendation: yes, and it is the largest single content gap the atlas has,
   larger than the ten unsourced entries. The registry currently describes one
   organisational shape while presenting itself as describing hiring.
7. **Money: shapes now, amounts when?** The chain's shape — what funds a seat,
   who is paid along the way — can be authored for every entry class today, and
   the distribution edges give the agency, the boards and the vendor their
   first structural account. Amounts (rates, margins, fee percentages) only
   ever with an openable source, or the atlas manufactures the precision it
   forbids. Recommendation: author shapes as first-class content, keep amounts
   evidence-gated, and let the eras remain the source-side macro record they
   already are.
