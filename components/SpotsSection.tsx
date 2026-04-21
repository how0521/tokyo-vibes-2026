'use client'

import { useEffect, useState, useRef } from 'react'
import { MapPin, Plus, Trash2, Loader2, X, ExternalLink, Sparkles, Pencil, Check } from 'lucide-react'
import { supabase, fetchSpots, addSpot, updateSpot, deleteSpot } from '@/lib/supabase'
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

// ── Detail Modal ──────────────────────────────────────────────────────────────

function SpotDetailModal({ spot, onClose, onDelete, onSave }: {
  spot: Spot
  onClose: () => void
  onDelete: (id: string) => void
  onSave: (id: string, updates: Partial<Omit<Spot, 'id' | 'created_at'>>) => Promise<void>
}) {
  const [imgError, setImgError] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState({
    name: spot.name,
    name_jp: spot.name_jp ?? '',
    category: spot.category,
    area: spot.area,
    description: spot.description ?? '',
    image_url: spot.image_url ?? '',
    map_url: spot.map_url ?? '',
  })
  const editNameRef = useRef<HTMLInputElement>(null)
  const editFormRef = useRef(editForm)
  useEffect(() => { editFormRef.current = editForm }, [editForm])

  useEffect(() => {
    if (!editMode) return
    const input = editNameRef.current
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const g = (window as any).google
    if (!input || !g) return

    const autocomplete = new g.maps.places.Autocomplete(input, {
      fields: ['name', 'place_id', 'photos', 'editorial_summary', 'vicinity', 'types'],
      componentRestrictions: { country: 'jp' },
    })

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace()
      if (!place.place_id) return

      const types: string[] = place.types ?? []
      const isRestaurant = types.some((t: string) =>
        ['restaurant', 'food', 'bar', 'cafe', 'meal_takeaway', 'meal_delivery', 'bakery'].includes(t)
      )
      let imageUrl = ''
      if (place.photos && place.photos.length > 0) {
        imageUrl = place.photos[0].getUrl({ maxWidth: 800 })
      }
      const area = (place.vicinity ?? '').split(',')[0].trim()

      setEditForm({
        ...editFormRef.current,
        name: place.name ?? editFormRef.current.name,
        category: isRestaurant ? 'restaurant' : 'spot',
        area: area || editFormRef.current.area,
        description: place.editorial_summary?.overview ?? editFormRef.current.description,
        image_url: imageUrl || editFormRef.current.image_url,
        map_url: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
      })
    })

    return () => g.maps.event.clearInstanceListeners(autocomplete)
  }, [editMode])

  async function handleSave() {
    if (!editForm.name.trim()) return
    setSaving(true)
    await onSave(spot.id, {
      name: editForm.name.trim(),
      name_jp: editForm.name_jp.trim() || null,
      category: editForm.category,
      area: editForm.area.trim(),
      description: editForm.description.trim() || null,
      image_url: editForm.image_url.trim() || null,
      map_url: editForm.map_url.trim() || null,
    })
    setSaving(false)
    setEditMode(false)
  }

  function handleDelete() {
    onDelete(spot.id)
    onClose()
  }

  const displayImage = editMode ? editForm.image_url : spot.image_url

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
      onClick={editMode ? undefined : onClose}
    >
      <div
        className="w-full max-w-lg bg-cream rounded-t-3xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image */}
        <div className="aspect-video bg-warm-gray relative flex-shrink-0">
          {displayImage && !imgError ? (
            <img
              src={displayImage}
              alt={spot.name}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-warm-gray">
              <MapPin size={48} className="text-mid-gray/30" />
            </div>
          )}
          <button
            onClick={editMode ? () => setEditMode(false) : onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-black/40 text-white backdrop-blur-sm"
          >
            <X size={16} />
          </button>
          <span className={`absolute top-3 left-3 text-[11px] font-bold px-2.5 py-1 rounded-full ${
            (editMode ? editForm.category : spot.category) === 'restaurant'
              ? 'bg-tokyo-red text-white'
              : 'bg-woody-yellow text-charcoal'
          }`}>
            {SPOT_CATEGORY_LABELS[editMode ? editForm.category : spot.category]}
          </span>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-3">
          {editMode ? (
            <>
              <div className="space-y-3">
                <input
                  ref={editNameRef}
                  className={inputClass}
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="名稱 *"
                  autoFocus
                />
                <input
                  className={inputClass}
                  value={editForm.name_jp}
                  onChange={(e) => setEditForm({ ...editForm, name_jp: e.target.value })}
                  placeholder="日文名稱"
                />
                <select
                  className={inputClass}
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value as SpotCategory })}
                >
                  <option value="spot">景點</option>
                  <option value="restaurant">餐廳</option>
                </select>
                <input
                  className={inputClass}
                  value={editForm.area}
                  onChange={(e) => setEditForm({ ...editForm, area: e.target.value })}
                  placeholder="區域 *"
                />
                <textarea
                  className={inputClass}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder="說明"
                  rows={3}
                />
                <input
                  className={inputClass}
                  value={editForm.image_url}
                  onChange={(e) => { setEditForm({ ...editForm, image_url: e.target.value }); setImgError(false) }}
                  placeholder="圖片 URL"
                />
                <div className="flex gap-2">
                  <input
                    className={inputClass}
                    value={editForm.map_url}
                    onChange={(e) => setEditForm({ ...editForm, map_url: e.target.value })}
                    placeholder="Google Maps URL"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const query = encodeURIComponent(editForm.name.trim() + ' 東京')
                      setEditForm({ ...editForm, map_url: `https://www.google.com/maps/search/?api=1&query=${query}` })
                    }}
                    disabled={!editForm.name.trim()}
                    className="flex-shrink-0 px-3 py-3 rounded-xl bg-woody-yellow text-charcoal disabled:opacity-40"
                  >
                    <Sparkles size={16} />
                  </button>
                </div>
              </div>
              <div className="flex gap-2 pb-4">
                <button
                  onClick={handleSave}
                  disabled={saving || !editForm.name.trim()}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-woody-yellow text-charcoal font-bold rounded-2xl text-sm disabled:opacity-50"
                >
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                  儲存
                </button>
                <button
                  onClick={() => setEditMode(false)}
                  className="px-4 py-3 rounded-2xl border border-soft-border text-mid-gray"
                >
                  <X size={15} />
                </button>
              </div>
            </>
          ) : (
            <>
              <div>
                <p className="text-[11px] text-mid-gray mb-0.5">{spot.area}</p>
                <h2 className="text-xl font-black text-charcoal leading-tight">{spot.name}</h2>
                {spot.name_jp && (
                  <p className="text-sm text-mid-gray mt-0.5">{spot.name_jp}</p>
                )}
              </div>

              {spot.description && (
                <p className="text-sm text-charcoal leading-relaxed">{spot.description}</p>
              )}

              {spot.tags && spot.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {spot.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-warm-gray text-mid-gray px-2 py-0.5 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex gap-2 pt-1 pb-4">
                {spot.map_url && (
                  <a
                    href={spot.map_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-tokyo-red text-white font-bold rounded-2xl text-sm"
                  >
                    <MapPin size={15} />
                    在地圖開啟
                  </a>
                )}
                <button
                  onClick={() => setEditMode(true)}
                  className="px-4 py-3 rounded-2xl border border-soft-border text-mid-gray hover:text-charcoal hover:border-charcoal transition-colors"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-3 rounded-2xl border border-soft-border text-mid-gray hover:text-tokyo-red hover:border-tokyo-red transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Spot Card ─────────────────────────────────────────────────────────────────

function SpotCard({ spot, onSelect, onDelete }: {
  spot: Spot
  onSelect: (spot: Spot) => void
  onDelete: (id: string) => void
}) {
  const [imgError, setImgError] = useState(false)

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-soft-border flex flex-col cursor-pointer active:scale-[0.98] transition-transform"
      onClick={() => onSelect(spot)}
    >
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
            <MapPin size={28} className="text-mid-gray/40" />
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
      <div className="p-3 flex flex-col gap-1 flex-1">
        <div className="text-[10px] text-mid-gray">{spot.area}</div>
        <p className="text-sm font-bold text-charcoal leading-tight">{spot.name}</p>
        {spot.name_jp && (
          <p className="text-[10px] text-mid-gray leading-tight">{spot.name_jp}</p>
        )}
        {spot.description && (
          <p className="text-xs text-mid-gray line-clamp-2 leading-relaxed mt-0.5">{spot.description}</p>
        )}
        {spot.tags && spot.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-0.5">
            {spot.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-[10px] bg-warm-gray text-mid-gray px-1.5 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}
        {/* Tap hint */}
        <p className="text-[10px] text-mid-gray/50 mt-auto pt-1.5">點擊查看詳情</p>
      </div>
    </div>
  )
}

// ── Main Section ──────────────────────────────────────────────────────────────

export default function SpotsSection() {
  const [spots, setSpots] = useState<Spot[]>([])
  const [loading, setLoading] = useState(true)
  const [activeArea, setActiveArea] = useState('全部')
  const [activeCategory, setActiveCategory] = useState<'all' | SpotCategory>('all')
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null)
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
        () => { fetchSpots().then(setSpots) }
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

  async function handleSave(id: string, updates: Partial<Omit<Spot, 'id' | 'created_at'>>) {
    await updateSpot(id, updates)
    setSpots((prev) => prev.map((s) => s.id === id ? { ...s, ...updates } : s))
    setSelectedSpot((prev) => prev ? { ...prev, ...updates } : null)
  }

  async function handleDelete(id: string) {
    await deleteSpot(id)
  }

  function handleFindMap() {
    if (!form.name.trim()) return
    const query = encodeURIComponent(form.name.trim() + ' 東京')
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`
    setForm({ ...form, map_url: url })
  }

  const nameInputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef(form)
  useEffect(() => { formRef.current = form }, [form])

  useEffect(() => {
    if (!showForm) return
    const input = nameInputRef.current
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const g = (window as any).google
    if (!input || !g) return

    const autocomplete = new g.maps.places.Autocomplete(input, {
      fields: ['name', 'place_id', 'photos', 'editorial_summary', 'vicinity', 'types'],
      componentRestrictions: { country: 'jp' },
    })

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace()
      if (!place.place_id) return

      const types: string[] = place.types ?? []
      const isRestaurant = types.some((t: string) =>
        ['restaurant', 'food', 'bar', 'cafe', 'meal_takeaway', 'meal_delivery', 'bakery'].includes(t)
      )

      let imageUrl = ''
      if (place.photos && place.photos.length > 0) {
        imageUrl = place.photos[0].getUrl({ maxWidth: 800 })
      }

      const vicinity: string = place.vicinity ?? ''
      const area = vicinity.split(',')[0].trim()

      setForm({
        ...formRef.current,
        name: place.name ?? formRef.current.name,
        category: isRestaurant ? 'restaurant' : 'spot',
        area: area || formRef.current.area,
        description: place.editorial_summary?.overview ?? formRef.current.description,
        image_url: imageUrl || formRef.current.image_url,
        map_url: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
      })
    })

    return () => g.maps.event.clearInstanceListeners(autocomplete)
  }, [showForm])

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
            <SpotCard
              key={spot.id}
              spot={spot}
              onSelect={setSelectedSpot}
              onDelete={handleDelete}
            />
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

      {/* Detail modal */}
      {selectedSpot && (
        <SpotDetailModal
          spot={selectedSpot}
          onClose={() => setSelectedSpot(null)}
          onDelete={handleDelete}
          onSave={handleSave}
        />
      )}

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
                ref={nameInputRef}
                className={inputClass}
                placeholder="名稱 *（輸入後選擇地點自動填入）"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                autoFocus
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
              <div className="flex gap-2">
                <input
                  className={inputClass}
                  placeholder="Google Maps URL"
                  value={form.map_url}
                  onChange={(e) => setForm({ ...form, map_url: e.target.value })}
                />
                <button
                  type="button"
                  onClick={handleFindMap}
                  disabled={!form.name.trim()}
                  title="自動產生 Google Maps 搜尋連結"
                  className="flex-shrink-0 px-3 py-3 rounded-xl bg-woody-yellow text-charcoal disabled:opacity-40 transition-opacity"
                >
                  <Sparkles size={16} />
                </button>
              </div>
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
