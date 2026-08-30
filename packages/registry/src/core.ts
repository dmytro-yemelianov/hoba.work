/**
 * Browser-safe surface of @hoba/registry: types, graph, diagnostics and search.
 * No Node built-ins and no zod are reachable from here, so the site can bundle
 * the very same diagnostic engine that powers the CLI and the MCP server.
 *
 * Deliberately module-by-module rather than whole packages: `@hoba/registry-core`
 * also contains the loader and the schemas, which would drag in `node:fs` and
 * zod and quietly break the promise this file makes.
 */
export * from '@hoba/registry-core/types';
// Type-only, so it is erased: the constant itself lives beside the schema that
// defines the kinds, and importing that here would pull zod into the browser.
export type { ReaderFacingType } from '@hoba/registry-core/schemas';
export * from '@hoba/validator/conformance';
export * from '@hoba/graph/graph';
export * from '@hoba/graph/diagnostics';
export * from '@hoba/search/search';
export * from '@hoba/graph/separation';
