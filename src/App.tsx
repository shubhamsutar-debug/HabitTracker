import { lazy, Suspense, useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useTheme } from './hooks/useTheme'
import { getSettings } from './db/settings'
import { BottomNavigation } from './components/BottomNavigation'

/* ── Lazy-loaded page bundles — each route is a separate chunk ── */
const Today      = lazy(() => import('./pages/Today/Today').then(m => ({ default: m.Today })))
const History    = lazy(() => import('./pages/History/History').then(m => ({ default: m.History })))
const Statistics = lazy(() => import('./pages/Statistics/Statistics').then(m => ({ default: m.Statistics })))
const Habits     = lazy(() => import('./pages/Habits/Habits').then(m => ({ default: m.Habits })))
const Settings   = lazy(() => import('./pages/Settings/Settings').then(m => ({ default: m.Settings })))
const Onboarding = lazy(() => import('./pages/Onboarding/Onboarding').then(m => ({ default: m.Onboarding })))

/* ── Shared page spinner (shown while a lazy chunk loads) ── */
function PageSpinner() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[50dvh]">
      <div className="w-7 h-7 border-[3px] border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

/* ── App splash screen (initial DB load) ── */
function SplashScreen() {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-white dark:bg-slate-900">
      <div className="flex flex-col items-center gap-5">
        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50">
          <span className="text-white text-2xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>H</span>
        </div>
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  )
}

type AppState = 'loading' | 'onboarding' | 'app'

function AppShell() {
  const [state, setState] = useState<AppState>('loading')
  useTheme() // syncs theme class to <html> on mount

  useEffect(() => {
    getSettings()
      .then(s => setState(s.onboardingCompleted ? 'app' : 'onboarding'))
      .catch(() => setState('app')) // IndexedDB unavailable — still show app
  }, [])

  if (state === 'loading') return <SplashScreen />

  if (state === 'onboarding') {
    return (
      <Suspense fallback={<PageSpinner />}>
        <Onboarding onComplete={() => setState('app')} />
      </Suspense>
    )
  }

  return (
    <div className="flex flex-col min-h-dvh">
      <Suspense fallback={<PageSpinner />}>
        <Routes>
          <Route path="/"        element={<Today />} />
          <Route path="/history" element={<History />} />
          <Route path="/stats"   element={<Statistics />} />
          <Route path="/habits"  element={<Habits />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*"        element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <BottomNavigation />
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
