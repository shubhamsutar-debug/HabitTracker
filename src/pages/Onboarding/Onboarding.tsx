import { useState } from 'react'
import { Plus, X, Check, ArrowRight, Sparkles } from 'lucide-react'
import { addHabit } from '../../db/habits'
import { updateSettings } from '../../db/settings'
import { Logo } from '../../components/Logo'
import type { HabitFormData } from '../../types'

const SUGGESTED: HabitFormData[] = [
  { name: 'Wake up early',       emoji: '☀️', active: true },
  { name: 'Exercise',            emoji: '💪', active: true },
  { name: 'Reading / Learning',  emoji: '📚', active: true },
  { name: 'Project Work',        emoji: '💻', active: true },
  { name: 'Social Media Detox',  emoji: '📵', active: true },
  { name: 'Budget Tracking',     emoji: '💰', active: true },
  { name: 'Cold Shower',         emoji: '🚿', active: true },
  { name: 'Goal Journaling',     emoji: '📓', active: true },
  { name: 'Meditation',          emoji: '🧘', active: true },
  { name: 'Drink 8 Glasses',     emoji: '💧', active: true },
]

const FEATURES = [
  { icon: '✅', text: 'Check off habits every single day', color: '#4CAF78' },
  { icon: '📊', text: 'Track streaks & consistency over time', color: '#6366f1' },
  { icon: '🌙', text: '11pm accountability — no excuses!', color: '#f59e0b' },
  { icon: '🔔', text: '7 daily reminders to keep you on track', color: '#ef4444' },
  { icon: '✈️', text: 'Works completely offline', color: '#3b82f6' },
]

