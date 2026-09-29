import type { ReactNode } from 'react'

interface HeaderProps {
  title: string
  subtitle?: string
  right?: ReactNode
  left?: ReactNode
}

export function Header({ title, subtitle, right, left }: HeaderProps) {
  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 30,
      background: 'var(--c-card)',
      borderBottom: '1px solid var(--c-border)',
      paddingTop: 'var(--safe-top)',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '0 20px',
        height: 56,
        maxWidth: 1200,
        margin: '0 auto',
      }}>
        {left && <div style={{ flexShrink: 0 }}>{left}</div>}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{
            fontSize: 16,
            fontWeight: 600,
            color: 'var(--c-text)',
            margin: 0,
            lineHeight: 1.2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{
              fontSize: 11,
              color: 'var(--c-text-secondary)',
              margin: '1px 0 0',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {subtitle}
            </p>
          )}
        </div>
        {right && <div style={{ flexShrink: 0 }}>{right}</div>}
      </div>
    </header>
  )
}
