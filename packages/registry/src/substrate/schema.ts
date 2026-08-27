/**
 * The four primitives of SPEC-MODEL.md, as data.
 *
 * Record, event, condition, visibility — with the settled refinements: parties
 * are records that emit; conditions carry owner (three positions), determinacy
 * and arity; visibility is authored per class with overrides; statements carry
 * the registry's existing fidelity vocabulary; flows link records and a chain
 * is computed, never stored.
 *
 * Two policies live in the schema itself rather than in review discipline,
 * because a schema cannot forget:
 *  - a flow amount REQUIRES evidence (shapes first, amounts only with proof);
 *  - a comparative condition REQUIRES the cohort it ranks within, and an
 *    absolute one may not name a cohort at all.
 *
 * Everything here is structural. No field carries a motive, a belief, or a
 *  probability — see SPEC-MODEL §8.
 */
import { z } from 'zod';
import { emissionFidelitySchema } from '../schemas.js';

const evidenceRef = z.string().regex(/^EVD-\d{3}$/);

// ---------------------------------------------------------------------------
// Ids. Namespaced so a substrate id can never be mistaken for a public one,
// and derived from public ids during lifting (`cnd:B-002`), so a reader of a
// test failure can still see what the object is about.

const idOf = (prefix: string) => z.string().regex(new RegExp(`^${prefix}:[a-z0-9][a-z0-9._-]*$`));

export const recordClassId = idOf('cls');
export const recordId = idOf('rec');
export const eventClassId = idOf('evc');
export const eventId = idOf('evt');
export const conditionId = idOf('cnd');
export const flowId = idOf('flw');
export const processId = idOf('prc');
export const cohortId = idOf('coh');
export const statementId = idOf('sta');

// ---------------------------------------------------------------------------
// 3.1 Record. A party is a record whose class says it can emit events — the
// one deliberate economy of the spec.

export const fieldTypeSchema = z.enum(['text', 'number', 'date', 'flag', 'ref']);

export const recordClassSchema = z.object({
  id: recordClassId,
  title: z.string().min(1),
  /** Declared fields; a record may not carry a field its class does not name. */
  fields: z.record(z.string(), fieldTypeSchema).default({}),
  /** True for classes whose records can emit events: the parties. */
  party: z.boolean().default(false),
});

export const fieldValueSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);

export const substrateRecordSchema = z.object({
  id: recordId,
  class: recordClassId,
  title: z.string().min(1),
  fields: z.record(z.string(), fieldValueSchema).default({}),
});

// ---------------------------------------------------------------------------
// 3.2 Event. A party changes a field, creates a record, or sends a message,
// at a position in an order. Time is the order plus an optional elapsed.

export const eventClassSchema = z.object({
  id: eventClassId,
  title: z.string().min(1),
  /** Party classes allowed to emit this event class. Empty = any party. */
  emitters: z.array(recordClassId).default([]),
  /** True when events of this class communicate — and so carry a statement. */
  communicates: z.boolean().default(false),
});

export const substrateEventSchema = z.object({
  id: eventId,
  class: eventClassId,
  emitter: recordId,
  /** Position in the order. The order is the clock. */
  position: z.number().int().nonnegative(),
  /** Days since the process's first event, when known. Optional by design. */
  elapsed_days: z.number().int().nonnegative().optional(),
  /** The records this event is about. */
  records: z.array(recordId).default([]),
  statement: statementId.optional(),
});

// ---------------------------------------------------------------------------
// Statements. What a party says about a record, which is not the record.
// Fidelity reuses the registry's emission vocabulary, deliberately.

export const statementSchema = z.object({
  id: statementId,
  about: recordId,
  /** The values claimed, keyed by field name. */
  claims: z.record(z.string(), fieldValueSchema).default({}),
  /**
   * Authored where only one side is modelled; computed by comparison where
   * both are. `direct` is the degenerate case every honest process is made of.
   */
  fidelity: emissionFidelitySchema,
});

// ---------------------------------------------------------------------------
// 3.3 Condition. Counterfactual: what would have blocked. The three authored
// attributes are exactly the ones no event log entails.

export const ownerPositionSchema = z.enum(['inside', 'outside-party', 'ownerless']);
export const determinacySchema = z.enum(['deterministic', 'judgement', 'stochastic']);
export const aritySchema = z.enum(['absolute', 'comparative']);

