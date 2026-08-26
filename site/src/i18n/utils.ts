import { ui, type UIKey } from './ui.js';

export type Lang = keyof typeof ui;
export const LANGS: Lang[] = ['en', 'uk'];
export const DEFAULT_LANG: Lang = 'en';
export const LANG_LABELS: Record<Lang, string> = { en: 'EN', uk: 'UA' };
export const OG_LOCALES: Record<Lang, string> = { en: 'en_US', uk: 'uk_UA' };
export const LANG_COOKIE = 'hoba_lang';

/** `[...locale]` routes: `undefined` renders the unprefixed English route, `'uk'` the Ukrainian mirror. */
export function localeStaticPaths() {
  return [{ params: { locale: undefined } }, { params: { locale: 'uk' } }];
}

export function localeFromParams(params: { locale?: string | undefined }): Lang {
  return params.locale === 'uk' ? 'uk' : 'en';
}

export const localePrefix = (lang: Lang): string => (lang === 'uk' ? '/uk' : '');

/** Strip a leading locale segment from a pathname. */
export function stripLocale(pathname: string): { lang: Lang; path: string } {
  const m = pathname.match(/^\/uk(?=\/|$)(.*)$/);
  if (m) return { lang: 'uk', path: m[1] || '/' };
  return { lang: 'en', path: pathname || '/' };
}

/** Same page in another language; keeps trailing-slash-less canonical form. */
export function localizePath(pathname: string, lang: Lang): string {
  const { path } = stripLocale(pathname);
  const clean = path === '/' ? '' : path.replace(/\/$/, '');
  return lang === 'uk' ? `/uk${clean}` || '/uk' : clean || '/';
}

export type Translate = (key: UIKey, vars?: Record<string, string | number>) => string;

/** Several dictionary strings double as inline labels and carry a trailing colon. */
export const asHeading = (value: string): string => value.replace(/\s*:\s*$/, '');

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, name: string) => (name in vars ? String(vars[name]) : `{${name}}`));
}

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

/** hreflang alternates for the current page. */
export function alternates(pathname: string, site: URL): { lang: Lang | 'x-default'; href: string }[] {
  const en = new URL(localizePath(pathname, 'en'), site).href;
  const uk = new URL(localizePath(pathname, 'uk'), site).href;
  return [
    { lang: 'en', href: en },
    { lang: 'uk', href: uk },
    { lang: 'x-default', href: en },
  ];
}

export { ui };
export type { UIKey };
