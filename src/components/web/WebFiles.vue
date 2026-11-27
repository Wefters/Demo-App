<template>
  <WebCard
    icon="Paperclip"
    title="File uploads"
    desc='A plain <input type="file"> opens the system picker. Images and videos also offer the camera, and capture opens it directly.'
  >
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
      <label v-for="picker in pickers" :key="picker.label" :class="secondaryButton">
        <Icons :name="picker.icon" :size="15" />
        <span>{{ picker.label }}</span>
        <input
          type="file"
          class="hidden"
          :accept="picker.accept"
          :multiple="picker.multiple"
          :capture="picker.capture"
          @change="onPicked(picker.label, $event)"
        />
      </label>
    </div>

    <div v-if="files.length" class="flex flex-col gap-2">
      <div
        v-for="file in files"
        :key="file.url"
        class="flex items-center gap-3 p-2 bg-surface-raised rounded-xl"
      >
        <img
          v-if="file.type.startsWith('image/')"
          :src="file.url"
          alt=""
          class="w-11 h-11 rounded-lg object-cover shrink-0"
        />
        <video
          v-else-if="file.type.startsWith('video/')"
          :src="file.url"
          muted
          playsinline
          class="w-11 h-11 rounded-lg object-cover shrink-0 bg-black"
        />
        <div
          v-else
          class="w-11 h-11 rounded-lg flex items-center justify-center bg-surface text-text-tertiary shrink-0"
        >
          <Icons name="FileText" :size="18" />
        </div>
        <div class="flex flex-col min-w-0">
          <span class="text-xs font-semibold text-text-primary truncate">{{ file.name }}</span>
          <span class="text-[11px] text-text-muted"
            >{{ file.type || 'unknown type' }} · {{ formatSize(file.size) }}</span
          >
        </div>
      </div>
    </div>
  </WebCard>
</template>

<script setup lang="ts">
/** Demo of `<input type="file">`: any files, photos and videos, the camera, and documents. */

import { onBeforeUnmount, ref } from 'vue'
import Icons from '@/components/common/Icons.vue'
import WebCard from './WebCard.vue'
import { secondaryButton } from './buttons'
import { logSuccess } from './webLog'

interface PickedFile {
  name: string
  type: string
  size: number
  url: string
}

const pickers: {
  label: string
  icon: string
  accept?: string
  multiple?: boolean
  capture?: 'user' | 'environment'
}[] = [
  { label: 'Any files', icon: 'Paperclip', multiple: true },
  { label: 'Photos & videos', icon: 'Image', accept: 'image/*,video/*', multiple: true },
  { label: 'Take a photo', icon: 'Camera', accept: 'image/*', capture: 'environment' },
  { label: 'Documents', icon: 'FileText', accept: '.pdf,.txt,.csv,.json' },
]

const files = ref<PickedFile[]>([])

/** Shows the picked files, replacing the previous ones. */
function onPicked(picker: string, event: Event) {
  const input = event.target as HTMLInputElement
  const picked = Array.from(input.files ?? [])
  releasePreviews()
  files.value = picked.map((file) => ({
    name: file.name,
    type: file.type,
    size: file.size,
    url: URL.createObjectURL(file),
  }))
  logSuccess(`input[type=file] · ${picker}`, {
    count: picked.length,
    files: picked.map((f) => ({ name: f.name, type: f.type, size: f.size })),
  })
  input.value = ''
}

function releasePreviews() {
  files.value.forEach((file) => URL.revokeObjectURL(file.url))
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

onBeforeUnmount(releasePreviews)
</script>
