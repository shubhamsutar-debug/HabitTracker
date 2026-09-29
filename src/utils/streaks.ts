import type { HabitLog } from '../types/habitLog'
import { todayString, addDays, daysBetween } from './dates'

/**
 * Build a Set of completed dates from an array of logs.
 * Only includes dates where completed === true.
 */
function buildCompletedSet(logs: HabitLog[]): Set<string> {
  const set = new Set<string>()
  for (const log of logs) {
    if (log.completed) set.add(log.date)
  }
  return set
}

export interface StreakResult {
  current: number
  best: number
}

/**
 * Calculate current and best streak for a single habit.
 *
 * Rules:
 * - A streak is broken by a day with no completion (missed day).
 * - Future dates are ignored entirely.
 * - If today is not yet completed, we look at yesterday's streak and keep it
 *   (today hasn't been checked yet, streak is not broken by the future).
 * - Historical edits recalculate correctly because we work from the full log set.
 */
export function calculateStreak(logs: HabitLog[], habitCreatedAt: string): StreakResult {
  if (logs.length === 0) return { current: 0, best: 0 }

  const today = todayString()
  const completedSet = buildCompletedSet(logs)

  // Determine the earliest date we need to check: habit creation date
  const createdDate = habitCreatedAt.slice(0, 10) // YYYY-MM-DD portion

  // Collect all past+today dates from creation until today
  const totalDays = daysBetween(createdDate, today)
  if (totalDays < 0) return { current: 0, best: 0 }

  // Walk forward from createdDate to today, recording streaks
  let currentStreak = 0
  let bestStreak = 0
  let tempStreak = 0

  for (let i = 0; i <= totalDays; i++) {
    const date = addDays(createdDate, i)
    if (date > today) break // never count future

    if (completedSet.has(date)) {
      tempStreak++
      if (tempStreak > bestStreak) bestStreak = tempStreak
    } else {
      // If it's today and not yet completed, don't break the streak —
      // carry forward yesterday's streak as current
      if (date === today) {
        // today not done yet; current streak = streak going into today
        currentStreak = tempStreak
        break
      }
      tempStreak = 0
    }
  }

  // If we iterated all the way through (today IS completed)
  if (completedSet.has(today)) {
    currentStreak = tempStreak
  }

  return { current: currentStreak, best: bestStreak }
}

/**
 * Calculate overall streak across ALL habits for a given day.
 * A day counts as "completed" if ALL active habits on that day were completed.
 */
export function calculateOverallStreak(
  allLogs: HabitLog[],
  activeHabitIds: string[],
  earliestDate: string,
): StreakResult {
  if (activeHabitIds.length === 0) return { current: 0, best: 0 }

  const today = todayString()
  const totalDays = daysBetween(earliestDate, today)
  if (totalDays < 0) return { current: 0, best: 0 }

  // Group logs by date → set of completed habitIds
  const byDate = new Map<string, Set<string>>()
  for (const log of allLogs) {
    if (!log.completed) continue
    if (!byDate.has(log.date)) byDate.set(log.date, new Set())
    byDate.get(log.date)!.add(log.habitId)
  }

  let currentStreak = 0
  let bestStreak = 0
  let tempStreak = 0

  for (let i = 0; i <= totalDays; i++) {
    const date = addDays(earliestDate, i)
    if (date > today) break

    const completed = byDate.get(date)
    const allDone = activeHabitIds.every((id) => completed?.has(id))

    if (allDone) {
      tempStreak++
      if (tempStreak > bestStreak) bestStreak = tempStreak
    } else {
      if (date === today) {
        currentStreak = tempStreak
        break
      }
      tempStreak = 0
    }
  }

  if (byDate.has(today) && activeHabitIds.every((id) => byDate.get(today)?.has(id))) {
    currentStreak = tempStreak
  }

  return { current: currentStreak, best: bestStreak }
}
