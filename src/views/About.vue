<template>
  <div class="min-h-full p-5 flex flex-col gap-5 max-w-3xl mx-auto">
    <div class="flex flex-col items-center py-6 gap-3 text-center">
      <div class="w-16 h-16 flex items-center justify-center bg-accent-subtle text-accent rounded-2xl shadow-sm">
        <Icons name="Info" :size="32" />
      </div>
      <h1 class="text-3xl font-extrabold text-text-primary tracking-tight m-0">About Wefter</h1>
      <p class="text-sm text-text-secondary max-w-md m-0 leading-relaxed">
        Lightweight, zero-reflection native mobile framework for web applications.
      </p>
      <div class="flex items-center gap-2 mt-1">
        <span class="px-3 py-1 bg-accent-subtle text-text-link border border-accent-muted rounded-full text-xs font-semibold">
          Framework {{ FRAMEWORK_VERSION }}
        </span>
        <span class="px-3 py-1 bg-surface border border-border-subtle text-text-tertiary rounded-full text-xs font-medium">
          MIT Licensed
        </span>
      </div>
    </div>

    <div class="p-4 bg-surface border border-border-subtle rounded-2xl flex flex-col gap-2">
      <h2 class="text-xs font-semibold text-text-muted uppercase tracking-wider m-0">Framework Overview</h2>
      <p class="text-sm text-text-secondary leading-relaxed m-0">
        Wefter turns standard web applications (built with Vue, React, Svelte, Angular, or plain JavaScript) into high-performance native iOS and Android apps. It embeds your web build into platform-native WebViews (<code class="text-xs bg-surface-raised px-1.5 py-0.5 rounded text-accent">android.webkit.WebView</code> & <code class="text-xs bg-surface-raised px-1.5 py-0.5 rounded text-accent">WKWebView</code>) connected by a fast, typed native bridge.
      </p>
    </div>

    <div class="flex flex-col gap-2.5">
      <h2 class="text-xs font-semibold text-text-muted uppercase tracking-wider px-1 m-0">Key Capabilities</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div
          v-for="cap in capabilities"
          :key="cap.title"
          class="p-4 bg-surface border border-border-subtle rounded-2xl flex flex-col gap-1.5"
        >
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 flex items-center justify-center bg-accent-subtle text-accent rounded-lg shrink-0">
              <Icons :name="cap.icon" :size="18" />
            </div>
            <h3 class="text-sm font-bold text-text-primary m-0">{{ cap.title }}</h3>
          </div>
          <p class="text-xs text-text-tertiary leading-relaxed m-0">{{ cap.description }}</p>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-2.5">
      <h2 class="text-xs font-semibold text-text-muted uppercase tracking-wider px-1 m-0">Master Packages</h2>
      <div class="flex flex-col gap-2">
        <div
          v-for="pkg in corePackages"
          :key="pkg.name"
          class="p-4 bg-surface border border-border-subtle rounded-2xl flex items-center justify-between gap-3"
        >
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 flex items-center justify-center bg-accent-subtle text-accent rounded-xl shrink-0">
              <Icons :name="pkg.icon" :size="20" />
            </div>
            <div class="flex flex-col gap-0.5">
              <div class="flex items-center gap-2">
                <span class="text-sm font-bold text-text-primary">{{ pkg.name }}</span>
                <span class="text-[10px] font-mono px-2 py-0.5 bg-surface-raised text-text-secondary rounded-md">
                  v{{ pkg.version }}
                </span>
              </div>
              <span class="text-xs text-text-tertiary">{{ pkg.desc }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-2.5">
      <div class="flex items-center justify-between px-1">
        <h2 class="text-xs font-semibold text-text-muted uppercase tracking-wider m-0">Installed Plugins ({{ plugins.length }})</h2>
        <span class="text-xs text-accent font-medium">Active in App</span>
      </div>

      <div class="flex flex-col gap-2">
        <div
          v-for="plugin in plugins"
          :key="plugin.npm"
          class="p-4 bg-surface border border-border-subtle rounded-2xl flex flex-col gap-2"
        >
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 flex items-center justify-center bg-accent-subtle text-accent rounded-xl shrink-0">
                <Icons :name="plugin.icon" :size="18" />
              </div>
              <div class="flex flex-col">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-bold text-text-primary">{{ plugin.name }}</span>
                  <span class="text-[10px] font-mono px-1.5 py-0.5 bg-surface-raised text-text-secondary rounded-md">
                    v{{ plugin.version }}
                  </span>
                </div>
                <span class="text-xs text-text-tertiary font-mono">{{ plugin.npm }}</span>
              </div>
            </div>
            <span class="px-2 py-0.5 bg-success-subtle text-success text-[11px] font-medium rounded-full shrink-0">
              Synced
            </span>
          </div>

          <p class="text-xs text-text-secondary m-0 leading-relaxed pl-12">
            {{ plugin.desc }}
          </p>

          <div v-if="plugin.permissions.length > 0" class="flex flex-wrap gap-1 pl-12 pt-1">
            <span
              v-for="perm in plugin.permissions"
              :key="perm"
              class="text-[10px] font-mono px-2 py-0.5 bg-surface-raised text-text-muted rounded-md border border-border-subtle"
            >
              {{ perm }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Icons from '@/components/common/Icons.vue'
import { FRAMEWORK_VERSION } from '@/core/config'

const capabilities = [
  {
    icon: 'Zap',
    title: 'Zero-Reflection Bridge',
    description: 'Direct static native call routing in Kotlin & Swift generated at build time for high performance.',
  },
  {
    icon: 'Layers',
    title: 'Framework Agnostic',
    description: 'Works out-of-the-box with Vue, React, Angular, Svelte, or plain JavaScript web apps.',
  },
  {
    icon: 'FolderSync',
    title: 'Disposable Shells',
    description: 'Disposable native project targets regenerated deterministically via "wefter sync".',
  },
  {
    icon: 'LogOut',
    title: 'Clean Ejection',
    description: 'Eject anytime with "wefter eject" into standard Android Studio and Xcode projects.',
  },
]

const corePackages = [
  {
    name: '@wefterjs/core',
    version: '0.0.1',
    icon: 'Cpu',
    desc: 'Runtime JS bridge library shipped inside the app WebView (invokeNative, registerHook).',
  },
  {
    name: '@wefterjs/cli',
    version: '0.0.5',
    icon: 'Terminal',
    desc: 'Unified CLI tool providing sync, run, add, doctor, build, codegen, and plugin creation commands.',
  },
]

const plugins = [
  {
    name: 'Biometric',
    npm: '@wefterjs/biometric',
    version: '0.0.1',
    icon: 'Fingerprint',
    desc: 'Hardware-backed biometric authentication supporting Fingerprint, Face ID, and PIN fallback.',
    permissions: ['USE_BIOMETRIC', 'NSFaceIDUsageDescription'],
  },
  {
    name: 'Browser',
    npm: '@wefterjs/browser',
    version: '0.0.1',
    icon: 'Globe',
    desc: 'In-app Chrome Custom Tabs & SFSafariViewController with deep link OAuth authentication.',
    permissions: [],
  },
  {
    name: 'Clipboard',
    npm: '@wefterjs/clipboard',
    version: '0.0.1',
    icon: 'Copy',
    desc: 'Read and write the native system clipboard via ClipboardManager and UIPasteboard.',
    permissions: [],
  },
  {
    name: 'Device',
    npm: '@wefterjs/device',
    version: '0.0.2',
    icon: 'Smartphone',
    desc: 'Device metadata, unique installation identifier, battery telemetry, and system locale.',
    permissions: [],
  },
  {
    name: 'Dialog',
    npm: '@wefterjs/dialog',
    version: '0.0.1',
    icon: 'MessageSquare',
    desc: 'Native system alert, confirmation, prompt dialogs, and non-blocking toast notifications.',
    permissions: [],
  },
  {
    name: 'FlashLight',
    npm: '@wefterjs/flash-light',
    version: '0.0.3',
    icon: 'Flashlight',
    desc: 'Camera flash torch control with state monitoring and event emission.',
    permissions: [],
  },
  {
    name: 'Haptics',
    npm: '@wefterjs/haptics',
    version: '0.0.1',
    icon: 'Vibrate',
    desc: 'Physical haptic feedback, impact sensations, notification vibrations, and selection ticks.',
    permissions: ['VIBRATE'],
  },
  {
    name: 'Network',
    npm: '@wefterjs/network',
    version: '0.0.2',
    icon: 'Wifi',
    desc: 'Real-time connectivity status, transport type detection, and network change events.',
    permissions: ['ACCESS_NETWORK_STATE'],
  },
  {
    name: 'Scanner',
    npm: '@wefterjs/scanner',
    version: '0.0.1',
    icon: 'ScanLine',
    desc: 'CameraX & Google ML Kit powered 1D and 2D barcode / QR code camera scanning.',
    permissions: ['CAMERA', 'VIBRATE', 'NSCameraUsageDescription'],
  },
  {
    name: 'Screen',
    npm: '@wefterjs/screen',
    version: '0.0.2',
    icon: 'Monitor',
    desc: 'Screen brightness control, orientation locks, and keep-awake wake lock management.',
    permissions: ['WAKE_LOCK'],
  },
  {
    name: 'Secure Storage',
    npm: '@wefterjs/secure-storage',
    version: '0.0.1',
    icon: 'ShieldCheck',
    desc: 'Encrypted key-value storage backed by Android EncryptedSharedPreferences and iOS Keychain.',
    permissions: [],
  },
  {
    name: 'Share',
    npm: '@wefterjs/share',
    version: '0.0.2',
    icon: 'Share2',
    desc: 'Native share sheet for text, links, and documents across social, messaging, and system extensions.',
    permissions: [],
  },
]
</script>
