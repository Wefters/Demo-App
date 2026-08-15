<template>
  <RouterView />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useApp } from '@/stores/Core/app'

const app = useApp()

onMounted(() => {
  app.initTheme()
})
</script>
