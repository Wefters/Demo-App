<template>
  <ModulePage
    icon="Database"
    title="Unencrypted Key-Value Storage"
    desc="@wefterjs/storage v0.0.1"
    info="Fast, unencrypted key-value store backed by Android SharedPreferences and iOS UserDefaults. Objects, arrays, and primitives are serialized to JSON automatically on the way in and parsed back into their original type on the way out."
  >
    <div class="p-4 bg-surface border border-border-subtle rounded-2xl flex flex-col gap-4">
      <h3 class="text-xs font-bold uppercase tracking-wider text-text-muted m-0">
        Typed Value Presets
      </h3>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="preset in presets"
          :key="preset.label"
          @click="applyPreset(preset)"
          class="px-3 py-1.5 bg-surface-raised hover:bg-border-subtle text-text-secondary text-xs font-mono rounded-xl transition-colors cursor-pointer border border-border-subtle flex items-center gap-1.5"
        >
          <Icons name="Braces" :size="13" class="text-accent" />
          <span>{{ preset.label }}</span>
        </button>
      </div>
    </div>

    <div class="p-4 bg-surface border border-border-subtle rounded-2xl flex flex-col gap-4">
      <div class="flex items-center gap-2">
        <div
          class="w-8 h-8 flex items-center justify-center bg-accent-subtle text-accent rounded-lg shrink-0"
        >
          <Icons name="Save" :size="18" />
        </div>
        <div>
          <h3 class="text-sm font-bold text-text-primary m-0">Set</h3>
          <p class="text-xs text-text-tertiary m-0">
            Value is parsed as JSON when valid, otherwise stored as a raw string
          </p>
        </div>
      </div>

      <div class="flex flex-col gap-3">
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-text-secondary">Key</label>
          <input
            v-model="setForm.key"
            type="text"
            placeholder="e.g. user_preferences"
            class="px-3 py-2 bg-surface-raised border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent font-mono"
          />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-text-secondary">Value</label>
          <textarea
            v-model="setForm.value"
            rows="4"
            placeholder='e.g. { "theme": "dark", "fontScale": 1.2 }'
            class="px-3 py-2 bg-surface-raised border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent font-mono"
          ></textarea>
          <span class="text-[11px] text-text-tertiary flex items-center gap-1.5">
            <Icons :name="parsePreview.ok ? 'CheckCircle2' : 'CircleSlash'" :size="12" />
            {{ parsePreview.label }}
          </span>
        </div>

        <button
          @click="triggerSet"
          class="w-full py-2.5 bg-accent hover:bg-accent-bright text-white font-bold text-xs rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          <Icons name="Save" :size="16" />
          <span>Set (Serialize &amp; Store)</span>
        </button>
      </div>
    </div>

    <div class="p-4 bg-surface border border-border-subtle rounded-2xl flex flex-col gap-4">
      <div class="flex items-center gap-2">
        <div
          class="w-8 h-8 flex items-center justify-center bg-accent-subtle text-accent rounded-lg shrink-0"
        >
          <Icons name="Download" :size="18" />
        </div>
        <div>
          <h3 class="text-sm font-bold text-text-primary m-0">Get</h3>
          <p class="text-xs text-text-tertiary m-0">Retrieve and deserialize a value by key</p>
        </div>
      </div>

      <div class="flex flex-col gap-3">
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-text-secondary">Key</label>
          <input
            v-model="getForm.key"
            type="text"
            placeholder="e.g. user_preferences"
            class="px-3 py-2 bg-surface-raised border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent font-mono"
          />
        </div>

        <button
          @click="triggerGet"
          class="w-full py-2.5 bg-accent-subtle hover:bg-accent/20 text-accent font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <Icons name="Download" :size="16" />
          <span>Get (Retrieve &amp; Parse)</span>
        </button>

        <div
          v-if="retrieved.done"
          class="mt-2 p-3 bg-surface-raised border border-border-subtle rounded-xl flex flex-col gap-2"
        >
          <div class="flex items-center justify-between">
            <span
              class="text-xs font-bold text-accent uppercase tracking-wider flex items-center gap-1.5"
            >
              <Icons name="KeyRound" :size="14" />
              Result (Key: {{ retrieved.key }})
            </span>
            <span
              class="px-2 py-0.5 bg-surface text-text-tertiary text-[10px] font-mono rounded-md border border-border-subtle"
            >
              typeof: {{ retrieved.type }}
            </span>
          </div>
          <pre
            v-if="retrieved.value !== null"
            class="m-0 p-2.5 bg-surface rounded-lg font-mono text-xs text-text-primary whitespace-pre-wrap break-all"
            >{{ retrieved.pretty }}</pre>
          <div
            v-else
            class="p-2.5 bg-warning-bg/40 text-warning-text rounded-lg text-xs font-medium"
          >
            Key "{{ retrieved.key }}" was not found — value is null.
          </div>
        </div>
      </div>
    </div>

    <div class="p-4 bg-surface border border-border-subtle rounded-2xl flex flex-col gap-4">
      <div class="flex items-center gap-2">
        <div
          class="w-8 h-8 flex items-center justify-center bg-danger-bg text-danger-text rounded-lg shrink-0"
        >
          <Icons name="Trash2" :size="18" />
        </div>
        <div>
          <h3 class="text-sm font-bold text-text-primary m-0">Remove</h3>
          <p class="text-xs text-text-tertiary m-0">Delete a single entry by key</p>
        </div>
      </div>

      <div class="flex flex-col gap-3">
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-text-secondary">Key</label>
          <input
            v-model="removeForm.key"
            type="text"
            placeholder="e.g. user_preferences"
            class="px-3 py-2 bg-surface-raised border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent font-mono"
          />
        </div>

        <button
          @click="triggerRemove"
          class="w-full py-2.5 bg-surface-raised hover:bg-danger-bg text-danger-text font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <Icons name="Trash2" :size="16" />
          <span>Remove</span>
        </button>
      </div>
    </div>

    <div class="p-4 bg-surface border border-border-subtle rounded-2xl flex flex-col gap-4">
      <div class="flex items-center gap-2">
        <div
          class="w-8 h-8 flex items-center justify-center bg-accent-subtle text-accent rounded-lg shrink-0"
        >
          <Icons name="List" :size="18" />
        </div>
        <div>
          <h3 class="text-sm font-bold text-text-primary m-0">Namespace</h3>
          <p class="text-xs text-text-tertiary m-0">
            List every key, or wipe the whole plugin namespace
          </p>
        </div>
      </div>

      <div class="flex gap-2">
        <button
          @click="triggerKeys"
          class="flex-1 py-2.5 bg-accent-subtle hover:bg-accent/20 text-accent font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <Icons name="List" :size="16" />
          <span>List Keys</span>
        </button>
        <button
          @click="triggerClear"
          class="flex-1 py-2.5 bg-surface-raised hover:bg-danger-bg text-danger-text font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <Icons name="Eraser" :size="16" />
          <span>Clear All</span>
        </button>
      </div>

      <div v-if="knownKeys !== null" class="flex flex-wrap gap-2">
        <span
          v-for="k in knownKeys"
          :key="k"
          class="px-2.5 py-1 bg-surface-raised text-text-secondary text-xs font-mono rounded-lg border border-border-subtle"
        >
          {{ k }}
        </span>
        <span v-if="knownKeys.length === 0" class="text-xs text-text-tertiary"
          >Namespace is empty.</span
        >
      </div>
    </div>

    <ShowcaseConsole :logs="logs" @clear="logs = []" />
  </ModulePage>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { Storage } from '@wefterjs/storage'
