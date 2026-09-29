import { HabitCheckbox } from '../HabitCheckbox'
import type { Habit } from '../../types'

interface HabitCardProps {
  habit: Habit
  completed: boolean
  onToggle: (habitId: string) => void
}

export function HabitCard({ habit, completed, onToggle }: HabitCardProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '14px 16px',
        background: 'var(--c-card)',
        border: `1px solid ${completed ? 'var(--c-primary-light)' : 'var(--c-border)'}`,
        borderRadius: 14,
        borderLeft: completed ? '3px solid var(--c-primary)' : '3px solid transparent',
        boxShadow: 'var(--shadow-card)',
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
    >
      {/* Emoji bubble */}
      <span
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: 'var(--c-primary-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 20,
          flexShrink: 0,
          userSelect: 'none',
        }}
        aria-hidden="true"
      >
        {habit.emoji}
      </span>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: 15,
          fontWeight: 500,
          color: completed ? 'var(--c-text-secondary)' : 'var(--c-text)',
          margin: 0,
          lineHeight: 1.3,
          textDecoration: completed ? 'none' : 'none',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          transition: 'color 0.2s',
        }}>
          {habit.name}
        </p>
        {habit.description && (
          <p style={{
            fontSize: 12,
            color: 'var(--c-text-secondary)',
            margin: '2px 0 0',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {habit.description}
          </p>
        )}
      </div>

      {/* Checkbox */}
      <HabitCheckbox
        checked={completed}
        onChange={() => onToggle(habit.id)}
        size="lg"
        label={`${completed ? 'Unmark' : 'Mark'} ${habit.name} as complete`}
      />
    </div>
  )
}
