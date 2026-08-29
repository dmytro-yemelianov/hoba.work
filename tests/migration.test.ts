import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import { applyActorIdRename, applyIdRename, buildIdMapping, slugifyTitle, TYPE_ID_PREFIX, loadRegistryFromRoot, resolveRegistryRoot, insertAlias, planFileRename } from '@hoba/registry';
import type { RegistryBundle } from '@hoba/registry';
import { writeTempRegistry } from './helpers';

describe('slugifyTitle', () => {
  it('lowercases and joins words with underscores', () => {
    expect(slugifyTitle('Automated Filter & Parser Threshold')).toBe('automated_filter_parser_threshold');
  });

  it('collapses runs of punctuation into a single underscore', () => {
    expect(slugifyTitle('Generic "closer alignment" rejection template')).toBe(
      'generic_closer_alignment_rejection_template'
    );
  });

  it('strips leading and trailing underscores', () => {
    expect(slugifyTitle('  --Leading and trailing--  ')).toBe('leading_and_trailing');
  });

  it('is deterministic: the same title always produces the same slug', () => {
    const title = 'Pre-Selected Internal Candidate';
    expect(slugifyTitle(title)).toBe(slugifyTitle(title));
  });
});

describe('TYPE_ID_PREFIX', () => {
  it('covers all 11 ontology types with the prefixes from the design doc', () => {
    expect(TYPE_ID_PREFIX).toEqual({
      observation: 'obs',
      barrier: 'bar',
      mechanism: 'mech',
      pattern: 'pat',
      loop: 'loop',
      intervention: 'int',
      workflow: 'proc',
      actor: 'actor',
      era: 'era',
      record: 'record',
      evidence: 'evidence',
    });
  });
});

function fixtureBundle(overrides: Partial<RegistryBundle> = {}): RegistryBundle {
  return {
    observations: [],
    barriers: [],
    mechanisms: [],
    patterns: [],
    loops: [],
    interventions: [],
    workflows: [],
    actors: [],
    eras: [],
    records: [],
    evidence: [],
    ...overrides,
  } as unknown as RegistryBundle;
}

describe('buildIdMapping', () => {
  it('maps a single entity to <prefix>.<slug>', () => {
    const bundle = fixtureBundle({
      barriers: [{ id: 'B-002', title: 'Automated Filter & Parser Threshold' } as never],
    });
    const result = buildIdMapping(bundle);
    expect(result.mappings).toEqual([
      { oldId: 'B-002', newId: 'bar.automated_filter_parser_threshold', type: 'barrier', title: 'Automated Filter & Parser Threshold' },
    ]);
    expect(result.collisions).toEqual([]);
  });

  it('maps every collection using its own type prefix', () => {
    const bundle = fixtureBundle({
      observations: [{ id: 'A-002', title: 'Generic rejection' } as never],
      mechanisms: [{ id: 'M-005', title: 'Pre-Selected Internal Candidate' } as never],
      evidence: [{ id: 'EVD-001', title: 'Hidden Workers' } as never],
    });
    const result = buildIdMapping(bundle);
    const byOld = Object.fromEntries(result.mappings.map((m) => [m.oldId, m.newId]));
    expect(byOld['A-002']).toBe('obs.generic_rejection');
    expect(byOld['M-005']).toBe('mech.pre_selected_internal_candidate');
    expect(byOld['EVD-001']).toBe('evidence.hidden_workers');
  });

  it('detects a collision when two entities of the same type slugify identically', () => {
    const bundle = fixtureBundle({
      patterns: [
        { id: 'P-001', title: 'Seniority Double Bind' } as never,
        { id: 'P-099', title: 'seniority   double bind!!' } as never,
      ],
    });
    const result = buildIdMapping(bundle);
    expect(result.collisions).toEqual([
      { type: 'pattern', slug: 'seniority_double_bind', entities: ['P-001', 'P-099'] },
    ]);
  });

  it('does not flag a collision across different types even with the same slug', () => {
    const bundle = fixtureBundle({
      barriers: [{ id: 'B-001', title: 'Shared Name' } as never],
      mechanisms: [{ id: 'M-001', title: 'Shared Name' } as never],
    });
    const result = buildIdMapping(bundle);
    expect(result.collisions).toEqual([]);
  });
});

