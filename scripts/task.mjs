#!/usr/bin/env node
/**
 * One entry point for the repeatable chores.
 *
 *   pnpm task check              validate → typecheck → unit → build → e2e, stops at the first failure
 *   pnpm task new <type> <slug>  scaffold a content pair (both mirrors) with the next free ID
 *   pnpm task preview            build and serve, reusing a running server
 *   pnpm task shots <path...>    screenshot pages at three widths in both themes
 *   pnpm task specimens          coverage, mirror parity and forbidden names
 *   pnpm task sources            every evidence URL still opens
 *   pnpm task deploy-preview     branch deploy, prints the URL
 *
 * Everything writes to stdout and exits non-zero on failure, so CI can call the
 * same commands a person does.
 */
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PREVIEW_PORT = 4321;

const c = {
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
};

function run(command, args, { quiet = false } = {}) {
  const result = spawnSync(command, args, { cwd: ROOT, stdio: quiet ? 'pipe' : 'inherit', encoding: 'utf8' });
  if (result.status !== 0) {
    if (quiet && result.stdout) process.stdout.write(result.stdout);
    if (quiet && result.stderr) process.stderr.write(result.stderr);
    throw new Error(`${command} ${args.join(' ')} exited ${result.status}`);
  }
  return result.stdout ?? '';
}

// ---- check ---------------------------------------------------------------

/**
 * `skip` returns a reason to stand down, or null to run. Only the proofs use
 * it: Lean is a real dependency of the repository but not of every machine that
 * clones it, and a check that silently does nothing is worse than one that says
 * it was skipped.
 */
const CHECKS = [
  ['registry', 'pnpm', ['validate:strict']],
  ['types', 'pnpm', ['typecheck']],
  ['unit', 'pnpm', ['test']],
  ['build', 'pnpm', ['build']],
  ['proofs', 'pnpm', ['lean'], { skip: () => (hasLake() ? null : 'no Lean toolchain — install elan to check the proofs') }],
  ['browser', 'pnpm', ['e2e']],
];

function hasLake() {
  return spawnSync('lake', ['--version'], { stdio: 'ignore' }).status === 0;
}

function check(only) {
  const steps = only ? CHECKS.filter(([name]) => name === only) : CHECKS;
  if (!steps.length) throw new Error(`unknown check "${only}" — one of ${CHECKS.map(([n]) => n).join(', ')}`);
  for (const [name, command, args, options] of steps) {
    const started = Date.now();
    const reason = options?.skip?.();
    if (reason) {
      process.stdout.write(c.bold(`\n▸ ${name}\n`) + c.dim(`— skipped: ${reason}\n`));
      continue;
    }
    process.stdout.write(c.bold(`\n▸ ${name}\n`));
    run(command, args);
    process.stdout.write(c.green(`✓ ${name} ${c.dim(`${((Date.now() - started) / 1000).toFixed(1)}s`)}\n`));
  }
}

// ---- new -----------------------------------------------------------------

/** Directory and canonical id prefix per authored type. */
const TYPES = {
  observation: { dir: 'observation', prefix: 'obs' },
  barrier: { dir: 'barrier', prefix: 'bar' },
  mechanism: { dir: 'mechanism', prefix: 'mech' },
  pattern: { dir: 'pattern', prefix: 'pat' },
  loop: { dir: 'loop', prefix: 'loop' },
  intervention: { dir: 'intervention', prefix: 'int' },
};

/** Both entity mirrors, language above the entities (design doc §9). */
const TREES = [join('data', 'en', 'entities'), join('data', 'uk', 'entities')];

/**
 * A canonical dotted id derived from the title, the way the migration derived
 * every existing one. This used to count `A-00N` filenames and hand back the
 * next number, which has produced nonsense since the ids stopped being numeric.
 */
function idFor(prefix, title) {
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  if (!slug) throw new Error(`cannot derive an id from the title "${title}"`);
  return `${prefix}.${slug}`;
}

