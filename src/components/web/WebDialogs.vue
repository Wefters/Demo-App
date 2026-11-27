<template>
  <WebCard
    icon="MessageCircle"
    title="alert, confirm & prompt"
    desc="The browser's own dialogs, shown as native alerts. No plugin needed: existing web code just works."
  >
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
      <button :class="secondaryButton" @click="showAlert">
        <Icons name="Info" :size="15" />
        <span>alert()</span>
      </button>
      <button :class="secondaryButton" @click="showConfirm">
        <Icons name="Check" :size="15" />
        <span>confirm()</span>
      </button>
      <button :class="secondaryButton" @click="showPrompt">
        <Icons name="MessageSquareText" :size="15" />
        <span>prompt()</span>
      </button>
    </div>
    <p v-if="result" class="text-xs text-text-secondary m-0">
      Result: <span class="font-mono text-text-primary">{{ result }}</span>
    </p>
  </WebCard>
</template>

<script setup lang="ts">
/** Demo of `alert()`, `confirm()` and `prompt()`. */

import { ref } from 'vue'
import Icons from '@/components/common/Icons.vue'
import WebCard from './WebCard.vue'
import { secondaryButton } from './buttons'
import { logSuccess } from './webLog'

const result = ref('')

function showAlert() {
  window.alert('Hello from window.alert() 👋')
  result.value = 'alert closed'
  logSuccess('window.alert', { closed: true })
}

function showConfirm() {
  const confirmed = window.confirm('Delete the sample item?')
  result.value = `confirm → ${confirmed}`
  logSuccess('window.confirm', { confirmed })
}

function showPrompt() {
  const name = window.prompt('What should we call you?', 'Wefter fan')
  result.value = name === null ? 'prompt → cancelled (null)' : `prompt → "${name}"`
  logSuccess('window.prompt', { value: name })
}
</script>
