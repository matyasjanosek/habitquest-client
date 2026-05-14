<template>
  <div class="dashboard">
    <div class="dash-header">
      <div>
        <h1>Hey, {{ authStore.user?.username }} 👋</h1>
        <p class="date">{{ todayDate }}</p>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card card">
        <span class="stat-icon">⚡</span>
        <div>
          <div class="stat-val">{{ authStore.user?.xp || 0 }}</div>
          <div class="stat-lbl">Total XP</div>
        </div>
      </div>
      <div class="stat-card card">
        <span class="stat-icon">🏆</span>
        <div>
          <div class="stat-val">Lv {{ authStore.user?.level || 1 }}</div>
          <div class="stat-lbl">Level</div>
        </div>
      </div>
      <div class="stat-card card">
        <span class="stat-icon">🔥</span>
        <div>
          <div class="stat-val">{{ bestStreak }}</div>
          <div class="stat-lbl">Best streak</div>
        </div>
      </div>
      <div class="stat-card card">
        <span class="stat-icon">✅</span>
        <div>
          <div class="stat-val">{{ checkedTodayCount }}/{{ habitStore.habits.length }}</div>
          <div class="stat-lbl">Done today</div>
        </div>
      </div>
    </div>

    <div class="card xp-card">
      <div class="xp-row">
        <span>Progress to level {{ (authStore.user?.level || 1) + 1 }}</span>
        <span>{{ xpInLevel }}/100 XP</span>
      </div>
      <div class="xp-bar"><div class="xp-bar-fill" :style="{ width: xpInLevel + '%' }"></div></div>
    </div>

    <div class="two-col">
      <!-- habits -->
      <section class="section">
        <div class="section-head">
          <h2>Today's Habits</h2>
          <RouterLink to="/habits" class="see-all">See all →</RouterLink>
        </div>
        <div v-if="habitStore.loading" class="loading">Loading...</div>
        <div v-else-if="habitStore.habits.length === 0" class="empty-state card">
          <p style="margin-bottom:12px">No habits yet. Build your first one!</p>
          <RouterLink to="/habits" class="btn btn-primary">Add habit</RouterLink>
        </div>
        <div v-else class="habit-list">
          <div
            v-for="habit in habitStore.habits.slice(0, 5)"
            :key="habit._id"
            class="habit-row card"
            :class="{ done: habitStore.isCheckedInToday(habit) }"
          >
            <span class="h-icon">{{ habit.icon }}</span>
            <div class="h-info">
              <span class="h-name">{{ habit.name }}</span>
              <span class="h-streak">🔥 {{ habit.streak }}</span>
            </div>
            <button
              v-if="!habitStore.isCheckedInToday(habit)"
              @click="doCheckIn(habit._id)"
              class="btn btn-primary check-btn"
            >Done</button>
            <span v-else class="done-lbl">✓</span>
          </div>
        </div>
      </section>

      <!-- tasks -->
      <section class="section">
        <div class="section-head">
          <h2>Upcoming Tasks</h2>
          <RouterLink to="/tasks" class="see-all">See all →</RouterLink>
        </div>
        <div v-if="taskStore.pendingTasks.length === 0" class="empty-state card">
          <p style="margin-bottom:12px">No pending tasks!</p>
          <RouterLink to="/tasks" class="btn btn-primary">Add task</RouterLink>
        </div>
        <div v-else class="task-list">
          <div
            v-for="task in taskStore.pendingTasks.slice(0, 4)"
            :key="task._id"
            class="task-row card"
            :class="{ overdue: taskStore.isOverdue(task) }"
          >
            <div class="t-info">
              <span class="t-title">{{ task.title }}</span>
              <span class="t-date" :class="{ danger: taskStore.isOverdue(task) }">
                {{ taskStore.isOverdue(task) ? '⚠️ ' : '📅 ' }}{{ formatDate(task.deadline) }}
              </span>
            </div>
            <span :class="`badge badge-${priorityColor(task.priority)}`">{{ task.priority }}</span>
          </div>
        </div>
      </section>
    </div>

    <!-- coupons section -->
    <div v-if="parsedCoupons.length" class="card coupons-card">
      <h2>Your Coupons 🎁</h2>
      <div class="coupons-row">
        <div v-for="c in parsedCoupons" :key="c.code" class="coupon-chip">
          <span class="chip-shop">{{ c.shop }}</span>
          <span class="chip-code">{{ c.code }}</span>
          <span class="chip-off">{{ c.discount }}% off</span>
        </div>
      </div>
    </div>

    <!-- toast -->
    <Transition name="toast">
      <div v-if="toast" class="toast">{{ toast }}</div>
    </Transition>

    <!-- level up modal -->
    <LevelUpModal
      :show="levelUpModal.show"
      :level="levelUpModal.level"
      :coupon="levelUpModal.coupon"
      @close="levelUpModal.show = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useHabitStore } from '../stores/habits'
