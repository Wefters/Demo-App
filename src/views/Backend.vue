<template>
  <ModulePage
    icon="Server"
    title="Backend API"
    desc="backend/ · Express · axios"
    info="Talks to the local test backend in backend/. Start it with `pnpm api` next to `wefter run <platform> --watch`. Requests go through the dev server's /api, so they work on devices and simulators and show up in the DevTools Network panel."
  >
    <div class="p-4 bg-surface border border-border-subtle rounded-2xl flex flex-col gap-3">
      <div class="flex items-center justify-between">
        <h3 class="text-xs font-bold uppercase tracking-wider text-text-muted m-0">Connection</h3>
        <button
          @click="checkHealth"
          :disabled="healthBusy"
          class="flex items-center gap-1.5 px-3 py-1.5 bg-accent-subtle hover:bg-accent/20 text-accent text-xs font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
        >
          <Icons name="Activity" :size="14" />
          <span>Check health</span>
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div
          class="p-3 bg-surface-raised border border-border-subtle rounded-xl flex flex-col gap-1"
        >
          <span class="text-[11px] text-text-tertiary">API base URL</span>
          <span class="text-sm font-mono text-text-primary break-all">{{
            API_CONFIG.baseUrl ?? 'not configured'
          }}</span>
          <span class="text-[11px] text-text-tertiary">{{ sourceLabel }}</span>
        </div>
        <div
          class="p-3 bg-surface-raised border border-border-subtle rounded-xl flex flex-col gap-1"
        >
          <span class="text-[11px] text-text-tertiary">Status</span>
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full" :class="healthDotClass" />
            <span class="text-sm font-bold" :class="healthTextClass">{{ healthLabel }}</span>
          </div>
          <span v-if="health.detail" class="text-[11px] text-text-tertiary break-words">{{
            health.detail
          }}</span>
        </div>
      </div>
      <p
        v-if="API_CONFIG.source === 'none'"
        class="text-[11px] text-warning-text m-0 leading-relaxed"
      >
        {{ API_NOT_CONFIGURED_MESSAGE }}
      </p>
    </div>

    <div class="p-4 bg-surface border border-border-subtle rounded-2xl flex flex-col gap-3">
      <div class="flex flex-col gap-0.5">
        <h3 class="text-xs font-bold uppercase tracking-wider text-text-muted m-0">
          Request Tester
        </h3>
        <span class="text-[11px] text-text-tertiary"
          >Sends a request to <span class="font-mono">/echo</span>, which answers with what it
          received. Pick a status or a delay to try errors and timeouts.</span
        >
      </div>

      <div class="grid grid-cols-3 gap-2">
        <label class="flex flex-col gap-1">
          <span class="text-[11px] text-text-tertiary">Method</span>
          <select
            v-model="request.method"
            class="px-3 py-2 bg-surface-raised border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
          >
            <option v-for="method in METHODS" :key="method" :value="method">{{ method }}</option>
          </select>
        </label>
        <label class="flex flex-col gap-1">
          <span class="text-[11px] text-text-tertiary">Status</span>
          <input
            v-model.number="request.status"
            type="number"
            min="200"
            max="599"
            class="px-3 py-2 bg-surface-raised border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
          />
        </label>
        <label class="flex flex-col gap-1">
          <span class="text-[11px] text-text-tertiary">Delay (ms)</span>
          <input
            v-model.number="request.delay"
            type="number"
            min="0"
            step="500"
            class="px-3 py-2 bg-surface-raised border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
          />
        </label>
      </div>

      <button
        @click="sendRequest"
        :disabled="requestBusy"
        class="w-full py-2.5 bg-accent-subtle hover:bg-accent/20 text-accent font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      >
        <Icons name="Send" :size="16" />
        <span>{{ requestBusy ? 'Sending…' : `Send ${request.method} /echo` }}</span>
      </button>
    </div>

    <div class="p-4 bg-surface border border-border-subtle rounded-2xl flex flex-col gap-3">
      <div class="flex items-center justify-between">
        <div class="flex flex-col gap-0.5">
          <h3 class="text-xs font-bold uppercase tracking-wider text-text-muted m-0">
            OAuth Sign-in (PKCE)
          </h3>
          <span class="text-[11px] text-text-tertiary"
            >Signs in against the backend's mock OAuth server in the system browser, then calls an
            authenticated endpoint.</span
          >
        </div>
        <span
          class="px-2.5 py-1 text-xs font-semibold rounded-full shrink-0"
          :class="
            auth.isSignedIn
              ? 'bg-accent-subtle text-accent border border-accent/20'
              : 'bg-surface-raised text-text-muted'
          "
        >
          {{ auth.isSignedIn ? 'SIGNED IN' : 'SIGNED OUT' }}
        </span>
      </div>

      <div class="p-3 bg-surface-raised border border-border-subtle rounded-xl flex flex-col gap-1">
        <span class="text-[11px] text-text-tertiary">Redirect URI</span>
        <span class="text-xs font-mono text-text-primary break-all">{{
          redirectUri ?? 'Available in the app on a device or simulator'
        }}</span>
      </div>

      <div
        v-if="auth.user"
        class="p-3 bg-surface-raised border border-border-subtle rounded-xl flex flex-col gap-1"
      >
        <span class="text-sm font-semibold text-text-primary">{{ auth.user.name }}</span>
        <span class="text-xs text-text-secondary">{{ auth.user.email }}</span>
        <span class="text-[11px] text-text-tertiary font-mono">{{ auth.user.sub }}</span>
        <span class="text-[11px] text-text-tertiary">Access token expires {{ expiresLabel }}</span>
      </div>

      <template v-if="!auth.isSignedIn">
        <label class="flex items-center gap-2 text-xs text-text-secondary cursor-pointer">
          <input v-model="ephemeral" type="checkbox" class="rounded accent-accent" />
          <span>Private session (iOS: no shared Safari cookies)</span>
        </label>
        <button
          @click="signIn"
          :disabled="authBusy"
          class="w-full py-2.5 bg-accent-subtle hover:bg-accent/20 text-accent font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Icons name="KeyRound" :size="16" />
          <span>{{ authBusy ? 'Waiting for the browser…' : 'Sign in with the demo server' }}</span>
        </button>
      </template>
      <div v-else class="grid grid-cols-3 gap-2">
        <button
          @click="callUserInfo"
          class="py-2.5 bg-surface-raised hover:bg-accent/10 text-text-primary font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Icons name="UserRound" :size="14" />
          <span>User info</span>
        </button>
        <button
          @click="refresh"
          class="py-2.5 bg-surface-raised hover:bg-accent/10 text-text-primary font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Icons name="RefreshCw" :size="14" />
          <span>Refresh</span>
        </button>
        <button
          @click="signOut"
          class="py-2.5 bg-danger-soft hover:bg-danger-bg text-danger-text font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Icons name="LogOut" :size="14" />
          <span>Sign out</span>
        </button>
      </div>
    </div>

    <div class="p-4 bg-surface border border-border-subtle rounded-2xl flex flex-col gap-3">
      <div class="flex flex-col gap-0.5">
        <h3 class="text-xs font-bold uppercase tracking-wider text-text-muted m-0">
          Deep Link Testing
        </h3>
        <span class="text-[11px] text-text-tertiary"
          >Opens links through the system, the way an email or a website would, so the native
          registration is tested too. Links come from deepLinks in wefter.config.json.</span
        >
      </div>

      <button
        @click="openTestPage"
        class="w-full py-2.5 bg-accent-subtle hover:bg-accent/20 text-accent font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
      >
        <Icons name="ExternalLink" :size="16" />
        <span>Open the test page in the browser</span>
      </button>

      <div v-if="testLinks.length" class="flex flex-col gap-1.5">
        <button
          v-for="link in testLinks"
          :key="link.url"
          @click="openThroughRedirect(link.url)"
          class="flex items-center justify-between gap-3 px-3 py-2.5 bg-surface-raised border border-border-subtle rounded-xl text-left cursor-pointer hover:border-accent/40"
        >
          <span class="flex flex-col gap-0.5 min-w-0">
            <span class="text-xs text-text-primary">{{ link.label }}</span>
            <span class="text-[11px] font-mono text-text-tertiary truncate">{{ link.url }}</span>
          </span>
          <Icons name="ArrowUpRight" :size="14" class="text-text-muted shrink-0" />
        </button>
      </div>

      <div
        v-if="lastDeepLink"
        class="p-3 bg-surface-raised border border-border-subtle rounded-xl flex flex-col gap-1"
      >
        <span class="text-[11px] text-text-tertiary"
          >Last link received {{ lastDeepLink.isLaunch ? '(launch)' : '(while running)' }}</span
        >
        <span class="text-sm font-mono text-accent break-all">{{ lastDeepLink.url }}</span>
      </div>
    </div>

    <ShowcaseConsole :logs="logs" @clear="logs = []" />
  </ModulePage>
