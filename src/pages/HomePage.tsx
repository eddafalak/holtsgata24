import { Button } from '@/components/ui/button'
import { CalendarClock, FileText, MessagesSquare, Plus } from 'lucide-react'

export function HomePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Yfirlit</h1>
          <p className="text-sm text-muted-foreground">
            Stutt yfirlit yfir stöðu húsfélagsins.
          </p>
        </div>
        <div className="hidden md:flex gap-2">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Bóka fund
          </Button>
          <Button size="sm" variant="outline">
            <MessagesSquare className="h-4 w-4 mr-2" />
            Senda skilaboð
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase">
              Væntanlegir fundir
            </span>
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-semibold">0</div>
          <p className="mt-1 text-xs text-muted-foreground">
            Enginn fundur skráður. Bættu við nýjum fundi þegar þú ert tilbúin(n).
          </p>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase">
              Nýjustu reikningar
            </span>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-semibold">0 kr.</div>
          <p className="mt-1 text-xs text-muted-foreground">
            Engir reikningar hafa verið skráðir í þessum mánuði.
          </p>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase">
              Ólesin skilaboð
            </span>
            <MessagesSquare className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-semibold">0</div>
          <p className="mt-1 text-xs text-muted-foreground">
            Öll skilaboð hafa verið lesin.
          </p>
        </div>
      </div>
    </div>
  )
}

