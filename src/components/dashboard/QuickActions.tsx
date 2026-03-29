import { useNavigate } from 'react-router-dom'
import {
  CalendarPlus,
  FileUp,
  MessageSquare,
  Receipt,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Role } from '@/types'

const ADMIN_ROLES: Role[] = ['formadur', 'gjaldkeri', 'ritari']

type Props = {
  userRole: Role | null | undefined
}

export function QuickActions({ userRole }: Props) {
  const navigate = useNavigate()
  const isAdmin = userRole != null && ADMIN_ROLES.includes(userRole)

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold tracking-tight text-foreground">Aðgerðir</h2>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-primary/25 text-foreground hover:bg-primary/5 hover:text-primary"
          onClick={() => navigate('/skilabod')}
        >
          <MessageSquare className="mr-2 size-4" aria-hidden />
          Senda hópskilaboð
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-primary/25 text-foreground hover:bg-primary/5 hover:text-primary"
          onClick={() => navigate('/eigendur')}
        >
          <Users className="mr-2 size-4" aria-hidden />
          Sjá eigendur
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-primary/25 text-foreground hover:bg-primary/5 hover:text-primary"
          onClick={() => navigate('/reikningar')}
        >
          <Receipt className="mr-2 size-4" aria-hidden />
          Sjá alla reikninga
        </Button>
        {isAdmin ? (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-primary/25 text-foreground hover:bg-primary/5 hover:text-primary"
              onClick={() => navigate('/fundir')}
            >
              <CalendarPlus className="mr-2 size-4" aria-hidden />
              Bóka fund
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-primary/25 text-foreground hover:bg-primary/5 hover:text-primary"
              onClick={() => navigate('/reikningar')}
            >
              <FileUp className="mr-2 size-4" aria-hidden />
              Hlaða upp reikningi
            </Button>
          </>
        ) : null}
      </div>
    </section>
  )
}
