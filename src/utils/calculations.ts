import type { Habit } from '../types/habit'
import type { HabitLog } from '../types/habitLog'
import { todayString, addDays, isTodayOrPast } from './dates'
import { calculateStreak, calculateOverallStreak, type StreakResult } from './streaks'

export interface DayCompletion {
  date: string
  completed: number
  total: number
  percentage: number
}

export interface HabitStats {
  habitId: string
  name: string
  emoji: string
  totalDays: number
  completedDays: number
  missedDays: number
  percentage: number
  streak: StreakResult
}

export interface OverallStats {
  totalCompleted: number
  totalMissed: number
  overallPercentage: number
  currentStreak: StreakResult
  habitStats: HabitStats[]
  last7Days: DayCompletion[]
  last30Days: DayCompletion[]
}

/**
 * Calculate completion percentage for a specific date.
 */
export function getDayCompletion(
  date: string,
  activeHabits: Habit[],
  logs: HabitLog[],
): DayCompletion {
  if (!isTodayOrPast(date)) {
    return { date, completed: 0, total: activeHabits.length, percentage: 0 }
  }
  const logMap = new Map(logs.filter((l) => l.date === date).map((l) => [l.habitId, l]))
  const completed = activeHabits.filter((h) => logMap.get(h.id)?.completed).length
  const total = activeHabits.length
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100)
  return { date, completed, total, percentage }
}

/**
 * Calculate today's completion.
 */
export function getTodayCompletion(activeHabits: Habit[], logs: HabitLog[]): DayCompletion {
  return getDayCompletion(todayString(), activeHabits, logs)
}

/**
 * Get completion data for a range of days.
 */
export function getRangeCompletion(
  startDate: string,
  days: number,
  activeHabits: Habit[],
  logs: HabitLog[],
): DayCompletion[] {
  return Array.from({ length: days }, (_, i) => {
    const date = addDays(startDate, i)
    return getDayCompletion(date, activeHabits, logs)
  }).filter((d) => isTodayOrPast(d.date))
}

/**
 * Calculate all statistics for the Statistics page.
 */
export function calculateOverallStats(
  habits: Habit[],
  allLogs: HabitLog[],
): OverallStats {
  const today = todayString()
  const activeHabits = habits.filter((h) => h.active && !h.archivedAt)

  // Per-habit stats
  const habitStats: HabitStats[] = activeHabits.map((habit) => {
    const habitLogs = allLogs.filter((l) => l.habitId === habit.id)

    // Count days from creation until today (inclusive) that are in the past or today
    const createdDate = habit.createdAt.slice(0, 10)
    const totalDays = (() => {
      let count = 0
      let d = createdDate
      while (d <= today) {
        count++
        d = addDays(d, 1)
      }
      return count
    })()

    const completedDays = habitLogs.filter((l) => l.completed).length
    const missedDays = Math.max(0, totalDays - completedDays)
    const percentage = totalDays === 0 ? 0 : Math.round((completedDays / totalDays) * 100)
    const streak = calculateStreak(habitLogs, habit.createdAt)

    return {
      habitId: habit.id,
      name: habit.name,
      emoji: habit.emoji,
      totalDays,
      completedDays,
      missedDays,
      percentage,
      streak,
    }
  })

  const totalCompleted = habitStats.reduce((s, h) => s + h.completedDays, 0)
  const totalMissed = habitStats.reduce((s, h) => s + h.missedDays, 0)
  const grandTotal = totalCompleted + totalMissed
  const overallPercentage = grandTotal === 0 ? 0 : Math.round((totalCompleted / grandTotal) * 100)

  // Earliest habit creation date
  const earliestDate =
    activeHabits.length > 0
      ? activeHabits.reduce(
          (min, h) => (h.createdAt.slice(0, 10) < min ? h.createdAt.slice(0, 10) : min),
          activeHabits[0].createdAt.slice(0, 10),
        )
      : today

  const currentStreak = calculateOverallStreak(
    allLogs,
    activeHabits.map((h) => h.id),
    earliestDate,
  )

  // Last 7 days
  const last7Start = addDays(today, -6)
  const last7Days = getRangeCompletion(last7Start, 7, activeHabits, allLogs)

  // Last 30 days
  const last30Start = addDays(today, -29)
  const last30Days = getRangeCompletion(last30Start, 30, activeHabits, allLogs)

  return {
    totalCompleted,
    totalMissed,
    overallPercentage,
    currentStreak,
    habitStats,
    last7Days,
    last30Days,
  }
}

/** Safe percentage formatting: never returns NaN */
export function formatPercent(n: number): string {
  if (!isFinite(n) || isNaN(n)) return '0%'
  return `${Math.round(n)}%`
}
