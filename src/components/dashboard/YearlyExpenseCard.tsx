import { useNavigate } from 'react-router-dom'
import { BarChart3, TrendingDown, TrendingUp } from 'lucide-react'
import { DashboardCardSkeleton } from '@/components/dashboard/DashboardCardSkeleton'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/formatCurrency'
import type { YearlyExpenseDashboard } from '@/hooks/useDashboardData'
import { cn } from '@/lib/utils'

type Props = {
  data: YearlyExpenseDashboard
  isLoading?: boolean
  error?: Error | null
  onRetry?: () => void
}

export function YearlyExpenseCard({ data, isLoading, error, onRetry }: Props) {
  const navigate = useNavigate()

  if (isLoading) {
    return <DashboardCardSkeleton />
  }

  if (error) {
    return (
      <Card className="gap-0 border-destructive/30 py-0">
        <CardHeader className="pt-4">
          <CardTitle className="text-base">Árlegur kostnaður</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>Ekki tókst að reikna árlegan kostnað.</p>
          {onRetry ? (
            <Button type="button" size="sm" variant="outline" onClick={() => void onRetry()}>
              Reyna aftur
            </Button>
          ) : null}
        </CardContent>
      </Card>
    )
  }

  const year = new Date().getFullYear()
  const hasCompare = data.percentChange != null
  const up = data.isIncrease

  return (
    <Card className="gap-0 py-0 ring-1 ring-foreground/10">
      <CardHeader className="flex flex-row items-start justify-between gap-3 border-b border-border/60 pb-3 pt-4">
        <CardTitle className="text-sm font-medium text-muted-foreground">Árlegur kostnaður</CardTitle>
        <BarChart3 className="size-5 shrink-0 text-primary" aria-hidden />
      </CardHeader>
      <CardContent className="space-y-4 py-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Heildarupphæð {year}
          </p>
          <p className="text-2xl font-bold tracking-tight">
            {formatCurrency(data.currentYearTotal)}
          </p>
        </div>
        {hasCompare ? (
          <div
            className={cn(
              'inline-flex items-center gap-1.5 text-sm font-medium',
              up ? 'text-red-600' : 'text-emerald-600',
            )}
          >
            {up ? <TrendingUp className="size-4" aria-hidden /> : <TrendingDown className="size-4" aria-hidden />}
            <span>
              {up ? '+' : ''}
              {data.percentChange}% miðað við fyrra ár
            </span>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Engin samanburðargögn fyrir fyrra ár.</p>
        )}
        <p className="text-xs text-muted-foreground">
          Samtala reikninga (tegund: reikningur) skráðra á árinu.
        </p>
      </CardContent>
      <CardFooter className="border-t border-border/60 bg-muted/30">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full border-primary/30 text-primary hover:bg-primary/5"
          onClick={() => navigate('/reikningar')}
        >
          Sjá meira
        </Button>
      </CardFooter>
    </Card>
  )
}
