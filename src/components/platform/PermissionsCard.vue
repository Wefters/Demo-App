<template>
  <WebCard
    icon="ShieldCheck"
    title="Permissions"
    desc="Every plugin reports permissions the same way: granted, prompt, denied (only Settings can change it) or limited. Shown here with the Scanner's camera."
  >
    <div class="px-3 py-2 bg-surface-raised rounded-xl text-xs flex justify-between">
      <span class="text-text-muted">Camera</span>
      <span class="font-mono text-text-primary">{{ state ?? '—' }}</span>
    </div>
    <div class="grid grid-cols-3 gap-2">
      <button :class="secondaryButton" @click="check">Check</button>
      <button :class="primaryButton" @click="request">Request</button>
      <button :class="secondaryButton" @click="settings">Settings</button>
    </div>
  </WebCard>
</template>

<script setup lang="ts">
/** `checkPermissions()`, `requestPermissions()` and `openAppSettings()`. */

import { onMounted, ref } from 'vue'
import { openAppSettings } from '@wefterjs/core'
import { Scanner } from '@wefterjs/scanner'
import WebCard from '@/components/web/WebCard.vue'
import { primaryButton, secondaryButton } from '@/components/web/buttons'
import { logError, logSuccess } from './platformLog'

const state = ref<string | null>(null)

async function check() {
  try {
    const status = await Scanner.checkPermissions()
    state.value = status.camera
    logSuccess('Scanner.checkPermissions', status)
  } catch (error) {
    logError('Scanner.checkPermissions', error)
  }
}

async function request() {
  try {
    const status = await Scanner.requestPermissions()
    state.value = status.camera
    logSuccess('Scanner.requestPermissions', status)
  } catch (error) {
    logError('Scanner.requestPermissions', error)
  }
}

async function settings() {
  try {
    await openAppSettings()
    logSuccess('openAppSettings', {})
  } catch (error) {
    logError('openAppSettings', error)
  }
}

onMounted(check)
</script>
