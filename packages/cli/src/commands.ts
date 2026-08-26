import fs from 'node:fs';
import path from 'node:path';
import pc from 'picocolors';
import {
  HOBADiagnosticEngine,
  HOBAKnowledgeGraph,
  loadRegistryFromDirectory,
  validateRegistryBundle,
} from '@hoba/registry';

export function resolveRegistryBundle(dirOption?: string) {
  const root = dirOption ? path.resolve(dirOption) : process.cwd();
  let contentDir = path.join(root, 'content');
  let evidenceDir = path.join(root, 'evidence');

  if (!fs.existsSync(contentDir)) {
    // Check if we are inside packages/cli or site
    contentDir = path.resolve(root, '..', '..', 'content');
    evidenceDir = path.resolve(root, '..', '..', 'evidence');
  }

  if (!fs.existsSync(contentDir)) {
    throw new Error(`Could not locate /content directory from ${root}. Please specify --dir <path>`);
  }

  return loadRegistryFromDirectory(contentDir, evidenceDir);
}

export function cmdSearch(query: string, options: { dir?: string }) {
  const bundle = resolveRegistryBundle(options.dir);
  const q = query.toLowerCase();

  console.log(pc.bold(pc.cyan(`\nSearching HOBA Registry for: "${query}"...\n`)));

  const results: { type: string; id: string; title: string; summary: string }[] = [];

  for (const a of bundle.artifacts) {
    if (a.id.toLowerCase().includes(q) || a.title.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q)) {
      results.push({ type: 'Observation (A)', id: a.id, title: a.title, summary: a.summary });
    }
  }
  for (const b of bundle.barriers) {
    if (b.id.toLowerCase().includes(q) || b.title.toLowerCase().includes(q) || b.description.toLowerCase().includes(q)) {
      results.push({ type: 'Barrier (B)', id: b.id, title: b.title, summary: b.description });
    }
  }
  for (const m of bundle.mechanisms) {
    if (m.id.toLowerCase().includes(q) || m.title.toLowerCase().includes(q) || m.summary.toLowerCase().includes(q)) {
      results.push({ type: 'Mechanism (M)', id: m.id, title: m.title, summary: m.summary });
    }
  }
  for (const p of bundle.patterns) {
    if (p.id.toLowerCase().includes(q) || p.title.toLowerCase().includes(q) || p.summary.toLowerCase().includes(q)) {
      results.push({ type: 'Pattern (P)', id: p.id, title: p.title, summary: p.summary });
    }
  }
  for (const l of bundle.loops) {
    if (l.id.toLowerCase().includes(q) || l.title.toLowerCase().includes(q) || l.summary.toLowerCase().includes(q)) {
      results.push({ type: 'Loop (L)', id: l.id, title: l.title, summary: l.summary });
    }
  }
  for (const i of bundle.interventions) {
    if (i.id.toLowerCase().includes(q) || i.title.toLowerCase().includes(q) || i.summary.toLowerCase().includes(q)) {
      results.push({ type: 'Intervention (I)', id: i.id, title: i.title, summary: i.summary });
    }
  }

  if (results.length === 0) {
    console.log(pc.yellow('No matching registry entities found.'));
    return;
  }

  for (const r of results) {
    console.log(`[${pc.magenta(r.type)}] ${pc.green(r.id)}: ${pc.bold(r.title)}`);
    console.log(`  ${pc.dim(r.summary.slice(0, 120))}${r.summary.length > 120 ? '...' : ''}\n`);
  }
}

