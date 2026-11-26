import { after, before, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { createHash, randomBytes } from 'node:crypto'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import type { AddressInfo } from 'node:net'
import type { Server } from 'node:http'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createApp } from '../src/app.ts'

const REDIRECT_URI = 'com.example.shop.auth://callback'

let projectRoot: string
let server: Server
let base: string

before(async () => {
  projectRoot = mkdtempSync(join(tmpdir(), 'demo-backend-'))
  writeFileSync(
    join(projectRoot, 'wefter.config.json'),
    JSON.stringify({
      deepLinks: { schemes: ['myshop'] },
      environments: { production: { appId: 'com.example.shop' } },
    }),
  )
  const wellKnown = join(projectRoot, '.wefter/deep-links/127.0.0.1/.well-known')
  mkdirSync(wellKnown, { recursive: true })
  writeFileSync(join(wellKnown, 'assetlinks.json'), '[{"relation":[]}]')

  server = createApp({ projectRoot, log: false }).listen(0, '127.0.0.1')
  await new Promise((resolve) => server.once('listening', resolve))
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
})

after(() => {
  server.close()
  rmSync(projectRoot, { recursive: true, force: true })
})

/** Reads a JSON response body. */
async function json(res: Response | Promise<Response>): Promise<any> {
  return (await res).json()
}

/** A PKCE verifier and its S256 challenge. */
function pkce() {
  const verifier = randomBytes(32).toString('base64url')
  return { verifier, challenge: createHash('sha256').update(verifier).digest('base64url') }
}

/** Runs the sign-in page and returns where the server redirected the browser. */
async function authorize(params: Record<string, string>, decision = 'approve'): Promise<URL> {
  const page = await fetch(`${base}/api/oauth/authorize?${new URLSearchParams(params)}`)
  assert.equal(page.status, 200)
  const requestId = /name="request_id" value="([^"]+)"/.exec(await page.text())?.[1]
  assert.ok(requestId, 'the sign-in page holds the request id')

  const res = await fetch(`${base}/api/oauth/authorize`, {
    method: 'POST',
    redirect: 'manual',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ request_id: requestId, decision, name: 'Ada Lovelace' }),
  })
  assert.equal(res.status, 302)
  return new URL(res.headers.get('location')!)
}

