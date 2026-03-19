import { Mail, Phone, Plus, Search } from 'lucide-react'
import { ChevronRight } from 'lucide-react'
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
  const [expandedApartmentIds, setExpandedApartmentIds] = useState<Set<string>>(
    () => new Set(),
  )
  // Figma assets for the apartment table row.
  // Generated from node-id `109:1975` in the Figma MCP workflow.
  const imgVectorResidents = 'http://localhost:3845/assets/ddfe367ea94f000b6638706d7d7094ccb7b66941.svg'
  const imgVectorSize = 'http://localhost:3845/assets/c8f12d2743cc0c98553a2e763a68e58c0d4b5b07.svg'
  const cardBoxShadow = '0px 0px 24px -4px rgba(0, 0, 0, 0.05)'
  const tableBoxShadow = '0px 0px 24px 0px rgba(0, 0, 0, 0.05)'

  function toggleApartment(id: string) {
    setExpandedApartmentIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

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
    <div className="flex flex-col gap-2">
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
        <div className="flex flex-col gap-2">
          {filtered.map((apt) => {
            if (!apt) return null
            const isExpanded = expandedApartmentIds.has(apt.id)
            return (
              <div
                key={apt.id}
                className="rounded-lg bg-white shadow-[0px_0px_24px_0px_rgba(0,0,0,0.05)] overflow-hidden"
                style={{ boxShadow: tableBoxShadow }}
              >
                <div
                  className="flex w-full items-center justify-center gap-4 p-5"
                  onClick={() => toggleApartment(apt.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') toggleApartment(apt.id)
                  }}
                  aria-expanded={isExpanded}
                >
                  <div className="flex flex-[1_0_0] flex-col gap-1">
                    <div className="text-[16px] font-medium leading-[20px] text-[#323232]">
                      {apt.name}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-[12px] leading-[1.5] text-[#666]">
                        Fasteignanúmer {apt.property_number}
                      </div>
                      <div className="flex items-center gap-[4px] text-[12px] leading-[1.5] text-[#666]">
                        <img
                          src={imgVectorResidents}
                          alt=""
                          className="h-[8.757px] w-[13.759px] shrink-0"
                          aria-hidden="true"
                        />
                        <span>
                          {apt.residents.length} {apt.residents.length === 1 ? 'eigandi' : 'eigendur'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-[0_0_auto] items-center gap-[8px] px-3">
                    <div className="flex items-center justify-center gap-[8px]">
                      <img
                        src={imgVectorSize}
                        alt=""
                        className="h-[14px] w-[14px] shrink-0"
                        aria-hidden="true"
                      />
                      <div className="text-[14px] font-medium leading-[20px] text-[#323232]">
                        {apt.size}m
                      </div>
                    </div>
                    <div
                      className={cn(
                        'w-[16px] h-[16px] flex items-center justify-center shrink-0 transition-transform',
                        isExpanded ? 'rotate-90' : 'rotate-0',
                      )}
                      aria-hidden="true"
                    >
                      <ChevronRight className="h-4 w-4 text-[#323232]" />
                    </div>
                  </div>
                </div>

                {isExpanded ? (
                  <div
                    id={`apartment-${apt.id}-details`}
                    className="border-t border-[#f2f3f4] px-5 py-4"
                  >
                    <div className="flex flex-col gap-3">
                      {apt.residents.length === 0 ? (
                        <div className="rounded-lg bg-[rgba(242,243,244,0.3)] p-6 text-[14px] leading-5 text-[#666]">
                          Enginn eigandi hefur verið skráður fyrir þessari íbúð ennþá.
                        </div>
                      ) : (
                        apt.residents.map((resident) => (
                          <div
                            key={resident.id}
                            className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-[rgba(242,243,244,0.3)] p-6"
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
                ) : null}
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

