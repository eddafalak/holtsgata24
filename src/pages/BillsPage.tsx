import { useEffect, useMemo, useState } from 'react'
import { is as isISLocale } from 'date-fns/locale'
import type { DateRange } from 'react-day-picker'
import { CalendarDays, ChevronDown, ChevronRight, Download, Plus, Search, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/hooks/useAuth'
import { useResidents } from '@/hooks/useResidents'
import {
  extractPdfText,
  parseAmountIskFromText,
  parseBillStatusFromText,
  parseDueDateIsoFromText,
  parseFirstDateIsoFromText,
} from '@/lib/pdfExtract'
import { cn } from '@/lib/utils'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import type { BillCategory } from '@/types'

/** Samsvarandi Figma: húsfélag — Content (192:2965), reikningayfirlit. */


type BillStatus = 'ogreitt' | 'greitt'
type UploadTypeOption = 'reikningur' | 'tilbod' | 'teikning' | 'skyrsla' | 'annad'

type MockBillRow = {
  id: string
  kind: 'reikningur' | 'skjal'
  title: string
  category: BillCategory
  dateISO: string
  dueDateISO: string | null
  status: BillStatus
  amountIsk: number | null
  fileUrl?: string | null
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
    dateISO: '2025-10-01',
    dueDateISO: '2025-10-01',
    status: 'ogreitt',
    amountIsk: 37334,
  },
  {
    id: 'f2',
    kind: 'reikningur',
    title: 'Gluggaskipti',
    category: 'vidhald',
    dateISO: '2025-10-01',
    dueDateISO: '2025-10-01',
    status: 'greitt',
    amountIsk: 25123,
  },
  {
    id: 'f3',
    kind: 'reikningur',
    title: 'Gluggaskipti',
    category: 'vidhald',
    dateISO: '2025-10-01',
    dueDateISO: '2025-10-01',
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
    status: 'ogreitt',
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

function sanitizeStorageFileName(fileName: string) {
  // Supabase Storage object keys can reject non-ASCII/special characters.
  // We generate a safe ASCII slug while keeping the extension.
  const name = fileName.trim()
  const lastDot = name.lastIndexOf('.')
  const base = lastDot > 0 ? name.slice(0, lastDot) : name
  const ext = lastDot > 0 ? name.slice(lastDot + 1) : ''

  const icelandicMap: Record<string, string> = {
    á: 'a',
    Á: 'A',
    é: 'e',
    É: 'E',
    í: 'i',
    Í: 'I',
    ó: 'o',
    Ó: 'O',
    ú: 'u',
    Ú: 'U',
    ý: 'y',
    Ý: 'Y',
    æ: 'ae',
    Æ: 'Ae',
    ö: 'o',
    Ö: 'O',
    ð: 'd',
    Ð: 'D',
    þ: 'th',
    Þ: 'Th',
  }

  const replaceIcelandic = (s: string) =>
    s.replace(/[áÁéÉíÍóÓúÚýÝæÆöÖðÐþÞ]/g, (m) => icelandicMap[m] ?? m)

  const safeBase = replaceIcelandic(base)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '_')

  const safeExt = ext ? replaceIcelandic(ext).replace(/[^a-zA-Z0-9]+/g, '') : ''
  return safeExt ? `${safeBase}.${safeExt}` : safeBase
}

function storageObjectPathFromPublicUrl(bucket: string, publicUrl: string): string | null {
  // Supabase public URL format:
  // `${supabaseUrl}/storage/v1/object/public/<bucket>/<objectPath>`
  const marker = `/storage/v1/object/public/${bucket}/`
  const idx = publicUrl.indexOf(marker)
  if (idx === -1) return null
  return publicUrl.slice(idx + marker.length)
}

function parseSizeM2(value: unknown): number {
  if (typeof value === 'number' && !Number.isNaN(value)) return value
  const n = Number.parseFloat(String(value))
  return Number.isNaN(n) ? 0 : n
}

export function BillsPage() {
  const [search, setSearch] = useState('')

  type BillsTypeFilter = 'reikningur' | 'tilbod' | 'skyrsla' | 'annad'
  const [typeFilter, setTypeFilter] = useState<BillsTypeFilter>('reikningur')

  const { user, profile } = useAuth()
  const userId = user?.id
  const { data: apartmentsWithResidents } = useResidents()

  const [billRows, setBillRows] = useState<MockBillRow[]>(MOCK_ROWS)

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  /** Sjálfgefið tímabil nær yfir október svo sýnishorn (01.10.2025) birtist. */
  const [startDateISO, setStartDateISO] = useState('2025-07-01')
  const [endDateISO, setEndDateISO] = useState('2025-10-01')
  const [draftStartISO, setDraftStartISO] = useState('2025-07-01')
  const [draftEndISO, setDraftEndISO] = useState('2025-10-01')

  function handleDatePickerOpenChange(open: boolean) {
    setIsDatePickerOpen(open)
    if (open) {
      setDraftStartISO(startDateISO)
      setDraftEndISO(endDateISO)
    }
  }

  function mapSupabaseBillToRow(dbBill: unknown): MockBillRow {
    const b = dbBill as {
      id?: unknown
      kind?: unknown
      name?: unknown
      category?: unknown
      date?: unknown
      due_date?: unknown
      status?: unknown
      amount?: unknown
      file_url?: unknown
    }

    const rawStatus = b.status == null ? null : String(b.status)
    const normalizedStatus: BillStatus =
      rawStatus === 'vinnsla' ? 'ogreitt' : rawStatus === 'ogreitt' ? 'ogreitt' : 'greitt'

    return {
      id: String(b.id),
      kind: (b.kind ?? 'skjal') as MockBillRow['kind'],
      title: String(b.name ?? 'Nafn'),
      category: (b.category ?? 'annad') as BillCategory,
      dateISO: String(b.date),
      dueDateISO: b.due_date ? String(b.due_date) : null,
      status: normalizedStatus,
      amountIsk: b.amount == null ? null : Number(b.amount),
      fileUrl: b.file_url ? String(b.file_url) : null,
    }
  }

  useEffect(() => {
    let cancelled = false
    async function fetchBills() {
      if (!isSupabaseConfigured()) return
      if (!userId) return

      try {
        const { data, error } = await supabase
          .from('bills')
          .select('*')
          .order('date', { ascending: false })
          .limit(200)

        if (error) throw error
        if (cancelled) return

        setBillRows((data ?? []).map(mapSupabaseBillToRow))
      } catch (e) {
        console.error('[bills] fetchBills failed:', e)
      } finally {
        // no-op: keep UI simple; bill list updates via state
      }
    }

    void fetchBills()
    return () => {
      cancelled = true
    }
  }, [userId])

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase()
    return billRows.filter((row) => {
      if (!inRange(row.dateISO, startDateISO, endDateISO)) return false
      if (q && !row.title.toLowerCase().includes(q)) return false
      // We only store two kinds in DB (reikningur/skjal). UI filter maps:
      // - Reikningur => reikningur
      // - Tilboð/Skýrsla/Annað => skjal
      if (typeFilter === 'reikningur' && row.kind !== 'reikningur') return false
      if (typeFilter !== 'reikningur' && row.kind !== 'skjal') return false
      return true
    }).toSorted((a, b) => rowDateTime(b.dateISO) - rowDateTime(a.dateISO))
  }, [endDateISO, search, startDateISO, billRows, typeFilter])

  function kindTagLabel(kind: MockBillRow['kind']) {
    return kind === 'reikningur' ? 'REIKNINGUR' : 'SKJÖL'
  }

  const ownershipRatio = useMemo(() => {
    const apts = apartmentsWithResidents ?? []
    const totalBuildingM2 = apts.reduce((sum, apt) => sum + parseSizeM2(apt.size), 0)
    if (totalBuildingM2 <= 0) return null

    const userApartmentSize = apts.find((apt) => apt.id === profile?.apartment_id)?.size
    const userApartmentM2 = parseSizeM2(userApartmentSize)
    if (userApartmentM2 <= 0) return null

    return userApartmentM2 / totalBuildingM2
  }, [apartmentsWithResidents, profile?.apartment_id])

  const stats = useMemo(() => {
    // Stats should follow the selected date filter (so totals match what the table is showing),
    // not the current system month/year.
    const base = endDateISO ? new Date(`${endDateISO}T00:00:00`) : new Date()
    const y = base.getFullYear()
    const bills = billRows.filter((r) => r.kind === 'reikningur' && r.amountIsk != null)

    const yearTotal = bills
      .filter((r) => {
        const dt = new Date(`${r.dateISO}T00:00:00`)
        return dt.getFullYear() === y
      })
      .reduce((s, r) => s + (r.amountIsk ?? 0), 0)

    const yourShare =
      ownershipRatio != null ? Math.round(yearTotal * ownershipRatio) : APARTMENT_COUNT > 0 ? Math.round(yearTotal / APARTMENT_COUNT) : 0
    // Highlighted card should only show for the *current system month* when that month
    // falls inside the selected date range.
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()

    const rangeStart = startDateISO ? new Date(`${startDateISO}T00:00:00`) : null
    const rangeEnd = endDateISO ? new Date(`${endDateISO}T00:00:00`) : null
    const currentMonthStart = new Date(currentYear, currentMonth, 1)
    const currentMonthEnd = new Date(currentYear, currentMonth + 1, 0)

    const fitsCurrentMonth =
      rangeStart && rangeEnd ? currentMonthEnd >= rangeStart && currentMonthStart <= rangeEnd : true

    // Highlighted card should be based on the *due date* (gjalddagi),
    // not the bill issue date.
    const currentMonthTotal = bills
      .filter((r) => {
        if (!r.dueDateISO) return false
        const dt = new Date(`${r.dueDateISO}T00:00:00`)
        return dt.getFullYear() === currentYear && dt.getMonth() === currentMonth
      })
      .reduce((s, r) => s + (r.amountIsk ?? 0), 0)

    const monthTotal = fitsCurrentMonth ? currentMonthTotal : 0
    const yourMonthShare = fitsCurrentMonth ? currentMonthTotal : 0

    return { monthTotal, yearTotal, yourShare, yourMonthShare }
  }, [billRows, endDateISO, ownershipRatio, startDateISO])

  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [uploadKind, setUploadKind] = useState<MockBillRow['kind']>('reikningur')
  const [uploadTypeOption, setUploadTypeOption] = useState<UploadTypeOption>('reikningur')
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadAmountIsk, setUploadAmountIsk] = useState<string>('')
  const [uploadStatus, setUploadStatus] = useState<BillStatus>('ogreitt')
  const [uploadTitle, setUploadTitle] = useState<string>('')
  const [uploadDateISO, setUploadDateISO] = useState<string>(endDateISO)
  const [uploadDueDateISO, setUploadDueDateISO] = useState<string | null>(endDateISO)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isExtractingPdf, setIsExtractingPdf] = useState(false)
  const [pdfExtractionError, setPdfExtractionError] = useState<string | null>(null)

  const [userEditedAmount, setUserEditedAmount] = useState(false)
  const [userChangedStatus, setUserChangedStatus] = useState(false)
  const [userEditedDateISO, setUserEditedDateISO] = useState(false)
  const [userEditedDueDateISO, setUserEditedDueDateISO] = useState(false)

  const [isBillDetailsOpen, setIsBillDetailsOpen] = useState(false)
  const [selectedBill, setSelectedBill] = useState<MockBillRow | null>(null)
  const [isDeletingBillId, setIsDeletingBillId] = useState<string | null>(null)
  const [isSavingBill, setIsSavingBill] = useState(false)
  const [billEditError, setBillEditError] = useState<string | null>(null)

  const [editKind, setEditKind] = useState<MockBillRow['kind']>('reikningur')
  const [editTitle, setEditTitle] = useState('')
  const [editDateISO, setEditDateISO] = useState(endDateISO)
  const [editDueDateISO, setEditDueDateISO] = useState<string | null>(endDateISO)
  const [editStatus, setEditStatus] = useState<BillStatus>('ogreitt')
  const [editAmountIsk, setEditAmountIsk] = useState<string>('')
  const [editAttachmentFile, setEditAttachmentFile] = useState<File | null>(null)

  useEffect(() => {
    if (!selectedBill) return
    setBillEditError(null)
    setEditKind(selectedBill.kind)
    setEditTitle(selectedBill.title)
    setEditDateISO(selectedBill.dateISO)
    setEditDueDateISO(selectedBill.dueDateISO)
    setEditStatus(selectedBill.status)
    setEditAmountIsk(selectedBill.amountIsk != null ? String(selectedBill.amountIsk) : '')
    setEditAttachmentFile(null)
  }, [selectedBill])

  async function handleDeleteBill(bill: MockBillRow) {
    const confirmed = window.confirm(`Eyða færslu: "${bill.title}"?`)
    if (!confirmed) return

    setIsDeletingBillId(bill.id)
    setUploadError(null)
    try {
      // Best-effort delete PDF from Storage.
      if (bill.fileUrl) {
        const objectPath = storageObjectPathFromPublicUrl('bills', bill.fileUrl)
        if (objectPath) {
          try {
            await supabase.storage.from('bills').remove([objectPath])
          } catch (e) {
            console.error('[bills] storage remove failed (continuing):', e)
          }
        }
      }

      const { error: deleteErr } = await supabase.from('bills').delete().eq('id', bill.id)
      if (deleteErr) throw deleteErr

      setBillRows((prev) => prev.filter((r) => r.id !== bill.id))

      if (selectedBill?.id === bill.id) setIsBillDetailsOpen(false)
      setSelectedBill(null)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      setUploadError(msg)
    } finally {
      setIsDeletingBillId(null)
    }
  }

  function resetUploadForm() {
    setUploadKind('reikningur')
    setUploadTypeOption('reikningur')
    setUploadFile(null)
    setUploadAmountIsk('')
    setUploadStatus('ogreitt')
    setUploadTitle('')
    setUploadDateISO(endDateISO)
    setUploadDueDateISO(endDateISO)
    setIsUploading(false)
    setUploadError(null)
    setIsExtractingPdf(false)
    setPdfExtractionError(null)
    setUserEditedAmount(false)
    setUserChangedStatus(false)
    setUserEditedDateISO(false)
    setUserEditedDueDateISO(false)
  }

  const parsedUploadAmountIsk = uploadAmountIsk.trim().length > 0 ? Number(uploadAmountIsk) : null
  const canSubmitUpload =
    Boolean(uploadFile) &&
    Boolean(uploadDateISO) &&
    (uploadKind === 'skjal' ||
      (parsedUploadAmountIsk != null && Number.isFinite(parsedUploadAmountIsk) && parsedUploadAmountIsk >= 0))

  useEffect(() => {
    let cancelled = false
    async function runExtract() {
      if (!uploadFile) return

      setIsExtractingPdf(true)
      setPdfExtractionError(null)

      try {
        const text = await extractPdfText(uploadFile, 6)
        if (cancelled) return

        const parsedAmount = parseAmountIskFromText(text)
        const parsedStatus = parseBillStatusFromText(text)
        const parsedDue = parseDueDateIsoFromText(text)
        const parsedFirstDate = parseFirstDateIsoFromText(text)

        if (!userEditedDateISO && parsedFirstDate != null) {
          setUploadDateISO(parsedFirstDate)
        }

        if (uploadKind === 'reikningur') {
          if (!userEditedAmount && parsedAmount != null) {
            setUploadAmountIsk(String(parsedAmount))
          }
          if (!userChangedStatus && parsedStatus != null) {
            setUploadStatus(parsedStatus)
          }
          if (!userEditedDueDateISO && parsedDue != null) {
            setUploadDueDateISO(parsedDue)
          }
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        if (!cancelled) setPdfExtractionError(msg)
      } finally {
        if (!cancelled) setIsExtractingPdf(false)
      }
    }

    void runExtract()
    return () => {
      cancelled = true
    }
  }, [
    uploadFile,
    uploadKind,
    userChangedStatus,
    userEditedAmount,
    userEditedDateISO,
    userEditedDueDateISO,
  ])

  return (
    <div className="flex flex-col gap-4">
      {/* Yfirkort — Figma CardInfo */}
      <div className="grid gap-4 md:grid-cols-4">
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
          className="flex h-full flex-col justify-between overflow-hidden rounded-lg bg-white p-6"
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
          className="flex h-full flex-col justify-between overflow-hidden rounded-lg bg-white p-6"
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

        <div
          className="flex h-full flex-col justify-between overflow-hidden rounded-lg bg-[#DFFFB4] p-6"
          style={{ boxShadow: statCardShadow }}
        >
          <p className="text-[16px] font-normal leading-5 text-[#666]">
            Heildarkostnaðurinn þinn
          </p>
          <div className="flex items-baseline gap-3 text-[#323232]">
            <span className="text-[36px] font-bold leading-[48px]">
              {new Intl.NumberFormat('is-IS', { maximumFractionDigits: 0 }).format(stats.yourMonthShare)}
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
        <div className="flex flex-col gap-6">
          <div className="flex w-full flex-col gap-2">
            <span className="text-[14px] font-medium leading-4 text-[#666]">Leit</span>
            <div className="flex min-h-[44px] w-full items-center gap-3 rounded-[6px] border border-[#e6e8e9] bg-white px-4 py-3">
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

          <div className="flex w-full flex-wrap items-end justify-between gap-3">
            <div className="flex min-w-0 flex-1 flex-wrap items-end gap-3">
              <div className="flex w-[280px] max-w-full flex-col gap-2">
                <span className="text-[14px] font-medium leading-4 text-[#666]">Veldu tegund</span>
                <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as BillsTypeFilter)}>
                  <SelectTrigger className="min-h-[44px] w-full rounded-[6px] border border-[#e6e8e9] bg-white px-4 py-3 text-[14px] font-bold leading-4 text-black">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reikningur">Reikningur</SelectItem>
                    <SelectItem value="tilbod">Tilboð</SelectItem>
                    <SelectItem value="skyrsla">Skýrsla</SelectItem>
                    <SelectItem value="annad">Annað</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex w-[280px] max-w-full flex-col gap-2">
                <span className="text-[14px] font-medium leading-4 text-[#666]">Tímabil</span>
                <Popover open={isDatePickerOpen} onOpenChange={handleDatePickerOpenChange}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="flex min-h-[44px] w-full items-center gap-3 rounded-[8px] border border-[#e6e8e9] bg-white px-4 py-3"
                    >
                      <span className="flex-1 text-[14px] font-bold leading-4 text-black">
                        {startDateISO && endDateISO ? formatRangeDisplay(startDateISO, endDateISO) : 'Veldu tímabil'}
                      </span>
                      <ChevronDown className="h-4 w-4 shrink-0 text-[#666]" />
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
                        onClick={() => {
                          setDraftStartISO('')
                          setDraftEndISO('')
                          setStartDateISO('')
                          setEndDateISO('')
                          setIsDatePickerOpen(false)
                        }}
                      >
                        Hreinsa
                      </Button>
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

            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-[8px] border border-[#d7e2f1] bg-white px-4 text-[14px] font-bold text-black hover:bg-black/[0.03]"
                onClick={() => {
                  const rows = filteredRows
                  const header = ['Titill', 'Tegund', 'Dagsetning', 'Staða', 'Upphæð', 'PDF URL']
                  const csv = [
                    header,
                    ...rows.map((r) => [
                      r.title,
                      r.kind,
                      r.dateISO,
                      r.status,
                      r.amountIsk ?? '',
                      r.fileUrl ?? '',
                    ]),
                  ]
                    .map((line) => line.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(','))
                    .join('\n')

                  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `reikningar-${new Date().toISOString().slice(0, 10)}.csv`
                  a.click()
                  URL.revokeObjectURL(url)
                }}
              >
                <Download className="mr-2 h-4 w-4" />
                Sækja gögn
              </Button>
              <Dialog
            open={isUploadDialogOpen}
            onOpenChange={(open) => {
              setIsUploadDialogOpen(open)
              if (!open) resetUploadForm()
            }}
          >
            <DialogTrigger asChild>
              <Button
                type="button"
                className="h-11 shrink-0 rounded-md border-0 bg-[#18325a] px-6 text-[16px] font-bold text-white hover:bg-[#162b47]"
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Hlaða upp reikning
              </Button>
            </DialogTrigger>

            <DialogContent side="right" className="flex flex-col gap-4 overflow-hidden">
              <div className="flex items-center gap-[24px]">
                <div className="flex-1 text-[18px] font-medium leading-[1.333] text-[#323232]">
                  Hlaða upp
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                <div className="flex flex-col gap-4">
                  <div className="rounded-[4px] bg-[#fbfbfc] p-6 flex flex-col gap-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <label className="text-[14px] leading-4 text-[#323232]">Tegund</label>
                      <Select
                        value={uploadTypeOption}
                        onValueChange={(v) => {
                          const next = v as UploadTypeOption
                          setUploadTypeOption(next)
                          setUploadKind(next === 'reikningur' ? 'reikningur' : 'skjal')
                        }}
                      >
                        <SelectTrigger className="h-10 w-full rounded-[4px] border border-[#e8eaee] bg-white px-4 text-[16px] text-[#666]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="reikningur">Reikningur</SelectItem>
                          <SelectItem value="tilbod">Tilboð</SelectItem>
                          <SelectItem value="teikning">Teikning</SelectItem>
                          <SelectItem value="skyrsla">Skýrsla</SelectItem>
                          <SelectItem value="annad">Annað</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <label className="text-[14px] leading-4 text-[#323232]">Staða</label>
                      <Select
                        value={uploadStatus}
                        onValueChange={(v) => {
                          setUploadStatus(v as BillStatus)
                          setUserChangedStatus(true)
                        }}
                      >
                        <SelectTrigger className="h-10 w-full rounded-[4px] border border-[#e8eaee] bg-white px-4 text-[16px] text-[#666]">
                          <SelectValue />
                        </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="greitt">Greitt</SelectItem>
                        <SelectItem value="ogreitt">Ógreitt</SelectItem>
                      </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <p className="text-[14px] font-medium leading-5 text-[rgba(0,0,0,0.87)]">
                      Bæta við fundargerð
                    </p>
                    <label className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-[#e5e5e5] bg-white px-[16px] pb-[24px] pt-[16px]">
                      <input
                        type="file"
                        accept="application/pdf"
                        className="sr-only"
                        onChange={(e) => {
                          const f = e.target.files?.[0] ?? null
                          setUploadFile(f)
                          setUploadTitle(f ? f.name.replace(/\.pdf$/i, '') : '')
                          setUploadDateISO(endDateISO)
                          setUploadDueDateISO(endDateISO)
                          setUserEditedDateISO(false)
                          setUserEditedDueDateISO(false)
                        }}
                      />
                      <span className="flex items-center gap-1 rounded-full py-3 pl-3 pr-4 text-[16px] font-medium leading-6 text-[#18325a]">
                        <Upload className="size-5 shrink-0" aria-hidden />
                        Upload a file
                      </span>
                      <span className="text-[14px] font-medium leading-5 text-[#666]">
                        or drag and drop here
                      </span>
                      {uploadFile ? (
                        <span className="text-center text-[12px] text-[#323232]">{uploadFile.name}</span>
                      ) : null}
                      {isExtractingPdf ? (
                        <span className="text-center text-[12px] text-[#666]">Lese PDF...</span>
                      ) : null}
                    </label>
                  </div>

                  <div className="grid gap-2">
                    <label className="text-[14px] leading-4 text-[#323232]" htmlFor="upload-title">
                      Titill
                    </label>
                    <div className="h-10 rounded-[4px] border border-[#e8eaee] bg-white px-4 flex items-center">
                      <input
                        id="upload-title"
                        type="text"
                        value={uploadTitle}
                        onChange={(e) => setUploadTitle(e.target.value)}
                        className="w-full border-0 bg-transparent text-[16px] leading-[1.25] text-black outline-none"
                        placeholder="T.d Tilboð nr 1"
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <label className="text-[14px] leading-4 text-[#323232]" htmlFor="upload-date">
                      Dagsetning
                    </label>
                    <div className="h-10 rounded-[4px] border border-[#e8eaee] bg-white px-4 flex items-center gap-3">
                      <CalendarDays className="h-5 w-5 text-[#18325a]" aria-hidden />
                      <input
                        id="upload-date"
                        type="date"
                        value={uploadDateISO}
                        onChange={(e) => {
                          setUploadDateISO(e.target.value)
                          setUserEditedDateISO(true)
                        }}
                        className="w-full border-0 bg-transparent text-[16px] leading-[1.25] text-black outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <label className="text-[14px] leading-4 text-[#323232]" htmlFor="upload-amount">
                      Upphæð (ISK)
                    </label>
                    <div className="h-10 rounded-[4px] border border-[#e8eaee] bg-white px-4 flex items-center">
                      <input
                        id="upload-amount"
                        inputMode="numeric"
                        type="number"
                        value={uploadAmountIsk}
                        onChange={(e) => {
                          setUploadAmountIsk(e.target.value)
                          setUserEditedAmount(true)
                        }}
                        className="w-full border-0 bg-transparent text-[16px] leading-[1.25] text-black outline-none"
                        placeholder="T.d 204000"
                      />
                    </div>
                  </div>

                  {/* Staða moved next to Tegund */}
                </div>

                {pdfExtractionError ? (
                  <div className="text-[12px] leading-4 text-red-600">
                    PDF úrvinnsla mistókst. Þú getur samt fyllt út handvirkt: {pdfExtractionError}
                  </div>
                ) : null}

                {uploadError ? (
                  <div className="text-[12px] leading-4 text-red-600">{uploadError}</div>
                ) : null}
              </div>

              <div className="border-t border-[#f2f3f4] pt-4">
                <Button
                  type="button"
                  className="h-[52px] w-full rounded-[8px] border-0 bg-[#18325a] px-8 text-[16px] font-bold leading-5 text-white hover:bg-[#162b47]"
                  disabled={!canSubmitUpload || isUploading}
                  onClick={async () => {
                      if (!user?.id) {
                        setUploadError('Þú þarft að vera innskráður til að vista reikning.')
                        return
                      }
                      if (!uploadFile) return

                      setIsUploading(true)
                      setUploadError(null)

                      try {
                        const todayISO = dateToISODateLocal(new Date())
                        const dateISO = uploadDateISO || endDateISO || todayISO
                        const dueDateISO =
                          uploadKind === 'reikningur' ? uploadDueDateISO ?? dateISO : null

                        const trimmedTitle =
                          uploadTitle.trim() ||
                          uploadFile.name.replace(/\.pdf$/i, '') ||
                          (uploadKind === 'reikningur' ? 'Nýr reikningur' : 'Nýtt skjal')

                        const safeFileName = sanitizeStorageFileName(uploadFile.name)
                        const storagePath = `${user.id}/${uploadKind}/${Date.now()}-${safeFileName}`

                        const { error: storageErr } = await supabase.storage
                          .from('bills')
                          .upload(storagePath, uploadFile, {
                            contentType: 'application/pdf',
                            upsert: false,
                          })

                        if (storageErr) throw storageErr

                        const { data: publicUrlData } = supabase.storage
                          .from('bills')
                          .getPublicUrl(storagePath)

                        const publicUrl = publicUrlData.publicUrl

                        const payload = {
                          kind: uploadKind,
                          name: trimmedTitle,
                          category: 'annad' as const,
                          amount: uploadKind === 'reikningur' ? parsedUploadAmountIsk : null,
                          date: dateISO,
                          due_date: dueDateISO,
                          status: uploadKind === 'reikningur' ? uploadStatus : 'greitt',
                          file_url: publicUrl,
                          description: null,
                          uploaded_by: user.id,
                        }

                        const { data: inserted, error: insertErr } = await supabase
                          .from('bills')
                          .insert(payload)
                          .select('*')
                          .single()

                        if (insertErr) throw insertErr

                        const insertedId = (inserted as { id?: unknown } | null)?.id

                        // Optimistic update to ensure the table reflects exactly what the user entered.
                        const optimisticRow: MockBillRow = {
                          id: insertedId ? String(insertedId) : `local-${Date.now()}`,
                          kind: uploadKind,
                          title: trimmedTitle,
                          category: 'annad',
                          dateISO: dateISO,
                          dueDateISO: uploadKind === 'reikningur' ? dueDateISO : null,
                          status: uploadKind === 'reikningur' ? uploadStatus : 'greitt',
                          amountIsk: uploadKind === 'reikningur' ? parsedUploadAmountIsk : null,
                          fileUrl: publicUrl,
                        }

                        setBillRows((prev) => [optimisticRow, ...prev])
                        setIsUploadDialogOpen(false)
                        resetUploadForm()
                      } catch (e) {
                        console.error('[bills] upload failed:', e)
                        const msg = e instanceof Error ? e.message : String(e)
                        if (
                          msg.includes('storage.objects') ||
                          msg.toLowerCase().includes('bucket_id') ||
                          msg.toLowerCase().includes('row level security') ||
                          msg.toLowerCase().includes('violates row-level security')
                        ) {
                          setUploadError(
                            'Uppsetning Supabase Storage fyrir `bills` er ekki tilbúin. Vinsamlegast tryggðu að það sé INSERT policy á `storage.objects` fyrir `bucket_id = \'bills\'.',
                          )
                          return
                        }
                        setUploadError(msg)
                      } finally {
                        setIsUploading(false)
                      }
                    }}
                >
                  Vista
                </Button>
            </div>
            </div>
            </DialogContent>
          </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Skjal / Reikningur details */}
      <Dialog
        open={isBillDetailsOpen}
        onOpenChange={(open) => {
          setIsBillDetailsOpen(open)
          if (!open) setSelectedBill(null)
        }}
      >
        <DialogContent side="right" className="flex flex-col gap-4 overflow-hidden">
          <DialogHeader className="space-y-0 pr-10 text-left">
            <DialogTitle className="text-[18px] font-medium leading-[1.333] text-[#323232]">
              {selectedBill ? (
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full rounded-[4px] border border-[#e8eaee] bg-white px-4 py-2 text-[16px] leading-[1.25] text-black outline-none"
                />
              ) : (
                '—'
              )}
            </DialogTitle>
            <DialogDescription className="text-[14px] text-[#666]">
              {selectedBill ? `${kindTagLabel(editKind)} • Upplýsingar` : ''}
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            <div className="flex flex-col gap-4">
            {selectedBill ? (
              <div className="rounded-[4px] bg-[#fbfbfc] p-6 flex flex-col gap-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label className="text-[14px] leading-4 text-[#323232]">Tegund</label>
                    <Select
                      value={editKind}
                      onValueChange={(v) => {
                        const next = v as MockBillRow['kind']
                        setEditKind(next)
                        if (next !== 'reikningur') {
                          setEditAmountIsk('')
                          setEditStatus('greitt')
                          setEditDueDateISO(null)
                        }
                      }}
                    >
                      <SelectTrigger className="h-10 w-full rounded-[4px] border border-[#e8eaee] bg-white px-4 text-[16px] text-[#666]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="reikningur">Reikningur</SelectItem>
                        <SelectItem value="skjal">Skjöl</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <label className="text-[14px] leading-4 text-[#323232]">Staða</label>
                    <Select
                      value={editKind === 'reikningur' ? editStatus : 'greitt'}
                      onValueChange={(v) => {
                        if (editKind !== 'reikningur') return
                        setEditStatus(v as BillStatus)
                      }}
                      disabled={editKind !== 'reikningur'}
                    >
                      <SelectTrigger className="h-10 w-full rounded-[4px] border border-[#e8eaee] bg-white px-4 text-[16px] text-[#666]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="greitt">Greitt</SelectItem>
                        <SelectItem value="ogreitt">Ógreitt</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-2">
                  <label className="text-[14px] leading-4 text-[#323232]" htmlFor="edit-date">
                    Dagsetning
                  </label>
                  <div className="h-10 rounded-[4px] border border-[#e8eaee] bg-white px-4 flex items-center gap-3">
                    <CalendarDays className="h-5 w-5 text-[#18325a]" aria-hidden />
                    <input
                      id="edit-date"
                      type="date"
                      value={editDateISO}
                      onChange={(e) => setEditDateISO(e.target.value)}
                      className="w-full border-0 bg-transparent text-[16px] leading-[1.25] text-black outline-none"
                    />
                  </div>
                </div>

                {editKind === 'reikningur' ? (
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <label className="text-[14px] leading-4 text-[#323232]" htmlFor="edit-due-date">
                        Gjalddagi
                      </label>
                      <div className="h-10 rounded-[4px] border border-[#e8eaee] bg-white px-4 flex items-center">
                        <input
                          id="edit-due-date"
                          type="date"
                          value={editDueDateISO ?? ''}
                          onChange={(e) => setEditDueDateISO(e.target.value || null)}
                          className="w-full border-0 bg-transparent text-[16px] leading-[1.25] text-black outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <label className="text-[14px] leading-4 text-[#323232]" htmlFor="edit-amount">
                        Upphæð (ISK)
                      </label>
                      <div className="h-10 rounded-[4px] border border-[#e8eaee] bg-white px-4 flex items-center">
                        <input
                          id="edit-amount"
                          type="number"
                          inputMode="numeric"
                          value={editAmountIsk}
                          onChange={(e) => setEditAmountIsk(e.target.value)}
                          className="w-full border-0 bg-transparent text-[16px] leading-[1.25] text-black outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ) : null}

                {billEditError ? (
                  <div className="text-[12px] leading-4 text-red-600">{billEditError}</div>
                ) : null}
              </div>
            ) : null}

            {selectedBill ? (
              <div className="rounded-[4px] bg-[#fbfbfc] p-6">
                <div className="grid gap-3">
                  <p className="text-[14px] font-medium leading-5 text-[rgba(0,0,0,0.87)]">
                    Viðhengi (PDF)
                  </p>
                  <label className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-[#e5e5e5] bg-white px-[16px] pb-[24px] pt-[16px]">
                    <input
                      type="file"
                      accept="application/pdf"
                      className="sr-only"
                      onChange={(e) => {
                        const f = e.target.files?.[0] ?? null
                        setEditAttachmentFile(f)
                      }}
                    />
                    <span className="flex items-center gap-1 rounded-full py-3 pl-3 pr-4 text-[16px] font-medium leading-6 text-[#18325a]">
                      <Upload className="size-5 shrink-0" aria-hidden />
                      {selectedBill.fileUrl ? 'Skipta út PDF' : 'Bæta við PDF'}
                    </span>
                    <span className="text-[14px] font-medium leading-5 text-[#666]">or drag and drop here</span>
                    {editAttachmentFile ? (
                      <span className="text-center text-[12px] text-[#323232]">
                        Ný skrá: {editAttachmentFile.name}
                      </span>
                    ) : selectedBill.fileUrl ? (
                      <span className="text-center text-[12px] text-[#323232]">Núverandi skrá er tengd.</span>
                    ) : (
                      <span className="text-center text-[12px] text-[#666]">Engin skrá valin.</span>
                    )}
                  </label>
                </div>
              </div>
            ) : null}

            {selectedBill?.fileUrl ? (
              <div className="overflow-hidden rounded-lg border border-[#f2f3f4] bg-white">
                <iframe src={selectedBill.fileUrl} title="Reikningur PDF" className="h-[60vh] w-full" />
              </div>
            ) : (
              <div className="rounded-lg border border-[#f2f3f4] bg-white p-4 text-[14px] leading-5 text-[#666]">
                Engin PDF skrá fylgir þessari færslu.
              </div>
            )}
            </div>
          </div>

          <div className="border-t border-[#f2f3f4] pt-4">
            <div className="flex flex-col gap-3">
              <Button
              type="button"
              variant="default"
              className="h-[52px] w-full rounded-[8px] border-0 bg-[#18325a] px-8 text-[16px] font-bold leading-5 text-white hover:bg-[#162b47]"
              onClick={async () => {
                if (!selectedBill) return
                setBillEditError(null)
                if (editTitle.trim().length === 0) {
                  setBillEditError('Vinsamlegast fylltu út titil.')
                  return
                }
                if (!editDateISO) {
                  setBillEditError('Vinsamlegast veldu dagsetningu.')
                  return
                }
                if (editKind === 'reikningur') {
                  const amountNum =
                    editAmountIsk.trim().length > 0 ? Number(editAmountIsk) : null
                  if (amountNum == null || !Number.isFinite(amountNum) || amountNum < 0) {
                    setBillEditError('Vinsamlegast fylltu út upphæð (ISK) rétt.')
                    return
                  }
                  if (!editDueDateISO) {
                    setBillEditError('Vinsamlegast veldu gjalddaga.')
                    return
                  }
                }

                setIsSavingBill(true)
                try {
                  let nextFileUrl: string | null = selectedBill.fileUrl ?? null

                  if (editAttachmentFile) {
                    if (!user?.id) {
                      setBillEditError('Þú þarft að vera innskráður til að hlaða upp PDF.')
                      return
                    }

                    const safeFileName = sanitizeStorageFileName(editAttachmentFile.name)
                    const storagePath = `${user.id}/${editKind}/${Date.now()}-${safeFileName}`

                    const { error: storageErr } = await supabase.storage
                      .from('bills')
                      .upload(storagePath, editAttachmentFile, {
                        contentType: 'application/pdf',
                        upsert: false,
                      })

                    if (storageErr) throw storageErr

                    const { data: publicUrlData } = supabase.storage.from('bills').getPublicUrl(storagePath)
                    nextFileUrl = publicUrlData.publicUrl

                    if (selectedBill.fileUrl) {
                      const objectPath = storageObjectPathFromPublicUrl('bills', selectedBill.fileUrl)
                      if (objectPath) {
                        try {
                          await supabase.storage.from('bills').remove([objectPath])
                        } catch {
                          // ignore
                        }
                      }
                    }
                  }

                  const payload = {
                    kind: editKind,
                    name: editTitle.trim(),
                    category: 'annad' as const,
                    date: editDateISO,
                    due_date: editKind === 'reikningur' ? editDueDateISO : null,
                    status: editKind === 'reikningur' ? editStatus : 'greitt',
                    amount: editKind === 'reikningur' ? Number(editAmountIsk) : null,
                    file_url: nextFileUrl,
                  }

                  const { error: updateErr, data } = await supabase
                    .from('bills')
                    .update(payload)
                    .eq('id', selectedBill.id)
                    .select('*')
                    .single()

                  if (updateErr) throw updateErr

                  if (data) {
                    const updated: MockBillRow = {
                      ...selectedBill,
                      kind: editKind,
                      title: editTitle.trim(),
                      dateISO: editDateISO,
                      dueDateISO: editKind === 'reikningur' ? editDueDateISO : null,
                      status: editKind === 'reikningur' ? editStatus : 'greitt',
                      amountIsk: editKind === 'reikningur' ? Number(editAmountIsk) : null,
                      fileUrl: nextFileUrl,
                    }
                    setBillRows((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
                    setSelectedBill(updated)
                    setEditAttachmentFile(null)
                  }

                  setIsBillDetailsOpen(false)
                } catch (e) {
                  const msg = e instanceof Error ? e.message : String(e)
                  setBillEditError(msg)
                } finally {
                  setIsSavingBill(false)
                }
              }}
              disabled={isSavingBill}
            >
              Vista
            </Button>
              <Button
                type="button"
                variant="ghost"
                className="h-[52px] w-full text-[16px] font-bold leading-5 text-[#323232] hover:bg-transparent"
                onClick={() => {
                  if (selectedBill) void handleDeleteBill(selectedBill)
                }}
                disabled={isDeletingBillId === selectedBill?.id}
              >
                Eyða
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Tafla — Figma TableGroup */}
      <div
        className="flex flex-col gap-6 overflow-hidden rounded-lg border border-[#f2f3f4] bg-white px-6 pb-8 pt-6"
        style={{ boxShadow: tableCardShadow }}
      >
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
              <span className="text-[14px] font-medium leading-5 text-[#666]">Tegund</span>
            </div>
            <div className="px-3">
              <span className="text-[14px] font-medium leading-5 text-[#666]">Dagsetning</span>
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
                  <div className="bg-[rgba(35,62,96,0.1)] w-fit content-stretch flex h-[24px] items-center px-[12px] py-[4px] relative rounded-[28px] shrink-0">
                    <p className="font-['Helvetica_Neue:Medium',sans-serif] leading-[16px] not-italic relative shrink-0 text-[#233e60] text-[11px] text-right tracking-[0.22px] uppercase whitespace-nowrap">
                      {kindTagLabel(row.kind)}
                    </p>
                  </div>
                </div>
                <div className="px-3">
                  <p className="text-[16px] font-normal leading-5 text-[#323232]">{formatShortDate(row.dateISO)}</p>
                </div>
                <div className="px-3">
                  <div
                    className={cn(
                      'inline-flex h-[24px] items-center gap-[8px] bg-white px-[12px] py-[4px] rounded-[28px]',
                    )}
                  >
                    <span
                      className={cn(
                        'relative shrink-0 size-[10px] rounded-full',
                        row.status === 'ogreitt' ? 'bg-[#F18F01]' : 'bg-[#22c55e]',
                      )}
                      aria-hidden
                    />
                    <span className="font-medium text-[11px] uppercase leading-4 tracking-[0.22px] text-[#323232]">
                      {row.status === 'ogreitt' ? 'ÓGREITT' : 'GREITT'}
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
                    className="flex size-9 items-center justify-center rounded-[8px] text-[#323232] hover:bg-black/[0.04]"
                    aria-label="Opna"
                    onClick={() => {
                      setSelectedBill(row)
                      setIsBillDetailsOpen(true)
                    }}
                  >
                    <ChevronRight className="h-4 w-4" />
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
