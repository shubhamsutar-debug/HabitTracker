import { useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useHabits } from '../../hooks/useHabits'
import { useHabitLogsForDate } from '../../hooks/useHabitLogs'
import { ProgressBar } from '../../components/ProgressBar'
import { HabitCard } from '../../components/HabitCard'
import { EmptyState } from '../../components/EmptyState'
import { formatFullDate, getGreeting, todayString } from '../../utils/dates'
import { getTodayCompletion } from '../../utils/calculations'

export function Today() {
  const navigate = useNavigate()
  const today = todayString()
  const { activeHabits, loading } = useHabits()
  const { logs, toggle } = useHabitLogsForDate(today)

  const completion = useMemo(() => getTodayCompletion(activeHabits, logs), [activeHabits, logs])
  const allDone = completion.total > 0 && completion.completed === completion.total

  const handleToggle = useCallback((habitId: string) => { void toggle(habitId, today) }, [toggle, today])
  const isCompleted = useCallback((habitId: string) => logs.some(l => l.habitId === habitId && l.completed), [logs])

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, border: '3px solid var(--c-primary-light)', borderTopColor: 'var(--c-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }} className="page-enter">
      {/* ── Hero ── */}
      <div style={{ background: 'var(--c-card)', borderBottom: '1px solid var(--c-border)', padding: '20px 20px 0' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <p style={{ fontSize: 14, color: 'var(--c-text-secondary)', margin: '0 0 2px', fontWeight: 500 }}>
            {getGreeting()} 👋
          </p>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--c-text)', margin: '0 0 2px' }}>
            HabitTrack
          </h1>
          <p style={{ fontSize: 13, color: 'var(--c-text-secondary)', margin: '0 0 20px' }}>
            {formatFullDate(today)}
          </p>

          {/* Progress card */}
          {activeHabits.length > 0 && (
            <div style={{
              background: 'var(--c-bg)',
              border: '1px solid var(--c-border)',
              borderRadius: '14px 14px 0 0',
              padding: '16px 18px 18px',
            }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--c-text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 12px' }}>
                Today's Progress
              </p>
              <ProgressBar
                percentage={completion.percentage}
                completed={completion.completed}
                total={completion.total}
                size="lg"
              />
            </div>
          )}
        </div>
      </div>

      {/* ── List ── */}
      <div style={{ flex: 1, padding: '20px 16px', maxWidth: 680, margin: '0 auto', width: '100%' }}
        className="pb-nav">

        {/* All done */}
        {allDone && (
          <div style={{
            background: 'var(--c-primary-light)',
            border: '1px solid var(--c-primary)',
            borderRadius: 14,
            padding: '14px 18px',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}>
            <span style={{ fontSize: 24 }}>🎉</span>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--c-primary)', margin: 0 }}>All habits completed!</p>
              <p style={{ fontSize: 12, color: 'var(--c-text-secondary)', margin: '2px 0 0' }}>
                Great job. You kept your promise to yourself today.
              </p>
            </div>
          </div>
        )}

        {activeHabits.length === 0 ? (
          <EmptyState
            icon="🌱"
            title="Start building your routine."
            description="Add your first habit and begin tracking your consistency."
            action={
              <button
                onClick={() => void navigate('/habits')}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '0 20px', height: 46,
                  background: 'var(--c-primary)', color: '#FFF',
                  border: 'none', borderRadius: 10,
                  fontSize: 14, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                <Plus size={16} aria-hidden="true" />
                Add Habit
              </button>
            }
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {activeHabits.map(habit => (
              <HabitCard
                key={habit.id}
                habit={habit}
                completed={isCompleted(habit.id)}
                onToggle={handleToggle}
              />
            ))}
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