</template>

<script setup lang="ts">
/**
 * The Backend API screen: checks the connection to `backend/`, sends test requests with axios, signs in
 * with the backend's mock OAuth server, and opens deep link test pages and redirects through the system.
 */

import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { Browser } from '@wefterjs/browser'
import { onDeepLink, type DeepLink, type DeepLinkSubscription } from '@wefterjs/core'
import ModulePage from '@/components/common/ModulePage.vue'
import ShowcaseConsole, { type LogItem } from '@/components/showcase/ShowcaseConsole.vue'
import Icons from '@/components/common/Icons.vue'
import { API_CONFIG, API_NOT_CONFIGURED_MESSAGE, apiUrl } from '@/config/api'
import { http } from '@/services/http'
import { getRedirectUri } from '@/services/oauth'
import { useAuth } from '@/stores/auth'

/** HTTP methods the request tester offers. */
const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const

/** A test link from the backend. */
interface TestLink {
  url: string
  label: string
}

const auth = useAuth()
const logs = ref<LogItem[]>([])
const health = reactive<{ state: 'unknown' | 'ok' | 'down'; detail: string }>({
  state: 'unknown',
  detail: '',
})
const healthBusy = ref(false)
const request = reactive({ method: 'GET' as (typeof METHODS)[number], status: 200, delay: 0 })
const requestBusy = ref(false)
const authBusy = ref(false)
const ephemeral = ref(true)
const redirectUri = ref<string | null>(null)
const testLinks = ref<TestLink[]>([])
const lastDeepLink = ref<DeepLink | null>(null)
const clock = ref(Date.now())
let clockTimer: ReturnType<typeof setInterval> | undefined
let linkSub: DeepLinkSubscription | null = null

