import { expect, test } from '@playwright/test';

const SECTIONS = ['Аналіз', 'Реєстр', 'Патерни', 'Граф', 'Дані', 'Методологія', 'Розробникам', 'Долучитися', 'Про проєкт'];

test.describe('mobile navigation', () => {
  test.use({ locale: 'uk-UA' });

  test('the drawer exposes every section and closes on navigation', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('header nav[aria-label="Primary"]')).toBeHidden();

    const drawer = page.locator('#mobile-nav');
    await drawer.locator('summary').click();
    const links = drawer.locator('.nav-drawer a');
    for (const name of SECTIONS) {
      await expect(links.filter({ hasText: new RegExp(`^${name}$`) })).toHaveCount(1);
    }
    // The drawer owns the screen while it is open.
    await expect(page.locator('body')).toHaveClass(/overflow-hidden/);

    await links.filter({ hasText: /^Реєстр$/ }).click();
    await expect(page).toHaveURL(/\/registry\/?$/);
    await expect(page.locator('#mobile-nav')).not.toHaveAttribute('open', '');
  });

  test('Escape closes the drawer', async ({ page }) => {
    await page.goto('/');
    await page.locator('#mobile-nav summary').click();
    await expect(page.locator('#mobile-nav')).toHaveAttribute('open', '');
    await page.keyboard.press('Escape');
    await expect(page.locator('#mobile-nav')).not.toHaveAttribute('open', '');
    await expect(page.locator('body')).not.toHaveClass(/overflow-hidden/);
  });

  test('the graph explorer is usable on a phone', async ({ page }) => {
    await page.goto('/graph');
    const canvas = page.locator('#graph-canvas');
    await expect(canvas).toBeVisible();
    const box = (await canvas.boundingBox())!;
    expect(box.width).toBeLessThanOrEqual(page.viewportSize()!.width);
    // A tall canvas must not swallow the page scroll.
    await expect(canvas).toHaveCSS('touch-action', 'pan-y');
  });
});
