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

// ─── Send a browser notification ───
function sendNotif(title: string, body: string, tag: string, urgent = false) {
  if (typeof window === 'undefined' || !('Notification' in window)) return
  if (window.Notification.permission !== 'granted') return
  try {
    new window.Notification(title, {
      body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag,
      requireInteraction: urgent,
      silent: false,
    })
  } catch (_) { /* silent */ }
}

// ─── Schedule helpers ───
function getNextAlarmMs(hour: number, minute: number): number {
  const now = new Date()
  const target = new Date(now)
  target.setHours(hour, minute, 0, 0)
  if (target <= now) target.setDate(target.getDate() + 1)
  return target.getTime() - now.getTime()
}

// Notification schedule
const MORNING_HOUR   = 7   // 7am  – Morning kickstart
const MID_MORNING    = 10  // 10am – Halfway morning nudge
const AFTERNOON_HOUR = 13  // 1pm  – Post-lunch reminder
const MID_AFTERNOON  = 16  // 4pm  – Afternoon hustle
const EVENING_HOUR   = 19  // 7pm  – Evening heads up
const PRE_NIGHT      = 21  // 9pm  – Pre-accountability warning
const EVENING_FINAL  = 23  // 11pm – Final accountability

const ACCOUNTABILITY_KEY = 'ht_accountability_date'

const MORNING_MESSAGES = [
  { title: '🌅 Rise & Grind!', body: "Today's habits are waiting. Start strong and own the day! 💪" },
  { title: '☀️ New Day, New You!', body: "Your streak is on the line. Let's build it higher today! 🔥" },
  { title: '🌄 Morning Champion!', body: "Successful people act first thing. Check your habits now!" },
]

const MIDDAY_MESSAGES = [
  { title: '⏰ Midday Check-In', body: "How are your habits going? Don't let the day slip by! 🎯" },
  { title: '🎯 Halfway There!', body: "You're past morning — time to knock out your habits! 💥" },
]

const AFTERNOON_MESSAGES = [
  { title: '🌞 Afternoon Nudge', body: "Still some habits left? Best time to crush them is NOW!" },
  { title: '💪 Power Hour Alert!', body: "Top performers don't skip. Check your habits and stay consistent!" },
]

const EVENING_MESSAGES = [
  { title: '🌆 Evening Check', body: "Day's winding down. Seal those habits before it's too late! ⏳" },
  { title: "🔔 Don't Break the Chain!", body: "Your streak depends on today's effort. Complete your habits! 🔥" },
]

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function useNotificationScheduler(enabled: boolean, getIncompleteCount: () => number) {
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const intervals = useRef<ReturnType<typeof setInterval>[]>([])

  const clearAll = useCallback(() => {
    timers.current.forEach(clearTimeout)
    intervals.current.forEach(clearInterval)
    timers.current = []
    intervals.current = []
  }, [])

  useEffect(() => {
    if (!enabled) return

    const schedule = [
      // 7am – Morning
      {
        hour: MORNING_HOUR, minute: 0,
        send: () => {
          const msg = pick(MORNING_MESSAGES)
          sendNotif(msg.title, msg.body, 'ht-morning')
        },
      },
      // 10am – Mid morning
      {
        hour: MID_MORNING, minute: 0,
        send: () => {
          const count = getIncompleteCount()
          if (count > 0) {
            const msg = pick(MIDDAY_MESSAGES)
            sendNotif(msg.title, `${count} habit${count > 1 ? 's' : ''} left. ${msg.body}`, 'ht-midmorning')
          }
        },
      },
      // 1pm – Afternoon
      {
        hour: AFTERNOON_HOUR, minute: 0,
        send: () => {
          const count = getIncompleteCount()
          if (count > 0) {
            sendNotif('🍱 Post-Lunch Reminder', `${count} habit${count > 1 ? 's' : ''} pending. Afternoon is perfect for consistency! 💪`, 'ht-afternoon')
          }
        },
      },
      // 4pm – Mid afternoon
      {
        hour: MID_AFTERNOON, minute: 0,
        send: () => {
          const count = getIncompleteCount()
          if (count > 0) {
            const msg = pick(AFTERNOON_MESSAGES)
            sendNotif(msg.title, `Still ${count} habit${count > 1 ? 's' : ''} remaining! ${msg.body}`, 'ht-midafternoon')
          }
        },
      },
      // 7pm – Evening
      {
        hour: EVENING_HOUR, minute: 0,
        send: () => {
          const count = getIncompleteCount()
          if (count > 0) {
            const msg = pick(EVENING_MESSAGES)
            sendNotif(msg.title, `${count} habit${count > 1 ? 's' : ''} not done yet! ${msg.body}`, 'ht-evening')
          }
        },
      },
      // 9pm – Pre-accountability warning
      {
        hour: PRE_NIGHT, minute: 0,
        send: () => {
          const count = getIncompleteCount()
          if (count > 0) {
            sendNotif(
              '⚠️ Final Warning — 2 Hours Left!',
              `You have ${count} incomplete habit${count > 1 ? 's' : ''}. At 11pm, HabitTrack will open for accountability. Act now! 🚨`,
              'ht-prenight',
              true
            )
          }
        },
      },
      // 11pm – Final accountability
      {
        hour: EVENING_FINAL, minute: 0,
        send: () => {
          const count = getIncompleteCount()
          if (count > 0) {
            sendNotif(
              '🌙 Accountability Time — Day Ends NOW',
              `${count} habit${count > 1 ? 's' : ''} incomplete! Open HabitTrack to complete or explain. Your streak is at risk! 🔥`,
              'ht-final',
              true
            )
          }
        },
      },
    ]

    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000

    schedule.forEach(({ hour, minute, send }) => {
      const t = setTimeout(() => {
        send()
        const interval = setInterval(send, TWENTY_FOUR_HOURS)
        intervals.current.push(interval)
      }, getNextAlarmMs(hour, minute))
      timers.current.push(t)
    })

    return clearAll
  }, [enabled, getIncompleteCount, clearAll])
}

