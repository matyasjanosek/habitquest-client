<template>
  <div>
    <div class="page-head">
      <h1 class="page-title">My Habits</h1>
      <button @click="showModal = true" class="btn btn-primary">+ Add habit</button>
    </div>

    <div v-if="habitStore.loading" class="loading">Loading...</div>

    <div v-else-if="habitStore.habits.length === 0" class="empty-state card">
      <p style="margin-bottom:14px">No habits yet. Start your journey! 💪</p>
      <button @click="showModal = true" class="btn btn-primary">Add first habit</button>
    </div>

    <div v-else class="habits-grid">
      <div v-for="habit in habitStore.habits" :key="habit._id" class="habit-card card">
        <div class="hc-top">
          <span class="hc-icon">{{ habit.icon }}</span>
          <div class="hc-actions">
            <button @click="openEdit(habit)" class="icon-btn">✏️</button>
            <button @click="confirmDelete(habit._id)" class="icon-btn">🗑️</button>
          </div>
        </div>
        <h3 class="hc-title">{{ habit.name }}</h3>
        <p v-if="habit.description" class="hc-desc">{{ habit.description }}</p>

        <div class="hc-stats">
          <div class="hc-stat"><span class="sv">🔥 {{ habit.streak }}</span><span class="sl">Streak</span></div>
          <div class="hc-stat"><span class="sv">{{ habit.totalCompletions }}</span><span class="sl">Total</span></div>
          <div class="hc-stat"><span class="sv">+{{ habit.xpPerCompletion }}</span><span class="sl">XP</span></div>
        </div>

        <div v-if="habit.milestones.length > 0" class="milestones">
          <span v-for="m in habit.milestones" :key="m" class="ms-badge">🏆 {{ m }}d</span>
        </div>

        <div class="hc-footer">
          <span :class="`badge badge-${habit.category}`">{{ habit.category }}</span>
          <button
            v-if="!habitStore.isCheckedInToday(habit)"
            @click="doCheckIn(habit._id)"
            class="btn btn-primary"
            style="padding:5px 14px;font-size:12px"
          >✓ Complete</button>
          <span v-else class="done-txt">✓ Done today</span>
        </div>
      </div>
    </div>

    <!-- modal -->
    <div v-if="showModal" class="modal-bg" @click.self="closeModal">
      <div class="modal card">
        <h2>{{ editingId ? 'Edit habit' : 'New habit' }}</h2>

        <div v-if="!editingId && !pickedPreset" class="preset-picker">
          <p class="preset-label">Pick a preset or create your own:</p>
          <div class="preset-grid">
            <button v-for="p in presets" :key="p.name" @click="pickPreset(p)" class="preset-btn">
              <span class="pb-icon">{{ p.icon }}</span>
              <span class="pb-name">{{ p.name }}</span>
            </button>
            <button @click="pickedPreset = 'custom'" class="preset-btn preset-custom">
              <span class="pb-icon">✏️</span>
              <span class="pb-name">Custom</span>
            </button>
          </div>
        </div>

        <div v-if="editingId || pickedPreset">
          <div class="form-group">
            <label>Name</label>
            <input v-model="form.name" class="input" placeholder="Habit name" />
          </div>
          <div class="form-group">
            <label>Description</label>
            <input v-model="form.description" class="input" placeholder="Optional description" />
          </div>
          <div class="form-group">
            <label>Category</label>
            <select v-model="form.category" class="input">
              <option value="health">Health</option>
              <option value="fitness">Fitness</option>
              <option value="mindfulness">Mindfulness</option>
              <option value="learning">Learning</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <div class="form-group">
            <label>Icon (emoji)</label>
            <input v-model="form.icon" class="input" placeholder="⭐" maxlength="4" />
          </div>
          <p v-if="habitStore.error" class="error-msg">{{ habitStore.error }}</p>
          <div class="modal-actions">
            <button @click="closeModal" class="btn btn-ghost">Cancel</button>
            <button @click="saveHabit" class="btn btn-primary">{{ editingId ? 'Save' : 'Create' }}</button>
          </div>
        </div>
      </div>
    </div>

    <Transition name="toast">
      <div v-if="toast" class="toast">{{ toast }}</div>
    </Transition>

    <LevelUpModal
      :show="levelUpModal.show"
      :level="levelUpModal.level"
      :coupon="levelUpModal.coupon"
      @close="levelUpModal.show = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { useHabitStore } from '../stores/habits'
