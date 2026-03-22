import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { isSupabaseConfigured } from '@/lib/supabase'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@radix-ui/react-dropdown-menu'
import {
  Home,
  CalendarClock,
  FileText,
  Receipt,
  MessagesSquare,
  Users2,
  Bell,
  Settings as SettingsIcon,
  ChevronDown,
  UserRoundPlus,
  UserRound,
  KeyRound,
  CreditCard,
  Lightbulb,
  HelpCircle,
  LogOut,
  Palette,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type Role = 'formadur' | 'gjaldkeri' | 'ritari' | 'notandi'

const navItems = [
  { to: '/', label: 'Heim', icon: Home },
  { to: '/fundir', label: 'Fundir', icon: CalendarClock },
  { to: '/samningar', label: 'Samningar', icon: FileText },
  { to: '/reikningar', label: 'Reikningar og skjöl', icon: Receipt },
  { to: '/skilabod', label: 'Skilaboð', icon: MessagesSquare },
  { to: '/eigendur', label: 'Eigendur', icon: Users2 },
  { to: '/stillingar', label: 'Stillingar', icon: SettingsIcon },
]

const roleLabel: Record<Role | 'eigandi', string> = {
  formadur: 'Formaður húsfélags',
  gjaldkeri: 'Gjaldkeri',
  ritari: 'Ritari',
  eigandi: 'Eigandi',
  notandi: 'Notandi',
}

const pageTitleByPath: Record<string, string> = {
  '/': 'Heim',
  '/fundir': 'Fundir',
  '/samningar': 'Samningar',
  '/reikningar': 'Reikningar og skjöl',
  '/skilabod': 'Skilaboð',
  '/eigendur': 'Eigendur',
  '/stillingar': 'Tengiliðaupplýsingar',
}

const fallbackUser = {
  name: 'Edda Falak',
  role: 'formadur' as Role,
  apartmentLabel: 'Íbúð 0301',
}

export function AppLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { profile, user, signOut } = useAuth()
  const title = pageTitleByPath[location.pathname] ?? 'Húsfélag'
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const displayName =
    isSupabaseConfigured() && user
      ? (profile?.full_name ?? user.email ?? fallbackUser.name)
      : fallbackUser.name
  const roleKey: keyof typeof roleLabel =
    isSupabaseConfigured() && profile
      ? profile.role
        ? profile.role === 'eigandi'
          ? 'eigandi'
          : (profile.role as Role)
        : 'notandi'
      : fallbackUser.role

  return (
    <div className="min-h-screen flex gap-0 bg-[#18325a] p-4">
      {/* Sidebar – Figma: dark blue, nav only, green active */}
      <aside
        className="hidden md:flex h-full w-[328px] shrink-0 flex-col overflow-hidden pb-12 pt-[42px]"
        style={{ width: '291px', paddingRight: '36px', paddingLeft: '20px' }}
      >
        <div className="px-4">
          <div className="text-[24px] font-bold leading-[1.222] text-white">
            Húsfélag
          </div>
        </div>

        <nav className="mt-8 flex flex-1 flex-col gap-4">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    'rounded-lg px-4 py-2 text-[16px] leading-[1.2] transition-colors flex items-center gap-3',
                    isActive
                      ? 'bg-[#dfffb4] text-[#18325a] font-medium'
                      : 'text-white font-normal hover:bg-white/10',
                  ].join(' ')
                }
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        {import.meta.env.DEV ? (
          <div className="mt-auto shrink-0 px-4 pb-2 pt-6">
            <NavLink
              to="/design-system"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 rounded-lg px-4 py-2 text-xs leading-4 transition-colors',
                  isActive
                    ? 'bg-white/15 font-medium text-[#dfffb4]'
                    : 'text-white/45 hover:bg-white/10 hover:text-white/80',
                )
              }
            >
              <Palette className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
              Hönnunarkerfi
            </NavLink>
            <p className="mt-1 px-4 text-[10px] leading-3 text-white/35">Aðeins í þróun</p>
          </div>
        ) : null}
      </aside>

      {/* Main content – Figma: #fbfbfb, rounded */}
      <div className="flex-1 flex flex-col min-h-screen bg-[#fbfbfb] rounded-xl overflow-hidden py-0">
        <div className="flex flex-1 flex-col gap-4 bg-[#fbfbfb] p-[32px] w-full">
          <header className="h-12 bg-[#fbfbfb]">
            <div className="flex h-full w-full items-center justify-between gap-4">
              <h1 className="text-[24px] font-bold leading-[1.222] text-[#323232]">
                {title}
              </h1>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Tilkynningar"
                  className="relative h-10 w-10 rounded"
                >
                  <Bell className="h-6 w-6" />
                  <span
                    aria-hidden="true"
                    className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#F4743B]"
                  />
                </Button>
                <DropdownMenu open={userMenuOpen} onOpenChange={setUserMenuOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-12 w-[240px] justify-end gap-2 rounded border-[#f2f3f4] bg-white px-4 py-2 hover:bg-[#f7f8fa] data-[state=open]:bg-[#f7f8fa] focus-visible:ring-0 focus-visible:border-[#f2f3f4] focus:ring-0 focus:border-[#f2f3f4] focus:outline-none"
                    >
                      <div className="flex flex-1 flex-col items-start text-left">
                        <span className="text-[14px] font-bold leading-4 text-black">
                          {displayName}
                        </span>
                        <span className="text-[12px] font-normal leading-4 text-black">
                          {roleLabel[roleKey]}
                        </span>
                      </div>
                      <ChevronDown className="h-4 w-4 shrink-0" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    sideOffset={8}
                    className="w-[240px] rounded-[8px] border border-[#f2f3f4] bg-white p-0 shadow-[0px_0px_24px_0px_rgba(0,0,0,0.05)]"
                  >
                    <DropdownMenuItem
                      className="px-4 py-[12px] flex items-center gap-3 rounded-none text-[14px] leading-5 text-[#323232] hover:bg-[#f7f8fa]"
                      onSelect={(e) => {
                        e.preventDefault()
                        // eslint-disable-next-line no-console
                        console.log('switch-access')
                        setUserMenuOpen(false)
                      }}
                    >
                      <UserRoundPlus className="h-[20px] w-[20px] text-[#323232]" />
                      Skipta um aðgang
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="px-4 py-[12px] flex items-center gap-3 rounded-none text-[14px] leading-5 text-[#323232] hover:bg-[#f2f3f4]"
                      onSelect={(e) => {
                        e.preventDefault()
                        navigate('/stillingar?tab=profile')
                        setUserMenuOpen(false)
                      }}
                    >
                      <UserRound className="h-4 w-4 text-[#323232]" />
                      Mínar upplýsingar
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="px-4 py-[12px] flex items-center gap-3 rounded-none text-[14px] leading-5 text-[#323232] hover:bg-[#f7f8fa]"
                      onSelect={(e) => {
                        e.preventDefault()
                        // eslint-disable-next-line no-console
                        console.log('access-and-proxy')
                        setUserMenuOpen(false)
                      }}
                    >
                      <KeyRound className="h-4 w-4 text-[#323232]" />
                      Aðgangar og umboð
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="px-4 py-[12px] flex items-center gap-3 rounded-none text-[14px] leading-5 text-[#323232] hover:bg-[#f7f8fa]"
                      onSelect={(e) => {
                        e.preventDefault()
                        // eslint-disable-next-line no-console
                        console.log('payment-info')
                        setUserMenuOpen(false)
                      }}
                    >
                      <CreditCard className="h-4 w-4 text-[#323232]" />
                      Greiðsluupplýsingar
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="bg-[#e8efef]" />

                    <DropdownMenuItem
                      className="px-4 py-[12px] flex items-center gap-3 rounded-none text-[14px] leading-5 text-[#323232] hover:bg-[#f7f8fa]"
                      onSelect={(e) => {
                        e.preventDefault()
                        // eslint-disable-next-line no-console
                        console.log('council')
                        setUserMenuOpen(false)
                      }}
                    >
                      <Lightbulb className="h-4 w-4 text-[#323232]" />
                      Hollráð
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="px-4 py-[12px] flex items-center gap-3 rounded-none text-[14px] leading-5 text-[#323232] hover:bg-[#f7f8fa]"
                      onSelect={(e) => {
                        e.preventDefault()
                        // eslint-disable-next-line no-console
                        console.log('help')
                        setUserMenuOpen(false)
                      }}
                    >
                      <HelpCircle className="h-4 w-4 text-[#323232]" />
                      Aðstoð
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="bg-[#e8efef]" />

                    <DropdownMenuItem
                      className="px-4 py-[12px] flex items-center gap-3 rounded-none text-[14px] leading-5 text-[#323232] hover:bg-[#f7f8fa]"
                      onSelect={async (e) => {
                        e.preventDefault()
                        setUserMenuOpen(false)
                        if (isSupabaseConfigured()) {
                          await signOut()
                        }
                        navigate('/innskraning', { replace: true })
                      }}
                    >
                      <LogOut className="h-4 w-4 text-[#323232]" />
                      Útskrá
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto">
            <div className="w-full">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

