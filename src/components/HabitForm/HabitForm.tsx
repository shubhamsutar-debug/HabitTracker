import { useState } from 'react'
import type { HabitFormData } from '../../types'

const EMOJI_SUGGESTIONS = [
  '✅', '💪', '📚', '🏃', '💧', '🧘', '🚿', '💻', '💰', '📓',
  '🚫', '📱', '☀️', '🥗', '😴', '🎯', '🎸', '✍️', '🧹', '🌿',
]

interface HabitFormProps {
  initial?: Partial<HabitFormData>
  onSubmit: (data: HabitFormData) => Promise<void> | void
  onCancel?: () => void
  submitLabel?: string
  loading?: boolean
}

export function HabitForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel = 'Save',
  loading = false,
}: HabitFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [emoji, setEmoji] = useState(initial?.emoji ?? '✅')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [active, setActive] = useState(initial?.active ?? true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!name.trim()) {
      setError('Habit name is required.')
      return
    }
    setSubmitting(true)
    try {
      await onSubmit({ name: name.trim(), emoji, description: description.trim() || undefined, active })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} noValidate className="space-y-5">
      {/* Emoji picker */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Icon
        </label>
        <div className="flex flex-wrap gap-2">
          {EMOJI_SUGGESTIONS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setEmoji(e)}
              aria-label={`Select emoji ${e}`}
              aria-pressed={emoji === e}
              className={[
                'w-10 h-10 text-xl rounded-xl border-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
                emoji === e
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50 scale-110'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300',
              ].join(' ')}
            >
              {e}
            </button>
          ))}
        </div>
        {/* Custom emoji input */}
        <div className="mt-2 flex items-center gap-2">
          <span className="text-sm text-slate-500 dark:text-slate-400">Custom:</span>
          <input
            type="text"
            value={emoji}
            onChange={(e) => setEmoji(e.target.value.slice(0, 2))}
            className="w-16 text-center text-xl border border-slate-200 dark:border-slate-700 rounded-lg py-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            maxLength={2}
            aria-label="Custom emoji"
          />
        </div>
      </div>

      {/* Name */}
      <div>
        <label
          htmlFor="habit-name"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
        >
          Habit name <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <input
          id="habit-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Morning run"
          required
          autoFocus
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
        />
        {error && (
          <p role="alert" className="mt-1.5 text-xs text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="habit-desc"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
        >
          Description <span className="text-xs font-normal text-slate-400">(optional)</span>
        </label>
        <input
          id="habit-desc"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. 30 min minimum"
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
        />
      </div>

      {/* Active toggle */}
      <div className="flex items-center justify-between py-1">
        <div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Active</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Show in daily tracking</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={active}
          onClick={() => setActive((v) => !v)}
          className={[
            'relative inline-flex w-11 h-6 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
            active ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600',
          ].join(' ')}
        >
          <span
            className={[
              'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
              active ? 'translate-x-5' : 'translate-x-0',
            ].join(' ')}
          />
        </button>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={submitting || loading}
          className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:opacity-60"
        >
          {submitting ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  )
}
