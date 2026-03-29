import { Link } from 'react-router-dom'
import {
  CalendarClock,
  ClipboardCheck,
  FileText,
  MessageSquare,
  UserPlus,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate } from '@/lib/formatDate'
import type { ActivityItem } from '@/hooks/useDashboardData'
import { cn } from '@/lib/utils'

const iconByType: Record<ActivityItem['type'], typeof FileText> = {
  bill: FileText,
  message: MessageSquare,
  meeting: CalendarClock,
  minutes: ClipboardCheck,
  resident: UserPlus,
}

type Props = {
  activities: ActivityItem[]
  isLoading?: boolean
  error?: Error | null
  onRetry?: () => void
}

export function ActivityFeed({ activities, isLoading, error, onRetry }: Props) {
  if (isLoading) {
    return (
      <Card className="gap-0 py-0 ring-1 ring-foreground/10">
        <CardHeader className="border-b border-border/60 pb-3 pt-4">
          <CardTitle className="text-lg font-semibold">Nýlegt</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 py-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="size-9 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full max-w-[280px]" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="gap-0 border-destructive/30 py-0">
        <CardHeader className="pt-4">
          <CardTitle className="text-lg font-semibold">Nýlegt</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 py-4 text-sm text-muted-foreground">
          <p>Ekki tókst að sækja virkni.</p>
          {onRetry ? (
            <Button type="button" size="sm" variant="outline" onClick={() => void onRetry()}>
              Reyna aftur
            </Button>
          ) : null}
        </CardContent>
      </Card>
    )
  }

  if (activities.length === 0) {
    return (
      <Card className="gap-0 py-0 ring-1 ring-foreground/10">
        <CardHeader className="border-b border-border/60 pb-3 pt-4">
          <CardTitle className="text-lg font-semibold">Nýlegt</CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Engar fréttir að sýna ennþá.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="gap-0 py-0 ring-1 ring-foreground/10">
      <CardHeader className="border-b border-border/60 pb-3 pt-4">
        <CardTitle className="text-lg font-semibold">Nýlegt</CardTitle>
        <p className="text-sm text-muted-foreground">Síðustu atvik í húsfélaginu.</p>
      </CardHeader>
      <CardContent className="px-0 py-2">
        <ul className="divide-y divide-border/60">
          {activities.map((item) => {
            const Icon = iconByType[item.type]
            const inner = (
              <div
                className={cn(
                  'flex gap-3 px-4 py-3 transition-colors',
                  item.href && 'hover:bg-muted/50 cursor-pointer',
                )}
              >
                <div
                  className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
                  aria-hidden
                >
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-snug text-foreground">{item.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatDate(item.at, 'relative')} · {formatDate(item.at, 'short')}
                  </p>
                </div>
              </div>
            )

            return (
              <li key={item.id}>
                {item.href ? (
                  <Link to={item.href} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg">
                    {inner}
                  </Link>
                ) : (
                  inner
                )}
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}
