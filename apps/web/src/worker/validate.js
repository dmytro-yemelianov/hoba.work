/**
 * POST /api/v1/validate/* — conformance checks over HTTP.
 *
 * Design doc §13 deferred a live endpoint until the Analysis and Scenario
 * validators existed as library functions, on the grounds that they would need
 * to be callable code either way. They do now, so this is the thin part: parse
 * a body, hand it to the same function the build and the MCP server call, and
 * return what it says. There is no second implementation of any rule here.
 *
 * The registry is fetched from the static export the site already publishes,
 * so an endpoint always validates against the release it is deployed beside.
 *
 * Mounted at `/validate/*`, which is the path §13 names — and which matters
 * beyond tidiness: `_routes.json` excludes `/api/v1/*` from the worker so the
 * static exports are served straight off disk, and an exclusion there always
 * beats an include, so an endpoint under `/api/v1/` would never run.
 */
import { validateAnalysis, validateScenarios, scenarioSchema, claimRank } from '@hoba/registry/edge';

const REGISTRY_ASSET = '/data/latest/registry.json';

const json = (body, status = 200) =>
  new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

/** One bundle per isolate: the asset is immutable for the life of a deploy. */
let cached;
async function registry(env, origin) {
  if (!cached) {
    const res = await env.ASSETS.fetch(new URL(REGISTRY_ASSET, origin).toString());
    if (!res.ok) throw new Error(`registry export unavailable (${res.status})`);
    cached = await res.json();
  }
  return cached;
}

const ROUTES = {
  '/validate/analysis': (body, bundle) => {
    const issues = validateAnalysis(body, bundle);
    return { valid: issues.length === 0, issues };
  },
  '/validate/scenario': (body, bundle) => {
    const parsed = scenarioSchema.safeParse(body);
    if (!parsed.success) {
      return {
        valid: false,
        issues: parsed.error.issues.map((i) => ({
          severity: 'error',
          rule: 'schema',
          message: `${i.path.join('.') || '(root)'}: ${i.message}`,
        })),
      };
    }
    const issues = validateScenarios([parsed.data], bundle);
    return { valid: issues.length === 0, id: parsed.data.id, issues };
  },
  '/validate/claim': (body, bundle) => {
    const { id, claim_level: claimLevel } = body ?? {};
    if (typeof id !== 'string' || typeof claimLevel !== 'string') {
      return { valid: false, issues: [{ severity: 'error', rule: 'schema', message: 'expected { id, claim_level }' }] };
    }
    const node = [
      ...bundle.observations, ...bundle.barriers, ...bundle.mechanisms,
      ...bundle.patterns, ...bundle.loops, ...bundle.interventions,
    ].find((n) => n.id === id || (n.aliases ?? []).includes(id));
    if (!node) {
      return { valid: false, issues: [{ severity: 'error', rule: 'dangling-reference', message: `unknown entity: ${id}` }] };
    }
    const carried = node.evidence_level ?? 'unknown';
    const claimed = claimRank(claimLevel);
    const held = claimRank(carried);
    const over = claimed !== null && held !== null && claimed > held;
    return {
      valid: !over,
      id: node.id,
      claim_level: claimLevel,
      registry_level: carried,
      issues: over
        ? [{ severity: 'error', rule: 'overclaim', nodeId: node.id,
             message: `claims "${claimLevel}" for ${node.id}, which the registry itself carries only as "${carried}"` }]
        : [],
    };
  },
};

export function isValidateRoute(pathname) {
  return Object.prototype.hasOwnProperty.call(ROUTES, pathname.replace(/\/$/, ''));
}

export async function handleValidate(request, env) {
  const url = new URL(request.url);
  const route = ROUTES[url.pathname.replace(/\/$/, '')];
  if (!route) return json({ error: 'not found' }, 404);
  if (request.method !== 'POST') {
    return json({ error: 'method not allowed', allow: 'POST' }, 405, );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'body must be JSON' }, 400);
  }

  try {
    const bundle = await registry(env, url.origin);
    return json({ registry_version: bundle.version, ...route(body, bundle) });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : String(error) }, 500);
  }
}
