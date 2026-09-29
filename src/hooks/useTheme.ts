import { useState, useEffect, useCallback } from 'react'
import type { Theme } from '../types'
import { getSettings, updateSettings } from '../db'

export interface UseThemeReturn {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => Promise<void>
}

/** Get the system color scheme preference */
function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/** Apply theme to the document root */
function applyTheme(resolved: 'light' | 'dark') {
  const root = document.documentElement
  if (resolved === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

export function useTheme(): UseThemeReturn {
  const [theme, setThemeState] = useState<Theme>('light')

  const resolvedTheme: 'light' | 'dark' =
    theme === 'system' ? getSystemTheme() : theme

  // Load from DB on mount
  useEffect(() => {
    void getSettings().then((s) => {
      setThemeState(s.theme)
      const resolved = s.theme === 'system' ? getSystemTheme() : s.theme
      applyTheme(resolved)
    })
  }, [])

  // Listen for system theme changes when theme === 'system'
  useEffect(() => {
    if (theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => applyTheme(getSystemTheme())
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  // Apply whenever resolvedTheme changes
  useEffect(() => {
    applyTheme(resolvedTheme)
  }, [resolvedTheme])

  const setTheme = useCallback(async (newTheme: Theme) => {
    setThemeState(newTheme)
    const resolved = newTheme === 'system' ? getSystemTheme() : newTheme
    applyTheme(resolved)
    await updateSettings({ theme: newTheme })
  }, [])

  return { theme, resolvedTheme, setTheme }
}