// ─── 11pm accountability modal trigger ───
export function useAccountabilityCheck(
  enabled: boolean,
  incompleteCount: number,
  onTrigger: () => void
) {
  const triggeredRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!enabled || incompleteCount === 0) {
      triggeredRef.current = false
      return
    }

    const alreadyShownToday = localStorage.getItem(ACCOUNTABILITY_KEY) === todayString()
    if (alreadyShownToday) return

    const now = new Date()
    const currentHour = now.getHours()

    // If it's already 11pm or later — show immediately
    if (currentHour >= EVENING_FINAL) {
      if (!triggeredRef.current) {
        triggeredRef.current = true
        localStorage.setItem(ACCOUNTABILITY_KEY, todayString())
        onTrigger()
      }
      return
    }

    // Schedule for 11pm
    const msUntil11pm = getNextAlarmMs(EVENING_FINAL, 0)
    timerRef.current = setTimeout(() => {
      if (incompleteCount > 0 && !triggeredRef.current) {
        triggeredRef.current = true
        localStorage.setItem(ACCOUNTABILITY_KEY, todayString())
        onTrigger()
      }
    }, msUntil11pm)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [enabled, incompleteCount, onTrigger])
}

export function useNotifications(storedEnabled: boolean): UseNotificationsReturn {
  const supported =
    typeof window !== 'undefined' &&
    'Notification' in window &&
    'serviceWorker' in navigator

  const [permission, setPermission] = useState<NotifPermission>(() => {
    if (!supported) return 'unsupported'
    return (window.Notification.permission as NotifPermission) ?? 'default'
  })

  const [enabled, setEnabled] = useState(storedEnabled && permission === 'granted')

  useEffect(() => {
    if (!supported) return
    setPermission(window.Notification.permission as NotifPermission)
  }, [supported])

  const requestPermission = useCallback(async (): Promise<NotifPermission> => {
    if (!supported) return 'unsupported'
    const result = await window.Notification.requestPermission()
    setPermission(result as NotifPermission)
    return result as NotifPermission
  }, [supported])

  const toggle = useCallback(async (on: boolean) => {
    if (on && permission !== 'granted') {
      const result = await requestPermission()
      if (result !== 'granted') return
    }
    setEnabled(on)
    await updateSettings({ notificationsEnabled: on })
  }, [permission, requestPermission])

  const sendTestNotification = useCallback(() => {
    sendNotif(
      '🔥 HabitTrack Test',
      "Notifications are ON! You'll receive 7 daily reminders to stay consistent. Let's go! 💪",
      'ht-test'
    )
  }, [])

  return { supported, permission, enabled, requestPermission, sendTestNotification, toggle }
}
