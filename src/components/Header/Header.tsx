import type { ReactNode } from 'react'

interface HeaderProps {
  title: string
  subtitle?: string
  right?: ReactNode
  left?: ReactNode
}

export function Header({ title, subtitle, right, left }: HeaderProps) {
  return (
    <header
      className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/70 dark:border-slate-800/70"
      style={{ paddingTop: 'var(--safe-top)' }}
    >
      <div className="flex items-center gap-3 px-4 h-14 max-w-2xl mx-auto">
        {left && <div className="flex-shrink-0">{left}</div>}
        <div className="flex-1 min-w-0">
          <h1 className="text-[15px] font-semibold text-slate-900 dark:text-slate-100 truncate leading-tight tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
        {right && <div className="flex-shrink-0">{right}</div>}
      </div>
    </header>
  )
}
