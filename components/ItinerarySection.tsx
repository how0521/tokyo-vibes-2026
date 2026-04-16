'use client'

import { useEffect, useState, useRef } from 'react'
import {
  MapPin, Plus, Trash2, Clock, StickyNote, X, Check,
  ExternalLink, Loader2, AlertTriangle, Sparkles,
  GripVertical, ChevronUp, ChevronDown
} from 'lucide-react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  supabase, fetchItinerary, addItineraryItem,
  updateItineraryItem, deleteItineraryItem, batchUpdateTimes
} from '@/lib/supabase'
import type { ItineraryItem, TransitMode } from '@/lib/types'
import {
  calcEndTime, calcNextStart, timeToMinutes,
  hasOverlap, TRANSIT_MODE_LABELS, TRANSIT_MODE_ICONS
} from '@/lib/types'

const DAYS = [
  { num: 1, label: 'Day 1', date: '5/20' },
  { num: 2, label: 'Day 2', date: '5/21' },
  { num: 3, label: 'Day 3', date: '5/22' },
  { num: 4, label: 'Day 4', date: '5/23' },
  { num: 5, label: 'Day 5', date: '5/24' },
  { num: 6, label: 'Day 6', date: '5/25' },
]

const EMPTY_FORM = {
  time: '', title: '', map_url: '', notes: '',
  stay_duration: '60', transit_duration: '30', transit_mode: 'train' as TransitMode
}

const inputClass =
  'w-full border border-soft-border rounded-xl px-4 py-3 bg-warm-gray text-sm text-charcoal placeholder:text-mid-gray outline-none focus:border-tokyo-red transition-colors'
const timeInputClass =
  'w-36 border border-soft-border rounded-xl px-3 py-3 bg-warm-gray text-sm text-charcoal outline-none focus:border-tokyo-red transition-colors'
const numInputClass =
  'w-24 border border-soft-border rounded-xl px-3 py-3 bg-warm-gray text-sm text-charcoal outline-none focus:border-tokyo-red transition-colors'

interface OverlapWarning {
  conflictingItemTitle: string
  postponeMinutes: number
  affectedIds: string[]
  newTimes: string[]
}

// 計算當天所有項目的時間鏈（自動重排）
function recomputeChain(
  items: ItineraryItem[],
  fromIndex: number
): Array<{ id: string; time: string }> {
  const updates: Array<{ id: string; time: string }> = []
  for (let i = fromIndex + 1; i < items.length; i++) {
    const prev = items[i - 1]
    const prevEnd = calcEndTime(
      i - 1 === fromIndex ? items[fromIndex].time : updates.find(u => u.id === prev.id)?.time ?? prev.time,
      prev.stay_duration
    )
    const newStart = calcNextStart(prevEnd, items[i].transit_duration)
    updates.push({ id: items[i].id, time: newStart })
    // Mutate local copy so subsequent iterations use updated times
    items[i] = { ...items[i], time: newStart }
  }
  return updates
}

