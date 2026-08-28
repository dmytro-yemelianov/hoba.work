import { describe, expect, it } from 'vitest';
// @ts-expect-error plain JS worker without type declarations
import worker, { parseAcceptLanguage, preferredLocale, legacyRedirect, internalPath, isStaticAsset } from '../site/public/_worker.js';

/** A stand-in for the Pages ASSETS binding that echoes the path it was asked for. */
const assets = { fetch: async (req: Request) => new Response(`asset:${new URL(req.url).pathname}`, { headers: { 'content-type': 'text/html' } }) };
const env = { ASSETS: assets };

describe('language resolution', () => {
  it('parses Accept-Language by quality', () => {
    expect(parseAcceptLanguage('en-US,en;q=0.9,uk;q=0.8')).toEqual(['en-us', 'en', 'uk']);
    expect(parseAcceptLanguage('uk;q=0.2, en;q=0.9')).toEqual(['en', 'uk']);
    expect(parseAcceptLanguage(undefined)).toEqual([]);
  });

  it('takes signals strongest first: query, cookie, header, geography', () => {
    // ?lang= is the explicit, shareable override and outranks everything.
    expect(preferredLocale({ query: 'en', cookie: 'hoba_lang=uk', acceptLanguage: 'uk', country: 'UA' })).toBe('en');
    expect(preferredLocale({ query: 'uk', acceptLanguage: 'en-US', country: 'US' })).toBe('uk');
    // A junk value falls through rather than being honoured.
    expect(preferredLocale({ query: 'de', acceptLanguage: 'uk' })).toBe('uk');

    expect(preferredLocale({ cookie: 'hoba_lang=en', acceptLanguage: 'uk', country: 'UA' })).toBe('en');
    expect(preferredLocale({ cookie: 'a=b; hoba_lang=uk', acceptLanguage: 'en-US', country: 'US' })).toBe('uk');
  });

  it('lets a browser that named its languages outrank geography', () => {
    expect(preferredLocale({ acceptLanguage: 'en-US,en;q=0.9,uk;q=0.5', country: 'DE' })).toBe('uk');
    // Someone in Kyiv running an English browser has stated a preference;
    // geography is an inference about the same question and does not overrule it.
    // This also keeps the suite from depending on where it is run from.
    expect(preferredLocale({ acceptLanguage: 'en-US,en;q=0.9', country: 'UA' })).toBe('en');
    expect(preferredLocale({ acceptLanguage: 'de-DE', country: 'UA' })).toBe('en');
    // Geography decides only when the browser said nothing.
    expect(preferredLocale({ country: 'UA' })).toBe('uk');
  });

  it('answers English when there is no signal at all', () => {
    // Googlebot omits Accept-Language on the ordinary crawl and arrives from a
    // US IP; OG scrapers send neither header nor cookie. Every URL in
    // sitemap.xml is language-free, so a signal-free request has to receive the
    // language the sitemap and the canonical URLs describe.
    expect(preferredLocale({})).toBe('en');
  });
});

describe('addresses', () => {
  it('collapses legacy and internal paths onto the public one', () => {
    expect(legacyRedirect('/uk')).toBe('/');
    expect(legacyRedirect('/uk/')).toBe('/');
    expect(legacyRedirect('/uk/registry')).toBe('/registry');
    expect(legacyRedirect('/uk/mechanisms/M-001')).toBe('/mechanisms/M-001');
    expect(legacyRedirect('/_i/uk/registry')).toBe('/registry');
    expect(legacyRedirect('/_i/en/')).toBe('/');
    // Already public, and a path that merely starts with the same letters.
    expect(legacyRedirect('/registry')).toBeNull();
    expect(legacyRedirect('/ukraine')).toBeNull();
  });

  it('always addresses the internal tree in its trailing-slash directory form', () => {
    // The bare and .html forms answer with a 308 whose Location would leak the
    // internal path to the reader.
    expect(internalPath('/', 'uk')).toBe('/_i/uk/');
    expect(internalPath('/registry', 'en')).toBe('/_i/en/registry/');
    expect(internalPath('/registry/', 'en')).toBe('/_i/en/registry/');
    expect(internalPath('/mechanisms/M-001', 'uk')).toBe('/_i/uk/mechanisms/M-001/');
  });

  it('leaves assets, the API and the exports out of negotiation', () => {
    for (const path of ['/favicon.svg', '/llms.txt', '/sitemap.xml', '/api/v1/index.json', '/data/latest/registry.json', '/_astro/x.css', '/icons/icon-192.png']) {
      expect(isStaticAsset(path), path).toBe(true);
    }
    for (const path of ['/', '/registry', '/mechanisms/M-001']) {
      expect(isStaticAsset(path), path).toBe(false);
    }
  });
});

