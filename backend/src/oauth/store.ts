/**
 * In-memory state of the mock OAuth server: sign-in requests waiting for the user, authorization codes and
 * tokens. Everything is lost when the server restarts, which is fine for testing.
 */

import { createHash, randomBytes } from 'node:crypto'

/** The signed-in demo user. */
export interface OAuthUser {
  sub: string
  name: string
  email: string
}

/** A sign-in request shown on the sign-in page, waiting for the user to approve or deny it. */
export interface PendingAuthorization {
  id: string
  clientId: string
  redirectUri: string
  state: string | undefined
  codeChallenge: string
  scope: string
  expiresAt: number
}

/** A single-use authorization code, exchanged for tokens at the token endpoint. */
export interface AuthorizationCode {
  clientId: string
  redirectUri: string
  codeChallenge: string
  scope: string
  user: OAuthUser
  expiresAt: number
}

/** An issued access or refresh token. */
export interface TokenRecord {
  kind: 'access' | 'refresh'
  clientId: string
  scope: string
  user: OAuthUser
  expiresAt: number
}

/** How long each item lives, in seconds. */
export const LIFETIME = {
  pending: 10 * 60,
  code: 60,
  access: 15 * 60,
  refresh: 7 * 24 * 60 * 60,
}

/** A random, URL-safe value with `bytes` bytes of entropy. */
export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString('base64url')
}

/** PKCE `S256`: the base64url SHA-256 of the verifier. */
export function pkceChallenge(verifier: string): string {
  return createHash('sha256').update(verifier).digest('base64url')
}

/** A PKCE code verifier as RFC 7636 defines it: 43 to 128 unreserved characters. */
export function isValidVerifier(verifier: string): boolean {
  return /^[A-Za-z0-9\-._~]{43,128}$/.test(verifier)
}

/** The user for a name entered on the sign-in page. */
export function userFromName(name: string): OAuthUser {
  const clean = name.trim().slice(0, 60) || 'Demo User'
  const handle =
    clean
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '.')
      .replace(/^\.|\.$/g, '') || 'demo'
  return { sub: `user-${handle}`, name: clean, email: `${handle}@example.com` }
}

/** Creates an empty store. `now` is replaceable so tests can move time forward. */
export function createOAuthStore(now: () => number = Date.now) {
  const pending = new Map<string, PendingAuthorization>()
  const codes = new Map<string, AuthorizationCode>()
  const tokens = new Map<string, TokenRecord>()

  /** Removes `key` from `map` when it has expired, and returns what is left. */
  function live<T extends { expiresAt: number }>(map: Map<string, T>, key: string): T | undefined {
    const item = map.get(key)
    if (item && item.expiresAt <= now()) {
      map.delete(key)
      return undefined
    }
    return item
  }

  /** Issues an access token and a refresh token for `user`. */
  function issueTokens(clientId: string, scope: string, user: OAuthUser) {
    const accessToken = randomToken()
    const refreshToken = randomToken()
    tokens.set(accessToken, {
      kind: 'access',
      clientId,
      scope,
      user,
      expiresAt: now() + LIFETIME.access * 1000,
    })
    tokens.set(refreshToken, {
      kind: 'refresh',
      clientId,
      scope,
      user,
      expiresAt: now() + LIFETIME.refresh * 1000,
    })
    return {
      access_token: accessToken,
      token_type: 'Bearer' as const,
      expires_in: LIFETIME.access,
      refresh_token: refreshToken,
      scope,
    }
  }

  return {
    /** Remembers a sign-in request and returns its id, which the sign-in page posts back. */
    addPending(request: Omit<PendingAuthorization, 'id' | 'expiresAt'>): PendingAuthorization {
      const entry = { ...request, id: randomToken(16), expiresAt: now() + LIFETIME.pending * 1000 }
      pending.set(entry.id, entry)
      return entry
    },

    /** Removes and returns a sign-in request, or `undefined` when it is unknown or expired. */
    takePending(id: string): PendingAuthorization | undefined {
      const entry = live(pending, id)
      pending.delete(id)
      return entry
    },

    /** Issues an authorization code for an approved request. */
    issueCode(request: PendingAuthorization, user: OAuthUser): string {
      const code = randomToken()
      codes.set(code, {
        clientId: request.clientId,
        redirectUri: request.redirectUri,
        codeChallenge: request.codeChallenge,
        scope: request.scope,
        user,
        expiresAt: now() + LIFETIME.code * 1000,
      })
      return code
    },

    /** Removes and returns a code, so each one can be used only once. */
    takeCode(code: string): AuthorizationCode | undefined {
      const entry = live(codes, code)
      codes.delete(code)
      return entry
    },

    issueTokens,

    /** A live token of the given kind, or `undefined`. */
    findToken(token: string, kind: TokenRecord['kind']): TokenRecord | undefined {
      const entry = live(tokens, token)
      return entry?.kind === kind ? entry : undefined
    },

    /** Revokes a token. Returns whether it existed. */
    revoke(token: string): boolean {
      return tokens.delete(token)
    },
  }
}

/** The store type, for passing it around. */
export type OAuthStore = ReturnType<typeof createOAuthStore>
