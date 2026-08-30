import { expect, test } from '@playwright/test';
import { closure, findRegistryRoot, gaps, loadRegistryFromRoot } from '@hoba/registry';
import { says } from './says';

const bundle = loadRegistryFromRoot(findRegistryRoot(process.cwd())!, 'en');
const report = gaps(bundle);

/**
 * What the atlas publishes about its own limits.
 *
 * These are the assertions that stop a measured gap from turning back into a
 * chosen one. The page must show the groups the registry cannot separate, and
 * it must not describe an omission as a finding.
 */
test.describe('the atlas reports its own limits', () => {
  test('publishes every group of causes no observation separates', async ({ page }) => {
    await page.goto('/data?lang=en');
    const section = page.locator('section', { has: page.getByRole('heading', { name: says('en', 'gap.merged') }) });

    // Derived from the registry, so growing the catalogue cannot silently
    // leave a merged group unpublished.
    for (const group of report.indistinguishable) {
      for (const id of group.mechanisms) await expect(section.getByRole('link', { name: id })).toBeVisible();
      for (const id of group.signature) await expect(section.getByRole('link', { name: id })).toBeVisible();
    }
  });

  test('marks a mechanism out of reach only where nothing can reach it', async ({ page }) => {
    await page.goto('/data?lang=en');
    const reach = report.unaddressedMechanisms.filter((m) => m.outOfReach).map((m) => m.id);
    const omissions = report.unaddressedMechanisms.filter((m) => !m.outOfReach).map((m) => m.id);
    // Both sides are empty now that every mechanism is targeted. The page must
    // then say so and stop explaining a distinction between entries it is not
    // showing; when either side comes back, the badge rules below apply again.
    if (reach.length === 0 && omissions.length === 0) {
      const row = page.locator('[data-gap-row="mechanisms"]');
      await expect(row).toContainText(says('en', 'gap.none'));
      await expect(row).not.toContainText(says('en', 'gap.mechanismsSplit'));
    }

    for (const id of reach) {
      await expect(page.locator(`[data-gap-id="${id}"]`)).toContainText(says('en', 'gap.outOfReach'));
    }
    // An omission carrying the badge would read as a finding, which is the
    // error this whole section exists to stop.
    for (const id of omissions) {
      await expect(page.locator(`[data-gap-id="${id}"]`)).not.toContainText(says('en', 'gap.outOfReach'));
    }
  });

  test('publishes the ceiling: every cause nothing can settle, and what covers it', async ({ page }) => {
    await page.goto('/data?lang=en');
    for (const entry of report.identifiability.neverAlone) {
      // Addressed by the row's own subject: a mechanism also appears as the
      // thing covering someone else, so matching on the link alone is ambiguous.
      const row = page.locator(`[data-ceiling-id="${entry.mechanism}"]`);
      await expect(row).toBeVisible();
      for (const id of entry.coveredBy) await expect(row.getByRole('link', { name: id, exact: true })).toBeVisible();
    }
  });
  test('an entry states what it reaches past its own links, and counts it right', async ({ page }) => {
    await page.goto('/mechanisms/mech.genuine_technical_skill_shortfall?lang=en');
    const section = page.locator('section', { has: page.getByRole('heading', { name: says('en', 'reach.title') }) });
    await expect(section).toBeVisible();

    // The published number is the transitive reach minus what the relation
    // sections above already name, so a page that simply repeated its own
    // links would fail here.
    const reach = closure(bundle, 'mech.genuine_technical_skill_shortfall');
    const indirect = reach.affects.filter((id) => !reach.directAffects.includes(id));
    expect(indirect.length, 'mech.genuine_technical_skill_shortfall must reach something past its own edges for this to test anything').toBeGreaterThan(0);
    await expect(section).toContainText(String(indirect.length));
  });
});
