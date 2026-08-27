import { expect, test } from '@playwright/test';

/**
 * The landing page has one job: a visitor who has never heard of this should
 * know within one screen what it is, what problem it is for, and what they get.
 * A slogan passes a screenshot review and fails that job, so the four beats are
 * asserted rather than admired.
 */
test.describe('the landing page', () => {
  test('names the situation, the thing, the problem and what it does', async ({ page }) => {
    await page.goto('/?lang=en');

    // The hook is about the reader, not about the project.
    const h1 = (await page.locator('h1').innerText()).toLowerCase();
    expect(h1).toContain('you applied');

    // What it actually is, in the first paragraph, with a number in it.
    const lead = await page.locator('h1 + p').innerText();
    expect(lead.toLowerCase()).toContain('atlas');
    expect(lead).toMatch(/\d+ documented entries/i);

    // The problem, under its own heading.
    const body = (await page.locator('main').innerText()).toLowerCase();
    expect(body).toContain('nobody inside the process can see all of it');

    // And three concrete things it does about it.
    const gives = page.locator('ol > li').filter({ has: page.locator('h3') });
    expect(await gives.count()).toBeGreaterThanOrEqual(3);
  });

  test('sets the name lowercase and bold wherever it is read', async ({ page }) => {
    await page.goto('/?lang=uk');
    // Capitalised it reads as Cyrillic «нова», so it never appears that way.
    const body = await page.locator('body').innerText();
    expect(body).not.toMatch(/\bHOBA\b/);
    expect(body).not.toMatch(/\bHoba\b/);
    // And the name is marked where it is read as a name.
    expect(await page.locator('.wordmark').count()).toBeGreaterThan(0);
  });

  test('both calls to action go somewhere useful', async ({ page }) => {
    await page.goto('/?lang=en');
    const buttons = page.locator('h1 ~ div a.btn');
    await expect(buttons).toHaveCount(2);
    await expect(buttons.nth(0)).toHaveAttribute('href', /\/analyze$/);
    await expect(buttons.nth(1)).toHaveAttribute('href', /\/registry$/);
  });
});
