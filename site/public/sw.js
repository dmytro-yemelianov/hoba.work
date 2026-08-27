/**
 * Offline shell for hoba.work.
 *
 * The site is static and language-negotiated at the edge, so the rules are
 * deliberately conservative:
 *  - navigations are network-first (content must never go stale behind a
 *    redirect) and fall back to the cached page, then to a cached shell;
 *  - hashed build assets and icons are cache-first, they never change in place;
 *  - the JSON API and data exports are network-first with a cache fallback, so
 *    a previously visited entity still opens on a plane;
 *  - a navigation is cached under its URL *and* the language it came back in,
 *    because one URL now serves both languages and a language-blind cache
 *    would hand a reader the other one;
 *  - a redirected navigation response is never cached under the requested URL.
 */
const VERSION = 'hoba-v2';
const SHELL = `${VERSION}-shell`;
const PAGES = `${VERSION}-pages`;
const ASSETS = `${VERSION}-assets`;
const DATA = `${VERSION}-data`;
// Only language-neutral assets are precached: '/' redirects per visitor, so
// storing it here could answer an English request with the Ukrainian mirror.
const PRECACHE = ['/favicon.svg', '/manifest.webmanifest'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL)
      .then((cache) => cache.addAll(PRECACHE.map((url) => new Request(url, { cache: 'reload' }))))
      .catch(() => undefined)
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => !key.startsWith(VERSION)).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

const isImmutable = (url) => url.pathname.startsWith('/_astro/') || url.pathname.startsWith('/icons/');
const isData = (url) => url.pathname.startsWith('/api/') || url.pathname.startsWith('/data/') || url.pathname.startsWith('/schemas/');
const isFont = (url) => url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  if (hit) return hit;
  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
}

async function networkFirst(request, cacheName, { onlySameUrl = false } = {}) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok && (!onlySameUrl || response.url === request.url)) cache.put(request, response.clone());
    return response;
  } catch (error) {
    const hit = await cache.match(request);
    if (hit) return hit;
    throw error;
  }
}

/**
 * One public URL serves both languages, so a cache entry has to record which
 * one it holds. The key is the URL plus the language the edge reported, and the
 * language the reader last received is remembered so an offline lookup can ask
 * for the right one.
 */
const LANG_RECORD = '/__hoba_lang';

function langKey(url, lang) {
  return `${url}${url.includes('?') ? '&' : '?'}__lang=${lang}`;
}

async function rememberLanguage(cache, lang) {
  await cache.put(LANG_RECORD, new Response(lang));
}

async function lastLanguage(cache) {
  const record = await cache.match(LANG_RECORD);
  return record ? record.text() : 'en';
}

async function navigate(request) {
  const cache = await caches.open(PAGES);
  try {
    const response = await fetch(request);
    if (response.ok && response.url === request.url) {
      const lang = response.headers.get('content-language') || 'en';
      await cache.put(langKey(request.url, lang), response.clone());
      await rememberLanguage(cache, lang);
    }
    return response;
  } catch (error) {
    const lang = await lastLanguage(cache);
    const hit = (await cache.match(langKey(request.url, lang))) || (await cache.match(langKey(request.url, lang === 'uk' ? 'en' : 'uk')));
    if (hit) return hit;
    const home = new URL('/', self.location.origin).toString();
    return (await cache.match(langKey(home, lang))) || Response.error();
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const sameOrigin = url.origin === self.location.origin;

  if (request.mode === 'navigate') {
    event.respondWith(navigate(request));
    return;
  }

  if (!sameOrigin) {
    if (isFont(url)) event.respondWith(cacheFirst(request, ASSETS).catch(() => fetch(request)));
    return;
  }

  if (isImmutable(url)) {
    event.respondWith(cacheFirst(request, ASSETS));
    return;
  }

  if (isData(url)) {
    event.respondWith(networkFirst(request, DATA));
  }
});
