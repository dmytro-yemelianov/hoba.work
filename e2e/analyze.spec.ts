import { expect, test } from '@playwright/test';

test.describe('analysis wizard', () => {
  test('runs the protocol end to end in English', async ({ page }) => {
    await page.goto('/analyze');
    await page.locator('input[name="artifacts_selected"][value="A-004"]').check();
    await page.locator('input[name="stage_select"][value="technical"]').check();
    await page.locator('#step-h [data-goto="o"]').click();
    await expect(page.locator('#barriers-output')).toContainText('B-005');
    await page.locator('#step-o [data-goto="b"]').click();
    await expect(page.locator('#mechanisms-output')).toContainText('M-001');
    await expect(page.locator('#patterns-output')).toContainText('P-002');
    await page.locator('#step-b [data-goto="a"]').click();
    await expect(page.locator('#count-candidate')).toHaveText('2');
    await expect(page.locator('#probes-output')).toContainText('PROBE-A-004-1');
    await expect(page.locator('#verdict-banner')).toContainText('Diagnostic verdict');
  });

  test.describe('in Ukrainian', () => {
    test.use({ locale: 'uk-UA' });

    test('renders Ukrainian verdicts and probe text', async ({ page }) => {
      await page.goto('/analyze');
      await page.locator('input[name="artifacts_selected"][value="A-001"]').check();
      await page.locator('#tab-a').click();
      await expect(page.locator('#verdict-banner')).toContainText('Діагностичний висновок');
      await expect(page.locator('#probes-output')).toContainText('Перевірте папки');
      await expect(page.locator('#probes-output')).not.toContainText('Check email spam');
    });
  });

  test('stop condition when nothing is selected', async ({ page }) => {
    await page.goto('/analyze');
    await page.locator('#tab-a').click();
    await expect(page.locator('#verdict-banner')).toContainText('stop condition');
    await expect(page.locator('#count-candidate')).toHaveText('0');
  });
});
