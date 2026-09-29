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
  const { activeHabits, loading: habitsLoading } = useHabits()
  const { logs, toggle } = useHabitLogsForDate(today)

  const completion = useMemo(
    () => getTodayCompletion(activeHabits, logs),
    [activeHabits, logs],
  )

  const allDone = completion.total > 0 && completion.completed === completion.total

  const handleToggle = useCallback(
    (habitId: string) => { void toggle(habitId, today) },
    [toggle, today],
  )

  const isCompleted = useCallback(
    (habitId: string) => logs.some(l => l.habitId === habitId && l.completed),
    [logs],
  )

  if (habitsLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col page-enter">
      {/* ── Hero header ── */}
      <div className="bg-white dark:bg-slate-900 px-5 pt-5 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-2xl mx-auto">
          {/* Greeting */}
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-0.5 font-medium">
            {getGreeting()} 👋
          </p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
            HabitTrack
          </h1>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">
            {formatFullDate(today)}
          </p>

          {/* Progress card */}
          {activeHabits.length > 0 && (
            <div className="mt-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50">
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
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

      {/* ── Habit list ── */}
      <div className="flex-1 px-4 pt-4 pb-nav max-w-2xl mx-auto w-full">
        {/* All done banner */}
        {allDone && (
          <div className="mb-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 text-center">
            <p className="text-2xl mb-1">🎉</p>
            <p className="font-semibold text-indigo-700 dark:text-indigo-300 text-sm">
              All habits completed!
            </p>
            <p className="text-xs text-indigo-600/60 dark:text-indigo-400/60 mt-0.5">
              Great job. You kept your promise to yourself today.
            </p>
          </div>
        )}

        {/* Empty state */}
        {activeHabits.length === 0 ? (
          <EmptyState
            icon="🌱"
            title="Start building your routine."
            description="Add your first habit and begin tracking your consistency."
            action={
              <button
                onClick={() => void navigate('/habits')}
                className="inline-flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <Plus size={16} aria-hidden="true" />
                Add Habit
              </button>
            }
          />
        ) : (
          <div className="space-y-3">
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
    </div>
  )
}
