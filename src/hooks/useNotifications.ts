import { useState, useEffect, useCallback } from 'react'
import { updateSettings } from '../db/settings'

export type NotificationPermission = 'default' | 'granted' | 'denied' | 'unsupported'

export interface UseNotificationsReturn {
  supported: boolean
  permission: NotificationPermission
  enabled: boolean
  requestPermission: () => Promise<NotificationPermission>
  sendTestNotification: () => void
  toggle: (on: boolean) => Promise<void>
}

export function useNotifications(storedEnabled: boolean): UseNotificationsReturn {
  const supported =
    typeof window !== 'undefined' &&
    'Notification' in window &&
    'serviceWorker' in navigator

  const [permission, setPermission] = useState<NotificationPermission>(() => {
    if (!supported) return 'unsupported'
    return (window.Notification.permission as NotificationPermission) ?? 'default'
  })

  const [enabled, setEnabled] = useState(storedEnabled && permission === 'granted')

  // Sync when permission changes externally
  useEffect(() => {
    if (!supported) return
    setPermission(window.Notification.permission as NotificationPermission)
  }, [supported])

  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!supported) return 'unsupported'
    const result = await window.Notification.requestPermission()
    setPermission(result as NotificationPermission)
    return result as NotificationPermission
  }, [supported])

  const toggle = useCallback(
    async (on: boolean) => {
      if (on && permission !== 'granted') {
        const result = await requestPermission()
        if (result !== 'granted') return
      }
      setEnabled(on)
      await updateSettings({ notificationsEnabled: on })
    },
    [permission, requestPermission],
  )

  const sendTestNotification = useCallback(() => {
    if (!supported || permission !== 'granted') return
    new window.Notification('HabitTrack', {
      body: "Don't forget to complete your habits today! 💪",
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: 'habittrack-test',
    })
  }, [supported, permission])

  return { supported, permission, enabled, requestPermission, sendTestNotification, toggle }
}
