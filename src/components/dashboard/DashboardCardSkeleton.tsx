import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export function DashboardCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn('gap-0 py-0', className)}>
      <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 pb-3 pt-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="size-8 rounded-md" />
      </CardHeader>
      <CardContent className="space-y-3 py-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-3 w-full max-w-[220px]" />
        <Skeleton className="h-3 w-28" />
      </CardContent>
      <CardFooter className="border-t border-border/60">
        <Skeleton className="h-9 w-full rounded-md" />
      </CardFooter>
    </Card>
  )
}
