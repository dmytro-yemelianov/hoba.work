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
    for (const route of ['/', '/registry', '/graph', '/observations/obs.feedback_stating_candidate_is_overqualified_for_the_grade', '/mechanisms/mech.genuine_technical_skill_shortfall', '/interventions/int.upfront_compensation_band_disclosure']) {
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

test('the sitemap lists every page that was built, or says why not', async ({ request }) => {
  // The entity check above walks the registry; this walks what the build
  // actually produced, which is what catches a page template nobody listed.
  // `STATIC_ROUTES` used to be written by hand, and `/actors` was in it only
  // because someone remembered.
  const fs = await import('node:fs');
  const path = await import('node:path');
  const dist = path.join(__dirname, '..', 'apps', 'web', 'dist', '_i', 'en');
  const pages: string[] = [];
  const walk = (dir: string) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name === 'index.html') pages.push(p);
    }
  };
  walk(dist);
  expect(pages.length).toBeGreaterThan(50);

  const xml = await (await request.get('/sitemap.xml')).text();
  const listed = new Set(
    [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname.replace(/(.)\/$/, '$1'))
  );

  // Held back on purpose, and named here so the reason survives: an error page
  // is not a destination, and the cat generator is reachable but unadvertised.
  const NOT_LISTED = ['/404', '/cats'];
  const missing = pages
    .map((p) => p.replace(dist, '').replace('/index.html', '') || '/')
    .filter((route) => !listed.has(route || '/'));
  expect(missing.sort()).toEqual(NOT_LISTED);
});

test('every page shares its own card, or is one of the two that cannot', async () => {
  // A link posted to LinkedIn or Slack is previewed from `og:image`, and a page
  // that falls back to the generic card is indistinguishable from every other
  // page in the feed. The reader entry points shipped that way — three cards
  // were generated for them and none was referenced.
  const fs = await import('node:fs');
  const path = await import('node:path');
  const dist = path.join(__dirname, '..', 'apps', 'web', 'dist', '_i', 'en');
  const pages: string[] = [];
  const walk = (dir: string) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name === 'index.html') pages.push(p);
    }
  };
  walk(dist);
  expect(pages.length).toBeGreaterThan(50);

  const generic = pages
    .filter((p) => /og:image" content="[^"]*og-home\.png/.test(fs.readFileSync(p, 'utf8')))
    .map((p) => p.replace(dist, '').replace('/index.html', '') || '/')
    .sort();

  // `/` is what the home card is of; the error page is not a destination
  // anyone shares.
  expect(generic).toEqual(['/', '/404']);
});
