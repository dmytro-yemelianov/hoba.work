import pc from 'picocolors';
import {
  compareBundleStructure,
  EMPIRICAL_SCENARIOS,
  evaluatePatternEmptiness,
  formatValidationIssue,
  HOBADiagnosticEngine,
  HOBAKnowledgeGraph,
  loadScenarios,
  lift,
  loadRegistryFromRoot,
  resolveRegistryRoot,
  searchBundle,
  stageIdSchema,
  substrateCalculateRunway,
  substrateDetectTemporalAnomalies,
  substrateVerifyFlowConservation,
  validateRegistry,
  type ContentLang,
  type ProbeResult,
  type RegistryBundle,
  type SearchableType,
  type StageId,
} from '@hoba/registry';

export interface GlobalOptions {
  dir?: string;
  json?: boolean;
}

export class CliError extends Error {}

/** Resolve the registry root (explicit --dir → HOBA_ROOT → cwd → CLI install location) and load a bundle. */
export function loadBundle(options: GlobalOptions, lang: ContentLang = 'en'): { root: string; bundle: RegistryBundle } {
  const root = resolveRegistryRoot({ explicit: options.dir, fromModuleUrl: import.meta.url });
  return { root, bundle: loadRegistryFromRoot(root, lang) };
}

export function parseStage(value: string | undefined): StageId | undefined {
  if (value === undefined) return undefined;
  const parsed = stageIdSchema.safeParse(value);
  if (!parsed.success) {
    throw new CliError(`Unknown stage "${value}". Expected one of: ${stageIdSchema.options.join(', ')}`);
  }
  return parsed.data;
}

const printJson = (value: unknown) => console.log(JSON.stringify(value, null, 2));

const TYPE_LABELS: Record<SearchableType, string> = {
  artifact: 'Observation (A)',
  barrier: 'Barrier (B)',
  mechanism: 'Mechanism (M)',
  pattern: 'Pattern (P)',
  loop: 'Loop (L)',
  intervention: 'Intervention (I)',
  record: 'Financial Record (R)',
};

export function cmdSearch(query: string, options: GlobalOptions & { types?: string }) {
  const { bundle } = loadBundle(options);
  const types = options.types
    ?.split(',')
    .map((t) => t.trim())
    .filter((t): t is SearchableType => t in TYPE_LABELS);
  const hits = searchBundle(bundle, query, { types: types?.length ? types : undefined });

  if (options.json) {
    printJson({
      registry_version: bundle.version,
      count: hits.length,
      results: hits.map(({ type, id, title, text }) => ({ type, id, title, summary: text })),
    });
    return;
  }

  console.log(pc.bold(pc.cyan(`\nSearching hoba Registry (${bundle.version}) for: "${query}"...\n`)));
  if (hits.length === 0) {
    console.log(pc.yellow('No matching registry entities found.'));
    return;
  }
  for (const r of hits) {
    console.log(`[${pc.magenta(TYPE_LABELS[r.type])}] ${pc.green(r.id)}: ${pc.bold(r.title)}`);
    console.log(`  ${pc.dim(r.text.slice(0, 120))}${r.text.length > 120 ? '...' : ''}\n`);
  }
}

