import { Suspense } from 'react'
import CountdownTimer from '@/components/CountdownTimer'
import TabLayout from '@/components/TabLayout'
import PasswordGate from '@/components/PasswordGate'
import AlienMascot from '@/components/AlienMascot'
import CloudDecor from '@/components/CloudDecor'

export default function HomePage() {
  return (
    <PasswordGate>
      <div className="min-h-screen">
        {/* Header */}
        <header className="relative overflow-hidden text-white" style={{ background: 'linear-gradient(180deg, #0D47A1 0%, #1565C0 50%, #1976D2 100%)' }}>
          {/* Cloud decorations — animated, fully opaque */}
          <CloudDecor className="cloud-drift absolute -top-4 -left-4" width={140} opacity={1} />
          <CloudDecor className="cloud-drift-slow absolute -top-2 right-0" width={155} opacity={1} style={{ animationDelay: '-4s' }} />
          <CloudDecor className="cloud-drift absolute top-16" width={100} opacity={1} style={{ left: '30%', animationDelay: '-7s' }} />
          <CloudDecor className="cloud-drift-slow absolute bottom-20 -right-4" width={125} opacity={1} style={{ animationDelay: '-2s' }} />
          <CloudDecor className="cloud-drift absolute bottom-10 -left-4" width={115} opacity={1} style={{ animationDelay: '-10s' }} />

          <div className="relative px-5 pt-10 pb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-woody-yellow rounded-full flex items-center justify-center text-sm">
                  🤠
                </div>
                <p className="text-[10px] font-bold tracking-widest uppercase"
                  style={{ color: 'rgba(255,255,255,0.9)', textShadow: '0 1px 4px rgba(0,0,80,0.7)' }}>
                  Travel Guide
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] tracking-widest uppercase"
                  style={{ color: 'rgba(255,255,255,0.85)', textShadow: '0 1px 4px rgba(0,0,80,0.7)' }}>6D5N · Tokyo</p>
                <p className="text-[10px]"
                  style={{ color: 'rgba(255,255,255,0.85)', textShadow: '0 1px 4px rgba(0,0,80,0.7)' }}>May 20–25, 2026</p>
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
