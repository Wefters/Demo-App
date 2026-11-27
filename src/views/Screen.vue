<template>
  <ModulePage
    icon="Monitor"
    title="Screen Plugin"
    desc="@wefterjs/screen v0.0.2"
    info="Control screen brightness levels, keep display awake during critical tasks, and query or lock orientation mode."
  >
    <div class="p-4 bg-surface border border-border-subtle rounded-2xl flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <h3 class="text-xs font-bold uppercase tracking-wider text-text-muted m-0">
          Screen Brightness
        </h3>
        <button
          @click="fetchBrightness"
          class="flex items-center gap-1.5 px-3 py-1.5 bg-accent-subtle hover:bg-accent/20 text-accent text-xs font-semibold rounded-xl transition-colors cursor-pointer"
        >
          <Icons name="RefreshCw" :size="14" />
          <span>Read Brightness</span>
        </button>
      </div>

      <div class="p-3 bg-surface-raised border border-border-subtle rounded-xl flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <span class="text-xs text-text-secondary font-medium">Level Value</span>
          <span class="text-sm font-bold text-accent font-mono">
            {{ Math.round(brightness * 100) }}% ({{ brightness.toFixed(2) }})
          </span>
        </div>

        <div class="flex items-center gap-3">
          <Icons name="Sun" :size="16" class="text-text-muted shrink-0" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            v-model.number="brightness"
            @input="updateBrightness"
            class="flex-1 accent-accent cursor-pointer"
          />
          <Icons name="SunMedium" :size="20" class="text-accent shrink-0" />
        </div>

        <div class="grid grid-cols-3 gap-2 pt-1">
          <button
            @click="setBrightnessLevel(0.25)"
            class="py-1.5 bg-surface border border-border-subtle hover:border-accent text-xs font-medium rounded-lg transition-colors cursor-pointer"
          >
            25%
          </button>
          <button
            @click="setBrightnessLevel(0.5)"
            class="py-1.5 bg-surface border border-border-subtle hover:border-accent text-xs font-medium rounded-lg transition-colors cursor-pointer"
          >
            50%
          </button>
          <button
            @click="setBrightnessLevel(1.0)"
            class="py-1.5 bg-surface border border-border-subtle hover:border-accent text-xs font-medium rounded-lg transition-colors cursor-pointer"
          >
            100%
          </button>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div class="p-4 bg-surface border border-border-subtle rounded-2xl flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <h3 class="text-xs font-bold uppercase tracking-wider text-text-muted m-0">
            Screen Wake Lock
          </h3>
          <span
            class="px-2 py-0.5 text-[11px] font-semibold rounded-full"
            :class="
              isAwake
                ? 'bg-success-bg text-success border border-success/20'
                : 'bg-surface-raised text-text-muted'
            "
          >
            {{ isAwake ? 'KEEP AWAKE ACTIVE' : 'SLEEP ALLOWED' }}
          </span>
        </div>

        <p class="text-xs text-text-tertiary m-0">
          Prevent display dimming or turning off automatically while app is active.
        </p>

        <div class="grid grid-cols-2 gap-2 pt-1">
          <button
            @click="enableKeepAwake"
            class="py-2.5 bg-accent hover:bg-accent-bright text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Icons name="Eye" :size="16" />
            <span>Keep Awake</span>
          </button>

          <button
            @click="enableAllowSleep"
            class="py-2.5 bg-surface-raised hover:bg-accent-subtle border border-border-subtle text-text-primary font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Icons name="Moon" :size="16" />
            <span>Allow Sleep</span>
          </button>
        </div>
      </div>

      <div class="p-4 bg-surface border border-border-subtle rounded-2xl flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <h3 class="text-xs font-bold uppercase tracking-wider text-text-muted m-0">
            Orientation
          </h3>
          <button
            @click="fetchOrientation"
            class="p-1 hover:bg-surface-raised rounded-lg text-accent cursor-pointer"
          >
            <Icons name="RefreshCw" :size="14" />
          </button>
        </div>

        <div
          class="p-2.5 bg-surface-raised border border-border-subtle rounded-xl flex items-center justify-between"
        >
          <span class="text-xs text-text-tertiary">Current</span>
          <span class="text-xs font-bold text-accent font-mono uppercase">{{ orientation }}</span>
        </div>

        <div class="flex items-center gap-1.5 pt-1">
          <select
            v-model="selectedOrientation"
            class="flex-1 px-2 py-2 bg-surface border border-border-subtle rounded-lg text-xs text-text-primary focus:outline-none focus:border-accent"
          >
            <option v-for="opt in lockableOrientations" :key="opt" :value="opt">{{ opt }}</option>
          </select>
          <button
            @click="lockOrientationMode(selectedOrientation)"
            class="px-3 py-2 bg-surface border border-border-subtle hover:border-accent text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Icons name="Lock" :size="14" />
            <span>Lock</span>
          </button>
          <button
            @click="unlockOrientationMode"
            class="px-3 py-2 bg-surface-raised border border-border-subtle hover:border-accent text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Icons name="Unlock" :size="14" />
            <span>Unlock</span>
          </button>
        </div>
      </div>
    </div>

    <ShowcaseConsole :logs="logs" @clear="logs = []" />
  </ModulePage>
