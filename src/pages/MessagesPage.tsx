import { Button } from '@/components/ui/button'
import { MessageCircle, MessagesSquare, Search, User2 } from 'lucide-react'

export function MessagesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Skilaboð</h1>
          <p className="text-sm text-muted-foreground">
            Hópspjall og einkaskilaboð fyrir eigendur hússins.
          </p>
        </div>
      </div>

      <div className="inline-flex rounded-lg border bg-muted p-1 text-xs">
        <button className="rounded-md bg-background px-3 py-1 font-medium">
          Hópspjall
        </button>
        <button className="rounded-md px-3 py-1 text-muted-foreground">
          Einkaskilaboð
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        {/* Notendalisti / einkaskilaboð */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm w-full">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground/60"
              placeholder="Leita að eiganda..."
            />
          </div>

          <div className="rounded-lg border bg-card p-3 text-sm text-muted-foreground">
            <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase text-foreground/70">
              <User2 className="h-3.5 w-3.5" />
              Íbúar
            </div>
            <p>Hér birtast íbúar þegar gagnagrunnur hefur verið tengdur.</p>
          </div>
        </div>

        {/* Spjall */}
        <div className="flex h-[420px] flex-col rounded-lg border bg-card">
          <div className="flex items-center justify-between border-b px-4 py-2.5">
            <div className="flex items-center gap-2 text-sm">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <MessagesSquare className="h-4 w-4" />
              </div>
              <div>
                <div className="font-medium leading-tight">Hópspjall</div>
                <div className="text-[11px] text-muted-foreground">
                  Fyrir allar 6 íbúðir
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3 text-sm text-muted-foreground">
            <div className="rounded-lg bg-muted px-3 py-2 text-left">
              <div className="text-xs font-medium text-foreground">
                Kerfið
              </div>
              <div className="mt-1">
                Hópspjall virkjast þegar við tengjum Supabase Realtime.
              </div>
            </div>
          </div>

          <form className="border-t px-3 py-2">
            <div className="flex items-end gap-2">
              <textarea
                rows={1}
                className="min-h-[40px] max-h-24 flex-1 resize-none rounded-lg border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/60"
                placeholder="Skrifaðu skilaboð..."
              />
              <Button size="sm" className="px-3">
                <MessageCircle className="mr-1.5 h-4 w-4" />
                Senda
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

