"use strict";
(() => {
  // src/internal/errors.ts
  var WefterBridgeError = class extends Error {
    constructor(code, message, nativeStack) {
      super(message);
      this.name = "WefterBridgeError";
      this.code = code;
      this.nativeStack = nativeStack;
    }
  };

  // src/internal/devtools/emit.ts
  var import_meta = {};
  function emitDevtoolsEvent(event, payload) {
    import_meta.hot?.send(event, payload);
  }
  function onDevtoolsEvent(event, cb) {
    import_meta.hot?.on(event, cb);
  }

  // src/internal/devtools/bridge-tap.ts
  function tapBridgeCall(callId, plugin, method, args) {
    emitDevtoolsEvent("wefter:bridge_call", { callId, plugin, method, args, timestamp: Date.now() });
  }
  function tapBridgeSettle(callId, status, startedAt, outcome) {
    const durationMs = Date.now() - startedAt;
    if ("result" in outcome) {
      emitDevtoolsEvent("wefter:bridge_response", { callId, status, result: outcome.result, durationMs });
      return;
    }
    const err = outcome.error;
    const code = err instanceof WefterBridgeError ? err.code : "UNKNOWN";
    const message = err instanceof Error ? err.message : String(err);
    const nativeStack = err instanceof WefterBridgeError ? err.nativeStack : void 0;
    emitDevtoolsEvent("wefter:bridge_response", {
      callId,
      status,
      error: nativeStack ? { code, message, nativeStack } : { code, message },
      durationMs
    });
  }
  function statusFromError(err) {
    if (err instanceof WefterBridgeError) {
      if (err.code === "TIMEOUT") return "timeout";
      if (err.code === "ABORTED") return "cancelled";
    }
    return "error";
  }

  // src/internal/native-bridge.ts
  var import_meta2 = {};
  var BRIDGE_STATE_KEY = /* @__PURE__ */ Symbol.for("wefter.bridge.state.v1");
  function getBridgeState() {
    const holder = globalThis;
    return holder[BRIDGE_STATE_KEY] ??= {
      pending: /* @__PURE__ */ new Map(),
      hooks: /* @__PURE__ */ new Map(),
      nextCallId: 0,
      sessionId: Math.random().toString(36).slice(2, 8) || "s"
    };
  }
  var { pending, hooks } = getBridgeState();
  function nextCallId() {
    const state = getBridgeState();
    return `${state.sessionId}-${state.nextCallId++}`;
  }
  var DEFAULT_TIMEOUT_MS = 1e4;
  if (typeof window !== "undefined") {
    window.__wefterNative = {
      resolve(callId, resultJson) {
        pending.get(callId)?.resolve(JSON.parse(resultJson));
        pending.delete(callId);
      },
      reject(callId, errorJson) {
        const parsed = JSON.parse(errorJson);
        const error = parsed !== null && typeof parsed === "object" ? new WefterBridgeError(
          "code" in parsed && typeof parsed.code === "string" ? parsed.code : "UNKNOWN",
          "message" in parsed && typeof parsed.message === "string" ? parsed.message : String(parsed),
          "nativeStack" in parsed && typeof parsed.nativeStack === "string" ? parsed.nativeStack : void 0
        ) : new WefterBridgeError("UNKNOWN", String(parsed));
        pending.get(callId)?.reject(error);
        pending.delete(callId);
      },
      emit(hookName, dataJson) {
        const data = JSON.parse(dataJson);
        hooks.get(hookName)?.forEach((cb) => cb(data));
      }
    };
  }
  function isNativeBridgeAvailable() {
    return typeof window !== "undefined" && (!!window.AndroidBridge || !!window.webkit?.messageHandlers?.WefterBridge);
  }
  function invokeNative(plugin, method, payload = {}, options) {
    const callId = nextCallId();
    const signal = options?.signal;
    const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    if (import_meta2.hot) tapBridgeCall(callId, plugin, method, payload);
    const startedAt = Date.now();
    return new Promise((resolve, reject) => {
      if (signal?.aborted) {
        const error = new WefterBridgeError("ABORTED", "Call was aborted before it started");
        if (import_meta2.hot) tapBridgeSettle(callId, "cancelled", startedAt, { error });
        reject(error);
        return;
      }
      const onAbort = () => {
        pending.delete(callId);
        cleanup();
        const error = new WefterBridgeError("ABORTED", "Call was aborted");
        if (import_meta2.hot) tapBridgeSettle(callId, "cancelled", startedAt, { error });
        reject(error);
      };
      signal?.addEventListener("abort", onAbort);
      const timer = setTimeout(() => {
        pending.delete(callId);
        cleanup();
        const error = new WefterBridgeError("TIMEOUT", `${plugin}.${method} timed out after ${timeoutMs}ms`);
        if (import_meta2.hot) tapBridgeSettle(callId, "timeout", startedAt, { error });
        reject(error);
      }, timeoutMs);
      const cleanup = () => {
        clearTimeout(timer);
        signal?.removeEventListener("abort", onAbort);
      };
      pending.set(callId, {
        resolve: (v) => {
          cleanup();
          if (import_meta2.hot) tapBridgeSettle(callId, "success", startedAt, { result: v });
          resolve(v);
        },
        reject: (r) => {
          cleanup();
          if (import_meta2.hot) tapBridgeSettle(callId, statusFromError(r), startedAt, { error: r });
          reject(r);
        }
      });
      if (window.AndroidBridge) {
        window.AndroidBridge.invoke(callId, plugin, method, JSON.stringify(payload));
      } else if (window.webkit?.messageHandlers?.WefterBridge) {
        window.webkit.messageHandlers.WefterBridge.postMessage({ callId, plugin, method, payload });
      } else {
        pending.delete(callId);
        cleanup();
        const error = new WefterBridgeError("NO_BRIDGE", "No native bridge available");
        if (import_meta2.hot) tapBridgeSettle(callId, "error", startedAt, { error });
        reject(error);
      }
    });
  }
  function registerHook(hookName, callback) {
    const listeners = hooks.get(hookName) ?? /* @__PURE__ */ new Set();
    const isFirst = listeners.size === 0;
    listeners.add(callback);
    hooks.set(hookName, listeners);
    if (isFirst) takeHeldEvents(hookName);
    return { remove: () => hooks.get(hookName)?.delete(callback) };
  }
  function takeHeldEvents(hookName) {
    if (hookName.startsWith("__") || !isNativeBridgeAvailable()) return;
    invokeNative("__system", "takeEvents", { name: hookName }).then(
      (result) => {
        for (const event of result?.events ?? []) hooks.get(hookName)?.forEach((cb) => cb(event));
      },
      () => {
      }
    );
  }
  function listenForHeldEvents() {
    const state = getBridgeState();
    if (state.listensForHeldEvents) return;
    state.listensForHeldEvents = true;
    const listeners = hooks.get("__system:events") ?? /* @__PURE__ */ new Set();
    listeners.add((data) => {
      const name = data?.name;
      if (typeof name === "string" && (hooks.get(name)?.size ?? 0) > 0) takeHeldEvents(name);
    });
    hooks.set("__system:events", listeners);
  }
  if (typeof window !== "undefined") listenForHeldEvents();

  // src/internal/devtools/deep-link-tap.ts
  function tapDeepLink(url, isLaunch, link, source, listeners) {
    emitDevtoolsEvent("wefter:deep_link", {
      url,
      scheme: link?.scheme ?? null,
      path: link?.path ?? null,
      query: link?.query ?? {},
      isLaunch,
      source,
      listeners: link ? listeners : 0,
      timestamp: Date.now()
    });
  }
  function tapDeepLinkListeners(listeners) {
    emitDevtoolsEvent("wefter:deep_link_listeners", { listeners, timestamp: Date.now() });
  }

  // src/internal/devtools/claim-once.ts
  function claimOnce(name) {
    const key = /* @__PURE__ */ Symbol.for(`wefter.devtools.installed.${name}`);
    const holder = globalThis;
    if (holder[key]) return false;
    holder[key] = true;
    return true;
  }

  // src/internal/deep-links.ts
  var import_meta3 = {};
  var DEEP_LINK_STATE_KEY = /* @__PURE__ */ Symbol.for("wefter.deepLinks.state.v1");
  function getDeepLinkState() {
    const holder = globalThis;
    return holder[DEEP_LINK_STATE_KEY] ??= {
      listeners: /* @__PURE__ */ new Set(),
      hookInstalled: false,
      draining: false,
      drainAgain: false
    };
  }
  function parseDeepLink(url, isLaunch) {
    let parsed;
    try {
      parsed = new URL(url);
    } catch {
      return null;
    }
    const scheme = parsed.protocol.replace(/:$/, "");
    const isWebLink = scheme === "http" || scheme === "https";
    const rawPath = isWebLink ? parsed.pathname : parsed.host + parsed.pathname;
    const path = "/" + rawPath.replace(/^\/+/, "");
    return { url, scheme, path, query: Object.fromEntries(parsed.searchParams), isLaunch };
  }
  function notifyListeners(state, link) {
    for (const listener of [...state.listeners]) {
      try {
        listener(link);
      } catch (error) {
        if (typeof globalThis.reportError === "function") globalThis.reportError(error);
        else
          queueMicrotask(() => {
            throw error;
          });
      }
    }
  }
  function simulateDeepLink(url) {
    const state = getDeepLinkState();
    const link = parseDeepLink(url, false);
    if (link) notifyListeners(state, link);
    if (import_meta3.hot) tapDeepLink(url, false, link, "devtools", state.listeners.size);
  }
  if (typeof window !== "undefined" && import_meta3.hot && claimOnce("deepLinks")) {
    onDevtoolsEvent("wefter:simulate_deep_link", (data) => {
      const url = data?.url;
      if (typeof url === "string") simulateDeepLink(url);
    });
    onDevtoolsEvent("vite:ws:connect", () => tapDeepLinkListeners(getDeepLinkState().listeners.size));
    tapDeepLinkListeners(getDeepLinkState().listeners.size);
  }

  // src/internal/devtools/serialize.ts
  function truncate(str, capChars) {
    if (str.length <= capChars) return { preview: str, truncated: false };
    return { preview: str.slice(0, capChars), truncated: true };
  }
  var MAX_ITEMS = 50;
  function safeSerialize(value, seen = /* @__PURE__ */ new WeakSet()) {
    if (value === null || typeof value !== "object") {
      return typeof value === "function" ? `[Function: ${value.name || "anonymous"}]` : value;
    }
    if (value instanceof Error) {
      return { __wefterKind: "error", name: value.name, message: value.message, stack: value.stack };
    }
    if (typeof Node !== "undefined" && value instanceof Node) {
      const el = value;
      const outerHtml = typeof el.outerHTML === "string" ? el.outerHTML : String(value);
      return {
        __wefterKind: "dom",
        tag: el.tagName ?? value.nodeName,
        preview: truncate(outerHtml, 200).preview
      };
    }
    if (seen.has(value)) return "[Circular]";
    seen.add(value);
    try {
      if (Array.isArray(value)) {
        return value.slice(0, MAX_ITEMS).map((item) => safeSerialize(item, seen));
      }
      const out = {};
      let count = 0;
      for (const key of Object.keys(value)) {
        if (++count > MAX_ITEMS) {
          out["\u2026"] = "[truncated]";
          break;
        }
        out[key] = safeSerialize(value[key], seen);
      }
      return out;
    } catch {
      return "[Unserializable]";
    } finally {
      seen.delete(value);
    }
  }

  // src/internal/devtools/console-patch.ts
  var import_meta4 = {};
  var LEVELS = ["log", "info", "warn", "error", "debug"];
  var installed = false;
  var originals = {};
  function installConsolePatch() {
    if (installed) return;
    installed = true;
    for (const level of LEVELS) {
      originals[level] = console[level];
      const original = console[level].bind(console);
      console[level] = (...args) => {
        original(...args);
        try {
          const stack = level === "warn" || level === "error" ? new Error().stack : void 0;
          emitDevtoolsEvent("wefter:console", {
            level,
            args: args.map((arg) => safeSerialize(arg)),
            stack: stack ?? null,
            timestamp: Date.now()
          });
        } catch {
        }
      };
    }
  }
  if (typeof window !== "undefined" && import_meta4.hot && claimOnce("console")) {
    installConsolePatch();
  }

  // src/internal/devtools/uncaught.ts
  var import_meta5 = {};
  function describeError(error) {
    if (error instanceof Error) return error.stack ?? `${error.name}: ${error.message}`;
    if (typeof error === "string") return error;
    try {
      return JSON.stringify(error) ?? String(error);
    } catch {
      return String(error);
    }
  }
  function reportUncaughtError(error) {
    try {
      emitDevtoolsEvent("wefter:console", {
        level: "uncaught",
        args: [error instanceof Error ? `${error.name}: ${error.message}` : safeSerialize(error)],
        stack: describeError(error),
        timestamp: Date.now()
      });
    } catch {
    }
  }
  var installed2 = false;
  function installUncaughtReporter() {
    if (installed2) return;
    installed2 = true;
    window.addEventListener("error", (event) => reportUncaughtError(event.error ?? event.message));
    window.addEventListener("unhandledrejection", (event) => reportUncaughtError(event.reason));
  }
  if (typeof window !== "undefined" && import_meta5.hot && claimOnce("uncaught")) {
    installUncaughtReporter();
  }

  // src/internal/devtools/network-patch.ts
  var import_meta6 = {};
  var BODY_PREVIEW_CAP = 2048;
  var counter = 0;
  var sessionPrefix = Math.random().toString(36).slice(2, 8) || "s";
  var fetchInstalled = false;
  var xhrInstalled = false;
  function headersToRecord(headers) {
    const out = {};
    headers.forEach((value, key) => {
      out[key] = value;
    });
    return out;
  }
  function installFetchPatch() {
    if (fetchInstalled || typeof window === "undefined" || typeof window.fetch !== "function") return;
    fetchInstalled = true;
    const originalFetch = window.fetch.bind(window);
    window.fetch = (async (...args) => {
      const [input, init] = args;
      const request = input instanceof Request ? input : void 0;
      const requestId = `${sessionPrefix}-${counter++}`;
      const url = request ? request.url : input.toString();
      const method = init?.method ?? request?.method ?? "GET";
      const headers = headersToRecord(new Headers(init?.headers ?? request?.headers));
      const startedAt = Date.now();
      emitDevtoolsEvent("wefter:network_request", { requestId, url, method, headers, timestamp: startedAt });
      try {
        const response = await originalFetch(...args);
        void previewFetchBody(response.clone(), requestId, startedAt);
        return response;
      } catch (err) {
        emitDevtoolsEvent("wefter:network_response", {
          requestId,
          status: 0,
          durationMs: Date.now() - startedAt,
          bodyPreview: err instanceof Error ? err.message : String(err),
          bodyTruncated: false
        });
        throw err;
      }
    });
  }
  async function previewFetchBody(clone, requestId, startedAt) {
    try {
      const text = await clone.text();
      const { preview, truncated } = truncate(text, BODY_PREVIEW_CAP);
      emitDevtoolsEvent("wefter:network_response", {
        requestId,
        status: clone.status,
        durationMs: Date.now() - startedAt,
        bodyPreview: preview,
        bodyTruncated: truncated
      });
    } catch {
      emitDevtoolsEvent("wefter:network_response", {
        requestId,
        status: clone.status,
        durationMs: Date.now() - startedAt,
        bodyPreview: "",
        bodyTruncated: false
      });
    }
  }
  var xhrMeta = /* @__PURE__ */ new WeakMap();
  function installXhrPatch() {
    if (xhrInstalled || typeof window === "undefined" || typeof window.XMLHttpRequest === "undefined") return;
    xhrInstalled = true;
    const proto = XMLHttpRequest.prototype;
    const originalOpen = proto.open;
    const originalSend = proto.send;
    const originalSetRequestHeader = proto.setRequestHeader;
    proto.open = function(method, url, ...rest) {
      xhrMeta.set(this, {
        requestId: `${sessionPrefix}-${counter++}`,
        method,
        url: url.toString(),
        headers: {},
        startedAt: 0
      });
      return originalOpen.apply(this, [method, url, ...rest]);
    };
    proto.setRequestHeader = function(name, value) {
      const meta = xhrMeta.get(this);
      if (meta) meta.headers[name] = value;
      return originalSetRequestHeader.call(this, name, value);
    };
    proto.send = function(...args) {
      const meta = xhrMeta.get(this);
      if (meta) {
        meta.startedAt = Date.now();
        emitDevtoolsEvent("wefter:network_request", {
          requestId: meta.requestId,
          url: meta.url,
          method: meta.method,
          headers: meta.headers,
          timestamp: meta.startedAt
        });
        this.addEventListener("loadend", () => {
          let bodyPreview = "";
          let bodyTruncated = false;
          if (this.responseType === "" || this.responseType === "text") {
            try {
              const result = truncate(this.responseText ?? "", BODY_PREVIEW_CAP);
              bodyPreview = result.preview;
              bodyTruncated = result.truncated;
            } catch {
            }
          }
          emitDevtoolsEvent("wefter:network_response", {
            requestId: meta.requestId,
            status: this.status,
            durationMs: Date.now() - meta.startedAt,
            bodyPreview,
            bodyTruncated
          });
        });
      }
      return originalSend.apply(this, args);
    };
  }
  if (typeof window !== "undefined" && import_meta6.hot && claimOnce("network")) {
    installFetchPatch();
    installXhrPatch();
  }

  // src/internal/devtools/presence.ts
  var import_meta7 = {};
  var HELLO_RETRY_MS = 300;
  var HELLO_MAX_ATTEMPTS = 20;
  var clientId;
  var announced = false;
  var retryTimer;
  function sendHello() {
    clientId ??= crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    emitDevtoolsEvent("wefter:client_hello", { clientId, url: location.href, timestamp: Date.now() });
  }
  function stopRetrying() {
    if (retryTimer !== void 0) {
      clearInterval(retryTimer);
      retryTimer = void 0;
    }
  }
  function announce() {
    announced = false;
    stopRetrying();
    let attempts = 0;
    sendHello();
    retryTimer = setInterval(() => {
      if (announced || ++attempts >= HELLO_MAX_ATTEMPTS) {
        stopRetrying();
        return;
      }
      sendHello();
    }, HELLO_RETRY_MS);
  }
  function installPresence() {
    onDevtoolsEvent("wefter:client_list", (list) => {
      if (Array.isArray(list) && list.some((entry) => entry?.clientId === clientId)) {
        announced = true;
        stopRetrying();
      }
    });
    onDevtoolsEvent("vite:ws:connect", announce);
    announce();
  }
  if (typeof window !== "undefined" && import_meta7.hot && claimOnce("presence")) {
    installPresence();
  }

  // src/internal/devtools/reload.ts
  var import_meta8 = {};
  function installReloadListener(reload = () => location.reload()) {
    onDevtoolsEvent("wefter:reload", () => {
      reload();
    });
  }
  if (typeof window !== "undefined" && import_meta8.hot && claimOnce("reload")) {
    installReloadListener();
  }

  // src/test-only-global.ts
  window.Wefter = { invokeNative, registerHook };
})();
