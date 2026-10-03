import { useState, useEffect } from 'react'
import { AlertTriangle, CheckCircle2, MessageSquare, X, Flame } from 'lucide-react'
import { Logo } from '../Logo'
import type { Habit } from '../../types'

interface AccountabilityModalProps {
  open: boolean
  incompleteHabits: Habit[]
  onComplete: (habitId: string) => void
  onDismissWithReason: (habitId: string, reason: string) => void
  onClose: () => void
}

const PRESET_REASONS = [
  { emoji: '😴', label: 'Was too tired' },
  { emoji: '🤒', label: 'Felt unwell' },
  { emoji: '🚨', label: 'Emergency came up' },
  { emoji: '💼', label: 'Work overload' },
  { emoji: '✈️', label: 'Was traveling' },
  { emoji: '🙃', label: 'Forgot / lost track' },
]

interface HabitState {
  habitId: string
  status: 'pending' | 'completing' | 'done' | 'explaining'
  reason: string
  customReason: string
  resolved: boolean
}

export function AccountabilityModal({
  open,
  incompleteHabits,
  onComplete,
  onDismissWithReason,
  onClose,
}: AccountabilityModalProps) {
  const [habitStates, setHabitStates] = useState<HabitState[]>([])
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    if (open) {
      setClosing(false)
      setHabitStates(
        incompleteHabits.map(h => ({
          habitId: h.id,
          status: 'pending',
          reason: '',
          customReason: '',
          resolved: false,
        }))
      )
    }
  }, [open, incompleteHabits])

  const allResolved = habitStates.length > 0 && habitStates.every(s => s.resolved)

  const setStateFor = (habitId: string, update: Partial<HabitState>) => {
    setHabitStates(prev => prev.map(s => s.habitId === habitId ? { ...s, ...update } : s))
  }

  const handleComplete = (habitId: string) => {
    setStateFor(habitId, { status: 'completing' })
    onComplete(habitId)
    setTimeout(() => setStateFor(habitId, { status: 'done', resolved: true }), 600)
  }

  const handleExplain = (habitId: string) => {
    setStateFor(habitId, { status: 'explaining' })
  }

  const handleReasonSelect = (habitId: string, reason: string) => {
    setStateFor(habitId, { reason })
  }

  const handleReasonSubmit = (habitId: string, reason: string) => {
    if (!reason.trim()) return
    onDismissWithReason(habitId, reason)
    setStateFor(habitId, { resolved: true })
  }

  const handleClose = () => {
    setClosing(true)
    setTimeout(onClose, 300)
  }

  if (!open) return null

  const resolvedCount = habitStates.filter(s => s.resolved).length
  const progress = habitStates.length > 0 ? (resolvedCount / habitStates.length) * 100 : 0

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        animation: closing ? 'fadeOut 0.3s ease forwards' : 'fadeIn 0.3s ease forwards',
      }}
    >
      {/* Backdrop */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
        onClick={allResolved ? handleClose : undefined}
      />

      {/* Sheet */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 480,
          maxHeight: '92dvh',
          background: 'var(--c-card)',
          borderRadius: '28px 28px 0 0',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: closing ? 'slideDown 0.3s cubic-bezier(0.4,0,1,1) forwards' : 'slideUp 0.4s cubic-bezier(0.34,1.3,0.64,1) forwards',
          boxShadow: '0 -20px 60px rgba(0,0,0,0.4)',
        }}
      >
        {/* Header gradient */}
        <div style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          padding: '24px 20px 20px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Animated bg orbs */}
          <div style={{
            position: 'absolute',
            top: -20, right: -20,
            width: 120, height: 120,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(245,158,11,0.2) 0%, transparent 70%)',
            animation: 'orbFloat 4s ease-in-out infinite',
          }} />
          <div style={{
            position: 'absolute',
            bottom: -30, left: -10,
            width: 100, height: 100,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(220,38,38,0.15) 0%, transparent 70%)',
            animation: 'orbFloat 5s ease-in-out infinite 1s',
          }} />

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, position: 'relative', zIndex: 1 }}>
            <div style={{
              width: 52, height: 52,
              borderRadius: 16,
              background: 'rgba(245,158,11,0.15)',
              border: '1px solid rgba(245,158,11,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              animation: 'warningPulse 2s ease-in-out infinite',
            }}>
              <AlertTriangle size={24} color="#F59E0B" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Logo size={20} />
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  End of Day
                </span>
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#FFF', margin: 0, lineHeight: 1.2 }}>
                🌙 Accountability Check
              </h2>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', margin: '6px 0 0' }}>
                {incompleteHabits.length} habit{incompleteHabits.length !== 1 ? 's' : ''} still incomplete.
                Complete them now or provide a reason.
              </p>
            </div>
            {allResolved && (
              <button
                onClick={handleClose}
                aria-label="Close"
                style={{
                  width: 32, height: 32, borderRadius: 10,
                  background: 'rgba(255,255,255,0.1)', border: 'none',
                  color: 'rgba(255,255,255,0.6)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Progress bar */}
          <div style={{ marginTop: 16, position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Resolved</span>
              <span style={{ fontSize: 11, color: '#4CAF78', fontWeight: 700 }}>{resolvedCount}/{habitStates.length}</span>
            </div>
            <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #2E7D5B, #4CAF78)',
                borderRadius: 999,
                transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)',
                boxShadow: progress > 0 ? '0 0 8px rgba(76,175,120,0.5)' : undefined,
              }} />
            </div>
          </div>
        </div>

        {/* Habits list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {allResolved ? (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              padding: '32px 20px', textAlign: 'center',
              animation: 'fadeInScale 0.4s cubic-bezier(0.34,1.3,0.64,1)',
            }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: 'linear-gradient(135deg, #2E7D5B, #4CAF78)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 16,
                boxShadow: '0 0 30px rgba(76,175,120,0.4)',
                animation: 'successPulse 2s ease-in-out infinite',
              }}>
                <CheckCircle2 size={40} color="#FFF" />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--c-text)', margin: '0 0 8px' }}>
                All sorted! 🎉
              </h3>
              <p style={{ fontSize: 14, color: 'var(--c-text-secondary)', margin: '0 0 24px', lineHeight: 1.5 }}>
                Great accountability! Tomorrow is a fresh start. Keep building your streak! 🔥
              </p>
              <button
                onClick={handleClose}
                style={{
                  padding: '12px 32px', borderRadius: 14, border: 'none',
                  background: 'linear-gradient(135deg, #2E7D5B, #4CAF78)',
                  color: '#FFF', fontSize: 15, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit',
                  boxShadow: '0 4px 16px rgba(46,125,91,0.4)',
                }}
              >
                Close & Rest Well 🌙
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {habitStates.map((hs, idx) => {
                const habit = incompleteHabits.find(h => h.id === hs.habitId)
                if (!habit) return null
                return (
                  <HabitAccountabilityCard
                    key={hs.habitId}
                    habit={habit}
                    state={hs}
                    index={idx}
                    onComplete={() => handleComplete(hs.habitId)}
                    onExplain={() => handleExplain(hs.habitId)}
                    onReasonSelect={(r) => handleReasonSelect(hs.habitId, r)}
                    onReasonSubmit={(r) => handleReasonSubmit(hs.habitId, r)}
                    onCustomChange={(v) => setStateFor(hs.habitId, { customReason: v })}
                  />
                )
              })}
            </div>
          )}
        </div>

        {/* Restriction notice (if not all resolved) */}
        {!allResolved && (
          <div style={{
            padding: '12px 16px',
            background: 'rgba(220,38,38,0.06)',
            borderTop: '1px solid rgba(220,38,38,0.1)',
          }}>
            <p style={{
              fontSize: 12, color: '#DC2626',
              margin: 0, textAlign: 'center',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              <Flame size={12} />
              You must address all habits before dismissing. Your streak depends on it!
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes fadeOut { from { opacity: 1 } to { opacity: 0 } }
        @keyframes slideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }
        @keyframes slideDown { from { transform: translateY(0) } to { transform: translateY(100%) } }
        @keyframes orbFloat {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-10px) scale(1.05); }
        }
        @keyframes warningPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(245,158,11,0); }
          50% { box-shadow: 0 0 0 8px rgba(245,158,11,0.15); }
        }
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes successPulse {
          0%, 100% { box-shadow: 0 0 30px rgba(76,175,120,0.4); }
          50% { box-shadow: 0 0 50px rgba(76,175,120,0.7); }
        }
      `}</style>
    </div>
  )
}

interface HabitAccountabilityCardProps {
  habit: Habit
  state: HabitState
  index: number
  onComplete: () => void
  onExplain: () => void
  onReasonSelect: (reason: string) => void
  onReasonSubmit: (reason: string) => void
  onCustomChange: (value: string) => void
}

function HabitAccountabilityCard({
  habit,
  state,
  index,
  onComplete,
  onExplain,
  onReasonSelect,
  onReasonSubmit,
  onCustomChange,
}: HabitAccountabilityCardProps) {
  const finalReason = state.reason || state.customReason

  if (state.resolved) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '14px 16px',
        background: state.status === 'done'
          ? 'linear-gradient(135deg, rgba(46,125,91,0.08), rgba(76,175,120,0.05))'
          : 'rgba(107,114,128,0.05)',
        border: `1px solid ${state.status === 'done' ? 'rgba(76,175,120,0.3)' : 'var(--c-border)'}`,
        borderRadius: 16,
        animation: 'resolvedIn 0.4s ease forwards',
      }}>
        <span style={{ fontSize: 24, flexShrink: 0 }}>{habit.emoji}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--c-text)', margin: 0, textDecoration: state.status !== 'done' ? 'none' : 'none' }}>
            {habit.name}
          </p>
          <p style={{ fontSize: 12, color: 'var(--c-text-secondary)', margin: '2px 0 0' }}>
            {state.status === 'done' ? '✅ Completed!' : `📝 ${finalReason}`}
          </p>
        </div>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: state.status === 'done' ? 'rgba(76,175,120,0.15)' : 'rgba(107,114,128,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {state.status === 'done'
            ? <CheckCircle2 size={18} color="#4CAF78" />
            : <MessageSquare size={16} color="var(--c-text-secondary)" />
          }
        </div>
      </div>
    )
  }

  return (
    <div style={{
      background: 'var(--c-card)',
      border: '1px solid var(--c-border)',
      borderRadius: 16,
      overflow: 'hidden',
      boxShadow: 'var(--shadow-card)',
      animation: `cardIn 0.4s ease ${index * 0.08}s both`,
    }}>
      {/* Habit header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px' }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: 'var(--c-primary-light)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, flexShrink: 0,
        }}>
          {habit.emoji}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--c-text)', margin: 0 }}>{habit.name}</p>
          {habit.description && (
            <p style={{ fontSize: 12, color: 'var(--c-text-secondary)', margin: '2px 0 0' }}>{habit.description}</p>
          )}
        </div>
        <div style={{
          padding: '4px 10px', borderRadius: 20,
          background: 'rgba(220,38,38,0.1)',
          fontSize: 11, fontWeight: 700, color: '#DC2626',
          letterSpacing: '0.05em',
        }}>
          MISSED
        </div>
      </div>

      {/* Actions or Explanation UI */}
      {state.status === 'pending' && (
        <div style={{ padding: '0 16px 14px', display: 'flex', gap: 10 }}>
          <button
            onClick={onComplete}
            style={{
              flex: 1, height: 44, borderRadius: 12, border: 'none',
              background: 'linear-gradient(135deg, #2E7D5B, #4CAF78)',
              color: '#FFF', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              boxShadow: '0 4px 12px rgba(46,125,91,0.35)',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 16px rgba(46,125,91,0.45)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(46,125,91,0.35)'; }}
          >
            <CheckCircle2 size={15} />
            Complete Now
          </button>
          <button
            onClick={onExplain}
            style={{
              flex: 1, height: 44, borderRadius: 12,
              border: '1px solid var(--c-border)',
              background: 'var(--c-bg)', color: 'var(--c-text)',
              fontSize: 13, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              transition: 'border-color 0.15s',
            }}
          >
            <MessageSquare size={15} />
            Give Reason
          </button>
        </div>
      )}

      {state.status === 'completing' && (
        <div style={{ padding: '0 16px 14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 44 }}>
          <div style={{
            width: 20, height: 20,
            border: '2px solid var(--c-primary-light)',
            borderTopColor: 'var(--c-primary)',
            borderRadius: '50%',
            animation: 'spin 0.7s linear infinite',
          }} />
          <span style={{ fontSize: 13, color: 'var(--c-primary)', fontWeight: 600 }}>Marking complete…</span>
        </div>
      )}

      {state.status === 'explaining' && (
        <div style={{ padding: '0 16px 14px' }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--c-text-secondary)', margin: '0 0 10px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Why did you miss it?
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 10 }}>
            {PRESET_REASONS.map(r => (
              <button
                key={r.label}
                onClick={() => onReasonSelect(r.label)}
                style={{
                  padding: '8px 10px',
                  borderRadius: 10,
                  border: `1.5px solid ${state.reason === r.label ? 'var(--c-primary)' : 'var(--c-border)'}`,
                  background: state.reason === r.label ? 'var(--c-primary-light)' : 'var(--c-bg)',
                  color: state.reason === r.label ? 'var(--c-primary)' : 'var(--c-text)',
                  fontSize: 12, fontWeight: 500,
                  cursor: 'pointer', fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', gap: 6,
                  textAlign: 'left',
                  transition: 'all 0.15s',
                }}
              >
                <span>{r.emoji}</span>
                <span>{r.label}</span>
              </button>
            ))}
          </div>

          {/* Custom reason */}
          <textarea
            placeholder="Or type your own reason…"
            value={state.customReason}
            onChange={e => onCustomChange(e.target.value)}
            maxLength={200}
            rows={2}
            style={{
              width: '100%', padding: '10px 12px',
              borderRadius: 10, border: '1px solid var(--c-border)',
              background: 'var(--c-bg)', color: 'var(--c-text)',
              fontSize: 13, fontFamily: 'inherit',
              resize: 'none', outline: 'none',
              boxSizing: 'border-box',
              marginBottom: 10,
            }}
          />

          <button
            onClick={() => onReasonSubmit(finalReason)}
            disabled={!finalReason.trim()}
            style={{
              width: '100%', height: 42, borderRadius: 10,
              border: 'none',
              background: finalReason.trim()
                ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                : 'var(--c-border)',
              color: '#FFF',
              fontSize: 13, fontWeight: 600,
              cursor: finalReason.trim() ? 'pointer' : 'not-allowed',
              fontFamily: 'inherit',
              opacity: finalReason.trim() ? 1 : 0.5,
              transition: 'all 0.2s',
            }}
          >
            Submit Reason
          </button>
        </div>
      )}

      <style>{`
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes resolvedIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
