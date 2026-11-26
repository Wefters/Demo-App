<template>
  <ModulePage
    icon="Globe"
    title="In-App Browser & OAuth"
    desc="@wefterjs/browser v0.0.1"
    info="Launch native SFSafariViewController on iOS or Chrome Custom Tabs on Android with custom toolbars and secure OAuth deep linking."
  >
    <div class="p-4 bg-surface border border-border-subtle rounded-2xl flex flex-col gap-4">
      <h3 class="text-xs font-bold uppercase tracking-wider text-text-muted m-0">
        Standard Browser Session
      </h3>

      <div class="flex flex-col gap-3">
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-text-secondary">Target URL</label>
          <input
            v-model="openOptions.url"
            type="url"
            placeholder="https://wefter.dev"
            class="px-3 py-2 bg-surface-raised border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="flex flex-col gap-1">
            <label class="text-xs font-medium text-text-secondary">Browser Mode</label>
            <select
              v-model="openOptions.mode"
              class="px-3 py-2 bg-surface-raised border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
            >
              <option value="webview">In-App WebView (Custom Tabs / Safari)</option>
              <option value="external">External System Browser</option>
            </select>
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-xs font-medium text-text-secondary">Session ID (Optional)</label>
            <input
              v-model="openOptions.id"
              type="text"
              placeholder="e.g. session-1"
              class="px-3 py-2 bg-surface-raised border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-text-secondary">Toolbar Title (Optional)</label>
          <input
            v-model="openOptions.title"
            type="text"
            placeholder="e.g. Wefter Documentation"
            class="px-3 py-2 bg-surface-raised border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
          />
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          <label class="flex items-center gap-2 text-xs text-text-secondary cursor-pointer">
            <input
              type="checkbox"
              v-model="openOptions.showToolbar"
              class="rounded accent-accent"
            />
            <span>Show Toolbar</span>
          </label>
          <label class="flex items-center gap-2 text-xs text-text-secondary cursor-pointer">
            <input
              type="checkbox"
              v-model="openOptions.showNavigationButtons"
              class="rounded accent-accent"
            />
            <span>Nav Buttons</span>
          </label>
          <label class="flex items-center gap-2 text-xs text-text-secondary cursor-pointer">
            <input
              type="checkbox"
              v-model="openOptions.shareButton"
              class="rounded accent-accent"
            />
            <span>Share Button</span>
          </label>
          <label class="flex items-center gap-2 text-xs text-text-secondary cursor-pointer">
            <input
              type="checkbox"
              v-model="openOptions.desktopMode"
              class="rounded accent-accent"
            />
            <span>Desktop Mode</span>
          </label>
        </div>

        <div class="flex items-center gap-2 pt-2">
          <button
            @click="triggerOpen"
            class="flex-1 py-2.5 bg-accent hover:bg-accent-bright text-white font-bold text-xs rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <Icons name="Globe" :size="16" />
            <span>Open Browser</span>
          </button>
          <button
            @click="triggerClose"
            class="px-4 py-2.5 bg-surface-raised hover:bg-danger-bg text-danger-text font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Icons name="X" :size="16" />
            <span>Close</span>
          </button>
        </div>
      </div>
    </div>

    <div class="p-4 bg-surface border border-border-subtle rounded-2xl flex flex-col gap-4">
      <h3 class="text-xs font-bold uppercase tracking-wider text-text-muted m-0">
        OAuth Authentication Session
      </h3>

      <div class="flex flex-col gap-3">
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-text-secondary">Auth Provider URL</label>
          <input
            v-model="authOptions.url"
            type="url"
            placeholder="https://github.com/login/oauth/authorize"
            class="px-3 py-2 bg-surface-raised border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
          />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-text-secondary">Redirect Deep Link URI</label>
          <input
            v-model="authOptions.redirectUri"
            type="text"
            placeholder="wefter://auth-callback"
            class="px-3 py-2 bg-surface-raised border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
          />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-text-secondary">Session ID (Optional)</label>
          <input
            v-model="authOptions.id"
            type="text"
            placeholder="e.g. oauth-demo-1"
            class="px-3 py-2 bg-surface-raised border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
          />
        </div>

        <label class="flex items-center gap-2 text-xs text-text-secondary cursor-pointer">
          <input type="checkbox" v-model="authOptions.ephemeral" class="rounded accent-accent" />
          <span>Ephemeral Session (No Shared Cookies)</span>
        </label>

        <button
          @click="triggerAuth"
          class="w-full py-2.5 bg-accent-subtle hover:bg-accent/20 text-accent font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <Icons name="KeyRound" :size="16" />
          <span>Launch In-App OAuth Flow</span>
        </button>
      </div>
    </div>

    <EventLogger :events="events" @clear="events = []" />
    <ShowcaseConsole :logs="logs" @clear="logs = []" />
  </ModulePage>
