import { expect, test } from '@playwright/test';

test('graph explorer renders and filters without errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/uk/graph');
  await expect(page.locator('#cy canvas').first()).toBeAttached();
  await page.locator('#select-removability').selectOption('candidate');
  await page.locator('.type-toggle[data-type="artifact"]').uncheck();
  await page.locator('#theme-toggle').click(); // triggers a restyle
  expect(errors).toEqual([]);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Провідник графа знань');
});
