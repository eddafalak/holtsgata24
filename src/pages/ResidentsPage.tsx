import { Mail, Phone, Plus, Search } from 'lucide-react'
import { useResidents } from '@/hooks/useResidents'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useMemo, useState } from 'react'

const MOCK_APARTMENTS = [
  {
    id: 'mock-1',
    name: 'Íbúðareign 201',
    property_number: '0301303042',
    size: 100,
    residents: [
      {
        id: 'mock-r-1',
        full_name: 'Edda Falak',
        role: 'formadur',
        phone: '683454701',
        email: 'eddafalak91@gmail.com',
      },
      {
        id: 'mock-r-2',
        full_name: 'Edda Falak',
        role: null,
        phone: '683454701',
        email: 'eddafalak91@gmail.com',
      },
    ],
  },
  {
    id: 'mock-2',
    name: 'Íbúðareign 201',
    property_number: '0301303042',
    size: 100,
    residents: [
      {
        id: 'mock-r-3',
        full_name: 'Edda Falak',
        role: 'formadur',
        phone: '683454701',
        email: 'eddafalak91@gmail.com',
      },
      {
        id: 'mock-r-4',
        full_name: 'Edda Falak',
        role: null,
        phone: '683454701',
        email: 'eddafalak91@gmail.com',
      },
    ],
  },
] as const

function roleLabel(role: string | null | undefined) {
  switch (role) {
    case 'formadur':
      return 'Formaður'
    case 'gjaldkeri':
      return 'Gjaldkeri'
    case 'ritari':
      return 'Ritari'
    case 'eigandi':
      return 'Eigandi'
    default:
      return 'Eigandi'
  }
}

export function ResidentsPage() {
  const { data, isLoading, isError } = useResidents()
  const [search, setSearch] = useState('')
  const cardBoxShadow = '0px 0px 24px -4px rgba(0, 0, 0, 0.05)'
  const tableBoxShadow = '0px 0px 20px 0px rgba(0, 0, 0, 0.05)'

  const baseList = (data && data.length > 0 ? data : MOCK_APARTMENTS) as Array<{
    id: string
    name: string
    property_number: string
    size: number
    residents: Array<{
      id: string
      full_name: string | null
      role: string | null
      phone: string | null
      email?: string | null
    }>
  }>

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return baseList

    return baseList
      .map((apt) => {
        const matchesApt =
          apt.name.toLowerCase().includes(q) ||
          apt.property_number.toLowerCase().includes(q) ||
          String(apt.size).includes(q)
        const matchingResidents = apt.residents.filter((r) => {
          const name = (r.full_name ?? '').toLowerCase()
          const phone = (r.phone ?? '').toLowerCase()
          const email = (r.email ?? '').toLowerCase()
          const role = roleLabel(r.role).toLowerCase()
          return (
            name.includes(q) ||
            phone.includes(q) ||
            email.includes(q) ||
            role.includes(q)
          )
        })

        return matchesApt || matchingResidents.length > 0
          ? { ...apt, residents: matchesApt ? apt.residents : matchingResidents }
          : null
      })
      .filter(Boolean)
  }, [baseList, search])

  return (
    <div className="flex flex-col gap-4">
      <div
        className={cn('flex flex-col items-start overflow-hidden rounded-lg border border-[#f2f3f4] bg-white p-6')}
        style={{ boxShadow: cardBoxShadow }}
      >
        <div className="flex w-full flex-wrap items-end justify-between gap-4">
          <div className="flex w-[441px] flex-col gap-2">
            <label className="text-[14px] font-medium leading-4 text-[#666]">
              Leit
            </label>
            <div className="flex items-center gap-3 rounded-md border border-[#e6e8e9] bg-white px-4 py-3">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Leita að eiganda"
                className="min-w-0 flex-1 bg-transparent text-[16px] leading-[1.25] text-black outline-none placeholder:text-[#666]"
                aria-label="Leit"
              />
              <Search className="h-5 w-5 shrink-0 text-[#666]" />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              className="h-11 min-w-[44px] rounded-md bg-[#dfffb4] px-4 text-[14px] font-bold text-black hover:bg-[#cdf28c] border-0"
              onClick={() => {
                // TODO: Hook up to create resident/apartment flow
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Bæta við
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-11 min-w-[44px] rounded-md border-[#e6e8e9] bg-white px-4 text-[14px] font-bold text-black"
              onClick={() => {
                // TODO: Hook up to group message flow
              }}
            >
              Senda hópskilaboð
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-[14px] leading-5 text-[#666]">Sæki íbúa og íbúðir...</div>
      ) : null}

      {isError ? (
        <div className="text-[14px] leading-5 text-[#666]">
          Ekki tókst að sækja gögn (sýni sýnishorn).
        </div>
      ) : null}

      {filtered.length > 0 ? (
        <div className="flex flex-col gap-4">
          {filtered.map((apt) => {
            if (!apt) return null
            return (
              <div
                key={apt.id}
                className="rounded-lg bg-white p-6 shadow-[0px_0px_20px_0px_rgba(0,0,0,0.05)]"
                style={{ boxShadow: tableBoxShadow }}
              >
                <div className="flex w-full items-start justify-between gap-4">
                  <div className="flex flex-1 flex-col gap-1">
                    <div className="text-[16px] font-medium leading-5 text-[#323232]">
                      {apt.name}
                    </div>
                    <div className="text-[12px] leading-[1.5] text-[#666]">
                      Fasteignanúmer {apt.property_number}
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col items-end justify-center px-3">
                    <div className="text-[12px] leading-[1.5] text-[#666]">Stærð</div>
                    <div className="text-[14px] font-medium leading-5 text-[#323232]">
                      {apt.size} fm
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-3">
                  {apt.residents.length === 0 ? (
                    <div className="rounded-lg bg-[#fbfbfc] p-6 text-[14px] leading-5 text-[#666]">
                      Enginn eigandi hefur verið skráður fyrir þessari íbúð ennþá.
                    </div>
                  ) : (
                    apt.residents.map((resident) => (
                      <div
                        key={resident.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-[#fbfbfc] p-6"
                      >
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                          <div className="min-w-0 text-[16px] leading-5 text-[#323232]">
                            {resident.full_name ?? 'Nafn ótilgreint'}
                          </div>
                          {resident.role ? (
                            <>
                              <div className="h-3.5 w-px bg-[#a2a4a8]" />
                              <div className="text-[16px] leading-5 text-[#a2a4a8]">
                                {roleLabel(resident.role)}
                              </div>
                            </>
                          ) : null}
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {resident.phone ? (
                            <div className="flex items-center gap-2 px-3 text-[16px] leading-5 text-[#323232]">
                              <Phone className="h-5 w-5" />
                              <span>{resident.phone}</span>
                            </div>
                          ) : null}
                          {resident.email ? (
                            <div className="flex items-center gap-2 px-3 text-[16px] leading-5 text-[#323232]">
                              <Mail className="h-5 w-5" />
                              <span>{resident.email}</span>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="rounded-lg border border-[#f2f3f4] bg-white px-6 py-4 text-[14px] leading-5 text-[#666]">
          Engar íbúðir fundust.
        </div>
      )}
    </div>
  )
}

