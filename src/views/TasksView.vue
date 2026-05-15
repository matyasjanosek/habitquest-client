<template>
  <div>
    <div class="page-head">
      <h1 class="page-title">My Tasks</h1>
      <button @click="openNew" class="btn btn-primary">+ Add task</button>
    </div>

    <div class="tabs">
      <button @click="tab = 'pending'" :class="{ active: tab === 'pending' }" class="tab">
        Pending ({{ taskStore.pendingTasks.length }})
      </button>
      <button @click="tab = 'done'" :class="{ active: tab === 'done' }" class="tab">
        Completed ({{ taskStore.completedTasks.length }})
      </button>
    </div>

    <div v-if="taskStore.loading" class="loading">Loading...</div>

    <div v-else>
      <div v-if="tab === 'pending'">
        <div v-if="taskStore.pendingTasks.length === 0" class="empty-state card">
          <p style="margin-bottom:12px">No pending tasks! 🎉</p>
          <button @click="openNew" class="btn btn-primary">Add task</button>
        </div>
        <div v-else class="task-list">
          <div
            v-for="task in taskStore.pendingTasks"
            :key="task._id"
            class="task-card card"
            :class="{ overdue: taskStore.isOverdue(task) }"
          >
            <div class="tc-main">
              <button @click="taskStore.completeTask(task._id)" class="complete-btn" title="Mark as done">✓</button>
              <div class="tc-body">
                <span class="tc-title">{{ task.title }}</span>
                <p v-if="task.description" class="tc-desc">{{ task.description }}</p>
                <div class="tc-meta">
                  <span class="tc-date" :class="{ danger: taskStore.isOverdue(task) }">
                    {{ taskStore.isOverdue(task) ? '⚠️ ' : '📅 ' }}{{ formatDate(task.deadline) }}
                  </span>
                  <span :class="`badge badge-${pColor(task.priority)}`">{{ task.priority }}</span>
                </div>
              </div>
            </div>
            <div class="tc-actions">
              <button @click="openEdit(task)" class="icon-btn">✏️</button>
              <button @click="taskStore.deleteTask(task._id)" class="icon-btn">🗑️</button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="tab === 'done'">
        <div v-if="taskStore.completedTasks.length === 0" class="empty-state card">
          <p>Nothing completed yet.</p>
        </div>
        <div v-else class="task-list">
          <div v-for="task in taskStore.completedTasks" :key="task._id" class="task-card card done-card">
            <div class="tc-main">
              <span class="done-check">✓</span>
              <div class="tc-body">
                <span class="tc-title done-title">{{ task.title }}</span>
                <span class="tc-date">Done: {{ formatDate(task.completedAt || task.deadline) }}</span>
              </div>
            </div>
            <button @click="taskStore.deleteTask(task._id)" class="icon-btn">🗑️</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal-bg" @click.self="closeModal">
      <div class="modal card">
        <h2>{{ editingId ? 'Edit task' : 'New task' }}</h2>

        <div class="form-group">
          <label>Title *</label>
          <input v-model="form.title" class="input" placeholder="What needs to be done?" />
        </div>

        <div class="form-group">
          <label>Description</label>
          <input v-model="form.description" class="input" placeholder="Optional details" />
        </div>

        <div class="form-group">
          <label>Deadline *</label>
          <!-- quick shortcuts -->
          <div class="deadline-shortcuts">
            <button
              v-for="s in shortcuts"
              :key="s.label"
              @click="applyShortcut(s.fn)"
              class="shortcut-btn"
              :class="{ active: isShortcutActive(s.fn) }"
              type="button"
            >{{ s.label }}</button>
          </div>
          <!-- date + time split inputs -->
          <div class="datetime-inputs">
            <input
              v-model="dateInput"
              type="date"
              class="input"
              :min="todayStr"
              @change="syncDeadline"
            />
            <input
              v-model="timeInput"
              type="time"
              class="input time-input"
              @change="syncDeadline"
            />
          </div>
          <p v-if="form.deadline" class="deadline-preview">
            📅 {{ formatDate(form.deadline) }}
          </p>
        </div>

        <div class="form-group">
          <label>Priority</label>
          <div class="priority-picker">
            <button
              v-for="p in priorities"
              :key="p.value"
              @click="form.priority = p.value"
              class="priority-btn"
              :class="{ active: form.priority === p.value, [`p-${p.value}`]: true }"
              type="button"
            >
              {{ p.icon }} {{ p.label }}
            </button>
          </div>
        </div>

        <p v-if="taskStore.error" class="error-msg">{{ taskStore.error }}</p>

        <div class="modal-actions">
          <button @click="closeModal" class="btn btn-ghost">Cancel</button>
          <button @click="saveTask" class="btn btn-primary">{{ editingId ? 'Save changes' : 'Create task' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTaskStore } from '../stores/tasks'
import type { Task } from '../types'

const taskStore = useTaskStore()
const showModal = ref(false)
const editingId = ref<string | null>(null)
const tab = ref<'pending' | 'done'>('pending')

const form = ref({ title: '', description: '', deadline: '', priority: 'medium' })
const dateInput = ref('')
const timeInput = ref('09:00')

const priorities = [
  { value: 'low', label: 'Low', icon: '🟢' },
  { value: 'medium', label: 'Medium', icon: '🟡' },
  { value: 'high', label: 'High', icon: '🔴' },
]

const todayStr = computed(() => new Date().toISOString().split('T')[0])

// deadline shortcuts
const shortcuts = [
  { label: 'Today', fn: () => addDays(0) },
  { label: 'Tomorrow', fn: () => addDays(1) },
  { label: 'In 3 days', fn: () => addDays(3) },
  { label: 'Next week', fn: () => addDays(7) },
]

function addDays(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() + n)
  d.setHours(9, 0, 0, 0)
  return d
}

