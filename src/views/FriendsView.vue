<template>
  <div>
    <div class="page-head">
      <h1 class="page-title">Friends</h1>
    </div>

    <div class="card search-card">
      <h2>Find users</h2>
      <input v-model="searchQuery" @input="searchUsers" class="input" placeholder="Search by username..." style="margin-top:10px" />
      <div v-if="searchResults.length > 0" class="search-results">
        <div v-for="u in searchResults" :key="u._id" class="user-row">
          <div class="u-info">
            <span class="u-avatar">{{ u.username.charAt(0).toUpperCase() }}</span>
            <div>
              <div class="u-name">{{ u.username }}</div>
              <div class="u-meta">Lv {{ u.level }} · {{ u.xp }} XP</div>
            </div>
          </div>
          <button @click="addFriend(u._id)" class="btn btn-primary" style="font-size:12px;padding:5px 12px">+ Add</button>
        </div>
      </div>
      <p v-if="searchQuery.length >= 2 && searchResults.length === 0 && !searching" class="no-results">No users found</p>
    </div>

    <div class="section">
      <h2 class="section-title">My Friends ({{ friends.length }})</h2>
      <div v-if="loadingFriends" class="loading">Loading...</div>
      <div v-else-if="friends.length === 0" class="empty-state card">
        <p>No friends yet. Find someone above! 👆</p>
      </div>
      <div v-else class="friends-grid">
        <div v-for="f in friends" :key="f._id" class="friend-card card">
          <div class="f-header">
            <span class="f-avatar">{{ f.username.charAt(0).toUpperCase() }}</span>
            <div class="f-info">
              <div class="f-name">{{ f.username }}</div>
              <span class="f-lv">Lv {{ f.level }}</span>
            </div>
          </div>
          <div class="f-xp">
            <div class="f-xp-row"><span>{{ f.xp }} XP</span></div>
            <div class="xp-bar"><div class="xp-bar-fill" :style="{ width: (f.xp % 100) + '%' }"></div></div>
          </div>
          <div v-if="friendStats[f._id]" class="f-habits">
            <div v-for="h in friendStats[f._id].habits.slice(0, 3)" :key="h.name" class="f-habit">
              <span>{{ h.icon }}</span>
              <span class="fh-name">{{ h.name }}</span>
              <span class="fh-streak">🔥 {{ h.streak }}</span>
            </div>
          </div>
          <div class="f-actions">
            <button @click="loadFriendStats(f._id)" class="btn btn-ghost" style="font-size:12px;padding:5px 10px">View stats</button>
            <button @click="removeFriend(f._id)" class="btn btn-ghost" style="font-size:12px;padding:5px 10px;color:var(--danger)">Remove</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="toast" class="toast">{{ toast }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { userService } from '../services/api'
import type { Friend } from '../types'

const friends = ref<Friend[]>([])
const searchResults = ref<Friend[]>([])
const friendStats = ref<Record<string, any>>({})
const searchQuery = ref('')
const loadingFriends = ref(false)
const searching = ref(false)
const toast = ref<string | null>(null)
let searchTimeout: ReturnType<typeof setTimeout>

async function loadFriends() {
  loadingFriends.value = true
  try { friends.value = (await userService.getFriends()).data.friends } catch {}
  loadingFriends.value = false
}

function searchUsers() {
  clearTimeout(searchTimeout)
  if (searchQuery.value.length < 2) { searchResults.value = []; return }
  searching.value = true
  searchTimeout = setTimeout(async () => {
    try {
      const res = await userService.search(searchQuery.value)
      const ids = friends.value.map((f) => f._id)
      searchResults.value = res.data.users.filter((u: Friend) => !ids.includes(u._id))
    } catch {}
    searching.value = false
  }, 400)
}

async function addFriend(id: string) {
  try {
    await userService.addFriend(id)
    searchResults.value = searchResults.value.filter((u) => u._id !== id)
    await loadFriends()
    showToast('Friend added!')
  } catch (e: any) { showToast(e.response?.data?.message || 'Error') }
}

async function removeFriend(id: string) {
  if (!confirm('Remove this friend?')) return
  try {
    await userService.removeFriend(id)
    friends.value = friends.value.filter((f) => f._id !== id)
    delete friendStats.value[id]
  } catch {}
}

async function loadFriendStats(id: string) {
  try { friendStats.value[id] = (await userService.getFriendStats(id)).data } catch {}
}

function showToast(msg: string) { toast.value = msg; setTimeout(() => (toast.value = null), 3000) }
onMounted(loadFriends)
</script>

<style scoped>
.page-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.search-card { margin-bottom: 24px; }
.search-card h2 { font-size: 14px; font-weight: 600; }
.search-results { display: flex; flex-direction: column; gap: 6px; margin-top: 10px; }
.user-row { display: flex; align-items: center; justify-content: space-between; padding: 10px; background: var(--bg); border-radius: 7px; }
.u-info { display: flex; align-items: center; gap: 10px; }
.u-avatar { width: 34px; height: 34px; border-radius: 50%; background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; }
.u-name { font-size: 13px; font-weight: 500; }
.u-meta { font-size: 11px; color: var(--text-muted); }
.no-results { font-size: 12px; color: var(--text-muted); margin-top: 8px; }
.section { }
.section-title { font-size: 14px; font-weight: 600; margin-bottom: 14px; }
.friends-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px; }
.friend-card { display: flex; flex-direction: column; gap: 10px; }
.f-header { display: flex; align-items: center; gap: 10px; }
.f-avatar { width: 40px; height: 40px; border-radius: 50%; background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 16px; flex-shrink: 0; }
.f-name { font-size: 14px; font-weight: 600; }
.f-lv { font-size: 11px; color: var(--primary); font-weight: 700; }
.f-xp-row { font-size: 11px; color: var(--text-muted); margin-bottom: 4px; }
.f-habits { display: flex; flex-direction: column; gap: 3px; }
.f-habit { display: flex; align-items: center; gap: 6px; font-size: 12px; padding: 3px 0; border-bottom: 1px solid var(--border); }
.fh-name { flex: 1; }
.fh-streak { font-size: 11px; color: var(--text-muted); }
.f-actions { display: flex; gap: 6px; }
.toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); background: var(--bg-card2); border: 1px solid var(--border-light); color: var(--text); padding: 10px 20px; border-radius: 8px; font-size: 13px; z-index: 300; }
</style>
