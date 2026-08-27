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
6. **Model** (#3 → #4 → #5 → #16 → #17, then #6 later) — actors, then workflows
   as data, then the player, then the canonical path, then the eras. The
   decision tree waits for the player deliberately, so it reuses one interaction
   model instead of inventing a second. *Done through #17.*
7. **Lens** (#9, #10 → #11) — per-actor recommendations and perspectives, then
   the selector. Depends on actors existing.

## Decided

**URLs (#2 → #1).** Two prerendered trees at `/_i/en/**` and `/_i/uk/**`; the
edge worker resolves a language per request and serves the matching asset under
one language-free URL. The alternative — both languages in one document,
revealed in the client — was measured and rejected: it leaves the graph
explorer structurally broken in Ukrainian, binds every `getElementById` to the
hidden English copy, and can stamp only one `<head>`, so every Ukrainian share
would carry an English card.

Two things the spike changed about the plan. It is a latency **win**: the worker
already made exactly one asset fetch per request, and the change deletes both
the language 302 and the trailing-slash 308 that every in-site click paid —
about 70 ms. And a stated `Accept-Language` now outranks geography, which is
both more defensible and what makes the test suite independent of where it runs.

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

## The two axes, recorded

**The canonical path (#16).** WF-003 writes the process as the commitments it is
supposed to keep, and every other entry is positioned against it. A barrier is
not a gate — this path has fourteen gates and they are all legitimate. A barrier
is the point at which one of those commitments stops being kept. `deviations`
on each state names which ones, and tests assert the relation is total: every
barrier has exactly one commitment it breaks, every mechanism at least one.

Deliberately *not* deviations: a decline and a closed search. Most candidates are
declined and some searches stop; a path that could only end in a hire would be a
fantasy rather than a standard. What makes them part of the path is that they
arrive, they say what happened, and they arrive in time to be useful.

**The eras (#17).** The second axis: the same funnel had different physics when
capital was free. Four eras from 2008, each stating where the money came from,
what that did to hiring, how a person got in, and what closed it. Every figure
carries an evidence record with a URL, and where a source is a tracker rather
than an official statistic the record says so — the two tell different stories
about the same period, and the difference is the argument.

The rule this sets for anything added here later: **no figure without a source a
reader can open**, and no conflation of a tracked count with an official series.
Research for it ran as five strands, each put to an adversarial verifier
instructed to refute rather than confirm. Three claims did not survive and are
not on the site.

## Not scheduled yet

- Decision tree (#6) — waits for the player.
- Anything that would put a real company or person into the registry. The
  methodology forbids it and the tests enforce it.
