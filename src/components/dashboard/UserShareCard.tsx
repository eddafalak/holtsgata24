import { useNavigate } from 'react-router-dom'
import { BadgeCheck, CircleAlert, DollarSign } from 'lucide-react'
import { DashboardCardSkeleton } from '@/components/dashboard/DashboardCardSkeleton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/formatCurrency'
import type { UserShareDashboard } from '@/hooks/useDashboardData'

type Props = {
  data: UserShareDashboard | null
  isLoading?: boolean
  error?: Error | null
  onRetry?: () => void
}

export function UserShareCard({ data, isLoading, error, onRetry }: Props) {
  const navigate = useNavigate()

  if (isLoading) {
    return <DashboardCardSkeleton />
  }

  if (error) {
    return (
      <Card className="gap-0 border-destructive/30 py-0">
        <CardHeader className="pt-4">
          <CardTitle className="text-base">Þinn hluti</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>Ekki tókst að reikna hlut.</p>
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
      <Card className="gap-0 py-0 ring-1 ring-foreground/10">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 pb-3 pt-4">
          <CardTitle className="text-sm font-medium text-muted-foreground">Þinn hluti</CardTitle>
          <DollarSign className="size-5 text-primary" />
        </CardHeader>
        <CardContent className="py-4 text-sm text-muted-foreground">
          Engin gögn um hlut eða íbúð.
        </CardContent>
        <CardFooter className="border-t border-border/60 bg-muted/30">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full border-primary/30 text-primary hover:bg-primary/5"
            onClick={() => navigate('/reikningar')}
          >
            Sjá nánar
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="gap-0 py-0 ring-1 ring-foreground/10">
      <CardHeader className="flex flex-row items-start justify-between gap-3 border-b border-border/60 pb-3 pt-4">
        <div>
          <CardTitle className="text-sm font-medium text-muted-foreground">Þinn hluti</CardTitle>
          {data.latestBillName ? (
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{data.latestBillName}</p>
          ) : null}
        </div>
        <DollarSign className="size-5 shrink-0 text-primary" aria-hidden />
      </CardHeader>
      <CardContent className="space-y-4 py-4">
        <div className="text-2xl font-bold tracking-tight">{formatCurrency(data.shareAmount)}</div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className={
              data.paid
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-800'
                : 'border-red-500/40 bg-red-500/10 text-red-800'
            }
          >
            {data.paid ? (
              <>
                <BadgeCheck className="mr-1 size-3.5" aria-hidden />
                Greitt
              </>
            ) : (
              <>
                <CircleAlert className="mr-1 size-3.5" aria-hidden />
                Ógreitt
              </>
            )}
          </Badge>
          <span className="text-sm text-muted-foreground">
            Eignarhlutfall: <span className="font-medium text-foreground">{data.ownershipPercent}%</span>
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Reiknað út frá nýjasta reikningi og stærð íbúðar miðað við heildarfermetra fjölda.
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
          Sjá nánar
        </Button>
      </CardFooter>
    </Card>
  )
}
