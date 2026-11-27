<template>
  <WebCard
    icon="Video"
    title="Camera & microphone"
    desc='getUserMedia() after the system permission prompt. The app declares these in "permissions" of wefter.config.json.'
  >
    <div class="relative overflow-hidden rounded-xl bg-black aspect-video">
      <video
        ref="preview"
        autoplay
        muted
        playsinline
        class="w-full h-full object-cover"
        :class="{ '-scale-x-100': facing === 'user' }"
      />
      <div
        v-if="!cameraOn"
        class="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/70 text-xs"
      >
        <Icons name="Camera" :size="28" />
        <span>Camera is off</span>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-2">
      <button v-if="!cameraOn" :class="primaryButton" :disabled="cameraBusy" @click="startCamera()">
        <Icons name="Video" :size="15" />
        <span>{{ cameraBusy ? 'Starting…' : 'Start camera' }}</span>
      </button>
      <button v-else :class="secondaryButton" :disabled="cameraBusy" @click="stopCamera">
        <Icons name="Square" :size="15" />
        <span>Stop camera</span>
      </button>
      <button :class="secondaryButton" :disabled="!cameraOn || cameraBusy" @click="switchCamera">
        <Icons name="SwitchCamera" :size="15" />
        <span>Switch camera</span>
      </button>
    </div>

    <div class="flex flex-col gap-2">
      <div class="flex items-center gap-3">
        <Icons name="Mic" :size="16" class="text-text-tertiary shrink-0" />
        <div class="flex-1 h-2 bg-surface-raised rounded-full overflow-hidden">
          <div
            class="h-full bg-accent transition-[width] duration-75"
            :style="{ width: `${Math.round(level * 100)}%` }"
          />
        </div>
      </div>
      <button v-if="!micOn" :class="secondaryButton" @click="startMicrophone">
        <Icons name="Mic" :size="15" />
        <span>Start microphone</span>
      </button>
      <button v-else :class="secondaryButton" @click="stopMicrophone">
        <Icons name="Square" :size="15" />
        <span>Stop microphone</span>
      </button>
    </div>
  </WebCard>
</template>

<script setup lang="ts">
/**
 * Demo of `getUserMedia()`: a camera preview with front/back switching, and a microphone level meter.
 *
 * Phones with several cameras on one side list them all, and `facingMode` takes the first one the system
 * lists, which on some phones is a secondary camera (macro, depth) or one that never starts. So on Android
 * the camera is picked by its number, the main one first, and a camera that does not start in a few
 * seconds is skipped.
 */

import { onBeforeUnmount, ref } from 'vue'
import Icons from '@/components/common/Icons.vue'
import WebCard from './WebCard.vue'
import { primaryButton, secondaryButton } from './buttons'
import { logError, logSuccess } from './webLog'

const preview = ref<HTMLVideoElement | null>(null)
type Facing = 'user' | 'environment'

const cameraOn = ref(false)
const cameraBusy = ref(false)
const facing = ref<Facing>('user')
let cameraStream: MediaStream | null = null

/** How long a camera may take to start before the next one is tried. */
const CAMERA_START_TIMEOUT = 6000

const micOn = ref(false)
const level = ref(0)
let micStream: MediaStream | null = null
let audioContext: AudioContext | null = null
let meterFrame = 0

/**
 * The cameras to try for `side`, best first. Android's web view names cameras "camera <n>, facing
 * <front|back>", and the lowest number on each side is the main camera; elsewhere `facingMode` is enough.
 * Names are only known once the camera permission is granted.
 */
async function cameraChoices(side: Facing): Promise<MediaTrackConstraints[]> {
  const numbered = (await navigator.mediaDevices.enumerateDevices())
    .filter((device) => device.kind === 'videoinput')
    .map((device) => ({ device, match: /^camera (\d+), facing (front|back)$/.exec(device.label) }))
    .filter(({ match }) => match && (match[2] === 'front') === (side === 'user'))
    .sort((a, b) => Number(a.match![1]) - Number(b.match![1]))
  if (numbered.length === 0) return [{ facingMode: side }]
  return numbered.map(({ device }) => ({ deviceId: { exact: device.deviceId } }))
}

