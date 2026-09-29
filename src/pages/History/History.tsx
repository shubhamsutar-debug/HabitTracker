import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useHabits } from '../../hooks/useHabits'
import { useDateRangeLogs } from '../../hooks/useHabitLogs'
import { Header } from '../../components/Header'
import { EmptyState } from '../../components/EmptyState'
import {
  todayString, getWeekDates, getMonthDates, formatMonthYear,
  dayOfMonth, fromDateString, toDateString, addDays,
} from '../../utils/dates'

type ViewMode = 'week' | 'month'

function isoWeekStart(dateStr: string): string {
  const d = fromDateString(dateStr)
  const day = d.getDay() === 0 ? 7 : d.getDay()
  d.setDate(d.getDate() - (day - 1))
  return toDateString(d)
}

function monthOf(dateStr: string) {
  const d = fromDateString(dateStr)
  return { year: d.getFullYear(), month: d.getMonth() + 1 }
}

/* ── Week Grid ── */
function WeekGrid({ weekDates, habits, logs, onToggle }: {
  weekDates: string[]
  habits: ReturnType<typeof useHabits>['activeHabits']
  logs: ReturnType<typeof useDateRangeLogs>['logs']
  onToggle: (habitId: string, date: string) => void
}) {
  const today = todayString()
  const lookup = useMemo(() => {
    const m = new Map<string, boolean>()
    for (const l of logs) m.set(`${l.habitId}_${l.date}`, l.completed)
    return m
  }, [logs])

  if (habits.length === 0) return (
    <EmptyState icon="📋" title="No habits yet." description="Add habits to see your weekly grid." />
  )

  const DAY = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

  return (
    <div style={{ overflowX: 'auto', margin: '0 -4px' }}>
      <div style={{ minWidth: 340, padding: '0 4px' }}>
        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr repeat(7, 36px)', gap: 4, marginBottom: 4 }}>
          <div />
          {weekDates.map((d, i) => (
            <div key={d} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              padding: '6px 0', borderRadius: 8,
              background: d === today ? 'var(--c-primary-light)' : 'transparent',
            }}>
              <span style={{ fontSize: 9, fontWeight: 600, color: d === today ? 'var(--c-primary)' : 'var(--c-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {DAY[i]}
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: d === today ? 'var(--c-primary)' : 'var(--c-text)' }}>
                {dayOfMonth(d)}
              </span>
            </div>
          ))}
        </div>

        {/* Habit rows */}
        {habits.map(habit => (
          <div key={habit.id} style={{ display: 'grid', gridTemplateColumns: '1fr repeat(7, 36px)', gap: 4, marginBottom: 4, alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingRight: 8, minWidth: 0 }}>
              <span style={{ fontSize: 14, flexShrink: 0 }} aria-hidden="true">{habit.emoji}</span>
              <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--c-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {habit.name}
              </span>
            </div>
            {weekDates.map(date => {
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
                  style={{
                    height: 34,
                    borderRadius: 8,
                    border: `1px solid ${completed ? 'var(--c-primary)' : 'var(--c-border)'}`,
                    background: completed ? 'var(--c-primary-light)' : 'var(--c-incomplete)',
                    color: completed ? 'var(--c-primary)' : 'var(--c-text-secondary)',
                    fontSize: 12, fontWeight: 700,
                    cursor: isFuture ? 'not-allowed' : 'pointer',
                    opacity: isFuture ? 0.25 : 1,
                    transition: 'all 0.15s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
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

/* ── Month Calendar ── */
function MonthCalendar({ year, month, habits, logs, onDayClick }: {
  year: number; month: number
  habits: ReturnType<typeof useHabits>['activeHabits']
  logs: ReturnType<typeof useDateRangeLogs>['logs']
  onDayClick: (date: string) => void
}) {
  const today = todayString()
  const dates = useMemo(() => getMonthDates(year, month), [year, month])

  const completionMap = useMemo(() => {
    const m = new Map<string, { done: number; total: number }>()
    for (const date of dates) {
      if (date > today) { m.set(date, { done: 0, total: 0 }); continue }
      const done = logs.filter(l => l.date === date && l.completed).length
      m.set(date, { done, total: habits.length })
    }
    return m
  }, [dates, logs, habits, today])

  const offset = (fromDateString(dates[0]).getDay() + 6) % 7
  const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, marginBottom: 4 }}>
        {DAYS.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 600, color: 'var(--c-text-secondary)', padding: '4px 0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {d}
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 }}>
        {Array.from({ length: offset }).map((_, i) => <div key={`e-${i}`} />)}
        {dates.map(date => {
          const comp = completionMap.get(date)
          const isFuture = date > today
          const isToday = date === today
          const pct = comp && comp.total > 0 ? comp.done / comp.total : 0
          const level = isFuture || !comp || comp.total === 0 ? 'empty'
            : pct === 1 ? 'full' : pct >= 0.5 ? 'partial' : comp.done > 0 ? 'low' : 'none'

          const bg = { empty: 'transparent', full: 'var(--c-primary)', partial: 'var(--c-primary-light)', low: 'var(--c-primary-light)', none: 'var(--c-incomplete)' }[level]
          const textColor = level === 'full' ? '#FFF' : 'var(--c-text)'

          return (
            <button
              key={date}
              type="button"
              onClick={() => !isFuture && onDayClick(date)}
              disabled={isFuture}
              aria-label={`${date}${comp ? `, ${comp.done}/${comp.total} habits` : ''}`}
              style={{
                aspectRatio: '1',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 10,
                border: isToday ? '2px solid var(--c-primary)' : '1px solid transparent',
                background: bg,
                color: textColor,
                fontSize: 13, fontWeight: isToday ? 700 : 500,
                cursor: isFuture ? 'not-allowed' : 'pointer',
                opacity: isFuture ? 0.2 : 1,
                transition: 'all 0.15s',
              }}
            >
              {dayOfMonth(date)}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 12, marginTop: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
        {[['full','All done','var(--c-primary)'],['partial','Partial','var(--c-primary-light)'],['none','None','var(--c-incomplete)']] .map(([, label, bg]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: bg, border: '1px solid var(--c-border)' }} />
            <span style={{ fontSize: 11, color: 'var(--c-text-secondary)' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Day Detail Modal ── */
function DayDetail({ date, habits, logs, onToggle, onClose }: {
  date: string | null
  habits: ReturnType<typeof useHabits>['activeHabits']
  logs: ReturnType<typeof useDateRangeLogs>['logs']
  onToggle: (habitId: string, date: string) => void
  onClose: () => void
}) {
  if (!date) return null
  const today = todayString()
  const lookup = new Map(logs.filter(l => l.date === date).map(l => [l.habitId, l.completed]))

  return (
    <div role="dialog" aria-modal="true" aria-label={`Habits for ${date}`}
      style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div aria-hidden="true" onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(16,22,20,0.5)', backdropFilter: 'blur(4px)' }} />
      <div style={{
        position: 'relative', background: 'var(--c-card)',
        borderRadius: '20px 20px 0 0',
        width: '100%', maxWidth: 480,
        padding: '20px 20px 40px',
        boxShadow: '0 -8px 32px rgba(0,0,0,0.15)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <p style={{ fontSize: 11, color: 'var(--c-text-secondary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              {fromDateString(date).toLocaleDateString('en-US', { weekday: 'long' })}
            </p>
            <h2 style={{ fontSize: 17, fontWeight: 600, color: 'var(--c-text)', margin: '2px 0 0' }}>
              {fromDateString(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </h2>
          </div>
          <button onClick={onClose}
            style={{ fontSize: 14, fontWeight: 600, color: 'var(--c-primary)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
            Done
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 320, overflowY: 'auto' }}>
          {habits.map(h => {
            const done = lookup.get(h.id) === true
            const isFuture = date > today
            return (
              <div key={h.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 14px',
                background: done ? 'var(--c-primary-light)' : 'var(--c-bg)',
                border: `1px solid ${done ? 'var(--c-primary)' : 'var(--c-border)'}`,
                borderRadius: 12,
              }}>
                <span style={{ fontSize: 18 }} aria-hidden="true">{h.emoji}</span>
                <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: 'var(--c-text)' }}>{h.name}</span>
                <button
                  type="button"
                  disabled={isFuture}
                  onClick={() => !isFuture && onToggle(h.id, date)}
                  aria-pressed={done}
                  aria-label={`${done ? 'Unmark' : 'Mark'} ${h.name}`}
                  style={{
                    width: 30, height: 30, borderRadius: 8,
                    border: `2px solid ${done ? 'var(--c-primary)' : 'var(--c-border)'}`,
                    background: done ? 'var(--c-primary)' : 'var(--c-incomplete)',
                    color: '#FFF', fontSize: 14,
                    cursor: isFuture ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700,
                  }}
                >{done ? '✓' : ''}</button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ── Main History Page ── */
export function History() {
  const today = todayString()
  const [viewMode, setViewMode] = useState<ViewMode>('week')
  const [weekAnchor, setWeekAnchor] = useState(isoWeekStart(today))
  const { year: initYear, month: initMonth } = monthOf(today)
  const [calYear, setCalYear] = useState(initYear)
  const [calMonth, setCalMonth] = useState(initMonth)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const { activeHabits } = useHabits()

  const weekDates = useMemo(() => getWeekDates(fromDateString(weekAnchor), 1), [weekAnchor])
  const monthDates = useMemo(() => getMonthDates(calYear, calMonth), [calYear, calMonth])
  const rangeStart = viewMode === 'week' ? weekDates[0] : monthDates[0]
  const rangeEnd = viewMode === 'week' ? weekDates[6] : monthDates[monthDates.length - 1]

  const { logs, setCompleted, reload: reloadRange } = useDateRangeLogs(rangeStart, rangeEnd)
  const { logs: selectedDayLogs, setCompleted: setSelectedDayCompleted } = useDateRangeLogs(selectedDay ?? today, selectedDay ?? today)

  const handleToggleWeek = (habitId: string, date: string) => {
    const current = logs.find(l => l.habitId === habitId && l.date === date)?.completed ?? false
    void setCompleted(habitId, date, !current)
  }
  const handleToggleDay = (habitId: string, date: string) => {
    const current = selectedDayLogs.find(l => l.habitId === habitId && l.date === date)?.completed ?? false
    void (async () => { await setSelectedDayCompleted(habitId, date, !current); await reloadRange() })()
  }

  const prevWeek = () => setWeekAnchor(addDays(weekAnchor, -7))
  const nextWeek = () => { if (addDays(weekAnchor, 7) <= today) setWeekAnchor(addDays(weekAnchor, 7)) }
  const prevMonth = () => { if (calMonth === 1) { setCalMonth(12); setCalYear(y => y - 1) } else setCalMonth(m => m - 1) }
  const nextMonth = () => {
    const next = calMonth === 12 ? `${calYear + 1}-01-01` : `${calYear}-${String(calMonth + 1).padStart(2, '0')}-01`
    if (next <= today) { if (calMonth === 12) { setCalMonth(1); setCalYear(y => y + 1) } else setCalMonth(m => m + 1) }
  }

  const nextWeekDisabled = addDays(weekAnchor, 7) > today
  const nextMonthStr = calMonth === 12 ? `${calYear + 1}-01-01` : `${calYear}-${String(calMonth + 1).padStart(2, '0')}-01`

  const weekLabel = (() => {
    const s = fromDateString(weekDates[0]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const e = fromDateString(weekDates[6]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    return `${s} – ${e}`
  })()

  const navBtnStyle = {
    width: 36, height: 36, borderRadius: 10,
    border: '1px solid var(--c-border)',
    background: 'var(--c-card)',
    color: 'var(--c-text)',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Header title="History" />
      <div style={{ flex: 1, padding: '16px', maxWidth: 760, margin: '0 auto', width: '100%' }} className="pb-nav">

        {/* Toggle */}
        <div style={{ display: 'flex', background: 'var(--c-incomplete)', borderRadius: 10, padding: 3, marginBottom: 16 }}>
          {(['week', 'month'] as const).map(m => (
            <button
              key={m}
              onClick={() => setViewMode(m)}
              style={{
                flex: 1, height: 34, borderRadius: 8, border: 'none',
                background: viewMode === m ? 'var(--c-card)' : 'transparent',
                color: viewMode === m ? 'var(--c-text)' : 'var(--c-text-secondary)',
                fontSize: 13, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit',
                boxShadow: viewMode === m ? 'var(--shadow-card)' : 'none',
                textTransform: 'capitalize',
              }}
            >{m}</button>
          ))}
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <button onClick={viewMode === 'week' ? prevWeek : prevMonth} aria-label="Previous" style={navBtnStyle}>
            <ChevronLeft size={16} aria-hidden="true" />
          </button>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--c-text)' }}>
            {viewMode === 'week' ? weekLabel : formatMonthYear(calYear, calMonth)}
          </span>
          <button
            onClick={viewMode === 'week' ? nextWeek : nextMonth}
            disabled={viewMode === 'week' ? nextWeekDisabled : nextMonthStr > today}
            aria-label="Next"
            style={{ ...navBtnStyle, opacity: (viewMode === 'week' ? nextWeekDisabled : nextMonthStr > today) ? 0.3 : 1, cursor: (viewMode === 'week' ? nextWeekDisabled : nextMonthStr > today) ? 'not-allowed' : 'pointer' }}
          >
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>

        {/* Grid/Calendar */}
        <div style={{ background: 'var(--c-card)', border: '1px solid var(--c-border)', borderRadius: 16, padding: 16, boxShadow: 'var(--shadow-card)' }}>
          {viewMode === 'week'
            ? <WeekGrid weekDates={weekDates} habits={activeHabits} logs={logs} onToggle={handleToggleWeek} />
            : <MonthCalendar year={calYear} month={calMonth} habits={activeHabits} logs={logs} onDayClick={setSelectedDay} />
          }
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--c-text-secondary)', marginTop: 10 }}>
          {viewMode === 'week' ? 'Tap any cell to toggle.' : 'Tap a day to view & edit habits.'}
        </p>
      </div>

      {selectedDay && (
        <DayDetail date={selectedDay} habits={activeHabits} logs={selectedDayLogs} onToggle={handleToggleDay} onClose={() => setSelectedDay(null)} />
      )}
    </div>
  )
}