function applyShortcut(fn: () => Date) {
  const d = fn()
  dateInput.value = d.toISOString().split('T')[0]
  timeInput.value = '09:00'
  syncDeadline()
}

function isShortcutActive(fn: () => Date): boolean {
  if (!dateInput.value) return false
  const d = fn()
  return d.toISOString().split('T')[0] === dateInput.value
}

function syncDeadline() {
  if (dateInput.value) {
    form.value.deadline = `${dateInput.value}T${timeInput.value || '09:00'}`
  }
}

function openNew() {
  editingId.value = null
  form.value = { title: '', description: '', deadline: '', priority: 'medium' }
  dateInput.value = ''
  timeInput.value = '09:00'
  showModal.value = true
}

function openEdit(task: Task) {
  editingId.value = task._id
  const d = new Date(task.deadline)
  const pad = (n: number) => String(n).padStart(2, '0')
  dateInput.value = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  timeInput.value = `${pad(d.getHours())}:${pad(d.getMinutes())}`
  form.value = {
    title: task.title,
    description: task.description,
    deadline: `${dateInput.value}T${timeInput.value}`,
    priority: task.priority,
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingId.value = null
  form.value = { title: '', description: '', deadline: '', priority: 'medium' }
  dateInput.value = ''
  timeInput.value = '09:00'
}

async function saveTask() {
  if (!form.value.title || !form.value.deadline) return
  const ok = editingId.value
    ? await taskStore.updateTask(editingId.value, form.value)
    : await taskStore.createTask(form.value)
  if (ok) closeModal()
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}
function pColor(p: string) { return p === 'high' ? 'fitness' : p === 'medium' ? 'mindfulness' : 'learning' }

onMounted(() => taskStore.fetchTasks())
</script>

<style scoped>
.page-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }

.tabs { display: flex; gap: 6px; margin-bottom: 18px; }
.tab { padding: 7px 18px; border: 1px solid var(--border); border-radius: 7px; background: transparent; color: var(--text-muted); cursor: pointer; font-size: 13px; font-family: 'Inter', sans-serif; transition: all 0.15s; }
.tab.active { background: var(--primary); color: white; border-color: var(--primary); }

.task-list { display: flex; flex-direction: column; gap: 8px; }
.task-card { display: flex; align-items: flex-start; justify-content: space-between; padding: 14px; gap: 10px; }
.task-card.overdue { border-color: rgba(239,68,68,0.3); }
.done-card { opacity: 0.55; }

.tc-main { display: flex; align-items: flex-start; gap: 10px; flex: 1; }
.complete-btn { width: 26px; height: 26px; border-radius: 50%; border: 2px solid var(--border-light); background: transparent; cursor: pointer; color: var(--text-muted); font-size: 12px; display: flex; align-items: center; justify-content: center; transition: all 0.15s; flex-shrink: 0; margin-top: 2px; }
.complete-btn:hover { border-color: var(--success); color: var(--success); }
.done-check { width: 26px; height: 26px; border-radius: 50%; background: var(--success); color: white; font-size: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

.tc-body { flex: 1; display: flex; flex-direction: column; gap: 3px; }
.tc-title { font-size: 14px; font-weight: 500; }
.done-title { text-decoration: line-through; }
.tc-desc { font-size: 12px; color: var(--text-muted); }
.tc-meta { display: flex; align-items: center; gap: 8px; margin-top: 2px; }
.tc-date { font-size: 11px; color: var(--text-muted); }
.tc-date.danger { color: var(--danger); }

.tc-actions { display: flex; gap: 4px; }
.icon-btn { background: none; border: none; cursor: pointer; font-size: 15px; opacity: 0.5; transition: opacity 0.15s; }
.icon-btn:hover { opacity: 1; }

/* Modal */
.modal-bg { position: fixed; inset: 0; background: rgba(0,0,0,0.75); display: flex; align-items: center; justify-content: center; z-index: 200; padding: 16px; }
.modal { width: 100%; max-width: 460px; }
.modal h2 { font-size: 17px; font-weight: 700; margin-bottom: 20px; }

/* Deadline shortcuts */
.deadline-shortcuts {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}
.shortcut-btn {
  padding: 5px 12px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: transparent;
  color: var(--text-muted);
  font-size: 12px;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  transition: all 0.15s;
}
.shortcut-btn:hover { border-color: var(--primary); color: var(--text); }
.shortcut-btn.active { background: rgba(124,92,252,0.15); border-color: var(--primary); color: var(--primary); font-weight: 600; }

/* Date + time split */
.datetime-inputs {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
}
.time-input { width: 110px; }

.deadline-preview {
  font-size: 12px;
  color: var(--primary);
  margin-top: 6px;
}

/* Priority picker */
.priority-picker {
  display: flex;
  gap: 8px;
}
.priority-btn {
  flex: 1;
  padding: 8px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: transparent;
  color: var(--text-muted);
  font-size: 13px;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  transition: all 0.15s;
  text-align: center;
}
.priority-btn:hover { border-color: var(--border-light); color: var(--text); }
.priority-btn.active.p-low { background: rgba(34,197,94,0.1); border-color: var(--success); color: var(--success); font-weight: 600; }
.priority-btn.active.p-medium { background: rgba(234,179,8,0.1); border-color: var(--warning); color: var(--warning); font-weight: 600; }
.priority-btn.active.p-high { background: rgba(239,68,68,0.1); border-color: var(--danger); color: var(--danger); font-weight: 600; }

.modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
</style>
