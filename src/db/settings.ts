import { getDB } from './database'
import type { Settings } from '../types/settings'

const DEFAULT_SETTINGS: Settings = {
  id: 'settings',
  theme: 'light',
  weekStartsOn: 1,
  notificationsEnabled: false,
  onboardingCompleted: false,
}

export async function getSettings(): Promise<Settings> {
  const db = await getDB()
  const saved = await db.get('settings', 'settings')
  if (!saved) {
    await db.put('settings', DEFAULT_SETTINGS)
    return DEFAULT_SETTINGS
  }
  // Merge with defaults to handle schema additions
  return { ...DEFAULT_SETTINGS, ...saved }
}

export async function updateSettings(updates: Partial<Omit<Settings, 'id'>>): Promise<Settings> {
  const db = await getDB()
  const current = await getSettings()
  const updated: Settings = { ...current, ...updates }
  await db.put('settings', updated)
  return updated
}

export async function restoreSettings(settings: Partial<Settings>): Promise<void> {
  const db = await getDB()
  const current = await getSettings()
  const merged: Settings = { ...current, ...settings, id: 'settings' }
  await db.put('settings', merged)
}

export async function clearAllData(): Promise<void> {
  const db = await getDB()
  await db.clear('habits')
  await db.clear('habitLogs')
  await db.put('settings', { ...DEFAULT_SETTINGS })
}
