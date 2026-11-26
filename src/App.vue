<template>
  <RouterView />
</template>

<script setup lang="ts">
/** Root component: applies the saved theme and renders the current route. */

import { onMounted } from 'vue'
import { useApp } from '@/stores/Core/app'

const app = useApp()

/**
 * Applies the theme, then makes one request at start-up (its response is unused), which shows up in the
 * DevTools Network panel.
 */
onMounted(() => {
  app.initTheme()

  fetch('https://api.ipify.org?format=json')
    .then((response) => response.json())
    .then((data) => {})
})
</script>
