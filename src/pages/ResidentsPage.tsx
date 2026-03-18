import { Home, Phone, User2 } from 'lucide-react'
import { useResidents } from '@/hooks/useResidents'

export function ResidentsPage() {
  const { data, isLoading, isError } = useResidents()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Eigendur</h1>
        <p className="text-sm text-muted-foreground">
          Yfirlit yfir íbúa og íbúðir í húsinu.
        </p>
      </div>

      {isLoading && (
        <div className="text-sm text-muted-foreground">Sæki íbúa og íbúðir...</div>
      )}

      {isError && (
        <div className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          Villa kom upp við að sækja gögn. Reyndu aftur síðar.
        </div>
      )}

      {!isLoading && !isError && data && data.length === 0 && (
        <div className="rounded-lg border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          Engar íbúðir hafa verið skráðar ennþá.
        </div>
      )}

      {!isLoading && !isError && data && data.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {data.map((apt) => (
            <div key={apt.id} className="rounded-lg border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Home className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{apt.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {apt.property_number} · {apt.size} m²
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-md border bg-muted/60 p-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2 text-xs font-medium uppercase text-foreground/70">
                  <User2 className="h-3.5 w-3.5" />
                  Eigendur
                </div>

                {apt.residents.length === 0 ? (
                  <p className="mt-1">
                    Enginn eigandi hefur verið skráður fyrir þessari íbúð ennþá.
                  </p>
                ) : (
                  <div className="mt-2 space-y-2 text-foreground/80">
                    {apt.residents.map((resident) => (
                      <div
                        key={resident.id}
                        className="flex flex-wrap items-center justify-between gap-2 text-xs"
                      >
                        <div>
                          <div className="font-medium">
                            {resident.full_name ?? 'Nafn ótilgreint'}
                          </div>
                          <div className="text-muted-foreground">
                            {resident.role ?? 'Eigandi'}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-3 text-foreground/80">
                          {resident.phone && (
                            <span className="inline-flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              <span>{resident.phone}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

