import type { APIRoute } from 'astro';
import { getBundle } from '../../lib/registry';
import { catalogueMarkdown } from '../../lib/markdown';
import { localeFromParams, localeStaticPaths, useTranslations } from '../../i18n/utils';

/** The whole catalogue in one file, for a reader who does not want seventy. */
export function getStaticPaths() {
  return localeStaticPaths();
}

export const GET: APIRoute = ({ params }) => {
  const lang = localeFromParams(params);
  return new Response(catalogueMarkdown(getBundle(lang), lang, useTranslations(lang)), {
    headers: { 'content-type': 'text/markdown; charset=utf-8' },
  });
};
