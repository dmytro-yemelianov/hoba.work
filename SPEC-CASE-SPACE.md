# Case space — specification for review

A case is not an entry in the registry. A case is a point in a space, together
with a run through it. The prose — the rejection email, the archetype, the
Ukrainian mirror — hangs off that point and is never the thing itself.

This specification defines the space: its coordinates, its admissible region,
its transitions, the operators over it, and what "complete" is allowed to mean.
It is the answer to a question SPEC-MODEL.md did not ask.

**Nothing in the repository changes until this is agreed.** Backward
compatibility is explicitly not required: ids, schemas, the registry layout and
the public API may all be rebuilt if the mathematics is cleaner without them.
Section 12 says what actually has to go, which is less than that licence allows.

---

## 1. Why the current model cannot answer the question it is being asked

SPEC-MODEL.md settled what a hiring process is *made of*: four primitives —
record, event, condition, visibility — with parties as records that emit, time
as an order plus an elapsed field, and money as flows over records. That model
is built, shipped and kernel-proved (PLAN-SUBSTRATE A1–A7, B1–B3, C1–C4).
**It survives this document unchanged.**

What it never provided is a *set of all cases*. The registry is a list: 124
archetypes, 21 observations, 28 mechanisms, 16 barriers, 6 scenarios. A list
has a fatal property — it cannot tell you what is missing from it. The
2026-09-05 audit hit exactly that wall and worked around it by writing another
list: `data/coverage/model.json`, 15 dimensions and 92 slots, each one a
situation somebody sat down and remembered. It scored 64.7%.

That number is honest about the entries and dishonest about the denominator.
92 is not the number of materially distinct hiring situations. It is the number
of situations one reviewer thought of in one sitting. A checklist can be
audited for accuracy; it can never be audited for completeness, because the
thing it omits is by construction the thing nobody wrote down.

### 1.1 The demonstration, measured rather than argued

The atlas ships a complete Ukrainian mirror and names the Ukrainian market as a
reason its defaults were wrong (SPEC-MODEL §2a). Search the corpus for the
statuses that govern who can be hired in that market:

| searched for | files in the EN corpus | files in the UK mirror |
|---|---:|---:|
| `military`, `conscript`, `veteran`, `mobilis(z)ation` | **0** | **0** |
| `displaced`, `refugee`, internal displacement | **0** | **0** |
| a dimension for any of the above in `coverage/model.json` | **0** | — |

Three UK-mirror files match `бронюв`, and all three are recruiters booking
interview slots. The checklist scores `jurisdiction: ukraine` as **covered** on
the strength of one evidence record about probation periods.

This is not a gap somebody was careless about. It is the structural failure of
enumeration: the reviewer who wrote the 92 slots could only write down the
situations they had in mind, and a whole legal regime governing who may be
hired at all was not among them. No amount of care fixes that, because
carefulness is the wrong instrument — the missing thing is missing precisely
because nobody was thinking about it.

A coordinate system does not have that failure mode. Declare `military.status`
as an axis and every one of its values is either occupied, admissible and
empty, or refuted by `Γ`. The absence becomes a computed row rather than an
oversight, and it appears the moment the axis is declared, without anybody
remembering to look.

### 1.2 The fix

Stop enumerating cases and start generating them. Declare the coordinates;
declare which combinations are impossible and why; and then absence is
*computed* rather than remembered. A slot nobody thought of still appears,
because the product does not care what anybody thought of.

---

## 2. Objects

### 2.1 The context space

Let each **axis** `A_i` be a finite declared domain. The **context space** is
the product

```
X = A_1 × A_2 × ... × A_n
```

and a **context** is a point `x ∈ X`. This is the vector: the static
configuration of a situation before anything happens in it — who is paying,
under what law, through which entry path, in what arrangement, with which
parties present.

Axes come in three kinds:

| kind | a value is | contributes |
|---|---|---|
| `nominal` | one member of the domain | `\|A_i\|` |
| `subset` | any subset of the domain, empty included | `2^\|A_i\|` |
| `ordinal` | one member, with a declared order used by skew and monotonicity constraints | `\|A_i\|` |

### 2.2 Events and trajectories

The event alphabet is the substrate's, unchanged: a finite set `E` of event
classes, each declaring which party classes may emit it and whether it
communicates. An **occurrence** is an event class with an emitter, a position
in the order, the records it is about, and an optional statement.

A **trajectory** `τ` is a finite word of occurrences. The transition system is
the substrate's process graph

```
δ ⊆ (E ∪ {⊥}) × E × 2^Θ
```

— from a class (or the start), to a class, guarded by a set of conditions
`Θ`. This is `substrateProcessTransitionSchema` verbatim, latency bounds
included. Nothing new is introduced here; the case space rides on the machinery
that already exists and is already proved acyclic.

### 2.3 The case

```
c = (x, τ),    x ∈ X,   τ ∈ E*
```

**Outcome is not a coordinate.** The first draft of this idea carried `y` as a
third component, and it was wrong: an outcome that can be authored independently
of the trajectory is an outcome that can contradict it. The outcome, the stage
reached, the elapsed class and the candidate's visibility summary are all
**derived** by a total function `d(c)` from `τ` and the visibility rules. They
are coordinates for the purposes of coverage and never for the purposes of
authoring. Section 3.3 marks them.

### 2.4 The admissible region

```
F = { c ∈ X × E* : Γ(c) }
```

`Γ` is the constraint system of section 4. `F` is the model. Its points
include every case the corpus renders, every case it does not, and no case that
is contradictory.

### 2.5 The reader's case, which is the one that matters

For an audience class `a`, the **projection** `π_a(c)` is what `a` can see:
the visible fields of `x`, and for each position of the order, the occurrence
if it is observable to `a` and its *absence* if it is not — silence is part of
the projection, per SPEC-MODEL §2c-2.

