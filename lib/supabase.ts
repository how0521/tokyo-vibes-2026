import { createClient } from '@supabase/supabase-js'
import type { ItineraryItem } from './types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// --- Itinerary CRUD ---

export async function fetchItinerary(): Promise<ItineraryItem[]> {
  const { data, error } = await supabase
    .from('itinerary')
    .select('*')
    .order('day_num', { ascending: true })
    .order('time', { ascending: true })

  if (error) {
    console.error('fetchItinerary error:', error.message)
    return []
  }
  return data ?? []
}

export async function addItineraryItem(
  item: Omit<ItineraryItem, 'id' | 'created_at'>
): Promise<ItineraryItem | null> {
  const { data, error } = await supabase
    .from('itinerary')
    .insert(item)
    .select()
    .single()

  if (error) {
    console.error('addItineraryItem error:', error.message)
    return null
  }
  return data
}

export async function updateItineraryItem(
  id: string,
  updates: Partial<Omit<ItineraryItem, 'id' | 'created_at'>>
): Promise<boolean> {
  const { error } = await supabase
    .from('itinerary')
    .update(updates)
    .eq('id', id)

  if (error) {
    console.error('updateItineraryItem error:', error.message)
    return false
  }
  return true
}

export async function deleteItineraryItem(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('itinerary')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('deleteItineraryItem error:', error.message)
    return false
  }
  return true
}

export async function toggleItemDone(id: string, is_done: boolean): Promise<boolean> {
  return updateItineraryItem(id, { is_done })
}
