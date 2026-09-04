import fs from 'node:fs';
import path from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { loadRegistryFromRoot, findRegistryRoot } from '@hoba/registry';

/**
 * One address per page template, and the list is derived so that adding a
 * template cannot quietly add an unchecked page. It was written by hand before,
 * and nine of the twenty-two templates had never been through axe at all —
 * `about`, `contribute`, `methodology`, `cats`, the 404, and the barrier, loop
 * and intervention pages, which are three of the six kinds a reader meets.
 */
const REPO_ROOT = path.join(__dirname, '..');
const TEMPLATES = path.join(REPO_ROOT, 'apps', 'web', 'src', 'pages', '[...locale]');
const bundle = loadRegistryFromRoot(findRegistryRoot(REPO_ROOT)!, 'en');

/** A template's representative address: an entity page needs a real entry. */
const SAMPLE: Record<string, string> = {
  index: '/',
  '404': '/a-path-that-is-not-a-page',
  'actors/index': '/actors',
  'for/[reader]': '/for/candidate',
  'actors/[id]': `/actors/${bundle.actors[0]!.slug}`,
  'barriers/[id]': `/barriers/${bundle.barriers[0]!.id}`,
  'observations/[id]': `/observations/${bundle.observations[0]!.id}`,
  'mechanisms/[id]': `/mechanisms/${bundle.mechanisms[0]!.id}`,
  'patterns/[id]': `/patterns/${bundle.patterns[0]!.id}`,
  'loops/[id]': `/loops/${bundle.loops[0]!.id}`,
  'interventions/[id]': `/interventions/${bundle.interventions[0]!.id}`,
};

const templateNames = (): string[] => {
  const out: string[] = [];
  const walk = (dir: string, prefix = '') => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.isDirectory()) walk(path.join(dir, e.name), `${prefix}${e.name}/`);
      else if (e.name.endsWith('.astro')) out.push(`${prefix}${e.name.replace(/\.astro$/, '')}`);
    }
  };
  walk(TEMPLATES);
  return out.sort();
};

const PAGES = templateNames().map((name) => SAMPLE[name] ?? `/${name}`);

// The mobile project runs only mobile.spec.ts, so until now nothing had put a
// phone viewport through axe at all — and the drawer, the collapsed nav and the
// stacked cards are markup a desktop pass never sees.
test.describe('accessibility on a phone', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  for (const path of PAGES) {
    test(`${path} has no serious or critical axe violations`, async ({ page }) => {
      await page.goto(path);
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
      const severe = results.violations.filter(
        (v) => v.impact === 'serious' || v.impact === 'critical'
      );
      expect(
        severe.map(
          (v) =>
            `${v.id}: ${v.nodes
              .map((n) => n.target.join(' '))
              .slice(0, 3)
              .join(', ')}`
        )
      ).toEqual([]);
    });
  }
});

for (const scheme of ['dark', 'light'] as const) {
  test.describe(`accessibility (${scheme})`, () => {
    // One language per scheme: the axe surface is the same markup either way,
    // and this keeps both languages covered without doubling the sweep.
    test.use({ colorScheme: scheme, locale: scheme === 'dark' ? 'uk-UA' : 'en-US' });
    for (const path of PAGES) {
      test(`${path} has no serious or critical axe violations`, async ({ page }) => {
        await page.goto(path);
        const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
        const severe = results.violations.filter(
          (v) => v.impact === 'serious' || v.impact === 'critical'
        );
        expect(
          severe.map(
            (v) =>
              `${v.id}: ${v.nodes
                .map((n) => n.target.join(' '))
                .slice(0, 3)
                .join(', ')}`
          )
        ).toEqual([]);
      });
    }
  });
}
