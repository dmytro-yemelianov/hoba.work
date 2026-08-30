import { ui, type UIKey } from './ui.js';

export type Lang = keyof typeof ui;
export const LANGS: Lang[] = ['en', 'uk'];
export const DEFAULT_LANG: Lang = 'en';
export const LANG_LABELS: Record<Lang, string> = { en: 'EN', uk: 'UA' };
export const OG_LOCALES: Record<Lang, string> = { en: 'en_US', uk: 'uk_UA' };
export const LANG_COOKIE = 'hoba_lang';

/**
 * Public URLs carry no language. Both language trees are prerendered under
 * internal prefixes and the edge worker serves the right one under the public
 * URL, so `[...locale]` is now a build-time detail rather than an address.
 */
export const INTERNAL_PREFIX = '_i';
export const internalBase = (lang: Lang): string => `${INTERNAL_PREFIX}/${lang}`;

/** `[...locale]` routes: one prerendered tree per language, both internal. */
export function localeStaticPaths() {
  return LANGS.map((lang) => ({ params: { locale: internalBase(lang) } }));
}

/** The same, for the entity routes that build their own paths. */
export function localeParams(lang: Lang): { locale: string } {
  return { locale: internalBase(lang) };
}

export function localeFromParams(params: { locale?: string | undefined }): Lang {
  return params.locale === internalBase('uk') ? 'uk' : 'en';
}

/**
 * Nothing prefixes a link any more. Kept as a function so the ninety-odd
 * `${prefix}/…` interpolations across the pages did not all have to change.
 */
export const localePrefix = (_lang: Lang): string => '';

/**
 * Turn a built (internal) pathname into the public one a reader sees. The
 * trailing slash goes too: Astro emits directory files, sitemap.xml lists the
 * bare form, and the canonical must be the one address, not a second one.
 */
export function publicPath(pathname: string): string {
  const stripped = pathname
    .replace(new RegExp(`^/${INTERNAL_PREFIX}/(?:${LANGS.join('|')})(?=/|$)`), '')
    .replace(/\/$/, '');
  return stripped === '' ? '/' : stripped;
}

/**
 * Language is an explicit, shareable override — a query, never part of the
 * slug. Unrelated params and the hash survive, because `?type=` and a future
 * `?lens=` share this URL.
 */
export function withLang(url: URL, lang: Lang): string {
  const params = new URLSearchParams(url.search);
  params.set('lang', lang);
  const query = params.toString();
  return `${publicPath(url.pathname)}${query ? `?${query}` : ''}${url.hash}`;
}

export type Translate = (key: UIKey, vars?: Record<string, string | number>) => string;

/** Several dictionary strings double as inline labels and carry a trailing colon. */
export const asHeading = (value: string): string => value.replace(/\s*:\s*$/, '');

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, name: string) => (name in vars ? String(vars[name]) : `{${name}}`));
}

/**
 * A key assembled from a registry value at build time. The compiler cannot
 * narrow `stage.${string}` to a member of the dictionary, and the value is not
 * known until the registry is read — so the pairing of each prefix to the
 * vocabulary that feeds it is checked in tests/i18n.test.ts instead, which is
 * the only place that can check it. Written as a call rather than a cast so it
 * is greppable, and so a cast never has to be invented at the call site.
 */
export const interpolated = (key: string): UIKey => key as UIKey;

export function useTranslations(lang: Lang): Translate {
  const dict = ui[lang] as Record<UIKey, string>;
  return (key, vars) => interpolate(dict[key] ?? ui.en[key] ?? key, vars);
}

/** Pick a subset of the dictionary for client-side scripts. */
export function clientDictionary<K extends UIKey>(lang: Lang, keys: readonly K[]): Record<K, string> {
  const dict = ui[lang] as Record<UIKey, string>;
  const out = {} as Record<K, string>;
  for (const k of keys) out[k] = dict[k] ?? ui.en[k];
  return out;
}


export { ui };
export type { UIKey };

/**
 * The project name, set so it cannot be misread.
 *
 * Lowercase, because capitalised it reads as Cyrillic to a Ukrainian eye —
 * HOBA is нова. Bold, because lowercase alone makes it disappear into the
 * sentence. This returns HTML and escapes everything else, so it is only ever
 * used with `set:html` on our own dictionary strings.
 */
// The name on its own — never a domain (hoba.work), a package (@hoba/mcp), a
// command, or a filename (hoba-parse-check). Those are identifiers; this is a
// name being read.
const WORDMARK = /(?<![\w@/.-])hoba(?![\w./-])/g;

const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function branded(text: string): string {
  return text.replace(/[&<>"']/g, (c) => ESCAPES[c]!).replace(WORDMARK, '<b class="wordmark">hoba</b>');
}

/** True when the string carries the name at all — lets a caller skip `set:html`. */
export const hasWordmark = (text: string): boolean => new RegExp(WORDMARK.source).test(text);
