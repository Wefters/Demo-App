<template>
  <WebCard
    icon="Link"
    title="Links to other apps"
    desc="Plain links open where they belong: the phone, mail and messages apps, the browser for other sites, and the app's own pages in place."
  >
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
      <a
        v-for="link in links"
        :key="link.label"
        :href="link.href"
        :target="link.target"
        :class="secondaryButton"
      >
        <Icons :name="link.icon" :size="15" />
        <span>{{ link.label }}</span>
      </a>
      <button :class="secondaryButton" @click="openOwnPage">
        <Icons name="AppWindow" :size="15" />
        <span>window.open() an app page</span>
      </button>
    </div>
  </WebCard>
</template>

<script setup lang="ts">
/** Demo of links: tel:, mailto:, sms:, other sites, target="_blank", window.open() and Android intent: links. */

import { getPlatformInfo } from '@wefterjs/core'
import Icons from '@/components/common/Icons.vue'
import WebCard from './WebCard.vue'
import { secondaryButton } from './buttons'
import { logSuccess } from './webLog'

const isAndroid = getPlatformInfo().platform === 'android'

const links = [
  { label: 'Call', icon: 'Phone', href: 'tel:+15555550123' },
  {
    label: 'Email',
    icon: 'Mail',
    href: 'mailto:hello@example.com?subject=Hello%20from%20Wefter&body=Sent%20from%20a%20mailto%3A%20link',
  },
  { label: 'Text message', icon: 'MessageSquareText', href: 'sms:+15555550123' },
  { label: 'Website (browser)', icon: 'Globe', href: 'https://example.com' },
  { label: 'target="_blank"', icon: 'ExternalLink', href: 'https://example.org', target: '_blank' },
  ...(isAndroid
    ? [
        {
          label: 'intent: with fallback',
          icon: 'Smartphone',
          href: 'intent://open#Intent;scheme=wefter-missing-app;S.browser_fallback_url=https%3A%2F%2Fexample.net;end',
        },
      ]
    : []),
]

/** window.open() of the app's own page loads it in place: the app has a single window. */
function openOwnPage() {
  logSuccess('window.open', { url: '#/device' })
  window.open(`${location.pathname}#/device`, '_blank')
}
</script>
