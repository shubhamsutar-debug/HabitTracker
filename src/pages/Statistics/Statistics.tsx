import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts'
import { useHabits } from '../../hooks/useHabits'
import { useAllLogs } from '../../hooks/useHabitLogs'
import { useStatistics } from '../../hooks/useStatistics'
import { Header } from '../../components/Header'
import { EmptyState } from '../../components/EmptyState'
import { shortDate } from '../../utils/dates'

function StatCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: boolean }) {
  return (
    <div style={{
      background: 'var(--c-card)', border: '1px solid var(--c-border)',
      borderRadius: 14, padding: '16px 18px',
      boxShadow: 'var(--shadow-card)',
      display: 'flex', flexDirection: 'column', gap: 4,
    }}>
      <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--c-text-secondary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
      <p style={{ fontSize: 28, fontWeight: 700, color: accent ? 'var(--c-primary)' : 'var(--c-text)', margin: 0, lineHeight: 1.1 }}>{value}</p>
      {sub && <p style={{ fontSize: 12, color: 'var(--c-text-secondary)', margin: 0 }}>{sub}</p>}
    </div>
  )
}

function ChartTip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--c-card)', border: '1px solid var(--c-border)', borderRadius: 10, padding: '8px 12px', boxShadow: 'var(--shadow-md)', fontSize: 12 }}>
      <p style={{ color: 'var(--c-text-secondary)', margin: '0 0 2px' }}>{label}</p>
      <p style={{ color: 'var(--c-primary)', fontWeight: 700, margin: 0 }}>{payload[0].value}%</p>
    </div>
  )
}

export function Statistics() {
  const { habits, loading: hl } = useHabits()
  const { logs, loading: ll } = useAllLogs()
  const stats = useStatistics(habits, logs)

  const last7 = useMemo(() => stats.last7Days.map(d => ({ name: shortDate(d.date), pct: d.percentage })), [stats.last7Days])
  const last30 = useMemo(() => stats.last30Days.map(d => ({ name: shortDate(d.date), pct: d.percentage })), [stats.last30Days])

  const activeHabits = habits.filter(h => h.active && !h.archivedAt)

  if (hl || ll) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, border: '3px solid var(--c-primary-light)', borderTopColor: 'var(--c-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (activeHabits.length === 0) return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Header title="Statistics" />
      <EmptyState icon="📊" title="No data yet." description="Add habits and start tracking to see your statistics." />
    </div>
  )

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Header title="Statistics" />
      <div style={{ flex: 1, padding: '20px 16px', maxWidth: 760, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 20 }} className="pb-nav">

        {/* Overview */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--c-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' }}>Overview</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
            <StatCard label="Overall" value={`${stats.overallPercentage}%`} accent />
            <StatCard label="Total Done" value={stats.totalCompleted} />
            <StatCard label="Current Streak" value={`🔥 ${stats.currentStreak.current}`} sub="days in a row" />
            <StatCard label="Best Streak" value={`🏆 ${stats.currentStreak.best}`} sub="all time" />
          </div>
        </div>

        {/* Last 7 days */}
        {last7.length > 0 && (
          <div style={{ background: 'var(--c-card)', border: '1px solid var(--c-border)', borderRadius: 14, padding: '16px 16px 12px', boxShadow: 'var(--shadow-card)' }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--c-text)', margin: '0 0 14px' }}>Last 7 Days</p>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={last7} margin={{ top: 0, right: 0, bottom: 0, left: -24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--c-text-secondary)', fontFamily: 'Poppins' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'var(--c-text-secondary)', fontFamily: 'Poppins' }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTip />} cursor={{ fill: 'var(--c-primary-light)' }} />
                <Bar dataKey="pct" fill="#2E7D5B" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Last 30 days */}
        {last30.length > 1 && (
          <div style={{ background: 'var(--c-card)', border: '1px solid var(--c-border)', borderRadius: 14, padding: '16px 16px 12px', boxShadow: 'var(--shadow-card)' }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--c-text)', margin: '0 0 14px' }}>Last 30 Days</p>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={last30} margin={{ top: 0, right: 0, bottom: 0, left: -24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'var(--c-text-secondary)', fontFamily: 'Poppins' }} axisLine={false} tickLine={false} interval={4} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'var(--c-text-secondary)', fontFamily: 'Poppins' }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTip />} />
                <Line type="monotone" dataKey="pct" stroke="#2E7D5B" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: '#2E7D5B', strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Per-habit */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--c-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' }}>Habit Performance</p>
          <div style={{ background: 'var(--c-card)', border: '1px solid var(--c-border)', borderRadius: 14, overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
            {stats.habitStats.sort((a, b) => b.percentage - a.percentage).map((hs, idx, arr) => (
              <div key={hs.habitId} style={{ padding: '14px 16px', borderBottom: idx < arr.length - 1 ? '1px solid var(--c-border)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }} aria-hidden="true">{hs.emoji}</span>
                  <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: 'var(--c-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{hs.name}</span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--c-primary)', flexShrink: 0 }}>{hs.percentage}%</span>
                </div>
                {/* Bar */}
                <div style={{ height: 6, background: 'var(--c-primary-light)', borderRadius: 999, overflow: 'hidden', marginBottom: 8 }}>
                  <div style={{ height: '100%', width: `${hs.percentage}%`, background: 'var(--c-primary)', borderRadius: 999, transition: 'width 0.6s ease' }} />
                </div>
                {/* Badges */}
                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, color: 'var(--c-text-secondary)' }}>
                    <span style={{ color: '#F59E0B' }}>🔥</span> Streak: <strong style={{ color: 'var(--c-text)' }}>{hs.streak.current}</strong>
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--c-text-secondary)' }}>
                    🏆 Best: <strong style={{ color: 'var(--c-text)' }}>{hs.streak.best}</strong>
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--c-text-secondary)' }}>
                    ✓ {hs.completedDays}/{hs.totalDays} days
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
