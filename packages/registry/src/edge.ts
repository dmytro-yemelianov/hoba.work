/**
 * Edge surface of @hoba/registry: the validators, and nothing that needs a
 * filesystem.
 *
 * `core.ts` is the browser-safe subset and is documented as reaching neither a
 * Node built-in nor zod, because the site bundles it into pages. The validators
 * genuinely need zod — they are schema conformance — so they cannot live there,
 * but they need no filesystem either. This is that third surface: what an edge
 * runtime can import to check a submitted analysis or scenario against a
 * registry it fetched, using the same code the build uses rather than a second
 * implementation of the same rules.
 *
 * The registry bundle is a parameter here, never something this module loads.
 */
export { analysisSchema, validateAnalysis, claimRank, type Analysis } from './analysis.js';
export { scenarioSchema, validateScenarios, resolveScenarioId, type Scenario } from './scenarios.js';
export { evidenceLevelSchema, PROVING_EVIDENCE_KINDS } from './schemas.js';
export type { ValidationIssue } from './validation.js';
export type { RegistryBundle } from './types.js';
