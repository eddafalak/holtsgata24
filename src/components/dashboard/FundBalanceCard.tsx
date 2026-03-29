import { useNavigate } from 'react-router-dom'
import { LineChart, Wallet } from 'lucide-react'
import { DashboardMetricCard } from '@/components/dashboard/DashboardMetricCard'
import { DashboardCardSkeleton } from '@/components/dashboard/DashboardCardSkeleton'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/formatCurrency'
import { formatDate } from '@/lib/formatDate'
import type { FundBalanceDashboard } from '@/hooks/useDashboardData'
import { cn } from '@/lib/utils'

type Props = {
  data: FundBalanceDashboard | null
  isLoading?: boolean
  error?: Error | null
  onRetry?: () => void
}

export function FundBalanceCard({ data, isLoading, error, onRetry }: Props) {
  const navigate = useNavigate()

  if (isLoading) {
    return <DashboardCardSkeleton />
  }

  if (error) {
    return (
      <Card className="gap-0 border-destructive/30 py-0">
        <CardHeader className="pt-4">
          <CardTitle className="text-base">Sjóður húsfélagsins</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>Ekki tókst að sækja gögn um sjóð.</p>
          {onRetry ? (
            <Button type="button" size="sm" variant="outline" onClick={() => void onRetry()}>
              Reyna aftur
            </Button>
          ) : null}
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return (
      <DashboardMetricCard
        title="Sjóður húsfélagsins"
        value="—"
        subtitle="Engin skráð staða í sjóði."
        icon={<Wallet className="text-primary" />}
        variant="info"
        action={{
          label: 'Sjá yfirlit',
          onClick: () => navigate('/reikningar'),
        }}
      />
    )
  }

  const monthLabel = formatDate(data.month, 'short')
  const netPositive = data.net >= 0

  return (
    <Card className="gap-0 overflow-hidden py-0 ring-1 ring-foreground/10">
      <CardHeader className="flex flex-row items-start justify-between gap-3 border-b border-border/60 pb-3 pt-4">
        <div>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Sjóður húsfélagsins
          </CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">{monthLabel}</p>
        </div>
        <div className="flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-primary">
          <LineChart className="size-4" aria-hidden />
        </div>
      </CardHeader>
      <CardContent className="space-y-4 py-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Heildarstaða
          </p>
          <p className="text-2xl font-bold tracking-tight">
            {formatCurrency(data.balance)}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground">Innborganir þ.mán.</p>
            <p className="font-semibold text-emerald-600">
              +{formatCurrency(data.income)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Útborganir þ.mán.</p>
            <p className="font-semibold text-red-600">
              −{formatCurrency(data.expenses)}
            </p>
          </div>
        </div>
        <div className="rounded-lg border border-border/80 bg-muted/40 px-3 py-2 text-sm">
          <span className="text-muted-foreground">Nettó: </span>
          <span
            className={cn('font-semibold', netPositive ? 'text-emerald-600' : 'text-red-600')}
          >
            {netPositive ? '+' : ''}
            {formatCurrency(data.net)}
          </span>
          {data.billsMonthExpense > 0 ? (
            <p className="mt-1 text-xs text-muted-foreground">
              Samanlagður kostnaður reikninga í mánuði: {formatCurrency(data.billsMonthExpense)}
            </p>
          ) : null}
        </div>
        {data.trend ? (
          <p className="text-xs text-muted-foreground">
            {data.trend.isPositive ? '↑' : '↓'} {data.trend.value}% {data.trend.label}
          </p>
        ) : null}
      </CardContent>
      <CardFooter className="border-t border-border/60 bg-muted/30">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full border-primary/30 text-primary hover:bg-primary/5"
          onClick={() => navigate('/reikningar')}
        >
          Sjá yfirlit
        </Button>
      </CardFooter>
    </Card>
  )
}
