import { getDB } from './database'
import type { Habit, HabitFormData } from '../types/habit'

function generateId(): string {
  return `habit_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

export async function getAllHabits(): Promise<Habit[]> {
  const db = await getDB()
  const habits = await db.getAllFromIndex('habits', 'by-order')
  return habits
}

export async function getActiveHabits(): Promise<Habit[]> {
  const all = await getAllHabits()
  return all.filter((h) => h.active && !h.archivedAt)
}

export async function getHabitById(id: string): Promise<Habit | undefined> {
  const db = await getDB()
  return db.get('habits', id)
}

export async function addHabit(data: HabitFormData): Promise<Habit> {
  const db = await getDB()
  const all = await getAllHabits()
  const maxOrder = all.reduce((max, h) => Math.max(max, h.order), -1)

  const habit: Habit = {
    id: generateId(),
    name: data.name.trim(),
    emoji: data.emoji || '✅',
    description: data.description?.trim(),
    order: maxOrder + 1,
    active: data.active ?? true,
    createdAt: new Date().toISOString(),
  }

  await db.put('habits', habit)
  return habit
}

export async function updateHabit(id: string, updates: Partial<HabitFormData>): Promise<Habit> {
  const db = await getDB()
  const existing = await db.get('habits', id)
  if (!existing) throw new Error(`Habit ${id} not found`)

  const updated: Habit = {
    ...existing,
    name: updates.name !== undefined ? updates.name.trim() : existing.name,
    emoji: updates.emoji !== undefined ? updates.emoji : existing.emoji,
    description: updates.description !== undefined ? updates.description?.trim() : existing.description,
    active: updates.active !== undefined ? updates.active : existing.active,
  }

  await db.put('habits', updated)
  return updated
}

export async function unarchiveHabit(id: string): Promise<void> {
  const db = await getDB()
  const existing = await db.get('habits', id)
  if (!existing) return
  const { archivedAt: _removed, ...rest } = existing
  const updated: Habit = { ...rest, active: true }
  await db.put('habits', updated)
}

export async function archiveHabit(id: string): Promise<void> {
  const db = await getDB()
  const existing = await db.get('habits', id)
  if (!existing) return

  const updated: Habit = {
    ...existing,
    active: false,
    archivedAt: new Date().toISOString(),
  }
  await db.put('habits', updated)
}

export async function deleteHabit(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('habits', id)
  // Also delete all logs for this habit
  const tx = db.transaction('habitLogs', 'readwrite')
  const index = tx.store.index('by-habitId')
  let cursor = await index.openCursor(IDBKeyRange.only(id))
  while (cursor) {
    await cursor.delete()
    cursor = await cursor.continue()
  }
  await tx.done
}

export async function reorderHabits(orderedIds: string[]): Promise<void> {
  const db = await getDB()
  const tx = db.transaction('habits', 'readwrite')
  for (let i = 0; i < orderedIds.length; i++) {
    const habit = await tx.store.get(orderedIds[i])
    if (habit) {
      await tx.store.put({ ...habit, order: i })
    }
  }
  await tx.done
}

export async function restoreHabits(habits: Habit[]): Promise<void> {
  const db = await getDB()
  const tx = db.transaction('habits', 'readwrite')
  await tx.store.clear()
  for (const h of habits) {
    await tx.store.put(h)
  }
  await tx.done
}
