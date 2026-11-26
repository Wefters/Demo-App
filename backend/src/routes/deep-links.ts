/**
 * Pages and routes for testing deep links the way users meet them: from a web page in Safari or Chrome,
 * and through a web redirect such as an email's tracked link. The links are built from the schemes and
 * domains in `wefter.config.json`.
 *
 * - `GET /api/deep-links`: each environment's test links, as JSON.
 * - `GET /api/deep-links/page`: a page of tappable test links; open it in the system browser.
 * - `GET /api/deep-links/open?url=…`: redirects to a link with one of the app's schemes.
 * - `GET /.well-known/assetlinks.json`, `/.well-known/apple-app-site-association`: the verification files
 *   from `wefter deep-links files`, for the domain the request was made to (useful behind a tunnel).
 */

import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { Router } from 'express'
import { PROJECT_ROOT, readAppEnvironments, type AppEnvironment } from '../config.ts'
import { escapeHtml, page } from '../html.ts'

/** In-app paths of the Demo App to link to, with a label for each. */
const SAMPLE_PATHS = [
  { path: 'app?from=test-page', label: 'App screen (shows the link)' },
  { path: 'backend?from=test-page', label: 'Backend API screen' },
  { path: 'browser', label: 'Browser screen' },
  { path: 'nowhere?from=test-page', label: 'A path the app does not know' },
]

/** One test link of an environment. */
interface TestLink {
  url: string
  label: string
}

/** The test links of one environment: each sample path on each scheme, and on each verified domain. */
function testLinks(env: AppEnvironment): TestLink[] {
  const prefix = (env.paths[0] ?? '/').replace(/\*$/, '').replace(/\/$/, '')
  return [
    ...env.schemes.flatMap((scheme) =>
      SAMPLE_PATHS.map(({ path, label }) => ({ url: `${scheme}://${path}`, label })),
    ),
    ...env.domains.map((domain) => ({
      url: `https://${domain}${prefix}/app?from=test-page`,
      label: `Verified link on ${domain}`,
    })),
  ]
}

/** Whether `url` uses one of the app's deep link schemes, so redirecting to it cannot be abused. */
function isAppLink(url: string, envs: AppEnvironment[]): boolean {
  try {
    const scheme = new URL(url).protocol.replace(/:$/, '')
    return envs.some((env) => env.schemes.includes(scheme))
  } catch {
    return false
  }
}

/** Creates the deep link routes. `projectRoot` locates `wefter.config.json` and `.wefter/deep-links`. */
export function deepLinksRouter(projectRoot: string = PROJECT_ROOT): Router {
  const router = Router()

  router.get('/', (_req, res) => {
    res.json(
      readAppEnvironments(projectRoot).map((env) => ({
        environment: env.name,
        links: testLinks(env),
      })),
    )
  })

  router.get('/page', (req, res) => {
    const envs = readAppEnvironments(projectRoot)
    const sections = envs
      .map((env) => {
        const links = testLinks(env)
        if (links.length === 0) return ''
        const items = links
          .map(({ url, label }) => {
            const viaRedirect = `/api/deep-links/open?url=${encodeURIComponent(url)}`
            return `<a class="button" href="${escapeHtml(url)}">${escapeHtml(label)}<br /><code>${escapeHtml(url)}</code></a>${
              isAppLink(url, envs)
                ? `<a class="button" href="${escapeHtml(viaRedirect)}">Same link through a web redirect</a>`
                : ''
            }`
          })
          .join('')
        return `<div class="card"><h2>${escapeHtml(env.name)} · ${escapeHtml(env.appId)}</h2><div class="links">${items}</div></div>`
      })
      .join('')

    res.type('html').send(
      page(
        'Deep link test page',
        `<div class="card"><h1>Deep link test page</h1><p>Tap a link to open the Wefter Demo app through the system,
        the way a link in an email or a website would. Served by ${escapeHtml(req.get('host') ?? 'the backend')}.</p></div>${
          sections ||
          '<div class="card"><p>No deep links configured. Add "deepLinks" to wefter.config.json and run <code>wefter sync</code>.</p></div>'
        }`,
      ),
    )
  })

  router.get('/open', (req, res) => {
    const url = typeof req.query.url === 'string' ? req.query.url : ''
    if (!isAppLink(url, readAppEnvironments(projectRoot))) {
      return res
        .status(400)
        .json({ error: 'invalid_url', message: "url must use one of the app's deep link schemes." })
    }
    res.redirect(302, url)
  })

  return router
}

/** Serves the verification files written by `wefter deep-links files`, for the requested host. */
export function wellKnownRouter(projectRoot: string = PROJECT_ROOT): Router {
  const router = Router()

  router.get(['/assetlinks.json', '/apple-app-site-association'], (req, res) => {
    const host = req.hostname.toLowerCase()
    const file = join(projectRoot, '.wefter/deep-links', host, '.well-known', req.path.slice(1))
    if (!/^[a-z0-9.-]+$/.test(host) || !existsSync(file)) {
      return res.status(404).json({
        error: 'not_found',
        message: `No ${req.path.slice(1)} for ${host}. Add the domain to deepLinks.domains and run \`wefter deep-links files\`.`,
      })
    }
    res.type('application/json').send(readFileSync(file, 'utf-8'))
  })

  return router
}
