<template>
  <WebCard
    icon="PanelTop"
    title="Site in a web window"
    desc="openWebWindow() opens the partner site over the app, like React Native's WebView: it calls the app's methods, gets events and runs injected script. Links elsewhere open in the browser."
  >
    <div class="grid grid-cols-2 gap-2">
      <button :class="primaryButton" @click="open('sheet')">
        <Icons name="PanelBottom" :size="15" />
        <span>Open as sheet</span>
      </button>
      <button :class="secondaryButton" @click="open('fullscreen')">
        <Icons name="Maximize" :size="15" />
        <span>Open full screen</span>
      </button>
      <button :class="secondaryButton" :disabled="!win" @click="ping">
        <Icons name="Send" :size="15" />
        <span>Send ping</span>
      </button>
      <button :class="secondaryButton" :disabled="!win" @click="win?.close()">
        <Icons name="X" :size="15" />
        <span>Close from app</span>
      </button>
    </div>
  </WebCard>
</template>

<script setup lang="ts">
/** Opens the partner site in a web window and exchanges calls and events with it. */

import { ref, shallowRef } from 'vue'
import { openWebWindow, type WebWindow } from '@wefterjs/core'
import Icons from '@/components/common/Icons.vue'
import WebCard from '@/components/web/WebCard.vue'
import { primaryButton, secondaryButton } from '@/components/web/buttons'
import { logError, logSuccess } from './platformLog'
import { PARTNER_ORIGIN, PARTNER_URL } from './partner'

const win = shallowRef<WebWindow | null>(null)
const pings = ref(0)

async function open(presentation: 'sheet' | 'fullscreen') {
  try {
    const opened = await openWebWindow({
      url: PARTNER_URL,
      allowOrigins: [PARTNER_ORIGIN],
      presentation,
      toolbar: { title: 'Partner site', navigation: true },
      injectScript:
        "var b = document.getElementById('banner'); if (b) { b.textContent = 'Injected by the Wefter demo'; b.style.display = 'block'; }",
      methods: {
        getUser: (_args, { origin }) => {
          logSuccess('window → getUser', { origin })
          return { id: 42, name: 'Demo user' }
        },
      },
    })
    win.value = opened
    logSuccess('openWebWindow', { id: opened.id, presentation })
    opened.on('hello', (data) => logSuccess('window event hello', data))
    opened.on('load', (data) => {
      logSuccess('window load', data)
      opened.emit('ping', { n: 0, message: 'Welcome from the app' })
    })
    opened.on('navigation', (data) => logSuccess('window navigation', data))
    void opened.closed.then(({ reason }) => {
      logSuccess('window closed', { reason })
      if (win.value === opened) win.value = null
    })
  } catch (error) {
    logError('openWebWindow', error)
  }
}

function ping() {
  pings.value++
  win.value?.emit('ping', { n: pings.value })
  logSuccess('win.emit("ping")', { n: pings.value })
}
</script>
