import { MapPin, Calendar, ArrowUpRight } from 'lucide-react'

const HOTEL = {
  name: 'Tosei Hotel Cocone 上野御徒町',
  address: '3 Chome-23-9 Ueno, Taito City, Tokyo 110-0005',
  mapUrl: 'https://www.google.com/maps/search/?api=1&query=Tosei+Hotel+Cocone+Ueno+Okachimachi',
  checkIn: '5月20日 (三)  15:00',
  checkOut: '5月25日 (一)  10:00',
  nights: '5 泊',
}

export default function HotelCard() {
  return (
    <div className="space-y-3">
      <p className="section-title">飯店資訊</p>
      <div className="card p-4 animate-slide-up">
        {/* Name + Badge */}
        <div className="flex items-start justify-between gap-2 mb-4">
          <div>
            <p className="font-semibold text-charcoal text-base leading-snug">{HOTEL.name}</p>
            <p className="text-xs text-mid-gray mt-0.5">上野 · 台東區</p>
          </div>
          <span className="bg-warm-gray text-charcoal text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap">
            {HOTEL.nights}
          </span>
        </div>

        {/* Check-in / Check-out */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-warm-gray rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Calendar size={12} className="text-tokyo-red" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-mid-gray">Check-in</span>
            </div>
            <p className="text-sm font-semibold text-charcoal">{HOTEL.checkIn}</p>
          </div>
          <div className="bg-warm-gray rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Calendar size={12} className="text-mid-gray" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-mid-gray">Check-out</span>
            </div>
            <p className="text-sm font-semibold text-charcoal">{HOTEL.checkOut}</p>
          </div>
        </div>

        {/* Address + Map Button */}
        <div className="flex items-start gap-2 mb-3">
          <MapPin size={14} className="text-tokyo-red mt-0.5 shrink-0" />
          <p className="text-xs text-mid-gray leading-relaxed">{HOTEL.address}</p>
        </div>

        <a
          href={HOTEL.mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary w-full"
        >
          <MapPin size={16} />
          在 Google Maps 查看
          <ArrowUpRight size={14} className="ml-auto opacity-70" />
        </a>
      </div>
    </div>
  )
}