describe('fetch handler', () => {
  const get = (url: string, headers: Record<string, string> = {}) => worker.fetch(new Request(url, { headers }), env);

  it('serves the internal tree for the resolved language under the public URL', async () => {
    expect(await (await get('https://hoba.work/registry', { 'accept-language': 'uk' })).text()).toBe('asset:/_i/uk/registry/');
    expect(await (await get('https://hoba.work/registry', { 'accept-language': 'en-GB' })).text()).toBe('asset:/_i/en/registry/');
    expect(await (await get('https://hoba.work/')).text()).toBe('asset:/_i/en/');
  });

  it('honours ?lang= and remembers it in a cookie', async () => {
    const response = await get('https://hoba.work/registry?lang=uk', { 'accept-language': 'en-GB' });
    expect(await response.text()).toBe('asset:/_i/uk/registry/');
    expect(response.headers.get('content-language')).toBe('uk');
    expect(response.headers.get('set-cookie')).toContain('hoba_lang=uk');
  });

  it('does not leak the public query into the internal request', async () => {
    // ?type= belongs to the page, ?lang= to the worker. Neither may reach the
    // asset lookup, which would miss the file and pollute any cache key.
    expect(await (await get('https://hoba.work/registry?type=loop&lang=uk')).text()).toBe('asset:/_i/uk/registry/');
  });

  it('301s every legacy and internal address, keeping the query', async () => {
    const legacy = await get('https://hoba.work/uk/registry?type=loop');
    expect(legacy.status).toBe(301);
    expect(legacy.headers.get('location')).toBe('https://hoba.work/registry?type=loop');

    const internal = await get('https://hoba.work/_i/uk/mechanisms/M-001');
    expect(internal.status).toBe(301);
    expect(internal.headers.get('location')).toBe('https://hoba.work/mechanisms/M-001');
  });

  it('marks negotiated documents as per-reader', async () => {
    const response = await get('https://hoba.work/registry', { 'accept-language': 'uk' });
    expect(response.headers.get('content-language')).toBe('uk');
    expect(response.headers.get('vary')).toContain('Accept-Language');
    expect(response.headers.get('cache-control')).toContain('private');
    // No cookie is written unless the reader asked for one explicitly.
    expect(response.headers.get('set-cookie')).toBeNull();
  });

  it('passes assets and non-GET requests straight through', async () => {
    expect(await (await get('https://hoba.work/api/v1/index.json')).text()).toBe('asset:/api/v1/index.json');
    expect(await (await get('https://hoba.work/llms.txt')).text()).toBe('asset:/llms.txt');
    const posted = await worker.fetch(new Request('https://hoba.work/', { method: 'POST' }), env);
    expect(await posted.text()).toBe('asset:/');
  });
});

describe('legacy entity-ID redirects', () => {
  it('redirects an old pattern short code to its new dotted-namespace path', () => {
    expect(legacyRedirect('/patterns/P-001')).toBe('/patterns/pat.seniority_double_bind');
  });

  it('leaves an already-canonical path alone', () => {
    expect(legacyRedirect('/patterns/pat.seniority_double_bind')).toBeNull();
  });

  it('leaves an unrelated, non-aliased path alone', () => {
    expect(legacyRedirect('/patterns/P-999')).toBeNull();
  });

  it('still redirects /uk/* and /_i/* exactly as before (unchanged behavior)', () => {
    expect(legacyRedirect('/uk/patterns')).toBe('/patterns');
    expect(legacyRedirect('/_i/en/patterns')).toBe('/patterns');
  });

  it('redirects an old pattern short code requesting its Markdown representation, preserving the extension', () => {
    expect(legacyRedirect('/patterns/P-001.md')).toBe('/patterns/pat.seniority_double_bind.md');
  });

  it('redirects an old pattern short code with a trailing slash', () => {
    expect(legacyRedirect('/patterns/P-001/')).toBe('/patterns/pat.seniority_double_bind');
  });

  it('leaves the root path alone', () => {
    expect(legacyRedirect('/')).toBeNull();
  });
});
