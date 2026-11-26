/**
 * Sign-in against the backend's mock OAuth server with the authorization code flow and PKCE, the way a real
 * app would sign in with Google, GitHub or Auth0:
 *
 * 1. Open the sign-in page in a secure system browser session with `Browser.auth`.
 * 2. The server redirects to the app's own scheme (`<app id>.auth://oauth/callback`) with a code.
 * 3. Check the `state`, then exchange the code and the PKCE verifier for tokens.
 */

import { Browser } from '@wefterjs/browser'
import { apiUrl } from '@/config/api'
import { http, postForm } from '@/services/http'
import { createPkcePair, randomString } from '@/services/pkce'

/** The backend's client id for this app (`CLIENT_ID` in `backend/src/routes/oauth.ts`). */
export const OAUTH_CLIENT_ID = 'wefter-demo'

/** Scopes asked for at sign-in. */
const SCOPES = 'openid profile email'

/** Tokens of a signed-in session. `expiresAt` is in milliseconds since the epoch. */
export interface OAuthTokens {
  accessToken: string
  refreshToken: string
  expiresAt: number
  scope: string
}

/** The signed-in user, from the user info endpoint. */
export interface UserInfo {
  sub: string
  name: string
  email: string
  scope: string
  expires_at: string
}

/** A sign-in that failed or was cancelled. `code` is the OAuth error, or `cancelled`. */
export class SignInError extends Error {
  readonly code: string

  constructor(code: string, message: string) {
    super(message)
    this.name = 'SignInError'
    this.code = code
  }
}

/** The token endpoint's answer. */
interface TokenResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  scope: string
}

/** Converts a token response to {@link OAuthTokens}. */
function toTokens(response: TokenResponse): OAuthTokens {
  return {
    accessToken: response.access_token,
    refreshToken: response.refresh_token,
    expiresAt: Date.now() + response.expires_in * 1000,
    scope: response.scope,
  }
}

/**
 * Runs `start` and waits for the browser session `id` to come back: with the callback's parameters, or
 * with a {@link SignInError} when the user closed it.
 */
function waitForCallback(
  id: string,
  start: () => Promise<unknown>,
): Promise<Record<string, string>> {
  return new Promise((resolve, reject) => {
    const completed = Browser.onAuthCompleted((event) => {
      if (event.id !== id) return
      cleanup()
      resolve(event.params)
    })
    const closed = Browser.onClosed((event) => {
      if (event.id !== id) return
      cleanup()
      reject(new SignInError('cancelled', `Sign-in was closed (${event.reason}).`))
    })
    function cleanup() {
      completed.remove()
      closed.remove()
    }
    start().catch((error: unknown) => {
      cleanup()
      reject(error)
    })
  })
}

/** The redirect URI the backend sends the browser back to. */
export function getRedirectUri(): Promise<string> {
  return Browser.getRedirectUri('oauth/callback')
}

/**
 * Signs in through the system browser and returns the tokens.
 *
 * @param options `ephemeral` (iOS) uses a private browser session that does not share cookies.
 * @throws {SignInError} When the user cancels or denies, the `state` does not match, or the server refuses.
 */
export async function signInWithBrowser(
  options: { ephemeral?: boolean } = {},
): Promise<OAuthTokens> {
  const redirectUri = await getRedirectUri()
  const { verifier, challenge } = await createPkcePair()
  const state = randomString(16)
  const id = `oauth-${state.slice(0, 8)}`

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: OAUTH_CLIENT_ID,
    redirect_uri: redirectUri,
    scope: SCOPES,
    state,
    code_challenge: challenge,
    code_challenge_method: 'S256',
  })
  const url = `${apiUrl('/oauth/authorize')}?${params}`

  const callback = await waitForCallback(id, () =>
    Browser.auth({ url, redirectUri, id, ephemeral: options.ephemeral ?? true }),
  )

  if (callback.state !== state) {
    throw new SignInError(
      'state_mismatch',
      'The sign-in response does not belong to this sign-in. Try again.',
    )
  }
  if (callback.error) {
    throw new SignInError(
      callback.error,
      callback.error_description ?? `Sign-in failed: ${callback.error}.`,
    )
  }
  if (!callback.code) throw new SignInError('missing_code', 'The sign-in response has no code.')

  const { data } = await postForm<TokenResponse>('/oauth/token', {
    grant_type: 'authorization_code',
    client_id: OAUTH_CLIENT_ID,
    code: callback.code,
    redirect_uri: redirectUri,
    code_verifier: verifier,
  })
  return toTokens(data)
}

/** Exchanges a refresh token for new tokens. The old refresh token stops working. */
export async function refreshTokens(refreshToken: string): Promise<OAuthTokens> {
  const { data } = await postForm<TokenResponse>('/oauth/token', {
    grant_type: 'refresh_token',
    client_id: OAUTH_CLIENT_ID,
    refresh_token: refreshToken,
  })
  return toTokens(data)
}

/** Revokes a token on the server. */
export async function revokeToken(token: string): Promise<void> {
  await postForm('/oauth/revoke', { token })
}

/** The signed-in user. Sends the access token through the HTTP client. */
export async function fetchUserInfo(): Promise<UserInfo> {
  const { data } = await http.get<UserInfo>('/oauth/userinfo')
  return data
}
