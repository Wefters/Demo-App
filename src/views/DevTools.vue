<template>
  <ModulePage
    icon="Wrench"
    title="Wefter Dev Tools"
    desc="Live bridge, console & network inspector"
    info="The dashboard below is served by the same Vite dev server this app runs on, over the HMR WebSocket. Open it full-screen for the best view, or trigger a native failure right here and watch it land live."
  >
    <div class="p-4 bg-surface border border-border-subtle rounded-2xl flex flex-col gap-3">
      <div class="flex items-center justify-between gap-3">
        <h3 class="text-xs font-bold uppercase tracking-wider text-text-muted m-0">Dashboard</h3>
        <a
          :href="dashboardUrl"
          target="_blank"
          rel="noopener"
          class="py-1.5 px-3 bg-accent-subtle hover:bg-accent-subtle/70 text-accent text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
        >
          <Icons name="ExternalLink" :size="13" />
          <span>Open full-screen</span>
        </a>
      </div>
      <div class="rounded-xl overflow-hidden border border-border-subtle" style="height: 480px">
        <iframe
          :src="dashboardUrl"
          title="Wefter Dev Tools"
          class="w-full h-full border-0"
        ></iframe>
      </div>
      <p class="text-[11px] text-text-tertiary m-0">
        <strong class="text-text-secondary">Plugin / Permission State tab:</strong> currently a stub
        in <code class="font-mono">packages/devtools/src/client/panels/plugin-state.ts</code> — it
        always renders "No native client connected yet." regardless of what's actually connected.
        There's nothing to configure on your side; it isn't wired up to real permission/plugin state
        yet. Say the word if you want it actually built.
      </p>
    </div>

    <div class="p-4 bg-surface border border-border-subtle rounded-2xl flex flex-col gap-4">
      <h3 class="text-xs font-bold uppercase tracking-wider text-text-muted m-0">
        Trigger console output
      </h3>
      <div class="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <button
          @click="fireConsole('log')"
          class="py-2.5 px-2 bg-surface-raised hover:bg-border-subtle text-text-primary text-xs font-bold rounded-xl transition-colors cursor-pointer"
        >
          console.log
        </button>
        <button
          @click="fireConsole('info')"
          class="py-2.5 px-2 bg-accent-subtle hover:bg-accent/20 text-accent text-xs font-bold rounded-xl transition-colors cursor-pointer"
        >
          console.info
        </button>
        <button
          @click="fireConsole('warn')"
          class="py-2.5 px-2 bg-warning-bg/40 hover:bg-warning-bg/70 text-warning-text text-xs font-bold rounded-xl transition-colors cursor-pointer"
        >
          console.warn
        </button>
        <button
          @click="fireConsole('error')"
          class="py-2.5 px-2 bg-danger-bg/40 hover:bg-danger-bg/70 text-danger-text text-xs font-bold rounded-xl transition-colors cursor-pointer"
        >
          console.error
        </button>
        <button
          @click="fireConsole('debug')"
          class="py-2.5 px-2 bg-surface-raised hover:bg-border-subtle text-text-secondary text-xs font-bold rounded-xl transition-colors cursor-pointer"
        >
          console.debug
        </button>
      </div>
      <p class="text-[11px] text-text-tertiary m-0">
        Each click calls the real <code class="font-mono">console.*</code> method — the patched
        console (<code class="font-mono">packages/core/src/internal/devtools/console-patch.ts</code
        >) mirrors it into the Console tab above, alongside your browser's own devtools console.
      </p>
    </div>

    <div class="p-4 bg-surface border border-border-subtle rounded-2xl flex flex-col gap-4">
      <h3 class="text-xs font-bold uppercase tracking-wider text-text-muted m-0">
        Trigger network calls
      </h3>
      <div class="grid grid-cols-3 sm:grid-cols-5 gap-2">
        <button
          v-for="code in statusCodes"
          :key="code"
          @click="fireStatus(code)"
          :disabled="pendingCode === code"
          class="py-2 px-2 text-xs font-mono font-bold rounded-xl transition-colors cursor-pointer border"
          :class="statusButtonClass(code)"
        >
          {{ code }}
        </button>
        <button
          @click="fireRandomStatus"
          class="py-2 px-2 bg-accent hover:bg-accent-bright text-white text-xs font-bold rounded-xl transition-colors cursor-pointer col-span-2 sm:col-span-1"
        >
          Random
        </button>
      </div>
      <p class="text-[11px] text-text-tertiary m-0">
        Hits <code class="font-mono">httpstat.us/&lt;code&gt;</code> (public, CORS-enabled, echoes
        back whatever status you ask for — no real backend behind it). The patched
        <code class="font-mono">fetch</code> (<code class="font-mono">network-patch.ts</code>) picks
        it up automatically into the Network tab above.
      </p>
    </div>

    <div class="p-4 bg-surface border border-border-subtle rounded-2xl flex flex-col gap-4">
      <h3 class="text-xs font-bold uppercase tracking-wider text-text-muted m-0">
        Trigger a native failure
      </h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <button
          @click="run('ping', () => ErrorTest.ping())"
          class="py-2.5 px-3 bg-success-bg/40 hover:bg-success-bg/70 text-success text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Icons name="CheckCircle2" :size="15" />
          <span>Ping (baseline success)</span>
        </button>
        <button
          @click="run('throwRuntime', () => ErrorTest.throwRuntime())"
          class="py-2.5 px-3 bg-danger-bg/40 hover:bg-danger-bg/70 text-danger-text text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Icons name="XCircle" :size="15" />
          <span>Throw RuntimeException</span>
        </button>
        <button
          @click="run('throwNullPointer', () => ErrorTest.throwNullPointer())"
          class="py-2.5 px-3 bg-danger-bg/40 hover:bg-danger-bg/70 text-danger-text text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Icons name="XCircle" :size="15" />
          <span>Throw NullPointerException</span>
        </button>
        <button
          @click="run('throwNested', () => ErrorTest.throwNested())"
          class="py-2.5 px-3 bg-danger-bg/40 hover:bg-danger-bg/70 text-danger-text text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Icons name="XCircle" :size="15" />
          <span>Throw nested (caused-by) exception</span>
        </button>
        <button
          @click="run('rejectWithCode', () => ErrorTest.rejectWithCode())"
          class="py-2.5 px-3 bg-warning-bg/40 hover:bg-warning-bg/70 text-warning-text text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Icons name="AlertTriangle" :size="15" />
          <span>Deliberate reject() call</span>
        </button>
      </div>
      <p class="text-[11px] text-text-tertiary m-0">
        Every call here also shows up in the Bridge Inspector above — on a debug native build, the
        failing ones carry a full native stack trace, not just the error message.
      </p>
    </div>

    <ShowcaseConsole :logs="logs" @clear="logs = []" />
  </ModulePage>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ErrorTest } from '@wefterjs/error-test'