Two cases are **indistinguishable to `a`** when `π_a(c) = π_a(c')`. Write the
fibre `[c]_a`.

This is the load-bearing definition in the whole document. **The atlas's
subject is the fibre, not the point.** A reader arrives holding a projection —
sixty days of silence — and the honest answer is the set of world-cases
consistent with it. A catalogue of points that never names the fibre is a
catalogue that cannot answer the only question anyone brings to it.

The corpus already agrees, which is the best evidence this framing is
discovered rather than invented. `schema/scenario.schema.json` requires
`observations` and makes `compatible_mechanisms` optional: a scenario is an
unordered bag of what the candidate saw, with the world-cases consistent with
it listed alongside. It has no trajectory and no outcome field, and it never
needed one. Six of them are authored, and every one is a fibre.

Three site features collapse into one query family over `F`:

| feature | query |
|---|---|
| diagnostic protocol | enumerate `[c]_candidate` |
| pattern | is `{c ∈ F : conditions jointly hold}` empty? |
| indistinguishability ceiling | which fibres does no probe split? |

SPEC-MODEL §2c predicted this collapse and could not perform it, because it had
no `F` to quantify over. That is what the space buys.

---

## 3. Coordinates

### 3.1 How an axis earns its place

An axis is admitted only if it does at least one of three things:

1. **changes admissibility** — some combination becomes possible or impossible;
2. **changes the projection** — some party can see more or less because of it;
3. **changes an intervention's target** — somebody different holds the lever.

An axis that does none of these is prose. Prose belongs to the renderer
(section 8), not to the coordinate system. This criterion exists to stop the
axis list growing to fit every adjective in the corpus.

Provenance is tracked per axis, because it is the difference between a
vocabulary the code already enforces and one being proposed here:

- **`schema`** — already an enforced enum in `packages/registry-core/src/schemas.ts`
  or the substrate schema. Empirically load-bearing today.
- **`coverage`** — a dimension of the 2026-09-05 coverage model, authored but
  not enforced.
- **`new`** — proposed here, with the corpus evidence for it named.

### 3.2 The axes

**Block I — demand and money.** Who pays for the seat and where the money goes.
SPEC-MODEL §2a–2b argued these in; nothing in the ten types carries them.

| axis | kind | provenance | domain |
|---|---|---|---|
| `funding.source` | nominal (7) | new (§2a) | `internal_budget`, `signed_client_contract`, `unwon_bid`, `public_statutory`, `investment_round`, `credit`, `none` |
| `funding.state` | nominal (4) | new (§2a) | `committed`, `conditional`, `withdrawn`, `absent` |
| `chain.class` | nominal (5) | schema (`record_class`, `split_type`) | `internal_payroll`, `client_margin`, `agency_fee`, `candidate_runway`, `none` |
| `cost.borne_by` | subset (5) | new (§2b) | `employer`, `agency`, `ats_vendor`, `job_board`, `candidate` |

**Block II — parties.** Which roles exist in this case and whose process it is.

| axis | kind | provenance | domain |
|---|---|---|---|
| `party.set` | subset (11) | schema (`actorId`, extended) | `candidate`, `recruiter`, `hiring_manager`, `interviewer`, `approver`, `ats_vendor`, `employer_policy`, `public_policy`, `client`, `agency`, `referrer` |
| `principal.side` | nominal (4) | coverage (`side`) | `employer_evaluates`, `candidate_evaluates`, `intermediary_decides`, `exterior_force` |

`party.set` is the axis that makes the agency a first-class object. SPEC-MODEL
§7 named the gap precisely: the party being paid on placement "is not one of
its six actors", so the atlas cannot address an intervention to it.

**Block III — entry and object.**

| axis | kind | provenance | domain |
|---|---|---|---|
| `entry.path` | nominal (9) | coverage (`entry`) | `inbound`, `outbound`, `referral`, `agency_submission`, `internal_transfer`, `rehire`, `contract_to_hire`, `dated_re_entry`, `speculative_pool` |
| `requisition.state` | nominal (6) | new | `funded_open`, `funded_pre_committed`, `conditional_on_bid`, `stale_orphaned`, `never_existed`, `closed_reposted` |
| `arrangement` | nominal (6) | coverage (`domain`) | `permanent`, `contractor`, `freelance`, `temporary_seasonal`, `internship`, `contract_to_hire` |
| `domain` | nominal (6) | coverage (`domain`) | `software`, `other_technical`, `non_technical`, `client_vendor_staffing`, `public_sector`, `regulated_profession` |
| `worksite.mode` | nominal (8) | new | `onsite`, `hybrid_fixed`, `hybrid_flexible`, `remote_metro`, `remote_national`, `remote_global`, `field_or_travel`, `unstated` |
| `worksite.anchor` | nominal (7) | new | `none`, `named_city`, `commute_radius`, `country`, `timezone_band`, `client_site`, `entity_jurisdiction` |
| `worksite.cadence` | ordinal (6) | new | `none`, `occasional`, `1_per_week`, `2_3_per_week`, `4_5_per_week`, `unstated` |

**Where the job is done was missing, and it is not the same thing as where a
contract can be signed.** The corpus models the second and not the first.
`mech.location_or_timezone_compliance_constraint` is precisely and only about
contract issuance — "no legal entity or provider that can issue an employment
contract in the jurisdiction where the candidate resides" — and the conformance
checker implements it as a membership test of `located_in` against
`hiring_locations`. That gate can pass in full while the case still fails: a
company with a Polish entity can hire in Poland and still require three days a
week in a Warsaw office. Today the model sees the first constraint and is blind
to the second.

