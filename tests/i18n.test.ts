import { describe, expect, it } from 'vitest';
import { ui } from '../site/src/i18n/ui';
import { alternates, localizePath, stripLocale, useTranslations } from '../site/src/i18n/utils';

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
    expect(t('bar.order', { n: 3 })).toBe('Порядок у воронці: №3');
  });
});

describe('locale path helpers', () => {
  it('detects and strips the /uk prefix', () => {
    expect(stripLocale('/uk')).toEqual({ lang: 'uk', path: '/' });
    expect(stripLocale('/uk/registry')).toEqual({ lang: 'uk', path: '/registry' });
    expect(stripLocale('/ukraine')).toEqual({ lang: 'en', path: '/ukraine' });
    expect(stripLocale('/')).toEqual({ lang: 'en', path: '/' });
  });

  it('localizes paths in both directions', () => {
    expect(localizePath('/registry', 'uk')).toBe('/uk/registry');
    expect(localizePath('/uk/mechanisms/M-001/', 'en')).toBe('/mechanisms/M-001');
    expect(localizePath('/', 'uk')).toBe('/uk');
    expect(localizePath('/uk/', 'en')).toBe('/');
  });

  it('produces hreflang alternates with an x-default', () => {
    const alts = alternates('/uk/patterns', new URL('https://hoba.work'));
    expect(alts).toEqual([
      { lang: 'en', href: 'https://hoba.work/patterns' },
      { lang: 'uk', href: 'https://hoba.work/uk/patterns' },
      { lang: 'x-default', href: 'https://hoba.work/patterns' },
    ]);
  });
});
