<template>
  <ModulePage
    icon="AppWindow"
    title="Application Control Plane"
    desc="@wefterjs/app v0.0.1"
    info="Build metadata, lifecycle state, deep-link ingestion, external URL handoff, memory warnings, and Android hardware back-button handling. Lifecycle, deep-link, memory and back-button events stream live while this screen is mounted."
  >
    <div class="p-4 bg-surface border border-border-subtle rounded-2xl flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <h3 class="text-xs font-bold uppercase tracking-wider text-text-muted m-0">
          Build Metadata
        </h3>
        <button
          @click="loadInfo"
          class="flex items-center gap-1.5 px-3 py-1.5 bg-accent-subtle hover:bg-accent/20 text-accent text-xs font-semibold rounded-xl transition-colors cursor-pointer"
        >
          <Icons name="RefreshCw" :size="14" />
          <span>getInfo()</span>
        </button>
      </div>

      <div v-if="info" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div
          v-for="field in infoFields"
          :key="field.label"
          class="p-3 bg-surface-raised border border-border-subtle rounded-xl flex flex-col gap-1"
        >
          <span class="text-[11px] text-text-tertiary">{{ field.label }}</span>
          <span class="text-sm font-bold text-text-primary font-mono break-all">{{
            field.value
          }}</span>
        </div>
      </div>
      <p v-else class="text-xs text-text-tertiary m-0">Not loaded yet.</p>
    </div>

    <div class="p-4 bg-surface border border-border-subtle rounded-2xl flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <h3 class="text-xs font-bold uppercase tracking-wider text-text-muted m-0">
          Lifecycle State
        </h3>
        <button
          @click="loadState"
          class="flex items-center gap-1.5 px-3 py-1.5 bg-accent-subtle hover:bg-accent/20 text-accent text-xs font-semibold rounded-xl transition-colors cursor-pointer"
        >
          <Icons name="RefreshCw" :size="14" />
          <span>getState()</span>
        </button>
      </div>

      <div class="flex items-center gap-2">
        <span
          class="w-2.5 h-2.5 rounded-full"
          :class="phase === 'active' ? 'bg-success animate-pulse' : 'bg-warning-text'"
        />
        <span
          class="text-sm font-bold uppercase font-mono"
          :class="phase === 'active' ? 'text-success' : 'text-warning-text'"
        >
          {{ phase }}
        </span>
      </div>
      <p class="text-[11px] text-text-tertiary m-0">
        Listening on <span class="font-mono">app:stateChange</span> — background the app and return
        to see <span class="font-mono">active / inactive / background</span> transitions logged
        below.
      </p>
    </div>

    <div class="p-4 bg-surface border border-border-subtle rounded-2xl flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <h3 class="text-xs font-bold uppercase tracking-wider text-text-muted m-0">Deep Links</h3>
        <button
          @click="loadLaunchUrl"
          class="flex items-center gap-1.5 px-3 py-1.5 bg-accent-subtle hover:bg-accent/20 text-accent text-xs font-semibold rounded-xl transition-colors cursor-pointer"
        >
          <Icons name="Link" :size="14" />
          <span>getLaunchUrl()</span>
        </button>
      </div>

      <div class="p-3 bg-surface-raised border border-border-subtle rounded-xl flex flex-col gap-1">
        <span class="text-[11px] text-text-tertiary">Launch URL</span>
        <span class="text-sm font-mono text-text-primary break-all">{{
          launchUrl ?? '— (launched normally)'
        }}</span>
      </div>
      <div
        v-if="lastDeepLink"
        class="p-3 bg-surface-raised border border-border-subtle rounded-xl flex flex-col gap-1"
      >
        <span class="text-[11px] text-text-tertiary"
          >Last <span class="font-mono">onDeepLink</span>
          {{ lastDeepLink.isLaunch ? '(launch)' : '(while running)' }}</span
        >
        <span class="text-sm font-mono text-accent break-all">{{ lastDeepLink.url }}</span>
        <span class="text-[11px] font-mono text-text-tertiary break-all"
          >path {{ lastDeepLink.path }}</span
        >
      </div>
      <p class="text-[11px] text-text-tertiary m-0">
        The demo registers <span class="font-mono">wefterdemo://</span> in wefter.config.json. Test
        from a terminal:
        <span class="font-mono"
          >adb shell am start -a android.intent.action.VIEW -d "wefterdemo://app/info?ok=1"</span
        >
        or <span class="font-mono">xcrun simctl openurl booted "wefterdemo://app/info"</span>.
      </p>
    </div>

    <div class="p-4 bg-surface border border-border-subtle rounded-2xl flex flex-col gap-3">
      <div>
        <h3 class="text-sm font-bold text-text-primary m-0">External URL Handoff</h3>
        <p class="text-xs text-text-tertiary m-0">
          <span class="font-mono">openUrl()</span> passes a URL to another app —
          <span class="font-mono">@wefterjs/browser</span> is for in-app tabs.
        </p>
      </div>
      <input
        v-model="externalUrl"
        type="text"
        placeholder="https://wefter.dev  ·  tel:+15551234567  ·  mailto:hi@wefter.dev"
        class="px-3 py-2 bg-surface-raised border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent font-mono"
      />
      <div class="flex gap-2">
        <button
          @click="checkCanOpen"
          class="flex-1 py-2.5 bg-surface-raised hover:bg-border-subtle text-text-secondary font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer border border-border-subtle"
        >
          <Icons name="SearchCheck" :size="16" />
          <span>canOpenUrl()</span>
        </button>
        <button
          @click="triggerOpenUrl"
          class="flex-1 py-2.5 bg-accent-subtle hover:bg-accent/20 text-accent font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <Icons name="ExternalLink" :size="16" />
          <span>openUrl()</span>
        </button>
      </div>
      <p v-if="canOpenResult !== null" class="text-[11px] text-text-tertiary m-0">
        <span class="font-mono">canOpenUrl</span> →
        <span class="font-bold" :class="canOpenResult ? 'text-success' : 'text-warning-text'">{{
          canOpenResult
        }}</span>
      </p>
    </div>

    <div class="p-4 bg-surface border border-border-subtle rounded-2xl flex flex-col gap-2">
      <h3 class="text-sm font-bold text-text-primary m-0">Memory Pressure</h3>
      <p class="text-xs text-text-tertiary m-0">
        Listening on <span class="font-mono">app:lowMemory</span>. Trigger it from a terminal with
        <span class="font-mono">adb shell am send-trim-memory {{ appId }} RUNNING_CRITICAL</span>.
      </p>
      <div
        v-if="lastLowMemory !== null"
        class="p-3 bg-surface-raised border border-border-subtle rounded-xl text-sm font-mono text-accent"
      >
        last level: {{ lastLowMemory }}
      </div>
    </div>

    <div class="p-4 bg-surface border border-border-subtle rounded-2xl flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-sm font-bold text-text-primary m-0">Hardware Back Button</h3>
          <p class="text-xs text-text-tertiary m-0">
            Android only — intercept the back press instead of quitting
          </p>
        </div>
        <button
          @click="toggleBackIntercept"
          class="px-3 py-1.5 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          :class="
            backIntercept
              ? 'bg-accent text-white'
              : 'bg-surface-raised text-text-secondary border border-border-subtle'
          "
        >
          {{ backIntercept ? 'Intercepting' : 'Off' }}
        </button>
      </div>
      <div
        v-if="lastBackButton"
        class="p-3 bg-surface-raised border border-border-subtle rounded-xl flex flex-col gap-1"
      >
        <span class="text-[11px] text-text-tertiary"
          >Last <span class="font-mono">app:backButton</span></span
        >
        <span class="text-sm font-mono text-accent">{{ lastBackButton }}</span>
      </div>
    </div>

    <div class="p-4 bg-surface border border-border-subtle rounded-2xl flex flex-col gap-4">
      <div>
        <h3 class="text-sm font-bold text-text-primary m-0">Process Control</h3>
        <p class="text-xs text-text-tertiary m-0">
          Android: minimize → background, exit → finish + kill process, relaunch → cold restart.
          iOS: <span class="font-mono">minimizeApp</span> /
          <span class="font-mono">relaunchApp</span> reject;
          <span class="font-mono">exitApp</span> calls <span class="font-mono">exit(0)</span>.
        </p>
      </div>
      <div class="flex flex-wrap gap-2">
        <button
          @click="triggerMinimize"
          class="flex-1 min-w-[8rem] py-2.5 bg-accent-subtle hover:bg-accent/20 text-accent font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <Icons name="Minimize2" :size="16" />
          <span>minimizeApp()</span>
        </button>
        <button
          @click="triggerRelaunch"
          class="flex-1 min-w-[8rem] py-2.5 bg-accent-subtle hover:bg-accent/20 text-accent font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <Icons name="RotateCcw" :size="16" />
          <span>relaunchApp()</span>
        </button>
        <button
          @click="triggerExit"
          class="flex-1 min-w-[8rem] py-2.5 bg-surface-raised hover:bg-danger-bg text-danger-text font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <Icons name="Power" :size="16" />
          <span>exitApp()</span>
        </button>
      </div>
    </div>

    <ShowcaseConsole :logs="logs" @clear="logs = []" />
  </ModulePage>
