import { useCallback, useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Sparkles, Zap, Target, LayoutDashboard } from 'lucide-react'
import { useHabits } from '../../hooks/useHabits'
import { useHabitLogsForDate } from '../../hooks/useHabitLogs'
import { HabitCard } from '../../components/HabitCard'
import { EmptyState } from '../../components/EmptyState'
import { WidgetCard } from '../../components/WidgetCard'
import { formatFullDate, getGreeting, todayString } from '../../utils/dates'
import { getTodayCompletion } from '../../utils/calculations'
import { Logo } from '../../components/Logo'

/* ── Animated progress ring ── */
function AnimatedProgressRing({ percentage }: { percentage: number }) {
  const r = 36
  const circ = 2 * Math.PI * r
  const [animDash, setAnimDash] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setAnimDash((percentage / 100) * circ), 100)
    return () => clearTimeout(t)
  }, [percentage, circ])

  return (
    <svg width="88" height="88" viewBox="0 0 88 88" aria-hidden="true">
      <defs>
        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1a5c3e" />
          <stop offset="100%" stopColor="#4CAF78" />
        </linearGradient>
      </defs>
      <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="7" />
      <circle
        cx="44" cy="44" r={r} fill="none"
        stroke="url(#ringGrad)" strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={`${animDash} ${circ}`}
        transform="rotate(-90 44 44)"
        style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.4,0,0.2,1)' }}
      />
      <text x="44" y="44" textAnchor="middle" dominantBaseline="middle"
        style={{ fontSize: 16, fontWeight: 800, fill: '#FFF', fontFamily: 'Poppins,sans-serif' }}>
        {percentage}%
      </text>
    </svg>
  )
}

/* ── Motivational banner ── */
function MotivationalBanner({ completed, total, allDone }: { completed: number; total: number; allDone: boolean }) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0
  const msgs = [
    { pct: 0,   emoji: '🌱', text: 'Every journey begins with a single step!', color: '#6366f1' },
    { pct: 25,  emoji: '🔥', text: 'Great start! Keep the momentum going!',    color: '#f59e0b' },
    { pct: 50,  emoji: '⚡', text: "Halfway there! You're on fire!",            color: '#f97316' },
    { pct: 75,  emoji: '🚀', text: "Almost done! Don't stop now!",              color: '#2E7D5B' },
    { pct: 100, emoji: '🎉', text: 'PERFECT DAY! You crushed it!',              color: '#4CAF78' },
  ]
  const msg = [...msgs].reverse().find(m => pct >= m.pct) ?? msgs[0]

  if (allDone) return (
    <div style={{
      background: 'linear-gradient(135deg, #1a5c3e, #2E7D5B, #4CAF78)',
      borderRadius: 18, padding: '16px 20px',
      display: 'flex', alignItems: 'center', gap: 14,
      marginBottom: 16,
      boxShadow: '0 8px 24px rgba(46,125,91,0.35)',
      animation: 'bounceIn 0.6s ease',
      position: 'relative', overflow: 'hidden',
    }}>
      {['✨','🌟','💫','⭐'].map((e, i) => (
        <span key={i} style={{
          position: 'absolute', top: `${20 + i * 15}%`, right: `${10 + i * 8}%`,
          fontSize: 16, animation: `float ${2 + i * 0.5}s ease-in-out infinite ${i * 0.3}s`,
          pointerEvents: 'none',
        }}>{e}</span>
      ))}
      <span style={{ fontSize: 36 }}>🎊</span>
      <div>
        <p style={{ fontSize: 15, fontWeight: 800, color: '#FFF', margin: 0 }}>ALL HABITS COMPLETE!</p>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', margin: '3px 0 0' }}>
          You kept your promise to yourself today. Incredible! 🏆
        </p>
      </div>
    </div>
  )

  return (
    <div style={{
      background: `linear-gradient(135deg, ${msg.color}15, ${msg.color}05)`,
      border: `1px solid ${msg.color}25`,
      borderRadius: 14, padding: '12px 16px',
      display: 'flex', alignItems: 'center', gap: 12,
      marginBottom: 16,
    }}>
      <span style={{ fontSize: 24 }}>{msg.emoji}</span>
      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-text)', margin: 0 }}>{msg.text}</p>
    </div>
  )
}

