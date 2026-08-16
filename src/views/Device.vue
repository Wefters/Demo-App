<template>
  <ModulePage
    icon="Smartphone"
    title="Device Plugin"
    desc="@wefterjs/device v0.0.2"
    info="Fetch detailed hardware specifications, unique installation identifiers, battery telemetry, and locale preferences."
  >
    <!-- Device Information Grid -->
    <div class="p-4 bg-surface border border-border-subtle rounded-2xl flex flex-col gap-3">
      <div class="flex items-center justify-between">
        <h3 class="text-xs font-bold uppercase tracking-wider text-text-muted m-0">Hardware & OS Telemetry</h3>
        <button
          @click="refreshAll"
          class="flex items-center gap-1.5 px-3 py-1.5 bg-accent-subtle hover:bg-accent/20 text-accent text-xs font-semibold rounded-xl transition-colors cursor-pointer"
        >
          <Icons name="RefreshCw" :size="14" />
          <span>Refresh All</span>
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div class="p-3 bg-surface-raised border border-border-subtle rounded-xl flex flex-col gap-1">
          <span class="text-[11px] text-text-tertiary">Device Model</span>
          <span class="text-sm font-bold text-text-primary">{{ info?.model || 'Fetching...' }}</span>
        </div>

        <div class="p-3 bg-surface-raised border border-border-subtle rounded-xl flex flex-col gap-1">
          <span class="text-[11px] text-text-tertiary">Platform</span>
          <span class="text-sm font-bold text-accent font-mono uppercase">{{ info?.platform || 'UNKNOWN' }}</span>
        </div>

        <div class="p-3 bg-surface-raised border border-border-subtle rounded-xl flex flex-col gap-1">
          <span class="text-[11px] text-text-tertiary">Operating System</span>
          <span class="text-sm font-bold text-text-primary">
            {{ info?.operatingSystem || 'UNKNOWN' }} {{ info?.osVersion ? `v${info.osVersion}` : '' }}
          </span>
        </div>

        <div class="p-3 bg-surface-raised border border-border-subtle rounded-xl flex flex-col gap-1">
          <span class="text-[11px] text-text-tertiary">Manufacturer</span>
          <span class="text-sm font-bold text-text-primary">{{ info?.manufacturer || 'UNKNOWN' }}</span>
        </div>

        <div class="p-3 bg-surface-raised border border-border-subtle rounded-xl flex flex-col gap-1">
          <span class="text-[11px] text-text-tertiary">Virtual Environment</span>
          <span class="text-sm font-bold" :class="info?.isVirtual ? 'text-warning-text' : 'text-success'">
            {{ info ? (info.isVirtual ? 'SIMULATOR / EMULATOR' : 'PHYSICAL DEVICE') : 'CHECKING...' }}
          </span>
        </div>

        <div class="p-3 bg-surface-raised border border-border-subtle rounded-xl flex flex-col gap-1">
          <span class="text-[11px] text-text-tertiary">WebView Engine</span>
          <span class="text-xs font-mono text-text-secondary truncate">{{ info?.webViewVersion || 'Standard Web' }}</span>
        </div>
      </div>
    </div>

    <!-- Identifier & Battery Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <!-- Battery Status -->
      <div class="p-4 bg-surface border border-border-subtle rounded-2xl flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <h3 class="text-xs font-bold uppercase tracking-wider text-text-muted m-0">Battery Telemetry</h3>
            <span class="px-2 py-0.5 text-[10px] font-bold rounded-full bg-success/20 text-success border border-success/30 flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              Live Hook
            </span>
          </div>
          <Icons :name="battery?.isCharging ? 'Zap' : 'Battery'" :size="16" class="text-accent" />
        </div>
        <div class="p-3 bg-surface-raised border border-border-subtle rounded-xl flex flex-col gap-2">
          <div class="flex items-center justify-between">
            <span class="text-xs text-text-secondary">Battery Level</span>
            <span class="text-sm font-bold text-text-primary font-mono">
              {{ battery ? `${Math.round(battery.batteryLevel * 100)}%` : '--' }}
            </span>
          </div>
          <!-- Progress bar -->
          <div class="w-full h-2 bg-surface border border-border-subtle rounded-full overflow-hidden">
            <div
              class="h-full bg-accent transition-all duration-300"
              :style="{ width: `${battery ? Math.round(battery.batteryLevel * 100) : 0}%` }"
            />
          </div>
          <div class="flex items-center justify-between pt-1 text-[11px]">
            <span class="text-text-tertiary">Charging State</span>
            <span class="font-bold" :class="battery?.isCharging ? 'text-success' : 'text-text-muted'">
              {{ battery ? (battery.isCharging ? 'CHARGING' : 'DISCHARGING') : 'UNKNOWN' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Device ID & Locale -->
      <div class="p-4 bg-surface border border-border-subtle rounded-2xl flex flex-col gap-3">
        <h3 class="text-xs font-bold uppercase tracking-wider text-text-muted m-0">Identifier & Locale</h3>

        <div class="p-3 bg-surface-raised border border-border-subtle rounded-xl flex flex-col gap-1">
          <span class="text-[11px] text-text-tertiary">Device UUID</span>
          <span class="text-xs font-mono text-accent break-all">{{ deviceId?.uuid || 'FETCHING...' }}</span>
        </div>

        <div class="p-3 bg-surface-raised border border-border-subtle rounded-xl flex flex-col gap-1">
          <span class="text-[11px] text-text-tertiary">System Language Code</span>
          <span class="text-xs font-mono font-bold text-text-primary uppercase">{{ language?.value || 'FETCHING...' }}</span>
        </div>
      </div>
    </div>

    <ShowcaseConsole :logs="logs" @clear="logs = []" />
  </ModulePage>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Device, type DeviceInfo, type DeviceId, type BatteryInfo, type LanguageCode } from '@wefterjs/device'
import ModulePage from '@/components/common/ModulePage.vue'
import ShowcaseConsole, { type LogItem } from '@/components/showcase/ShowcaseConsole.vue'
import Icons from '@/components/common/Icons.vue'

const info = ref<DeviceInfo | null>(null)
const deviceId = ref<DeviceId | null>(null)
const battery = ref<BatteryInfo | null>(null)
const language = ref<LanguageCode | null>(null)
const logs = ref<LogItem[]>([])
const listenerHandle = ref<{ remove(): void } | null>(null)

function now() {
  return new Date().toLocaleTimeString()
}

async function refreshAll() {
  await Promise.all([
    fetchInfo(),
    fetchId(),
    fetchBattery(),
    fetchLanguage(),
  ])
}

async function fetchInfo() {
  try {
    const res = await Device.getInfo()
    info.value = res
    logs.value.unshift({
      method: 'Device.getInfo',
      status: 'success',
      data: res,
      timestamp: now(),
    })
  } catch (err: any) {
    logs.value.unshift({
      method: 'Device.getInfo',
      status: 'error',
      data: { error: err?.message || String(err) },
      timestamp: now(),
    })
  }
}

async function fetchId() {
  try {
    const res = await Device.getId()
    deviceId.value = res
    logs.value.unshift({
      method: 'Device.getId',
      status: 'success',
      data: res,
      timestamp: now(),
    })
  } catch (err: any) {
    logs.value.unshift({
      method: 'Device.getId',
      status: 'error',
      data: { error: err?.message || String(err) },
      timestamp: now(),
    })
  }
}

async function fetchBattery() {
  try {
    const res = await Device.getBatteryInfo()
    battery.value = res
    logs.value.unshift({
      method: 'Device.getBatteryInfo',
      status: 'success',
      data: res,
      timestamp: now(),
    })
  } catch (err: any) {
    logs.value.unshift({
      method: 'Device.getBatteryInfo',
      status: 'error',
      data: { error: err?.message || String(err) },
      timestamp: now(),
    })
  }
}

async function fetchLanguage() {
  try {
    const res = await Device.getLanguageCode()
    language.value = res
    logs.value.unshift({
      method: 'Device.getLanguageCode',
      status: 'success',
      data: res,
      timestamp: now(),
    })
  } catch (err: any) {
    logs.value.unshift({
      method: 'Device.getLanguageCode',
      status: 'error',
      data: { error: err?.message || String(err) },
      timestamp: now(),
    })
  }
}

onMounted(() => {
  refreshAll()

  // Subscribe to live battery charging status changes via device hook/event
  listenerHandle.value = Device.onChargingChange((status: BatteryInfo) => {
    battery.value = status
    logs.value.unshift({
      method: 'Device.onChargingChange (Hook)',
      status: 'success',
      data: status,
      timestamp: now(),
    })
  })
})

onUnmounted(() => {
  if (listenerHandle.value) {
    listenerHandle.value.remove()
  }
})
</script>
