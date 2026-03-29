import { FundBalanceCard } from '@/components/dashboard/FundBalanceCard'
import { NextMeetingCard } from '@/components/dashboard/NextMeetingCard'
import { MessagesCard } from '@/components/dashboard/MessagesCard'
import { UserShareCard } from '@/components/dashboard/UserShareCard'
import { LatestBillCard } from '@/components/dashboard/LatestBillCard'
import { YearlyExpenseCard } from '@/components/dashboard/YearlyExpenseCard'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'
import { HousingInfoCard } from '@/components/dashboard/HousingInfoCard'
import { DashboardCardSkeleton } from '@/components/dashboard/DashboardCardSkeleton'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { useDashboardData } from '@/hooks/useDashboardData'
import { formatDate } from '@/lib/formatDate'
import { isSupabaseConfigured } from '@/lib/supabase'
import { Skeleton } from '@/components/ui/skeleton'

function toError(e: unknown): Error | null {
  if (e == null) return null
  if (e instanceof Error) return e
  return new Error(String(e))
}

function HomePage() {
  const { profile, user, loading: authLoading } = useAuth()
  const {
    fundBalance,
    nextMeeting,
    messages,
    latestBill,
    yearlyExpenses,
    userShare,
    activities,
    housingStats,
    isLoading,
    error,
    queryErrors,
    refetchAll,
  } = useDashboardData()

  const displayName = profile?.full_name?.trim() || user?.email?.split('@')[0] || 'Íbúi'

  if (authLoading) {
    return (
      <div className="space-y-6 p-1">
        <div className="space-y-2">
          <Skeleton className="h-9 w-2/3 max-w-md" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <DashboardCardSkeleton />
          <DashboardCardSkeleton />
          <DashboardCardSkeleton />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <DashboardCardSkeleton />
          <DashboardCardSkeleton />
          <DashboardCardSkeleton />
        </div>
      </div>
    )
  }

  const showQuerySkeleton = isSupabaseConfigured() && Boolean(user?.id) && isLoading

  return (
    <div className="space-y-6 p-1">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Góðan daginn, {displayName}! 👋
        </h1>
        <p className="text-sm text-muted-foreground">{formatDate(new Date(), 'long')}</p>
      </header>

      {!isSupabaseConfigured() ? (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-950 dark:text-amber-100">
          Engin tenging við Supabase (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY). Gögn á yfirliti
          birtast þegar umhverfisbreytur eru settar.
        </p>
      ) : null}

      {error ? (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm">
          <span className="text-destructive">Villa við að sækja sum gögn.</span>
          <Button type="button" size="sm" variant="outline" onClick={() => void refetchAll()}>
            Reyna aftur
          </Button>
        </div>
      ) : null}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <FundBalanceCard
          data={fundBalance}
          isLoading={showQuerySkeleton}
          error={toError(queryErrors.fundBalance)}
          onRetry={refetchAll}
        />
        <NextMeetingCard
          meeting={nextMeeting}
          isLoading={showQuerySkeleton}
          error={toError(queryErrors.nextMeeting)}
          onRetry={refetchAll}
        />
        <MessagesCard
          data={messages}
          isLoading={showQuerySkeleton}
          error={toError(queryErrors.messages)}
          onRetry={refetchAll}
        />
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <UserShareCard
          data={userShare}
          isLoading={showQuerySkeleton}
          error={toError(queryErrors.userShare)}
          onRetry={refetchAll}
        />
        <LatestBillCard
          bill={latestBill}
          isLoading={showQuerySkeleton}
          error={toError(queryErrors.latestBill)}
          onRetry={refetchAll}
        />
        <YearlyExpenseCard
          data={yearlyExpenses}
          isLoading={showQuerySkeleton}
          error={toError(queryErrors.yearlyExpenses)}
          onRetry={refetchAll}
        />
      </section>

      <QuickActions userRole={profile?.role ?? null} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ActivityFeed
            activities={activities}
            isLoading={showQuerySkeleton}
            error={toError(queryErrors.activities)}
            onRetry={refetchAll}
          />
        </div>
        <div>
          <HousingInfoCard stats={housingStats} isLoading={showQuerySkeleton} />
        </div>
      </div>
    </div>
  )
}

export { HomePage }
export default HomePage
