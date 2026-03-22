import { useMemo, useState } from 'react'
import { is as isISLocale } from 'date-fns/locale'
import type { DateRange } from 'react-day-picker'
import { CalendarDays, ChevronRight, Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import type { BillCategory } from '@/types'

/** Samsvarandi Figma: húsfélag — Content (192:2965), reikningayfirlit. */

const PRIMARY_TABS = [
  { id: 'allt', label: 'Allt' },
  { id: 'reikningar', label: 'Reikningar' },
  { id: 'skjol', label: 'Skjöl' },
] as const

const CATEGORY_PILLS = [
  { id: 'allt', label: 'Allt' },
  { id: 'vidhald', label: 'Viðhald' },
  { id: 'rafmagn', label: 'Rafmagn' },
  { id: 'vatn', label: 'Vatn' },
  { id: 'hiti', label: 'Hiti' },
  { id: 'annad', label: 'Annað' },
] as const

type PrimaryTabId = (typeof PRIMARY_TABS)[number]['id']
type CategoryPillId = (typeof CATEGORY_PILLS)[number]['id']

type BillStatus = 'vinnsla' | 'greitt'

type MockBillRow = {
  id: string
  kind: 'reikningur' | 'skjal'
  title: string
  category: BillCategory
  dateISO: string
  dueDateISO: string | null
  status: BillStatus
  amountIsk: number | null
}

const statCardShadow = '0px 0px 20px -4px rgba(0, 0, 0, 0.05)'
const filterCardShadow = '0px 0px 24px -4px rgba(0, 0, 0, 0.05)'
const tableCardShadow = '0px 0px 24px 0px rgba(0, 0, 0, 0.05)'

const MOCK_ROWS: MockBillRow[] = [
  {
    id: 'f1',
    kind: 'reikningur',
    title: 'Gluggaskipti',
    category: 'vidhald',
    dateISO: '2025-10-05',
    dueDateISO: '2025-10-05',
    status: 'vinnsla',
    amountIsk: 37334,
  },
  {
    id: 'f2',
    kind: 'reikningur',
    title: 'Gluggaskipti',
    category: 'vidhald',
    dateISO: '2025-10-05',
    dueDateISO: '2025-10-05',
    status: 'greitt',
    amountIsk: 25123,
  },
  {
    id: 'f3',
    kind: 'reikningur',
    title: 'Gluggaskipti',
    category: 'vidhald',
    dateISO: '2025-10-05',
    dueDateISO: '2025-10-05',
    status: 'greitt',
    amountIsk: 35565,
  },
  {
    id: '4',
    kind: 'reikningur',
    title: 'Veitur Reykjavíkur — hiti og vatn',
    category: 'vatn',
    dateISO: '2025-02-14',
    dueDateISO: '2025-02-28',
    status: 'greitt',
    amountIsk: 89400,
  },
  {
    id: '5',
    kind: 'reikningur',
    title: 'Orkuveita Reykjavíkur — rafmagn',
    category: 'rafmagn',
    dateISO: '2025-02-01',
    dueDateISO: '2025-02-15',
    status: 'greitt',
    amountIsk: 124800,
  },
  {
    id: '6',
    kind: 'reikningur',
    title: 'Þrif og snjómokstur sameignar',
    category: 'vidhald',
    dateISO: '2025-01-22',
    dueDateISO: '2025-02-05',
    status: 'vinnsla',
    amountIsk: 186500,
  },
  {
    id: '7',
    kind: 'reikningur',
    title: 'Lagnaviðgerðir þak',
    category: 'vidhald',
    dateISO: '2024-11-08',
    dueDateISO: '2024-11-30',
    status: 'greitt',
    amountIsk: 452000,
  },
  {
    id: '8',
    kind: 'skjal',
    title: 'Ársreikningur húsfélags 2024',
    category: 'annad',
    dateISO: '2025-03-10',
    dueDateISO: null,
    status: 'greitt',
    amountIsk: null,
  },
  {
    id: '9',
    kind: 'skjal',
    title: 'Fundargerð aðalfundar 2024',
    category: 'annad',
    dateISO: '2024-06-18',
    dueDateISO: null,
    status: 'greitt',
    amountIsk: null,
  },
  {
    id: '10',
    kind: 'skjal',
    title: 'Tryggingaryfirlit húss',
    category: 'annad',
    dateISO: '2025-01-05',
    dueDateISO: null,
    status: 'greitt',
    amountIsk: null,
  },
  {
    id: '11',
    kind: 'reikningur',
    title: 'Geymslurými og lyklakerfi',
    category: 'annad',
    dateISO: '2024-12-03',
    dueDateISO: '2024-12-20',
    status: 'greitt',
    amountIsk: 28900,
  },
  {
    id: '12',
    kind: 'reikningur',
    title: 'Hitaveita — fyrirframgreiðsla mars',
    category: 'hiti',
    dateISO: '2025-03-15',
    dueDateISO: '2025-03-15',
    status: 'greitt',
    amountIsk: 223400,
  },
]

const APARTMENT_COUNT = 6

function parseISODateToLocal(dateISO: string) {
  const [y, m, d] = dateISO.split('-').map((v) => Number(v))
  return new Date(y, m - 1, d)
}

function dateToISODateLocal(date: Date) {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

/** Figma: 01.07.2025–01.10.2025 */
function formatRangeDisplay(startISO: string, endISO: string) {
  if (!startISO || !endISO) return ''
  const fmt = (d: Date) =>
    `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`
  return `${fmt(parseISODateToLocal(startISO))}–${fmt(parseISODateToLocal(endISO))}`
}

function formatShortDate(dateISO: string) {
  const d = new Date(`${dateISO}T00:00:00`)
  if (Number.isNaN(d.getTime())) return dateISO
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d)
}

function formatKr(amount: number) {
  const n = new Intl.NumberFormat('is-IS', { maximumFractionDigits: 0 }).format(amount)
  return `${n} kr.`
}

function rowDateTime(rowDateISO: string) {
  return new Date(`${rowDateISO}T00:00:00`).getTime()
}

function inRange(dateISO: string, startISO: string, endISO: string) {
  if (!startISO || !endISO) return true
  const t = rowDateTime(dateISO)
  const a = rowDateTime(startISO)
  const b = rowDateTime(endISO)
  return t >= a && t <= b
}

export function BillsPage() {
  const [primaryTab, setPrimaryTab] = useState<PrimaryTabId>('allt')
  const [categoryPill, setCategoryPill] = useState<CategoryPillId>('allt')
  const [search, setSearch] = useState('')

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  /** Sjálfgefið tímabil nær yfir október svo sýnishorn (05.10.2025) birtist. */
  const [startDateISO, setStartDateISO] = useState('2025-07-01')
  const [endDateISO, setEndDateISO] = useState('2025-10-31')
  const [draftStartISO, setDraftStartISO] = useState('2025-07-01')
  const [draftEndISO, setDraftEndISO] = useState('2025-10-31')

  function handleDatePickerOpenChange(open: boolean) {
    setIsDatePickerOpen(open)
    if (open) {
      setDraftStartISO(startDateISO)
      setDraftEndISO(endDateISO)
    }
  }

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase()
    return MOCK_ROWS.filter((row) => {
      if (primaryTab === 'reikningar' && row.kind !== 'reikningur') return false
      if (primaryTab === 'skjol' && row.kind !== 'skjal') return false
      if (categoryPill !== 'allt' && row.category !== categoryPill) return false
      if (!inRange(row.dateISO, startDateISO, endDateISO)) return false
      if (q && !row.title.toLowerCase().includes(q)) return false
      return true
    }).toSorted((a, b) => rowDateTime(b.dateISO) - rowDateTime(a.dateISO))
  }, [primaryTab, categoryPill, search, startDateISO, endDateISO])

  const stats = useMemo(() => {
    const now = new Date()
    const y = now.getFullYear()
    const m = now.getMonth()
    const bills = MOCK_ROWS.filter((r) => r.kind === 'reikningur' && r.amountIsk != null)

    const monthTotal = bills
      .filter((r) => {
        const dt = new Date(`${r.dateISO}T00:00:00`)
        return dt.getFullYear() === y && dt.getMonth() === m
      })
      .reduce((s, r) => s + (r.amountIsk ?? 0), 0)

    const yearTotal = bills
      .filter((r) => {
        const dt = new Date(`${r.dateISO}T00:00:00`)
        return dt.getFullYear() === y
      })
      .reduce((s, r) => s + (r.amountIsk ?? 0), 0)

    const yourShare = APARTMENT_COUNT > 0 ? Math.round(yearTotal / APARTMENT_COUNT) : 0

    return { monthTotal, yearTotal, yourShare }
  }, [])

  return (
    <div className="flex flex-col gap-4">
      {/* Yfirkort — Figma CardInfo */}
      <div className="grid gap-4 md:grid-cols-3">
        <div
          className="flex flex-col gap-5 overflow-hidden rounded-lg bg-white p-6"
          style={{ boxShadow: statCardShadow }}
        >
          <p className="text-[16px] font-normal leading-5 text-[#666]">
            Heildarkostnaður þennan mánuð
          </p>
          <div className="flex items-baseline gap-3 text-[#323232]">
            <span className="text-[36px] font-bold leading-[48px]">
              {new Intl.NumberFormat('is-IS', { maximumFractionDigits: 0 }).format(stats.monthTotal)}
            </span>
            <span className="text-[16px] font-bold leading-5">kr</span>
          </div>
        </div>
        <div
          className="flex flex-col gap-5 overflow-hidden rounded-lg bg-white p-6"
          style={{ boxShadow: statCardShadow }}
        >
          <p className="text-[16px] font-normal leading-5 text-[#666]">
            Heildarkostnaður á árinu
          </p>
          <div className="flex items-baseline gap-3 text-[#323232]">
            <span className="text-[36px] font-bold leading-[48px]">
              {new Intl.NumberFormat('is-IS', { maximumFractionDigits: 0 }).format(stats.yearTotal)}
            </span>
            <span className="text-[16px] font-bold leading-5">kr</span>
          </div>
        </div>
        <div
          className="flex flex-col gap-5 overflow-hidden rounded-lg bg-white p-6"
          style={{ boxShadow: statCardShadow }}
        >
          <p className="text-[16px] font-normal leading-5 text-[#666]">
            Heildarkostnaðurinn þinn
          </p>
          <div className="flex items-baseline gap-3 text-[#323232]">
            <span className="text-[36px] font-bold leading-[48px]">
              {new Intl.NumberFormat('is-IS', { maximumFractionDigits: 0 }).format(stats.yourShare)}
            </span>
            <span className="text-[16px] font-bold leading-5">kr</span>
          </div>
        </div>
      </div>

      {/* Síur — Figma FilterBar */}
      <div
        className="flex flex-col gap-6 overflow-hidden rounded-lg border border-[#f2f3f4] bg-white p-6"
        style={{ boxShadow: filterCardShadow }}
      >
        <div className="w-full border-b border-[#e8efef]">
          <div className="flex gap-6">
            {PRIMARY_TABS.map((tab) => {
              const active = primaryTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setPrimaryTab(tab.id)}
                  className={cn(
                    'border-b-2 py-2 text-[16px] leading-5 transition-colors',
                    active
                      ? 'border-[#323232] font-bold text-black'
                      : 'border-transparent font-normal text-[#666]',
                  )}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex min-w-0 flex-1 flex-wrap items-end gap-3">
            <div className="flex w-full min-w-[200px] max-w-[280px] flex-col gap-2">
              <span className="text-[14px] font-medium leading-4 text-[#666]">Leit</span>
              <div className="flex min-h-[44px] items-center gap-3 rounded-md border border-[#e6e8e9] bg-white px-4 py-3">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Leita að reikningi"
                  className="min-w-0 flex-1 bg-transparent text-[16px] leading-5 text-[#666] outline-none placeholder:text-[#666]"
                  aria-label="Leit"
                />
                <Search className="h-5 w-5 shrink-0 text-[#666]" />
              </div>
            </div>

            <div className="flex w-full min-w-[200px] max-w-[280px] flex-col gap-2">
              <span className="text-[14px] font-medium leading-4 text-[#666]">Tímabil</span>
              <Popover open={isDatePickerOpen} onOpenChange={handleDatePickerOpenChange}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="flex min-h-[44px] w-full items-center justify-between gap-2 rounded-md border border-[#e6e8e9] bg-white px-4 py-3 text-left outline-none hover:bg-black/[0.02] focus-visible:ring-2 focus-visible:ring-black/10"
                  >
                    <span className="text-[14px] font-bold leading-4 text-black">
                      {startDateISO && endDateISO
                        ? formatRangeDisplay(startDateISO, endDateISO)
                        : '(dd.mm.yyyy)'}
                    </span>
                    <CalendarDays className="h-4 w-4 shrink-0 text-[#666]" />
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  sideOffset={8}
                  className="flex w-auto max-w-[min(100vw-2rem,400px)] flex-col overflow-hidden p-0"
                >
                  <Calendar
                    mode="range"
                    locale={isISLocale}
                    defaultMonth={
                      draftStartISO
                        ? parseISODateToLocal(draftStartISO)
                        : parseISODateToLocal(startDateISO)
                    }
                    selected={
                      draftStartISO || draftEndISO
                        ? {
                            from: draftStartISO ? parseISODateToLocal(draftStartISO) : undefined,
                            to: draftEndISO ? parseISODateToLocal(draftEndISO) : undefined,
                          }
                        : undefined
                    }
                    onSelect={(range: DateRange | undefined) => {
                      if (!range) {
                        setDraftStartISO('')
                        setDraftEndISO('')
                        return
                      }
                      if (range.from) setDraftStartISO(dateToISODateLocal(range.from))
                      else setDraftStartISO('')
                      if (range.to) setDraftEndISO(dateToISODateLocal(range.to))
                      else setDraftEndISO('')
                    }}
                  />
                  <div className="flex justify-end gap-1.5 border-t border-border p-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-10 rounded border-0 bg-white px-6 text-[14px] font-bold text-black shadow-none hover:bg-black/[0.03]"
                      onClick={() => setIsDatePickerOpen(false)}
                    >
                      Hætta við
                    </Button>
                    <Button
                      type="button"
                      className="h-10 w-[120px] shrink-0 rounded border-0 bg-[#18325a] text-[14px] font-bold text-white hover:bg-[#162b47]"
                      onClick={() => {
                        setStartDateISO(draftStartISO)
                        setEndDateISO(draftEndISO)
                        setIsDatePickerOpen(false)
                      }}
                    >
                      Vista
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <Button
            type="button"
            className="h-11 shrink-0 rounded-md border-0 bg-[#18325a] px-6 text-[16px] font-bold text-white hover:bg-[#162b47]"
            onClick={() => {
              /* TODO: upphleðsla */
            }}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Hlaða upp reikning
          </Button>
        </div>
      </div>

      {/* Tafla — Figma TableGroup */}
      <div
        className="flex flex-col gap-6 overflow-hidden rounded-lg border border-[#f2f3f4] bg-white px-6 pb-8 pt-6"
        style={{ boxShadow: tableCardShadow }}
      >
        <div className="inline-flex w-fit items-center gap-0 rounded-md bg-[#f3f5f7] p-0.5">
          {CATEGORY_PILLS.map((pill) => {
            const active = categoryPill === pill.id
            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => setCategoryPill(pill.id)}
                className={cn(
                  'flex h-8 items-center justify-center px-4 py-1 text-[14px] transition-colors',
                  active
                    ? 'rounded bg-white font-bold text-[#323232] shadow-[0px_2px_6px_0px_rgba(0,0,0,0.06),0px_1px_2px_0px_rgba(0,0,0,0.04)]'
                    : 'rounded-[14px] font-medium text-[#666]',
                )}
              >
                {pill.label}
              </button>
            )
          })}
        </div>

        <div className="flex flex-col gap-2">
          <div
            className={cn(
              'grid min-h-11 grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_44px] items-center px-4',
            )}
          >
            <div className="px-3">
              <span className="text-[14px] font-medium leading-5 text-[#666]">Tegund</span>
            </div>
            <div className="px-3">
              <span className="text-[14px] font-medium leading-5 text-[#666]">Dagsetning</span>
            </div>
            <div className="px-3">
              <span className="text-[14px] font-medium leading-5 text-[#666]">Gjalddagi</span>
            </div>
            <div className="px-3">
              <span className="text-[14px] font-medium leading-5 text-[#666]">Staða</span>
            </div>
            <div className="px-3 text-right">
              <span className="text-[14px] font-medium leading-5 text-[#666]">Upphæð</span>
            </div>
            <div className="size-[44px]" aria-hidden />
          </div>

          {filteredRows.length === 0 ? (
            <div className="rounded-lg px-4 py-6 text-[14px] leading-5 text-[#666]">
              Engar færslur fundust fyrir þessa síu.
            </div>
          ) : (
            filteredRows.map((row) => (
              <div
                key={row.id}
                className="grid min-h-[76px] grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_44px] items-center rounded-lg bg-[#fbfbfc] p-4"
              >
                <div className="px-3">
                  <p className="text-[16px] font-bold leading-5 text-[#323232]">{row.title}</p>
                </div>
                <div className="px-3">
                  <p className="text-[16px] font-normal leading-5 text-[#323232]">
                    {formatShortDate(row.dateISO)}
                  </p>
                </div>
                <div className="px-3">
                  <p className="text-[16px] font-normal leading-5 text-[#323232]">
                    {row.dueDateISO ? formatShortDate(row.dueDateISO) : '—'}
                  </p>
                </div>
                <div className="px-3">
                  <div
                    className={cn(
                      'inline-flex h-6 items-center gap-2 rounded-full bg-white px-3 py-1',
                    )}
                  >
                    <span
                      className={cn(
                        'size-2.5 shrink-0 rounded-full',
                        row.status === 'vinnsla' ? 'bg-[#F18F01]' : 'bg-[#22c55e]',
                      )}
                      aria-hidden
                    />
                    <span className="text-[11px] font-medium uppercase leading-4 tracking-[0.22px] text-[#323232]">
                      {row.status === 'vinnsla' ? 'í vinnslu' : 'greitt'}
                    </span>
                  </div>
                </div>
                <div className="px-3 text-right">
                  <p className="text-[16px] font-normal leading-5 text-[#323232]">
                    {row.amountIsk != null ? formatKr(row.amountIsk) : '—'}
                  </p>
                </div>
                <div className="flex size-[44px] items-center justify-center">
                  <button
                    type="button"
                    className="flex size-9 items-center justify-center rounded-md text-[#323232] hover:bg-black/[0.04]"
                    aria-label="Opna"
                    onClick={() => {
                      /* TODO */
                    }}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
