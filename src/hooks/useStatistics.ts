import { useMemo } from 'react'
import type { Habit } from '../types'
import type { HabitLog } from '../types'
import { calculateOverallStats, type OverallStats } from '../utils/calculations'

/** Pass all habits (active + archived); the function filters internally */
export function useStatistics(habits: Habit[], logs: HabitLog[]): OverallStats {
  return useMemo(() => calculateOverallStats(habits, logs), [habits, logs])
}
