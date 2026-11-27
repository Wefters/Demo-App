<template>
  <ModulePage
    icon="Layers"
    title="Web APIs in a native app"
    desc="Built into every Wefter app · no plugin needed"
    info='Standard web code behaves as in a browser: dialogs, file uploads, the camera and microphone, location, links to other apps, downloads, fullscreen video and storage. Camera, microphone and location need "permissions" in wefter.config.json.'
  >
    <WebSupport />
    <WebDialogs />
    <WebFiles />
    <WebCamera />
    <WebLocation />
    <WebLinks />
    <WebDownloads />
    <WebMedia />
    <WebStorage />
    <ShowcaseConsole :logs="webLogs" @clear="webLogs = []" />
  </ModulePage>
</template>

<script setup lang="ts">
/**
 * Showcase of the web platform features the native shells provide, each tried with plain web code and
 * logged to one console.
 */

import ModulePage from '@/components/common/ModulePage.vue'
import ShowcaseConsole from '@/components/showcase/ShowcaseConsole.vue'
import WebSupport from '@/components/web/WebSupport.vue'
import WebDialogs from '@/components/web/WebDialogs.vue'
import WebFiles from '@/components/web/WebFiles.vue'
import WebCamera from '@/components/web/WebCamera.vue'
import WebLocation from '@/components/web/WebLocation.vue'
import WebLinks from '@/components/web/WebLinks.vue'
import WebDownloads from '@/components/web/WebDownloads.vue'
import WebMedia from '@/components/web/WebMedia.vue'
import WebStorage from '@/components/web/WebStorage.vue'
import { webLogs } from '@/components/web/webLog'
</script>
