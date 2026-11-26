/**
 * A mock OAuth 2.0 authorization server for testing sign-in from the app with `Browser.auth`: the
 * authorization code flow with PKCE (`S256` only), refresh tokens, a user info endpoint and revocation.
 *
 * - `GET  /api/oauth/authorize`: the sign-in page, opened in the system browser.
 * - `POST /api/oauth/authorize`: the user's decision; redirects back to the app with a code or an error.
 * - `POST /api/oauth/token`: exchanges a code (with its verifier) or a refresh token for tokens.
 * - `GET  /api/oauth/userinfo`: the signed-in user, for a valid access token.
 * - `POST /api/oauth/revoke`: revokes a token, for signing out.
 *
 * Only the client `wefter-demo` exists, and it may only redirect to the app's own sign-in scheme
 * (`<app id>.auth://…`, from `wefter.config.json`) or to `OAUTH_REDIRECT_URIS`.
 */

import { Router, type Request, type Response } from 'express'
import { EXTRA_REDIRECT_URIS, readAppEnvironments } from '../config.ts'
import { escapeHtml, page } from '../html.ts'
import {
  isValidVerifier,
  pkceChallenge,
  userFromName,
  type OAuthStore,
  type PendingAuthorization,
} from '../oauth/store.ts'

/** The demo app's client id. It is a public client, so PKCE stands in for a client secret. */
export const CLIENT_ID = 'wefter-demo'

/** Scopes the server knows; anything else is dropped. */
const KNOWN_SCOPES = new Set(['openid', 'profile', 'email'])

/**
 * Whether the app may be sent back to `redirectUri`: its scheme is one of the app's sign-in schemes (each
 * environment's app id or bundle id plus `.auth`), or it is listed in `OAUTH_REDIRECT_URIS`.
 */
export function isAllowedRedirect(redirectUri: string, projectRoot?: string): boolean {
  if (EXTRA_REDIRECT_URIS.includes(redirectUri)) return true
  let scheme: string
  try {
    scheme = new URL(redirectUri).protocol.replace(/:$/, '').toLowerCase()
  } catch {
    return false
  }
  return readAppEnvironments(projectRoot).some(
    (env) =>
      scheme === `${env.appId}.auth`.toLowerCase() ||
      scheme === `${env.bundleId}.auth`.toLowerCase(),
  )
}

/** `redirectUri` with the given query parameters added. */
function withParams(redirectUri: string, params: Record<string, string | undefined>): string {
  const url = new URL(redirectUri)
  for (const [key, value] of Object.entries(params))
    if (value !== undefined) url.searchParams.set(key, value)
  return url.toString()
}

/** A query or form value as a string, or `undefined`. */
function field(source: Record<string, unknown> | undefined, key: string): string | undefined {
  const value = source?.[key]
  return typeof value === 'string' ? value : undefined
}

/** An error page. Used for requests that must not redirect, such as an unknown redirect URI. */
function errorPage(res: Response, status: number, message: string): void {
  res
    .status(status)
    .type('html')
    .send(
      page(
        'Sign-in error',
        `<div class="card"><h1>Sign-in error</h1><p class="error">${escapeHtml(message)}</p></div>`,
      ),
    )
}

/** The sign-in page for a pending request. */
function signInPage(request: PendingAuthorization): string {
  const app = new URL(request.redirectUri).protocol.replace(/:$/, '')
  return page(
    'Sign in to Wefter Demo',
    `<div class="card">
      <h1>Sign in to Wefter Demo</h1>
      <p>A mock sign-in for testing. <code>${escapeHtml(app)}</code> is asking for: ${escapeHtml(request.scope || 'basic access')}.</p>
      <form method="post" action="/api/oauth/authorize">
        <input type="hidden" name="request_id" value="${escapeHtml(request.id)}" />
        <label for="name">Name</label>
        <input id="name" name="name" value="Demo User" autocomplete="off" />
        <div class="actions">
          <button type="submit" name="decision" value="deny">Deny</button>
          <button type="submit" name="decision" value="approve" class="primary">Approve</button>
        </div>
      </form>
    </div>`,
  )
}

/** An OAuth error response from the token endpoint. */
function tokenError(res: Response, status: number, error: string, description: string): void {
  res
    .status(status)
    .set('Cache-Control', 'no-store')
    .json({ error, error_description: description })
}

/** The bearer token of a request, or `undefined`. */
function bearerToken(req: Request): string | undefined {
  const match = /^Bearer\s+(\S+)$/i.exec(req.get('authorization') ?? '')
  return match?.[1]
}

