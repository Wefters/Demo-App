<template>
  <div class="relative flex flex-col h-dvh overflow-hidden bg-bg">
    <Sidebar />
    <Header />
    <main class="main-container flex-1 overflow-y-auto overscroll-contain">
      <RouterView />
    </main>
    <Footer />
  </div>
</template>

<script setup lang="ts">
/** Page frame: header, sidebar and footer around a scrollable content area. */

import Header from './components/Header.vue'
import Sidebar from './components/Sidebar.vue'
import Footer from './components/Footer.vue'
</script>
