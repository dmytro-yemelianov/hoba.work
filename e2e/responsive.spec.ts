import { expect, test, type Page } from '@playwright/test';

const PAGES = ['/uk/', '/uk/registry', '/uk/patterns', '/uk/graph', '/uk/data', '/uk/analyze', '/uk/methodology', '/uk/mechanisms/M-001'];
const WIDTHS = [360, 768, 1280];

/** Anything wider than the viewport means a layout leak, not a design choice. */
async function overflow(page: Page): Promise<number> {
  return page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
}

test.describe('responsive layout', () => {
  for (const width of WIDTHS) {
    test(`no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      for (const path of PAGES) {
        await page.goto(path);
        expect(await overflow(page), `${path} @ ${width}`).toBeLessThanOrEqual(1);
      }
    });
  }

  test('every page opens with the same header block', async ({ page }) => {
    for (const path of ['/uk/registry', '/uk/data', '/uk/methodology', '/uk/mechanisms/M-001', '/uk/analyze']) {
      await page.goto(path);
      const h1 = page.getByRole('heading', { level: 1 });
      await expect(h1, path).toHaveCount(1);
      await expect(h1, path).toBeVisible();
      // One shared measure: the main column is never wider than the app container.
      const width = await page.locator('main').evaluate((el) => el.getBoundingClientRect().width);
      expect(width, path).toBeLessThanOrEqual(1280);
    }
  });

  test('wide tables scroll inside their own box', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 900 });
    await page.goto('/uk/registry');
    const scroller = page.locator('div[data-view="table"]');
    await expect(scroller).toHaveCSS('overflow-x', 'auto');
    expect(await overflow(page)).toBeLessThanOrEqual(1);
  });
});