export function cmdShow(id: string, options: GlobalOptions) {
  const { bundle } = loadBundle(options);
  const graph = new HOBAKnowledgeGraph(bundle);
  const node = graph.getNode(id);

  if (!node) throw new CliError(`Entity with ID "${id}" not found in registry.`);

  if (options.json) {
    printJson({ registry_version: bundle.version, node });
    return;
  }

  console.log(pc.bold(pc.cyan(`\n=== [${node.type.toUpperCase()}] ${node.id} ===`)));
  console.log(pc.bold(node.title));

  if (node.type === 'evidence') {
    console.log(`Kind: ${node.kind}${node.period ? ` | Period: ${node.period}` : ''}\n`);
    console.log(pc.yellow('Summary:'));
    console.log(`  ${node.summary}`);
    if (node.citation) console.log(pc.yellow('Citation:'), node.citation);
    if (node.url) console.log(pc.yellow('URL:'), node.url);
    console.log();
    return;
  }

  console.log(`Status: ${node.status} | Evidence: ${node.evidence_level}\n`);

  if ('summary' in node) {
    console.log(pc.yellow('Summary:'));
    console.log(`  ${node.summary}\n`);
  }

  switch (node.type) {
    case 'barrier':
      console.log(pc.yellow('Stage:'), node.stage, pc.dim(`(funnel order #${node.order})`));
      console.log(pc.yellow('Description:'), node.description);
      console.log(pc.yellow('Pass Condition:'), node.pass_condition);
      console.log(pc.yellow('Precedes:'), node.precedes.join(', ') || 'none (terminal)');
      break;
    case 'mechanism':
      console.log(pc.yellow('Facets:'));
      console.log(
        `  Actor: ${node.facets.actor} | Nature: ${node.facets.nature} | Visibility: ${node.facets.visibility} | Removability: ${pc.bold(node.facets.removability)}`
      );
      if (node.honest_baseline) console.log(pc.green('  Honest baseline mechanism'));
      console.log(pc.yellow('Operates At:'), node.operates_at.join(', '));
      console.log(pc.yellow('Emissions:'), node.emissions.map((e) => `${e.artifact} (${e.fidelity ?? 'unspecified'})`).join(', ') || 'none');
      console.log(pc.yellow('Amplifies:'), node.amplifies.join(', ') || 'none');
      console.log(pc.yellow('Masks:'), node.masks.join(', ') || 'none');
      break;
    case 'artifact':
      console.log(pc.yellow('Stages:'), node.stages.join(', '));
      if (node.probes.length > 0) {
        console.log(pc.yellow('Diagnostic Probes:'));
        for (const p of node.probes) console.log(`  - [${p.id}] ${p.action} (Cost: ${p.cost})`);
      }
      break;
    case 'pattern':
      console.log(pc.yellow('Trigger Rule:'), node.trigger_rule);
      console.log(pc.yellow('Required Artifacts:'), node.required_artifacts.join(', '));
      console.log(pc.yellow('Compatible Mechanisms:'), node.compatible_mechanisms.join(', '));
      console.log(pc.yellow('Interventions:'), node.interventions.join(', ') || 'none');
      break;
    case 'loop':
      console.log(pc.yellow('Mechanisms:'), node.mechanisms.join(', '));
      console.log(pc.yellow('Edges:'));
      for (const e of node.edges) console.log(`  - ${e.from} ${e.relation} ${e.to}`);
      console.log(pc.yellow('Entry Points:'), node.entry_points.join(', '));
      break;
    case 'intervention':
      console.log(pc.yellow('Actor:'), node.actor, '|', pc.yellow('Scope:'), node.scope, '|', pc.yellow('Cost:'), node.cost);
      console.log(pc.yellow('Targets:'), node.targets.join(', '));
      console.log(pc.yellow('Expected Effects:'));
      for (const e of node.expected_effects) console.log(`  - ${e}`);
      console.log(pc.yellow('Measurements:'), node.measurements.join(', '));
      break;
  }

  if ('non_inferences' in node && node.non_inferences.length > 0) {
    console.log(pc.yellow('\nNon-Inferences (What this does NOT establish):'));
    for (const ni of node.non_inferences) console.log(`  - ${pc.dim(ni)}`);
  }
  console.log();
}

/** `PROBE-A-001-1:found` — the id and the outcome the probe came back with. */
function parseProbeResults(values: string[] | undefined): ProbeResult[] {
  return (values ?? []).map((value) => {
    const at = value.lastIndexOf(':');
    if (at <= 0 || at === value.length - 1) {
      throw new CliError(`Bad --probe "${value}" (expected PROBE-ID:outcome)`);
    }
    return { probe: value.slice(0, at), outcome: value.slice(at + 1) };
  });
}

