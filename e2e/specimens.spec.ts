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

  test('specimens render on every entity type', async ({ page }) => {
    const ONE_OF_EACH = [
      '/uk/artifacts/A-009', '/uk/barriers/B-010', '/uk/mechanisms/M-020',
      '/uk/patterns/P-003', '/uk/loops/L-001', '/uk/interventions/I-004',
    ];
    for (const path of ONE_OF_EACH) {
      await page.goto(path);
      await expect(page.locator('.specimen').first(), path).toBeVisible();
      await expect(page.locator('.specimen .pill').first(), path).toHaveText('реконструкція');
      await expect(page.locator('.specimen-tell').first(), path).toBeVisible();
    }
  });

  test('an intervention shows the document as it looks once applied', async ({ page }) => {
    await page.goto('/uk/interventions/I-002');
    await expect(page.locator('main')).toContainText('Як це виглядає, коли це впроваджено');
    await expect(page.locator('.specimen')).toContainText('68 000–79 000');
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