describe('buildIdMapping against the real registry', () => {
  it('produces zero collisions across all current content', () => {
    const root = resolveRegistryRoot();
    const bundle = loadRegistryFromRoot(root, 'en');
    const result = buildIdMapping(bundle);

    if (result.collisions.length > 0) {
      const report = result.collisions
        .map((c) => `  [${c.type}] "${c.slug}" shared by: ${c.entities.join(', ')}`)
        .join('\n');
      throw new Error(`${result.collisions.length} title collision(s) found:\n${report}`);
    }

    expect(result.collisions).toEqual([]);
  });

  it('maps every entity in the real registry exactly once', () => {
    const root = resolveRegistryRoot();
    const bundle = loadRegistryFromRoot(root, 'en');
    const result = buildIdMapping(bundle);

    const expectedCount =
      bundle.observations.length +
      bundle.barriers.length +
      bundle.mechanisms.length +
      bundle.patterns.length +
      bundle.loops.length +
      bundle.interventions.length +
      bundle.workflows.length +
      bundle.actors.length +
      bundle.eras.length +
      bundle.records.length +
      bundle.evidence.length;

    expect(result.mappings).toHaveLength(expectedCount);
    expect(new Set(result.mappings.map((m) => m.newId)).size).toBe(expectedCount);
  });
});

describe('applyIdRename', () => {
  it('replaces the quoted old ID with the quoted new ID in every file that contains it', () => {
    const root = writeTempRegistry({
      'content/patterns/P-001.md': '---\nid: "P-001"\ntype: "pattern"\nrequired_artifacts:\n  - "A-002"\n---\n\n# Body\n',
      'content/interventions/I-002.md': '---\nid: "I-002"\ntype: "intervention"\ntargets:\n  - "P-001"\n  - "B-002"\n---\n',
      'content-uk/patterns/P-001.md': '---\nid: "P-001"\ntype: "pattern"\n---\n\n# Тіло\n',
      'evidence/EVD-001.md': '---\nid: "EVD-001"\ntype: "evidence"\n---\n',
    });

    const result = applyIdRename(root, 'P-001', 'pat.seniority_double_bind');

    expect(result).toEqual({
      oldId: 'P-001',
      newId: 'pat.seniority_double_bind',
      filesChanged: expect.arrayContaining([
        'content/patterns/P-001.md',
        'content/interventions/I-002.md',
        'content-uk/patterns/P-001.md',
      ]),
    });
    expect(result.filesChanged).toHaveLength(3);

    const pattern = fs.readFileSync(`${root}/content/patterns/P-001.md`, 'utf8');
    expect(pattern).toContain('id: "pat.seniority_double_bind"');
    expect(pattern).not.toContain('"P-001"');

    const intervention = fs.readFileSync(`${root}/content/interventions/I-002.md`, 'utf8');
    expect(intervention).toContain('- "pat.seniority_double_bind"');
    expect(intervention).toContain('- "B-002"'); // untouched, different ID

    const uk = fs.readFileSync(`${root}/content-uk/patterns/P-001.md`, 'utf8');
    expect(uk).toContain('id: "pat.seniority_double_bind"');
  });

  it('does not touch a file that only contains an unrelated ID', () => {
    const root = writeTempRegistry({
      'content/patterns/P-002.md': '---\nid: "P-002"\ntype: "pattern"\n---\n',
    });
    const result = applyIdRename(root, 'P-001', 'pat.seniority_double_bind');
    expect(result.filesChanged).toEqual([]);
    expect(fs.readFileSync(`${root}/content/patterns/P-002.md`, 'utf8')).toContain('"P-002"');
  });

  it('does not match a substring of a longer ID', () => {
    const root = writeTempRegistry({
      'content/patterns/P-001.md': '---\nid: "P-001"\ntype: "pattern"\n---\n',
      'content/patterns/P-0010.md': '---\nid: "P-0010"\ntype: "pattern"\n---\n',
    });
    const result = applyIdRename(root, 'P-001', 'pat.seniority_double_bind');
    expect(result.filesChanged).toEqual(['content/patterns/P-001.md']);
    expect(fs.readFileSync(`${root}/content/patterns/P-0010.md`, 'utf8')).toContain('"P-0010"');
  });
});

