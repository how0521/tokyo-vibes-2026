export type SpotCategory = 'spot' | 'restaurant'

export interface Spot {
  id: string
  name: string
  name_jp: string | null
  category: SpotCategory
  area: string
  description: string | null
  image_url: string | null
  map_url: string | null
  tags: string[] | null
  is_default: boolean
  created_at?: string
}

export const SPOT_CATEGORY_LABELS: Record<SpotCategory, string> = {
  spot: '景點',
  restaurant: '餐廳',
}

export interface ItineraryItem {
  id: string
  day_num: number
  time: string           // HH:MM 抵達時間
  stay_duration: number  // 停留分鐘數
  transit_duration: number // 從前一景點過來的交通分鐘數
  transit_mode: 'walk' | 'train' | 'taxi' | 'bus' // 交通模式
  title: string
  map_url: string | null
  notes: string | null
  is_done: boolean
  created_at?: string
}

export type TransitMode = 'walk' | 'train' | 'taxi' | 'bus'

export const TRANSIT_MODE_LABELS: Record<TransitMode, string> = {
  walk: '步行',
  train: '電車',
  taxi: '計程車',
  bus: '巴士',
}

export const TRANSIT_MODE_ICONS: Record<TransitMode, string> = {
  walk: '🚶',
  train: '🚃',
  taxi: '🚕',
  bus: '🚌',
}

// 計算結束時間 (HH:MM)
export function calcEndTime(startTime: string, stayMinutes: number): string {
  const [h, m] = startTime.split(':').map(Number)
  const total = h * 60 + m + stayMinutes
  const endH = Math.floor(total / 60) % 24
  const endM = total % 60
  return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`
}

// 計算下一個景點的開始時間
export function calcNextStart(endTime: string, transitMinutes: number): string {
  return calcEndTime(endTime, transitMinutes)
}

// 時間字串轉分鐘數
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

// 檢查兩個時段是否重疊
export function hasOverlap(
  aStart: string, aStay: number,
  bStart: string
): boolean {
  const aEnd = timeToMinutes(calcEndTime(aStart, aStay))
  const bStartMin = timeToMinutes(bStart)
  return aEnd > bStartMin
}
