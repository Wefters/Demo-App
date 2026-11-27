<template>
  <ModulePage
    icon="AppWindowMac"
    title="Embedded sites"
    desc="Other websites inside the app, talking to it safely"
    info="Run the partner test site with `pnpm partner` (and `adb reverse tcp:8787 tcp:8787` for Android). The site calls only the methods the app lists for it, never the plugins themselves, except ones frames.plugins grants it (here: haptics)."
  >
    <EmbeddedFrame />
    <WebWindowCard />
    <ShowcaseConsole :logs="platformLogs" @clear="platformLogs = []" />
  </ModulePage>
</template>

<script setup lang="ts">
/** Showcase of embedding other sites: an iframe with `exposeToFrames()` and a web window. */

import ModulePage from '@/components/common/ModulePage.vue'
import ShowcaseConsole from '@/components/showcase/ShowcaseConsole.vue'
import EmbeddedFrame from '@/components/platform/EmbeddedFrame.vue'
import WebWindowCard from '@/components/platform/WebWindowCard.vue'
import { platformLogs } from '@/components/platform/platformLog'
</script>
