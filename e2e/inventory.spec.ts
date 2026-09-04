import { expect, test } from '@playwright/test';

test.describe('data inventory', () => {
  test('publishes one complete machine-readable contract', async ({ request }) => {
    const inventory = await (await request.get('/data/latest/inventory.json')).json();

    expect(inventory.inventory_version).toBe('1.0.0');
    expect(inventory.collections).toHaveLength(11);
    expect(inventory.totals.collections).toBe(11);
    expect(inventory.totals.ontology_entries).toBe(
      inventory.collections.reduce((sum: number, entry: { count: number }) => sum + entry.count, 0)
    );
    expect(inventory.totals.archetypes).toBe(inventory.totals.non_evidence_entries);
    expect(inventory.totals.scenarios).toBeGreaterThan(0);
    expect(inventory.surfaces.length).toBeGreaterThanOrEqual(10);
    expect(inventory.situations.length).toBeGreaterThanOrEqual(10);

    const records = await (await request.get('/api/v1/records/index.json')).json();
    expect(records.count).toBe(
      inventory.collections.find((entry: { type: string }) => entry.type === 'record').count
    );
    expect(records.items.every((item: { type: string }) => item.type === 'record')).toBe(true);
  });

  test('renders the same inventory and situation guidance for humans', async ({
    page,
    request,
  }) => {
    const inventory = await (await request.get('/data/latest/inventory.json')).json();
    await page.goto('/data?lang=en');
    await expect(page.locator('#data-inventory [data-inventory-type]')).toHaveCount(
      inventory.collections.length
    );
    await expect(page.locator('[data-inventory-type="record"]')).toContainText('Financial records');

    await page.goto('/developers?lang=en');
    await expect(page.locator('#dev-inventory [data-inventory-type]')).toHaveCount(
      inventory.collections.length
    );
    await expect(page.locator('#dev-inventory [data-auxiliary-dataset]')).toHaveCount(
      inventory.auxiliary_datasets.length
    );
    await expect(page.locator('#dev-choose [data-usage-situation]')).toHaveCount(
      inventory.situations.length
    );

    await page.goto('/data?lang=uk');
    await expect(page.locator('[data-inventory-type="record"]')).toContainText('Фінансові записи');
  });
});
