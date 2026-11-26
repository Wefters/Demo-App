<template>
  <div class="p-4 bg-surface border border-border-subtle rounded-2xl flex flex-col gap-3">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <Icons name="Terminal" :size="16" class="text-accent" />
        <h3 class="text-xs font-bold uppercase tracking-wider text-text-muted m-0">
          Output Console
        </h3>
      </div>
      <div class="flex items-center gap-1">
        <button
          v-if="logs.length > 0"
          @click="copyLogs"
          class="px-2.5 py-1 bg-surface-raised hover:bg-border-subtle text-text-secondary text-[11px] font-medium rounded-lg transition-colors cursor-pointer"
        >
          {{ copied ? 'Copied!' : 'Copy' }}
        </button>
        <button
          v-if="logs.length > 0"
          @click="$emit('clear')"
          class="px-2.5 py-1 bg-surface-raised hover:bg-danger-bg text-danger-text text-[11px] font-medium rounded-lg transition-colors cursor-pointer"
        >
          Clear
        </button>
      </div>
    </div>

    <div v-if="logs.length === 0" class="py-6 text-center text-xs text-text-tertiary">
      No operations executed yet. Trigger an action above to inspect output.
    </div>

    <div v-else class="flex flex-col gap-2 max-h-72 overflow-y-auto font-mono text-xs pr-1">
      <div
        v-for="(log, idx) in logs"
        :key="idx"
        class="p-3 rounded-xl border flex flex-col gap-1.5"
        :class="
          log.status === 'success'
            ? 'bg-success-bg/30 border-success-border/50 text-text-primary'
            : 'bg-danger-bg/30 border-danger-border/50 text-text-primary'
        "
      >
        <div class="flex items-center justify-between text-[11px]">
          <span
            class="font-bold flex items-center gap-1.5"
            :class="log.status === 'success' ? 'text-success' : 'text-danger-text'"
          >
            <Icons :name="log.status === 'success' ? 'CheckCircle2' : 'AlertCircle'" :size="13" />
            {{ log.method }}
          </span>
          <span class="text-text-tertiary text-[10px]">{{ log.timestamp }}</span>
        </div>
        <pre
          class="m-0 text-[11px] leading-relaxed whitespace-pre-wrap break-all text-text-secondary"
          >{{ JSON.stringify(log.data, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/** Shows the results of plugin calls, newest first, with buttons to copy the log as JSON and to clear it. */

import { ref } from 'vue'
import Icons from '@/components/common/Icons.vue'

/** The result of one plugin call. */
export interface LogItem {
  method: string
  status: 'success' | 'error'
  data: any
  timestamp: string
}

const props = defineProps<{
  logs: LogItem[]
}>()

defineEmits<{
  (e: 'clear'): void
}>()

const copied = ref(false)

/** Copies all entries as JSON and briefly shows that they were copied. */
function copyLogs() {
  navigator.clipboard.writeText(JSON.stringify(props.logs, null, 2))
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2000)
}
</script>
