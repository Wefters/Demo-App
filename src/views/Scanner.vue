<template>
  <ModulePage
    icon="ScanLine"
    title="Camera Barcode & QR Code Scanner"
    desc="@wefterjs/scanner v0.0.1"
    info="High-performance CameraX and Google ML Kit powered 1D/2D scanner with continuous mode, photo picker decoding, zoom gestures, and vibration feedback."
  >
    <div class="p-4 bg-surface border border-border-subtle rounded-2xl flex flex-col gap-4">
      <h3 class="text-xs font-bold uppercase tracking-wider text-text-muted m-0">
        Camera Scan Configuration
      </h3>

      <div class="flex flex-col gap-3">
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-text-secondary">Scan Prompt</label>
          <input
            v-model="scanOptions.prompt"
            type="text"
            placeholder="Align QR code inside frame"
            class="px-3 py-2 bg-surface-raised border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-medium text-text-secondary">Accepted Barcode Formats</label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="fmt in availableFormats"
              :key="fmt"
              @click="toggleFormat(fmt)"
              class="px-2.5 py-1 text-xs font-mono rounded-lg transition-colors cursor-pointer border"
              :class="
                scanOptions.formats.includes(fmt)
                  ? 'bg-accent text-white border-accent'
                  : 'bg-surface-raised text-text-secondary border-border-subtle hover:bg-border-subtle'
              "
            >
              {{ fmt }}
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="flex flex-col gap-1">
            <label class="text-xs font-medium text-text-secondary">Initial Zoom Level</label>
            <div class="flex items-center gap-2">
              <input
                type="range"
                min="1"
                max="5"
                step="0.1"
                v-model.number="scanOptions.zoom"
                class="flex-1 accent-accent cursor-pointer"
              />
              <span class="text-xs font-mono text-accent font-bold">{{ scanOptions.zoom }}x</span>
            </div>
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-xs font-medium text-text-secondary"
              >Auto Timeout (Seconds, 0 = Never)</label
            >
            <input
              v-model.number="scanOptions.timeout"
              type="number"
              placeholder="0"
              class="px-3 py-2 bg-surface-raised border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
            />
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-xs font-medium text-text-secondary">Max Zoom Level</label>
            <input
              v-model.number="scanOptions.maxZoom"
              type="number"
              step="0.5"
              placeholder="5.0"
              class="px-3 py-2 bg-surface-raised border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
          <label class="flex items-center gap-2 text-xs text-text-secondary cursor-pointer">
            <input type="checkbox" v-model="scanOptions.continuous" class="rounded accent-accent" />
            <span>Continuous</span>
          </label>
          <label class="flex items-center gap-2 text-xs text-text-secondary cursor-pointer">
            <input
              type="checkbox"
              v-model="scanOptions.allowGallery"
              class="rounded accent-accent"
            />
            <span>Photo Gallery</span>
          </label>
          <label class="flex items-center gap-2 text-xs text-text-secondary cursor-pointer">
            <input type="checkbox" v-model="scanOptions.haptics" class="rounded accent-accent" />
            <span>Haptics</span>
          </label>
          <label class="flex items-center gap-2 text-xs text-text-secondary cursor-pointer">
            <input type="checkbox" v-model="scanOptions.focusOnTap" class="rounded accent-accent" />
            <span>Tap to Focus</span>
          </label>
          <label class="flex items-center gap-2 text-xs text-text-secondary cursor-pointer">
            <input
              type="checkbox"
              v-model="scanOptions.zoomControl"
              class="rounded accent-accent"
            />
            <span>Zoom Control</span>
          </label>
        </div>

        <div class="flex items-center gap-2 pt-2">
          <button
            @click="triggerScan"
            class="flex-1 py-3 bg-accent hover:bg-accent-bright text-white font-bold text-sm rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <Icons name="Camera" :size="18" />
            <span>Start Camera Scanner</span>
          </button>
          <button
            @click="triggerStop"
            class="px-4 py-3 bg-surface-raised hover:bg-danger-bg text-danger-text font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Icons name="Square" :size="16" />
            <span>Stop</span>
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="lastScannedCode"
      class="p-4 bg-success-bg/40 border border-success-border rounded-2xl flex flex-col gap-2"
    >
      <div class="flex items-center justify-between">
        <span
          class="text-xs font-bold text-success uppercase tracking-wider flex items-center gap-1.5"
        >
          <Icons name="CheckCircle2" :size="16" />
          Last Scanned Code
        </span>
        <button
          @click="copyCode(lastScannedCode.data)"
          class="px-2.5 py-1 bg-surface-raised hover:bg-border-subtle text-text-primary text-xs font-medium rounded-lg transition-colors cursor-pointer"
        >
          Copy Code
        </button>
      </div>
      <div class="p-3 bg-surface-raised rounded-xl font-mono text-xs text-text-primary break-all">
        {{ lastScannedCode.data }}
      </div>
      <div class="flex items-center justify-between text-[11px] text-text-tertiary">
        <span
          >Format: <strong class="text-accent uppercase">{{ lastScannedCode.format }}</strong></span
        >
        <span>Time: {{ lastScannedCode.timestamp }}</span>
      </div>
    </div>

    <EventLogger :events="events" @clear="events = []" />
    <ShowcaseConsole :logs="logs" @clear="logs = []" />
  </ModulePage>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { Scanner, type BarcodeFormat } from '@wefterjs/scanner'
