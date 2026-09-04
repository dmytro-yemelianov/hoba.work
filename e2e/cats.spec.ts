import { expect, test } from '@playwright/test';

test.describe('Vector Cat Generator (/cats)', () => {
  test('renders interactive cat studio in Ukrainian and English', async ({ page }) => {
    // 1. Ukrainian version
    await page.goto('/cats?lang=uk');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'Векторний генератор котиків'
    );

    const viewport = page.locator('#cat-svg-viewport');
    await expect(viewport).toBeVisible();
    await expect(viewport.locator('svg')).toHaveAttribute('data-cat-seed', 'borys-loaf-master');

    const displayName = page.locator('#cat-display-name');
    await expect(displayName).toBeVisible();

    // 2. English version
    await page.goto('/cats?lang=en');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Vector Cat Generator');
    await expect(page.locator('#cat-svg-viewport svg')).toBeVisible();
  });

  test('randomize button and hotkeys update the cat seed and SVG', async ({ page }) => {
    await page.goto('/cats?lang=uk');
    const viewport = page.locator('#cat-svg-viewport svg');
    const initialSeed = await viewport.getAttribute('data-cat-seed');

    // Click randomize button
    const randBtn = page.locator('#randomize-btn');
    await randBtn.click();

    const newSeed = await viewport.getAttribute('data-cat-seed');
    expect(newSeed).not.toBe(initialSeed);

    // Custom seed input
    const seedInput = page.locator('#cat-seed-input');
    await seedInput.fill('my-super-fluffy-cat');
    await expect(viewport).toHaveAttribute('data-cat-seed', 'my-super-fluffy-cat');
  });

  test('preset cards load specific archetypes', async ({ page }) => {
    await page.goto('/cats?lang=uk');
    const viewport = page.locator('#cat-svg-viewport svg');

    // Click on Merlin wizard preset
    const merlinCard = page.locator('.preset-card[data-seed="merlin-wizard-cat"]');
    await expect(merlinCard).toBeVisible();
    await merlinCard.click();

    await expect(viewport).toHaveAttribute('data-cat-seed', 'merlin-wizard-cat');
    await expect(page.locator('#cat-svg-viewport .acc-wizard-hat')).toBeVisible();
  });

  test('tab navigation exposes all parameter customization options', async ({ page }) => {
    await page.goto('/cats?lang=uk');

    // Default tab is pose
    await expect(page.locator('#tab-pane-pose')).toBeVisible();
    await expect(page.locator('#tab-pane-face')).toBeHidden();

    // Click face tab
    await page.locator('.cat-tab-btn[data-tab="face"]').click();
    await expect(page.locator('#tab-pane-face')).toBeVisible();
    await expect(page.locator('#tab-pane-pose')).toBeHidden();

    // Click accessories tab
    await page.locator('.cat-tab-btn[data-tab="acc"]').click();
    await expect(page.locator('#tab-pane-acc')).toBeVisible();

    // Select Crown accessory
    const crownBtn = page.locator(
      '.param-choice-btn[data-param="headAccessory"][data-value="royalCrown"]'
    );
    await crownBtn.click();
    await expect(page.locator('#cat-svg-viewport .acc-crown')).toBeVisible();
  });

  test('army grid renders 12 felines and clicking loads cat into stage', async ({ page }) => {
    await page.goto('/cats?lang=uk');

    const armyGrid = page.locator('#cat-army-grid');
    await expect(armyGrid).toBeVisible();
    const armyCards = armyGrid.locator('button');
    await expect(armyCards).toHaveCount(12);

    // Click first army card
    const firstCard = armyCards.first();
    await firstCard.click();

    // Stage updates
    await expect(page.locator('#cat-svg-viewport svg')).toBeVisible();
  });
});
