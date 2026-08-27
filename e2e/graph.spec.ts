import { says, entryCount } from './says';
import { expect, test, type Page } from '@playwright/test';

/** Walk the canvas until the pointer lands on a node (the tooltip is the tell). */
async function hoverANode(page: Page): Promise<void> {
  const box = (await page.locator('#graph-canvas').boundingBox())!;
  const tooltip = page.locator('#graph-tooltip');
  for (let gy = 0.15; gy < 0.9; gy += 0.03) {
    for (let gx = 0.05; gx < 0.95; gx += 0.02) {
      await page.mouse.move(box.x + box.width * gx, box.y + box.height * gy);
      if (await tooltip.isVisible()) return;
    }
  }
  throw new Error('no node found under the cursor anywhere on the canvas');
}

/** The checkbox fills its pill, so this is the same click a reader makes. */
async function toggleLayer(page: Page, type: string): Promise<void> {
  const box = page.locator(`.type-toggle[data-type="${type}"]`);
  await ((await box.isChecked()) ? box.uncheck() : box.check());
}

test.describe('knowledge graph explorer', () => {
  test.use({ locale: 'uk-UA' });

  test('renders on canvas and survives filtering and a theme switch', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/graph');

    const canvas = page.locator('#graph-canvas');
    await expect(canvas).toBeVisible();
    // A real drawing surface, not a DOM node per vertex.
    expect(await canvas.evaluate((c) => (c as HTMLCanvasElement).width)).toBeGreaterThan(300);
    await expect(page.locator('#graph-count')).toHaveText(new RegExp(String(entryCount())));

    await page.locator('#select-removability').selectOption('candidate');
    await toggleLayer(page, 'artifact');
    await expect(page.locator('.type-toggle[data-type="artifact"]')).not.toBeChecked();
    await expect(page.locator('#graph-count')).not.toHaveText(new RegExp(`^${entryCount()} `));

    await page.locator('#theme-toggle').click(); // forces a palette re-read + redraw
    expect(errors).toEqual([]);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(says('uk', 'graph.title'));
  });

  test('hiding every layer shows the empty state', async ({ page }) => {
    await page.goto('/graph');
    for (const type of ['artifact', 'barrier', 'mechanism', 'pattern', 'loop', 'intervention']) {
      await toggleLayer(page, type);
    }
    await expect(page.locator('#graph-empty')).toBeVisible();
    await toggleLayer(page, 'barrier');
    await expect(page.locator('#graph-empty')).toBeHidden();
  });

  test('hovering a node shows a tooltip', async ({ page }) => {
    await page.goto('/graph');
    await hoverANode(page);
    const tooltip = page.locator('#graph-tooltip');
    await expect(tooltip).toBeVisible();
    await expect(tooltip.locator('#tip-id')).toHaveText(/^[ABMPLI]-\d{3}$/);
    await expect(tooltip.locator('#tip-title')).not.toBeEmpty();
    await expect(tooltip).toContainText(says('uk', 'graph.tooltipHint'));
  });

  test('selecting a node opens details with connections that navigate the graph', async ({ page }) => {
    await page.goto('/graph');
    const panel = page.locator('#graph-panel');
    await expect(panel).toHaveAttribute('inert', '');

    await hoverANode(page);
    const hoveredId = await page.locator('#tip-id').textContent();
    await page.mouse.down();
    await page.mouse.up();

    await expect(panel).not.toHaveAttribute('inert', '');
    await expect(panel.locator('#panel-id')).toHaveText(hoveredId!);
    await expect(panel.locator('#panel-title')).not.toBeEmpty();
    await expect(panel.locator('#panel-facts li').first()).toBeVisible();
    await expect(panel.locator('#panel-link')).toHaveAttribute('href', new RegExp(`/${hoveredId}$`));

    // Walking a connection re-targets the panel.
    const connection = panel.locator('#panel-edges button').first();
    if (await connection.count()) {
      const neighbor = await connection.locator('.font-mono').textContent();
      await connection.click();
      await expect(panel.locator('#panel-id')).toHaveText(neighbor!);
    }

    await page.locator('#panel-close').click();
    await expect(panel).toHaveAttribute('inert', '');
  });

  test('keyboard drives selection and the detail link', async ({ page }) => {
    await page.goto('/graph');
    await page.locator('#graph-canvas').focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('#graph-panel')).not.toHaveAttribute('inert', '');
    const first = await page.locator('#panel-id').textContent();
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('#panel-id')).not.toHaveText(first!);
    await page.keyboard.press('Escape');
    await expect(page.locator('#graph-panel')).toHaveAttribute('inert', '');
  });

  test('zoom, fit and fullscreen controls work', async ({ page }) => {
    await page.goto('/graph');
    const canvas = page.locator('#graph-canvas');
    await canvas.click({ position: { x: 5, y: 60 } }); // background: clears any selection
    await page.locator('#graph-zoom-in').click();
    await page.locator('#graph-zoom-out').click();
    await page.locator('#graph-fit').click();

    const button = page.locator('#graph-fullscreen');
    await button.click();
    await expect
      .poll(() => page.evaluate(() => document.fullscreenElement?.id ?? null))
      .toBe('graph-shell');
    await expect(button).toHaveAttribute('aria-label', 'Вийти з повного екрана');
    await button.click();
    await expect.poll(() => page.evaluate(() => document.fullscreenElement?.id ?? null)).toBeNull();
    await expect(button).toHaveAttribute('aria-label', 'На весь екран');
  });

  test('the text catalog fallback stays crawlable', async ({ page }) => {
    await page.goto('/graph');
    const links = page.locator('section a[href*="/barriers/"]');
    expect(await links.count()).toBeGreaterThan(5);
    await expect(links.first()).toBeVisible();
  });
});
