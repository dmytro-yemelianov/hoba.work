/**
 * Edge surface of @hoba/registry: the validators, and nothing that needs a
 * filesystem.
 *
 * `core.ts` is the browser-safe subset and reaches neither a Node built-in nor
 * zod, because the site bundles it into pages. The validators genuinely need
 * zod — they are schema conformance — but need no filesystem. This is that
 * third surface: what an edge runtime imports to check a submitted analysis or
 * scenario against a registry it fetched, using the same code the build uses
 * rather than a second implementation of the same rules.
 *
 * Module-by-module for the same reason `core.ts` is: `@hoba/validator` also
 * contains `scenarios-store`, which reads the filesystem.
 */
export { analysisSchema, validateAnalysis, claimRank, type Analysis } from '@hoba/validator/analysis';
export { scenarioSchema, validateScenarios, resolveScenarioId, type Scenario } from '@hoba/validator/scenarios';
export { evidenceLevelSchema, PROVING_EVIDENCE_KINDS } from '@hoba/registry-core/schemas';
export type { ValidationIssue } from '@hoba/validator/validation';
export type { RegistryBundle } from '@hoba/registry-core/types';