/** Frontmatter that already satisfies the schema, so the first save validates. */
function template(type, id, title) {
  const common = `id: "${id}"\ntype: "${type}"\ntitle: "${title}"\n`;
  const tail = `status: "active"\nevidence_level: "compatible"\nevidence_ids: []\n`;
  const body = `---\n\n# ${title}\n\nTODO: the summary again, then the sections this type carries.\n`;
  const nonInf = `non_inferences:\n  - "TODO: what this does NOT establish."\n`;
  const specimens = `specimens: []\n`;
  const blocks = {
    observation: `${common}summary: "TODO: a summary of at least ten characters."\nstages:\n  - "screening"\n${specimens}probes: []\n${nonInf}${tail}`,
    barrier: `${common}stage: "screening"\norder: 99\nprecedes: []\ndescription: "TODO: a description of at least ten characters."\npass_condition: "TODO: what passing this gate means."\n${specimens}${tail}`,
    mechanism: `${common}summary: "TODO: a summary of at least ten characters."\noperates_at:\n  - "bar.application_ingestion"\nemissions: []\nfacets:\n  actor: "system"\n  nature: "rule"\n  visibility: "opaque"\n  removability: "none"\namplifies: []\nmasks: []\nhonest_baseline: false\n${specimens}${nonInf}${tail}`,
    pattern: `${common}summary: "TODO: a summary of at least ten characters."\nrequired_artifacts:\n  - "obs.complete_silence_after_submission"\ncompatible_mechanisms:\n  - "mech.genuine_technical_skill_shortfall"\ntrigger_rule: "TODO: when this pattern fires."\nestablishes:\n  - "TODO: what it establishes."\n${nonInf}interventions: []\n${specimens}${tail}`,
    loop: `${common}summary: "TODO: a summary of at least ten characters."\nmechanisms:\n  - "mech.genuine_technical_skill_shortfall"\n  - "mech.automated_keyword_qualification_filter"\nedges:\n  -\n    from: "mech.genuine_technical_skill_shortfall"\n    to: "mech.automated_keyword_qualification_filter"\n    relation: "amplifies"\n  -\n    from: "mech.automated_keyword_qualification_filter"\n    to: "mech.genuine_technical_skill_shortfall"\n    relation: "amplifies"\nentry_points:\n  - "mech.genuine_technical_skill_shortfall"\ninterventions: []\n${specimens}${tail}`,
    intervention: `${common}summary: "TODO: a summary of at least ten characters."\ntargets:\n  - "mech.genuine_technical_skill_shortfall"\nactor: "employer-policy"\nscope: "organizational"\ncost: "low"\nexpected_effects:\n  - "TODO: the expected effect."\nmeasurements:\n  - "todo_metric_name"\n${specimens}${tail}`,
  };
  return `---\n${blocks[type]}${body}`;
}

function scaffold(type, title) {
  const spec = TYPES[type];
  if (!spec) throw new Error(`unknown type "${type}" — one of ${Object.keys(TYPES).join(', ')}`);
  if (!title) throw new Error('a title is required: pnpm task new mechanism "Some title"');
  const id = idFor(spec.prefix, title);
  for (const root of TREES) {
    const dir = join(ROOT, root, spec.dir);
    mkdirSync(dir, { recursive: true });
    const file = join(dir, `${id}.md`);
    if (existsSync(file)) throw new Error(`${file} already exists`);
    writeFileSync(file, template(type, id, title));
    process.stdout.write(`${c.green('created')} ${root}/${spec.dir}/${id}.md\n`);
  }
  process.stdout.write(c.dim('\nBoth mirrors must stay structurally identical. Run `pnpm task check registry` when the text is in.\n'));
}

// ---- specimens -----------------------------------------------------------

const FORBIDDEN = /\b(Google|Meta|Amazon|Microsoft|Apple|Netflix|Uber|Stripe|Revolut|Monobank|PrivatBank|EPAM|SoftServe|Luxoft)\b/i;

