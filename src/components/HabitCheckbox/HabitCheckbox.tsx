import { Check } from 'lucide-react'

interface HabitCheckboxProps {
  checked: boolean
  onChange: () => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  label?: string
}

export function HabitCheckbox({
  checked,
  onChange,
  disabled = false,
  size = 'md',
  label,
}: HabitCheckboxProps) {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-7 h-7',
    lg: 'w-8 h-8',
  }
  const iconSizes = { sm: 14, md: 16, lg: 18 }

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label ?? (checked ? 'Mark incomplete' : 'Mark complete')}
      disabled={disabled}
      onClick={onChange}
      className={[
        sizes[size],
        'rounded-lg border-2 flex items-center justify-center flex-shrink-0',
        'transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
        checked
          ? 'bg-indigo-600 border-indigo-600 shadow-sm shadow-indigo-200 dark:shadow-indigo-900'
          : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-indigo-400',
        disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer active:scale-95',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {checked && (
        <Check
          size={iconSizes[size]}
          strokeWidth={3}
          className="text-white animate-check"
          aria-hidden="true"
        />
      )}
    </button>
  )
}
