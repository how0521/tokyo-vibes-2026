'use client'

import { useState } from 'react'
import { CalendarDays, Plane, Link2 } from 'lucide-react'
import ItinerarySection from './ItinerarySection'
import FlightCard from './FlightCard'
import HotelCard from './HotelCard'
import QuickLinks from './QuickLinks'

const TABS = [
  { id: 'itinerary', label: '行程', icon: CalendarDays },
  { id: 'travel', label: '航班 & 飯店', icon: Plane },
  { id: 'links', label: '快速連結', icon: Link2 },
]

export default function TabLayout() {
  const [active, setActive] = useState('itinerary')

  return (
    <div>
      {/* Tab Bar */}
      <div className="sticky top-0 z-10 bg-cream/95 backdrop-blur-sm border-b border-soft-border">
        <div className="flex max-w-lg mx-auto">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActive(id)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-bold transition-colors duration-150 border-b-2 ${
                active === id
                  ? 'border-woody-yellow text-woody-yellow'
                  : 'border-transparent text-mid-gray'
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <main className="px-4 py-6 space-y-8 max-w-lg mx-auto">
        {active === 'itinerary' && <ItinerarySection />}

        {active === 'travel' && (
          <>
            <FlightCard />
            <HotelCard />
          </>
        )}

        {active === 'links' && <QuickLinks />}

        <footer className="text-center py-4 text-xs text-mid-gray/60 pb-10">
          <p className="font-bold">TOKYO VIBES 2026 · Made with 🤠</p>
          <p className="mt-0.5">即時同步 · Supabase Realtime</p>
          <p className="mt-0.5 text-[10px]">To Infinity and Beyond!</p>
        </footer>
      </main>
    </div>
  )
}