export function cmdExplain(
  artifactIds: string[],
  options: GlobalOptions & { stage?: string; scenario?: string; probe?: string[] }
) {
  let effectiveArtifacts = [...artifactIds];
  let effectiveStage = options.stage;

  if (options.scenario) {
    const found = EMPIRICAL_SCENARIOS.find((s) => s.id === options.scenario);
    if (!found) {
      const valid = EMPIRICAL_SCENARIOS.map((s) => s.id).join(', ');
      throw new CliError(`Unknown scenario "${options.scenario}". Available scenarios: ${valid}`);
    }
    if (effectiveArtifacts.length === 0) {
      effectiveArtifacts = [...found.artifacts];
    }
    if (!effectiveStage && found.stage) {
      effectiveStage = found.stage;
    }
  }

  if (effectiveArtifacts.length === 0) {
    const list = EMPIRICAL_SCENARIOS.map((s) => `  - ${s.id}: ${s.title} (${s.artifacts.join(', ')})`).join('\n');
    throw new CliError(`No artifact IDs or scenario provided. Specify artifact IDs (e.g. A-001 A-004) or a scenario (--scenario <name>).\n\nAvailable empirical scenarios:\n${list}`);
  }

  const { bundle } = loadBundle(options);
  const engine = new HOBADiagnosticEngine(bundle);
  const res = engine.analyze({
    artifacts: effectiveArtifacts,
    stage: parseStage(effectiveStage),
    probe_results: parseProbeResults(options.probe),
  });

  if (options.json) {
    printJson({
      registry_version: bundle.version,
      scenario: options.scenario ?? null,
      analysis: res,
    });
    return;
  }

  console.log(pc.bold(pc.cyan('\n=== hoba Forensic Diagnostic Analysis ===\n')));
  if (options.scenario) {
    const sc = EMPIRICAL_SCENARIOS.find((s) => s.id === options.scenario);
    if (sc) console.log(pc.magenta(`Empirical Scenario: ${sc.title} (${sc.id})\n`));
  }
  if (res.hard_facts.unknown_artifact_ids.length > 0) {
    console.log(pc.yellow(`Warning: unknown or inactive artifact ID(s) ignored: ${res.hard_facts.unknown_artifact_ids.join(', ')}\n`));
  }

  console.log(pc.bold('H — Hard Facts:'));
  for (const a of res.hard_facts.selected_artifacts) console.log(`  - [${a.id}] ${a.title}`);
  if (res.hard_facts.stage) console.log(`  - Confirmed Stage: ${res.hard_facts.stage}`);

  console.log(pc.bold('\nO — Obstacle (Localized Barriers):'));
  if (res.obstacle.identified_barriers.length === 0) console.log(pc.dim('  (none localized)'));
  for (const b of res.obstacle.identified_barriers) console.log(`  - [${b.id}] ${b.title} (${b.stage})`);

  console.log(pc.bold('\nB — Behind the Obstacle (Compatible Mechanisms):'));
  if (res.behind.compatible_mechanisms.length === 0) console.log(pc.dim('  (none)'));
  for (const item of res.behind.compatible_mechanisms) {
    const baselineTag = item.honest_baseline ? pc.green(' [HONEST BASELINE]') : '';
    const removabilityTag =
      item.removability === 'candidate'
        ? pc.green(' [CANDIDATE AGENCY]')
        : item.removability === 'intermediary'
          ? pc.yellow(' [INTERMEDIARY]')
          : pc.red(' [NO AGENCY]');
    const emitsTag = item.emitted_by_evidence ? pc.dim(' (emits observed signal)') : '';
    console.log(`  - [${item.mechanism.id}] ${item.mechanism.title}${baselineTag}${removabilityTag}${emitsTag}`);
  }
  if (res.behind.related_patterns.length > 0) {
    console.log(pc.bold('\n  Related Patterns:'));
    for (const p of res.behind.related_patterns) console.log(`  - [${p.id}] ${p.title}`);
  }
  if (res.behind.related_loops.length > 0) {
    console.log(pc.bold('\n  Related Causal Loops:'));
    for (const l of res.behind.related_loops) console.log(`  - [${l.id}] ${l.title}`);
  }
  if (res.behind.non_inferences.length > 0) {
    console.log(pc.bold('\n  Non-Inferences:'));
    for (const ni of res.behind.non_inferences) console.log(`  - ${pc.dim(ni)}`);
  }

  console.log(pc.bold('\nA — Agency & Diagnostic Probes:'));
  console.log(`  Verdict: ${pc.bold(res.verdict)} | Zone: ${pc.bold(res.agency.agency_zone.toUpperCase())}`);
  console.log(`  Summary: ${res.agency.probes_summary}`);
  for (const p of res.agency.diagnostic_probes) {
    console.log(`  - [${p.id}] ${p.action}`);
    console.log(`    Expected Signal: ${pc.dim(p.expected_signal)} (Cost: ${p.cost})`);
    for (const o of p.outcomes) {
      const effect = o.excludes.length > 0 ? pc.green(`rules out ${o.excludes.join(', ')}`) : pc.dim('rules nothing out');
      console.log(`      · ${o.id}: ${o.label} — ${effect}`);
    }
  }

  const { narrowing, separation } = res.behind;
  if (narrowing.steps.length > 0) {
    console.log(pc.bold('\n  Narrowing (probe results applied in order):'));
    console.log(`  ${res.behind.compatible_before_probes.length} compatible before any probe`);
    for (const step of narrowing.steps) {
      const removed = step.eliminated.length > 0 ? `−${step.eliminated.join(', ')}` : pc.dim('nothing ruled out');
      console.log(`  - [${step.probe}/${step.outcome}] ${removed} → ${step.remaining} remaining`);
      if (step.because) console.log(`    ${pc.dim(step.because)}`);
    }
  }
  for (const u of narrowing.unknown) console.log(pc.yellow(`  ! unknown probe result: ${u.probe}/${u.outcome}`));

  // The useful half: what no probe here can settle.
  if (separation.minimal_probes.length > 0) {
    console.log(
      pc.bold('\n  Smallest probe set that settles everything settleable: ') +
        separation.minimal_probes.join(', ') +
        (separation.exact ? '' : pc.dim(' (approximate: too many probes to search exactly)'))
    );
  }
  if (separation.minimal_probes.length === 0 && res.agency.diagnostic_probes.length > 0) {
    console.log(
      pc.bold('\n  No probe here narrows the cause.') +
        ' They are worth running for the record they produce — a date, a document, a written answer.'
    );
  }
  if (separation.indistinguishable_groups.length > 0) {
    console.log(pc.bold('\n  No available probe can tell these apart:'));
    for (const g of separation.indistinguishable_groups) console.log(`  - ${g.join(' / ')}`);
    console.log(pc.dim('  Running every probe here would not decide between them.'));
  }

  console.log(pc.dim(`\nDisclaimer: ${res.epistemic_disclaimer}\n`));
}

