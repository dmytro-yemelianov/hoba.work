import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import * as S from '@hoba/registry';
import { READER_SLUGS } from '../apps/web/src/lib/readers';
import { ui } from '../apps/web/src/i18n/ui';
import { branded, internalBase, localeFromParams, localeStaticPaths, publicPath, useTranslations, withLang } from '../apps/web/src/i18n/utils';

describe('ui dictionary', () => {
  it('has the same keys in every locale, with no empty Ukrainian strings', () => {
    const en = Object.keys(ui.en).sort();
    const uk = Object.keys(ui.uk).sort();
    expect(uk).toEqual(en);
    const emptyUk = Object.entries(ui.uk).filter(([k, v]) => v === '' && (ui.en as Record<string, string>)[k] !== '');
    expect(emptyUk).toEqual([]);
  });

  it('keeps interpolation placeholders consistent between locales', () => {
    const placeholders = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort();
    for (const key of Object.keys(ui.en) as (keyof typeof ui.en)[]) {
      expect(placeholders(ui.uk[key]), key).toEqual(placeholders(ui.en[key]));
    }
  });

  it('does not leave obviously untranslated Latin-only sentences in the Ukrainian UI (code identifiers excepted)', () => {
    const allowed = new Set(['dev.mcp.configComment2', 'about.p1.strong']);
    const offenders = Object.entries(ui.uk).filter(([k, v]) => !allowed.has(k) && /[A-Za-z]{4,}/.test(v) && !/[Ѐ-ӿ]/.test(v));
    expect(offenders.map(([k]) => k)).toEqual([]);
  });

  it('interpolates and falls back to English for unknown keys', () => {
    const t = useTranslations('uk');
    expect(t('home.cta.registry', { n: 72 })).toContain('72');
    // Assert the interpolation, not the copy: the prose is edited, the
    // placeholder contract is not.
    expect(t('bar.order', { n: 3 })).toMatch(/\b3\b/);
    expect(t('bar.order', { n: 3 })).not.toContain('{n}');
  });
});

describe('locale routing helpers', () => {
  it('prerenders one internal tree per language', () => {
    expect(localeStaticPaths()).toEqual([{ params: { locale: '_i/en' } }, { params: { locale: '_i/uk' } }]);
    expect(localeFromParams({ locale: '_i/uk' })).toBe('uk');
    expect(localeFromParams({ locale: '_i/en' })).toBe('en');
    expect(localeFromParams({})).toBe('en');
    expect(internalBase('uk')).toBe('_i/uk');
  });

  it('turns a built path into the one public address', () => {
    expect(publicPath('/_i/uk/registry/')).toBe('/registry');
    expect(publicPath('/_i/en/mechanisms/M-001/')).toBe('/mechanisms/M-001');
    expect(publicPath('/_i/uk/')).toBe('/');
    expect(publicPath('/_i/en')).toBe('/');
    // A path that is already public, and one that merely looks internal.
    expect(publicPath('/registry')).toBe('/registry');
    expect(publicPath('/_internal/x')).toBe('/_internal/x');
  });

  it('carries the language as a query, never as a segment, and keeps the rest', () => {
    expect(withLang(new URL('https://hoba.work/_i/en/registry/'), 'uk')).toBe('/registry?lang=uk');
    expect(withLang(new URL('https://hoba.work/_i/uk/registry/?type=loop'), 'en')).toBe('/registry?type=loop&lang=en');
    expect(withLang(new URL('https://hoba.work/_i/uk/registry/?lang=uk#top'), 'en')).toBe('/registry?lang=en#top');
    expect(withLang(new URL('https://hoba.work/_i/en/'), 'uk')).toBe('/?lang=uk');
  });
});

/**
 * The name is set lowercase everywhere it is read, because capitalised it is
 * Cyrillic to a Ukrainian eye: HOBA is нова. Bold does the work capitals used
 * to, and `branded()` in the site adds it.
 */
