# Demo backend

A local Express server for testing the Wefter Demo App against a real API: requests and errors, signing in with OAuth, and deep links opened from a web page or a redirect. It is a test tool, not a production server: everything is kept in memory and lost on restart.

## Running

From `Demo-App/`, next to `npx wefter run <platform> --watch`:

```bash
pnpm api        # starts the server on http://127.0.0.1:4000 and restarts it on changes
pnpm api:test   # runs the tests
```

Or from this folder: `pnpm dev`, `pnpm start`, `pnpm test`, `pnpm type-check`.

The app does not call port 4000 directly. It calls `/api` on the Vite dev server it is loaded from, which forwards the request here (`server.proxy` in `../vite.config.ts`). Devices can already reach the dev server, so nothing else is needed.

Node runs the TypeScript directly (type stripping, Node 22.18 or later), so there is no build step.

## Settings

Copy `.env.example` to `.env` to change them:

| Variable              | Default     | Description                                                                                                |
| --------------------- | ----------- | ---------------------------------------------------------------------------------------------------------- |
| `PORT`                | `4000`      | Port to listen on. Change `API_PROXY_TARGET` in the app's `.env.local` to match.                           |
| `HOST`                | `127.0.0.1` | Interface to listen on. `0.0.0.0` makes it reachable from the network (then set the app's `VITE_API_URL`). |
| `OAUTH_REDIRECT_URIS` | none        | Extra redirect URIs the OAuth server accepts, comma-separated.                                             |

The app's environments in `../wefter.config.json` decide the deep link schemes and the sign-in redirects that are accepted, read on every request.

## Endpoints

### Basics

- `GET /api/health`: `{ status: "ok", uptimeSeconds, environments }`.
- `ANY /api/echo`: returns the method, path, query, headers (credentials masked) and body. `?status=404` answers with that status and `?delay=2000` waits first (up to 30 s).

### Mock OAuth 2.0 server

The authorization code flow with PKCE, as a mobile app uses with Google, GitHub or Auth0. There is one public client, `wefter-demo`.

1. `GET /api/oauth/authorize?response_type=code&client_id=wefter-demo&redirect_uri=…&code_challenge=…&code_challenge_method=S256&state=…&scope=openid profile email` shows a sign-in page (open it with `Browser.auth`).
2. Approving redirects to `redirect_uri?code=…&state=…`; denying to `redirect_uri?error=access_denied&state=…`.
3. `POST /api/oauth/token` with `grant_type=authorization_code`, `code`, `redirect_uri`, `code_verifier` and `client_id` returns `{ access_token, refresh_token, expires_in, token_type, scope }`.
4. `GET /api/oauth/userinfo` with `Authorization: Bearer <access token>` returns the user.
5. `POST /api/oauth/token` with `grant_type=refresh_token` swaps a refresh token for new tokens (each refresh token works once).
6. `POST /api/oauth/revoke` with `token` revokes it.

Rules it enforces, so mistakes show up as they would with a real provider:

- `redirect_uri` must use the app's sign-in scheme (each environment's app id or bundle id plus `.auth`, what `Browser.getRedirectUri()` returns) or be listed in `OAUTH_REDIRECT_URIS`. Other URIs get an error page and are never redirected to.
- PKCE with `S256` is required, and the verifier must match the challenge.
- Codes work once and expire after 60 seconds; access tokens after 15 minutes; refresh tokens after 7 days.
- The code must be exchanged with the same `redirect_uri` it was issued for.

### Deep link testing

- `GET /api/deep-links`: each environment's test links, built from `deepLinks` in `wefter.config.json`.
- `GET /api/deep-links/page`: a page of those links. Open it in Safari or Chrome on the device and tap one: the system opens the app, as it would from an email or a website.
- `GET /api/deep-links/open?url=…`: redirects to the link, like a tracked link. Only the app's own schemes are accepted, so it cannot be used as an open redirect.
- `GET /.well-known/assetlinks.json` and `/.well-known/apple-app-site-association`: the files `wefter deep-links files` wrote for the requested host. Verified links need HTTPS on a real domain, so use these behind a tunnel that points that domain at this server.

## Layout

```
src/
  server.ts            starts the server
  app.ts               the Express app (separate, so tests start it on any port)
  config.ts            settings and the app environments from wefter.config.json
  html.ts              page layout and escaping
  oauth/store.ts       in-memory requests, codes and tokens; PKCE helpers
  routes/basic.ts      health and echo
  routes/oauth.ts      the mock OAuth server
  routes/deep-links.ts deep link test page, redirect and .well-known files
test/api.test.ts       end-to-end tests with Node's test runner
```
