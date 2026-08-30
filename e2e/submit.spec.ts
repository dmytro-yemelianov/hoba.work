import { expect, test } from '@playwright/test';

/**
 * The form exists because /contribute used to point only at GitHub, which is a
 * wall for the reader whose absence from the registry matters most: someone who
 * has just been rejected, has no account, and is not going to make one.
 *
 * The preview has no D1 binding, so the endpoint answers 503 rather than
 * storing. That is the interesting half to test anyway — the page must say
 * something a person can act on whatever comes back.
 */
test.describe('sending what the atlas does not have', () => {
  test('the form is reachable, labelled, and refuses a fragment before sending', async ({ page }) => {
    await page.goto('/contribute?lang=en#contrib-send');
    const body = page.locator('#submit-body');
    await expect(body).toBeVisible();
    // Every control has a label a screen reader can use.
    for (const id of ['#submit-body', '#submit-stage', '#submit-contact']) {
      const control = page.locator(id);
      await expect(control).toHaveAccessibleName(/.+/);
    }
    await body.fill('rejected');
    await page.getByRole('button', { name: /send/i }).click();
    // The browser stops it: minlength is on the element, not only in the worker.
    await expect(page.locator('#submit-status')).toHaveText('');
  });

  test('a real account reaches the endpoint and the page reports what came back', async ({ page }) => {
    await page.goto('/contribute?lang=en#contrib-send');
    await page.locator('#submit-body').fill(
      'The rejection arrived four minutes after I applied, with no interview and no named reason.'
    );
    await page.getByRole('button', { name: /send/i }).click();
    await expect(page.locator('#submit-status')).not.toHaveText('', { timeout: 10_000 });
  });

  test('every reader page offers the way to say the atlas is missing something', async ({ page }) => {
    for (const reader of ['candidate', 'recruiter', 'researcher']) {
      await page.goto(`/for/${reader}?lang=en`);
      const link = page.locator(`a[href*="/contribute?from=${reader}"]`);
      await expect(link).toBeVisible();
    }
  });
});
