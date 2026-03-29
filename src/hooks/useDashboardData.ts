import { useQueries } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import { calculateOwnershipPercentage } from '@/lib/calculateOwnership'
import type { Database } from '@/lib/database.types'
import type { BillCategory } from '@/types'

type FundBalanceRow = Database['public']['Tables']['fund_balance']['Row']

export type FundBalanceDashboard = {
  balance: number
  income: number
  expenses: number
  net: number
  month: string
  billsMonthExpense: number
  trend?: { value: number; isPositive: boolean; label: string }
}

export type NextMeetingDashboard = {
  id: string
  title: string
  meeting_date: string
  location: string | null
  description: string | null
}

export type MessagesDashboard = {
  unreadCount: number
  latestPreview: string | null
  latestAt: string | null
}

export type UserShareDashboard = {
  shareAmount: number
  ownershipPercent: number
  paid: boolean
  latestBillName: string | null
}

export type LatestBillDashboard = {
  id: string
  name: string
  category: BillCategory
  amount: number | null
  date: string
}

export type YearlyExpenseDashboard = {
  currentYearTotal: number
  lastYearTotal: number
  percentChange: number | null
  isIncrease: boolean
}

export type ActivityItem = {
  id: string
  type: 'bill' | 'message' | 'meeting' | 'minutes' | 'resident'
  title: string
  at: string
  href?: string
}

export type HousingStats = {
  apartmentCount: number
  residentCount: number
  avgMonthlyExpense: number | null
}

function monthBoundsIso() {
  const now = new Date()
  const start = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1))
  const end = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 0))
  const iso = (d: Date) => d.toISOString().slice(0, 10)
  return { start: iso(start), end: iso(end) }
}

async function fetchFundBalance(): Promise<FundBalanceDashboard | null> {
  const { data: rows, error } = await supabase
    .from('fund_balance')
    .select('*')
    .order('month', { ascending: false })
    .limit(2)
    .returns<FundBalanceRow[]>()

  if (error) throw error
  const list = rows ?? []
  const latest = list[0]
  if (!latest) return null

  const prev = list[1]
  const { start, end } = monthBoundsIso()
  const { data: billRows, error: billsError } = await supabase
    .from('bills')
    .select('amount')
    .eq('kind', 'reikningur')
    .gte('date', start)
    .lte('date', end)

  if (billsError) throw billsError
  const billsMonthExpense =
    billRows?.reduce((s, r) => s + (Number(r.amount) || 0), 0) ?? 0

  const income = Number(latest.income)
  const expenses = Number(latest.expenses)
  const net = income - expenses
  let trend: FundBalanceDashboard['trend']
  if (prev) {
    const prevNet = Number(prev.income) - Number(prev.expenses)
    const delta = net - prevNet
    const base = Math.abs(prevNet)
    const value = base > 0 ? Math.round((delta / base) * 100) : delta === 0 ? 0 : 100
    trend = {
      value: Math.abs(value),
      isPositive: delta >= 0,
      label: 'Samanborði við fyrri mánuð',
    }
  }

  return {
    balance: Number(latest.balance),
    income,
    expenses,
    net,
    month: latest.month,
    billsMonthExpense,
    trend,
  }
}