export function Today() {
  const navigate = useNavigate()
  const today = todayString()
  const { activeHabits, loading } = useHabits()
  const { logs, toggle } = useHabitLogsForDate(today)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showWidget, setShowWidget] = useState(false)

  const completion = useMemo(() => getTodayCompletion(activeHabits, logs), [activeHabits, logs])
  const allDone = completion.total > 0 && completion.completed === completion.total

  const handleToggle = useCallback(async (habitId: string) => {
    const wasCompleted = logs.some(l => l.habitId === habitId && l.completed)
    await toggle(habitId, today)
    if (!wasCompleted && completion.completed + 1 === completion.total) {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)
    }
  }, [toggle, today, logs, completion])

  const isCompleted = useCallback(
    (habitId: string) => logs.some(l => l.habitId === habitId && l.completed),
    [logs]
  )

  const hour = new Date().getHours()
  const timeEmoji = hour < 12 ? '🌅' : hour < 17 ? '☀️' : '🌙'

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20 }}>
      <Logo size={56} animate />
      <div style={{ display: 'flex', gap: 6 }}>
        {[0,1,2].map(i => (
          <div key={i} style={{
            width: 8, height: 8, borderRadius: '50%', background: 'var(--c-primary)',
            animation: `pulseDot 1.2s ease-in-out infinite ${i * 0.2}s`,
          }} />
        ))}
      </div>
      <style>{`@keyframes pulseDot{0%,100%{transform:scale(1);opacity:1;}50%{transform:scale(1.5);opacity:0.5;}}`}</style>
    </div>
  )

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }} className="page-enter">
      {/* Confetti */}
      {showConfetti && (
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 100, overflow: 'hidden' }}>
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} style={{
              position: 'absolute', top: '30%', left: `${5 + i * 5}%`,
              width: 8, height: 8, borderRadius: i % 3 === 0 ? '50%' : 2,
              background: ['#4CAF78','#F59E0B','#6366f1','#ef4444','#3b82f6'][i % 5],
              animation: `celebrationBurst ${0.8 + (i % 4) * 0.3}s ease-out ${i * 0.05}s forwards`,
            }} />
          ))}
        </div>
      )}

      {/* Hero Header */}
      <div style={{
        background: 'var(--grad-hero)',
        padding: 'calc(var(--safe-top, 0px) + 20px) 20px 0',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(76,175,120,0.15) 0%, transparent 70%)', animation: 'float 8s ease-in-out infinite', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 0, left: -60, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)', animation: 'float 10s ease-in-out infinite 2s', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 680, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {/* Top row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <Logo size={38} showText animate />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* Widget toggle button */}
              <button
                onClick={() => setShowWidget(v => !v)}
                aria-label="Toggle widget view"
                title="Widget View"
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '6px 10px', borderRadius: 20,
                  background: showWidget ? 'rgba(76,175,120,0.25)' : 'rgba(255,255,255,0.1)',
                  border: `1px solid ${showWidget ? 'rgba(76,175,120,0.4)' : 'rgba(255,255,255,0.15)'}`,
                  color: showWidget ? '#4CAF78' : 'rgba(255,255,255,0.7)',
                  cursor: 'pointer', fontSize: 11, fontWeight: 700,
                  letterSpacing: '0.04em', fontFamily: 'inherit',
                  transition: 'all 0.2s',
                }}
              >
                <LayoutDashboard size={13} />
                Widget
              </button>
              <div style={{
                padding: '6px 12px', borderRadius: 20,
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.15)',
              }}>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
                  {timeEmoji} {formatFullDate(today)}
                </span>
              </div>
            </div>
          </div>

          {/* Greeting */}
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', margin: '0 0 4px', fontWeight: 500 }}>
              {getGreeting()} 👋
            </p>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#FFF', margin: 0, lineHeight: 1.2, letterSpacing: '-0.02em' }}>
              {allDone ? 'You did it! 🎉' : "Let's build today!"}
            </h1>
          </div>

          {/* Progress area */}
          {activeHabits.length > 0 && (
            <div style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '20px 20px 0 0',
              padding: '20px 20px 24px',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <AnimatedProgressRing percentage={completion.percentage} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 6px' }}>
                    Today's Progress
                  </p>
                  <p style={{ fontSize: 24, fontWeight: 800, color: '#FFF', margin: '0 0 4px' }}>
                    {completion.completed}
                    <span style={{ fontSize: 16, fontWeight: 500, color: 'rgba(255,255,255,0.5)' }}>/{completion.total} habits</span>
                  </p>
                  <div style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 999, overflow: 'hidden', marginTop: 4 }}>
                    <div style={{ height: '100%', width: `${completion.percentage}%`, background: 'linear-gradient(90deg, #2E7D5B, #4CAF78)', borderRadius: 999, transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)', boxShadow: '0 0 8px rgba(76,175,120,0.5)' }} />
                  </div>
                  {completion.total - completion.completed > 0 && (
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: '6px 0 0' }}>
                      {completion.total - completion.completed} remaining
                    </p>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                {[
                  { icon: <Target size={12} />, label: `${completion.total} Total`, color: '#6366f1' },
                  { icon: <Zap size={12} />, label: `${completion.completed} Done`, color: '#4CAF78' },
                  { icon: <Sparkles size={12} />, label: `${completion.percentage}% Rate`, color: '#F59E0B' },
                ].map((pill, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 20, background: `${pill.color}20`, border: `1px solid ${pill.color}30`, color: pill.color, fontSize: 11, fontWeight: 600 }}>
                    {pill.icon}{pill.label}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Habit list */}
      <div style={{ flex: 1, padding: '20px 16px', maxWidth: 680, margin: '0 auto', width: '100%' }} className="pb-nav">

        {/* ── Widget Card (toggleable) ── */}
        {showWidget && (
          <div style={{ marginBottom: 20, animation: 'fadeInUp 0.4s ease' }}>
            <WidgetCard onDismiss={() => setShowWidget(false)} />
            {/* Also show full widget link */}
            <button
              onClick={() => void navigate('/widget')}
              style={{
                width: '100%', marginTop: 10, height: 42, borderRadius: 12,
                border: '1px solid rgba(76,175,120,0.3)',
                background: 'rgba(76,175,120,0.06)',
                color: 'var(--c-primary)', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              <LayoutDashboard size={14} />
              Open Full Widget Screen
            </button>
          </div>
        )}

        {activeHabits.length > 0 && (
          <MotivationalBanner completed={completion.completed} total={completion.total} allDone={allDone} />
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
                  padding: '0 24px', height: 52,
                  background: 'var(--grad-primary)', color: '#FFF',
                  border: 'none', borderRadius: 16,
                  fontSize: 15, fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'inherit',
                  boxShadow: '0 8px 24px rgba(46,125,91,0.35)',
                }}
              >
                <Plus size={18} />
                Add First Habit
              </button>
            }
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {activeHabits.map((habit, idx) => (
              <div key={habit.id} style={{ animation: `fadeInUp 0.4s ease ${idx * 0.06}s both` }}>
                <HabitCard habit={habit} completed={isCompleted(habit.id)} onToggle={handleToggle} />
              </div>
            ))}
            <button
              onClick={() => void navigate('/habits')}
              style={{
                width: '100%', height: 52, borderRadius: 16,
                border: '2px dashed var(--c-border)',
                background: 'transparent', color: 'var(--c-text-secondary)',
                fontSize: 14, fontWeight: 500,
                cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                marginTop: 4,
              }}
            >
              <Plus size={16} /> Add another habit
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