export const conditionSchema = z
  .object({
    id: conditionId,
    title: z.string().min(1),
    /** The event classes this condition gates. */
    gates: z.array(eventClassId).min(1),
    /**
     * The event classes this condition causes when it fires — the other half
     * of the spec's view of a mechanism: "a condition, its owner, and the
     * events it causes". Gating blocks a forward event; causing emits a trace.
     */
    causes: z.array(eventClassId).default([]),
    /**
     * The gate conditions this one is an account of — a mechanism's answer to
     * "why did that gate not pass". Empty for the gates themselves.
     */
    accounts_for: z.array(conditionId).default([]),
    owner: z.object({
      position: ownerPositionSchema,
      /** The party holding it — required unless ownerless. */
      party: recordId.optional(),
    }),
    determinacy: determinacySchema,
    arity: aritySchema.default('absolute'),
    /** The cohort a comparative condition ranks within. */
    cohort: cohortId.optional(),
    /** Record fields the condition's parameters read, as `rec:<id>#<field>`. */
    reads: z.array(z.string().regex(/^rec:[a-z0-9._-]+#[a-zA-Z0-9_]+$/)).default([]),
    /** The predicate, in words. Formality arrives with A3, not here. */
    text: z.string().min(1),
  })
  .superRefine((c, ctx) => {
    if (c.arity === 'comparative' && !c.cohort)
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'a comparative condition must name the cohort it ranks within' });
    if (c.arity === 'absolute' && c.cohort)
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'an absolute condition tests one record alone and may not name a cohort' });
    if (c.owner.position === 'ownerless' && c.owner.party)
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'ownerless means nobody holds it; naming a party contradicts that' });
    if (c.owner.position !== 'ownerless' && !c.owner.party)
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'an owned condition must name the party holding it' });
  });

// ---------------------------------------------------------------------------
// 3.4 Visibility. Authored per (audience class, subject class), overridable
// per record — the settled answer to spec question 5. The projection of a
// party includes the positions of the order itself, so absences are
// observable; that is a property of projections, not a field here.

export const visibilityLevelSchema = z.enum(['observable', 'inferable', 'opaque']);

export const visibilityRuleSchema = z.object({
  /** The party class doing the seeing. */
  audience: recordClassId,
  /** The record class being seen. */
  subject: recordClassId,
  /** A single field, or the whole record when omitted. */
  field: z.string().optional(),
  level: visibilityLevelSchema,
});

export const visibilityOverrideSchema = z.object({
  audience: recordClassId,
  subject: recordId,
  field: z.string().optional(),
  level: visibilityLevelSchema,
});

// ---------------------------------------------------------------------------
// Flows. Money and cost move between records; a chain is a computed path.
// The evidence gate on amounts is the schema-level enforcement of question 7.

export const flowSchema = z.object({
  id: flowId,
  title: z.string().min(1),
  from: recordId,
  to: recordId,
  /**
   * Present only when evidenced. The shape of a chain is content; its numbers
   * are claims, and claims carry sources here or they do not exist.
   */
  amount: z
    .object({
      value: z.number(),
      unit: z.string().min(1),
      evidence: z.array(evidenceRef).min(1),
    })
    .optional(),
});

// ---------------------------------------------------------------------------
// Processes and cohorts.

export const processSchema = z.object({
  id: processId,
  title: z.string().min(1),
  /** The graph of event classes, conditions on the edges. */
  transitions: z
    .array(
      z.object({
        from: eventClassId.optional(),
        to: eventClassId,
        conditions: z.array(conditionId).default([]),
      })
    )
    .min(1),
});

export const cohortSchema = z.object({
  id: cohortId,
  title: z.string().min(1),
  /** The record class whose records the cohort collects. */
  of: recordClassId,
  /** The record the cohort forms within — a requisition, typically. */
  within: recordId,
});

// ---------------------------------------------------------------------------
// The substrate: everything above, in one bag. Referential integrity is a
// separate pass (validate.ts) because Zod sees one object at a time.

export const substrateSchema = z.object({
  recordClasses: z.array(recordClassSchema).default([]),
  records: z.array(substrateRecordSchema).default([]),
  eventClasses: z.array(eventClassSchema).default([]),
  events: z.array(substrateEventSchema).default([]),
  statements: z.array(statementSchema).default([]),
  conditions: z.array(conditionSchema).default([]),
  visibilityRules: z.array(visibilityRuleSchema).default([]),
  visibilityOverrides: z.array(visibilityOverrideSchema).default([]),
  flows: z.array(flowSchema).default([]),
  processes: z.array(processSchema).default([]),
  cohorts: z.array(cohortSchema).default([]),
});

export type RecordClass = z.infer<typeof recordClassSchema>;
export type SubstrateRecord = z.infer<typeof substrateRecordSchema>;
export type EventClass = z.infer<typeof eventClassSchema>;
export type SubstrateEvent = z.infer<typeof substrateEventSchema>;
export type Statement = z.infer<typeof statementSchema>;
export type Condition = z.infer<typeof conditionSchema>;
export type VisibilityRule = z.infer<typeof visibilityRuleSchema>;
export type VisibilityOverride = z.infer<typeof visibilityOverrideSchema>;
export type Flow = z.infer<typeof flowSchema>;
export type Process = z.infer<typeof processSchema>;
export type Cohort = z.infer<typeof cohortSchema>;
export type Substrate = z.infer<typeof substrateSchema>;
