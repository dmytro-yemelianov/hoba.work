var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// _worker.js
var LANG_COOKIE = "hoba_lang";
var LANGS = ["en", "uk"];
var INTERNAL = "/_i";
var NON_HTML = /\.[a-z0-9]+$/i;
var STATIC_PREFIXES = ["/api/", "/data/", "/schemas/", "/_astro/", "/icons/"];
function readCookie(cookieHeader, name) {
  if (!cookieHeader) return void 0;
  for (const part of cookieHeader.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === name) return decodeURIComponent(rest.join("="));
  }
  return void 0;
}
__name(readCookie, "readCookie");
function parseAcceptLanguage(header) {
  if (!header) return [];
  return header.split(",").map((part) => {
    const [tag, ...params] = part.trim().split(";");
    const q = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
    return { tag: tag.trim().toLowerCase(), q: q ? Number(q.slice(2)) : 1 };
  }).filter((l) => l.tag && !Number.isNaN(l.q) && l.q > 0).sort((a, b) => b.q - a.q).map((l) => l.tag);
}
__name(parseAcceptLanguage, "parseAcceptLanguage");
function preferredLocale({ query, cookie, acceptLanguage, country }) {
  if (LANGS.includes(query)) return query;
  const chosen = readCookie(cookie, LANG_COOKIE);
  if (LANGS.includes(chosen)) return chosen;
  const languages = parseAcceptLanguage(acceptLanguage);
  if (languages.some((tag) => tag === "uk" || tag.startsWith("uk-"))) return "uk";
  if (languages.length > 0) return "en";
  if (country === "UA") return "uk";
  return "en";
}
__name(preferredLocale, "preferredLocale");
function isStaticAsset(pathname) {
  return NON_HTML.test(pathname) || STATIC_PREFIXES.some((p) => pathname.startsWith(p));
}
__name(isStaticAsset, "isStaticAsset");
function legacyRedirect(pathname) {
  if (pathname === "/uk" || pathname.startsWith("/uk/")) return pathname.slice(3) || "/";
  if (pathname === INTERNAL || pathname.startsWith(`${INTERNAL}/`)) {
    const stripped = pathname.replace(new RegExp(`^${INTERNAL}/(?:${LANGS.join("|")})(?=/|$)`), "");
    return stripped || "/";
  }
  return null;
}
__name(legacyRedirect, "legacyRedirect");
function internalPath(pathname, lang) {
  const clean = pathname === "/" ? "" : pathname.replace(/\/$/, "");
  return `${INTERNAL}/${lang}${clean}/`;
}
__name(internalPath, "internalPath");
var worker_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method !== "GET" && request.method !== "HEAD") return env.ASSETS.fetch(request);
    const redirect = legacyRedirect(url.pathname);
    if (redirect) {
      const location = new URL(redirect + url.search, url.origin);
      return new Response(null, { status: 301, headers: { location: location.toString() } });
    }
    if (isStaticAsset(url.pathname)) return env.ASSETS.fetch(request);
    const query = url.searchParams.get("lang");
    const lang = preferredLocale({
      query,
      cookie: request.headers.get("cookie"),
      acceptLanguage: request.headers.get("accept-language"),
      country: request.cf && request.cf.country
    });
    const internal = /* @__PURE__ */ __name((path) => new Request(new URL(internalPath(path, lang), url.origin), request), "internal");
    let asset = await env.ASSETS.fetch(internal(url.pathname));
    if (asset.status === 404) {
      const notFound = await env.ASSETS.fetch(internal("/404"));
      if (notFound.ok) asset = new Response(notFound.body, { ...notFound, status: 404 });
    }
    const response = new Response(asset.body, asset);
    response.headers.set("content-language", lang);
    response.headers.set("vary", "Accept-Language, Cookie");
    response.headers.set("cache-control", "private, no-cache");
    if (LANGS.includes(query)) {
      response.headers.append("set-cookie", `${LANG_COOKIE}=${lang}; path=/; max-age=31536000; samesite=lax`);
    }
    return response;
  }
};

// ../../node_modules/.pnpm/wrangler@4.112.0/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../node_modules/.pnpm/wrangler@4.112.0/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// ../../.wrangler/tmp/bundle-XMu6ja/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = worker_default;

// ../../node_modules/.pnpm/wrangler@4.112.0/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// ../../.wrangler/tmp/bundle-XMu6ja/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  scheduledTime;
  cron;
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default,
  internalPath,
  isStaticAsset,
  legacyRedirect,
  parseAcceptLanguage,
  preferredLocale,
  readCookie
};
//# sourceMappingURL=bundledWorker-0.8286545752923365.mjs.map