The rest of the corpus confirms the blindness rather than contradicting it.
Searching for `remote`, `hybrid`, `onsite`, `relocat`, `in-person` and `commut`
across the English corpus returns five files: three are the jurisdiction
machinery above, one is `onsite` meaning an interview round, and one is the
string `Remote (EU)` inside a specimen of a reposted advertisement. Work format
appears in the atlas exactly once, as scenery in a quoted job ad.

Each of the three axes is justified separately, because three axes for one
subject is where proliferation starts:

- **`worksite.mode`** passes all three of §3.1's tests. Admissibility: `onsite`
  interacts with `disability_accommodation` and with `displacement`;
  `remote_global` interacts with the entity constraint. Intervention: the mode
  is rarely owned inside the hiring loop.
- **`worksite.anchor`** is what the mode is bound *to*, and the bindings have
  different owners — a commute radius is a facilities decision, a timezone band
  a team one, a client site the client's, an entity jurisdiction a tax and
  registration one. Collapsing them would put four different intervention
  targets behind one word. `entity_jurisdiction` is where
  `mech.location_or_timezone_compliance_constraint` lands, which keeps the
  existing mechanism exactly as narrow as it actually is.
- **`worksite.cadence`** exists for one value. A posting that says "hybrid" and
  never says how many days is the ordinary case, and `unstated` is what makes
  that expressible: the mode is observable, the number is not, and the candidate
  discovers it late. Without the axis that gap is prose; with it, it is a
  projection fact and a fibre generator.

**Block IV — process shape.**

| axis | kind | provenance | domain |
|---|---|---|---|
| `plurality` | nominal (4) | coverage (`cohort_and_plurality`) | `single`, `parallel_processes`, `competing_offers`, `repeat_same_employer` |
| `cohort.state` | nominal (5) | schema (substrate `cohort`) | `none`, `ranked_within_cohort`, `pre_committed_internal`, `bench_pool`, `lottery_among_equals` |

**Block V — the blocking condition.** These four are `mechanismFacetsSchema`
promoted from a facet on an entry to coordinates of a case, plus the substrate's
`owner`/`determinacy`/`arity`. They were always axes; they were stored as tags.

| axis | kind | provenance | domain |
|---|---|---|---|
| `block.owner` | nominal (4) | schema (substrate `ownerPosition`) | `inside`, `outside_party`, `ownerless`, `none` |
| `block.determinacy` | nominal (3) | schema | `deterministic`, `judgement`, `stochastic` |
| `block.arity` | nominal (2) | schema | `absolute`, `comparative` |
| `block.nature` | nominal (5) | schema (`natureType`) | `rule`, `incentive`, `bias`, `noise`, `void` |
| `latitude.employer` | ordinal (4) | new | `rigid`, `slack_inside`, `slack_outside_party`, `unknown` |
| `latitude.candidate` | ordinal (4) | new | `rigid`, `slack`, `slack_conditional`, `unknown` |

**Concession, without a field for willingness.** "What each side will bend on"
is the second half of the work-format question and it has no home in the model
today. It also cannot be added the obvious way: SPEC-MODEL §4 forbids a field
for why a party does anything, and *willing* is a motive word. A `flexibility`
score would be an accusation with a number on it.

The frame that works is already in SPEC-MODEL §2b, written about money:

> band rigidity is chain arithmetic. The number cannot move at the seat's
> position because there is no slack there; the slack, if any, is several edges
> up, owned by someone the applicant never meets

So concession is **slack on a condition's parameter, at an owner position** —
structural, ownable, and motive-free. It generalises off money without any new
idea: a three-day attendance requirement has slack or it does not, and if it
does, the slack sits with the hiring manager, or with facilities, or in a lease
or a local tax agreement that nobody in the interview loop can reach. The three
positions are §2a's, unchanged, and `slack_outside_party` is the value that
stops a lease from being mistaken for weather.

On the candidate's side the same discipline applies and the model already has
the mechanism: SPEC-MODEL §2c-4 derives a reservation wage from a runway record
without any field saying the person feels pressure. `latitude.candidate` is
that pattern generalised — **derived from a record wherever a chain exists**
(runway → reservation wage; a caregiving record → a commute radius), and
authored only where no chain does. `slack_conditional` is the honest value for
"movable, but against something else" — the case where a candidate can take
three days a week if the anchor city changes, which is one constraint traded for
another rather than a concession.

The substrate change this implies is small: `conditionSchema` grows a
`latitude` object carrying the movable parameter set, the owner position of the
slack, and its visibility to the other side. Everything above is the case-level
summary of it.

**Why this is not a simulator.** It reports whether two parameter sets
intersect and where the slack sits. It does not say who moves, who should move,
or whether agreement follows. That is the same line SPEC-MODEL §8 already
draws — "given a full assignment it can say which events were permitted; it can
never say which will occur" — and `bargain.state` in §3.3 is a permission fact,
not a forecast.

**And the asymmetry falls out rather than being asserted.** The candidate's
stated expectation is typically observable to the employer; whether the
employer's number can move is typically opaque to the candidate. Identical
observable postings, opposite outcomes, and nothing separating them from where
the candidate stands. That is §2c-3's theorem again — asymmetry of projections,
not of machinery — arriving in a second place without being put there.

**Block VI — communication.**

| axis | kind | provenance | domain |
|---|---|---|---|
| `statement.fidelity` | nominal (5) | schema (`emissionFidelity`) | `direct`, `euphemism`, `distortion`, `noise`, `void` |
| `distortion.origin` | nominal (4) | new (§2c-1) | `none`, `speaker`, `channel`, `relay` |