/** Creates the OAuth routes on top of `store`. `projectRoot` locates `wefter.config.json` (tests pass their own). */
export function oauthRouter(store: OAuthStore, projectRoot?: string): Router {
  const router = Router()

  router.get('/authorize', (req, res) => {
    const query = req.query as Record<string, unknown>
    const clientId = field(query, 'client_id')
    const redirectUri = field(query, 'redirect_uri')

    if (clientId !== CLIENT_ID) return errorPage(res, 400, `Unknown client_id "${clientId ?? ''}".`)
    if (!redirectUri || !isAllowedRedirect(redirectUri, projectRoot)) {
      return errorPage(
        res,
        400,
        `redirect_uri "${redirectUri ?? ''}" is not allowed. Use the app's sign-in scheme from Browser.getRedirectUri().`,
      )
    }

    const state = field(query, 'state')
    const fail = (error: string, description: string) =>
      res.redirect(302, withParams(redirectUri, { error, error_description: description, state }))

    if (field(query, 'response_type') !== 'code')
      return fail('unsupported_response_type', 'Only response_type=code is supported.')
    const codeChallenge = field(query, 'code_challenge')
    if (!codeChallenge || field(query, 'code_challenge_method') !== 'S256') {
      return fail(
        'invalid_request',
        'PKCE is required: send code_challenge with code_challenge_method=S256.',
      )
    }

    const scope = (field(query, 'scope') ?? 'openid profile')
      .split(/\s+/)
      .filter((s) => KNOWN_SCOPES.has(s))
      .join(' ')
    const pending = store.addPending({ clientId, redirectUri, state, codeChallenge, scope })
    res.type('html').set('Cache-Control', 'no-store').send(signInPage(pending))
  })

  router.post('/authorize', (req, res) => {
    const body = req.body as Record<string, unknown> | undefined
    const pending = store.takePending(field(body, 'request_id') ?? '')
    if (!pending)
      return errorPage(
        res,
        400,
        'This sign-in request has expired. Start the sign-in again from the app.',
      )

    if (field(body, 'decision') !== 'approve') {
      return res.redirect(
        302,
        withParams(pending.redirectUri, {
          error: 'access_denied',
          error_description: 'The user denied the request.',
          state: pending.state,
        }),
      )
    }
    const code = store.issueCode(pending, userFromName(field(body, 'name') ?? ''))
    res.redirect(302, withParams(pending.redirectUri, { code, state: pending.state }))
  })

  router.post('/token', (req, res) => {
    const body = req.body as Record<string, unknown> | undefined
    const grantType = field(body, 'grant_type')
    if (field(body, 'client_id') !== CLIENT_ID)
      return tokenError(res, 401, 'invalid_client', 'Unknown client_id.')

    if (grantType === 'authorization_code') {
      const entry = store.takeCode(field(body, 'code') ?? '')
      if (!entry)
        return tokenError(
          res,
          400,
          'invalid_grant',
          'The code is unknown, expired or already used.',
        )
      if (entry.redirectUri !== field(body, 'redirect_uri')) {
        return tokenError(
          res,
          400,
          'invalid_grant',
          'redirect_uri does not match the authorization request.',
        )
      }
      const verifier = field(body, 'code_verifier') ?? ''
      if (!isValidVerifier(verifier) || pkceChallenge(verifier) !== entry.codeChallenge) {
        return tokenError(
          res,
          400,
          'invalid_grant',
          'code_verifier does not match the code_challenge.',
        )
      }
      return res
        .set('Cache-Control', 'no-store')
        .json(store.issueTokens(entry.clientId, entry.scope, entry.user))
    }

    if (grantType === 'refresh_token') {
      const refreshToken = field(body, 'refresh_token') ?? ''
      const entry = store.findToken(refreshToken, 'refresh')
      if (!entry)
        return tokenError(res, 400, 'invalid_grant', 'The refresh token is unknown or expired.')
      store.revoke(refreshToken)
      return res
        .set('Cache-Control', 'no-store')
        .json(store.issueTokens(entry.clientId, entry.scope, entry.user))
    }

    tokenError(res, 400, 'unsupported_grant_type', 'Use authorization_code or refresh_token.')
  })

  router.get('/userinfo', (req, res) => {
    const entry = store.findToken(bearerToken(req) ?? '', 'access')
    if (!entry) {
      return res.status(401).set('WWW-Authenticate', 'Bearer error="invalid_token"').json({
        error: 'invalid_token',
        error_description: 'The access token is missing, unknown or expired.',
      })
    }
    res.json({
      ...entry.user,
      scope: entry.scope,
      expires_at: new Date(entry.expiresAt).toISOString(),
    })
  })

  router.post('/revoke', (req, res) => {
    store.revoke(field(req.body as Record<string, unknown> | undefined, 'token') ?? '')
    res.status(200).json({ revoked: true })
  })

  return router
}