const sourceLabel = computed(() =>
  API_CONFIG.source === 'env'
    ? 'From VITE_API_URL'
    : API_CONFIG.source === 'dev-server'
      ? 'Through the dev server (vite.config.ts → backend)'
      : 'Set VITE_API_URL for builds without the dev server',
)
const healthLabel = computed(() =>
  health.state === 'ok' ? 'ONLINE' : health.state === 'down' ? 'UNREACHABLE' : 'CHECKING…',
)
const healthDotClass = computed(() =>
  health.state === 'ok'
    ? 'bg-success animate-pulse'
    : health.state === 'down'
      ? 'bg-danger-bg'
      : 'bg-text-muted',
)
const healthTextClass = computed(() =>
  health.state === 'ok'
    ? 'text-success'
    : health.state === 'down'
      ? 'text-danger-text'
      : 'text-text-muted',
)
const expiresLabel = computed(() => {
  const ms = (auth.tokens?.expiresAt ?? 0) - clock.value
  if (ms <= 0) return 'now (the next request refreshes it)'
  const minutes = Math.floor(ms / 60_000)
  const seconds = Math.floor((ms % 60_000) / 1000)
  return `in ${minutes}m ${String(seconds).padStart(2, '0')}s`
})

/** Current time, for log entries. */
function now() {
  return new Date().toLocaleTimeString()
}

/** Adds an entry to the result log. */
function log(method: string, status: 'success' | 'error', data: unknown) {
  logs.value.unshift({ method, status, data, timestamp: now() })
}

/** The error details to log for a failure. */
function errorData(err: any) {
  return { error: err?.message || String(err), code: err?.code, status: err?.status }
}

