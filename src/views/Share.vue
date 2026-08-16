<template>
  <ModulePage
    icon="Share2"
    title="Share Plugin"
    desc="@wefterjs/share v0.0.2"
    info="Trigger system share dialogs to share text, links, and documents across native social apps, messaging, and system extensions."
  >
    <!-- Share Capability Status -->
    <div class="p-4 bg-surface border border-border-subtle rounded-2xl flex flex-col gap-3">
      <div class="flex items-center justify-between">
        <h3 class="text-xs font-bold uppercase tracking-wider text-text-muted m-0">Native Capability</h3>
        <button
          @click="checkCapability"
          class="flex items-center gap-1.5 px-3 py-1.5 bg-accent-subtle hover:bg-accent/20 text-accent text-xs font-semibold rounded-xl transition-colors cursor-pointer"
        >
          <Icons name="RefreshCw" :size="14" />
          <span>Check Capability</span>
        </button>
      </div>

      <div class="p-3 bg-surface-raised border border-border-subtle rounded-xl flex items-center justify-between">
        <span class="text-xs text-text-tertiary font-medium">Native Share Dialog Available</span>
        <span class="text-xs font-bold font-mono" :class="canShareValue ? 'text-success' : 'text-warning-text'">
          {{ canShareValue ? 'SUPPORTED' : 'LIMITED / FALLBACK' }}
        </span>
      </div>
    </div>

    <!-- Share Payload Form -->
    <div class="p-4 bg-surface border border-border-subtle rounded-2xl flex flex-col gap-4">
      <h3 class="text-xs font-bold uppercase tracking-wider text-text-muted m-0">Share Payload</h3>

      <div class="flex flex-col gap-3">
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-text-secondary">Title</label>
          <input
            v-model="shareForm.title"
            type="text"
            placeholder="e.g. Wefter Framework"
            class="px-3 py-2 bg-surface-raised border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
          />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-text-secondary">Text / Message</label>
          <textarea
            v-model="shareForm.text"
            rows="2"
            placeholder="e.g. Build modern cross-platform web mobile apps with native capabilities!"
            class="px-3 py-2 bg-surface-raised border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent resize-none"
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="flex flex-col gap-1">
            <label class="text-xs font-medium text-text-secondary">URL</label>
            <input
              v-model="shareForm.url"
              type="text"
              placeholder="https://wefter.dev"
              class="px-3 py-2 bg-surface-raised border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
            />
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-xs font-medium text-text-secondary">Dialog Title (Android)</label>
            <input
              v-model="shareForm.dialogTitle"
              type="text"
              placeholder="Share via"
              class="px-3 py-2 bg-surface-raised border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            @click="triggerShare"
            :disabled="loading"
            class="py-3 bg-accent hover:bg-accent-bright text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <Icons name="Share2" :size="16" />
            <span>{{ loading ? 'Opening Share...' : 'Trigger Share Sheet' }}</span>
          </button>

          <button
            @click="fillPreset"
            class="py-3 bg-surface-raised hover:bg-accent-subtle border border-border-subtle text-text-primary font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Icons name="Sparkles" :size="16" />
            <span>Load Preset Payload</span>
          </button>
        </div>
      </div>
    </div>

    <ShowcaseConsole :logs="logs" @clear="logs = []" />
  </ModulePage>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Share } from '@wefterjs/share'
import ModulePage from '@/components/common/ModulePage.vue'
import ShowcaseConsole, { type LogItem } from '@/components/showcase/ShowcaseConsole.vue'
import Icons from '@/components/common/Icons.vue'

const canShareValue = ref(true)
const loading = ref(false)
const logs = ref<LogItem[]>([])

const shareForm = reactive({
  title: 'Wefter Mobile Framework',
  text: 'Check out Wefter for building high performance native web mobile applications!',
  url: 'https://wefter.dev',
  dialogTitle: 'Share Wefter App',
})

function now() {
  return new Date().toLocaleTimeString()
}

async function checkCapability() {
  try {
    const res = await Share.canShare()
    canShareValue.value = res.value
    logs.value.unshift({
      method: 'Share.canShare',
      status: 'success',
      data: res,
      timestamp: now(),
    })
  } catch (err: any) {
    logs.value.unshift({
      method: 'Share.canShare',
      status: 'error',
      data: { error: err?.message || String(err) },
      timestamp: now(),
    })
  }
}

async function triggerShare() {
  loading.value = true
  try {
    const res = await Share.share({
      title: shareForm.title || undefined,
      text: shareForm.text || undefined,
      url: shareForm.url || undefined,
      dialogTitle: shareForm.dialogTitle || undefined,
    })
    logs.value.unshift({
      method: 'Share.share',
      status: 'success',
      data: res,
      timestamp: now(),
    })
  } catch (err: any) {
    logs.value.unshift({
      method: 'Share.share',
      status: 'error',
      data: { error: err?.message || String(err) },
      timestamp: now(),
    })
  } finally {
    loading.value = false
  }
}

function fillPreset() {
  shareForm.title = 'Wefter Framework v0.0.1'
  shareForm.text = 'Explore official Wefter JS plugins for Vue and cross-platform native bridges.'
  shareForm.url = 'https://wefter.dev/docs'
  shareForm.dialogTitle = 'Share with Friends'
}

onMounted(() => {
  checkCapability()
})
</script>
