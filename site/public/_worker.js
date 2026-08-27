/**
 * Cloudflare Pages worker (Advanced Mode): language negotiation in front of the static site.
 *
 * Every page is prerendered in English (unprefixed) and Ukrainian (/uk/…). For HTML
 * navigations to an unprefixed URL we redirect to the Ukrainian mirror when the visitor
 * prefers Ukrainian: explicit choice (hoba_lang cookie, set by the language switcher) →
 * Accept-Language → Cloudflare geo (UA). /uk/… URLs are always honoured; English
 * preference is never overridden.
 *
 * A request carrying no language signal at all is treated as English. That is a
 * crawler, an OG scraper or a bare curl, and it must receive the language the
 * sitemap and the canonical URLs describe — otherwise every submitted URL
 * redirects the crawler somewhere that is not in the sitemap.
 * Assets, the JSON API and data exports are never redirected.
 */
const LANG_COOKIE = 'hoba_lang';
const NON_HTML = /\.[a-z0-9]+$/i;
const STATIC_PREFIXES = ['/api/', '/data/', '/schemas/', '/_astro/'];

export function readCookie(cookieHeader, name) {
  if (!cookieHeader) return undefined;
  for (const part of cookieHeader.split(';')) {
    const [k, ...rest] = part.trim().split('=');
    if (k === name) return decodeURIComponent(rest.join('='));
  }
  return undefined;
}

export function parseAcceptLanguage(header) {
  if (!header) return [];
  return header
    .split(',')
    .map((part) => {
      const [tag, ...params] = part.trim().split(';');
      const q = params.map((p) => p.trim()).find((p) => p.startsWith('q='));
      return { tag: tag.trim().toLowerCase(), q: q ? Number(q.slice(2)) : 1 };
    })
    .filter((l) => l.tag && !Number.isNaN(l.q) && l.q > 0)
    .sort((a, b) => b.q - a.q)
    .map((l) => l.tag);
}

/** 'uk' | 'en' */
export function preferredLocale({ cookie, acceptLanguage, country }) {
  const chosen = readCookie(cookie, LANG_COOKIE);
  if (chosen === 'uk' || chosen === 'en') return chosen;

  const languages = parseAcceptLanguage(acceptLanguage);
  if (languages.some((tag) => tag === 'uk' || tag.startsWith('uk-'))) return 'uk';
  if (country === 'UA') return 'uk';
  // No signal at all means a crawler, an OG scraper or a bare curl. Those must
  // get one fixed language, and it has to be the one the sitemap and the
  // canonical URLs describe — otherwise every submitted URL redirects the
  // crawler somewhere that is not in the sitemap.
  return 'en';
}

/** Returns the path to redirect to, or null to serve the request as-is. */
export function resolveLocaleRedirect({ pathname, cookie, acceptLanguage, country }) {
  if (pathname === '/uk' || pathname.startsWith('/uk/')) return null;
  if (NON_HTML.test(pathname)) return null;
  if (STATIC_PREFIXES.some((p) => pathname.startsWith(p))) return null;
  if (preferredLocale({ cookie, acceptLanguage, country }) !== 'uk') return null;
  return pathname === '/' ? '/uk/' : `/uk${pathname}`;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === 'GET' || request.method === 'HEAD') {
      const target = resolveLocaleRedirect({
        pathname: url.pathname,
        cookie: request.headers.get('cookie'),
        acceptLanguage: request.headers.get('accept-language'),
        country: request.cf && request.cf.country,
      });
      if (target) {
        const location = new URL(target + url.search, url.origin);
        return new Response(null, {
          status: 302,
          headers: { location: location.toString(), vary: 'Accept-Language, Cookie', 'cache-control': 'no-store' },
        });
      }
    }
    return env.ASSETS.fetch(request);
  },
};
