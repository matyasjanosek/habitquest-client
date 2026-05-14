import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Habit, CheckInResult } from '../types'
import { habitService } from '../services/api'
import { useAuthStore } from './auth'

export const useHabitStore = defineStore('habits', () => {
  const habits = ref<Habit[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastCheckInResult = ref<CheckInResult | null>(null)

  async function fetchHabits() {
    loading.value = true
    try {
      const res = await habitService.getAll()
      habits.value = res.data.habits
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to load'
    } finally {
      loading.value = false
    }
  }

  async function createHabit(data: object) {
    try {
      const res = await habitService.create(data)
      habits.value.unshift(res.data.habit)
      return true
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to create'
      return false
    }
  }

  async function updateHabit(id: string, data: object) {
    try {
      const res = await habitService.update(id, data)
      const index = habits.value.findIndex((h) => h._id === id)
      if (index !== -1) habits.value[index] = res.data.habit
      return true
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update'
      return false
    }
  }

  async function deleteHabit(id: string) {
    try {
      await habitService.delete(id)
      habits.value = habits.value.filter((h) => h._id !== id)
      return true
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete'
      return false
    }
  }

  async function checkIn(id: string) {
    try {
      const res = await habitService.checkIn(id)
      lastCheckInResult.value = res.data

      // update habit in list
      const index = habits.value.findIndex((h) => h._id === id)
      if (index !== -1) {
        habits.value[index].streak = res.data.habit.streak
        habits.value[index].totalCompletions = res.data.habit.totalCompletions
        habits.value[index].milestones = res.data.habit.milestones
      }

      // update XP + coupon immediately in auth store (no extra fetch needed)
      const authStore = useAuthStore()
      const couponStr = res.data.levelUpCoupon ? JSON.stringify(res.data.levelUpCoupon) : undefined
      authStore.updateXp(res.data.user.xp, res.data.user.level, couponStr)

      return res.data as CheckInResult
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Check-in failed'
      return null
    }
  }

  function isCheckedInToday(habit: Habit): boolean {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return habit.checkIns.some((c) => {
      const d = new Date(c.date)
      d.setHours(0, 0, 0, 0)
      return d.getTime() === today.getTime() && c.completed
    })
  }

  return { habits, loading, error, lastCheckInResult, fetchHabits, createHabit, updateHabit, deleteHabit, checkIn, isCheckedInToday }
})
