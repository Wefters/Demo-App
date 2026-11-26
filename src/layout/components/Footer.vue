<template>
  <div class="bottom-0 w-full px-2 bg-bg-dots bottom-offset">
    <div class="w-[70%] flex justify-between items-center mx-auto">
      <RouterLink
        v-for="item in navItems"
        :key="item.name"
        :to="item.route"
        custom
        v-slot="{ navigate }"
      >
        <button
          class="flex flex-col justify-center items-center py-2 px-1 border-t-2"
          :class="
            $route.path === item.route
              ? 'text-accent-bright border-accent'
              : 'text-accent border-transparent'
          "
          @click="navigate"
        >
          <Icons :name="item.icon"></Icons>
          <div class="text-xs font-semibold">{{ item.name }}</div>
        </button>
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
/** Bottom navigation bar with the main sections. */

import Icons from '@/components/common/Icons.vue'

const navItems = [
  { name: 'Home', icon: 'House', route: '/' },
  { name: 'About', icon: 'Info', route: '/about' },
  { name: 'Links', icon: 'Link', route: '/links' },
]
</script>
