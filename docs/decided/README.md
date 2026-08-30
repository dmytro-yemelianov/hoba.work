# Decided

Documents whose question is settled and whose work has shipped. They are kept
because the reasoning is worth reading, not because they describe the system as
it is now — for that, read the root documents and the registry itself.

Names here are frozen at what was canonical when each was written, which is why
the living-document guard in `tests/docs.test.ts` does not cover this directory:
rewriting a record to match the present would remove the evidence of when the
decision was taken.

| Document | Question | Settled as |
| --- | --- | --- |
| `2026-08-draft-client-funnel.md` | Should the client account get its own funnel, or a variant of the end-to-end one? | Its own: `proc.client_account_hiring_funnel`, 13 states, 16 transitions. |
| `2026-08-rfc-records-and-flows.md` | What does an authored record look like? | The format shipped; `recordClassEnumSchema` in `packages/registry-core/src/schemas.ts` is the source of truth now. |

`PLAN-SUBSTRATE.md` stayed at the root deliberately. Its stages are cited from
source — `packages/graph/src/substrate/lift.ts` names "the rule of the gate
(PLAN-SUBSTRATE A2)" — so it is a reference the code depends on, not a record of
finished work, and it is held to the same standard as the other living documents.
