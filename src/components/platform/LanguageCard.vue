<template>
  <WebCard
    icon="Languages"
    title="Languages"
    desc='The shell and plugins show their own text (dialogs, the scanner, "No app can open this link") in the phone&apos;s language, from the languages in localization.languages. Change the phone or app language and open a link no app handles.'
  >
    <div class="px-3 py-2 bg-surface-raised rounded-xl text-xs flex justify-between gap-3">
      <span class="text-text-muted">Phone languages</span>
      <span class="font-mono text-text-primary text-right">{{ languages }}</span>
    </div>
    <a href="unknown-scheme://nothing" :class="secondaryButton">Open a link no app handles</a>
    <button :class="secondaryButton" @click="confirmDialog">Show confirm()</button>
  </WebCard>
</template>

<script setup lang="ts">
/** Shows the phone's languages and triggers shell text to see it translated. */

import WebCard from '@/components/web/WebCard.vue'
import { secondaryButton } from '@/components/web/buttons'
import { logSuccess } from './platformLog'

const languages = navigator.languages.join(', ')

function confirmDialog() {
  logSuccess('confirm()', { answer: window.confirm('Buttons follow the app language') })
}
</script>