import ModulePage from '@/components/common/ModulePage.vue'
import ShowcaseConsole, { type LogItem } from '@/components/showcase/ShowcaseConsole.vue'
import Icons from '@/components/common/Icons.vue'

interface Preset {
  label: string
  key: string
  value: string
}

const OBJECT_SAMPLE = '{\n  "theme": "dark",\n  "fontScale": 1.2,\n  "beta": true\n}'

const presets: Preset[] = [
  { label: 'object', key: 'user_preferences', value: OBJECT_SAMPLE },
  { label: 'array', key: 'recent_searches', value: '["wefter", "storage", "plugin"]' },
  { label: 'number', key: 'launch_count', value: '42' },
  { label: 'boolean', key: 'onboarding_done', value: 'true' },
  { label: 'string', key: 'display_name', value: 'Ada Lovelace' },
]

const setForm = reactive({ key: 'user_preferences', value: OBJECT_SAMPLE })
const getForm = reactive({ key: 'user_preferences' })
const removeForm = reactive({ key: 'user_preferences' })

const retrieved = reactive<{
  done: boolean
  key: string
  value: unknown
  type: string
  pretty: string
}>({ done: false, key: '', value: null, type: 'undefined', pretty: '' })

const knownKeys = ref<string[] | null>(null)
const logs = ref<LogItem[]>([])