</template>

<script setup lang="ts">
/**
 * Demo of `@wefterjs/app`: app info, lifecycle state, opening URLs, minimise, relaunch and exit, low
 * memory warnings and Android back button interception. Also shows deep links, which come from
 * `@wefterjs/core`.
 */

import { computed, onMounted, onUnmounted, ref } from 'vue'
import {
  App,
  type AppInfo,
  type AppLifecycleState,
  type AppBackButtonEvent,
  type Subscription,
} from '@wefterjs/app'
import { getLaunchUrl, onDeepLink, type DeepLink, type DeepLinkSubscription } from '@wefterjs/core'
import ModulePage from '@/components/common/ModulePage.vue'
import ShowcaseConsole, { type LogItem } from '@/components/showcase/ShowcaseConsole.vue'
import Icons from '@/components/common/Icons.vue'

const info = ref<AppInfo | null>(null)
const phase = ref<AppLifecycleState>('active')
const launchUrl = ref<string | null>(null)
const lastDeepLink = ref<DeepLink | null>(null)
const lastBackButton = ref<string | null>(null)
const lastLowMemory = ref<number | null>(null)
/** Back button interception is on by default in the plugin. */
const backIntercept = ref(true)
const externalUrl = ref('https://wefter.dev')
const canOpenResult = ref<boolean | null>(null)
const logs = ref<LogItem[]>([])