export function cmdValidate(options: GlobalOptions & { strict?: boolean; lang?: string }): number {
  const root = resolveRegistryRoot({ explicit: options.dir, fromModuleUrl: import.meta.url });
  const langs: ContentLang[] = options.lang === 'all' || !options.lang ? ['en', 'uk'] : [options.lang as ContentLang];
  if (!langs.every((l) => l === 'en' || l === 'uk')) throw new CliError(`Unknown --lang "${options.lang}" (expected en, uk or all)`);

  const canonical = loadRegistryFromRoot(root, 'en');
  let errorCount = 0;
  let warningCount = 0;

  for (const lang of langs) {
    const bundle = lang === 'en' ? canonical : loadRegistryFromRoot(root, lang);
    const report = validateRegistry(bundle);
    const issues = lang === 'en' ? report.issues : [...report.issues, ...compareBundleStructure(canonical, bundle)];
    const errors = issues.filter((i) => i.severity === 'error');
    const warnings = issues.filter((i) => i.severity === 'warning');
    errorCount += errors.length;
    warningCount += warnings.length;

    console.log(pc.bold(pc.cyan(`\n--- ${lang.toUpperCase()} content (${bundle.version}) ---`)));
    for (const issue of errors) console.log(pc.red(formatValidationIssue(issue)));
    for (const issue of warnings) console.log(pc.yellow(formatValidationIssue(issue)));
    if (issues.length === 0) console.log(pc.green('✓ No issues'));
  }

  console.log(`\n${errorCount} error(s), ${warningCount} warning(s)`);
  if (errorCount > 0) return 1;
  if (options.strict && warningCount > 0) {
    console.log(pc.red('--strict: warnings are treated as errors'));
    return 1;
  }
  return 0;
}

