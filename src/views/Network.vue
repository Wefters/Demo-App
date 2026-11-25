<template>
  <ModulePage
    icon="Wifi"
    title="Network Plugin"
    desc="@wefterjs/network v0.0.2"
    info="Monitor real-time network connectivity status, transport types (Wi-Fi, Cellular, Ethernet, VPN), and status change events."
  >
    <!-- Connectivity Overview -->
    <div class="p-4 bg-surface border border-border-subtle rounded-2xl flex flex-col gap-3">
      <div class="flex items-center justify-between">
        <h3 class="text-xs font-bold uppercase tracking-wider text-text-muted m-0">
          Network Status
        </h3>
        <button
          @click="checkStatus"
          class="flex items-center gap-1.5 px-3 py-1.5 bg-accent-subtle hover:bg-accent/20 text-accent text-xs font-semibold rounded-xl transition-colors cursor-pointer"
        >
          <Icons name="RefreshCw" :size="14" />
          <span>Check Status</span>
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div
          class="p-3 bg-surface-raised border border-border-subtle rounded-xl flex flex-col gap-1"
        >
          <span class="text-[11px] text-text-tertiary">Connectivity State</span>
          <div class="flex items-center gap-2">
            <span
              class="w-2.5 h-2.5 rounded-full"
              :class="status?.connected ? 'bg-success animate-pulse' : 'bg-danger-bg'"
            />
            <span
              class="text-sm font-bold"
              :class="status?.connected ? 'text-success' : 'text-danger-text'"
            >
              {{ status ? (status.connected ? 'ONLINE' : 'OFFLINE') : 'CHECKING...' }}
            </span>
          </div>
        </div>

        <div
          class="p-3 bg-surface-raised border border-border-subtle rounded-xl flex flex-col gap-1"
        >
          <span class="text-[11px] text-text-tertiary">Connection Transport</span>
          <span class="text-sm font-bold text-accent font-mono uppercase">
            {{ status?.connectionType || 'UNKNOWN' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Event Listener Controls -->
    <div class="p-4 bg-surface border border-border-subtle rounded-2xl flex flex-col gap-3">
      <div class="flex items-center justify-between">
        <div class="flex flex-col gap-0.5">
          <h3 class="text-xs font-bold uppercase tracking-wider text-text-muted m-0">
            Real-Time Event Listener
          </h3>
          <span class="text-[11px] text-text-tertiary"
            >Listen for 'network:changed' events sent by native framework</span
          >
        </div>
        <span
          class="px-2.5 py-1 text-xs font-semibold rounded-full"
          :class="
            isListening
              ? 'bg-accent-subtle text-accent border border-accent/20'
              : 'bg-surface-raised text-text-muted'
          "
        >
          {{ isListening ? 'ACTIVE' : 'INACTIVE' }}
        </span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <button
          @click="toggleListener"
          class="py-2.5 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
          :class="
            isListening
              ? 'bg-danger-subtle hover:bg-danger-bg/40 text-danger-text'
              : 'bg-accent hover:bg-accent-bright text-white'
          "
        >
          <Icons :name="isListening ? 'WifiOff' : 'Radio'" :size="16" />
          <span>{{ isListening ? 'Stop Listening' : 'Start Listening' }}</span>
        </button>

        <button
          @click="simulateEvent"
          class="py-2.5 bg-surface-raised hover:bg-accent-subtle border border-border-subtle text-text-primary font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <Icons name="Activity" :size="16" />
          <span>Simulate Status Change</span>
        </button>
      </div>
    </div>

    <ShowcaseConsole :logs="logs" @clear="logs = []" />
  </ModulePage>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Network, type NetworkStatus } from '@wefterjs/network'
import ModulePage from '@/components/common/ModulePage.vue'
import ShowcaseConsole, { type LogItem } from '@/components/showcase/ShowcaseConsole.vue'
import Icons from '@/components/common/Icons.vue'

const status = ref<NetworkStatus | null>(null)
const isListening = ref(false)
const logs = ref<LogItem[]>([])
let listenerHandle: { remove: () => void } | null = null

function now() {
  return new Date().toLocaleTimeString()
}

async function checkStatus() {
  try {
    const res = await Network.getStatus()
    status.value = res
    logs.value.unshift({
      method: 'Network.getStatus',
      status: 'success',
      data: res,
      timestamp: now(),
    })
  } catch (err: any) {
    logs.value.unshift({
      method: 'Network.getStatus',
      status: 'error',
      data: { error: err?.message || String(err) },
      timestamp: now(),
    })
  }
}

function startListening() {
  if (listenerHandle) return
  listenerHandle = Network.onStatusChange((newStatus: NetworkStatus) => {
    status.value = newStatus
    logs.value.unshift({
      method: 'Network.onStatusChange',
      status: 'success',
      data: newStatus,
      timestamp: now(),
    })
  })
  isListening.value = true
  logs.value.unshift({
    method: 'Network.onStatusChange',
    status: 'success',
    data: { message: 'Subscribed to network status changes' },
    timestamp: now(),
  })
}

function stopListening() {
  if (listenerHandle) {
    listenerHandle.remove()
    listenerHandle = null
  }
  isListening.value = false
  logs.value.unshift({
    method: 'Network.onStatusChange',
    status: 'success',
    data: { message: 'Unsubscribed from network status changes' },
    timestamp: now(),
  })
}

function toggleListener() {
  if (isListening.value) {
    stopListening()
  } else {
    startListening()
  }
}

function simulateEvent() {
  const types: Array<NetworkStatus['connectionType']> = [
    'wifi',
    'cellular',
    'ethernet',
    'bluetooth',
    'vpn',
    'unknown',
    'none',
  ]
  const randomType = types[
    Math.floor(Math.random() * types.length)
  ] as NetworkStatus['connectionType']
  const simStatus: NetworkStatus = {
    connected: randomType !== 'none',
    connectionType: randomType,
  }
  status.value = simStatus
  logs.value.unshift({
    method: 'Simulated Network Change',
    status: 'success',
    data: simStatus,
    timestamp: now(),
  })
}

onMounted(() => {
  checkStatus()
  startListening()
})

onUnmounted(() => {
  stopListening()
})
</script>
