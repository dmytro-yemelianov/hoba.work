import { entryCount } from './says';
import { expect, test } from '@playwright/test';

const visibleCount = (page: import('@playwright/test').Page, sel: string) =>
  page.locator(sel).evaluateAll((els) => els.filter((e) => !e.classList.contains('hidden')).length);

test.describe('registry data views', () => {
  test('table is the default view and the choice persists', async ({ page }) => {
    await page.goto('/registry');
    await expect(page.locator('[data-view-root] > [data-view="table"]')).toBeVisible();
    await expect(page.locator('[data-view-root] > [data-view="cards"]')).toBeHidden();
    await expect(page.locator('[data-view-choice="table"]')).toHaveAttribute('aria-pressed', 'true');
    expect(await page.locator('[data-view="table"] tr.node-item').count()).toBe(entryCount());

    await page.locator('[data-view-choice="list"]').click();
    await expect(page.locator('[data-view-root] > [data-view="list"]')).toBeVisible();
    await page.reload();
    await expect(page.locator('[data-view-root] > [data-view="list"]')).toBeVisible();
    await expect(page.locator('[data-view-root] > [data-view="table"]')).toBeHidden();

    await page.goto('/patterns');
    await expect(page.locator('[data-view-root] > [data-view="list"]')).toBeVisible();
  });

  test('filters apply to every view and support ?type= deep links', async ({ page }) => {
    await page.goto('/registry?type=loop');
    expect(await visibleCount(page, '[data-view="table"] tr.node-item')).toBe(3);
    await expect(page.locator('.type-tab[data-type="loop"]')).toHaveAttribute('aria-selected', 'true');

    await page.locator('[data-view-choice="cards"]').click();
    expect(await visibleCount(page, '[data-view-root] > [data-view="cards"] .node-item')).toBe(3);

    await page.locator('.removability-filter[data-removability="candidate"]').click();
    expect(await visibleCount(page, '[data-view-root] > [data-view="cards"] .node-item')).toBe(0);
    await expect(page.locator('#no-results')).toBeVisible();

    await page.locator('.type-tab[data-type="mechanism"]').click();
    expect(await visibleCount(page, '[data-view-root] > [data-view="cards"] .node-item')).toBe(6);
    await expect(page).toHaveURL(/type=mechanism/);

    await page.locator('#search-input').fill('parser');
    expect(await visibleCount(page, '[data-view-root] > [data-view="cards"] .node-item')).toBe(1);
  });
});
