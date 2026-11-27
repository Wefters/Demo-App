<template>
  <WebCard
    icon="Download"
    title="Downloads"
    desc="<a download> links save files: to Downloads on Android, through the Save to Files sheet on iOS. Files made in the page work too."
  >
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
      <button :class="secondaryButton" @click="downloadText">
        <Icons name="FileText" :size="15" />
        <span>Text file (Blob)</span>
      </button>
      <a
        :href="csvUrl"
        download="wefter-report.csv"
        :class="secondaryButton"
        @click="logLink('CSV (data: URL)')"
      >
        <Icons name="Sheet" :size="15" />
        <span>CSV (data: URL)</span>
      </a>
      <button :class="secondaryButton" @click="downloadCanvas">
        <Icons name="Image" :size="15" />
        <span>Drawing (canvas PNG)</span>
      </button>
      <a
        href="/Logo/Light/Icon.png"
        download="wefter-icon.png"
        :class="secondaryButton"
        @click="logLink('App file')"
      >
        <Icons name="FileDown" :size="15" />
        <span>Bundled app file</span>
      </a>
    </div>
  </WebCard>
</template>

<script setup lang="ts">
/** Demo of downloads: a Blob saved from script, a data: URL, a canvas drawing and a bundled file. */

import Icons from '@/components/common/Icons.vue'
import WebCard from './WebCard.vue'
import { secondaryButton } from './buttons'
import { logSuccess } from './webLog'

const csvRows = [
  ['plugin', 'platform', 'status'],
  ['camera', 'android', 'ok'],
  ['camera', 'ios', 'ok'],
  ['downloads', 'both', 'ok'],
]
const csvUrl = `data:text/csv;charset=utf-8,${encodeURIComponent(csvRows.map((row) => row.join(',')).join('\n'))}`

/** Clicks a link that is never added to the page, as download helpers in many libraries do. */
function saveBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = name
  link.click()
  URL.revokeObjectURL(url)
  logSuccess('download', { name, type: blob.type, size: blob.size })
}

function downloadText() {
  const text = `Saved from a Wefter app on ${new Date().toLocaleString()}.\n\nThis file was made in the page with new Blob().\n`
  saveBlob(new Blob([text], { type: 'text/plain' }), 'wefter-note.txt')
}

function downloadCanvas() {
  const canvas = document.createElement('canvas')
  canvas.width = 480
  canvas.height = 270
  const ctx = canvas.getContext('2d')!
  const gradient = ctx.createLinearGradient(0, 0, 480, 270)
  gradient.addColorStop(0, '#4f46e5')
  gradient.addColorStop(1, '#06b6d4')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 480, 270)
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 36px system-ui, sans-serif'
  ctx.fillText('Made in Wefter', 40, 120)
  ctx.font = '20px system-ui, sans-serif'
  ctx.fillText(new Date().toLocaleString(), 40, 165)
  canvas.toBlob((blob) => blob && saveBlob(blob, 'wefter-drawing.png'), 'image/png')
}

function logLink(kind: string) {
  logSuccess('download', { kind })
}
</script>
