import { useState, useEffect, useCallback } from 'react'
import type { Settings } from '../types'
import { getSettings, updateSettings } from '../db'

export interface UseSettingsReturn {
  settings: Settings | null
  loading: boolean
  update: (updates: Partial<Omit<Settings, 'id'>>) => Promise<void>
  reload: () => Promise<void>
}

export function useSettings(): UseSettingsReturn {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    try {
      const s = await getSettings()
      setSettings(s)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  const update = useCallback(
    async (updates: Partial<Omit<Settings, 'id'>>) => {
      const updated = await updateSettings(updates)
      setSettings(updated)
    },
    [],
  )

  return { settings, loading, update, reload }
}
