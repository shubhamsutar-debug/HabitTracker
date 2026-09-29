import { getDB } from './database'
import type { HabitLog } from '../types/habitLog'

function generateLogId(habitId: string, date: string): string {
  return `log_${habitId}_${date}`
}

export async function getLog(habitId: string, date: string): Promise<HabitLog | undefined> {
  const db = await getDB()
  const id = generateLogId(habitId, date)
  return db.get('habitLogs', id)
}

export async function setLog(habitId: string, date: string, completed: boolean): Promise<HabitLog> {
  const db = await getDB()
  const log: HabitLog = {
    id: generateLogId(habitId, date),
    habitId,
    date,
    completed,
    updatedAt: new Date().toISOString(),
  }
  await db.put('habitLogs', log)
  return log
}

export async function toggleLog(habitId: string, date: string): Promise<HabitLog> {
  const existing = await getLog(habitId, date)
  return setLog(habitId, date, !existing?.completed)
}

export async function getLogsForDate(date: string): Promise<HabitLog[]> {
  const db = await getDB()
  return db.getAllFromIndex('habitLogs', 'by-date', date)
}

export async function getLogsForHabit(habitId: string): Promise<HabitLog[]> {
  const db = await getDB()
  return db.getAllFromIndex('habitLogs', 'by-habitId', habitId)
}

export async function getLogsForDateRange(startDate: string, endDate: string): Promise<HabitLog[]> {
  const db = await getDB()
  const range = IDBKeyRange.bound(startDate, endDate)
  return db.getAllFromIndex('habitLogs', 'by-date', range)
}

export async function getAllLogs(): Promise<HabitLog[]> {
  const db = await getDB()
  return db.getAll('habitLogs')
}

export async function restoreLogs(logs: HabitLog[]): Promise<void> {
  const db = await getDB()
  const tx = db.transaction('habitLogs', 'readwrite')
  await tx.store.clear()
  for (const log of logs) {
    await tx.store.put(log)
  }
  await tx.done
}

export async function clearAllLogs(): Promise<void> {
  const db = await getDB()
  await db.clear('habitLogs')
}