function now() {
  return new Date().toLocaleTimeString()
}

/** Parse the textarea as JSON, falling back to the raw string (mirrors what the plugin does). */
function parseValue(raw: string): unknown {
  try {
    return JSON.parse(raw)
  } catch {
    return raw
  }
}

const parsePreview = computed(() => {
  try {
    const parsed = JSON.parse(setForm.value)
    return { ok: true, label: `Parsed as JSON ${Array.isArray(parsed) ? 'array' : typeof parsed}` }
  } catch {
    return { ok: false, label: 'Not valid JSON — will be stored as a raw string' }
  }
})

function applyPreset(preset: Preset) {
  setForm.key = preset.key
  setForm.value = preset.value
  getForm.key = preset.key
  removeForm.key = preset.key
}

function log(method: string, status: 'success' | 'error', data: unknown) {
  logs.value.unshift({ method, status, data, timestamp: now() })
}

async function triggerSet() {
  if (!setForm.key) return
  const value = parseValue(setForm.value)
  try {
    const res = await Storage.set({ key: setForm.key, value })
    log(`Storage.set('${setForm.key}')`, 'success', { sent: value, result: res })
  } catch (err: any) {
    log(`Storage.set('${setForm.key}')`, 'error', {
      error: err?.message || String(err),
      code: err?.code,
    })
  }
}

async function triggerGet() {
  if (!getForm.key) return
  try {
    const res = await Storage.get({ key: getForm.key })
    retrieved.done = true
    retrieved.key = getForm.key
    retrieved.value = res.value
    retrieved.type =
      res.value === null ? 'null' : Array.isArray(res.value) ? 'array' : typeof res.value
    retrieved.pretty = JSON.stringify(res.value, null, 2)
    log(`Storage.get('${getForm.key}')`, 'success', res)
  } catch (err: any) {
    log(`Storage.get('${getForm.key}')`, 'error', {
      error: err?.message || String(err),
      code: err?.code,
    })
  }
}

async function triggerRemove() {
  if (!removeForm.key) return
  try {
    const res = await Storage.remove({ key: removeForm.key })
    if (retrieved.key === removeForm.key) retrieved.done = false
    log(`Storage.remove('${removeForm.key}')`, 'success', res)
  } catch (err: any) {
    log(`Storage.remove('${removeForm.key}')`, 'error', {
      error: err?.message || String(err),
      code: err?.code,
    })
  }
}

async function triggerKeys() {
  try {
    const res = await Storage.keys()
    knownKeys.value = res.keys
    log('Storage.keys()', 'success', res)
  } catch (err: any) {
    log('Storage.keys()', 'error', { error: err?.message || String(err), code: err?.code })
  }
}

async function triggerClear() {
  try {
    const res = await Storage.clear()
    knownKeys.value = []
    retrieved.done = false
    log('Storage.clear()', 'success', res)
  } catch (err: any) {
    log('Storage.clear()', 'error', { error: err?.message || String(err), code: err?.code })
  }
}
</script>
