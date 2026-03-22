import { useMemo, useState } from 'react'
import { is as isISLocale } from 'date-fns/locale'
import type { DateRange } from 'react-day-picker'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarDays, Check, ChevronDown, ChevronRight, Download, Plus, Search, Upload } from 'lucide-react'
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
import { useResidents } from '@/hooks/useResidents'

const TABS = [
  { id: 'allir', label: 'Allir fundir' },
  { id: 'vaentanlegt', label: 'Væntanlegir fundir' },
  { id: 'eldri', label: 'Eldri fundir' },
] as const

type MeetingStatus = 'upcoming' | 'past'

type MeetingParticipantSnapshot = { id: string; name: string; apartmentName: string | null }

type Meeting = {
  id: string
  dateISO: string
  dateLabel: string
  title: string
  hasMinutes: boolean
  status: MeetingStatus
  time?: string | null
  location?: string | null
  meetingType?: MeetingTypeId | null
  description?: string | null
  agendaPdfName?: string | null
  participants: { mode: 'all' | 'custom'; customList?: MeetingParticipantSnapshot[] }
  notifications: { sendToAll: boolean; email: boolean; inApp: boolean; groupMessage?: boolean }
}

const MOCK_MEETINGS: Meeting[] = [
  {
    id: '1',
    dateISO: '2025-03-15',
    dateLabel: '15. mars 2025',
    title: 'Fundur um gluggaskipti',
    hasMinutes: true,
    status: 'past',
    time: null,
    location: null,
    meetingType: 'annad',
    description: null,
    agendaPdfName: null,
    participants: { mode: 'all' },
    notifications: { sendToAll: false, email: false, inApp: false },
  },
  {
    id: '2',
    dateISO: '2026-04-02',
    dateLabel: '02. apríl 2026',
    title: 'Aðalfundur',
    hasMinutes: false,
    status: 'upcoming',
    time: '18:00',
    location: 'Sameiginlegt rými',
    meetingType: 'adalfundur',
    description: 'Yfirlit yfir liðið ár og samþykkt fjárhagsáætlunar.',
    agendaPdfName: null,
    participants: { mode: 'all' },
    notifications: { sendToAll: true, email: true, inApp: true },
  },
  {
    id: '3',
    dateISO: '2026-04-10',
    dateLabel: '10. apríl 2026',
    title: 'Fundur um viðhald',
    hasMinutes: false,
    status: 'upcoming',
    time: '20:00',
    location: 'Online (Zoom)',
    meetingType: 'annad',
    description: 'Umræða um viðhald á þaki og næstu skref.',
    agendaPdfName: null,
    participants: { mode: 'all' },
    notifications: { sendToAll: true, email: true, inApp: true },
  },
  {
    id: '4',
    dateISO: '2025-02-01',
    dateLabel: '01. febrúar 2025',
    title: 'Fundur um sameign',
    hasMinutes: true,
    status: 'past',
    time: null,
    location: null,
    meetingType: 'annad',
    description: null,
    agendaPdfName: null,
    participants: { mode: 'all' },
    notifications: { sendToAll: false, email: false, inApp: false },
  },
  {
    id: '5',
    dateISO: '2025-06-20',
    dateLabel: '20. júní 2025',
    title: 'Fundur um fjárhagsáætlun',
    hasMinutes: true,
    status: 'past',
    time: null,
    location: null,
    meetingType: 'annad',
    description: null,
    agendaPdfName: null,
    participants: { mode: 'all' },
    notifications: { sendToAll: false, email: false, inApp: false },
  },
]

const MEETING_TYPES = [
  { id: 'adalfundur', label: 'Aðalfundur' },
  { id: 'aukafundur', label: 'Aukafundur' },
  { id: 'stjornarfundur', label: 'Stjórnarfundur' },
  { id: 'annad', label: 'Annað' },
] as const

type MeetingTypeId = (typeof MEETING_TYPES)[number]['id']

