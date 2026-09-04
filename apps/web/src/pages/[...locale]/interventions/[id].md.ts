import type { APIRoute } from 'astro';
import { getBundle } from '../../../lib/registry';
import { entityMarkdown } from '../../../lib/markdown';
import { LANGS, localeParams, useTranslations, type Lang } from '../../../i18n/utils';

/** Same page, written for a reader who is piping it somewhere. */
export function getStaticPaths() {
  return LANGS.flatMap((lang) =>
    getBundle(lang).interventions.map((entity) => ({
      params: { ...localeParams(lang), id: entity.id },
      props: { lang, entity },
    }))
  );
}

export const GET: APIRoute = ({ props }) => {
  const { lang, entity } = props as { lang: Lang; entity: Parameters<typeof entityMarkdown>[0] };
  return new Response(entityMarkdown(entity, lang, useTranslations(lang), getBundle(lang)), {
    headers: { 'content-type': 'text/markdown; charset=utf-8' },
  });
};