/** Opens a camera, giving up after `timeout`; a stream that still arrives later is stopped. */
function openCamera(video: MediaTrackConstraints, timeout: number): Promise<MediaStream> {
  return new Promise((resolve, reject) => {
    let settled = false
    const timer = setTimeout(() => {
      settled = true
      reject(new DOMException('The camera did not start', 'TimeoutError'))
    }, timeout)
    navigator.mediaDevices.getUserMedia({ video, audio: false }).then(
      (stream) => {
        if (settled) return stream.getTracks().forEach((track) => track.stop())
        settled = true
        clearTimeout(timer)
        resolve(stream)
      },
      (error) => {
        if (settled) return
        settled = true
        clearTimeout(timer)
        reject(error)
      },
    )
  })
}

/** Starts the camera on `side`, trying its cameras in turn. Returns whether one started. */
async function startCamera(side: Facing = facing.value): Promise<boolean> {
  cameraBusy.value = true
  let lastError: unknown
  try {
    for (const video of await cameraChoices(side)) {
      try {
        cameraStream = await openCamera(video, CAMERA_START_TIMEOUT)
        break
      } catch (error) {
        lastError = error
        if ((error as Error).name === 'NotAllowedError') break
      }
    }
    if (!cameraStream) {
      logError('getUserMedia({ video })', lastError)
      return false
    }
    facing.value = side
    if (preview.value) {
      preview.value.srcObject = cameraStream
      await preview.value.play().catch(() => {})
    }
    cameraOn.value = true
    const track = cameraStream.getVideoTracks()[0]
    const settings = track?.getSettings()
    logSuccess('getUserMedia({ video })', {
      camera: track?.label || side,
      facingMode: settings?.facingMode ?? side,
      width: settings?.width,
      height: settings?.height,
    })
    return true
  } catch (error) {
    logError('getUserMedia({ video })', error)
    return false
  } finally {
    cameraBusy.value = false
  }
}

function stopCamera() {
  cameraStream?.getTracks().forEach((track) => track.stop())
  cameraStream = null
  if (preview.value) preview.value.srcObject = null
  cameraOn.value = false
}

/** Switches between the front and back cameras; when the other side does not start, goes back. */
async function switchCamera() {
  const previous = facing.value
  stopCamera()
  if (!(await startCamera(previous === 'user' ? 'environment' : 'user')))
    await startCamera(previous)
}

async function startMicrophone() {
  try {
    micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
    audioContext = new AudioContext()
    await audioContext.resume()
    const analyser = audioContext.createAnalyser()
    analyser.fftSize = 512
    audioContext.createMediaStreamSource(micStream).connect(analyser)
    const samples = new Uint8Array(analyser.fftSize)
    const tick = () => {
      analyser.getByteTimeDomainData(samples)
      let peak = 0
      for (const sample of samples) peak = Math.max(peak, Math.abs(sample - 128) / 128)
      level.value = Math.min(1, peak * 1.5)
      meterFrame = requestAnimationFrame(tick)
    }
    tick()
    micOn.value = true
    logSuccess('getUserMedia({ audio })', {
      label: micStream.getAudioTracks()[0]?.label || 'microphone',
    })
  } catch (error) {
    logError('getUserMedia({ audio })', error)
  }
}

function stopMicrophone() {
  cancelAnimationFrame(meterFrame)
  micStream?.getTracks().forEach((track) => track.stop())
  micStream = null
  audioContext?.close()
  audioContext = null
  level.value = 0
  micOn.value = false
}

onBeforeUnmount(() => {
  stopCamera()
  stopMicrophone()
})
</script>
