import { describe, expect, it } from 'vitest';
// @ts-expect-error plain JS worker without type declarations
import worker, { parseAcceptLanguage, preferredLocale, resolveLocaleRedirect } from '../site/public/_worker.js';

describe('language negotiation worker', () => {
  it('parses Accept-Language by quality', () => {
    expect(parseAcceptLanguage('en-US,en;q=0.9,uk;q=0.8')).toEqual(['en-us', 'en', 'uk']);
    expect(parseAcceptLanguage('uk;q=0.2, en;q=0.9')).toEqual(['en', 'uk']);
    expect(parseAcceptLanguage(undefined)).toEqual([]);
  });

  it('explicit cookie beats every other signal', () => {
    expect(preferredLocale({ cookie: 'hoba_lang=en', acceptLanguage: 'uk', country: 'UA' })).toBe('en');
    expect(preferredLocale({ cookie: 'a=b; hoba_lang=uk', acceptLanguage: 'en-US', country: 'US' })).toBe('uk');
  });

  it('infers Ukrainian from Accept-Language or geo, English otherwise, Ukrainian when there is no signal', () => {
    expect(preferredLocale({ acceptLanguage: 'en-US,en;q=0.9,uk;q=0.5', country: 'DE' })).toBe('uk');
    expect(preferredLocale({ acceptLanguage: 'en-US,en;q=0.9', country: 'UA' })).toBe('uk');
    expect(preferredLocale({ acceptLanguage: 'en-US,en;q=0.9', country: 'US' })).toBe('en');
    expect(preferredLocale({ acceptLanguage: 'de-DE', country: 'DE' })).toBe('en');
    expect(preferredLocale({})).toBe('uk');
  });

  it('redirects only unprefixed HTML navigations, never assets or /uk URLs', () => {
    const uk = { acceptLanguage: 'uk-UA,uk;q=0.9' };
    expect(resolveLocaleRedirect({ pathname: '/', ...uk })).toBe('/uk/');
    expect(resolveLocaleRedirect({ pathname: '/mechanisms/M-001', ...uk })).toBe('/uk/mechanisms/M-001');
    expect(resolveLocaleRedirect({ pathname: '/uk/registry', ...uk })).toBeNull();
    expect(resolveLocaleRedirect({ pathname: '/api/v1/index.json', ...uk })).toBeNull();
    expect(resolveLocaleRedirect({ pathname: '/data/latest/registry.json', ...uk })).toBeNull();
    expect(resolveLocaleRedirect({ pathname: '/favicon.svg', ...uk })).toBeNull();
    expect(resolveLocaleRedirect({ pathname: '/registry', acceptLanguage: 'en-US' })).toBeNull();
    expect(resolveLocaleRedirect({ pathname: '/uk/whatever', cookie: 'hoba_lang=en' })).toBeNull();
  });

  it('fetch handler issues a 302 with Vary and otherwise delegates to ASSETS', async () => {
    const assets = { fetch: async (req: Request) => new Response(`asset:${new URL(req.url).pathname}`) };
    const redirected = await worker.fetch(new Request('https://hoba.work/registry?type=loop', { headers: { 'accept-language': 'uk' } }), { ASSETS: assets });
    expect(redirected.status).toBe(302);
    expect(redirected.headers.get('location')).toBe('https://hoba.work/uk/registry?type=loop');
    expect(redirected.headers.get('vary')).toContain('Accept-Language');

    const served = await worker.fetch(new Request('https://hoba.work/registry', { headers: { 'accept-language': 'en-US' } }), { ASSETS: assets });
    expect(await served.text()).toBe('asset:/registry');

    const posted = await worker.fetch(new Request('https://hoba.work/', { method: 'POST', headers: { 'accept-language': 'uk' } }), { ASSETS: assets });
    expect(await posted.text()).toBe('asset:/');
  });
});
