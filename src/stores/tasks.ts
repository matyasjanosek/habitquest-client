import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Task } from '../types'
import { taskService } from '../services/api'

export const useTaskStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const pendingTasks = computed(() => tasks.value.filter((t) => !t.completed).sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()))
  const completedTasks = computed(() => tasks.value.filter((t) => t.completed))

  async function fetchTasks() {
    loading.value = true
    try {
      const res = await taskService.getAll()
      tasks.value = res.data.tasks
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Chyba při načítání'
    } finally {
      loading.value = false
    }
  }

  async function createTask(data: object) {
    try {
      const res = await taskService.create(data)
      tasks.value.push(res.data.task)
      return true
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Chyba při vytváření'
      return false
    }
  }

  async function updateTask(id: string, data: object) {
    try {
      const res = await taskService.update(id, data)
      const index = tasks.value.findIndex((t) => t._id === id)
      if (index !== -1) tasks.value[index] = res.data.task
      return true
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Chyba při aktualizaci'
      return false
    }
  }

  async function deleteTask(id: string) {
    try {
      await taskService.delete(id)
      tasks.value = tasks.value.filter((t) => t._id !== id)
      return true
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Chyba při mazání'
      return false
    }
  }

  async function completeTask(id: string) {
    try {
      const res = await taskService.complete(id)
      const index = tasks.value.findIndex((t) => t._id === id)
      if (index !== -1) tasks.value[index] = res.data.task
      return true
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Chyba'
      return false
    }
  }

  // check if task is overdue
  function isOverdue(task: Task): boolean {
    return !task.completed && new Date(task.deadline) < new Date()
  }

  return { tasks, loading, error, pendingTasks, completedTasks, fetchTasks, createTask, updateTask, deleteTask, completeTask, isOverdue }
})