export default function ItinerarySection() {
  const [activeDay, setActiveDay] = useState(1)
  const [items, setItems] = useState<ItineraryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState(EMPTY_FORM)
  const [overlapWarning, setOverlapWarning] = useState<OverlapWarning | null>(null)
  const [pendingEdit, setPendingEdit] = useState<{ id: string; form: typeof EMPTY_FORM } | null>(null)
  const formRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchItinerary().then((data) => {
      setItems(data)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    const channel = supabase
      .channel('itinerary-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'itinerary' }, (payload) => {
        const { eventType, new: newRow, old: oldRow } = payload
        if (eventType === 'INSERT') {
          setItems((prev) => [...prev, newRow as ItineraryItem].sort(sortItems))
        } else if (eventType === 'UPDATE') {
          setItems((prev) =>
            prev.map((item) => (item.id === (newRow as ItineraryItem).id ? (newRow as ItineraryItem) : item))
          )
        } else if (eventType === 'DELETE') {
          setItems((prev) => prev.filter((item) => item.id !== (oldRow as ItineraryItem).id))
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  function sortItems(a: ItineraryItem, b: ItineraryItem) {
    if (a.day_num !== b.day_num) return a.day_num - b.day_num
    return a.time.localeCompare(b.time)
  }

  const dayItems = items.filter((i) => i.day_num === activeDay)

  // ── 儲存編輯（含重疊偵測）──
  async function handleEditSave(id: string, formData: typeof EMPTY_FORM) {
    if (!formData.title.trim()) return
    const idx = dayItems.findIndex((i) => i.id === id)
    const prev = idx > 0 ? dayItems[idx - 1] : null

    const newTime = formData.time || dayItems[idx].time
    const newStay = parseInt(formData.stay_duration) || 60

    // 偵測與前一個景點是否重疊
    if (prev) {
      const prevEnd = calcEndTime(prev.time, prev.stay_duration)
      if (timeToMinutes(newTime) < timeToMinutes(prevEnd)) {
        // 計算需要順延多少分鐘
        const overlap = timeToMinutes(prevEnd) - timeToMinutes(newTime)
        // 計算後續全部受影響的 id 與新時間
        const affectedItems = dayItems.slice(idx)
        const newTimes: string[] = []
        let cursor = newTime
        for (let i = 0; i < affectedItems.length; i++) {
          if (i === 0) {
            newTimes.push(calcNextStart(prevEnd, 0)) // 緊接在 prev 結束後
          } else {
            cursor = calcNextStart(calcEndTime(newTimes[i - 1], parseInt(formData.stay_duration) || affectedItems[i - 1].stay_duration), affectedItems[i].transit_duration)
            newTimes.push(cursor)
          }
        }
        setOverlapWarning({
          conflictingItemTitle: prev.title,
          postponeMinutes: overlap,
          affectedIds: affectedItems.map((i) => i.id),
          newTimes,
        })
        setPendingEdit({ id, form: formData })
        return
      }
    }

    await doEditSave(id, formData)
  }

  async function doEditSave(id: string, formData: typeof EMPTY_FORM) {
    setSaving(true)
    const updates = {
      time: formData.time,
      title: formData.title.trim(),
      map_url: formData.map_url.trim() || null,
      notes: formData.notes.trim() || null,
      stay_duration: parseInt(formData.stay_duration) || 60,
      transit_duration: parseInt(formData.transit_duration) || 30,
      transit_mode: formData.transit_mode,
    }

    // 樂觀更新
    setItems((prev) =>
      prev.map((i) => i.id === id ? { ...i, ...updates } : i).sort(sortItems)
    )
    await updateItineraryItem(id, updates)

    // 重新計算後續時間鏈
    const updatedDayItems = items
      .map((i) => i.id === id ? { ...i, ...updates } : i)
      .filter((i) => i.day_num === activeDay)
      .sort(sortItems)
    const changedIdx = updatedDayItems.findIndex((i) => i.id === id)
    const chainUpdates = recomputeChain([...updatedDayItems], changedIdx)
    if (chainUpdates.length > 0) {
      setItems((prev) => {
        const map = new Map(chainUpdates.map((u) => [u.id, u.time]))
        return prev.map((i) => map.has(i.id) ? { ...i, time: map.get(i.id)! } : i)
      })
      await batchUpdateTimes(chainUpdates)
    }

    setEditingId(null)
    setSaving(false)
  }

  // ── 一鍵順延 ──
  async function handlePostpone() {
    if (!overlapWarning || !pendingEdit) return
    setSaving(true)
    const { affectedIds, newTimes } = overlapWarning
    const { id, form: formData } = pendingEdit

    // 先儲存當前編輯項目
    const updates = {
      time: newTimes[0],
      title: formData.title.trim(),
      map_url: formData.map_url.trim() || null,
      notes: formData.notes.trim() || null,
      stay_duration: parseInt(formData.stay_duration) || 60,
      transit_duration: parseInt(formData.transit_duration) || 30,
      transit_mode: formData.transit_mode,
    }
    setItems((prev) =>
      prev.map((i) => {
        if (i.id === id) return { ...i, ...updates }
        const idx = affectedIds.indexOf(i.id)
        return idx !== -1 ? { ...i, time: newTimes[idx] } : i
      })
    )
    await updateItineraryItem(id, updates)
    const batchUpdates = affectedIds.slice(1).map((aid, i) => ({ id: aid, time: newTimes[i + 1] }))
    if (batchUpdates.length > 0) await batchUpdateTimes(batchUpdates)

    setOverlapWarning(null)
    setPendingEdit(null)
    setEditingId(null)
    setSaving(false)
  }

  // ── 新增景點 ──
  async function handleAdd() {
    if (!form.title.trim()) return
    setSaving(true)
    await addItineraryItem({
      day_num: activeDay,
      time: form.time || '09:00',
      title: form.title.trim(),
      map_url: form.map_url.trim() || null,
      notes: form.notes.trim() || null,
      is_done: false,
      stay_duration: parseInt(form.stay_duration) || 60,
      transit_duration: parseInt(form.transit_duration) || 30,
      transit_mode: form.transit_mode,
    })
    setForm(EMPTY_FORM)
    setShowForm(false)
    setSaving(false)
  }

  async function handleDelete(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id))
    await deleteItineraryItem(id)
  }

  function startEdit(item: ItineraryItem) {
    setEditingId(item.id)
    setEditForm({
      time: item.time,
      title: item.title,
      map_url: item.map_url ?? '',
      notes: item.notes ?? '',
      stay_duration: String(item.stay_duration ?? 60),
      transit_duration: String(item.transit_duration ?? 30),
      transit_mode: (item.transit_mode as TransitMode) ?? 'train',
    })
  }

  async function handleToggle(item: ItineraryItem) {
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, is_done: !i.is_done } : i)))
    await updateItineraryItem(item.id, { is_done: !item.is_done })
  }

  // ── 快速修改交通模式（transit block 點擊）──
  async function cycleTransitMode(item: ItineraryItem) {
    const modes: TransitMode[] = ['walk', 'train', 'taxi', 'bus']
    const next = modes[(modes.indexOf(item.transit_mode as TransitMode) + 1) % modes.length]
    setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, transit_mode: next } : i))
    await updateItineraryItem(item.id, { transit_mode: next })
  }

  async function updateTransitDuration(item: ItineraryItem, minutes: number) {
    const updated = { ...item, transit_duration: minutes }
    setItems((prev) => {
      const newItems = prev.map((i) => i.id === item.id ? updated : i)
      return newItems
    })
    await updateItineraryItem(item.id, { transit_duration: minutes })

    // 重新計算後續時間鏈
    const updatedDayItems = items
      .map((i) => i.id === item.id ? updated : i)
      .filter((i) => i.day_num === activeDay)
      .sort(sortItems)
    const changedIdx = updatedDayItems.findIndex((i) => i.id === item.id)
    // 從 changedIdx 開始重算（本身時間不變，但它影響後面的）
    const chainUpdates = recomputeChain([...updatedDayItems], changedIdx)
    if (chainUpdates.length > 0) {
      setItems((prev) => {
        const map = new Map(chainUpdates.map((u) => [u.id, u.time]))
        return prev.map((i) => map.has(i.id) ? { ...i, time: map.get(i.id)! } : i)
      })
      await batchUpdateTimes(chainUpdates)
    }
  }

  // ── 拖曳感測器（需拖曳 5px 才觸發，避免干擾點擊）──
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  // ── 重新排序後重算時間鏈 ──
  async function reorderDayItems(newDayItems: ItineraryItem[]) {
    if (newDayItems.length === 0) return
    const originalFirstTime = dayItems[0].time
    const ordered = [...newDayItems]
    ordered[0] = { ...ordered[0], time: originalFirstTime }

    const chainUpdates = recomputeChain([...ordered], 0)

    const updatesMap = new Map<string, string>([
      [ordered[0].id, ordered[0].time],
      ...chainUpdates.map(u => [u.id, u.time] as [string, string])
    ])

    setItems(prev => {
      const otherItems = prev.filter(i => i.day_num !== activeDay)
      const updatedDayItems = ordered.map(i => ({
        ...i,
        time: updatesMap.get(i.id) ?? i.time
      }))
      return [...otherItems, ...updatedDayItems]
    })

    const dbUpdates = Array.from(updatesMap.entries()).map(([id, time]) => ({ id, time }))
    if (dbUpdates.length > 0) await batchUpdateTimes(dbUpdates)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = dayItems.findIndex(i => i.id === active.id)
    const newIndex = dayItems.findIndex(i => i.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    reorderDayItems(arrayMove([...dayItems], oldIndex, newIndex))
  }

  async function handleMoveItem(id: string, direction: 'up' | 'down') {
    const idx = dayItems.findIndex(i => i.id === id)
    if (direction === 'up' && idx <= 0) return
    if (direction === 'down' && idx >= dayItems.length - 1) return
    const newIdx = direction === 'up' ? idx - 1 : idx + 1
    await reorderDayItems(arrayMove([...dayItems], idx, newIdx))
  }

  const doneCount = dayItems.filter((i) => i.is_done).length

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="section-title mb-0">每日行程</p>
        {!loading && (
          <span className="text-xs text-mid-gray">{doneCount}/{dayItems.length} 完成</span>
        )}
      </div>

      {/* Day Tabs */}
      <div className="flex gap-0 mb-4 bg-warm-gray rounded-2xl p-1 overflow-x-auto">
        {DAYS.map((d) => {
          const count = items.filter((i) => i.day_num === d.num).length
          const active = activeDay === d.num
          return (
            <button
              key={d.num}
              onClick={() => setActiveDay(d.num)}
              className={`flex-1 min-w-[52px] flex flex-col items-center justify-center py-2 rounded-xl transition-all duration-200 ${
                active ? 'bg-white shadow-sm' : ''
              }`}
            >
              <span className={`text-xs font-semibold ${active ? 'text-tokyo-red' : 'text-mid-gray'}`}>
                {d.label}
              </span>
              <span className={`text-[10px] ${active ? 'text-charcoal' : 'text-mid-gray'}`}>
                {d.date}
              </span>
              {count > 0 && (
                <span className={`mt-0.5 text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center ${
                  active ? 'bg-tokyo-red text-white' : 'bg-mid-gray/30 text-mid-gray'
                }`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Items */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-mid-gray" />
        </div>
      ) : (
        <div className="mb-4">
          {dayItems.length === 0 && !showForm && (
            <div className="text-center py-10 text-mid-gray">
              <p className="text-sm">還沒有行程</p>
              <p className="text-xs mt-1">點擊下方按鈕新增景點</p>
            </div>
          )}

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={dayItems.map(i => i.id)} strategy={verticalListSortingStrategy}>
              {dayItems.map((item, idx) => (
                <SortableItemRow
                  key={item.id}
                  item={item}
                  idx={idx}
                  totalItems={dayItems.length}
                  editingId={editingId}
                  editForm={editForm}
                  setEditForm={setEditForm}
                  saving={saving}
                  onEditSave={() => handleEditSave(item.id, editForm)}
                  onEditCancel={() => setEditingId(null)}
                  onStartEdit={() => startEdit(item)}
                  onToggle={() => handleToggle(item)}
                  onDelete={() => handleDelete(item.id)}
                  onMoveUp={() => handleMoveItem(item.id, 'up')}
                  onMoveDown={() => handleMoveItem(item.id, 'down')}
                  onCycleTransitMode={() => cycleTransitMode(item)}
                  onUpdateTransitDuration={(min) => updateTransitDuration(item, min)}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      )}

      {/* Add Form */}
      {showForm && (
        <div ref={formRef} className="card p-4 mb-3 border-l-4 border-l-tokyo-red animate-slide-up">
          <p className="text-sm font-semibold text-charcoal mb-3">新增景點到 Day {activeDay}</p>
          <SpotFormFields form={form} setForm={setForm} />
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleAdd}
              disabled={saving || !form.title.trim()}
              className="btn-primary flex-1 disabled:opacity-40"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
              新增
            </button>
            <button onClick={() => { setShowForm(false); setForm(EMPTY_FORM) }} className="btn-outline px-4">
              <X size={15} />
            </button>
          </div>
        </div>
      )}

      {!showForm && (
        <button onClick={() => setShowForm(true)} className="w-full btn-outline border-dashed">
          <Plus size={16} />
          新增景點到 Day {activeDay}
        </button>
      )}

      {/* 重疊警告 Modal */}
      {overlapWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={20} className="text-amber-500" />
              <h3 className="font-bold text-charcoal text-base">行程時間重疊</h3>
            </div>
            <p className="text-sm text-mid-gray mb-4">
              此設定將與「{overlapWarning.conflictingItemTitle}」重疊。
              是否將後續 <strong className="text-charcoal">{overlapWarning.affectedIds.length}</strong> 個行程整體順延？
            </p>
            <div className="flex gap-2">
              <button
                onClick={handlePostpone}
                disabled={saving}
                className="btn-primary flex-1"
              >
                {saving ? <Loader2 size={15} className="animate-spin" /> : null}
                一鍵順延
              </button>
              <button
                onClick={() => { setOverlapWarning(null); setPendingEdit(null) }}
                className="btn-outline px-4"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── 子組件：可排序景點列 ──
function SortableItemRow({
  item, idx, totalItems,
  editingId, editForm, setEditForm, saving,
  onEditSave, onEditCancel, onStartEdit, onToggle, onDelete,
  onMoveUp, onMoveDown, onCycleTransitMode, onUpdateTransitDuration,
}: {
  item: ItineraryItem
  idx: number
  totalItems: number
  editingId: string | null
  editForm: typeof EMPTY_FORM
  setEditForm: (f: typeof EMPTY_FORM) => void
  saving: boolean
  onEditSave: () => void
  onEditCancel: () => void
  onStartEdit: () => void
  onToggle: () => void
  onDelete: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onCycleTransitMode: () => void
  onUpdateTransitDuration: (min: number) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })
  const isFirst = idx === 0
  const endTime = calcEndTime(item.time, item.stay_duration ?? 60)

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1, zIndex: isDragging ? 10 : undefined }}
    >
      {!isFirst && (
        <TransitBlock item={item} onCycleMode={onCycleTransitMode} onUpdateDuration={onUpdateTransitDuration} />
      )}

      {editingId === item.id ? (
        <EditCard
          item={item}
          editForm={editForm}
          setEditForm={setEditForm}
          saving={saving}
          onSave={onEditSave}
          onCancel={onEditCancel}
        />
      ) : (
        <div className={`card p-4 flex gap-2 transition-opacity duration-200 ${item.is_done ? 'opacity-60' : ''}`}>
          {/* Drag Handle */}
          <button
            {...listeners}
            {...attributes}
            className="text-mid-gray/40 hover:text-mid-gray transition-colors cursor-grab active:cursor-grabbing self-start pt-0.5 touch-none"
            aria-label="拖曳排序"
            tabIndex={-1}
          >
            <GripVertical size={15} />
          </button>
          {/* Checkbox */}
          <div className="pt-0.5">
            <input
              type="checkbox"
              checked={item.is_done}
              onChange={onToggle}
              aria-label={`標記 ${item.title} 完成`}
            />
          </div>
          {/* Content */}
          <div className="flex-1 min-w-0" onClick={onStartEdit}>
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-1 text-xs text-tokyo-red font-semibold">
                <Clock size={11} />
                {item.time}
              </div>
              <div className="text-[10px] text-mid-gray bg-warm-gray px-2 py-0.5 rounded-full">
                離開 {endTime}
              </div>
            </div>
            <p className={`text-sm font-semibold text-charcoal leading-snug ${item.is_done ? 'line-through' : ''}`}>
              {item.title}
            </p>
            <p className="text-[10px] text-mid-gray mt-0.5">停留 {(() => { const m = item.stay_duration ?? 60; if (m < 60) return `${m} 分鐘`; const h = Math.floor(m / 60); const min = m % 60; return min > 0 ? `${h} 小時 ${min} 分鐘` : `${h} 小時` })()} </p>
            {item.notes && (
              <div className="flex items-start gap-1 mt-1.5">
                <StickyNote size={11} className="text-mid-gray mt-0.5 shrink-0" />
                <p className="text-xs text-mid-gray leading-relaxed">{item.notes}</p>
              </div>
            )}
            {item.map_url && (
              <a
                href={item.map_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 mt-2 text-xs text-blue-500 font-medium"
              >
                <MapPin size={11} />
                Google Maps
                <ExternalLink size={10} />
              </a>
            )}
          </div>
          {/* Actions */}
          <div className="flex flex-col items-center gap-0.5 self-start">
            <button
              onClick={onMoveUp}
              disabled={idx === 0}
              className="p-1.5 text-mid-gray disabled:opacity-20 hover:text-charcoal transition-colors rounded-lg"
              aria-label="上移"
            >
              <ChevronUp size={14} />
            </button>
            <button
              onClick={onMoveDown}
              disabled={idx === totalItems - 1}
              className="p-1.5 text-mid-gray disabled:opacity-20 hover:text-charcoal transition-colors rounded-lg"
              aria-label="下移"
            >
              <ChevronDown size={14} />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 text-mid-gray hover:text-tokyo-red transition-colors rounded-lg mt-0.5"
              aria-label="刪除"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── 子組件：Transit Block ──
function TransitBlock({
  item,
  onCycleMode,
  onUpdateDuration,
}: {
  item: ItineraryItem
  onCycleMode: () => void
  onUpdateDuration: (min: number) => void
}) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(String(item.transit_duration ?? 30))
  const mode = (item.transit_mode as TransitMode) ?? 'train'

  function handleBlur() {
    const min = parseInt(val)
    if (!isNaN(min) && min >= 0) onUpdateDuration(min)
    setEditing(false)
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2 my-1">
      <div className="w-0.5 h-3 bg-soft-border mx-auto" />
      <div className="flex-1 flex items-center gap-2 bg-warm-gray rounded-xl px-3 py-1.5">
        <button
          onClick={onCycleMode}
          className="text-base leading-none"
          title="點擊切換交通方式"
        >
          {TRANSIT_MODE_ICONS[mode]}
        </button>
        <span className="text-xs text-mid-gray">{TRANSIT_MODE_LABELS[mode]}</span>
        <div className="flex items-center gap-1 ml-auto">
          {editing ? (
            <input
              type="number"
              min={0}
              value={val}
              autoFocus
              onChange={(e) => setVal(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={(e) => e.key === 'Enter' && handleBlur()}
              className="w-14 text-xs text-center border border-soft-border rounded-lg px-1 py-0.5 bg-white outline-none"
            />
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="text-xs text-mid-gray font-medium hover:text-charcoal transition-colors"
            >
              {item.transit_duration ?? 30} 分鐘
            </button>
          )}
        </div>
      </div>
      <div className="w-0.5 h-3 bg-soft-border mx-auto" />
    </div>
  )
}

// ── 子組件：編輯卡片 ──
function EditCard({
  item,
  editForm,
  setEditForm,
  saving,
  onSave,
  onCancel,
}: {
  item: ItineraryItem
  editForm: typeof EMPTY_FORM
  setEditForm: (f: typeof EMPTY_FORM) => void
  saving: boolean
  onSave: () => void
  onCancel: () => void
}) {
  return (
    <div className="card p-4 border-l-4 border-l-tokyo-red">
      <SpotFormFields form={editForm} setForm={setEditForm} showTransit={false} />
      <div className="flex gap-2 pt-1 mt-3">
        <button onClick={onSave} disabled={saving} className="btn-primary flex-1">
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
          儲存
        </button>
        <button onClick={onCancel} className="btn-outline px-4">
          <X size={15} />
        </button>
      </div>
    </div>
  )
}

// ── 子組件：表單欄位（新增/編輯共用）──
function SpotFormFields({
  form,
  setForm,
  showTransit = true,
}: {
  form: typeof EMPTY_FORM
  setForm: (f: typeof EMPTY_FORM) => void
  showTransit?: boolean
}) {
  const modes: TransitMode[] = ['walk', 'train', 'taxi', 'bus']
  const titleInputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef(form)
  useEffect(() => { formRef.current = form }, [form])

  useEffect(() => {
    const input = titleInputRef.current
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const g = (window as any).google
    if (!input || !g) return

    const autocomplete = new g.maps.places.Autocomplete(input, {
      fields: ['name', 'place_id'],
      componentRestrictions: { country: 'jp' },
    })

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace()
      if (!place.place_id) return
      setForm({
        ...formRef.current,
        title: place.name ?? formRef.current.title,
        map_url: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
      })
    })

    return () => g.maps.event.clearInstanceListeners(autocomplete)
  }, [setForm])

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="text-xs text-mid-gray font-medium mb-1 block">抵達時間</label>
          <input
            type="time"
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
            className={timeInputClass}
          />
        </div>
        <div>
          <label className="text-xs text-mid-gray font-medium mb-1 block">停留 (分鐘)</label>
          <input
            type="number"
            min={0}
            value={form.stay_duration}
            onChange={(e) => setForm({ ...form, stay_duration: e.target.value })}
            className={numInputClass}
          />
        </div>
      </div>
      <div>
        <label className="text-xs text-mid-gray font-medium mb-1 block">景點名稱 *</label>
        <input
          ref={titleInputRef}
          type="text"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="例：淺草寺"
          autoFocus
          className={inputClass}
        />
      </div>
      {showTransit && (
        <div className="flex gap-3">
          <div>
            <label className="text-xs text-mid-gray font-medium mb-1 block">交通 (分鐘)</label>
            <input
              type="number"
              min={0}
              value={form.transit_duration}
              onChange={(e) => setForm({ ...form, transit_duration: e.target.value })}
              className={numInputClass}
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-mid-gray font-medium mb-1 block">交通方式</label>
            <div className="flex gap-1">
              {modes.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setForm({ ...form, transit_mode: m })}
                  className={`flex-1 text-sm py-2 rounded-xl border transition-colors ${
                    form.transit_mode === m
                      ? 'border-tokyo-red bg-tokyo-red/10 text-tokyo-red'
                      : 'border-soft-border bg-warm-gray text-mid-gray'
                  }`}
                  title={TRANSIT_MODE_LABELS[m]}
                >
                  {TRANSIT_MODE_ICONS[m]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      <div>
        <label className="text-xs text-mid-gray font-medium mb-1 block">Google Maps URL（選填）</label>
        <div className="flex gap-2">
          <input
            type="url"
            value={form.map_url}
            onChange={(e) => setForm({ ...form, map_url: e.target.value })}
            placeholder="https://maps.google.com/..."
            className={inputClass}
          />
          <button
            type="button"
            disabled={!form.title.trim()}
            title="自動產生 Google Maps 搜尋連結"
            onClick={() => {
              const query = encodeURIComponent(form.title.trim() + ' 東京')
              setForm({ ...form, map_url: `https://www.google.com/maps/search/?api=1&query=${query}` })
            }}
            className="flex-shrink-0 px-3 py-3 rounded-xl bg-woody-yellow text-charcoal disabled:opacity-40 transition-opacity"
          >
            <Sparkles size={16} />
          </button>
        </div>
      </div>
      <div>
        <label className="text-xs text-mid-gray font-medium mb-1 block">備注（選填）</label>
        <textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="票價、注意事項、開放時間..."
          rows={2}
          className={inputClass + ' resize-none'}
        />
      </div>
    </div>
  )
}
