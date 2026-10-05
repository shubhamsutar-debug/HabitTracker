import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Flame, Trophy, ChevronRight, X } from 'lucide-react'
import { Logo } from '../Logo'
import { useHabits } from '../../hooks/useHabits'
import { useHabitLogsForDate } from '../../hooks/useHabitLogs'
import { useAllLogs } from '../../hooks/useHabitLogs'
import { useStatistics } from '../../hooks/useStatistics'
import { todayString } from '../../utils/dates'
import { getTodayCompletion } from '../../utils/calculations'

/* ── Animated circular progress ring ── */
function MiniRing({
  percentage,
  size = 64,
  stroke = 6,
  color = '#4CAF78',
}: {
  percentage: number
  size?: number
  stroke?: number
  color?: string
}) {
  const r = (size - stroke * 2) / 2
  const circ = 2 * Math.PI * r
  const [dash, setDash] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => setDash((percentage / 100) * circ), 120)
    return () => clearTimeout(t)
  }, [percentage, circ])

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <defs>
        <linearGradient id="wring" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1a5c3e" />
          <stop offset="100%" stopColor={color} />
        </linearGradient>
      </defs>
      {/* Track */}
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth={stroke}
      />
      {/* Progress */}
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke="url(#wring)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dasharray 0.9s cubic-bezier(0.4,0,0.2,1)' }}
      />
      {/* Center text */}
      <text
        x={size / 2} y={size / 2}
        textAnchor="middle" dominantBaseline="middle"
        style={{
          fontSize: size * 0.22,
          fontWeight: 800,
          fill: '#FFF',
          fontFamily: 'Poppins, sans-serif',
        }}
      >
        {percentage}%
      </text>
    </svg>
  )
}

/* ── Habit progress dots ── */
function HabitDots({
  habits,
  logs,
}: {
  habits: Array<{ id: string; emoji: string; name: string }>
  logs: Array<{ habitId: string; completed: boolean }>
}) {
  const today = todayString()
  const completedIds = new Set(
    logs.filter(l => l.completed).map(l => l.habitId)
  )

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: 6,
      marginTop: 10,
    }}>
      {habits.slice(0, 8).map(h => {
        const done = completedIds.has(h.id)
        return (
          <div
            key={h.id}
            title={`${h.name}${done ? ' ✓' : ''}`}
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: done
                ? 'linear-gradient(135deg, #2E7D5B, #4CAF78)'
                : 'rgba(255,255,255,0.1)',
              border: done
                ? '1.5px solid rgba(76,175,120,0.5)'
                : '1.5px solid rgba(255,255,255,0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
              transition: 'all 0.25s ease',
              boxShadow: done ? '0 2px 8px rgba(76,175,120,0.35)' : 'none',
            }}
          >
            {done ? '✓' : h.emoji}
          </div>
        )
      })}
      {habits.length > 8 && (
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: 'rgba(255,255,255,0.08)',
          border: '1.5px solid rgba(255,255,255,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, fontWeight: 700,
          color: 'rgba(255,255,255,0.6)',
        }}>
          +{habits.length - 8}
        </div>
      )}
    </div>
  )
}

/* ── Main WidgetCard ── */
interface WidgetCardProps {
  onDismiss?: () => void
  compact?: boolean
}

