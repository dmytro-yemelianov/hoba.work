import { describe, expect, it } from 'vitest';
import {
  conditionSchema,
  flowSchema,
  substrateSchema,
  validateSubstrate,
  type Substrate,
} from '@hoba/registry';

/** The smallest process that exercises every primitive once. */
const fixture = (): Substrate =>
  substrateSchema.parse({
    recordClasses: [
      { id: 'cls:applicant', title: 'Applicant', party: true, fields: { name: 'text' } },
      { id: 'cls:recruiter', title: 'Recruiter', party: true },
      { id: 'cls:requisition', title: 'Requisition', fields: { funded: 'flag' } },
      { id: 'cls:application', title: 'Application', fields: { years: 'number' } },
    ],
    records: [
      { id: 'rec:p1', class: 'cls:applicant', title: 'The applicant', fields: { name: 'A' } },
      { id: 'rec:r1', class: 'cls:recruiter', title: 'The recruiter' },
      { id: 'rec:req1', class: 'cls:requisition', title: 'The seat', fields: { funded: true } },
      { id: 'rec:app1', class: 'cls:application', title: 'The application', fields: { years: 4 } },
    ],
    eventClasses: [
      { id: 'evc:submit', title: 'Application submitted', emitters: ['cls:applicant'] },
      { id: 'evc:reject', title: 'Rejection sent', emitters: ['cls:recruiter'], communicates: true },
    ],
    statements: [
      { id: 'sta:s1', about: 'rec:app1', claims: { years: 5 }, fidelity: 'euphemism' },
    ],
    events: [
      { id: 'evt:1', class: 'evc:submit', emitter: 'rec:p1', position: 0, records: ['rec:app1'] },
      { id: 'evt:2', class: 'evc:reject', emitter: 'rec:r1', position: 1, elapsed_days: 60, records: ['rec:app1'], statement: 'sta:s1' },
    ],
    conditions: [
      {
        id: 'cnd:funded',
        title: 'The seat is funded',
        gates: ['evc:submit'],
        owner: { position: 'outside-party', party: 'rec:r1' },
        determinacy: 'deterministic',
        reads: ['rec:req1#funded'],
        text: 'funded is true',
      },
    ],
    visibilityRules: [
      { audience: 'cls:applicant', subject: 'cls:requisition', field: 'funded', level: 'opaque' },
    ],
    flows: [{ id: 'flw:f1', title: 'Budget to seat', from: 'rec:req1', to: 'rec:app1' }],
    processes: [
      { id: 'prc:p', title: 'The walk', transitions: [{ to: 'evc:submit' }, { from: 'evc:submit', to: 'evc:reject', conditions: ['cnd:funded'] }] },
    ],
    cohorts: [{ id: 'coh:c1', title: 'This requisition’s applications', of: 'cls:application', within: 'rec:req1' }],
  });

describe('substrate schema', () => {
  it('accepts the minimal complete fixture and validates clean', () => {
    expect(validateSubstrate(fixture())).toEqual([]);
  });

  it('forces a comparative condition to name its cohort, and an absolute one not to', () => {
    const base = {
      id: 'cnd:x', title: 'x', gates: ['evc:submit'],
      owner: { position: 'inside', party: 'rec:r1' }, determinacy: 'judgement', text: 't',
    };
    expect(conditionSchema.safeParse({ ...base, arity: 'comparative' }).success).toBe(false);
    expect(conditionSchema.safeParse({ ...base, arity: 'comparative', cohort: 'coh:c1' }).success).toBe(true);
    expect(conditionSchema.safeParse({ ...base, arity: 'absolute', cohort: 'coh:c1' }).success).toBe(false);
  });

  it('forces ownership to be coherent in both directions', () => {
    const base = { id: 'cnd:x', title: 'x', gates: ['evc:submit'], determinacy: 'judgement', text: 't' };
    expect(conditionSchema.safeParse({ ...base, owner: { position: 'ownerless', party: 'rec:r1' } }).success).toBe(false);
    expect(conditionSchema.safeParse({ ...base, owner: { position: 'inside' } }).success).toBe(false);
    expect(conditionSchema.safeParse({ ...base, owner: { position: 'ownerless' } }).success).toBe(true);
  });

  it('refuses an amount without evidence — the question-7 policy, in the schema', () => {
    const flow = { id: 'flw:x', title: 'x', from: 'rec:a', to: 'rec:b' };
    expect(flowSchema.safeParse({ ...flow, amount: { value: 1, unit: 'usd', evidence: [] } }).success).toBe(false);
    expect(flowSchema.safeParse({ ...flow, amount: { value: 1, unit: 'usd', evidence: ['EVD-030'] } }).success).toBe(true);
    expect(flowSchema.safeParse(flow).success).toBe(true);
  });
});

describe('substrate referential validation', () => {
  it('rejects an emitter that is not a party', () => {
    const sub = fixture();
    sub.events[0]!.emitter = 'rec:app1';
    expect(validateSubstrate(sub).map((p) => p.problem).join(' ')).toContain('not a party');
  });

  it('rejects a record field its class does not declare', () => {
    const sub = fixture();
    sub.records[3]!.fields['salary'] = 100;
    expect(validateSubstrate(sub)[0]!.problem).toContain('not declared');
  });

  it('rejects a statement on a non-communicating event class', () => {
    const sub = fixture();
    sub.events[0]!.statement = 'sta:s1';
    expect(validateSubstrate(sub).map((p) => p.problem).join(' ')).toContain('does not communicate');
  });

  it('rejects a condition reading a field that does not exist', () => {
    const sub = fixture();
    sub.conditions[0]!.reads = ['rec:req1#margin'];
    expect(validateSubstrate(sub).map((p) => p.problem).join(' ')).toContain('field not declared');
  });

  it('rejects a flow from a record onto itself', () => {
    const sub = fixture();
    sub.flows[0]!.to = sub.flows[0]!.from;
    expect(validateSubstrate(sub).map((p) => p.problem).join(' ')).toContain('cannot loop');
  });

  it('lists every problem instead of stopping at the first', () => {
    const sub = fixture();
    sub.events[0]!.emitter = 'rec:none';
    sub.flows[0]!.to = 'rec:none';
    expect(validateSubstrate(sub).length).toBeGreaterThanOrEqual(2);
  });
});
