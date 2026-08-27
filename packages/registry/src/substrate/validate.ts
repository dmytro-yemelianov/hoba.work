/**
 * Referential integrity over a whole substrate.
 *
 * Zod checks one object; this checks the bag: every reference resolves, every
 * emitter is a party, every record's fields are ones its class declares. The
 * report lists problems rather than throwing, in the registry validator's
 * style, so a caller can print all of them at once.
 */
import type { Substrate } from './schema.js';

export interface SubstrateProblem {
  at: string;
  problem: string;
}

export function validateSubstrate(sub: Substrate): SubstrateProblem[] {
  const problems: SubstrateProblem[] = [];
  const classes = new Map(sub.recordClasses.map((c) => [c.id, c]));
  const records = new Map(sub.records.map((r) => [r.id, r]));
  const eventClasses = new Map(sub.eventClasses.map((e) => [e.id, e]));
  const statements = new Set(sub.statements.map((s) => s.id));
  const conditions = new Set(sub.conditions.map((c) => c.id));
  const cohorts = new Map(sub.cohorts.map((c) => [c.id, c]));

  const need = (at: string, ok: boolean, problem: string) => {
    if (!ok) problems.push({ at, problem });
  };

  for (const r of sub.records) {
    const cls = classes.get(r.class);
    need(r.id, !!cls, `class ${r.class} does not exist`);
    if (cls)
      for (const f of Object.keys(r.fields))
        need(r.id, f in cls.fields, `field ${f} is not declared on ${cls.id}`);
  }

  for (const e of sub.events) {
    const cls = eventClasses.get(e.class);
    need(e.id, !!cls, `event class ${e.class} does not exist`);
    const emitter = records.get(e.emitter);
    need(e.id, !!emitter, `emitter ${e.emitter} does not exist`);
    if (emitter) {
      const emitterClass = classes.get(emitter.class);
      need(e.id, !!emitterClass?.party, `emitter ${e.emitter} is not a party — only parties emit`);
      if (cls && cls.emitters.length > 0)
        need(e.id, cls.emitters.includes(emitter.class), `class ${cls.id} does not accept ${emitter.class} as an emitter`);
    }
    for (const rid of e.records) need(e.id, records.has(rid), `record ${rid} does not exist`);
    if (e.statement) need(e.id, statements.has(e.statement), `statement ${e.statement} does not exist`);
    if (e.statement && cls) need(e.id, cls.communicates, `class ${cls.id} does not communicate, yet the event carries a statement`);
  }

  for (const s of sub.statements) need(s.id, records.has(s.about), `subject ${s.about} does not exist`);

  for (const c of sub.conditions) {
    for (const g of c.gates) need(c.id, eventClasses.has(g), `gated event class ${g} does not exist`);
    if (c.owner.party) need(c.id, records.has(c.owner.party), `owning party ${c.owner.party} does not exist`);
    if (c.cohort) need(c.id, cohorts.has(c.cohort), `cohort ${c.cohort} does not exist`);
    for (const read of c.reads) {
      const [rid, field] = read.split('#') as [string, string];
      const rec = records.get(rid);
      need(c.id, !!rec, `read ${read}: record does not exist`);
      if (rec) {
        const cls = classes.get(rec.class);
        need(c.id, !!cls && field in cls.fields, `read ${read}: field not declared on ${rec.class}`);
      }
    }
  }

  for (const v of sub.visibilityRules) {
    need('visibility', classes.has(v.audience), `audience class ${v.audience} does not exist`);
    need('visibility', classes.has(v.subject), `subject class ${v.subject} does not exist`);
    need('visibility', !!classes.get(v.audience)?.party, `audience ${v.audience} is not a party class`);
  }
  for (const v of sub.visibilityOverrides) {
    need('visibility', classes.has(v.audience), `audience class ${v.audience} does not exist`);
    need('visibility', records.has(v.subject), `subject record ${v.subject} does not exist`);
  }

  for (const f of sub.flows) {
    need(f.id, records.has(f.from), `source ${f.from} does not exist`);
    need(f.id, records.has(f.to), `target ${f.to} does not exist`);
    need(f.id, f.from !== f.to, `a flow cannot loop onto its own record`);
  }

  for (const p of sub.processes) {
    for (const t of p.transitions) {
      if (t.from) need(p.id, eventClasses.has(t.from), `transition source ${t.from} does not exist`);
      need(p.id, eventClasses.has(t.to), `transition target ${t.to} does not exist`);
      for (const c of t.conditions) need(p.id, conditions.has(c), `condition ${c} does not exist`);
    }
  }

  for (const c of sub.cohorts) {
    need(c.id, classes.has(c.of), `member class ${c.of} does not exist`);
    need(c.id, records.has(c.within), `container record ${c.within} does not exist`);
  }

  return problems;
}