describe('applyActorIdRename', () => {
  it('rewrites only the fields the schema types as actorId, leaving the other two vocabularies alone', () => {
    const root = writeTempRegistry({
      // A mechanism carries both: a facet actor (actorTypeSchema, 2-space) and
      // perspective actors (actorId, 4-space). Only the second is an entity ref.
      'content/mechanisms/mech.x.md':
        '---\nid: "mech.x"\ntype: "mechanism"\nfacets:\n  actor: "recruiter"\n' +
        'perspectives:\n  -\n    actor: "recruiter"\n    sees: "..."\n---\n',
      // An intervention's own `actor` is interventionActorSchema, at 0 indent.
      'content/interventions/int.y.md':
        '---\nid: "int.y"\ntype: "intervention"\nactor: "recruiter"\n' +
        'perspectives:\n  -\n    actor: "recruiter"\n---\n',
      // A workflow owner and a record owner_actor are both actorId.
      'content/workflows/proc.z.md':
        '---\nid: "proc.z"\ntype: "workflow"\nstates:\n  -\n    id: "s"\n    owner: "recruiter"\n---\n',
      'content/records/record.w.md':
        '---\nid: "record.w"\ntype: "record"\nowner_actor: "recruiter"\n---\n',
      // The actor itself: its own id renames, its alias vocabularies do not.
      'content/actors/recruiter.md':
        '---\nid: "recruiter"\ntype: "actor"\naliases:\n  facet:\n    - "recruiter"\n' +
        '  intervention:\n    - "recruiter-process"\n---\n',
    });

    applyActorIdRename(root, 'recruiter', 'actor.recruiter');

    const mech = fs.readFileSync(`${root}/content/mechanisms/mech.x.md`, 'utf8');
    expect(mech).toContain('  actor: "recruiter"\n'); // facet, untouched
    expect(mech).toContain('    actor: "actor.recruiter"'); // perspective, renamed

    const intervention = fs.readFileSync(`${root}/content/interventions/int.y.md`, 'utf8');
    expect(intervention).toContain('\nactor: "recruiter"'); // intervention vocabulary, untouched
    expect(intervention).toContain('    actor: "actor.recruiter"');

    expect(fs.readFileSync(`${root}/content/workflows/proc.z.md`, 'utf8')).toContain('    owner: "actor.recruiter"');
    expect(fs.readFileSync(`${root}/content/records/record.w.md`, 'utf8')).toContain('owner_actor: "actor.recruiter"');

    const actor = fs.readFileSync(`${root}/content/actors/recruiter.md`, 'utf8');
    expect(actor).toContain('id: "actor.recruiter"');
    expect(actor).toContain('    - "recruiter"'); // aliases.facet, untouched
    expect(actor).toContain('    - "recruiter-process"');
  });

  it('does not touch a different actor that shares a prefix', () => {
    const root = writeTempRegistry({
      'content/mechanisms/mech.x.md':
        '---\nid: "mech.x"\ntype: "mechanism"\nperspectives:\n  -\n    actor: "public-policy"\n---\n',
    });
    applyActorIdRename(root, 'policy', 'actor.policy');
    expect(fs.readFileSync(`${root}/content/mechanisms/mech.x.md`, 'utf8')).toContain('    actor: "public-policy"');
  });
});

