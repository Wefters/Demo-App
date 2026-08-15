<template>
  <div class="min-h-full p-5 flex flex-col gap-4 max-w-3xl mx-auto">
    <div class="flex flex-col items-center py-8 gap-3 text-center">
      <img
        :src="app.isDark ? '/Logo/Dark/Icon.svg' : '/Logo/Light/Icon.svg'"
        alt="Wefter"
        class="w-14 h-14 object-contain"
      />
      <h1 class="text-3xl font-extrabold text-text-primary tracking-tight m-0">Wefter</h1>
      <p class="text-sm text-text-secondary m-0">Mobile Framework Control Panel</p>
      <span class="mt-1 px-3 py-1 bg-accent-subtle text-text-link border border-accent-muted rounded-full text-xs font-medium">
        Framework {{ FRAMEWORK_VERSION }}
      </span>
    </div>

    <div class="flex flex-col gap-2">
      <p class="text-xs font-semibold text-text-muted uppercase tracking-widest px-1 mb-1">Plugins & Modules</p>

      <button
        v-for="item in modules"
        :key="item.name"
        class="flex items-center gap-4 p-4 bg-surface border border-border-subtle rounded-2xl text-left transition-colors duration-150 active:bg-surface-raised cursor-pointer"
        @click="$router.push(item.route)"
      >
        <div class="w-10 h-10 flex items-center justify-center bg-accent-subtle text-accent rounded-xl shrink-0">
          <Icons :name="item.icon" :size="20" />
        </div>
        <div class="flex flex-col gap-0.5 flex-1 min-w-0">
          <span class="text-sm font-semibold text-text-primary">{{ item.name }}</span>
          <span class="text-xs text-text-tertiary">{{ item.desc }}</span>
        </div>
        <Icons name="ChevronRight" :size="16" class="text-text-muted shrink-0" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import Icons from '@/components/common/Icons.vue'
import { useApp } from '@/stores/Core/app'
import { FRAMEWORK_VERSION } from '@/core/config'

const app = useApp()

const modules = [
  { name: 'Scanner',        icon: 'ScanLine',      route: '/scanner',        desc: 'QR & barcode scanning' },
  { name: 'Biometric',      icon: 'Fingerprint',   route: '/biometric',      desc: 'Auth & fingerprint' },
  { name: 'Browser',        icon: 'Globe',         route: '/browser',        desc: 'In-app web browser' },
  { name: 'Dialog',         icon: 'MessageSquare', route: '/dialog',         desc: 'Native dialogs' },
  { name: 'FlashLight',     icon: 'Flashlight',    route: '/flashlight',     desc: 'Torch control' },
  { name: 'Haptics',        icon: 'Vibrate',       route: '/haptics',        desc: 'Haptic feedback' },
  { name: 'Secure Storage', icon: 'ShieldCheck',   route: '/secure-storage', desc: 'Encrypted key-value' },
]
</script>
