interface ProgressBarProps {
  percentage: number
  completed: number
  total: number
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function ProgressBar({ percentage, completed, total, showLabel = true, size = 'md' }: ProgressBarProps) {
  const safe = Math.min(100, Math.max(0, isNaN(percentage) ? 0 : percentage))
  const h = { sm: '6px', md: '10px', lg: '12px' }[size]

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex items-end justify-between mb-2">
          <span style={{ color: 'var(--c-text-secondary)', fontSize: '13px' }}>
            {completed} / {total} completed
          </span>
          <span style={{ color: 'var(--c-primary)', fontSize: '22px', fontWeight: 700, lineHeight: 1 }}>
            {safe}%
          </span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={safe}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${safe}% complete`}
        style={{
          width: '100%',
          height: h,
          background: 'var(--c-primary-light)',
          borderRadius: 999,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${safe}%`,
            background: 'var(--c-primary)',
            borderRadius: 999,
            transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
            animation: 'progressGrow 0.6s ease-out',
          }}
        />
      </div>
    </div>
  )
}
