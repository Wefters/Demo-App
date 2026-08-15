<template>
  <div class="p-4 bg-surface border border-border-subtle rounded-2xl flex flex-col gap-3">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div class="w-2 h-2 rounded-full bg-success animate-pulse"></div>
        <Icons name="Radio" :size="16" class="text-accent" />
        <h3 class="text-xs font-bold uppercase tracking-wider text-text-muted m-0">Native Event Stream</h3>
      </div>
      <button
        v-if="events.length > 0"
        @click="$emit('clear')"
        class="px-2.5 py-1 bg-surface-raised hover:bg-danger-bg text-danger-text text-[11px] font-medium rounded-lg transition-colors cursor-pointer"
      >
        Clear Stream
      </button>
    </div>

    <div v-if="events.length === 0" class="py-4 text-center text-xs text-text-tertiary">
      Listening for native event broadcasts...
    </div>

    <div v-else class="flex flex-col gap-2 max-h-60 overflow-y-auto font-mono text-xs pr-1">
      <div
        v-for="(ev, idx) in events"
        :key="idx"
        class="p-3 bg-surface-raised border border-border-subtle rounded-xl flex flex-col gap-1 text-text-primary"
      >
        <div class="flex items-center justify-between text-[11px]">
          <span class="font-bold text-accent flex items-center gap-1.5">
            <Icons name="Zap" :size="13" />
            {{ ev.name }}
          </span>
          <span class="text-text-tertiary text-[10px]">{{ ev.timestamp }}</span>
        </div>
        <pre class="m-0 text-[11px] leading-relaxed whitespace-pre-wrap break-all text-text-secondary">{{ JSON.stringify(ev.payload, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Icons from '@/components/common/Icons.vue'

export interface EventItem {
  name: string
  payload: any
  timestamp: string
}

defineProps<{
  events: EventItem[]
}>()

defineEmits<{
  (e: 'clear'): void
}>()
</script>
