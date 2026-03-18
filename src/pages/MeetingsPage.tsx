import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronRight, Download, Plus, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

const TABS = [
  { id: 'allir', label: 'Allir' },
  { id: 'vaentanlegt', label: 'Væntanlegt' },
  { id: 'eldri', label: 'Eldri' },
] as const

const MOCK_MEETINGS = [
  {
    id: '1',
    date: '15. mars 2025',
    title: 'Fundur um gluggaskipti',
    hasMinutes: true,
    status: 'past' as const,
  },
  {
    id: '2',
    date: '02. apríl 2026',
    title: 'Aðalfundur',
    hasMinutes: false,
    status: 'upcoming' as const,
  },
  {
    id: '3',
    date: '10. apríl 2026',
    title: 'Fundur um viðhald',
    hasMinutes: false,
    status: 'upcoming' as const,
  },
  {
    id: '4',
    date: '01. febrúar 2025',
    title: 'Fundur um sameign',
    hasMinutes: true,
    status: 'past' as const,
  },
  {
    id: '5',
    date: '20. júní 2025',
    title: 'Fundur um fjárhagsáætlun',
    hasMinutes: true,
    status: 'past' as const,
  },
]

export function MeetingsPage() {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]['id']>('allir')
  const [search, setSearch] = useState('')
  const [period] = useState('01.07.2025–01.10.2025')
  const cardBoxShadow = '0px 0px 24px -4px rgba(0, 0, 0, 0.05)'

  const filteredMeetings = MOCK_MEETINGS.filter((m) => {
    const matchesTab =
      activeTab === 'allir'
        ? true
        : activeTab === 'vaentanlegt'
          ? m.status === 'upcoming'
          : m.status === 'past'

    const q = search.trim().toLowerCase()
    const matchesSearch =
      q.length === 0 ||
      m.title.toLowerCase().includes(q) ||
      m.date.toLowerCase().includes(q)

    return matchesTab && matchesSearch
  }).toSorted((a, b) => {
    const order: Record<(typeof MOCK_MEETINGS)[number]['status'], number> = {
      upcoming: 0,
      past: 1,
    }
    return order[a.status] - order[b.status]
  })

  return (
    <div className="flex flex-col gap-4">
      {/* Filter bar – Figma: white card, shadow, tabs + filters row */}
      <div
        className={cn('flex flex-col gap-6 rounded-lg border border-[#f2f3f4] bg-white p-6')}
        style={{ boxShadow: cardBoxShadow }}
      >
        <div className="border-b border-[#e8efef]">
          <div className="flex gap-6">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'py-2 text-[16px] leading-[1.25] transition-colors',
                  activeTab === tab.id
                    ? 'border-b-2 border-[#323232] font-bold text-black'
                    : 'font-normal text-[#666] hover:text-black',
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-wrap gap-3">
            <div className="flex w-[280px] flex-col gap-2">
              <label className="text-[14px] font-medium leading-4 text-[#666]">
                Leit
              </label>
              <div className="flex items-center gap-3 rounded-md border border-[#e6e8e9] bg-white px-4 py-3">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Leita að fundi"
                  className="min-w-0 flex-1 bg-transparent text-[16px] leading-[1.25] text-black outline-none placeholder:text-[#666]"
                  aria-label="Leit"
                />
                <Search className="h-5 w-5 shrink-0 text-[#666]" />
              </div>
            </div>
            <div className="flex w-[280px] flex-col gap-2">
              <label className="text-[14px] font-medium leading-4 text-[#666]">
                Tímabil
              </label>
              <button
                type="button"
                className="flex min-h-[44px] items-center justify-between gap-2 rounded-md border border-[#e6e8e9] bg-white px-4 py-3 text-left"
                aria-label="Tímabil"
              >
                <span className="text-[14px] font-bold leading-4 text-black">
                  {period}
                </span>
                <ChevronDown className="h-4 w-4 shrink-0 text-black" />
              </button>
            </div>
          </div>
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="h-11 min-w-[44px] rounded-md bg-[#dfffb4] px-4 text-[14px] font-bold text-black hover:bg-[#cdf28c] border-0"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Bóka fund
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-[18px] font-bold leading-6 text-black">
                    Bóka fund
                  </DialogTitle>
                  <DialogDescription className="text-[14px] leading-5 text-[#666]">
                    Skráðu nýjan fund og vistaðu í fundalista.
                  </DialogDescription>
                </DialogHeader>

                <div className="mt-6 grid gap-3">
                  <div className="grid gap-2">
                    <label className="text-[14px] font-medium leading-4 text-[#666]">
                      Heiti fundar
                    </label>
                    <input
                      className="h-11 rounded-md border border-[#e6e8e9] px-4 text-[14px] outline-none focus-visible:ring-2 focus-visible:ring-black/10"
                      placeholder="t.d. Aðalfundur"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-[14px] font-medium leading-4 text-[#666]">
                      Dagsetning
                    </label>
                    <input
                      type="date"
                      className="h-11 rounded-md border border-[#e6e8e9] px-4 text-[14px] outline-none focus-visible:ring-2 focus-visible:ring-black/10"
                    />
                  </div>
                </div>

                <DialogFooter>
                  <DialogClose asChild>
                    <Button
                      variant="outline"
                      className="h-11 rounded-md border-[#e6e8e9] bg-white px-4 text-[14px] font-bold text-black"
                    >
                      Hætta við
                    </Button>
                  </DialogClose>
                  <Button className="h-11 rounded-md bg-[#18325a] px-4 text-[14px] font-bold text-white hover:bg-[#142a4b]">
                    Vista fund
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button
              variant="outline"
              size="sm"
              className="h-11 min-w-[44px] rounded-md border-[#e6e8e9] bg-white px-4 text-[14px] font-bold text-black"
            >
              <Download className="mr-2 h-4 w-4" />
              Hlaða niður
            </Button>
          </div>
        </div>
      </div>

      {/* Table – Figma: white card, shadow, header + rows */}
      <div
        className={cn('rounded-lg border border-[#f2f3f4] bg-white px-6 pb-6 pt-6')}
        style={{ boxShadow: cardBoxShadow }}
      >
        <div className="flex h-11 items-center px-4">
          <div className="w-[244px] shrink-0 px-3">
            <span className="text-[14px] font-medium leading-5 text-[#666]">
              Dagsetning
            </span>
          </div>
          <div className="min-w-0 flex-1 px-3">
            <span className="text-[14px] font-medium leading-5 text-[#666]">
              Fundur
            </span>
          </div>
          <div className="flex min-w-0 flex-1 justify-end px-3">
            <span className="text-[14px] font-medium leading-5 text-[#666]">
              Fundagerð
            </span>
          </div>
        </div>

        <div className="mt-0 flex flex-col gap-2">
          {filteredMeetings.length === 0 ? (
            <div className="rounded-lg px-4 py-6 text-[14px] leading-5 text-[#666]">
              Engir fundir fundust fyrir þessa síu.
            </div>
          ) : (
            filteredMeetings.map((meeting) => (
              <div
                key={meeting.id}
                className="flex h-[76px] items-center rounded-lg px-4 py-4"
                style={{ backgroundColor: 'rgba(242,243,244,0.3)' }}
              >
                <div className="w-[244px] shrink-0 px-3 text-[16px] font-normal leading-5 text-black">
                  {meeting.date}
                </div>
                <div className="min-w-0 flex-1 px-3 text-[16px] font-medium leading-5 text-black">
                  {meeting.title}
                </div>
                <div className="flex min-w-0 flex-1 justify-end px-0">
                  {meeting.hasMinutes ? (
                    <button
                      type="button"
                      className="inline-flex w-fit items-center gap-1.5 rounded-md px-4 py-2 text-[14px] font-bold leading-4 text-black hover:underline"
                    >
                      Sækja fundagerð
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <span className="text-[#666]">—</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