describe('the wordmark', () => {
  it('is never capitalised in anything a reader sees', () => {
    for (const [lang, dict] of Object.entries(ui)) {
      const shouting = Object.entries(dict as Record<string, string>)
        .filter(([, value]) => /\bHOBA\b|\bHoba\b/.test(value))
        .map(([key, value]) => `${lang}/${key}: ${value.slice(0, 60)}`);
      expect(shouting).toEqual([]);
    }
  });

  it('bolds the name and escapes everything around it', () => {
    expect(branded('About hoba')).toBe('About <b class="wordmark">hoba</b>');
    // Domains, packages, commands and filenames are identifiers, not the name.
    expect(branded('hoba.work is the domain')).toBe('hoba.work is the domain');
    expect(branded('npx @hoba/mcp')).toBe('npx @hoba/mcp');
    expect(branded('hoba-parse-check')).toBe('hoba-parse-check');
    expect(branded('<script>x</script> hoba')).toBe(
      '&lt;script&gt;x&lt;/script&gt; <b class="wordmark">hoba</b>'
    );
  });
});

describe('the dictionary and the vocabularies it labels', () => {
  const SRC = path.join(__dirname, '..', 'apps', 'web', 'src');
  const sources = (): string[] => {
    const out: string[] = [];
    const walk = (dir: string) => {
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) walk(p);
        else if (/\.(astro|ts)$/.test(e.name)) out.push(p);
      }
    };
    walk(SRC);
    return out;
  };

  /**
   * `useTranslations` returns the key itself when it cannot find one, so a key
   * that no longer exists is not an error — it is printed at the reader. That
   * is how `entity.artifact` survived the rename of the kind and appeared on 66
   * pages. `.astro` templates are outside `tsc`, so the type of a key literal
   * is checked by nothing else.
   */
  it('holds every key the source asks for by name', () => {
    const known = new Set(Object.keys(ui.en));
    const missing: string[] = [];
    for (const file of sources()) {
      const text = fs.readFileSync(file, 'utf8');
      for (const m of text.matchAll(/\bt\(\s*(['"])([a-z][\w.]*\.[\w.]+)\1/g)) {
        if (!known.has(m[2])) missing.push(`${path.relative(SRC, file)}: ${m[2]}`);
      }
    }
    expect(missing).toEqual([]);
  });

  /**
   * Keys built by interpolation cannot be checked by reading the source: the
   * value arrives from the registry at build time. Each such prefix is paired
   * with the vocabulary that feeds it, so adding a member to a schema without
   * writing its label fails here rather than on the page.
   */
  const BY_SCHEMA: Array<[string, readonly string[]]> = [
    ['actor.', S.actorTypeSchema.options],
    ['cost.', S.costBandSchema.options],
    ['entity.', [...S.READER_FACING_TYPES, 'evidence']],
    ['entity.plural.', [...S.READER_FACING_TYPES, 'evidence']],
    ['fidelity.', [...S.emissionFidelitySchema.options, 'unspecified']],
    ['iactor.', S.interventionActorSchema.options],
    ['level.', S.evidenceLevelSchema.options],
    ['nature.', S.natureTypeSchema.options],
    ['removability.', S.removabilityTypeSchema.options],
    ['removability.short.', S.removabilityTypeSchema.options],
    ['scope.', S.scopeTypeSchema.options],
    ['stage.', S.stageIdSchema.options],
    ['status.', S.nodeStatusSchema.options],
    ['visibility.', S.visibilityTypeSchema.options],
    // Not a registry vocabulary, but a vocabulary all the same: the reader
    // entry points are generated from this list, so a reader added without a
    // title, a lead and a stated limit fails here rather than on the page.
    ['reader.title.', READER_SLUGS],
    ['reader.lead.', READER_SLUGS],
    ['reader.limits.', READER_SLUGS],
    ['reader.short.', READER_SLUGS],
  ];

  it('labels every member of every vocabulary it interpolates', () => {
    const known = new Set(Object.keys(ui.en));
    const missing: string[] = [];
    for (const [prefix, options] of BY_SCHEMA) {
      for (const option of options) if (!known.has(prefix + option)) missing.push(prefix + option);
    }
    expect(missing).toEqual([]);
  });

  /**
   * The pairing above is a design fact and cannot be derived, so it is the one
   * hand-written list left — and this keeps it honest: a new interpolated
   * prefix must be classified, either as schema-backed above or as keyed by
   * something that is not a vocabulary.
   */
  const NOT_A_VOCABULARY = new Set([
    'agency.', 'analyze.scenarios.', 'check.r.', 'check.v.', 'contrib.checks.',
    'method.nongoals.', 'method.verbs.', 'nav.', 'nav.desc.', 'relation.',
    'scenario.', 'specimen.subject.', 'view.', 'zone.',
    // Keyed by a local set — a zone, a card's position, a page of the tour —
    // rather than by a vocabulary the registry defines.
    'analyze.a.zone.', 'home.gives.', 'tour.',
    // Two levels — reader, then step number — so the flat rule above cannot
    // check it; the test below walks it properly.
    'reader.step.',
    // Keyed by the error codes the submit endpoint returns; the test below
    // walks the worker for them, which the flat rule here cannot do.
    'submit.err.',
  ]);

  it('classifies every prefix whose key is built at runtime', () => {
    const classified = new Set([...BY_SCHEMA.map(([p]) => p), ...NOT_A_VOCABULARY]);
    const found = new Set<string>();
    for (const file of sources()) {
      const text = fs.readFileSync(file, 'utf8');
      for (const m of text.matchAll(/`([a-z][\w]*(?:\.[a-z][\w]*)*)\.\$\{/g)) found.add(`${m[1]}.`);
    }
    expect([...found].filter((p) => !classified.has(p)).sort()).toEqual([]);
  });

  /**
   * The badge colours a dot with `--g-<type>`, a name assembled the same way a
   * key is — and a missing custom property is not an error either: the
   * declaration is dropped and the dot renders with no colour at all.
   */
  it('defines a graph colour for every kind a badge can carry, in both themes', () => {
    const css = fs.readFileSync(path.join(SRC, 'styles', 'theme.css'), 'utf8');
    const block = (selector: string) => {
      const start = css.indexOf(`${selector} {`);
      expect(start, selector).toBeGreaterThan(-1);
      return css.slice(start, css.indexOf('\n}', start));
    };
    const names = (text: string) => new Set([...text.matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1]));
    const light = names(block(':root'));
    const dark = names(block('.dark'));

    const needed = [...S.READER_FACING_TYPES, 'evidence'].map((kind) => `--g-${kind}`);
    expect(needed.filter((token) => !light.has(token))).toEqual([]);
    expect(needed.filter((token) => !dark.has(token))).toEqual([]);

    // A token defined in one theme and not the other is not missing anywhere a
    // build would notice — it is simply wrong for half the readers.
    expect([...light].filter((token) => !dark.has(token))).toEqual([]);
    expect([...dark].filter((token) => !light.has(token))).toEqual([]);
  });
});

describe('the onboarding tour', () => {
  /**
   * The tour points at elements by selector and names each step from the
   * dictionary. Nothing connects the two: a step added to one and not the other
   * either points at nothing or prints its own key as a heading.
   */
  it('has a written step for everything it points at, and points at every step it has', () => {
    const src = fs.readFileSync(
      path.join(__dirname, '..', 'apps', 'web', 'src', 'components', 'OnboardingTour.astro'), 'utf8');
    const block = src.match(/const STEP_SELECTORS[^{]*\{([\s\S]*?)\n\};/)![1];
    const pages = [...block.matchAll(/^\s*(\w+):\s*\[([\s\S]*?)\],$/gm)]
      // Count string literals, not quote characters: one selector carries an
      // attribute filter with quotes of its own inside it.
      .map(([, page, list]) => [page, (list.match(/'[^']*'|"[^"]*"|`[^`]*`/g) ?? []).length] as const);
    expect(pages.length).toBeGreaterThan(0);

    const keys = new Set(Object.keys(ui.en));
    const problems: string[] = [];
    for (const [page, steps] of pages) {
      if (!keys.has(`tour.${page}.title`)) problems.push(`tour.${page}.title`);
      for (let i = 1; i <= steps; i++) {
        for (const field of ['title', 'text']) {
          const key = `tour.${page}.step${i}.${field}`;
          if (!keys.has(key)) problems.push(key);
        }
      }
      const written = [...keys]
        .filter((k) => k.startsWith(`tour.${page}.step`) && k.endsWith('.title'))
        .map((k) => Number(k.match(/step(\d+)/)![1]));
      const orphaned = written.filter((n) => n > steps);
      if (orphaned.length) problems.push(`${page}: step ${orphaned.join(', ')} written but never pointed at`);
    }
    expect(problems).toEqual([]);
  });
});

describe('the subsets of the evidence scale that are written out by hand', () => {
  /**
   * Two places name some of the evidence levels rather than all of them, and
   * both are deliberate: `/methodology` teaches four of the seven, and the
   * claim scale is the ordered line, which `contradicted` and `unknown` are
   * not points on. Neither can be derived — but both must stay subsets, and
   * neither would know if a level were renamed underneath it.
   */
  const levels = new Set<string>(S.evidenceLevelSchema.options);

  it('keeps the four verbs methodology teaches inside the scale', () => {
    const src = fs.readFileSync(
      path.join(__dirname, '..', 'apps', 'web', 'src', 'pages', '[...locale]', 'methodology.astro'), 'utf8');
    const verbs = [...src.match(/const verbs = \[([^\]]*)\]/)![1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
    expect(verbs.length).toBeGreaterThan(0);
    expect(verbs.filter((v) => !levels.has(v))).toEqual([]);
  });

  it('keeps the ordered claim scale inside the scale, minus the two states that are not points on it', () => {
    const src = fs.readFileSync(
      path.join(__dirname, '..', 'packages', 'validator', 'src', 'analysis.ts'), 'utf8');
    const scale = [...src.match(/const CLAIM_SCALE = \[([^\]]*)\]/)![1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
    expect(scale.filter((v) => !levels.has(v))).toEqual([]);
    expect([...levels].filter((v) => !scale.includes(v)).sort()).toEqual(['contradicted', 'unknown']);
  });
});

describe('the reader entry points', () => {
  /**
   * Each page lists three places to start and explains each in a line. The
   * count lives in the template, so this is what stops a fourth step being
   * added to one reader and rendering as its own key.
   */
  it('explains every step of every reader, in both languages', () => {
    const src = fs.readFileSync(
      path.join(__dirname, '..', 'apps', 'web', 'src', 'pages', '[...locale]', 'for', '[reader].astro'), 'utf8');
    const missing: string[] = [];
    for (const reader of READER_SLUGS) {
      const block = src.match(new RegExp(`${reader}: \\[([\\s\\S]*?)\\],\\n`))?.[1] ?? '';
      const steps = (block.match(/\{ href:/g) ?? []).length;
      expect(steps, `${reader} should list some steps`).toBeGreaterThan(0);
      for (let i = 1; i <= steps; i++) {
        for (const locale of ['en', 'uk'] as const) {
          const key = `reader.step.${reader}.${i}`;
          if (!(key in ui[locale])) missing.push(`${locale}: ${key}`);
        }
      }
    }
    expect(missing).toEqual([]);
  });
});

describe('the submission endpoint and the messages for it', () => {
  /**
   * The form turns whatever `POST /submit` refuses with into `submit.err.<code>`
   * and falls back to a generic line when there is no message. A code added to
   * the worker without one is therefore invisible: the person is told something
   * went wrong and not what to change about their own text.
   */
  it('has a message for every reason the worker can refuse', () => {
    const worker = fs.readFileSync(
      path.join(__dirname, '..', 'apps', 'web', 'src', 'worker', 'submit.js'), 'utf8');
    const codes = [...new Set([...worker.matchAll(/error:\s*'([a-z_]+)'/g)].map((m) => m[1]))];
    expect(codes.length).toBeGreaterThan(2);
    const missing: string[] = [];
    for (const code of codes) {
      for (const locale of ['en', 'uk'] as const) {
        if (!(`submit.err.${code}` in ui[locale])) missing.push(`${locale}: submit.err.${code}`);
      }
    }
    expect(missing).toEqual([]);
  });
});
