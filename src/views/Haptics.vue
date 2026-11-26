<template>
  <ModulePage
    icon="Vibrate"
    title="Haptic Feedback Engine"
    desc="@wefterjs/haptics v0.0.1"
    info="Physical haptic feedback engine supporting iOS Taptic Engine impact styles, Android Vibrator vibration patterns, notification haptics, and custom amplitude controls."
  >
    <div class="p-4 bg-surface border border-border-subtle rounded-2xl flex flex-col gap-3">
      <div class="flex items-center justify-between">
        <h3 class="text-xs font-bold uppercase tracking-wider text-text-muted m-0">
          Haptic Engine Status
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
          <span class="text-[11px] text-text-tertiary">Engine Available</span>
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
          <span class="text-[11px] text-text-tertiary">Amplitude Control</span>
          <span class="text-sm font-bold text-accent">
            {{ availability?.amplitudeControlSupported ? 'SUPPORTED' : 'STANDARD' }}
          </span>
        </div>
      </div>
    </div>

    <div class="p-4 bg-surface border border-border-subtle rounded-2xl flex flex-col gap-4">
      <h3 class="text-xs font-bold uppercase tracking-wider text-text-muted m-0">
        Impact Physical Feedback
      </h3>

      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between text-xs text-text-secondary">
          <span>Impact Intensity Override</span>
          <span class="font-mono text-accent font-bold"
            >{{ (impactIntensity * 100).toFixed(0) }}%</span
          >
        </div>
        <input
          type="range"
          min="0.1"
          max="1.0"
          step="0.05"
          v-model.number="impactIntensity"
          class="w-full accent-accent cursor-pointer"
        />
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <button
          v-for="style in impactStyles"
          :key="style"
          @click="triggerImpact(style)"
          class="py-2.5 px-3 bg-surface-raised hover:bg-border-subtle text-text-primary font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer capitalize"
        >
          <Icons name="Zap" :size="14" class="text-accent" />
          <span>{{ style }}</span>
        </button>
      </div>
    </div>

    <div class="p-4 bg-surface border border-border-subtle rounded-2xl flex flex-col gap-4">
      <h3 class="text-xs font-bold uppercase tracking-wider text-text-muted m-0">
        Notification & Selection Haptics
      </h3>
      <div class="grid grid-cols-1 sm:grid-cols-4 gap-2">
        <button
          @click="triggerNotification('success')"
          class="py-2.5 px-3 bg-success-bg/40 hover:bg-success-bg/70 text-success text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Icons name="CheckCircle2" :size="15" />
          <span>Success</span>
        </button>
        <button
          @click="triggerNotification('warning')"
          class="py-2.5 px-3 bg-warning-bg/40 hover:bg-warning-bg/70 text-warning-text text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Icons name="AlertTriangle" :size="15" />
          <span>Warning</span>
        </button>
        <button
          @click="triggerNotification('error')"
          class="py-2.5 px-3 bg-danger-bg/40 hover:bg-danger-bg/70 text-danger-text text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Icons name="XCircle" :size="15" />
          <span>Error</span>
        </button>
        <button
          @click="triggerSelection"
          class="py-2.5 px-3 bg-accent-subtle hover:bg-accent/20 text-accent text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Icons name="MousePointerClick" :size="15" />
          <span>Selection</span>
        </button>
      </div>
    </div>

    <div class="p-4 bg-surface border border-border-subtle rounded-2xl flex flex-col gap-4">
      <h3 class="text-xs font-bold uppercase tracking-wider text-text-muted m-0">
        Custom Vibration Pattern
      </h3>

      <div class="flex flex-col gap-3">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="flex flex-col gap-1">
            <label class="text-xs font-medium text-text-secondary">Vibration Duration (ms)</label>
            <input
              v-model.number="vibrateForm.duration"
              type="number"
              placeholder="300"
              class="px-3 py-2 bg-surface-raised border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
            />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs font-medium text-text-secondary">Amplitude (1 - 255)</label>
            <input
              v-model.number="vibrateForm.amplitude"
              type="number"
              placeholder="128"
              class="px-3 py-2 bg-surface-raised border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-text-secondary"
            >Pattern Sequence (Comma-separated ms)</label
          >
          <input
            v-model="vibrateForm.patternText"
            type="text"
            placeholder="0, 100, 100, 200, 100, 300"
            class="px-3 py-2 bg-surface-raised border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent font-mono"
          />
        </div>

        <label class="flex items-center gap-2 text-xs text-text-secondary cursor-pointer">
          <input type="checkbox" v-model="vibrateForm.repeat" class="rounded accent-accent" />
          <span>Repeat Continuous Vibration</span>
        </label>

        <div class="flex items-center gap-2 pt-1">
          <button
            @click="triggerVibrate"
            class="flex-1 py-2.5 bg-accent hover:bg-accent-bright text-white font-bold text-xs rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <Icons name="Vibrate" :size="16" />
            <span>Play Custom Vibration</span>
          </button>
          <button
            @click="triggerCancel"
            class="px-4 py-2.5 bg-surface-raised hover:bg-danger-bg text-danger-text font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Icons name="Square" :size="15" />
            <span>Cancel</span>
          </button>
        </div>
      </div>
    </div>

    <ShowcaseConsole :logs="logs" @clear="logs = []" />
  </ModulePage>
