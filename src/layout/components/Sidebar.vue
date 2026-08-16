<template>
  <Transition name="fade">
    <div
      v-if="app.getSidebarStatus"
      class="fixed inset-0 z-30 bg-surface-overlay"
      @click="app.closeSidebar()"
    />
  </Transition>

  <Transition name="slide">
    <aside
      v-if="app.getSidebarStatus"
      class="fixed top-0 left-0 z-40 h-full w-72 flex flex-col bg-sidebar-bg border-r border-border-subtle shadow-2xl"
    >
      <div
        class="flex items-center gap-3 px-5 pb-6 border-b border-border-subtle shrink-0 top-offset"
      >
        <img
          :src="app.isDark ? '/Logo/Dark/Icon.svg' : '/Logo/Light/Icon.svg'"
          alt="Wefter"
          class="w-9 h-9 object-contain"
        />
        <div class="flex flex-col">
          <span class="text-base font-bold text-text-primary leading-tight">Wefter</span>
          <span class="text-xs text-text-tertiary">Framework {{ FRAMEWORK_VERSION }}</span>
        </div>
      </div>

      <nav class="flex-1 overflow-y-auto py-3 px-3 flex flex-col gap-0.5">
        <RouterLink
          v-for="item in navItems"
          :key="item.name"
          :to="item.route"
          custom
          v-slot="{ navigate }"
        >
          <button
            :class="[
              'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors duration-150 text-left cursor-pointer',
              $route.path === item.route
                ? 'bg-sidebar-item-active-bg text-sidebar-item-active-text'
                : 'text-sidebar-item-text hover:bg-sidebar-item-hover-bg hover:text-sidebar-item-hover-text',
            ]"
            @click="
              () => {
                navigate()
                app.closeSidebar()
              }
            "
          >
            <Icons :name="item.icon" :size="19" class="shrink-0" />
            <span>{{ item.name }}</span>
          </button>
        </RouterLink>
      </nav>

      <div class="px-5 py-4 border-t border-border-subtle shrink-0">
        <p class="text-xs text-text-muted text-center">Wefter Demo © 2025</p>
      </div>
    </aside>
  </Transition>
</template>

<script setup lang="ts">
import { useApp } from '@/stores/Core/app'
import { FRAMEWORK_VERSION } from '@/core/config'
import Icons from '@/components/common/Icons.vue'

const app = useApp()

const navItems = [
  { name: 'Home', icon: 'House', route: '/' },
  { name: 'Scanner', icon: 'ScanLine', route: '/scanner' },
  { name: 'Biometric', icon: 'Fingerprint', route: '/biometric' },
  { name: 'Browser', icon: 'Globe', route: '/browser' },
  { name: 'Clipboard', icon: 'Copy', route: '/clipboard' },
  { name: 'Device', icon: 'Smartphone', route: '/device' },
  { name: 'Dialog', icon: 'MessageSquare', route: '/dialog' },
  { name: 'FlashLight', icon: 'Flashlight', route: '/flashlight' },
  { name: 'Haptics', icon: 'Vibrate', route: '/haptics' },
  { name: 'Network', icon: 'Wifi', route: '/network' },
  { name: 'Screen', icon: 'Monitor', route: '/screen' },
  { name: 'Secure Storage', icon: 'ShieldCheck', route: '/secure-storage' },
  { name: 'Share', icon: 'Share2', route: '/share' },
]
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.22s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}
</style>
