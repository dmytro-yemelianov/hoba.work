import { expect, test } from '@playwright/test';
import { evidenceKindSchema, evidenceLevelSchema } from '@hoba/registry';

/**
 * The methodology page describes what the registry may claim, so its
 * vocabulary has to be the registry's. It used to restate the enums in prose,
 * in two languages — which meant the levels going from four to seven required
 * a hand edit that nothing would have caught if it were forgotten, and the
 * page about the epistemic model would have been wrong about the epistemic
 * model.
 */
test.describe('the methodology page reads the schema', () => {
  for (const lang of ['en', 'uk'] as const) {
    test(`names every evidence kind and level the schema defines (${lang})`, async ({ page }) => {
      await page.goto(`/methodology?lang=${lang}`);
      const section = page.locator('#method-evidence');
      await expect(section).toBeVisible();
      const text = (await section.innerText()).toLowerCase();

      for (const kind of evidenceKindSchema.options) {
        expect(text, `${lang}: evidence kind "${kind}"`).toContain(kind);
      }
      for (const level of evidenceLevelSchema.options) {
        expect(text, `${lang}: evidence level "${level}"`).toContain(level);
      }
    });
  }

  test('names no level the schema has retired', async ({ page }) => {
    await page.goto('/methodology?lang=en');
    const text = (await page.locator('#method-evidence').innerText()).toLowerCase();
    // `hypothesis` and `established` left the enum in Phase 3.1. If either
    // reappears here, the prose has drifted back out of step with the schema.
    for (const gone of ['hypothesis', 'established']) {
      expect(text, `retired level "${gone}" is still on the page`).not.toContain(gone);
    }
  });
});
