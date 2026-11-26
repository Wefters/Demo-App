<template>
  <component
    v-if="icon"
    :is="icon"
    :size="parseInt(size.toString())"
    :color="color"
    :stroke-width="strokeWidth"
    :absolute-stroke-width="absoluteStrokeWidth"
    :class="classValue"
  />
</template>

<script setup lang="ts">
/** Renders a Lucide icon by name, for example `<Icons name="House" />`. */

import { computed } from 'vue'
import * as icons from '@lucide/vue'
import type { LucideIcon } from '@lucide/vue'

/** Icon name (as exported by `@lucide/vue`), size, colour and stroke options. */
export interface IconProps {
  name: string
  size?: number | string
  color?: string
  strokeWidth?: number
  absoluteStrokeWidth?: boolean
  classValue?: string
}

type IconName = keyof typeof icons

const props = withDefaults(defineProps<IconProps>(), {
  size: 24,
  color: 'currentColor',
  strokeWidth: 2,
  absoluteStrokeWidth: false,
  classValue: '',
})

/** The icon component for `name`, or `null` when there is no such icon. */
const icon = computed<LucideIcon | null>(() => {
  const iconComponent = icons[props.name as IconName] as LucideIcon | undefined
  return iconComponent || null
})
</script>
