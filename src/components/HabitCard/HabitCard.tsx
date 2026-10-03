import { useState } from 'react'
import { HabitCheckbox } from '../HabitCheckbox'
import type { Habit } from '../../types'

interface HabitCardProps {
  habit: Habit
  completed: boolean
  onToggle: (habitId: string) => void
}

export function HabitCard({ habit, completed, onToggle }: HabitCardProps) {
  const [pressing, setPressing] = useState(false)

  return (
    <div
      className="habit-card"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '16px 16px',
        background: completed
          ? 'linear-gradient(135deg, rgba(46,125,91,0.06), rgba(76,175,120,0.03))'
          : 'var(--c-card)',
        border: `1.5px solid ${completed ? 'rgba(76,175,120,0.35)' : 'var(--c-border)'}`,
        borderRadius: 18,
        boxShadow: completed
          ? '0 2px 12px rgba(46,125,91,0.1)'
          : 'var(--shadow-card)',
        transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
        position: 'relative',
        overflow: 'hidden',
        transform: pressing ? 'scale(0.98)' : 'scale(1)',
        cursor: 'pointer',
        userSelect: 'none',
      }}
      onClick={() => onToggle(habit.id)}
      onMouseDown={() => setPressing(true)}
      onMouseUp={() => setPressing(false)}
      onMouseLeave={() => setPressing(false)}
      onTouchStart={() => setPressing(true)}
      onTouchEnd={() => { setPressing(false); }}
      role="button"
      tabIndex={0}
      aria-pressed={completed}
      aria-label={`${completed ? 'Unmark' : 'Mark'} ${habit.name} as complete`}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(habit.id) } }}
    >
      {/* Completion glow */}
      {completed && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(46,125,91,0.04) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />
      )}

      {/* Left accent bar */}
      <div style={{
        position: 'absolute',
        left: 0, top: 0, bottom: 0,
        width: 3,
        background: completed
          ? 'linear-gradient(180deg, #2E7D5B, #4CAF78)'
          : 'transparent',
        borderRadius: '18px 0 0 18px',
        transition: 'all 0.3s ease',
      }} />

      {/* Emoji bubble */}
      <div
        style={{
          width: 46,
          height: 46,
          borderRadius: 14,
          background: completed
            ? 'linear-gradient(135deg, rgba(46,125,91,0.15), rgba(76,175,120,0.1))'
            : 'var(--c-primary-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 22,
          flexShrink: 0,
          userSelect: 'none',
          border: completed ? '1px solid rgba(76,175,120,0.2)' : '1px solid transparent',
          transition: 'all 0.25s ease',
          filter: completed ? 'saturate(0.7) brightness(0.9)' : 'none',
        }}
        aria-hidden="true"
      >
        {habit.emoji}
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: 15,
          fontWeight: 600,
          color: completed ? 'var(--c-text-secondary)' : 'var(--c-text)',
          margin: 0,
          lineHeight: 1.3,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          transition: 'color 0.25s ease',
          textDecoration: completed ? 'line-through' : 'none',
          textDecorationColor: 'var(--c-text-secondary)',
        }}>
          {habit.name}
        </p>
        {habit.description && (
          <p style={{
            fontSize: 12,
            color: 'var(--c-text-secondary)',
            margin: '3px 0 0',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            opacity: completed ? 0.6 : 1,
            transition: 'opacity 0.25s ease',
          }}>
            {habit.description}
          </p>
        )}
        {completed && (
          <p style={{
            fontSize: 11, fontWeight: 600,
            color: 'var(--c-primary)',
            margin: '3px 0 0',
            display: 'flex', alignItems: 'center', gap: 4,
            animation: 'fadeInUp 0.3s ease',
          }}>
            ✓ Completed today
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
