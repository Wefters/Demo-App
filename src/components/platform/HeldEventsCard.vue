<template>
  <WebCard
    icon="Inbox"
    title="Held events"
    desc="A plugin can hold an event until the page listens, so nothing is lost when it happens before the page is ready (a notification tap that launched the app). Here a test plugin sends one, and the page starts listening 3 seconds later."
  >
    <div class="px-3 py-2 bg-surface-raised rounded-xl text-xs flex justify-between">
      <span class="text-text-muted">Received</span>
      <span class="font-mono text-text-primary">{{ received }}</span>
    </div>
    <button :class="primaryButton" :disabled="waiting" @click="run">
      {{ waiting ? 'Waiting 3 s before listening…' : 'Send, then listen 3 s later' }}
    </button>
  </WebCard>
</template>

<script setup lang="ts">
/** Sends a held event with the ErrorTest plugin and registers the listener only afterwards. */

import { onBeforeUnmount, ref } from 'vue'
import { registerHook } from '@wefterjs/core'
import { ErrorTest } from '@wefterjs/error-test'
import WebCard from '@/components/web/WebCard.vue'
import { primaryButton } from '@/components/web/buttons'
import { logError, logSuccess } from './platformLog'

const received = ref(0)
const waiting = ref(false)
let subscription: { remove(): void } | null = null

async function run() {
  subscription?.remove()
  subscription = null
  waiting.value = true
  try {
    const sentAt = Date.now()
    await ErrorTest.holdEvent({ data: { sentAt } })
    logSuccess('ErrorTest.holdEvent', { sentAt })
    setTimeout(() => {
      waiting.value = false
      subscription = registerHook('errorTest:held', (data) => {
        received.value++
        logSuccess('errorTest:held received', { data, listenedAfterMs: Date.now() - sentAt })
      })
    }, 3000)
  } catch (error) {
    waiting.value = false
    logError('ErrorTest.holdEvent', error)
  }
}

onBeforeUnmount(() => subscription?.remove())
</script>
