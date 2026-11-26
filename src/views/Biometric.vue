<template>
  <ModulePage
    icon="Fingerprint"
    title="Biometric Authentication"
    desc="@wefterjs/biometric v0.0.1"
    info="Hardware-backed biometric verification supporting Touch ID, Face ID, Optic ID, and Android BiometricPrompt with PIN fallback."
  >
    <div class="p-4 bg-surface border border-border-subtle rounded-2xl flex flex-col gap-3">
      <div class="flex items-center justify-between">
        <h3 class="text-xs font-bold uppercase tracking-wider text-text-muted m-0">
          Hardware Status
        </h3>
        <button
          @click="checkAvailability"
          class="flex items-center gap-1.5 px-3 py-1.5 bg-accent-subtle hover:bg-accent/20 text-accent text-xs font-semibold rounded-xl transition-colors cursor-pointer"
        >
          <Icons name="RefreshCw" :size="14" />
          <span>Check Status</span>
        </button>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div
          class="p-3 bg-surface-raised border border-border-subtle rounded-xl flex flex-col gap-1"
        >
          <span class="text-[11px] text-text-tertiary">Hardware Available</span>
          <span
            class="text-sm font-bold"
            :class="availability?.available ? 'text-success' : 'text-danger-text'"
          >
            {{
              availability ? (availability.available ? 'AVAILABLE' : 'UNAVAILABLE') : 'CHECKING...'
            }}
          </span>
        </div>
        <div
          class="p-3 bg-surface-raised border border-border-subtle rounded-xl flex flex-col gap-1"
        >
          <span class="text-[11px] text-text-tertiary">Biometry Type</span>
          <span class="text-sm font-bold text-accent font-mono uppercase">
            {{ availability?.biometryType || 'UNKNOWN' }}
          </span>
        </div>
      </div>

      <div
        v-if="availability?.message"
        class="p-3 bg-warning-bg border border-warning-border rounded-xl text-warning-text text-xs"
      >
        {{ availability.message }} (Code: {{ availability.code }})
      </div>

      <label class="flex items-center gap-2 text-xs text-text-secondary pt-1 cursor-pointer">
        <input
          type="checkbox"
          v-model="allowDeviceCredentialCheck"
          @change="checkAvailability"
          class="rounded accent-accent"
        />
        <span>Allow Device PIN/Password Fallback in Availability Check</span>
      </label>
    </div>

    <div class="p-4 bg-surface border border-border-subtle rounded-2xl flex flex-col gap-4">
      <h3 class="text-xs font-bold uppercase tracking-wider text-text-muted m-0">
        Authentication Options
      </h3>

      <div class="flex flex-col gap-3">
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-text-secondary">Prompt Title</label>
          <input
            v-model="authOptions.title"
            type="text"
            placeholder="e.g. Authenticate to Proceed"
            class="px-3 py-2 bg-surface-raised border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
          />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-text-secondary">Prompt Subtitle</label>
          <input
            v-model="authOptions.subtitle"
            type="text"
            placeholder="e.g. Confirm identity with fingerprint or Face ID"
            class="px-3 py-2 bg-surface-raised border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="flex flex-col gap-1">
            <label class="text-xs font-medium text-text-secondary">Cancel Button Label</label>
            <input
              v-model="authOptions.cancelText"
              type="text"
              placeholder="Cancel"
              class="px-3 py-2 bg-surface-raised border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
            />
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-xs font-medium text-text-secondary">Timeout (ms)</label>
            <input
              v-model.number="authOptions.timeoutMs"
              type="number"
              placeholder="30000"
              class="px-3 py-2 bg-surface-raised border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        <label class="flex items-center gap-2 text-xs text-text-secondary cursor-pointer">
          <input
            type="checkbox"
            v-model="authOptions.allowDeviceCredential"
            class="rounded accent-accent"
          />
          <span>Allow Device Passcode / PIN Fallback</span>
        </label>

        <button
          @click="triggerAuth"
          :disabled="loading"
          class="w-full py-3 bg-accent hover:bg-accent-bright text-white font-bold text-sm rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          <Icons name="Fingerprint" :size="18" />
          <span>{{ loading ? 'Authenticating...' : 'Trigger Biometric Auth' }}</span>
        </button>
      </div>
    </div>

    <ShowcaseConsole :logs="logs" @clear="logs = []" />
  </ModulePage>
</template>

<script setup lang="ts">
/**
 * Demo of `@wefterjs/biometric`: checks what authentication the device supports and runs the system
 * prompt with configurable text and fallback.
 */

import { ref, reactive, onMounted } from 'vue'
import { Biometric, type BiometricAvailability } from '@wefterjs/biometric'
import ModulePage from '@/components/common/ModulePage.vue'
import ShowcaseConsole, { type LogItem } from '@/components/showcase/ShowcaseConsole.vue'
import Icons from '@/components/common/Icons.vue'

const availability = ref<BiometricAvailability | null>(null)
const allowDeviceCredentialCheck = ref(true)
const loading = ref(false)
const logs = ref<LogItem[]>([])

/** Options passed to `Biometric.authenticate`. */
const authOptions = reactive({
  title: 'Authenticate',
  subtitle: 'Verify your identity to complete operation',
  cancelText: 'Cancel',
  allowDeviceCredential: true,
  timeoutMs: 30000,
})

/** Current time, for log entries. */
function now() {
  return new Date().toLocaleTimeString()
}

/** Checks whether biometric (or passcode) authentication can be used. */
async function checkAvailability() {
  try {
    const res = await Biometric.isAvailable({
      allowDeviceCredential: allowDeviceCredentialCheck.value,
    })
    availability.value = res
    logs.value.unshift({
      method: 'Biometric.isAvailable',
      status: 'success',
      data: res,
      timestamp: now(),
    })
  } catch (err: any) {
    logs.value.unshift({
      method: 'Biometric.isAvailable',
      status: 'error',
      data: { error: err?.message || String(err) },
      timestamp: now(),
    })
  }
}

/** Shows the authentication prompt and logs the outcome. */
async function triggerAuth() {
  loading.value = true
  try {
    const res = await Biometric.authenticate({
      title: authOptions.title || undefined,
      subtitle: authOptions.subtitle || undefined,
      cancelText: authOptions.cancelText || undefined,
      allowDeviceCredential: authOptions.allowDeviceCredential,
      timeoutMs: authOptions.timeoutMs || undefined,
    })
    logs.value.unshift({
      method: 'Biometric.authenticate',
      status: 'success',
      data: res,
      timestamp: now(),
    })
  } catch (err: any) {
    logs.value.unshift({
      method: 'Biometric.authenticate',
      status: 'error',
      data: { error: err?.message || String(err) },
      timestamp: now(),
    })
  } finally {
    loading.value = false
  }
}

/** Checks availability when the page opens. */
onMounted(() => {
  checkAvailability()
})
</script>
