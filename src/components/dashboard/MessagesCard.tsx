import { useNavigate } from 'react-router-dom'
import { MessageSquare } from 'lucide-react'
import { DashboardCardSkeleton } from '@/components/dashboard/DashboardCardSkeleton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/formatDate'
import type { MessagesDashboard } from '@/hooks/useDashboardData'

type Props = {
  data: MessagesDashboard
  isLoading?: boolean
  error?: Error | null
  onRetry?: () => void
}

export function MessagesCard({ data, isLoading, error, onRetry }: Props) {
  const navigate = useNavigate()

  if (isLoading) {
    return <DashboardCardSkeleton />
  }

  if (error) {
    return (
      <Card className="gap-0 border-destructive/30 py-0">
        <CardHeader className="pt-4">
          <CardTitle className="text-base">Skilaboð</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>Ekki tókst að sækja skilaboð.</p>
          {onRetry ? (
            <Button type="button" size="sm" variant="outline" onClick={() => void onRetry()}>
              Reyna aftur
            </Button>
          ) : null}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="gap-0 py-0 ring-1 ring-foreground/10">
      <CardHeader className="flex flex-row items-start justify-between gap-3 border-b border-border/60 pb-3 pt-4">
        <CardTitle className="text-sm font-medium text-muted-foreground">Skilaboð</CardTitle>
        <div className="relative">
          <MessageSquare className="size-5 text-primary" aria-hidden />
          {data.unreadCount > 0 ? (
            <Badge
              variant="destructive"
              className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px]"
            >
              {data.unreadCount > 99 ? '99+' : data.unreadCount}
            </Badge>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 py-4">
        <div className="text-2xl font-bold tracking-tight">
          {data.unreadCount}{' '}
          <span className="text-base font-medium text-muted-foreground">
            ólesin{data.unreadCount === 1 ? '' : 'n'}
          </span>
        </div>
        {data.latestPreview ? (
          <div className="rounded-md border border-border/60 bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
            <p className="line-clamp-2">{data.latestPreview}</p>
            {data.latestAt ? (
              <p className="mt-1 text-xs text-muted-foreground/80">
                {formatDate(data.latestAt, 'relative')}
              </p>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Engin nýleg í skjánum.</p>
        )}
      </CardContent>
      <CardFooter className="border-t border-border/60 bg-muted/30">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full border-primary/30 text-primary hover:bg-primary/5"
          onClick={() => navigate('/skilabod')}
        >
          Opna spjall
        </Button>
      </CardFooter>
    </Card>
  )
}
