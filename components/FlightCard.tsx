import { Plane } from 'lucide-react'

interface FlightInfo {
  direction: '去程' | '回程'
  date: string
  airline: string
  flightNo: string
  departure: { code: string; city: string; time: string }
  arrival: { code: string; city: string; time: string }
}

const flights: FlightInfo[] = [
  {
    direction: '去程',
    date: '5月20日 (三)',
    airline: '中華航空',
    flightNo: 'CI100',
    departure: { code: 'TPE', city: '台北桃園', time: '08:50' },
    arrival: { code: 'NRT', city: '東京成田', time: '13:15' },
  },
  {
    direction: '回程',
    date: '5月25日 (一)',
    airline: '中華航空',
    flightNo: 'CI105',
    departure: { code: 'NRT', city: '東京成田', time: '17:55' },
    arrival: { code: 'TPE', city: '台北桃園', time: '20:35' },
  },
]

export default function FlightCard() {
  return (
    <div className="space-y-3">
      <p className="section-title">航班資訊</p>
      {flights.map((f) => (
        <div key={f.flightNo} className="card p-4 animate-slide-up">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="bg-tokyo-red text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                {f.direction}
              </span>
              <span className="text-xs text-mid-gray">{f.date}</span>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-charcoal">{f.airline}</p>
              <p className="text-xs text-mid-gray">{f.flightNo}</p>
            </div>
          </div>

          {/* Route */}
          <div className="flex items-center justify-between">
            {/* Departure */}
            <div className="text-left">
              <p className="text-3xl font-bold text-charcoal leading-none">{f.departure.time}</p>
              <p className="text-lg font-semibold text-charcoal mt-1">{f.departure.code}</p>
              <p className="text-xs text-mid-gray">{f.departure.city}</p>
            </div>

            {/* Line */}
            <div className="flex-1 mx-3 relative">
              <div className="border-t-2 border-dashed border-soft-border" />
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cream p-1">
                <Plane size={16} className="text-tokyo-red" />
              </div>
            </div>

            {/* Arrival */}
            <div className="text-right">
              <p className="text-3xl font-bold text-charcoal leading-none">{f.arrival.time}</p>
              <p className="text-lg font-semibold text-charcoal mt-1">{f.arrival.code}</p>
              <p className="text-xs text-mid-gray">{f.arrival.city}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
