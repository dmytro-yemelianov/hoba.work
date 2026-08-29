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
    for (const route of ['/', '/registry', '/graph', '/artifacts/obs.feedback_stating_candidate_is_overqualified_for_the_grade', '/mechanisms/mech.genuine_technical_skill_shortfall', '/interventions/I-002']) {
      expect(locs, route).toContain(`https://hoba.work${route === '/' ? '/' : route}`);
    }
    // No language segment: shareable links carry no locale.
    expect(locs.filter((l) => /\/uk(\/|$)/.test(l))).toEqual([]);
    expect(locs.filter((l) => l.includes('/_i/'))).toEqual([]);
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
    expect(body).toContain('### mech.genuine_technical_skill_shortfall —');
    expect(body).toContain('### obs.feedback_stating_candidate_is_overqualified_for_the_grade —');
    expect(body.length).toBeGreaterThan(20_000);
  });
});

test('the sitemap is reproducible from the manifest, not from file mtimes', async ({ request }) => {
  const body = await (await request.get('/sitemap.xml')).text();
  const stamps = [...new Set([...body.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map((m) => m[1]))];
  // One date for the whole file, and it is the registry's own updated_at —
  // a checkout-dependent mtime would make every CI run a diff.
  expect(stamps).toHaveLength(1);
  expect(stamps[0]).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  const manifest = await (await request.get('/data/latest/manifest.json')).json();
  expect(stamps[0]).toBe(String(manifest.updated_at).slice(0, 10));
});

test('llms.txt points a model at the Markdown representation', async ({ request }) => {
  const body = await (await request.get('/llms.txt')).text();
  expect(body).toContain('/mechanisms/mech.genuine_technical_skill_shortfall.md');
  expect(body).toContain('Accept: text/markdown');
  expect(body).toContain('/registry.md');
});
