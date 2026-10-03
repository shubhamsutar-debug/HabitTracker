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
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.08)',
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
              gap: 4,
              textDecoration: 'none',
              color: isActive ? 'var(--c-primary)' : 'var(--c-text-secondary)',
              transition: 'color 0.2s ease',
              position: 'relative',
              outline: 'none',
            })}
          >
            {({ isActive }) => (
              <>
                {/* Active pill background */}
                {isActive && (
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -54%)',
                    width: 48,
                    height: 34,
                    borderRadius: 12,
                    background: 'var(--c-primary-light)',
                    zIndex: 0,
                    animation: 'navPillIn 0.25s cubic-bezier(0.34,1.3,0.64,1)',
                  }} />
                )}

                {/* Active indicator bar */}
                {isActive && (
                  <span style={{
                    position: 'absolute',
                    top: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 28,
                    height: 3,
                    background: 'linear-gradient(90deg, #2E7D5B, #4CAF78)',
                    borderRadius: '0 0 6px 6px',
                    animation: 'navActiveSlide 0.25s ease',
                  }} />
                )}

                <div style={{
                  position: 'relative', zIndex: 1,
                  transition: 'transform 0.2s cubic-bezier(0.34,1.3,0.64,1)',
                  transform: isActive ? 'scale(1.12)' : 'scale(1)',
                }}>
                  <Icon
                    size={20}
                    strokeWidth={isActive ? 2.5 : 1.8}
                    aria-hidden="true"
                  />
                </div>

                <span style={{
                  fontSize: 9,
                  fontWeight: isActive ? 700 : 500,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  lineHeight: 1,
                  position: 'relative',
                  zIndex: 1,
                  transition: 'font-weight 0.15s',
                }}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>

      <style>{`
        @keyframes navPillIn {
          from { opacity: 0; transform: translate(-50%, -54%) scale(0.7); }
          to   { opacity: 1; transform: translate(-50%, -54%) scale(1); }
        }
      `}</style>
    </nav>
  )
}