function specimens() {
  let failures = 0;
  const shapes = {};
  for (const root of TREES) {
    for (const [, spec] of Object.entries(TYPES)) {
      const dir = join(ROOT, root, spec.dir);
      if (!existsSync(dir)) continue;
      for (const file of readdirSync(dir).filter((f) => f.endsWith('.md'))) {
        const text = readFileSync(join(dir, file), 'utf8');
        const id = file.slice(0, -3);
        if (!text.includes('specimens:') || /specimens: \[\]/.test(text)) {
          process.stdout.write(c.red(`no specimens  ${root}/${spec.dir}/${file}\n`));
          failures++;
          continue;
        }
        const kinds = [...text.matchAll(/^    kind: "(\w+)"$/gm)].map((m) => m[1]).join(',');
        (shapes[id] ??= {})[root] = kinds;
        const named = text.match(FORBIDDEN);
        if (named) {
          process.stdout.write(c.red(`names "${named[0]}"  ${root}/${spec.dir}/${file}\n`));
          failures++;
        }
      }
    }
  }
  for (const [id, byRoot] of Object.entries(shapes)) {
    if (byRoot.content !== byRoot['content-uk']) {
      process.stdout.write(c.red(`mirrors differ  ${id}: ${byRoot.content} vs ${byRoot['content-uk']}\n`));
      failures++;
    }
  }
  const total = Object.keys(shapes).length;
  if (failures) throw new Error(`${failures} specimen problem(s) across ${total} entities`);
  process.stdout.write(c.green(`✓ ${total} entities, both mirrors, no forbidden names\n`));
}

/**
 * A citation nobody can open is not a citation, and a URL rots without anyone
 * touching the file it sits in. Deliberately a chore and not a gate: several
 * of the hosts this registry cites — doi.org, FRED, GAO — refuse anything that
 * is not a browser, so a build that blocked on them would fail for reasons
 * that have nothing to do with the registry. Run it now and then; read the
 * output rather than trusting an exit code.
 */
const BOT_HOSTILE = ['doi.org', 'fred.stlouisfed.org', 'gao.gov', 'clarifycapital.com'];

async function sources() {
  const { loadRegistryFromRoot, resolveRegistryRoot } = await import('@hoba/registry');
  const records = loadRegistryFromRoot(resolveRegistryRoot(), 'en').evidence.filter((e) => e.url);
  const suspect = [];

  process.stdout.write(`checking ${records.length} source URL(s)\n`);
  for (const record of records) {
    let status = 0;
    try {
      const res = await fetch(record.url, {
        redirect: 'follow',
        headers: { 'user-agent': 'Mozilla/5.0 (compatible; hoba-source-check)' },
        signal: AbortSignal.timeout(20_000),
      });
      status = res.status;
    } catch {
      status = 0;
    }
    if (status >= 200 && status < 400) continue;
    const host = new URL(record.url).host.replace(/^www\./, '');
    // Excused by host *and* by what the host said. A 401/403/429 or a dead
    // socket is a refusal to talk to a script; a 404 is the host saying the
    // page is not there, which no amount of user-agent theatre will change —
    // and excusing that would have hidden a GAO citation I got wrong.
    const refusal = status === 0 || status === 401 || status === 403 || status === 429;
    const excused = refusal && BOT_HOSTILE.some((h) => host.endsWith(h));
    suspect.push({ id: record.id, url: record.url, status, excused });
  }

  const real = suspect.filter((s) => !s.excused);
  for (const s of suspect) {
    const mark = s.excused ? c.dim(`${s.status || 'blocked'} (host refuses non-browsers)`) : c.red(String(s.status || 'unreachable'));
    process.stdout.write(`  ${mark}  ${s.id}\n        ${s.url}\n`);
  }
  process.stdout.write(
    real.length
      ? c.red(`\n${real.length} source(s) need a human to look\n`)
      : c.green(`\n✓ every source that answers a script is reachable (${suspect.length} excused as bot-hostile)\n`)
  );
}

