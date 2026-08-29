import { says } from './says';
import { expect, test } from '@playwright/test';

/**
 * One URL per page. Language is resolved per request from an explicit `?lang=`,
 * the reader's cookie, `Accept-Language`, then geography — never from the path.
 */
test.describe('language without a URL', () => {
  test('no public link carries a language', async ({ page }) => {
    await page.goto('/registry');
    const hrefs = await page
      .locator('a[href^="/"]')
      .evaluateAll((as) => as.map((a) => a.getAttribute('href')!));
    expect(hrefs.length).toBeGreaterThan(20);
    // Neither the old mirror nor the internal build trees may appear.
    expect(hrefs.filter((h) => /^\/uk(\/|$)/.test(h))).toEqual([]);
    expect(hrefs.filter((h) => h.startsWith('/_i/'))).toEqual([]);
    // The switcher is the one exception, and it uses a query.
    const switcher = await page.locator('[data-lang-switch]').evaluateAll((as) => as.map((a) => a.getAttribute('href')!));
    expect(switcher.every((h) => h.includes('lang='))).toBe(true);
    expect(switcher.every((h) => !h.includes('/uk'))).toBe(true);
  });

  test('the canonical URL is the language-free one, in either language', async ({ page }) => {
    for (const lang of ['en', 'uk']) {
      await page.goto(`/mechanisms/M-001?lang=${lang}`);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://hoba.work/mechanisms/M-001');
      await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', 'https://hoba.work/mechanisms/M-001');
      await expect(page.locator('html')).toHaveAttribute('lang', lang);
    }
    // Nothing to alternate between any more.
    await expect(page.locator('link[rel="alternate"]')).toHaveCount(0);
  });

  test('Accept-Language decides when nothing else does', async ({ browser }) => {
    for (const [locale, expected] of [
      ['uk-UA', 'uk'],
      ['en-US', 'en'],
    ] as const) {
      const context = await browser.newContext({ locale });
      const page = await context.newPage();
      const response = await page.goto('/registry');
      expect(response!.headers()['content-language'], locale).toBe(expected);
      await expect(page.locator('html')).toHaveAttribute('lang', expected);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(says(expected, 'registry.title'));
      await context.close();
    }
  });

  test('?lang= overrides the browser and is remembered', async ({ browser }) => {
    const context = await browser.newContext({ locale: 'en-US' });
    const page = await context.newPage();

    await page.goto('/registry?lang=uk');
    await expect(page.locator('html')).toHaveAttribute('lang', 'uk');

    // The cookie the override wrote keeps the next, bare navigation Ukrainian.
    await page.goto('/patterns');
    await expect(page.locator('html')).toHaveAttribute('lang', 'uk');
    await context.close();
  });

  test('the switcher stays on the page and survives a reload', async ({ browser }) => {
    const context = await browser.newContext({ locale: 'en-US' });
    const page = await context.newPage();
    await page.goto('/mechanisms/M-001');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');

    await page.locator('[data-lang-switch="uk"]').click();
    await expect(page).toHaveURL(/\/mechanisms\/M-001/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'uk');

    await page.goto('/mechanisms/M-001');
    await expect(page.locator('html')).toHaveAttribute('lang', 'uk');
    await context.close();
  });

  test('every link shared before the change still resolves', async ({ page }) => {
    for (const [legacy, target] of [
      ['/uk/', '/'],
      ['/uk/registry', '/registry'],
      ['/uk/mechanisms/M-001', '/mechanisms/M-001'],
      ['/_i/uk/patterns', '/patterns'],
    ] as const) {
      const response = await page.goto(legacy);
      expect(new URL(page.url()).pathname, legacy).toBe(target);
      expect(response!.status(), legacy).toBe(200);
    }
  });

  test('a reader who chose Ukrainian sees no English interface strings', async ({ browser }) => {
    const context = await browser.newContext({ locale: 'uk-UA' });
    const page = await context.newPage();
    for (const path of ['/', '/registry', '/analyze', '/mechanisms/M-001']) {
      await page.goto(path);
      const nav = await page.locator('header nav a').allInnerTexts();
      expect(nav.join(' '), path).not.toMatch(/\b(Registry|Patterns|Graph|Data|Analyze)\b/);
    }
    await context.close();
  });
});

test.describe('every page reaches the worker', () => {
  // A route-exclusion pattern that swallows a page is invisible until someone
  // opens it: the page 404s while every other test stays green.
  const PAGES = [
    '/', '/analyze', '/registry', '/patterns', '/graph', '/process', '/eras', '/actors', '/check', '/data',
    '/methodology', '/developers', '/contribute', '/about',
    '/artifacts/A-013', '/barriers/bar.headcount_executive_budget_approval', '/mechanisms/M-001',
    '/patterns/pat.seniority_double_bind', '/loops/L-001', '/interventions/I-002', '/actors/recruiter',
  ];

  for (const path of PAGES) {
    test(`${path} is language-negotiated`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response!.status(), path).toBe(200);
      // Only the worker sets this; a static hit would not.
      expect(response!.headers()['content-language'], path).toMatch(/^(en|uk)$/);
    });
  }
});
