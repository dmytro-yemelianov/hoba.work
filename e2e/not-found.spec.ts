import { says } from './says';
import { expect, test } from '@playwright/test';

test.describe('missing pages', () => {
  test('answer 404 in the language the reader was already being served', async ({ browser }) => {
    for (const [locale, lang] of [
      ['en-US', 'en'],
      ['uk-UA', 'uk'],
    ] as const) {
      const context = await browser.newContext({ locale });
      const page = await context.newPage();
      const response = await page.goto('/mechanisms/M-999');
      expect(response!.status(), locale).toBe(404);
      // Prerendered per language tree — no runtime sniffing, no hidden copy.
      await expect(page.getByRole('heading', { level: 1 }), locale).toHaveText(
        says(lang, 'nf.heading')
      );
      await expect(page.locator('html'), locale).toHaveAttribute('lang', locale.slice(0, 2));
      await context.close();
    }
  });

  test('offer a way back that carries no language', async ({ page }) => {
    await page.goto('/does-not-exist');
    const hrefs = await page
      .locator('main a')
      .evaluateAll((as) => as.map((a) => a.getAttribute('href')!));
    expect(hrefs).toContain('/registry');
    expect(hrefs.filter((h) => /\/uk(\/|$)/.test(h))).toEqual([]);
  });
});
