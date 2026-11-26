/**
 * The Express app of the demo backend, separate from `server.ts` so tests can start it on any port.
 *
 * Everything lives under `/api`, which the Vite dev server forwards here (see `vite.config.ts`), so the app
 * calls the same address it is loaded from. CORS is open for calling the API directly (`VITE_API_URL`).
 */

import express, { type NextFunction, type Request, type Response } from 'express'
import { PROJECT_ROOT } from './config.ts'
import { createOAuthStore, type OAuthStore } from './oauth/store.ts'
import { basicRouter } from './routes/basic.ts'
import { deepLinksRouter, wellKnownRouter } from './routes/deep-links.ts'
import { oauthRouter } from './routes/oauth.ts'

/** Options for {@link createApp}; tests pass their own project folder and store. */
export interface AppOptions {
  projectRoot?: string
  store?: OAuthStore
  log?: boolean
}

/** Logs each request with its status and duration. */
function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const started = performance.now()
  res.on('finish', () => {
    const ms = Math.round(performance.now() - started)
    console.log(`${req.method.padEnd(6)} ${res.statusCode} ${req.originalUrl} ${ms}ms`)
  })
  next()
}

/** Allows calls from any origin; it is a local test server. */
function cors(req: Request, res: Response, next: NextFunction): void {
  res.set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Max-Age': '600',
  })
  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }
  next()
}

/** Creates the app with every route. */
export function createApp(options: AppOptions = {}) {
  const projectRoot = options.projectRoot ?? PROJECT_ROOT
  const store = options.store ?? createOAuthStore()
  const app = express()

  app.disable('x-powered-by')
  if (options.log !== false) app.use(requestLogger)
  app.use(cors)
  app.use(express.json({ limit: '100kb' }))
  app.use(express.urlencoded({ extended: false, limit: '100kb' }))

  app.use('/api', basicRouter(projectRoot))
  app.use('/api/oauth', oauthRouter(store, projectRoot))
  app.use('/api/deep-links', deepLinksRouter(projectRoot))
  app.use('/.well-known', wellKnownRouter(projectRoot))

  app.use((req, res) => {
    res.status(404).json({ error: 'not_found', message: `No route for ${req.method} ${req.path}.` })
  })

  app.use(
    (
      error: Error & { status?: number; type?: string },
      _req: Request,
      res: Response,
      _next: NextFunction,
    ) => {
      const status = error.status && error.status >= 400 && error.status < 600 ? error.status : 500
      if (status === 500) console.error(error)
      res.status(status).json({ error: error.type ?? 'server_error', message: error.message })
    },
  )

  return app
}
