<template>
  <ModulePage
    icon="ShieldCheck"
    title="Encrypted Hardware Secure Storage"
    desc="@wefterjs/secure-storage v0.0.1"
    info="Hardware-backed encrypted key-value vault utilizing Android EncryptedSharedPreferences (AES-256 GCM) and iOS Keychain Services."
  >
    <div class="p-4 bg-surface border border-border-subtle rounded-2xl flex flex-col gap-4">
      <h3 class="text-xs font-bold uppercase tracking-wider text-text-muted m-0">Quick Preset Key Templates</h3>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="preset in presets"
          :key="preset.key"
          @click="applyPreset(preset)"
          class="px-3 py-1.5 bg-surface-raised hover:bg-border-subtle text-text-secondary text-xs font-mono rounded-xl transition-colors cursor-pointer border border-border-subtle flex items-center gap-1.5"
        >
          <Icons name="Key" :size="13" class="text-accent" />
          <span>{{ preset.key }}</span>
        </button>
      </div>
    </div>

    <div class="p-4 bg-surface border border-border-subtle rounded-2xl flex flex-col gap-4">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 flex items-center justify-center bg-accent-subtle text-accent rounded-lg shrink-0">
          <Icons name="Lock" :size="18" />
        </div>
        <div>
          <h3 class="text-sm font-bold text-text-primary m-0">Set Token</h3>
          <p class="text-xs text-text-tertiary m-0">Encrypt and store a secret key-value token in hardware vault</p>
        </div>
      </div>

      <div class="flex flex-col gap-3">
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-text-secondary">Token Key Name</label>
          <input
            v-model="setForm.key"
            type="text"
            placeholder="e.g. auth_access_token"
            class="px-3 py-2 bg-surface-raised border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent font-mono"
          />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-text-secondary">Token Payload to Encrypt</label>
          <textarea
            v-model="setForm.value"
            rows="3"
            placeholder="e.g. eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            class="px-3 py-2 bg-surface-raised border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent font-mono"
          ></textarea>
        </div>

        <button
          @click="triggerSet"
          class="w-full py-2.5 bg-accent hover:bg-accent-bright text-white font-bold text-xs rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          <Icons name="Lock" :size="16" />
          <span>Set Token (Encrypt & Store)</span>
        </button>
      </div>
    </div>

    <div class="p-4 bg-surface border border-border-subtle rounded-2xl flex flex-col gap-4">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 flex items-center justify-center bg-accent-subtle text-accent rounded-lg shrink-0">
          <Icons name="Unlock" :size="18" />
        </div>
        <div>
          <h3 class="text-sm font-bold text-text-primary m-0">Get Token</h3>
          <p class="text-xs text-text-tertiary m-0">Retrieve and decrypt a stored token using key name only</p>
        </div>
      </div>

      <div class="flex flex-col gap-3">
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-text-secondary">Token Key Name</label>
          <input
            v-model="getForm.key"
            type="text"
            placeholder="e.g. auth_access_token"
            class="px-3 py-2 bg-surface-raised border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent font-mono"
          />
        </div>

        <button
          @click="triggerGet"
          class="w-full py-2.5 bg-accent-subtle hover:bg-accent/20 text-accent font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <Icons name="Unlock" :size="16" />
          <span>Get Token (Retrieve & Decrypt)</span>
        </button>

        <div v-if="getRetrievedState !== null" class="mt-2 p-3 bg-surface-raised border border-border-subtle rounded-xl flex flex-col gap-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-accent uppercase tracking-wider flex items-center gap-1.5">
              <Icons name="KeyRound" :size="14" />
              Retrieved Result (Key: {{ getRetrievedKey }})
            </span>
            <button
              v-if="getRetrievedState"
              @click="copyValue(getRetrievedState)"
              class="px-2.5 py-1 bg-surface hover:bg-border-subtle text-text-primary text-xs font-medium rounded-lg transition-colors cursor-pointer"
            >
              Copy Value
            </button>
          </div>
          <div v-if="getRetrievedState" class="p-2.5 bg-surface rounded-lg font-mono text-xs text-text-primary break-all">
            {{ getRetrievedState }}
          </div>
          <div v-else class="p-2.5 bg-warning-bg/40 text-warning-text rounded-lg text-xs font-medium">
            Token key "{{ getRetrievedKey }}" was not found or is null.
          </div>
        </div>
      </div>
    </div>

    <div class="p-4 bg-surface border border-border-subtle rounded-2xl flex flex-col gap-4">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 flex items-center justify-center bg-danger-bg text-danger-text rounded-lg shrink-0">
          <Icons name="Trash2" :size="18" />
        </div>
        <div>
          <h3 class="text-sm font-bold text-text-primary m-0">Delete Token</h3>
          <p class="text-xs text-text-tertiary m-0">Permanently delete a stored token using key name only</p>
        </div>
      </div>

      <div class="flex flex-col gap-3">
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-text-secondary">Token Key Name</label>
          <input
            v-model="deleteForm.key"
            type="text"
            placeholder="e.g. auth_access_token"
            class="px-3 py-2 bg-surface-raised border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent font-mono"
          />
        </div>

        <button
          @click="triggerDelete"
          class="w-full py-2.5 bg-surface-raised hover:bg-danger-bg text-danger-text font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <Icons name="Trash2" :size="16" />
          <span>Delete Token (Remove)</span>
        </button>
      </div>
    </div>

    <ShowcaseConsole :logs="logs" @clear="logs = []" />
  </ModulePage>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { SecureStorage } from '@wefterjs/secure-storage'
