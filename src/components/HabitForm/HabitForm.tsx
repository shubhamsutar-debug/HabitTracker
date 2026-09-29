import { useState } from 'react'
import type { HabitFormData } from '../../types'

const EMOJI_SUGGESTIONS = [
  '✅','💪','📚','🏃','💧','🧘','🚿','💻','💰','📓',
  '🚫','📵','☀️','🥗','😴','🎯','🎸','✍️','🧹','🌿',
]

interface HabitFormProps {
  initial?: Partial<HabitFormData>
  onSubmit: (data: HabitFormData) => Promise<void> | void
  onCancel?: () => void
  submitLabel?: string
  loading?: boolean
}

export function HabitForm({ initial, onSubmit, onCancel, submitLabel = 'Save', loading = false }: HabitFormProps) {
  const [name, setName]               = useState(initial?.name ?? '')
  const [emoji, setEmoji]             = useState(initial?.emoji ?? '✅')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [active, setActive]           = useState(initial?.active ?? true)
  const [error, setError]             = useState('')
  const [submitting, setSubmitting]   = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!name.trim()) { setError('Habit name is required.'); return }
    setSubmitting(true)
    try { await onSubmit({ name: name.trim(), emoji, description: description.trim() || undefined, active }) }
    catch (err) { setError(err instanceof Error ? err.message : 'Something went wrong.') }
    finally { setSubmitting(false) }
  }

  const inputStyle = {
    width: '100%',
    height: 44,
    padding: '0 14px',
    borderRadius: 10,
    border: '1px solid var(--c-border)',
    background: 'var(--c-bg)',
    color: 'var(--c-text)',
    fontSize: 14,
    fontFamily: 'inherit',
    outline: 'none',
    boxSizing: 'border-box' as const,
  }

  const labelStyle = {
    display: 'block',
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--c-text-secondary)',
    marginBottom: 6,
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Emoji picker */}
      <div>
        <label style={labelStyle}>Icon</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {EMOJI_SUGGESTIONS.map(e => (
            <button
              key={e}
              type="button"
              onClick={() => setEmoji(e)}
              aria-label={`Select emoji ${e}`}
              aria-pressed={emoji === e}
              style={{
                width: 40, height: 40, borderRadius: 10, fontSize: 18,
                border: emoji === e ? '2px solid var(--c-primary)' : '2px solid var(--c-border)',
                background: emoji === e ? 'var(--c-primary-light)' : 'var(--c-card)',
                cursor: 'pointer',
                transition: 'all 0.15s',
                transform: emoji === e ? 'scale(1.1)' : 'scale(1)',
              }}
            >{e}</button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
          <span style={{ fontSize: 13, color: 'var(--c-text-secondary)' }}>Custom:</span>
          <input
            type="text"
            value={emoji}
            onChange={e => setEmoji(e.target.value.slice(0, 2))}
            maxLength={2}
            aria-label="Custom emoji"
            style={{ ...inputStyle, width: 60, textAlign: 'center', fontSize: 18, padding: 0 }}
          />
        </div>
      </div>

      {/* Name */}
      <div>
        <label htmlFor="habit-name" style={labelStyle}>
          Habit name <span aria-hidden="true" style={{ color: 'var(--c-danger)' }}>*</span>
        </label>
        <input
          id="habit-name"
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. Morning run"
          required
          autoFocus
          style={inputStyle}
        />
        {error && <p role="alert" style={{ fontSize: 12, color: 'var(--c-danger)', marginTop: 4 }}>{error}</p>}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="habit-desc" style={labelStyle}>
          Description <span style={{ fontWeight: 400 }}>(optional)</span>
        </label>
        <input
          id="habit-desc"
          type="text"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="e.g. 30 min minimum"
          style={inputStyle}
        />
      </div>

      {/* Active toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
        <div>
          <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--c-text)', margin: 0 }}>Active</p>
          <p style={{ fontSize: 12, color: 'var(--c-text-secondary)', margin: '2px 0 0' }}>Show in daily tracking</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={active}
          onClick={() => setActive(v => !v)}
          style={{
            width: 48, height: 26, borderRadius: 13,
            background: active ? 'var(--c-primary)' : 'var(--c-border)',
            border: 'none', cursor: 'pointer', position: 'relative',
            transition: 'background 0.2s', flexShrink: 0,
          }}
        >
          <span style={{
            position: 'absolute', top: 3, left: 3,
            width: 20, height: 20, borderRadius: '50%',
            background: '#FFFFFF',
            transition: 'transform 0.2s',
            transform: active ? 'translateX(22px)' : 'translateX(0)',
            boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
          }} />
        </button>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            style={{
              flex: 1, height: 46, borderRadius: 10,
              border: '1px solid var(--c-border)',
              background: 'var(--c-card)',
              color: 'var(--c-text)',
              fontSize: 14, fontWeight: 500,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >Cancel</button>
        )}
        <button
          type="submit"
          disabled={submitting || loading}
          style={{
            flex: 1, height: 46, borderRadius: 10, border: 'none',
            background: 'var(--c-primary)',
            color: '#FFFFFF',
            fontSize: 14, fontWeight: 600,
            cursor: submitting ? 'not-allowed' : 'pointer',
            opacity: submitting ? 0.7 : 1,
            fontFamily: 'inherit',
            transition: 'opacity 0.15s',
          }}
        >{submitting ? 'Saving…' : submitLabel}</button>
      </div>
    </form>
  )
}
