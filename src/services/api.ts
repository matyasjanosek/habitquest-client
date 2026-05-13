import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
})

// attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// auth
export const authService = {
  register: (data: { username: string; email: string; password: string }) =>
    api.post('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),

  getMe: () => api.get('/auth/me'),
}

// habits
export const habitService = {
  getAll: () => api.get('/habits'),
  getPresets: () => api.get('/habits/presets'),
  create: (data: object) => api.post('/habits', data),
  update: (id: string, data: object) => api.put(`/habits/${id}`, data),
  delete: (id: string) => api.delete(`/habits/${id}`),
  checkIn: (id: string) => api.post(`/habits/${id}/checkin`),
}

// tasks
export const taskService = {
  getAll: () => api.get('/tasks'),
  create: (data: object) => api.post('/tasks', data),
  update: (id: string, data: object) => api.put(`/tasks/${id}`, data),
  delete: (id: string) => api.delete(`/tasks/${id}`),
  complete: (id: string) => api.put(`/tasks/${id}`, { completed: true }),
}

// users / friends
export const userService = {
  search: (q: string) => api.get(`/users/search?q=${q}`),
  getFriends: () => api.get('/users/friends'),
  addFriend: (friendId: string) => api.post(`/users/friends/${friendId}`),
  removeFriend: (friendId: string) => api.delete(`/users/friends/${friendId}`),
  getFriendStats: (userId: string) => api.get(`/users/${userId}/stats`),
}

export default api
