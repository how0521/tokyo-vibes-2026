import { Suspense } from 'react'
import CountdownTimer from '@/components/CountdownTimer'
import TabLayout from '@/components/TabLayout'
import PasswordGate from '@/components/PasswordGate'
import AlienMascot from '@/components/AlienMascot'

export default function HomePage() {
  return (
    <PasswordGate>
      <div className="min-h-screen">
        {/* Header */}
        <header className="relative overflow-hidden text-white" style={{ background: 'linear-gradient(180deg, #0D47A1 0%, #1565C0 50%, #1976D2 100%)' }}>
          {/* Cloud decorations — animated */}
          <div className="cloud-drift absolute top-5 left-6 w-24 h-8 bg-white/80 rounded-full" style={{ boxShadow: '0 2px 0 2px rgba(255,255,255,0.6)' }} />
          <div className="cloud-drift-slow absolute top-7 left-10 w-16 h-5 bg-white/70 rounded-full" />
          <div className="cloud-drift absolute top-4 right-4 w-28 h-9 bg-white/80 rounded-full" style={{ animationDelay: '-4s', boxShadow: '0 2px 0 2px rgba(255,255,255,0.6)' }} />
          <div className="cloud-drift-slow absolute top-6 right-9 w-18 h-6 bg-white/70 rounded-full" style={{ animationDelay: '-7s' }} />
          <div className="cloud-drift absolute bottom-16 left-2 w-20 h-6 bg-white/60 rounded-full" style={{ animationDelay: '-2s' }} />

          <div className="relative px-5 pt-10 pb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-woody-yellow rounded-full flex items-center justify-center text-sm">
                  🤠
                </div>
                <p className="text-[10px] font-bold tracking-widest uppercase text-white/60">
                  Travel Guide
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-white/40 tracking-widest uppercase">6D5N · Tokyo</p>
                <p className="text-[10px] text-white/40">May 20–25, 2026</p>
              </div>
            </div>

            <div className="mb-8 flex items-end justify-between">
              <div>
                <h1 className="font-display text-5xl tracking-wide leading-none" style={{ fontFamily: 'Bangers, cursive', letterSpacing: '3px' }}>
                  TOKYO
                  <span className="block" style={{ color: '#FFB300' }}>VIBES</span>
                  <span className="block text-3xl font-display text-white/70 mt-1" style={{ fontFamily: 'Bangers, cursive', letterSpacing: '4px' }}>
                    2026
                  </span>
                </h1>
                <p className="text-white/60 text-sm mt-3 font-semibold tracking-wide">
                  🚀 東京 GOGO · To Infinity and Beyond!
                </p>
              </div>
              <div className="flex-shrink-0 animate-bounce-slow drop-shadow-lg">
                <AlienMascot size={90} />
              </div>
            </div>

            <div className="rounded-2xl p-5" style={{ background: 'rgba(0,0,0,0.25)', border: '2px solid rgba(255,215,0,0.4)' }}>
              <Suspense fallback={<div className="h-24" />}>
                <CountdownTimer />
              </Suspense>
            </div>
          </div>
        </header>

        {/* Tabbed Content */}
        <TabLayout />
      </div>
    </PasswordGate>
  )
}
