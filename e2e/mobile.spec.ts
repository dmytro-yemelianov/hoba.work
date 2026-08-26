import { expect, test } from '@playwright/test';

test('mobile navigation menu exposes every section', async ({ page }) => {
  await page.goto('/uk/');
  await expect(page.locator('header nav[aria-label="Primary"]')).toBeHidden();
  await page.locator('header details summary').click();
  const links = page.locator('header details nav a');
  await expect(links).toHaveCount(9);
  await links.filter({ hasText: 'Реєстр' }).click();
  await expect(page).toHaveURL(/\/uk\/registry\/?$/);
});
