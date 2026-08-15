<template>
  <ModulePage
    icon="Flashlight"
    title="Camera Torch & Flashlight"
    desc="@wefterjs/flash-light v0.0.2"
    info="Control native device rear camera flash LED with torch mode toggling, variable brightness strength levels, and state change listeners."
  >
    <div class="p-4 bg-surface border border-border-subtle rounded-2xl flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <h3 class="text-xs font-bold uppercase tracking-wider text-text-muted m-0">Torch Dashboard</h3>
        <button
          @click="checkAvailability"
          class="flex items-center gap-1.5 px-3 py-1.5 bg-accent-subtle hover:bg-accent/20 text-accent text-xs font-semibold rounded-xl transition-colors cursor-pointer"
        >
          <Icons name="RefreshCw" :size="14" />
          <span>Refresh State</span>
        </button>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div class="p-3 bg-surface-raised border border-border-subtle rounded-xl flex flex-col gap-1">
          <span class="text-[11px] text-text-tertiary">Torch Status</span>
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full" :class="state.on ? 'bg-warning shadow-[0_0_10px_#f59e0b]' : 'bg-text-tertiary'"></div>
            <span class="text-sm font-bold uppercase" :class="state.on ? 'text-warning' : 'text-text-secondary'">
              {{ state.on ? 'ACTIVE (ON)' : 'OFF' }}
            </span>
          </div>
        </div>

        <div class="p-3 bg-surface-raised border border-border-subtle rounded-xl flex flex-col gap-1">
          <span class="text-[11px] text-text-tertiary">Torch Strength</span>
          <span class="text-sm font-bold text-accent font-mono">
            {{ (state.level * 100).toFixed(0) }}%
          </span>
        </div>

        <div class="p-3 bg-surface-raised border border-border-subtle rounded-xl flex flex-col gap-1 col-span-2 sm:col-span-1">
          <span class="text-[11px] text-text-tertiary">Variable Strength</span>
          <span class="text-sm font-bold" :class="availability?.variableStrengthSupported ? 'text-success' : 'text-text-muted'">
            {{ availability?.variableStrengthSupported ? 'SUPPORTED' : 'FIXED ON/OFF' }}
          </span>
        </div>
      </div>

      <div class="flex flex-col gap-2 pt-2 border-t border-border-subtle">
        <div class="flex items-center justify-between text-xs text-text-secondary">
          <span class="font-medium">Brightness Strength Level</span>
          <span class="font-mono text-accent font-bold">{{ (targetLevel * 100).toFixed(0) }}%</span>
        </div>
        <input
          type="range"
          min="0.1"
          max="1.0"
          step="0.05"
          v-model.number="targetLevel"
          class="w-full accent-accent cursor-pointer"
        />
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
        <button
          @click="turnOn"
          class="py-2.5 bg-warning hover:bg-warning/80 text-black font-bold text-xs rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Icons name="Zap" :size="16" />
          <span>Turn ON</span>
        </button>
        <button
          @click="turnOff"
          class="py-2.5 bg-surface-raised hover:bg-border-subtle text-text-primary font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Icons name="Power" :size="16" />
          <span>Turn OFF</span>
        </button>
        <button
          @click="toggleTorch"
          class="py-2.5 bg-accent hover:bg-accent-bright text-white font-bold text-xs rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Icons name="ToggleLeft" :size="16" />
          <span>Toggle</span>
        </button>
        <button
          @click="fetchState"
          class="py-2.5 bg-accent-subtle hover:bg-accent/20 text-accent font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Icons name="Search" :size="16" />
          <span>Get State</span>
        </button>
      </div>
    </div>

    <EventLogger :events="events" @clear="events = []" />
    <ShowcaseConsole :logs="logs" @clear="logs = []" />
  </ModulePage>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { FlashLight, type FlashlightAvailability, type FlashlightState } from '@wefterjs/flash-light'
import ModulePage from '@/components/common/ModulePage.vue'
import ShowcaseConsole, { type LogItem } from '@/components/showcase/ShowcaseConsole.vue'
import EventLogger, { type EventItem } from '@/components/showcase/EventLogger.vue'
import Icons from '@/components/common/Icons.vue'

const availability = ref<FlashlightAvailability | null>(null)
const state = reactive<FlashlightState>({
  on: false,
  level: 1.0,
})

const targetLevel = ref(1.0)
const logs = ref<LogItem[]>([])
const events = ref<EventItem[]>([])
let changeSub: { remove: () => void } | null = null

function now() {
  return new Date().toLocaleTimeString()
}

async function checkAvailability() {
  try {
    const res = await FlashLight.isAvailable()
    availability.value = res
    await fetchState()
  } catch (err: any) {
    logs.value.unshift({
      method: 'FlashLight.isAvailable',
      status: 'error',
      data: { error: err?.message || String(err) },
      timestamp: now(),
    })
  }
}

async function fetchState() {
  try {
    const res = await FlashLight.getState()
    state.on = res.on
    state.level = res.level
    logs.value.unshift({
      method: 'FlashLight.getState',
      status: 'success',
      data: res,
      timestamp: now(),
    })
  } catch (err: any) {
    logs.value.unshift({
      method: 'FlashLight.getState',
      status: 'error',
      data: { error: err?.message || String(err) },
      timestamp: now(),
    })
  }
}

async function turnOn() {
  try {
    const res = await FlashLight.on({ level: targetLevel.value })
    state.on = res.on
    state.level = res.level
    logs.value.unshift({
      method: 'FlashLight.on',
      status: 'success',
      data: res,
      timestamp: now(),
    })
  } catch (err: any) {
    logs.value.unshift({
      method: 'FlashLight.on',
      status: 'error',
      data: { error: err?.message || String(err) },
      timestamp: now(),
    })
  }
}

async function turnOff() {
  try {
    const res = await FlashLight.off()
    state.on = res.on
    state.level = res.level
    logs.value.unshift({
      method: 'FlashLight.off',
      status: 'success',
      data: res,
      timestamp: now(),
    })
  } catch (err: any) {
    logs.value.unshift({
      method: 'FlashLight.off',
      status: 'error',
      data: { error: err?.message || String(err) },
      timestamp: now(),
    })
  }
}

async function toggleTorch() {
  try {
    const res = await FlashLight.toggle({ level: targetLevel.value })
    state.on = res.on
    state.level = res.level
    logs.value.unshift({
      method: 'FlashLight.toggle',
      status: 'success',
      data: res,
      timestamp: now(),
    })
  } catch (err: any) {
    logs.value.unshift({
      method: 'FlashLight.toggle',
      status: 'error',
      data: { error: err?.message || String(err) },
      timestamp: now(),
    })
  }
}

onMounted(() => {
  checkAvailability()
  changeSub = FlashLight.onChanged((data) => {
    state.on = data.on
    state.level = data.level
    events.value.unshift({
      name: 'flash-light:changed',
      payload: data,
      timestamp: now(),
    })
  })
})

onUnmounted(() => {
  changeSub?.remove()
})
</script>
