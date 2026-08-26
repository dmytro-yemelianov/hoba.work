import { expect, test } from '@playwright/test';

test.describe('discovery surface', () => {
  test('robots.txt points at the sitemap and the machine formats', async ({ request }) => {
    const res = await request.get('/robots.txt');
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain('Sitemap: https://hoba.work/sitemap.xml');
    expect(body).toContain('/llms.txt');
    expect(body).toMatch(/^User-agent: \*$/m);
  });

  test('the sitemap lists every entity page', async ({ request }) => {
    const body = await (await request.get('/sitemap.xml')).text();
    const locs = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    expect(locs.length).toBeGreaterThan(70);
    for (const route of ['/', '/registry', '/graph', '/artifacts/A-013', '/mechanisms/M-001', '/interventions/I-002']) {
      expect(locs, route).toContain(`https://hoba.work${route === '/' ? '/' : route}`);
    }
    // No language segment: shareable links carry no locale.
    expect(locs.filter((l) => l.includes('/uk/'))).toEqual([]);
  });

  test('llms.txt orients a model and states the boundaries', async ({ request }) => {
    const body = await (await request.get('/llms.txt')).text();
    expect(body.startsWith('# hoba')).toBe(true);
    expect(body).toContain('/data/latest/registry.json');
    expect(body).toContain('openapi.json');
    // The three claims the project must never let a reader — human or model — miss.
    expect(body).toContain('does not name or rank employers');
    expect(body).toContain('does not attribute intent');
    expect(body).toContain('reconstructions');
  });

  test('llms-full.txt carries the whole registry', async ({ request }) => {
    const body = await (await request.get('/llms-full.txt')).text();
    for (const heading of ['## Observations', '## Barriers', '## Mechanisms', '## Patterns', '## Loops', '## Interventions', '## Evidence']) {
      expect(body, heading).toContain(heading);
    }
    expect(body).toContain('### M-001 —');
    expect(body).toContain('### A-013 —');
    expect(body.length).toBeGreaterThan(20_000);
  });
});
