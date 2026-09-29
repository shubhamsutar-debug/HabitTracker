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
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800/80"
      style={{ paddingBottom: 'var(--safe-bottom)' }}
      aria-label="Main navigation"
    >
      <div className="flex items-stretch max-w-lg mx-auto h-[60px]">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              [
                'flex-1 flex flex-col items-center justify-center gap-1 relative',
                'transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-inset',
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300',
              ].join(' ')
            }
            aria-label={label}
          >
            {({ isActive }) => (
              <>
                {/* Active indicator pip */}
                {isActive && (
                  <span className="absolute top-1.5 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
                )}
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.2 : 1.7}
                  aria-hidden="true"
                />
                <span className="text-[9px] font-semibold tracking-wide leading-none uppercase">
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
