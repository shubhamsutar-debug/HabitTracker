import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '56px 24px',
      textAlign: 'center',
    }}>
      {icon && (
        <div style={{
          width: 72,
          height: 72,
          background: 'var(--c-primary-light)',
          borderRadius: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 32,
          marginBottom: 20,
          userSelect: 'none',
        }} aria-hidden="true">
          {icon}
        </div>
      )}
      <h3 style={{
        fontSize: 17,
        fontWeight: 600,
        color: 'var(--c-text)',
        margin: '0 0 8px',
      }}>{title}</h3>
      {description && (
        <p style={{
          fontSize: 14,
          color: 'var(--c-text-secondary)',
          margin: '0 0 24px',
          maxWidth: 280,
          lineHeight: 1.6,
        }}>{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  )
}
