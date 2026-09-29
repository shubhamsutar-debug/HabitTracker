interface ProgressBarProps {
  percentage: number
  completed: number
  total: number
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function ProgressBar({
  percentage,
  completed,
  total,
  showLabel = true,
  size = 'md',
}: ProgressBarProps) {
  const safe = Math.min(100, Math.max(0, isNaN(percentage) ? 0 : percentage))

  const heights = { sm: 'h-1.5', md: 'h-3', lg: 'h-4' }

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex items-end justify-between mb-2.5">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {completed} / {total} completed
          </span>
          <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400 leading-none">
            {safe}%
          </span>
        </div>
      )}
      <div
        className={`w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden ${heights[size]}`}
        role="progressbar"
        aria-valuenow={safe}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${safe}% complete`}
      >
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${safe}%` }}
        />
      </div>
    </div>
  )
}
