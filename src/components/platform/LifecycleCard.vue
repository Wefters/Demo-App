<template>
  <WebCard
    icon="Activity"
    title="Plugin lifecycle"
    desc="Plugins hear the app going to the background and coming back, and live as long as the app's screen. Leave the app and come back, then refresh."
  >
    <div
      class="px-3 py-2 bg-surface-raised rounded-xl text-xs font-mono text-text-primary break-all"
    >
      {{ events.length ? events.join(' → ') : 'No lifecycle events yet' }}
    </div>
    <button :class="secondaryButton" @click="refresh">Refresh</button>
  </WebCard>
</template>

<script setup lang="ts">
/** Shows the lifecycle callbacks the ErrorTest plugin received. */

import { onMounted, ref } from 'vue'
import { ErrorTest } from '@wefterjs/error-test'
import WebCard from '@/components/web/WebCard.vue'
import { secondaryButton } from '@/components/web/buttons'
import { logError, logSuccess } from './platformLog'

const events = ref<string[]>([])

async function refresh() {
  try {
    const log = await ErrorTest.lifecycleLog()
    events.value = log.events.slice(-8)
    logSuccess('ErrorTest.lifecycleLog', log)
  } catch (error) {
    logError('ErrorTest.lifecycleLog', error)
  }
}

onMounted(refresh)
</script>
