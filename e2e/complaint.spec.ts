import { expect, test } from '@playwright/test';

test.describe('private social complaint intake', () => {
  test('maps direct facts, withholds a causal claim, and loads only mapped facts', async ({
    page,
  }) => {
    await page.goto('/analyze');
    await page
      .locator('#complaint-input')
      .fill('I never heard back after applying. The same job was reposted. The ATS rejected me.');
    await page.locator('#complaint-analyze').click();

    const result = page.locator('#complaint-result');
    await expect(result).toBeVisible();
    await expect(result).toContainText('What you reported');
    await expect(result).toContainText('Complete silence after submission');
    await expect(result).toContainText('What this does not establish');
    await expect(result).toContainText('The ATS rejected me.');
    await expect(result).toContainText('Ghost Requisition & Pipeline Refresh');
    await expect(result).toContainText('not a cause, probability');

    await result.getByRole('button', { name: /use mapped facts/i }).click();
    await expect(
      page.locator(
        'input[name="artifacts_selected"][value="obs.complete_silence_after_submission"]'
      )
    ).toBeChecked();
    await expect(
      page.locator(
        'input[name="artifacts_selected"][value="obs.materially_similar_role_reposted_shortly_after_rejection"]'
      )
    ).toBeChecked();
  });

  test.describe('in Ukrainian', () => {
    test.use({ locale: 'uk-UA' });

    test('uses Ukrainian explicit phrase rules without inferring ATS causality', async ({
      page,
    }) => {
      await page.goto('/analyze');
      await page
        .locator('#complaint-input')
        .fill('Я подав заявку, але не відповіли після того як я подав. Мене відсік ATS.');
      await page.locator('#complaint-analyze').click();

      const result = page.locator('#complaint-result');
      await expect(result).toContainText('Що ви повідомили');
      await expect(result).toContainText('Повна тиша після відправки заявки');
      await expect(result).toContainText('Чого це не встановлює');
      await expect(result).toContainText('Мене відсік ATS.');
    });

    test('also maps an explicit English report when the UI is Ukrainian', async ({ page }) => {
      await page.goto('/analyze');
      await page.locator('#complaint-input').fill('I never heard back after applying.');
      await page.locator('#complaint-analyze').click();

      await expect(page.locator('#complaint-result')).toContainText(
        'Повна тиша після відправки заявки'
      );
    });
  });
});
