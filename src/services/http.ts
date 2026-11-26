/**
 * The app's HTTP client: an axios instance pointed at the backend from `config/api.ts`.
 *
 * - Adds the signed-in user's access token to every request (see {@link setAuthHandlers}).
 * - On a `401`, refreshes the tokens once and retries the request.
 * - Turns every failure into an {@link ApiError} with a readable message, the status and the server's
 *   error code.
 */

import axios, { AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios'
import { API_CONFIG, API_NOT_CONFIGURED_MESSAGE, API_TIMEOUT_MS } from '@/config/api'

declare module 'axios' {
  interface AxiosRequestConfig {
    /** Sends the request without the access token, for the sign-in endpoints themselves. */
    skipAuth?: boolean
  }
}

/** A failed request: `status` is `undefined` when no response arrived (offline, timeout, no backend). */
export class ApiError extends Error {
  readonly status: number | undefined
  readonly code: string
  readonly data: unknown

  constructor(message: string, code: string, status?: number, data?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
    this.data = data
  }
}

/** How the client reads the current access token and renews it. The auth store provides these. */
interface AuthHandlers {
  accessToken(): string | null
  refresh(): Promise<string | null>
}

let auth: AuthHandlers | null = null

/** Connects the client to the auth store, without the two modules importing each other. */
export function setAuthHandlers(handlers: AuthHandlers): void {
  auth = handlers
}

/** The client every screen uses. */
export const http = axios.create({
  baseURL: API_CONFIG.baseUrl ?? undefined,
  timeout: API_TIMEOUT_MS,
  headers: { Accept: 'application/json' },
})

http.interceptors.request.use((config) => {
  if (!API_CONFIG.baseUrl) throw new ApiError(API_NOT_CONFIGURED_MESSAGE, 'not_configured')
  const token = config.skipAuth ? null : auth?.accessToken()
  if (token && !config.headers.has('Authorization'))
    config.headers.set('Authorization', `Bearer ${token}`)
  return config
})

/** A request that may be retried once after refreshing the tokens. */
type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean }

/** The message to show for a failed request, preferring the server's own description. */
function messageOf(error: AxiosError): string {
  const data = error.response?.data as { error_description?: string; message?: string } | undefined
  if (data?.error_description || data?.message) return (data.error_description ?? data.message)!
  if (error.code === AxiosError.ECONNABORTED || error.code === AxiosError.ETIMEDOUT) {
    return `The backend did not answer within ${API_TIMEOUT_MS / 1000} seconds.`
  }
  if (!error.response) return 'Could not reach the backend. Is it running (`pnpm api`)?'
  return `Request failed with status ${error.response.status}.`
}

http.interceptors.response.use(undefined, async (error: unknown) => {
  if (error instanceof ApiError || !axios.isAxiosError(error)) throw error

  const config = error.config as RetriableConfig | undefined
  const canRetry =
    config && !config._retried && !config.skipAuth && config.headers.has('Authorization')
  if (error.response?.status === 401 && canRetry && auth) {
    config!._retried = true
    const token = await auth.refresh().catch(() => null)
    if (token) {
      config!.headers.set('Authorization', `Bearer ${token}`)
      return http.request(config!)
    }
  }

  const data = error.response?.data as { error?: string } | undefined
  throw new ApiError(
    messageOf(error),
    data?.error ?? error.code ?? 'request_failed',
    error.response?.status,
    data,
  )
})

/**
 * Sends `body` as a URL-encoded form without the access token, as OAuth token and revocation endpoints
 * expect.
 */
export function postForm<T>(
  url: string,
  body: Record<string, string>,
  config?: AxiosRequestConfig,
) {
  return http.post<T>(url, new URLSearchParams(body), {
    ...config,
    skipAuth: true,
    headers: { ...config?.headers, 'Content-Type': 'application/x-www-form-urlencoded' },
  })
}
