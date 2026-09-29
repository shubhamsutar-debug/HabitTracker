import { lazy, Suspense, useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useTheme } from './hooks/useTheme'
import { getSettings } from './db/settings'
import { BottomNavigation } from './components/BottomNavigation'

const Today      = lazy(() => import('./pages/Today/Today').then(m => ({ default: m.Today })))
const History    = lazy(() => import('./pages/History/History').then(m => ({ default: m.History })))
const Statistics = lazy(() => import('./pages/Statistics/Statistics').then(m => ({ default: m.Statistics })))
const Habits     = lazy(() => import('./pages/Habits/Habits').then(m => ({ default: m.Habits })))
const Settings   = lazy(() => import('./pages/Settings/Settings').then(m => ({ default: m.Settings })))
const Onboarding = lazy(() => import('./pages/Onboarding/Onboarding').then(m => ({ default: m.Onboarding })))

function PageSpinner() {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50dvh' }}>
      <div style={{ width: 28, height: 28, border: '3px solid var(--c-primary-light)', borderTopColor: 'var(--c-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

type AppState = 'loading' | 'onboarding' | 'app'

function AppShell() {
  const [state, setState] = useState<AppState>('loading')
  useTheme()

  useEffect(() => {
    getSettings()
      .then(s => setState(s.onboardingCompleted ? 'app' : 'onboarding'))
      .catch(() => setState('app'))
  }, [])

  if (state === 'loading') return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--c-bg)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        <div style={{ width: 64, height: 64, background: 'var(--c-primary)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(46,125,91,0.25)' }}>
          <span style={{ color: '#FFF', fontSize: 26, fontWeight: 700, fontFamily: 'Poppins, sans-serif' }}>H</span>
        </div>
        <div style={{ width: 24, height: 24, border: '3px solid var(--c-primary-light)', borderTopColor: 'var(--c-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
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
          <Route path="*"         element={<Navigate to="/" replace />} />
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
