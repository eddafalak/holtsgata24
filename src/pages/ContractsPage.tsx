import { Button } from '@/components/ui/button'
import { FilePlus2, FileText, Search } from 'lucide-react'

export function ContractsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Samningar</h1>
          <p className="text-sm text-muted-foreground">
            Geymsla á samningum, þjónustusamningum og öðrum skjölum.
          </p>
        </div>
        <Button size="sm">
          <FilePlus2 className="mr-2 h-4 w-4" />
          Hlaða upp samningi
        </Button>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="inline-flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm w-full md:w-80">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground/60"
            placeholder="Leita að samningi..."
          />
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <Button variant="outline" size="xs">
            Allir
          </Button>
          <Button variant="outline" size="xs">
            Þjónusta
          </Button>
          <Button variant="outline" size="xs">
            Viðhald
          </Button>
          <Button variant="outline" size="xs">
            Annað
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-dashed bg-card/40 p-6 text-center text-sm text-muted-foreground md:col-span-3">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <FileText className="h-5 w-5" />
          </div>
          <p className="font-medium">Engir samningar skráðir ennþá.</p>
          <p className="mt-1">
            Hlaðið upp fyrsta samningnum til að byrja að safna skjölum á einn stað.
          </p>
        </div>
      </div>
    </div>
  )
}

