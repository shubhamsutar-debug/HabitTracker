import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, RefreshCw, Flame, Trophy, Target, Zap } from 'lucide-react'
import { Logo } from '../../components/Logo'
import { useHabits } from '../../hooks/useHabits'
import { useHabitLogsForDate } from '../../hooks/useHabitLogs'
import { useAllLogs } from '../../hooks/useHabitLogs'
import { useStatistics } from '../../hooks/useStatistics'
import { todayString, formatFullDate } from '../../utils/dates'
import { getTodayCompletion } from '../../utils/calculations'

/* ─── large animated ring ─── */
function BigRing({ percentage }: { percentage: number }) {
  const size = 160
  const stroke = 10
  const r = (size - stroke * 2) / 2
  const circ = 2 * Math.PI * r
  const [dash, setDash] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => setDash((percentage / 100) * circ), 200)
    return () => clearTimeout(t)
  }, [percentage, circ])

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <defs>
        <linearGradient id="bigring" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1a5c3e" />
          <stop offset="60%" stopColor="#2E7D5B" />
          <stop offset="100%" stopColor="#4CAF78" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {/* Outer decorative ring */}
      <circle cx={size/2} cy={size/2} r={r + 12}
        fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth={1}
        strokeDasharray="4 8" strokeLinecap="round"
      />
      {/* Track */}
      <circle cx={size/2} cy={size/2} r={r}
        fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke}
      />
      {/* Progress arc */}
      <circle cx={size/2} cy={size/2} r={r}
        fill="none" stroke="url(#bigring)" strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        transform={`rotate(-90 ${size/2} ${size/2})`}
        filter={dash > 0 ? 'url(#glow)' : undefined}
        style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.34,1.1,0.64,1)' }}
      />
      {/* Center content */}
      <text x={size/2} y={size/2 - 10}
        textAnchor="middle" dominantBaseline="middle"
        style={{ fontSize: 36, fontWeight: 900, fill: '#FFF', fontFamily: 'Poppins,sans-serif' }}
      >
        {percentage}%
      </text>
      <text x={size/2} y={size/2 + 16}
        textAnchor="middle" dominantBaseline="middle"
        style={{ fontSize: 11, fontWeight: 600, fill: 'rgba(255,255,255,0.45)', fontFamily: 'Poppins,sans-serif', letterSpacing: '0.08em' }}
      >
        COMPLETE
      </text>
    </svg>
  )
}

/* ─── stat pill ─── */
function StatPill({
  icon, value, label, color, bg,
}: {
  icon: React.ReactNode; value: string | number; label: string; color: string; bg: string
}) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '14px 10px', borderRadius: 18,
      background: bg,
      border: `1px solid ${color}22`,
      flex: 1, gap: 6,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: `${color}20`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>{icon}</div>
      <p style={{ fontSize: 22, fontWeight: 900, color, margin: 0, lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', margin: 0, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', textAlign: 'center' }}>{label}</p>
    </div>
  )
}

/* ─── habit row ─── */
function HabitRow({ emoji, name, done }: { emoji: string; name: string; done: boolean }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 14px',
      background: done
        ? 'linear-gradient(135deg, rgba(46,125,91,0.15), rgba(76,175,120,0.08))'
        : 'rgba(255,255,255,0.04)',
      borderRadius: 14,
      border: `1px solid ${done ? 'rgba(76,175,120,0.25)' : 'rgba(255,255,255,0.06)'}`,
      transition: 'all 0.25s ease',
      animation: 'rowIn 0.4s ease both',
    }}>
      <div style={{
        width: 34, height: 34, borderRadius: 10,
        background: done
          ? 'linear-gradient(135deg, #2E7D5B, #4CAF78)'
          : 'rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 16, flexShrink: 0,
        boxShadow: done ? '0 2px 8px rgba(76,175,120,0.4)' : 'none',
        transition: 'all 0.25s ease',
      }}>
        {done ? '✓' : emoji}
      </div>
      <span style={{
        flex: 1,
        fontSize: 13, fontWeight: 600,
        color: done ? 'rgba(255,255,255,0.55)' : '#FFF',
        textDecoration: done ? 'line-through' : 'none',
        textDecorationColor: 'rgba(255,255,255,0.25)',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        transition: 'all 0.25s ease',
      }}>{name}</span>
      {done && (
        <span style={{
          fontSize: 10, fontWeight: 700,
          color: '#4CAF78',
          background: 'rgba(76,175,120,0.15)',
          padding: '3px 8px', borderRadius: 20,
          animation: 'wfadeIn 0.3s ease',
        }}>DONE</span>
      )}
    </div>
  )
}

