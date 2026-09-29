import { NavLink } from 'react-router-dom'
import { CheckSquare, Calendar, BarChart2, ListChecks, Settings } from 'lucide-react'

const navItems = [
  { to: '/',         label: 'Today',    icon: CheckSquare },
  { to: '/history',  label: 'History',  icon: Calendar },
  { to: '/stats',    label: 'Stats',    icon: BarChart2 },
  { to: '/habits',   label: 'Habits',   icon: ListChecks },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function BottomNavigation() {
  return (
    <nav
      aria-label="Main navigation"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        background: 'var(--c-card)',
        borderTop: '1px solid var(--c-border)',
        paddingBottom: 'var(--safe-bottom)',
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'stretch',
        maxWidth: 480,
        margin: '0 auto',
        height: 'var(--nav-height)',
      }}>
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            aria-label={label}
            style={({ isActive }) => ({
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              textDecoration: 'none',
              color: isActive ? 'var(--c-primary)' : 'var(--c-text-secondary)',
              transition: 'color 0.15s',
              position: 'relative',
            })}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span style={{
                    position: 'absolute',
                    top: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 24,
                    height: 2.5,
                    background: 'var(--c-primary)',
                    borderRadius: '0 0 4px 4px',
                  }} />
                )}
                <Icon
                  size={21}
                  strokeWidth={isActive ? 2.2 : 1.8}
                  aria-hidden="true"
                />
                <span style={{
                  fontSize: 9,
                  fontWeight: isActive ? 600 : 500,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  lineHeight: 1,
                }}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
