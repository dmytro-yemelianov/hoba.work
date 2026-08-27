import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const PAGES = ['/', '/registry', '/analyze', '/mechanisms/M-001', '/patterns', '/data', '/developers', '/graph', '/process', '/eras', '/actors', '/actors/recruiter', '/artifacts/A-013'];

for (const scheme of ['dark', 'light'] as const) {
  test.describe(`accessibility (${scheme})`, () => {
    // One language per scheme: the axe surface is the same markup either way,
    // and this keeps both languages covered without doubling the sweep.
    test.use({ colorScheme: scheme, locale: scheme === 'dark' ? 'uk-UA' : 'en-US' });
    for (const path of PAGES) {
      test(`${path} has no serious or critical axe violations`, async ({ page }) => {
        await page.goto(path);
        const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
        const severe = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
        expect(severe.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(', ')}`)).toEqual([]);
      });
    }
  });
}
