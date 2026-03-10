import { Suspense } from 'react'
import CountdownTimer from '@/components/CountdownTimer'
import TabLayout from '@/components/TabLayout'
import PasswordGate from '@/components/PasswordGate'

export default function HomePage() {
  return (
    <PasswordGate>
      <div className="min-h-screen bg-cream">
        {/* Header */}
        <header className="relative overflow-hidden bg-charcoal text-white">
          {/* Cloud decorations */}
          <div className="absolute top-4 left-8 w-20 h-7 bg-white/20 rounded-full blur-sm" />
          <div className="absolute top-4 left-12 w-14 h-5 bg-white/15 rounded-full blur-sm" />
          <div className="absolute top-10 right-6 w-24 h-8 bg-white/15 rounded-full blur-sm" />
          <div className="absolute top-10 right-10 w-16 h-6 bg-white/10 rounded-full blur-sm" />
          <div className="absolute bottom-12 left-4 w-16 h-5 bg-white/10 rounded-full blur-sm" />

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

            <div className="mb-8">
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

            <div className="bg-white/10 border border-white/20 rounded-2xl p-5 backdrop-blur-sm">
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
