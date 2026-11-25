<template>
  <div class="min-h-full p-5 flex flex-col gap-4 max-w-3xl mx-auto">
    <div class="flex items-center gap-4 p-4 bg-surface border border-border-subtle rounded-2xl">
      <div
        class="w-13 h-13 flex items-center justify-center bg-accent-subtle text-accent rounded-xl shrink-0"
      >
        <Icons :name="icon" :size="28" />
      </div>
      <div class="flex flex-col gap-0.5">
        <h1 class="text-lg font-bold text-text-primary leading-tight m-0">{{ title }}</h1>
        <p class="text-xs text-text-tertiary m-0">{{ desc }}</p>
      </div>
    </div>

    <div
      class="flex items-start gap-3 p-4 bg-info-bg border border-info-border rounded-xl text-info-text text-xs leading-relaxed"
    >
      <Icons name="Info" :size="16" class="shrink-0 mt-0.5" />
      <span>{{ info }}</span>
    </div>

    <div v-if="features && features.length > 0" class="flex flex-col gap-1.5">
      <div
        v-for="feature in features"
        :key="feature"
        class="flex items-center gap-3 px-4 py-3 bg-surface border border-border-subtle rounded-xl text-sm text-text-secondary"
      >
        <Icons name="Check" :size="15" class="text-success shrink-0" />
        <span>{{ feature }}</span>
      </div>
    </div>

    <slot />
  </div>
</template>

<script setup lang="ts">
import Icons from '@/components/common/Icons.vue'

defineProps<{
  icon: string
  title: string
  desc: string
  info: string
  features?: string[]
}>()
</script>