`distortion.origin` is the axis the corpus most obviously needs and does not
have. `mech.ats_parser_extraction_failure` is a distortion with nobody lying
anywhere; `obs.generic_closer_alignment_rejection_template` is a distortion with
a speaker. One fidelity value, two different cases, two different interventions.

**Block VII — time, memory, epilogue.**

| axis | kind | provenance | domain |
|---|---|---|---|
| `memory.carried` | subset (4) | coverage (`memory`) | `talent_pool`, `re_entry_standing`, `do_not_rehire`, `trained_ranker` |
| `epilogue` | nominal (7) | coverage (`epilogue`) | `not_reached`, `start_date_shift`, `post_acceptance_revocation`, `no_show_candidate`, `no_show_employer`, `probation_confirmed`, `probation_terminated` |

**Block VIII — exterior and status.**

| axis | kind | provenance | domain |
|---|---|---|---|
| `jurisdiction` | nominal (6) | coverage | `us`, `uk`, `eu`, `ua`, `other`, `cross_border` |
| `era.regime` | ordinal (5) | schema (the four authored eras) | `record_funding`, `zero_rates_same_year_deduction`, `rates_up_payroll_repriced`, `fixed_seats`, `unclassified` |
| `military.status` | nominal (10) | new | `not_applicable`, `registered_liable`, `deferred`, `reserved_by_employer`, `unfit`, `excluded`, `reservist`, `serving`, `demobilised_veteran`, `registration_violation` |
| `population.affected` | subset (18) | coverage (`affected_population`), extended | below |

**`population.affected` — the grounds.** Twelve that any jurisdiction has:

`career_gap`, `early_career`, `age`, `caregiving`, `disability_accommodation`,
`neurodivergence`, `mental_health`, `race_ethnicity`, `gender_pregnancy`,
`religion`, `orientation_identity`, `criminal_record`

and six that are salient in the market the Ukrainian mirror addresses, none of
them exclusive to it:

`military_status`, `displacement`, `origin_territory`, `language`,
`security_vetting`, `cross_border`

Four of these need their scope stated, because a one-word id under-describes
them:

- **`age`** runs in both directions and covers generational stigma as its own
  mechanism, not merely as a proxy for years. "Too junior to trust" and "will
  not adapt" are the same axis with the sign flipped, and the corpus currently
  holds only the first, through `era.a_fixed_number_of_seats`.
- **`neurodivergence`** and **`mental_health`** are separate grounds and not one
  "spectrum". They are stigmatised differently and remedied differently: an
  unstructured panel and an unbounded take-home are accessibility failures for
  the first; disclosure risk and gaps in a dated history are the mechanism for
  the second. Splitting them is what lets an intervention target one without
  pretending to fix the other.
- **`displacement`** covers internal displacement, refuge abroad, and return —
  three states with different legal footing and opposite employer readings in
  the same market.
- **`origin_territory`** is where somebody is from or still living, which is not
  displacement: a person who has not moved from a frontline or occupied
  territory faces continuity and vetting readings that a person who left does
  not.

**Why `military.status` is an axis and not a nineteenth ground.** It passes all
three of §3.1's tests, and passing more than one is rare:

- **admissibility** — the state gates the hire itself, not the candidate's
  reception. Some values are unreachable in some jurisdictions by law, and at
  least one (`reserved_by_employer`) depends on a property of the *employer*
  rather than the person, which no ground can express.
- **intervention target** — a reservation is held by the employer together with
  an authority outside the process. That is SPEC-MODEL §2a's middle ownership
  position exactly, and collapsing it into `ownerless` is the specific error
  §2a was written to prevent. It looks like weather to the candidate; somebody
  signed it.
- **projection** — whether an employer can actually hold the status is typically
  `opaque` to the candidate until late, which makes it a genuine fibre
  generator rather than a label.

The ground `population.affected ∋ military_status` and the axis
`military.status` are therefore different objects and both are needed: the
ground says the case is *about* discrimination on that basis, the axis says what
the state *is*. The same split would apply to any ground with an administrative
register behind it, and this is the only one that currently has one.

**Evidence gate on this block.** Every legal claim attached to these values —
which registration duties bind an employer, which deferments exist, what a
reservation requires, what protection a displaced person holds in a given
jurisdiction — needs an evidence record before any rendering may assert it. I
could not verify these in the session that produced this document: web search
was unavailable. The axis and its value domain are structural claims and stand
on their own; the legal content behind each value is `unknown` until sourced,
and §4.2's Ukraine-specific constraints are marked `defeasible` for exactly
that reason rather than out of doubt about the shape.

**Block IX — epistemic status.** Not properties of the world: properties of our
claim about it. They are axes because they change what may be rendered.

| axis | kind | provenance | domain |
|---|---|---|---|
| `evidence.level` | ordinal (7) | schema (`evidenceLevel`) | `observed`, `compatible`, `supported`, `strongly_supported`, `proven`, `contradicted`, `unknown` |
| `evidence.role` | nominal (6) | coverage (`evidence_role`) | `descriptive_fact`, `mechanism_support`, `claim_scoped`, `edge_scoped`, `intervention_effectiveness`, `synthetic_labelled` |

### 3.3 Derived coordinates

Computed by `d(c)`, never authored. Authoring one is a schema error, not a
review finding.

| coordinate | domain | computed from |
|---|---|---|
| `stage.terminal` | 12 (`stageIdSchema`) | last position of `τ` |
| `outcome.signal` | 10 | terminal occurrence and its statement |
| `latency.class` | 4 — `within_expected`, `over_expected`, `over_max`, `unbounded` | elapsed fields against `latency_expected_days` / `latency_max_days` |
| `visibility.candidate` | 3 — `legible`, `partial`, `opaque` | the visibility rules applied to `τ` |
| `bargain.state` | 4 — `overlap`, `disjoint`, `undetermined`, `not_negotiated` | intersection of the two latitude sets on the blocking condition |