import ModulePage from '@/components/common/ModulePage.vue'
import ShowcaseConsole, { type LogItem } from '@/components/showcase/ShowcaseConsole.vue'
import EventLogger, { type EventItem } from '@/components/showcase/EventLogger.vue'
import Icons from '@/components/common/Icons.vue'

const availableFormats: BarcodeFormat[] = [
  'qr',
  'ean13',
  'ean8',
  'code128',
  'code39',
  'upca',
  'upce',
  'all',
]

const scanOptions = reactive({
  prompt: 'Align QR or Barcode inside camera viewfinder',
  continuous: false,
  allowGallery: true,
  formats: ['qr', 'code128'] as BarcodeFormat[],
  haptics: true,
  zoom: 1.0,
  maxZoom: 5.0,
  zoomControl: true,
  focusOnTap: true,
  timeout: 0,
  id: 'scanner-demo-1',
})

const lastScannedCode = ref<{ data: string; format: string; timestamp: string } | null>(null)
const logs = ref<LogItem[]>([])
const events = ref<EventItem[]>([])
let codeSub: { remove: () => void } | null = null
let cancelSub: { remove: () => void } | null = null

function now() {
  return new Date().toLocaleTimeString()
}

function toggleFormat(fmt: BarcodeFormat) {
  if (fmt === 'all') {
    scanOptions.formats = ['all']
    return
  }
  const idx = scanOptions.formats.indexOf(fmt)
  if (idx > -1) {
    scanOptions.formats.splice(idx, 1)
  } else {
    scanOptions.formats = scanOptions.formats.filter((f) => f !== 'all')
    scanOptions.formats.push(fmt)
  }
}

function copyCode(code: string) {
  navigator.clipboard.writeText(code)
}

async function triggerScan() {
  try {
    const res = await Scanner.scan({
      prompt: scanOptions.prompt || undefined,
      continuous: scanOptions.continuous,
      allowGallery: scanOptions.allowGallery,
      formats: scanOptions.formats.length > 0 ? scanOptions.formats : undefined,
      haptics: scanOptions.haptics,
      zoom: scanOptions.zoom,
      maxZoom: scanOptions.maxZoom,
      zoomControl: scanOptions.zoomControl,
      focusOnTap: scanOptions.focusOnTap,
      timeout: scanOptions.timeout || undefined,
      id: scanOptions.id || undefined,
    })
    logs.value.unshift({
      method: 'Scanner.scan',
      status: 'success',
      data: res,
      timestamp: now(),
    })
  } catch (err: any) {
    logs.value.unshift({
      method: 'Scanner.scan',
      status: 'error',
      data: { error: err?.message || String(err) },
      timestamp: now(),
    })
  }
}

async function triggerStop() {
  try {
    const res = await Scanner.stop({
      id: scanOptions.id || undefined,
    })
    logs.value.unshift({
      method: 'Scanner.stop',
      status: 'success',
      data: res,
      timestamp: now(),
    })
  } catch (err: any) {
    logs.value.unshift({
      method: 'Scanner.stop',
      status: 'error',
      data: { error: err?.message || String(err) },
      timestamp: now(),
    })
  }
}

onMounted(() => {
  codeSub = Scanner.onCodeScanned((data) => {
    const timeStr = now()
    lastScannedCode.value = {
      data: data.data,
      format: data.format,
      timestamp: timeStr,
    }
    events.value.unshift({
      name: 'scanner:codeScanned',
      payload: data,
      timestamp: timeStr,
    })
  })

  cancelSub = Scanner.onCancelled((data) => {
    events.value.unshift({
      name: 'scanner:cancelled',
      payload: data,
      timestamp: now(),
    })
  })
})

onUnmounted(() => {
  codeSub?.remove()
  cancelSub?.remove()
})
</script>
