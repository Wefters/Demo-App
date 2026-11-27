<template>
  <WebCard
    icon="MapPin"
    title="Location"
    desc="navigator.geolocation with one system permission prompt, using the app's own message."
  >
    <div class="grid grid-cols-2 gap-2">
      <button :class="primaryButton" :disabled="locating" @click="locate">
        <Icons name="LocateFixed" :size="15" />
        <span>{{ locating ? 'Locating…' : 'Where am I?' }}</span>
      </button>
      <button :class="secondaryButton" @click="toggleWatch">
        <Icons :name="watchId === null ? 'Radar' : 'Square'" :size="15" />
        <span>{{ watchId === null ? 'Watch position' : 'Stop watching' }}</span>
      </button>
    </div>

    <div v-if="position" class="grid grid-cols-2 gap-2 text-xs">
      <div v-for="item in details" :key="item.label" class="px-3 py-2 bg-surface-raised rounded-xl">
        <div class="text-text-muted text-[11px]">{{ item.label }}</div>
        <div class="font-mono text-text-primary">{{ item.value }}</div>
      </div>
    </div>

    <a v-if="position" :href="mapsUrl" :class="secondaryButton">
      <Icons name="Map" :size="15" />
      <span>Open in Maps</span>
    </a>
  </WebCard>
</template>

<script setup lang="ts">
/** Demo of `navigator.geolocation`: a one-off position, watching for updates, and opening Maps there. */

import { computed, onBeforeUnmount, ref } from 'vue'
import { getPlatformInfo } from '@wefterjs/core'
import Icons from '@/components/common/Icons.vue'
import WebCard from './WebCard.vue'
import { primaryButton, secondaryButton } from './buttons'
import { logError, logSuccess } from './webLog'

const position = ref<GeolocationPosition | null>(null)
const locating = ref(false)
const watchId = ref<number | null>(null)
const updates = ref(0)

const details = computed(() => {
  const coords = position.value?.coords
  if (!coords) return []
  return [
    { label: 'Latitude', value: coords.latitude.toFixed(5) },
    { label: 'Longitude', value: coords.longitude.toFixed(5) },
    { label: 'Accuracy', value: `± ${Math.round(coords.accuracy)} m` },
    {
      label: watchId.value === null ? 'Time' : 'Updates',
      value:
        watchId.value === null
          ? new Date(position.value!.timestamp).toLocaleTimeString()
          : String(updates.value),
    },
  ]
})

/** A link that opens the device's maps app at the position (a geo: link on Android, Apple Maps on iOS). */
const mapsUrl = computed(() => {
  const coords = position.value?.coords
  if (!coords) return ''
  const at = `${coords.latitude},${coords.longitude}`
  return getPlatformInfo().platform === 'android'
    ? `geo:${at}?q=${at}`
    : `maps://?ll=${at}&q=${encodeURIComponent('You are here')}`
})

function describe(p: GeolocationPosition) {
  return {
    latitude: p.coords.latitude,
    longitude: p.coords.longitude,
    accuracy: p.coords.accuracy,
    timestamp: new Date(p.timestamp).toISOString(),
  }
}

function locate() {
  locating.value = true
  navigator.geolocation.getCurrentPosition(
    (p) => {
      locating.value = false
      position.value = p
      logSuccess('geolocation.getCurrentPosition', describe(p))
    },
    (error) => {
      locating.value = false
      logError('geolocation.getCurrentPosition', error)
    },
    { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 },
  )
}

function toggleWatch() {
  if (watchId.value !== null) {
    navigator.geolocation.clearWatch(watchId.value)
    logSuccess('geolocation.clearWatch', { updates: updates.value })
    watchId.value = null
    return
  }
  updates.value = 0
  watchId.value = navigator.geolocation.watchPosition(
    (p) => {
      position.value = p
      updates.value++
      if (updates.value === 1) logSuccess('geolocation.watchPosition', describe(p))
    },
    (error) => {
      logError('geolocation.watchPosition', error)
      if (error.code === error.PERMISSION_DENIED && watchId.value !== null) {
        navigator.geolocation.clearWatch(watchId.value)
        watchId.value = null
      }
    },
    { enableHighAccuracy: true },
  )
}

onBeforeUnmount(() => {
  if (watchId.value !== null) navigator.geolocation.clearWatch(watchId.value)
})
</script>
