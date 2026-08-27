// <define:__ROUTES__>
var define_ROUTES_default = {
  version: 1,
  description: "Only HTML navigations need language negotiation; everything below is served from disk unchanged. Patterns must not swallow a page: /data/* would also match the /data page, so the export directory is named exactly.",
  include: [
    "/*"
  ],
  exclude: [
    "/_astro/*",
    "/api/v1/*",
    "/data/latest/*",
    "/schemas/*",
    "/icons/*",
    "/favicon.svg",
    "/robots.txt",
    "/sitemap.xml",
    "/llms.txt",
    "/llms-full.txt",
    "/manifest.webmanifest",
    "/sw.js",
    "/openapi.json"
  ]
};

// node_modules/.pnpm/wrangler@4.112.0/node_modules/wrangler/templates/pages-dev-pipeline.ts
import worker from "/Users/dmytro/.superset/projects/hoba.work/.wrangler/tmp/pages-YR1A4n/bundledWorker-0.524180316502199.mjs";
import { isRoutingRuleMatch } from "/Users/dmytro/.superset/projects/hoba.work/node_modules/.pnpm/wrangler@4.112.0/node_modules/wrangler/templates/pages-dev-util.ts";
export * from "/Users/dmytro/.superset/projects/hoba.work/.wrangler/tmp/pages-YR1A4n/bundledWorker-0.524180316502199.mjs";
var routes = define_ROUTES_default;
var pages_dev_pipeline_default = {
  fetch(request, env, context) {
    const { pathname } = new URL(request.url);
    for (const exclude of routes.exclude) {
      if (isRoutingRuleMatch(pathname, exclude)) {
        return env.ASSETS.fetch(request);
      }
    }
    for (const include of routes.include) {
      if (isRoutingRuleMatch(pathname, include)) {
        const workerAsHandler = worker;
        if (workerAsHandler.fetch === void 0) {
          throw new TypeError("Entry point missing `fetch` handler");
        }
        return workerAsHandler.fetch(request, env, context);
      }
    }
    return env.ASSETS.fetch(request);
  }
};
export {
  pages_dev_pipeline_default as default
};
//# sourceMappingURL=b0lxiu9h7nv.js.map
