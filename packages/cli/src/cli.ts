#!/usr/bin/env node
import { Command } from 'commander';
import { cmdExplain, cmdSearch, cmdShow } from './commands.js';

const program = new Command();

program
  .name('hoba')
  .description('Hiring Obstacles & Barriers Atlas CLI tool')
  .version('0.4.1');

program
  .command('search <query>')
  .description('Search across all entities in the HOBA knowledge graph')
  .option('-d, --dir <path>', 'Base repository directory')
  .action((query, opts) => {
    cmdSearch(query, opts);
  });

program
  .command('show <id>')
  .description('Display detailed specification of a given entity ID (e.g. HOBA-M-001)')
  .option('-d, --dir <path>', 'Base repository directory')
  .action((id, opts) => {
    cmdShow(id, opts);
  });

program
  .command('explain <artifact_id>')
  .description('Execute HOBA forensic analysis protocol for an observed artifact')
  .option('-s, --stage <stage>', 'Hiring funnel stage')
  .option('-d, --dir <path>', 'Base repository directory')
  .action((artifactId, opts) => {
    cmdExplain(artifactId, opts);
  });

program.parse(process.argv);
