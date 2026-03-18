'use client'

import { useEffect, useState } from 'react'
import { MapPin, Plus, Trash2, Loader2, X } from 'lucide-react'
import { supabase, fetchSpots, addSpot, deleteSpot } from '@/lib/supabase'
import type { Spot, SpotCategory } from '@/lib/types'
import { SPOT_CATEGORY_LABELS } from '@/lib/types'

const EMPTY_FORM = {
  name: '',
  name_jp: '',
  category: 'spot' as SpotCategory,
  area: '',
  description: '',
  image_url: '',
  map_url: '',
}

const inputClass =
  'w-full border border-soft-border rounded-xl px-4 py-3 bg-warm-gray text-sm text-charcoal placeholder:text-mid-gray outline-none focus:border-tokyo-red transition-colors'

const CATEGORY_OPTIONS: Array<{ value: 'all' | SpotCategory; label: string }> = [
  { value: 'all', label: '全部' },
  { value: 'spot', label: '景點' },
  { value: 'restaurant', label: '餐廳' },
]

function SpotCard({ spot, onDelete }: { spot: Spot; onDelete: (id: string) => void }) {
  const [imgError, setImgError] = useState(false)

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-soft-border flex flex-col">
      {/* Cover image */}
      <div className="aspect-video bg-warm-gray relative overflow-hidden">
        {spot.image_url && !imgError ? (
          <img
            src={spot.image_url}
            alt={spot.name}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-warm-gray">
            <MapPin size={32} className="text-mid-gray/40" />
          </div>
        )}
        {/* Category badge */}
        <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${
          spot.category === 'restaurant'
            ? 'bg-tokyo-red text-white'
            : 'bg-woody-yellow text-charcoal'
        }`}>
          {SPOT_CATEGORY_LABELS[spot.category]}
        </span>
      </div>

      {/* Card body */}
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <div className="text-[10px] text-mid-gray">{spot.area}</div>
        <div>
          <p className="text-sm font-bold text-charcoal leading-tight">{spot.name}</p>
          {spot.name_jp && (
            <p className="text-[10px] text-mid-gray leading-tight">{spot.name_jp}</p>
          )}
        </div>
        {spot.description && (
          <p className="text-xs text-mid-gray line-clamp-2 leading-relaxed">{spot.description}</p>
        )}
        {spot.tags && spot.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-0.5">
            {spot.tags.map((tag) => (
              <span key={tag} className="text-[10px] bg-warm-gray text-mid-gray px-1.5 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer actions */}
        <div className="flex items-center justify-between mt-auto pt-1.5">
          {spot.map_url ? (
            <a
              href={spot.map_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[11px] text-tokyo-red font-medium"
            >
              <MapPin size={12} />
              地圖
            </a>
          ) : (
            <span />
          )}
          <button
            onClick={() => onDelete(spot.id)}
            className="p-1 rounded-lg text-mid-gray hover:text-tokyo-red hover:bg-red-50 transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function SpotsSection() {
  const [spots, setSpots] = useState<Spot[]>([])
  const [loading, setLoading] = useState(true)
  const [activeArea, setActiveArea] = useState('全部')
  const [activeCategory, setActiveCategory] = useState<'all' | SpotCategory>('all')
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => {
    fetchSpots().then((data) => {
      setSpots(data)
      setLoading(false)
    })

    const channel = supabase
      .channel('spots-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'spots' },
        () => {
          fetchSpots().then(setSpots)
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const areas = ['全部', ...Array.from(new Set(spots.map((s) => s.area)))]

  const filtered = spots.filter((s) => {
    const areaMatch = activeArea === '全部' || s.area === activeArea
    const catMatch = activeCategory === 'all' || s.category === activeCategory
    return areaMatch && catMatch
  })

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.area.trim()) return
    setSaving(true)
    await addSpot({
      name: form.name.trim(),
      name_jp: form.name_jp.trim() || null,
      category: form.category,
      area: form.area.trim(),
      description: form.description.trim() || null,
      image_url: form.image_url.trim() || null,
      map_url: form.map_url.trim() || null,
      tags: null,
      is_default: false,
    })
    setForm(EMPTY_FORM)
    setShowForm(false)
    setSaving(false)
  }

  async function handleDelete(id: string) {
    await deleteSpot(id)
  }

  const existingAreas = Array.from(new Set(spots.map((s) => s.area)))

  return (
    <div className="space-y-4">
      {/* Category toggle */}
      <div className="flex gap-2">
        {CATEGORY_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setActiveCategory(value)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
              activeCategory === value
                ? 'bg-woody-yellow text-charcoal'
                : 'bg-warm-gray text-mid-gray'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Area filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {areas.map((area) => (
          <button
            key={area}
            onClick={() => setActiveArea(area)}
            className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              activeArea === area
                ? 'bg-tokyo-red text-white border-tokyo-red'
                : 'bg-white text-mid-gray border-soft-border'
            }`}
          >
            {area}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={24} className="animate-spin text-mid-gray" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-sm text-mid-gray py-12">沒有符合的項目</p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((spot) => (
            <SpotCard key={spot.id} spot={spot} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Add button */}
      <button
        onClick={() => setShowForm(true)}
        className="w-full py-3 rounded-2xl border-2 border-dashed border-soft-border text-mid-gray text-sm font-medium flex items-center justify-center gap-2 hover:border-tokyo-red hover:text-tokyo-red transition-colors"
      >
        <Plus size={16} />
        新增景點或餐廳
      </button>

      {/* Add form slide-up */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-cream rounded-t-3xl p-6 pb-10 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-charcoal text-lg">新增景點 / 餐廳</h3>
              <button onClick={() => setShowForm(false)} className="p-1 text-mid-gray">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-3">
              <input
                className={inputClass}
                placeholder="名稱 *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <input
                className={inputClass}
                placeholder="日文名稱"
                value={form.name_jp}
                onChange={(e) => setForm({ ...form, name_jp: e.target.value })}
              />
              <select
                className={inputClass}
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as SpotCategory })}
              >
                <option value="spot">景點</option>
                <option value="restaurant">餐廳</option>
              </select>
              <input
                className={inputClass}
                placeholder="區域 * (e.g. 淺草)"
                list="area-list"
                value={form.area}
                onChange={(e) => setForm({ ...form, area: e.target.value })}
                required
              />
              <datalist id="area-list">
                {existingAreas.map((a) => (
                  <option key={a} value={a} />
                ))}
              </datalist>
              <textarea
                className={inputClass}
                placeholder="說明"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
              <input
                className={inputClass}
                placeholder="圖片 URL (Wikimedia Commons 等)"
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              />
              <input
                className={inputClass}
                placeholder="Google Maps URL"
                value={form.map_url}
                onChange={(e) => setForm({ ...form, map_url: e.target.value })}
              />
              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 bg-woody-yellow text-charcoal font-black rounded-2xl flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                新增
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
