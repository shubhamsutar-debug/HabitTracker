export interface HabitLog {
  id: string
  habitId: string
  date: string // YYYY-MM-DD local date string
  completed: boolean
  updatedAt: string // ISO date string
}
