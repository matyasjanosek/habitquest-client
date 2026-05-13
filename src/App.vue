<template>
  <div id="app">
    <NavBar v-if="authStore.isLoggedIn" />
    <main :class="{ 'with-nav': authStore.isLoggedIn }">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from './stores/auth'
import NavBar from './components/NavBar.vue'
const authStore = useAuthStore()
</script>

<style>
.with-nav { padding-top: 56px; }
main { max-width: 1080px; margin: 0 auto; padding: 48px 20px 32px; }
@media (max-width: 640px) { main { padding: 32px 14px 20px; } }
</style>