`bargain.state = disjoint` is a structural finding and the useful one: no
agreement was permitted on that parameter, whatever either party did. It is the
shape `pat.experience_age_impossibility` already computes — `[Y_req, ∞) ∩ [0,
Age(tool)] = ∅` — applied to a parameter that is not years.

It is worth being exact about what this does *not* fix.
`pat.compensation_double_bind` is recorded in `derivations.ts` as
`prose_asserted` and stays that way, because its obstruction is not disjoint
intervals: the band is non-empty and the candidate must name a number before
seeing it. That is an epistemic constraint, and it belongs to
`visibility.candidate`, not here. Latitude adds the neighbouring question the
model could not previously ask — whether the band itself can move, and who
would have to move it.

### 3.4 The arithmetic, and why the checklist was never going to work

28 nominal and ordinal axes, 4 subset axes of total arity 38, 5 derived.

```
|X| = 74,331,795,750,912,000,000   (28 nominal and ordinal axes)
    ×        274,877,906,944       (4 subset axes, total arity 38)
    ≈        2.04 × 10^31          context points, before Γ and before any trajectory
```

For coverage, a subset axis of arity `m` expands to `m` Boolean coordinates —
otherwise `population.affected` alone contributes 262,144 values and pairwise
coverage is meaningless. That gives **71 coverage coordinates**, and:

| layer | slots |
|---|---|
| 1-wise (every value of every coordinate) | **261** |
| 2-wise, unfiltered, over 2,485 coordinate pairs | **33,384** |
| the authored checklist it replaces | 92 |

The 92-slot model is not 92/261 of the first layer; it is a differently-shaped
sample of it. The comparison is only worth making for one purpose: to show that
a hand-written list was never going to reach the second layer, and the second
layer is where the interesting absences live. "Public-sector competition" and
"probation" are each covered as slots today. *Public-sector competition where
probation terminates* is a pair, and nothing in the corpus or the checklist
knows whether it exists.

Reproducing these numbers is a script, not a claim, and it lands with the
implementation.

---

## 4. Constraints

`Γ` is what makes the model assert anything. A space with no forbidden regions
classifies everything and therefore says nothing. **The count of combinations
`Γ` forbids is the model's content**, and it is a reportable metric.

`Γ` decomposes:

- **`Γ_X`** — static: which context combinations are contradictory;
- **`Γ_T`** — dynamic: `τ` follows `δ`, guards are satisfied, the order is
  forward (already Lean-proved for the authored processes);
- **`Γ_D`** — coherence: `d(c)` agrees with `τ`. Trivially true by construction,
  stated so that any future authored-outcome shortcut fails loudly.

### 4.1 Three strengths, and the honesty rule

| strength | meaning | if reality contradicts it |
|---|---|---|
| **hard** | logically impossible; the combination denotes nothing | the constraint was wrong. A **finding**, and the strongest kind the atlas can produce |
| **schema** | already enforced by a parser today | a bug |
| **defeasible** | not observed, believed rare, not impossible | ordinary. Records the belief so it can be checked |

A hard constraint is a falsifiable claim about hiring. This is the only place
in the model where the atlas sticks its neck out, and it should.

### 4.2 The catalogue as it stands

Already enforced (`schema`), carried over unchanged:

- `block.arity = comparative` ⟹ a cohort is named; `absolute` ⟹ none is
  (substrate `conditionSchema`);
- `block.owner = ownerless` ⟹ no party named, and any other value ⟹ one is
  (substrate `conditionSchema`, `authoredRecordSchema`);
- a flow amount ⟹ linked evidence (substrate `flowSchema`);
- `evidence.level ≥ supported` ⟹ linked evidence — the rule the 2026-09-05
  audit added after finding tiers asserted without sources.

Proposed **hard**:

- `funding.source = unwon_bid` ⟹ `funding.state = conditional` and
  `requisition.state ≠ funded_open`. A seat funded by a contract nobody signed
  is not an open funded seat; this is what
  `mech.bid_conditional_talent_pool` is.
- `entry.path = rehire` ⟹ `memory.carried ≠ ∅`. A rehire is a second process
  with the same employer; a record of the first exists, whether or not the
  candidate can see it.
- `block.determinacy = stochastic` ∧ `block.arity = comparative` — **forbidden**.
  SPEC-MODEL §3.3 names this as the boundary most easily got wrong: an outcome
  that looks random from outside is a comparative condition over an invisible
  cohort. Recording it as chance destroys the epistemic content of the case.
- `distortion.origin = channel` ⟹ `statement.fidelity = distortion` and no
  party holds a divergent claim. Nobody lied; the parser mangled it.
- `statement.fidelity = void` ⟹ no statement record exists at that position.
- `outcome.signal = hire` ⟹ `epilogue ≠ not_reached`. Scope runs to the end of
  probation (SPEC-MODEL §2c-6); a hire with no epilogue is an unfinished case,
  not a complete one.

Proposed **hard**, from the worksite and latitude axes:

- `worksite.mode = onsite` ⟹ `worksite.anchor ≠ none`. Work done at a site has
  a site.
- `worksite.mode ∈ {remote_metro, remote_national, remote_global}` ⟹
  `worksite.cadence ∈ {none, occasional}`. Remote with a four-day office week is
  not remote; it is hybrid under a friendlier word, and the model should refuse
  to store the euphemism as a fact. Where a posting says otherwise, that is a
  `statement.fidelity` finding about the posting, not a context value.
- `worksite.mode = hybrid_fixed` ⟹ `worksite.cadence ∉ {none, unstated}`, and
  `hybrid_flexible` ⟹ `worksite.cadence ∈ {occasional, unstated}`.
