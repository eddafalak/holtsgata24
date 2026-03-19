import { useMemo, useState } from 'react'
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
import { useResidents } from '@/hooks/useResidents'

const TABS = [
  { id: 'allir', label: 'Allir' },
  { id: 'vaentanlegt', label: 'Væntanlegt' },
  { id: 'eldri', label: 'Eldri' },
] as const

type MeetingStatus = 'upcoming' | 'past'

type MeetingParticipantSnapshot = { id: string; name: string; apartmentName: string | null }

type Meeting = {
  id: string
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
  notifications: { sendToAll: boolean; email: boolean; inApp: boolean }
}

const MOCK_MEETINGS: Meeting[] = [
  {
    id: '1',
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

export function MeetingsPage() {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]['id']>('allir')
  const [search, setSearch] = useState('')
  const [period] = useState('01.07.2025–01.10.2025')
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

  const [sendNotificationsToAll, setSendNotificationsToAll] = useState(true)
  const [sendEmailNotification, setSendEmailNotification] = useState(true)
  const [sendInAppNotification, setSendInAppNotification] = useState(true)

  const [participantsMode, setParticipantsMode] = useState<'all' | 'custom'>('all')
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<Set<string>>(
    () => new Set(),
  )
  const [formTouched, setFormTouched] = useState(false)

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
    setSendNotificationsToAll(true)
    setSendEmailNotification(true)
    setSendInAppNotification(true)
    setParticipantsMode('all')
    setSelectedParticipantIds(new Set())
    setFormTouched(false)
  }

  function toggleParticipant(id: string) {
    setSelectedParticipantIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
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
        dateLabel: formatMeetingDate(meetingDate),
        title: meetingTitle.trim(),
        hasMinutes: false,
        status: 'upcoming',
        time: meetingTime,
        location: meetingLocation.trim().length > 0 ? meetingLocation.trim() : null,
        meetingType: meetingType,
        description: meetingDescription.trim().length > 0 ? meetingDescription.trim() : null,
        agendaPdfName: agendaPdf?.name ?? null,
        participants: { mode: participantsMode, customList: selectedCustomList },
        notifications: {
          sendToAll: sendNotificationsToAll,
          email: sendEmailNotification,
          inApp: sendInAppNotification,
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

    return matchesTab && matchesSearch
  }).toSorted((a, b) => {
    const order: Record<MeetingStatus, number> = {
      upcoming: 0,
      past: 1,
    }
    return order[a.status] - order[b.status]
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
                  className="h-11 min-w-[44px] rounded-md bg-[#dfffb4] px-4 text-[14px] font-bold text-black hover:bg-[#cdf28c] border-0"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Bóka fund
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                  <DialogTitle className="text-[18px] font-bold leading-6 text-black">
                    Bóka fund
                  </DialogTitle>
                  <DialogDescription className="text-[14px] leading-5 text-[#666]">
                    Skráðu nýjan fund og vistaðu í fundalista.
                  </DialogDescription>
                </DialogHeader>

                <div className="mt-6 flex-1 overflow-y-auto pr-1">
                  <div className="grid gap-6 pb-1">
                  {/* BASIC INFO */}
                  <div className="grid gap-3">
                    <div className="text-[14px] font-bold leading-4 text-black">Grunnupplýsingar</div>

                    <div className="grid gap-2">
                      <label className="text-[14px] font-medium leading-4 text-[#666]">
                        Fundartitill <span className="text-[#a2a4a8]">(nauðsynlegt)</span>
                      </label>
                      <input
                        value={meetingTitle}
                        onChange={(e) => setMeetingTitle(e.target.value)}
                        className="h-11 rounded-md border border-[#e6e8e9] px-4 text-[14px] outline-none focus-visible:ring-2 focus-visible:ring-black/10"
                        placeholder='t.d. "Aðalfundur 2026"'
                        aria-invalid={formTouched && !isTitleValid}
                      />
                      {formTouched && !isTitleValid ? (
                        <div className="text-[12px] leading-4 text-red-600">
                          Vinsamlegast sláðu inn fundartitil.
                        </div>
                      ) : null}
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <div className="grid gap-2">
                        <label className="text-[14px] font-medium leading-4 text-[#666]">
                          Dagsetning <span className="text-[#a2a4a8]">(nauðsynlegt)</span>
                        </label>
                        <input
                          type="date"
                          value={meetingDate}
                          onChange={(e) => setMeetingDate(e.target.value)}
                          className="h-11 rounded-md border border-[#e6e8e9] px-4 text-[14px] outline-none focus-visible:ring-2 focus-visible:ring-black/10"
                          aria-invalid={formTouched && !isDateValid}
                        />
                        {formTouched && !isDateValid ? (
                          <div className="text-[12px] leading-4 text-red-600">
                            Vinsamlegast veldu dagsetningu.
                          </div>
                        ) : null}
                      </div>
                      <div className="grid gap-2">
                        <label className="text-[14px] font-medium leading-4 text-[#666]">
                          Tími <span className="text-[#a2a4a8]">(nauðsynlegt)</span>
                        </label>
                        <input
                          type="time"
                          value={meetingTime}
                          onChange={(e) => setMeetingTime(e.target.value)}
                          className="h-11 rounded-md border border-[#e6e8e9] px-4 text-[14px] outline-none focus-visible:ring-2 focus-visible:ring-black/10"
                          aria-invalid={formTouched && !isTimeValid}
                        />
                        {formTouched && !isTimeValid ? (
                          <div className="text-[12px] leading-4 text-red-600">
                            Vinsamlegast veldu tíma.
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <div className="grid gap-2">
                        <label className="text-[14px] font-medium leading-4 text-[#666]">
                          Staðsetning <span className="text-[#a2a4a8]">(valkvætt)</span>
                        </label>
                        <input
                          value={meetingLocation}
                          onChange={(e) => setMeetingLocation(e.target.value)}
                          className="h-11 rounded-md border border-[#e6e8e9] px-4 text-[14px] outline-none focus-visible:ring-2 focus-visible:ring-black/10"
                          placeholder='t.d. "Sameiginlegt rými" eða "Online (Zoom)"'
                        />
                      </div>

                      <div className="grid gap-2">
                        <label className="text-[14px] font-medium leading-4 text-[#666]">
                          Fundartegund <span className="text-[#a2a4a8]">(nauðsynlegt)</span>
                        </label>
                        <select
                          value={meetingType}
                          onChange={(e) => setMeetingType(e.target.value as MeetingTypeId)}
                          className="h-11 rounded-md border border-[#e6e8e9] bg-white px-4 text-[14px] outline-none focus-visible:ring-2 focus-visible:ring-black/10"
                          aria-invalid={formTouched && !isTypeValid}
                        >
                          <option value="" disabled>
                            Veldu tegund
                          </option>
                          {MEETING_TYPES.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.label}
                            </option>
                          ))}
                        </select>
                        {formTouched && !isTypeValid ? (
                          <div className="text-[12px] leading-4 text-red-600">
                            Vinsamlegast veldu fundartegund.
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {/* DETAILS */}
                  <div className="grid gap-3">
                    <div className="text-[14px] font-bold leading-4 text-black">Upplýsingar</div>

                    <div className="grid gap-2">
                      <label className="text-[14px] font-medium leading-4 text-[#666]">
                        Dagskrá / Lýsing
                      </label>
                      <textarea
                        value={meetingDescription}
                        onChange={(e) => setMeetingDescription(e.target.value)}
                        className="min-h-[104px] resize-none rounded-md border border-[#e6e8e9] px-4 py-3 text-[14px] outline-none focus-visible:ring-2 focus-visible:ring-black/10"
                        placeholder="t.d. Umræða um viðhald á þaki, samþykkt fjárhagsáætlunar..."
                      />
                    </div>

                    <div className="grid gap-2">
                      <label className="text-[14px] font-medium leading-4 text-[#666]">
                        Hlaða upp dagskrá <span className="text-[#a2a4a8]">(PDF, valkvætt)</span>
                      </label>
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => setAgendaPdf(e.target.files?.[0] ?? null)}
                        className="rounded-md border border-[#e6e8e9] bg-white px-4 py-3 text-[14px] outline-none"
                      />
                      {agendaPdf ? (
                        <div className="text-[12px] leading-4 text-[#666]">{agendaPdf.name}</div>
                      ) : null}
                    </div>
                  </div>

                  {/* PARTICIPANTS */}
                  <div className="grid gap-3">
                    <div className="text-[14px] font-bold leading-4 text-black">Þátttakendur</div>

                    <div className="grid gap-2">
                      <label className="text-[14px] font-medium leading-4 text-[#666]">
                        Veldu þátttakendur
                      </label>
                      <div className="flex flex-col gap-2 rounded-md border border-[#e6e8e9] bg-white p-3">
                        <label className="flex items-center gap-2 text-[14px] leading-5 text-black">
                          <input
                            type="radio"
                            name="participantsMode"
                            checked={participantsMode === 'all'}
                            onChange={() => setParticipantsMode('all')}
                          />
                          Allir íbúar (sjálfgefið)
                        </label>
                        <label className="flex items-center gap-2 text-[14px] leading-5 text-black">
                          <input
                            type="radio"
                            name="participantsMode"
                            checked={participantsMode === 'custom'}
                            onChange={() => setParticipantsMode('custom')}
                          />
                          Velja handvirkt
                        </label>

                        {participantsMode === 'custom' ? (
                          <div className="mt-2 max-h-[180px] overflow-auto rounded-md border border-[#f2f3f4] p-2">
                            {allResidents.length === 0 ? (
                              <div className="px-2 py-2 text-[14px] leading-5 text-[#666]">
                                Engir íbúar fundust.
                              </div>
                            ) : (
                              <div className="grid gap-1">
                                {allResidents.map((r) => (
                                  <label
                                    key={r.id}
                                    className="flex items-center justify-between gap-3 rounded-md px-2 py-2 text-[14px] leading-5 hover:bg-[#f7f8f9]"
                                  >
                                    <span className="min-w-0 flex-1 truncate text-black">
                                      {r.name}
                                    </span>
                                    <span className="shrink-0 text-[12px] leading-4 text-[#666]">
                                      {r.apartmentName ?? '—'}
                                    </span>
                                    <input
                                      type="checkbox"
                                      checked={selectedParticipantIds.has(r.id)}
                                      onChange={() => toggleParticipant(r.id)}
                                    />
                                  </label>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {/* NOTIFICATIONS */}
                  <div className="grid gap-3">
                    <div className="text-[14px] font-bold leading-4 text-black">Tilkynningar</div>

                    <div className="grid gap-2 rounded-md border border-[#e6e8e9] bg-white p-3">
                      <label className="flex items-center justify-between gap-3 text-[14px] leading-5 text-black">
                        <span className="min-w-0 flex-1">
                          Senda tilkynningu til allra{' '}
                          <span className="text-[#666]">(Email + in-app)</span>
                        </span>
                        <input
                          type="checkbox"
                          checked={sendNotificationsToAll}
                          onChange={(e) => setSendNotificationsToAll(e.target.checked)}
                        />
                      </label>

                      {sendNotificationsToAll ? (
                        <div className="mt-1 grid gap-2 pl-1">
                          <label className="flex items-center gap-2 text-[14px] leading-5 text-black">
                            <input
                              type="checkbox"
                              checked={sendEmailNotification}
                              onChange={(e) => setSendEmailNotification(e.target.checked)}
                            />
                            Senda email
                          </label>
                          <label className="flex items-center gap-2 text-[14px] leading-5 text-black">
                            <input
                              type="checkbox"
                              checked={sendInAppNotification}
                              onChange={(e) => setSendInAppNotification(e.target.checked)}
                            />
                            Senda in-app tilkynningu
                          </label>
                        </div>
                      ) : null}
                    </div>
                  </div>
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
                  <Button
                    className="h-11 rounded-md bg-[#18325a] px-4 text-[14px] font-bold text-white hover:bg-[#142a4b]"
                    onClick={handleBookMeeting}
                    disabled={!canSubmit && formTouched}
                  >
                    Bóka fund
                  </Button>
                </DialogFooter>
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
                        {selectedMeeting.notifications.sendToAll ? (
                          <div className="flex flex-wrap gap-2">
                            <span className="inline-flex items-center rounded-full bg-[#f2f3f4] px-3 py-1 text-[12px] font-medium text-black">
                              Til allra
                            </span>
                            {selectedMeeting.notifications.email ? (
                              <span className="inline-flex items-center rounded-full bg-[#f2f3f4] px-3 py-1 text-[12px] font-medium text-black">
                                Email
                              </span>
                            ) : null}
                            {selectedMeeting.notifications.inApp ? (
                              <span className="inline-flex items-center rounded-full bg-[#f2f3f4] px-3 py-1 text-[12px] font-medium text-black">
                                In-app
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
                className={cn(
                  'flex h-[76px] items-center rounded-lg px-4 py-4 cursor-pointer',
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
                <div className="w-[244px] shrink-0 px-3 text-[16px] font-normal leading-5 text-black">
                  {meeting.dateLabel}
                </div>
                <div className="min-w-0 flex-1 px-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="min-w-0 truncate text-[16px] font-medium leading-5 text-black">
                      {meeting.title}
                    </span>
                    {meeting.status === 'upcoming' ? (
                      <span className="inline-flex shrink-0 items-center rounded-full bg-[#dfffb4] px-2.5 py-1 text-[12px] font-bold leading-4 text-black">
                        Væntanlegur
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="flex min-w-0 flex-1 justify-end px-0">
                  {meeting.hasMinutes ? (
                    <button
                      type="button"
                      className="inline-flex w-fit items-center gap-1.5 rounded-md px-4 py-2 text-[14px] font-bold leading-4 text-black hover:underline"
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