interface OnboardingProps { onComplete: () => void }

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState<'welcome' | 'select'>('welcome')
  const [selected, setSelected] = useState<Set<number>>(new Set([0, 1, 2, 3]))
  const [customs, setCustoms] = useState<HabitFormData[]>([])
  const [customName, setCustomName] = useState('')
  const [customEmoji, setCustomEmoji] = useState('✅')
  const [showCustom, setShowCustom] = useState(false)
  const [saving, setSaving] = useState(false)

  const toggle = (i: number) => setSelected(prev => {
    const next = new Set(prev); next.has(i) ? next.delete(i) : next.add(i); return next
  })

  const addCustom = () => {
    if (!customName.trim()) return
    setCustoms(prev => [...prev, { name: customName.trim(), emoji: customEmoji, active: true }])
    setCustomName(''); setCustomEmoji('✅'); setShowCustom(false)
  }

  const handleStart = async () => {
    setSaving(true)
    try {
      for (const h of [...SUGGESTED.filter((_, i) => selected.has(i)), ...customs]) await addHabit(h)
      await updateSettings({ onboardingCompleted: true })
      onComplete()
    } finally { setSaving(false) }
  }

  /* ── Welcome ── */
  if (step === 'welcome') return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--grad-hero)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Animated background orbs */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', top: '5%', left: '-10%',
          width: 350, height: 350, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(76,175,120,0.15) 0%, transparent 70%)',
          animation: 'float 10s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', top: '30%', right: '-15%',
          width: 300, height: 300, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
          animation: 'float 8s ease-in-out infinite 1.5s',
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', left: '20%',
          width: 200, height: 200, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)',
          animation: 'float 12s ease-in-out infinite 3s',
        }} />
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 24px',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{ width: '100%', maxWidth: 380, textAlign: 'center' }}>
          {/* Logo */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: 32,
            animation: 'bounceIn 0.8s cubic-bezier(0.34,1.3,0.64,1)',
          }}>
            <Logo size={90} showText animate variant="splash" textColor="#FFF" />
          </div>

          <h1 style={{
            fontSize: 32,
            fontWeight: 800,
            color: '#FFF',
            margin: '0 0 10px',
            letterSpacing: '-0.03em',
            animation: 'fadeInUp 0.6s ease 0.2s both',
          }}>
            Build Better Habits
          </h1>
          <p style={{
            fontSize: 16,
            color: 'rgba(255,255,255,0.65)',
            margin: '0 0 36px',
            lineHeight: 1.6,
            animation: 'fadeInUp 0.6s ease 0.3s both',
          }}>
            Track consistency. Build streaks.<br />
            Transform your life, one day at a time.
          </p>

          {/* Features card */}
          <div style={{
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 20,
            padding: '20px 22px',
            marginBottom: 32,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            textAlign: 'left',
            animation: 'fadeInUp 0.6s ease 0.4s both',
          }}>
            {FEATURES.map(({ icon, text, color }, i) => (
              <div
                key={text}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '8px 0',
                  borderBottom: i < FEATURES.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                  animation: `fadeInUp 0.5s ease ${0.45 + i * 0.07}s both`,
                }}
              >
                <div style={{
                  width: 34, height: 34,
                  borderRadius: 10,
                  background: `${color}20`,
                  border: `1px solid ${color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 17, flexShrink: 0,
                }}>
                  {icon}
                </div>
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>
                  {text}
                </span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={() => setStep('select')}
            style={{
              width: '100%', height: 58, borderRadius: 18,
              border: 'none',
              background: 'linear-gradient(135deg, #2E7D5B, #4CAF78)',
              color: '#FFF',
              fontSize: 17, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              boxShadow: '0 8px 32px rgba(46,125,91,0.5)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              animation: 'fadeInUp 0.6s ease 0.8s both',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 40px rgba(46,125,91,0.6)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(46,125,91,0.5)';
            }}
          >
            <Sparkles size={20} aria-hidden="true" />
            Let's Build My Habits
            <ArrowRight size={20} aria-hidden="true" />
          </button>

          <p style={{
            fontSize: 12, color: 'rgba(255,255,255,0.4)',
            margin: '14px 0 0',
            animation: 'fadeInUp 0.6s ease 0.9s both',
          }}>
            No account needed · 100% private · Works offline
          </p>
        </div>
      </div>

      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0);}50%{transform:translateY(-14px);} }
        @keyframes fadeInUp { from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);} }
        @keyframes bounceIn { 0%{opacity:0;transform:scale(0.3);}50%{transform:scale(1.05);}70%{transform:scale(0.95);}100%{opacity:1;transform:scale(1);} }
      `}</style>
    </div>
  )

  /* ── Select ── */
  const total = selected.size + customs.length
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--c-bg)' }}>
      {/* Header */}
      <div style={{
        background: 'var(--grad-hero)',
        padding: 'calc(var(--safe-top) + 20px) 20px 20px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -30, right: -30,
          width: 150, height: 150, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(76,175,120,0.2) 0%, transparent 70%)',
          animation: 'float 6s ease-in-out infinite',
          pointerEvents: 'none',
        }} />
        <div style={{ maxWidth: 480, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <Logo size={32} />
            <div style={{
              padding: '4px 10px', borderRadius: 20,
              background: 'rgba(255,255,255,0.1)',
              fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 600,
              letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>
              Step 2 of 2
            </div>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#FFF', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
            Choose Your Habits
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', margin: 0 }}>
            Pick habits to track every day. You can change these later.
          </p>
        </div>
      </div>

      {/* Habit grid */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px 140px' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <p style={{
            fontSize: 11, fontWeight: 700,
            color: 'var(--c-text-secondary)',
            textTransform: 'uppercase', letterSpacing: '0.08em',
            margin: '0 0 12px 2px',
          }}>
            Suggested Habits
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            {SUGGESTED.map((habit, i) => {
              const on = selected.has(i)
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => toggle(i)}
                  aria-pressed={on}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 16px',
                    background: on
                      ? 'linear-gradient(135deg, rgba(46,125,91,0.08), rgba(76,175,120,0.04))'
                      : 'var(--c-card)',
                    border: `2px solid ${on ? 'var(--c-primary)' : 'var(--c-border)'}`,
                    borderRadius: 16, cursor: 'pointer', fontFamily: 'inherit',
                    textAlign: 'left',
                    transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
                    boxShadow: on ? '0 4px 16px rgba(46,125,91,0.15)' : 'var(--shadow-card)',
                    transform: on ? 'scale(1.01)' : 'scale(1)',
                    animation: `fadeInUp 0.4s ease ${i * 0.04}s both`,
                  }}
                >
                  <div style={{
                    width: 44, height: 44,
                    borderRadius: 12,
                    background: on ? 'rgba(46,125,91,0.12)' : 'var(--c-primary-light)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22, flexShrink: 0,
                    transition: 'all 0.2s ease',
                  }} aria-hidden="true">
                    {habit.emoji}
                  </div>
                  <span style={{
                    flex: 1,
                    fontSize: 15, fontWeight: 600,
                    color: on ? 'var(--c-primary)' : 'var(--c-text)',
                    transition: 'color 0.2s ease',
                  }}>
                    {habit.name}
                  </span>
                  <div style={{
                    width: 26, height: 26,
                    borderRadius: 8,
                    border: `2px solid ${on ? 'var(--c-primary)' : 'var(--c-border)'}`,
                    background: on ? 'var(--c-primary)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.2s cubic-bezier(0.34,1.3,0.64,1)',
                  }} aria-hidden="true">
                    {on && <Check size={14} strokeWidth={3} color="#FFF" />}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Custom habits */}
          {customs.length > 0 && (
            <>
              <p style={{
                fontSize: 11, fontWeight: 700,
                color: 'var(--c-text-secondary)',
                textTransform: 'uppercase', letterSpacing: '0.08em',
                margin: '0 0 12px 2px',
              }}>
                Your Custom Habits
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                {customs.map((h, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 16px',
                    background: 'linear-gradient(135deg, rgba(46,125,91,0.08), rgba(76,175,120,0.04))',
                    border: '2px solid var(--c-primary)',
                    borderRadius: 16,
                    animation: 'bounceIn 0.4s cubic-bezier(0.34,1.3,0.64,1)',
                  }}>
                    <span style={{ fontSize: 22 }} aria-hidden="true">{h.emoji}</span>
                    <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: 'var(--c-primary)' }}>{h.name}</span>
                    <button
                      onClick={() => setCustoms(p => p.filter((_, idx) => idx !== i))}
                      aria-label={`Remove ${h.name}`}
                      style={{
                        width: 28, height: 28, borderRadius: 8,
                        background: 'rgba(220,38,38,0.1)', border: 'none',
                        color: '#DC2626', cursor: 'pointer', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Add custom */}
          {showCustom ? (
            <div style={{
              background: 'var(--c-card)',
              border: '1px solid var(--c-border)',
              borderRadius: 16, padding: 18,
              animation: 'fadeInUp 0.3s ease',
            }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-text)', margin: '0 0 14px' }}>
                ✨ Add Custom Habit
              </p>
              <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                <input
                  type="text" value={customEmoji}
                  onChange={e => setCustomEmoji(e.target.value.slice(0, 2))}
                  maxLength={2} aria-label="Emoji"
                  style={{
                    width: 54, height: 48, textAlign: 'center', fontSize: 22,
                    borderRadius: 12, border: '1.5px solid var(--c-border)',
                    background: 'var(--c-bg)', color: 'var(--c-text)',
                    fontFamily: 'inherit', outline: 'none',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'var(--c-primary)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--c-border)')}
                />
                <input
                  type="text" value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  placeholder="Habit name…" autoFocus
                  style={{
                    flex: 1, height: 48, padding: '0 14px',
                    borderRadius: 12, border: '1.5px solid var(--c-border)',
                    background: 'var(--c-bg)', color: 'var(--c-text)',
                    fontSize: 14, fontFamily: 'inherit', outline: 'none',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'var(--c-primary)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--c-border)')}
                />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => { setShowCustom(false); setCustomName('') }}
                  style={{
                    flex: 1, height: 44, borderRadius: 12,
                    border: '1px solid var(--c-border)',
                    background: 'var(--c-bg)', color: 'var(--c-text-secondary)',
                    fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={addCustom}
                  disabled={!customName.trim()}
                  style={{
                    flex: 1, height: 44, borderRadius: 12, border: 'none',
                    background: customName.trim() ? 'var(--c-primary)' : 'var(--c-border)',
                    color: '#FFF',
                    fontSize: 14, fontWeight: 600, cursor: customName.trim() ? 'pointer' : 'not-allowed',
                    fontFamily: 'inherit',
                    transition: 'all 0.2s',
                  }}
                >
                  Add Habit
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowCustom(true)}
              style={{
                width: '100%', height: 54, borderRadius: 16,
                border: '2px dashed var(--c-border)',
                background: 'transparent', color: 'var(--c-text-secondary)',
                fontSize: 14, fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                fontFamily: 'inherit',
                transition: 'border-color 0.2s, color 0.2s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--c-primary)';
                (e.currentTarget as HTMLElement).style.color = 'var(--c-primary)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--c-border)';
                (e.currentTarget as HTMLElement).style.color = 'var(--c-text-secondary)';
              }}
            >
              <Plus size={18} aria-hidden="true" />
              Add Custom Habit
            </button>
          )}
        </div>
      </div>

      {/* Footer CTA */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        padding: '14px 20px 24px',
        background: 'var(--c-card)',
        borderTop: '1px solid var(--c-border)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.08)',
      }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          {total > 0 && (
            <p style={{
              fontSize: 13, color: 'var(--c-text-secondary)',
              margin: '0 0 10px', textAlign: 'center',
            }}>
              🎯 <strong style={{ color: 'var(--c-text)' }}>{total}</strong> habit{total !== 1 ? 's' : ''} selected
            </p>
          )}
          <button
            onClick={() => void handleStart()}
            disabled={total === 0 || saving}
            style={{
              width: '100%', height: 56, borderRadius: 18, border: 'none',
              background: total > 0 && !saving
                ? 'linear-gradient(135deg, #2E7D5B, #4CAF78)'
                : 'var(--c-border)',
              color: '#FFF',
              fontSize: 16, fontWeight: 700,
              cursor: total === 0 || saving ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              opacity: total === 0 ? 0.5 : 1,
              transition: 'all 0.3s ease',
              boxShadow: total > 0 && !saving ? '0 8px 24px rgba(46,125,91,0.4)' : 'none',
            }}
          >
            {saving ? (
              <>
                <span style={{
                  width: 20, height: 20,
                  border: '2.5px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#FFF',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                  display: 'inline-block',
                }} />
                Setting up your journey…
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Start My Journey
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </div>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes float{0%,100%{transform:translateY(0);}50%{transform:translateY(-12px);}}
        @keyframes fadeInUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}
        @keyframes bounceIn{0%{opacity:0;transform:scale(0.7);}80%{transform:scale(1.05);}100%{opacity:1;transform:scale(1);}}
      `}</style>
    </div>
  )
}
