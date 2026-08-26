import { expect, test } from '@playwright/test';

const REQUIRED_ICONS = ['/icons/icon-192.png', '/icons/icon-512.png', '/icons/maskable-512.png', '/icons/apple-touch-icon.png'];

test.describe('installability', () => {
  test('every page links the manifest, icons and theme colours', async ({ page }) => {
    await page.goto('/uk/registry');
    await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href', '/manifest.webmanifest');
    await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute('href', '/icons/apple-touch-icon.png');
    await expect(page.locator('meta[name="theme-color"][media*="dark"]')).toHaveAttribute('content', '#0a0c10');
    await expect(page.locator('meta[name="viewport"]')).toHaveAttribute('content', /viewport-fit=cover/);
  });

  test('the manifest declares an installable app', async ({ request }) => {
    const response = await request.get('/manifest.webmanifest');
    expect(response.status()).toBe(200);
    const manifest = await response.json();
    expect(manifest.name).toContain('hoba');
    expect(manifest.short_name).toBe('hoba');
    expect(manifest.display).toBe('standalone');
    expect(manifest.start_url).toBeTruthy();
    expect(manifest.scope).toBe('/');
    const sizes = manifest.icons.map((i: { sizes: string }) => i.sizes);
    expect(sizes).toContain('192x192');
    expect(sizes).toContain('512x512');
    expect(manifest.icons.some((i: { purpose?: string }) => i.purpose === 'maskable')).toBe(true);
  });

  test('every declared icon is served', async ({ request }) => {
    for (const icon of REQUIRED_ICONS) {
      const response = await request.get(icon);
      expect(response.status(), icon).toBe(200);
      expect(response.headers()['content-type'], icon).toContain('image/png');
    }
  });

  test('the service worker is served from the root scope', async ({ request }) => {
    const response = await request.get('/sw.js');
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain("addEventListener('fetch'");
    expect(body).toContain('caches.open');
  });

  test('the service worker takes control and serves a visited page offline', async ({ page, context }) => {
    await page.goto('/uk/');
    await page.waitForFunction(() => navigator.serviceWorker.controller !== null, undefined, { timeout: 15_000 });

    await page.goto('/uk/registry');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    await context.setOffline(true);
    await page.reload();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Каталог реєстру');
    await context.setOffline(false);
  });
});
