import { useState } from 'react'
import { Plus, X, Check, ArrowRight } from 'lucide-react'
import { addHabit } from '../../db/habits'
import { updateSettings } from '../../db/settings'
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

  const btnPrimary: React.CSSProperties = {
    width: '100%', height: 52, borderRadius: 14, border: 'none',
    background: 'var(--c-primary)', color: '#FFF',
    fontSize: 15, fontWeight: 600,
    cursor: 'pointer', fontFamily: 'inherit',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    transition: 'background 0.15s',
  }

  /* ── Welcome ── */
  if (step === 'welcome') return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 20px', background: 'var(--c-bg)' }}>
      <div style={{ width: '100%', maxWidth: 360, textAlign: 'center' }}>
        {/* Logo */}
        <div style={{ width: 80, height: 80, background: 'var(--c-primary)', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px', boxShadow: '0 8px 24px rgba(46,125,91,0.25)' }}>
          <Check size={40} strokeWidth={3} color="#FFF" aria-hidden="true" />
        </div>
        <h1 style={{ fontSize: 30, fontWeight: 700, color: 'var(--c-text)', margin: '0 0 8px' }}>HabitTrack</h1>
        <p style={{ fontSize: 16, color: 'var(--c-text-secondary)', margin: '0 0 36px', lineHeight: 1.5 }}>
          Build better habits,<br />one day at a time.
        </p>

        {/* Features */}
        <div style={{ background: 'var(--c-card)', border: '1px solid var(--c-border)', borderRadius: 16, padding: '18px 20px', marginBottom: 28, textAlign: 'left', boxShadow: 'var(--shadow-card)' }}>
          {[['📋','Create your habits once'],['☑️','Check them off every day'],['📊','Track your consistency'],['✈️','Works completely offline']].map(([icon, text]) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '7px 0' }}>
              <span style={{ fontSize: 18 }} aria-hidden="true">{icon}</span>
              <span style={{ fontSize: 14, color: 'var(--c-text)' }}>{text}</span>
            </div>
          ))}
        </div>

        <button onClick={() => setStep('select')} style={btnPrimary}>
          Create My Habits <ArrowRight size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  )

  /* ── Select ── */
  const total = selected.size + customs.length
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--c-bg)' }}>
      {/* Header */}
      <div style={{ background: 'var(--c-card)', borderBottom: '1px solid var(--c-border)', padding: '40px 20px 18px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--c-text)', margin: '0 0 4px' }}>Choose your habits</h1>
        <p style={{ fontSize: 14, color: 'var(--c-text-secondary)', margin: 0 }}>Pick habits to track every day. You can change these later.</p>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 120px' }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--c-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px 4px' }}>Suggestions</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          {SUGGESTED.map((habit, i) => {
            const on = selected.has(i)
            return (
              <button key={i} type="button" onClick={() => toggle(i)} aria-pressed={on}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '13px 14px',
                  background: on ? 'var(--c-primary-light)' : 'var(--c-card)',
                  border: `2px solid ${on ? 'var(--c-primary)' : 'var(--c-border)'}`,
                  borderRadius: 14, cursor: 'pointer', fontFamily: 'inherit',
                  textAlign: 'left', transition: 'all 0.15s',
                }}>
                <span style={{ width: 38, height: 38, borderRadius: 10, background: on ? 'var(--c-primary-light)' : 'var(--c-incomplete)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }} aria-hidden="true">{habit.emoji}</span>
                <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: on ? 'var(--c-primary)' : 'var(--c-text)' }}>{habit.name}</span>
                <span style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${on ? 'var(--c-primary)' : 'var(--c-border)'}`, background: on ? 'var(--c-primary)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }} aria-hidden="true">
                  {on && <Check size={12} strokeWidth={3} color="#FFF" />}
                </span>
              </button>
            )
          })}
        </div>

        {/* Custom habits */}
        {customs.length > 0 && (
          <>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--c-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px 4px' }}>Your Custom Habits</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              {customs.map((h, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--c-primary-light)', border: '2px solid var(--c-primary)', borderRadius: 14 }}>
                  <span style={{ fontSize: 20 }} aria-hidden="true">{h.emoji}</span>
                  <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: 'var(--c-primary)' }}>{h.name}</span>
                  <button onClick={() => setCustoms(p => p.filter((_, idx) => idx !== i))} aria-label={`Remove ${h.name}`}
                    style={{ background: 'none', border: 'none', color: 'var(--c-text-secondary)', cursor: 'pointer', display: 'flex' }}>
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Add custom */}
        {showCustom ? (
          <div style={{ background: 'var(--c-card)', border: '1px solid var(--c-border)', borderRadius: 14, padding: 16, marginBottom: 8 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-text)', margin: '0 0 12px' }}>Add custom habit</p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <input type="text" value={customEmoji} onChange={e => setCustomEmoji(e.target.value.slice(0, 2))} maxLength={2} aria-label="Emoji"
                style={{ width: 52, height: 42, textAlign: 'center', fontSize: 20, borderRadius: 10, border: '1px solid var(--c-border)', background: 'var(--c-bg)', color: 'var(--c-text)', fontFamily: 'inherit', outline: 'none' }} />
              <input type="text" value={customName} onChange={e => setCustomName(e.target.value)} placeholder="Habit name" autoFocus
                style={{ flex: 1, height: 42, padding: '0 12px', borderRadius: 10, border: '1px solid var(--c-border)', background: 'var(--c-bg)', color: 'var(--c-text)', fontSize: 14, fontFamily: 'inherit', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => { setShowCustom(false); setCustomName('') }} style={{ flex: 1, height: 40, borderRadius: 10, border: '1px solid var(--c-border)', background: 'var(--c-card)', color: 'var(--c-text)', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
              <button onClick={addCustom} disabled={!customName.trim()} style={{ flex: 1, height: 40, borderRadius: 10, border: 'none', background: 'var(--c-primary)', color: '#FFF', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', opacity: customName.trim() ? 1 : 0.4 }}>Add</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowCustom(true)}
            style={{ width: '100%', height: 48, borderRadius: 14, border: '2px dashed var(--c-border)', background: 'transparent', color: 'var(--c-text-secondary)', fontSize: 14, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'inherit' }}>
            <Plus size={16} aria-hidden="true" /> Add custom habit
          </button>
        )}
      </div>

      {/* Footer CTA */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '12px 16px 24px', background: 'var(--c-card)', borderTop: '1px solid var(--c-border)' }}>
        <div style={{ maxWidth: 400, margin: '0 auto' }}>
          <button onClick={() => void handleStart()} disabled={total === 0 || saving} style={{ ...btnPrimary, opacity: total === 0 || saving ? 0.5 : 1 }}>
            {saving ? (
              <><span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#FFF', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} /> Setting up…</>
            ) : (
              <>Start Tracking {total > 0 && <span style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: '1px 8px', fontSize: 12 }}>{total}</span>} <ArrowRight size={18} /></>
            )}
          </button>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
