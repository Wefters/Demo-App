<template>
  <section class="p-4 bg-surface border border-border-subtle rounded-2xl flex flex-col gap-4">
    <div class="flex items-start gap-3">
      <div
        class="w-9 h-9 flex items-center justify-center bg-accent-subtle text-accent rounded-xl shrink-0"
      >
        <Icons :name="icon" :size="18" />
      </div>
      <div class="flex flex-col gap-0.5 min-w-0">
        <h3 class="text-sm font-bold text-text-primary m-0">{{ title }}</h3>
        <p class="text-xs text-text-tertiary m-0 leading-relaxed">{{ desc }}</p>
      </div>
    </div>
    <slot />
  </section>
</template>

<script setup lang="ts">
/** One card of the Web APIs page: an icon, title and short description above the card's demo. */

import Icons from '@/components/common/Icons.vue'

defineProps<{
  icon: string
  title: string
  desc: string
}>()
</script>
