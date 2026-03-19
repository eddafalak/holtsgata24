import { Button } from '@/components/ui/button'
import { CalendarRange, Plus, Receipt, Search } from 'lucide-react'

export function BillsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Reikningar og skjöl
          </h1>
          <p className="text-sm text-muted-foreground">
            Fjárhagsyfirlit hússins, reikningar og tengd skjöl.
          </p>
        </div>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Hlaða upp reikningi
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase">
            Heildarkostnaður í þessum mánuði
          </p>
          <p className="mt-2 text-2xl font-semibold">0 kr.</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase">
            Heildarkostnaður á árinu
          </p>
          <p className="mt-2 text-2xl font-semibold">0 kr.</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase">
            Kostnaður á íbúð (6 íbúðir)
          </p>
          <p className="mt-2 text-2xl font-semibold">0 kr.</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="inline-flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm w-full md:w-80">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground/60"
            placeholder="Leita að reikningi..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Button variant="outline" size="xs">
            Allir
          </Button>
          <Button variant="outline" size="xs">
            Vatn
          </Button>
          <Button variant="outline" size="xs">
            Hiti
          </Button>
          <Button variant="outline" size="xs">
            Rafmagn
          </Button>
          <Button variant="outline" size="xs">
            Viðhald
          </Button>
          <Button variant="outline" size="xs">
            Annað
          </Button>

          <div className="ml-auto inline-flex items-center gap-1 rounded-lg border bg-background px-2 py-1 text-xs">
            <CalendarRange className="h-3.5 w-3.5" />
            Dagsetningabil
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-dashed bg-card/40 p-6 text-center text-sm text-muted-foreground">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
          <Receipt className="h-5 w-5" />
        </div>
        <p className="font-medium">Engir reikningar skráðir ennþá.</p>
        <p className="mt-1">
          Hlaðið upp reikningi til að byrja að byggja upp yfirlit yfir kostnað.
        </p>
      </div>
    </div>
  )
}