export function cmdLatency(
  processId: string,
  stateId: string,
  daysStr: string,
  options: GlobalOptions
) {
  const days = Number(daysStr);
  if (isNaN(days) || days < 0) {
    throw new CliError(`Invalid days parameter "${daysStr}". Expected a non-negative number.`);
  }

  const { bundle } = loadBundle(options);
  const lifted = lift(bundle);
  const anomalies = substrateDetectTemporalAnomalies(lifted.substrate, processId, stateId, days);

  if (options.json) {
    printJson({
      registry_version: bundle.version,
      process: processId,
      state: stateId,
      actual_days: days,
      anomalies,
    });
    return;
  }

  console.log(pc.bold(pc.cyan(`\n=== hoba Temporal Dwell & Latency Analysis ===\n`)));
  console.log(`Workflow: ${pc.bold(processId.toUpperCase())} | State: ${pc.bold(stateId)} | Current Dwell: ${pc.bold(`${days} days`)}\n`);

  if (anomalies.length === 0) {
    console.log(pc.yellow(`No transitions found exiting from state "${stateId}" in workflow "${processId}".`));
    return;
  }

  for (const a of anomalies) {
    const statusColor =
      a.severity === 'stalled_anomalous'
        ? pc.red('[STALLED / ANOMALOUS]')
        : a.severity === 'delayed'
          ? pc.yellow('[DELAYED]')
          : pc.green('[NOMINAL]');

    console.log(`Transition: ${pc.bold(a.fromState)} → ${pc.bold(a.toState)} ${statusColor}`);
    console.log(`  Expected Latency: ${a.expectedDays} days | Max Bound: ${a.maxDays} days`);

    if (a.severity === 'stalled_anomalous') {
      console.log(
        pc.red(`  ! Dwell (${days}d) strictly exceeds nominal maximum bound (${a.maxDays}d).`)
      );
      if (a.implicatedMechanisms.length > 0) {
        console.log(
          `  Implicated Hidden Mechanisms: ${pc.magenta(a.implicatedMechanisms.join(', '))}`
        );
      }
    } else if (a.severity === 'delayed') {
      console.log(pc.yellow(`  * Dwell exceeds expected turnaround (${a.expectedDays}d) but sits within max bound.`));
    } else {
      console.log(pc.green(`  ✓ Dwell is well within nominal turnaround window.`));
    }
    console.log();
  }
}

export function cmdRunway(
  savingsStr: string,
  burnStr: string,
  options: GlobalOptions
) {
  const savings = Number(savingsStr);
  const burn = Number(burnStr);
  if (isNaN(savings) || isNaN(burn) || savings < 0 || burn <= 0) {
    throw new CliError('Invalid savings or monthly burn rate. Expected non-negative savings and positive burn.');
  }

  const calculus = substrateCalculateRunway(savings, burn);
  const { bundle } = loadBundle(options);

  if (options.json) {
    printJson({
      registry_version: bundle.version,
      ...calculus,
    });
    return;
  }

  console.log(pc.bold(pc.cyan(`\n=== hoba Candidate Economic Solvency & Runway Calculus ===\n`)));
  console.log(`Liquid Savings: ${savings.toLocaleString()} | Monthly Burn: ${burn.toLocaleString()}`);
  console.log(`Calculated Runway: ${pc.bold(`${calculus.runwayMonths.toFixed(1)} months`)}`);

  const statusLabel =
    calculus.riskStatus === 'solvent'
      ? pc.green('[SOLVENT]')
      : calculus.riskStatus === 'moderate_runway_stress'
        ? pc.yellow('[MODERATE RUNWAY STRESS]')
        : pc.red('[ACUTE EXHAUSTION VULNERABILITY]');

  console.log(`Solvency Status: ${statusLabel}\n`);
  console.log(pc.bold('Assessment:'));
  console.log(`  ${calculus.vulnerabilityNote}\n`);
}