const appId = computed(() => info.value?.id ?? '<package>')

/** App info as label and value pairs for display. */
const infoFields = computed(() => {
  const i = info.value
  if (!i) return []
  return [
    { label: 'name', value: i.name },
    { label: 'id', value: i.id },
    { label: 'version', value: i.version },
    { label: 'build', value: i.build },
    { label: 'debug', value: String(i.debug) },
    {
      label: 'firstInstallTime',
      value: i.firstInstallTime ? new Date(i.firstInstallTime).toLocaleString() : '—',
    },
    {
      label: 'lastUpdateTime',
      value: i.lastUpdateTime ? new Date(i.lastUpdateTime).toLocaleString() : '—',
    },
  ]
})

/** Current time, for log entries. */
function now() {
  return new Date().toLocaleTimeString()
}

/** Adds an entry to the result log. */
function log(method: string, status: 'success' | 'error', data: unknown) {
  logs.value.unshift({ method, status, data, timestamp: now() })
}

/** Loads the app's name, id, version and install times. */
async function loadInfo() {
  try {
    info.value = await App.getInfo()
    log('App.getInfo()', 'success', info.value)
  } catch (err: any) {
    log('App.getInfo()', 'error', { error: err?.message || String(err), code: err?.code })
  }
}

/** Loads the current lifecycle state. */
async function loadState() {
  try {
    const res = await App.getState()
    phase.value = res.state
    log('App.getState()', 'success', res)
  } catch (err: any) {
    log('App.getState()', 'error', { error: err?.message || String(err), code: err?.code })
  }
}