- `latitude.employer = slack_outside_party` ⟹ `party.set` contains a party
  outside the process. Slack held by nobody present is `ownerless`, which is a
  different value and a different remedy.
- `latitude.employer = unknown` ∨ `latitude.candidate = unknown` ⟹
  `bargain.state ∈ {undetermined, not_negotiated}`. A coherence rule: an
  intersection is not computable from a set that is not known.

**One distinction authors will otherwise collapse.** `worksite.cadence =
unstated` means no cadence is fixed *anywhere* — genuinely at the team's
discretion. A cadence that is fixed but not disclosed carries its real value on
this axis and its opacity on `visibility.candidate`. The two readings look
identical from the candidate's chair and are different cases, which is exactly
why both coordinates exist.

Proposed **hard**, from Block VIII:

- `population.affected ∋ military_status` ⟹ `military.status ≠ not_applicable`.
  A case cannot be about discrimination on a ground whose state is undefined.
- `military.status ≠ not_applicable` ⟹ the jurisdiction declares a military
  registration regime. Deliberately not written as `jurisdiction = ua`:
  conscription and reserve duty are not a Ukrainian peculiarity, and hard-coding
  one country would rebuild the own-account parochialism SPEC-MODEL §2a spent a
  section removing.
- `military.status = reserved_by_employer` ⟹ `block.owner = outside_party` for
  the condition that decides it. A reservation is not held inside the hiring
  process and is not weather; someone outside it signs.

Proposed **defeasible**:

- `domain = public_sector` ∧ `requisition.state = never_existed` — a statutory
  competition presupposes a mandated post
  (`evidence.openings_that_exist_because_a_rule_requires_them_ukraine_civil_service_competitions`).
  Believed rare rather than impossible, and marked so.
- `principal.side = candidate_evaluates` ∧ `visibility.candidate = opaque` —
  possible, and the interesting case; flagged because it is under-rendered.
- `military.status = serving` ∧ `arrangement = permanent` ∧
  `outcome.signal = hire` — believed rare, certainly not impossible, and the
  belief is recorded here so it can be checked rather than assumed.
- Every remaining Block VIII constraint stays **defeasible until sourced**, per
  the evidence gate in §3.2. The shape of the axis does not depend on the legal
  detail; the constraints do, and promoting any of them to `hard` requires the
  instrument that makes it hard.

**The interactions are the point.** Four pairs worth stating, because each is a
case class the corpus holds nothing for and none is exotic:

- `military.status × gender_pregnancy` — a market where liability for service is
  sex-conditioned reshapes who is available to hire, with no employer forming an
  intent about it;
- `military.status × age` — liability bands are age bands, so two axes the
  checklist treated as independent are not;
- `worksite.anchor × military.status` — a reservation attaches a person to a
  named enterprise, and a named enterprise has a site. Remote-global work and a
  registration regime pull against each other, and neither axis alone can say
  so;
- `worksite.cadence × population.affected` — a commute cadence is where
  `caregiving`, `disability_accommodation` and `displacement` become a gate
  rather than a ground. This is the single most ordinary hiring conversation
  there is, and the atlas currently has no coordinate for it.

None of the four is expressible as a slot. All four are ordinary 2-wise cells,
and they appeared by declaring axes rather than by anybody remembering them.

### 4.3 What `Γ` may not do

`Γ` may not encode rarity, undesirability, or distaste. "We have never seen it"
is `defeasible` at most, and usually not a constraint at all — it is an absent
slot, which is a different and more useful object.

---

## 5. Transitions

Unchanged from the substrate, restated for completeness:

- states are event classes, edges are guarded by condition sets;
- an edge may carry `latency_expected_days` and `latency_max_days`;
- the authored processes are acyclic and forward, kernel-proved in
  `formal/lean/Hoba/Theorems.lean`; the *observed* machine is not, and the
  proved contrast between them (`ideal_forward` / `observed_has_cycle`) is a
  finding the case space inherits rather than replaces;
- a loop is a cycle, computed. It was already computed; now it need not be a
  node type at all.

The case space adds one requirement: **every terminal event class must be
reachable and every reachable terminal must be a value of `outcome.signal`**.
A terminal the vocabulary cannot name is a dimension gap by construction.

---

## 6. Operators

| operator | signature | what it is |
|---|---|---|
| `adm` | `X × E* → {admissible, refuted(γ), undetermined}` | the `Γ` decision, with the violated constraint named |
| `d` | `F → Derived` | the derived coordinates |
| `π_a` | `F → Obs_a` | projection to an audience class; absences included |
| `≈_a` | equivalence on `F` | indistinguishability; fibres are the reader-facing object |
| `Δ_I` | `F → F` | intervention: change a condition, a visibility edge, a fidelity, or a distribution edge, hold `x₀`, recompute. The four kinds are SPEC-MODEL §5's; only the first has a home in the current schema |
| `L` | `Corpus → 2^F` | lift: which points an existing entry covers. Many-to-many and partial — an entry usually covers a region, not a point |
| `G_k` | `F → 2^F` | generate: admissible points whose `k`-wise signature nothing covers. **This is the operator the whole document exists for** |
| `μ` | `2^F → [0,1]` | coverage and skew measures (section 7.3) |
| `R` | `F × Locale × Persona × Style → Prose` | render (section 8) |

`G_k` is what makes the model contain cases that do not yet exist. It does not
imagine them; it reports which admissible coordinates nothing in the corpus
occupies. The unexpected future case the model is supposed to already hold is
either one of those points, or a section 7.2 verdict.

---

## 7. Completeness

### 7.1 What cannot be promised

