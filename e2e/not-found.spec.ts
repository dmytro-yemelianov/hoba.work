import { expect, test } from '@playwright/test';

test('missing pages return 404 in the visitor language', async ({ page }) => {
  const en = await page.goto('/mechanisms/M-999');
  expect(en?.status()).toBe(404);
  await expect(page.locator('[data-nf-lang="en"]')).toBeVisible();

  const uk = await page.goto('/uk/does-not-exist');
  expect(uk?.status()).toBe(404);
  await expect(page.locator('[data-nf-lang="uk"]')).toBeVisible();
  await expect(page.locator('[data-nf-lang="en"]')).toBeHidden();
});
