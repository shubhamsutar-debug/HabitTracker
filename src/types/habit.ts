export interface Habit {
  id: string
  name: string
  emoji: string
  description?: string
  order: number
  active: boolean
  createdAt: string // ISO date string
  archivedAt?: string // ISO date string, undefined if not archived
}

export interface HabitFormData {
  name: string
  emoji: string
  description?: string
  active: boolean
}
