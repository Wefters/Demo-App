/**
 * Settings of the demo backend: the port and host from the environment (or `backend/.env`), and the app's
 * environments read from `wefter.config.json`, which decide the deep link schemes and the sign-in redirects
 * the mock OAuth server accepts.
 */

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

/** Port the API listens on. */
export const PORT = Number(process.env.PORT ?? 4000)

/** Interface the API listens on: this machine only by default. */
export const HOST = process.env.HOST ?? '127.0.0.1'

/** The Demo App folder, which holds `wefter.config.json`. */
export const PROJECT_ROOT = fileURLToPath(new URL('../..', import.meta.url))

/** Extra redirect URIs the mock OAuth server accepts, as a comma-separated list in `OAUTH_REDIRECT_URIS`. */
export const EXTRA_REDIRECT_URIS = (process.env.OAUTH_REDIRECT_URIS ?? '')
  .split(',')
  .map((uri) => uri.trim())
  .filter(Boolean)

/** One app environment and its deep links, resolved the way `wefter sync` does. */
export interface AppEnvironment {
  name: string
  appId: string
  bundleId: string
  schemes: string[]
  domains: string[]
  paths: string[]
}

/** The deep link fields of `wefter.config.json`, at the top level or in an environment. */
interface DeepLinksShape {
  schemes?: string[]
  domains?: string[]
  paths?: string[]
}

/** The fields of `wefter.config.json` the backend reads. */
interface WefterConfigShape {
  deepLinks?: DeepLinksShape
  environments?: Record<
    string,
    { appId?: string; iosBundleId?: string; deepLinks?: DeepLinksShape }
  >
}

/**
 * The app's environments from `wefter.config.json`, read on every call so edits apply without a restart.
 * A field set in an environment's `deepLinks` replaces the top-level one. A missing or invalid config gives
 * an empty list.
 */
export function readAppEnvironments(projectRoot: string = PROJECT_ROOT): AppEnvironment[] {
  let config: WefterConfigShape
  try {
    config = JSON.parse(
      readFileSync(join(projectRoot, 'wefter.config.json'), 'utf-8'),
    ) as WefterConfigShape
  } catch {
    return []
  }

  const shared = config.deepLinks ?? {}
  return Object.entries(config.environments ?? {})
    .filter(([, env]) => typeof env.appId === 'string')
    .map(([name, env]) => {
      const own = env.deepLinks ?? {}
      return {
        name,
        appId: env.appId!,
        bundleId: env.iosBundleId ?? env.appId!,
        schemes: own.schemes ?? shared.schemes ?? [],
        domains: own.domains ?? shared.domains ?? [],
        paths: own.paths ?? shared.paths ?? [],
      }
    })
}