The axis set is not provably complete, and no amount of internal rigour makes it
so. A situation may arrive that needs a coordinate nobody declared. Any claim
otherwise would be exactly the false precision the methodology forbids.

So completeness is not claimed about the world. It is claimed about
**classification**, which is a property the model can actually have.

### 7.2 Classification totality

For any case presented to the model, exactly one verdict, and there is no
`other` bucket:

1. **Point** — it maps to an `x ∈ F`. Whether the corpus renders that point is a
   separate question, and the interesting one.
2. **Refuted** — `Γ` forbids it. Then either the case is real, and a hard
   constraint just failed — a finding — or it is genuinely impossible.
3. **Value gap** — an existing axis needs a value it does not have. Cheap:
   extend the domain, re-run `Γ`, re-run coverage.
4. **Dimension gap** — no assignment expresses it; a new axis or a new operator
   is required. Expensive, rare, and **first-class**: it gets a record with the
   case that forced it, so the model's own incompleteness is data rather than
   embarrassment.

Verdict 4 is the register that replaces "we did not think of that". A model
that logs where it broke is worth more than one that claims it cannot.

### 7.3 Coverage measures

Five, reported separately, never averaged into one number:

1. **1-wise** — every value of every coordinate occupied by ≥1 rendered case.
   Target 100%. Anything less is a naming gap, not a research gap.
2. **2-wise over `Γ`-admissible pairs** — the headline. The denominator is
   33,384 minus what `Γ` forbids, and shrinking that denominator with defensible
   constraints is real progress, not gaming.
3. **3-wise over a designated critical subset** — the axes where interaction is
   the subject: `funding.*`, `block.*`, `visibility.candidate`, `jurisdiction`,
   and `military.status` and `worksite.*` against the grounds they condition. Full
   3-wise over 71 coordinates is not a goal anybody should have.
4. **Trajectory coverage** — every transition edge and every terminal traversed
   by ≥1 case.
5. **Fibre coverage** — every non-singleton fibre `[c]_candidate` has ≥1
   rendering that *names the ambiguity*. This is the one that maps to the site's
   actual purpose, and the one a point-coverage number would hide: a corpus can
   cover many points and still never tell a reader which cases they cannot
   distinguish from where they stand.

### 7.4 Skew

Per coordinate: the marginal distribution, normalised entropy, and the empty-cell
rate among admissible pairs. Across the corpus: Jensen–Shannon divergence from a
declared reference distribution, with the reference *named* — there is no neutral
one.

And a standing label on every one of these numbers: **this is the skew of the
corpus, not the prevalence of anything in the world.** The atlas has no
denominator over real hiring processes and must never present one.

---

## 8. The rendering layer

The user's requirement, and the cleanest part of the design.

```
R : F × Locale × Persona × Style → Prose
```

One case, many renderings: EN and UK, six specimen kinds, seven actor
perspectives, archetype pages, scenario walkthroughs. A rendering **declares
the case it renders** and is validated against it:

- it may not assert an axis value the case does not carry — this is the check
  that catches an English page drifting from its Ukrainian mirror, because both
  are checked against the same point rather than against each other;
- it may not narrow a fibre the case does not narrow. Prose that says "they went
  with someone internal" when the projection cannot distinguish that from a
  freeze is a rendering error, and today it is only a review opinion;
- it carries no coordinates of its own. Persona, tone and register are
  presentation and are not part of the case.

The 124 archetypes stop being a parallel content tree and become what they
already are in practice: renderings. The 430 authored texts of the current
corpus render some number of cases considerably smaller than 430, and computing
that number is one of the first things the implementation should do.

**Generation produces points, never prose.** `G_k` may report that
`(public_sector, probation_terminated, ua)` is admissible and unoccupied. It may
not write the story. A machine-authored rendering with no evidence and no author
is synthetic content wearing the atlas's credibility, and the corpus already
holds the line — specimens are labelled composites. Gaps are proposed to a
human; a human writes.

---

## 9. Mapping the current corpus

| current object | in the case space |
|---|---|
| observation (21) | a value of `outcome.signal`, or a projection pattern including an absence |
| barrier (16) | a condition on a transition guard; its stage is `stage.terminal` when it blocks |
| mechanism (28) | a region of `F` — a partial assignment of Block V, plus the events it causes. `facets` become coordinates |
| pattern (4) | a `Γ`-emptiness query. Computed, and two of the four already compute empty |
| loop (3) | a cycle in `δ`. Computed |
| intervention (24) | an instance of `Δ_I`, tagged with which of the four kinds |
| evidence (52) | support attached to a constraint, an edge, or an axis value; `evidence.role` says which |
| actor (7) | a member of `party.set` |
| process (4) | a subgraph of `δ` |
| era (4) | a value of `era.regime`: an interval over which ownerless records held given values |
| record (13) | substrate records and flows; `chain.class` is their coordinate |
| archetype (124) | a rendering, `R(c, locale, persona, style)` |
| scenario (6) | **a fibre, not a case** — `scenario.schema.json` requires a set of observations and permits a set of compatible mechanisms. That is `π_candidate` with its consistent world-cases listed beside it |
| coverage model (92 slots) | **superseded** by axes + `Γ` + `G_k` |

Note the shape of that table: nine of the eleven current entity types map to
something that already exists in the substrate or is computed. The case space
is not a third model competing with the other two. It is the coordinate system
the substrate was missing and the registry was standing in for.

---

## 10. What the model must refuse

SPEC-MODEL §8's four refusals carry over verbatim — no hiring probability, no
named real parties, not a simulator, knowability never knowledge. A coordinate
space adds two temptations of its own, so two more:

