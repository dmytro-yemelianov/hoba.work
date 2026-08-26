import { expect, test } from '@playwright/test';

test.describe('internationalisation', () => {
  test('Ukrainian pages are fully localised and keep the visitor in Ukrainian', async ({ page }) => {
    await page.goto('/uk/registry');
    await expect(page.locator('html')).toHaveAttribute('lang', 'uk');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Каталог реєстру');

    // primary navigation is prefixed
    const navHrefs = await page.locator('header nav a:not([target="_blank"])').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
    expect(navHrefs.length).toBeGreaterThan(5);
    for (const href of navHrefs) expect(href).toMatch(/^\/uk(\/|$)/);

    // entity link from the table keeps the locale
    await page.locator('[data-view="table"] tr.node-item a').first().click();
    await expect(page).toHaveURL(/\/uk\/(artifacts|barriers|mechanisms|patterns|loops|interventions)\/[A-Z]-\d{3}/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'uk');
  });

  test('language switcher keeps the same page and records the choice', async ({ page, context }) => {
    await page.goto('/mechanisms/M-001');
    await page.locator('[data-lang-switch="uk"]').click();
    await expect(page).toHaveURL(/\/uk\/mechanisms\/M-001\/?$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'uk');
    const cookie = (await context.cookies()).find((c) => c.name === 'hoba_lang');
    expect(cookie?.value).toBe('uk');

    await page.locator('[data-lang-switch="en"]').click();
    await expect(page).toHaveURL(/\/mechanisms\/M-001\/?$/);
    expect((await context.cookies()).find((c) => c.name === 'hoba_lang')?.value).toBe('en');
  });

  test('every page advertises hreflang alternates', async ({ page }) => {
    for (const path of ['/', '/uk/', '/patterns/P-001', '/uk/analyze']) {
      await page.goto(path);
      const alternates = await page.locator('link[rel="alternate"]').evaluateAll((ls) =>
        ls.map((l) => `${l.getAttribute('hreflang')}=${l.getAttribute('href')}`)
      );
      expect(alternates.some((a) => a.startsWith('en=https://hoba.work/'))).toBe(true);
      expect(alternates.some((a) => a.startsWith('uk=https://hoba.work/uk'))).toBe(true);
      expect(alternates.some((a) => a.startsWith('x-default='))).toBe(true);
    }
  });

  test('no English interface strings leak into Ukrainian pages', async ({ page }) => {
    const leaks = ['Registry Directory', 'View node', 'Evidence:', 'Compatible mechanisms', 'Download', 'Search by'];
    for (const path of ['/uk/registry', '/uk/mechanisms/M-001', '/uk/analyze', '/uk/data']) {
      await page.goto(path);
      const text = await page.locator('main').innerText();
      for (const leak of leaks) expect(text, `${leak} on ${path}`).not.toContain(leak);
    }
  });
});
