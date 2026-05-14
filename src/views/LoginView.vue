<template>
  <div class="auth-wrap">
    <div class="auth-card card">
      <div class="auth-top">
        <span class="auth-logo">⚡</span>
        <h1>HabitQuest</h1>
        <p>Sign in to continue your journey</p>
      </div>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label>Email</label>
          <input v-model="email" type="email" class="input" placeholder="you@example.com" required />
        </div>
        <div class="form-group">
          <label>Password</label>
          <input v-model="password" type="password" class="input" placeholder="••••••••" required />
        </div>
        <p v-if="authStore.error" class="error-msg">{{ authStore.error }}</p>
        <button type="submit" class="btn btn-primary submit-btn" :disabled="authStore.loading">
          {{ authStore.loading ? 'Signing in...' : 'Sign in' }}
        </button>
      </form>

      <p class="switch">Don't have an account? <RouterLink to="/register">Sign up</RouterLink></p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
const router = useRouter()
const authStore = useAuthStore()
const email = ref('')
const password = ref('')
async function handleLogin() {
  const ok = await authStore.login(email.value, password.value)
  if (ok) router.push('/dashboard')
}
</script>

<style scoped>
.auth-wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
.auth-card { width: 100%; max-width: 380px; }
.auth-top { text-align: center; margin-bottom: 28px; }
.auth-logo { font-size: 36px; display: block; margin-bottom: 8px; }
h1 { font-size: 22px; font-weight: 800; letter-spacing: -0.03em; margin-bottom: 6px; }
.auth-top p { color: var(--text-muted); font-size: 13px; }
.submit-btn { width: 100%; justify-content: center; margin-top: 4px; padding: 11px; font-size: 14px; }
.switch { text-align: center; margin-top: 18px; font-size: 13px; color: var(--text-muted); }
.switch a { color: var(--primary); text-decoration: none; font-weight: 500; }
</style>
