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
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-tokyo-red/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-tokyo-red/10 rounded-full blur-2xl" />

          <div className="relative px-5 pt-10 pb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-tokyo-red rounded-full flex items-center justify-center text-sm">
                  🗼
                </div>
                <p className="text-[10px] font-semibold tracking-widest uppercase text-white/50">
                  Travel Guide
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-white/40 tracking-widest uppercase">6D5N · Tokyo</p>
                <p className="text-[10px] text-white/40">May 20–25, 2026</p>
              </div>
            </div>

            <div className="mb-8">
              <h1 className="text-4xl font-bold tracking-tight leading-none">
                TOKYO
                <span className="block text-tokyo-red">VIBES</span>
                <span className="block text-2xl font-light tracking-wider text-white/70 mt-1">
                  2026
                </span>
              </h1>
              <p className="text-white/50 text-sm mt-2 font-light tracking-wide">
                東京 GOGO ✈ 準備出發囉！
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
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
