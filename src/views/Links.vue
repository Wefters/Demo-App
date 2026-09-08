<template>
  <div class="min-h-full p-5 flex flex-col gap-5 max-w-3xl mx-auto">
    <div class="flex flex-col items-center py-6 gap-3 text-center">
      <div
        class="w-16 h-16 flex items-center justify-center bg-accent-subtle text-accent rounded-2xl shadow-sm"
      >
        <Icons name="Link" :size="32" />
      </div>
      <h1 class="text-3xl font-extrabold text-text-primary tracking-tight m-0">
        Ecosystem & Links
      </h1>
      <p class="text-sm text-text-secondary max-w-md m-0 leading-relaxed">
        Official GitHub repositories, NPM packages, and documentation links for Wefter and plugins.
      </p>
    </div>

    <Transition name="fade">
      <div
        v-if="copiedUrl"
        class="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-accent text-white rounded-full text-xs font-semibold shadow-lg flex items-center gap-2"
      >
        <Icons name="Check" :size="14" />
        <span>Copied {{ copiedUrl }} to clipboard!</span>
      </div>
    </Transition>

    <div class="flex flex-col gap-2.5">
      <h2 class="text-xs font-semibold text-text-muted uppercase tracking-wider px-1 m-0">
        Master Repositories
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div
          v-for="repo in masterRepos"
          :key="repo.name"
          class="p-4 bg-surface border border-border-subtle rounded-2xl flex flex-col gap-3 justify-between"
        >
          <div class="flex flex-col gap-1.5">
            <div class="flex items-center justify-between">
              <span
                class="text-xs font-semibold px-2 py-0.5 bg-accent-subtle text-accent rounded-md"
              >
                {{ repo.badge }}
              </span>
              <button
                @click="copyUrl(repo.gitUrl)"
                class="p-1 text-text-tertiary hover:text-text-primary transition-colors cursor-pointer"
                title="Copy Git URL"
              >
                <Icons name="Copy" :size="15" />
              </button>
            </div>
            <h3 class="text-base font-bold text-text-primary m-0">{{ repo.name }}</h3>
            <p class="text-xs text-text-tertiary m-0 leading-relaxed">{{ repo.desc }}</p>
          </div>

          <div class="flex items-center gap-2 pt-2 border-t border-border-subtle">
            <button
              @click="openInApp(repo.githubUrl)"
              class="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-surface-raised hover:bg-border-subtle text-text-primary text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              <Icons name="Github" :size="15" />
              <span>GitHub</span>
            </button>
            <button
              v-if="repo.webUrl"
              @click="openInApp(repo.webUrl)"
              class="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-accent-subtle hover:bg-accent/20 text-accent text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              <Icons name="Globe" :size="15" />
              <span>Website</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-2.5">
      <h2 class="text-xs font-semibold text-text-muted uppercase tracking-wider px-1 m-0">
        Master NPM Packages
      </h2>
      <div class="flex flex-col gap-2">
        <div
          v-for="pkg in masterPackages"
          :key="pkg.npmName"
          class="p-4 bg-surface border border-border-subtle rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 flex items-center justify-center bg-accent-subtle text-accent rounded-xl shrink-0"
            >
              <Icons name="Package" :size="20" />
            </div>
            <div class="flex flex-col gap-0.5">
              <span class="text-sm font-bold text-text-primary font-mono">{{ pkg.npmName }}</span>
              <span class="text-xs text-text-tertiary">{{ pkg.desc }}</span>
            </div>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <button
              @click="openInApp(pkg.npmUrl)"
              class="flex items-center gap-1.5 px-3 py-1.5 bg-surface-raised hover:bg-border-subtle text-text-primary text-xs font-medium rounded-xl transition-colors cursor-pointer"
            >
              <Icons name="Package" :size="14" />
              <span>NPM</span>
              <Icons name="ExternalLink" :size="12" class="text-text-muted" />
            </button>
            <button
              @click="openInApp(pkg.githubUrl)"
              class="flex items-center gap-1.5 px-3 py-1.5 bg-surface-raised hover:bg-border-subtle text-text-primary text-xs font-medium rounded-xl transition-colors cursor-pointer"
            >
              <Icons name="Github" :size="14" />
              <span>Source</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-2.5">
      <div class="flex items-center justify-between px-1">
        <h2 class="text-xs font-semibold text-text-muted uppercase tracking-wider m-0">
          Plugins Directory ({{ pluginLinks.length }})
        </h2>
        <span class="text-xs text-text-tertiary">github.com/Wefters/*</span>
      </div>

      <div class="flex flex-col gap-2.5">
        <div
          v-for="plugin in pluginLinks"
          :key="plugin.npmName"
          class="p-4 bg-surface border border-border-subtle rounded-2xl flex flex-col gap-3"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 flex items-center justify-center bg-accent-subtle text-accent rounded-xl shrink-0"
              >
                <Icons :name="plugin.icon" :size="20" />
              </div>
              <div class="flex flex-col gap-0.5">
                <div class="flex items-center gap-2">
                  <h3 class="text-base font-bold text-text-primary m-0">{{ plugin.name }}</h3>
                  <span
                    class="text-[10px] font-mono px-1.5 py-0.5 bg-surface-raised text-text-secondary rounded-md"
                  >
                    v{{ plugin.version }}
                  </span>
                </div>
                <span class="text-xs text-text-tertiary font-mono">{{ plugin.npmName }}</span>
              </div>
            </div>

            <button
              @click="copyUrl(plugin.gitUrl)"
              class="flex items-center gap-1 px-2.5 py-1 bg-surface-raised hover:bg-border-subtle text-text-secondary text-xs rounded-lg transition-colors cursor-pointer"
              title="Copy Git Repository URL"
            >
              <Icons name="Copy" :size="13" />
              <span class="text-[11px]">Git URL</span>
            </button>
          </div>

          <p class="text-xs text-text-secondary m-0 leading-relaxed">
            {{ plugin.desc }}
          </p>

          <div class="flex flex-wrap items-center gap-2 pt-2 border-t border-border-subtle">
            <button
              @click="openInApp(plugin.githubUrl)"
              class="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 px-3 py-2 bg-surface-raised hover:bg-border-subtle text-text-primary text-xs font-medium rounded-xl transition-colors cursor-pointer"
            >
              <Icons name="Github" :size="14" />
              <span class="truncate">GitHub Repository</span>
              <Icons name="ExternalLink" :size="12" class="text-text-muted shrink-0" />
            </button>

            <button
              @click="openInApp(plugin.npmUrl)"
              class="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 px-3 py-2 bg-accent-subtle hover:bg-accent/20 text-accent text-xs font-medium rounded-xl transition-colors cursor-pointer"
            >
              <Icons name="Package" :size="14" />
              <span class="truncate">NPM Package</span>
              <Icons name="ExternalLink" :size="12" class="shrink-0" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Browser } from '@wefterjs/browser'
import Icons from '@/components/common/Icons.vue'

const copiedUrl = ref('')

function copyUrl(url: string) {
  navigator.clipboard.writeText(url)
  copiedUrl.value = url
  setTimeout(() => {
    copiedUrl.value = ''
  }, 2500)
}

async function openInApp(url: string) {
  try {
    await Browser.open({ url })
  } catch (err) {
    console.warn('Native browser plugin call fallback to window.open:', err)
    window.open(url, '_blank')
  }
}

const masterRepos = [
  {
    name: 'Wefter Core',
    badge: 'Master Repo',
    desc: 'Main monorepo containing @wefterjs core bridge, CLI tool, registry codegen, and Android/iOS shell templates.',
    githubUrl: 'https://github.com/Wefters/Wefter',
    gitUrl: 'https://github.com/Wefters/Wefter.git',
    webUrl: 'https://wefter.dev',
  },
  {
    name: 'Wefter Documentation',
    badge: 'Docs Source',
    desc: 'Documentation site source code built with Next.js, Fumadocs, and MDX.',
    githubUrl: 'https://github.com/Wefters/Docs',
    gitUrl: 'https://github.com/Wefters/Docs.git',
    webUrl: 'https://wefter.dev',
  },
]

const masterPackages = [
  {
    npmName: '@wefterjs/cli',
    desc: 'Command-line tool for wefter sync, run, add, doctor, build & eject.',
    npmUrl: 'https://www.npmjs.com/package/@wefterjs/cli',
    githubUrl: 'https://github.com/Wefters/Wefter/tree/main/packages/cli',
  },
  {
    npmName: '@wefterjs/core',
    desc: 'Runtime JS bridge library shipped inside WebViews (invokeNative, registerHook).',
    npmUrl: 'https://www.npmjs.com/package/@wefterjs/core',
    githubUrl: 'https://github.com/Wefters/Wefter/tree/main/packages/core',
  },
]

const pluginLinks = [
  {
    name: 'App',
    npmName: '@wefterjs/app',
    version: '0.0.1',
    icon: 'AppWindow',
    desc: 'App lifecycle, deep links, hardware back button, and build metadata.',
    githubUrl: 'https://github.com/Wefters/App',
    gitUrl: 'https://github.com/Wefters/App.git',
    npmUrl: 'https://www.npmjs.com/package/@wefterjs/app',
  },
  {
    name: 'Biometric',
    npmName: '@wefterjs/biometric',
    version: '0.0.1',
    icon: 'Fingerprint',
    desc: 'Hardware biometric authentication (Fingerprint, Face ID, Device PIN).',
    githubUrl: 'https://github.com/Wefters/Biometric',
    gitUrl: 'https://github.com/Wefters/Biometric.git',
    npmUrl: 'https://www.npmjs.com/package/@wefterjs/biometric',
  },
  {
    name: 'Browser',
    npmName: '@wefterjs/browser',
    version: '0.0.1',
    icon: 'Globe',
    desc: 'In-app Chrome Custom Tabs & SFSafariViewController with OAuth flow support.',
    githubUrl: 'https://github.com/Wefters/Browser',
    gitUrl: 'https://github.com/Wefters/Browser.git',
    npmUrl: 'https://www.npmjs.com/package/@wefterjs/browser',
  },
  {
    name: 'Dialog',
    npmName: '@wefterjs/dialog',
    version: '0.0.1',
    icon: 'MessageSquare',
    desc: 'Native UI alert, confirm, prompt dialogs, and toast notifications.',
    githubUrl: 'https://github.com/Wefters/Dialog',
    gitUrl: 'https://github.com/Wefters/Dialog.git',
    npmUrl: 'https://www.npmjs.com/package/@wefterjs/dialog',
  },
  {
    name: 'FlashLight',
    npmName: '@wefterjs/flash-light',
    version: '0.0.2',
    icon: 'Flashlight',
    desc: 'Camera flash torch control and state change events.',
    githubUrl: 'https://github.com/Wefters/FlashLight',
    gitUrl: 'https://github.com/Wefters/FlashLight.git',
    npmUrl: 'https://www.npmjs.com/package/@wefterjs/flash-light',
  },
  {
    name: 'Haptics',
    npmName: '@wefterjs/haptics',
    version: '0.0.1',
    icon: 'Vibrate',
    desc: 'Physical haptic feedback, impact sensations, and vibration patterns.',
    githubUrl: 'https://github.com/Wefters/Haptics',
    gitUrl: 'https://github.com/Wefters/Haptics.git',
    npmUrl: 'https://www.npmjs.com/package/@wefterjs/haptics',
  },
  {
    name: 'Scanner',
    npmName: '@wefterjs/scanner',
    version: '0.0.1',
    icon: 'ScanLine',
    desc: 'CameraX & Google ML Kit 1D/2D QR code and barcode scanner.',
    githubUrl: 'https://github.com/Wefters/Scanner',
    gitUrl: 'https://github.com/Wefters/Scanner.git',
    npmUrl: 'https://www.npmjs.com/package/@wefterjs/scanner',
  },
  {
    name: 'Secure Storage',
    npmName: '@wefterjs/secure-storage',
    version: '0.0.1',
    icon: 'ShieldCheck',
    desc: 'Encrypted key-value storage using EncryptedSharedPreferences and iOS Keychain.',
    githubUrl: 'https://github.com/Wefters/SecureStorage',
    gitUrl: 'https://github.com/Wefters/SecureStorage.git',
    npmUrl: 'https://www.npmjs.com/package/@wefterjs/secure-storage',
  },
  {
    name: 'Storage',
    npmName: '@wefterjs/storage',
    version: '0.0.1',
    icon: 'Database',
    desc: 'Fast unencrypted key-value storage with automatic JSON serialization.',
    githubUrl: 'https://github.com/Wefters/Storage',
    gitUrl: 'https://github.com/Wefters/Storage.git',
    npmUrl: 'https://www.npmjs.com/package/@wefterjs/storage',
  },
]
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -10px);
}
</style>
