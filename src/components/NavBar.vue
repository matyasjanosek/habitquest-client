<template>
  <nav class="navbar">
    <div class="navbar-inner">
      <RouterLink to="/dashboard" class="logo">
        <span class="logo-icon">⚡</span>
        <span class="logo-text">HabitQuest</span>
      </RouterLink>

      <div class="nav-links">
        <RouterLink to="/dashboard">Dashboard</RouterLink>
        <RouterLink to="/habits">Habits</RouterLink>
        <RouterLink to="/tasks">Tasks</RouterLink>
        <RouterLink to="/friends">Friends</RouterLink>
      </div>

      <div class="nav-right" v-if="authStore.user">
        <div class="xp-pill">
          <span class="lv">Lv {{ authStore.user.level }}</span>
          <div class="xp-track">
            <div class="xp-fill" :style="{ width: xpProgress + '%' }"></div>
          </div>
          <span class="xp-num">{{ authStore.user.xp % 100 }}/100</span>
        </div>
        <RouterLink to="/profile" class="avatar-btn">
          {{ authStore.user.username.charAt(0).toUpperCase() }}
        </RouterLink>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '../stores/auth'
const authStore = useAuthStore()
const xpProgress = computed(() => (authStore.user?.xp || 0) % 100)
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0; left: 0; right: 0;
  height: 56px;
  background: rgba(8, 8, 16, 0.92);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
  z-index: 100;
}
.navbar-inner {
  max-width: 1080px;
  margin: 0 auto;
  padding: 0 20px;
  height: 100%;
  display: flex;
  align-items: center;
  gap: 24px;
}
.logo { display: flex; align-items: center; gap: 7px; text-decoration: none; flex-shrink: 0; }
.logo-icon { font-size: 16px; }
.logo-text { font-size: 15px; font-weight: 700; color: var(--text); letter-spacing: -0.02em; }
.nav-links { display: flex; gap: 2px; flex: 1; }
.nav-links a { padding: 5px 12px; border-radius: 6px; text-decoration: none; color: var(--text-muted); font-size: 13px; font-weight: 500; transition: all 0.15s; }
.nav-links a:hover, .nav-links a.router-link-active { color: var(--text); background: var(--bg-hover); }
.nav-right { display: flex; align-items: center; gap: 10px; }
.xp-pill { display: flex; align-items: center; gap: 8px; background: var(--bg-card2); border: 1px solid var(--border); border-radius: 20px; padding: 4px 12px 4px 10px; }
.lv { font-size: 12px; font-weight: 700; color: var(--primary); white-space: nowrap; }
.xp-track { width: 60px; height: 3px; background: var(--border); border-radius: 2px; overflow: hidden; }
.xp-fill { height: 100%; background: var(--primary); border-radius: 2px; transition: width 0.6s ease; }
.xp-num { font-size: 11px; color: var(--text-muted); white-space: nowrap; }
.avatar-btn { width: 32px; height: 32px; border-radius: 50%; background: var(--primary); color: white; font-weight: 700; font-size: 13px; display: flex; align-items: center; justify-content: center; text-decoration: none; flex-shrink: 0; }
</style>
