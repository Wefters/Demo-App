/**
 * The signed-in session against the demo backend: tokens and user, kept in memory for the life of the app.
 * The HTTP client reads the access token from here and asks it to refresh after a `401`.
 */

import { defineStore } from 'pinia'
import { setAuthHandlers } from '@/services/http'
import {
  fetchUserInfo,
  refreshTokens,
  revokeToken,
  signInWithBrowser,
  type OAuthTokens,
  type UserInfo,
} from '@/services/oauth'

/** A refresh already under way, shared so parallel `401`s refresh only once. */
let refreshing: Promise<string | null> | null = null

/** Store for the sign-in session. */
export const useAuth = defineStore('auth', {
  state: () => ({
    tokens: null as OAuthTokens | null,
    user: null as UserInfo | null,
  }),

  getters: {
    isSignedIn: (state) => state.tokens !== null,
  },

  actions: {
    /** Signs in through the system browser, then loads the user. */
    async signIn(options: { ephemeral?: boolean } = {}) {
      this.tokens = await signInWithBrowser(options)
      await this.loadUser()
    },

    /** Loads the signed-in user with an authenticated request. */
    async loadUser() {
      this.user = await fetchUserInfo()
      return this.user
    },

    /**
     * Swaps the refresh token for new tokens. A failed refresh ends the session.
     *
     * @returns The new access token, or `null` when there is no session to refresh.
     */
    refresh(): Promise<string | null> {
      const refreshToken = this.tokens?.refreshToken
      if (!refreshToken) return Promise.resolve(null)
      refreshing ??= refreshTokens(refreshToken)
        .then((tokens) => {
          this.tokens = tokens
          return tokens.accessToken
        })
        .catch((error: unknown) => {
          this.tokens = null
          this.user = null
          throw error
        })
        .finally(() => {
          refreshing = null
        })
      return refreshing
    },

    /** Revokes the tokens on the server (best effort) and forgets them. */
    async signOut() {
      const tokens = this.tokens
      this.tokens = null
      this.user = null
      if (tokens) {
        await Promise.allSettled([
          revokeToken(tokens.accessToken),
          revokeToken(tokens.refreshToken),
        ])
      }
    },
  },
})

setAuthHandlers({
  accessToken: () => useAuth().tokens?.accessToken ?? null,
  refresh: () => useAuth().refresh(),
})
