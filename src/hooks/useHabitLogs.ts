import { useState, useEffect, useCallback, useRef } from 'react'
import type { HabitLog } from '../types'
import { getLogsForDate, getLogsForDateRange, toggleLog, setLog, getAllLogs } from '../db'
import { todayString } from '../utils/dates'

export interface UseHabitLogsReturn {
  logs: HabitLog[]
  loading: boolean
  error: string | null
  toggle: (habitId: string, date?: string) => Promise<void>
  setCompleted: (habitId: string, date: string, completed: boolean) => Promise<void>
  reload: () => Promise<void>
  getLogForHabit: (habitId: string) => HabitLog | undefined
}

/** Hook for managing logs for a single date (defaults to today) */
export function useHabitLogsForDate(date?: string): UseHabitLogsReturn {
  const targetDate = date ?? todayString()
  const [logs, setLogs] = useState<HabitLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    try {
      setError(null)
      const result = await getLogsForDate(targetDate)
      setLogs(result)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load logs')
    } finally {
      setLoading(false)
    }
  }, [targetDate])

  useEffect(() => {
    setLoading(true)
    void reload()
  }, [reload])

  const toggle = useCallback(
    async (habitId: string, _date?: string) => {
      const d = _date ?? targetDate
      await toggleLog(habitId, d)
      await reload()
    },
    [targetDate, reload],
  )

  const setCompleted = useCallback(
    async (habitId: string, d: string, completed: boolean) => {
      await setLog(habitId, d, completed)
      if (d === targetDate) await reload()
    },
    [targetDate, reload],
  )

  const getLogForHabit = useCallback(
    (habitId: string) => logs.find((l) => l.habitId === habitId),
    [logs],
  )

  return { logs, loading, error, toggle, setCompleted, reload, getLogForHabit }
}

export interface UseDateRangeLogsReturn {
  logs: HabitLog[]
  loading: boolean
  error: string | null
  reload: () => Promise<void>
  setCompleted: (habitId: string, date: string, completed: boolean) => Promise<void>
}

/** Hook for managing logs over a date range (for history grid) */
export function useDateRangeLogs(startDate: string, endDate: string): UseDateRangeLogsReturn {
  const [logs, setLogs] = useState<HabitLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Track the current range to avoid stale reloads
  const rangeRef = useRef({ startDate, endDate })
  rangeRef.current = { startDate, endDate }

  const reload = useCallback(async () => {
    try {
      setError(null)
      const result = await getLogsForDateRange(startDate, endDate)
      setLogs(result)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load logs')
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate])

  useEffect(() => {
    setLoading(true)
    void reload()
  }, [reload])

  const setCompleted = useCallback(
    async (habitId: string, date: string, completed: boolean) => {
      await setLog(habitId, date, completed)
      await reload()
    },
    [reload],
  )

  return { logs, loading, error, reload, setCompleted }
}

export interface UseAllLogsReturn {
  logs: HabitLog[]
  loading: boolean
  error: string | null
  reload: () => Promise<void>
}

/** Hook for all logs (used for statistics) */
export function useAllLogs(): UseAllLogsReturn {
  const [logs, setLogs] = useState<HabitLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    try {
      setError(null)
      const result = await getAllLogs()
      setLogs(result)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load logs')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  return { logs, loading, error, reload }
}