</template>

<script setup lang="ts">
/** Demo of `@wefterjs/screen`: brightness, keep awake and orientation lock. */

import { ref, onMounted } from 'vue'
import { Screen, type LockableOrientation, type OrientationType } from '@wefterjs/screen'
import ModulePage from '@/components/common/ModulePage.vue'
import ShowcaseConsole, { type LogItem } from '@/components/showcase/ShowcaseConsole.vue'
import Icons from '@/components/common/Icons.vue'

const brightness = ref(1.0)
const isAwake = ref(false)
const orientation = ref<OrientationType | string>('PORTRAIT')
const logs = ref<LogItem[]>([])

const lockableOrientations: LockableOrientation[] = [
  'portrait',
  'portrait-primary',
  'portrait-secondary',
  'landscape',
  'landscape-primary',
  'landscape-secondary',
  'any',
]
const selectedOrientation = ref<LockableOrientation>('portrait')

/** Current time, for log entries. */
function now() {
  return new Date().toLocaleTimeString()
}

/** Loads the current brightness. */
async function fetchBrightness() {
  try {
    const res = await Screen.getBrightness()
    brightness.value = res.brightness
    logs.value.unshift({
      method: 'Screen.getBrightness',
      status: 'success',
      data: res,
      timestamp: now(),
    })
  } catch (err: any) {
    logs.value.unshift({
      method: 'Screen.getBrightness',
      status: 'error',
      data: { error: err?.message || String(err) },
      timestamp: now(),
    })
  }
}

/** Applies the brightness from the slider. */
async function updateBrightness() {
  try {
    const res = await Screen.setBrightness({ brightness: brightness.value })
    logs.value.unshift({
      method: 'Screen.setBrightness',
      status: 'success',
      data: res,
      timestamp: now(),
    })
  } catch (err: any) {
    logs.value.unshift({
      method: 'Screen.setBrightness',
      status: 'error',
      data: { error: err?.message || String(err) },
      timestamp: now(),
    })
  }
}

/** Applies a preset brightness. */
async function setBrightnessLevel(val: number) {
  brightness.value = val
  await updateBrightness()
}

/** Keeps the screen on. */
async function enableKeepAwake() {
  try {
    const res = await Screen.keepAwake()
    isAwake.value = true
    logs.value.unshift({
      method: 'Screen.keepAwake',
      status: 'success',
      data: res,
      timestamp: now(),
    })
  } catch (err: any) {
    logs.value.unshift({
      method: 'Screen.keepAwake',
      status: 'error',
      data: { error: err?.message || String(err) },
      timestamp: now(),
    })
  }
}

/** Lets the screen turn off again. */
async function enableAllowSleep() {
  try {
    const res = await Screen.allowSleep()
    isAwake.value = false
    logs.value.unshift({
      method: 'Screen.allowSleep',
      status: 'success',
      data: res,
      timestamp: now(),
    })
  } catch (err: any) {
    logs.value.unshift({
      method: 'Screen.allowSleep',
      status: 'error',
      data: { error: err?.message || String(err) },
      timestamp: now(),
    })
  }
}

/** Loads the current orientation. */
async function fetchOrientation() {
  try {
    const res = await Screen.getOrientation()
    orientation.value = res.type
    logs.value.unshift({
      method: 'Screen.getOrientation',
      status: 'success',
      data: res,
      timestamp: now(),
    })
  } catch (err: any) {
    logs.value.unshift({
      method: 'Screen.getOrientation',
      status: 'error',
      data: { error: err?.message || String(err) },
      timestamp: now(),
    })
  }
}

/** Locks the screen to `mode`. */
async function lockOrientationMode(mode: LockableOrientation) {
  try {
    const res = await Screen.lockOrientation({ orientation: mode })
    orientation.value = mode
    logs.value.unshift({
      method: 'Screen.lockOrientation',
      status: 'success',
      data: res,
      timestamp: now(),
    })
  } catch (err: any) {
    logs.value.unshift({
      method: 'Screen.lockOrientation',
      status: 'error',
      data: { error: err?.message || String(err) },
      timestamp: now(),
    })
  }
}

/** Unlocks the orientation. */
async function unlockOrientationMode() {
  try {
    const res = await Screen.unlockOrientation()
    await fetchOrientation()
    logs.value.unshift({
      method: 'Screen.unlockOrientation',
      status: 'success',
      data: res,
      timestamp: now(),
    })
  } catch (err: any) {
    logs.value.unshift({
      method: 'Screen.unlockOrientation',
      status: 'error',
      data: { error: err?.message || String(err) },
      timestamp: now(),
    })
  }
}

/** Loads brightness and orientation when the page opens. */
onMounted(() => {
  fetchBrightness()
  fetchOrientation()
})
</script>
