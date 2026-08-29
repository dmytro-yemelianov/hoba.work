import { expect, test } from '@playwright/test';

/** A card that only carried a title would be a link preview. This one leads with the tell. */
test.describe('share cards', () => {
  test('every entity page declares its own card', async ({ page }) => {
    for (const [path, id] of [
      ['/artifacts/obs.rejection_within_minutes_of_application_submission', 'obs.rejection_within_minutes_of_application_submission'], ['/barriers/bar.headcount_executive_budget_approval', 'bar.headcount_executive_budget_approval'], ['/mechanisms/mech.employment_gap_downranking_bias', 'mech.employment_gap_downranking_bias'],
      ['/patterns/pat.compensation_double_bind', 'pat.compensation_double_bind'], ['/loops/loop.employment_gap_penalty_loop', 'loop.employment_gap_penalty_loop'], ['/interventions/int.upfront_compensation_band_disclosure', 'int.upfront_compensation_band_disclosure'],
    ] as const) {
      const response = await page.goto(path);
      const lang = response!.headers()['content-language'];
      await expect(page.locator('meta[property="og:image"]'), path).toHaveAttribute('content', `https://hoba.work/cards/${lang}/${id}.png`);
      await expect(page.locator('meta[name="twitter:card"]'), path).toHaveAttribute('content', 'summary_large_image');
    }
  });

  test('the declared card is actually served, in both languages', async ({ request }) => {
    for (const url of ['/cards/en/obs.rejection_within_minutes_of_application_submission.png', '/cards/uk/obs.rejection_within_minutes_of_application_submission.png', '/cards/uk/mech.employment_gap_downranking_bias.png', '/cards/en/int.upfront_compensation_band_disclosure.png']) {
      const response = await request.get(url);
      expect(response.status(), url).toBe(200);
      expect(response.headers()['content-type'], url).toContain('image/png');
      // A real render, not a placeholder.
      expect((await response.body()).length, url).toBeGreaterThan(10_000);
    }
  });

  test('observations and patterns also have a postcard', async ({ request }) => {
    for (const url of ['/cards/uk/obs.feedback_stating_candidate_is_overqualified_for_the_grade-postcard.png', '/cards/en/pat.seniority_double_bind-postcard.png']) {
      const response = await request.get(url);
      expect(response.status(), url).toBe(200);
      expect(response.headers()['content-type'], url).toContain('image/png');
    }
    // Mechanisms deliberately do not, so the deploy stays small.
    expect((await request.get('/cards/en/mech.genuine_technical_skill_shortfall-postcard.png')).status()).toBe(404);
  });

  test('the page offers the card for download', async ({ page }) => {
    // The href follows the language the worker resolved, so read it rather than
    // assuming one — otherwise the test depends on where it runs.
    const response = await page.goto('/artifacts/obs.feedback_stating_candidate_is_overqualified_for_the_grade');
    const lang = response!.headers()['content-language'];
    await expect(page.locator(`main a[href="/cards/${lang}/obs.feedback_stating_candidate_is_overqualified_for_the_grade.png"][download]`)).toBeVisible();
    await expect(page.locator(`main a[href="/cards/${lang}/obs.feedback_stating_candidate_is_overqualified_for_the_grade-postcard.png"][download]`)).toBeVisible();
  });

  test('cards are served from disk, not through the worker', async ({ request }) => {
    const response = await request.get('/cards/en/obs.rejection_within_minutes_of_application_submission.png');
    expect(response.headers()['content-language']).toBeUndefined();
  });
});