// ---- preview / shots -----------------------------------------------------

async function serverUp() {
  try {
    const res = await fetch(`http://localhost:${PREVIEW_PORT}/`, { redirect: 'manual' });
    return res.status > 0;
  } catch {
    return false;
  }
}

/** Pinned: wrangler defaults this to today and the bundled workerd lags the calendar. */
const COMPAT_DATE = '2026-07-21';

async function preview() {
  if (await serverUp()) {
    process.stdout.write(`preview already running on http://localhost:${PREVIEW_PORT}\n`);
    return;
  }
  run('pnpm', ['build']);
  // wrangler, not astro preview: public URLs carry no language, so every HTML
  // response comes from the worker resolving one.
  process.stdout.write(`starting preview on http://localhost:${PREVIEW_PORT}\n`);
  run('pnpm', ['exec', 'wrangler', 'pages', 'dev', 'apps/web/dist', '--port', String(PREVIEW_PORT), '--compatibility-date', COMPAT_DATE, '--log-level', 'warn']);
}

async function shots(paths) {
  const targets = paths.length ? paths : ['/', '/registry', '/graph', '/observations/A-013'];
  if (!(await serverUp())) throw new Error(`nothing on :${PREVIEW_PORT} — run "pnpm task preview" in another shell first`);
  const out = join(ROOT, '.shots');
  mkdirSync(out, { recursive: true });
  const script = `
    import { chromium } from '@playwright/test';
    const targets = ${JSON.stringify(targets)};
    const browser = await chromium.launch();
    for (const scheme of ['dark', 'light']) {
      for (const width of [390, 768, 1440]) {
        const ctx = await browser.newContext({ colorScheme: scheme, viewport: { width, height: 900 }, deviceScaleFactor: 1.5 });
        const page = await ctx.newPage();
        for (const path of targets) {
          await page.goto('http://localhost:${PREVIEW_PORT}' + path, { waitUntil: 'networkidle' });
          const name = (path === '/' ? 'home' : path.replace(/\\W+/g, '-').replace(/^-|-$/g, ''));
          await page.screenshot({ path: ${JSON.stringify(out)} + '/' + name + '-' + width + '-' + scheme + '.png', fullPage: width === 1440 });
        }
        await ctx.close();
      }
    }
    await browser.close();
    console.log('wrote ' + (targets.length * 6) + ' shots to .shots/');
  `;
  const tmp = join(ROOT, '.task-shots.mjs');
  writeFileSync(tmp, script);
  try {
    run('node', [tmp]);
  } finally {
    execFileSync('rm', ['-f', tmp]);
  }
}

// ---- deploy --------------------------------------------------------------

function deployPreview() {
  const branch = run('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { quiet: true }).trim();
  if (branch === 'main') throw new Error('on main — preview deploys are for branches');
  run('pnpm', ['build']);
  run('pnpm', ['exec', 'wrangler', 'pages', 'deploy', 'apps/web/dist', '--project-name', 'hoba-work', '--branch', branch]);
}

// ---- dispatch ------------------------------------------------------------

const [task, ...rest] = process.argv.slice(2);
const TASKS = {
  check: () => check(rest[0]),
  new: () => scaffold(rest[0], rest.slice(1).join(' ')),
  preview,
  shots: () => shots(rest),
  specimens,
  sources,
  'deploy-preview': deployPreview,
};

if (!task || !TASKS[task]) {
  process.stdout.write(`usage: pnpm task <${Object.keys(TASKS).join('|')}>\n\n`);
  process.stdout.write(readFileSync(fileURLToPath(import.meta.url), 'utf8').split('*/')[0].split('\n').slice(2, -1).map((l) => l.replace(/^ \* ?/, '')).join('\n'));
  process.exit(task ? 1 : 0);
}

try {
  await TASKS[task]();
} catch (error) {
  process.stderr.write(c.red(`\n✗ ${error.message}\n`));
  process.exit(1);
}
