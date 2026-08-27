import { expect, test } from '@playwright/test';

/**
 * The conformance check.
 *
 * The failures that matter here are not layout. They are the page quietly
 * turning into something it must not be: a scorer, a rewriter, or a thing that
 * prints a probability. Each of those would look fine in a screenshot, so they
 * are asserted.
 */
test.describe('conformance check', () => {
  test('says nothing until it is given something', async ({ page }) => {
    await page.goto('/check?lang=en');
    await expect(page.locator('#check-verdict')).toContainText(/fill in anything above/i);
    await expect(page.locator('#check-gates > li')).toHaveCount(0);
  });

  test('reports the first gate a run would actually stop at', async ({ page }) => {
    await page.goto('/check?lang=en');
    await page.fill('#years', '2');
    await page.fill('#requiredYears', '5');
    await page.fill('#located', 'Ukraine');
    await page.fill('#hiringLocations', 'Germany, Poland');
    await page.fill('#expectation', '200');
    await page.fill('#bandMin', '50');
    await page.fill('#bandMax', '80');

    // Three conditions fail; the one named is the earliest in the funnel.
    await expect(page.locator('#check-verdict')).toContainText('B-002');
    await expect(page.locator('#check-verdict')).not.toContainText('B-009');
  });

  test('never turns a missing keyword into a failure', async ({ page }) => {
    await page.goto('/check?lang=en');
    await page.fill('#skills', 'go');
    await page.fill('#requiredSkills', 'go, kubernetes, rust');

    const gate = page.locator('#check-gates > li').first();
    await expect(gate).toContainText(/cannot be determined/i);
    await expect(gate).toContainText('kubernetes, rust');
    // Nothing failed, so no stop is claimed.
    await expect(page.locator('#check-verdict')).toContainText(/nothing you have entered fails/i);
  });

  test('calls a requirement nobody could meet a fact about the posting', async ({ page }) => {
    await page.goto('/check?lang=en');
    await page.fill('#requiredYears', '8');
    await page.fill('#technologyAge', '5');
    await expect(page.locator('#check-gates > li').first()).toContainText(/nobody could meet it/i);
  });

  test('refuses to be a scorer, a rewriter or a fortune teller', async ({ page }) => {
    await page.goto('/check?lang=en');
    await page.fill('#years', '2');
    await page.fill('#requiredYears', '5');

    const body = (await page.locator('main').innerText()).toLowerCase();
    // The refusal is on the page, in words.
    expect(body).toContain('how likely you are to be hired');
    // And nothing that would undo it.
    for (const forbidden of ['% chance', 'probability of success', 'score:', 'optimise your cv', 'improve your cv']) {
      expect(body, forbidden).not.toContain(forbidden);
    }
    // No field invites a document, because the page must not rewrite one.
    await expect(page.locator('input[type="file"]')).toHaveCount(0);
  });

  test('keeps everything in the page', async ({ page }) => {
    const posted: string[] = [];
    page.on('request', (r) => {
      if (r.method() !== 'GET') posted.push(`${r.method()} ${r.url()}`);
    });
    await page.goto('/check?lang=en');
    await page.fill('#expectation', '95000');
    await page.fill('#located', 'Kyiv');
    await page.waitForTimeout(300);
    expect(posted, 'the page sent something somewhere').toEqual([]);
  });
});
