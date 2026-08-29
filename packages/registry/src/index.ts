/**
 * @hoba/registry — the whole surface, in one import.
 *
 * The registry is four packages now (`registry-core`, `graph`, `validator`,
 * `search`), split so the dependency boundaries are enforced by the build
 * rather than merely described. This facade keeps that split internal: every
 * consumer that imported `@hoba/registry` still does, and still gets
 * everything.
 *
 * Two narrower entry points exist for runtimes that cannot take everything:
 * `@hoba/registry/core` (browser-safe: no Node built-ins, no zod) and
 * `@hoba/registry/edge` (the validators, no filesystem).
 */
export * from '@hoba/registry-core';
export * from '@hoba/graph';
export * from '@hoba/validator';
export * from '@hoba/search';
