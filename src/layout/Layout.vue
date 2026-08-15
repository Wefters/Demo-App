<template>
  <div class="relative flex flex-col h-screen overflow-hidden bg-bg">
    <Sidebar />
    <Header />
    <main class="flex-1 overflow-y-auto">
      <RouterView />
    </main>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import Header from './components/Header.vue'
import Sidebar from './components/Sidebar.vue'
import Footer from './components/Footer.vue'
</script>
