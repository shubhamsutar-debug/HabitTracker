import type { ReactNode } from 'react'
import { Logo } from '../Logo'

interface HeaderProps {
  title: string
  subtitle?: string
  right?: ReactNode
  left?: ReactNode
  showLogo?: boolean
}

export function Header({ title, subtitle, right, left, showLogo = false }: HeaderProps) {
  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 30,
      background: 'var(--c-card)',
      borderBottom: '1px solid var(--c-border)',
      paddingTop: 'var(--safe-top)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      boxShadow: '0 1px 12px rgba(0,0,0,0.04)',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '0 20px',
        height: 58,
        maxWidth: 1200,
        margin: '0 auto',
      }}>
        {left && <div style={{ flexShrink: 0 }}>{left}</div>}

        {showLogo && (
          <Logo size={30} />
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{
            fontSize: 17,
            fontWeight: 700,
            color: 'var(--c-text)',
            margin: 0,
            lineHeight: 1.2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            letterSpacing: '-0.01em',
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
              fontWeight: 500,
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
