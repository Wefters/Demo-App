/**
 * Where the app finds the demo backend (`backend/`, started with `pnpm api`). This is the one place the
 * API address is decided:
 *
 * 1. `VITE_API_URL`, when set (for example in `.env.local`): a full URL such as
 *    `https://my-tunnel.example.com/api`. Use it for a backend on another machine, or for bundled builds,
 *    which are not served by the dev server.
 * 2. Otherwise, under the dev server (`wefter run <platform> --watch` or `pnpm dev`): `/api` on the dev
 *    server itself, which forwards it to the backend (`server.proxy` in `vite.config.ts`). Phones and
 *    simulators can already reach the dev server, so this needs no extra network settings.
 * 3. Otherwise there is no backend, and calls fail with a message saying how to set one.
 */

/** Where the base URL came from. */
export type ApiSource = 'env' | 'dev-server' | 'none'

/** The resolved backend address. `baseUrl` is `null` when none is available. */
export interface ApiConfig {
  baseUrl: string | null
  source: ApiSource
}

/** How long a request may take before it fails. */
export const API_TIMEOUT_MS = 15_000

/** Path the dev server forwards to the backend. Keep it in step with `server.proxy` in `vite.config.ts`. */
export const DEV_SERVER_API_PATH = '/api'

/** Works out the backend address from the environment. */
function resolveApiConfig(): ApiConfig {
  const fromEnv = import.meta.env.VITE_API_URL?.trim()
  if (fromEnv) return { baseUrl: fromEnv.replace(/\/+$/, ''), source: 'env' }
  if (import.meta.env.DEV) return { baseUrl: DEV_SERVER_API_PATH, source: 'dev-server' }
  return { baseUrl: null, source: 'none' }
}

/** The backend address this build uses. */
export const API_CONFIG: ApiConfig = resolveApiConfig()

/** Explains how to configure the backend, for errors and the UI. */
export const API_NOT_CONFIGURED_MESSAGE =
  'No backend configured. Run the app with `wefter run <platform> --watch` and start the backend with ' +
  '`pnpm api`, or set VITE_API_URL in .env.local.'

/**
 * The absolute URL of `path` on the backend, for pages opened outside the app, such as the sign-in page in
 * the system browser. A relative base is resolved against the address the app is loaded from, which
 * devices can reach.
 *
 * @throws {Error} When no backend is configured.
 */
export function apiUrl(path: string): string {
  if (!API_CONFIG.baseUrl) throw new Error(API_NOT_CONFIGURED_MESSAGE)
  const base = new URL(API_CONFIG.baseUrl, window.location.origin)
  return `${base.toString().replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`
}
