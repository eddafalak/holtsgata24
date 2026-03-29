import { useNavigate } from 'react-router-dom'
import { FileText } from 'lucide-react'
import { DashboardCardSkeleton } from '@/components/dashboard/DashboardCardSkeleton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/formatCurrency'
import { formatDate } from '@/lib/formatDate'
import type { LatestBillDashboard } from '@/hooks/useDashboardData'
import type { BillCategory } from '@/types'

const categoryLabel: Record<BillCategory, string> = {
  vatn: 'Vatn',
  hiti: 'Hiti',
  rafmagn: 'Rafmagn',
  vidhald: 'Viðhald',
  annad: 'Annað',
}

type Props = {
  bill: LatestBillDashboard | null
  isLoading?: boolean
  error?: Error | null
  onRetry?: () => void
}

export function LatestBillCard({ bill, isLoading, error, onRetry }: Props) {
  const navigate = useNavigate()

  if (isLoading) {
    return <DashboardCardSkeleton />
  }

  if (error) {
    return (
      <Card className="gap-0 border-destructive/30 py-0">
        <CardHeader className="pt-4">
          <CardTitle className="text-base">Síðasti reikningur</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>Ekki tókst að sækja reikninga.</p>
          {onRetry ? (
            <Button type="button" size="sm" variant="outline" onClick={() => void onRetry()}>
              Reyna aftur
            </Button>
          ) : null}
        </CardContent>
      </Card>
    )
  }

  if (!bill) {
    return (
      <Card className="gap-0 py-0 ring-1 ring-foreground/10">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 pb-3 pt-4">
          <CardTitle className="text-sm font-medium text-muted-foreground">Síðasti reikningur</CardTitle>
          <FileText className="size-5 text-primary" />
        </CardHeader>
        <CardContent className="py-4 text-sm text-muted-foreground">Enginn reikningur skráður.</CardContent>
        <CardFooter className="border-t border-border/60 bg-muted/30">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full border-primary/30 text-primary hover:bg-primary/5"
            onClick={() => navigate('/reikningar')}
          >
            Sjá alla reikninga
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="gap-0 py-0 ring-1 ring-foreground/10">
      <CardHeader className="flex flex-row items-start justify-between gap-3 border-b border-border/60 pb-3 pt-4">
        <div className="space-y-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Síðasti reikningur</CardTitle>
          <Badge variant="secondary" className="font-normal">
            {categoryLabel[bill.category] ?? bill.category}
          </Badge>
        </div>
        <FileText className="size-5 shrink-0 text-primary" aria-hidden />
      </CardHeader>
      <CardContent className="space-y-2 py-4">
        <p className="font-medium leading-snug text-foreground">{bill.name}</p>
        <p className="text-2xl font-bold tracking-tight">
          {bill.amount != null ? formatCurrency(bill.amount) : '—'}
        </p>
        <p className="text-sm text-muted-foreground">Dagsetning: {formatDate(bill.date, 'long')}</p>
      </CardContent>
      <CardFooter className="border-t border-border/60 bg-muted/30">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full border-primary/30 text-primary hover:bg-primary/5"
          onClick={() => navigate('/reikningar')}
        >
          Sjá alla reikninga
        </Button>
      </CardFooter>
    </Card>
  )
}
