import { useEffect, useRef } from 'react'
import { AlertTriangle } from 'lucide-react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel',
  destructive = false, onConfirm, onCancel,
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (open) setTimeout(() => confirmRef.current?.focus(), 50)
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-msg"
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      }}
    >
      <div
        onClick={onCancel}
        aria-hidden="true"
        style={{ position: 'absolute', inset: 0, background: 'rgba(16,22,20,0.5)', backdropFilter: 'blur(4px)' }}
      />
      <div style={{
        position: 'relative',
        background: 'var(--c-card)',
        border: '1px solid var(--c-border)',
        borderRadius: 18,
        boxShadow: 'var(--shadow-md)',
        padding: 24,
        width: '100%',
        maxWidth: 360,
      }}>
        {destructive && (
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: '#FEE2E2', display: 'flex', alignItems: 'center',
            justifyContent: 'center', marginBottom: 16,
          }}>
            <AlertTriangle size={20} color="#DC2626" aria-hidden="true" />
          </div>
        )}
        <h2 id="confirm-title" style={{ fontSize: 16, fontWeight: 600, color: 'var(--c-text)', margin: '0 0 8px' }}>
          {title}
        </h2>
        <p id="confirm-msg" style={{ fontSize: 14, color: 'var(--c-text-secondary)', margin: '0 0 24px', lineHeight: 1.6 }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              flex: 1, height: 44, borderRadius: 10,
              border: '1px solid var(--c-border)',
              background: 'var(--c-card)',
              color: 'var(--c-text)',
              fontSize: 14, fontWeight: 500,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >{cancelLabel}</button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            style={{
              flex: 1, height: 44, borderRadius: 10, border: 'none',
              background: destructive ? '#DC2626' : 'var(--c-primary)',
              color: '#FFFFFF',
              fontSize: 14, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}
