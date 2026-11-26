/** Closes the native splash screen once the app's first screen is on display. */

import type { Router } from 'vue-router'
import { hideSplash, isNativeBridgeAvailable } from '@wefterjs/core'

/**
 * Waits for the first route to resolve and two animation frames, so the page has painted, then hides the
 * splash. Does nothing in a browser, where there is no splash.
 */
export async function hideSplashWhenReady(router: Router): Promise<void> {
  if (!isNativeBridgeAvailable()) return
  await router.isReady()
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
  try {
    await hideSplash()
  } catch (error) {
    console.warn('[Wefter] Could not hide the splash screen; it closes after splash.maxDuration.', error)
  }
}