/** Checks that the backend answers, and how quickly. */
async function checkHealth() {
  healthBusy.value = true
  const started = performance.now()
  try {
    const { data } = await http.get('/health')
    const ms = Math.round(performance.now() - started)
    health.state = 'ok'
    health.detail = `${ms} ms · up ${data.uptimeSeconds}s`
    log('GET /health', 'success', data)
  } catch (err: any) {
    health.state = 'down'
    health.detail = err?.message || String(err)
    log('GET /health', 'error', errorData(err))
  } finally {
    healthBusy.value = false
  }
}

/** Sends the request tester's request. */
async function sendRequest() {
  requestBusy.value = true
  const label = `${request.method} /echo`
  const started = performance.now()
  try {
    const { status, data } = await http.request({
      method: request.method,
      url: '/echo',
      params: { status: request.status || undefined, delay: request.delay || undefined },
      data:
        request.method === 'GET'
          ? undefined
          : { sentAt: new Date().toISOString(), from: 'Backend screen' },
    })
    log(label, 'success', { status, ms: Math.round(performance.now() - started), body: data })
  } catch (err: any) {
    log(label, 'error', { ...errorData(err), ms: Math.round(performance.now() - started) })
  } finally {
    requestBusy.value = false
  }
}

/** Signs in through the system browser. */
async function signIn() {
  authBusy.value = true
  try {
    await auth.signIn({ ephemeral: ephemeral.value })
    log('OAuth sign-in', 'success', { user: auth.user, scope: auth.tokens?.scope })
  } catch (err: any) {
    log('OAuth sign-in', 'error', errorData(err))
  } finally {
    authBusy.value = false
  }
}

/** Calls the authenticated user info endpoint. */
async function callUserInfo() {
  try {
    log('GET /oauth/userinfo', 'success', await auth.loadUser())
  } catch (err: any) {
    log('GET /oauth/userinfo', 'error', errorData(err))
  }
}

/** Swaps the refresh token for new tokens. */
async function refresh() {
  try {
    await auth.refresh()
    log('OAuth refresh', 'success', {
      expiresAt: new Date(auth.tokens!.expiresAt).toLocaleTimeString(),
    })
  } catch (err: any) {
    log('OAuth refresh', 'error', errorData(err))
  }
}

/** Signs out and revokes the tokens. */
async function signOut() {
  await auth.signOut()
  log('OAuth sign-out', 'success', { revoked: true })
}

/** Opens `url` in the system browser. */
async function openExternal(url: string, label: string) {
  try {
    await Browser.open({ url, mode: 'external' })
    log(label, 'success', { url })
  } catch (err: any) {
    log(label, 'error', errorData(err))
  }
}

/** Opens the backend's page of tappable test links. */
function openTestPage() {
  try {
    void openExternal(apiUrl('/deep-links/page'), 'Open test page')
  } catch (err: any) {
    log('Open test page', 'error', errorData(err))
  }
}

/** Opens a link through the backend's redirect, the way a tracked link in an email would. */
function openThroughRedirect(link: string) {
  try {
    void openExternal(
      apiUrl(`/deep-links/open?url=${encodeURIComponent(link)}`),
      'Open link via redirect',
    )
  } catch (err: any) {
    log('Open link via redirect', 'error', errorData(err))
  }
}

/** Loads the test links of the environment this build belongs to (all of them, for simplicity). */
async function loadTestLinks() {
  try {
    const { data } = await http.get<{ environment: string; links: TestLink[] }[]>('/deep-links')
    testLinks.value = data
      .flatMap((env) => env.links)
      .filter((link) => !link.url.startsWith('https:'))
  } catch {
    testLinks.value = []
  }
}

/** Checks the connection, loads the redirect URI and test links, and listens for deep links. */
onMounted(() => {
  void checkHealth()
  void loadTestLinks()
  getRedirectUri()
    .then((uri) => (redirectUri.value = uri))
    .catch(() => (redirectUri.value = null))
  linkSub = onDeepLink((link) => {
    lastDeepLink.value = link
    log('onDeepLink', 'success', link)
  })
  clockTimer = setInterval(() => (clock.value = Date.now()), 1000)
})

/** Stops listening and the expiry clock. */
onUnmounted(() => {
  linkSub?.remove()
  clearInterval(clockTimer)
})
</script>
