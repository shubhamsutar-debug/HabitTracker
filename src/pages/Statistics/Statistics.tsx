import { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid,
} from 'recharts'
import { useHabits } from '../../hooks/useHabits'
import { useAllLogs } from '../../hooks/useHabitLogs'
import { useStatistics } from '../../hooks/useStatistics'
import { Header } from '../../components/Header'
import { EmptyState } from '../../components/EmptyState'
import { shortDate } from '../../utils/dates'

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 flex flex-col gap-1">
      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{label}</p>
      <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{value}</p>
      {sub && <p className="text-xs text-slate-400 dark:text-slate-500">{sub}</p>}
    </div>
  )
}

// Custom tooltip for charts
function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 shadow-lg text-xs">
      <p className="font-medium text-slate-700 dark:text-slate-200">{label}</p>
      <p className="text-indigo-600 dark:text-indigo-400 font-bold">{payload[0].value}%</p>
    </div>
  )
}

export function Statistics() {
  const { habits, loading: habitsLoading } = useHabits()
  const { logs, loading: logsLoading } = useAllLogs()
  const stats = useStatistics(habits, logs)

  const last7Data = useMemo(
    () =>
      stats.last7Days.map((d) => ({
        name: shortDate(d.date),
        pct: d.percentage,
      })),
    [stats.last7Days],
  )

  const last30Data = useMemo(
    () =>
      stats.last30Days.map((d) => ({
        name: shortDate(d.date),
        pct: d.percentage,
      })),
    [stats.last30Days],
  )

  if (habitsLoading || logsLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const activeHabits = habits.filter((h) => h.active && !h.archivedAt)

  if (activeHabits.length === 0) {
    return (
      <div className="flex-1 flex flex-col">
        <Header title="Statistics" />
        <EmptyState
          icon="📊"
          title="No data yet."
          description="Add habits and start tracking to see your statistics."
        />
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      <Header title="Statistics" />

      <div className="flex-1 px-4 pt-4 pb-nav max-w-2xl mx-auto w-full space-y-5">
        {/* Overview cards */}
        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
            Overview
          </p>
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="Overall completion"
              value={`${stats.overallPercentage}%`}
            />
            <StatCard
              label="Total completed"
              value={stats.totalCompleted}
            />
            <StatCard
              label="Current streak"
              value={`🔥 ${stats.currentStreak.current}`}
              sub="consecutive days"
            />
            <StatCard
              label="Best streak"
              value={`🏆 ${stats.currentStreak.best}`}
              sub="consecutive days"
            />
          </div>
        </div>

        {/* Last 7 days bar chart */}
        {last7Data.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-4">
              Last 7 Days
            </p>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={last7Data} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid, #e2e8f0)" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(99,102,241,0.05)' }} />
                <Bar dataKey="pct" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Last 30 days line chart */}
        {last30Data.length > 1 && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-4">
              Last 30 Days
            </p>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={last30Data} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid, #e2e8f0)" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 9, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                  interval={4}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<ChartTooltip />} />
                <Line
                  type="monotone"
                  dataKey="pct"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#6366f1' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Per-habit breakdown */}
        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
            Habit Performance
          </p>
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            {stats.habitStats
              .sort((a, b) => b.percentage - a.percentage)
              .map((hs, idx, arr) => (
                <div
                  key={hs.habitId}
                  className={`px-4 py-3.5 ${idx < arr.length - 1 ? 'border-b border-slate-100 dark:border-slate-700/60' : ''}`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-lg flex-shrink-0" aria-hidden="true">{hs.emoji}</span>
                    <span className="flex-1 text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
                      {hs.name}
                    </span>
                    <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                      {hs.percentage}%
                    </span>
                  </div>
                  {/* Mini progress bar */}
                  <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${hs.percentage}%` }}
                    />
                  </div>
                  {/* Streak badges */}
                  <div className="flex gap-3 mt-2">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      🔥 Streak: <span className="font-medium text-slate-700 dark:text-slate-300">{hs.streak.current}</span>
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      🏆 Best: <span className="font-medium text-slate-700 dark:text-slate-300">{hs.streak.best}</span>
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      ✓ {hs.completedDays} / {hs.totalDays} days
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}