export function Widget() {
  const navigate = useNavigate()
  const today = todayString()
  const [lastRefresh, setLastRefresh] = useState(new Date())

  const { habits, activeHabits, loading } = useHabits()
  const { logs } = useHabitLogsForDate(today)
  const { logs: allLogs } = useAllLogs()
  const stats = useStatistics(habits, allLogs)

  const completion = useMemo(
    () => getTodayCompletion(activeHabits, logs),
    [activeHabits, logs]
  )

  const currentStreak = stats.currentStreak.current
  const bestStreak   = stats.currentStreak.best
  const totalCompleted = stats.totalCompleted
  const remaining    = completion.total - completion.completed

  const isCompleted = (habitId: string) =>
    logs.some(l => l.habitId === habitId && l.completed)

  // Auto-refresh every 30s
  useEffect(() => {
    const t = setInterval(() => setLastRefresh(new Date()), 30000)
    return () => clearInterval(t)
  }, [])

  const timeStr = lastRefresh.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

  if (loading) return (
    <div style={{
      minHeight: '100dvh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'linear-gradient(135deg, #0d2818, #0f3460)',
      flexDirection: 'column', gap: 20,
    }}>
      <Logo size={56} animate />
      <div style={{ display: 'flex', gap: 6 }}>
        {[0,1,2].map(i => (
          <div key={i} style={{
            width: 8, height: 8, borderRadius: '50%', background: '#4CAF78',
            animation: `pulseDot 1.2s ease-in-out infinite ${i*0.2}s`,
          }} />
        ))}
      </div>
      <style>{`@keyframes pulseDot{0%,100%{transform:scale(1);opacity:1;}50%{transform:scale(1.5);opacity:0.5;}}`}</style>
    </div>
  )

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(135deg, #0d2818 0%, #1a3d28 35%, #0f3460 100%)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background orbs */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: '5%', right: '-10%',
          width: 280, height: 280, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(76,175,120,0.12) 0%, transparent 70%)',
          animation: 'wfloat 10s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', left: '-5%',
          width: 220, height: 220, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)',
          animation: 'wfloat 12s ease-in-out infinite 3s',
        }} />
        <div style={{
          position: 'absolute', top: '40%', left: '60%',
          width: 160, height: 160, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)',
          animation: 'wfloat 8s ease-in-out infinite 1s',
        }} />
        {/* Grid pattern */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }} />
      </div>

      {/* Top bar */}
      <div style={{
        position: 'relative', zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: 'calc(var(--safe-top, 0px) + 16px) 20px 12px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}>
        <button
          onClick={() => void navigate('/')}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 10, padding: '7px 12px',
            color: 'rgba(255,255,255,0.7)', cursor: 'pointer',
            fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
          }}
        >
          <ArrowLeft size={14} />
          Back
        </button>

        <Logo size={32} showText textColor="#FFF" />

        <button
          onClick={() => setLastRefresh(new Date())}
          aria-label="Refresh"
          style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.6)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Scrollable content */}
      <div style={{
        flex: 1, overflowY: 'auto',
        padding: '20px 16px',
        paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
        position: 'relative', zIndex: 1,
      }}>

        {/* Date pill */}
        <div style={{
          display: 'flex', justifyContent: 'center', marginBottom: 20,
        }}>
          <div style={{
            padding: '6px 16px', borderRadius: 20,
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.1)',
            fontSize: 12, fontWeight: 600,
            color: 'rgba(255,255,255,0.65)',
            letterSpacing: '0.04em',
          }}>
            📅 {formatFullDate(today)} · Updated {timeStr}
          </div>
        </div>

        {/* ── WIDGET BLOCK 1: Progress Ring ── */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 28,
          padding: '24px 20px',
          marginBottom: 14,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}>
          {/* Widget label */}
          <div style={{
            position: 'absolute', top: 14, left: 14,
            fontSize: 10, fontWeight: 800,
            color: 'rgba(255,255,255,0.3)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}>
            Today's Progress
          </div>

          <BigRing percentage={completion.percentage} />

          <p style={{
            fontSize: 28, fontWeight: 900,
            color: '#FFF', margin: '12px 0 4px',
            letterSpacing: '-0.03em',
            animation: 'wfadeIn 0.5s ease',
          }}>
            {completion.completed}
            <span style={{ fontSize: 16, fontWeight: 500, color: 'rgba(255,255,255,0.4)', marginLeft: 6 }}>
              of {completion.total} habits
            </span>
          </p>

          {remaining > 0 ? (
            <p style={{
              fontSize: 13, fontWeight: 600,
              color: '#F59E0B', margin: '2px 0 0',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <Zap size={13} /> {remaining} habit{remaining > 1 ? 's' : ''} left to complete
            </p>
          ) : completion.total > 0 ? (
            <p style={{
              fontSize: 14, fontWeight: 700, color: '#4CAF78',
              margin: '2px 0 0',
              animation: 'bounceIn 0.6s ease',
            }}>
              🎉 Perfect Day! All habits complete!
            </p>
          ) : null}

          {/* Mini bar */}
          <div style={{
            width: '100%', height: 6,
            background: 'rgba(255,255,255,0.08)',
            borderRadius: 999, overflow: 'hidden',
            marginTop: 14,
          }}>
            <div style={{
              height: '100%',
              width: `${completion.percentage}%`,
              background: 'linear-gradient(90deg, #2E7D5B, #4CAF78)',
              borderRadius: 999,
              transition: 'width 1s cubic-bezier(0.4,0,0.2,1)',
              boxShadow: '0 0 10px rgba(76,175,120,0.6)',
            }} />
          </div>
        </div>

        {/* ── WIDGET BLOCK 2: Streak cards ── */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          <StatPill
            icon={<span style={{ fontSize: 20, animation: 'flameDance 2s ease-in-out infinite' }}>🔥</span>}
            value={currentStreak}
            label="Current Streak"
            color="#F59E0B"
            bg="rgba(245,158,11,0.08)"
          />
          <StatPill
            icon={<Trophy size={18} color="#a78bfa" />}
            value={bestStreak}
            label="Best Streak"
            color="#a78bfa"
            bg="rgba(167,139,250,0.08)"
          />
          <StatPill
            icon={<Target size={18} color="#4CAF78" />}
            value={totalCompleted}
            label="All Time"
            color="#4CAF78"
            bg="rgba(76,175,120,0.08)"
          />
        </div>

        {/* ── WIDGET BLOCK 3: Habit list ── */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 24,
          padding: '18px 16px',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 14,
          }}>
            <p style={{
              fontSize: 12, fontWeight: 800,
              color: 'rgba(255,255,255,0.4)',
              letterSpacing: '0.1em', textTransform: 'uppercase',
              margin: 0,
            }}>Habit Status</p>
            <span style={{
              fontSize: 11, fontWeight: 700,
              color: '#4CAF78',
              background: 'rgba(76,175,120,0.12)',
              padding: '3px 10px', borderRadius: 20,
            }}>
              {completion.completed}/{completion.total} done
            </span>
          </div>

          {activeHabits.length === 0 ? (
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '16px 0' }}>
              No habits yet. Add some in the app!
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {activeHabits.map((habit, idx) => (
                <div key={habit.id} style={{ animationDelay: `${idx * 0.05}s` }}>
                  <HabitRow
                    emoji={habit.emoji}
                    name={habit.name}
                    done={isCompleted(habit.id)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── CTA ── */}
        <button
          onClick={() => void navigate('/')}
          style={{
            width: '100%', height: 54,
            marginTop: 14,
            borderRadius: 18, border: 'none',
            background: 'linear-gradient(135deg, #1a5c3e, #2E7D5B, #4CAF78)',
            color: '#FFF', fontSize: 15, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: '0 8px 24px rgba(46,125,91,0.4)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(-2px)'; el.style.boxShadow = '0 12px 32px rgba(46,125,91,0.5)' }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(0)'; el.style.boxShadow = '0 8px 24px rgba(46,125,91,0.4)' }}
        >
          Open Full App
          <ArrowLeft size={16} style={{ transform: 'rotate(180deg)' }} />
        </button>
      </div>

      <style>{`
        @keyframes wfloat { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-12px);} }
        @keyframes wfadeIn { from{opacity:0;transform:translateY(6px);} to{opacity:1;transform:translateY(0);} }
        @keyframes flameDance { 0%,100%{transform:rotate(-4deg) scale(1);} 50%{transform:rotate(4deg) scale(1.12);} }
        @keyframes rowIn { from{opacity:0;transform:translateX(-8px);} to{opacity:1;transform:translateX(0);} }
        @keyframes bounceIn { 0%{opacity:0;transform:scale(0.8);} 60%{transform:scale(1.05);} 100%{opacity:1;transform:scale(1);} }
        @keyframes pulseDot { 0%,100%{transform:scale(1);opacity:1;} 50%{transform:scale(1.5);opacity:0.5;} }
      `}</style>
    </div>
  )
}
