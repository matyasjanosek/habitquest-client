export interface User {
  id: string
  username: string
  email: string
  xp: number
  level: number
  coupons: string[]
  friends?: Friend[]
}

export interface Friend {
  _id: string
  username: string
  xp: number
  level: number
}

export interface Habit {
  _id: string
  name: string
  description: string
  category: 'health' | 'fitness' | 'mindfulness' | 'learning' | 'custom'
  isPreset: boolean
  icon: string
  streak: number
  longestStreak: number
  totalCompletions: number
  xpPerCompletion: number
  milestones: number[]
  checkIns: CheckIn[]
  createdAt: string
}

export interface CheckIn {
  date: string
  completed: boolean
}

export interface Task {
  _id: string
  title: string
  description: string
  deadline: string
  priority: 'low' | 'medium' | 'high'
  completed: boolean
  completedAt?: string
  createdAt: string
}

export interface PresetHabit {
  name: string
  description: string
  category: string
  icon: string
  xpPerCompletion: number
}

export interface Coupon {
  code: string
  discount: number
  shop: string
}

export interface CheckInResult {
  message: string
  xpGained: number
  newMilestones: number[]
  leveledUp: boolean
  levelUpCoupon: Coupon | null
  habit: {
    streak: number
    totalCompletions: number
    milestones: number[]
  }
  user: {
    xp: number
    level: number
  }
}
