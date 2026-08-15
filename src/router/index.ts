import { createRouter, createWebHashHistory } from 'vue-router'

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

export default router
