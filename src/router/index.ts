import { nextTick } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'

/**
 * Routes of the demo app. Every page renders inside the shared layout. Hash history is used because the
 * bundled app is served from local files in the native shells.
 */
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'layout',
      component: () => import('@/layout/Layout.vue'),
      children: [
        {
          path: '/',
          name: 'home',
          component: () => import('@/views/Home.vue'),
          meta: { title: 'Wefter' },
        },
        {
          path: 'app',
          name: 'app',
          component: () => import('@/views/App.vue'),
          meta: { title: 'App' },
        },
        {
          path: 'scanner',
          name: 'scanner',
          component: () => import('@/views/Scanner.vue'),
          meta: { title: 'Scanner' },
        },
        {
          path: 'biometric',
          name: 'biometric',
          component: () => import('@/views/Biometric.vue'),
          meta: { title: 'Biometric' },
        },
        {
          path: 'browser',
          name: 'browser',
          component: () => import('@/views/Browser.vue'),
          meta: { title: 'Browser' },
        },
        {
          path: 'dialog',
          name: 'dialog',
          component: () => import('@/views/Dialog.vue'),
          meta: { title: 'Dialog' },
        },
        {
          path: 'flashlight',
          name: 'flashlight',
          component: () => import('@/views/FlashLight.vue'),
          meta: { title: 'FlashLight' },
        },
        {
          path: 'haptics',
          name: 'haptics',
          component: () => import('@/views/Haptics.vue'),
          meta: { title: 'Haptics' },
        },
        {
          path: 'secure-storage',
          name: 'secure-storage',
          component: () => import('@/views/SecureStorage.vue'),
          meta: { title: 'Secure Storage' },
        },
        {
          path: 'storage',
          name: 'storage',
          component: () => import('@/views/Storage.vue'),
          meta: { title: 'Storage' },
        },
        {
          path: 'clipboard',
          name: 'clipboard',
          component: () => import('@/views/Clipboard.vue'),
          meta: { title: 'Clipboard' },
        },
        {
          path: 'device',
          name: 'device',
          component: () => import('@/views/Device.vue'),
          meta: { title: 'Device Info' },
        },
        {
          path: 'network',
          name: 'network',
          component: () => import('@/views/Network.vue'),
          meta: { title: 'Network Status' },
        },
        {
          path: 'screen',
          name: 'screen',
          component: () => import('@/views/Screen.vue'),
          meta: { title: 'Screen Control' },
        },
        {
          path: 'share',
          name: 'share',
          component: () => import('@/views/Share.vue'),
          meta: { title: 'Share' },
        },
        {
          path: 'backend',
          name: 'backend',
          component: () => import('@/views/Backend.vue'),
          meta: { title: 'Backend API' },
        },
        {
          path: 'dev-tools',
          name: 'dev-tools',
          component: () => import('@/views/DevTools.vue'),
          meta: { title: 'Dev Tools' },
        },
        {
          path: 'about',
          name: 'about',
          component: () => import('@/views/About.vue'),
          meta: { title: 'About Wefter' },
        },
        {
          path: 'links',
          name: 'links',
          component: () => import('@/views/Links.vue'),
          meta: { title: 'Ecosystem & Links' },
        },
      ],
    },
  ],
})

router.afterEach(async (to, from, failure) => {
  await nextTick();

  document.querySelector('.main-container')?.scrollTo({
    top: 0,
    left: 0,
    behavior: 'instant',
  })
})

export default router