describe('planFileRename', () => {
  it('plans a rename for every language tree where the old file exists', () => {
    const root = writeTempRegistry({
      'content/patterns/P-001.md': '---\nid: "P-001"\n---\n',
      'content-uk/patterns/P-001.md': '---\nid: "P-001"\n---\n',
    });
    const plans = planFileRename(root, 'patterns', 'P-001', 'pat.seniority_double_bind');
    expect(plans).toEqual([
      { oldPath: `${root}/content/patterns/P-001.md`, newPath: `${root}/content/patterns/pat.seniority_double_bind.md` },
      { oldPath: `${root}/content-uk/patterns/P-001.md`, newPath: `${root}/content-uk/patterns/pat.seniority_double_bind.md` },
    ]);
  });

  it('plans a rename in a single language-neutral tree at the repository root', () => {
    // Evidence is one tree at the root, not a pair of language mirrors: a
    // citation is the same document in either language.
    const root = writeTempRegistry({
      'evidence/EVD-001.md': '---\nid: "EVD-001"\ntype: "evidence"\n---\n',
    });
    const plans = planFileRename(root, 'evidence', 'EVD-001', 'evidence.hidden_workers', ['']);
    expect(plans).toEqual([
      { oldPath: `${root}/evidence/EVD-001.md`, newPath: `${root}/evidence/evidence.hidden_workers.md` },
    ]);
  });

  it('leaves the language-mirror trees as the default when no trees are named', () => {
    const root = writeTempRegistry({
      'evidence/EVD-001.md': '---\nid: "EVD-001"\n---\n',
    });
    expect(planFileRename(root, 'evidence', 'EVD-001', 'evidence.hidden_workers')).toEqual([]);
  });

  it('skips a language tree where the old file does not exist', () => {
    const root = writeTempRegistry({
      'content/actors/candidate.md': '---\nid: "candidate"\n---\n',
    });
    const plans = planFileRename(root, 'actors', 'candidate', 'actor.candidate');
    expect(plans).toHaveLength(1);
    expect(plans[0].oldPath).toBe(`${root}/content/actors/candidate.md`);
  });
});

describe('insertAlias', () => {
  it('inserts an aliases block immediately after the type: line', () => {
    const root = writeTempRegistry({
      'content/patterns/pat.seniority_double_bind.md': '---\nid: "pat.seniority_double_bind"\ntype: "pattern"\nsummary: "..."\n---\n\n# Body\n',
    });
    const filePath = `${root}/content/patterns/pat.seniority_double_bind.md`;
    insertAlias(filePath, 'P-001');
    const text = fs.readFileSync(filePath, 'utf8');
    expect(text).toBe(
      '---\nid: "pat.seniority_double_bind"\ntype: "pattern"\naliases:\n  - "P-001"\nsummary: "..."\n---\n\n# Body\n'
    );
  });

  it('throws a clear error when the file has no type: line to anchor on', () => {
    const root = writeTempRegistry({
      'content/patterns/broken.md': '---\nid: "x"\n---\n',
    });
    expect(() => insertAlias(`${root}/content/patterns/broken.md`, 'P-001')).toThrow(/no "type:" line/);
  });

  it('throws a clear error when the file already has an aliases: field', () => {
    const root = writeTempRegistry({
      'content/actors/hiring-manager.md':
        '---\nid: "actor.hiring_manager"\ntype: "actor"\naliases:\n  facet:\n    - "hiring-manager"\n---\n\n# Body\n',
    });
    const filePath = `${root}/content/actors/hiring-manager.md`;
    expect(() => insertAlias(filePath, 'H-001')).toThrow(/already has an "aliases:" field/);
    // Verify the file was not modified
    const text = fs.readFileSync(filePath, 'utf8');
    expect(text).toBe(
      '---\nid: "actor.hiring_manager"\ntype: "actor"\naliases:\n  facet:\n    - "hiring-manager"\n---\n\n# Body\n'
    );
  });
});
