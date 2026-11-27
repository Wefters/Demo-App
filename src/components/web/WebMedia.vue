<template>
  <WebCard
    icon="Film"
    title="Video & fullscreen"
    desc="Video plays in the page (playsinline) and goes fullscreen from its controls or from script."
  >
    <video
      ref="video"
      controls
      playsinline
      preload="metadata"
      class="w-full rounded-xl bg-black aspect-video"
      src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
    />
    <button :class="secondaryButton" @click="goFullscreen">
      <Icons name="Maximize" :size="15" />
      <span>Play fullscreen</span>
    </button>
  </WebCard>
</template>

<script setup lang="ts">
/** Demo of inline video and fullscreen, with a short CC0 clip from MDN. */

import { ref } from 'vue'
import Icons from '@/components/common/Icons.vue'
import WebCard from './WebCard.vue'
import { secondaryButton } from './buttons'
import { logError, logSuccess } from './webLog'

type FullscreenVideo = HTMLVideoElement & { webkitEnterFullscreen?: () => void }

const video = ref<FullscreenVideo | null>(null)

/**
 * Starts the video and makes it fullscreen, through the standard API or the iPhone's video-only one.
 * Playback starts first: a fullscreen request uses up the tap that allows playing with sound.
 */
async function goFullscreen() {
  const element = video.value
  if (!element) return
  try {
    const playing = element.play()
    if (element.requestFullscreen && document.fullscreenEnabled) {
      await element.requestFullscreen()
      logSuccess('video.requestFullscreen', {})
    } else if (element.webkitEnterFullscreen) {
      element.webkitEnterFullscreen()
      logSuccess('video.webkitEnterFullscreen', {})
    }
    await playing
  } catch (error) {
    logError('video fullscreen', error)
  }
}
</script>
