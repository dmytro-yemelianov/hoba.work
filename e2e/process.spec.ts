import { expect, test } from '@playwright/test';

/**
 * The player and the two axes it anchors.
 *
 * The interesting failures here are silent ones: a canvas that renders but
 * never steps, a deep link that lands on the wrong machine, an era figure that
 * prints with no source behind it. Each of those looks fine in a screenshot.
 */
test.describe('the process player', () => {
  test('steps through a machine and the detail follows the state', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/process?lang=en');

    // The canonical path leads, because everything else is a departure from it.
    const first = page.locator('[data-workflow]').first();
    await expect(first).toHaveAttribute('data-workflow', 'WF-003');

    const canvas = page.locator('canvas.wf-canvas[data-index="0"]');
    await expect(canvas).toBeVisible();
    expect(await canvas.evaluate((c) => (c as HTMLCanvasElement).width)).toBeGreaterThan(300);

    const step = page.locator('.wf-step[data-index="0"]');
    const detail = page.locator('.wf-detail[data-index="0"]');
    await expect(step).toHaveText(/1/);
    const opening = await detail.innerText();

    await page.locator('.wf-next[data-index="0"]').click();
    await expect(step).toHaveText(/2/);
    expect(await detail.innerText(), 'the detail panel did not follow the step').not.toBe(opening);

    await page.locator('.wf-prev[data-index="0"]').click();
    await expect(step).toHaveText(/1/);

    await page.locator('.wf-scrub[data-index="0"]').fill('5');
    await page.locator('.wf-scrub[data-index="0"]').dispatchEvent('input');
    await expect(step).toHaveText(/6/);

    await page.locator('.wf-reset[data-index="0"]').click();
    await expect(step).toHaveText(/1/);
    expect(errors).toEqual([]);
  });

  test('plays and pauses', async ({ page }) => {
    await page.goto('/process?lang=en');
    const play = page.locator('.wf-play[data-index="0"]');
    const step = page.locator('.wf-step[data-index="0"]');
    await play.click();
    await expect(play).toHaveText(/pause/i);
    await expect(step).toHaveText(/Step 2/, { timeout: 5000 });
    await play.click();
    await expect(play).toHaveText(/play/i);
  });

  test('the same machine is readable with the canvas ignored', async ({ page }) => {
    await page.goto('/process?lang=en');
    const fallback = page.locator('[data-workflow="WF-003"] details');
    await fallback.locator('summary').click();
    await expect(fallback.locator('li[id^="WF-003-"]')).toHaveCount(15);
    await expect(fallback.locator('#WF-003-declined')).toContainText(/decline/i);
  });
});

test.describe('the canonical path anchors the registry', () => {
  test('a barrier says which commitment it breaks, and the link lands on it', async ({ page }) => {
    await page.goto('/barriers/B-002?lang=en');
    const note = page.getByRole('region', { name: /canonical path/i });
    await expect(note).toContainText('Machine work stays mechanical');

    await note.getByRole('link').first().click();
    await expect(page).toHaveURL(/\/process#WF-003-machine-check$/);
    await expect(page.locator('.wf-detail[data-index="0"]')).toContainText('machine-check');
  });

  test('an entity says which era made it ordinary', async ({ page }) => {
    await page.goto('/mechanisms/M-024?lang=en');
    const note = page.getByRole('region', { name: /made this ordinary/i });
    await expect(note).toContainText('A fixed number of seats');
    await note.getByRole('link').first().click();
    await expect(page).toHaveURL(/\/eras#E-004$/);
  });
});

test.describe('eras', () => {
  test('prints no figure without a source a reader can open', async ({ page }) => {
    await page.goto('/eras?lang=en');
    const rows = page.locator('.era-indicator');
    expect(await rows.count(), 'no indicators rendered').toBeGreaterThan(10);

    const unsourced = await page.evaluate(() =>
      [...document.querySelectorAll('.era-indicator')]
        .filter((li) => li.querySelector('a[href^="https://"]') === null)
        .map((li) => li.textContent?.trim().slice(0, 60) ?? '')
    );
    expect(unsourced, 'an indicator rendered without an external source link').toEqual([]);
  });

  test('the timeline runs unbroken and ends where we are', async ({ page }) => {
    await page.goto('/eras?lang=en');
    const years = await page.locator('.era-tab-years').allInnerTexts();
    expect(years.length).toBeGreaterThan(2);
    const spans = years.map((y) => y.split(/[–-]/).map(Number));
    for (let i = 1; i < spans.length; i++) expect(spans[i]![0]).toBe(spans[i - 1]![1]! + 1);
    // The era we are inside says so instead of naming what closed it.
    await expect(page.locator('article[id^="E-"]').last()).toContainText(/still running/i);
  });
});
