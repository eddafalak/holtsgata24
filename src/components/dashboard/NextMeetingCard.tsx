import { useNavigate } from 'react-router-dom'
import { differenceInCalendarDays } from 'date-fns'
import { Calendar } from 'lucide-react'
import { DashboardMetricCard } from '@/components/dashboard/DashboardMetricCard'
import { DashboardCardSkeleton } from '@/components/dashboard/DashboardCardSkeleton'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/formatDate'
import type { NextMeetingDashboard } from '@/hooks/useDashboardData'

type Props = {
  meeting: NextMeetingDashboard | null
  isLoading?: boolean
  error?: Error | null
  onRetry?: () => void
}

function formatMeetingDateTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  const datePart = formatDate(d, 'long')
  const t = d.toLocaleTimeString('is-IS', { hour: '2-digit', minute: '2-digit' })
  return `${datePart} · kl. ${t}`
}

export function NextMeetingCard({ meeting, isLoading, error, onRetry }: Props) {
  const navigate = useNavigate()

  if (isLoading) {
    return <DashboardCardSkeleton />
  }

  if (error) {
    return (
      <Card className="gap-0 border-destructive/30 py-0">
        <CardHeader className="pt-4">
          <CardTitle className="text-base">Næsti fundur</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>Ekki tókst að sækja fundi.</p>
          {onRetry ? (
            <Button type="button" size="sm" variant="outline" onClick={() => void onRetry()}>
              Reyna aftur
            </Button>
          ) : null}
        </CardContent>
      </Card>
    )
  }

  if (!meeting) {
    return (
      <DashboardMetricCard
        title="Næsti fundur"
        value="Enginn fundur"
        subtitle="Enginn fundur fyrirhugaður."
        icon={<Calendar className="text-primary" />}
        variant="warning"
        action={{
          label: 'Sjá dagskrá',
          onClick: () => navigate('/fundir'),
        }}
      />
    )
  }

  const days = differenceInCalendarDays(new Date(meeting.meeting_date), new Date())
  const countdown =
    days === 0
      ? 'Í dag'
      : days === 1
        ? 'Á morgun'
        : days > 1
          ? `Eftir ${days} daga`
          : `Fyrir ${Math.abs(days)} dögum`

  return (
    <Card className="gap-0 py-0 ring-1 ring-foreground/10">
      <CardHeader className="flex flex-row items-start justify-between gap-3 border-b border-border/60 pb-3 pt-4">
        <div>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Næsti fundur
          </CardTitle>
          <p className="mt-2 text-lg font-semibold leading-snug text-foreground">
            {meeting.title}
          </p>
        </div>
        <Calendar className="size-5 shrink-0 text-primary" aria-hidden />
      </CardHeader>
      <CardContent className="space-y-2 py-4 text-sm">
        <p className="font-medium text-foreground">{formatMeetingDateTime(meeting.meeting_date)}</p>
        <p className="text-muted-foreground">
          <span className="font-medium text-foreground/80">Staðsetning: </span>
          {meeting.location?.trim() || 'Ekki skráð'}
        </p>
        <p className="text-sm font-medium text-primary">{countdown}</p>
      </CardContent>
      <CardFooter className="border-t border-border/60 bg-muted/30">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full border-primary/30 text-primary hover:bg-primary/5"
          onClick={() => navigate('/fundir')}
        >
          Sjá dagskrá
        </Button>
      </CardFooter>
    </Card>
  )
}
