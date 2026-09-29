import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useHabits } from '../../hooks/useHabits'
import { useDateRangeLogs } from '../../hooks/useHabitLogs'
import { Header } from '../../components/Header'
import { EmptyState } from '../../components/EmptyState'
import {
  todayString,
  getWeekDates,
  getMonthDates,
  formatMonthYear,
  dayOfMonth,
  fromDateString,
  toDateString,
  addDays,
} from '../../utils/dates'

type ViewMode = 'week' | 'month'

/* ─── helpers ─── */
function isoWeekStart(dateStr: string): string {
  const d = fromDateString(dateStr)
  const day = d.getDay() === 0 ? 7 : d.getDay() // Mon=1…Sun=7
  d.setDate(d.getDate() - (day - 1))
  return toDateString(d)
}

function monthOf(dateStr: string) {
  const d = fromDateString(dateStr)
  return { year: d.getFullYear(), month: d.getMonth() + 1 }
}

/* ─── Week grid ─── */
function WeekGrid({
  weekDates,
  habits,
  logs,
  onToggle,
}: {
  weekDates: string[]
  habits: ReturnType<typeof useHabits>['activeHabits']
  logs: ReturnType<typeof useDateRangeLogs>['logs']
  onToggle: (habitId: string, date: string) => void
}) {
  const today = todayString()

  // Build lookup: `${habitId}_${date}` → completed
  const lookup = useMemo(() => {
    const m = new Map<string, boolean>()
    for (const l of logs) m.set(`${l.habitId}_${l.date}`, l.completed)
    return m
  }, [logs])

  if (habits.length === 0) {
    return (
      <EmptyState
        icon="📋"
        title="No habits yet."
        description="Add habits to start seeing your weekly grid."
      />
    )
  }

  const DAY_ABBR = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return (
    <div className="overflow-x-auto -mx-4 px-4">
      <div className="min-w-[360px]">
        {/* Header row */}
        <div className="grid gap-1 mb-1" style={{ gridTemplateColumns: '1fr repeat(7, 2.5rem)' }}>
          <div />
          {weekDates.map((d, i) => (
            <div
              key={d}
              className={[
                'flex flex-col items-center justify-center h-10 rounded-lg text-center',
                d === today ? 'bg-indigo-100 dark:bg-indigo-900/50' : '',
              ].join(' ')}
            >
              <span className={`text-[10px] font-medium ${d === today ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}>
                {DAY_ABBR[i]}
              </span>
              <span className={`text-xs font-semibold ${d === today ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>
                {dayOfMonth(d)}
              </span>
            </div>
          ))}
        </div>

        {/* Habit rows */}
        {habits.map((habit) => (
          <div
            key={habit.id}
            className="grid gap-1 mb-1 items-center"
            style={{ gridTemplateColumns: '1fr repeat(7, 2.5rem)' }}
          >
            {/* Habit name — sticky */}
            <div className="flex items-center gap-1.5 pr-2 min-w-0">
              <span className="text-base flex-shrink-0" aria-hidden="true">{habit.emoji}</span>
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
                {habit.name}
              </span>
            </div>

            {/* Day cells */}
            {weekDates.map((date) => {
              const completed = lookup.get(`${habit.id}_${date}`) === true
              const isFuture = date > today
              return (
                <button
                  key={date}
                  type="button"
                  disabled={isFuture}
                  onClick={() => !isFuture && onToggle(habit.id, date)}
                  aria-label={`${habit.name} on ${date}: ${completed ? 'completed' : 'not completed'}`}
                  aria-pressed={completed}
                  className={[
                    'h-9 w-full rounded-lg flex items-center justify-center text-sm transition-all',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
                    isFuture
                      ? 'bg-slate-100 dark:bg-slate-800/30 opacity-30 cursor-not-allowed'
                      : completed
                      ? 'bg-indigo-500 dark:bg-indigo-600 text-white shadow-sm cursor-pointer active:scale-95'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95',
                  ].join(' ')}
                >
                  {isFuture ? '' : completed ? '✓' : '·'}
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Month calendar ─── */
function MonthCalendar({
  year,
  month,
  habits,
  logs,
  onDayClick,
}: {
  year: number
  month: number
  habits: ReturnType<typeof useHabits>['activeHabits']
  logs: ReturnType<typeof useDateRangeLogs>['logs']
  onDayClick: (date: string) => void
}) {
  const today = todayString()

  const dates = useMemo(() => getMonthDates(year, month), [year, month])

  // Completion level per date
  const completionMap = useMemo(() => {
    const byDate = new Map<string, { done: number; total: number }>()
    for (const date of dates) {
      if (date > today) { byDate.set(date, { done: 0, total: 0 }); continue }
      const dayLogs = logs.filter((l) => l.date === date)
      const done = dayLogs.filter((l) => l.completed).length
      byDate.set(date, { done, total: habits.length })
    }
    return byDate
  }, [dates, logs, habits, today])

  // First day of month weekday offset (Mon=0)
  const firstDay = fromDateString(dates[0])
  const offset = (firstDay.getDay() + 6) % 7 // Mon=0

  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return (
    <div>
      {/* Day header */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-[11px] font-medium text-slate-500 dark:text-slate-400 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Leading empty cells */}
        {Array.from({ length: offset }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {dates.map((date) => {
          const comp = completionMap.get(date)
          const isFuture = date > today
          const isToday = date === today
          const pct = comp && comp.total > 0 ? comp.done / comp.total : 0
          const level =
            isFuture || !comp || comp.total === 0
              ? 'empty'
              : pct === 1
              ? 'full'
              : pct >= 0.5
              ? 'partial'
              : comp.done > 0
              ? 'low'
              : 'none'

          const bg = {
            empty: 'bg-transparent',
            full: 'bg-indigo-500 dark:bg-indigo-600',
            partial: 'bg-indigo-300 dark:bg-indigo-700',
            low: 'bg-indigo-200 dark:bg-indigo-800',
            none: 'bg-slate-100 dark:bg-slate-800',
          }[level]

          const textColor = level === 'full' ? 'text-white' : level === 'partial' ? 'text-indigo-900 dark:text-indigo-100' : 'text-slate-700 dark:text-slate-300'

          return (
            <button
              key={date}
              type="button"
              onClick={() => !isFuture && onDayClick(date)}
              disabled={isFuture}
              aria-label={`${date}${comp ? `, ${comp.done}/${comp.total} habits` : ''}`}
              className={[
                'aspect-square flex items-center justify-center rounded-xl text-xs font-medium transition-all',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
                bg,
                textColor,
                isToday ? 'ring-2 ring-indigo-500 ring-offset-1' : '',
                isFuture ? 'opacity-20 cursor-not-allowed' : 'cursor-pointer hover:opacity-80 active:scale-95',
              ].join(' ')}
            >
              {dayOfMonth(date)}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-4 justify-center flex-wrap">
        {([['full','All done'],['partial','Half+'],['low','Some'],['none','None']] as const).map(([l,label]) => (
          <div key={l} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded-sm ${
              l==='full' ? 'bg-indigo-500' : l==='partial' ? 'bg-indigo-300' : l==='low' ? 'bg-indigo-200' : 'bg-slate-200 dark:bg-slate-700'
            }`} />
            <span className="text-[11px] text-slate-500 dark:text-slate-400">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Day detail modal ─── */
function DayDetail({
  date,
  habits,
  logs,
  onToggle,
  onClose,
}: {
  date: string | null
  habits: ReturnType<typeof useHabits>['activeHabits']
  logs: ReturnType<typeof useDateRangeLogs>['logs']
  onToggle: (habitId: string, date: string) => void
  onClose: () => void
}) {
  if (!date) return null
  const today = todayString()
  const lookup = new Map(logs.filter((l) => l.date === date).map((l) => [l.habitId, l.completed]))

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={`Habits for ${date}`}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl shadow-xl w-full max-w-sm p-5 pt-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {fromDateString(date).toLocaleDateString('en-US', { weekday: 'long' })}
            </p>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {fromDateString(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </h2>
          </div>
          <button onClick={onClose} className="text-sm text-indigo-600 dark:text-indigo-400 font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded">
            Done
          </button>
        </div>
        <div className="space-y-2 max-h-72 overflow-y-auto">
          {habits.map((h) => {
            const done = lookup.get(h.id) === true
            const isFuture = date > today
            return (
              <div key={h.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${done ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
                <span className="text-xl" aria-hidden="true">{h.emoji}</span>
                <span className="flex-1 text-sm font-medium text-slate-800 dark:text-slate-100">{h.name}</span>
                <button
                  type="button"
                  disabled={isFuture}
                  onClick={() => !isFuture && onToggle(h.id, date)}
                  aria-pressed={done}
                  aria-label={`${done ? 'Unmark' : 'Mark'} ${h.name}`}
                  className={[
                    'w-7 h-7 rounded-lg border-2 flex items-center justify-center text-sm transition-all',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
                    done ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 dark:border-slate-600',
                    isFuture ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer',
                  ].join(' ')}
                >
                  {done ? '✓' : ''}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ─── Main History page ─── */
export function History() {
  const today = todayString()
  const [viewMode, setViewMode] = useState<ViewMode>('week')
  const [weekAnchor, setWeekAnchor] = useState(isoWeekStart(today))
  const { year: initYear, month: initMonth } = monthOf(today)
  const [calYear, setCalYear] = useState(initYear)
  const [calMonth, setCalMonth] = useState(initMonth)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  const { activeHabits } = useHabits()

  /* Date ranges */
  const weekDates = useMemo(() => getWeekDates(fromDateString(weekAnchor), 1), [weekAnchor])
  const monthDates = useMemo(() => getMonthDates(calYear, calMonth), [calYear, calMonth])

  const rangeStart = viewMode === 'week' ? weekDates[0] : monthDates[0]
  const rangeEnd = viewMode === 'week' ? weekDates[6] : monthDates[monthDates.length - 1]

  const { logs, setCompleted, reload: reloadRange } = useDateRangeLogs(rangeStart, rangeEnd)

  // Also load selected day logs (may be in a different range for month view detail)
  const { logs: selectedDayLogs, setCompleted: setSelectedDayCompleted } = useDateRangeLogs(
    selectedDay ?? today,
    selectedDay ?? today,
  )

  const handleToggleWeek = (habitId: string, date: string) => {
    const current = logs.find((l) => l.habitId === habitId && l.date === date)?.completed ?? false
    void setCompleted(habitId, date, !current)
  }

  const handleToggleDay = (habitId: string, date: string) => {
    const current = selectedDayLogs.find((l) => l.habitId === habitId && l.date === date)?.completed ?? false
    void (async () => {
      await setSelectedDayCompleted(habitId, date, !current)
      // Refresh the month range so calendar colors update immediately
      await reloadRange()
    })()
  }

  /* Week navigation */
  const prevWeek = () => setWeekAnchor(addDays(weekAnchor, -7))
  const nextWeek = () => { if (addDays(weekAnchor, 7) <= today) setWeekAnchor(addDays(weekAnchor, 7)) }

  /* Month navigation */
  const prevMonth = () => {
    if (calMonth === 1) { setCalMonth(12); setCalYear(y => y - 1) }
    else setCalMonth(m => m - 1)
  }
  const nextMonth = () => {
    const next = calMonth === 12 ? { y: calYear + 1, m: 1 } : { y: calYear, m: calMonth + 1 }
    const nextStr = `${next.y}-${String(next.m).padStart(2,'0')}-01`
    if (nextStr <= today) {
      if (calMonth === 12) { setCalMonth(1); setCalYear(y => y + 1) } else setCalMonth(m => m + 1)
    }
  }

  const nextWeekDisabled = addDays(weekAnchor, 7) > today
  const nextMonthStr = calMonth === 12 ? `${calYear + 1}-01-01` : `${calYear}-${String(calMonth + 1).padStart(2,'0')}-01`
  const nextMonthDisabled = nextMonthStr > today

  const weekLabel = (() => {
    const start = fromDateString(weekDates[0])
    const end = fromDateString(weekDates[6])
    const sm = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const em = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    return `${sm} – ${em}`
  })()

  return (
    <div className="flex-1 flex flex-col">
      <Header title="History" />

      <div className="flex-1 px-4 pt-4 pb-nav max-w-2xl mx-auto w-full">
        {/* View mode toggle */}
        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 mb-4">
          {(['week', 'month'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setViewMode(m)}
              className={[
                'flex-1 py-1.5 text-sm font-medium rounded-lg transition-all capitalize',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
                viewMode === m
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400',
              ].join(' ')}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Navigation bar */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={viewMode === 'week' ? prevWeek : prevMonth}
            aria-label="Previous"
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </button>

          <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            {viewMode === 'week' ? weekLabel : formatMonthYear(calYear, calMonth)}
          </span>

          <button
            onClick={viewMode === 'week' ? nextWeek : nextMonth}
            disabled={viewMode === 'week' ? nextWeekDisabled : nextMonthDisabled}
            aria-label="Next"
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Grid / Calendar */}
        {viewMode === 'week' ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
            <WeekGrid
              weekDates={weekDates}
              habits={activeHabits}
              logs={logs}
              onToggle={handleToggleWeek}
            />
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
            <MonthCalendar
              year={calYear}
              month={calMonth}
              habits={activeHabits}
              logs={logs}
              onDayClick={setSelectedDay}
            />
          </div>
        )}

        {/* Hint */}
        <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-3">
          {viewMode === 'week' ? 'Tap any cell to toggle.' : 'Tap a day to view & edit habits.'}
        </p>
      </div>

      {/* Day detail modal (month view) */}
      {selectedDay && (
        <DayDetail
          date={selectedDay}
          habits={activeHabits}
          logs={selectedDayLogs}
          onToggle={handleToggleDay}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </div>
  )
}