async function fetchNextMeeting(): Promise<NextMeetingDashboard | null> {
  const nowIso = new Date().toISOString()
  const { data, error } = await supabase
    .from('meetings')
    .select('id, title, meeting_date, location, description')
    .gt('meeting_date', nowIso)
    .order('meeting_date', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  if (!data) return null
  return {
    id: data.id,
    title: data.title,
    meeting_date: data.meeting_date,
    location: data.location,
    description: data.description,
  }
}

async function fetchMessagesDashboard(userId: string): Promise<MessagesDashboard> {
  const [{ count: privateUnread }, { count: groupUnread }] = await Promise.all([
    supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('is_private', true)
      .eq('recipient_id', userId)
      .eq('read', false),
    supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('is_private', false)
      .eq('read', false),
  ])

  const unreadCount = (privateUnread ?? 0) + (groupUnread ?? 0)

  const { data: latest } = await supabase
    .from('messages')
    .select('content, created_at')
    .or(
      `is_private.eq.false,and(is_private.eq.true,recipient_id.eq.${userId}),and(is_private.eq.true,sender_id.eq.${userId})`,
    )
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return {
    unreadCount,
    latestPreview: latest?.content?.slice(0, 120) ?? null,
    latestAt: latest?.created_at ?? null,
  }
}

async function fetchLatestBill(): Promise<LatestBillDashboard | null> {
  const { data, error } = await supabase
    .from('bills')
    .select('id, name, category, amount, date')
    .order('date', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  if (!data) return null
  return {
    id: data.id,
    name: data.name,
    category: data.category as BillCategory,
    amount: data.amount != null ? Number(data.amount) : null,
    date: data.date,
  }
}

function isPaidBillStatus(status: string | null | undefined): boolean {
  return status === 'greitt'
}

async function fetchUserShare(userId: string): Promise<UserShareDashboard | null> {
  const [{ data: profile, error: pErr }, { data: apartments, error: aErr }, latestBillRes] =
    await Promise.all([
      supabase.from('profiles').select('apartment_id').eq('id', userId).maybeSingle(),
      supabase.from('apartments').select('id, size'),
      supabase
        .from('bills')
        .select('name, amount, status')
        .order('date', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ])

  if (pErr) throw pErr
  if (aErr) throw aErr

  const latestBill = latestBillRes.data
  if (!latestBill || latestBill.amount == null) {
    return {
      shareAmount: 0,
      ownershipPercent: 0,
      paid: true,
      latestBillName: null,
    }
  }

  const aptList = apartments ?? []
  const totalSize = aptList.reduce((s, a) => s + Number(a.size), 0)
  const myApt = aptList.find((a) => a.id === profile?.apartment_id)
  const pct = myApt
    ? calculateOwnershipPercentage(Number(myApt.size), totalSize)
    : 0
  const shareAmount = (Number(latestBill.amount) * pct) / 100

  return {
    shareAmount: Math.round(shareAmount),
    ownershipPercent: Math.round(pct * 10) / 10,
    paid: isPaidBillStatus(latestBill.status as string),
    latestBillName: latestBill.name,
  }
}

async function fetchYearlyExpenses(): Promise<YearlyExpenseDashboard> {
  const y = new Date().getFullYear()
  const { data: rows, error } = await supabase
    .from('bills')
    .select('amount, date')
    .eq('kind', 'reikningur')

  if (error) throw error

  let current = 0
  let last = 0
  for (const r of rows ?? []) {
    const d = new Date(r.date)
    if (Number.isNaN(d.getTime())) continue
    const yr = d.getFullYear()
    const amt = Number(r.amount) || 0
    if (yr === y) current += amt
    if (yr === y - 1) last += amt
  }

  let percentChange: number | null = null
  if (last > 0) {
    percentChange = Math.round(((current - last) / last) * 100)
  } else if (current > 0 && last === 0) {
    percentChange = 100
  }

  return {
    currentYearTotal: current,
    lastYearTotal: last,
    percentChange,
    isIncrease: current >= last,
  }
}

async function fetchActivities(): Promise<ActivityItem[]> {
  const [billsR, messagesR, meetingsR, minutesR, profilesR] = await Promise.all([
    supabase.from('bills').select('id, name, created_at').order('created_at', { ascending: false }).limit(6),
    supabase.from('messages').select('id, content, created_at').order('created_at', { ascending: false }).limit(6),
    supabase.from('meetings').select('id, title, created_at').order('created_at', { ascending: false }).limit(6),
    supabase
      .from('meeting_minutes')
      .select('id, finalized_at, meetings(title)')
      .eq('is_finalized', true)
      .not('finalized_at', 'is', null)
      .order('finalized_at', { ascending: false })
      .limit(6),
    supabase
      .from('profiles')
      .select('id, full_name, created_at')
      .order('created_at', { ascending: false })
      .limit(6),
  ])

  const items: ActivityItem[] = []

  for (const b of billsR.data ?? []) {
    items.push({
      id: `bill-${b.id}`,
      type: 'bill',
      title: `Nýr reikningur: ${b.name}`,
      at: b.created_at,
      href: '/reikningar',
    })
  }
  for (const m of messagesR.data ?? []) {
    const preview = m.content?.slice(0, 40) ?? 'Skilaboð'
    items.push({
      id: `msg-${m.id}`,
      type: 'message',
      title: `Skilaboð: ${preview}${m.content && m.content.length > 40 ? '…' : ''}`,
      at: m.created_at,
      href: '/skilabod',
    })
  }
  for (const m of meetingsR.data ?? []) {
    items.push({
      id: `meet-${m.id}`,
      type: 'meeting',
      title: `Fundur skráður: ${m.title}`,
      at: m.created_at,
      href: '/fundir',
    })
  }
  for (const mm of minutesR.data ?? []) {
    const title =
      (mm.meetings as { title?: string } | null)?.title ?? 'Fundargerð'
    items.push({
      id: `min-${mm.id}`,
      type: 'minutes',
      title: `Fundargerð lokið: ${title}`,
      at: mm.finalized_at!,
      href: '/fundir',
    })
  }
  for (const p of profilesR.data ?? []) {
    const name = p.full_name?.trim() || 'Nýr íbúi'
    items.push({
      id: `prof-${p.id}`,
      type: 'resident',
      title: `Íbúi bættur við: ${name}`,
      at: p.created_at,
      href: '/eigendur',
    })
  }

  items.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
  return items.slice(0, 10)
}

async function fetchHousingStats(): Promise<HousingStats> {
  const [{ count: aptCount }, { count: resCount }, { data: bills }] = await Promise.all([
    supabase.from('apartments').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase
      .from('bills')
      .select('amount, date')
      .eq('kind', 'reikningur')
      .order('date', { ascending: false })
      .limit(120),
  ])

  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() - 11, 1)
  let sum = 0
  for (const b of bills ?? []) {
    const d = new Date(b.date)
    if (d >= start) sum += Number(b.amount) || 0
  }
  const avgMonthlyExpense = sum > 0 ? Math.round(sum / 12) : null

  return {
    apartmentCount: aptCount ?? 0,
    residentCount: resCount ?? 0,
    avgMonthlyExpense,
  }
}

export function useDashboardData() {
  const { user } = useAuth()
  const enabled = isSupabaseConfigured() && Boolean(user?.id)
  const uid = user?.id ?? ''

  const results = useQueries({
    queries: [
      {
        queryKey: ['fund-balance-latest'],
        queryFn: fetchFundBalance,
        enabled,
        staleTime: 60_000,
        retry: 1,
      },
      {
        queryKey: ['next-meeting'],
        queryFn: fetchNextMeeting,
        enabled,
        staleTime: 60_000,
        retry: 1,
      },
      {
        queryKey: ['unread-messages', uid],
        queryFn: () => fetchMessagesDashboard(uid),
        enabled,
        staleTime: 30_000,
        retry: 1,
      },
      {
        queryKey: ['latest-bill'],
        queryFn: fetchLatestBill,
        enabled,
        staleTime: 60_000,
        retry: 1,
      },
      {
        queryKey: ['yearly-expenses'],
        queryFn: fetchYearlyExpenses,
        enabled,
        staleTime: 120_000,
        retry: 1,
      },
      {
        queryKey: ['user-share', uid],
        queryFn: () => fetchUserShare(uid),
        enabled,
        staleTime: 60_000,
        retry: 1,
      },
      {
        queryKey: ['recent-activities'],
        queryFn: fetchActivities,
        enabled,
        staleTime: 45_000,
        retry: 1,
      },
      {
        queryKey: ['housing-stats'],
        queryFn: fetchHousingStats,
        enabled,
        staleTime: 120_000,
        retry: 1,
      },
    ],
  })

  const [
    fundBalanceQ,
    nextMeetingQ,
    messagesQ,
    latestBillQ,
    yearlyQ,
    userShareQ,
    activitiesQ,
    housingQ,
  ] = results

  const isLoading = results.some((r) => r.isPending)
  const errors = results.map((r) => r.error).filter(Boolean)
  const error = errors[0] ?? null

  const refetchAll = () => Promise.all(results.map((r) => r.refetch()))

  const queryErrors = {
    fundBalance: fundBalanceQ.error,
    nextMeeting: nextMeetingQ.error,
    messages: messagesQ.error,
    latestBill: latestBillQ.error,
    yearlyExpenses: yearlyQ.error,
    userShare: userShareQ.error,
    activities: activitiesQ.error,
    housingStats: housingQ.error,
  } as const

  return {
    fundBalance: fundBalanceQ.data ?? null,
    nextMeeting: nextMeetingQ.data ?? null,
    messages: messagesQ.data ?? { unreadCount: 0, latestPreview: null, latestAt: null },
    latestBill: latestBillQ.data ?? null,
    yearlyExpenses: yearlyQ.data ?? {
      currentYearTotal: 0,
      lastYearTotal: 0,
      percentChange: null,
      isIncrease: false,
    },
    userShare: userShareQ.data ?? null,
    activities: activitiesQ.data ?? [],
    housingStats: housingQ.data ?? {
      apartmentCount: 0,
      residentCount: 0,
      avgMonthlyExpense: null,
    },
    isLoading,
    error,
    queryErrors,
    refetchAll,
    isFetching: results.some((r) => r.isFetching),
  }
}
