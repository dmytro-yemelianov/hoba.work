/**
 * Browser-safe surface of @hoba/registry: types, graph, diagnostics and search.
 * No Node built-ins and no zod are reachable from here, so the site can bundle
 * the very same diagnostic engine that powers the CLI and the MCP server.
 */
export * from './types.js';
export * from './conformance.js';
export * from './graph.js';
export * from './diagnostics.js';
export * from './search.js';
export * from './separation.js';
