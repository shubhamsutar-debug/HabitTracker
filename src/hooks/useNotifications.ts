import { useState, useEffect, useCallback, useRef } from 'react'
import { updateSettings } from '../db/settings'
import { todayString } from '../utils/dates'

export type NotifPermission = 'default' | 'granted' | 'denied' | 'unsupported'

export interface UseNotificationsReturn {
  supported: boolean
  permission: NotifPermission
  enabled: boolean
  requestPermission: () => Promise<NotifPermission>
  sendTestNotification: () => void
  toggle: (on: boolean) => Promise<void>
}

// ─────────────────────────────────────────────────────────────────
// Core sender — ALWAYS uses Service Worker on mobile Chrome/Android.
// Falls back to new Notification() on desktop browsers that support it.
// ─────────────────────────────────────────────────────────────────
async function sendNotif(
  title: string,
  body: string,
  tag: string,
  requireInteraction = false,
): Promise<void> {
  if (typeof window === 'undefined') return
  if (!('Notification' in window)) return
  if (window.Notification.permission !== 'granted') return

  const options: NotificationOptions = {
    body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag,
    requireInteraction,
    silent: false,
    // @ts-expect-error — vibrate is valid on Android but not in the TS types
    vibrate: [200, 100, 200],
  }

  // Service Worker path — required for Android Chrome
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready
      await reg.showNotification(title, options)
      return
    } catch (err) {
      console.warn('[HabitTrack] SW notification failed, falling back:', err)
    }
  }

  // Desktop fallback
  try {
    new window.Notification(title, options)
  } catch (err) {
    console.warn('[HabitTrack] Notification failed:', err)
  }
}

// ─────────────────────────────────────────────────────────────────
// Time helpers
// ─────────────────────────────────────────────────────────────────
function msUntil(hour: number, minute = 0): number {
  const now = new Date()
  const target = new Date(now)
  target.setHours(hour, minute, 0, 0)
  if (target <= now) target.setDate(target.getDate() + 1)
  return target.getTime() - now.getTime()
}

const TWENTY_FOUR_H = 24 * 60 * 60 * 1000
const ACCOUNTABILITY_KEY = 'ht_accountability_date'

// ─────────────────────────────────────────────────────────────────
// Message pools
// ─────────────────────────────────────────────────────────────────
const MORNING_MSGS = [
  { title: '🌅 Rise & Grind!',       body: "Today's habits are waiting. Start strong and own the day! 💪" },
  { title: '☀️ New Day, New You!',   body: 'Your streak is on the line. Build it higher today! 🔥' },
  { title: '🌄 Morning Champion!',   body: 'Successful people act first. Check your habits now!' },
]
const MIDMORNING_MSGS = [
  { title: '⏰ Midday Check-In',     body: "How are your habits going? Don't let the day slip by! 🎯" },
  { title: '🎯 Still Morning!',      body: "You're past breakfast — time to knock out your habits! 💥" },
]
const AFTERNOON_MSGS = [
  { title: '🍱 Post-Lunch Reminder', body: 'Afternoon is perfect for consistency! Get those habits done. 💪' },
  { title: '🌞 Afternoon Nudge',     body: 'Best time to crush remaining habits is RIGHT NOW!' },
]
const MIDAFTERNOON_MSGS = [
  { title: '💪 Power Hour Alert!',   body: "Top performers don't skip. Check your habits and stay consistent!" },
  { title: '🚀 4pm Push!',           body: "A few habits left? Knock them out before evening hits! 🎯" },
]
const EVENING_MSGS = [
  { title: '🌆 Evening Check',       body: "Day's winding down. Seal those habits before it's too late! ⏳" },
  { title: "🔔 Don't Break the Chain!", body: 'Your streak depends on today. Complete your habits! 🔥' },
]

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// ─────────────────────────────────────────────────────────────────
// Notification Scheduler Hook
// Schedules 7 daily notifications when enabled.
// Uses a stable ref for getIncompleteCount to avoid timer resets.
// ─────────────────────────────────────────────────────────────────
export function useNotificationScheduler(
  enabled: boolean,
  getIncompleteCount: () => number,
) {
  // Keep a stable ref so the scheduler timers always call the latest version
  // without needing to be re-scheduled every time logs change.
  const countRef = useRef(getIncompleteCount)
  useEffect(() => { countRef.current = getIncompleteCount }, [getIncompleteCount])

  const timersRef    = useRef<ReturnType<typeof setTimeout>[]>([])
  const intervalsRef = useRef<ReturnType<typeof setInterval>[]>([])

  useEffect(() => {
    if (!enabled) return

    // Clear any previous timers
    timersRef.current.forEach(clearTimeout)
    intervalsRef.current.forEach(clearInterval)
    timersRef.current = []
    intervalsRef.current = []

    type Slot = { hour: number; minute?: number; send: () => void }

    const slots: Slot[] = [
      // 7:00am – Morning kickstart
      {
        hour: 7,
        send: () => {
          const m = pick(MORNING_MSGS)
          void sendNotif(m.title, m.body, 'ht-morning')
        },
      },
      // 10:00am – Mid-morning nudge (only if habits left)
      {
        hour: 10,
        send: () => {
          const n = countRef.current()
          if (n <= 0) return
          const m = pick(MIDMORNING_MSGS)
          void sendNotif(m.title, `${n} habit${n > 1 ? 's' : ''} left. ${m.body}`, 'ht-midmorning')
        },
      },
      // 1:00pm – Post-lunch
      {
        hour: 13,
        send: () => {
          const n = countRef.current()
          if (n <= 0) return
          const m = pick(AFTERNOON_MSGS)
          void sendNotif(m.title, `${n} habit${n > 1 ? 's' : ''} pending. ${m.body}`, 'ht-afternoon')
        },
      },
      // 4:00pm – Mid-afternoon hustle
      {
        hour: 16,
        send: () => {
          const n = countRef.current()
          if (n <= 0) return
          const m = pick(MIDAFTERNOON_MSGS)
          void sendNotif(m.title, `Still ${n} habit${n > 1 ? 's' : ''} remaining. ${m.body}`, 'ht-midafternoon')
        },
      },
      // 7:00pm – Evening heads up
      {
        hour: 19,
        send: () => {
          const n = countRef.current()
          if (n <= 0) return
          const m = pick(EVENING_MSGS)
          void sendNotif(m.title, `${n} habit${n > 1 ? 's' : ''} not done yet. ${m.body}`, 'ht-evening')
        },
      },
      // 9:00pm – Pre-accountability warning (requireInteraction=true on mobile)
      {
        hour: 21,
        send: () => {
          const n = countRef.current()
          if (n <= 0) return
          void sendNotif(
            '⚠️ Final Warning — 2 Hours Left!',
            `${n} incomplete habit${n > 1 ? 's' : ''}. At 11pm HabitTrack will ask you to complete or explain. Act now! 🚨`,
            'ht-prenight',
            true,
          )
        },
      },
      // 11:00pm – Final accountability push
      {
        hour: 23,
        send: () => {
          const n = countRef.current()
          if (n <= 0) return
          void sendNotif(
            '🌙 Accountability Time — Day Ends NOW',
            `${n} habit${n > 1 ? 's' : ''} incomplete! Open HabitTrack to complete or explain. Streak at risk! 🔥`,
            'ht-final',
            true,
          )
        },
      },
    ]

    // For each slot, set a timeout to first fire, then an interval every 24h
    for (const { hour, minute = 0, send } of slots) {
      const delay = msUntil(hour, minute)
      const t = setTimeout(() => {
        send()
        const iv = setInterval(send, TWENTY_FOUR_H)
        intervalsRef.current.push(iv)
      }, delay)
      timersRef.current.push(t)
    }

    return () => {
      timersRef.current.forEach(clearTimeout)
      intervalsRef.current.forEach(clearInterval)
      timersRef.current = []
      intervalsRef.current = []
    }
  }, [enabled]) // ← only re-runs if enabled changes; countRef stays live via the effect above

}