export function cmdPatterns(options: GlobalOptions) {
  const { bundle } = loadBundle(options);
  const lifted = lift(bundle);
  const report = evaluatePatternEmptiness(lifted);

  if (options.json) {
    printJson({
      registry_version: bundle.version,
      ...report,
    });
    return;
  }

  console.log(pc.bold(pc.cyan(`\n=== hoba Formal Pattern Emptiness Evaluation (SPEC §5) ===\n`)));
  console.log(
    `Computed Empty Contradictions: ${pc.green(report.computedEmptyCount)} / ${report.patterns.length} (${pc.dim('Algebraically proven unsatisfiable')})\n`
  );

  for (const p of report.patterns) {
    const badge =
      p.status === 'computed_empty'
        ? pc.green('[COMPUTED EMPTY — PROVABLY UNSATISFIABLE]')
        : pc.yellow('[PROSE ASSERTED]');

    console.log(`[${pc.magenta(p.id)}] ${pc.bold(p.title)} ${badge}`);
    console.log(`  Trigger Rule: ${pc.dim(p.triggerRule)}`);
    console.log(`  Satisfying Set: ${pc.cyan(p.satisfyingSetDescription)}`);
    if (p.contradictionDetails) {
      console.log(`  Contradiction Proof: ${pc.dim(p.contradictionDetails)}`);
    }
    console.log(`  Compatible Mechanisms: ${p.compatibleMechanisms.join(', ') || 'none'}`);
    console.log();
  }
}

export function cmdConservation(options: GlobalOptions) {
  const { bundle } = loadBundle(options);
  const lifted = lift(bundle);
  const report = substrateVerifyFlowConservation(lifted.substrate);

  if (options.json) {
    printJson({
      registry_version: bundle.version,
      flow_count: lifted.substrate.flows.length,
      record_count: lifted.substrate.records.length,
      ...report,
    });
    return;
  }

  console.log(pc.bold(pc.cyan(`\n=== hoba Financial Flow Conservation Audit ===\n`)));
  console.log(`Total Records: ${lifted.substrate.records.length} | Total Flows: ${lifted.substrate.flows.length}`);

  if (report.isConserved) {
    console.log(pc.green('\n✓ 100% of authored financial flows satisfy non-divergent conservation.'));
    console.log(pc.dim('  No source record outward allocation exceeds 100.0%.'));
  } else {
    console.log(pc.red(`\n! Conservation violations detected (${report.violations.length}):`));
    for (const v of report.violations) {
      console.log(pc.red(`  - [${v.recordId}] ${v.reason}`));
    }
  }
  console.log();
}

/**
 * `hoba graph <id>` — what one entity is connected to, and how (design doc §11).
 *
 * `show` already prints an entity's own fields; this prints its edges, so the
 * two answer different questions rather than overlapping the way `show`/`get`
 * would have.
 */
export function cmdGraph(id: string, options: GlobalOptions & { depth?: string }) {
  const { bundle } = loadBundle(options);
  const graph = new HOBAKnowledgeGraph(bundle);
  const node = graph.getNode(id);
  if (!node) throw new CliError(`Entity with ID "${id}" not found in registry.`);

  const depth = Math.max(1, Number(options.depth ?? 1) || 1);
  const { nodes, edges } = graph.getNeighbors(node.id, { depth });
  const neighbours = edges.map((e) => ({
    relation: e.type,
    from: e.source,
    to: e.target,
    /** Which end of the edge is not the entity asked about. */
    other: e.source === node.id ? e.target : e.source,
    direction: e.source === node.id ? ('out' as const) : ('in' as const),
  }));

  if (options.json) {
    printJson({ registry_version: bundle.version, id: node.id, depth, neighbours, nodes: nodes.map((n) => n.id) });
    return;
  }

  console.log(pc.bold(pc.cyan(`\n=== ${node.id} — neighbourhood (depth ${depth}) ===`)));
  console.log(pc.bold(node.title) + `\n`);
  if (neighbours.length === 0) {
    console.log(pc.dim('  Nothing is connected to this entry.\n'));
    return;
  }
  for (const n of neighbours) {
    const arrow = n.direction === 'out' ? '->' : '<-';
    console.log(`  ${pc.dim(arrow)} ${pc.yellow(n.relation.padEnd(16))} ${n.other}`);
  }
  console.log(pc.dim(`\n  ${neighbours.length} edge(s), ${nodes.length} node(s) within ${depth} hop(s).\n`));
}