import ModulePage from '@/components/common/ModulePage.vue'
import ShowcaseConsole, { type LogItem } from '@/components/showcase/ShowcaseConsole.vue'
import Icons from '@/components/common/Icons.vue'

const setForm = reactive({
  key: 'auth_access_token',
  value: 'sec_token_99a8b7c6d5e4f3a2b10_wefter_demo',
})

const getForm = reactive({
  key: 'auth_access_token',
})

const deleteForm = reactive({
  key: 'auth_access_token',
})

const presets = [
  { key: 'auth_access_token', value: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demo' },
  { key: 'user_refresh_token', value: 'ref_9876543210_secret_key_refresh' },
  { key: 'api_encryption_seed', value: '0x8f3c1a7d9e4b2a5c' },
  { key: 'biometric_session_id', value: 'bio_sess_2026_08_15_uuid_1a2b' },
]

const getRetrievedKey = ref('')
const getRetrievedState = ref<string | null>(null)
const logs = ref<LogItem[]>([])

function now() {
  return new Date().toLocaleTimeString()
}

function applyPreset(preset: { key: string; value: string }) {
  setForm.key = preset.key
  setForm.value = preset.value
  getForm.key = preset.key
  deleteForm.key = preset.key
}

function copyValue(val: string) {
  navigator.clipboard.writeText(val)
}

async function triggerSet() {
  if (!setForm.key) return
  try {
    const res = await SecureStorage.set({
      key: setForm.key,
      value: setForm.value,
    })
    logs.value.unshift({
      method: `SecureStorage.set('${setForm.key}')`,
      status: 'success',
      data: res,
      timestamp: now(),
    })
  } catch (err: any) {
    logs.value.unshift({
      method: `SecureStorage.set('${setForm.key}')`,
      status: 'error',
      data: { error: err?.message || String(err) },
      timestamp: now(),
    })
  }
}

async function triggerGet() {
  if (!getForm.key) return
  try {
    const res = await SecureStorage.get({
      key: getForm.key,
    })
    getRetrievedKey.value = getForm.key
    getRetrievedState.value = res.value
    logs.value.unshift({
      method: `SecureStorage.get('${getForm.key}')`,
      status: 'success',
      data: res,
      timestamp: now(),
    })
  } catch (err: any) {
    logs.value.unshift({
      method: `SecureStorage.get('${getForm.key}')`,
      status: 'error',
      data: { error: err?.message || String(err) },
      timestamp: now(),
    })
  }
}

async function triggerDelete() {
  if (!deleteForm.key) return
  try {
    const res = await SecureStorage.remove({
      key: deleteForm.key,
    })
    if (getRetrievedKey.value === deleteForm.key) {
      getRetrievedState.value = null
    }
    logs.value.unshift({
      method: `SecureStorage.remove('${deleteForm.key}')`,
      status: 'success',
      data: res,
      timestamp: now(),
    })
  } catch (err: any) {
    logs.value.unshift({
      method: `SecureStorage.remove('${deleteForm.key}')`,
      status: 'error',
      data: { error: err?.message || String(err) },
      timestamp: now(),
    })
  }
}
</script>
