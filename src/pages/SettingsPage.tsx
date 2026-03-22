import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

type Role = 'formadur' | 'gjaldkeri' | 'ritari' | 'notandi'

const roleLabel: Record<Role, string> = {
  formadur: 'FORMAÐUR',
  gjaldkeri: 'GJALDKERI',
  ritari: 'RITARI',
  notandi: 'NOTANDI',
}

export type SettingsSection = 'profile' | 'security' | 'preferences' | 'notification'

const SETTINGS_SECTIONS: Array<{ id: SettingsSection; label: string }> = [
  { id: 'profile', label: 'Mínar upplýsingar' },
  { id: 'security', label: 'Öryggi' },
  { id: 'preferences', label: 'Notendastillingar' },
  { id: 'notification', label: 'Tilkynningar' },
]

function isSettingsSection(value: string | null): value is SettingsSection {
  return (
    value === 'profile' ||
    value === 'security' ||
    value === 'preferences' ||
    value === 'notification'
  )
}

export function SettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  // TODO: Wire to real user profile data (Supabase)
  const currentUser = useMemo(
    () => ({
      name: 'Edda Falak',
      role: 'formadur' as Role,
      apartmentLabel: 'íbúð 0301',
      phone: '7804508',
      email: 'Eddafalak91@gmail.com',
      kennitala: '1412913199',
      ibuanumer: '301',
    }),
    [],
  )

  const [activeSection, setActiveSection] = useState<SettingsSection>('profile')

  useEffect(() => {
    const raw = searchParams.get('tab')
    if (raw && isSettingsSection(raw)) {
      setActiveSection(raw)
    }
  }, [searchParams])

  function selectSection(id: SettingsSection) {
    setActiveSection(id)
    setSearchParams({ tab: id }, { replace: true })
  }

  const [firstName, setFirstName] = useState('Edda')
  const [lastName, setLastName] = useState('Falak')
  const [netfang, setNetfang] = useState(currentUser.email)
  const [simanumer, setSimanumer] = useState(currentUser.phone)
  const [kennitala, setKennitala] = useState(currentUser.kennitala)
  const [ibuannumer, setIbuannumer] = useState(currentUser.ibuanumer)
  const [hutverkur, setHutverkur] = useState(currentUser.role === 'formadur' ? 'Formaður' : '—')
  const [hutverkur2, setHutverkur2] = useState(currentUser.role === 'formadur' ? 'Formaður' : '—')

  return (
    <div>
      {/* Tabs (floating above the main white card) */}
      <div className="w-fit rounded-[6px] bg-[#f0f1f3] px-[2px] py-[2px] h-[44px]">
        <div className="flex h-full items-stretch gap-[4px]">
          {SETTINGS_SECTIONS.map((s) => {
            const isActive = s.id === activeSection
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => selectSection(s.id)}
                className={[
                  'px-4 py-1 rounded text-[14px] leading-4 transition-colors h-full',
                  isActive
                    ? 'bg-white text-black font-bold'
                    : 'text-[#666] font-medium hover:bg-white/50',
                ].join(' ')}
              >
                {s.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Main card */}
      <div className="mt-[12px] rounded-xl bg-white shadow-[0px_0px_24px_-4px_rgba(0,0,0,0.05)]">
        <div className="px-[32px] py-[28px]">
          <section>
            {activeSection === 'profile' ? (
              <>
            {/* User header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[16px] font-bold leading-5 text-[#323232]">{currentUser.name}</div>
                <div className="text-[12px] leading-4 text-[#666]">{currentUser.apartmentLabel}</div>
              </div>

              <div className="inline-flex items-center rounded-full bg-[#dfffb4] px-3 py-1 text-[12px] font-bold leading-4 text-[#18325a]">
                {roleLabel[currentUser.role]}
              </div>
            </div>

            <div className="mt-5 h-px bg-[#f2f3f4]" />

            <div className="mt-5 grid gap-5">
            <div>
              <div className="text-[14px] font-bold leading-5 text-[#323232]">Mínar upplýsingar</div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-[14px] font-medium leading-4 text-[#323232]">Nafn</label>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="h-11 rounded-md border border-[#e6e8e9] bg-white px-4 text-[14px] outline-none focus-visible:ring-2 focus-visible:ring-black/10"
                  placeholder="Edda"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-[14px] font-medium leading-4 text-[#323232]">Eftirnafn</label>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="h-11 rounded-md border border-[#e6e8e9] bg-white px-4 text-[14px] outline-none focus-visible:ring-2 focus-visible:ring-black/10"
                  placeholder="Falak"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-[14px] font-medium leading-4 text-[#323232]">Netfang</label>
                <input
                  value={netfang}
                  onChange={(e) => setNetfang(e.target.value)}
                  className="h-11 rounded-md border border-[#e6e8e9] bg-white px-4 text-[14px] outline-none focus-visible:ring-2 focus-visible:ring-black/10"
                  placeholder="eddafalak91@gmail.com"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-[14px] font-medium leading-4 text-[#323232]">Símanúmer</label>
                <input
                  value={simanumer}
                  onChange={(e) => setSimanumer(e.target.value)}
                  className="h-11 rounded-md border border-[#e6e8e9] bg-white px-4 text-[14px] outline-none focus-visible:ring-2 focus-visible:ring-black/10"
                  placeholder="7804508"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-[14px] font-medium leading-4 text-[#323232]">Kennitala</label>
                <input
                  value={kennitala}
                  onChange={(e) => setKennitala(e.target.value)}
                  className="h-11 rounded-md border border-[#e6e8e9] bg-white px-4 text-[14px] outline-none focus-visible:ring-2 focus-visible:ring-black/10"
                  placeholder="1412913199"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-[14px] font-medium leading-4 text-[#323232]">íbúðarnúmer</label>
                <input
                  value={ibuannumer}
                  onChange={(e) => setIbuannumer(e.target.value)}
                  className="h-11 rounded-md border border-[#e6e8e9] bg-white px-4 text-[14px] outline-none focus-visible:ring-2 focus-visible:ring-black/10"
                  placeholder="301"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-[14px] font-medium leading-4 text-[#323232]">Hlutverk</label>
                <input
                  value={hutverkur}
                  onChange={(e) => setHutverkur(e.target.value)}
                  className="h-11 rounded-md border border-[#e6e8e9] bg-white px-4 text-[14px] outline-none focus-visible:ring-2 focus-visible:ring-black/10"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-[14px] font-medium leading-4 text-[#323232]">Hlutverk</label>
                <input
                  value={hutverkur2}
                  onChange={(e) => setHutverkur2(e.target.value)}
                  className="h-11 rounded-md border border-[#e6e8e9] bg-white px-4 text-[14px] outline-none focus-visible:ring-2 focus-visible:ring-black/10"
                />
              </div>
            </div>
            </div>

            {/* Footer action */}
            <div className="mt-10 flex justify-end">
              <button
                type="button"
                className="w-[200px] h-[44px] rounded-md bg-[#18325a] px-4 text-[14px] font-bold text-white hover:bg-[#162b47]"
                onClick={() => {
                  // eslint-disable-next-line no-console
                  console.log('settings-save', {
                    firstName,
                    lastName,
                    netfang,
                    simanumer,
                    kennitala,
                    ibuannumer,
                    hutverkur,
                    hutverkur2,
                  })
                }}
              >
                Vista
              </button>
            </div>
              </>
            ) : (
              <div className="py-8 text-[14px] leading-relaxed text-[#666]">
                {activeSection === 'security' && 'Öryggisstillingar — í vinnslu.'}
                {activeSection === 'preferences' && 'Notendastillingar — í vinnslu.'}
                {activeSection === 'notification' && 'Tilkynningar — í vinnslu.'}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

