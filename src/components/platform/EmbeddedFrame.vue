<template>
  <WebCard
    icon="Frame"
    title="Site in an iframe"
    desc="exposeToFrames() lets the partner site call the methods listed for its origin and exchange events. It is allowed to load by frames.allow in wefter.config.json."
  >
    <iframe
      :src="PARTNER_URL"
      class="w-full rounded-xl border border-border-subtle bg-white"
      :style="{ height: `${height}px` }"
      title="Partner site"
    />
    <div class="grid grid-cols-2 gap-2">
      <button :class="secondaryButton" @click="sendTheme">
        <Icons name="Palette" :size="15" />
        <span>Send theme event</span>
      </button>
      <button :class="secondaryButton" @click="showConnections">
        <Icons name="Link" :size="15" />
        <span>Connected sites</span>
      </button>
    </div>
  </WebCard>
</template>

<script setup lang="ts">
/** An iframe with the partner site, talking to the app through `exposeToFrames()`. */

import { onBeforeUnmount, ref } from 'vue'
import { exposeToFrames } from '@wefterjs/core'
import Icons from '@/components/common/Icons.vue'
import WebCard from '@/components/web/WebCard.vue'
import { secondaryButton } from '@/components/web/buttons'
import { logSuccess } from './platformLog'
import { PARTNER_ORIGIN, PARTNER_URL } from './partner'

const height = ref(340)

const frames = exposeToFrames({
  [PARTNER_ORIGIN]: {
    getUser: (_args, { origin }) => {
      logSuccess('iframe → getUser', { origin })
      return { id: 42, name: 'Demo user' }
    },
  },
})

frames.on('hello', (data, { origin }) => logSuccess('iframe event hello', { origin, data }))
frames.on('resize', (data) => {
  const next = (data as { height?: number })?.height
  if (typeof next === 'number' && next > 0) height.value = Math.min(Math.max(next + 8, 240), 520)
})

function sendTheme() {
  const theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  frames.emit('theme', theme)
  logSuccess('frames.emit("theme")', { theme })
}

function showConnections() {
  logSuccess(
    'frames.connections()',
    frames.connections().map((c) => c.origin),
  )
}

onBeforeUnmount(() => frames.close())
</script>
