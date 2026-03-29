import { useCallback, useEffect, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Bell, Globe, Lock, UserRound } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog'
import { TextField, labelTextVariants, shellVariants } from '@/components/ui/text-field'
import { useAuth } from '@/hooks/useAuth'
import { HOLTSGATA24_APARTMENTS } from '@/data/holtsgata24-apartments'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import type { Apartment } from '@/types'
import type { Role } from '@/types'

const ROLE_BADGE: Record<Role, string> = {
  formadur: 'FORMAÐUR',
  gjaldkeri: 'GJALDKERI',
  ritari: 'RITARI',
  eigandi: 'EIGANDI',
}

function splitFullName(full: string | null | undefined) {
  const t = (full ?? '').trim()
  if (!t) return { first: '', last: '' }
  const parts = t.split(/\s+/)
  return { first: parts[0] ?? '', last: parts.slice(1).join(' ') }
}

function formatSaveError(err: unknown): string {
  if (err && typeof err === 'object' && 'message' in err) {
    const o = err as { message?: string; details?: string; hint?: string }
    const parts = [o.message, o.details, o.hint].filter((x) => x && String(x).trim())
    return parts.length > 0 ? parts.join(' — ') : 'Villa við vistun.'
  }
  if (err instanceof Error) return err.message
  return 'Villa við vistun.'
}

function isRole(value: string | null | undefined): value is Role {
  return value === 'formadur' || value === 'gjaldkeri' || value === 'ritari' || value === 'eigandi'
}

const ROLE_OPTIONS: Array<{ value: Role; label: string }> = [
  { value: 'formadur', label: 'Formaður' },
  { value: 'ritari', label: 'Ritari' },
  { value: 'gjaldkeri', label: 'Gjaldkeri' },
  { value: 'eigandi', label: 'Eigandi' },
]

async function fetchApartments(): Promise<Apartment[]> {
  const { data, error } = await supabase.from('apartments').select('*').order('name', { ascending: true })
  if (error) throw error
  return (data ?? []) as Apartment[]
}

const settingsSelectTriggerClass = cn(
  shellVariants({ size: 'lg' }),
  'w-full shrink-0 items-stretch justify-start gap-0 border-0 bg-white py-0 pl-3 pr-3 text-left shadow-none outline-none transition-colors',
  'focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/15',
  /* Yfir röðun í `SelectTrigger` (h-8 / h-7) — Large reitur er alltaf 56px. */
  'data-[size=default]:h-[56px] data-[size=sm]:h-[56px]',
  '[&>svg]:size-5 [&>svg]:shrink-0 [&>svg]:self-center',
  'text-[16px] leading-6 text-[#1a1a1a] data-placeholder:text-[#666]',
)

