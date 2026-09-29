import { useState, useCallback } from 'react'
import { Plus, Pencil, Archive, Trash2, GripVertical, RotateCcw } from 'lucide-react'
import {
  DndContext, closestCenter, PointerSensor, TouchSensor,
  KeyboardSensor, useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext, sortableKeyboardCoordinates, useSortable,
  verticalListSortingStrategy, arrayMove,
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

/* ── Sortable row ── */
function SortableHabitRow({ habit, onEdit, onArchive }: { habit: Habit; onEdit: (h: Habit) => void; onArchive: (h: Habit) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: habit.id })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : undefined,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '13px 14px',
        background: 'var(--c-card)',
        border: `1px solid var(--c-border)`,
        borderRadius: 14,
        boxShadow: isDragging ? 'var(--shadow-md)' : 'var(--shadow-card)',
        opacity: isDragging ? 0.85 : 1,
      }}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        aria-label={`Drag to reorder ${habit.name}`}
        style={{
          background: 'none', border: 'none', padding: 4, cursor: 'grab',
          color: 'var(--c-border)', flexShrink: 0,
          touchAction: 'none', display: 'flex',
        }}
      >
        <GripVertical size={16} aria-hidden="true" />
      </button>

      {/* Emoji */}
      <span style={{
        width: 38, height: 38, borderRadius: 10,
        background: 'var(--c-primary-light)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18, flexShrink: 0, userSelect: 'none',
      }} aria-hidden="true">{habit.emoji}</span>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--c-text)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {habit.name}
        </p>
        {habit.description && (
          <p style={{ fontSize: 12, color: 'var(--c-text-secondary)', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {habit.description}
          </p>
        )}
      </div>

      {/* Active badge */}
      <span style={{
        fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6,
        background: habit.active ? 'var(--c-primary-light)' : 'var(--c-incomplete)',
        color: habit.active ? 'var(--c-primary)' : 'var(--c-text-secondary)',
        flexShrink: 0,
      }}>{habit.active ? 'Active' : 'Inactive'}</span>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
        {[
          { icon: <Pencil size={14} />, label: `Edit ${habit.name}`, onClick: () => onEdit(habit), color: 'var(--c-text-secondary)' },
          { icon: <Archive size={14} />, label: `Archive ${habit.name}`, onClick: () => onArchive(habit), color: 'var(--c-text-secondary)' },
        ].map((btn, i) => (
          <button
            key={i}
            onClick={btn.onClick}
            aria-label={btn.label}
            style={{
              width: 34, height: 34, borderRadius: 8,
              border: '1px solid var(--c-border)',
              background: 'var(--c-card)',
              color: btn.color, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >{btn.icon}</button>
        ))}
      </div>
    </div>
  )
}

type DialogState = { type: 'none' } | { type: 'add' } | { type: 'edit'; habit: Habit } | { type: 'archive'; habit: Habit } | { type: 'delete'; habit: Habit }

export function Habits() {
  const { habits, activeHabits, loading, addNewHabit, editHabit, archiveHabitById, deleteHabitById, reorder, reload } = useHabits()
  const [dialog, setDialog] = useState<DialogState>({ type: 'none' })
  const [showArchived, setShowArchived] = useState(false)

  const archivedHabits = habits.filter(h => !!h.archivedAt)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIdx = activeHabits.findIndex(h => h.id === active.id)
    const newIdx = activeHabits.findIndex(h => h.id === over.id)
    if (oldIdx === -1 || newIdx === -1) return
    await reorder(arrayMove(activeHabits, oldIdx, newIdx).map(h => h.id))
  }, [activeHabits, reorder])

  const handleAdd = useCallback(async (data: HabitFormData) => { await addNewHabit(data); setDialog({ type: 'none' }) }, [addNewHabit])
  const handleEdit = useCallback(async (data: HabitFormData) => {
    if (dialog.type !== 'edit') return
    await editHabit(dialog.habit.id, data); setDialog({ type: 'none' })
  }, [dialog, editHabit])

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, border: '3px solid var(--c-primary-light)', borderTopColor: 'var(--c-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Header
        title="My Habits"
        subtitle={`${activeHabits.length} active habit${activeHabits.length !== 1 ? 's' : ''}`}
        right={
          <button
            onClick={() => setDialog({ type: 'add' })}
            aria-label="Add habit"
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '0 14px', height: 36,
              background: 'var(--c-primary)', color: '#FFF',
              border: 'none', borderRadius: 10,
              fontSize: 13, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            <Plus size={15} aria-hidden="true" />
            Add
          </button>
        }
      />

      <div style={{ flex: 1, padding: '20px 16px', maxWidth: 680, margin: '0 auto', width: '100%' }} className="pb-nav">
        {activeHabits.length === 0 && archivedHabits.length === 0 ? (
          <EmptyState
            icon="🌱"
            title="Start building your routine."
            description="Add your first habit and begin tracking your consistency."
            action={
              <button
                onClick={() => setDialog({ type: 'add' })}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '0 20px', height: 46,
                  background: 'var(--c-primary)', color: '#FFF',
                  border: 'none', borderRadius: 10,
                  fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                <Plus size={16} aria-hidden="true" />
                Add Habit
              </button>
            }
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={e => void handleDragEnd(e)}>
              <SortableContext items={activeHabits.map(h => h.id)} strategy={verticalListSortingStrategy}>
                {activeHabits.map(habit => (
                  <SortableHabitRow
                    key={habit.id}
                    habit={habit}
                    onEdit={h => setDialog({ type: 'edit', habit: h })}
                    onArchive={h => setDialog({ type: 'archive', habit: h })}
                  />
                ))}
              </SortableContext>
            </DndContext>

            {activeHabits.length > 1 && (
              <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--c-text-secondary)', margin: '4px 0 0' }}>
                Hold &amp; drag ⠿ to reorder
              </p>
            )}

            {/* Archived */}
            {archivedHabits.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <button
                  onClick={() => setShowArchived(v => !v)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                    padding: '10px 0', background: 'none', border: 'none',
                    color: 'var(--c-text-secondary)', fontSize: 13, fontWeight: 500,
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  <Archive size={14} aria-hidden="true" />
                  {showArchived ? 'Hide' : 'Show'} archived ({archivedHabits.length})
                </button>
                {showArchived && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {archivedHabits.map(habit => (
                      <div
                        key={habit.id}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '12px 14px',
                          background: 'var(--c-incomplete)',
                          border: '1px solid var(--c-border)',
                          borderRadius: 14, opacity: 0.7,
                        }}
                      >
                        <span style={{ fontSize: 18, flexShrink: 0 }} aria-hidden="true">{habit.emoji}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--c-text-secondary)', margin: 0, textDecoration: 'line-through', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {habit.name}
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button
                            onClick={() => void unarchiveHabit(habit.id).then(() => reload())}
                            aria-label={`Restore ${habit.name}`}
                            style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--c-border)', background: 'var(--c-card)', color: 'var(--c-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          ><RotateCcw size={13} /></button>
                          <button
                            onClick={() => setDialog({ type: 'delete', habit })}
                            aria-label={`Delete ${habit.name}`}
                            style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--c-border)', background: 'var(--c-card)', color: '#DC2626', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          ><Trash2 size={13} /></button>
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

      <Sheet open={dialog.type === 'add'} onClose={() => setDialog({ type: 'none' })} title="New Habit">
        <HabitForm onSubmit={handleAdd} onCancel={() => setDialog({ type: 'none' })} submitLabel="Add Habit" />
      </Sheet>
      <Sheet open={dialog.type === 'edit'} onClose={() => setDialog({ type: 'none' })} title="Edit Habit">
        {dialog.type === 'edit' && <HabitForm initial={dialog.habit} onSubmit={handleEdit} onCancel={() => setDialog({ type: 'none' })} submitLabel="Save Changes" />}
      </Sheet>
      <ConfirmDialog
        open={dialog.type === 'archive'}
        title="Archive Habit"
        message={dialog.type === 'archive' ? `Archive "${dialog.habit.name}"? It disappears from daily tracking but your history is preserved.` : ''}
        confirmLabel="Archive"
        onConfirm={() => { if (dialog.type === 'archive') { void archiveHabitById(dialog.habit.id).then(() => setDialog({ type: 'none' })) } }}
        onCancel={() => setDialog({ type: 'none' })}
      />
      <ConfirmDialog
        open={dialog.type === 'delete'}
        title="Delete Habit"
        message={dialog.type === 'delete' ? `Permanently delete "${dialog.habit.name}" and all its history? This cannot be undone.` : ''}
        confirmLabel="Delete"
        destructive
        onConfirm={() => { if (dialog.type === 'delete') { void deleteHabitById(dialog.habit.id).then(() => setDialog({ type: 'none' })) } }}
        onCancel={() => setDialog({ type: 'none' })}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
