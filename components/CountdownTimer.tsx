'use client'

import { useEffect, useState } from 'react'

// Target: 2026-05-20 08:50 Taiwan time (UTC+8)
const TARGET = new Date('2026-05-20T00:50:00Z').getTime()

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function calcTimeLeft(): TimeLeft {
  const diff = TARGET - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null)
  const [departed, setDeparted] = useState(false)

  useEffect(() => {
    const update = () => {
      if (Date.now() >= TARGET) {
        setDeparted(true)
        return
      }
      setTimeLeft(calcTimeLeft())
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  if (departed) {
    return (
      <div className="text-center py-6">
        <p className="text-3xl font-bold text-tokyo-red">いってらっしゃい！</p>
        <p className="text-mid-gray text-sm mt-1">旅程已開始，祝玩得開心！</p>
      </div>
    )
  }

  if (!timeLeft) {
    return <div className="h-24" />
  }

  const blocks = [
    { value: pad(timeLeft.days), label: '天' },
    { value: pad(timeLeft.hours), label: '時' },
    { value: pad(timeLeft.minutes), label: '分' },
    { value: pad(timeLeft.seconds), label: '秒' },
  ]

  return (
    <div className="text-center animate-fade-in">
      <p className="text-xs font-semibold tracking-widest uppercase text-mid-gray mb-4">
        距離出發還有
      </p>
      <div className="flex items-start justify-center gap-2.5">
        {blocks.map(({ value, label }, i) => (
          <div key={i} className="countdown-block">
            <div className="countdown-number">{value}</div>
            <div className="countdown-label">{label}</div>
          </div>
        ))}
      </div>
      <p className="text-xs text-mid-gray mt-4 font-light">
        2026年5月20日 08:50 出發 ✈
      </p>
    </div>
  )
}
