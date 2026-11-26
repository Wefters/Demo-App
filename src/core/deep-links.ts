/**
 * Opens the matching screen for deep links: `wefterdemo://backend` shows the Backend API screen, and
 * `https://<verified domain>/app` the App screen. Links to paths the app does not know are left alone.
 */

import type { Router } from 'vue-router'
import { onDeepLink } from '@wefterjs/core'

/** Routes every deep link to its screen. Call once, when the router is created. */
export function installDeepLinkRouting(router: Router): void {
  onDeepLink(({ path, query }) => {
    const target = router.resolve({ path, query })
    if (target.matched.length > 0) void router.push(target)
  })
}
