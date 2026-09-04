#!/usr/bin/env node
import { Command } from 'commander';
import pc from 'picocolors';
import { readPackageVersion, RegistryLoadError } from '@hoba/registry';
import {
  CliError,
  cmdConservation,
  cmdExplain,
  cmdLatency,
  cmdPatterns,
  cmdRunway,
  cmdSearch,
  cmdGraph,
  cmdRegistry,
  cmdScenario,
  cmdShow,
  cmdValidate,
  type GlobalOptions,
} from './commands.js';

const program = new Command();

program
  .name('hoba')
  .description('Hiring Obstacles & Barriers Atlas CLI tool')
  .version(readPackageVersion(new URL('../package.json', import.meta.url)))
  .option(
    '-d, --dir <path>',
    'Registry root directory (defaults to $HOBA_ROOT, then auto-detection from cwd)'
  )
  .option('--json', 'Emit machine-readable JSON instead of formatted text');

function run(action: () => number | void) {
  try {
    const code = action();
    if (typeof code === 'number') process.exitCode = code;
  } catch (error) {
    if (error instanceof CliError || error instanceof RegistryLoadError) {
      console.error(pc.red(`Error: ${error.message}`));
    } else {
      console.error(pc.red(`Error: ${error instanceof Error ? error.message : String(error)}`));
    }
    process.exitCode = 1;
  }
}

program
  .command('search <query>')
  .description('Search across all entities in the hoba knowledge graph')
  .option(
    '-t, --types <list>',
    'Comma-separated ontology types to include (observation,barrier,mechanism,pattern,loop,intervention,actor,process,era,evidence,record)'
  )
  .action((query: string, opts: { types?: string }, cmd: Command) => {
    run(() => cmdSearch(query, { ...(cmd.optsWithGlobals() as GlobalOptions), ...opts }));
  });

program
  .command('show <id>')
  // The external spec calls this `get`. Rather than ship two near-duplicate
  // commands (design doc §11 flags the overlap), it is one command under both
  // names.
  .alias('get')
  .description(
    'Display detailed specification of a given entity ID (e.g. mech.employment_gap_downranking_bias); legacy short codes resolve as aliases'
  )
  .action((id: string, _opts: unknown, cmd: Command) => {
    run(() => cmdShow(id, cmd.optsWithGlobals() as GlobalOptions));
  });

program
  .command('graph <id>')
  .description('Show what an entity is connected to, and by which relation')
  .option('-d, --depth <n>', 'How many hops to walk (default 1)')
  .action((id: string, opts: { depth?: string }, cmd: Command) => {
    run(() => cmdGraph(id, { ...(cmd.optsWithGlobals() as GlobalOptions), ...opts }));
  });

program
  .command('scenario [id]')
  .description('Read an authored scenario, or list the scenarios there are')
  .action((id: string | undefined, _opts: unknown, cmd: Command) => {
    run(() => cmdScenario(id, cmd.optsWithGlobals() as GlobalOptions));
  });

program
  .command('registry <subcommand>')
  .description(
    'Registry metadata: "stats" for counts, "version" for release metadata, "inventory" for the full data catalog'
  )
  .action((sub: string, _opts: unknown, cmd: Command) => {
    run(() => cmdRegistry(sub, cmd.optsWithGlobals() as GlobalOptions));
  });

program
  .command('explain [artifact_ids...]')
  .description(
    'Execute the hoba forensic analysis protocol for one or more observed artifacts or named empirical scenario'
  )
  .option('-s, --stage <stage>', 'Hiring funnel stage the process reached')
  .option(
    '--scenario <name>',
    'Pre-configured empirical diagnostic scenario (ghost-refresh, ats-knockout, post-panel-freeze, downlevelling-trap)'
  )
  .option(
    '-p, --probe <result...>',
    'Probe results already gathered, as PROBE-ID:outcome — each one can only narrow the compatible set'
  )
  .action(
    (
      artifactIds: string[],
      opts: { stage?: string; scenario?: string; probe?: string[] },
      cmd: Command
    ) => {
      run(() => cmdExplain(artifactIds, { ...(cmd.optsWithGlobals() as GlobalOptions), ...opts }));
    }
  );

program
  .command('latency <workflow_id> <state_id> <days>')
  .description('Diagnose temporal dwell anomalies and identify stalled or implicated mechanisms')
  .action((workflowId: string, stateId: string, days: string, _opts: unknown, cmd: Command) => {
    run(() => cmdLatency(workflowId, stateId, days, cmd.optsWithGlobals() as GlobalOptions));
  });

program
  .command('runway <savings> <monthly_burn>')
  .description(
    'Compute candidate financial runway horizon, exhaustion risk profile, and vulnerability notes'
  )
  .action((savings: string, monthlyBurn: string, _opts: unknown, cmd: Command) => {
    run(() => cmdRunway(savings, monthlyBurn, cmd.optsWithGlobals() as GlobalOptions));
  });

program
  .command('patterns')
  .description(
    'Display formal algebraic emptiness evaluation and contradiction proofs across all patterns'
  )
  .action((_opts: unknown, cmd: Command) => {
    run(() => cmdPatterns(cmd.optsWithGlobals() as GlobalOptions));
  });

program
  .command('conservation')
  .description('Audit financial flow conservation and verify non-divergence of funding splits')
  .action((_opts: unknown, cmd: Command) => {
    run(() => cmdConservation(cmd.optsWithGlobals() as GlobalOptions));
  });

program
  .command('validate')
  .description(
    'Validate registry content: schemas, referential integrity, barrier DAG, loop declarations, mirror parity'
  )
  .option('--strict', 'Treat warnings as errors')
  .option('-l, --lang <lang>', 'Content mirror to validate: en, uk or all', 'all')
  .action((opts: { strict?: boolean; lang?: string }, cmd: Command) => {
    run(() => cmdValidate({ ...(cmd.optsWithGlobals() as GlobalOptions), ...opts }));
  });

program.parse(process.argv);
