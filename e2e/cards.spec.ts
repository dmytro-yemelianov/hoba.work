import { expect, test } from '@playwright/test';

/** A card that only carried a title would be a link preview. This one leads with the tell. */
test.describe('share cards', () => {
  test('every entity page declares its own card', async ({ page }) => {
    for (const [path, id] of [
      ['/artifacts/A-009', 'A-009'], ['/barriers/B-010', 'B-010'], ['/mechanisms/M-011', 'M-011'],
      ['/patterns/pat.compensation_double_bind', 'pat.compensation_double_bind'], ['/loops/L-001', 'L-001'], ['/interventions/I-002', 'I-002'],
    ] as const) {
      const response = await page.goto(path);
      const lang = response!.headers()['content-language'];
      await expect(page.locator('meta[property="og:image"]'), path).toHaveAttribute('content', `https://hoba.work/cards/${lang}/${id}.png`);
      await expect(page.locator('meta[name="twitter:card"]'), path).toHaveAttribute('content', 'summary_large_image');
    }
  });

  test('the declared card is actually served, in both languages', async ({ request }) => {
    for (const url of ['/cards/en/A-009.png', '/cards/uk/A-009.png', '/cards/uk/M-011.png', '/cards/en/I-002.png']) {
      const response = await request.get(url);
      expect(response.status(), url).toBe(200);
      expect(response.headers()['content-type'], url).toContain('image/png');
      // A real render, not a placeholder.
      expect((await response.body()).length, url).toBeGreaterThan(10_000);
    }
  });

  test('observations and patterns also have a postcard', async ({ request }) => {
    for (const url of ['/cards/uk/A-013-postcard.png', '/cards/en/pat.seniority_double_bind-postcard.png']) {
      const response = await request.get(url);
      expect(response.status(), url).toBe(200);
      expect(response.headers()['content-type'], url).toContain('image/png');
    }
    // Mechanisms deliberately do not, so the deploy stays small.
    expect((await request.get('/cards/en/M-001-postcard.png')).status()).toBe(404);
  });

  test('the page offers the card for download', async ({ page }) => {
    // The href follows the language the worker resolved, so read it rather than
    // assuming one — otherwise the test depends on where it runs.
    const response = await page.goto('/artifacts/A-013');
    const lang = response!.headers()['content-language'];
    await expect(page.locator(`main a[href="/cards/${lang}/A-013.png"][download]`)).toBeVisible();
    await expect(page.locator(`main a[href="/cards/${lang}/A-013-postcard.png"][download]`)).toBeVisible();
  });

  test('cards are served from disk, not through the worker', async ({ request }) => {
    const response = await request.get('/cards/en/A-009.png');
    expect(response.headers()['content-language']).toBeUndefined();
  });
});