</template>

<script setup lang="ts">
/** Demo of `@wefterjs/haptics`: impacts, notifications, selection ticks and custom vibration patterns. */

import { ref, reactive, onMounted } from 'vue'
import {
  Haptics,
  type HapticsAvailability,
  type ImpactStyle,
  type NotificationType,
} from '@wefterjs/haptics'
import ModulePage from '@/components/common/ModulePage.vue'
import ShowcaseConsole, { type LogItem } from '@/components/showcase/ShowcaseConsole.vue'
import Icons from '@/components/common/Icons.vue'

const availability = ref<HapticsAvailability | null>(null)
const impactIntensity = ref(0.7)
const logs = ref<LogItem[]>([])

const impactStyles: ImpactStyle[] = ['light', 'soft', 'medium', 'rigid', 'heavy']

/** Duration, pattern, amplitude and repeat options for `Haptics.vibrate`. */
const vibrateForm = reactive({
  duration: 300,
  amplitude: 128,
  patternText: '0, 100, 100, 200, 100, 300',
  repeat: false,
})

/** Current time, for log entries. */
function now() {
  return new Date().toLocaleTimeString()
}

/** Checks whether haptics and amplitude control are supported. */
async function checkAvailability() {
  try {
    const res = await Haptics.isAvailable()
    availability.value = res
    logs.value.unshift({
      method: 'Haptics.isAvailable',
      status: 'success',
      data: res,
      timestamp: now(),
    })
  } catch (err: any) {
    logs.value.unshift({
      method: 'Haptics.isAvailable',
      status: 'error',
      data: { error: err?.message || String(err) },
      timestamp: now(),
    })
  }
}

/** Plays an impact of `style` at the chosen intensity. */
async function triggerImpact(style: ImpactStyle) {
  try {
    const res = await Haptics.impact({
      style,
      intensity: impactIntensity.value,
    })
    logs.value.unshift({
      method: `Haptics.impact(${style})`,
      status: 'success',
      data: res,
      timestamp: now(),
    })
  } catch (err: any) {
    logs.value.unshift({
      method: `Haptics.impact(${style})`,
      status: 'error',
      data: { error: err?.message || String(err) },
      timestamp: now(),
    })
  }
}

/** Plays notification feedback of `type`. */
async function triggerNotification(type: NotificationType) {
  try {
    const res = await Haptics.notification({ type })
    logs.value.unshift({
      method: `Haptics.notification(${type})`,
      status: 'success',
      data: res,
      timestamp: now(),
    })
  } catch (err: any) {
    logs.value.unshift({
      method: `Haptics.notification(${type})`,
      status: 'error',
      data: { error: err?.message || String(err) },
      timestamp: now(),
    })
  }
}

/** Plays a selection tick. */
async function triggerSelection() {
  try {
    const res = await Haptics.selection()
    logs.value.unshift({
      method: 'Haptics.selection',
      status: 'success',
      data: res,
      timestamp: now(),
    })
  } catch (err: any) {
    logs.value.unshift({
      method: 'Haptics.selection',
      status: 'error',
      data: { error: err?.message || String(err) },
      timestamp: now(),
    })
  }
}

/** Plays the configured vibration or pattern. */
async function triggerVibrate() {
  try {
    const patternArr = vibrateForm.patternText
      ? vibrateForm.patternText
          .split(',')
          .map((s) => parseInt(s.trim()))
          .filter((n) => !isNaN(n))
      : undefined

    const res = await Haptics.vibrate({
      duration: vibrateForm.duration || undefined,
      pattern: patternArr && patternArr.length > 0 ? patternArr : undefined,
      amplitude: vibrateForm.amplitude || undefined,
      repeat: vibrateForm.repeat,
    })
    logs.value.unshift({
      method: 'Haptics.vibrate',
      status: 'success',
      data: res,
      timestamp: now(),
    })
  } catch (err: any) {
    logs.value.unshift({
      method: 'Haptics.vibrate',
      status: 'error',
      data: { error: err?.message || String(err) },
      timestamp: now(),
    })
  }
}

/** Stops any vibration in progress. */
async function triggerCancel() {
  try {
    const res = await Haptics.cancel()
    logs.value.unshift({
      method: 'Haptics.cancel',
      status: 'success',
      data: res,
      timestamp: now(),
    })
  } catch (err: any) {
    logs.value.unshift({
      method: 'Haptics.cancel',
      status: 'error',
      data: { error: err?.message || String(err) },
      timestamp: now(),
    })
  }
}

/** Checks availability when the page opens. */
onMounted(() => {
  checkAvailability()
})
</script>