export function WidgetCard({ onDismiss, compact = false }: WidgetCardProps) {
  const navigate = useNavigate()
  const today = todayString()
  const { habits, activeHabits } = useHabits()
  const { logs } = useHabitLogsForDate(today)
  const { logs: allLogs } = useAllLogs()
  const stats = useStatistics(habits, allLogs)

  const completion = useMemo(
    () => getTodayCompletion(activeHabits, logs),
    [activeHabits, logs]
  )

  const currentStreak = stats.currentStreak.current
  const bestStreak = stats.currentStreak.best
  const remaining = completion.total - completion.completed

  const [pulse, setPulse] = useState(false)
  useEffect(() => {
    const t = setInterval(() => {
      setPulse(true)
      setTimeout(() => setPulse(false), 600)
    }, 8000)
    return () => clearInterval(t)
  }, [])

  // Time of day greeting
  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? '🌅 Morning' : hour < 17 ? '☀️ Afternoon' : '🌙 Evening'

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Open today's habits"
      onClick={() => void navigate('/')}
      onKeyDown={e => { if (e.key === 'Enter') void navigate('/') }}
      style={{
        position: 'relative',
        borderRadius: 24,
        overflow: 'hidden',
        cursor: 'pointer',
        background: 'linear-gradient(135deg, #0d2818 0%, #1a3d28 40%, #0f3460 100%)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(76,175,120,0.15)',
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement
        el.style.transform = 'translateY(-2px)'
        el.style.boxShadow = '0 12px 40px rgba(0,0,0,0.45), 0 0 0 1px rgba(76,175,120,0.25)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement
        el.style.transform = 'translateY(0)'
        el.style.boxShadow = '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(76,175,120,0.15)'
      }}
    >
      {/* Animated background orbs */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -30, right: -30,
          width: 140, height: 140, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(76,175,120,0.18) 0%, transparent 70%)',
          animation: 'wfloat 7s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: -40, left: -20,
          width: 120, height: 120, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
          animation: 'wfloat 9s ease-in-out infinite 2s',
        }} />
        {/* Subtle grid lines */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px',
        }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, padding: compact ? '16px' : '20px' }}>

        {/* Header row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Logo size={28} />
            <div>
              <p style={{
                fontSize: 11, fontWeight: 700,
                color: 'rgba(255,255,255,0.5)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                margin: 0,
              }}>{greeting}</p>
              <p style={{
                fontSize: 13, fontWeight: 700,
                color: '#FFF', margin: 0, lineHeight: 1.1,
              }}>HabitTrack</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Live dot */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '4px 8px', borderRadius: 20,
              background: 'rgba(76,175,120,0.15)',
              border: '1px solid rgba(76,175,120,0.25)',
            }}>
              <div style={{
                width: 6, height: 6, borderRadius: '50%',
                background: '#4CAF78',
                boxShadow: '0 0 6px rgba(76,175,120,0.8)',
                animation: `${pulse ? 'livePulse 0.6s ease' : 'none'}`,
              }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: '#4CAF78' }}>LIVE</span>
            </div>

            {onDismiss && (
              <button
                type="button"
                onClick={e => { e.stopPropagation(); onDismiss() }}
                aria-label="Dismiss widget"
                style={{
                  width: 26, height: 26, borderRadius: 8,
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.5)',
                  cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  padding: 0,
                }}
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Main content */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          marginBottom: compact ? 12 : 16,
        }}>
          {/* Progress ring */}
          <div style={{ flexShrink: 0 }}>
            <MiniRing
              percentage={completion.percentage}
              size={compact ? 60 : 72}
              stroke={compact ? 5 : 6}
            />
          </div>

          {/* Stats */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontSize: compact ? 22 : 26,
              fontWeight: 900,
              color: '#FFF',
              margin: 0,
              lineHeight: 1,
              letterSpacing: '-0.03em',
            }}>
              {completion.completed}
              <span style={{
                fontSize: compact ? 13 : 15,
                fontWeight: 500,
                color: 'rgba(255,255,255,0.45)',
                marginLeft: 4,
              }}>
                / {completion.total}
              </span>
            </p>
            <p style={{
              fontSize: 11, color: 'rgba(255,255,255,0.55)',
              fontWeight: 500, margin: '3px 0 0',
            }}>
              habits done today
            </p>

            {/* Progress bar */}
            <div style={{
              height: 4,
              background: 'rgba(255,255,255,0.1)',
              borderRadius: 999,
              overflow: 'hidden',
              marginTop: 8,
            }}>
              <div style={{
                height: '100%',
                width: `${completion.percentage}%`,
                background: 'linear-gradient(90deg, #2E7D5B, #4CAF78)',
                borderRadius: 999,
                transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
                boxShadow: completion.percentage > 0
                  ? '0 0 8px rgba(76,175,120,0.6)'
                  : 'none',
              }} />
            </div>

            {remaining > 0 && (
              <p style={{
                fontSize: 11, color: '#F59E0B',
                fontWeight: 600, margin: '5px 0 0',
              }}>
                ⚡ {remaining} remaining
              </p>
            )}
            {remaining === 0 && completion.total > 0 && (
              <p style={{
                fontSize: 11, color: '#4CAF78',
                fontWeight: 700, margin: '5px 0 0',
                animation: 'wfadeIn 0.4s ease',
              }}>
                🎉 All done! Amazing!
              </p>
            )}
          </div>
        </div>

        {/* Streak row */}
        <div style={{
          display: 'flex',
          gap: 10,
          marginBottom: compact ? 12 : 14,
        }}>
          {/* Current streak */}
          <div style={{
            flex: 1,
            background: 'rgba(245,158,11,0.1)',
            border: '1px solid rgba(245,158,11,0.2)',
            borderRadius: 14,
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <div style={{
              fontSize: 22,
              animation: currentStreak > 0 ? 'flameDance 2s ease-in-out infinite' : 'none',
              lineHeight: 1,
            }}>🔥</div>
            <div>
              <p style={{
                fontSize: 20, fontWeight: 900,
                color: '#F59E0B', margin: 0, lineHeight: 1,
                animation: currentStreak > 0 ? 'wCountUp 0.6s ease' : 'none',
              }}>
                {currentStreak}
              </p>
              <p style={{
                fontSize: 10, color: 'rgba(255,255,255,0.45)',
                fontWeight: 600, margin: '1px 0 0',
                textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>
                Day Streak
              </p>
            </div>
          </div>

          {/* Best streak */}
          <div style={{
            flex: 1,
            background: 'rgba(99,102,241,0.1)',
            border: '1px solid rgba(99,102,241,0.2)',
            borderRadius: 14,
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <Trophy size={20} color="#a78bfa" />
            <div>
              <p style={{
                fontSize: 20, fontWeight: 900,
                color: '#a78bfa', margin: 0, lineHeight: 1,
              }}>
                {bestStreak}
              </p>
              <p style={{
                fontSize: 10, color: 'rgba(255,255,255,0.45)',
                fontWeight: 600, margin: '1px 0 0',
                textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>
                Best Ever
              </p>
            </div>
          </div>
        </div>

        {/* Habit dots (compact hides) */}
        {!compact && activeHabits.length > 0 && (
          <HabitDots habits={activeHabits} logs={logs} />
        )}

        {/* CTA row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: compact ? 10 : 14,
          paddingTop: compact ? 8 : 10,
          borderTop: '1px solid rgba(255,255,255,0.07)',
        }}>
          <span style={{
            fontSize: 12,
            color: 'rgba(255,255,255,0.4)',
            fontWeight: 500,
          }}>
            Tap to open today's habits
          </span>
          <div style={{
            width: 28, height: 28,
            borderRadius: 8,
            background: 'rgba(76,175,120,0.2)',
            border: '1px solid rgba(76,175,120,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ChevronRight size={15} color="#4CAF78" />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes wfloat {
          0%,100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-10px) scale(1.04); }
        }
        @keyframes wfadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes flameDance {
          0%,100% { transform: rotate(-3deg) scale(1); }
          50% { transform: rotate(3deg) scale(1.1); }
        }
        @keyframes livePulse {
          0%,100% { transform: scale(1); }
          50% { transform: scale(1.8); opacity: 0.5; }
        }
        @keyframes wCountUp {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
