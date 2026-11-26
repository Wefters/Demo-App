/**
 * Routes for checking the connection and testing requests:
 *
 * - `GET /api/health`: whether the API is up, with its uptime and the app's environments.
 * - `ANY /api/echo`: returns the request it received. `?status=404` answers with that status and
 *   `?delay=2000` waits that many milliseconds first, for testing errors, timeouts and loading states.
 */

import { Router } from 'express'
import { readAppEnvironments } from '../config.ts'

/** Longest `?delay` accepted, so a typo cannot hang a request for minutes. */
const MAX_DELAY_MS = 30_000

/** Request headers left out of the echo, or masked, since they carry credentials. */
const MASKED_HEADERS = new Set(['authorization', 'cookie'])

/** Creates the health and echo routes. `projectRoot` locates `wefter.config.json`. */
export function basicRouter(projectRoot?: string): Router {
  const router = Router()
  const startedAt = Date.now()

  router.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      name: 'wefter-demo-backend',
      uptimeSeconds: Math.round((Date.now() - startedAt) / 1000),
      time: new Date().toISOString(),
      environments: readAppEnvironments(projectRoot).map((env) => env.name),
    })
  })

  router.all('/echo', async (req, res) => {
    const status = Number(req.query.status ?? 200)
    const delay = Math.min(Math.max(Number(req.query.delay ?? 0) || 0, 0), MAX_DELAY_MS)
    if (delay) await new Promise((resolve) => setTimeout(resolve, delay))

    const headers = Object.fromEntries(
      Object.entries(req.headers).map(([key, value]) => [
        key,
        MASKED_HEADERS.has(key) ? '•••' : value,
      ]),
    )
    res.status(Number.isInteger(status) && status >= 200 && status <= 599 ? status : 200).json({
      method: req.method,
      path: req.path,
      query: req.query,
      headers,
      body: req.body ?? null,
      delayedMs: delay,
      receivedAt: new Date().toISOString(),
    })
  })

  return router
}
