import { openDB, type IDBPDatabase } from 'idb'
import type { Habit } from '../types/habit'
import type { HabitLog } from '../types/habitLog'
import type { Settings } from '../types/settings'

const DB_NAME = 'habittrack-db'
const DB_VERSION = 1

export interface HabitTrackDB {
  habits: {
    key: string
    value: Habit
    indexes: { 'by-order': number; 'by-active': number }
  }
  habitLogs: {
    key: string
    value: HabitLog
    indexes: { 'by-habitId': string; 'by-date': string; 'by-habitId-date': [string, string] }
  }
  settings: {
    key: string
    value: Settings
  }
}

let dbPromise: Promise<IDBPDatabase<HabitTrackDB>> | null = null

export function getDB(): Promise<IDBPDatabase<HabitTrackDB>> {
  if (!dbPromise) {
    dbPromise = openDB<HabitTrackDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Habits store
        if (!db.objectStoreNames.contains('habits')) {
          const habitStore = db.createObjectStore('habits', { keyPath: 'id' })
          habitStore.createIndex('by-order', 'order')
          habitStore.createIndex('by-active', 'active')
        }

        // HabitLogs store
        if (!db.objectStoreNames.contains('habitLogs')) {
          const logStore = db.createObjectStore('habitLogs', { keyPath: 'id' })
          logStore.createIndex('by-habitId', 'habitId')
          logStore.createIndex('by-date', 'date')
          logStore.createIndex('by-habitId-date', ['habitId', 'date'])
        }

        // Settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'id' })
        }
      },
      blocked() {
        console.warn('HabitTrack DB: upgrade blocked by another tab')
      },
      blocking() {
        console.warn('HabitTrack DB: blocking another tab upgrade')
      },
    })
  }
  return dbPromise
}