/** Loads the URL the app was launched with. */
async function loadLaunchUrl() {
  try {
    launchUrl.value = await getLaunchUrl()
    log('getLaunchUrl()', 'success', { url: launchUrl.value })
  } catch (err: any) {
    log('getLaunchUrl()', 'error', { error: err?.message || String(err), code: err?.code })
  }
}

/** Checks whether some app can open the entered URL. */
async function checkCanOpen() {
  try {
    canOpenResult.value = await App.canOpenUrl(externalUrl.value)
    log(`App.canOpenUrl('${externalUrl.value}')`, 'success', { value: canOpenResult.value })
  } catch (err: any) {
    log('App.canOpenUrl()', 'error', { error: err?.message || String(err), code: err?.code })
  }
}

/** Opens the entered URL in the app that handles it. */
async function triggerOpenUrl() {
  try {
    const res = await App.openUrl(externalUrl.value)
    log(`App.openUrl('${externalUrl.value}')`, 'success', res)
  } catch (err: any) {
    log('App.openUrl()', 'error', { error: err?.message || String(err), code: err?.code })
  }
}

/** Sends the app to the background. */
async function triggerMinimize() {
  try {
    log('App.minimizeApp()', 'success', await App.minimizeApp())
  } catch (err: any) {
    log('App.minimizeApp()', 'error', { error: err?.message || String(err), code: err?.code })
  }
}

/** Restarts the app. */
async function triggerRelaunch() {
  if (!confirm('relaunchApp() will kill and cold-restart the app. Continue?')) return
  try {
    log('App.relaunchApp()', 'success', await App.relaunchApp())
  } catch (err: any) {
    log('App.relaunchApp()', 'error', { error: err?.message || String(err), code: err?.code })
  }
}

/** Closes the app. */
async function triggerExit() {
  if (!confirm('exitApp() will terminate the app. Continue?')) return
  try {
    log('App.exitApp()', 'success', await App.exitApp())
  } catch (err: any) {
    log('App.exitApp()', 'error', { error: err?.message || String(err), code: err?.code })
  }
}

/** Turns Android back button interception on or off. */
async function toggleBackIntercept() {
  const next = !backIntercept.value
  try {
    await App.setBackButtonInterceptEnabled(next)
    backIntercept.value = next
    log(`App.setBackButtonInterceptEnabled(${next})`, 'success', { intercepting: next })
  } catch (err: any) {
    log('App.setBackButtonInterceptEnabled()', 'error', {
      error: err?.message || String(err),
      code: err?.code,
    })
  }
}

let stateSub: Subscription | null = null
let linkSub: DeepLinkSubscription | null = null
let memSub: Subscription | null = null
let backSub: Subscription | null = null

/**
 * Loads the app details and subscribes to every app event. With interception on, a back press goes back
 * in the page history when possible.
 */
onMounted(() => {
  void loadInfo()
  void loadState()
  void loadLaunchUrl()

  stateSub = App.onStateChange((state) => {
    phase.value = state.state
    log('app:stateChange', 'success', state)
  })
  linkSub = onDeepLink((link) => {
    lastDeepLink.value = link
    log('onDeepLink', 'success', link)
  })
  memSub = App.onLowMemory((event) => {
    lastLowMemory.value = event.level
    log('app:lowMemory', 'success', event)
  })
  backSub = App.onBackButton((event: AppBackButtonEvent) => {
    lastBackButton.value = `canGoBack: ${event.canGoBack}`
    log('app:backButton', 'success', event)
    if (event.canGoBack) history.back()
  })
})

/** Stops listening to app events. */
onUnmounted(() => {
  stateSub?.remove()
  linkSub?.remove()
  memSub?.remove()
  backSub?.remove()
})
</script>
