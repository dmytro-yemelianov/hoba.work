import { entryCount } from './says';
import { expect, test } from '@playwright/test';

/**
 * Every page is also a document. `/mechanisms/mech.genuine_technical_skill_shortfall.md` and the canonical URL
 * under `Accept: text/markdown` are the same file, negotiated the same way.
 */
test.describe('machine formats', () => {
  // The API-request fixture sends no Accept-Language, so a bare request falls
  // through to geography. Anything asserting on wording pins the language.
  test('an entity is retrievable as Markdown by extension', async ({ request }) => {
    const response = await request.get('/mechanisms/mech.employment_gap_downranking_bias.md?lang=en');
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('text/markdown');

    const body = await response.text();
    expect(body.startsWith('---\nid: mech.employment_gap_downranking_bias\n')).toBe(true);
    expect(body).toContain('canonical: https://hoba.work/mechanisms/mech.employment_gap_downranking_bias');
    expect(body).toContain('json: https://hoba.work/api/v1/mechanisms/mech.employment_gap_downranking_bias.json');
    // The specimen keeps its shape, and the tell is still marked.
    expect(body).toContain('```');
    expect(body).toMatch(/^> .*Continuity penalty/m);
    // Relations resolve wherever the file is pasted.
    expect(body).toMatch(/\[bar\.automated_filter_parser_threshold\]\(https:\/\/hoba\.work\/barriers\/bar\.automated_filter_parser_threshold\)/);
  });

  test('the canonical URL serves the same document under Accept', async ({ request }) => {
    const byExtension = await (await request.get('/mechanisms/mech.employment_gap_downranking_bias.md?lang=en')).text();
    const byHeader = await request.get('/mechanisms/mech.employment_gap_downranking_bias?lang=en', { headers: { Accept: 'text/markdown, text/html;q=0.9' } });
    expect(byHeader.headers()['content-type']).toContain('text/markdown');
    expect(await byHeader.text()).toBe(byExtension);
  });

  test('a browser is unaffected', async ({ request }) => {
    const response = await request.get('/mechanisms/mech.employment_gap_downranking_bias', { headers: { Accept: 'text/html,application/xhtml+xml,*/*;q=0.8' } });
    expect(response.headers()['content-type']).toContain('text/html');
  });

  test('Markdown follows the reader like the page does', async ({ request }) => {
    for (const [locale, expected] of [['uk-UA', 'uk'], ['en-GB', 'en']] as const) {
      const response = await request.get('/mechanisms/mech.employment_gap_downranking_bias.md', { headers: { 'Accept-Language': locale } });
      expect(response.headers()['content-language'], locale).toBe(expected);
      expect(await response.text(), locale).toContain(`lang: ${expected}`);
    }
    const forced = await request.get('/mechanisms/mech.employment_gap_downranking_bias.md?lang=uk', { headers: { 'Accept-Language': 'en-GB' } });
    expect(await forced.text()).toContain('lang: uk');
  });

  test('every entity type has a Markdown representation', async ({ request }) => {
    for (const path of [
      '/artifacts/obs.feedback_stating_candidate_is_overqualified_for_the_grade.md', '/barriers/bar.headcount_executive_budget_approval.md', '/mechanisms/mech.automated_application_expiration_timeout.md',
      '/patterns/pat.closed_then_reposted_requisition_motif.md', '/loops/L-001.md', '/interventions/I-002.md',
    ]) {
      const response = await request.get(`${path}?lang=en`);
      expect(response.status(), path).toBe(200);
      expect(await response.text(), path).toContain('canonical: https://hoba.work/');
    }
  });

  test('the whole catalogue is one file', async ({ request }) => {
    const body = await (await request.get('/registry.md?lang=en')).text();
    expect(body).toContain('canonical: https://hoba.work/registry');
    // Every entity listed, linked, with its summary.
    expect((body.match(/^- \[(?:[A-Z]+-\d{3}|[a-z]+\.[a-z0-9_]+)\]/gm) ?? []).length).toBeGreaterThanOrEqual(entryCount());
  });

  test('the page offers both representations', async ({ page }) => {
    await page.goto('/mechanisms/mech.employment_gap_downranking_bias');
    await expect(page.locator('main a[href="/mechanisms/mech.employment_gap_downranking_bias.md"]')).toBeVisible();
    await expect(page.locator('main a[href="/api/v1/mechanisms/mech.employment_gap_downranking_bias.json"]')).toBeVisible();
  });
});
