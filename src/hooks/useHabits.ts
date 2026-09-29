import { useState, useEffect, useCallback } from 'react'
import type { Habit, HabitFormData } from '../types'
import {
  getAllHabits,
  addHabit,
  updateHabit,
  archiveHabit,
  deleteHabit,
  reorderHabits,
} from '../db'

export interface UseHabitsReturn {
  habits: Habit[]
  activeHabits: Habit[]
  loading: boolean
  error: string | null
  reload: () => Promise<void>
  addNewHabit: (data: HabitFormData) => Promise<Habit>
  editHabit: (id: string, data: Partial<HabitFormData>) => Promise<void>
  archiveHabitById: (id: string) => Promise<void>
  deleteHabitById: (id: string) => Promise<void>
  reorder: (orderedIds: string[]) => Promise<void>
}

export function useHabits(): UseHabitsReturn {
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    try {
      setError(null)
      const all = await getAllHabits()
      setHabits(all)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load habits')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  const addNewHabit = useCallback(
    async (data: HabitFormData): Promise<Habit> => {
      const habit = await addHabit(data)
      await reload()
      return habit
    },
    [reload],
  )

  const editHabit = useCallback(
    async (id: string, data: Partial<HabitFormData>) => {
      await updateHabit(id, data)
      await reload()
    },
    [reload],
  )

  const archiveHabitById = useCallback(
    async (id: string) => {
      await archiveHabit(id)
      await reload()
    },
    [reload],
  )

  const deleteHabitById = useCallback(
    async (id: string) => {
      await deleteHabit(id)
      await reload()
    },
    [reload],
  )

  const reorder = useCallback(
    async (orderedIds: string[]) => {
      await reorderHabits(orderedIds)
      await reload()
    },
    [reload],
  )

  const activeHabits = habits.filter((h) => h.active && !h.archivedAt)

  return {
    habits,
    activeHabits,
    loading,
    error,
    reload,
    addNewHabit,
    editHabit,
    archiveHabitById,
    deleteHabitById,
    reorder,
  }
}
