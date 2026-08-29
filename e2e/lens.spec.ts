import { findRegistryRoot, loadRegistryFromRoot } from '@hoba/registry';
import { expect, test } from '@playwright/test';

const actorCount = loadRegistryFromRoot(findRegistryRoot(process.cwd())!, 'en').actors.length;

/**
 * The lens.
 *
 * Two things have to hold. Choosing a seat must collapse the page to that seat
 * — including, where an entry cannot be seen from it, saying so, which is the
 * half that carries the argument. And the choice must be a link someone can
 * send, applied before paint, so a shared URL opens in the point of view it
 * was shared from.
 */
test.describe('the lens', () => {
  test('shows every point of view until one is chosen', async ({ page }) => {
    await page.goto('/mechanisms/mech.recruiter_volume_quota_incentive_distortion?lang=en');
    const voices = page.locator('.perspective:not(.is-blind)');
    expect(await voices.count()).toBeGreaterThan(1);
    for (let i = 0; i < (await voices.count()); i++) await expect(voices.nth(i)).toBeVisible();
    // Absence is only interesting once you have asked from where.
    await expect(page.locator('.perspective.is-blind').first()).toBeHidden();
  });

  test('collapses to one seat, and says when that seat cannot see', async ({ page }) => {
    await page.goto('/mechanisms/mech.recruiter_volume_quota_incentive_distortion?lang=en&lens=recruiter');
    await expect(page.locator('html')).toHaveAttribute('data-lens', 'recruiter');

    const shown = page.locator('.lens-block:visible');
    await expect(shown).toHaveCount(1);
    await expect(shown.first()).toHaveAttribute('data-actor', 'recruiter');

    // An entry the chosen seat has no view of states that, rather than
    // silently rendering nothing.
    await page.goto('/mechanisms/mech.recruiter_volume_quota_incentive_distortion?lang=en&lens=public-policy');
    const only = page.locator('.lens-block:visible');
    await expect(only).toHaveCount(1);
    await expect(only.first()).toHaveAttribute('data-actor', 'public-policy');
  });

  // Every seat the picker offers has to be a seat the lens knows. The
  // allowlist and the stylesheet each enumerate the actors by hand, and for a
  // while they listed six of the seven: choosing the client hid every
  // perspective and revealed none.
  test('offers no seat it cannot show, including the last one added', async ({ page }) => {
    await page.goto('/barriers/bar.client_profile_approval_and_client_interview?lang=en&lens=client');
    await expect(page.locator('html')).toHaveAttribute('data-lens', 'client');
    const shown = page.locator('.lens-block:visible');
    await expect(shown).toHaveCount(1);
    await expect(shown.first()).toHaveAttribute('data-actor', 'client');
  });

  test('a chosen seat survives navigation and is applied before paint', async ({ page }) => {
    await page.goto('/mechanisms/mech.recruiter_volume_quota_incentive_distortion?lang=en&lens=hiring-manager');
    await page.goto('/barriers/bar.technical_screen_live_assessment?lang=en');
    await expect(page.locator('html')).toHaveAttribute('data-lens', 'hiring-manager');
    // No flash: the attribute is on <html> from the inline script, not from a
    // module that runs after first paint.
    const applied = await page.evaluate(() => document.documentElement.dataset.lens);
    expect(applied).toBe('hiring-manager');
  });

  test('the picker changes the seat and clears back to everyone', async ({ page }) => {
    await page.goto('/barriers/bar.technical_screen_live_assessment?lang=en');
    await page.locator('.lens-menu > summary').click();
    await page.locator('.lens-menu .lens-option[data-lens="candidate"]').click();
    await expect(page.locator('html')).toHaveAttribute('data-lens', 'candidate');

    await page.locator('.lens-menu > summary').click();
    await page.locator('.lens-menu .lens-option[data-lens=""]').click();
    await expect(page.locator('html')).not.toHaveAttribute('data-lens', /.+/);
  });
});

test.describe('actors', () => {
  test('every seat says what it decides, cannot see, and could do', async ({ page }) => {
    await page.goto('/actors?lang=en');
    const rows = page.locator('.row-list > li');
    // One row per actor in the registry — pinned to the source, not to a number.
    await expect(rows).toHaveCount(actorCount);

    await page.goto('/actors/recruiter?lang=en');
    await expect(page.getByRole('heading', { name: /decides/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /cannot see/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /measured on/i })).toBeVisible();

    const recommendations = page.locator('ol.row-list > li');
    expect(await recommendations.count()).toBeGreaterThan(2);
    // Nothing here is free, and each one says what it costs.
    for (let i = 0; i < (await recommendations.count()); i++) {
      await expect(recommendations.nth(i)).toContainText(/what it costs/i);
    }
  });

  test('offers to read the whole atlas from one seat', async ({ page }) => {
    await page.goto('/actors/ats-vendor?lang=en');
    await page.getByRole('link', { name: /read the whole atlas from here/i }).first().click();
    await expect(page.locator('html')).toHaveAttribute('data-lens', 'ats-vendor');
  });
});