import { habitService } from '../services/api'
import { useAuthStore } from '../stores/auth'
import LevelUpModal from '../components/LevelUpModal.vue'
import type { Habit, PresetHabit, Coupon } from '../types'

const habitStore = useHabitStore()
const authStore = useAuthStore()
const showModal = ref(false)
const editingId = ref<string | null>(null)
const pickedPreset = ref<string | null>(null)
const presets = ref<PresetHabit[]>([])
const toast = ref<string | null>(null)
const levelUpModal = reactive({ show: false, level: 1, coupon: null as Coupon | null })
const form = ref({ name: '', description: '', category: 'custom', icon: '⭐' })

async function loadPresets() {
  try { presets.value = (await habitService.getPresets()).data.presets } catch {}
}

function pickPreset(p: PresetHabit) {
  pickedPreset.value = p.name
  form.value = { name: p.name, description: p.description, category: p.category, icon: p.icon }
}

function openEdit(h: Habit) {
  editingId.value = h._id
  form.value = { name: h.name, description: h.description, category: h.category, icon: h.icon }
  pickedPreset.value = 'edit'
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingId.value = null
  pickedPreset.value = null
  form.value = { name: '', description: '', category: 'custom', icon: '⭐' }
}

async function saveHabit() {
  if (!form.value.name) return
  const ok = editingId.value
    ? await habitStore.updateHabit(editingId.value, form.value)
    : await habitStore.createHabit({ ...form.value, isPreset: pickedPreset.value !== 'custom' })
  if (ok) closeModal()
}

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

async function confirmDelete(id: string) {
  if (confirm('Delete this habit?')) await habitStore.deleteHabit(id)
}

onMounted(async () => { await habitStore.fetchHabits(); await loadPresets() })
</script>

<style scoped>
.page-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.habits-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(270px, 1fr)); gap: 14px; }
.habit-card { display: flex; flex-direction: column; gap: 10px; }
.hc-top { display: flex; justify-content: space-between; align-items: flex-start; }
.hc-icon { font-size: 26px; }
.hc-actions { display: flex; gap: 4px; }
.icon-btn { background: none; border: none; cursor: pointer; font-size: 15px; opacity: 0.5; transition: opacity 0.15s; }
.icon-btn:hover { opacity: 1; }
.hc-title { font-size: 14px; font-weight: 600; }
.hc-desc { font-size: 12px; color: var(--text-muted); }
.hc-stats { display: flex; gap: 16px; }
.hc-stat { display: flex; flex-direction: column; }
.sv { font-size: 14px; font-weight: 700; }
.sl { font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; }
.milestones { display: flex; flex-wrap: wrap; gap: 4px; }
.ms-badge { font-size: 10px; border: 1px solid rgba(234,179,8,0.3); color: var(--warning); padding: 2px 6px; border-radius: 4px; }
.hc-footer { display: flex; justify-content: space-between; align-items: center; margin-top: auto; padding-top: 4px; }
.done-txt { color: var(--success); font-size: 12px; font-weight: 600; }

.modal-bg { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 200; padding: 16px; }
.modal { width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto; }
.modal h2 { font-size: 17px; font-weight: 700; margin-bottom: 20px; }
.preset-label { font-size: 12px; color: var(--text-muted); margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.05em; }
.preset-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(90px, 1fr)); gap: 7px; margin-bottom: 20px; }
.preset-btn { background: var(--bg); border: 1px solid var(--border); border-radius: 7px; padding: 10px 6px; cursor: pointer; color: var(--text); display: flex; flex-direction: column; align-items: center; gap: 4px; transition: border-color 0.15s; }
.preset-btn:hover { border-color: var(--primary); }
.pb-icon { font-size: 18px; }
.pb-name { font-size: 11px; text-align: center; color: var(--text-secondary); }
.preset-custom { border-style: dashed; }
.modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px; }

.toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); background: var(--bg-card2); border: 1px solid var(--border-light); color: var(--text); padding: 10px 20px; border-radius: 8px; font-size: 13px; z-index: 300; white-space: nowrap; }
.toast-enter-active, .toast-leave-active { transition: all 0.25s; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(12px); }
</style>
