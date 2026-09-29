import { useState } from 'react'
import { Plus, X, Check, ArrowRight } from 'lucide-react'
import { addHabit } from '../../db/habits'
import { updateSettings } from '../../db/settings'
import type { HabitFormData } from '../../types'

const SUGGESTED: HabitFormData[] = [
  { name: 'Wake up early', emoji: '☀️', active: true },
  { name: 'Exercise', emoji: '💪', active: true },
  { name: 'Reading / Learning', emoji: '📚', active: true },
  { name: 'Project Work', emoji: '💻', active: true },
  { name: 'Social Media Detox', emoji: '📵', active: true },
  { name: 'Budget Tracking', emoji: '💰', active: true },
  { name: 'Cold Shower', emoji: '🚿', active: true },
  { name: 'Goal Journaling', emoji: '📓', active: true },
]

type Step = 'welcome' | 'select'

interface OnboardingProps {
  onComplete: () => void
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState<Step>('welcome')
  const [selected, setSelected] = useState<Set<number>>(new Set([0, 1, 2, 3]))
  const [customName, setCustomName] = useState('')
  const [customEmoji, setCustomEmoji] = useState('✅')
  const [customs, setCustoms] = useState<HabitFormData[]>([])
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [saving, setSaving] = useState(false)

  const toggleSuggested = (i: number) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  const addCustom = () => {
    if (!customName.trim()) return
    setCustoms((prev) => [...prev, { name: customName.trim(), emoji: customEmoji, active: true }])
    setCustomName('')
    setCustomEmoji('✅')
    setShowCustomInput(false)
  }

  const removeCustom = (i: number) => setCustoms((prev) => prev.filter((_, idx) => idx !== i))

  const handleStart = async () => {
    const toAdd: HabitFormData[] = [
      ...SUGGESTED.filter((_, i) => selected.has(i)),
      ...customs,
    ]
    setSaving(true)
    try {
      for (const h of toAdd) {
        await addHabit(h)
      }
      await updateSettings({ onboardingCompleted: true })
      onComplete()
    } finally {
      setSaving(false)
    }
  }

  /* ── Welcome screen ── */
  if (step === 'welcome') {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center p-8 bg-gradient-to-br from-indigo-50 to-white dark:from-slate-950 dark:to-slate-900">
        <div className="max-w-sm w-full text-center">
          {/* Logo */}
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50">
            <Check size={40} strokeWidth={3} className="text-white" aria-hidden="true" />
          </div>

          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-3">
            HabitTrack
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 mb-2">
            Build better habits,
          </p>
          <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
            one day at a time.
          </p>

          <div className="space-y-3 text-left bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 mb-8">
            {[
              ['📋', 'Create your habits once'],
              ['☑️', 'Check them off every day'],
              ['📊', 'Track your consistency'],
              ['✈️', 'Works completely offline'],
            ].map(([icon, text]) => (
              <div key={text} className="flex items-center gap-3">
                <span className="text-xl" aria-hidden="true">{icon}</span>
                <span className="text-sm text-slate-700 dark:text-slate-300">{text}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => setStep('select')}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-base font-semibold rounded-2xl transition-colors flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            Create My Habits
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </div>
      </div>
    )
  }

  /* ── Select habits screen ── */
  const totalSelected = selected.size + customs.length
  return (
    <div className="min-h-dvh flex flex-col bg-white dark:bg-slate-900">
      {/* Header */}
      <div className="px-5 pt-12 pb-5 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-1">Choose your habits</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Pick the habits you want to track every day. You can always add more later.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-32">
        {/* Suggested habits */}
        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-3">
          Suggestions
        </p>
        <div className="space-y-2 mb-5">
          {SUGGESTED.map((habit, i) => {
            const isSelected = selected.has(i)
            return (
              <button
                key={i}
                type="button"
                onClick={() => toggleSuggested(i)}
                aria-pressed={isSelected}
                className={[
                  'w-full flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800',
                ].join(' ')}
              >
                <span className="text-2xl flex-shrink-0" aria-hidden="true">{habit.emoji}</span>
                <span className={`flex-1 text-sm font-medium ${isSelected ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-800 dark:text-slate-100'}`}>
                  {habit.name}
                </span>
                <div
                  className={[
                    'w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0',
                    isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 dark:border-slate-600',
                  ].join(' ')}
                  aria-hidden="true"
                >
                  {isSelected && <Check size={14} strokeWidth={3} className="text-white" />}
                </div>
              </button>
            )
          })}
        </div>

        {/* Custom habits */}
        {customs.length > 0 && (
          <>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-3">
              Your custom habits
            </p>
            <div className="space-y-2 mb-5">
              {customs.map((h, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-4 rounded-2xl border-2 border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40"
                >
                  <span className="text-2xl flex-shrink-0" aria-hidden="true">{h.emoji}</span>
                  <span className="flex-1 text-sm font-medium text-indigo-700 dark:text-indigo-300">{h.name}</span>
                  <button
                    type="button"
                    onClick={() => removeCustom(i)}
                    aria-label={`Remove ${h.name}`}
                    className="w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:text-red-500 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  >
                    <X size={14} aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Add custom */}
        {showCustomInput ? (
          <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 mb-5 space-y-3">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Add custom habit</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={customEmoji}
                onChange={(e) => setCustomEmoji(e.target.value.slice(0, 2))}
                className="w-14 text-center text-xl border border-slate-200 dark:border-slate-700 rounded-xl py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Emoji"
                maxLength={2}
              />
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Habit name"
                autoFocus
                className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setShowCustomInput(false); setCustomName(''); }}
                className="flex-1 py-2 text-sm text-slate-600 dark:text-slate-400 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={addCustom}
                disabled={!customName.trim()}
                className="flex-1 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-40"
              >
                Add
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowCustomInput(true)}
            className="w-full flex items-center justify-center gap-2 py-3.5 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl text-sm font-medium text-slate-500 dark:text-slate-400 hover:border-indigo-400 hover:text-indigo-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <Plus size={16} aria-hidden="true" />
            Add custom habit
          </button>
        )}
      </div>

      {/* Footer CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-t border-slate-100 dark:border-slate-800">
        <div className="max-w-sm mx-auto">
          <button
            onClick={() => void handleStart()}
            disabled={totalSelected === 0 || saving}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-base font-semibold rounded-2xl transition-colors flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-40"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Setting up…
              </span>
            ) : (
              <>
                Start Tracking
                {totalSelected > 0 && (
                  <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
                    {totalSelected}
                  </span>
                )}
                <ArrowRight size={18} aria-hidden="true" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