/**
 * `hoba scenario [id]` — read an authored scenario, or list what there is.
 *
 * A scenario composes ontology entities; it is not one, so it is read from its
 * own collection rather than through `show`.
 */
export function cmdScenario(id: string | undefined, options: GlobalOptions) {
  const { root, bundle } = loadBundle(options);
  const scenarios = loadScenarios(root);

  if (!id) {
    if (options.json) {
      printJson({ registry_version: bundle.version, count: scenarios.length, scenarios });
      return;
    }
    console.log(pc.bold(pc.cyan(`\n=== ${scenarios.length} scenario(s) ===\n`)));
    for (const s of scenarios) console.log(`  ${pc.yellow(s.id)}  ${s.title.en}`);
    console.log();
    return;
  }

  const found = scenarios.find((s) => s.id === id);
  if (!found) {
    const valid = scenarios.map((s) => s.id).join(', ') || '(none authored)';
    throw new CliError(`Unknown scenario "${id}". Available: ${valid}`);
  }

  if (options.json) {
    printJson({ registry_version: bundle.version, scenario: found });
    return;
  }

  const titleOf = (entityId: string) => new HOBAKnowledgeGraph(bundle).getNode(entityId)?.title ?? '';
  const list = (label: string, ids: string[]) => {
    if (!ids.length) return;
    console.log(pc.yellow(`${label}:`));
    for (const entityId of ids) console.log(`  - ${entityId}${titleOf(entityId) ? pc.dim(` — ${titleOf(entityId)}`) : ''}`);
    console.log();
  };

  console.log(pc.bold(pc.cyan(`\n=== [SCENARIO] ${found.id} ===`)));
  console.log(pc.bold(found.title.en) + `\n`);
  list('Observed', found.observations);
  list('Compatible mechanisms', found.compatible_mechanisms);
  list('Compatible barriers', found.compatible_barriers);
  list('Process states', found.process_states);
  if (found.excluded_claims.length) {
    console.log(pc.yellow('Does NOT establish:'));
    for (const c of found.excluded_claims) console.log(`  - ${c}`);
    console.log();
  }
  for (const [act, interventions] of Object.entries(found.agency)) list(`Agency — ${act}`, interventions);
}

/** `hoba registry stats|version` — what this registry is, in one place (§11). */
export function cmdRegistry(sub: string, options: GlobalOptions) {
  const { root, bundle } = loadBundle(options);

  if (sub === 'version') {
    if (options.json) {
      printJson({ registry_version: bundle.version, schema_version: bundle.schema_version, updated_at: bundle.updated_at });
      return;
    }
    // Plain form prints the version alone, so a script can consume it directly.
    console.log(bundle.version);
    return;
  }

  if (sub !== 'stats') throw new CliError(`Unknown "registry" subcommand "${sub}". Expected "stats" or "version".`);

  const counts = {
    artifacts: bundle.artifacts.length,
    barriers: bundle.barriers.length,
    mechanisms: bundle.mechanisms.length,
    patterns: bundle.patterns.length,
    loops: bundle.loops.length,
    interventions: bundle.interventions.length,
    workflows: bundle.workflows.length,
    actors: bundle.actors.length,
    eras: bundle.eras.length,
    records: bundle.records.length,
    evidence: bundle.evidence.length,
    scenarios: loadScenarios(root).length,
  };

  if (options.json) {
    printJson({ registry_version: bundle.version, schema_version: bundle.schema_version, counts });
    return;
  }

  console.log(pc.bold(pc.cyan(`\n=== hoba registry ${bundle.version} (schema ${bundle.schema_version}) ===\n`)));
  const width = Math.max(...Object.keys(counts).map((k) => k.length));
  for (const [k, v] of Object.entries(counts)) {
    console.log(`  ${k.padEnd(width)}  ${pc.bold(String(v).padStart(3))}`);
  }
  console.log();
}
