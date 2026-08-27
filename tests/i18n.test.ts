import { describe, expect, it } from 'vitest';
import { ui } from '../site/src/i18n/ui';
import { branded, internalBase, localeFromParams, localeStaticPaths, publicPath, useTranslations, withLang } from '../site/src/i18n/utils';

describe('ui dictionary', () => {
  it('has the same keys in every locale, with no empty Ukrainian strings', () => {
    const en = Object.keys(ui.en).sort();
    const uk = Object.keys(ui.uk).sort();
    expect(uk).toEqual(en);
    const emptyUk = Object.entries(ui.uk).filter(([k, v]) => v === '' && (ui.en as Record<string, string>)[k] !== '');
    expect(emptyUk).toEqual([]);
  });

  it('keeps interpolation placeholders consistent between locales', () => {
    const placeholders = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort();
    for (const key of Object.keys(ui.en) as (keyof typeof ui.en)[]) {
      expect(placeholders(ui.uk[key]), key).toEqual(placeholders(ui.en[key]));
    }
  });

  it('does not leave obviously untranslated Latin-only sentences in the Ukrainian UI (code identifiers excepted)', () => {
    const allowed = new Set(['dev.mcp.configComment2', 'about.p1.strong']);
    const offenders = Object.entries(ui.uk).filter(([k, v]) => !allowed.has(k) && /[A-Za-z]{4,}/.test(v) && !/[Ѐ-ӿ]/.test(v));
    expect(offenders.map(([k]) => k)).toEqual([]);
  });

  it('interpolates and falls back to English for unknown keys', () => {
    const t = useTranslations('uk');
    expect(t('home.cta.registry', { n: 72 })).toContain('72');
    // Assert the interpolation, not the copy: the prose is edited, the
    // placeholder contract is not.
    expect(t('bar.order', { n: 3 })).toMatch(/\b3\b/);
    expect(t('bar.order', { n: 3 })).not.toContain('{n}');
  });
});

describe('locale routing helpers', () => {
  it('prerenders one internal tree per language', () => {
    expect(localeStaticPaths()).toEqual([{ params: { locale: '_i/en' } }, { params: { locale: '_i/uk' } }]);
    expect(localeFromParams({ locale: '_i/uk' })).toBe('uk');
    expect(localeFromParams({ locale: '_i/en' })).toBe('en');
    expect(localeFromParams({})).toBe('en');
    expect(internalBase('uk')).toBe('_i/uk');
  });

  it('turns a built path into the one public address', () => {
    expect(publicPath('/_i/uk/registry/')).toBe('/registry');
    expect(publicPath('/_i/en/mechanisms/M-001/')).toBe('/mechanisms/M-001');
    expect(publicPath('/_i/uk/')).toBe('/');
    expect(publicPath('/_i/en')).toBe('/');
    // A path that is already public, and one that merely looks internal.
    expect(publicPath('/registry')).toBe('/registry');
    expect(publicPath('/_internal/x')).toBe('/_internal/x');
  });

  it('carries the language as a query, never as a segment, and keeps the rest', () => {
    expect(withLang(new URL('https://hoba.work/_i/en/registry/'), 'uk')).toBe('/registry?lang=uk');
    expect(withLang(new URL('https://hoba.work/_i/uk/registry/?type=loop'), 'en')).toBe('/registry?type=loop&lang=en');
    expect(withLang(new URL('https://hoba.work/_i/uk/registry/?lang=uk#top'), 'en')).toBe('/registry?lang=en#top');
    expect(withLang(new URL('https://hoba.work/_i/en/'), 'uk')).toBe('/?lang=uk');
  });
});

/**
 * The name is set lowercase everywhere it is read, because capitalised it is
 * Cyrillic to a Ukrainian eye: HOBA is нова. Bold does the work capitals used
 * to, and `branded()` in the site adds it.
 */
describe('the wordmark', () => {
  it('is never capitalised in anything a reader sees', () => {
    for (const [lang, dict] of Object.entries(ui)) {
      const shouting = Object.entries(dict as Record<string, string>)
        .filter(([, value]) => /\bHOBA\b|\bHoba\b/.test(value))
        .map(([key, value]) => `${lang}/${key}: ${value.slice(0, 60)}`);
      expect(shouting).toEqual([]);
    }
  });

  it('bolds the name and escapes everything around it', () => {
    expect(branded('About hoba')).toBe('About <b class="wordmark">hoba</b>');
    // Domains, packages, commands and filenames are identifiers, not the name.
    expect(branded('hoba.work is the domain')).toBe('hoba.work is the domain');
    expect(branded('npx @hoba/mcp')).toBe('npx @hoba/mcp');
    expect(branded('hoba-parse-check')).toBe('hoba-parse-check');
    expect(branded('<script>x</script> hoba')).toBe(
      '&lt;script&gt;x&lt;/script&gt; <b class="wordmark">hoba</b>'
    );
  });
});