function formatMeetingDate(dateISO: string) {
  const d = new Date(`${dateISO}T00:00:00`)
  if (Number.isNaN(d.getTime())) return dateISO
  return new Intl.DateTimeFormat('is-IS', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(d)
}

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

function formatTriggerRangeSlash(startISO: string, endISO: string) {
  if (!startISO || !endISO) return ''
  const a = parseISODateToLocal(startISO)
  const b = parseISODateToLocal(endISO)
  const fmt = (d: Date) =>
    `${String(d.getDate()).padStart(2, '0')} / ${String(d.getMonth() + 1).padStart(2, '0')} / ${d.getFullYear()}`
  return `${fmt(a)} – ${fmt(b)}`
}

function getMeetingStatusFromDate(dateISO: string): MeetingStatus {
  const meetingDate = new Date(`${dateISO}T00:00:00`)
  if (Number.isNaN(meetingDate.getTime())) return 'upcoming'

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return meetingDate.getTime() < today.getTime() ? 'past' : 'upcoming'
}

const BOOK_INPUT_CLASS =
  'h-10 w-full rounded border border-[#e8eaee] bg-white px-4 text-[16px] leading-[1.25] text-black outline-none placeholder:text-[#666] focus-visible:ring-2 focus-visible:ring-black/10'

function BookFormCheckbox({
  id,
  label,
  checked,
  onCheckedChange,
}: {
  id: string
  label: string
  checked: boolean
  onCheckedChange: (next: boolean) => void
}) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center gap-2">
      <span
        className={cn(
          'flex size-5 shrink-0 items-center justify-center rounded-sm transition-colors',
          checked ? 'bg-[#18325a]' : 'border-2 border-[#e5e5e5] bg-white',
        )}
      >
        {checked ? <Check className="size-3 text-white" strokeWidth={3} /> : null}
      </span>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
        className="sr-only"
      />
      <span className="text-[14px] font-medium leading-5 text-[#1a1a1a]">{label}</span>
    </label>
  )
}

