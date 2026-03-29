import type { ReactNode } from 'react'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface DashboardMetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: {
    value: number
    isPositive: boolean
    label: string
  }
  icon?: ReactNode
  action?: {
    label: string
    onClick: () => void
  }
  variant?: 'default' | 'success' | 'warning' | 'info'
  className?: string
}

const variantClass: Record<NonNullable<DashboardMetricCardProps['variant']>, string> = {
  default: 'ring-foreground/10',
  success: 'ring-emerald-500/25 bg-emerald-500/[0.03]',
  warning: 'ring-amber-500/25 bg-amber-500/[0.03]',
  info: 'ring-sky-500/25 bg-sky-500/[0.03]',
}

export function DashboardMetricCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  action,
  variant = 'default',
  className,
}: DashboardMetricCardProps) {
  return (
    <Card className={cn('gap-0 py-0', variantClass[variant], className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-3 border-b border-border/60 pb-3 pt-4">
        <div className="min-w-0 space-y-1">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
        </div>
        {icon ? (
          <div className="shrink-0 text-primary [&_svg]:size-5">{icon}</div>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-2 pb-4 pt-4">
        <div className="text-2xl font-bold tracking-tight text-foreground">
          {value}
        </div>
        {subtitle ? (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
        {trend ? (
          <div
            className={cn(
              'inline-flex items-center gap-1 text-xs font-medium',
              trend.isPositive ? 'text-emerald-600' : 'text-red-600',
            )}
          >
            {trend.isPositive ? (
              <TrendingUp className="size-3.5" aria-hidden />
            ) : (
              <TrendingDown className="size-3.5" aria-hidden />
            )}
            <span>
              {trend.isPositive ? '+' : '−'}
              {trend.value}%
            </span>
            <span className="font-normal text-muted-foreground">{trend.label}</span>
          </div>
        ) : null}
      </CardContent>
      {action ? (
        <CardFooter className="border-t border-border/60 bg-muted/30">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full border-primary/30 text-primary hover:bg-primary/5"
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        </CardFooter>
      ) : null}
    </Card>
  )
}
