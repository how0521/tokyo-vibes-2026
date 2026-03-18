import { Map, Ticket, Mountain, Train, ArrowUpRight } from 'lucide-react'

const LINKS = [
  {
    icon: Map,
    label: '東京地鐵路線圖',
    sublabel: 'Tokyo Metro PDF',
    href: 'https://www.tokyometro.jp/station/pdf/202305/202305_number_tcn.pdf',
    color: 'text-blue-500',
    bg: 'bg-blue-50',
  },
  {
    icon: Ticket,
    label: '迪士尼樂園購票',
    sublabel: 'Tokyo Disneyland',
    href: 'https://reserve.tokyodisneyresort.jp/ticket/list/',
    color: 'text-tokyo-red',
    bg: 'bg-red-50',
  },
  {
    icon: Mountain,
    label: '富士山一日遊',
    sublabel: 'Klook 行程',
    href: 'https://www.klook.com/zh-TW/activity/93901-mtfuji-one-day-tour-tokyo/?spm=SearchResult.SearchResult_LIST&clickId=6493eb3a41',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50',
  },
  {
    icon: Train,
    label: '京成 Skyliner 票',
    sublabel: 'Klook 購票',
    href: 'https://www.klook.com/zh-TW/activity/1410-skyliner-tokyo/?spm=SearchResult.SearchResult_LIST&clickId=c10d1fb156',
    color: 'text-purple-500',
    bg: 'bg-purple-50',
  },
]

export default function QuickLinks() {
  return (
    <div>
      <p className="section-title">快速連結</p>
      <div className="grid grid-cols-2 gap-3">
        {LINKS.map(({ icon: Icon, label, sublabel, href, color, bg }) => (
          <a
            key={href}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="card p-4 flex flex-col gap-3 active:bg-warm-gray transition-colors duration-150"
          >
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}>
              <Icon size={20} className={color} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-charcoal leading-tight">{label}</p>
              <p className="text-[11px] text-mid-gray mt-0.5">{sublabel}</p>
            </div>
            <ArrowUpRight size={14} className="text-mid-gray self-end" />
          </a>
        ))}
      </div>
    </div>
  )
}
