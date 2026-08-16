<template>
  <ModulePage
    icon="Copy"
    title="Clipboard Plugin"
    desc="@wefterjs/clipboard v0.0.1"
    info="Read, write, and manage system clipboard data including text strings, URLs, and labels across platforms."
  >
    <!-- Quick Actions & Read Card -->
    <div class="p-4 bg-surface border border-border-subtle rounded-2xl flex flex-col gap-3">
      <div class="flex items-center justify-between">
        <h3 class="text-xs font-bold uppercase tracking-wider text-text-muted m-0">Clipboard Operations</h3>
        <div class="flex items-center gap-2">
          <button
            @click="readClipboard"
            class="flex items-center gap-1.5 px-3 py-1.5 bg-accent-subtle hover:bg-accent/20 text-accent text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            <Icons name="RefreshCw" :size="14" />
            <span>Read Clipboard</span>
          </button>
          <button
            @click="clearClipboard"
            class="flex items-center gap-1.5 px-3 py-1.5 bg-danger-subtle hover:bg-danger-bg/40 text-danger-text text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            <Icons name="Trash2" :size="14" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      <!-- Current Clipboard State -->
      <div class="p-3 bg-surface-raised border border-border-subtle rounded-xl flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <span class="text-[11px] text-text-tertiary">Current Content Type</span>
          <span class="text-xs font-bold text-accent font-mono uppercase">
            {{ lastReadType }}
          </span>
        </div>
        <div class="flex flex-col gap-1">
          <span class="text-[11px] text-text-tertiary">Clipboard Value</span>
          <div class="p-2.5 bg-surface border border-border-subtle rounded-lg text-xs font-mono text-text-primary break-all min-h-9 flex items-center">
            {{ lastReadValue || '(empty or unread)' }}
          </div>
        </div>
      </div>
    </div>

    <!-- Write Clipboard Form -->
    <div class="p-4 bg-surface border border-border-subtle rounded-2xl flex flex-col gap-4">
      <h3 class="text-xs font-bold uppercase tracking-wider text-text-muted m-0">Write to Clipboard</h3>

      <div class="flex flex-col gap-3">
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-text-secondary">Text Content</label>
          <input
            v-model="writeText"
            type="text"
            placeholder="Enter text to copy..."
            class="px-3 py-2 bg-surface-raised border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="flex flex-col gap-1">
            <label class="text-xs font-medium text-text-secondary">URL (Optional)</label>
            <input
              v-model="writeUrl"
              type="text"
              placeholder="https://example.com"
              class="px-3 py-2 bg-surface-raised border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
            />
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-xs font-medium text-text-secondary">Label (Optional)</label>
            <input
              v-model="writeLabel"
              type="text"
              placeholder="e.g. User Code"
              class="px-3 py-2 bg-surface-raised border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            @click="writeClipboard"
            :disabled="loading"
            class="py-2.5 bg-accent hover:bg-accent-bright text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Icons name="Copy" :size="16" />
            <span>Copy Text/URL</span>
          </button>
          <button
            @click="copyQuickSnippet('https://wefter.dev')"
            class="py-2.5 bg-surface-raised hover:bg-accent-subtle border border-border-subtle text-text-primary font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Icons name="Link" :size="16" />
            <span>Copy Demo URL</span>
          </button>
        </div>
      </div>
    </div>

    <ShowcaseConsole :logs="logs" @clear="logs = []" />
  </ModulePage>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Clipboard } from '@wefterjs/clipboard'
import ModulePage from '@/components/common/ModulePage.vue'
import ShowcaseConsole, { type LogItem } from '@/components/showcase/ShowcaseConsole.vue'
import Icons from '@/components/common/Icons.vue'

const loading = ref(false)
const lastReadValue = ref('')
const lastReadType = ref('UNKNOWN')
const writeText = ref('Hello from Wefter Framework!')
const writeUrl = ref('')
const writeLabel = ref('Wefter Note')
const logs = ref<LogItem[]>([])

function now() {
  return new Date().toLocaleTimeString()
}

async function readClipboard() {
  try {
    const res = await Clipboard.read()
    lastReadValue.value = res.value || res.string || ''
    lastReadType.value = res.type || 'string'
    logs.value.unshift({
      method: 'Clipboard.read',
      status: 'success',
      data: res,
      timestamp: now(),
    })
  } catch (err: any) {
    logs.value.unshift({
      method: 'Clipboard.read',
      status: 'error',
      data: { error: err?.message || String(err) },
      timestamp: now(),
    })
  }
}

async function writeClipboard() {
  loading.value = true
  try {
    const res = await Clipboard.write({
      string: writeText.value || undefined,
      url: writeUrl.value || undefined,
      label: writeLabel.value || undefined,
    })
    logs.value.unshift({
      method: 'Clipboard.write',
      status: 'success',
      data: res,
      timestamp: now(),
    })
    await readClipboard()
  } catch (err: any) {
    logs.value.unshift({
      method: 'Clipboard.write',
      status: 'error',
      data: { error: err?.message || String(err) },
      timestamp: now(),
    })
  } finally {
    loading.value = false
  }
}

async function copyQuickSnippet(val: string) {
  writeText.value = val
  writeUrl.value = val
  await writeClipboard()
}

async function clearClipboard() {
  try {
    const res = await Clipboard.clear()
    lastReadValue.value = ''
    lastReadType.value = 'empty'
    logs.value.unshift({
      method: 'Clipboard.clear',
      status: 'success',
      data: res,
      timestamp: now(),
    })
  } catch (err: any) {
    logs.value.unshift({
      method: 'Clipboard.clear',
      status: 'error',
      data: { error: err?.message || String(err) },
      timestamp: now(),
    })
  }
}

onMounted(() => {
  readClipboard()
})
</script>
