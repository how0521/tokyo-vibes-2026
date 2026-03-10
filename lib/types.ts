export interface ItineraryItem {
  id: string
  day_num: number
  time: string
  title: string
  map_url: string | null
  notes: string | null
  is_done: boolean
  created_at?: string
}
