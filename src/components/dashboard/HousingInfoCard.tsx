import { Building2, Home, MapPin, Users, Wallet } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/formatCurrency'
import type { HousingStats } from '@/hooks/useDashboardData'

type Props = {
  stats: HousingStats
  isLoading?: boolean
}

export function HousingInfoCard({ stats, isLoading }: Props) {
  if (isLoading) {
    return (
      <Card className="gap-0 py-0 ring-1 ring-foreground/10">
        <CardHeader className="border-b border-border/60 pb-3 pt-4">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="grid gap-3 py-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </CardContent>
      </Card>
    )
  }

  const rows = [
    {
      icon: Building2,
      label: 'Fjöldi íbúða',
      value: String(stats.apartmentCount || '—'),
    },
    {
      icon: Users,
      label: 'Íbúar skráðir',
      value: String(stats.residentCount || '—'),
    },
    {
      icon: MapPin,
      label: 'Heimilisfang',
      value: 'Holtsgata 24',
    },
    {
      icon: Wallet,
      label: 'Meðalkostnaður á mánuði',
      value: stats.avgMonthlyExpense != null ? formatCurrency(stats.avgMonthlyExpense) : '—',
    },
  ]

  return (
    <Card className="gap-0 py-0 ring-1 ring-foreground/10">
      <CardHeader className="border-b border-border/60 pb-3 pt-4">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <Home className="size-5 text-primary" aria-hidden />
          Húsið
        </CardTitle>
        <p className="text-sm text-muted-foreground">Holtsgata 24 húsfélag</p>
      </CardHeader>
      <CardContent className="grid gap-2 py-4">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5"
          >
            <row.icon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {row.label}
              </p>
              <p className="text-sm font-semibold text-foreground">{row.value}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
