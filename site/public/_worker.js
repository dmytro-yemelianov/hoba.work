/**
 * Cloudflare Pages worker (Advanced Mode): one URL per page, language resolved
 * per request.
 *
 * Every page is prerendered twice, into internal trees at /_i/en/… and
 * /_i/uk/…. Nothing public carries a language. For an HTML navigation the
 * worker picks a language and serves the matching internal asset under the
 * address the reader asked for.
 *
 * Precedence, strongest signal first:
 *   ?lang=en|uk  → an explicit, shareable override; also writes the cookie
 *   hoba_lang    → the reader's own earlier choice
 *   Accept-Language — Ukrainian if it lists Ukrainian, English if it lists
 *                     anything else; a stated preference outranks geography
 *   Cloudflare geo (UA), only when the browser said nothing
 *   English
 *
 * The last rule is load-bearing. A request with no language signal is a
 * crawler, an OG scraper or a bare curl, and it must receive the language
 * sitemap.xml and the canonical URLs describe.
 *
 * /uk/… and /_i/… are permanently redirected to the public path, so every link
 * shared before this change stays alive.
 */
const LANG_COOKIE = 'hoba_lang';
const LANGS = ['en', 'uk'];
const INTERNAL = '/_i';
const NON_HTML = /\.[a-z0-9]+$/i;
const STATIC_PREFIXES = ['/api/', '/data/', '/schemas/', '/_astro/', '/icons/'];

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
export function preferredLocale({ query, cookie, acceptLanguage, country }) {
  if (LANGS.includes(query)) return query;

  const chosen = readCookie(cookie, LANG_COOKIE);
  if (LANGS.includes(chosen)) return chosen;

  const languages = parseAcceptLanguage(acceptLanguage);
  if (languages.some((tag) => tag === 'uk' || tag.startsWith('uk-'))) return 'uk';
  // A browser that named its languages has stated a preference. Geography is an
  // inference about the same question, and it does not get to overrule the
  // answer: someone in Kyiv running an English browser is telling us something.
  // It also keeps the test suite from depending on where it is run from.
  if (languages.length > 0) return 'en';
  if (country === 'UA') return 'uk';
  return 'en';
}

/** True when this path is served from disk as-is, with no language dimension. */
export function isStaticAsset(pathname) {
  return NON_HTML.test(pathname) || STATIC_PREFIXES.some((p) => pathname.startsWith(p));
}

/**
 * Legacy and internal addresses collapse onto the public one. Returns the path
 * to redirect to, or null when the request is already at its public address.
 */
export function legacyRedirect(pathname) {
  if (pathname === '/uk' || pathname.startsWith('/uk/')) return pathname.slice(3) || '/';
  if (pathname === INTERNAL || pathname.startsWith(`${INTERNAL}/`)) {
    const stripped = pathname.replace(new RegExp(`^${INTERNAL}/(?:${LANGS.join('|')})(?=/|$)`), '');
    return stripped || '/';
  }
  return null;
}

/**
 * Where the prerendered document actually lives. Always the trailing-slash
 * directory form: the bare and .html forms answer with a 308 whose Location
 * would leak the internal path.
 */
export function internalPath(pathname, lang) {
  const clean = pathname === '/' ? '' : pathname.replace(/\/$/, '');
  return `${INTERNAL}/${lang}${clean}/`;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method !== 'GET' && request.method !== 'HEAD') return env.ASSETS.fetch(request);

    const redirect = legacyRedirect(url.pathname);
    if (redirect) {
      const location = new URL(redirect + url.search, url.origin);
      return new Response(null, { status: 301, headers: { location: location.toString() } });
    }

    if (isStaticAsset(url.pathname)) return env.ASSETS.fetch(request);

    const query = url.searchParams.get('lang');
    const lang = preferredLocale({
      query,
      cookie: request.headers.get('cookie'),
      acceptLanguage: request.headers.get('accept-language'),
      country: request.cf && request.cf.country,
    });

    // The internal request must not carry the public query: it would miss the
    // asset and would pollute any cache key built from it.
    const internal = (path) => new Request(new URL(internalPath(path, lang), url.origin), request);
    let asset = await env.ASSETS.fetch(internal(url.pathname));
    if (asset.status === 404) {
      // Pages only knows about a root 404.html. Serve the not-found page from
      // the tree we resolved, so it is in the reader's language.
      const notFound = await env.ASSETS.fetch(internal('/404'));
      if (notFound.ok) asset = new Response(notFound.body, { ...notFound, status: 404 });
    }

    const response = new Response(asset.body, asset);
    response.headers.set('content-language', lang);
    response.headers.set('vary', 'Accept-Language, Cookie');
    // A language-negotiated document is per-reader. The CDN does not cache HTML
    // here in any case; this states it rather than relying on that.
    response.headers.set('cache-control', 'private, no-cache');
    if (LANGS.includes(query)) {
      response.headers.append('set-cookie', `${LANG_COOKIE}=${lang}; path=/; max-age=31536000; samesite=lax`);
    }
    return response;
  },
};
