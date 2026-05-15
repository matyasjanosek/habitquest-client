<template>
  <div class="profile">
    <div class="profile-card card">
      <div class="p-avatar">{{ authStore.user?.username?.charAt(0).toUpperCase() }}</div>
      <div class="p-info">
        <h1>{{ authStore.user?.username }}</h1>
        <p class="p-email">{{ authStore.user?.email }}</p>
        <div class="p-level">
          <span class="lv-badge">Lv {{ authStore.user?.level }}</span>
          <span class="xp-label">{{ authStore.user?.xp }} XP total</span>
        </div>
        <div class="xp-bar" style="margin-top:10px;margin-bottom:4px">
          <div class="xp-bar-fill" :style="{ width: xpProgress + '%' }"></div>
        </div>
        <p class="xp-hint">{{ 100 - xpProgress }} XP to level {{ (authStore.user?.level || 1) + 1 }}</p>
      </div>
    </div>

    <div class="stats-row">
      <div class="stat-box card">
        <span class="sb-val">{{ habitStore.habits.length }}</span>
        <span class="sb-lbl">Active habits</span>
      </div>
      <div class="stat-box card">
        <span class="sb-val">{{ totalCompletions }}</span>
        <span class="sb-lbl">Total completions</span>
      </div>
      <div class="stat-box card">
        <span class="sb-val">{{ bestStreak }}</span>
        <span class="sb-lbl">Best streak</span>
      </div>
      <div class="stat-box card">
        <span class="sb-val">{{ parsedCoupons.length }}</span>
        <span class="sb-lbl">Coupons earned</span>
      </div>
    </div>

    <div v-if="parsedCoupons.length" class="card coupons-card">
      <h2>Your Coupons 🎁</h2>
      <p class="c-hint">Earned by leveling up. Use at checkout!</p>
      <div class="coupons-list">
        <div v-for="c in parsedCoupons" :key="c.code" class="coupon-item">
          <div class="ci-left">
            <span class="ci-shop">{{ c.shop }}</span>
            <span class="ci-code">{{ c.code }}</span>
          </div>
          <span class="ci-off">{{ c.discount }}% OFF</span>
        </div>
      </div>
    </div>

    <div class="card">
      <h2>Account</h2>
      <button @click="handleLogout" class="btn btn-danger" style="margin-top:14px">Sign out</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useHabitStore } from '../stores/habits'
import type { Coupon } from '../types'

const router = useRouter()
const authStore = useAuthStore()
const habitStore = useHabitStore()

const xpProgress = computed(() => (authStore.user?.xp || 0) % 100)
const totalCompletions = computed(() => habitStore.habits.reduce((s, h) => s + h.totalCompletions, 0))
const bestStreak = computed(() => habitStore.habits.length ? Math.max(...habitStore.habits.map((h) => h.longestStreak)) : 0)
const parsedCoupons = computed<Coupon[]>(() => {
  if (!authStore.user?.coupons?.length) return []
  return authStore.user.coupons.map((c) => { try { return JSON.parse(c) } catch { return null } }).filter(Boolean)
})

function handleLogout() { authStore.logout(); router.push('/login') }
onMounted(() => habitStore.fetchHabits())
</script>

<style scoped>
.profile { display: flex; flex-direction: column; gap: 16px; }
.profile-card { display: flex; align-items: flex-start; gap: 20px; }
.p-avatar { width: 64px; height: 64px; border-radius: 50%; background: var(--primary); color: white; font-size: 24px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.p-info { flex: 1; }
h1 { font-size: 20px; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 3px; }
.p-email { color: var(--text-muted); font-size: 13px; margin-bottom: 10px; }
.p-level { display: flex; align-items: center; gap: 8px; }
.lv-badge { background: var(--primary); color: white; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px; }
.xp-label { font-size: 13px; color: var(--text-muted); }
.xp-hint { font-size: 11px; color: var(--text-muted); }

.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
.stat-box { text-align: center; padding: 16px; }
.sb-val { display: block; font-size: 22px; font-weight: 800; color: var(--primary); letter-spacing: -0.02em; }
.sb-lbl { font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; margin-top: 3px; display: block; }

h2 { font-size: 14px; font-weight: 600; margin-bottom: 10px; }
.c-hint { font-size: 12px; color: var(--text-muted); margin-bottom: 14px; }
.coupons-list { display: flex; flex-direction: column; gap: 8px; }
.coupon-item { display: flex; align-items: center; justify-content: space-between; background: var(--bg); border: 1px solid var(--border); border-radius: 8px; padding: 12px 14px; }
.ci-left { display: flex; flex-direction: column; gap: 3px; }
.ci-shop { font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
.ci-code { font-family: 'Courier New', monospace; font-size: 15px; font-weight: 700; color: var(--text); letter-spacing: 0.08em; }
.ci-off { font-size: 18px; font-weight: 800; color: var(--primary); }

@media (max-width: 600px) {
  .profile-card { flex-direction: column; align-items: center; text-align: center; }
  .p-level { justify-content: center; }
  .stats-row { grid-template-columns: repeat(2, 1fr); }
}
</style>