/** Posts to the token endpoint. */
function token(params: Record<string, string>) {
  return fetch(`${base}/api/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: 'wefter-demo', ...params }),
  })
}

const authorizeParams = (challenge: string) => ({
  response_type: 'code',
  client_id: 'wefter-demo',
  redirect_uri: REDIRECT_URI,
  code_challenge: challenge,
  code_challenge_method: 'S256',
  state: 'xyz',
  scope: 'openid profile email',
})

describe('health and echo', () => {
  it('reports health with the app environments', async () => {
    const body = await json(fetch(`${base}/api/health`))
    assert.equal(body.status, 'ok')
    assert.deepEqual(body.environments, ['production'])
  })

  it('echoes the request, with the requested status and masked credentials', async () => {
    const res = await fetch(`${base}/api/echo?status=418`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer secret' },
      body: JSON.stringify({ hello: 'world' }),
    })
    assert.equal(res.status, 418)
    const body = await json(res)
    assert.equal(body.method, 'POST')
    assert.deepEqual(body.body, { hello: 'world' })
    assert.equal(body.headers.authorization, '•••')
  })

  it('answers unknown routes with JSON 404 and preflight requests with 204', async () => {
    assert.equal((await fetch(`${base}/api/nope`)).status, 404)
    const preflight = await fetch(`${base}/api/echo`, { method: 'OPTIONS' })
    assert.equal(preflight.status, 204)
    assert.equal(preflight.headers.get('access-control-allow-origin'), '*')
  })
})

describe('OAuth with PKCE', () => {
  it('signs in, exchanges the code, reads the user, refreshes and revokes', async () => {
    const { verifier, challenge } = pkce()
    const redirect = await authorize(authorizeParams(challenge))
    assert.equal(redirect.protocol, 'com.example.shop.auth:')
    assert.equal(redirect.searchParams.get('state'), 'xyz')
    const code = redirect.searchParams.get('code')!

    const tokens = await json(
      token({
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
        code_verifier: verifier,
      }),
    )
    assert.equal(tokens.token_type, 'Bearer')
    assert.equal(tokens.scope, 'openid profile email')

    const user = await json(
      fetch(`${base}/api/oauth/userinfo`, {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      }),
    )
    assert.equal(user.name, 'Ada Lovelace')
    assert.equal(user.email, 'ada.lovelace@example.com')

    const refreshed = await json(
      token({ grant_type: 'refresh_token', refresh_token: tokens.refresh_token }),
    )
    assert.ok(refreshed.access_token)
    const reused = await token({ grant_type: 'refresh_token', refresh_token: tokens.refresh_token })
    assert.equal(reused.status, 400, 'a refresh token works once')

    await fetch(`${base}/api/oauth/revoke`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: refreshed.access_token }),
    })
    const afterRevoke = await fetch(`${base}/api/oauth/userinfo`, {
      headers: { Authorization: `Bearer ${refreshed.access_token}` },
    })
    assert.equal(afterRevoke.status, 401)
  })

  it('rejects a wrong verifier, and a code used twice', async () => {
    const { verifier, challenge } = pkce()
    const code = (await authorize(authorizeParams(challenge))).searchParams.get('code')!

    const wrong = await token({
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      code_verifier: pkce().verifier,
    })
    assert.equal(wrong.status, 400)
    assert.equal((await json(wrong)).error, 'invalid_grant')

    const again = await token({
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      code_verifier: verifier,
    })
    assert.equal(again.status, 400, 'the failed attempt used the code up')
  })

  it('sends a denial back to the app as access_denied', async () => {
    const redirect = await authorize(authorizeParams(pkce().challenge), 'deny')
    assert.equal(redirect.searchParams.get('error'), 'access_denied')
    assert.equal(redirect.searchParams.get('state'), 'xyz')
  })

  it('never redirects to a URI that is not the app', async () => {
    const res = await fetch(
      `${base}/api/oauth/authorize?${new URLSearchParams({ ...authorizeParams(pkce().challenge), redirect_uri: 'https://evil.example/cb' })}`,
      { redirect: 'manual' },
    )
    assert.equal(res.status, 400)
    assert.match(await res.text(), /is not allowed/)
  })

  it('requires PKCE', async () => {
    const params = { ...authorizeParams(''), code_challenge_method: 'plain' }
    const res = await fetch(`${base}/api/oauth/authorize?${new URLSearchParams(params)}`, {
      redirect: 'manual',
    })
    assert.equal(res.status, 302)
    assert.equal(new URL(res.headers.get('location')!).searchParams.get('error'), 'invalid_request')
  })
})

describe('deep link testing', () => {
  it('lists test links for each environment and renders the test page', async () => {
    const [env] = await json(fetch(`${base}/api/deep-links`))
    assert.equal(env.environment, 'production')
    assert.ok(env.links.some((link: { url: string }) => link.url === 'myshop://app?from=test-page'))
    assert.match(await (await fetch(`${base}/api/deep-links/page`)).text(), /myshop:\/\/backend/)
  })

  it("redirects only to the app's own schemes", async () => {
    const ok = await fetch(
      `${base}/api/deep-links/open?url=${encodeURIComponent('myshop://app')}`,
      { redirect: 'manual' },
    )
    assert.equal(ok.status, 302)
    assert.equal(ok.headers.get('location'), 'myshop://app')

    const other = await fetch(
      `${base}/api/deep-links/open?url=${encodeURIComponent('https://evil.example')}`,
      {
        redirect: 'manual',
      },
    )
    assert.equal(other.status, 400)
  })

  it('serves the verification files generated for the requested host', async () => {
    const res = await fetch(`${base}/.well-known/assetlinks.json`)
    assert.equal(res.status, 200)
    assert.match(res.headers.get('content-type') ?? '', /application\/json/)
    assert.equal((await fetch(`${base}/.well-known/apple-app-site-association`)).status, 404)
  })
})
