import { expect, test } from '@playwright/test';

/**
 * Grouped navigation.
 *
 * Eight flat links plus an overflow menu was a list of words with no shape: a
 * reader could not tell that the graph and the registry are the same material
 * seen twice, or that the API and the aggregates are one concern. The bar now
 * carries the way in and four groups, and each group entry says what it is for.
 */
test.describe('navigation', () => {
  test.use({ locale: 'uk-UA' });

  test('the bar is one way in and four groups, not a list of words', async ({ page }) => {
    await page.goto('/registry');
    const bar = page.locator('header nav[aria-label="Primary"]');
    await expect(bar.locator('> a')).toHaveCount(1); // the way in
    await expect(bar.locator('.nav-group')).toHaveCount(4);

    // Every destination lives in exactly one group, and says what it is for.
    const entries = bar.locator('.nav-entry');
    expect(await entries.count()).toBe(12);
    const hrefs = await entries.evaluateAll((els) => els.map((e) => e.getAttribute('href')));
    expect(new Set(hrefs).size).toBe(hrefs.length);
    for (let i = 0; i < (await entries.count()); i++) {
      await expect(entries.nth(i).locator('.nav-entry-desc')).not.toBeEmpty();
    }
  });

  test('opens one group at a time and marks the one you are in', async ({ page }) => {
    await page.goto('/registry');
    const groups = page.locator('header .nav-group');

    await groups.nth(0).locator('summary').click();
    await expect(page.locator('header .nav-group[open]')).toHaveCount(1);
    await groups.nth(2).locator('summary').click();
    await expect(page.locator('header .nav-group[open]')).toHaveCount(1);

    await page.keyboard.press('Escape');
    await expect(page.locator('header .nav-group[open]')).toHaveCount(0);

    // /registry lives under the first group, which reads as current.
    await expect(groups.nth(0).locator('summary')).toHaveClass(/nav-link-active/);
  });

  test('the drawer carries the same groups', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/registry');
    const drawer = page.locator('#mobile-nav');
    await drawer.locator('summary').click();
    // Four groups, plus the point-of-view picker, which is a control not a group.
    for (const group of ['Атлас', 'Процес', 'Дані', 'Проєкт']) {
      await expect(drawer.locator('.nav-drawer .kicker').filter({ hasText: new RegExp(`^${group}$`) })).toHaveCount(1);
    }
    await expect(drawer.locator('.nav-drawer a[href$="/registry"]')).toHaveCount(1);
  });

  test('the drawn mascot is gone; only the mark remains', async ({ page }) => {
    for (const path of ['/about', '/404']) {
      await page.goto(path);
      // The mark is one small svg in the header and one in the footer.
      const svgs = await page.locator('main svg').count();
      expect(svgs, `${path} still draws something in the body`).toBe(0);
    }
  });
});
