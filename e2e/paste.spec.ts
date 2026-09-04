import { expect, test } from '@playwright/test';

/**
 * The wizard asks a person to translate what happened into the atlas's
 * vocabulary before it can help. This reads the letter itself — which is the
 * only version of the interaction a reader arrives already able to perform.
 */
test.describe('reading a pasted rejection', () => {
  test('names the trace a template rejection leaves, and offers to continue with it', async ({
    page,
  }) => {
    await page.goto('/analyze?lang=en#paste-box');
    await page
      .locator('#paste-input')
      .fill(
        'Thank you for your interest. After careful review we have decided to move forward with candidates whose experience more closely aligns with the requirements of the role.'
      );
    await page.getByRole('button', { name: /read it/i }).click();
    const result = page.locator('#paste-result');
    await expect(result).toBeVisible();
    await expect(
      result.getByRole('link', { name: /alignment|aligns|template/i }).first()
    ).toBeVisible();
    await expect(result.getByRole('button', { name: /continue/i })).toBeVisible();
  });

  /** The claim the whole atlas rests on: it says when it does not know. */
  test('says so when the letter names no reason', async ({ page }) => {
    await page.goto('/analyze?lang=en#paste-box');
    await page
      .locator('#paste-input')
      .fill(
        'Thank you for your application to the backend engineer role. After careful review of your application we will not be moving forward.'
      );
    await page.getByRole('button', { name: /read it/i }).click();
    await expect(page.locator('#paste-result')).toContainText(/identifies this letter/i);
    await expect(
      page.locator('#paste-result').getByRole('button', { name: /continue/i })
    ).toHaveCount(0);
  });

  test('sends a reader whose case is not here to the form, from the analyze page', async ({
    page,
  }) => {
    await page.goto('/analyze?lang=en#paste-box');
    await page
      .locator('#paste-input')
      .fill('the quick brown fox jumps over the lazy dog again and again');
    await page.getByRole('button', { name: /read it/i }).click();
    await expect(page.locator('#paste-result')).toContainText(/resembles this/i);
    await expect(page.locator('#paste-result a[href*="contribute?from=analyze"]')).toBeVisible();
  });
});