import { useTaskStore } from '../stores/tasks'
import LevelUpModal from '../components/LevelUpModal.vue'
import type { Coupon } from '../types'

const authStore = useAuthStore()
const habitStore = useHabitStore()
const taskStore = useTaskStore()
const toast = ref<string | null>(null)

const levelUpModal = reactive({ show: false, level: 1, coupon: null as Coupon | null })

const todayDate = computed(() =>
  new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
)
const xpInLevel = computed(() => (authStore.user?.xp || 0) % 100)
const bestStreak = computed(() =>
  habitStore.habits.length ? Math.max(...habitStore.habits.map((h) => h.longestStreak)) : 0
)
const checkedTodayCount = computed(() =>
  habitStore.habits.filter((h) => habitStore.isCheckedInToday(h)).length
)
const parsedCoupons = computed<Coupon[]>(() => {
  if (!authStore.user?.coupons?.length) return []
  return authStore.user.coupons.map((c) => {
    try { return JSON.parse(c) } catch { return null }
  }).filter(Boolean)
})

async function doCheckIn(id: string) {
  const result = await habitStore.checkIn(id)
  if (result) {
    toast.value = `+${result.xpGained} XP! 🔥 Streak: ${result.habit.streak}`
    setTimeout(() => (toast.value = null), 3500)
    if (result.leveledUp) {
      levelUpModal.level = result.user.level
      levelUpModal.coupon = result.levelUpCoupon
      levelUpModal.show = true
    }
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}
function priorityColor(p: string) {
  return p === 'high' ? 'fitness' : p === 'medium' ? 'mindfulness' : 'learning'
}

onMounted(() => Promise.all([habitStore.fetchHabits(), taskStore.fetchTasks()]))
</script>

<style scoped>
.dash-header { margin-bottom: 24px; }
h1 { font-size: 22px; font-weight: 800; letter-spacing: -0.03em; margin-bottom: 3px; }
.date { color: var(--text-muted); font-size: 13px; }

.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 12px; }
.stat-card { display: flex; align-items: center; gap: 12px; padding: 14px 16px; }
.stat-icon { font-size: 20px; flex-shrink: 0; }
.stat-val { font-size: 18px; font-weight: 700; line-height: 1.1; }
.stat-lbl { font-size: 11px; color: var(--text-muted); margin-top: 2px; text-transform: uppercase; letter-spacing: 0.04em; }

.xp-card { margin-bottom: 24px; padding: 14px 18px; }
.xp-row { display: flex; justify-content: space-between; font-size: 12px; color: var(--text-muted); margin-bottom: 8px; }

.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
.section {}
.section-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.section-head h2 { font-size: 14px; font-weight: 600; }
.see-all { font-size: 12px; color: var(--text-muted); text-decoration: none; }
.see-all:hover { color: var(--primary); }

.habit-list, .task-list { display: flex; flex-direction: column; gap: 6px; }

.habit-row { display: flex; align-items: center; gap: 10px; padding: 11px 14px; transition: border-color 0.15s; }
.habit-row.done { border-color: rgba(34,197,94,0.3); opacity: 0.65; }
.h-icon { font-size: 18px; flex-shrink: 0; }
.h-info { flex: 1; display: flex; flex-direction: column; gap: 1px; }
.h-name { font-size: 13px; font-weight: 500; }
.h-streak { font-size: 11px; color: var(--text-muted); }
.check-btn { padding: 5px 12px; font-size: 12px; flex-shrink: 0; }
.done-lbl { color: var(--success); font-weight: 700; font-size: 14px; flex-shrink: 0; }

.task-row { display: flex; align-items: center; justify-content: space-between; padding: 11px 14px; }
.task-row.overdue { border-color: rgba(239,68,68,0.3); }
.t-info { display: flex; flex-direction: column; gap: 2px; }
.t-title { font-size: 13px; font-weight: 500; }
.t-date { font-size: 11px; color: var(--text-muted); }
.t-date.danger { color: var(--danger); }

.coupons-card h2 { font-size: 14px; font-weight: 600; margin-bottom: 12px; }
.coupons-row { display: flex; flex-wrap: wrap; gap: 8px; }
.coupon-chip { display: flex; align-items: center; gap: 8px; background: var(--bg); border: 1px solid var(--border-light); border-radius: 8px; padding: 8px 12px; }
.chip-shop { font-size: 12px; color: var(--text-muted); font-weight: 500; }
.chip-code { font-family: 'Courier New', monospace; font-size: 13px; font-weight: 700; color: var(--text); }
.chip-off { font-size: 12px; font-weight: 700; color: var(--primary); }

.toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); background: var(--bg-card2); border: 1px solid var(--border-light); color: var(--text); padding: 10px 20px; border-radius: 8px; font-size: 13px; font-weight: 500; z-index: 300; white-space: nowrap; }
.toast-enter-active, .toast-leave-active { transition: all 0.25s; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(12px); }

@media (max-width: 700px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .two-col { grid-template-columns: 1fr; }
}
</style>