export function MeetingsPage() {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]['id']>('allir')
  const [search, setSearch] = useState('')
  const cardBoxShadow = '0px 0px 24px -4px rgba(0, 0, 0, 0.05)'
  const { data: apartmentsWithResidents } = useResidents()
  const [meetings, setMeetings] = useState(MOCK_MEETINGS)
  const [isBookDialogOpen, setIsBookDialogOpen] = useState(false)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null)

  const [meetingTitle, setMeetingTitle] = useState('')
  const [meetingDate, setMeetingDate] = useState('')
  const [meetingTime, setMeetingTime] = useState('')
  const [meetingLocation, setMeetingLocation] = useState('')
  const [meetingType, setMeetingType] = useState<MeetingTypeId | ''>('')
  const [meetingDescription, setMeetingDescription] = useState('')
  const [agendaPdf, setAgendaPdf] = useState<File | null>(null)

  const [sendEmailNotification, setSendEmailNotification] = useState(true)
  const [sendInAppNotification, setSendInAppNotification] = useState(false)
  const [sendGroupMessage, setSendGroupMessage] = useState(false)

  const [participantsMode, setParticipantsMode] = useState<'all' | 'custom'>('all')
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<Set<string>>(
    () => new Set(),
  )
  const [formTouched, setFormTouched] = useState(false)

  // Date filter popover + range
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [startDateISO, setStartDateISO] = useState('')
  const [endDateISO, setEndDateISO] = useState('')
  const [draftStartISO, setDraftStartISO] = useState('')
  const [draftEndISO, setDraftEndISO] = useState('')

  function handleDatePickerOpenChange(open: boolean) {
    setIsDatePickerOpen(open)
    if (open) {
      setDraftStartISO(startDateISO)
      setDraftEndISO(endDateISO)
    }
  }

  const allResidents = useMemo(() => {
    const apts = apartmentsWithResidents ?? []
    const profiles = apts.flatMap((a) => a.residents ?? [])
    const seen = new Set<string>()
    return profiles
      .filter((p) => {
        if (!p?.id) return false
        if (seen.has(p.id)) return false
        seen.add(p.id)
        return true
      })
      .map((p) => ({
        id: p.id,
        name: p.full_name ?? 'Nafn ótilgreint',
        apartmentName: apts.find((a) => a.id === p.apartment_id)?.name ?? null,
      }))
  }, [apartmentsWithResidents])

  const isTitleValid = meetingTitle.trim().length > 0
  const isDateValid = meetingDate.trim().length > 0
  const isTimeValid = meetingTime.trim().length > 0
  const isTypeValid = meetingType !== ''
  const canSubmit = isTitleValid && isDateValid && isTimeValid && isTypeValid

  function resetBookForm() {
    setMeetingTitle('')
    setMeetingDate('')
    setMeetingTime('')
    setMeetingLocation('')
    setMeetingType('')
    setMeetingDescription('')
    setAgendaPdf(null)
    setSendEmailNotification(true)
    setSendInAppNotification(false)
    setSendGroupMessage(false)
    setParticipantsMode('all')
    setSelectedParticipantIds(new Set())
    setFormTouched(false)
  }

  function handleBookMeeting() {
    setFormTouched(true)
    if (!canSubmit) return

    const selectedCustomList =
      participantsMode === 'custom'
        ? allResidents
            .filter((r) => selectedParticipantIds.has(r.id))
            .map((r) => ({ id: r.id, name: r.name, apartmentName: r.apartmentName }))
        : undefined

    setMeetings((prev) => [
      {
        id: `local-${Date.now()}`,
        dateISO: meetingDate,
        dateLabel: formatMeetingDate(meetingDate),
        title: meetingTitle.trim(),
        hasMinutes: false,
        status: getMeetingStatusFromDate(meetingDate),
        time: meetingTime,
        location: meetingLocation.trim().length > 0 ? meetingLocation.trim() : null,
        meetingType: meetingType,
        description: meetingDescription.trim().length > 0 ? meetingDescription.trim() : null,
        agendaPdfName: agendaPdf?.name ?? null,
        participants: { mode: participantsMode, customList: selectedCustomList },
        notifications: {
          sendToAll:
            sendEmailNotification || sendInAppNotification || sendGroupMessage,
          email: sendEmailNotification,
          inApp: sendInAppNotification,
          groupMessage: sendGroupMessage,
        },
      },
      ...prev,
    ])

    setIsBookDialogOpen(false)
    resetBookForm()
  }

  const filteredMeetings = meetings.filter((m) => {
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
      m.dateLabel.toLowerCase().includes(q)

    const matchesDate = (() => {
      if (!startDateISO && !endDateISO) return true

      const mTime = new Date(`${m.dateISO}T00:00:00`).getTime()
      if (Number.isNaN(mTime)) return false

      if (startDateISO) {
        const sd = new Date(`${startDateISO}T00:00:00`).getTime()
        if (!Number.isNaN(sd) && mTime < sd) return false
      }

      if (endDateISO) {
        const ed = new Date(`${endDateISO}T00:00:00`).getTime()
        if (!Number.isNaN(ed) && mTime > ed) return false
      }

      return true
    })()

    return matchesTab && matchesSearch && matchesDate
  }).toSorted((a, b) => {
    const order: Record<MeetingStatus, number> = {
      upcoming: 0,
      past: 1,
    }
    const statusDiff = order[a.status] - order[b.status]
    if (statusDiff !== 0) return statusDiff

    const aTime = new Date(`${a.dateISO}T00:00:00`).getTime()
    const bTime = new Date(`${b.dateISO}T00:00:00`).getTime()
    if (Number.isNaN(aTime) || Number.isNaN(bTime)) return 0

    // For upcoming: earliest first. For past: latest first.
    return a.status === 'past' ? bTime - aTime : aTime - bTime
  })

  const selectedMeeting = useMemo(() => {
    if (!selectedMeetingId) return null
    return meetings.find((m) => m.id === selectedMeetingId) ?? null
  }, [meetings, selectedMeetingId])

  const selectedMeetingTypeLabel =
    selectedMeeting?.meetingType != null
      ? MEETING_TYPES.find((t) => t.id === selectedMeeting.meetingType)?.label ?? 'Annað'
      : null

  return (
    <div className="flex flex-col gap-4">
      {/* Filter bar – Figma: white card, shadow, tabs + filters row */}
      <div
        className={cn('flex flex-col gap-6 rounded-lg border border-[#f2f3f4] bg-white p-6')}
        style={{ boxShadow: cardBoxShadow }}
      >
        <div className="bg-[#f3f5f7] flex items-center justify-center px-[2px] py-[2px] relative rounded-[6px] w-fit shrink-0 h-[44px]">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex h-[100%] items-center justify-center px-[16px] py-[4px] transition-colors',
                  isActive
                    ? 'rounded-[4px] bg-white shadow-[0px_2px_6px_0px_rgba(0,0,0,0.06),0px_1px_2px_0px_rgba(0,0,0,0.04)]'
                    : 'rounded-[14px] bg-transparent',
                )}
              >
                <span
                  className={cn(
                    'whitespace-nowrap text-[14px] leading-[16px]',
                    isActive ? 'font-bold text-[#323232]' : 'font-medium text-[#666]',
                  )}
                >
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex w-[280px] flex-col gap-2">
              <label className="text-[14px] font-medium leading-4 text-[#666]">
                Leit
              </label>
              <div className="flex min-h-11 items-center gap-3 rounded-md border border-[#e6e8e9] bg-white px-4 py-3">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Leita að fundi"
                  className="min-w-0 flex-1 bg-transparent text-[16px] leading-[1.25] text-black outline-none placeholder:text-[#74849C]"
                  aria-label="Leit"
                />
                <Search className="h-5 w-5 shrink-0 text-[#666]" />
              </div>
            </div>
            <div className="flex w-[280px] flex-col gap-2">
              <label className="text-[14px] font-medium leading-4 text-[#666]">
                Tímabil
              </label>
              <Popover open={isDatePickerOpen} onOpenChange={handleDatePickerOpenChange}>
                <div className="flex min-h-11 w-full items-center gap-3 rounded-md border border-[#e6e8e9] bg-white px-4 py-3">
                  <span
                    className={cn(
                      'min-w-0 flex-1 truncate text-[16px] leading-[1.25]',
                      startDateISO && endDateISO
                        ? 'font-bold text-black'
                        : 'font-medium text-[#666]',
                    )}
                  >
                    {startDateISO && endDateISO
                      ? formatTriggerRangeSlash(startDateISO, endDateISO)
                      : '(dd.mm.yyyy)'}
                  </span>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[#666] outline-none hover:bg-black/5 focus-visible:ring-2 focus-visible:ring-black/10"
                      aria-label="Opna dagatal"
                    >
                      <CalendarDays className="h-5 w-5" />
                    </button>
                  </PopoverTrigger>
                </div>

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
                        : startDateISO
                          ? parseISODateToLocal(startDateISO)
                          : new Date()
                    }
                    selected={
                      draftStartISO || draftEndISO
                        ? {
                            from: draftStartISO
                              ? parseISODateToLocal(draftStartISO)
                              : undefined,
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
          <div className="flex gap-2">
            <Dialog
              open={isBookDialogOpen}
              onOpenChange={(open) => {
                setIsBookDialogOpen(open)
                if (!open) resetBookForm()
              }}
            >
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="h-11 min-w-[44px] rounded-md bg-[#18325a] px-4 text-[14px] font-bold text-white hover:bg-[#162b47] border-0"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Bóka fund
                </Button>
              </DialogTrigger>
              <DialogContent side="right" className="flex max-h-none flex-col gap-6 overflow-hidden">
                <DialogHeader className="space-y-0 pr-10 text-left">
                  <DialogTitle className="text-[18px] font-medium leading-[1.333] text-[#323232]">
                    Nýr fundur
                  </DialogTitle>
                </DialogHeader>

                <div className="flex min-h-0 flex-1 flex-col gap-6">
                  <div className="min-h-0 flex-1 space-y-6 overflow-y-auto pr-1">
                    {/* Figma: surface / table card — grunnreitur */}
                    <div className="rounded bg-[#fbfbfc] p-6">
                      <div className="grid gap-4">
                        <div className="grid gap-2">
                          <label
                            htmlFor="book-meeting-title"
                            className="text-[14px] leading-4 text-[#323232]"
                          >
                            Titill fundar (nauðsynlegt)
                          </label>
                          <input
                            id="book-meeting-title"
                            value={meetingTitle}
                            onChange={(e) => setMeetingTitle(e.target.value)}
                            className={BOOK_INPUT_CLASS}
                            placeholder="T.d „Laga glugga að utan“"
                            aria-invalid={formTouched && !isTitleValid}
                          />
                          {formTouched && !isTitleValid ? (
                            <div className="text-[12px] leading-4 text-red-600">
                              Vinsamlegast sláðu inn fundartitil.
                            </div>
                          ) : null}
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div className="grid min-w-0 gap-2">
                            <label
                              htmlFor="book-meeting-date"
                              className="text-[14px] leading-4 text-[#323232]"
                            >
                              Dagsetning (nauðsynlegt)
                            </label>
                            <div className="flex h-10 items-center rounded border border-[#e8eaee] bg-white">
                              <input
                                id="book-meeting-date"
                                type="date"
                                value={meetingDate}
                                onChange={(e) => setMeetingDate(e.target.value)}
                                className="h-full min-w-0 flex-1 rounded border-0 bg-transparent px-4 text-[16px] leading-[1.25] text-black outline-none focus-visible:ring-0"
                                aria-invalid={formTouched && !isDateValid}
                              />
                            </div>
                            {formTouched && !isDateValid ? (
                              <div className="text-[12px] leading-4 text-red-600">
                                Vinsamlegast veldu dagsetningu.
                              </div>
                            ) : null}
                          </div>
                          <div className="grid min-w-0 gap-2">
                            <label
                              htmlFor="book-meeting-time"
                              className="text-[14px] leading-4 text-[#323232]"
                            >
                              Tími (nauðsynlegt)
                            </label>
                            <div className="flex h-10 items-center rounded border border-[#e8eaee] bg-white">
                              <input
                                id="book-meeting-time"
                                type="time"
                                value={meetingTime}
                                onChange={(e) => setMeetingTime(e.target.value)}
                                className="h-full w-full rounded border-0 bg-transparent px-4 text-[16px] leading-[1.25] text-black outline-none focus-visible:ring-0"
                                aria-invalid={formTouched && !isTimeValid}
                              />
                            </div>
                            {formTouched && !isTimeValid ? (
                              <div className="text-[12px] leading-4 text-red-600">
                                Vinsamlegast veldu tíma.
                              </div>
                            ) : null}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div className="grid min-w-0 gap-2">
                            <label
                              htmlFor="book-meeting-location"
                              className="text-[14px] leading-4 text-[#323232]"
                            >
                              Staðsetning (valkvætt)
                            </label>
                            <input
                              id="book-meeting-location"
                              value={meetingLocation}
                              onChange={(e) => setMeetingLocation(e.target.value)}
                              className={BOOK_INPUT_CLASS}
                              placeholder="Staðsetning"
                            />
                          </div>
                          <div className="grid min-w-0 gap-2">
                            <label
                              htmlFor="book-meeting-type"
                              className="text-[14px] leading-4 text-[#323232]"
                            >
                              Fundartegund (nauðsynlegt)
                            </label>
                            <div className="relative">
                              <select
                                id="book-meeting-type"
                                value={meetingType}
                                onChange={(e) =>
                                  setMeetingType(e.target.value as MeetingTypeId | '')
                                }
                                className={cn(
                                  BOOK_INPUT_CLASS,
                                  'appearance-none pr-10',
                                  meetingType === '' ? 'text-[#666]' : 'text-black',
                                )}
                                aria-invalid={formTouched && !isTypeValid}
                              >
                                <option value="" disabled>
                                  Fundartegund
                                </option>
                                {MEETING_TYPES.map((t) => (
                                  <option key={t.id} value={t.id}>
                                    {t.label}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2 text-[#666]" />
                            </div>
                            {formTouched && !isTypeValid ? (
                              <div className="text-[12px] leading-4 text-red-600">
                                Vinsamlegast veldu fundartegund.
                              </div>
                            ) : null}
                          </div>
                        </div>

                        <div className="grid gap-2">
                          <label
                            htmlFor="book-meeting-description"
                            className="text-[14px] leading-4 text-black"
                          >
                            Lýsing fundar
                          </label>
                          <div className="relative rounded-lg border border-[#e5e5e5] bg-white px-4 pb-8 pt-2">
                            <textarea
                              id="book-meeting-description"
                              value={meetingDescription}
                              onChange={(e) =>
                                setMeetingDescription(e.target.value.slice(0, 500))
                              }
                              maxLength={500}
                              rows={5}
                              className="min-h-[120px] w-full resize-none border-0 bg-transparent p-0 text-[16px] leading-[1.5] text-black outline-none placeholder:text-[#666] focus-visible:ring-0"
                              placeholder="t.d. Umræða um viðhald á þaki, samþykkt fjárhagsáætlunar..."
                            />
                            <p className="absolute bottom-2 right-4 text-[12px] leading-4 text-[#b3b3b3]">
                              {meetingDescription.length}/500 stafir
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3">
                      <p className="text-[14px] font-medium leading-5 text-[rgba(0,0,0,0.87)]">
                        Tilkynningar
                      </p>
                      <div className="rounded bg-[#fbfbfc] p-6">
                        <div className="grid gap-4">
                          <p className="text-[14px] font-medium leading-5 text-[rgba(0,0,0,0.87)]">
                            Viltu senda fundarboð á íbúa Holtsgötu 24?
                          </p>
                          <div className="grid gap-4">
                            <BookFormCheckbox
                              id="book-notify-email"
                              label="Senda email"
                              checked={sendEmailNotification}
                              onCheckedChange={setSendEmailNotification}
                            />
                            <BookFormCheckbox
                              id="book-notify-app"
                              label="Senda tilkynningu í appið"
                              checked={sendInAppNotification}
                              onCheckedChange={setSendInAppNotification}
                            />
                            <BookFormCheckbox
                              id="book-notify-group"
                              label="Senda hópskilaboð"
                              checked={sendGroupMessage}
                              onCheckedChange={setSendGroupMessage}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3">
                      <p className="text-[14px] font-medium leading-5 text-[rgba(0,0,0,0.87)]">
                        Bæta við fundargerð
                      </p>
                      <label className="flex cursor-pointer flex-col items-center gap-1 rounded-lg border border-[#e5e5e5] bg-white px-[16px] pb-[24px] pt-[16px]">
                        <input
                          type="file"
                          accept="application/pdf"
                          className="sr-only"
                          onChange={(e) => setAgendaPdf(e.target.files?.[0] ?? null)}
                        />
                        <span className="flex items-center gap-1 rounded-full py-3 pl-3 pr-4 text-[16px] font-medium leading-6 text-[#18325a]">
                          <Upload className="size-5 shrink-0" aria-hidden />
                          Hlaða upp skrá
                        </span>
                        <span className="text-[14px] font-medium leading-5 text-[#666]">
                          eða dragðu hingað
                        </span>
                        {agendaPdf ? (
                          <span className="text-center text-[12px] text-[#323232]">{agendaPdf.name}</span>
                        ) : null}
                      </label>
                    </div>
                  </div>

                  <Button
                    type="button"
                    className="h-[52px] w-full shrink-0 rounded-md border-0 bg-[#18325a] px-8 text-[16px] font-bold leading-5 text-white hover:bg-[#162b47]"
                    onClick={handleBookMeeting}
                    disabled={!canSubmit && formTouched}
                  >
                    Bóka fund
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog
              open={isDetailsDialogOpen}
              onOpenChange={(open) => {
                setIsDetailsDialogOpen(open)
                if (!open) setSelectedMeetingId(null)
              }}
            >
              <DialogContent className="max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                  <DialogTitle className="text-[18px] font-bold leading-6 text-black">
                    Fundarupplýsingar
                  </DialogTitle>
                  <DialogDescription className="text-[14px] leading-5 text-[#666]">
                    Yfirlit yfir skráðar upplýsingar um fund.
                  </DialogDescription>
                </DialogHeader>

                <div className="mt-6 flex-1 overflow-y-auto pr-1">
                  {selectedMeeting ? (
                    <div className="grid gap-5 pb-1">
                      <div className="grid gap-1">
                        <div className="text-[12px] font-medium leading-4 text-[#666]">
                          Fundartitill
                        </div>
                        <div className="text-[16px] font-bold leading-5 text-black">
                          {selectedMeeting.title}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="grid gap-1">
                          <div className="text-[12px] font-medium leading-4 text-[#666]">
                            Dagsetning
                          </div>
                          <div className="text-[14px] font-medium leading-5 text-black">
                            {selectedMeeting.dateLabel}
                          </div>
                        </div>
                        <div className="grid gap-1">
                          <div className="text-[12px] font-medium leading-4 text-[#666]">
                            Tími
                          </div>
                          <div className="text-[14px] font-medium leading-5 text-black">
                            {selectedMeeting.time ? selectedMeeting.time : '—'}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="grid gap-1">
                          <div className="text-[12px] font-medium leading-4 text-[#666]">
                            Staðsetning
                          </div>
                          <div className="text-[14px] font-medium leading-5 text-black">
                            {selectedMeeting.location ? selectedMeeting.location : '—'}
                          </div>
                        </div>
                        <div className="grid gap-1">
                          <div className="text-[12px] font-medium leading-4 text-[#666]">
                            Fundartegund
                          </div>
                          <div className="text-[14px] font-medium leading-5 text-black">
                            {selectedMeetingTypeLabel ?? '—'}
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-1">
                        <div className="text-[12px] font-medium leading-4 text-[#666]">
                          Dagskrá / Lýsing
                        </div>
                        <div className="whitespace-pre-wrap text-[14px] leading-5 text-black">
                          {selectedMeeting.description ? selectedMeeting.description : '—'}
                        </div>
                      </div>

                      <div className="grid gap-1">
                        <div className="text-[12px] font-medium leading-4 text-[#666]">
                          Dagskrá (PDF)
                        </div>
                        <div className="text-[14px] leading-5 text-black">
                          {selectedMeeting.agendaPdfName ? selectedMeeting.agendaPdfName : '—'}
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <div className="text-[12px] font-medium leading-4 text-[#666]">
                          Þátttakendur
                        </div>
                        {selectedMeeting.participants.mode === 'all' ? (
                          <div className="text-[14px] leading-5 text-black">Allir íbúar</div>
                        ) : selectedMeeting.participants.customList &&
                          selectedMeeting.participants.customList.length > 0 ? (
                          <div className="grid gap-1">
                            {selectedMeeting.participants.customList.map((p) => (
                              <div
                                key={p.id}
                                className="flex items-center justify-between gap-3 rounded-md border border-[#f2f3f4] bg-white px-3 py-2"
                              >
                                <span className="min-w-0 flex-1 truncate text-[14px] leading-5 text-black">
                                  {p.name}
                                </span>
                                <span className="shrink-0 text-[12px] leading-4 text-[#666]">
                                  {p.apartmentName ?? '—'}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-[14px] leading-5 text-black">—</div>
                        )}
                      </div>

                      <div className="grid gap-2">
                        <div className="text-[12px] font-medium leading-4 text-[#666]">
                          Tilkynningar
                        </div>
                        {selectedMeeting.notifications.sendToAll ||
                        selectedMeeting.notifications.email ||
                        selectedMeeting.notifications.inApp ||
                        selectedMeeting.notifications.groupMessage ? (
                          <div className="flex flex-wrap gap-2">
                            {selectedMeeting.notifications.email ? (
                              <span className="inline-flex items-center rounded-full bg-[#f2f3f4] px-3 py-1 text-[12px] font-medium text-black">
                                Email
                              </span>
                            ) : null}
                            {selectedMeeting.notifications.inApp ? (
                              <span className="inline-flex items-center rounded-full bg-[#f2f3f4] px-3 py-1 text-[12px] font-medium text-black">
                                Í appi
                              </span>
                            ) : null}
                            {selectedMeeting.notifications.groupMessage ? (
                              <span className="inline-flex items-center rounded-full bg-[#f2f3f4] px-3 py-1 text-[12px] font-medium text-black">
                                Hópskilaboð
                              </span>
                            ) : null}
                          </div>
                        ) : (
                          <div className="text-[14px] leading-5 text-black">—</div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-[14px] leading-5 text-[#666]">Enginn fundur valinn.</div>
                  )}
                </div>

                <DialogFooter>
                  <DialogClose asChild>
                    <Button
                      variant="outline"
                      className="h-11 rounded-md border-[#e6e8e9] bg-white px-4 text-[14px] font-bold text-black"
                    >
                      Loka
                    </Button>
                  </DialogClose>
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
        <div className="grid h-11 grid-cols-[minmax(0,1fr)_244px_120px_140px_minmax(0,1fr)] items-center px-4">
          <div className="flex min-w-0 items-center px-3">
            <span className="text-[14px] font-medium leading-5 text-[#666]">
              Fundur
            </span>
          </div>
          <div className="flex min-w-0 items-center px-3">
            <span className="text-[14px] font-medium leading-5 text-[#666]">
              Dagsetning
            </span>
          </div>
          <div className="flex min-w-0 items-center px-3">
            <span className="text-[14px] font-medium leading-5 text-[#666]">
              Tími
            </span>
          </div>
          <div className="flex min-w-0 items-center px-3">
            <span className="text-[14px] font-medium leading-5 text-[#666]">
              Staða
            </span>
          </div>
          <div className="flex min-w-0 items-center justify-end px-3">
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
                className={cn(
                  'grid h-[76px] grid-cols-[minmax(0,1fr)_244px_120px_140px_minmax(0,1fr)] items-center rounded-lg px-4 py-4 cursor-pointer',
                  'bg-[rgba(242,243,244,0.3)]',
                  'hover:bg-[rgba(242,243,244,0.45)]',
                )}
                role="button"
                tabIndex={0}
                onClick={() => {
                  setSelectedMeetingId(meeting.id)
                  setIsDetailsDialogOpen(true)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setSelectedMeetingId(meeting.id)
                    setIsDetailsDialogOpen(true)
                  }
                }}
              >
                <div className="flex min-w-0 items-center px-3">
                  <span
                    className={cn(
                      'min-w-0 truncate text-[16px] font-medium leading-5',
                      meeting.status === 'past' ? 'text-[#666]' : 'text-black',
                    )}
                  >
                    {meeting.title}
                  </span>
                </div>
                <div
                  className={cn(
                    'flex min-w-0 items-center px-3 text-[16px] font-normal leading-5',
                    meeting.status === 'past' ? 'text-[#666]' : 'text-black',
                  )}
                >
                  {meeting.dateLabel}
                </div>
                <div
                  className={cn(
                    'flex min-w-0 items-center px-3 text-[16px] font-normal leading-5',
                    meeting.status === 'past' ? 'text-[#666]' : 'text-black',
                  )}
                >
                  {meeting.time ?? '—'}
                </div>
                <div className="flex min-w-0 items-center px-3">
                  {meeting.status === 'upcoming' ? (
                    <span className="inline-flex shrink-0 items-center justify-center gap-[6px] rounded-full bg-white px-2.5 py-1 text-[12px] font-medium uppercase leading-4 text-black">
                      <span className="h-[10px] w-[10px] rounded-full bg-[#F18F01]" aria-hidden="true" />
                      Væntanlegur
                    </span>
                  ) : (
                    <span className="inline-flex shrink-0 items-center rounded-full bg-[#f2f3f4] px-2.5 py-1 text-[12px] font-bold leading-4 text-[#666]">
                      Eldri
                    </span>
                  )}
                </div>
                <div className="flex min-w-0 items-center justify-end px-3">
                  {meeting.hasMinutes ? (
                    <button
                      type="button"
                      className={cn(
                        'inline-flex w-fit items-center gap-1.5 rounded-md px-4 py-2 text-[14px] font-normal leading-4 hover:underline',
                        meeting.status === 'past' ? 'text-[#666]' : 'text-black',
                      )}
                      onClick={(e) => e.stopPropagation()}
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