export function cmdShow(id: string, options: { dir?: string }) {
  const bundle = resolveRegistryBundle(options.dir);
  const graph = new HOBAKnowledgeGraph(bundle);
  const node = graph.getNode(id);

  if (!node) {
    console.error(pc.red(`Error: Entity with ID "${id}" not found in registry.`));
    process.exit(1);
  }

  console.log(pc.bold(pc.cyan(`\n=== [${node.type.toUpperCase()}] ${node.id} ===`)));
  console.log(pc.bold(node.title));
  console.log(`Status: ${node.status} | Evidence: ${node.evidence_level}\n`);

  if ('summary' in node) {
    console.log(pc.yellow('Summary:'));
    console.log(`  ${node.summary}\n`);
  }

  if (node.type === 'barrier') {
    console.log(pc.yellow('Stage:'), node.stage);
    console.log(pc.yellow('Pass Condition:'), node.pass_condition);
    console.log(pc.yellow('Precedes:'), node.precedes.join(', ') || 'none (terminal)');
  } else if (node.type === 'mechanism') {
    console.log(pc.yellow('Facets:'));
    console.log(`  Actor: ${node.facets.actor} | Nature: ${node.facets.nature} | Visibility: ${node.facets.visibility} | Removability: ${pc.bold(node.facets.removability)}`);
    console.log(pc.yellow('Operates At:'), node.operates_at.join(', '));
    console.log(pc.yellow('Emissions:'), node.emissions.map((e) => `${e.artifact} (${e.fidelity || 'direct'})`).join(', '));
    console.log(pc.yellow('Amplifies:'), node.amplifies.join(', ') || 'none');
    console.log(pc.yellow('Masks:'), node.masks.join(', ') || 'none');
  } else if (node.type === 'artifact') {
    console.log(pc.yellow('Stages:'), node.stages.join(', '));
    if (node.probes && node.probes.length > 0) {
      console.log(pc.yellow('Diagnostic Probes:'));
      for (const p of node.probes) {
        console.log(`  - [${p.id}] ${p.action} (Cost: ${p.cost})`);
      }
    }
  }

  if ('non_inferences' in node && node.non_inferences.length > 0) {
    console.log(pc.yellow('\nNon-Inferences (What this does NOT establish):'));
    for (const ni of node.non_inferences) {
      console.log(`  - ${pc.dim(ni)}`);
    }
  }
  console.log();
}

export function cmdExplain(artifactId: string, options: { stage?: string; dir?: string }) {
  const bundle = resolveRegistryBundle(options.dir);
  const engine = new HOBADiagnosticEngine(bundle);

  const res = engine.analyze({
    artifacts: [artifactId],
    stage: options.stage as any,
  });

  console.log(pc.bold(pc.cyan('\n=== HOBA Forensic Diagnostic Analysis ===\n')));
  console.log(pc.bold('H — Hard Facts:'));
  for (const a of res.hard_facts.selected_artifacts) {
    console.log(`  - [${a.id}] ${a.title}`);
  }
  if (res.hard_facts.stage) {
    console.log(`  - Confirmed Stage: ${res.hard_facts.stage}`);
  }

  console.log(pc.bold('\nO — Obstacle (Localized Barriers):'));
  for (const b of res.obstacle.identified_barriers) {
    console.log(`  - [${b.id}] ${b.title} (${b.stage})`);
  }

  console.log(pc.bold('\nB — Behind the Obstacle (Compatible Mechanisms):'));
  for (const item of res.behind.compatible_mechanisms) {
    const baselineTag = item.honest_baseline ? pc.green(' [HONEST BASELINE]') : '';
    const removabilityTag =
      item.removability === 'candidate'
        ? pc.green(' [CANDIDATE AGENCY]')
        : item.removability === 'intermediary'
        ? pc.yellow(' [INTERMEDIARY]')
        : pc.red(' [NO AGENCY]');
    console.log(`  - [${item.mechanism.id}] ${item.mechanism.title}${baselineTag}${removabilityTag}`);
  }

  console.log(pc.bold('\nA — Agency & Diagnostic Probes:'));
  console.log(`  Zone: ${pc.bold(res.agency.agency_zone.toUpperCase())}`);
  console.log(`  Summary: ${res.agency.probes_summary}`);
  for (const p of res.agency.diagnostic_probes) {
    console.log(`  - Action: ${p.action}`);
    console.log(`    Expected Signal: ${pc.dim(p.expected_signal)} (Cost: ${p.cost})`);
  }

  console.log(pc.dim(`\nDisclaimer: ${res.epistemic_disclaimer}\n`));
}