import ModulePage from '@/components/common/ModulePage.vue'
import ShowcaseConsole, { type LogItem } from '@/components/showcase/ShowcaseConsole.vue'
import Icons from '@/components/common/Icons.vue'

const dashboardUrl = '/__wefter-devtools'
const logs = ref<LogItem[]>([])

const statusCodes = [200, 201, 301, 400, 401, 403, 404, 429, 500, 503]
const pendingCode = ref<number | null>(null)

function statusButtonClass(code: number): string {
  if (code < 300)
    return 'bg-success-bg/40 hover:bg-success-bg/70 text-success border-success-border/50'
  if (code < 400) return 'bg-accent-subtle hover:bg-accent/20 text-accent border-accent/20'
  if (code < 500)
    return 'bg-warning-bg/40 hover:bg-warning-bg/70 text-warning-text border-warning-border/50'
  return 'bg-danger-bg/40 hover:bg-danger-bg/70 text-danger-text border-danger-border/50'
}

function now() {
  return new Date().toLocaleTimeString()
}

function fireConsole(level: 'log' | 'info' | 'warn' | 'error' | 'debug') {
  const payload = { source: 'DevTools demo page', level, count: Math.floor(Math.random() * 100) }
  if (level === 'error') {
    console.error(
      `Demo ${level} entry`,
      new Error('Simulated error for devtools console panel'),
      payload,
    )
  } else {
    console[level](`Demo ${level} entry`, payload)
  }
}

async function fireStatus(code: number) {
  pendingCode.value = code
  const url = `https://httpbingo.org/status/${code}`
  try {
    const res = await fetch(url)
    console.log(`GET ${url} ->`, res.status, res.statusText)
  } catch (err: any) {
    console.error(`GET ${url} failed`, err?.message || String(err))
  } finally {
    pendingCode.value = null
  }
}

async function fireRandomStatus() {
  const code = statusCodes[Math.floor(Math.random() * statusCodes.length)]
  if (code) await fireStatus(code)
}

async function run(label: string, call: () => Promise<unknown>) {
  try {
    const res = await call()
    logs.value.unshift({
      method: `ErrorTest.${label}`,
      status: 'success',
      data: res,
      timestamp: now(),
    })
  } catch (err: any) {
    logs.value.unshift({
      method: `ErrorTest.${label}`,
      status: 'error',
      data: {
        code: err?.code,
        message: err?.message || String(err),
        nativeStack: err?.nativeStack,
      },
      timestamp: now(),
    })
  }
}
</script>
