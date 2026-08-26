import { expect, test } from '@playwright/test';

test.describe('a shared entity page stands on its own', () => {
  test('an observation opens with the document, labelled as a reconstruction', async ({ page }) => {
    await page.goto('/uk/artifacts/A-013');

    const specimens = page.locator('.specimen');
    expect(await specimens.count()).toBeGreaterThanOrEqual(2);

    const first = specimens.first();
    await expect(first).toContainText('Лист із відмовою');
    await expect(first.locator('.pill')).toHaveText('реконструкція');
    await expect(first.locator('.specimen-tell')).toHaveCount(1);
    await expect(first.locator('.specimen-reading')).toContainText('На що звернути увагу');

    // The standing note above the section, so the framing is never only in a badge.
    await expect(page.locator('main')).toContainText('Це не копії конкретного листа');

    // And the page still carries the reasoning around the document.
    await expect(page.getByRole('heading', { level: 2 })).toContainText(['Як це виглядає']);
    await expect(page.locator('main')).toContainText('НЕ встановлює');
  });

  test('specimens render on mechanisms and patterns too', async ({ page }) => {
    for (const path of ['/uk/mechanisms/M-020', '/uk/patterns/P-003']) {
      await page.goto(path);
      await expect(page.locator('.specimen').first(), path).toBeVisible();
      await expect(page.locator('.specimen .pill').first(), path).toHaveText('реконструкція');
    }
  });

  test('the landing argues from a real document, not a description', async ({ page }) => {
    await page.goto('/uk/');
    const specimen = page.locator('.specimen').first();
    await expect(specimen).toBeVisible();
    await expect(specimen.locator('.specimen-tell')).toHaveCount(1);
    // The mechanisms that can each produce that same message, with their agency zone.
    const causes = page.locator('main a[href*="/mechanisms/"]');
    expect(await causes.count()).toBeGreaterThanOrEqual(4);
  });
});
