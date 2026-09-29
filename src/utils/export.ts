import type { Habit } from '../types/habit'
import type { HabitLog } from '../types/habitLog'
import type { Settings } from '../types/settings'
import { getAllHabits, getAllLogs, getSettings } from '../db'

export interface BackupData {
  version: number
  exportedAt: string
  habits: Habit[]
  habitLogs: HabitLog[]
  settings: Partial<Settings>
}

/** Export all data as a JSON backup file download */
export async function exportBackupJSON(): Promise<void> {
  const [habits, habitLogs, settings] = await Promise.all([
    getAllHabits(),
    getAllLogs(),
    getSettings(),
  ])

  const backup: BackupData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    habits,
    habitLogs,
    settings: {
      theme: settings.theme,
      weekStartsOn: settings.weekStartsOn,
      notificationsEnabled: settings.notificationsEnabled,
    },
  }

  const json = JSON.stringify(backup, null, 2)
  downloadFile(json, `habittrack-backup-${todayDateStr()}.json`, 'application/json')
}

/** Export habit logs as a CSV file download */
export async function exportCSV(): Promise<void> {
  const [habits, logs] = await Promise.all([getAllHabits(), getAllLogs()])
  const habitMap = new Map(habits.map((h) => [h.id, h]))

  const header = 'Date,Habit,Completed'
  const rows = logs
    .sort((a, b) => a.date.localeCompare(b.date) || a.habitId.localeCompare(b.habitId))
    .map((log) => {
      const habit = habitMap.get(log.habitId)
      const name = habit ? `"${habit.name.replace(/"/g, '""')}"` : `"${log.habitId}"`
      return `${log.date},${name},${log.completed}`
    })

  downloadFile([header, ...rows].join('\n'), `habittrack-export-${todayDateStr()}.csv`, 'text/csv')
}

/** Parse and validate a JSON backup file */
export function parseBackup(json: string): BackupData {
  let data: unknown
  try {
    data = JSON.parse(json)
  } catch {
    throw new Error('Invalid JSON file. Please select a valid HabitTrack backup.')
  }

  if (typeof data !== 'object' || data === null) {
    throw new Error('Backup file is not a valid object.')
  }

  const obj = data as Record<string, unknown>

  if (!Array.isArray(obj.habits)) {
    throw new Error('Backup is missing the habits array.')
  }

  if (!Array.isArray(obj.habitLogs)) {
    throw new Error('Backup is missing the habitLogs array.')
  }

  // Validate habit shape
  for (const h of obj.habits as unknown[]) {
    if (typeof h !== 'object' || h === null) throw new Error('Invalid habit entry in backup.')
    const habit = h as Record<string, unknown>
    if (typeof habit.id !== 'string' || typeof habit.name !== 'string') {
      throw new Error('Backup contains habits with missing id or name.')
    }
  }

  // Validate log shape
  for (const l of obj.habitLogs as unknown[]) {
    if (typeof l !== 'object' || l === null) throw new Error('Invalid log entry in backup.')
    const log = l as Record<string, unknown>
    if (typeof log.id !== 'string' || typeof log.habitId !== 'string' || typeof log.date !== 'string') {
      throw new Error('Backup contains logs with missing required fields.')
    }
  }

  return {
    version: typeof obj.version === 'number' ? obj.version : 1,
    exportedAt: typeof obj.exportedAt === 'string' ? obj.exportedAt : '',
    habits: obj.habits as Habit[],
    habitLogs: obj.habitLogs as HabitLog[],
    settings: typeof obj.settings === 'object' && obj.settings !== null
      ? (obj.settings as Partial<Settings>)
      : {},
  }
}

/** Trigger a file download in the browser */
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function todayDateStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Read a File object as text */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target?.result as string)
    reader.onerror = () => reject(new Error('Failed to read file.'))
    reader.readAsText(file)
  })
}
