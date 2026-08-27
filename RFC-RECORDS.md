# RFC: records and flows — the authored format (A5)

One page, as the plan requires, before any content file exists.

## What gets authored

Only **shapes**: which records exist, who owns them, and which flows connect
them. Chains are computed paths and are never files. Amounts do not appear in
authored content at all in the first cut — the schema already accepts them
only with evidence, but the four seed shapes need none.

## Where it lives

```
content/records/R-001.md        content-uk/records/R-001.md
```

One record per file, both mirrors, same as every other entry type. `R-` is the
public id prefix (unused today; verified). Flows are authored **on the record
they leave from**, so a chain reads top-down from its source and no separate
flows directory exists.

## The frontmatter

```yaml
id: "R-001"
type: "record"
title: "Client contract"
record_class: "contract"          # closed list, below
owner: "outside-party"            # inside | outside-party | ownerless
owner_actor: "client"             # required unless ownerless; actor id
summary: "…"
flows:
  - to: "R-003"                   # the record the money/cost moves to
    label: "rate, less margin"
visibility_default: "opaque"      # to the candidate; overridable per entry
evidence_ids: []                  # for the record's existence-claims, not amounts
```

`record_class` initial closed list: `budget-line`, `contract`, `bid`,
`requisition-funding`, `payroll`, `placement-fee`, `subscription`, `runway`.
Extending the list is a schema change, deliberately.

## The four seed shapes (all with zero amounts)

1. **Own account**: budget-line → requisition-funding → payroll.
2. **Client account**: client budget → contract → margin split → payroll;
   the contract owned `outside-party` by the client actor.
3. **Agency placement**: employer budget → placement-fee → agency;
   the fee's *shape* (percent-on-placement) as prose on the flow label.
4. **Applicant runway**: savings → runway → search-months; owned by the
   candidate, the one chain the candidate sees whole.

## How it surfaces

The lift turns these files into substrate records + flows; chains are computed
and rendered on `/data` and on entries whose conditions read a chain's fields
(the freeze shows its three; the band shows what it is downstream of). No
public URL scheme changes: `/records/R-001` pages can come later or never —
the shapes are legible where they explain something, not as a new catalogue.

## What I am asking you to approve

- the `R-` prefix and per-record files with flows on the source record;
- the closed `record_class` list above;
- zero amounts in the first cut, even where evidence exists — amounts arrive
  as their own later pass so the shape review is not entangled with figures.

Silence on any point = the recommendation stands.
