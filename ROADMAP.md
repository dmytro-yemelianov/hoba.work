# Roadmap

Tracked on [the project board](https://github.com/users/dmytro-yemelianov/projects/4).
Every item below is a GitHub issue; this file is the ordering and the reasoning
behind it.

## Sequence

The order is driven by what unblocks what, not by size.

1. **Harness** (#14, #15) — the repeatable chores get one entry point first,
   because everything after this is long content and design work that will run
   them dozens of times.
2. **Distribution** (#12) — `robots.txt`, `sitemap.xml`, `llms.txt`. Independent
   of everything else and cheap.
3. **URLs** (#2 spike → #1) — language leaves the URL. This has to land before
   the card worker and the Markdown routes, because both need to know how a
   language is chosen for a given request.
4. **Machine formats** (#13) — every page as Markdown and JSON, on the URL
   scheme decided in step 3.
5. **Cards** (#7 → #8) — the verbacorpus card worker ported over, then
   per-entity `og:image` and the share control.
6. **Model** (#3 → #4 → #5, then #6 later) — actors, then workflows as data,
   then the player. The decision tree waits for the player deliberately, so it
   reuses one interaction model instead of inventing a second.
7. **Lens** (#9, #10 → #11) — per-actor recommendations and perspectives, then
   the selector. Depends on actors existing.

## The URL trade-off, recorded

Removing the language segment gives one shareable link per page, which is the
point. It costs one indexable URL per language: search engines will index a
single version and `hreflang` stops meaning anything.

Mitigations that do not put a language back in the slug:

- canonical URL without a language, `Vary: Accept-Language` on the response;
- `?lang=uk` as an explicit override for "send this in Ukrainian", which is a
  query, not part of the slug;
- `/uk/*` keeps working as a 301 so every link already shared stays alive.

This is a deliberate trade, made once, written down here so it is not
rediscovered as a bug later.

## Not scheduled yet

- Decision tree (#6) — waits for the player.
- Anything that would put a real company or person into the registry. The
  methodology forbids it and the tests enforce it.
