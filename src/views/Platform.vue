<template>
  <ModulePage
    icon="Cpu"
    title="Platform"
    desc="What the native shell gives every app and plugin"
    info="Permissions reported the same way by every plugin, events that wait for the page, plugins that follow the app's lifecycle, and the shell's own text in the user's language."
  >
    <PermissionsCard />
    <HeldEventsCard />
    <LifecycleCard />
    <LanguageCard />
    <ShowcaseConsole :logs="platformLogs" @clear="platformLogs = []" />
  </ModulePage>
</template>

<script setup lang="ts">
/** Showcase of the shell features plugins build on: permissions, held events, lifecycle and languages. */

import ModulePage from '@/components/common/ModulePage.vue'
import ShowcaseConsole from '@/components/showcase/ShowcaseConsole.vue'
import PermissionsCard from '@/components/platform/PermissionsCard.vue'
import HeldEventsCard from '@/components/platform/HeldEventsCard.vue'
import LifecycleCard from '@/components/platform/LifecycleCard.vue'
import LanguageCard from '@/components/platform/LanguageCard.vue'
import { platformLogs } from '@/components/platform/platformLog'
</script>
