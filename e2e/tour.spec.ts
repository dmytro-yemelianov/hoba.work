import { expect, test } from '@playwright/test';

test.describe('Onboarding Page Guide and Table of Contents', () => {
  test('opens guide, navigates through stops with spotlight box', async ({ page }) => {
    await page.goto('/?lang=uk');

    const openBtn = page.locator('#open-tour-btn');
    await expect(openBtn).toBeVisible();
    await openBtn.click();

    const dialog = page.locator('#tour-dialog');
    await expect(dialog).toBeVisible();

    const counter = page.locator('#tour-step-counter');
    await expect(counter).toContainText('1 / 6');

    // Next step
    const nextBtn = page.locator('#tour-next-btn');
    await nextBtn.click();
    await expect(counter).toContainText('2 / 6');

    // Spotlight box is rendered
    const spotlight = page.locator('#tour-spotlight-box');
    await expect(spotlight).toHaveCount(1);

    // Voice button is clickable
    const voiceBtn = page.locator('#tour-voice-btn');
    await expect(voiceBtn).toBeVisible();
    await voiceBtn.click();

    // Close button
    const closeBtn = page.locator('#close-tour-btn');
    await closeBtn.click();
    await expect(dialog).not.toBeVisible();
  });

  test('table of contents displays on methodology and navigates to section', async ({ page }) => {
    await page.goto('/methodology?lang=uk');

    const toc = page.locator('.table-of-contents');
    await expect(toc.first()).toBeVisible();

    const tocLinks = page.locator('.toc-item');
    await expect(tocLinks).toHaveCount(5);

    const firstLink = tocLinks.first();
    await expect(firstLink).toHaveAttribute('href', '#method-core');
  });
});
