<template>
  <header
    class="w-full px-5 py-4 flex items-center gap-4 bg-header-bg border-b border-header-border shrink-0 top-offset"
  >
    <button
      id="sidebar-toggle-btn"
      class="flex items-center justify-center w-8 h-8 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-raised transition-colors duration-150 cursor-pointer"
      @click="app.toggleSidebar()"
      aria-label="Toggle menu"
    >
      <Icons name="Menu" :size="20" />
    </button>

    <span class="flex-1 text-base font-semibold text-header-text tracking-tight truncate">
      {{ pageTitle }}
    </span>

    <button
      id="theme-toggle-btn"
      class="flex items-center justify-center w-8 h-8 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-raised transition-colors duration-150 cursor-pointer"
      @click="app.toggleTheme()"
      :aria-label="app.isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    >
      <Transition name="icon-swap" mode="out-in">
        <Icons v-if="app.isDark" key="sun" name="Sun" :size="19" />
        <Icons v-else key="moon" name="Moon" :size="19" />
      </Transition>
    </button>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useApp } from '@/stores/Core/app'
import Icons from '@/components/common/Icons.vue'

const app = useApp()
const route = useRoute()

const pageTitle = computed(() => (route.meta?.title as string) ?? 'Wefter')
</script>

<style scoped>
.icon-swap-enter-active,
.icon-swap-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}
.icon-swap-enter-from {
  opacity: 0;
  transform: rotate(-30deg) scale(0.8);
}
.icon-swap-leave-to {
  opacity: 0;
  transform: rotate(30deg) scale(0.8);
}
</style>
