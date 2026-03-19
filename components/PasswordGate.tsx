'use client'

import { useState, useEffect } from 'react'
import AlienMascot from './AlienMascot'

const PASSWORD = '890215'
const STORAGE_KEY = 'tokyo_vibes_auth'

export default function PasswordGate({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false)
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY) === 'ok') {
      setAuthed(true)
    }
    setMounted(true)
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (input === PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, 'ok')
      setAuthed(true)
    } else {
      setError(true)
      setInput('')
      setTimeout(() => setError(false), 2000)
    }
  }

  if (!mounted) return null
  if (authed) return <>{children}</>

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: 'linear-gradient(180deg, #0D47A1 0%, #1565C0 50%, #1976D2 100%)' }}>
      {/* Cloud decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="cloud-drift absolute top-8 left-6 w-28 h-9 bg-white/80 rounded-full" />
        <div className="cloud-drift-slow absolute top-10 left-12 w-20 h-7 bg-white/70 rounded-full" />
        <div className="cloud-drift absolute top-20 right-8 w-32 h-10 bg-white/80 rounded-full" style={{ animationDelay: '-5s' }} />
        <div className="cloud-drift-slow absolute top-24 right-14 w-20 h-8 bg-white/70 rounded-full" style={{ animationDelay: '-9s' }} />
        <div className="cloud-drift absolute bottom-24 left-10 w-24 h-8 bg-white/60 rounded-full" style={{ animationDelay: '-3s' }} />
        <div className="cloud-drift-slow absolute bottom-16 right-6 w-20 h-7 bg-white/60 rounded-full" style={{ animationDelay: '-11s' }} />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4 drop-shadow-lg animate-bounce-slow">
            <AlienMascot size={100} />
          </div>
          <h1
            className="text-4xl font-bold text-white tracking-wider"
            style={{ fontFamily: 'Bangers, cursive', letterSpacing: '4px' }}
          >
            TOKYO<span style={{ color: '#FFB300' }}> VIBES</span>
          </h1>
          <p className="text-white/40 text-sm mt-2 font-bold tracking-widest uppercase">2026</p>
          <p className="text-white/30 text-xs mt-1">To Infinity and Beyond!</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold tracking-widest uppercase text-white/40 mb-2">
              輸入密碼
            </label>
            <input
              type="password"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="••••••"
              autoFocus
              inputMode="numeric"
              className={`w-full bg-white/10 border rounded-2xl px-5 py-4 text-white text-center text-2xl tracking-widest
                placeholder:text-white/20 outline-none transition-all duration-200
                focus:bg-white/15 focus:border-woody-yellow
                ${error ? 'border-red-400 animate-pulse' : 'border-white/10'}`}
            />
            {error && (
              <p className="text-center text-red-400 text-sm mt-2 font-semibold">密碼錯誤，再試一次！</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full text-white font-bold rounded-2xl py-4 text-base transition-all duration-150 tracking-widest"
            style={{ background: '#C62828', border: '2px solid #2C1A0E', boxShadow: '3px 3px 0px #2C1A0E', fontFamily: 'Bangers, cursive', letterSpacing: '0.1em', fontSize: '1.2rem' }}
          >
            🚀 進入手冊
          </button>
        </form>

        <p className="text-center text-white/20 text-xs mt-8 font-semibold">
          私人旅遊手冊 · 僅限旅伴使用
        </p>
      </div>
    </div>
  )
}