function SettingsInfoRow({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  isLast,
}: {
  icon: typeof UserRound
  title: string
  description: string
  actionLabel: string
  onAction: () => void
  isLast?: boolean
}) {
  return (
    <div
      className={cn(
        'flex h-[88px] flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6',
        !isLast && 'border-b border-[#e5e5e5]',
      )}
    >
      <div className="flex min-w-0 flex-1 gap-5">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[#e5e5e5] bg-white">
          <Icon className="size-5 text-[#323232]" aria-hidden />
        </div>
        <div className="min-w-0 space-y-0.5">
          <p className="text-sm font-medium leading-5 text-[#1a1a1a]">{title}</p>
          <p className="text-sm leading-relaxed text-[#666]">{description}</p>
        </div>
      </div>
      <div className="flex shrink-0 sm:pl-4">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 rounded-full px-4 text-xs font-medium text-[#094e5d] hover:bg-[#094e5d]/8 hover:text-[#094e5d]"
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      </div>
    </div>
  )
}

export function SettingsPage() {
  const queryClient = useQueryClient()
  const { user, profile, refreshProfile } = useAuth()

  const {
    data: remoteApartments,
    isPending: apartmentsPending,
    isError: apartmentsError,
    error: apartmentsQueryError,
  } = useQuery({
    queryKey: ['apartments-list'],
    queryFn: fetchApartments,
    enabled: isSupabaseConfigured(),
    staleTime: 60_000,
  })

  const apartmentsForSelect = useMemo(() => {
    if (!remoteApartments || remoteApartments.length === 0) return [] as Apartment[]
    return remoteApartments
  }, [remoteApartments])

  const hasApartmentRows = apartmentsForSelect.length > 0

  const fallbackApartmentsForSelect = useMemo(
    () =>
      HOLTSGATA24_APARTMENTS.map((a) => ({
        id: a.id,
        name: a.name,
        property_number: a.property_number,
        size: a.size,
        created_at: new Date().toISOString(),
      })),
    [],
  )

  const selectApartments = apartmentsForSelect.length > 0 ? apartmentsForSelect : fallbackApartmentsForSelect

  const apartmentById = useMemo(() => {
    const m = new Map<string, { name: string; property_number: string }>()
    for (const a of HOLTSGATA24_APARTMENTS) {
      m.set(a.id, { name: a.name, property_number: a.property_number })
    }
    if (remoteApartments) {
      for (const a of remoteApartments) {
        m.set(a.id, { name: a.name, property_number: a.property_number })
      }
    }
    return m
  }, [remoteApartments])

  const [editDetailsOpen, setEditDetailsOpen] = useState(false)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [netfang, setNetfang] = useState('')
  const [simanumer, setSimanumer] = useState('')
  const [kennitala, setKennitala] = useState('')
  const [apartmentId, setApartmentId] = useState<string>('')
  const [role, setRole] = useState<Role>('eigandi')
  const [formHydrated, setFormHydrated] = useState(false)

  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const hydrateFromProfile = useCallback(() => {
    const full = profile?.full_name ?? (user?.user_metadata?.full_name as string | undefined) ?? ''
    const { first, last } = splitFullName(full)
    setFirstName(first)
    setLastName(last)
    setNetfang(profile?.email ?? user?.email ?? '')
    setSimanumer(profile?.phone ?? '')
    setKennitala('')
    setApartmentId(profile?.apartment_id ?? '')
    setRole(isRole(profile?.role) ? profile.role : 'eigandi')
    setFormHydrated(true)
  }, [profile, user])

  useEffect(() => {
    hydrateFromProfile()
  }, [hydrateFromProfile])

  const apartmentShortLabel = useMemo(() => {
    const id = apartmentId || profile?.apartment_id
    if (!id) return ''
    const apt = apartmentById.get(id)
    if (!apt) return ''
    const m = apt.name.match(/íbúð\s+(\d+)/i)
    return m ? `Íbúð ${m[1]}` : apt.name.replace(/^Holtsgata\s*24,\s*/i, '')
  }, [apartmentById, apartmentId, profile?.apartment_id])

  const roleLabel = ROLE_OPTIONS.find((r) => r.value === role)?.label ?? 'Eigandi'

  const userDetailsDescription = useMemo(() => {
    const parts = [netfang.trim() || profile?.email || user?.email || '']
    if (apartmentShortLabel) parts.push(apartmentShortLabel)
    parts.push(roleLabel)
    return parts.filter(Boolean).join(' · ')
  }, [apartmentShortLabel, netfang, profile?.email, roleLabel, user?.email])

  function openEditDetails() {
    setSaveError(null)
    hydrateFromProfile()
    setEditDetailsOpen(true)
  }

  async function handleSave() {
    setSaveError(null)
    if (!isSupabaseConfigured()) {
      setSaveError('Supabase er ekki stillt — ekki er hægt að vista í gagnagrunn.')
      return
    }
    if (!user?.id) {
      setSaveError('Þú þarft að skrá þig inn til að vista.')
      return
    }

    const full_name = [firstName, lastName].map((s) => s.trim()).filter(Boolean).join(' ').trim()
    const apt = hasApartmentRows ? (apartmentId || null) : null

    setSaving(true)
    try {
      const { data: updatedRows, error } = await supabase
        .from('profiles')
        .update({
          full_name: full_name || null,
          email: netfang.trim() || null,
          phone: simanumer.trim() || null,
          apartment_id: apt,
          role,
        })
        .eq('id', user.id)
        .select('id')

      if (error) {
        setSaveError(formatSaveError(error))
        return
      }

      if (!updatedRows || updatedRows.length === 0) {
        setSaveError('Ekki tókst að vista: prófíl fannst ekki (profiles).')
        return
      }

      await refreshProfile()
      await queryClient.invalidateQueries({ queryKey: ['apartments-with-residents'] })
      setEditDetailsOpen(false)
    } catch (e) {
      setSaveError(formatSaveError(e))
    } finally {
      setSaving(false)
    }
  }

  const canSave = isSupabaseConfigured() && Boolean(user) && formHydrated

  function placeholderComingSoon() {
    window.alert('Þessi eiginleiki er í vinnslu.')
  }

  return (
    <div className="space-y-4">
      <div
        className="overflow-hidden rounded-lg bg-white shadow-[0px_0px_24px_0px_rgba(0,0,0,0.05)] ring-1 ring-[#e5e5e5]/80"
        data-settings-card-stack
      >
        <SettingsInfoRow
          icon={UserRound}
          title="Notandaupplýsingar"
          description={userDetailsDescription || 'Bættu við netfangi og íbúð til að fullgera prófílinn.'}
          actionLabel="Breyta upplýsingum"
          onAction={openEditDetails}
        />
        <SettingsInfoRow
          icon={Lock}
          title="Lykilorð"
          description="*************"
          actionLabel="Breyta lykilorði"
          onAction={placeholderComingSoon}
        />
        <SettingsInfoRow
          icon={Bell}
          title="Tilkynningar"
          description="Ekki missa af neinu — stilltu tilkynningar eftir þínum óskum."
          actionLabel="Breyta tilkynningum"
          onAction={placeholderComingSoon}
        />
        <SettingsInfoRow
          icon={Globe}
          title="Tungumál"
          description="Íslenska"
          actionLabel="Skipta um tungumál"
          onAction={placeholderComingSoon}
          isLast
        />
      </div>

      <Dialog open={editDetailsOpen} onOpenChange={setEditDetailsOpen}>
        <DialogContent side="right" className="flex max-h-none flex-col gap-0 overflow-hidden p-0">
          <div className="relative shrink-0 border-b border-[#f2f3f4] bg-white px-6 pb-4 pt-5 pr-14 shadow-[0px_2px_8px_0px_rgba(0,0,0,0.05)]">
            <DialogTitle className="text-left text-[18px] font-semibold leading-6 text-[#1a1a1a]">
              Þínar upplýsingar
            </DialogTitle>
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-6">
              {!isSupabaseConfigured() ? (
                <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
                  Vistun virkar ekki fyrr en <code className="rounded bg-amber-100/80 px-1">.env.local</code> er stillt
                  fyrir Supabase.
                </div>
              ) : null}

              {isSupabaseConfigured() && apartmentsPending ? (
                <p className="text-sm text-muted-foreground">Sæki lista yfir íbúðir…</p>
              ) : null}

              {isSupabaseConfigured() && apartmentsError ? (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
                  Ekki tókst að sækja íbúðir: {formatSaveError(apartmentsQueryError)}
                </div>
              ) : null}

              {isSupabaseConfigured() && !apartmentsPending && !apartmentsError && !hasApartmentRows ? (
                <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                  Engar íbúðir í gagnagrunni — valin íbúð verður ekki vistuð fyrr en gögn eru sett inn.
                </div>
              ) : null}

              {saveError ? (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
                  {saveError}
                </div>
              ) : null}

              <div className="grid gap-3">
                <p className="text-[14px] font-medium leading-5 text-[rgba(0,0,0,0.87)]">Aðgangur</p>
                <div className="rounded bg-[#fbfbfc] py-6 px-[24px]">
                  <div className="grid gap-4">
                    <TextField
                      id="settings-email"
                      size="lg"
                      label="Netfang"
                      type="email"
                      value={netfang}
                      onChange={(e) => setNetfang(e.target.value)}
                      placeholder="netfang@dæmi.is"
                      disabled={!canSave}
                      autoComplete="email"
                    />

                    <div className="space-y-1">
                      <Select
                        value={apartmentId || '__none__'}
                        onValueChange={(v) => setApartmentId(v === '__none__' ? '' : v)}
                        disabled={!canSave}
                      >
                        <SelectTrigger className={settingsSelectTriggerClass}>
                          <div className="flex min-w-0 flex-1 flex-col items-start gap-0.5 py-1.5 text-left">
                            <span className={labelTextVariants({ size: 'lg' })}>Íbúð</span>
                            <SelectValue placeholder="Veldu íbúð" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">Veldu íbúð…</SelectItem>
                          {selectApartments.map((a) => (
                            <SelectItem key={a.id} value={a.id}>
                              {a.name} ({a.property_number})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Select
                        value={role}
                        onValueChange={(v) => setRole(isRole(v) ? v : 'eigandi')}
                        disabled={!canSave}
                      >
                        <SelectTrigger className={settingsSelectTriggerClass}>
                          <div className="flex min-w-0 flex-1 flex-col items-start gap-0.5 py-1.5 text-left">
                            <span className={labelTextVariants({ size: 'lg' })}>Hlutverk</span>
                            <SelectValue placeholder="Veldu hlutverk" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          {ROLE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[#e5e5e5] bg-white px-3 py-2.5 text-xs leading-relaxed text-[#666]">
                      <span className="font-semibold text-[#18325a]">{ROLE_BADGE[role]}</span>
                      <span>— birting á yfirliti og hjá eigendum</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-3">
                <p className="text-[14px] font-medium leading-5 text-[rgba(0,0,0,0.87)]">
                  Persónuupplýsingar
                </p>
                <div className="rounded bg-[#fbfbfc] py-6 px-[24px]">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="min-w-0 sm:col-span-1">
                      <TextField
                        id="settings-first"
                        size="lg"
                        label="Fornafn"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Fornafn"
                        disabled={!canSave}
                        autoComplete="given-name"
                      />
                    </div>
                    <div className="min-w-0 sm:col-span-1">
                      <TextField
                        id="settings-last"
                        size="lg"
                        label="Eftirnafn"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Eftirnafn"
                        disabled={!canSave}
                        autoComplete="family-name"
                      />
                    </div>
                    <div className="min-w-0 sm:col-span-2">
                      <TextField
                        id="settings-phone"
                        size="lg"
                        label="Símanúmer"
                        value={simanumer}
                        onChange={(e) => setSimanumer(e.target.value)}
                        placeholder="581 2345"
                        disabled={!canSave}
                        autoComplete="tel"
                      />
                    </div>
                    <div className="min-w-0 sm:col-span-2">
                      <TextField
                        id="settings-kt"
                        size="lg"
                        label="Kennitala"
                        value={kennitala}
                        onChange={(e) => setKennitala(e.target.value)}
                        placeholder="—"
                        disabled
                        title="Ekki vistað í prófíl ennþá"
                        supportingText="Í vinnslu — ekki vistað í gagnagrunni ennþá."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="shrink-0 border-t border-[#f2f3f4] bg-[#fbfbfb] px-6 py-4">
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-md border-[#e6e8e9] bg-white px-4 text-[14px] font-bold text-black hover:bg-black/[0.03]"
                onClick={() => {
                  hydrateFromProfile()
                  setSaveError(null)
                  setEditDetailsOpen(false)
                }}
              >
                Hætta við
              </Button>
              <Button
                type="button"
                className="h-11 rounded-md border-0 bg-[#18325a] px-4 text-[14px] font-bold text-white hover:bg-[#162b47]"
                disabled={!canSave || saving}
                onClick={() => void handleSave()}
              >
                {saving ? 'Vista…' : 'Vista'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