- **No measure on `F` that is read as a probability.** `|{c : m}| / |F|` is a
  fact about the axis domains, not about hiring. The space is a *possibility*
  structure. Counting points is not evidence, and the model must not make it
  easy to pretend otherwise.
- **No generated prose.** Section 8. `G_k` proposes; people write.
- **No leverage.** Latitude says where slack sits and whether two parameter sets
  intersect. It must never be summed into a bargaining-power score, ranked
  between the parties, or turned into negotiation advice. The candidate's
  latitude in particular is a fact about a runway record and a caregiving
  record, never a measure of how badly somebody needs the job — that reading is
  motive, and it is the one an axis called `latitude` will invite on its first
  day.

---

## 11. Risks, named

**The unfalsifiability risk, which is the serious one.** A coordinate system
with 71 coordinates and permissive constraints will classify anything at all —
and a model that fits everything predicts nothing. The guard is `Γ`: the count
of forbidden admissible-looking combinations is reported alongside the coverage
numbers, and if it trends toward zero the model is decorative. Section 4.2
proposes fourteen hard constraints. Fourteen is not many against 33,384 pairs,
and every round of additions so far has grown the space faster than the
constraints on it. The worksite axes are the first round that bucked that:
five of the fourteen came in with them, because a physical arrangement has
contradictions a status does not. Growing that list with defensible constraints is the main
intellectual work of the rebuild, more than filling slots.

**Axis proliferation.** Countered by §3.1's three-way test, applied on the way
in rather than in review.

**Cost.** Real, and the licence to rebuild from scratch makes it easy to
overspend. The substrate cost A1–C4 and is finished. Section 12 is deliberately
short.

**The 64.7% will move, and probably down.** A larger, computed denominator will
produce a smaller number than a hand-picked one. That is the correction working,
and it should be published as such rather than quietly rebased.

---

## 12. What actually has to go

Backward compatibility is not required, but very little needs to be destroyed:

- **`data/coverage/model.json` and its 92 slots** — superseded outright. Its
  15 dimensions were the first draft of the axis list and are cited as such
  throughout section 3.
- **`loop` and `pattern` as authored node types** — both computed. Keep the
  reader-facing pages, drop the storage.
- **`mechanismFacetsSchema` as a facet** — the four fields become Block V
  coordinates of the case rather than tags on an entry.
- **The assumption that the registry is the list of cases** — the actual change,
  and the only one that is not a file operation.

Explicitly **not** thrown away: the four primitives, the substrate schema and
its lift, the Lean theorems, the evidence records, the authored EN/UK prose, the
public ids and URLs. Rebuilding those would cost the site and buy nothing
mathematical.

---

## 13. What lands, in order

1. Axis registry as data, with provenance per axis and per value.
2. `Γ` as data: constraint, strength, rationale, and the corpus reference that
   motivated it.
3. `adm` and `d` as functions, with the arithmetic of §3.4 as a reproducible
   script rather than three numbers in a document.
4. `L` over the existing corpus: which points the 430 texts actually occupy.
   This is the first number nobody currently knows.
5. `μ`: the five coverage measures and the four skew measures, published the way
   `coverage.json` is published today.
6. `G_k` for `k = 1, 2`: the gap register that replaces the checklist.
7. Rendering validation: every archetype declares its case; the two mirrors are
   checked against the point rather than against each other.

Steps 1–4 are the reviewable core. Nothing after step 4 is worth building if
step 4 says the corpus occupies far fewer points than expected — that result
would change the plan, and it is a real possible outcome.

---

## 14. What needs deciding

Six. Question 5 is **settled**; the record of it stays here. The other five
carry recommendations and none of them blocks the reviewable core.

1. **Do axes become reader-facing?** The site could expose a generated "what
   this atlas does not cover" page straight from `G_1`. *Recommendation:* yes
   for that one page; keep the ten types as the reading vocabulary otherwise.
   This is SPEC-MODEL Q1 asked again one layer up, and the answer should be the
   same one.
2. **Does `F` contain points with no rendering, permanently?** *Recommendation:*
   yes. That set **is** the gap register, and hiding it would rebuild the
   checklist's central flaw.
3. **Do cases get ids?** *Recommendation:* content-address them from the
   admissible coordinate vector. The same case then cannot be authored twice,
   and duplicate detection is free rather than a lint.
4. **How far does `party.set` open?** Eleven roles is already more than the
   current seven actors. Regulators, works councils, background-check vendors and
   immigration counsel are all real. *Recommendation:* open it, since an
   unnamed party is an unaddressable intervention — but each addition is
   authoring, not a free enum entry.
5. **`population.affected`: axis or evidence-scoped claim only?** **Settled:
   axes.** Refusing to name a ground is what produced six `absent` slots and a
   27.8% score on that dimension — the model was silent, and silence read as
   coverage. The domain was extended in the same decision to eighteen grounds,
   adding generational stigma to `age` in both directions, splitting
   `neurodivergence` from `mental_health` rather than collapsing them into one
   "spectrum", and adding the statuses this market actually runs on:
   `military_status` with `military.status` as its own axis, `displacement`,
   `origin_territory`, `language`, `security_vetting`, and `criminal_record`.
   Every rendering stays gated on evidence and jurisdiction; the absences stay
   visible. §1.1 is what the old answer cost.
6. **Must every authored fibre contain an authored case?** §2.3 makes `outcome`
   derived, which is safe — no current object authors one. But it exposes the
   real gap the six scenarios have: they name a projection and the mechanisms
   consistent with it, and no concrete trajectory behind any of them. That is
   defensible for a diagnostic preset and indefensible if a fibre is the atlas's
   product. *Recommendation:* require at least one authored `c ∈ [c]_candidate`
   per scenario, so the ambiguity a reader is shown is an ambiguity between
   things the model can actually exhibit.
