import { expect, test } from '@playwright/test';
import { findRegistryRoot, gaps, loadRegistryFromRoot } from '@hoba/registry';
import { says } from './says';

const report = gaps(loadRegistryFromRoot(findRegistryRoot(process.cwd())!, 'en'));

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
    expect(reach.length, 'the split is only meaningful when both sides exist').toBeGreaterThan(0);
    expect(omissions.length).toBeGreaterThan(0);

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
});