</template>

<script setup lang="ts">
/**
 * Demo of `@wefterjs/browser`: opens pages in the in-app or system browser, closes them, and runs a sign-in
 * flow, showing the events each one emits.
 */

import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { Browser, type BrowserMode } from '@wefterjs/browser'
import ModulePage from '@/components/common/ModulePage.vue'
import ShowcaseConsole, { type LogItem } from '@/components/showcase/ShowcaseConsole.vue'
import EventLogger, { type EventItem } from '@/components/showcase/EventLogger.vue'
import Icons from '@/components/common/Icons.vue'

const logs = ref<LogItem[]>([])
const events = ref<EventItem[]>([])

/** Options passed to `Browser.open`. */
const openOptions = reactive({
  url: 'https://wefter.dev',
  mode: 'webview' as BrowserMode,
  id: 'browser-demo-1',
  title: 'Wefter Documentation',
  showToolbar: true,
  showNavigationButtons: true,
  shareButton: true,
  desktopMode: false,
})

/** Options passed to `Browser.auth`. */
const authOptions = reactive({
  url: 'https://github.com/login/oauth/authorize?client_id=demo',
  redirectUri: 'wefter://auth-callback',
  id: 'oauth-demo-1',
  ephemeral: false,
})

let openedSub: { remove: () => void } | null = null
let closedSub: { remove: () => void } | null = null
let authSub: { remove: () => void } | null = null

/** Current time, for log entries. */
function now() {
  return new Date().toLocaleTimeString()
}

/** Opens the URL with the chosen options. */
async function triggerOpen() {
  try {
    const res = await Browser.open({
      url: openOptions.url,
      mode: openOptions.mode,
      id: openOptions.id || undefined,
      title: openOptions.title || undefined,
      showToolbar: openOptions.showToolbar,
      showNavigationButtons: openOptions.showNavigationButtons,
      shareButton: openOptions.shareButton,
      desktopMode: openOptions.desktopMode,
    })
    logs.value.unshift({
      method: 'Browser.open',
      status: 'success',
      data: res,
      timestamp: now(),
    })
  } catch (err: any) {
    logs.value.unshift({
      method: 'Browser.open',
      status: 'error',
      data: { error: err?.message || String(err) },
      timestamp: now(),
    })
  }
}

/** Closes the open browser. */
async function triggerClose() {
  try {
    const res = await Browser.close({
      id: openOptions.id || undefined,
    })
    logs.value.unshift({
      method: 'Browser.close',
      status: 'success',
      data: res,
      timestamp: now(),
    })
  } catch (err: any) {
    logs.value.unshift({
      method: 'Browser.close',
      status: 'error',
      data: { error: err?.message || String(err) },
      timestamp: now(),
    })
  }
}

/** Starts the sign-in flow. */
async function triggerAuth() {
  try {
    const res = await Browser.auth({
      url: authOptions.url,
      redirectUri: authOptions.redirectUri,
      id: authOptions.id || undefined,
      ephemeral: authOptions.ephemeral,
    })
    logs.value.unshift({
      method: 'Browser.auth',
      status: 'success',
      data: res,
      timestamp: now(),
    })
  } catch (err: any) {
    logs.value.unshift({
      method: 'Browser.auth',
      status: 'error',
      data: { error: err?.message || String(err) },
      timestamp: now(),
    })
  }
}

/** Subscribes to the browser's opened, closed and sign-in events. */
onMounted(() => {
  openedSub = Browser.onOpened((data) => {
    events.value.unshift({
      name: 'browser:opened',
      payload: data,
      timestamp: now(),
    })
  })

  closedSub = Browser.onClosed((data) => {
    events.value.unshift({
      name: 'browser:closed',
      payload: data,
      timestamp: now(),
    })
  })

  authSub = Browser.onAuthCompleted((data) => {
    events.value.unshift({
      name: 'browser:authCompleted',
      payload: data,
      timestamp: now(),
    })
  })
})

/** Stops listening to browser events. */
onUnmounted(() => {
  openedSub?.remove()
  closedSub?.remove()
  authSub?.remove()
})
</script>
