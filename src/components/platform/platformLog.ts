/**
 * The log shared by the cards of the Platform and Embedded sites pages: each card adds the result of what it tried, and the
 * page shows them in one console.
 */

import { ref } from 'vue'
import type { LogItem } from '@/components/showcase/ShowcaseConsole.vue'

export const platformLogs = ref<LogItem[]>([])

/** Adds a successful result. */
export function logSuccess(method: string, data: unknown) {
  platformLogs.value.unshift({
    method,
    status: 'success',
    data,
    timestamp: new Date().toLocaleTimeString(),
  })
}

/** Adds a failure, with the error's name and message. */
export function logError(method: string, error: unknown) {
  const err = error as { name?: string; message?: string; code?: number } | undefined
  const data =
    err && typeof err === 'object'
      ? { name: err.name, code: err.code, message: err.message ?? String(error) }
      : { message: String(error) }
  platformLogs.value.unshift({
    method,
    status: 'error',
    data,
    timestamp: new Date().toLocaleTimeString(),
  })
}
