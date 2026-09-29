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
      className={[
        'flex items-center gap-4 px-4 py-4 rounded-2xl border transition-all duration-200 active:scale-[0.99]',
        completed
          ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/70 shadow-sm shadow-indigo-100 dark:shadow-none'
          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm shadow-slate-100 dark:shadow-none',
      ].join(' ')}
    >
      {/* Emoji */}
      <span
        className="text-2xl select-none flex-shrink-0 leading-none"
        aria-hidden="true"
      >
        {habit.emoji}
      </span>

      {/* Name + description */}
      <div className="flex-1 min-w-0">
        <p
          className={[
            'text-[15px] font-medium leading-snug transition-colors',
            completed
              ? 'text-indigo-700 dark:text-indigo-300'
              : 'text-slate-800 dark:text-slate-100',
          ].join(' ')}
        >
          {habit.name}
        </p>
        {habit.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
            {habit.description}
          </p>
        )}
      </div>

      {/* Checkbox — large tap target for one-hand mobile use */}
      <HabitCheckbox
        checked={completed}
        onChange={() => onToggle(habit.id)}
        size="lg"
        label={`${completed ? 'Unmark' : 'Mark'} ${habit.name} as complete`}
      />
    </div>
  )
}
