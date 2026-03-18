import { Outlet, NavLink, useLocation } from 'react-router-dom'
import {
  Home,
  CalendarClock,
  FileText,
  Receipt,
  MessagesSquare,
  Users2,
  Bell,
  ChevronDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

type Role = 'formadur' | 'gjaldkeri' | 'ritari' | 'notandi'

const navItems = [
  { to: '/', label: 'Heim', icon: Home },
  { to: '/fundir', label: 'Fundir', icon: CalendarClock },
  { to: '/samningar', label: 'Samningar', icon: FileText },
  { to: '/reikningar', label: 'Reikningar og skjöl', icon: Receipt },
  { to: '/skilabod', label: 'Skilaboð', icon: MessagesSquare },
  { to: '/eigendur', label: 'Eigendur', icon: Users2 },
]

const roleLabel: Record<Role, string> = {
  formadur: 'Formaður húsfélags',
  gjaldkeri: 'Gjaldkeri',
  ritari: 'Ritari',
  notandi: 'Notandi',
}

const pageTitleByPath: Record<string, string> = {
  '/': 'Heim',
  '/fundir': 'Fundir',
  '/samningar': 'Samningar',
  '/reikningar': 'Reikningar og skjöl',
  '/skilabod': 'Skilaboð',
  '/eigendur': 'Eigendur',
}

// TODO: Tengja þetta við Supabase auth
const currentUser = {
  name: 'Edda Falak',
  role: 'formadur' as Role,
}

export function AppLayout() {
  const location = useLocation()
  const title = pageTitleByPath[location.pathname] ?? 'Húsfélag'

  return (
    <div className="min-h-screen flex gap-4 bg-[#18325a] p-4">
      {/* Sidebar – Figma: dark blue, nav only, green active */}
      <aside className="hidden md:flex h-full w-[328px] shrink-0 flex-col overflow-hidden pb-12 pt-[36px]">
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
                    'rounded-lg px-4 py-2 text-[20px] leading-[1.2] transition-colors flex items-center gap-3',
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
      </aside>

      {/* Main content – Figma: #fbfbfb, rounded */}
      <div className="flex-1 flex flex-col min-h-screen bg-[#fbfbfb] rounded-xl overflow-hidden py-0">
        <div className="flex flex-1 flex-col gap-4 bg-[#fbfbfb] p-[32px]">
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
                <Button
                  variant="outline"
                  className="h-12 w-[240px] justify-end gap-2 rounded border-[#f2f3f4] bg-white px-4 py-2"
                >
                  <div className="flex flex-1 flex-col items-start text-left">
                    <span className="text-[14px] font-bold leading-4 text-black">
                      {currentUser.name}
                    </span>
                    <span className="text-[12px] font-normal leading-4 text-black">
                      {roleLabel[currentUser.role]}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 shrink-0" />
                </Button>
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

