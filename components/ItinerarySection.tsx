'use client'

import { useEffect, useState, useRef } from 'react'
import { MapPin, Plus, Trash2, Clock, StickyNote, X, Check, ExternalLink, Loader2 } from 'lucide-react'
import { supabase, fetchItinerary, addItineraryItem, updateItineraryItem, deleteItineraryItem } from '@/lib/supabase'
import type { ItineraryItem } from '@/lib/types'

const DAYS = [
  { num: 1, label: 'Day 1', date: '5/20' },
  { num: 2, label: 'Day 2', date: '5/21' },
  { num: 3, label: 'Day 3', date: '5/22' },
  { num: 4, label: 'Day 4', date: '5/23' },
  { num: 5, label: 'Day 5', date: '5/24' },
  { num: 6, label: 'Day 6', date: '5/25' },
]

const EMPTY_FORM = { time: '', title: '', map_url: '', notes: '' }

const inputClass =
  'w-full border border-soft-border rounded-xl px-4 py-3 bg-warm-gray text-sm text-charcoal placeholder:text-mid-gray outline-none focus:border-tokyo-red transition-colors'

const timeInputClass =
  'w-36 border border-soft-border rounded-xl px-3 py-3 bg-warm-gray text-sm text-charcoal outline-none focus:border-tokyo-red transition-colors'

export default function ItinerarySection() {
  const [activeDay, setActiveDay] = useState(1)
  const [items, setItems] = useState<ItineraryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState(EMPTY_FORM)
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
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'itinerary' },
        (payload) => {
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
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  function sortItems(a: ItineraryItem, b: ItineraryItem) {
    if (a.day_num !== b.day_num) return a.day_num - b.day_num
    return a.time.localeCompare(b.time)
  }

  const dayItems = items.filter((i) => i.day_num === activeDay)

  async function handleToggle(item: ItineraryItem) {
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, is_done: !i.is_done } : i))
    )
    await updateItineraryItem(item.id, { is_done: !item.is_done })
  }

  async function handleAdd() {
    if (!form.title.trim()) return
    setSaving(true)
    await addItineraryItem({
      day_num: activeDay,
      time: form.time || '00:00',
      title: form.title.trim(),
      map_url: form.map_url.trim() || null,
      notes: form.notes.trim() || null,
      is_done: false,
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
    })
  }

  async function handleEditSave(id: string) {
    if (!editForm.title.trim()) return
    setSaving(true)
    setItems((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, time: editForm.time, title: editForm.title, map_url: editForm.map_url || null, notes: editForm.notes || null }
          : i
      )
    )
    await updateItineraryItem(id, {
      time: editForm.time,
      title: editForm.title.trim(),
      map_url: editForm.map_url.trim() || null,
      notes: editForm.notes.trim() || null,
    })
    setEditingId(null)
    setSaving(false)
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
        <div className="space-y-2 mb-4">
          {dayItems.length === 0 && !showForm && (
            <div className="text-center py-10 text-mid-gray">
              <p className="text-sm">還沒有行程</p>
              <p className="text-xs mt-1">點擊下方按鈕新增景點</p>
            </div>
          )}

          {dayItems.map((item) =>
            editingId === item.id ? (
              <div key={item.id} className="card p-4 border-l-4 border-l-tokyo-red">
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-mid-gray font-medium mb-1 block">時間</label>
                    <input
                      type="time"
                      value={editForm.time}
                      onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                      className={timeInputClass}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-mid-gray font-medium mb-1 block">景點名稱</label>
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      placeholder="景點名稱"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-mid-gray font-medium mb-1 block">Google Maps URL（選填）</label>
                    <input
                      type="url"
                      value={editForm.map_url}
                      onChange={(e) => setEditForm({ ...editForm, map_url: e.target.value })}
                      placeholder="https://maps.google.com/..."
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-mid-gray font-medium mb-1 block">備注（選填）</label>
                    <textarea
                      value={editForm.notes}
                      onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                      placeholder="票價、注意事項..."
                      rows={2}
                      className={inputClass + ' resize-none'}
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => handleEditSave(item.id)} disabled={saving} className="btn-primary flex-1">
                      {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                      儲存
                    </button>
                    <button onClick={() => setEditingId(null)} className="btn-outline px-4">
                      <X size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                key={item.id}
                className={`card p-4 flex gap-3 transition-opacity duration-200 ${item.is_done ? 'opacity-60' : ''}`}
              >
                <div className="pt-0.5">
                  <input
                    type="checkbox"
                    checked={item.is_done}
                    onChange={() => handleToggle(item)}
                    aria-label={`標記 ${item.title} 完成`}
                  />
                </div>
                <div className="flex-1 min-w-0" onClick={() => startEdit(item)}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex items-center gap-1 text-xs text-tokyo-red font-semibold">
                      <Clock size={11} />
                      {item.time}
                    </div>
                  </div>
                  <p className={`text-sm font-semibold text-charcoal leading-snug ${item.is_done ? 'line-through' : ''}`}>
                    {item.title}
                  </p>
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
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 text-mid-gray active:text-tokyo-red transition-colors self-start rounded-lg"
                  aria-label="刪除"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            )
          )}
        </div>
      )}

      {/* Add Form */}
      {showForm && (
        <div ref={formRef} className="card p-4 mb-3 border-l-4 border-l-tokyo-red animate-slide-up">
          <p className="text-sm font-semibold text-charcoal mb-3">新增景點到 Day {activeDay}</p>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-mid-gray font-medium mb-1 block">時間</label>
              <input
                type="time"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                className={timeInputClass}
              />
            </div>
            <div>
              <label className="text-xs text-mid-gray font-medium mb-1 block">景點名稱 *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="例：淺草寺"
                autoFocus
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-xs text-mid-gray font-medium mb-1 block">Google Maps URL（選填）</label>
              <input
                type="url"
                value={form.map_url}
                onChange={(e) => setForm({ ...form, map_url: e.target.value })}
                placeholder="https://maps.google.com/..."
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-xs text-mid-gray font-medium mb-1 block">備注（選填）</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="票價、注意事項、開放時間..."
                rows={3}
                className={inputClass + ' resize-none'}
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleAdd}
                disabled={saving || !form.title.trim()}
                className="btn-primary flex-1 disabled:opacity-40"
              >
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                新增
              </button>
              <button
                onClick={() => { setShowForm(false); setForm(EMPTY_FORM) }}
                className="btn-outline px-4"
              >
                <X size={15} />
              </button>
            </div>
          </div>
        </div>
      )}

      {!showForm && (
        <button onClick={() => setShowForm(true)} className="w-full btn-outline border-dashed">
          <Plus size={16} />
          新增景點到 Day {activeDay}
        </button>
      )}
    </div>
  )
}
