import { expect, test } from '@playwright/test';

test.describe('theme', () => {
  test('follows the system preference when nothing is stored', async ({ browser }) => {
    for (const [scheme, dark] of [['light', false], ['dark', true]] as const) {
      const context = await browser.newContext({ colorScheme: scheme });
      const page = await context.newPage();
      await page.goto('/');
      expect(await page.evaluate(() => document.documentElement.classList.contains('dark'))).toBe(dark);
      await context.close();
    }
  });

  test('toggle persists across reloads and pages and beats the system preference', async ({ browser }) => {
    const context = await browser.newContext({ colorScheme: 'dark' });
    const page = await context.newPage();
    await page.goto('/');
    await page.locator('#theme-toggle').click();
    expect(await page.evaluate(() => document.documentElement.classList.contains('dark'))).toBe(false);
    expect(await page.evaluate(() => localStorage.getItem('hoba_theme'))).toBe('light');

    await page.reload();
    expect(await page.evaluate(() => document.documentElement.classList.contains('dark'))).toBe(false);
    await page.goto('/uk/registry');
    expect(await page.evaluate(() => document.documentElement.classList.contains('dark'))).toBe(false);

    // surfaces actually change colour
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(bg).not.toBe('rgb(10, 12, 16)');
    await context.close();
  });
});
