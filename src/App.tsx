import { lazy, Suspense, useEffect, useState, useCallback } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useTheme } from './hooks/useTheme'
import { getSettings } from './db/settings'
import { BottomNavigation } from './components/BottomNavigation'
import { AccountabilityModal } from './components/AccountabilityModal'
import { Logo } from './components/Logo'
import { useHabits } from './hooks/useHabits'
import { useHabitLogsForDate } from './hooks/useHabitLogs'
import { useNotificationScheduler, useAccountabilityCheck } from './hooks/useNotifications'
import { useSettings } from './hooks/useSettings'
import { todayString } from './utils/dates'
import type { Habit } from './types'

const Today      = lazy(() => import('./pages/Today/Today').then(m => ({ default: m.Today })))
const History    = lazy(() => import('./pages/History/History').then(m => ({ default: m.History })))
const Statistics = lazy(() => import('./pages/Statistics/Statistics').then(m => ({ default: m.Statistics })))
const Habits     = lazy(() => import('./pages/Habits/Habits').then(m => ({ default: m.Habits })))
const Settings   = lazy(() => import('./pages/Settings/Settings').then(m => ({ default: m.Settings })))
const Onboarding = lazy(() => import('./pages/Onboarding/Onboarding').then(m => ({ default: m.Onboarding })))
const Widget     = lazy(() => import('./pages/Widget/Widget').then(m => ({ default: m.Widget })))

function PageSpinner() {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50dvh', flexDirection: 'column', gap: 16 }}>
      <Logo size={44} animate />
      <div style={{ display: 'flex', gap: 6 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 7, height: 7, borderRadius: '50%',
            background: 'var(--c-primary)',
            animation: `pulseDot 1.2s ease-in-out infinite ${i * 0.2}s`,
          }} />
        ))}
      </div>
    </div>
  )
}

type AppState = 'loading' | 'onboarding' | 'app'

// Accountability wrapper — lives inside BrowserRouter so hooks work
function AppWithAccountability() {
  const today = todayString()
  const { activeHabits } = useHabits()
  const { logs, toggle } = useHabitLogsForDate(today)
  const { settings } = useSettings()
  const [showAccountability, setShowAccountability] = useState(false)

  const incompleteHabits: Habit[] = activeHabits.filter(
    h => !logs.some(l => l.habitId === h.id && l.completed)
  )

  const getIncompleteCount = useCallback(
    () => incompleteHabits.length,
    [incompleteHabits.length]
  )

  const notifEnabled = settings?.notificationsEnabled ?? false

  // Schedule notifications
  useNotificationScheduler(notifEnabled, getIncompleteCount)

  // 11pm accountability trigger
  useAccountabilityCheck(
    true, // Always active, not just when notifications are on
    incompleteHabits.length,
    useCallback(() => setShowAccountability(true), [])
  )

  // Also: check on visibility change (when user opens tab at or after 11pm)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        const hour = new Date().getHours()
        if (hour >= 23 && incompleteHabits.length > 0) {
          const key = 'ht_accountability_date'
          if (localStorage.getItem(key) !== todayString()) {
            localStorage.setItem(key, todayString())
            setShowAccountability(true)
          }
        }
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [incompleteHabits.length])

  return (
    <>
      <AccountabilityModal
        open={showAccountability}
        incompleteHabits={incompleteHabits}
        onComplete={async (habitId) => {
          await toggle(habitId, today)
        }}
        onDismissWithReason={(habitId, reason) => {
          // Store reason in localStorage for record
          const key = `ht_reason_${today}_${habitId}`
          localStorage.setItem(key, reason)
        }}
        onClose={() => setShowAccountability(false)}
      />
    </>
  )
}

function AppShell() {
  const [state, setState] = useState<AppState>('loading')
  useTheme()

  useEffect(() => {
    getSettings()
      .then(s => setState(s.onboardingCompleted ? 'app' : 'onboarding'))
      .catch(() => setState('app'))
  }, [])

  if (state === 'loading') return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--grad-hero)',
      flexDirection: 'column',
      gap: 32,
    }}>
      {/* Animated background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}>
        <div style={{
          position: 'absolute', top: '20%', left: '10%',
          width: 300, height: 300, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(76,175,120,0.12) 0%, transparent 70%)',
          animation: 'float 8s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: '20%', right: '5%',
          width: 250, height: 250, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)',
          animation: 'float 10s ease-in-out infinite 2s',
        }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
        <Logo size={80} showText animate variant="splash" />
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', margin: 0, textAlign: 'center' }}>
          Build Better Days, One Habit at a Time
        </p>
      </div>

      <div style={{ display: 'flex', gap: 8, position: 'relative', zIndex: 1 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 8, height: 8, borderRadius: '50%',
            background: '#4CAF78',
            animation: `pulseDot 1.2s ease-in-out infinite ${i * 0.2}s`,
          }} />
        ))}
      </div>

      <style>{`
        @keyframes float { 0%,100% { transform:translateY(0);} 50%{ transform:translateY(-12px);} }
        @keyframes pulseDot { 0%,100%{transform:scale(1);opacity:1;} 50%{transform:scale(1.5);opacity:0.5;} }
      `}</style>
    </div>
  )

  if (state === 'onboarding') return (
    <Suspense fallback={<PageSpinner />}>
      <Onboarding onComplete={() => setState('app')} />
    </Suspense>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      <Suspense fallback={<PageSpinner />}>
        <Routes>
          <Route path="/"         element={<Today />} />
          <Route path="/history"  element={<History />} />
          <Route path="/stats"    element={<Statistics />} />
          <Route path="/habits"   element={<Habits />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/widget"   element={<Widget />} />
          <Route path="*"         element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <BottomNavigation />
      <AppWithAccountability />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}
