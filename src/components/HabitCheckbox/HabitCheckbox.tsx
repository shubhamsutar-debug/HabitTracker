import { Check } from 'lucide-react'

interface HabitCheckboxProps {
  checked: boolean
  onChange: () => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  label?: string
}

export function HabitCheckbox({ checked, onChange, disabled = false, size = 'md', label }: HabitCheckboxProps) {
  const boxSize = { sm: 22, md: 24, lg: 28 }[size]
  const iconSize = { sm: 12, md: 14, lg: 16 }[size]
  const touchSize = 44

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label ?? (checked ? 'Mark incomplete' : 'Mark complete')}
      disabled={disabled}
      onClick={onChange}
      style={{
        width: touchSize,
        height: touchSize,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
        border: 'none',
        padding: 0,
        cursor: disabled ? 'not-allowed' : 'pointer',
        flexShrink: 0,
        opacity: disabled ? 0.4 : 1,
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <span
        style={{
          width: boxSize,
          height: boxSize,
          borderRadius: 8,
          border: checked ? `2px solid var(--c-primary)` : `2px solid var(--c-border)`,
          background: checked ? 'var(--c-primary)' : 'var(--c-incomplete)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.15s ease',
          transform: 'scale(1)',
          flexShrink: 0,
        }}
      >
        {checked && (
          <Check
            size={iconSize}
            strokeWidth={3}
            color="#FFFFFF"
            className="animate-check"
            aria-hidden="true"
          />
        )}
      </span>
    </button>
  )
}