// ─────────────────────────────────────────────────────────────────
// Accountability Check Hook — triggers the 11pm modal
// ─────────────────────────────────────────────────────────────────
export function useAccountabilityCheck(
  enabled: boolean,
  incompleteCount: number,
  onTrigger: () => void,
) {
  const triggeredRef = useRef(false)
  const timerRef     = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Keep onTrigger stable
  const onTriggerRef = useRef(onTrigger)
  useEffect(() => { onTriggerRef.current = onTrigger }, [onTrigger])

  useEffect(() => {
    if (!enabled || incompleteCount === 0) {
      triggeredRef.current = false
      return
    }

    const alreadyShownToday = localStorage.getItem(ACCOUNTABILITY_KEY) === todayString()
    if (alreadyShownToday) return

    const hour = new Date().getHours()

    // Already past 11pm — fire immediately
    if (hour >= 23) {
      if (!triggeredRef.current) {
        triggeredRef.current = true
        localStorage.setItem(ACCOUNTABILITY_KEY, todayString())
        onTriggerRef.current()
      }
      return
    }

    // Schedule for 11pm
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      if (!triggeredRef.current) {
        triggeredRef.current = true
        localStorage.setItem(ACCOUNTABILITY_KEY, todayString())
        onTriggerRef.current()
      }
    }, msUntil(23, 0))

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [enabled, incompleteCount]) // re-evaluates when count changes (e.g. user completes habits)
}

// ─────────────────────────────────────────────────────────────────
// Main useNotifications hook (used in Settings)
// ─────────────────────────────────────────────────────────────────
export function useNotifications(storedEnabled: boolean): UseNotificationsReturn {
  const supported =
    typeof window !== 'undefined' &&
    'Notification' in window &&
    'serviceWorker' in navigator

  const getCurrentPermission = (): NotifPermission => {
    if (!supported) return 'unsupported'
    return window.Notification.permission as NotifPermission
  }

  const [permission, setPermission] = useState<NotifPermission>(getCurrentPermission)

  // ── FIX: sync enabled whenever storedEnabled OR permission changes ──
  const [enabled, setEnabled] = useState(storedEnabled && getCurrentPermission() === 'granted')
  useEffect(() => {
    const perm = getCurrentPermission()
    setPermission(perm)
    setEnabled(storedEnabled && perm === 'granted')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storedEnabled])

  const requestPermission = useCallback(async (): Promise<NotifPermission> => {
    if (!supported) return 'unsupported'
    const result = await window.Notification.requestPermission()
    const perm = result as NotifPermission
    setPermission(perm)
    return perm
  }, [supported])

  const toggle = useCallback(async (on: boolean) => {
    if (on) {
      // Always re-request or check permission when turning on
      const perm = getCurrentPermission()
      if (perm !== 'granted') {
        const result = await requestPermission()
        if (result !== 'granted') return // user denied
      }
    }
    const newEnabled = on && getCurrentPermission() === 'granted'
    setEnabled(newEnabled)
    await updateSettings({ notificationsEnabled: newEnabled })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestPermission])

  const sendTestNotification = useCallback(() => {
    void sendNotif(
      '🔥 HabitTrack — Test Notification',
      "Notifications are working! You'll get 7 daily reminders to stay consistent. Let's go! 💪",
      'ht-test',
    )
  }, [])

  return { supported, permission, enabled, requestPermission, sendTestNotification, toggle }
}
