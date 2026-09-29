import { useState, useCallback } from 'react'
import { Plus, Pencil, Archive, Trash2, GripVertical, RotateCcw } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useHabits } from '../../hooks/useHabits'
import { unarchiveHabit } from '../../db/habits'
import { Sheet } from '../../components/Sheet'
import { HabitForm } from '../../components/HabitForm'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { EmptyState } from '../../components/EmptyState'
import { Header } from '../../components/Header'
import type { Habit, HabitFormData } from '../../types'

/* ─── Sortable habit row ─── */
function SortableHabitRow({
  habit,
  onEdit,
  onArchive,
}: {
  habit: Habit
  onEdit: (h: Habit) => void
  onArchive: (h: Habit) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: habit.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={[
        'flex items-center gap-3 p-3.5 bg-white dark:bg-slate-800 rounded-2xl border transition-shadow',
        isDragging
          ? 'shadow-xl border-indigo-300 dark:border-indigo-600 opacity-80'
          : 'border-slate-200 dark:border-slate-700 shadow-sm',
      ].join(' ')}
    >
      {/* Drag handle — only this area initiates drag */}
      <button
        {...attributes}
        {...listeners}
        aria-label={`Drag to reorder ${habit.name}`}
        className="touch-none text-slate-400 dark:text-slate-500 cursor-grab active:cursor-grabbing flex-shrink-0 p-1 -ml-1 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      >
        <GripVertical size={18} aria-hidden="true" />
      </button>

      {/* Emoji */}
      <span className="text-xl select-none flex-shrink-0" aria-hidden="true">
        {habit.emoji}
      </span>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate leading-snug">
          {habit.name}
        </p>
        {habit.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
            {habit.description}
          </p>
        )}
      </div>

      {/* Active badge */}
      <span
        className={[
          'text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 hidden sm:inline-flex',
          habit.active
            ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400'
            : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400',
        ].join(' ')}
      >
        {habit.active ? 'Active' : 'Inactive'}
      </span>

      {/* Actions */}
      <div className="flex items-center gap-0.5 flex-shrink-0">
        <button
          onClick={() => onEdit(habit)}
          aria-label={`Edit ${habit.name}`}
          className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <Pencil size={15} aria-hidden="true" />
        </button>
        <button
          onClick={() => onArchive(habit)}
          aria-label={`Archive ${habit.name}`}
          className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <Archive size={15} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

/* ─── Dialog state ─── */
type DialogState =
  | { type: 'none' }
  | { type: 'add' }
  | { type: 'edit'; habit: Habit }
  | { type: 'archive'; habit: Habit }
  | { type: 'delete'; habit: Habit }

/* ─── Main Habits page ─── */
export function Habits() {
  const { habits, activeHabits, loading, addNewHabit, editHabit, archiveHabitById, deleteHabitById, reorder, reload } =
    useHabits()
  const [dialog, setDialog] = useState<DialogState>({ type: 'none' })
  const [showArchived, setShowArchived] = useState(false)

  const archivedHabits = habits.filter((h) => !!h.archivedAt)

  /* ─── dnd-kit sensors — supports mouse, touch AND keyboard ─── */
  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Require a small movement before drag starts (prevents accidental drags on tap)
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      // 200ms hold before drag starts on touch — feels natural on mobile
      activationConstraint: { delay: 200, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return
      const oldIndex = activeHabits.findIndex((h) => h.id === active.id)
      const newIndex = activeHabits.findIndex((h) => h.id === over.id)
      if (oldIndex === -1 || newIndex === -1) return
      const reordered = arrayMove(activeHabits, oldIndex, newIndex)
      await reorder(reordered.map((h) => h.id))
    },
    [activeHabits, reorder],
  )

  /* ─── Sheet handlers ─── */
  const handleAdd = useCallback(
    async (data: HabitFormData) => {
      await addNewHabit(data)
      setDialog({ type: 'none' })
    },
    [addNewHabit],
  )

  const handleEdit = useCallback(
    async (data: HabitFormData) => {
      if (dialog.type !== 'edit') return
      await editHabit(dialog.habit.id, data)
      setDialog({ type: 'none' })
    },
    [dialog, editHabit],
  )

  const handleArchiveConfirm = useCallback(async () => {
    if (dialog.type !== 'archive') return
    await archiveHabitById(dialog.habit.id)
    setDialog({ type: 'none' })
  }, [dialog, archiveHabitById])

  const handleDeleteConfirm = useCallback(async () => {
    if (dialog.type !== 'delete') return
    await deleteHabitById(dialog.habit.id)
    setDialog({ type: 'none' })
  }, [dialog, deleteHabitById])

  const handleUnarchive = useCallback(
    async (habit: Habit) => {
      await unarchiveHabit(habit.id)
      await reload()
    },
    [reload],
  )

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="My Habits"
        subtitle={`${activeHabits.length} active habit${activeHabits.length !== 1 ? 's' : ''}`}
        right={
          <button
            onClick={() => setDialog({ type: 'add' })}
            aria-label="Add habit"
            className="w-9 h-9 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <Plus size={18} aria-hidden="true" />
          </button>
        }
      />

      <div className="flex-1 px-4 pt-4 pb-nav max-w-2xl mx-auto w-full">
        {activeHabits.length === 0 && archivedHabits.length === 0 ? (
          <EmptyState
            icon="🌱"
            title="Start building your routine."
            description="Add your first habit and begin tracking your consistency."
            action={
              <button
                onClick={() => setDialog({ type: 'add' })}
                className="inline-flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <Plus size={16} aria-hidden="true" />
                Add Habit
              </button>
            }
          />
        ) : (
          <div className="space-y-2">
            {activeHabits.length === 0 && (
              <p className="text-sm text-center text-slate-500 dark:text-slate-400 py-4">
                No active habits. Tap + to add one.
              </p>
            )}

            {/* @dnd-kit sortable list */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={(e) => void handleDragEnd(e)}
            >
              <SortableContext items={activeHabits.map((h) => h.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {activeHabits.map((habit) => (
                    <SortableHabitRow
                      key={habit.id}
                      habit={habit}
                      onEdit={(h) => setDialog({ type: 'edit', habit: h })}
                      onArchive={(h) => setDialog({ type: 'archive', habit: h })}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {/* Drag hint */}
            {activeHabits.length > 1 && (
              <p className="text-center text-xs text-slate-400 dark:text-slate-500 pt-1">
                Hold &amp; drag <span aria-hidden="true">⠿</span> to reorder
              </p>
            )}

            {/* Archived section */}
            {archivedHabits.length > 0 && (
              <div className="pt-3">
                <button
                  onClick={() => setShowArchived((v) => !v)}
                  className="w-full flex items-center gap-2 py-2.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg"
                >
                  <Archive size={14} aria-hidden="true" />
                  <span>{showArchived ? 'Hide' : 'Show'} archived ({archivedHabits.length})</span>
                </button>

                {showArchived && (
                  <div className="space-y-2 mt-1">
                    {archivedHabits.map((habit) => (
                      <div
                        key={habit.id}
                        className="flex items-center gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700"
                      >
                        <span className="text-xl select-none flex-shrink-0 opacity-50" aria-hidden="true">
                          {habit.emoji}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate line-through">
                            {habit.name}
                          </p>
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 font-medium flex-shrink-0 hidden sm:inline-flex">
                          Archived
                        </span>
                        <div className="flex items-center gap-0.5 flex-shrink-0">
                          <button
                            onClick={() => void handleUnarchive(habit)}
                            aria-label={`Restore ${habit.name}`}
                            className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                          >
                            <RotateCcw size={15} aria-hidden="true" />
                          </button>
                          <button
                            onClick={() => setDialog({ type: 'delete', habit })}
                            aria-label={`Delete ${habit.name}`}
                            className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                          >
                            <Trash2 size={15} aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sheets */}
      <Sheet open={dialog.type === 'add'} onClose={() => setDialog({ type: 'none' })} title="New Habit">
        <HabitForm onSubmit={handleAdd} onCancel={() => setDialog({ type: 'none' })} submitLabel="Add Habit" />
      </Sheet>

      <Sheet open={dialog.type === 'edit'} onClose={() => setDialog({ type: 'none' })} title="Edit Habit">
        {dialog.type === 'edit' && (
          <HabitForm
            initial={dialog.habit}
            onSubmit={handleEdit}
            onCancel={() => setDialog({ type: 'none' })}
            submitLabel="Save Changes"
          />
        )}
      </Sheet>

      {/* Confirm dialogs */}
      <ConfirmDialog
        open={dialog.type === 'archive'}
        title="Archive Habit"
        message={dialog.type === 'archive' ? `Archive "${dialog.habit.name}"? It disappears from daily tracking but your history is preserved.` : ''}
        confirmLabel="Archive"
        onConfirm={() => void handleArchiveConfirm()}
        onCancel={() => setDialog({ type: 'none' })}
      />

      <ConfirmDialog
        open={dialog.type === 'delete'}
        title="Delete Habit"
        message={dialog.type === 'delete' ? `Permanently delete "${dialog.habit.name}" and all its history? This cannot be undone.` : ''}
        confirmLabel="Delete"
        destructive
        onConfirm={() => void handleDeleteConfirm()}
        onCancel={() => setDialog({ type: 'none' })}
      />
    </div>
  )
}
