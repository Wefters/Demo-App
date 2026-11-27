<template>
  <WebCard
    icon="ShieldCheck"
    title="What this web view supports"
    desc="Checked live in this page. In a Wefter app each of these should be available."
  >
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
      <div
        v-for="check in checks"
        :key="check.name"
        class="flex items-center gap-2.5 px-3 py-2.5 bg-surface-raised rounded-xl text-xs"
      >
        <Icons
          :name="check.ok ? 'CircleCheck' : 'CircleX'"
          :size="16"
          :class="check.ok ? 'text-success shrink-0' : 'text-danger shrink-0'"
        />
        <span class="text-text-primary font-medium">{{ check.name }}</span>
        <span class="ml-auto text-text-muted font-mono text-[11px]">{{ check.api }}</span>
      </div>
    </div>
  </WebCard>
</template>

<script setup lang="ts">
/** Shows which standard web APIs the page can use, by trying each one. */

import { onMounted, ref } from 'vue'
import Icons from '@/components/common/Icons.vue'
import WebCard from './WebCard.vue'

interface Check {
  name: string
  api: string
  ok: boolean
}

const checks = ref<Check[]>([])

/** Whether a Web Storage area can be written to. */
function storageWorks(area: () => Storage | null): boolean {
  try {
    const storage = area()
    if (!storage) return false
    storage.setItem('__wefter_check', '1')
    storage.removeItem('__wefter_check')
    return true
  } catch {
    return false
  }
}

onMounted(() => {
  const doc = document as Document & { webkitFullscreenEnabled?: boolean }
  checks.value = [
    { name: 'Secure context', api: 'isSecureContext', ok: window.isSecureContext },
    { name: 'Local storage', api: 'localStorage', ok: storageWorks(() => window.localStorage) },
    {
      name: 'Session storage',
      api: 'sessionStorage',
      ok: storageWorks(() => window.sessionStorage),
    },
    { name: 'IndexedDB', api: 'indexedDB', ok: 'indexedDB' in window && !!window.indexedDB },
    {
      name: 'Camera & microphone',
      api: 'getUserMedia',
      ok: typeof navigator.mediaDevices?.getUserMedia === 'function',
    },
    { name: 'Location', api: 'geolocation', ok: 'geolocation' in navigator },
    { name: 'File picker', api: 'input[type=file]', ok: 'FileReader' in window },
    {
      name: 'Fullscreen video',
      api: 'requestFullscreen',
      ok:
        !!doc.fullscreenEnabled ||
        !!doc.webkitFullscreenEnabled ||
        'webkitEnterFullscreen' in HTMLVideoElement.prototype,
    },
  ]
})
</script>
